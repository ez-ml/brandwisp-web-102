#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

interface TestResult {
  module: string;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  errors: string[];
}

class BrandWispTestRunner {
  private results: TestResult[] = [];
  private startTime: number = Date.now();

  constructor() {
    this.setupTestEnvironment();
  }

  private setupTestEnvironment() {
    console.log('🚀 BrandWisp E2E Test Suite - Comprehensive Testing');
    console.log('=' .repeat(60));
    console.log(`📅 Started at: ${new Date().toISOString()}`);
    console.log(`👤 Test User: shailesh.pilare@gmail.com`);
    console.log(`🌐 Base URL: http://localhost:3000`);
    console.log('=' .repeat(60));

    // Ensure test-results directory exists
    const testResultsDir = path.join(__dirname, '../test-results');
    if (!fs.existsSync(testResultsDir)) {
      fs.mkdirSync(testResultsDir, { recursive: true });
    }

    // Create test assets directory if it doesn't exist
    const testAssetsDir = path.join(__dirname, '../test-assets');
    if (!fs.existsSync(testAssetsDir)) {
      fs.mkdirSync(testAssetsDir, { recursive: true });
      this.createTestAssets(testAssetsDir);
    }
  }

  private createTestAssets(assetsDir: string) {
    console.log('📁 Creating test assets...');
    
    // Create a simple test image (1x1 pixel PNG)
    const testImageData = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00,
      0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, 0xE2, 0x21, 0xBC, 0x33,
      0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);
    
    fs.writeFileSync(path.join(assetsDir, 'test-product.jpg'), testImageData);
    fs.writeFileSync(path.join(assetsDir, 'test-logo.png'), testImageData);
    
    console.log('✅ Test assets created');
  }

  private async runTestModule(moduleName: string, testFile: string): Promise<TestResult> {
    console.log(`\n🧪 Testing ${moduleName} Module`);
    console.log('-' .repeat(40));
    
    const moduleStartTime = Date.now();
    let result: TestResult = {
      module: moduleName,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: 0,
      errors: []
    };

    try {
      // Run the specific test file
      const command = `npx playwright test ${testFile} --reporter=json --output-dir=test-results/${moduleName.toLowerCase()}`;
      
      console.log(`📋 Running: ${command}`);
      
      const output = execSync(command, { 
        encoding: 'utf8',
        cwd: path.join(__dirname, '..'),
        timeout: 300000 // 5 minutes timeout per module
      });

      // Parse results from JSON output
      const jsonResultPath = path.join(__dirname, '../test-results/results.json');
      if (fs.existsSync(jsonResultPath)) {
        const jsonResults = JSON.parse(fs.readFileSync(jsonResultPath, 'utf8'));
        result.passed = jsonResults.stats?.passed || 0;
        result.failed = jsonResults.stats?.failed || 0;
        result.skipped = jsonResults.stats?.skipped || 0;
      }

      console.log(`✅ ${moduleName} tests completed`);
      console.log(`   Passed: ${result.passed}, Failed: ${result.failed}, Skipped: ${result.skipped}`);

    } catch (error: any) {
      console.log(`❌ ${moduleName} tests failed`);
      result.errors.push(error.message);
      result.failed = 1; // Mark as failed if execution failed
      
      console.log(`   Error: ${error.message.substring(0, 100)}...`);
    }

    result.duration = Date.now() - moduleStartTime;
    return result;
  }

  public async runAllTests(): Promise<void> {
    const testModules = [
      { name: 'Authentication', file: '01-authentication.spec.ts' },
      { name: 'Store Registration', file: '02-store-registration.spec.ts' },
      { name: 'AutoBlogGen', file: '03-autobloggen.spec.ts' },
      { name: 'VisionTagger', file: '04-visiontagger.spec.ts' },
      { name: 'ProductPulse', file: '05-productpulse.spec.ts' },
      { name: 'CampaignWizard', file: '06-campaignwizard.spec.ts' },
      { name: 'TrafficTrace', file: '07-traffictrace.spec.ts' },
      { name: 'ProductIdeaGenie', file: '08-productideagenie.spec.ts' },
      { name: 'Dashboard Overview', file: '09-dashboard-overview.spec.ts' },
      { name: 'Cross-Module Integration', file: '10-integration.spec.ts' }
    ];

    console.log(`🎯 Running ${testModules.length} test modules...\n`);

    for (const module of testModules) {
      const result = await this.runTestModule(module.name, module.file);
      this.results.push(result);
      
      // Small delay between modules
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    this.generateFinalReport();
  }

  private generateFinalReport(): void {
    const totalDuration = Date.now() - this.startTime;
    const totalPassed = this.results.reduce((sum, r) => sum + r.passed, 0);
    const totalFailed = this.results.reduce((sum, r) => sum + r.failed, 0);
    const totalSkipped = this.results.reduce((sum, r) => sum + r.skipped, 0);
    const totalTests = totalPassed + totalFailed + totalSkipped;

    console.log('\n' + '=' .repeat(60));
    console.log('📊 BRANDWISP E2E TEST SUITE - FINAL REPORT');
    console.log('=' .repeat(60));
    console.log(`⏱️  Total Duration: ${Math.round(totalDuration / 1000)}s`);
    console.log(`📈 Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${totalPassed} (${Math.round((totalPassed / totalTests) * 100)}%)`);
    console.log(`❌ Failed: ${totalFailed} (${Math.round((totalFailed / totalTests) * 100)}%)`);
    console.log(`⏭️  Skipped: ${totalSkipped} (${Math.round((totalSkipped / totalTests) * 100)}%)`);
    console.log(`🎯 Success Rate: ${Math.round((totalPassed / (totalPassed + totalFailed)) * 100)}%`);

    console.log('\n📋 Module Breakdown:');
    console.log('-' .repeat(60));
    
    this.results.forEach(result => {
      const moduleTotal = result.passed + result.failed + result.skipped;
      const successRate = moduleTotal > 0 ? Math.round((result.passed / moduleTotal) * 100) : 0;
      const status = result.failed === 0 ? '✅' : '❌';
      
      console.log(`${status} ${result.module.padEnd(20)} | P:${result.passed.toString().padStart(2)} F:${result.failed.toString().padStart(2)} S:${result.skipped.toString().padStart(2)} | ${successRate}% | ${Math.round(result.duration / 1000)}s`);
    });

    // Generate detailed report file
    this.generateDetailedReport(totalDuration, totalTests, totalPassed, totalFailed, totalSkipped);

    // Show critical issues
    this.showCriticalIssues();

    console.log('\n📁 Detailed reports available in:');
    console.log(`   - HTML Report: test-results/html-report/index.html`);
    console.log(`   - JSON Results: test-results/results.json`);
    console.log(`   - Detailed Report: test-results/brandwisp-test-report.md`);
    console.log(`   - Screenshots: test-results/*.png`);

    console.log('\n🎉 BrandWisp E2E Test Suite Completed!');
    console.log('=' .repeat(60));
  }

  private generateDetailedReport(totalDuration: number, totalTests: number, totalPassed: number, totalFailed: number, totalSkipped: number): void {
    const reportPath = path.join(__dirname, '../test-results/brandwisp-test-report.md');
    
    const report = `# BrandWisp E2E Test Suite - Detailed Report

## Test Execution Summary

- **Execution Date**: ${new Date().toISOString()}
- **Total Duration**: ${Math.round(totalDuration / 1000)} seconds
- **Test User**: shailesh.pilare@gmail.com
- **Base URL**: http://localhost:3000

## Overall Results

| Metric | Count | Percentage |
|--------|-------|------------|
| Total Tests | ${totalTests} | 100% |
| Passed | ${totalPassed} | ${Math.round((totalPassed / totalTests) * 100)}% |
| Failed | ${totalFailed} | ${Math.round((totalFailed / totalTests) * 100)}% |
| Skipped | ${totalSkipped} | ${Math.round((totalSkipped / totalTests) * 100)}% |
| Success Rate | ${Math.round((totalPassed / (totalPassed + totalFailed)) * 100)}% | - |

## Module Results

| Module | Passed | Failed | Skipped | Success Rate | Duration |
|--------|--------|--------|---------|--------------|----------|
${this.results.map(result => {
  const moduleTotal = result.passed + result.failed + result.skipped;
  const successRate = moduleTotal > 0 ? Math.round((result.passed / moduleTotal) * 100) : 0;
  return `| ${result.module} | ${result.passed} | ${result.failed} | ${result.skipped} | ${successRate}% | ${Math.round(result.duration / 1000)}s |`;
}).join('\n')}

## Detailed Module Analysis

${this.results.map(result => `
### ${result.module}

- **Status**: ${result.failed === 0 ? '✅ PASSED' : '❌ FAILED'}
- **Tests Passed**: ${result.passed}
- **Tests Failed**: ${result.failed}
- **Tests Skipped**: ${result.skipped}
- **Duration**: ${Math.round(result.duration / 1000)} seconds
${result.errors.length > 0 ? `- **Errors**: \n${result.errors.map(error => `  - ${error}`).join('\n')}` : ''}
`).join('\n')}

## Test Coverage Areas

### ✅ Functional Areas Tested

1. **Authentication & User Management**
   - Login/logout flows
   - Session management
   - Social authentication
   - Password reset

2. **Store Registration & Management**
   - Shopify store connection
   - Amazon store connection
   - Etsy store connection
   - OAuth flow validation
   - Store disconnection

3. **AutoBlogGen Module**
   - Product-based blog generation
   - Topic-based blog generation
   - WordPress publishing
   - Medium publishing
   - Shopify blog publishing
   - SEO optimization

4. **VisionTagger Module**
   - Image upload and analysis
   - AI-powered tagging
   - SEO suggestions
   - Alt text generation
   - Bulk image processing

5. **ProductPulse Module**
   - Product analytics dashboard
   - Performance metrics
   - SEO analysis
   - Review sentiment analysis

6. **CampaignWizard Module**
   - Video generation with Remotion
   - Template selection
   - Asset upload
   - Platform-specific optimization

7. **TrafficTrace Module**
   - Website analytics dashboard
   - Traffic tracking
   - Conversion tracking
   - Report generation

8. **ProductIdeaGenie Module**
   - Product idea analysis
   - Market potential assessment
   - Trend signal evaluation

## Recommendations

${totalFailed > 0 ? `
### 🚨 Critical Issues to Address

${this.results.filter(r => r.failed > 0).map(result => `
- **${result.module}**: ${result.failed} failed test(s)
  ${result.errors.map(error => `  - ${error.substring(0, 100)}...`).join('\n')}
`).join('\n')}
` : '### ✅ All Tests Passed - No Critical Issues Found'}

### 🔧 General Recommendations

1. **Performance Optimization**: Monitor page load times and API response times
2. **Error Handling**: Ensure graceful error handling across all modules
3. **User Experience**: Verify responsive design and mobile compatibility
4. **Security**: Validate OAuth flows and authentication security
5. **Data Integrity**: Ensure data consistency across modules

## Next Steps

1. Review failed tests and fix underlying issues
2. Implement additional test coverage for edge cases
3. Set up continuous integration for automated testing
4. Monitor production metrics and user feedback
5. Regular regression testing for new features

---

*Report generated by BrandWisp E2E Test Suite*
*Generated at: ${new Date().toISOString()}*
`;

    fs.writeFileSync(reportPath, report);
    console.log(`📄 Detailed report saved to: ${reportPath}`);
  }

  private showCriticalIssues(): void {
    const failedModules = this.results.filter(r => r.failed > 0);
    
    if (failedModules.length > 0) {
      console.log('\n🚨 CRITICAL ISSUES FOUND:');
      console.log('-' .repeat(40));
      
      failedModules.forEach(module => {
        console.log(`❌ ${module.module}: ${module.failed} failed test(s)`);
        module.errors.forEach(error => {
          console.log(`   - ${error.substring(0, 80)}...`);
        });
      });
      
      console.log('\n🔧 RECOMMENDED ACTIONS:');
      console.log('1. Review failed test screenshots in test-results/');
      console.log('2. Check application logs for errors');
      console.log('3. Verify all required services are running');
      console.log('4. Ensure test data and credentials are valid');
      console.log('5. Run individual test modules for detailed debugging');
    } else {
      console.log('\n🎉 NO CRITICAL ISSUES FOUND!');
      console.log('All test modules passed successfully.');
    }
  }
}

// Main execution
async function main() {
  const runner = new BrandWispTestRunner();
  await runner.runAllTests();
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n⚠️  Test execution interrupted by user');
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('\n💥 Uncaught exception:', error.message);
  process.exit(1);
});

// Run the tests
if (require.main === module) {
  main().catch(error => {
    console.error('\n💥 Test runner failed:', error.message);
    process.exit(1);
  });
}

export default BrandWispTestRunner; 