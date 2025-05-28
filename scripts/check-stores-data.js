const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyBpZmFpZmFpZmFpZmFpZmFpZmFpZmFpZmFp",
  authDomain: "brandwisp-dev.firebaseapp.com",
  projectId: "brandwisp-dev",
  storageBucket: "brandwisp-dev.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdefghijklmnop"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkStores() {
  console.log('🔍 Checking Stores Collection...\n');
  
  try {
    // Check all stores
    const allStoresQuery = query(collection(db, 'stores'));
    const allStoresSnapshot = await getDocs(allStoresQuery);
    console.log('Total stores in database:', allStoresSnapshot.size);
    
    allStoresSnapshot.forEach(doc => {
      const data = doc.data();
      console.log('Store:', {
        id: doc.id,
        userId: data.userId,
        storeName: data.storeName,
        status: data.status,
        storeUrl: data.storeUrl,
        hasTrafficTracking: !!data.metadata?.trafficTracking
      });
    });
    
    // Check stores for test user
    console.log('\n--- Test User Stores ---');
    const testUserQuery = query(collection(db, 'stores'), where('userId', '==', 'test-user-id'));
    const testUserSnapshot = await getDocs(testUserQuery);
    console.log('Test user stores:', testUserSnapshot.size);
    
    testUserSnapshot.forEach(doc => {
      const data = doc.data();
      console.log('Test User Store:', {
        id: doc.id,
        storeName: data.storeName,
        status: data.status,
        storeUrl: data.storeUrl,
        trackingEnabled: data.metadata?.trafficTracking?.enabled
      });
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkStores(); 