import { NextRequest, NextResponse } from 'next/server';
import { StoreModel } from '@/lib/models/store';
import { generateId } from '@/lib/utils';

const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY || '2201af5d5088a5692cffec6cc854d3ba';
const SHOPIFY_SCOPES = [
  'read_products',
  'write_products',
  'read_orders',
  'write_orders',
  'read_inventory',
  'write_inventory',
  'read_fulfillments',
  'write_fulfillments',
  'read_customers',
  'write_customers',
  'read_analytics',
].join(',');

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shop = searchParams.get('shop');
    const userId = searchParams.get('userId');
    const storeId = searchParams.get('storeId');
    const reconnect = searchParams.get('reconnect') === 'true';

    if (!shop || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Generate a unique state for CSRF protection
    const state = generateId();

    // Store the state and user info in session/cache for validation in callback
    // TODO: Implement proper state storage (Redis/Firestore/etc)

    // Build the authorization URL
    const nonce = generateId();
    const host = shop.replace('https://', '').replace('http://', '');
    
    // Create base callback URL
    const baseCallbackUrl = `${APP_URL}/api/shopify/callback`;
    
    // Create state object with necessary data
    const stateData = {
      userId,
      nonce,
      timestamp: Date.now(),
    };
    
    // Encode state data
    const encodedState = Buffer.from(JSON.stringify(stateData)).toString('base64');
    
    // Construct the OAuth URL
    const authUrl = new URL(`https://${host}/admin/oauth/authorize`);
    authUrl.searchParams.set('client_id', SHOPIFY_API_KEY);
    authUrl.searchParams.set('scope', SHOPIFY_SCOPES);
    authUrl.searchParams.set('redirect_uri', baseCallbackUrl);
    authUrl.searchParams.set('state', encodedState);

    // If reconnecting, add store ID to state
    if (reconnect && storeId) {
      // TODO: Add storeId to state storage
    }

    // Validate the store isn't already connected (unless reconnecting)
    if (!reconnect) {
      try {
        await StoreModel.validateNewConnection(userId, 'shopify', host);
      } catch (err: any) {
        return NextResponse.json(
          { error: err.message || 'Store validation failed' },
          { status: 400 }
        );
      }
    }

    console.log('Redirecting to Shopify OAuth:', {
      shop: host,
      redirectUri: baseCallbackUrl,
      authUrl: authUrl.toString()
    });

    return NextResponse.redirect(authUrl.toString());
  } catch (error) {
    console.error('Shopify initiate error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 