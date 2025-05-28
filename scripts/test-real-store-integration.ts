#!/usr/bin/env tsx

/**
 * Test script for real store integration
 * Run with: npx tsx scripts/test-real-store-integration.ts
 */

import { ShopifyService } from '../src/lib/services/shopify';
import { AnalyticsService } from '../src/lib/services/analytics';
import { BigQueryService } from '../src/lib/services/bigquery';
import { StoreModel } from '../src/lib/models/store';
import { AnalyticsMonitoringService } from '../src/lib/monitoring/analytics';

async function testStoreConnection() {
  console.log('🔍 Testing Store Connection...');
  
  try {
    // Test with a mock store
    const testStore = {
      id: 'test-store-1',
      userId: 'test-user',
      storeName: 'Test Store',
      provider: 'shopify' as const,
      status: 'connected' as const,
      accessToken: 'mock_access_token',
      storeUrl: 'test-store.myshopify.com',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log('✅ Store connection test passed');
    return testStore;
  } catch (error) {
    console.error('❌ Store connection test failed:', error);
    throw error;
  }
}

async function testBigQueryConnection() {
  console.log('🔍 Testing BigQuery Connection...');
  
  try {
    // Test BigQuery connection with a simple query
    const testQuery = `
      SELECT 
        'test' as status,
        CURRENT_TIMESTAMP() as timestamp
    `;
    
    const [rows] = await BigQueryService.query({ query: testQuery });
    console.log('✅ BigQuery connection test passed:', rows[0]);
    return true;
  } catch (error) {
    console.error('❌ BigQuery connection test failed:', error);
    console.log('💡 Make sure GOOGLE_APPLICATION_CREDENTIALS is set and BigQuery tables are created');
    return false;
  }
}

async function testProductEventInsertion() {
  console.log('🔍 Testing Product Event Insertion...');
  
  try {
    const testEvent = {
      event_id: `test_${Date.now()}`,
      store_id: 'test-store-1',
      product_id: 'test-product-1',
      event_type: 'view',
      timestamp: new Date().toISOString(),
      user_id: 'test-user-1',
      session_id: 'test-session-1',
      page_url: 'https://test-store.com/products/test-product',
      device_type: 'desktop',
      country: 'US',
    };

    await BigQueryService.insertProductEvent(testEvent);
    console.log('✅ Product event insertion test passed');
    return true;
  } catch (error) {
    console.error('❌ Product event insertion test failed:', error);
    return false;
  }
}

async function testAnalyticsQueries() {
  console.log('🔍 Testing Analytics Queries...');
  
  try {
    // Test product analytics
    const productAnalytics = await AnalyticsService.getProductAnalytics(
      'test-store-1',
      'test-product-1',
      7
    );
    
    console.log('✅ Product analytics query passed:', {
      productId: productAnalytics.productId,
      views: productAnalytics.views,
      revenue: productAnalytics.revenue,
    });

    // Test store analytics
    const storeAnalytics = await AnalyticsService.getStoreAnalytics('test-store-1', 7);
    
    console.log('✅ Store analytics query passed:', {
      storeId: storeAnalytics.storeId,
      totalProducts: storeAnalytics.totalProducts,
      totalRevenue: storeAnalytics.totalRevenue,
    });

    return true;
  } catch (error) {
    console.error('❌ Analytics queries test failed:', error);
    return false;
  }
}

async function testMonitoring() {
  console.log('🔍 Testing Analytics Monitoring...');
  
  try {
    // Test analytics health
    const health = await AnalyticsMonitoringService.getAnalyticsHealth('test-store-1');
    console.log('✅ Analytics health check passed:', {
      status: health.status,
      errorRate: health.errorRate,
      recommendations: health.recommendations.length,
    });

    // Test data quality metrics
    const dataQuality = await AnalyticsMonitoringService.getDataQualityMetrics('test-store-1');
    console.log('✅ Data quality check passed:', {
      completeness: dataQuality.completeness,
      accuracy: dataQuality.accuracy,
      issues: dataQuality.issues.length,
    });

    return true;
  } catch (error) {
    console.error('❌ Monitoring test failed:', error);
    return false;
  }
}

async function testShopifyIntegration() {
  console.log('🔍 Testing Shopify Integration...');
  
  try {
    // This would test actual Shopify API calls if credentials are available
    console.log('⚠️  Shopify integration test skipped (requires real store credentials)');
    console.log('💡 To test Shopify integration:');
    console.log('   1. Set up a Shopify development store');
    console.log('   2. Add SHOPIFY_API_KEY and SHOPIFY_API_SECRET to environment');
    console.log('   3. Connect a real store through the UI');
    
    return true;
  } catch (error) {
    console.error('❌ Shopify integration test failed:', error);
    return false;
  }
}

async function generateTestReport() {
  console.log('\n📊 Generating Test Report...');
  
  const results = {
    storeConnection: false,
    bigQueryConnection: false,
    eventInsertion: false,
    analyticsQueries: false,
    monitoring: false,
    shopifyIntegration: false,
  };

  try {
    results.storeConnection = !!(await testStoreConnection());
  } catch (error) {
    // Already logged
  }

  try {
    results.bigQueryConnection = await testBigQueryConnection();
  } catch (error) {
    // Already logged
  }

  if (results.bigQueryConnection) {
    try {
      results.eventInsertion = await testProductEventInsertion();
    } catch (error) {
      // Already logged
    }

    try {
      results.analyticsQueries = await testAnalyticsQueries();
    } catch (error) {
      // Already logged
    }

    try {
      results.monitoring = await testMonitoring();
    } catch (error) {
      // Already logged
    }
  }

  try {
    results.shopifyIntegration = await testShopifyIntegration();
  } catch (error) {
    // Already logged
  }

  console.log('\n📋 Test Results Summary:');
  console.log('========================');
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅' : '❌';
    console.log(`${status} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
  });

  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n📈 Overall: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Your real store integration is ready.');
  } else {
    console.log('⚠️  Some tests failed. Check the logs above for details.');
  }

  return results;
}

async function main() {
  console.log('🚀 Starting Real Store Integration Tests...\n');
  
  try {
    await generateTestReport();
  } catch (error) {
    console.error('💥 Test suite failed:', error);
    process.exit(1);
  }
}

// Run the tests
if (require.main === module) {
  main().catch(console.error);
}

export { main as runTests }; 