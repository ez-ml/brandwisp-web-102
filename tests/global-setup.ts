import { chromium, FullConfig } from '@playwright/test';
import path from 'path';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting BrandWisp E2E Test Suite Global Setup');
  
  const { baseURL } = config.projects[0].use;
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Wait for the application to be ready
    console.log('⏳ Waiting for application to be ready...');
    await page.goto(baseURL || 'http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Check if the application is running
    const title = await page.title();
    console.log(`✅ Application is ready. Title: ${title}`);

    // Perform authentication and save state
    console.log('🔐 Performing authentication...');
    
    // Navigate to login page
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Fill in login credentials
    await page.fill('input[type="email"], input[name="email"], #email', 'shailesh.pilare@gmail.com');
    await page.fill('input[type="password"], input[name="password"], #password', '12345678');
    
    // Click login button
    await page.click('button[type="submit"], button:has-text("Sign in"), button:has-text("Login")');
    
    // Wait for successful login (redirect to dashboard)
    await page.waitForURL('**/dashboard**', { timeout: 30000 });
    await page.waitForLoadState('networkidle');
    
    console.log('✅ Authentication successful');

    // Save authenticated state
    const authFile = path.join(__dirname, '../test-results/auth.json');
    await page.context().storageState({ path: authFile });
    console.log('💾 Authentication state saved');

    // Take a screenshot of the dashboard for verification
    await page.screenshot({ 
      path: path.join(__dirname, '../test-results/dashboard-ready.png'),
      fullPage: true 
    });

  } catch (error) {
    console.error('❌ Global setup failed:', error);
    
    // Take screenshot of failure
    await page.screenshot({ 
      path: path.join(__dirname, '../test-results/setup-failure.png'),
      fullPage: true 
    });
    
    throw error;
  } finally {
    await browser.close();
  }

  console.log('🎉 Global setup completed successfully');
}

export default globalSetup; 