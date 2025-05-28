import * as functions from 'firebase-functions';
import { ShopifyService } from './services/shopify';
import { BigQueryService } from './services/bigquery';
import { StoreModel } from './models/store';
import { FirebaseService } from './services/firebase';
import * as crypto from 'crypto';

// Scheduled sync every hour
export const scheduledShopifySync = functions.pubsub.schedule('0 * * * *').onRun(async (context) => {
  console.log('Starting scheduled Shopify sync');
  
  try {
    // Get all connected Shopify stores
    const stores = await StoreModel.getAllConnectedStores('shopify');
    
    for (const store of stores) {
      try {
        await ShopifyService.syncStoreData(store.id);
        console.log(`Successfully synced store: ${store.storeName}`);
      } catch (error) {
        console.error(`Failed to sync store ${store.storeName}:`, error);
        // Continue with other stores
      }
    }
    
    console.log('Scheduled sync completed');
  } catch (error) {
    console.error('Scheduled sync failed:', error);
  }
});

// Real-time sync on store connection
export const onStoreConnected = functions.firestore
  .document('stores/{storeId}')
  .onWrite(async (change, context) => {
    const storeData = change.after.data();
    
    if (storeData?.status === 'connected' && storeData?.provider === 'shopify') {
      console.log(`New store connected: ${storeData.storeName}`);
      
      try {
        // Initial sync
        await ShopifyService.syncStoreData(context.params.storeId);
        console.log(`Initial sync completed for: ${storeData.storeName}`);
      } catch (error) {
        console.error(`Initial sync failed for ${storeData.storeName}:`, error);
      }
    }
  });

// Process webhook events
export const processShopifyWebhook = functions.https.onRequest(async (req, res) => {
  const topic = req.headers['x-shopify-topic'];
  const shop = req.headers['x-shopify-shop-domain'];
  const hmac = req.headers['x-shopify-hmac-sha256'];
  
  // Verify webhook authenticity
  if (!verifyWebhook(req.body, hmac as string)) {
    res.status(401).send('Unauthorized');
    return;
  }
  
  try {
    switch (topic) {
      case 'products/create':
      case 'products/update':
        await handleProductUpdate(shop as string, req.body);
        break;
        
      case 'orders/create':
      case 'orders/updated':
        await handleOrderUpdate(shop as string, req.body);
        break;
        
      case 'app/uninstalled':
        await handleAppUninstall(shop as string);
        break;
    }
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).send('Internal Server Error');
  }
});

function verifyWebhook(body: any, hmac: string): boolean {
  const webhookSecret = process.env.SHOPIFY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('SHOPIFY_WEBHOOK_SECRET not configured');
    return false;
  }

  const calculatedHmac = crypto
    .createHmac('sha256', webhookSecret)
    .update(JSON.stringify(body))
    .digest('base64');

  return crypto.timingSafeEqual(
    Buffer.from(calculatedHmac),
    Buffer.from(hmac)
  );
}

async function handleAppUninstall(shop: string): Promise<void> {
  console.log(`App uninstalled for shop: ${shop}`);
  
  try {
    const store = await StoreModel.getByDomain(shop);
    if (store) {
      // Update store status to disconnected
      await FirebaseService.updateStoreLastSync(store.id);
      console.log(`Store ${shop} marked as disconnected`);
    }
  } catch (error) {
    console.error(`Error handling app uninstall for ${shop}:`, error);
  }
}

async function handleProductUpdate(shop: string, product: any) {
  const store = await StoreModel.getByDomain(shop);
  if (!store) return;
  
  // Update product in Firebase
  const transformedProduct = ShopifyService.transformProduct(product, store.id);
  await FirebaseService.saveProduct(store.id, transformedProduct);
  
  // Log event to BigQuery
  await BigQueryService.insertProductEvent({
    event_id: `webhook_${product.id}_${Date.now()}`,
    store_id: store.id,
    product_id: product.id,
    event_type: 'update',
    timestamp: new Date().toISOString(),
    metadata: {
      title: product.title,
      status: product.status,
      updated_at: product.updated_at,
    }
  });
}

async function handleOrderUpdate(shop: string, order: any) {
  const store = await StoreModel.getByDomain(shop);
  if (!store) return;
  
  // Process each line item
  for (const lineItem of order.line_items) {
    await BigQueryService.insertProductEvent({
      event_id: `webhook_order_${order.id}_${lineItem.id}`,
      user_id: order.customer?.id?.toString(),
      session_id: order.checkout_token,
      store_id: store.id,
      product_id: lineItem.product_id.toString(),
      variant_id: lineItem.variant_id?.toString(),
      event_type: 'purchase',
      timestamp: order.created_at,
      quantity: lineItem.quantity,
      price: parseFloat(lineItem.price),
      currency: order.currency,
      country: order.shipping_address?.country,
    });
  }
} 