import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
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
    const adminApp = getFirebaseAdmin();
    const auth = getAuth(adminApp);
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const shop = searchParams.get('shop');
    const storeId = searchParams.get('storeId');

    if (!shop && !storeId) {
      return NextResponse.json({ error: 'Missing shop or storeId parameter' }, { status: 400 });
    }

    const db = getFirestore(adminApp);
    let storeDoc;

    if (storeId) {
      // Get store by ID
      storeDoc = await db.collection('stores').doc(storeId).get();
    } else {
      // Get store by shop domain (legacy support)
      const storesQuery = await db.collection('stores')
        .where('userId', '==', userId)
        .where('storeUrl', '==', shop)
        .limit(1)
        .get();
      
      if (storesQuery.empty) {
        return NextResponse.json({ error: 'Store not found' }, { status: 404 });
      }
      storeDoc = storesQuery.docs[0];
    }

    if (!storeDoc.exists) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    const storeData = storeDoc.data();
    if (!storeData) {
      return NextResponse.json({ error: 'Store data not found' }, { status: 404 });
    }
    
    // Verify the store belongs to the user
    if (storeData.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized access to store' }, { status: 403 });
    }

    // Check if store is connected
    if (storeData.status !== 'connected') {
      return NextResponse.json({ error: 'Store is not connected' }, { status: 401 });
    }

    const accessToken = storeData.accessToken;
    if (!accessToken) {
      return NextResponse.json({ error: 'No access token found' }, { status: 401 });
    }

    // Fetch products from Shopify
    const shopDomain = storeData.storeUrl;
    const shopifyResponse = await fetch(`https://${shopDomain}/admin/api/2024-04/products.json?limit=250`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });

    if (shopifyResponse.status === 401) {
      return NextResponse.json({ error: 'Shopify access token expired' }, { status: 401 });
    }

    if (!shopifyResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch products from Shopify' }, { status: 500 });
    }

    const data = await shopifyResponse.json();
    
    // Transform Shopify products to our format
    const products = data.products.map((product: any) => ({
      id: product.id.toString(),
      storeId: storeDoc.id,
      storeName: storeData.storeName,
      platform: storeData.provider,
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
        views: 0,
        clicks: 0,
        conversions: 0,
        revenue: 0,
      },
    }));

    return NextResponse.json({ 
      products,
      totalCount: products.length,
      store: {
        id: storeDoc.id,
        name: storeData.storeName,
        platform: storeData.provider,
        url: storeData.storeUrl,
      }
    });

  } catch (error) {
    console.error('Shopify products API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 