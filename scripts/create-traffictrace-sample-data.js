const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID || 'brandwisp-dev',
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

async function createTrafficSampleData() {
  console.log('🚀 Creating TrafficTrace sample data...');

  const userId = 'test-user-id';
  const now = new Date();

  // Sample websites/domains for tracking
  const websites = [
    {
      id: 'website-1',
      userId,
      domain: 'brandwisp.com',
      name: 'BrandWisp Main Site',
      status: 'active',
      trackingCode: 'BW-123456789',
      connectedAt: admin.firestore.Timestamp.fromDate(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)),
      lastDataUpdate: admin.firestore.Timestamp.fromDate(now),
      settings: {
        timezone: 'America/New_York',
        currency: 'USD',
        goals: [
          { name: 'Purchase', value: 50, type: 'conversion' },
          { name: 'Newsletter Signup', value: 5, type: 'engagement' },
          { name: 'Contact Form', value: 10, type: 'lead' }
        ]
      },
      createdAt: admin.firestore.Timestamp.fromDate(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)),
      updatedAt: admin.firestore.Timestamp.fromDate(now)
    },
    {
      id: 'website-2',
      userId,
      domain: 'shop.brandwisp.com',
      name: 'BrandWisp Shop',
      status: 'active',
      trackingCode: 'BW-987654321',
      connectedAt: admin.firestore.Timestamp.fromDate(new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000)),
      lastDataUpdate: admin.firestore.Timestamp.fromDate(now),
      settings: {
        timezone: 'America/New_York',
        currency: 'USD',
        goals: [
          { name: 'Purchase', value: 75, type: 'conversion' },
          { name: 'Add to Cart', value: 15, type: 'engagement' }
        ]
      },
      createdAt: admin.firestore.Timestamp.fromDate(new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000)),
      updatedAt: admin.firestore.Timestamp.fromDate(now)
    }
  ];

  // Create websites
  for (const website of websites) {
    await db.collection('websites').doc(website.id).set(website);
    console.log(`✅ Created website: ${website.name}`);
  }

  // Generate traffic analytics data for the last 30 days
  const trafficAnalytics = [];
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    // Base traffic with weekend variations
    const baseVisitors = isWeekend ? 800 + Math.random() * 400 : 1200 + Math.random() * 800;
    const basePageViews = baseVisitors * (2.5 + Math.random() * 1.5);
    const baseSessions = baseVisitors * (0.85 + Math.random() * 0.15);
    
    const analytics = {
      id: `analytics-${date.toISOString().split('T')[0]}`,
      userId,
      websiteId: 'website-1',
      date: admin.firestore.Timestamp.fromDate(date),
      metrics: {
        visitors: Math.floor(baseVisitors),
        uniqueVisitors: Math.floor(baseVisitors * 0.75),
        pageViews: Math.floor(basePageViews),
        sessions: Math.floor(baseSessions),
        bounceRate: 25 + Math.random() * 30, // 25-55%
        avgSessionDuration: 120 + Math.random() * 180, // 2-5 minutes
        newVisitorRate: 60 + Math.random() * 20, // 60-80%
        returningVisitorRate: 20 + Math.random() * 20, // 20-40%
        conversions: Math.floor(baseVisitors * (0.02 + Math.random() * 0.03)), // 2-5% conversion
        revenue: Math.floor(baseVisitors * (0.02 + Math.random() * 0.03) * (25 + Math.random() * 50))
      },
      sources: {
        organic: Math.floor(baseVisitors * (0.35 + Math.random() * 0.15)),
        direct: Math.floor(baseVisitors * (0.25 + Math.random() * 0.15)),
        social: Math.floor(baseVisitors * (0.15 + Math.random() * 0.10)),
        referral: Math.floor(baseVisitors * (0.10 + Math.random() * 0.10)),
        email: Math.floor(baseVisitors * (0.08 + Math.random() * 0.07)),
        paid: Math.floor(baseVisitors * (0.05 + Math.random() * 0.10))
      },
      devices: {
        desktop: Math.floor(baseVisitors * (0.45 + Math.random() * 0.20)),
        mobile: Math.floor(baseVisitors * (0.40 + Math.random() * 0.20)),
        tablet: Math.floor(baseVisitors * (0.08 + Math.random() * 0.07))
      },
      topPages: [
        { path: '/', views: Math.floor(basePageViews * 0.25), avgTime: 45 + Math.random() * 60 },
        { path: '/products', views: Math.floor(basePageViews * 0.20), avgTime: 120 + Math.random() * 90 },
        { path: '/blog', views: Math.floor(basePageViews * 0.15), avgTime: 180 + Math.random() * 120 },
        { path: '/about', views: Math.floor(basePageViews * 0.10), avgTime: 90 + Math.random() * 60 },
        { path: '/contact', views: Math.floor(basePageViews * 0.08), avgTime: 60 + Math.random() * 45 }
      ],
      geographic: [
        { country: 'United States', visitors: Math.floor(baseVisitors * 0.45), sessions: Math.floor(baseSessions * 0.45) },
        { country: 'Canada', visitors: Math.floor(baseVisitors * 0.15), sessions: Math.floor(baseSessions * 0.15) },
        { country: 'United Kingdom', visitors: Math.floor(baseVisitors * 0.12), sessions: Math.floor(baseSessions * 0.12) },
        { country: 'Australia', visitors: Math.floor(baseVisitors * 0.08), sessions: Math.floor(baseSessions * 0.08) },
        { country: 'Germany', visitors: Math.floor(baseVisitors * 0.06), sessions: Math.floor(baseSessions * 0.06) }
      ],
      createdAt: admin.firestore.Timestamp.fromDate(date),
      updatedAt: admin.firestore.Timestamp.fromDate(now)
    };
    
    trafficAnalytics.push(analytics);
  }

  // Save traffic analytics
  for (const analytics of trafficAnalytics) {
    await db.collection('traffic_analytics').doc(analytics.id).set(analytics);
  }
  console.log(`✅ Created ${trafficAnalytics.length} traffic analytics records`);

  // Create real-time traffic data
  const realTimeData = {
    id: 'realtime-current',
    userId,
    websiteId: 'website-1',
    timestamp: admin.firestore.Timestamp.fromDate(now),
    activeUsers: 45 + Math.floor(Math.random() * 30),
    currentPageViews: 12 + Math.floor(Math.random() * 8),
    topActivePages: [
      { path: '/', activeUsers: 15 + Math.floor(Math.random() * 10) },
      { path: '/products/smartphone', activeUsers: 8 + Math.floor(Math.random() * 5) },
      { path: '/blog/latest-trends', activeUsers: 6 + Math.floor(Math.random() * 4) },
      { path: '/checkout', activeUsers: 3 + Math.floor(Math.random() * 3) }
    ],
    topReferrers: [
      { source: 'google.com', activeUsers: 20 + Math.floor(Math.random() * 10) },
      { source: 'direct', activeUsers: 15 + Math.floor(Math.random() * 8) },
      { source: 'facebook.com', activeUsers: 8 + Math.floor(Math.random() * 5) }
    ],
    deviceBreakdown: {
      desktop: 25 + Math.floor(Math.random() * 15),
      mobile: 35 + Math.floor(Math.random() * 20),
      tablet: 5 + Math.floor(Math.random() * 5)
    },
    createdAt: admin.firestore.Timestamp.fromDate(now),
    updatedAt: admin.firestore.Timestamp.fromDate(now)
  };

  await db.collection('realtime_traffic').doc(realTimeData.id).set(realTimeData);
  console.log('✅ Created real-time traffic data');

  // Create traffic goals and events
  const goals = [
    {
      id: 'goal-1',
      userId,
      websiteId: 'website-1',
      name: 'Purchase Completion',
      type: 'conversion',
      value: 50,
      conditions: [
        { type: 'url', operator: 'contains', value: '/thank-you' }
      ],
      isActive: true,
      completions: 156,
      conversionRate: 3.2,
      totalValue: 7800,
      createdAt: admin.firestore.Timestamp.fromDate(new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000)),
      updatedAt: admin.firestore.Timestamp.fromDate(now)
    },
    {
      id: 'goal-2',
      userId,
      websiteId: 'website-1',
      name: 'Newsletter Signup',
      type: 'engagement',
      value: 5,
      conditions: [
        { type: 'event', operator: 'equals', value: 'newsletter_signup' }
      ],
      isActive: true,
      completions: 423,
      conversionRate: 8.7,
      totalValue: 2115,
      createdAt: admin.firestore.Timestamp.fromDate(new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000)),
      updatedAt: admin.firestore.Timestamp.fromDate(now)
    }
  ];

  for (const goal of goals) {
    await db.collection('traffic_goals').doc(goal.id).set(goal);
  }
  console.log(`✅ Created ${goals.length} traffic goals`);

  // Create traffic alerts
  const alerts = [
    {
      id: 'alert-1',
      userId,
      websiteId: 'website-1',
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
      createdAt: admin.firestore.Timestamp.fromDate(new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000)),
      updatedAt: admin.firestore.Timestamp.fromDate(now)
    },
    {
      id: 'alert-2',
      userId,
      websiteId: 'website-1',
      name: 'High Bounce Rate Alert',
      type: 'bounce_rate',
      condition: {
        metric: 'bounceRate',
        operator: 'exceeds',
        value: 70,
        period: 'day'
      },
      isActive: true,
      lastTriggered: admin.firestore.Timestamp.fromDate(new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)),
      notifications: {
        email: true,
        push: true
      },
      createdAt: admin.firestore.Timestamp.fromDate(new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000)),
      updatedAt: admin.firestore.Timestamp.fromDate(now)
    }
  ];

  for (const alert of alerts) {
    await db.collection('traffic_alerts').doc(alert.id).set(alert);
  }
  console.log(`✅ Created ${alerts.length} traffic alerts`);

  console.log('🎉 TrafficTrace sample data creation completed!');
  console.log(`
📊 Summary:
- ${websites.length} websites created
- ${trafficAnalytics.length} days of traffic analytics
- 1 real-time traffic snapshot
- ${goals.length} conversion goals
- ${alerts.length} traffic alerts

🔗 Test Data:
- User ID: ${userId}
- Main Website: brandwisp.com
- Shop Website: shop.brandwisp.com
- Date Range: Last 30 days
- Total Visitors: ~${trafficAnalytics.reduce((sum, day) => sum + day.metrics.visitors, 0).toLocaleString()}
- Total Page Views: ~${trafficAnalytics.reduce((sum, day) => sum + day.metrics.pageViews, 0).toLocaleString()}
  `);
}

// Run the script
createTrafficSampleData().catch(console.error); 