"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.processShopifyWebhook = exports.onStoreConnected = exports.scheduledShopifySync = void 0;
const functions = __importStar(require("firebase-functions"));
const shopify_1 = require("./services/shopify");
const bigquery_1 = require("./services/bigquery");
const store_1 = require("./models/store");
const firebase_1 = require("./services/firebase");
const crypto = __importStar(require("crypto"));
// Scheduled sync every hour
exports.scheduledShopifySync = functions.pubsub.schedule('0 * * * *').onRun(async (context) => {
    console.log('Starting scheduled Shopify sync');
    try {
        // Get all connected Shopify stores
        const stores = await store_1.StoreModel.getAllConnectedStores('shopify');
        for (const store of stores) {
            try {
                await shopify_1.ShopifyService.syncStoreData(store.id);
                console.log(`Successfully synced store: ${store.storeName}`);
            }
            catch (error) {
                console.error(`Failed to sync store ${store.storeName}:`, error);
                // Continue with other stores
            }
        }
        console.log('Scheduled sync completed');
    }
    catch (error) {
        console.error('Scheduled sync failed:', error);
    }
});
// Real-time sync on store connection
exports.onStoreConnected = functions.firestore
    .document('stores/{storeId}')
    .onWrite(async (change, context) => {
    const storeData = change.after.data();
    if ((storeData === null || storeData === void 0 ? void 0 : storeData.status) === 'connected' && (storeData === null || storeData === void 0 ? void 0 : storeData.provider) === 'shopify') {
        console.log(`New store connected: ${storeData.storeName}`);
        try {
            // Initial sync
            await shopify_1.ShopifyService.syncStoreData(context.params.storeId);
            console.log(`Initial sync completed for: ${storeData.storeName}`);
        }
        catch (error) {
            console.error(`Initial sync failed for ${storeData.storeName}:`, error);
        }
    }
});
// Process webhook events
exports.processShopifyWebhook = functions.https.onRequest(async (req, res) => {
    const topic = req.headers['x-shopify-topic'];
    const shop = req.headers['x-shopify-shop-domain'];
    const hmac = req.headers['x-shopify-hmac-sha256'];
    // Verify webhook authenticity
    if (!verifyWebhook(req.body, hmac)) {
        res.status(401).send('Unauthorized');
        return;
    }
    try {
        switch (topic) {
            case 'products/create':
            case 'products/update':
                await handleProductUpdate(shop, req.body);
                break;
            case 'orders/create':
            case 'orders/updated':
                await handleOrderUpdate(shop, req.body);
                break;
            case 'app/uninstalled':
                await handleAppUninstall(shop);
                break;
        }
        res.status(200).send('OK');
    }
    catch (error) {
        console.error('Webhook processing error:', error);
        res.status(500).send('Internal Server Error');
    }
});
function verifyWebhook(body, hmac) {
    const webhookSecret = process.env.SHOPIFY_WEBHOOK_SECRET;
    if (!webhookSecret) {
        console.error('SHOPIFY_WEBHOOK_SECRET not configured');
        return false;
    }
    const calculatedHmac = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(body))
        .digest('base64');
    return crypto.timingSafeEqual(Buffer.from(calculatedHmac), Buffer.from(hmac));
}
async function handleAppUninstall(shop) {
    console.log(`App uninstalled for shop: ${shop}`);
    try {
        const store = await store_1.StoreModel.getByDomain(shop);
        if (store) {
            // Update store status to disconnected
            await firebase_1.FirebaseService.updateStoreLastSync(store.id);
            console.log(`Store ${shop} marked as disconnected`);
        }
    }
    catch (error) {
        console.error(`Error handling app uninstall for ${shop}:`, error);
    }
}
async function handleProductUpdate(shop, product) {
    const store = await store_1.StoreModel.getByDomain(shop);
    if (!store)
        return;
    // Update product in Firebase
    const transformedProduct = shopify_1.ShopifyService.transformProduct(product, store.id);
    await firebase_1.FirebaseService.saveProduct(store.id, transformedProduct);
    // Log event to BigQuery
    await bigquery_1.BigQueryService.insertProductEvent({
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
async function handleOrderUpdate(shop, order) {
    var _a, _b, _c, _d;
    const store = await store_1.StoreModel.getByDomain(shop);
    if (!store)
        return;
    // Process each line item
    for (const lineItem of order.line_items) {
        await bigquery_1.BigQueryService.insertProductEvent({
            event_id: `webhook_order_${order.id}_${lineItem.id}`,
            user_id: (_b = (_a = order.customer) === null || _a === void 0 ? void 0 : _a.id) === null || _b === void 0 ? void 0 : _b.toString(),
            session_id: order.checkout_token,
            store_id: store.id,
            product_id: lineItem.product_id.toString(),
            variant_id: (_c = lineItem.variant_id) === null || _c === void 0 ? void 0 : _c.toString(),
            event_type: 'purchase',
            timestamp: order.created_at,
            quantity: lineItem.quantity,
            price: parseFloat(lineItem.price),
            currency: order.currency,
            country: (_d = order.shipping_address) === null || _d === void 0 ? void 0 : _d.country,
        });
    }
}
//# sourceMappingURL=shopify-sync.js.map