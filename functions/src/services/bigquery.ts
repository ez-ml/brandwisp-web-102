import { BigQuery } from '@google-cloud/bigquery';

const bigquery = new BigQuery({
  projectId: process.env.GOOGLE_CLOUD_PROJECT || 'brandwisp-dev',
});

const DATASET_ID = 'analytics';

export class BigQueryService {
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

  static async insertSyncLog(log: {
    sync_id: string;
    store_id: string;
    sync_type: string;
    status: string;
    started_at: string;
    completed_at?: string;
    records_processed?: number;
    records_inserted?: number;
    records_updated?: number;
    records_failed?: number;
    error_message?: string;
    metadata?: any;
  }): Promise<void> {
    try {
      const table = bigquery.dataset(DATASET_ID).table('store_sync_logs');
      
      const row = {
        ...log,
        metadata: log.metadata ? JSON.stringify(log.metadata) : null,
        created_at: new Date().toISOString(),
      };

      await table.insert([row]);
    } catch (error) {
      console.error('Error inserting sync log:', error);
      throw error;
    }
  }
} 