import { NextRequest, NextResponse } from 'next/server';
import { FirebaseService } from '@/lib/services/firebase';
import { BigQueryService } from '@/lib/services/bigquery';
import { StoreModel } from '@/lib/models/store';
import { getFirebaseAdmin } from '@/lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';

export async function GET(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify Firebase token
    const token = authHeader.split('Bearer ')[1];
    
    let userId: string;
    try {
      const adminApp = getFirebaseAdmin();
      const auth = getAuth(adminApp);
      const decodedToken = await auth.verifyIdToken(token);
      userId = decodedToken.uid;
    } catch (authError) {
      // For development, allow a test user if Firebase is not configured
      if (process.env.NODE_ENV === 'development' && token === 'test-token') {
        userId = 'test-user-id';
      } else {
        console.error('Auth error:', authError);
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view') || 'overview';
    const productId = searchParams.get('productId');
    const storeId = searchParams.get('storeId');
    const days = parseInt(searchParams.get('days') || '30');

    let data: any = {};

    switch (view) {
      case 'overview':
        if (productId && storeId) {
          // Get specific product data
          try {
            // First try to get from Firebase
            let product = await FirebaseService.getProduct(storeId, productId);
            
            // If not found in Firebase, check if it's a sample product or generate one for real Shopify IDs
            if (!product) {
              let stores = await StoreModel.getByUserId(userId);
              
              // For development with test user, create mock stores if none exist
              if (stores.length === 0 && userId === 'test-user-id') {
                stores = [
                  {
                    id: 'test-store-1',
                    userId: 'test-user-id',
                    storeName: 'BrandWisp Demo Store',
                    provider: 'shopify' as const,
                    status: 'connected' as const,
                    accessToken: 'mock_access_token_1',
                    storeUrl: 'brandwisp-demo.myshopify.com',
                    createdAt: new Date(),
                    updatedAt: new Date()
                  },
                  {
                    id: 'test-store-2',
                    userId: 'test-user-id',
                    storeName: 'Creative Designs Shop',
                    provider: 'shopify' as const,
                    status: 'connected' as const,
                    accessToken: 'mock_access_token_2',
                    storeUrl: 'creative-designs.myshopify.com',
                    createdAt: new Date(),
                    updatedAt: new Date()
                  }
                ] as any;
              }
              
              const store = stores.find(s => s.id === storeId);
              if (store) {
                const sampleProducts = generateSampleProducts(store);
                let sampleProduct = sampleProducts.find(p => p.id === productId);
                
                // If it's a real Shopify product ID (numeric), generate a sample product for it
                if (!sampleProduct && /^\d+$/.test(productId)) {
                  sampleProduct = generateSampleProductForId(store, productId);
                }
                
                product = sampleProduct as any; // Cast to any since sample products have different structure
              }
            }

            if (!product) {
              return NextResponse.json({ error: 'Product not found' }, { status: 404 });
            }

            // Get analytics data
            let productAnalytics: any[] = [];
            try {
              productAnalytics = await BigQueryService.getProductAnalytics(storeId, days);
            } catch (analyticsError) {
              console.error('Analytics error:', analyticsError);
              // Continue without analytics data
            }

            // Get product-specific analytics
            const productSpecificAnalytics = productAnalytics.find((p: any) => p.productId === productId);

            data = {
              product,
              analytics: productSpecificAnalytics || {
                views: (product as any).analytics?.views || 0,
                addedToCart: 0,
                purchases: 0,
                revenue: (product as any).analytics?.revenue || 0,
                conversionRate: 0,
                rating: (product as any).analytics?.rating || 0,
                reviews: (product as any).analytics?.reviews || 0,
                clicks: (product as any).analytics?.clicks || 0,
                conversions: (product as any).analytics?.conversions || 0
              },
              metrics: await getProductMetrics(productId, days),
              reviews: await getProductReviews(productId),
              seoMetrics: await getProductSEOMetrics(productId),
              platformData: await getPlatformData(productId)
            };
          } catch (error) {
            console.error('Error fetching product data:', error);
            return NextResponse.json({ error: 'Error fetching product data' }, { status: 500 });
          }
        } else {
          // Get overview data for all products
          let stores = await StoreModel.getByUserId(userId);
          let allProducts: any[] = [];
          let totalAnalytics = {
            totalProducts: 0,
            totalViews: 0,
            totalRevenue: 0,
            avgRating: 0,
            totalReviews: 0
          };

          // For development with test user, create mock stores if none exist
          if (stores.length === 0 && userId === 'test-user-id') {
            stores = [
              {
                id: 'test-store-1',
                userId: 'test-user-id',
                storeName: 'BrandWisp Demo Store',
                provider: 'shopify' as const,
                status: 'connected' as const,
                accessToken: 'mock_access_token_1',
                storeUrl: 'brandwisp-demo.myshopify.com',
                createdAt: new Date(),
                updatedAt: new Date()
              },
              {
                id: 'test-store-2',
                userId: 'test-user-id',
                storeName: 'Creative Designs Shop',
                provider: 'shopify' as const,
                status: 'connected' as const,
                accessToken: 'mock_access_token_2',
                storeUrl: 'creative-designs.myshopify.com',
                createdAt: new Date(),
                updatedAt: new Date()
              }
            ] as any;
          }

          // If no stores connected, return empty data
          if (stores.length === 0) {
            data = {
              products: [],
              totalAnalytics,
              topProducts: [],
              categoryBreakdown: [],
              performanceMetrics: [],
              message: 'No stores connected. Please connect a store in Settings to view products.'
            };
          } else {
            for (const store of stores) {
              try {
                // Try to fetch real products from Shopify API for connected stores
                if (store.status === 'connected' && store.provider === 'shopify') {
                  // Check if this is a real Shopify store or a mock store
                  const isRealStore = store.accessToken && !store.accessToken.startsWith('mock_');
                  
                  if (isRealStore) {
                    try {
                      const shopifyResponse = await fetch(`https://${store.storeUrl}/admin/api/2024-04/products.json?limit=250`, {
                        headers: {
                          'X-Shopify-Access-Token': store.accessToken || '',
                          'Content-Type': 'application/json',
                        },
                      });

                      if (shopifyResponse.ok) {
                        const shopifyData = await shopifyResponse.json();
                        const transformedProducts = shopifyData.products.map((product: any) => ({
                          id: product.id.toString(),
                          storeId: store.id,
                          storeName: store.storeName,
                          platform: store.provider,
                          title: product.title,
                          description: product.body_html || '',
                          handle: product.handle,
                          vendor: product.vendor || '',
                          productType: product.product_type || '',
                          tags: product.tags ? product.tags.split(',').map((tag: string) => tag.trim()) : [],
                          status: product.status,
                          images: product.images.map((image: any, index: number) => ({
                            id: image.id.toString(),
                            src: image.src,
                            altText: image.alt || '',
                            width: image.width,
                            height: image.height,
                            position: index + 1,
                          })),
                          variants: product.variants.map((variant: any) => ({
                            id: variant.id.toString(),
                            title: variant.title,
                            price: parseFloat(variant.price),
                            compareAtPrice: variant.compare_at_price ? parseFloat(variant.compare_at_price) : undefined,
                            sku: variant.sku || '',
                            inventory: variant.inventory_quantity || 0,
                          })),
                          seo: {
                            title: product.title,
                            description: product.body_html || '',
                            keywords: product.tags ? product.tags.split(',').map((tag: string) => tag.trim()) : [],
                          },
                          analytics: {
                            views: 0, // Will be populated from BigQuery when available
                            clicks: 0,
                            conversions: 0,
                            revenue: 0,
                            rating: 0,
                            reviews: 0,
                          },
                        }));
                        allProducts = [...allProducts, ...transformedProducts];
                      } else {
                        console.error(`Failed to fetch products from ${store.storeName}: ${shopifyResponse.status}`);
                        // Fall back to sample products for demo stores
                        allProducts = [...allProducts, ...generateSampleProducts(store)];
                      }
                    } catch (shopifyError) {
                      console.error(`Shopify API error for ${store.storeName}:`, shopifyError);
                      // Fall back to sample products for demo stores
                      allProducts = [...allProducts, ...generateSampleProducts(store)];
                    }
                  } else {
                    // This is a mock store, generate sample products with real-looking data
                    allProducts = [...allProducts, ...generateSampleProducts(store)];
                  }
                } else {
                  // Fallback to Firebase for other platforms or disconnected stores
                  const products = await FirebaseService.getStoreProducts(store.id, 50);
                  allProducts = [...allProducts, ...products.map(p => ({ 
                    ...p, 
                    storeId: store.id, 
                    storeName: store.storeName,
                    platform: store.provider 
                  }))];
                }
                
                // Try to get analytics but don't fail if BigQuery has issues
                try {
                  const storeAnalytics = await BigQueryService.getProductAnalytics(store.id, days);
                  totalAnalytics.totalViews += storeAnalytics.reduce((sum: number, p: any) => sum + p.views, 0);
                  totalAnalytics.totalRevenue += storeAnalytics.reduce((sum: number, p: any) => sum + p.revenue, 0);
                } catch (analyticsError) {
                  console.error(`Analytics error for store ${store.id}:`, analyticsError);
                  // Continue without analytics data
                }
              } catch (error) {
                console.error(`Error fetching products for store ${store.id}:`, error);
                // Continue with other stores even if one fails
              }
            }

            totalAnalytics.totalProducts = allProducts.length;
            totalAnalytics.avgRating = allProducts.reduce((sum, p) => sum + (p.analytics?.rating || 0), 0) / allProducts.length || 0;
            totalAnalytics.totalReviews = allProducts.reduce((sum, p) => sum + (p.analytics?.reviews || 0), 0);

            data = {
              products: allProducts,
              totalAnalytics,
              topProducts: allProducts
                .sort((a, b) => (b.analytics?.revenue || 0) - (a.analytics?.revenue || 0))
                .slice(0, 10),
              categoryBreakdown: getCategoryBreakdown(allProducts),
              performanceMetrics: await getOverallPerformanceMetrics(stores, days)
            };
          }
        }
        break;

      case 'products':
        // Get all products for selection
        let userStores = await StoreModel.getByUserId(userId);
        
        // For development with test user, create mock stores if none exist
        if (userStores.length === 0 && userId === 'test-user-id') {
          userStores = [
            {
              id: 'test-store-1',
              userId: 'test-user-id',
              storeName: 'BrandWisp Demo Store',
              provider: 'shopify' as const,
              status: 'connected' as const,
              accessToken: 'mock_access_token_1',
              storeUrl: 'brandwisp-demo.myshopify.com',
              createdAt: new Date(),
              updatedAt: new Date()
            },
            {
              id: 'test-store-2',
              userId: 'test-user-id',
              storeName: 'Creative Designs Shop',
              provider: 'shopify' as const,
              status: 'connected' as const,
              accessToken: 'mock_access_token_2',
              storeUrl: 'creative-designs.myshopify.com',
              createdAt: new Date(),
              updatedAt: new Date()
            }
          ] as any;
        }
        
        let productsData: any[] = [];

        for (const store of userStores) {
          try {
            // Try to fetch real products from Shopify API for connected stores
            if (store.status === 'connected' && store.provider === 'shopify') {
              // Check if this is a real Shopify store or a mock store
              const isRealStore = store.accessToken && !store.accessToken.startsWith('mock_');
              
              if (isRealStore) {
                try {
                  const shopifyResponse = await fetch(`https://${store.storeUrl}/admin/api/2024-04/products.json?limit=250`, {
                    headers: {
                      'X-Shopify-Access-Token': store.accessToken || '',
                      'Content-Type': 'application/json',
                    },
                  });

                  if (shopifyResponse.ok) {
                    const shopifyData = await shopifyResponse.json();
                    const transformedProducts = shopifyData.products.map((product: any) => ({
                      id: product.id.toString(),
                      storeId: store.id,
                      storeName: store.storeName,
                      platform: store.provider,
                      title: product.title,
                      description: product.body_html || '',
                      handle: product.handle,
                      vendor: product.vendor || '',
                      productType: product.product_type || '',
                      tags: product.tags ? product.tags.split(',').map((tag: string) => tag.trim()) : [],
                      status: product.status,
                      images: product.images.map((image: any, index: number) => ({
                        id: image.id.toString(),
                        src: image.src,
                        altText: image.alt || '',
                        width: image.width,
                        height: image.height,
                        position: index + 1,
                      })),
                      variants: product.variants.map((variant: any) => ({
                        id: variant.id.toString(),
                        title: variant.title,
                        price: parseFloat(variant.price),
                        compareAtPrice: variant.compare_at_price ? parseFloat(variant.compare_at_price) : undefined,
                        sku: variant.sku || '',
                        inventory: variant.inventory_quantity || 0,
                      })),
                      seo: {
                        title: product.title,
                        description: product.body_html || '',
                        keywords: product.tags ? product.tags.split(',').map((tag: string) => tag.trim()) : [],
                      },
                      analytics: {
                        views: 0, // Will be populated from BigQuery when available
                        clicks: 0,
                        conversions: 0,
                        revenue: 0,
                        rating: 0,
                        reviews: 0,
                      },
                    }));
                    productsData = [...productsData, ...transformedProducts];
                  } else {
                    console.error(`Failed to fetch products from ${store.storeName}: ${shopifyResponse.status}`);
                    // Fall back to sample products for demo stores
                    productsData = [...productsData, ...generateSampleProducts(store)];
                  }
                } catch (shopifyError) {
                  console.error(`Shopify API error for ${store.storeName}:`, shopifyError);
                  // Fall back to sample products for demo stores
                  productsData = [...productsData, ...generateSampleProducts(store)];
                }
              } else {
                // This is a mock store, generate sample products with real-looking data
                productsData = [...productsData, ...generateSampleProducts(store)];
              }
            } else {
              // Fallback to Firebase for other platforms or disconnected stores
              const products = await FirebaseService.getStoreProducts(store.id, 100);
              productsData = [...productsData, ...products.map(p => ({ 
                ...p, 
                storeId: store.id, 
                storeName: store.storeName,
                platform: store.provider 
              }))];
            }
          } catch (error) {
            console.error(`Error fetching products for store ${store.id}:`, error);
            // Continue with other stores even if one fails
          }
        }

        data = {
          products: productsData,
          stores: userStores.map(store => ({
            id: store.id,
            name: store.storeName,
            platform: store.provider,
            status: store.status
          })),
          totalCount: productsData.length
        };
        break;

      default:
        return NextResponse.json({ error: 'Invalid view parameter' }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('ProductPulse API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions
async function getProductMetrics(productId: string, days: number) {
  // Generate sample metrics for demo purposes
  const metrics = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  for (let i = 0; i < Math.min(days, 7); i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i * Math.ceil(days / 7));
    
    metrics.push({
      date: date.toISOString().split('T')[0],
      rating: Math.random() * 2 + 3, // 3-5 stars
      reviews: Math.floor(Math.random() * 10) + 1,
      sentiment: Math.random() * 100,
      impressions: Math.floor(Math.random() * 1000) + 100,
      conversions: Math.floor(Math.random() * 50) + 5,
      clicks: Math.floor(Math.random() * 200) + 20,
      revenue: Math.floor(Math.random() * 1000) + 100,
    });
  }

  return metrics;
}

async function getProductReviews(productId: string) {
  // Generate sample reviews for demo purposes
  const sampleReviews = [
    {
      id: '1',
      platform: 'Shopify',
      rating: 5,
      comment: 'Excellent quality product! Highly recommended.',
      sentiment: 'positive' as const,
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
    },
    {
      id: '2',
      platform: 'Amazon',
      rating: 4,
      comment: 'Good value for money. Fast shipping.',
      sentiment: 'positive' as const,
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
    },
    {
      id: '3',
      platform: 'Etsy',
      rating: 3,
      comment: 'Product is okay, but could be better.',
      sentiment: 'neutral' as const,
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
    }
  ];

  return sampleReviews;
}

async function getProductSEOMetrics(productId: string) {
  // Generate sample SEO metrics
  return {
    score: Math.floor(Math.random() * 40) + 60, // 60-100
    titleOptimization: Math.floor(Math.random() * 30) + 70, // 70-100
    keywordDensity: Math.floor(Math.random() * 40) + 50, // 50-90
    altTextCoverage: Math.floor(Math.random() * 50) + 40, // 40-90
    metaDescription: Math.floor(Math.random() * 30) + 60, // 60-90
  };
}

async function getPlatformData(productId: string) {
  // Generate sample platform data
  return [
    { name: 'Shopify', reviews: Math.floor(Math.random() * 50) + 10, rating: Math.random() * 2 + 3 },
    { name: 'Amazon', reviews: Math.floor(Math.random() * 30) + 5, rating: Math.random() * 2 + 3 },
    { name: 'Etsy', reviews: Math.floor(Math.random() * 20) + 3, rating: Math.random() * 2 + 3 },
  ];
}

function getCategoryBreakdown(products: any[]) {
  const categories = products.reduce((acc, product) => {
    const category = product.productType || 'Uncategorized';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(categories).map(([name, count]) => ({
    name,
    value: count,
    color: getRandomColor()
  }));
}

async function getOverallPerformanceMetrics(stores: any[], days: number) {
  const metrics = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  for (let i = 0; i < days; i += Math.ceil(days / 7)) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    metrics.push({
      date: date.toISOString().split('T')[0],
      totalViews: 0,
      totalRevenue: 0,
      avgRating: 0,
      totalReviews: 0,
      conversions: 0
    });
  }

  return metrics;
}

function getRandomColor() {
  const colors = ['#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#3B82F6', '#EF4444'];
  return colors[Math.floor(Math.random() * colors.length)];
}

function generateSampleProducts(store: any) {
  // Sample products with real-looking data and actual product images
  const sampleProducts = [
    {
      title: "Classic Cotton T-Shirt",
      productType: "T-Shirt",
      vendor: "BrandWisp Apparel",
      price: 24.99,
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
      description: "Comfortable 100% cotton t-shirt perfect for everyday wear.",
      tags: ["cotton", "casual", "unisex", "basic"]
    },
    {
      title: "Premium Hoodie",
      productType: "Hoodie", 
      vendor: "Comfort Co.",
      price: 49.99,
      image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop",
      description: "Cozy fleece hoodie with kangaroo pocket and adjustable hood.",
      tags: ["hoodie", "warm", "fleece", "casual"]
    },
    {
      title: "Ceramic Coffee Mug",
      productType: "Mug",
      vendor: "Kitchen Essentials",
      price: 12.99,
      image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=400&fit=crop",
      description: "11oz ceramic mug perfect for your morning coffee or tea.",
      tags: ["ceramic", "coffee", "kitchen", "gift"]
    },
    {
      title: "Motivational Poster",
      productType: "Poster",
      vendor: "Wall Art Studio",
      price: 19.99,
      image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=400&fit=crop",
      description: "Inspirational wall art to motivate and inspire your space.",
      tags: ["poster", "motivation", "wall-art", "decor"]
    },
    {
      title: "Vinyl Sticker Pack",
      productType: "Sticker",
      vendor: "Sticker World",
      price: 8.99,
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
      description: "Waterproof vinyl stickers perfect for laptops and water bottles.",
      tags: ["stickers", "vinyl", "waterproof", "pack"]
    },
    {
      title: "Phone Case",
      productType: "Phone Case",
      vendor: "Tech Protect",
      price: 29.99,
      image: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400&h=400&fit=crop",
      description: "Durable phone case with shock absorption and wireless charging support.",
      tags: ["phone-case", "protection", "wireless", "durable"]
    }
  ];

  const products = [];
  const productCount = Math.min(sampleProducts.length, 6); // Use all sample products

  for (let i = 0; i < productCount; i++) {
    const sample = sampleProducts[i];
    products.push({
      id: `${store.id}_sample_${i + 1}`,
      storeId: store.id,
      storeName: store.storeName,
      platform: store.provider,
      title: `${sample.title} - ${store.storeName}`,
      description: sample.description,
      handle: sample.title.toLowerCase().replace(/\s+/g, '-'),
      vendor: sample.vendor,
      productType: sample.productType,
      tags: sample.tags,
      status: 'active',
      images: [
        {
          id: `img_${i + 1}`,
          src: sample.image,
          altText: `${sample.title} product image`,
          width: 400,
          height: 400,
          position: 1,
        }
      ],
      variants: [
        {
          id: `variant_${i + 1}`,
          title: 'Default Title',
          price: sample.price,
          compareAtPrice: sample.price + 5,
          sku: `SKU-${store.id}-${i + 1}`,
          inventory: Math.floor(Math.random() * 100) + 10,
        }
      ],
      seo: {
        title: sample.title,
        description: sample.description,
        keywords: sample.tags,
      },
      analytics: {
        views: Math.floor(Math.random() * 1000) + 100,
        clicks: Math.floor(Math.random() * 100) + 10,
        conversions: Math.floor(Math.random() * 20) + 1,
        revenue: Math.floor(Math.random() * 5000) + 500,
        rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
        reviews: Math.floor(Math.random() * 50) + 5,
      },
    });
  }
  
  return products;
}

function generateSampleProductForId(store: any, productId: string) {
  // Generate a consistent sample product based on the product ID
  const productIndex = parseInt(productId.slice(-1)) || 0; // Use last digit for consistency
  const sampleProducts = [
    {
      title: "Classic Cotton T-Shirt",
      productType: "T-Shirt",
      vendor: "BrandWisp Apparel",
      price: 24.99,
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
      description: "Comfortable 100% cotton t-shirt perfect for everyday wear.",
      tags: ["cotton", "casual", "unisex", "basic"]
    },
    {
      title: "Premium Hoodie",
      productType: "Hoodie", 
      vendor: "Comfort Co.",
      price: 49.99,
      image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop",
      description: "Cozy fleece hoodie with kangaroo pocket and adjustable hood.",
      tags: ["hoodie", "warm", "fleece", "casual"]
    },
    {
      title: "Ceramic Coffee Mug",
      productType: "Mug",
      vendor: "Kitchen Essentials",
      price: 12.99,
      image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=400&fit=crop",
      description: "11oz ceramic mug perfect for your morning coffee or tea.",
      tags: ["ceramic", "coffee", "kitchen", "gift"]
    },
    {
      title: "Motivational Poster",
      productType: "Poster",
      vendor: "Wall Art Studio",
      price: 19.99,
      image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=400&fit=crop",
      description: "Inspirational wall art to motivate and inspire your space.",
      tags: ["poster", "motivation", "wall-art", "decor"]
    },
    {
      title: "Vinyl Sticker Pack",
      productType: "Sticker",
      vendor: "Sticker World",
      price: 8.99,
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
      description: "Waterproof vinyl stickers perfect for laptops and water bottles.",
      tags: ["stickers", "vinyl", "waterproof", "pack"]
    },
    {
      title: "Phone Case",
      productType: "Phone Case",
      vendor: "Tech Protect",
      price: 29.99,
      image: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400&h=400&fit=crop",
      description: "Durable phone case with shock absorption and wireless charging support.",
      tags: ["phone-case", "protection", "wireless", "durable"]
    }
  ];

  const sample = sampleProducts[productIndex % sampleProducts.length];
  
  return {
    id: productId, // Use the actual Shopify product ID
    storeId: store.id,
    storeName: store.storeName,
    platform: store.provider,
    title: `${sample.title} - ${store.storeName}`,
    description: sample.description,
    handle: sample.title.toLowerCase().replace(/\s+/g, '-'),
    vendor: sample.vendor,
    productType: sample.productType,
    tags: sample.tags,
    status: 'active',
    images: [
      {
        id: `img_${productId}`,
        src: sample.image,
        altText: `${sample.title} product image`,
        width: 400,
        height: 400,
        position: 1,
      }
    ],
    variants: [
      {
        id: `variant_${productId}`,
        title: 'Default Title',
        price: sample.price,
        compareAtPrice: sample.price + 5,
        sku: `SKU-${productId}`,
        inventory: Math.floor(Math.random() * 100) + 10,
      }
    ],
    seo: {
      title: sample.title,
      description: sample.description,
      keywords: sample.tags,
    },
    analytics: {
      views: Math.floor(Math.random() * 1000) + 100,
      clicks: Math.floor(Math.random() * 100) + 10,
      conversions: Math.floor(Math.random() * 20) + 1,
      revenue: Math.floor(Math.random() * 5000) + 500,
      rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
      reviews: Math.floor(Math.random() * 50) + 5,
    },
  };
}

 