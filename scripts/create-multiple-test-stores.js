const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, Timestamp } = require('firebase/firestore');

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

async function createMultipleTestStores() {
  console.log('🏪 Creating Multiple Test Stores...\n');
  
  const testStores = [
    {
      id: 'test-store-2',
      userId: 'test-user-id',
      provider: 'shopify',
      status: 'connected',
      storeName: 'Creative Designs Shop',
      storeUrl: 'creative-designs.myshopify.com',
      accessToken: 'mock_access_token_2',
      scope: 'read_products,write_products',
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        email: 'admin@creative-designs.com',
        currency: 'USD',
        country: 'US',
        timezone: 'America/New_York',
        plan: 'basic',
        trafficTracking: {
          enabled: false,
          trackingCode: '',
          enabledAt: null,
          lastDataUpdate: null,
          settings: {
            timezone: 'America/New_York',
            currency: 'USD',
            goals: []
          }
        }
      }
    },
    {
      id: 'test-store-3',
      userId: 'test-user-id',
      provider: 'shopify',
      status: 'connected',
      storeName: 'Print & Design Co',
      storeUrl: 'print-design-co.myshopify.com',
      accessToken: 'mock_access_token_3',
      scope: 'read_products,write_products',
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        email: 'admin@print-design.com',
        currency: 'USD',
        country: 'US',
        timezone: 'America/Los_Angeles',
        plan: 'professional',
        trafficTracking: {
          enabled: true,
          trackingCode: 'TT-1735334400000',
          enabledAt: new Date(),
          lastDataUpdate: new Date(),
          settings: {
            timezone: 'America/Los_Angeles',
            currency: 'USD',
            goals: []
          }
        }
      }
    },
    {
      id: 'test-store-4',
      userId: 'test-user-id',
      provider: 'etsy',
      status: 'connected',
      storeName: 'Handmade Crafts Store',
      storeUrl: 'handmade-crafts.etsy.com',
      accessToken: 'mock_etsy_token_1',
      scope: 'listings_r,listings_w',
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        email: 'admin@handmade-crafts.com',
        currency: 'USD',
        country: 'US',
        timezone: 'America/Chicago',
        plan: 'basic'
      }
    }
  ];

  try {
    for (const store of testStores) {
      await setDoc(doc(db, 'stores', store.id), store);
      console.log(`✅ Created store: ${store.storeName} (${store.id})`);
      console.log(`   - Provider: ${store.provider}`);
      console.log(`   - Status: ${store.status}`);
      console.log(`   - Tracking: ${store.metadata?.trafficTracking?.enabled ? 'Enabled' : 'Disabled'}`);
      console.log('');
    }

    console.log('🎉 All test stores created successfully!');
    console.log('\nTest user now has:');
    console.log('1. BrandWisp Demo Store (Shopify) - Tracking Enabled');
    console.log('2. Creative Designs Shop (Shopify) - Tracking Disabled');
    console.log('3. Print & Design Co (Shopify) - Tracking Enabled');
    console.log('4. Handmade Crafts Store (Etsy) - No Tracking');

  } catch (error) {
    console.error('❌ Error creating stores:', error);
  }
}

createMultipleTestStores(); 