import { FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting BrandWisp E2E Test Suite Global Teardown');
  
  try {
    // Generate test summary report
    const resultsPath = path.join(__dirname, '../test-results/results.json');
    
    if (fs.existsSync(resultsPath)) {
      const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
      
      console.log('\n📊 Test Execution Summary:');
      console.log(`Total Tests: ${results.stats?.total || 0}`);
      console.log(`Passed: ${results.stats?.passed || 0}`);
      console.log(`Failed: ${results.stats?.failed || 0}`);
      console.log(`Skipped: ${results.stats?.skipped || 0}`);
      console.log(`Duration: ${results.stats?.duration || 0}ms`);
      
      // Log failed tests
      if (results.stats?.failed > 0) {
        console.log('\n❌ Failed Tests:');
        results.suites?.forEach((suite: any) => {
          suite.specs?.forEach((spec: any) => {
            spec.tests?.forEach((test: any) => {
              if (test.results?.some((result: any) => result.status === 'failed')) {
                console.log(`  - ${suite.title}: ${test.title}`);
              }
            });
          });
        });
      }
    }

    // Clean up temporary files if needed
    const authFile = path.join(__dirname, '../test-results/auth.json');
    if (fs.existsSync(authFile)) {
      console.log('🗑️  Cleaning up authentication state');
      // Keep auth file for debugging, but could delete it here if needed
      // fs.unlinkSync(authFile);
    }

    // Generate final report
    const reportPath = path.join(__dirname, '../test-results/final-report.txt');
    const reportContent = `
BrandWisp E2E Test Suite - Final Report
======================================
Generated: ${new Date().toISOString()}

Test Results Summary:
- HTML Report: test-results/html-report/index.html
- JSON Results: test-results/results.json
- JUnit XML: test-results/junit.xml

Screenshots and videos are available in the test-results directory.

For detailed analysis, open the HTML report in your browser:
file://${path.resolve(__dirname, '../test-results/html-report/index.html')}
`;

    fs.writeFileSync(reportPath, reportContent);
    console.log('📄 Final report generated at test-results/final-report.txt');

  } catch (error) {
    console.error('❌ Global teardown error:', error);
  }

  console.log('✅ Global teardown completed');
}

export default globalTeardown; 