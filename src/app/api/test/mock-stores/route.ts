import { NextRequest, NextResponse } from 'next/server';
import { StoreModel } from '@/lib/models/store';
import { getFirebaseAdmin } from '@/lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';

export async function POST(request: NextRequest) {
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

    // Create mock stores
    const mockStores = [
      {
        userId,
        provider: 'shopify' as const,
        status: 'connected' as const,
        storeName: 'BrandWisp Demo Store',
        storeUrl: 'brandwisp-demo.myshopify.com',
        accessToken: 'mock_access_token_1',
        scope: 'read_products,write_products',
        metadata: {
          email: 'demo@brandwisp.com',
          currency: 'USD',
          country: 'US',
          timezone: 'America/New_York',
          plan: 'basic',
        },
      },
      {
        userId,
        provider: 'shopify' as const,
        status: 'connected' as const,
        storeName: 'Creative Designs Shop',
        storeUrl: 'creative-designs.myshopify.com',
        accessToken: 'mock_access_token_2',
        scope: 'read_products,write_products',
        metadata: {
          email: 'hello@creativedesigns.com',
          currency: 'USD',
          country: 'US',
          timezone: 'America/Los_Angeles',
          plan: 'professional',
        },
      },
      {
        userId,
        provider: 'shopify' as const,
        status: 'connected' as const,
        storeName: 'Print & Design Co',
        storeUrl: 'print-design-co.myshopify.com',
        accessToken: 'mock_access_token_3',
        scope: 'read_products,write_products',
        metadata: {
          email: 'info@printdesignco.com',
          currency: 'USD',
          country: 'CA',
          timezone: 'America/Toronto',
          plan: 'basic',
        },
      },
    ];

    const createdStores = [];
    for (const storeData of mockStores) {
      try {
        const store = await StoreModel.create(storeData);
        createdStores.push(store);
      } catch (error) {
        console.error('Error creating mock store:', error);
        // Continue with other stores
      }
    }

    return NextResponse.json({
      message: `Created ${createdStores.length} mock stores`,
      stores: createdStores,
    });

  } catch (error) {
    console.error('Mock stores API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    // Get all user stores and delete mock ones
    const stores = await StoreModel.getByUserId(userId);
    const mockStoreNames = ['BrandWisp Demo Store', 'Creative Designs Shop', 'Print & Design Co'];
    
    let deletedCount = 0;
    for (const store of stores) {
      if (mockStoreNames.includes(store.storeName)) {
        try {
          await StoreModel.disconnect(store.id);
          deletedCount++;
        } catch (error) {
          console.error(`Error deleting mock store ${store.id}:`, error);
        }
      }
    }

    return NextResponse.json({
      message: `Deleted ${deletedCount} mock stores`,
    });

  } catch (error) {
    console.error('Delete mock stores API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 