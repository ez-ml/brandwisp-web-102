// Test script to verify blog generation APIs
const https = require('https');
const http = require('http');

function makeRequest(url, options) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http;
    const req = protocol.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, json: () => jsonData });
        } catch (e) {
          resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, text: () => data });
        }
      });
    });
    req.on('error', reject);
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function testBlogGeneration() {
  try {
    console.log('🧪 Testing Blog Generation APIs...\n');
    
    // Test 1: Product-based blog generation
    console.log('1️⃣ Testing Product-Based Blog Generation:');
    const productBlogResponse = await makeRequest('http://localhost:3000/api/blog/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_name: 'Clay Plant Pot',
        product_description: 'Beautiful handcrafted clay plant pot perfect for indoor plants',
        product_features: ['Handcrafted', 'Eco-friendly', 'Drainage holes'],
        keywords: ['plant pot', 'indoor gardening', 'home decor'],
        blog_objective: 'Product Promotion',
        tone: 'Friendly & Persuasive',
        cta: 'Shop Now',
        length: 'Medium',
        target_audience: 'Home Gardening Enthusiasts',
        store_name: 'SS Armatics',
        product_price: '29.99'
      })
    });
    
    if (productBlogResponse.ok) {
      const productBlogData = productBlogResponse.json();
      console.log('   ✅ Product blog generation API working');
      console.log(`   📝 Generated title: "${productBlogData.title}"`);
      console.log(`   📊 Word count: ${productBlogData.metadata?.wordCount || 'N/A'}`);
    } else {
      const error = productBlogResponse.text();
      console.log('   ❌ Product blog generation failed:', productBlogResponse.status);
      console.log('   Error:', error);
    }
    
    console.log('');
    
    // Test 2: Topic-based blog generation
    console.log('2️⃣ Testing Topic-Based Blog Generation:');
    const topicBlogResponse = await makeRequest('http://localhost:3000/api/autobloggen/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: 'Indoor Plant Care Tips',
        targetAudience: 'Plant Enthusiasts',
        tone: 'Friendly & Informative',
        keywords: ['plant care', 'indoor plants', 'gardening tips'],
        blog_objective: 'Educational',
        cta: 'Start Your Plant Journey',
        length: 'Medium'
      })
    });
    
    if (topicBlogResponse.ok) {
      const topicBlogData = topicBlogResponse.json();
      console.log('   ✅ Topic blog generation API working');
      console.log(`   📝 Generated title: "${topicBlogData.title}"`);
      console.log(`   📊 Word count: ${topicBlogData.metadata?.wordCount || 'N/A'}`);
    } else {
      const error = topicBlogResponse.text();
      console.log('   ❌ Topic blog generation failed:', topicBlogResponse.status);
      console.log('   Error:', error);
    }
    
    console.log('\n✅ Blog generation API tests complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Make sure the development server is running:');
      console.log('   npm run dev');
    }
  }
}

testBlogGeneration(); 