import { StoreModel } from '../models/store';
import { BigQueryService } from './bigquery';
import { FirebaseService } from './firebase';

export interface ShopifyProduct {
  id: string;
  title: string;
  body_html: string;
  vendor: string;
  product_type: string;
  created_at: string;
  updated_at: string;
  status: string;
  tags: string;
  variants: any[];
  images: any[];
}

export interface ShopifyOrder {
  id: string;
  created_at: string;
  line_items: any[];
  customer: any;
  checkout_token: string;
  currency: string;
  total_discounts: string;
  shipping_address: any;
}

export class ShopifyService {
  static async makeRequest(
    storeUrl: string,
    accessToken: string,
    endpoint: string,
    options: RequestInit = {}
  ) {
    const url = `https://${storeUrl}/admin/api/2024-04/${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  static async getProducts(storeId: string, limit = 250): Promise<ShopifyProduct[]> {
    const store = await StoreModel.getById(storeId);
    if (!store || !store.accessToken) {
      throw new Error('Store not found or not connected');
    }

    const data = await this.makeRequest(
      store.storeUrl,
      store.accessToken,
      `products.json?limit=${limit}`
    );

    return data.products;
  }

  static async getOrders(storeId: string, limit = 250): Promise<ShopifyOrder[]> {
    const store = await StoreModel.getById(storeId);
    if (!store || !store.accessToken) {
      throw new Error('Store not found or not connected');
    }

    const data = await this.makeRequest(
      store.storeUrl,
      store.accessToken,
      `orders.json?limit=${limit}&status=any`
    );

    return data.orders;
  }

  static async syncStoreData(storeId: string): Promise<void> {
    console.log(`Starting sync for store ${storeId}`);
    
    try {
      await this.syncProducts(storeId);
      await this.syncOrders(storeId);
      await StoreModel.updateLastSync(storeId);
      
      console.log(`Sync completed for store ${storeId}`);
    } catch (error) {
      console.error(`Sync failed for store ${storeId}:`, error);
      throw error;
    }
  }

  private static async syncProducts(storeId: string): Promise<void> {
    const products = await this.getProducts(storeId);
    
    for (const product of products) {
      const transformedProduct = this.transformProduct(product, storeId);
      await FirebaseService.saveProduct(storeId, transformedProduct);
      
      await BigQueryService.insertProductEvent({
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

  private static async syncOrders(storeId: string): Promise<void> {
    const orders = await this.getOrders(storeId);
    
    for (const order of orders) {
      for (const lineItem of order.line_items) {
        await BigQueryService.insertProductEvent({
          event_id: `order_${order.id}_${lineItem.id}`,
          user_id: order.customer?.id?.toString(),
          session_id: order.checkout_token,
          store_id: storeId,
          product_id: lineItem.product_id.toString(),
          variant_id: lineItem.variant_id?.toString(),
          event_type: 'purchase',
          timestamp: order.created_at,
          quantity: lineItem.quantity,
          price: parseFloat(lineItem.price),
          currency: order.currency,
          discount_amount: parseFloat(order.total_discounts),
          country: order.shipping_address?.country,
        });
      }
    }
  }

  static transformProduct(shopifyProduct: ShopifyProduct, storeId: string) {
    return {
      id: shopifyProduct.id,
      storeId,
      title: shopifyProduct.title,
      description: shopifyProduct.body_html,
      vendor: shopifyProduct.vendor,
      productType: shopifyProduct.product_type,
      status: shopifyProduct.status,
      tags: shopifyProduct.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      images: shopifyProduct.images.map((img: any) => ({
        id: img.id,
        src: img.src,
        altText: img.alt,
        width: img.width,
        height: img.height,
        position: img.position,
      })),
      variants: shopifyProduct.variants.map((variant: any) => ({
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