// Using built-in fetch (Node.js 18+)

const APP_URL = 'http://localhost:3004';
const STORE_ID = 'ms6yuv81f9smb5xuvae'; // From the logs

async function testStoreConnection() {
  try {
    console.log('Testing store connection and sync...');
    
    // Test internal sync call
    const syncResponse = await fetch(`${APP_URL}/api/stores/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        storeId: STORE_ID, 
        internal: true 
      }),
    });
    
    console.log('Sync response status:', syncResponse.status);
    
    if (syncResponse.ok) {
      const result = await syncResponse.json();
      console.log('Sync result:', result);
    } else {
      const error = await syncResponse.text();
      console.error('Sync error:', error);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testStoreConnection(); 