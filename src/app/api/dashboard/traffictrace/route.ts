import { NextRequest, NextResponse } from 'next/server';
import { FirebaseService } from '@/lib/services/firebase';
import { BigQueryService } from '@/lib/services/bigquery';
import { getFirebaseAdmin } from '@/lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { StoreModel } from '@/lib/models/store';

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
    const websiteId = searchParams.get('websiteId');

    let data: any = {};

    switch (view) {
      case 'dashboard':
        // Get dashboard overview data with error handling
        let stores: any[] = [];
        let trafficAnalytics: any[] = [];
        let realTimeData: any = null;
        let goals: any[] = [];
        let alerts: any[] = [];

        try {
          // Get user's connected stores using StoreModel
          stores = await StoreModel.getByUserId(userId);
          // Filter to only show connected stores (regardless of tracking status)
          stores = stores.filter(store => store.status === 'connected');
        } catch (error) {
          console.error('Error fetching stores:', error);
          stores = [];
        }

        // Use the first store with tracking enabled for data calculations
        const trackingEnabledStores = stores.filter(store => 
          store.metadata?.trafficTracking?.enabled === true
        );
        const targetStoreId = websiteId || (trackingEnabledStores.length > 0 ? trackingEnabledStores[0].id : null);

        if (targetStoreId) {
          try {
            [trafficAnalytics, realTimeData, goals, alerts] = await Promise.all([
              FirebaseService.getTrafficAnalytics(userId, targetStoreId, Math.min(days, 30)),
              FirebaseService.getRealTimeTraffic(userId, targetStoreId),
              FirebaseService.getTrafficGoals(userId, targetStoreId),
              FirebaseService.getTrafficAlerts(userId, targetStoreId)
            ]);
          } catch (error) {
            console.error('Error fetching traffic data:', error);
            trafficAnalytics = [];
            realTimeData = null;
            goals = [];
            alerts = [];
          }
        }

        // Calculate summary metrics from Firebase data
        const totalVisitors = trafficAnalytics.reduce((sum, day) => sum + (day.metrics?.visitors || 0), 0);
        const totalPageViews = trafficAnalytics.reduce((sum, day) => sum + (day.metrics?.pageViews || 0), 0);
        const totalSessions = trafficAnalytics.reduce((sum, day) => sum + (day.metrics?.sessions || 0), 0);
        const avgBounceRate = trafficAnalytics.length > 0 
          ? trafficAnalytics.reduce((sum, day) => sum + (day.metrics?.bounceRate || 0), 0) / trafficAnalytics.length 
          : 0;
        const avgSessionDuration = trafficAnalytics.length > 0 
          ? trafficAnalytics.reduce((sum, day) => sum + (day.metrics?.avgSessionDuration || 0), 0) / trafficAnalytics.length 
          : 0;
        const totalConversions = trafficAnalytics.reduce((sum, day) => sum + (day.metrics?.conversions || 0), 0);
        const totalRevenue = trafficAnalytics.reduce((sum, day) => sum + (day.metrics?.revenue || 0), 0);

        // Aggregate traffic sources
        const aggregatedSources = trafficAnalytics.reduce((acc, day) => {
          if (day.sources) {
            Object.keys(day.sources).forEach(source => {
              acc[source] = (acc[source] || 0) + (day.sources[source] || 0);
            });
          }
          return acc;
        }, {} as Record<string, number>);

        // Aggregate device data
        const aggregatedDevices = trafficAnalytics.reduce((acc, day) => {
          if (day.devices) {
            Object.keys(day.devices).forEach(device => {
              acc[device] = (acc[device] || 0) + (day.devices[device] || 0);
            });
          }
          return acc;
        }, {} as Record<string, number>);

        // Aggregate geographic data
        const geographicMap = new Map<string, { visitors: number; sessions: number }>();
        trafficAnalytics.forEach(day => {
          if (day.geographic) {
            day.geographic.forEach((geo: any) => {
              const existing = geographicMap.get(geo.country) || { visitors: 0, sessions: 0 };
              geographicMap.set(geo.country, {
                visitors: existing.visitors + geo.visitors,
                sessions: existing.sessions + geo.sessions
              });
            });
          }
        });

        // Aggregate top pages
        const pagesMap = new Map<string, { views: number; avgTime: number; count: number }>();
        trafficAnalytics.forEach(day => {
          if (day.topPages) {
            day.topPages.forEach((page: any) => {
              const existing = pagesMap.get(page.path) || { views: 0, avgTime: 0, count: 0 };
              pagesMap.set(page.path, {
                views: existing.views + page.views,
                avgTime: existing.avgTime + page.avgTime,
                count: existing.count + 1
              });
            });
          }
        });

        // Convert maps to arrays and sort
        const topCountries = Array.from(geographicMap.entries())
          .map(([country, data]) => ({ country, ...data }))
          .sort((a, b) => b.visitors - a.visitors)
          .slice(0, 10);

        const topPages = Array.from(pagesMap.entries())
          .map(([path, data]) => ({
            path,
            views: data.views,
            avgTime: data.count > 0 ? data.avgTime / data.count : 0
          }))
          .sort((a, b) => b.views - a.views)
          .slice(0, 10);

        data = {
          stores,
          currentStore: targetStoreId ? stores.find((s: any) => s.id === targetStoreId) : null,
          summary: {
            totalVisitors,
            totalPageViews,
            totalSessions,
            avgBounceRate: Math.round(avgBounceRate * 100) / 100,
            avgSessionDuration: Math.round(avgSessionDuration),
            totalConversions,
            totalRevenue,
            conversionRate: totalSessions > 0 ? (totalConversions / totalSessions) * 100 : 0,
            realTime: realTimeData ? {
              activeUsers: realTimeData.activeUsers,
              currentPageViews: realTimeData.currentPageViews,
              topActivePages: realTimeData.topActivePages || [],
              topReferrers: realTimeData.topReferrers || [],
              deviceBreakdown: realTimeData.deviceBreakdown || {}
            } : null
          },
          charts: {
            trafficTrend: trafficAnalytics.map(day => ({
              date: day.date.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              visitors: day.metrics?.visitors || 0,
              pageViews: day.metrics?.pageViews || 0,
              sessions: day.metrics?.sessions || 0,
              bounceRate: day.metrics?.bounceRate || 0,
              avgSessionDuration: day.metrics?.avgSessionDuration || 0,
              conversions: day.metrics?.conversions || 0
            })).reverse(), // Reverse to show chronological order
                         trafficSources: Object.entries(aggregatedSources).map(([name, visitors]) => ({
               name: name.charAt(0).toUpperCase() + name.slice(1),
               visitors: visitors as number,
               percentage: totalVisitors > 0 ? ((visitors as number) / totalVisitors) * 100 : 0
             })).sort((a, b) => (b.visitors as number) - (a.visitors as number)),
             devices: Object.entries(aggregatedDevices).map(([device, visitors]) => ({
               device: device.charAt(0).toUpperCase() + device.slice(1),
               visitors: visitors as number,
               percentage: totalVisitors > 0 ? ((visitors as number) / totalVisitors) * 100 : 0
             })).sort((a, b) => (b.visitors as number) - (a.visitors as number)),
            geographic: topCountries,
            topPages
          },
          goals: goals.map(goal => ({
            ...goal,
            createdAt: goal.createdAt?.toDate?.() || goal.createdAt,
            updatedAt: goal.updatedAt?.toDate?.() || goal.updatedAt
          })),
          alerts: alerts.map(alert => ({
            ...alert,
            createdAt: alert.createdAt?.toDate?.() || alert.createdAt,
            updatedAt: alert.updatedAt?.toDate?.() || alert.updatedAt,
            lastTriggered: alert.lastTriggered?.toDate?.() || alert.lastTriggered
          }))
        };
        break;

      case 'reports':
        // Get comprehensive report data
        let reportStores: any[] = [];
        let reportTrafficData: any[] = [];
        let reportGoals: any[] = [];

        try {
          reportStores = await StoreModel.getByUserId(userId);
          // Filter to only show connected stores (regardless of tracking status)
          reportStores = reportStores.filter(store => store.status === 'connected');
        } catch (error) {
          console.error('Error fetching stores for reports:', error);
          reportStores = [];
        }

        // Use the first store with tracking enabled for data calculations
        const reportTrackingEnabledStores = reportStores.filter(store => 
          store.metadata?.trafficTracking?.enabled === true
        );
        const reportStoreId = websiteId || (reportTrackingEnabledStores.length > 0 ? reportTrackingEnabledStores[0].id : null);

        if (reportStoreId) {
          try {
            [reportTrafficData, reportGoals] = await Promise.all([
              FirebaseService.getTrafficAnalytics(userId, reportStoreId, days),
              FirebaseService.getTrafficGoals(userId, reportStoreId)
            ]);
          } catch (error) {
            console.error('Error fetching report data:', error);
            reportTrafficData = [];
            reportGoals = [];
          }
        }

        // Calculate report metrics
        const reportTotalVisitors = reportTrafficData.reduce((sum, day) => sum + (day.metrics?.visitors || 0), 0);
        const reportTotalPageViews = reportTrafficData.reduce((sum, day) => sum + (day.metrics?.pageViews || 0), 0);
        const reportTotalSessions = reportTrafficData.reduce((sum, day) => sum + (day.metrics?.sessions || 0), 0);
        const reportTotalConversions = reportTrafficData.reduce((sum, day) => sum + (day.metrics?.conversions || 0), 0);
        const reportTotalRevenue = reportTrafficData.reduce((sum, day) => sum + (day.metrics?.revenue || 0), 0);

        data = {
          stores: reportStores,
          currentStore: reportStoreId ? reportStores.find((s: any) => s.id === reportStoreId) : null,
          reportData: reportTrafficData.map(day => ({
            date: day.date.toDate().toLocaleDateString(),
            ...day.metrics
          })),
          goals: reportGoals,
          summary: {
            totalPageViews: reportTotalPageViews,
            uniqueVisitors: reportTotalVisitors,
            totalSessions: reportTotalSessions,
            avgSessionDuration: reportTrafficData.length > 0 
              ? reportTrafficData.reduce((sum, day) => sum + (day.metrics?.avgSessionDuration || 0), 0) / reportTrafficData.length 
              : 0,
            bounceRate: reportTrafficData.length > 0 
              ? reportTrafficData.reduce((sum, day) => sum + (day.metrics?.bounceRate || 0), 0) / reportTrafficData.length 
              : 0,
            conversionRate: reportTotalSessions > 0 ? (reportTotalConversions / reportTotalSessions) * 100 : 0,
            totalConversions: reportTotalConversions,
            totalRevenue: reportTotalRevenue
          },
          dateRange: {
            start: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            end: new Date().toISOString().split('T')[0],
            days
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
    const { action, storeData, goalData, alertData, storeId, goalId, alertId } = body;

    switch (action) {
      case 'enable-tracking':
        // Enable traffic tracking for existing connected store
        if (!storeId) {
          return NextResponse.json({ error: 'Store ID is required' }, { status: 400 });
        }

        // Get the store to verify it exists and is connected
        const store = await StoreModel.getById(storeId);
        if (!store || store.userId !== userId) {
          return NextResponse.json({ error: 'Store not found or access denied' }, { status: 404 });
        }

        if (store.status !== 'connected') {
          return NextResponse.json({ error: 'Store must be connected to enable tracking' }, { status: 400 });
        }

        // Update store metadata to include traffic tracking
        await StoreModel.update(storeId, {
          metadata: {
            ...store.metadata,
            trafficTracking: {
              enabled: true,
              trackingCode: `TT-${Date.now()}`,
              enabledAt: new Date(),
              lastDataUpdate: new Date(),
              settings: storeData?.settings || {
                timezone: store.metadata?.timezone || 'UTC',
                currency: store.metadata?.currency || 'USD',
                goals: []
              }
            }
          }
        });

        return NextResponse.json({ storeId, message: 'Traffic tracking enabled for store' });

      case 'disable-tracking':
        // Disable traffic tracking for store
        if (!storeId) {
          return NextResponse.json({ error: 'Store ID is required' }, { status: 400 });
        }

        const storeToDisable = await StoreModel.getById(storeId);
        if (!storeToDisable || storeToDisable.userId !== userId) {
          return NextResponse.json({ error: 'Store not found or access denied' }, { status: 404 });
        }

        // Update store metadata to disable traffic tracking
        await StoreModel.update(storeId, {
          metadata: {
            ...storeToDisable.metadata,
            trafficTracking: {
              ...storeToDisable.metadata?.trafficTracking,
              enabled: false,
              disabledAt: new Date()
            }
          }
        });

        return NextResponse.json({ storeId, message: 'Traffic tracking disabled for store' });

      case 'update-tracking-settings':
        // Update traffic tracking settings for store
        if (!storeId) {
          return NextResponse.json({ error: 'Store ID is required' }, { status: 400 });
        }

        const storeToUpdate = await StoreModel.getById(storeId);
        if (!storeToUpdate || storeToUpdate.userId !== userId) {
          return NextResponse.json({ error: 'Store not found or access denied' }, { status: 404 });
        }

        // Update tracking settings
        await StoreModel.update(storeId, {
          metadata: {
            ...storeToUpdate.metadata,
            trafficTracking: {
              ...storeToUpdate.metadata?.trafficTracking,
              settings: {
                ...storeToUpdate.metadata?.trafficTracking?.settings,
                ...storeData?.settings
              },
              lastDataUpdate: new Date()
            }
          }
        });

        return NextResponse.json({ message: 'Traffic tracking settings updated successfully' });

      case 'create-goal':
        // Create new conversion goal
        const newGoalId = await FirebaseService.createTrafficGoal({
          userId,
          websiteId: goalData.storeId || storeId,
          name: goalData.name,
          type: goalData.type,
          value: goalData.value,
          conditions: goalData.conditions,
          isActive: true,
          completions: 0,
          conversionRate: 0,
          totalValue: 0
        });

        return NextResponse.json({ goalId: newGoalId });

      case 'update-goal':
        // Update conversion goal
        await FirebaseService.updateTrafficGoal(goalId, goalData);
        return NextResponse.json({ message: 'Goal updated successfully' });

      case 'create-alert':
        // Create new traffic alert
        const newAlertId = await FirebaseService.createTrafficAlert({
          userId,
          websiteId: alertData.storeId || storeId,
          name: alertData.name,
          type: alertData.type,
          condition: alertData.condition,
          isActive: true,
          lastTriggered: null,
          notifications: alertData.notifications || { email: true, push: false }
        });

        return NextResponse.json({ alertId: newAlertId });

      case 'update-alert':
        // Update traffic alert
        await FirebaseService.updateTrafficAlert(alertId, alertData);
        return NextResponse.json({ message: 'Alert updated successfully' });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('TrafficTrace POST API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 