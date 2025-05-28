import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { StoreModel } from '@/lib/models/store';

export async function POST(request: NextRequest) {
  try {
    // Get request body
    const { storeId, internal } = await request.json();
    
    let userId: string | undefined;
    
    // Skip authentication for internal calls
    if (!internal) {
      // Get authorization header
      const authHeader = request.headers.get('authorization');
      if (!authHeader?.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Verify Firebase token
      const token = authHeader.split('Bearer ')[1];
      
      try {
        const adminApp = getFirebaseAdmin();
        const auth = getAuth(adminApp);
        const decodedToken = await auth.verifyIdToken(token);
        userId = decodedToken.uid;
      } catch (authError) {
        console.error('Auth error:', authError);
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }
    }
    
    if (!storeId) {
      return NextResponse.json({ error: 'Store ID is required' }, { status: 400 });
    }

    // Verify store exists and user owns it (skip user check for internal calls)
    const store = await StoreModel.getById(storeId);
    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }
    
    if (!internal && store.userId !== userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Trigger the Cloud Function for sync
    try {
      const cloudFunctionUrl = 'https://us-central1-brandwisp-dev.cloudfunctions.net/scheduledShopifySync';
      
      const response = await fetch(cloudFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ storeId }),
      });

      if (!response.ok) {
        throw new Error(`Cloud Function error: ${response.status}`);
      }

      const result = await response.json();
      
      return NextResponse.json({
        success: true,
        message: 'Store sync triggered successfully',
        storeId,
        result,
      });
    } catch (cloudFunctionError) {
      console.error('Cloud Function error:', cloudFunctionError);
      
      // Fallback: Try to sync directly using Shopify API
      try {
        const { ShopifyService } = await import('@/lib/services/shopify');
        await ShopifyService.syncStoreData(storeId);
        
        return NextResponse.json({
          success: true,
          message: 'Store synced successfully (direct)',
          storeId,
        });
      } catch (directSyncError) {
        console.error('Direct sync error:', directSyncError);
        return NextResponse.json({
          error: 'Failed to sync store',
          details: directSyncError instanceof Error ? directSyncError.message : 'Unknown error',
        }, { status: 500 });
      }
    }
  } catch (error) {
    console.error('Store sync API error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

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
      console.error('Auth error:', authError);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get user's stores
    const stores = await StoreModel.getByUserId(userId);
    
    return NextResponse.json({
      stores: stores.map(store => ({
        id: store.id,
        storeName: store.storeName,
        provider: store.provider,
        status: store.status,
        storeUrl: store.storeUrl,
        lastSyncAt: store.lastSyncAt,
        createdAt: store.createdAt,
        updatedAt: store.updatedAt,
      })),
    });
  } catch (error) {
    console.error('Get stores API error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
} 