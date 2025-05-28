# BrandWisp E2E Testing Prompt for MCP Server

## Overview

This document provides comprehensive instructions for the MCP (Model Context Protocol) server to perform end-to-end testing of the BrandWisp web application using Playwright. The testing covers all modules from authentication to advanced features, with detailed bug reporting and functionality validation.

## Test Environment Setup

### Prerequisites
- **Application URL**: http://localhost:3000
- **Test User Credentials**:
  - Email: `shailesh.pilare@gmail.com`
  - Password: `12345678`
- **Browser Support**: Chrome, Firefox, Safari, Edge
- **Mobile Testing**: Required for responsive design validation

### Test Execution Command
```bash
# Run all tests
npx playwright test

# Run specific module
npx playwright test tests/01-authentication.spec.ts

# Run with custom reporter
npx playwright test --reporter=html

# Run comprehensive test suite
npx tsx tests/run-all-tests.ts
```

## Testing Scope & Modules

### Phase 1: Authentication & User Management
**Test File**: `tests/01-authentication.spec.ts`

#### Test Cases:
1. **Homepage Loading**
   - Verify application loads correctly
   - Check for main navigation elements
   - Validate page title and branding
   - Screenshot: `test-results/homepage.png`

2. **Login Flow Testing**
   - Navigate to login page
   - Verify form elements (email, password, submit button)
   - Test valid credentials login
   - Verify redirect to dashboard
   - Test session persistence across page refreshes
   - Screenshot: `test-results/login-success.png`

3. **Invalid Credentials Handling**
   - Test with incorrect email/password combinations
   - Verify error message display
   - Ensure user remains on login page
   - Screenshot: `test-results/login-error.png`

4. **Logout Functionality**
   - Locate and click logout button/menu
   - Verify redirect to login/home page
   - Confirm session termination
   - Screenshot: `test-results/logout-success.png`

5. **Social Authentication**
   - Check for Google, Facebook, Shopify login options
   - Verify OAuth redirect functionality
   - Screenshot: `test-results/social-login-options.png`

6. **Password Reset Flow**
   - Access forgot password functionality
   - Test email input and submission
   - Screenshot: `test-results/forgot-password.png`

### Phase 2: Store Registration & Management
**Test File**: `tests/02-store-registration.spec.ts`

#### Test Cases:
1. **Store Management Navigation**
   - Access store management section from dashboard
   - Verify store connection interface
   - Screenshot: `test-results/store-management.png`

2. **Shopify Store Connection**
   - Initiate Shopify connection flow
   - Test OAuth redirect or form submission
   - Verify store URL input validation
   - Handle connection success/failure
   - Screenshot: `test-results/shopify-connection-form.png`

3. **Amazon Store Connection**
   - Test Amazon seller account connection
   - Verify marketplace selection
   - Handle API credentials input
   - Screenshot: `test-results/amazon-connection-form.png`

4. **Etsy Store Connection**
   - Test Etsy shop connection
   - Verify OAuth flow
   - Handle shop name validation
   - Screenshot: `test-results/etsy-connection-form.png`

5. **Connected Stores Display**
   - Verify connected stores list
   - Check store status indicators
   - Validate store information display
   - Screenshot: `test-results/connected-stores.png`

6. **Store Disconnection**
   - Test store removal functionality
   - Handle confirmation dialogs
   - Verify successful disconnection
   - Screenshot: `test-results/store-disconnection.png`

7. **Store Settings Management**
   - Access store configuration options
   - Test sync frequency settings
   - Verify auto-import toggles
   - Screenshot: `test-results/store-settings.png`

8. **OAuth Security Validation**
   - Monitor OAuth request parameters
   - Verify security measures (client_id, redirect_uri, scope)
   - Screenshot: `test-results/oauth-security-check.png`

### Phase 3: AutoBlogGen Module
**Test File**: `tests/03-autobloggen.spec.ts`

#### Test Cases:
1. **Module Navigation**
   - Access AutoBlogGen from dashboard
   - Verify module interface loading
   - Screenshot: `test-results/autobloggen-module.png`

2. **Blog Generation Options**
   - Verify product-based generation option
   - Check topic-based generation option
   - Validate AI generation buttons
   - Screenshot: `test-results/blog-generation-options.png`

3. **Product-Based Blog Generation**
   - Select product from store inventory
   - Initiate blog generation
   - Wait for AI processing completion
   - Verify generated content quality
   - Screenshot: `test-results/product-blog-generation.png`

4. **Topic-Based Blog Generation**
   - Input custom topic: "Best practices for e-commerce product photography"
   - Select tone and length options
   - Generate blog content
   - Validate content relevance and quality
   - Screenshot: `test-results/topic-blog-generation.png`

5. **Blog Content Display & Editing**
   - Verify blog editor interface
   - Test content editing functionality
   - Check formatting options (bold, italic)
   - Test save functionality
   - Screenshot: `test-results/blog-editing.png`

6. **WordPress Publishing**
   - Access publishing options
   - Configure WordPress connection
   - Test publishing workflow
   - Screenshot: `test-results/wordpress-publishing.png`

7. **Medium Publishing**
   - Test Medium API integration
   - Verify authentication flow
   - Handle publishing confirmation
   - Screenshot: `test-results/medium-publishing.png`

8. **Shopify Blog Publishing**
   - Select connected Shopify store
   - Test blog publishing to Shopify
   - Verify successful publication
   - Screenshot: `test-results/shopify-blog-publishing.png`

9. **SEO Optimization Features**
   - Access SEO settings
   - Test meta title and description input
   - Verify keyword suggestions
   - Check SEO score calculation
   - Screenshot: `test-results/seo-optimization.png`

10. **Blog Management Interface**
    - View drafts and published blogs
    - Test blog editing and deletion
    - Verify bulk operations
    - Screenshot: `test-results/blog-management.png`

### Phase 4: VisionTagger Module
**Test File**: `tests/04-visiontagger.spec.ts`

#### Test Cases:
1. **Module Access**
   - Navigate to VisionTagger module
   - Verify interface loading
   - Screenshot: `test-results/visiontagger-module.png`

2. **Image Upload Interface**
   - Test file upload input
   - Verify drag-and-drop functionality
   - Check supported file types (JPG, PNG, JPEG)
   - Screenshot: `test-results/image-upload-interface.png`

3. **Image Upload Functionality**
   - Upload test product images
   - Verify upload success indicators
   - Check image preview display
   - Screenshot: `test-results/image-upload-test.png`

4. **Product Image Selection**
   - Access store product images
   - Select images for analysis
   - Verify image grid display
   - Screenshot: `test-results/product-image-selection.png`

5. **AI-Powered Image Analysis**
   - Trigger image analysis
   - Monitor processing indicators
   - Wait for analysis completion
   - Screenshot: `test-results/ai-image-analysis.png`

6. **AI-Generated Tags**
   - Verify tag generation quality
   - Check confidence scores
   - Validate tag relevance (minimum 2 characters)
   - Screenshot: `test-results/ai-generated-tags.png`

7. **SEO Suggestions**
   - Access SEO optimization features
   - Verify alt text suggestions
   - Check title and description recommendations
   - Test keyword suggestions
   - Screenshot: `test-results/seo-suggestions.png`

8. **Alt Text Generation**
   - Generate accessibility-compliant alt text
   - Verify descriptive quality (minimum 15 characters)
   - Check accessibility scoring
   - Screenshot: `test-results/alt-text-generation.png`

9. **Bulk Image Processing**
   - Select multiple images
   - Initiate bulk analysis
   - Monitor progress indicators
   - Verify batch processing completion
   - Screenshot: `test-results/bulk-image-processing.png`

10. **Analysis Results & Insights**
    - Review object detection results
    - Check color analysis
    - Verify text detection
    - Examine brand detection
    - Screenshot: `test-results/analysis-results.png`

11. **Tag Editing & Customization**
    - Add custom tags
    - Edit existing tags
    - Remove unwanted tags
    - Screenshot: `test-results/tag-editing.png`

12. **Export Functionality**
    - Test CSV export
    - Verify JSON export
    - Check copy-to-clipboard feature
    - Screenshot: `test-results/export-functionality.png`

### Phase 5: ProductPulse Module
**Test File**: `tests/05-productpulse.spec.ts`

#### Test Cases:
1. **Analytics Dashboard**
   - Access ProductPulse module
   - Verify dashboard loading
   - Check data visualization components
   - Screenshot: `test-results/productpulse-dashboard.png`

2. **Product Selection & Filtering**
   - Test product filtering options
   - Verify store-based filtering
   - Check category and date filters
   - Screenshot: `test-results/product-filtering.png`

3. **Performance Metrics**
   - Verify sales analytics
   - Check conversion rate displays
   - Validate traffic metrics
   - Screenshot: `test-results/performance-metrics.png`

4. **SEO Analysis**
   - Review product SEO scores
   - Check keyword rankings
   - Verify optimization suggestions
   - Screenshot: `test-results/seo-analysis.png`

5. **Review Sentiment Analysis**
   - Access customer review analysis
   - Verify sentiment scoring
   - Check review categorization
   - Screenshot: `test-results/sentiment-analysis.png`

6. **Store Comparison**
   - Compare performance across stores
   - Verify comparative analytics
   - Check benchmark displays
   - Screenshot: `test-results/store-comparison.png`

7. **Export & Reporting**
   - Test data export functionality
   - Verify report generation
   - Check PDF/CSV downloads
   - Screenshot: `test-results/export-reports.png`

### Phase 6: CampaignWizard Module
**Test File**: `tests/06-campaignwizard.spec.ts`

#### Test Cases:
1. **Module Navigation**
   - Access CampaignWizard module
   - Verify interface loading
   - Screenshot: `test-results/campaignwizard-module.png`

2. **Video Generation Interface**
   - Check template selection grid
   - Verify platform options (Facebook, Instagram, YouTube, TikTok, LinkedIn)
   - Test duration slider (30-60 seconds)
   - Screenshot: `test-results/video-generation-interface.png`

3. **Asset Upload**
   - Test image/logo upload functionality
   - Verify drag-and-drop interface
   - Check file type validation
   - Screenshot: `test-results/asset-upload.png`

4. **Content Customization**
   - Input headline, description, brand name
   - Test call-to-action customization
   - Verify brand color selection
   - Screenshot: `test-results/content-customization.png`

5. **Video Generation Process**
   - Initiate video generation with Remotion
   - Monitor processing indicators
   - Wait for generation completion
   - Screenshot: `test-results/video-generation-process.png`

6. **Generated Video Preview**
   - Verify video preview functionality
   - Check platform-specific dimensions
   - Test video quality assessment
   - Screenshot: `test-results/video-preview.png`

7. **Publishing Options**
   - Test multi-platform publishing
   - Verify scheduling functionality
   - Check caption and hashtag input
   - Screenshot: `test-results/publishing-options.png`

8. **Video Library Management**
   - Access generated video library
   - Test video organization
   - Verify performance metrics
   - Screenshot: `test-results/video-library.png`

### Phase 7: TrafficTrace Module
**Test File**: `tests/07-traffictrace.spec.ts`

#### Test Cases:
1. **Analytics Dashboard**
   - Access TrafficTrace module
   - Verify real-time data display
   - Check dashboard widgets
   - Screenshot: `test-results/traffictrace-dashboard.png`

2. **Website Tracking Setup**
   - Test tracking code generation
   - Verify installation instructions
   - Check tracking validation
   - Screenshot: `test-results/tracking-setup.png`

3. **Real-Time Visitor Monitoring**
   - Verify live visitor display
   - Check visitor location mapping
   - Test real-time updates
   - Screenshot: `test-results/realtime-monitoring.png`

4. **Traffic Analytics**
   - Review traffic source analysis
   - Check page performance metrics
   - Verify bounce rate calculations
   - Screenshot: `test-results/traffic-analytics.png`

5. **Conversion Tracking**
   - Test goal setup and tracking
   - Verify conversion funnel analysis
   - Check e-commerce tracking
   - Screenshot: `test-results/conversion-tracking.png`

6. **Geographic Analytics**
   - Review visitor location data
   - Check country/region breakdowns
   - Verify geographic visualizations
   - Screenshot: `test-results/geographic-analytics.png`

7. **Device & Browser Analytics**
   - Check device type analysis
   - Verify browser usage statistics
   - Test mobile vs desktop metrics
   - Screenshot: `test-results/device-analytics.png`

8. **Report Generation**
   - Generate custom reports
   - Test date range selection
   - Verify export functionality
   - Screenshot: `test-results/report-generation.png`

### Phase 8: ProductIdeaGenie Module
**Test File**: `tests/08-productideagenie.spec.ts`

#### Test Cases:
1. **Module Access**
   - Navigate to ProductIdeaGenie
   - Verify interface loading
   - Screenshot: `test-results/productideagenie-module.png`

2. **Text-Based Idea Analysis**
   - Input product idea: "Smart home fitness mirror with AI personal trainer"
   - Set target market and price range
   - Initiate AI analysis
   - Verify analysis results quality
   - Screenshot: `test-results/text-idea-analysis.png`

3. **Image-Based Analysis**
   - Upload product sketch or image
   - Provide basic product details
   - Generate market analysis
   - Check trend signals and insights
   - Screenshot: `test-results/image-idea-analysis.png`

4. **Market Potential Assessment**
   - Review market size estimates
   - Check competition analysis
   - Verify demand indicators
   - Screenshot: `test-results/market-assessment.png`

5. **Trend Signal Evaluation**
   - Analyze trend indicators
   - Check market timing assessment
   - Verify growth projections
   - Screenshot: `test-results/trend-analysis.png`

6. **Competitor Analysis**
   - Review competitor landscape
   - Check pricing analysis
   - Verify differentiation opportunities
   - Screenshot: `test-results/competitor-analysis.png`

7. **Idea Management**
   - Save analyzed ideas
   - Access saved ideas library
   - Test idea deletion and organization
   - Screenshot: `test-results/idea-management.png`

### Phase 9: Dashboard Overview
**Test File**: `tests/09-dashboard-overview.spec.ts`

#### Test Cases:
1. **Main Dashboard Loading**
   - Verify dashboard loads completely
   - Check all widget displays
   - Test responsive design
   - Screenshot: `test-results/main-dashboard.png`

2. **Navigation Testing**
   - Test navigation between all modules
   - Verify breadcrumb functionality
   - Check deep linking capabilities
   - Screenshot: `test-results/navigation-test.png`

3. **Real-Time Data Display**
   - Verify live data updates
   - Check refresh functionality
   - Test data synchronization
   - Screenshot: `test-results/realtime-data.png`

4. **Widget Customization**
   - Test dashboard widget arrangement
   - Verify customization options
   - Check widget preferences saving
   - Screenshot: `test-results/widget-customization.png`

### Phase 10: Cross-Module Integration
**Test File**: `tests/10-integration.spec.ts`

#### Test Cases:
1. **Data Flow Verification**
   - Test data consistency across modules
   - Verify store data synchronization
   - Check product data availability
   - Screenshot: `test-results/data-flow.png`

2. **Module Interconnectivity**
   - Test navigation between modules
   - Verify shared data access
   - Check cross-module functionality
   - Screenshot: `test-results/module-integration.png`

3. **User Preferences Persistence**
   - Test settings synchronization
   - Verify preference saving
   - Check cross-module consistency
   - Screenshot: `test-results/preferences-persistence.png`

## Error Handling & Edge Cases

### Network Error Testing
- Simulate network disconnection
- Test offline behavior
- Verify error messages and recovery
- Check retry mechanisms

### Data Validation Testing
- Test with invalid inputs
- Verify form validation
- Check file upload restrictions
- Test API rate limiting

### Performance Testing
- Monitor page load times (< 3 seconds target)
- Test with large datasets
- Verify memory usage
- Check for memory leaks

## Mobile & Responsive Testing

### Mobile Interface Testing
- Test on mobile viewport sizes (Pixel 5, iPhone 12)
- Verify touch interactions
- Check responsive design
- Test mobile-specific features

### Cross-Browser Testing
- Test on Chrome, Firefox, Safari, Edge
- Verify consistent behavior
- Check for browser-specific issues

## Bug Reporting Requirements

### For Each Test, Record:

1. **Test Case Details**
   - Module name
   - Specific functionality tested
   - Steps performed
   - Expected vs actual results

2. **Bug Information** (if found)
   - **Severity Level**: Critical, High, Medium, Low
   - **Reproduction Steps**: Detailed step-by-step instructions
   - **Screenshots/Videos**: Visual evidence of issues
   - **Browser Information**: Browser type, version, device
   - **Console Errors**: JavaScript errors and warnings
   - **Network Requests**: Failed API calls or slow responses

3. **Performance Metrics**
   - Page load times
   - API response times
   - Memory usage
   - CPU utilization

### Bug Classification:

- **Critical**: Application crashes, data loss, security vulnerabilities
- **High**: Core functionality broken, major features unusable
- **Medium**: Minor functionality issues, UI inconsistencies
- **Low**: Cosmetic issues, minor usability problems

## Success Criteria

### Functional Requirements:
- ✅ All authentication flows work correctly
- ✅ Store connection and management functions properly
- ✅ All modules load and display data correctly
- ✅ Core functionality in each module works as expected
- ✅ Error handling is graceful and informative

### Performance Requirements:
- ✅ Page load times < 3 seconds
- ✅ API response times < 2 seconds
- ✅ No memory leaks detected
- ✅ Responsive design maintained

### Quality Requirements:
- ✅ No critical bugs or security issues
- ✅ Cross-browser compatibility
- ✅ Mobile responsiveness
- ✅ Accessibility compliance

## Test Data Requirements

### Test Credentials:
- **Primary User**: shailesh.pilare@gmail.com / 12345678
- **Test Stores**: Create test store connections if needed
- **Sample Images**: Use provided test assets for upload testing
- **Test Content**: Generate sample content for blog and video creation

### Data Isolation:
- Ensure test data doesn't interfere with production
- Use test-specific prefixes for generated content
- Clean up test data after execution

## Reporting Format

### Generate Comprehensive Test Report Including:

1. **Executive Summary**
   - Overall test results
   - Success rate percentage
   - Critical issues summary

2. **Test Coverage Statistics**
   - Total tests executed
   - Pass/fail breakdown by module
   - Test execution duration

3. **Detailed Test Results**
   - Module-by-module results
   - Individual test case outcomes
   - Performance metrics

4. **Bug Report with Severity Classification**
   - Critical issues requiring immediate attention
   - High-priority bugs affecting core functionality
   - Medium and low-priority issues

5. **Performance Analysis**
   - Page load time analysis
   - API response time metrics
   - Resource usage statistics

6. **Recommendations for Improvements**
   - Priority fixes required
   - Performance optimization suggestions
   - User experience enhancements

7. **Screenshots and Evidence**
   - Visual proof of issues
   - Success state screenshots
   - Error state documentation

## Test Execution Instructions

### Prerequisites Check:
1. Verify BrandWisp application is running on http://localhost:3000
2. Ensure test user account exists and is accessible
3. Confirm all required services (Firebase, APIs) are operational
4. Check browser installations and Playwright setup

### Execution Steps:
1. **Setup Phase**:
   ```bash
   cd /path/to/brandwisp-web-101
   npm install
   npx playwright install
   ```

2. **Run Comprehensive Test Suite**:
   ```bash
   npx tsx tests/run-all-tests.ts
   ```

3. **Individual Module Testing**:
   ```bash
   npx playwright test tests/01-authentication.spec.ts
   npx playwright test tests/02-store-registration.spec.ts
   # ... continue for each module
   ```

4. **Generate Reports**:
   ```bash
   npx playwright show-report
   ```

### Post-Execution:
1. Review generated reports in `test-results/` directory
2. Analyze screenshots for visual verification
3. Document any critical issues found
4. Provide recommendations for fixes
5. Generate final comprehensive report

## Expected Deliverables

1. **Test Execution Report** (`test-results/brandwisp-test-report.md`)
2. **HTML Test Report** (`test-results/html-report/index.html`)
3. **Screenshots Collection** (`test-results/*.png`)
4. **Performance Metrics** (JSON format)
5. **Bug Report** (Detailed with severity classification)
6. **Recommendations Document** (Priority fixes and improvements)

---

**Note**: This comprehensive testing suite is designed to validate all aspects of the BrandWisp application. Execute tests in a controlled environment and ensure proper documentation of all findings for development team review and action. 