const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, Timestamp } = require('firebase/firestore');

// Firebase config
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

async function checkTrafficData() {
  console.log('🔍 Checking Traffic Analytics Data...\n');

  const userId = 'test-user-id';
  const storeId = 'sample-store-1';

  try {
    // Check traffic analytics data
    console.log('1. Checking traffic_analytics collection...');
    const analyticsQuery = query(
      collection(db, 'traffic_analytics'),
      where('userId', '==', userId),
      where('websiteId', '==', storeId)
    );
    
    const analyticsSnapshot = await getDocs(analyticsQuery);
    console.log(`   - Found ${analyticsSnapshot.size} analytics records`);
    
    if (!analyticsSnapshot.empty) {
      const firstDoc = analyticsSnapshot.docs[0].data();
      console.log(`   - Sample record date: ${firstDoc.date.toDate().toLocaleDateString()}`);
      console.log(`   - Sample visitors: ${firstDoc.metrics?.visitors || 0}`);
      console.log(`   - Sample page views: ${firstDoc.metrics?.pageViews || 0}`);
    }

    // Check real-time traffic data
    console.log('\n2. Checking realtime_traffic collection...');
    const realtimeQuery = query(
      collection(db, 'realtime_traffic'),
      where('userId', '==', userId),
      where('websiteId', '==', storeId)
    );
    
    const realtimeSnapshot = await getDocs(realtimeQuery);
    console.log(`   - Found ${realtimeSnapshot.size} real-time records`);
    
    if (!realtimeSnapshot.empty) {
      const realtimeDoc = realtimeSnapshot.docs[0].data();
      console.log(`   - Active users: ${realtimeDoc.activeUsers || 0}`);
      console.log(`   - Current page views: ${realtimeDoc.currentPageViews || 0}`);
    }

    // Check goals
    console.log('\n3. Checking traffic_goals collection...');
    const goalsQuery = query(
      collection(db, 'traffic_goals'),
      where('userId', '==', userId),
      where('websiteId', '==', storeId)
    );
    
    const goalsSnapshot = await getDocs(goalsQuery);
    console.log(`   - Found ${goalsSnapshot.size} goals`);

    // Check alerts
    console.log('\n4. Checking traffic_alerts collection...');
    const alertsQuery = query(
      collection(db, 'traffic_alerts'),
      where('userId', '==', userId),
      where('websiteId', '==', storeId)
    );
    
    const alertsSnapshot = await getDocs(alertsQuery);
    console.log(`   - Found ${alertsSnapshot.size} alerts`);

    // Test date range query (last 30 days) - same as Firebase service
    console.log('\n5. Testing Firebase service query structure...');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    // Test the exact query used in Firebase service
    const serviceQuery = query(
      collection(db, 'traffic_analytics'),
      where('userId', '==', userId),
      where('websiteId', '==', storeId),
      where('date', '>=', Timestamp.fromDate(startDate))
    );
    
    try {
      const serviceSnapshot = await getDocs(serviceQuery);
      console.log(`   - Firebase service query: ${serviceSnapshot.size} records found`);
      
      if (serviceSnapshot.size > 0) {
        let totalVisitors = 0;
        let totalPageViews = 0;
        
        serviceSnapshot.forEach(doc => {
          const data = doc.data();
          totalVisitors += data.metrics?.visitors || 0;
          totalPageViews += data.metrics?.pageViews || 0;
        });
        
        console.log(`   - Total visitors: ${totalVisitors}`);
        console.log(`   - Total page views: ${totalPageViews}`);
        
        // Test sorting in memory
        const results = serviceSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const sorted = results.sort((a, b) => {
          const aTime = a.date?.toMillis() || 0;
          const bTime = b.date?.toMillis() || 0;
          return bTime - aTime;
        });
        console.log(`   - Sorted results: ${sorted.length} records`);
        console.log(`   - Latest record date: ${sorted[0]?.date?.toDate()?.toLocaleDateString()}`);
      }
    } catch (error) {
      console.log(`   - Firebase service query failed: ${error.message}`);
      
      // Try simpler query without date range
      console.log('\n6. Testing simpler query without date range...');
      const simpleQuery = query(
        collection(db, 'traffic_analytics'),
        where('userId', '==', userId),
        where('websiteId', '==', storeId)
      );
      
      try {
        const simpleSnapshot = await getDocs(simpleQuery);
        console.log(`   - Simple query: ${simpleSnapshot.size} records found`);
        
        if (simpleSnapshot.size > 0) {
          let totalVisitors = 0;
          let totalPageViews = 0;
          
          simpleSnapshot.forEach(doc => {
            const data = doc.data();
            totalVisitors += data.metrics?.visitors || 0;
            totalPageViews += data.metrics?.pageViews || 0;
          });
          
          console.log(`   - Total visitors: ${totalVisitors}`);
          console.log(`   - Total page views: ${totalPageViews}`);
        }
      } catch (simpleError) {
        console.log(`   - Simple query also failed: ${simpleError.message}`);
      }
    }

    console.log('\n✅ Traffic data check completed!');

  } catch (error) {
    console.error('❌ Error checking traffic data:', error);
  }
}

checkTrafficData(); 