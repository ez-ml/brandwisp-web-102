import { StoreModel } from '@/lib/models/store';
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
  published_at: string;
  template_suffix: string;
  status: string;
  published_scope: string;
  tags: string;
  admin_graphql_api_id: string;
  variants: ShopifyVariant[];
  options: ShopifyOption[];
  images: ShopifyImage[];
  image: ShopifyImage;
}

export interface ShopifyVariant {
  id: string;
  product_id: string;
  title: string;
  price: string;
  sku: string;
  position: number;
  inventory_policy: string;
  compare_at_price: string;
  fulfillment_service: string;
  inventory_management: string;
  option1: string;
  option2: string;
  option3: string;
  created_at: string;
  updated_at: string;
  taxable: boolean;
  barcode: string;
  grams: number;
  image_id: string;
  weight: number;
  weight_unit: string;
  inventory_item_id: string;
  inventory_quantity: number;
  old_inventory_quantity: number;
  requires_shipping: boolean;
  admin_graphql_api_id: string;
}

export interface ShopifyOption {
  id: string;
  product_id: string;
  name: string;
  position: number;
  values: string[];
}

export interface ShopifyImage {
  id: string;
  product_id: string;
  position: number;
  created_at: string;
  updated_at: string;
  alt: string;
  width: number;
  height: number;
  src: string;
  variant_ids: string[];
  admin_graphql_api_id: string;
}

export interface ShopifyOrder {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  number: number;
  note: string;
  token: string;
  gateway: string;
  test: boolean;
  total_price: string;
  subtotal_price: string;
  total_weight: number;
  total_tax: string;
  taxes_included: boolean;
  currency: string;
  financial_status: string;
  confirmed: boolean;
  total_discounts: string;
  buyer_accepts_marketing: boolean;
  name: string;
  referring_site: string;
  landing_site: string;
  cancelled_at: string;
  cancel_reason: string;
  total_price_usd: string;
  checkout_token: string;
  reference: string;
  user_id: string;
  location_id: string;
  source_identifier: string;
  source_url: string;
  processed_at: string;
  device_id: string;
  phone: string;
  customer_locale: string;
  app_id: number;
  browser_ip: string;
  landing_site_ref: string;
  order_number: number;
  discount_applications: any[];
  discount_codes: any[];
  note_attributes: any[];
  payment_gateway_names: string[];
  processing_method: string;
  checkout_id: string;
  source_name: string;
  fulfillment_status: string;
  tax_lines: any[];
  tags: string;
  contact_email: string;
  order_status_url: string;
  presentment_currency: string;
  total_line_items_price_set: any;
  total_discounts_set: any;
  total_shipping_price_set: any;
  subtotal_price_set: any;
  total_price_set: any;
  total_tax_set: any;
  line_items: ShopifyLineItem[];
  shipping_lines: any[];
  billing_address: ShopifyAddress;
  shipping_address: ShopifyAddress;
  fulfillments: any[];
  client_details: any;
  refunds: any[];
  customer: ShopifyCustomer;
}

export interface ShopifyLineItem {
  id: string;
  variant_id: string;
  title: string;
  quantity: number;
  sku: string;
  variant_title: string;
  vendor: string;
  fulfillment_service: string;
  product_id: string;
  requires_shipping: boolean;
  taxable: boolean;
  gift_card: boolean;
  name: string;
  variant_inventory_management: string;
  properties: any[];
  product_exists: boolean;
  fulfillable_quantity: number;
  grams: number;
  price: string;
  total_discount: string;
  fulfillment_status: string;
  price_set: any;
  total_discount_set: any;
  discount_allocations: any[];
  duties: any[];
  admin_graphql_api_id: string;
  tax_lines: any[];
}

export interface ShopifyAddress {
  first_name: string;
  address1: string;
  phone: string;
  city: string;
  zip: string;
  province: string;
  country: string;
  last_name: string;
  address2: string;
  company: string;
  latitude: number;
  longitude: number;
  name: string;
  country_code: string;
  province_code: string;
}

export interface ShopifyCustomer {
  id: string;
  email: string;
  accepts_marketing: boolean;
  created_at: string;
  updated_at: string;
  first_name: string;
  last_name: string;
  orders_count: number;
  state: string;
  total_spent: string;
  last_order_id: string;
  note: string;
  verified_email: boolean;
  multipass_identifier: string;
  tax_exempt: boolean;
  phone: string;
  tags: string;
  last_order_name: string;
  currency: string;
  addresses: ShopifyAddress[];
  accepts_marketing_updated_at: string;
  marketing_opt_in_level: string;
  tax_exemptions: any[];
  admin_graphql_api_id: string;
  default_address: ShopifyAddress;
}

export class ShopifyService {
  private static async makeRequest(
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

  // Product Operations
  static async getProducts(storeId: string, limit = 250): Promise<ShopifyProduct[]> {
    const store = await StoreModel.getById(storeId);
    if (!store || !store.accessToken) {
      throw new Error('Store not found or not connected');
    }

    const data = await this.makeRequest(
      store.storeUrl,
      store.accessToken,
      `products.json?limit=${limit}&fields=id,title,body_html,vendor,product_type,created_at,updated_at,published_at,status,tags,variants,images,options`
    );

    return data.products;
  }

  static async getProduct(storeId: string, productId: string): Promise<ShopifyProduct> {
    const store = await StoreModel.getById(storeId);
    if (!store || !store.accessToken) {
      throw new Error('Store not found or not connected');
    }

    const data = await this.makeRequest(
      store.storeUrl,
      store.accessToken,
      `products/${productId}.json`
    );

    return data.product;
  }

  // Order Operations
  static async getOrders(storeId: string, limit = 250, status = 'any'): Promise<ShopifyOrder[]> {
    const store = await StoreModel.getById(storeId);
    if (!store || !store.accessToken) {
      throw new Error('Store not found or not connected');
    }

    const data = await this.makeRequest(
      store.storeUrl,
      store.accessToken,
      `orders.json?limit=${limit}&status=${status}&financial_status=any&fulfillment_status=any`
    );

    return data.orders;
  }

  // Analytics Operations
  static async getProductAnalytics(storeId: string, productId: string): Promise<any> {
    // This would integrate with Shopify Analytics API when available
    // For now, we'll use order data to calculate analytics
    const orders = await this.getOrders(storeId);
    
    const productOrders = orders.filter(order => 
      order.line_items.some(item => item.product_id.toString() === productId)
    );

    const analytics = {
      totalOrders: productOrders.length,
      totalRevenue: productOrders.reduce((sum, order) => {
        const productLineItems = order.line_items.filter(item => 
          item.product_id.toString() === productId
        );
        return sum + productLineItems.reduce((itemSum, item) => 
          itemSum + parseFloat(item.price) * item.quantity, 0
        );
      }, 0),
      totalQuantitySold: productOrders.reduce((sum, order) => {
        const productLineItems = order.line_items.filter(item => 
          item.product_id.toString() === productId
        );
        return sum + productLineItems.reduce((itemSum, item) => 
          itemSum + item.quantity, 0
        );
      }, 0),
    };

    return analytics;
  }

  // Sync Operations
  static async syncStoreData(storeId: string): Promise<void> {
    console.log(`Starting sync for store ${storeId}`);
    
    try {
      // Sync products
      await this.syncProducts(storeId);
      
      // Sync orders
      await this.syncOrders(storeId);
      
      // Update last sync time
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
      // Transform Shopify product to our format
      const transformedProduct = this.transformProduct(product, storeId);
      
      // Save to Firebase
      await FirebaseService.saveProduct(storeId, transformedProduct);
      
      // Send to BigQuery for analytics
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
      // Process each line item as a product event
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
      images: shopifyProduct.images.map(img => ({
        id: img.id,
        src: img.src,
        altText: img.alt,
        width: img.width,
        height: img.height,
        position: img.position,
      })),
      variants: shopifyProduct.variants.map(variant => ({
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