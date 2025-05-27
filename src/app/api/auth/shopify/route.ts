import { NextRequest, NextResponse } from 'next/server';
import { StoreModel } from '@/lib/models/store';
import { createHmac } from 'crypto';

const SHOPIFY_CLIENT_ID = process.env.SHOPIFY_CLIENT_ID!;
const SHOPIFY_CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET!;
const SHOPIFY_SCOPES = 'read_products,write_products,read_orders';
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/shopify/callback`;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const shop = searchParams.get('shop');

  if (!shop) {
    return NextResponse.json({ error: 'Missing shop parameter' }, { status: 400 });
  }

  // Generate a nonce state for security
  const state = Math.random().toString(36).substring(7);

  // Store the state in the session or database for validation later

  const authUrl = `https://${shop}/admin/oauth/authorize?` + new URLSearchParams({
    client_id: SHOPIFY_CLIENT_ID,
    scope: SHOPIFY_SCOPES,
    redirect_uri: REDIRECT_URI,
    state: state,
  });

  return NextResponse.redirect(authUrl);
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { code, shop, state, hmac } = data;

    // Verify HMAC
    const message = new URLSearchParams(data).toString();
    const generatedHash = createHmac('sha256', SHOPIFY_CLIENT_SECRET)
      .update(message)
      .digest('hex');

    if (generatedHash !== hmac) {
      return NextResponse.json({ error: 'Invalid HMAC' }, { status: 400 });
    }

    // Exchange code for access token
    const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: SHOPIFY_CLIENT_ID,
        client_secret: SHOPIFY_CLIENT_SECRET,
        code,
      }),
    });

    const { access_token, scope } = await tokenResponse.json();

    // Create or update store in database
    const store = await StoreModel.create({
      provider: 'shopify',
      status: 'connected',
      storeName: shop,
      storeUrl: `https://${shop}`,
      accessToken: access_token,
      scope,
    });

    return NextResponse.json({ success: true, store });
  } catch (error) {
    console.error('Shopify OAuth Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 