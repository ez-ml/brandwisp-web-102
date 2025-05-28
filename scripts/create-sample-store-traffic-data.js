const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, Timestamp } = require('firebase/firestore');

// Firebase config (same as your app)
const firebaseConfig = {
  apiKey: "AIzaSyBpZmFpZmFpZmFpZmFpZmFpZmFpZmFpZmFp",
  authDomain: "brandwisp-dev.firebaseapp.com",
  projectId: "brandwisp-dev",
  storageBucket: "brandwisp-dev.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdefghijklmnop"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function createSampleStoreTrafficData() {
  console.log('🚀 Creating Sample Store Traffic Data...\n');

  const userId = 'test-user-id';
  
  try {
    // First, create a sample store with traffic tracking enabled
    const storeId = 'sample-store-1';
    const storeData = {
      id: storeId,
      userId: userId,
      provider: 'shopify',
      status: 'connected',
      storeName: 'BrandWisp Demo Store',
      storeUrl: 'brandwisp-demo.myshopify.com',
      accessToken: 'sample-token',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      metadata: {
        email: 'demo@brandwisp.com',
        currency: 'USD',
        country: 'US',
        timezone: 'America/New_York',
        plan: 'basic',
        trafficTracking: {
          enabled: true,
          trackingCode: `TT-${Date.now()}`,
          enabledAt: Timestamp.now(),
          lastDataUpdate: Timestamp.now(),
          settings: {
            timezone: 'America/New_York',
            currency: 'USD',
            goals: []
          }
        }
      }
    };

    await setDoc(doc(db, 'stores', storeId), storeData);
    console.log('✅ Created sample store with traffic tracking enabled');

    // Create traffic analytics data for the past 30 days
    const trafficData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const baseVisitors = 150 + Math.floor(Math.random() * 100);
      const sessions = Math.floor(baseVisitors * (0.7 + Math.random() * 0.3));
      const pageViews = Math.floor(sessions * (2 + Math.random() * 3));
      const bounceRate = 0.3 + Math.random() * 0.4;
      const avgSessionDuration = 120 + Math.random() * 180;
      const conversions = Math.floor(sessions * (0.02 + Math.random() * 0.03));
      const revenue = conversions * (25 + Math.random() * 75);

      const analyticsDoc = {
        id: `${storeId}-${date.toISOString().split('T')[0]}`,
        userId: userId,
        websiteId: storeId, // Using storeId as websiteId for compatibility
        date: Timestamp.fromDate(date),
        metrics: {
          visitors: baseVisitors,
          uniqueVisitors: Math.floor(baseVisitors * 0.8),
          pageViews: pageViews,
          sessions: sessions,
          bounceRate: bounceRate,
          avgSessionDuration: avgSessionDuration,
          newVisitorRate: 0.6 + Math.random() * 0.3,
          returningVisitorRate: 0.1 + Math.random() * 0.3,
          conversions: conversions,
          revenue: revenue
        },
        sources: {
          organic: Math.floor(baseVisitors * (0.4 + Math.random() * 0.2)),
          direct: Math.floor(baseVisitors * (0.2 + Math.random() * 0.1)),
          social: Math.floor(baseVisitors * (0.15 + Math.random() * 0.1)),
          referral: Math.floor(baseVisitors * (0.1 + Math.random() * 0.1)),
          email: Math.floor(baseVisitors * (0.05 + Math.random() * 0.05)),
          paid: Math.floor(baseVisitors * (0.1 + Math.random() * 0.1))
        },
        devices: {
          desktop: Math.floor(baseVisitors * (0.4 + Math.random() * 0.2)),
          mobile: Math.floor(baseVisitors * (0.5 + Math.random() * 0.2)),
          tablet: Math.floor(baseVisitors * (0.1 + Math.random() * 0.1))
        },
        topPages: [
          { path: '/', views: Math.floor(pageViews * 0.3), avgTime: 45 + Math.random() * 60 },
          { path: '/products', views: Math.floor(pageViews * 0.2), avgTime: 90 + Math.random() * 120 },
          { path: '/about', views: Math.floor(pageViews * 0.15), avgTime: 60 + Math.random() * 90 },
          { path: '/contact', views: Math.floor(pageViews * 0.1), avgTime: 30 + Math.random() * 60 },
          { path: '/blog', views: Math.floor(pageViews * 0.25), avgTime: 120 + Math.random() * 180 }
        ],
        geographic: [
          { country: 'United States', visitors: Math.floor(baseVisitors * 0.6), sessions: Math.floor(sessions * 0.6) },
          { country: 'Canada', visitors: Math.floor(baseVisitors * 0.15), sessions: Math.floor(sessions * 0.15) },
          { country: 'United Kingdom', visitors: Math.floor(baseVisitors * 0.1), sessions: Math.floor(sessions * 0.1) },
          { country: 'Australia', visitors: Math.floor(baseVisitors * 0.08), sessions: Math.floor(sessions * 0.08) },
          { country: 'Germany', visitors: Math.floor(baseVisitors * 0.07), sessions: Math.floor(sessions * 0.07) }
        ],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      await setDoc(doc(db, 'traffic_analytics', analyticsDoc.id), analyticsDoc);
      trafficData.push(analyticsDoc);
    }

    console.log(`✅ Created ${trafficData.length} days of traffic analytics data`);

    // Create real-time traffic data
    const realTimeData = {
      id: `${storeId}-realtime`,
      userId: userId,
      websiteId: storeId,
      timestamp: Timestamp.now(),
      activeUsers: 15 + Math.floor(Math.random() * 25),
      currentPageViews: 45 + Math.floor(Math.random() * 55),
      topActivePages: [
        { path: '/', activeUsers: 8 + Math.floor(Math.random() * 12) },
        { path: '/products', activeUsers: 5 + Math.floor(Math.random() * 8) },
        { path: '/checkout', activeUsers: 2 + Math.floor(Math.random() * 5) }
      ],
      topReferrers: [
        { source: 'google.com', activeUsers: 12 + Math.floor(Math.random() * 8) },
        { source: 'facebook.com', activeUsers: 3 + Math.floor(Math.random() * 5) },
        { source: 'direct', activeUsers: 8 + Math.floor(Math.random() * 10) }
      ],
      deviceBreakdown: {
        desktop: 15 + Math.floor(Math.random() * 10),
        mobile: 20 + Math.floor(Math.random() * 15),
        tablet: 3 + Math.floor(Math.random() * 5)
      },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    await setDoc(doc(db, 'realtime_traffic', realTimeData.id), realTimeData);
    console.log('✅ Created real-time traffic data');

    // Create sample goals
    const goals = [
      {
        id: `${storeId}-goal-1`,
        userId: userId,
        websiteId: storeId,
        name: 'Purchase Completion',
        type: 'conversion',
        value: 50,
        conditions: [
          { type: 'url', operator: 'contains', value: '/thank-you' }
        ],
        isActive: true,
        completions: 45,
        conversionRate: 2.3,
        totalValue: 2250,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      },
      {
        id: `${storeId}-goal-2`,
        userId: userId,
        websiteId: storeId,
        name: 'Newsletter Signup',
        type: 'lead',
        value: 5,
        conditions: [
          { type: 'event', operator: 'equals', value: 'newsletter_signup' }
        ],
        isActive: true,
        completions: 128,
        conversionRate: 6.5,
        totalValue: 640,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }
    ];

    for (const goal of goals) {
      await setDoc(doc(db, 'traffic_goals', goal.id), goal);
    }
    console.log(`✅ Created ${goals.length} traffic goals`);

    // Create sample alerts
    const alerts = [
      {
        id: `${storeId}-alert-1`,
        userId: userId,
        websiteId: storeId,
        name: 'Traffic Drop Alert',
        type: 'traffic_drop',
        condition: {
          metric: 'visitors',
          operator: 'decreases_by',
          value: 20,
          period: 'day'
        },
        isActive: true,
        lastTriggered: null,
        notifications: {
          email: true,
          push: false
        },
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      },
      {
        id: `${storeId}-alert-2`,
        userId: userId,
        websiteId: storeId,
        name: 'High Bounce Rate Alert',
        type: 'bounce_rate',
        condition: {
          metric: 'bounce_rate',
          operator: 'exceeds',
          value: 70,
          period: 'hour'
        },
        isActive: true,
        lastTriggered: null,
        notifications: {
          email: true,
          push: true
        },
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }
    ];

    for (const alert of alerts) {
      await setDoc(doc(db, 'traffic_alerts', alert.id), alert);
    }
    console.log(`✅ Created ${alerts.length} traffic alerts`);

    console.log('\n🎉 Sample store traffic data creation completed!');
    console.log('\n📊 Summary:');
    console.log(`   - Store: ${storeData.storeName} (${storeData.storeUrl})`);
    console.log(`   - Traffic tracking: Enabled`);
    console.log(`   - Analytics data: 30 days`);
    console.log(`   - Real-time data: Active`);
    console.log(`   - Goals: ${goals.length}`);
    console.log(`   - Alerts: ${alerts.length}`);
    console.log('\n✨ You can now test TrafficTrace with real data!');

  } catch (error) {
    console.error('❌ Error creating sample data:', error);
  }
}

createSampleStoreTrafficData(); 