import { test, expect, Page } from '@playwright/test';
import path from 'path';

test.describe('AutoBlogGen Module', () => {
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

  test('should navigate to AutoBlogGen module', async () => {
    await test.step('Navigate to dashboard', async () => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
    });

    await test.step('Access AutoBlogGen module', async () => {
      // Look for AutoBlogGen navigation
      const autoBlogNav = page.locator('a:has-text("AutoBlogGen"), a:has-text("Blog"), button:has-text("AutoBlogGen"), [data-testid="autobloggen-nav"]');
      
      if (await autoBlogNav.isVisible()) {
        await autoBlogNav.click();
        await page.waitForLoadState('networkidle');
      } else {
        // Try direct navigation
        await page.goto('/dashboard/autobloggen');
        await page.waitForLoadState('networkidle');
      }
      
      // Verify we're on the AutoBlogGen page
      expect(page.url()).toContain('autobloggen');
      
      // Take screenshot of AutoBlogGen module
      await page.screenshot({ path: 'test-results/autobloggen-module.png', fullPage: true });
    });
  });

  test('should display blog generation options', async () => {
    await test.step('Navigate to AutoBlogGen', async () => {
      await page.goto('/dashboard/autobloggen');
      await page.waitForLoadState('networkidle');
    });

    await test.step('Verify blog generation options', async () => {
      // Check for product-based blog generation
      const productBlogOption = page.locator('button:has-text("Product"), button:has-text("From Product"), [data-testid="product-blog"]');
      
      // Check for topic-based blog generation
      const topicBlogOption = page.locator('button:has-text("Topic"), button:has-text("Custom Topic"), [data-testid="topic-blog"]');
      
      // Check for AI-powered generation
      const aiGenerateButton = page.locator('button:has-text("Generate"), button:has-text("Create Blog"), [data-testid="generate-blog"]');
      
      // At least one generation option should be available
      const generationOptions = await Promise.all([
        productBlogOption.isVisible().catch(() => false),
        topicBlogOption.isVisible().catch(() => false),
        aiGenerateButton.isVisible().catch(() => false)
      ]);
      
      expect(generationOptions.some(visible => visible)).toBeTruthy();
      
      // Take screenshot of generation options
      await page.screenshot({ path: 'test-results/blog-generation-options.png', fullPage: true });
    });
  });

  test('should handle product-based blog generation', async () => {
    await test.step('Navigate to AutoBlogGen', async () => {
      await page.goto('/dashboard/autobloggen');
      await page.waitForLoadState('networkidle');
    });

    await test.step('Initiate product-based blog generation', async () => {
      // Look for product selection or product-based generation
      const productOption = page.locator('button:has-text("Product"), button:has-text("From Product"), [data-testid="product-blog"]');
      
      if (await productOption.isVisible()) {
        await productOption.click();
        await page.waitForLoadState('networkidle');
        
        // Check for product selection dropdown or list
        const productSelect = page.locator('select[name*="product"], [data-testid="product-select"]');
        const productList = page.locator('[data-testid="product-list"], .product-list');
        
        if (await productSelect.isVisible()) {
          // Select a product from dropdown
          const options = await productSelect.locator('option').count();
          if (options > 1) {
            await productSelect.selectOption({ index: 1 });
          }
        } else if (await productList.isVisible()) {
          // Click on first product in list
          const firstProduct = productList.locator('.product-item, [data-testid="product-item"]').first();
          if (await firstProduct.isVisible()) {
            await firstProduct.click();
          }
        }
        
        // Look for generate button
        const generateButton = page.locator('button:has-text("Generate"), button:has-text("Create Blog"), [data-testid="generate-blog"]');
        if (await generateButton.isVisible()) {
          await generateButton.click();
          
          // Wait for generation to complete
          await page.waitForTimeout(10000);
        }
        
        await page.screenshot({ path: 'test-results/product-blog-generation.png', fullPage: true });
      } else {
        console.log('Product-based blog generation not available');
        await page.screenshot({ path: 'test-results/no-product-blog-option.png', fullPage: true });
      }
    });
  });

  test('should handle topic-based blog generation', async () => {
    await test.step('Navigate to AutoBlogGen', async () => {
      await page.goto('/dashboard/autobloggen');
      await page.waitForLoadState('networkidle');
    });

    await test.step('Initiate topic-based blog generation', async () => {
      // Look for topic input or custom topic option
      const topicOption = page.locator('button:has-text("Topic"), button:has-text("Custom Topic"), [data-testid="topic-blog"]');
      
      if (await topicOption.isVisible()) {
        await topicOption.click();
        await page.waitForLoadState('networkidle');
      }
      
      // Look for topic input field
      const topicInput = page.locator('input[placeholder*="topic"], input[name*="topic"], textarea[placeholder*="topic"]');
      
      if (await topicInput.isVisible()) {
        await topicInput.fill('Best practices for e-commerce product photography');
        
        // Look for additional options
        const toneSelect = page.locator('select[name*="tone"], select[name*="style"]');
        if (await toneSelect.isVisible()) {
          await toneSelect.selectOption('professional');
        }
        
        const lengthSelect = page.locator('select[name*="length"], select[name*="words"]');
        if (await lengthSelect.isVisible()) {
          await lengthSelect.selectOption('medium');
        }
        
        // Generate the blog
        const generateButton = page.locator('button:has-text("Generate"), button:has-text("Create Blog"), [data-testid="generate-blog"]');
        if (await generateButton.isVisible()) {
          await generateButton.click();
          
          // Wait for generation to complete
          await page.waitForTimeout(15000);
        }
        
        await page.screenshot({ path: 'test-results/topic-blog-generation.png', fullPage: true });
      } else {
        console.log('Topic input not found');
        await page.screenshot({ path: 'test-results/no-topic-input.png', fullPage: true });
      }
    });
  });

  test('should display generated blog content', async () => {
    await test.step('Navigate to AutoBlogGen', async () => {
      await page.goto('/dashboard/autobloggen');
      await page.waitForLoadState('networkidle');
    });

    await test.step('Check for generated content display', async () => {
      // Look for blog content area
      const blogContent = page.locator('[data-testid="blog-content"], .blog-content, .generated-content');
      const blogEditor = page.locator('.editor, [data-testid="blog-editor"], textarea[name*="content"]');
      
      // Check for blog title
      const blogTitle = page.locator('input[name*="title"], [data-testid="blog-title"], h1, h2');
      
      // Check for blog preview
      const blogPreview = page.locator('[data-testid="blog-preview"], .preview, .blog-preview');
      
      const contentElements = await Promise.all([
        blogContent.isVisible().catch(() => false),
        blogEditor.isVisible().catch(() => false),
        blogTitle.isVisible().catch(() => false),
        blogPreview.isVisible().catch(() => false)
      ]);
      
      if (contentElements.some(visible => visible)) {
        console.log('Blog content display elements found');
        
        // If content is visible, check its quality
        if (await blogContent.isVisible()) {
          const content = await blogContent.textContent();
          expect(content?.length || 0).toBeGreaterThan(100);
        }
        
        if (await blogTitle.isVisible()) {
          const title = await blogTitle.textContent() || await blogTitle.inputValue();
          expect(title?.length || 0).toBeGreaterThan(5);
        }
      }
      
      await page.screenshot({ path: 'test-results/blog-content-display.png', fullPage: true });
    });
  });

  test('should handle blog editing functionality', async () => {
    await test.step('Navigate to AutoBlogGen', async () => {
      await page.goto('/dashboard/autobloggen');
      await page.waitForLoadState('networkidle');
    });

    await test.step('Test blog editing features', async () => {
      // Look for edit button or editor
      const editButton = page.locator('button:has-text("Edit"), [data-testid="edit-blog"]');
      const editor = page.locator('.editor, [data-testid="blog-editor"], textarea[name*="content"]');
      
      if (await editButton.isVisible()) {
        await editButton.click();
        await page.waitForLoadState('networkidle');
      }
      
      if (await editor.isVisible()) {
        // Test editing functionality
        await editor.click();
        await editor.fill('This is a test blog post content for editing functionality testing.');
        
        // Look for formatting options
        const boldButton = page.locator('button[title*="Bold"], button:has-text("B"), [data-testid="bold"]');
        const italicButton = page.locator('button[title*="Italic"], button:has-text("I"), [data-testid="italic"]');
        
        if (await boldButton.isVisible()) {
          await boldButton.click();
        }
        
        // Look for save button
        const saveButton = page.locator('button:has-text("Save"), [data-testid="save-blog"]');
        if (await saveButton.isVisible()) {
          await saveButton.click();
          await page.waitForTimeout(3000);
        }
      }
      
      await page.screenshot({ path: 'test-results/blog-editing.png', fullPage: true });
    });
  });

  test('should handle WordPress publishing', async () => {
    await test.step('Navigate to AutoBlogGen', async () => {
      await page.goto('/dashboard/autobloggen');
      await page.waitForLoadState('networkidle');
    });

    await test.step('Test WordPress publishing', async () => {
      // Look for publish options
      const publishButton = page.locator('button:has-text("Publish"), [data-testid="publish-blog"]');
      const wordpressOption = page.locator('button:has-text("WordPress"), [data-testid="wordpress-publish"]');
      
      if (await publishButton.isVisible()) {
        await publishButton.click();
        await page.waitForLoadState('networkidle');
      }
      
      if (await wordpressOption.isVisible()) {
        await wordpressOption.click();
        await page.waitForLoadState('networkidle');
        
        // Check for WordPress connection form
        const wpUrlInput = page.locator('input[placeholder*="wordpress"], input[name*="url"]');
        const wpUsernameInput = page.locator('input[name*="username"], input[name*="user"]');
        const wpPasswordInput = page.locator('input[name*="password"], input[name*="pass"]');
        
        if (await wpUrlInput.isVisible()) {
          await wpUrlInput.fill('https://test-site.wordpress.com');
        }
        
        if (await wpUsernameInput.isVisible()) {
          await wpUsernameInput.fill('testuser');
        }
        
        if (await wpPasswordInput.isVisible()) {
          await wpPasswordInput.fill('testpassword');
        }
        
        // Look for publish confirmation
        const confirmPublish = page.locator('button:has-text("Confirm"), button:has-text("Publish Now")');
        if (await confirmPublish.isVisible()) {
          await confirmPublish.click();
          await page.waitForTimeout(5000);
        }
      }
      
      await page.screenshot({ path: 'test-results/wordpress-publishing.png', fullPage: true });
    });
  });

  test('should handle Medium publishing', async () => {
    await test.step('Navigate to AutoBlogGen', async () => {
      await page.goto('/dashboard/autobloggen');
      await page.waitForLoadState('networkidle');
    });

    await test.step('Test Medium publishing', async () => {
      const publishButton = page.locator('button:has-text("Publish"), [data-testid="publish-blog"]');
      const mediumOption = page.locator('button:has-text("Medium"), [data-testid="medium-publish"]');
      
      if (await publishButton.isVisible()) {
        await publishButton.click();
        await page.waitForLoadState('networkidle');
      }
      
      if (await mediumOption.isVisible()) {
        await mediumOption.click();
        await page.waitForLoadState('networkidle');
        
        // Check for Medium authentication or API key input
        const mediumApiInput = page.locator('input[placeholder*="medium"], input[name*="api"], input[name*="token"]');
        
        if (await mediumApiInput.isVisible()) {
          await mediumApiInput.fill('test-medium-api-key');
          
          const publishToMedium = page.locator('button:has-text("Publish to Medium"), button:has-text("Confirm")');
          if (await publishToMedium.isVisible()) {
            await publishToMedium.click();
            await page.waitForTimeout(5000);
          }
        }
      }
      
      await page.screenshot({ path: 'test-results/medium-publishing.png', fullPage: true });
    });
  });

  test('should handle Shopify blog publishing', async () => {
    await test.step('Navigate to AutoBlogGen', async () => {
      await page.goto('/dashboard/autobloggen');
      await page.waitForLoadState('networkidle');
    });

    await test.step('Test Shopify blog publishing', async () => {
      const publishButton = page.locator('button:has-text("Publish"), [data-testid="publish-blog"]');
      const shopifyOption = page.locator('button:has-text("Shopify"), [data-testid="shopify-publish"]');
      
      if (await publishButton.isVisible()) {
        await publishButton.click();
        await page.waitForLoadState('networkidle');
      }
      
      if (await shopifyOption.isVisible()) {
        await shopifyOption.click();
        await page.waitForLoadState('networkidle');
        
        // Check for Shopify store selection
        const storeSelect = page.locator('select[name*="store"], [data-testid="store-select"]');
        
        if (await storeSelect.isVisible()) {
          const options = await storeSelect.locator('option').count();
          if (options > 1) {
            await storeSelect.selectOption({ index: 1 });
          }
          
          const publishToShopify = page.locator('button:has-text("Publish to Shopify"), button:has-text("Confirm")');
          if (await publishToShopify.isVisible()) {
            await publishToShopify.click();
            await page.waitForTimeout(5000);
          }
        }
      }
      
      await page.screenshot({ path: 'test-results/shopify-blog-publishing.png', fullPage: true });
    });
  });

  test('should display blog management interface', async () => {
    await test.step('Navigate to AutoBlogGen', async () => {
      await page.goto('/dashboard/autobloggen');
      await page.waitForLoadState('networkidle');
    });

    await test.step('Check blog management features', async () => {
      // Look for blog list or management section
      const blogList = page.locator('[data-testid="blog-list"], .blog-list, .posts-list');
      const draftsSection = page.locator('[data-testid="drafts"], .drafts, button:has-text("Drafts")');
      const publishedSection = page.locator('[data-testid="published"], .published, button:has-text("Published")');
      
      // Check for blog management tabs
      if (await draftsSection.isVisible()) {
        await draftsSection.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'test-results/blog-drafts.png', fullPage: true });
      }
      
      if (await publishedSection.isVisible()) {
        await publishedSection.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'test-results/blog-published.png', fullPage: true });
      }
      
      // Check for individual blog actions
      const blogItems = page.locator('.blog-item, [data-testid="blog-item"]');
      const itemCount = await blogItems.count();
      
      if (itemCount > 0) {
        const firstBlog = blogItems.first();
        
        // Look for edit, delete, view actions
        const editAction = firstBlog.locator('button:has-text("Edit"), [data-testid="edit"]');
        const deleteAction = firstBlog.locator('button:has-text("Delete"), [data-testid="delete"]');
        const viewAction = firstBlog.locator('button:has-text("View"), [data-testid="view"]');
        
        console.log(`Found ${itemCount} blog items`);
      }
      
      await page.screenshot({ path: 'test-results/blog-management.png', fullPage: true });
    });
  });

  test('should handle SEO optimization features', async () => {
    await test.step('Navigate to AutoBlogGen', async () => {
      await page.goto('/dashboard/autobloggen');
      await page.waitForLoadState('networkidle');
    });

    await test.step('Test SEO optimization', async () => {
      // Look for SEO section or settings
      const seoSection = page.locator('[data-testid="seo"], .seo-section, button:has-text("SEO")');
      
      if (await seoSection.isVisible()) {
        await seoSection.click();
        await page.waitForLoadState('networkidle');
      }
      
      // Check for SEO fields
      const metaTitle = page.locator('input[name*="meta"], input[placeholder*="title"]');
      const metaDescription = page.locator('textarea[name*="description"], input[name*="description"]');
      const keywords = page.locator('input[name*="keyword"], input[placeholder*="keyword"]');
      
      if (await metaTitle.isVisible()) {
        await metaTitle.fill('Test SEO Title for Blog Post');
      }
      
      if (await metaDescription.isVisible()) {
        await metaDescription.fill('This is a test meta description for SEO optimization testing.');
      }
      
      if (await keywords.isVisible()) {
        await keywords.fill('ecommerce, blog, seo, optimization');
      }
      
      // Look for SEO analysis or score
      const seoScore = page.locator('[data-testid="seo-score"], .seo-score, .score');
      const seoAnalysis = page.locator('[data-testid="seo-analysis"], .seo-analysis');
      
      if (await seoScore.isVisible()) {
        const score = await seoScore.textContent();
        console.log(`SEO Score: ${score}`);
      }
      
      await page.screenshot({ path: 'test-results/seo-optimization.png', fullPage: true });
    });
  });

  test('should handle bulk blog operations', async () => {
    await test.step('Navigate to AutoBlogGen', async () => {
      await page.goto('/dashboard/autobloggen');
      await page.waitForLoadState('networkidle');
    });

    await test.step('Test bulk operations', async () => {
      // Look for bulk selection checkboxes
      const selectAllCheckbox = page.locator('input[type="checkbox"][name*="all"], [data-testid="select-all"]');
      const blogCheckboxes = page.locator('input[type="checkbox"][name*="blog"], .blog-checkbox');
      
      if (await selectAllCheckbox.isVisible()) {
        await selectAllCheckbox.check();
        await page.waitForTimeout(1000);
      } else if (await blogCheckboxes.first().isVisible()) {
        // Select first few blogs
        const checkboxCount = await blogCheckboxes.count();
        for (let i = 0; i < Math.min(checkboxCount, 3); i++) {
          await blogCheckboxes.nth(i).check();
        }
      }
      
      // Look for bulk action buttons
      const bulkDelete = page.locator('button:has-text("Delete Selected"), [data-testid="bulk-delete"]');
      const bulkPublish = page.locator('button:has-text("Publish Selected"), [data-testid="bulk-publish"]');
      const bulkExport = page.locator('button:has-text("Export"), [data-testid="bulk-export"]');
      
      if (await bulkExport.isVisible()) {
        await bulkExport.click();
        await page.waitForTimeout(3000);
      }
      
      await page.screenshot({ path: 'test-results/bulk-operations.png', fullPage: true });
    });
  });
}); 