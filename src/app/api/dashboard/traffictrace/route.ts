import { NextRequest, NextResponse } from 'next/server';
import { BigQueryService } from '@/lib/services/bigquery';
import { getFirebaseAdmin } from '@/lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';

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
        const [
          trafficSummary,
          geographicData,
          deviceBreakdown,
          topPages,
          realTimeMetrics,
          sessionMetrics
        ] = await Promise.all([
          BigQueryService.getDailyTrafficSummary(7), // Last 7 days for overview
          BigQueryService.getGeographicData(days),
          BigQueryService.getDeviceBreakdown(days),
          BigQueryService.getTopPages(days, 5),
          BigQueryService.getRealTimeMetrics(),
          BigQueryService.getUserSessionMetrics(days)
        ]);

        // Calculate summary metrics
        const totalViews = trafficSummary.reduce((sum, day) => sum + day.totalPageViews, 0);
        const totalVisitors = trafficSummary.reduce((sum, day) => sum + day.uniqueVisitors, 0);
        const avgBounceRate = trafficSummary.reduce((sum, day) => sum + day.bounceRate, 0) / trafficSummary.length;
        const totalConversions = trafficSummary.reduce((sum, day) => sum + day.totalConversions, 0);

        data = {
          summary: {
            totalViews,
            totalVisitors,
            avgBounceRate: avgBounceRate || 0,
            totalConversions,
            realTime: realTimeMetrics,
            sessionMetrics
          },
          charts: {
            trafficTrend: trafficSummary,
            geographic: geographicData.slice(0, 10),
            devices: deviceBreakdown,
            topPages: topPages
          }
        };
        break;

      case 'analyze':
        // Get detailed analytics data
        const [
          detailedTraffic,
          allGeographic,
          allDevices,
          allTopPages
        ] = await Promise.all([
          BigQueryService.getDailyTrafficSummary(days),
          BigQueryService.getGeographicData(days),
          BigQueryService.getDeviceBreakdown(days),
          BigQueryService.getTopPages(days, 20)
        ]);

        data = {
          traffic: detailedTraffic,
          geographic: allGeographic,
          devices: allDevices,
          pages: allTopPages,
          metrics: await BigQueryService.getUserSessionMetrics(days)
        };
        break;

      case 'reports':
        // Get report data
        const reportData = await BigQueryService.getDailyTrafficSummary(days);
        const reportMetrics = await BigQueryService.getUserSessionMetrics(days);
        
        data = {
          reportData,
          metrics: reportMetrics,
          summary: {
            totalPageViews: reportData.reduce((sum, day) => sum + day.totalPageViews, 0),
            uniqueVisitors: reportData.reduce((sum, day) => sum + day.uniqueVisitors, 0),
            totalSessions: reportData.reduce((sum, day) => sum + day.totalSessions, 0),
            avgSessionDuration: reportData.reduce((sum, day) => sum + day.avgSessionDuration, 0) / reportData.length,
            bounceRate: reportData.reduce((sum, day) => sum + day.bounceRate, 0) / reportData.length,
            conversionRate: reportData.reduce((sum, day) => sum + day.totalConversions, 0) / reportData.reduce((sum, day) => sum + day.totalSessions, 0) * 100
          }
        };
        break;

      default:
        return NextResponse.json({ error: 'Invalid view parameter' }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('TrafficTrace API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 