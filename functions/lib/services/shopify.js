"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopifyService = void 0;
const store_1 = require("../models/store");
const bigquery_1 = require("./bigquery");
const firebase_1 = require("./firebase");
class ShopifyService {
    static async makeRequest(storeUrl, accessToken, endpoint, options = {}) {
        const url = `https://${storeUrl}/admin/api/2024-04/${endpoint}`;
        const response = await fetch(url, Object.assign(Object.assign({}, options), { headers: Object.assign({ 'X-Shopify-Access-Token': accessToken, 'Content-Type': 'application/json' }, options.headers) }));
        if (!response.ok) {
            throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
        }
        return response.json();
    }
    static async getProducts(storeId, limit = 250) {
        const store = await store_1.StoreModel.getById(storeId);
        if (!store || !store.accessToken) {
            throw new Error('Store not found or not connected');
        }
        const data = await this.makeRequest(store.storeUrl, store.accessToken, `products.json?limit=${limit}`);
        return data.products;
    }
    static async getOrders(storeId, limit = 250) {
        const store = await store_1.StoreModel.getById(storeId);
        if (!store || !store.accessToken) {
            throw new Error('Store not found or not connected');
        }
        const data = await this.makeRequest(store.storeUrl, store.accessToken, `orders.json?limit=${limit}&status=any`);
        return data.orders;
    }
    static async syncStoreData(storeId) {
        console.log(`Starting sync for store ${storeId}`);
        try {
            await this.syncProducts(storeId);
            await this.syncOrders(storeId);
            await store_1.StoreModel.updateLastSync(storeId);
            console.log(`Sync completed for store ${storeId}`);
        }
        catch (error) {
            console.error(`Sync failed for store ${storeId}:`, error);
            throw error;
        }
    }
    static async syncProducts(storeId) {
        const products = await this.getProducts(storeId);
        for (const product of products) {
            const transformedProduct = this.transformProduct(product, storeId);
            await firebase_1.FirebaseService.saveProduct(storeId, transformedProduct);
            await bigquery_1.BigQueryService.insertProductEvent({
                event_id: `sync_${product.id}_${Date.now()}`,
                store_id: storeId,
                product_id: product.id,
                event_type: 'sync',
                timestamp: new Date().toISOString(),
                metadata: {
                    title: product.title,
                    vendor: product.vendor,
                    product_type: product.product_type,
                    status: product.status,
                }
            });
        }
    }
    static async syncOrders(storeId) {
        var _a, _b, _c, _d;
        const orders = await this.getOrders(storeId);
        for (const order of orders) {
            for (const lineItem of order.line_items) {
                await bigquery_1.BigQueryService.insertProductEvent({
                    event_id: `order_${order.id}_${lineItem.id}`,
                    user_id: (_b = (_a = order.customer) === null || _a === void 0 ? void 0 : _a.id) === null || _b === void 0 ? void 0 : _b.toString(),
                    session_id: order.checkout_token,
                    store_id: storeId,
                    product_id: lineItem.product_id.toString(),
                    variant_id: (_c = lineItem.variant_id) === null || _c === void 0 ? void 0 : _c.toString(),
                    event_type: 'purchase',
                    timestamp: order.created_at,
                    quantity: lineItem.quantity,
                    price: parseFloat(lineItem.price),
                    currency: order.currency,
                    discount_amount: parseFloat(order.total_discounts),
                    country: (_d = order.shipping_address) === null || _d === void 0 ? void 0 : _d.country,
                });
            }
        }
    }
    static transformProduct(shopifyProduct, storeId) {
        return {
            id: shopifyProduct.id,
            storeId,
            title: shopifyProduct.title,
            description: shopifyProduct.body_html,
            vendor: shopifyProduct.vendor,
            productType: shopifyProduct.product_type,
            status: shopifyProduct.status,
            tags: shopifyProduct.tags.split(',').map(tag => tag.trim()).filter(Boolean),
            images: shopifyProduct.images.map((img) => ({
                id: img.id,
                src: img.src,
                altText: img.alt,
                width: img.width,
                height: img.height,
                position: img.position,
            })),
            variants: shopifyProduct.variants.map((variant) => ({
                id: variant.id,
                title: variant.title,
                price: parseFloat(variant.price),
                compareAtPrice: variant.compare_at_price ? parseFloat(variant.compare_at_price) : undefined,
                sku: variant.sku,
                inventory: variant.inventory_quantity,
            })),
            createdAt: new Date(shopifyProduct.created_at),
            updatedAt: new Date(shopifyProduct.updated_at),
        };
    }
}
exports.ShopifyService = ShopifyService;
//# sourceMappingURL=shopify.js.map