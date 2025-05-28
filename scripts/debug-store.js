// Debug script to check store data
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyCZsDhKQ8zo4JIUP55a4w7WcL55G2-iciQ",
  authDomain: "brandwisp-dev.firebaseapp.com",
  projectId: "brandwisp-dev",
  storageBucket: "brandwisp-dev.appspot.com",
  messagingSenderId: "113523194662785221424",
  appId: "1:426241866355:web:362162eaaf2f1ce7f60806",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const STORE_ID = 'ms6yuv81f9smb5xuvae';

async function debugStore() {
  try {
    console.log('Fetching store data from Firestore...');
    
    const storeRef = doc(db, 'stores', STORE_ID);
    const storeSnap = await getDoc(storeRef);
    
    if (storeSnap.exists()) {
      const storeData = storeSnap.data();
      console.log('Store found:', {
        id: storeSnap.id,
        storeName: storeData.storeName,
        storeUrl: storeData.storeUrl,
        status: storeData.status,
        provider: storeData.provider,
        hasAccessToken: !!storeData.accessToken,
        accessTokenLength: storeData.accessToken?.length,
        scope: storeData.scope,
        createdAt: storeData.createdAt,
        updatedAt: storeData.updatedAt,
      });
      
      // Test a simple API call
      if (storeData.accessToken) {
        console.log('\nTesting Shopify API call...');
        try {
          const response = await fetch(`https://${storeData.storeUrl}/admin/api/2024-04/shop.json`, {
            headers: {
              'X-Shopify-Access-Token': storeData.accessToken,
              'Content-Type': 'application/json',
            },
          });
          
          console.log('API Response status:', response.status);
          
          if (response.ok) {
            const data = await response.json();
            console.log('Shop info:', {
              name: data.shop.name,
              email: data.shop.email,
              domain: data.shop.domain,
              plan: data.shop.plan_name,
            });
          } else {
            const errorText = await response.text();
            console.error('API Error:', errorText);
          }
        } catch (apiError) {
          console.error('API call failed:', apiError);
        }
      }
    } else {
      console.log('Store not found in Firestore');
    }
  } catch (error) {
    console.error('Debug failed:', error);
  }
}

debugStore(); 