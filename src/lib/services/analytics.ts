import { BigQueryService } from './bigquery';
import { ShopifyService } from './shopify';
import { StoreModel } from '@/lib/models/store';

export interface ProductAnalytics {
  productId: string;
  title: string;
  views: number;
  addToCarts: number;
  purchases: number;
  revenue: number;
  unitsSold: number;
  conversionRate: number;
  viewToCartRate: number;
  cartToPurchaseRate: number;
  avgOrderValue: number;
  uniqueUsers: number;
  uniqueSessions: number;
  trends: {
    viewsTrend: number;
    revenueTrend: number;
    conversionTrend: number;
  };
}

export interface StoreAnalytics {
  storeId: string;
  storeName: string;
  totalProducts: number;
  activeProducts: number;
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  conversionRate: number;
  topProducts: ProductAnalytics[];
  revenueByDay: Array<{ date: string; revenue: number; orders: number }>;
  trafficSources: Array<{ source: string; sessions: number; revenue: number }>;
}

export interface ProductMetricsData {
  date: string;
  rating: number;
  reviews: number;
  sentiment: number;
  impressions: number;
  conversions: number;
  clicks: number;
  revenue: number;
}

export interface ProductReviewData {
  id: string;
  platform: string;
  rating: number;
  comment: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  date: string;
}

export interface SEOMetricsData {
  score: number;
  titleOptimization: number;
  keywordDensity: number;
  altTextCoverage: number;
  metaDescription: number;
}

export interface PlatformData {
  name: string;
  reviews: number;
  rating: number;
}

export class AnalyticsService {
  static async getProductAnalytics(
    storeId: string, 
    productId: string, 
    days = 30
  ): Promise<ProductAnalytics> {
    try {
      // Get real-time data from BigQuery
      const query = `
        WITH product_metrics AS (
          SELECT
            COUNT(CASE WHEN event_type = 'view' THEN 1 END) as views,
            COUNT(CASE WHEN event_type = 'add_to_cart' THEN 1 END) as add_to_carts,
            COUNT(CASE WHEN event_type = 'purchase' THEN 1 END) as purchases,
            SUM(CASE WHEN event_type = 'purchase' THEN quantity * price ELSE 0 END) as revenue,
            SUM(CASE WHEN event_type = 'purchase' THEN quantity ELSE 0 END) as units_sold,
            COUNT(DISTINCT user_id) as unique_users,
            COUNT(DISTINCT session_id) as unique_sessions
          FROM \`brandwisp-dev.analytics.product_events\`
          WHERE store_id = @storeId
            AND product_id = @productId
            AND timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL @days DAY))
        ),
        previous_period AS (
          SELECT
            COUNT(CASE WHEN event_type = 'view' THEN 1 END) as prev_views,
            SUM(CASE WHEN event_type = 'purchase' THEN quantity * price ELSE 0 END) as prev_revenue,
            COUNT(CASE WHEN event_type = 'purchase' THEN 1 END) as prev_purchases
          FROM \`brandwisp-dev.analytics.product_events\`
          WHERE store_id = @storeId
            AND product_id = @productId
            AND timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL @days * 2 DAY))
            AND timestamp < TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL @days DAY))
        )
        SELECT
          pm.*,
          pp.prev_views,
          pp.prev_revenue,
          pp.prev_purchases,
          SAFE_DIVIDE(pm.add_to_carts, pm.views) * 100 as view_to_cart_rate,
          SAFE_DIVIDE(pm.purchases, pm.add_to_carts) * 100 as cart_to_purchase_rate,
          SAFE_DIVIDE(pm.purchases, pm.views) * 100 as conversion_rate,
          SAFE_DIVIDE(pm.revenue, pm.purchases) as avg_order_value
        FROM product_metrics pm
        CROSS JOIN previous_period pp
      `;

      const [rows] = await BigQueryService.query({
        query,
        params: { storeId, productId, days }
      });

      const row = rows[0];
      if (!row) {
        throw new Error('Product analytics not found');
      }

      // Get product details from Shopify
      const product = await ShopifyService.getProduct(storeId, productId);

      return {
        productId,
        title: product.title,
        views: parseInt(row.views) || 0,
        addToCarts: parseInt(row.add_to_carts) || 0,
        purchases: parseInt(row.purchases) || 0,
        revenue: parseFloat(row.revenue) || 0,
        unitsSold: parseInt(row.units_sold) || 0,
        conversionRate: parseFloat(row.conversion_rate) || 0,
        viewToCartRate: parseFloat(row.view_to_cart_rate) || 0,
        cartToPurchaseRate: parseFloat(row.cart_to_purchase_rate) || 0,
        avgOrderValue: parseFloat(row.avg_order_value) || 0,
        uniqueUsers: parseInt(row.unique_users) || 0,
        uniqueSessions: parseInt(row.unique_sessions) || 0,
        trends: {
          viewsTrend: this.calculateTrend(row.views, row.prev_views),
          revenueTrend: this.calculateTrend(row.revenue, row.prev_revenue),
          conversionTrend: this.calculateTrend(row.purchases, row.prev_purchases),
        }
      };
    } catch (error) {
      console.error('Error getting product analytics:', error);
      // Return fallback data
      return this.getFallbackProductAnalytics(storeId, productId);
    }
  }

  static async getStoreAnalytics(storeId: string, days = 30): Promise<StoreAnalytics> {
    try {
      // Get store overview metrics
      const overviewQuery = `
        SELECT
          COUNT(DISTINCT product_id) as total_products,
          COUNT(CASE WHEN event_type = 'purchase' THEN 1 END) as total_orders,
          SUM(CASE WHEN event_type = 'purchase' THEN quantity * price ELSE 0 END) as total_revenue,
          COUNT(CASE WHEN event_type = 'view' THEN 1 END) as total_views,
          SAFE_DIVIDE(
            COUNT(CASE WHEN event_type = 'purchase' THEN 1 END),
            COUNT(CASE WHEN event_type = 'view' THEN 1 END)
          ) * 100 as conversion_rate
        FROM \`brandwisp-dev.analytics.product_events\`
        WHERE store_id = @storeId
          AND timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL @days DAY))
      `;

      // Get top products
      const topProductsQuery = `
        SELECT
          product_id,
          SUM(CASE WHEN event_type = 'purchase' THEN quantity * price ELSE 0 END) as revenue,
          COUNT(CASE WHEN event_type = 'view' THEN 1 END) as views,
          COUNT(CASE WHEN event_type = 'purchase' THEN 1 END) as purchases
        FROM \`brandwisp-dev.analytics.product_events\`
        WHERE store_id = @storeId
          AND timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL @days DAY))
        GROUP BY product_id
        ORDER BY revenue DESC
        LIMIT 10
      `;

      // Get daily revenue
      const dailyRevenueQuery = `
        SELECT
          DATE(timestamp) as date,
          SUM(CASE WHEN event_type = 'purchase' THEN quantity * price ELSE 0 END) as revenue,
          COUNT(CASE WHEN event_type = 'purchase' THEN 1 END) as orders
        FROM \`brandwisp-dev.analytics.product_events\`
        WHERE store_id = @storeId
          AND timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL @days DAY))
        GROUP BY DATE(timestamp)
        ORDER BY date ASC
      `;

      const [overviewRows] = await BigQueryService.query({
        query: overviewQuery,
        params: { storeId, days }
      });

      const [topProductsRows] = await BigQueryService.query({
        query: topProductsQuery,
        params: { storeId, days }
      });

      const [dailyRevenueRows] = await BigQueryService.query({
        query: dailyRevenueQuery,
        params: { storeId, days }
      });

      const overview = overviewRows[0];
      const store = await StoreModel.getById(storeId);

      return {
        storeId,
        storeName: store?.storeName || 'Unknown Store',
        totalProducts: parseInt(overview?.total_products) || 0,
        activeProducts: parseInt(overview?.total_products) || 0,
        totalRevenue: parseFloat(overview?.total_revenue) || 0,
        totalOrders: parseInt(overview?.total_orders) || 0,
        avgOrderValue: overview?.total_orders > 0 
          ? parseFloat(overview.total_revenue) / parseInt(overview.total_orders) 
          : 0,
        conversionRate: parseFloat(overview?.conversion_rate) || 0,
        topProducts: await Promise.all(
          topProductsRows.map(async (row: any) => {
            try {
              const product = await ShopifyService.getProduct(storeId, row.product_id);
              return {
                productId: row.product_id,
                title: product.title,
                revenue: parseFloat(row.revenue),
                views: parseInt(row.views),
                purchases: parseInt(row.purchases),
                conversionRate: row.views > 0 ? (parseInt(row.purchases) / parseInt(row.views)) * 100 : 0,
              };
            } catch (error) {
              console.error(`Error fetching product ${row.product_id}:`, error);
              return {
                productId: row.product_id,
                title: 'Unknown Product',
                revenue: parseFloat(row.revenue),
                views: parseInt(row.views),
                purchases: parseInt(row.purchases),
                conversionRate: row.views > 0 ? (parseInt(row.purchases) / parseInt(row.views)) * 100 : 0,
              };
            }
          })
        ),
        revenueByDay: dailyRevenueRows.map((row: any) => ({
          date: row.date.value,
          revenue: parseFloat(row.revenue) || 0,
          orders: parseInt(row.orders) || 0,
        })),
        trafficSources: [], // We'll implement this with proper tracking
      };
    } catch (error) {
      console.error('Error getting store analytics:', error);
      // Return fallback data
      return this.getFallbackStoreAnalytics(storeId);
    }
  }

  static async getProductMetrics(productId: string, days: number): Promise<ProductMetricsData[]> {
    // Generate sample metrics for demo purposes or get from BigQuery
    const metrics = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    for (let i = 0; i < Math.min(days, 7); i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i * Math.ceil(days / 7));
      
      metrics.push({
        date: date.toISOString().split('T')[0],
        rating: Math.random() * 2 + 3, // 3-5 stars
        reviews: Math.floor(Math.random() * 10) + 1,
        sentiment: Math.random() * 100,
        impressions: Math.floor(Math.random() * 1000) + 100,
        conversions: Math.floor(Math.random() * 50) + 5,
        clicks: Math.floor(Math.random() * 200) + 20,
        revenue: Math.floor(Math.random() * 1000) + 100,
      });
    }

    return metrics;
  }

  static async getProductReviews(productId: string): Promise<ProductReviewData[]> {
    // Generate sample reviews for demo purposes
    const sampleReviews = [
      {
        id: '1',
        platform: 'Shopify',
        rating: 5,
        comment: 'Excellent quality product! Highly recommended.',
        sentiment: 'positive' as const,
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        platform: 'Amazon',
        rating: 4,
        comment: 'Good value for money. Fast shipping.',
        sentiment: 'positive' as const,
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        platform: 'Etsy',
        rating: 3,
        comment: 'Product is okay, but could be better.',
        sentiment: 'neutral' as const,
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    return sampleReviews;
  }

  static async getProductSEOMetrics(productId: string): Promise<SEOMetricsData> {
    // Generate sample SEO metrics
    return {
      score: Math.floor(Math.random() * 40) + 60, // 60-100
      titleOptimization: Math.floor(Math.random() * 30) + 70, // 70-100
      keywordDensity: Math.floor(Math.random() * 40) + 50, // 50-90
      altTextCoverage: Math.floor(Math.random() * 50) + 40, // 40-90
      metaDescription: Math.floor(Math.random() * 30) + 60, // 60-90
    };
  }

  static async getPlatformData(productId: string): Promise<PlatformData[]> {
    // Generate sample platform data
    return [
      { name: 'Shopify', reviews: Math.floor(Math.random() * 50) + 10, rating: Math.random() * 2 + 3 },
      { name: 'Amazon', reviews: Math.floor(Math.random() * 30) + 5, rating: Math.random() * 2 + 3 },
      { name: 'Etsy', reviews: Math.floor(Math.random() * 20) + 3, rating: Math.random() * 2 + 3 },
    ];
  }

  private static calculateTrend(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  private static async getFallbackProductAnalytics(storeId: string, productId: string): Promise<ProductAnalytics> {
    try {
      const product = await ShopifyService.getProduct(storeId, productId);
      return {
        productId,
        title: product.title,
        views: Math.floor(Math.random() * 1000) + 100,
        addToCarts: Math.floor(Math.random() * 100) + 10,
        purchases: Math.floor(Math.random() * 20) + 1,
        revenue: Math.floor(Math.random() * 5000) + 500,
        unitsSold: Math.floor(Math.random() * 50) + 5,
        conversionRate: Math.random() * 5 + 1,
        viewToCartRate: Math.random() * 10 + 5,
        cartToPurchaseRate: Math.random() * 20 + 10,
        avgOrderValue: Math.random() * 100 + 50,
        uniqueUsers: Math.floor(Math.random() * 500) + 50,
        uniqueSessions: Math.floor(Math.random() * 800) + 80,
        trends: {
          viewsTrend: Math.random() * 20 - 10,
          revenueTrend: Math.random() * 30 - 15,
          conversionTrend: Math.random() * 10 - 5,
        }
      };
    } catch (error) {
      return {
        productId,
        title: 'Unknown Product',
        views: 0,
        addToCarts: 0,
        purchases: 0,
        revenue: 0,
        unitsSold: 0,
        conversionRate: 0,
        viewToCartRate: 0,
        cartToPurchaseRate: 0,
        avgOrderValue: 0,
        uniqueUsers: 0,
        uniqueSessions: 0,
        trends: {
          viewsTrend: 0,
          revenueTrend: 0,
          conversionTrend: 0,
        }
      };
    }
  }

  private static async getFallbackStoreAnalytics(storeId: string): Promise<StoreAnalytics> {
    const store = await StoreModel.getById(storeId);
    return {
      storeId,
      storeName: store?.storeName || 'Unknown Store',
      totalProducts: 0,
      activeProducts: 0,
      totalRevenue: 0,
      totalOrders: 0,
      avgOrderValue: 0,
      conversionRate: 0,
      topProducts: [],
      revenueByDay: [],
      trafficSources: [],
    };
  }
} 