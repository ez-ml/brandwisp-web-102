-- Create the analytics dataset if it doesn't exist
CREATE SCHEMA IF NOT EXISTS `brandwisp-dev.analytics`
OPTIONS(
  description="Analytics data for BrandWisp platform",
  location="US"
);

-- Product events table for tracking all product interactions
CREATE OR REPLACE TABLE `brandwisp-dev.analytics.product_events` (
  event_id STRING NOT NULL,
  user_id STRING,
  session_id STRING,
  store_id STRING NOT NULL,
  product_id STRING NOT NULL,
  variant_id STRING,
  event_type STRING NOT NULL, -- view, add_to_cart, remove_from_cart, purchase, wishlist_add, etc.
  timestamp TIMESTAMP NOT NULL,
  quantity INT64,
  price FLOAT64,
  currency STRING DEFAULT 'USD',
  discount_amount FLOAT64 DEFAULT 0,
  page_url STRING,
  referrer STRING,
  utm_source STRING,
  utm_medium STRING,
  utm_campaign STRING,
  utm_term STRING,
  utm_content STRING,
  device_type STRING, -- mobile, desktop, tablet
  browser STRING,
  os STRING,
  country STRING,
  region STRING,
  city STRING,
  ip_address STRING,
  metadata JSON, -- Additional event-specific data
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
)
PARTITION BY DATE(timestamp)
CLUSTER BY store_id, product_id, event_type
OPTIONS(
  description="Product interaction events for analytics",
  partition_expiration_days=730 -- 2 years retention
);

-- Page views table for website analytics
CREATE OR REPLACE TABLE `brandwisp-dev.analytics.page_views` (
  page_view_id STRING NOT NULL,
  user_id STRING,
  session_id STRING NOT NULL,
  store_id STRING,
  timestamp TIMESTAMP NOT NULL,
  page_url STRING NOT NULL,
  page_title STRING,
  referrer STRING,
  utm_source STRING,
  utm_medium STRING,
  utm_campaign STRING,
  utm_term STRING,
  utm_content STRING,
  device_type STRING,
  browser STRING,
  browser_version STRING,
  os STRING,
  os_version STRING,
  screen_resolution STRING,
  viewport_size STRING,
  country STRING,
  region STRING,
  city STRING,
  ip_address STRING,
  duration_seconds INT64,
  bounce BOOLEAN DEFAULT FALSE,
  conversion BOOLEAN DEFAULT FALSE,
  revenue FLOAT64 DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
)
PARTITION BY DATE(timestamp)
CLUSTER BY store_id, session_id
OPTIONS(
  description="Page view events for website analytics",
  partition_expiration_days=365 -- 1 year retention
);

-- Campaign performance table
CREATE OR REPLACE TABLE `brandwisp-dev.analytics.campaign_performance` (
  campaign_id STRING NOT NULL,
  platform STRING NOT NULL, -- facebook, google, instagram, etc.
  date DATE NOT NULL,
  impressions INT64 DEFAULT 0,
  clicks INT64 DEFAULT 0,
  spend FLOAT64 DEFAULT 0,
  conversions INT64 DEFAULT 0,
  revenue FLOAT64 DEFAULT 0,
  ctr FLOAT64 DEFAULT 0, -- Click-through rate
  cpc FLOAT64 DEFAULT 0, -- Cost per click
  cpm FLOAT64 DEFAULT 0, -- Cost per mille
  roas FLOAT64 DEFAULT 0, -- Return on ad spend
  frequency FLOAT64 DEFAULT 0,
  reach INT64 DEFAULT 0,
  video_views INT64 DEFAULT 0,
  video_view_rate FLOAT64 DEFAULT 0,
  engagement_rate FLOAT64 DEFAULT 0,
  cost_per_conversion FLOAT64 DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
)
PARTITION BY date
CLUSTER BY campaign_id, platform
OPTIONS(
  description="Daily campaign performance metrics",
  partition_expiration_days=1095 -- 3 years retention
);

-- Store sync logs table
CREATE OR REPLACE TABLE `brandwisp-dev.analytics.store_sync_logs` (
  sync_id STRING NOT NULL,
  store_id STRING NOT NULL,
  sync_type STRING NOT NULL, -- full, incremental, webhook
  status STRING NOT NULL, -- started, completed, failed
  started_at TIMESTAMP NOT NULL,
  completed_at TIMESTAMP,
  records_processed INT64 DEFAULT 0,
  records_inserted INT64 DEFAULT 0,
  records_updated INT64 DEFAULT 0,
  records_failed INT64 DEFAULT 0,
  error_message STRING,
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
)
PARTITION BY DATE(started_at)
CLUSTER BY store_id, status
OPTIONS(
  description="Store synchronization logs",
  partition_expiration_days=90 -- 3 months retention
);

-- Product catalog table (denormalized for analytics)
CREATE OR REPLACE TABLE `brandwisp-dev.analytics.product_catalog` (
  product_id STRING NOT NULL,
  store_id STRING NOT NULL,
  title STRING,
  description STRING,
  vendor STRING,
  product_type STRING,
  tags ARRAY<STRING>,
  status STRING, -- active, draft, archived
  price FLOAT64,
  compare_at_price FLOAT64,
  cost FLOAT64,
  sku STRING,
  inventory_quantity INT64,
  weight FLOAT64,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  published_at TIMESTAMP,
  sync_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
)
PARTITION BY DATE(sync_timestamp)
CLUSTER BY store_id, product_type, status
OPTIONS(
  description="Product catalog for analytics queries",
  partition_expiration_days=365 -- 1 year retention
);

-- Customer segments table
CREATE OR REPLACE TABLE `brandwisp-dev.analytics.customer_segments` (
  user_id STRING NOT NULL,
  store_id STRING NOT NULL,
  segment_type STRING NOT NULL, -- high_value, frequent_buyer, at_risk, etc.
  segment_value STRING NOT NULL,
  confidence_score FLOAT64,
  first_assigned TIMESTAMP NOT NULL,
  last_updated TIMESTAMP NOT NULL,
  metadata JSON
)
CLUSTER BY store_id, segment_type
OPTIONS(
  description="Customer segmentation data"
);

-- Create views for common analytics queries

-- Daily product performance view
CREATE OR REPLACE VIEW `brandwisp-dev.analytics.daily_product_performance` AS
SELECT
  DATE(timestamp) as date,
  store_id,
  product_id,
  COUNT(CASE WHEN event_type = 'view' THEN 1 END) as views,
  COUNT(CASE WHEN event_type = 'add_to_cart' THEN 1 END) as add_to_carts,
  COUNT(CASE WHEN event_type = 'purchase' THEN 1 END) as purchases,
  SUM(CASE WHEN event_type = 'purchase' THEN quantity * price ELSE 0 END) as revenue,
  SUM(CASE WHEN event_type = 'purchase' THEN quantity ELSE 0 END) as units_sold,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT session_id) as unique_sessions,
  SAFE_DIVIDE(
    COUNT(CASE WHEN event_type = 'purchase' THEN 1 END),
    COUNT(CASE WHEN event_type = 'view' THEN 1 END)
  ) * 100 as conversion_rate
FROM `brandwisp-dev.analytics.product_events`
WHERE timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY))
GROUP BY date, store_id, product_id;

-- Store performance summary view
CREATE OR REPLACE VIEW `brandwisp-dev.analytics.store_performance_summary` AS
SELECT
  store_id,
  DATE(timestamp) as date,
  COUNT(DISTINCT product_id) as active_products,
  COUNT(CASE WHEN event_type = 'view' THEN 1 END) as total_views,
  COUNT(CASE WHEN event_type = 'purchase' THEN 1 END) as total_orders,
  SUM(CASE WHEN event_type = 'purchase' THEN quantity * price ELSE 0 END) as total_revenue,
  COUNT(DISTINCT user_id) as unique_customers,
  COUNT(DISTINCT session_id) as unique_sessions,
  SAFE_DIVIDE(
    COUNT(CASE WHEN event_type = 'purchase' THEN 1 END),
    COUNT(CASE WHEN event_type = 'view' THEN 1 END)
  ) * 100 as conversion_rate,
  SAFE_DIVIDE(
    SUM(CASE WHEN event_type = 'purchase' THEN quantity * price ELSE 0 END),
    COUNT(CASE WHEN event_type = 'purchase' THEN 1 END)
  ) as avg_order_value
FROM `brandwisp-dev.analytics.product_events`
WHERE timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY))
GROUP BY store_id, date;

-- Customer lifetime value view
CREATE OR REPLACE VIEW `brandwisp-dev.analytics.customer_lifetime_value` AS
WITH customer_metrics AS (
  SELECT
    user_id,
    store_id,
    MIN(DATE(timestamp)) as first_purchase_date,
    MAX(DATE(timestamp)) as last_purchase_date,
    COUNT(DISTINCT DATE(timestamp)) as purchase_days,
    COUNT(*) as total_orders,
    SUM(quantity * price) as total_revenue,
    AVG(quantity * price) as avg_order_value,
    DATE_DIFF(MAX(DATE(timestamp)), MIN(DATE(timestamp)), DAY) + 1 as customer_lifespan_days
  FROM `brandwisp-dev.analytics.product_events`
  WHERE event_type = 'purchase'
    AND user_id IS NOT NULL
    AND timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 365 DAY))
  GROUP BY user_id, store_id
)
SELECT
  *,
  SAFE_DIVIDE(total_revenue, customer_lifespan_days) as daily_value,
  SAFE_DIVIDE(total_orders, customer_lifespan_days) as purchase_frequency,
  CASE
    WHEN total_revenue >= 1000 THEN 'high_value'
    WHEN total_revenue >= 500 THEN 'medium_value'
    WHEN total_revenue >= 100 THEN 'low_value'
    ELSE 'minimal_value'
  END as value_segment,
  CASE
    WHEN DATE_DIFF(CURRENT_DATE(), last_purchase_date, DAY) <= 30 THEN 'active'
    WHEN DATE_DIFF(CURRENT_DATE(), last_purchase_date, DAY) <= 90 THEN 'at_risk'
    ELSE 'churned'
  END as activity_segment
FROM customer_metrics; 