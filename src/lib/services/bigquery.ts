import { BigQuery } from '@google-cloud/bigquery';

// Initialize BigQuery client
const bigquery = new BigQuery({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
});

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || 'brandwisp-dev';
const DATASET_ID = 'analytics';

// Analytics interfaces
export interface TrafficMetrics {
  date: string;
  totalPageViews: number;
  uniqueVisitors: number;
  totalSessions: number;
  avgSessionDuration: number;
  bounceRate: number;
  totalConversions: number;
  totalRevenue: number;
  mobilePercentage: number;
}

export interface GeographicData {
  country: string;
  visitors: number;
  sessions: number;
  bounceRate: number;
  avgSessionDuration: number;
}

export interface DeviceBreakdown {
  deviceType: string;
  sessions: number;
  percentage: number;
  bounceRate: number;
  conversions: number;
}

export interface TopPage {
  pageUrl: string;
  pageTitle: string;
  views: number;
  uniqueVisitors: number;
  avgTimeOnPage: number;
  bounceRate: number;
  conversions: number;
}

export interface CampaignMetrics {
  campaignId: string;
  platform: string;
  totalSpend: number;
  totalRevenue: number;
  roas: number;
  totalConversions: number;
  costPerConversion: number;
  totalClicks: number;
  overallCtr: number;
  avgCpc: number;
}

export interface BlogMetrics {
  blogId: string;
  title: string;
  pageViews: number;
  uniqueVisitors: number;
  avgTimeOnPage: number;
  bounceRate: number;
  socialShares: number;
  comments: number;
  conversions: number;
  organicTraffic: number;
}

export interface ImageAnalyticsData {
  totalImages: number;
  avgSeoScore: number;
  avgAccessibilityScore: number;
  topTags: { label: string; count: number }[];
  processingStats: {
    pending: number;
    completed: number;
    error: number;
  };
}

export class BigQueryService {
  // Traffic Analytics
  static async getDailyTrafficSummary(days = 30): Promise<TrafficMetrics[]> {
    try {
      const query = `
        SELECT
          DATE(timestamp) as date,
          COUNT(*) as totalPageViews,
          COUNT(DISTINCT user_id) as uniqueVisitors,
          COUNT(DISTINCT session_id) as totalSessions,
          AVG(duration_seconds) as avgSessionDuration,
          COUNTIF(bounce) / COUNT(*) as bounceRate,
          COUNTIF(conversion) as totalConversions,
          SUM(revenue) as totalRevenue,
          COUNT(DISTINCT CASE WHEN device_type = 'mobile' THEN session_id END) / COUNT(DISTINCT session_id) as mobilePercentage
        FROM \`${PROJECT_ID}.${DATASET_ID}.page_views\`
        WHERE timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL ${days} DAY))
        GROUP BY date
        ORDER BY date DESC
        LIMIT ${days}
      `;

      const [rows] = await bigquery.query({ query });
      return rows.map(row => ({
        date: row.date.value,
        totalPageViews: parseInt(row.totalPageViews),
        uniqueVisitors: parseInt(row.uniqueVisitors),
        totalSessions: parseInt(row.totalSessions),
        avgSessionDuration: parseFloat(row.avgSessionDuration) || 0,
        bounceRate: parseFloat(row.bounceRate) || 0,
        totalConversions: parseInt(row.totalConversions),
        totalRevenue: parseFloat(row.totalRevenue) || 0,
        mobilePercentage: parseFloat(row.mobilePercentage) || 0,
      }));
    } catch (error) {
      console.error('Error getting daily traffic summary:', error);
      return [];
    }
  }

  static async getGeographicData(days = 30): Promise<GeographicData[]> {
    try {
      const query = `
        SELECT
          country,
          COUNT(DISTINCT user_id) as visitors,
          COUNT(DISTINCT session_id) as sessions,
          COUNTIF(bounce) / COUNT(*) as bounceRate,
          AVG(duration_seconds) as avgSessionDuration
        FROM \`${PROJECT_ID}.${DATASET_ID}.page_views\`
        WHERE timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL ${days} DAY))
          AND country IS NOT NULL
        GROUP BY country
        ORDER BY visitors DESC
        LIMIT 20
      `;

      const [rows] = await bigquery.query({ query });
      return rows.map(row => ({
        country: row.country,
        visitors: parseInt(row.visitors),
        sessions: parseInt(row.sessions),
        bounceRate: parseFloat(row.bounceRate) || 0,
        avgSessionDuration: parseFloat(row.avgSessionDuration) || 0,
      }));
    } catch (error) {
      console.error('Error getting geographic data:', error);
      return [];
    }
  }

  static async getDeviceBreakdown(days = 30): Promise<DeviceBreakdown[]> {
    try {
      const query = `
        WITH device_stats AS (
          SELECT
            device_type,
            COUNT(DISTINCT session_id) as sessions,
            COUNTIF(bounce) / COUNT(*) as bounceRate,
            COUNTIF(conversion) as conversions
          FROM \`${PROJECT_ID}.${DATASET_ID}.page_views\`
          WHERE timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL ${days} DAY))
            AND device_type IS NOT NULL
          GROUP BY device_type
        ),
        total_sessions AS (
          SELECT SUM(sessions) as total FROM device_stats
        )
        SELECT
          ds.device_type,
          ds.sessions,
          (ds.sessions / ts.total) * 100 as percentage,
          ds.bounceRate,
          ds.conversions
        FROM device_stats ds
        CROSS JOIN total_sessions ts
        ORDER BY ds.sessions DESC
      `;

      const [rows] = await bigquery.query({ query });
      return rows.map(row => ({
        deviceType: row.device_type,
        sessions: parseInt(row.sessions),
        percentage: parseFloat(row.percentage) || 0,
        bounceRate: parseFloat(row.bounceRate) || 0,
        conversions: parseInt(row.conversions),
      }));
    } catch (error) {
      console.error('Error getting device breakdown:', error);
      return [];
    }
  }

  static async getTopPages(days = 30, limit = 10): Promise<TopPage[]> {
    try {
      const query = `
        SELECT
          page_url,
          page_title,
          COUNT(*) as views,
          COUNT(DISTINCT user_id) as uniqueVisitors,
          AVG(duration_seconds) as avgTimeOnPage,
          COUNTIF(bounce) / COUNT(*) as bounceRate,
          COUNTIF(conversion) as conversions
        FROM \`${PROJECT_ID}.${DATASET_ID}.page_views\`
        WHERE timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL ${days} DAY))
          AND page_url IS NOT NULL
        GROUP BY page_url, page_title
        ORDER BY views DESC
        LIMIT ${limit}
      `;

      const [rows] = await bigquery.query({ query });
      return rows.map(row => ({
        pageUrl: row.page_url,
        pageTitle: row.page_title || 'Untitled',
        views: parseInt(row.views),
        uniqueVisitors: parseInt(row.uniqueVisitors),
        avgTimeOnPage: parseFloat(row.avgTimeOnPage) || 0,
        bounceRate: parseFloat(row.bounceRate) || 0,
        conversions: parseInt(row.conversions),
      }));
    } catch (error) {
      console.error('Error getting top pages:', error);
      return [];
    }
  }

  // Campaign Analytics
  static async getCampaignMetrics(userId: string, days = 30): Promise<CampaignMetrics[]> {
    try {
      const query = `
        SELECT
          campaign_id,
          platform,
          SUM(spend) as totalSpend,
          SUM(revenue) as totalRevenue,
          SAFE_DIVIDE(SUM(revenue), SUM(spend)) as roas,
          SUM(conversions) as totalConversions,
          SAFE_DIVIDE(SUM(spend), SUM(conversions)) as costPerConversion,
          SUM(clicks) as totalClicks,
          SAFE_DIVIDE(SUM(clicks), SUM(impressions)) as overallCtr,
          AVG(cpc) as avgCpc
        FROM \`${PROJECT_ID}.${DATASET_ID}.campaign_performance\`
        WHERE date >= DATE_SUB(CURRENT_DATE(), INTERVAL ${days} DAY)
          AND user_id = @userId
        GROUP BY campaign_id, platform
        ORDER BY totalSpend DESC
      `;

      const [rows] = await bigquery.query({
        query,
        params: { userId }
      });

      return rows.map(row => ({
        campaignId: row.campaign_id,
        platform: row.platform,
        totalSpend: parseFloat(row.totalSpend) || 0,
        totalRevenue: parseFloat(row.totalRevenue) || 0,
        roas: parseFloat(row.roas) || 0,
        totalConversions: parseInt(row.totalConversions),
        costPerConversion: parseFloat(row.costPerConversion) || 0,
        totalClicks: parseInt(row.totalClicks),
        overallCtr: parseFloat(row.overallCtr) || 0,
        avgCpc: parseFloat(row.avgCpc) || 0,
      }));
    } catch (error) {
      console.error('Error getting campaign metrics:', error);
      return [];
    }
  }

  static async getCampaignPerformanceOverTime(campaignId: string, days = 30): Promise<any[]> {
    try {
      const query = `
        SELECT
          date,
          impressions,
          clicks,
          spend,
          conversions,
          revenue,
          ctr,
          cpc,
          roas
        FROM \`${PROJECT_ID}.${DATASET_ID}.campaign_performance\`
        WHERE campaign_id = @campaignId
          AND date >= DATE_SUB(CURRENT_DATE(), INTERVAL ${days} DAY)
        ORDER BY date ASC
      `;

      const [rows] = await bigquery.query({
        query,
        params: { campaignId }
      });

      return rows.map(row => ({
        date: row.date.value,
        impressions: parseInt(row.impressions),
        clicks: parseInt(row.clicks),
        spend: parseFloat(row.spend) || 0,
        conversions: parseInt(row.conversions),
        revenue: parseFloat(row.revenue) || 0,
        ctr: parseFloat(row.ctr) || 0,
        cpc: parseFloat(row.cpc) || 0,
        roas: parseFloat(row.roas) || 0,
      }));
    } catch (error) {
      console.error('Error getting campaign performance over time:', error);
      return [];
    }
  }

  // Blog Analytics
  static async getBlogMetrics(userId: string, days = 30): Promise<BlogMetrics[]> {
    try {
      const query = `
        SELECT
          blog_id,
          '' as title, -- We'll get this from Firebase
          SUM(page_views) as pageViews,
          SUM(unique_visitors) as uniqueVisitors,
          AVG(avg_time_on_page) as avgTimeOnPage,
          AVG(bounce_rate) as bounceRate,
          SUM(social_shares) as socialShares,
          SUM(comments) as comments,
          SUM(conversions) as conversions,
          SUM(organic_traffic) as organicTraffic
        FROM \`${PROJECT_ID}.${DATASET_ID}.blog_performance\`
        WHERE date >= DATE_SUB(CURRENT_DATE(), INTERVAL ${days} DAY)
          AND user_id = @userId
        GROUP BY blog_id
        ORDER BY pageViews DESC
      `;

      const [rows] = await bigquery.query({
        query,
        params: { userId }
      });

      return rows.map(row => ({
        blogId: row.blog_id,
        title: row.title || 'Untitled Blog',
        pageViews: parseInt(row.pageViews),
        uniqueVisitors: parseInt(row.uniqueVisitors),
        avgTimeOnPage: parseFloat(row.avgTimeOnPage) || 0,
        bounceRate: parseFloat(row.bounceRate) || 0,
        socialShares: parseInt(row.socialShares),
        comments: parseInt(row.comments),
        conversions: parseInt(row.conversions),
        organicTraffic: parseInt(row.organicTraffic),
      }));
    } catch (error) {
      console.error('Error getting blog metrics:', error);
      return [];
    }
  }

  // Image Analytics
  static async getImageAnalytics(userId: string): Promise<ImageAnalyticsData> {
    try {
      const query = `
        WITH image_stats AS (
          SELECT
            COUNT(*) as totalImages,
            AVG(seo_score) as avgSeoScore,
            AVG(accessibility_score) as avgAccessibilityScore
          FROM \`${PROJECT_ID}.${DATASET_ID}.image_analysis\`
          WHERE user_id = @userId
        ),
        tag_stats AS (
          SELECT
            tag.label,
            COUNT(*) as count
          FROM \`${PROJECT_ID}.${DATASET_ID}.image_analysis\`,
          UNNEST(tags) as tag
          WHERE user_id = @userId
          GROUP BY tag.label
          ORDER BY count DESC
          LIMIT 10
        )
        SELECT
          is.totalImages,
          is.avgSeoScore,
          is.avgAccessibilityScore,
          ARRAY_AGG(STRUCT(ts.label, ts.count)) as topTags
        FROM image_stats is
        CROSS JOIN tag_stats ts
        GROUP BY is.totalImages, is.avgSeoScore, is.avgAccessibilityScore
      `;

      const [rows] = await bigquery.query({
        query,
        params: { userId }
      });

      const row = rows[0];
      if (!row) {
        return {
          totalImages: 0,
          avgSeoScore: 0,
          avgAccessibilityScore: 0,
          topTags: [],
          processingStats: { pending: 0, completed: 0, error: 0 }
        };
      }

      return {
        totalImages: parseInt(row.totalImages) || 0,
        avgSeoScore: parseFloat(row.avgSeoScore) || 0,
        avgAccessibilityScore: parseFloat(row.avgAccessibilityScore) || 0,
        topTags: row.topTags || [],
        processingStats: { pending: 0, completed: 0, error: 0 } // This would come from Firebase
      };
    } catch (error) {
      console.error('Error getting image analytics:', error);
      return {
        totalImages: 0,
        avgSeoScore: 0,
        avgAccessibilityScore: 0,
        topTags: [],
        processingStats: { pending: 0, completed: 0, error: 0 }
      };
    }
  }

  // Product Analytics
  static async getProductAnalytics(storeId: string, days = 30): Promise<any[]> {
    try {
      const query = `
        SELECT
          product_id,
          SUM(CASE WHEN event_type = 'view' THEN 1 ELSE 0 END) as views,
          SUM(CASE WHEN event_type = 'add_to_cart' THEN quantity ELSE 0 END) as addedToCart,
          SUM(CASE WHEN event_type = 'purchase' THEN quantity ELSE 0 END) as purchases,
          SUM(CASE WHEN event_type = 'purchase' THEN price * quantity ELSE 0 END) as revenue,
          COUNT(DISTINCT CASE WHEN event_type = 'review' THEN user_id END) as reviews,
          SUM(CASE WHEN event_type = 'click' THEN 1 ELSE 0 END) as clicks,
          COUNT(DISTINCT CASE WHEN event_type = 'conversion' THEN user_id END) as conversions
        FROM \`${PROJECT_ID}.${DATASET_ID}.product_events\`
        WHERE store_id = @storeId
          AND timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL ${days} DAY))
        GROUP BY product_id
        ORDER BY revenue DESC
        LIMIT 20
      `;

      const [rows] = await bigquery.query({
        query,
        params: { storeId }
      });

      return rows.map(row => ({
        productId: row.product_id,
        views: parseInt(row.views) || 0,
        addedToCart: parseInt(row.addedToCart) || 0,
        purchases: parseInt(row.purchases) || 0,
        revenue: parseFloat(row.revenue) || 0,
        rating: 0, // Rating will come from Firebase or other sources
        reviews: parseInt(row.reviews) || 0,
        clicks: parseInt(row.clicks) || 0,
        conversions: parseInt(row.conversions) || 0,
        conversionRate: row.views > 0 ? (parseInt(row.purchases) / parseInt(row.views)) * 100 : 0
      }));
    } catch (error) {
      console.error('Error getting product analytics:', error);
      return [];
    }
  }

  // User Session Analytics
  static async getUserSessionMetrics(days = 30): Promise<any> {
    try {
      const query = `
        SELECT
          AVG(duration_seconds) as avgSessionDuration,
          AVG(page_views) as avgPageViews,
          COUNT(DISTINCT user_id) as totalUsers,
          COUNT(*) as totalSessions,
          COUNTIF(bounce) / COUNT(*) as bounceRate,
          COUNTIF(conversion) / COUNT(*) as conversionRate
        FROM \`${PROJECT_ID}.${DATASET_ID}.user_sessions\`
        WHERE start_time >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL ${days} DAY))
      `;

      const [rows] = await bigquery.query({ query });
      const row = rows[0];

      return {
        avgSessionDuration: parseFloat(row.avgSessionDuration) || 0,
        avgPageViews: parseFloat(row.avgPageViews) || 0,
        totalUsers: parseInt(row.totalUsers) || 0,
        totalSessions: parseInt(row.totalSessions) || 0,
        bounceRate: parseFloat(row.bounceRate) || 0,
        conversionRate: parseFloat(row.conversionRate) || 0,
      };
    } catch (error) {
      console.error('Error getting user session metrics:', error);
      return {
        avgSessionDuration: 0,
        avgPageViews: 0,
        totalUsers: 0,
        totalSessions: 0,
        bounceRate: 0,
        conversionRate: 0,
      };
    }
  }

  // Real-time metrics (last 24 hours)
  static async getRealTimeMetrics(): Promise<any> {
    try {
      const query = `
        SELECT
          COUNT(*) as activeUsers,
          COUNT(DISTINCT session_id) as activeSessions,
          SUM(CASE WHEN timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 HOUR) THEN 1 ELSE 0 END) as lastHourViews,
          COUNT(DISTINCT country) as countries
        FROM \`${PROJECT_ID}.${DATASET_ID}.page_views\`
        WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 24 HOUR)
      `;

      const [rows] = await bigquery.query({ query });
      const row = rows[0];

      return {
        activeUsers: parseInt(row.activeUsers) || 0,
        activeSessions: parseInt(row.activeSessions) || 0,
        lastHourViews: parseInt(row.lastHourViews) || 0,
        countries: parseInt(row.countries) || 0,
      };
    } catch (error) {
      console.error('Error getting real-time metrics:', error);
      return {
        activeUsers: 0,
        activeSessions: 0,
        lastHourViews: 0,
        countries: 0,
      };
    }
  }

  // Generic query method for custom queries
  static async query(options: { query: string; params?: any }): Promise<any[]> {
    try {
      const [rows] = await bigquery.query(options);
      return [rows];
    } catch (error) {
      console.error('Error executing BigQuery query:', error);
      throw error;
    }
  }

  // Insert product event for analytics
  static async insertProductEvent(event: {
    event_id: string;
    user_id?: string;
    session_id?: string;
    store_id: string;
    product_id: string;
    variant_id?: string;
    event_type: string;
    timestamp: string;
    quantity?: number;
    price?: number;
    currency?: string;
    discount_amount?: number;
    page_url?: string;
    referrer?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    device_type?: string;
    browser?: string;
    os?: string;
    country?: string;
    region?: string;
    city?: string;
    ip_address?: string;
    metadata?: any;
  }): Promise<void> {
    try {
      const table = bigquery.dataset(DATASET_ID).table('product_events');
      
      const row = {
        event_id: event.event_id,
        user_id: event.user_id || null,
        session_id: event.session_id || null,
        store_id: event.store_id,
        product_id: event.product_id,
        variant_id: event.variant_id || null,
        event_type: event.event_type,
        timestamp: event.timestamp,
        quantity: event.quantity || null,
        price: event.price || null,
        currency: event.currency || 'USD',
        discount_amount: event.discount_amount || 0,
        page_url: event.page_url || null,
        referrer: event.referrer || null,
        utm_source: event.utm_source || null,
        utm_medium: event.utm_medium || null,
        utm_campaign: event.utm_campaign || null,
        device_type: event.device_type || null,
        browser: event.browser || null,
        os: event.os || null,
        country: event.country || null,
        region: event.region || null,
        city: event.city || null,
        ip_address: event.ip_address || null,
        metadata: event.metadata ? JSON.stringify(event.metadata) : null,
        created_at: new Date().toISOString(),
      };

      await table.insert([row]);
    } catch (error) {
      console.error('Error inserting product event:', error);
      throw error;
    }
  }
} 