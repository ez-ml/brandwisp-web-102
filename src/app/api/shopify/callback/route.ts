import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { StoreModel } from '@/lib/models/store';
import { StoreConnection } from '@/types/store';

const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY || '2201af5d5088a5692cffec6cc854d3ba';
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET || '73ff4879dd719687346c661c115b7753';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shop = searchParams.get('shop');
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const hmac = searchParams.get('hmac');
    const host = searchParams.get('host');
    const timestamp = searchParams.get('timestamp');

    if (!shop || !code || !state || !hmac) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Decode state data
    let stateData;
    try {
      const decodedState = Buffer.from(state, 'base64').toString();
      stateData = JSON.parse(decodedState);
    } catch (err) {
      console.error('Failed to decode state:', err);
      return NextResponse.json(
        { error: 'Invalid state parameter' },
        { status: 400 }
      );
    }

    const { userId, nonce, timestamp: stateTimestamp } = stateData;

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing user ID in state' },
        { status: 400 }
      );
    }

    // Verify HMAC
    const message = new URLSearchParams(searchParams);
    message.delete('hmac');
    const generatedHash = createHmac('sha256', SHOPIFY_API_SECRET)
      .update(message.toString())
      .digest('hex');

    if (generatedHash !== hmac) {
      return NextResponse.json({ error: 'Invalid HMAC' }, { status: 401 });
    }

    // TODO: Validate state from session/cache

    console.log('Exchanging code for access token:', {
      shop,
      code,
      timestamp
    });

    // Exchange code for access token
    const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: SHOPIFY_API_KEY,
        client_secret: SHOPIFY_API_SECRET,
        code,
      }),
    });

    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', await tokenResponse.text());
      throw new Error('Failed to exchange code for token');
    }

    const { access_token, scope } = await tokenResponse.json();

    console.log('Successfully obtained access token');

    // Get shop info
    const shopResponse = await fetch(`https://${shop}/admin/api/2024-01/shop.json`, {
      headers: {
        'X-Shopify-Access-Token': access_token,
        'Content-Type': 'application/json',
      },
    });

    if (!shopResponse.ok) {
      console.error('Shop info fetch failed:', await shopResponse.text());
      throw new Error('Failed to fetch shop info');
    }

    const { shop: shopData } = await shopResponse.json();

    console.log('Successfully fetched shop info:', {
      name: shopData.name,
      email: shopData.email,
      plan: shopData.plan_name
    });

    // Check for existing store
    const existingStores = await StoreModel.getByProvider(userId, 'shopify');
    const existingStore = existingStores.find(s => s.storeUrl === shop);

    let store: StoreConnection;
    if (existingStore) {
      // Update existing store
      await StoreModel.update(existingStore.id, {
        status: 'connected',
        accessToken: access_token,
        scope,
        metadata: {
          email: shopData.email,
          currency: shopData.currency,
          country: shopData.country_name,
          timezone: shopData.iana_timezone,
          plan: shopData.plan_name,
        },
      });
      const updatedStore = await StoreModel.getById(existingStore.id);
      if (!updatedStore) {
        throw new Error('Failed to update store');
      }
      store = updatedStore;
    } else {
      // Create new store
      store = await StoreModel.create({
        userId,
        provider: 'shopify',
        status: 'connected',
        storeName: shopData.name || shop,
        storeUrl: shop,
        accessToken: access_token,
        scope,
        metadata: {
          email: shopData.email,
          currency: shopData.currency,
          country: shopData.country_name,
          timezone: shopData.iana_timezone,
          plan: shopData.plan_name,
        },
      });
    }

    // Register webhooks
    const webhooks = [
      {
        topic: 'app/uninstalled',
        address: `${APP_URL}/api/webhooks/shopify`,
        format: 'json' as const,
        status: 'active' as const,
      },
      // Add more webhooks as needed
    ];

    for (const webhook of webhooks) {
      try {
        const response = await fetch(`https://${shop}/admin/api/2024-01/webhooks.json`, {
          method: 'POST',
          headers: {
            'X-Shopify-Access-Token': access_token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ webhook: {
            topic: webhook.topic,
            address: webhook.address,
            format: webhook.format,
          }}),
        });

        if (response.ok) {
          const { webhook: createdWebhook } = await response.json();
          await StoreModel.addWebhook(store.id, {
            topic: createdWebhook.topic,
            address: createdWebhook.address,
            format: 'json',
            status: 'active',
          });
          console.log('Successfully registered webhook:', webhook.topic);
        } else {
          console.error('Failed to create webhook:', await response.text());
        }
      } catch (err) {
        console.error('Failed to create webhook:', err);
        // Continue even if webhook creation fails
      }
    }

    // Redirect back to settings page
    const redirectUrl = new URL(`${APP_URL}/dashboard/settings`);
    redirectUrl.searchParams.set('success', 'true');
    redirectUrl.searchParams.set('shop', shop);
    
    console.log('Redirecting back to app:', redirectUrl.toString());
    
    return NextResponse.redirect(redirectUrl.toString());
  } catch (error) {
    console.error('Shopify callback error:', error);
    // Redirect to settings page with error
    const errorUrl = new URL(`${APP_URL}/dashboard/settings`);
    errorUrl.searchParams.set('error', 'Failed to connect store');
    return NextResponse.redirect(errorUrl.toString());
  }
} 