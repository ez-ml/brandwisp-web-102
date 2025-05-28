const crypto = require('crypto');

// Test HMAC verification with sample data
const SHOPIFY_API_SECRET = '73ff4879dd719687346c661c115b7753';

// Sample callback parameters (similar to what we're receiving)
const params = {
  code: '48c5190e127f83d4dafa14013d496edf',
  host: 'YWRtaW4uc2hvcGlmeS5jb20vc3RvcmUvc3MtYXJtYXRpY3M',
  shop: 'ss-armatics.myshopify.com',
  state: 'eyJ1c2VySWQiOiJ3ZnkxVXM0cG1TZG9WMFQ4cGhMWUp2c0NzNXgyIiwibm9uY2UiOiJuNGV6eGVoc2gzam1iNjh1eGk3IiwidGltZXN0YW1wIjoxNzQ4MzMzODkyODk1fQ%3D%3D',
  timestamp: '1748333893'
};

const receivedHmac = '4a6f7790bd0378869fe80d400621547d3dc2237fd62d1dae4270091b494dee92';

// Sort parameters alphabetically and create query string
const sortedParams = Object.entries(params)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([key, value]) => `${key}=${value}`)
  .join('&');

console.log('Sorted params:', sortedParams);

// Generate HMAC
const generatedHash = crypto
  .createHmac('sha256', SHOPIFY_API_SECRET)
  .update(sortedParams)
  .digest('hex');

console.log('Generated HMAC:', generatedHash);
console.log('Received HMAC:', receivedHmac);
console.log('Match:', generatedHash === receivedHmac);

// Test with URL encoding
const urlEncodedParams = Object.entries(params)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
  .join('&');

console.log('\nWith URL encoding:');
console.log('URL encoded params:', urlEncodedParams);

const urlEncodedHash = crypto
  .createHmac('sha256', SHOPIFY_API_SECRET)
  .update(urlEncodedParams)
  .digest('hex');

console.log('URL encoded HMAC:', urlEncodedHash);
console.log('Match with URL encoding:', urlEncodedHash === receivedHmac); 