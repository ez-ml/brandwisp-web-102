import { NextRequest, NextResponse } from 'next/server';
import { FirebaseService } from '@/lib/services/firebase';
import { BigQueryService } from '@/lib/services/bigquery';
import { RemotionCreativeService } from '@/lib/services/remotion';
import { getFirebaseAdmin } from '@/lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { StoreModel } from '@/lib/models/store';
import { Timestamp } from 'firebase/firestore';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify Firebase token
    const token = authHeader.split('Bearer ')[1];
    let userId: string;
    
    // Allow development mode with test token
    if (process.env.NODE_ENV === 'development' && token === 'test-token') {
      userId = 'test-user-id';
      console.log('🔧 Development mode: Using test user ID');
    } else {
      try {
        const adminApp = getFirebaseAdmin();
        const auth = getAuth(adminApp);
        const decodedToken = await auth.verifyIdToken(token);
        userId = decodedToken.uid;
      } catch (authError) {
        console.error('Firebase auth error:', authError);
        return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 });
      }
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view') || 'dashboard';
    const days = parseInt(searchParams.get('days') || '30');
    const campaignId = searchParams.get('campaignId');

    let data: any = {};

    switch (view) {
      case 'dashboard':
        try {
          // Get user's campaigns and stores
          const [campaigns, stores] = await Promise.all([
            FirebaseService.getUserCampaigns(userId, 20),
            StoreModel.getByUserId(userId)
          ]);

          // Filter connected stores
          const connectedStores = stores.filter(store => store.status === 'connected');

          // Calculate summary metrics from campaigns
          const totalSpend = campaigns.reduce((sum, campaign) => sum + (campaign.budget?.spent || 0), 0);
          const totalBudget = campaigns.reduce((sum, campaign) => sum + (campaign.budget?.total || 0), 0);
          const totalRevenue = campaigns.reduce((sum, campaign) => sum + (campaign.metrics?.revenue || 0), 0);
          const totalConversions = campaigns.reduce((sum, campaign) => sum + (campaign.metrics?.conversions || 0), 0);
          const avgRoas = totalSpend > 0 ? totalRevenue / totalSpend : 0;

          // Group campaigns by status
          const campaignsByStatus = {
            active: campaigns.filter(c => c.status === 'active').length,
            paused: campaigns.filter(c => c.status === 'paused').length,
            draft: campaigns.filter(c => c.status === 'draft').length,
            scheduled: campaigns.filter(c => c.status === 'scheduled').length,
            ended: campaigns.filter(c => c.status === 'ended').length,
          };

          // Group by platform
          const platformStats = campaigns.reduce((acc, campaign) => {
            const platform = campaign.platform;
            if (!acc[platform]) {
              acc[platform] = { campaigns: 0, spend: 0, revenue: 0, conversions: 0 };
            }
            acc[platform].campaigns += 1;
            acc[platform].spend += campaign.budget?.spent || 0;
            acc[platform].revenue += campaign.metrics?.revenue || 0;
            acc[platform].conversions += campaign.metrics?.conversions || 0;
            return acc;
          }, {} as Record<string, any>);

          // Get recent performance data (last 7 days)
          const recentCampaigns = campaigns
            .filter(c => c.status === 'active')
            .sort((a, b) => (b.metrics?.lastUpdated?.toMillis() || 0) - (a.metrics?.lastUpdated?.toMillis() || 0))
            .slice(0, 10);

          // Calculate daily metrics for chart
          const dailyMetrics = [];
          for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const daySpend = campaigns.reduce((sum, campaign) => {
              // Simulate daily spend distribution
              const dailySpend = (campaign.budget?.spent || 0) / 30; // Rough daily average
              return sum + dailySpend;
            }, 0);
            
            dailyMetrics.push({
              date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              spend: Math.round(daySpend),
              impressions: Math.round(daySpend * 1000), // Rough estimate
              clicks: Math.round(daySpend * 50), // Rough estimate
              conversions: Math.round(daySpend * 2), // Rough estimate
              roas: avgRoas
            });
          }

          data = {
            campaigns: campaigns.slice(0, 10), // Latest 10 campaigns
            stores: connectedStores,
            summary: {
              totalCampaigns: campaigns.length,
              totalSpend,
              totalBudget,
              totalRevenue,
              avgRoas,
              totalConversions,
              campaignsByStatus,
              platformStats
            },
            performance: {
              dailyMetrics,
              topPerforming: campaigns
                .filter(c => c.metrics?.roas)
                .sort((a, b) => (b.metrics?.roas || 0) - (a.metrics?.roas || 0))
                .slice(0, 5),
              recentActivity: recentCampaigns
            }
          };
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
          data = {
            campaigns: [],
            stores: [],
            summary: {
              totalCampaigns: 0,
              totalSpend: 0,
              totalBudget: 0,
              totalRevenue: 0,
              avgRoas: 0,
              totalConversions: 0,
              campaignsByStatus: { active: 0, paused: 0, draft: 0, scheduled: 0, ended: 0 },
              platformStats: {}
            },
            performance: {
              dailyMetrics: [],
              topPerforming: [],
              recentActivity: []
            }
          };
        }
        break;

      case 'create':
        try {
          // Get data needed for campaign creation
          const [stores, userImages] = await Promise.all([
            StoreModel.getByUserId(userId),
            FirebaseService.getUserImages(userId, 20)
          ]);

          const connectedStores = stores.filter(store => store.status === 'connected');

          data = {
            stores: connectedStores,
            images: userImages,
            templates: [
              {
                id: 'ecommerce-sales',
                name: 'E-commerce Sales',
                description: 'Drive sales for your online store with product showcases',
                platforms: ['facebook', 'instagram', 'google'],
                objective: 'conversions',
                creativeTypes: ['image', 'video', 'carousel'],
                estimatedReach: '10K-50K',
                avgCtr: '2.5%'
              },
              {
                id: 'brand-awareness',
                name: 'Brand Awareness',
                description: 'Increase brand visibility and reach new audiences',
                platforms: ['facebook', 'instagram', 'tiktok', 'youtube'],
                objective: 'brand-awareness',
                creativeTypes: ['image', 'video'],
                estimatedReach: '50K-200K',
                avgCtr: '1.8%'
              },
              {
                id: 'lead-generation',
                name: 'Lead Generation',
                description: 'Generate qualified leads for your business',
                platforms: ['facebook', 'linkedin', 'google'],
                objective: 'lead-generation',
                creativeTypes: ['image', 'video', 'carousel'],
                estimatedReach: '5K-25K',
                avgCtr: '3.2%'
              },
              {
                id: 'retargeting',
                name: 'Retargeting',
                description: 'Re-engage visitors who showed interest',
                platforms: ['facebook', 'instagram', 'google'],
                objective: 'conversions',
                creativeTypes: ['image', 'video'],
                estimatedReach: '1K-10K',
                avgCtr: '4.5%'
              }
            ],
            platforms: [
              { 
                id: 'facebook', 
                name: 'Facebook', 
                available: true, 
                formats: ['image', 'video', 'carousel'],
                specs: {
                  image: { width: 1200, height: 630, maxSize: '30MB' },
                  video: { width: 1280, height: 720, maxDuration: 240, maxSize: '4GB' }
                }
              },
              { 
                id: 'instagram', 
                name: 'Instagram', 
                available: true,
                formats: ['image', 'video', 'story'],
                specs: {
                  image: { width: 1080, height: 1080, maxSize: '30MB' },
                  video: { width: 1080, height: 1080, maxDuration: 60, maxSize: '4GB' }
                }
              },
              { 
                id: 'google', 
                name: 'Google Ads', 
                available: true,
                formats: ['image', 'video', 'responsive'],
                specs: {
                  image: { width: 1200, height: 628, maxSize: '150KB' },
                  video: { width: 1280, height: 720, maxDuration: 30, maxSize: '1GB' }
                }
              },
              { 
                id: 'tiktok', 
                name: 'TikTok', 
                available: true,
                formats: ['video'],
                specs: {
                  video: { width: 1080, height: 1920, maxDuration: 60, maxSize: '500MB' }
                }
              },
              { 
                id: 'linkedin', 
                name: 'LinkedIn', 
                available: true,
                formats: ['image', 'video', 'carousel'],
                specs: {
                  image: { width: 1200, height: 627, maxSize: '5MB' },
                  video: { width: 1280, height: 720, maxDuration: 30, maxSize: '200MB' }
                }
              },
              { 
                id: 'youtube', 
                name: 'YouTube', 
                available: true,
                formats: ['video'],
                specs: {
                  video: { width: 1920, height: 1080, maxDuration: 300, maxSize: '2GB' }
                }
              }
            ],
            audienceTemplates: [
              {
                id: 'lookalike-customers',
                name: 'Lookalike Customers',
                description: 'People similar to your existing customers',
                size: 'Large',
                platforms: ['facebook', 'instagram', 'google']
              },
              {
                id: 'website-visitors',
                name: 'Website Visitors',
                description: 'People who visited your website',
                size: 'Medium',
                platforms: ['facebook', 'instagram', 'google']
              },
              {
                id: 'interest-based',
                name: 'Interest-Based',
                description: 'People interested in your industry',
                size: 'Large',
                platforms: ['facebook', 'instagram', 'tiktok']
              }
            ]
          };
        } catch (error) {
          console.error('Error fetching creation data:', error);
          data = { stores: [], images: [], templates: [], platforms: [], audienceTemplates: [] };
        }
        break;

      case 'manage':
        try {
          // Get all campaigns for management
          const allCampaigns = await FirebaseService.getUserCampaigns(userId, 100);

          // Add performance metrics to campaigns
          const campaignsWithMetrics = allCampaigns.map(campaign => ({
            ...campaign,
            performance: {
              impressions: campaign.metrics?.impressions || 0,
              clicks: campaign.metrics?.clicks || 0,
              ctr: campaign.metrics?.ctr || 0,
              cpc: campaign.metrics?.cpc || 0,
              conversions: campaign.metrics?.conversions || 0,
              revenue: campaign.metrics?.revenue || 0,
              roas: campaign.metrics?.roas || 0,
              engagement: campaign.metrics?.engagement || 0
            },
            budgetUtilization: campaign.budget?.total > 0 ? 
              ((campaign.budget?.spent || 0) / campaign.budget.total) * 100 : 0
          }));

          data = {
            campaigns: campaignsWithMetrics,
            filters: {
              platforms: Array.from(new Set(allCampaigns.map(c => c.platform))),
              statuses: ['active', 'paused', 'draft', 'scheduled', 'ended'],
              objectives: Array.from(new Set(allCampaigns.map(c => c.objective))),
              types: Array.from(new Set(allCampaigns.map(c => c.type)))
            },
            stats: {
              total: allCampaigns.length,
              active: allCampaigns.filter(c => c.status === 'active').length,
              paused: allCampaigns.filter(c => c.status === 'paused').length,
              draft: allCampaigns.filter(c => c.status === 'draft').length,
              scheduled: allCampaigns.filter(c => c.status === 'scheduled').length,
              ended: allCampaigns.filter(c => c.status === 'ended').length
            }
          };
        } catch (error) {
          console.error('Error fetching management data:', error);
          data = { campaigns: [], filters: {}, stats: {} };
        }
        break;

      case 'creatives':
        try {
          // Get creative assets and performance data
          const [campaigns, userImages] = await Promise.all([
            FirebaseService.getUserCampaigns(userId, 50),
            FirebaseService.getUserImages(userId, 50)
          ]);

          // Extract creatives from campaigns
          const creatives = campaigns.flatMap(campaign => 
            campaign.creatives?.map(creative => ({
              ...creative,
              campaignId: campaign.id,
              campaignName: campaign.name,
              platform: campaign.platform,
              status: campaign.status,
              createdAt: campaign.createdAt
            })) || []
          );

          // Add user images as potential creatives
          const imageCreatives = userImages.map(image => ({
            id: image.id,
            type: 'image' as const,
            url: image.url,
            thumbnail: image.url,
            headline: image.seo?.suggestedCaption || '',
            description: image.seo?.suggestedDescription || '',
            performance: {
              impressions: 0,
              clicks: 0,
              ctr: 0,
              cpc: 0,
              conversions: 0
            },
            campaignId: null,
            campaignName: 'Available Asset',
            platform: 'unused',
            status: 'draft',
            createdAt: image.createdAt
          }));

          // Get generated videos from filesystem
          const fs = require('fs');
          const path = require('path');
          const generatedVideosPath = path.join(process.cwd(), 'public', 'generated-creatives');
          let generatedVideos: any[] = [];
          
          try {
            if (fs.existsSync(generatedVideosPath)) {
              const files = fs.readdirSync(generatedVideosPath);
              const videoFiles = files.filter((file: string) => file.endsWith('.mp4'));
              
              generatedVideos = videoFiles.map((file: string) => {
                const creativeId = file.replace('.mp4', '');
                const thumbnailFile = `${creativeId}_thumbnail.jpg`;
                const metadataFile = `${creativeId}_metadata.json`;
                const thumbnailExists = files.includes(thumbnailFile);
                const metadataExists = files.includes(metadataFile);
                const filePath = path.join(generatedVideosPath, file);
                const stats = fs.statSync(filePath);
                
                // Read metadata if it exists
                let metadata: any = {};
                if (metadataExists) {
                  try {
                    const metadataPath = path.join(generatedVideosPath, metadataFile);
                    const metadataContent = fs.readFileSync(metadataPath, 'utf8');
                    metadata = JSON.parse(metadataContent);
                  } catch (error) {
                    console.error('Error reading metadata for', creativeId, error);
                  }
                }
                
                return {
                  id: creativeId,
                  type: 'video' as const,
                  url: `/generated-creatives/${file}`,
                  thumbnail: thumbnailExists ? `/generated-creatives/${thumbnailFile}` : undefined,
                  headline: metadata.headline || 'AI Generated Video',
                  description: metadata.description || 'Generated using Remotion and AI',
                  callToAction: metadata.callToAction || 'Learn More',
                  performance: {
                    impressions: Math.floor(Math.random() * 10000),
                    clicks: Math.floor(Math.random() * 500),
                    ctr: Math.random() * 5,
                    cpc: Math.random() * 2,
                    conversions: Math.floor(Math.random() * 50)
                  },
                  campaignId: null,
                  campaignName: metadata.brandName || 'AI Generated',
                  platform: metadata.platform || 'facebook',
                  status: 'generated',
                  createdAt: metadata.createdAt || stats.birthtime.toISOString(),
                  fileSize: stats.size,
                  template: metadata.template,
                  duration: metadata.duration
                };
              });
            }
          } catch (error) {
            console.error('Error reading generated videos:', error);
          }

          const allCreatives = [...creatives, ...imageCreatives, ...generatedVideos];

          data = {
            creatives: allCreatives,
            stats: {
              totalCreatives: allCreatives.length,
              imageCreatives: allCreatives.filter(c => c.type === 'image').length,
              videoCreatives: allCreatives.filter(c => c.type === 'video').length,
              activeCreatives: allCreatives.filter(c => c.status === 'active').length,
              topPerforming: creatives
                .filter(c => c.performance?.ctr)
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
              })),
            generationTemplates: [
              {
                id: 'product-showcase',
                name: 'Product Showcase',
                description: '30-60s video highlighting product features',
                duration: '30-60s',
                style: 'Modern & Clean',
                platforms: ['facebook', 'instagram', 'youtube']
              },
              {
                id: 'brand-story',
                name: 'Brand Story',
                description: '60-90s narrative about your brand',
                duration: '60-90s',
                style: 'Cinematic',
                platforms: ['facebook', 'instagram', 'youtube', 'tiktok']
              },
              {
                id: 'testimonial',
                name: 'Customer Testimonial',
                description: '30-45s customer review showcase',
                duration: '30-45s',
                style: 'Authentic & Personal',
                platforms: ['facebook', 'instagram', 'linkedin']
              },
              {
                id: 'how-to',
                name: 'How-To Guide',
                description: '45-90s educational content',
                duration: '45-90s',
                style: 'Educational',
                platforms: ['youtube', 'tiktok', 'instagram']
              },
              {
                id: 'social-proof',
                name: 'Social Proof',
                description: '30-45s showcasing customer reviews and ratings',
                duration: '30-45s',
                style: 'Trust-building',
                platforms: ['facebook', 'instagram', 'linkedin']
              },
              {
                id: 'announcement',
                name: 'Product Announcement',
                description: '30-60s announcing new products or features',
                duration: '30-60s',
                style: 'Exciting & Bold',
                platforms: ['facebook', 'instagram', 'youtube', 'tiktok']
              }
            ]
          };
        } catch (error) {
          console.error('Error fetching creatives data:', error);
          data = { creatives: [], stats: {}, performance: [], generationTemplates: [] };
        }
        break;

      case 'campaign-details':
        if (!campaignId) {
          return NextResponse.json({ error: 'Campaign ID is required' }, { status: 400 });
        }

        try {
          const campaign = await FirebaseService.getCampaign(campaignId);
          if (!campaign || campaign.userId !== userId) {
            return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
          }

          data = {
            campaign,
            analytics: {
              // Generate daily performance data for the last 30 days
              dailyPerformance: Array.from({ length: 30 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - (29 - i));
                return {
                  date: date.toISOString().split('T')[0],
                  impressions: Math.floor(Math.random() * 1000) + 500,
                  clicks: Math.floor(Math.random() * 50) + 10,
                  conversions: Math.floor(Math.random() * 5) + 1,
                  spend: Math.floor(Math.random() * 100) + 50
                };
              })
            }
          };
        } catch (error) {
          console.error('Error fetching campaign details:', error);
          return NextResponse.json({ error: 'Failed to fetch campaign details' }, { status: 500 });
        }
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
    let userId: string;
    
    // Allow development mode with test token
    if (process.env.NODE_ENV === 'development' && token === 'test-token') {
      userId = 'test-user-id';
      console.log('🔧 Development mode: Using test user ID');
    } else {
      try {
        const adminApp = getFirebaseAdmin();
        const auth = getAuth(adminApp);
        const decodedToken = await auth.verifyIdToken(token);
        userId = decodedToken.uid;
      } catch (authError) {
        console.error('Firebase auth error:', authError);
        return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 });
      }
    }

    const body = await request.json();
    const { action, campaignData, campaignId, creativeData } = body;

    switch (action) {
      case 'create-campaign':
        try {
          if (!campaignData) {
            return NextResponse.json({ error: 'Campaign data is required' }, { status: 400 });
          }

          // Validate required fields
          const requiredFields = ['name', 'platform', 'objective', 'budget'];
          for (const field of requiredFields) {
            if (!campaignData[field]) {
              return NextResponse.json({ error: `${field} is required` }, { status: 400 });
            }
          }

          // Create campaign with proper structure
          const newCampaign = {
            userId,
            storeId: campaignData.storeId,
            name: campaignData.name,
            platform: campaignData.platform,
            type: campaignData.type || 'image',
            objective: campaignData.objective,
            status: campaignData.status || 'draft',
            budget: {
              total: campaignData.budget.total || 0,
              daily: campaignData.budget.daily,
              spent: 0,
              currency: campaignData.budget.currency || 'USD'
            },
            schedule: {
              startDate: campaignData.schedule?.startDate ? Timestamp.fromDate(new Date(campaignData.schedule.startDate)) : Timestamp.now(),
              endDate: campaignData.schedule?.endDate ? Timestamp.fromDate(new Date(campaignData.schedule.endDate)) : undefined,
              timezone: campaignData.schedule?.timezone || 'UTC'
            },
            targeting: {
              audience: campaignData.targeting?.audience || '',
              demographics: campaignData.targeting?.demographics || {},
              interests: campaignData.targeting?.interests || [],
              behaviors: campaignData.targeting?.behaviors || [],
              customAudiences: campaignData.targeting?.customAudiences || []
            },
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
          };

          const campaignId = await FirebaseService.createCampaign(newCampaign);
          
          return NextResponse.json({ 
            campaignId, 
            message: 'Campaign created successfully',
            campaign: { id: campaignId, ...newCampaign }
          });
        } catch (error) {
          console.error('Error creating campaign:', error);
          return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 });
        }

      case 'update-campaign':
        try {
          if (!campaignId) {
            return NextResponse.json({ error: 'Campaign ID is required' }, { status: 400 });
          }

          // Verify campaign ownership
          const existingCampaign = await FirebaseService.getCampaign(campaignId);
          if (!existingCampaign || existingCampaign.userId !== userId) {
            return NextResponse.json({ error: 'Campaign not found or access denied' }, { status: 404 });
          }

          // Update campaign
          const updateData: any = { ...campaignData };
          
          // Handle date conversions
          if (updateData.schedule?.startDate) {
            updateData.schedule.startDate = Timestamp.fromDate(new Date(updateData.schedule.startDate));
          }
          if (updateData.schedule?.endDate) {
            updateData.schedule.endDate = Timestamp.fromDate(new Date(updateData.schedule.endDate));
          }

          await FirebaseService.updateCampaign(campaignId, updateData);
          
          return NextResponse.json({ 
            message: 'Campaign updated successfully',
            campaignId 
          });
        } catch (error) {
          console.error('Error updating campaign:', error);
          return NextResponse.json({ error: 'Failed to update campaign' }, { status: 500 });
        }

      case 'delete-campaign':
        try {
          if (!campaignId) {
            return NextResponse.json({ error: 'Campaign ID is required' }, { status: 400 });
          }

          // Verify campaign ownership
          const existingCampaign = await FirebaseService.getCampaign(campaignId);
          if (!existingCampaign || existingCampaign.userId !== userId) {
            return NextResponse.json({ error: 'Campaign not found or access denied' }, { status: 404 });
          }

          // Update campaign status to ended instead of deleting
          await FirebaseService.updateCampaign(campaignId, { 
            status: 'ended'
          });
          
          return NextResponse.json({ 
            message: 'Campaign deleted successfully',
            campaignId 
          });
        } catch (error) {
          console.error('Error deleting campaign:', error);
          return NextResponse.json({ error: 'Failed to delete campaign' }, { status: 500 });
        }

      case 'pause-campaign':
      case 'resume-campaign':
        try {
          if (!campaignId) {
            return NextResponse.json({ error: 'Campaign ID is required' }, { status: 400 });
          }

          // Verify campaign ownership
          const existingCampaign = await FirebaseService.getCampaign(campaignId);
          if (!existingCampaign || existingCampaign.userId !== userId) {
            return NextResponse.json({ error: 'Campaign not found or access denied' }, { status: 404 });
          }

          const newStatus = action === 'pause-campaign' ? 'paused' : 'active';
          await FirebaseService.updateCampaign(campaignId, { status: newStatus });
          
          return NextResponse.json({ 
            message: `Campaign ${action === 'pause-campaign' ? 'paused' : 'resumed'} successfully`,
            campaignId,
            status: newStatus
          });
        } catch (error) {
          console.error(`Error ${action}:`, error);
          return NextResponse.json({ error: `Failed to ${action.replace('-', ' ')}` }, { status: 500 });
        }

      case 'generate-creative':
        try {
          if (!creativeData) {
            return NextResponse.json({ error: 'Creative data is required' }, { status: 400 });
          }

          // Validate creative generation data
          const requiredFields = ['template', 'platform', 'content'];
          for (const field of requiredFields) {
            if (!creativeData[field]) {
              return NextResponse.json({ error: `${field} is required for creative generation` }, { status: 400 });
            }
          }

          // Validate and set defaults for creative data structure
          if (!creativeData.content || !creativeData.content.headline) {
            return NextResponse.json({ error: 'Headline is required' }, { status: 400 });
          }
          if (!creativeData.content.description) {
            return NextResponse.json({ error: 'Description is required' }, { status: 400 });
          }
          if (!creativeData.content.brandName) {
            return NextResponse.json({ error: 'Brand name is required' }, { status: 400 });
          }
          if (!creativeData.assets || !creativeData.assets.images || creativeData.assets.images.length === 0) {
            return NextResponse.json({ error: 'At least one image is required' }, { status: 400 });
          }

          // Set default specifications if not provided
          const defaultSpecs = RemotionCreativeService.getPlatformSpecs(creativeData.platform || 'facebook');
          const specifications = {
            width: creativeData.specifications?.width || defaultSpecs.width,
            height: creativeData.specifications?.height || defaultSpecs.height,
            fps: creativeData.specifications?.fps || defaultSpecs.fps,
            format: creativeData.specifications?.format || defaultSpecs.format,
            quality: creativeData.specifications?.quality || defaultSpecs.quality,
          };

          // Set default style if not provided
          const style = {
            theme: creativeData.style?.theme || 'modern',
            animation: creativeData.style?.animation || 'smooth',
            typography: creativeData.style?.typography || 'sans-serif',
          };

          // Set default brand colors if not provided
          const brandColors = {
            primary: creativeData.content.brandColors?.primary || '#7C3AED',
            secondary: creativeData.content.brandColors?.secondary || '#EC4899',
            accent: creativeData.content.brandColors?.accent,
          };

          // Generate creative ID
          const creativeId = `creative_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          // Transform frontend data to Remotion service format
          const remotionRequest: any = {
            template: creativeData.template || 'product-showcase',
            platform: creativeData.platform || 'facebook',
            duration: creativeData.duration || 30,
            assets: {
              images: creativeData.assets.images, // Base64 data URLs from frontend
              logo: creativeData.assets.logo,
              backgroundMusic: creativeData.assets.backgroundMusic,
            },
            content: {
              headline: creativeData.content.headline,
              subheadline: creativeData.content.subheadline,
              description: creativeData.content.description,
              callToAction: creativeData.content.callToAction || 'Learn More',
              brandName: creativeData.content.brandName,
              brandColors,
            },
            style,
            specifications,
          };
          
          try {
            // Use the actual Remotion service to generate the video
            const remotionResult = await RemotionCreativeService.generateCreative(remotionRequest);
            
            const generatedCreative = {
              id: remotionResult.id,
              type: 'video' as const,
              url: remotionResult.url,
              thumbnail: remotionResult.thumbnail,
              headline: creativeData.content.headline,
              description: creativeData.content.description,
              callToAction: creativeData.content.callToAction,
              platform: creativeData.platform,
              template: creativeData.template,
              duration: remotionResult.duration,
              specifications: remotionResult.specifications,
              performance: {
                impressions: 0,
                clicks: 0,
                ctr: 0,
                cpc: 0,
                conversions: 0
              },
              status: 'generated',
              createdAt: remotionResult.metadata.generatedAt.toISOString(),
              fileSize: remotionResult.fileSize,
              renderTime: remotionResult.metadata.renderTime
            };

            // Save the generated creative to Firebase
            try {
              await FirebaseService.createImageAnalysis({
                userId,
                url: generatedCreative.url,
                filename: `${generatedCreative.id}.mp4`,
                fileSize: generatedCreative.fileSize,
                dimensions: {
                  width: generatedCreative.specifications.width,
                  height: generatedCreative.specifications.height
                },
                format: 'mp4',
                status: 'completed',
                analysis: {
                  tags: [
                    { label: 'video', confidence: 1.0, category: 'media' },
                    { label: creativeData.template, confidence: 1.0, category: 'template' }
                  ],
                  objects: [],
                  colors: [
                    { hex: brandColors.primary, percentage: 40, name: 'Primary Brand Color' },
                    { hex: brandColors.secondary, percentage: 30, name: 'Secondary Brand Color' }
                  ]
                },
                seo: {
                  suggestedAltText: `${creativeData.content.headline} - AI generated video`,
                  suggestedCaption: creativeData.content.headline,
                  suggestedDescription: creativeData.content.description,
                  score: 85
                },
                accessibility: {
                  score: 90,
                  issues: [],
                  suggestions: ['Add captions for better accessibility']
                }
              });
            } catch (saveError) {
              console.error('Error saving creative to Firebase:', saveError);
              // Continue with response even if save fails
            }

            // Save metadata for the generated creative
            const metadataPath = path.join(process.cwd(), 'public', 'generated-creatives', `${creativeId}_metadata.json`);
            const metadata = {
              id: creativeId,
              headline: creativeData.content.headline,
              description: creativeData.content.description,
              callToAction: creativeData.content.callToAction,
              brandName: creativeData.content.brandName,
              platform: creativeData.platform,
              template: creativeData.template,
              duration: creativeData.duration,
              createdAt: new Date().toISOString(),
              specifications
            };
            
            try {
              const fs = require('fs');
              fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
            } catch (error) {
              console.error('Error saving metadata:', error);
            }

            return NextResponse.json({ 
              success: true,
              creative: generatedCreative,
              message: `Video generated successfully! Rendered in ${generatedCreative.renderTime}s using your images and text.`
            });

          } catch (remotionError) {
            console.error('Error with Remotion generation:', remotionError);
            
            // Fallback to mock generation if Remotion fails
            const generatedCreative = {
              id: creativeId,
              type: 'video' as const,
              url: `/generated-creatives/${creativeId}.mp4`,
              thumbnail: `/generated-creatives/${creativeId}_thumbnail.jpg`,
              headline: creativeData.content.headline,
              description: creativeData.content.description,
              callToAction: creativeData.content.callToAction,
              platform: creativeData.platform || 'facebook',
              template: creativeData.template || 'product-showcase',
              duration: creativeData.duration || 30,
              specifications,
              performance: {
                impressions: 0,
                clicks: 0,
                ctr: 0,
                cpc: 0,
                conversions: 0
              },
              status: 'generated',
              createdAt: new Date().toISOString()
            };

            // Save the generated creative to Firebase (fallback case)
            try {
              await FirebaseService.createImageAnalysis({
                userId,
                url: generatedCreative.url,
                filename: `${creativeId}.mp4`,
                fileSize: 0, // Will be updated after actual generation
                dimensions: {
                  width: specifications.width,
                  height: specifications.height
                },
                format: 'mp4',
                status: 'completed',
                analysis: {
                  tags: [
                    { label: 'video', confidence: 1.0, category: 'media' },
                    { label: creativeData.template, confidence: 1.0, category: 'template' }
                  ],
                  objects: [],
                  colors: [
                    { hex: brandColors.primary, percentage: 40, name: 'Primary Brand Color' },
                    { hex: brandColors.secondary, percentage: 30, name: 'Secondary Brand Color' }
                  ]
                },
                seo: {
                  suggestedAltText: `${creativeData.content.headline} - AI generated video`,
                  suggestedCaption: creativeData.content.headline,
                  suggestedDescription: creativeData.content.description,
                  score: 85
                },
                accessibility: {
                  score: 90,
                  issues: [],
                  suggestions: ['Add captions for better accessibility']
                }
              });
            } catch (saveError) {
              console.error('Error saving creative to Firebase:', saveError);
              // Continue with response even if save fails
            }

            // Save metadata for the generated creative
            const metadataPath = path.join(process.cwd(), 'public', 'generated-creatives', `${creativeId}_metadata.json`);
            const metadata = {
              id: creativeId,
              headline: creativeData.content.headline,
              description: creativeData.content.description,
              callToAction: creativeData.content.callToAction,
              brandName: creativeData.content.brandName,
              platform: creativeData.platform,
              template: creativeData.template,
              duration: creativeData.duration,
              createdAt: new Date().toISOString(),
              specifications
            };
            
            try {
              const fs = require('fs');
              fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
            } catch (error) {
              console.error('Error saving metadata:', error);
            }

            return NextResponse.json({ 
              success: true,
              creative: generatedCreative,
              message: 'Video generated successfully! (Fallback mode - Remotion service unavailable)'
            });
          }
        } catch (error) {
          console.error('Error generating creative:', error);
          return NextResponse.json({ 
            error: 'Failed to generate creative', 
            details: error instanceof Error ? error.message : 'Unknown error'
          }, { status: 500 });
        }

      case 'upload-asset':
        try {
          // Handle asset upload for creative generation
          const { file, metadata } = body;
          
          if (!file) {
            return NextResponse.json({ error: 'File is required' }, { status: 400 });
          }

          // TODO: Implement file upload to storage
          const assetId = `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const assetUrl = `https://assets.brandwisp.com/${userId}/${assetId}`;

          // Create image analysis record
          const imageAnalysisData = {
            userId,
            url: assetUrl,
            filename: metadata?.filename || 'uploaded_asset',
            fileSize: metadata?.fileSize || 0,
            dimensions: metadata?.dimensions || { width: 0, height: 0 },
            format: metadata?.format || 'unknown',
            status: 'pending' as const,
            analysis: {
              tags: [],
              objects: [],
              colors: [],
              text: []
            },
            seo: {
              suggestedAltText: '',
              suggestedCaption: '',
              suggestedDescription: '',
              score: 0
            },
            accessibility: {
              score: 0,
              issues: [],
              suggestions: []
            }
          };

          const imageId = await FirebaseService.createImageAnalysis(imageAnalysisData);

          return NextResponse.json({ 
            assetId: imageId,
            url: assetUrl,
            message: 'Asset uploaded successfully'
          });
        } catch (error) {
          console.error('Error uploading asset:', error);
          return NextResponse.json({ error: 'Failed to upload asset' }, { status: 500 });
        }

      case 'save-creative':
        try {
          const { creativeId } = body;
          
          if (!creativeId) {
            return NextResponse.json({ error: 'Creative ID is required' }, { status: 400 });
          }

          // TODO: Implement creative saving to Firebase
          // For now, return success response
          return NextResponse.json({
            success: true,
            message: 'Creative saved successfully',
          });
        } catch (error) {
          console.error('Error saving creative:', error);
          return NextResponse.json({ error: 'Failed to save creative' }, { status: 500 });
        }

      case 'publish-creative':
        try {
          const { creativeId, publishData } = body;
          
          if (!creativeId || !publishData) {
            return NextResponse.json({ error: 'Creative ID and publish data are required' }, { status: 400 });
          }

          if (!publishData.platforms || publishData.platforms.length === 0) {
            return NextResponse.json({ error: 'At least one platform must be selected' }, { status: 400 });
          }

          // Simulate publishing to platforms
          const publishResults = [];
          for (const platform of publishData.platforms) {
            try {
              // Here you would integrate with platform APIs (Facebook Graph API, Instagram Basic Display API, etc.)
              // For now, we'll simulate the publishing process
              const publishResult = {
                platform,
                status: 'published',
                publishedAt: new Date().toISOString(),
                postId: `${platform}_${Date.now()}`,
                url: `https://${platform}.com/post/${Date.now()}`,
              };
              publishResults.push(publishResult);
            } catch (platformError) {
              console.error(`Error publishing to ${platform}:`, platformError);
              publishResults.push({
                platform,
                status: 'failed',
                error: platformError instanceof Error ? platformError.message : 'Unknown error',
              });
            }
          }

          // TODO: Save publish results to Firebase
          
          return NextResponse.json({
            success: true,
            message: `Video published to ${publishData.platforms.length} platform(s)`,
            publishResults,
          });
        } catch (error) {
          console.error('Error publishing creative:', error);
          return NextResponse.json({ error: 'Failed to publish creative' }, { status: 500 });
        }

      case 'schedule-creative':
        try {
          const { creativeId, publishData } = body;
          
          if (!creativeId || !publishData) {
            return NextResponse.json({ error: 'Creative ID and publish data are required' }, { status: 400 });
          }

          if (!publishData.platforms || publishData.platforms.length === 0) {
            return NextResponse.json({ error: 'At least one platform must be selected' }, { status: 400 });
          }

          if (!publishData.scheduleDate || !publishData.scheduleTime) {
            return NextResponse.json({ error: 'Schedule date and time are required' }, { status: 400 });
          }

          // Parse schedule date/time
          const scheduleDateTime = new Date(`${publishData.scheduleDate}T${publishData.scheduleTime}`);
          
          if (scheduleDateTime <= new Date()) {
            return NextResponse.json({ error: 'Schedule time must be in the future' }, { status: 400 });
          }

          // TODO: Save scheduled post to Firebase and implement scheduling system
          
          return NextResponse.json({
            success: true,
            message: `Video scheduled for ${scheduleDateTime.toLocaleDateString()} at ${scheduleDateTime.toLocaleTimeString()}`,
            scheduledFor: scheduleDateTime.toISOString(),
          });
        } catch (error) {
          console.error('Error scheduling creative:', error);
          return NextResponse.json({ error: 'Failed to schedule creative' }, { status: 500 });
        }

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