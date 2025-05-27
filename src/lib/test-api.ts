/**
 * Test script to verify all API endpoints
 * Run this script in development to ensure all endpoints are working
 */

async function testEndpoints() {
  const endpoints = [
    {
      name: 'Product Idea Analysis',
      url: '/api/product-idea/analyze',
      method: 'POST',
      body: {
        ideaText: 'Smart water bottle with hydration tracking',
        targetMarket: 'Health-conscious professionals',
        priceRange: '$30-50'
      }
    },
    {
      name: 'Blog Generation',
      url: '/api/autobloggen/generate',
      method: 'POST',
      body: {
        topic: 'Benefits of Smart Home Technology',
        targetAudience: 'Tech-savvy homeowners',
        tone: 'Professional',
        keywords: ['smart home', 'automation', 'IoT', 'convenience']
      }
    },
    {
      name: 'Traffic Analysis',
      url: '/api/traffictrace/analyze',
      method: 'POST',
      body: {
        url: 'https://example.com'
      }
    },
    {
      name: 'Campaign Creation',
      url: '/api/campaignwizard/create',
      method: 'POST',
      body: {
        name: 'Summer Sale 2024',
        platform: 'Facebook & Instagram',
        budget: 5000,
        startDate: '2024-06-01',
        endDate: '2024-06-30',
        targetAudience: 'Young professionals',
        goals: ['Brand Awareness', 'Sales']
      }
    }
  ];

  console.log('Starting API endpoint tests...\n');

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${endpoint.name}...`);
      
      const response = await fetch(endpoint.url, {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(endpoint.body)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ ${endpoint.name} - Success`);
      console.log('Response:', JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(`❌ ${endpoint.name} - Failed:`, error);
    }
    console.log('\n---\n');
  }

  console.log('API endpoint tests completed.');
}

// Only run in development
if (process.env.NODE_ENV === 'development') {
  testEndpoints();
} 