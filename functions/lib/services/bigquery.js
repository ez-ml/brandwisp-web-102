"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BigQueryService = void 0;
const bigquery_1 = require("@google-cloud/bigquery");
const bigquery = new bigquery_1.BigQuery({
    projectId: process.env.GOOGLE_CLOUD_PROJECT || 'brandwisp-dev',
});
const DATASET_ID = 'analytics';
class BigQueryService {
    static async insertProductEvent(event) {
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
        }
        catch (error) {
            console.error('Error inserting product event:', error);
            throw error;
        }
    }
    static async insertSyncLog(log) {
        try {
            const table = bigquery.dataset(DATASET_ID).table('store_sync_logs');
            const row = Object.assign(Object.assign({}, log), { metadata: log.metadata ? JSON.stringify(log.metadata) : null, created_at: new Date().toISOString() });
            await table.insert([row]);
        }
        catch (error) {
            console.error('Error inserting sync log:', error);
            throw error;
        }
    }
}
exports.BigQueryService = BigQueryService;
//# sourceMappingURL=bigquery.js.map