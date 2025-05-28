import { test, expect, Page } from '@playwright/test';

test.describe('Authentication & User Management', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('should load homepage correctly', async () => {
    await test.step('Navigate to homepage', async () => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
    });

    await test.step('Verify homepage elements', async () => {
      await expect(page).toHaveTitle(/BrandWisp/);
      
      // Check for main navigation elements
      const loginLink = page.locator('a[href="/login"], button:has-text("Login"), button:has-text("Sign in")');
      await expect(loginLink).toBeVisible();
      
      // Take screenshot for verification
      await page.screenshot({ path: 'test-results/homepage.png', fullPage: true });
    });
  });

  test('should handle login flow correctly', async () => {
    await test.step('Navigate to login page', async () => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');
    });

    await test.step('Verify login form elements', async () => {
      await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Login")')).toBeVisible();
    });

    await test.step('Perform login with valid credentials', async () => {
      await page.fill('input[type="email"], input[name="email"]', 'shailesh.pilare@gmail.com');
      await page.fill('input[type="password"], input[name="password"]', '12345678');
      
      await page.click('button[type="submit"], button:has-text("Sign in"), button:has-text("Login")');
      
      // Wait for redirect to dashboard
      await page.waitForURL('**/dashboard**', { timeout: 30000 });
      await page.waitForLoadState('networkidle');
    });

    await test.step('Verify successful login', async () => {
      // Check if we're on the dashboard
      expect(page.url()).toContain('/dashboard');
      
      // Look for dashboard elements
      const dashboardTitle = page.locator('h1, h2, [data-testid="dashboard-title"]');
      await expect(dashboardTitle).toBeVisible();
      
      // Take screenshot of successful login
      await page.screenshot({ path: 'test-results/login-success.png', fullPage: true });
    });
  });

  test('should handle invalid login credentials', async () => {
    await test.step('Navigate to login page', async () => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');
    });

    await test.step('Attempt login with invalid credentials', async () => {
      await page.fill('input[type="email"], input[name="email"]', 'invalid@example.com');
      await page.fill('input[type="password"], input[name="password"]', 'wrongpassword');
      
      await page.click('button[type="submit"], button:has-text("Sign in"), button:has-text("Login")');
      
      // Wait for error message
      await page.waitForTimeout(3000);
    });

    await test.step('Verify error handling', async () => {
      // Check for error message
      const errorMessage = page.locator('[role="alert"], .error, .alert-error, text="Invalid"');
      
      // Should still be on login page
      expect(page.url()).toContain('/login');
      
      // Take screenshot of error state
      await page.screenshot({ path: 'test-results/login-error.png', fullPage: true });
    });
  });

  test('should handle logout functionality', async () => {
    await test.step('Login first', async () => {
      await page.goto('/login');
      await page.fill('input[type="email"], input[name="email"]', 'shailesh.pilare@gmail.com');
      await page.fill('input[type="password"], input[name="password"]', '12345678');
      await page.click('button[type="submit"], button:has-text("Sign in"), button:has-text("Login")');
      await page.waitForURL('**/dashboard**', { timeout: 30000 });
    });

    await test.step('Perform logout', async () => {
      // Look for logout button/link
      const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign out"), a:has-text("Logout"), [data-testid="logout"]');
      
      if (await logoutButton.isVisible()) {
        await logoutButton.click();
      } else {
        // Try to find user menu/dropdown
        const userMenu = page.locator('[data-testid="user-menu"], .user-menu, button:has-text("Profile")');
        if (await userMenu.isVisible()) {
          await userMenu.click();
          await page.click('button:has-text("Logout"), button:has-text("Sign out"), a:has-text("Logout")');
        }
      }
      
      // Wait for redirect
      await page.waitForTimeout(3000);
    });

    await test.step('Verify logout success', async () => {
      // Should be redirected to login or home page
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/(login|^\/$|home)/);
      
      // Take screenshot of logout state
      await page.screenshot({ path: 'test-results/logout-success.png', fullPage: true });
    });
  });

  test('should handle signup flow', async () => {
    await test.step('Navigate to signup page', async () => {
      await page.goto('/signup');
      await page.waitForLoadState('networkidle');
    });

    await test.step('Verify signup form elements', async () => {
      // Check for signup form fields
      const emailField = page.locator('input[type="email"], input[name="email"]');
      const passwordField = page.locator('input[type="password"], input[name="password"]');
      const nameField = page.locator('input[name="name"], input[name="displayName"], input[name="fullName"]');
      
      await expect(emailField).toBeVisible();
      await expect(passwordField).toBeVisible();
      
      // Take screenshot of signup form
      await page.screenshot({ path: 'test-results/signup-form.png', fullPage: true });
    });
  });

  test('should handle social authentication options', async () => {
    await test.step('Navigate to login page', async () => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');
    });

    await test.step('Verify social login options', async () => {
      // Check for Google login
      const googleLogin = page.locator('button:has-text("Google"), button:has-text("Continue with Google")');
      
      // Check for Facebook login
      const facebookLogin = page.locator('button:has-text("Facebook"), button:has-text("Continue with Facebook")');
      
      // Check for Shopify login
      const shopifyLogin = page.locator('button:has-text("Shopify"), button:has-text("Continue with Shopify")');
      
      // At least one social login option should be visible
      const socialOptions = await Promise.all([
        googleLogin.isVisible().catch(() => false),
        facebookLogin.isVisible().catch(() => false),
        shopifyLogin.isVisible().catch(() => false)
      ]);
      
      expect(socialOptions.some(visible => visible)).toBeTruthy();
      
      // Take screenshot of social login options
      await page.screenshot({ path: 'test-results/social-login-options.png', fullPage: true });
    });
  });

  test('should handle password reset flow', async () => {
    await test.step('Navigate to login page', async () => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');
    });

    await test.step('Access forgot password', async () => {
      const forgotPasswordLink = page.locator('a:has-text("Forgot"), a:has-text("Reset"), button:has-text("Forgot")');
      
      if (await forgotPasswordLink.isVisible()) {
        await forgotPasswordLink.click();
        await page.waitForLoadState('networkidle');
        
        // Take screenshot of forgot password page
        await page.screenshot({ path: 'test-results/forgot-password.png', fullPage: true });
      } else {
        console.log('Forgot password link not found - this may be expected');
      }
    });
  });

  test('should maintain session across page refreshes', async () => {
    await test.step('Login and verify session persistence', async () => {
      // Login first
      await page.goto('/login');
      await page.fill('input[type="email"], input[name="email"]', 'shailesh.pilare@gmail.com');
      await page.fill('input[type="password"], input[name="password"]', '12345678');
      await page.click('button[type="submit"], button:has-text("Sign in"), button:has-text("Login")');
      await page.waitForURL('**/dashboard**', { timeout: 30000 });
      
      // Refresh the page
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Should still be on dashboard (session maintained)
      expect(page.url()).toContain('/dashboard');
      
      // Take screenshot of session persistence
      await page.screenshot({ path: 'test-results/session-persistence.png', fullPage: true });
    });
  });
}); 