// Test products API call directly
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

async function testProductsAPI() {
  try {
    console.log('Fetching store data from Firestore...');
    
    const storeRef = doc(db, 'stores', STORE_ID);
    const storeSnap = await getDoc(storeRef);
    
    if (storeSnap.exists()) {
      const storeData = storeSnap.data();
      console.log('Store scope:', storeData.scope);
      
      if (storeData.accessToken) {
        console.log('\nTesting products API call...');
        try {
          const response = await fetch(`https://${storeData.storeUrl}/admin/api/2024-04/products.json?limit=5`, {
            headers: {
              'X-Shopify-Access-Token': storeData.accessToken,
              'Content-Type': 'application/json',
            },
          });
          
          console.log('Products API Response status:', response.status);
          
          if (response.ok) {
            const data = await response.json();
            console.log('Products found:', data.products.length);
            if (data.products.length > 0) {
              console.log('First product:', {
                id: data.products[0].id,
                title: data.products[0].title,
                status: data.products[0].status,
              });
            }
          } else {
            const errorText = await response.text();
            console.error('Products API Error:', errorText);
          }
        } catch (apiError) {
          console.error('Products API call failed:', apiError);
        }
        
        console.log('\nTesting orders API call...');
        try {
          const ordersResponse = await fetch(`https://${storeData.storeUrl}/admin/api/2024-04/orders.json?limit=5`, {
            headers: {
              'X-Shopify-Access-Token': storeData.accessToken,
              'Content-Type': 'application/json',
            },
          });
          
          console.log('Orders API Response status:', ordersResponse.status);
          
          if (ordersResponse.ok) {
            const ordersData = await ordersResponse.json();
            console.log('Orders found:', ordersData.orders.length);
          } else {
            const errorText = await ordersResponse.text();
            console.error('Orders API Error:', errorText);
          }
        } catch (apiError) {
          console.error('Orders API call failed:', apiError);
        }
      }
    } else {
      console.log('Store not found in Firestore');
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testProductsAPI(); 