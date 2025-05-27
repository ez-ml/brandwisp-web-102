import { NextRequest, NextResponse } from 'next/server';
import { FirebaseService } from '@/lib/services/firebase';
import { BigQueryService } from '@/lib/services/bigquery';
import { getFirebaseAdmin } from '@/lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { Timestamp } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify Firebase token
    const token = authHeader.split('Bearer ')[1];
    const adminApp = getFirebaseAdmin();
    const auth = getAuth(adminApp);
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view') || 'dashboard';
    const days = parseInt(searchParams.get('days') || '30');

    let data: any = {};

    switch (view) {
      case 'dashboard':
        // Get dashboard overview data
        const [campaigns, campaignMetrics] = await Promise.all([
          FirebaseService.getUserCampaigns(userId, 10),
          BigQueryService.getCampaignMetrics(userId, days)
        ]);

        // Calculate summary metrics
        const totalSpend = campaignMetrics.reduce((sum, campaign) => sum + campaign.totalSpend, 0);
        const totalRevenue = campaignMetrics.reduce((sum, campaign) => sum + campaign.totalRevenue, 0);
        const avgRoas = campaignMetrics.length > 0 ? 
          campaignMetrics.reduce((sum, campaign) => sum + campaign.roas, 0) / campaignMetrics.length : 0;
        const totalConversions = campaignMetrics.reduce((sum, campaign) => sum + campaign.totalConversions, 0);

        // Group campaigns by status
        const campaignsByStatus = {
          active: campaigns.filter(c => c.status === 'active').length,
          paused: campaigns.filter(c => c.status === 'paused').length,
          draft: campaigns.filter(c => c.status === 'draft').length,
          ended: campaigns.filter(c => c.status === 'ended').length,
        };

        // Group by platform
        const campaignsByPlatform = campaigns.reduce((acc, campaign) => {
          acc[campaign.platform] = (acc[campaign.platform] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        data = {
          campaigns: campaigns,
          summary: {
            totalCampaigns: campaigns.length,
            totalSpend,
            totalRevenue,
            avgRoas,
            totalConversions,
            campaignsByStatus,
            campaignsByPlatform
          },
          metrics: campaignMetrics.slice(0, 5), // Top 5 performing campaigns
          performance: {
            topPerforming: campaignMetrics
              .sort((a, b) => b.roas - a.roas)
              .slice(0, 3),
            recentActivity: campaigns
              .sort((a, b) => b.updatedAt.seconds - a.updatedAt.seconds)
              .slice(0, 5)
          }
        };
        break;

      case 'create':
        // Get data needed for campaign creation
        const stores = await FirebaseService.getUserStores(userId);
        
        data = {
          stores,
          templates: [
            {
              id: 'ecommerce-sales',
              name: 'E-commerce Sales',
              description: 'Drive sales for your online store',
              platforms: ['facebook', 'instagram', 'google'],
              objective: 'conversions'
            },
            {
              id: 'brand-awareness',
              name: 'Brand Awareness',
              description: 'Increase brand visibility and reach',
              platforms: ['facebook', 'instagram', 'tiktok'],
              objective: 'brand-awareness'
            },
            {
              id: 'lead-generation',
              name: 'Lead Generation',
              description: 'Generate qualified leads for your business',
              platforms: ['facebook', 'linkedin', 'google'],
              objective: 'lead-generation'
            }
          ],
          platforms: [
            { id: 'facebook', name: 'Facebook', available: true },
            { id: 'instagram', name: 'Instagram', available: true },
            { id: 'google', name: 'Google Ads', available: true },
            { id: 'tiktok', name: 'TikTok', available: true },
            { id: 'linkedin', name: 'LinkedIn', available: true },
            { id: 'twitter', name: 'Twitter', available: true },
            { id: 'youtube', name: 'YouTube', available: true }
          ]
        };
        break;

      case 'manage':
        // Get all campaigns for management
        const allCampaigns = await FirebaseService.getUserCampaigns(userId, 100);
        const allMetrics = await BigQueryService.getCampaignMetrics(userId, days);

        // Merge campaign data with metrics
        const campaignsWithMetrics = allCampaigns.map(campaign => {
          const metrics = allMetrics.find(m => m.campaignId === campaign.id);
          return {
            ...campaign,
            metrics: metrics || {
              totalSpend: 0,
              totalRevenue: 0,
              roas: 0,
              totalConversions: 0,
              totalClicks: 0,
              overallCtr: 0,
              avgCpc: 0
            }
          };
        });

        data = {
          campaigns: campaignsWithMetrics,
          filters: {
            platforms: Array.from(new Set(allCampaigns.map(c => c.platform))),
            statuses: ['active', 'paused', 'draft', 'scheduled', 'ended'],
            objectives: Array.from(new Set(allCampaigns.map(c => c.objective)))
          },
          stats: {
            total: allCampaigns.length,
            active: allCampaigns.filter(c => c.status === 'active').length,
            paused: allCampaigns.filter(c => c.status === 'paused').length,
            draft: allCampaigns.filter(c => c.status === 'draft').length
          }
        };
        break;

      case 'creatives':
        // Get creative assets and performance data
        const creativeCampaigns = await FirebaseService.getUserCampaigns(userId, 50);
        const creatives = creativeCampaigns.flatMap(campaign => 
          campaign.creatives.map(creative => ({
            ...creative,
            campaignId: campaign.id,
            campaignName: campaign.name,
            platform: campaign.platform
          }))
        );

        data = {
          creatives,
          stats: {
            totalCreatives: creatives.length,
            imageCreatives: creatives.filter(c => c.type === 'image').length,
            videoCreatives: creatives.filter(c => c.type === 'video').length,
            topPerforming: creatives
              .filter(c => c.performance)
              .sort((a, b) => (b.performance?.ctr || 0) - (a.performance?.ctr || 0))
              .slice(0, 10)
          },
          performance: creatives
            .filter(c => c.performance)
            .map(c => ({
              id: c.id,
              campaignName: c.campaignName,
              platform: c.platform,
              type: c.type,
              ...c.performance
            }))
        };
        break;

      default:
        return NextResponse.json({ error: 'Invalid view parameter' }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('CampaignWizard API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify Firebase token
    const token = authHeader.split('Bearer ')[1];
    const adminApp = getFirebaseAdmin();
    const auth = getAuth(adminApp);
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const body = await request.json();
    const { action, campaignId, campaignData } = body;

    switch (action) {
      case 'create':
        // Create new campaign
        const newCampaignId = await FirebaseService.createCampaign({
          userId,
          storeId: campaignData.storeId,
          name: campaignData.name,
          platform: campaignData.platform,
          type: campaignData.type,
          objective: campaignData.objective,
          status: 'draft',
          budget: campaignData.budget,
          schedule: {
            startDate: Timestamp.fromDate(new Date(campaignData.schedule.startDate)),
            endDate: campaignData.schedule.endDate ? 
              Timestamp.fromDate(new Date(campaignData.schedule.endDate)) : undefined,
            timezone: campaignData.schedule.timezone
          },
          targeting: campaignData.targeting,
          creatives: campaignData.creatives || [],
          metrics: {
            impressions: 0,
            reach: 0,
            clicks: 0,
            ctr: 0,
            cpc: 0,
            engagement: 0,
            conversions: 0,
            revenue: 0,
            roas: 0,
            lastUpdated: Timestamp.now()
          },
          externalIds: {}
        });

        return NextResponse.json({ campaignId: newCampaignId });

      case 'update':
        // Update existing campaign
        await FirebaseService.updateCampaign(campaignId, campaignData);
        return NextResponse.json({ message: 'Campaign updated successfully' });

      case 'updateStatus':
        // Update campaign status (play, pause, etc.)
        await FirebaseService.updateCampaign(campaignId, {
          status: campaignData.status,
          updatedAt: Timestamp.now()
        });
        return NextResponse.json({ message: 'Campaign status updated' });

      case 'duplicate':
        // Duplicate existing campaign
        const originalCampaign = await FirebaseService.getCampaign(campaignId);
        if (!originalCampaign) {
          return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
        }

        const duplicatedCampaignId = await FirebaseService.createCampaign({
          ...originalCampaign,
          name: `${originalCampaign.name} (Copy)`,
          status: 'draft',
          metrics: {
            impressions: 0,
            reach: 0,
            clicks: 0,
            ctr: 0,
            cpc: 0,
            engagement: 0,
            conversions: 0,
            revenue: 0,
            roas: 0,
            lastUpdated: Timestamp.now()
          },
          externalIds: {}
        });

        return NextResponse.json({ campaignId: duplicatedCampaignId });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('CampaignWizard POST API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 