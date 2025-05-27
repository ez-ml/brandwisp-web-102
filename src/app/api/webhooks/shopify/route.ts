import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { StoreModel } from '@/lib/models/store';

const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET || '73ff4879dd719687346c661c115b7753';

export async function POST(request: NextRequest) {
  try {
    const hmac = request.headers.get('x-shopify-hmac-sha256');
    const topic = request.headers.get('x-shopify-topic');
    const shop = request.headers.get('x-shopify-shop-domain');

    if (!hmac || !topic || !shop) {
      return NextResponse.json(
        { error: 'Missing required headers' },
        { status: 400 }
      );
    }

    // Get raw body for HMAC validation
    const rawBody = await request.text();
    
    // Verify HMAC
    const generatedHash = createHmac('sha256', SHOPIFY_API_SECRET)
      .update(rawBody)
      .digest('base64');

    if (generatedHash !== hmac) {
      return NextResponse.json({ error: 'Invalid HMAC' }, { status: 401 });
    }

    // Process webhook based on topic
    switch (topic) {
      case 'app/uninstalled': {
        // Handle app uninstallation
        const store = await StoreModel.getActiveByDomain(`https://${shop}`);
        if (store) {
          await StoreModel.disconnect(store.id);
        }
        break;
      }

      case 'products/create':
      case 'products/update':
      case 'products/delete':
        // Handle product updates
        // TODO: Implement product sync
        break;

      case 'orders/create':
      case 'orders/updated':
      case 'orders/cancelled':
        // Handle order updates
        // TODO: Implement order sync
        break;

      default:
        console.log(`Unhandled webhook topic: ${topic}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 