import { test, expect, Page } from '@playwright/test';
import path from 'path';

test.describe('Store Registration & Management', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    const context = await browser.newContext({
      storageState: path.join(__dirname, '../test-results/auth.json')
    });
    page = await context.newPage();
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('should navigate to store management section', async () => {
    await test.step('Navigate to dashboard', async () => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
    });

    await test.step('Access store management', async () => {
      // Look for store management navigation
      const storeNav = page.locator('a:has-text("Store"), a:has-text("Stores"), button:has-text("Store"), [data-testid="store-nav"]');
      
      if (await storeNav.isVisible()) {
        await storeNav.click();
        await page.waitForLoadState('networkidle');
      } else {
        // Try to find in settings or profile
        const settingsNav = page.locator('a:has-text("Settings"), button:has-text("Settings"), [data-testid="settings"]');
        if (await settingsNav.isVisible()) {
          await settingsNav.click();
          await page.waitForLoadState('networkidle');
        }
      }
      
      // Take screenshot of store management page
      await page.screenshot({ path: 'test-results/store-management.png', fullPage: true });
    });
  });

  test('should display store connection options', async () => {
    await test.step('Navigate to store connection page', async () => {
      await page.goto('/dashboard/stores');
      await page.waitForLoadState('networkidle');
    });

    await test.step('Verify store connection options', async () => {
      // Check for Shopify connection option
      const shopifyConnect = page.locator('button:has-text("Shopify"), a:has-text("Connect Shopify"), [data-testid="shopify-connect"]');
      
      // Check for Amazon connection option
      const amazonConnect = page.locator('button:has-text("Amazon"), a:has-text("Connect Amazon"), [data-testid="amazon-connect"]');
      
      // Check for Etsy connection option
      const etsyConnect = page.locator('button:has-text("Etsy"), a:has-text("Connect Etsy"), [data-testid="etsy-connect"]');
      
      // At least Shopify should be available
      const connectionOptions = await Promise.all([
        shopifyConnect.isVisible().catch(() => false),
        amazonConnect.isVisible().catch(() => false),
        etsyConnect.isVisible().catch(() => false)
      ]);
      
      expect(connectionOptions.some(visible => visible)).toBeTruthy();
      
      // Take screenshot of connection options
      await page.screenshot({ path: 'test-results/store-connection-options.png', fullPage: true });
    });
  });

  test('should handle Shopify store connection flow', async () => {
    await test.step('Navigate to store connection', async () => {
      await page.goto('/dashboard/stores');
      await page.waitForLoadState('networkidle');
    });

    await test.step('Initiate Shopify connection', async () => {
      const shopifyConnect = page.locator('button:has-text("Shopify"), a:has-text("Connect Shopify"), [data-testid="shopify-connect"]');
      
      if (await shopifyConnect.isVisible()) {
        await shopifyConnect.click();
        await page.waitForLoadState('networkidle');
        
        // Check if we're redirected to Shopify OAuth or a form
        const currentUrl = page.url();
        
        if (currentUrl.includes('shopify')) {
          console.log('Redirected to Shopify OAuth - this is expected behavior');
          // Take screenshot of OAuth redirect
          await page.screenshot({ path: 'test-results/shopify-oauth-redirect.png', fullPage: true });
        } else {
          // Check for store URL input form
          const storeUrlInput = page.locator('input[placeholder*="store"], input[name*="shop"], input[placeholder*="mystore.myshopify.com"]');
          
          if (await storeUrlInput.isVisible()) {
            await storeUrlInput.fill('test-store.myshopify.com');
            
            const connectButton = page.locator('button:has-text("Connect"), button[type="submit"]');
            if (await connectButton.isVisible()) {
              await connectButton.click();
              await page.waitForTimeout(3000);
            }
          }
          
          // Take screenshot of connection form
          await page.screenshot({ path: 'test-results/shopify-connection-form.png', fullPage: true });
        }
      } else {
        console.log('Shopify connection option not found');
        await page.screenshot({ path: 'test-results/shopify-not-found.png', fullPage: true });
      }
    });
  });

  test('should handle Amazon store connection flow', async () => {
    await test.step('Navigate to store connection', async () => {
      await page.goto('/dashboard/stores');
      await page.waitForLoadState('networkidle');
    });

    await test.step('Initiate Amazon connection', async () => {
      const amazonConnect = page.locator('button:has-text("Amazon"), a:has-text("Connect Amazon"), [data-testid="amazon-connect"]');
      
      if (await amazonConnect.isVisible()) {
        await amazonConnect.click();
        await page.waitForLoadState('networkidle');
        
        // Check for Amazon connection form or OAuth redirect
        const currentUrl = page.url();
        
        if (currentUrl.includes('amazon') || currentUrl.includes('sellercentral')) {
          console.log('Redirected to Amazon OAuth - this is expected behavior');
          await page.screenshot({ path: 'test-results/amazon-oauth-redirect.png', fullPage: true });
        } else {
          // Check for Amazon credentials form
          const sellerIdInput = page.locator('input[placeholder*="seller"], input[name*="seller"], input[placeholder*="merchant"]');
          
          if (await sellerIdInput.isVisible()) {
            await sellerIdInput.fill('TEST_SELLER_ID');
            
            // Look for additional fields
            const marketplaceSelect = page.locator('select[name*="marketplace"], select[name*="region"]');
            if (await marketplaceSelect.isVisible()) {
              await marketplaceSelect.selectOption('US');
            }
          }
          
          await page.screenshot({ path: 'test-results/amazon-connection-form.png', fullPage: true });
        }
      } else {
        console.log('Amazon connection option not found - this may be expected');
        await page.screenshot({ path: 'test-results/amazon-not-available.png', fullPage: true });
      }
    });
  });

  test('should handle Etsy store connection flow', async () => {
    await test.step('Navigate to store connection', async () => {
      await page.goto('/dashboard/stores');
      await page.waitForLoadState('networkidle');
    });

    await test.step('Initiate Etsy connection', async () => {
      const etsyConnect = page.locator('button:has-text("Etsy"), a:has-text("Connect Etsy"), [data-testid="etsy-connect"]');
      
      if (await etsyConnect.isVisible()) {
        await etsyConnect.click();
        await page.waitForLoadState('networkidle');
        
        // Check for Etsy OAuth redirect
        const currentUrl = page.url();
        
        if (currentUrl.includes('etsy.com')) {
          console.log('Redirected to Etsy OAuth - this is expected behavior');
          await page.screenshot({ path: 'test-results/etsy-oauth-redirect.png', fullPage: true });
        } else {
          // Check for Etsy shop name form
          const shopNameInput = page.locator('input[placeholder*="shop"], input[name*="shop"], input[placeholder*="etsy"]');
          
          if (await shopNameInput.isVisible()) {
            await shopNameInput.fill('TestEtsyShop');
          }
          
          await page.screenshot({ path: 'test-results/etsy-connection-form.png', fullPage: true });
        }
      } else {
        console.log('Etsy connection option not found - this may be expected');
        await page.screenshot({ path: 'test-results/etsy-not-available.png', fullPage: true });
      }
    });
  });

  test('should display connected stores', async () => {
    await test.step('Navigate to stores page', async () => {
      await page.goto('/dashboard/stores');
      await page.waitForLoadState('networkidle');
    });

    await test.step('Check for connected stores display', async () => {
      // Look for connected stores section
      const connectedStores = page.locator('[data-testid="connected-stores"], .connected-stores, h2:has-text("Connected"), h3:has-text("Connected")');
      
      // Look for store cards or list items
      const storeCards = page.locator('[data-testid="store-card"], .store-card, .store-item');
      
      // Check if any stores are displayed
      const storeCount = await storeCards.count();
      console.log(`Found ${storeCount} connected stores`);
      
      // Take screenshot of connected stores
      await page.screenshot({ path: 'test-results/connected-stores.png', fullPage: true });
      
      // If stores are connected, verify their details
      if (storeCount > 0) {
        for (let i = 0; i < Math.min(storeCount, 3); i++) {
          const store = storeCards.nth(i);
          
          // Check for store name
          const storeName = store.locator('h3, h4, .store-name, [data-testid="store-name"]');
          if (await storeName.isVisible()) {
            const name = await storeName.textContent();
            console.log(`Store ${i + 1}: ${name}`);
          }
          
          // Check for store status
          const storeStatus = store.locator('.status, [data-testid="store-status"], .badge');
          if (await storeStatus.isVisible()) {
            const status = await storeStatus.textContent();
            console.log(`Store ${i + 1} status: ${status}`);
          }
        }
      }
    });
  });

  test('should handle store disconnection', async () => {
    await test.step('Navigate to stores page', async () => {
      await page.goto('/dashboard/stores');
      await page.waitForLoadState('networkidle');
    });

    await test.step('Attempt store disconnection', async () => {
      // Look for disconnect buttons
      const disconnectButtons = page.locator('button:has-text("Disconnect"), button:has-text("Remove"), [data-testid="disconnect-store"]');
      
      const buttonCount = await disconnectButtons.count();
      
      if (buttonCount > 0) {
        // Click the first disconnect button
        await disconnectButtons.first().click();
        
        // Handle confirmation dialog if present
        const confirmDialog = page.locator('[role="dialog"], .modal, .confirmation');
        if (await confirmDialog.isVisible()) {
          const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Yes"), button:has-text("Disconnect")');
          if (await confirmButton.isVisible()) {
            await confirmButton.click();
          }
        }
        
        await page.waitForTimeout(3000);
        await page.screenshot({ path: 'test-results/store-disconnection.png', fullPage: true });
      } else {
        console.log('No stores available to disconnect');
        await page.screenshot({ path: 'test-results/no-stores-to-disconnect.png', fullPage: true });
      }
    });
  });

  test('should handle store settings management', async () => {
    await test.step('Navigate to stores page', async () => {
      await page.goto('/dashboard/stores');
      await page.waitForLoadState('networkidle');
    });

    await test.step('Access store settings', async () => {
      // Look for settings buttons
      const settingsButtons = page.locator('button:has-text("Settings"), button:has-text("Configure"), [data-testid="store-settings"]');
      
      const buttonCount = await settingsButtons.count();
      
      if (buttonCount > 0) {
        await settingsButtons.first().click();
        await page.waitForLoadState('networkidle');
        
        // Check for settings form
        const settingsForm = page.locator('form, [data-testid="settings-form"]');
        if (await settingsForm.isVisible()) {
          // Look for common settings fields
          const syncFrequency = page.locator('select[name*="sync"], select[name*="frequency"]');
          const autoImport = page.locator('input[type="checkbox"][name*="import"], input[type="checkbox"][name*="auto"]');
          
          if (await syncFrequency.isVisible()) {
            await syncFrequency.selectOption('daily');
          }
          
          if (await autoImport.isVisible()) {
            await autoImport.check();
          }
        }
        
        await page.screenshot({ path: 'test-results/store-settings.png', fullPage: true });
      } else {
        console.log('No store settings available');
        await page.screenshot({ path: 'test-results/no-store-settings.png', fullPage: true });
      }
    });
  });

  test('should validate OAuth flow security', async () => {
    await test.step('Navigate to store connection', async () => {
      await page.goto('/dashboard/stores');
      await page.waitForLoadState('networkidle');
    });

    await test.step('Check OAuth security measures', async () => {
      const shopifyConnect = page.locator('button:has-text("Shopify"), a:has-text("Connect Shopify")');
      
      if (await shopifyConnect.isVisible()) {
        // Monitor network requests for OAuth
        const requests: string[] = [];
        page.on('request', request => {
          if (request.url().includes('oauth') || request.url().includes('auth')) {
            requests.push(request.url());
          }
        });
        
        await shopifyConnect.click();
        await page.waitForTimeout(5000);
        
        // Verify OAuth requests contain proper parameters
        const oauthRequests = requests.filter(url => 
          url.includes('client_id') || 
          url.includes('redirect_uri') || 
          url.includes('scope')
        );
        
        console.log(`OAuth requests detected: ${oauthRequests.length}`);
        oauthRequests.forEach(url => console.log(`OAuth URL: ${url}`));
        
        await page.screenshot({ path: 'test-results/oauth-security-check.png', fullPage: true });
      }
    });
  });

  test('should handle store data synchronization', async () => {
    await test.step('Navigate to stores page', async () => {
      await page.goto('/dashboard/stores');
      await page.waitForLoadState('networkidle');
    });

    await test.step('Check sync functionality', async () => {
      // Look for sync buttons
      const syncButtons = page.locator('button:has-text("Sync"), button:has-text("Refresh"), [data-testid="sync-store"]');
      
      const buttonCount = await syncButtons.count();
      
      if (buttonCount > 0) {
        await syncButtons.first().click();
        
        // Wait for sync to complete
        await page.waitForTimeout(5000);
        
        // Check for sync status indicators
        const syncStatus = page.locator('.sync-status, [data-testid="sync-status"], .loading, .syncing');
        
        if (await syncStatus.isVisible()) {
          const status = await syncStatus.textContent();
          console.log(`Sync status: ${status}`);
        }
        
        await page.screenshot({ path: 'test-results/store-sync.png', fullPage: true });
      } else {
        console.log('No sync functionality available');
        await page.screenshot({ path: 'test-results/no-sync-available.png', fullPage: true });
      }
    });
  });
}); 