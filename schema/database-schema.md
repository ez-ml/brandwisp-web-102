# BrandWisp Database Schema

## Overview
This document outlines the database schema for BrandWisp, including BigQuery for analytics and Firebase for real-time data and user management.

## Firebase Schema

### Authentication
Firebase Authentication handles user management with the following user profile structure:

```typescript
interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
  customClaims?: {
    role: 'admin' | 'user' | 'premium';
    subscription: 'free' | 'pro' | 'enterprise';
  };
}
```

### Firestore Collections

#### Users Collection (`/users/{userId}`)
```typescript
interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  subscription: {
    plan: 'free' | 'pro' | 'enterprise';
    status: 'active' | 'cancelled' | 'past_due';
    currentPeriodStart: Timestamp;
    currentPeriodEnd: Timestamp;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
  };
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    notifications: {
      email: boolean;
      push: boolean;
      marketing: boolean;
    };
    dashboard: {
      defaultView: string;
      widgets: string[];
    };
  };
  usage: {
    apiCalls: number;
    storageUsed: number;
    lastReset: Timestamp;
  };
  connectedAccounts: {
    shopify?: {
      storeUrl: string;
      accessToken: string; // Encrypted
      connectedAt: Timestamp;
    };
    google?: {
      accountId: string;
      refreshToken: string; // Encrypted
      connectedAt: Timestamp;
    };
    facebook?: {
      accountId: string;
      accessToken: string; // Encrypted
      connectedAt: Timestamp;
    };
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### Stores Collection (`/stores/{storeId}`)
```typescript
interface Store {
  id: string;
  userId: string;
  name: string;
  platform: 'shopify' | 'woocommerce' | 'magento' | 'custom';
  url: string;
  credentials: {
    accessToken: string; // Encrypted
    apiKey?: string; // Encrypted
    secretKey?: string; // Encrypted
  };
  settings: {
    currency: string;
    timezone: string;
    language: string;
  };
  status: 'active' | 'inactive' | 'error';
  lastSync: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### Products Collection (`/stores/{storeId}/products/{productId}`)
```typescript
interface Product {
  id: string;
  storeId: string;
  externalId: string; // ID from the e-commerce platform
  title: string;
  description: string;
  handle: string;
  vendor: string;
  productType: string;
  tags: string[];
  status: 'active' | 'draft' | 'archived';
  images: {
    id: string;
    src: string;
    altText?: string;
    width: number;
    height: number;
    position: number;
  }[];
  variants: {
    id: string;
    title: string;
    price: number;
    compareAtPrice?: number;
    sku: string;
    inventory: number;
    weight?: number;
    options: Record<string, string>;
  }[];
  seo: {
    title?: string;
    description?: string;
    keywords: string[];
  };
  analytics: {
    views: number;
    clicks: number;
    conversions: number;
    revenue: number;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
  syncedAt: Timestamp;
}
```

#### Blogs Collection (`/blogs/{blogId}`)
```typescript
interface Blog {
  id: string;
  userId: string;
  storeId?: string;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  publishedAt?: Timestamp;
  scheduledAt?: Timestamp;
  author: {
    name: string;
    email: string;
  };
  seo: {
    title: string;
    description: string;
    keywords: string[];
    canonicalUrl?: string;
  };
  tags: string[];
  categories: string[];
  featuredImage?: {
    url: string;
    altText: string;
    caption?: string;
  };
  settings: {
    allowComments: boolean;
    template: string;
    callToAction?: {
      text: string;
      url: string;
      type: 'button' | 'link';
    };
  };
  analytics: {
    views: number;
    shares: number;
    comments: number;
    engagement: number;
  };
  generation: {
    prompt?: string;
    model?: string;
    generatedAt?: Timestamp;
    isGenerated: boolean;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### Campaigns Collection (`/campaigns/{campaignId}`)
```typescript
interface Campaign {
  id: string;
  userId: string;
  storeId?: string;
  name: string;
  platform: 'facebook' | 'instagram' | 'google' | 'tiktok' | 'linkedin' | 'twitter' | 'youtube';
  type: 'image' | 'video' | 'carousel' | 'collection';
  objective: 'brand-awareness' | 'reach' | 'traffic' | 'engagement' | 'lead-generation' | 'conversions' | 'sales';
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'ended' | 'error';
  budget: {
    total: number;
    daily?: number;
    spent: number;
    currency: string;
  };
  schedule: {
    startDate: Timestamp;
    endDate?: Timestamp;
    timezone: string;
  };
  targeting: {
    audience: string;
    demographics: {
      ageMin?: number;
      ageMax?: number;
      genders?: string[];
      locations?: string[];
      languages?: string[];
    };
    interests: string[];
    behaviors: string[];
    customAudiences?: string[];
  };
  creatives: {
    id: string;
    type: 'image' | 'video';
    url: string;
    thumbnail?: string;
    headline?: string;
    description?: string;
    callToAction?: string;
    performance?: {
      impressions: number;
      clicks: number;
      ctr: number;
      cpc: number;
      conversions: number;
    };
  }[];
  metrics: {
    impressions: number;
    reach: number;
    clicks: number;
    ctr: number;
    cpc: number;
    engagement: number;
    conversions: number;
    revenue: number;
    roas: number;
    lastUpdated: Timestamp;
  };
  externalIds: {
    [platform: string]: string; // Platform-specific campaign IDs
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### Images Collection (`/images/{imageId}`)
```typescript
interface ImageAnalysis {
  id: string;
  userId: string;
  storeId?: string;
  productId?: string;
  url: string;
  filename: string;
  fileSize: number;
  dimensions: {
    width: number;
    height: number;
  };
  format: string;
  status: 'pending' | 'analyzing' | 'completed' | 'error';
  analysis: {
    tags: {
      label: string;
      confidence: number;
      category: string;
    }[];
    objects: {
      name: string;
      confidence: number;
      boundingBox: {
        x: number;
        y: number;
        width: number;
        height: number;
      };
    }[];
    colors: {
      hex: string;
      percentage: number;
      name: string;
    }[];
    text?: {
      content: string;
      confidence: number;
      language: string;
    }[];
  };
  seo: {
    currentAltText?: string;
    suggestedAltText: string;
    currentCaption?: string;
    suggestedCaption: string;
    currentDescription?: string;
    suggestedDescription: string;
    score: number;
  };
  accessibility: {
    score: number;
    issues: string[];
    suggestions: string[];
  };
  createdAt: Timestamp;
  analyzedAt?: Timestamp;
  updatedAt: Timestamp;
}
```

#### API Usage Collection (`/usage/{userId}/logs/{logId}`)
```typescript
interface APIUsage {
  id: string;
  userId: string;
  endpoint: string;
  method: string;
  timestamp: Timestamp;
  responseTime: number;
  statusCode: number;
  requestSize: number;
  responseSize: number;
  userAgent?: string;
  ipAddress?: string;
  cost: number; // In credits or currency
  metadata?: Record<string, any>;
}
```

## BigQuery Schema

### Analytics Tables

#### Page Views Table (`brandwisp-dev.analytics.page_views`)
```sql
CREATE TABLE `brandwisp-dev.analytics.page_views` (
  event_id STRING NOT NULL,
  user_id STRING,
  session_id STRING,
  timestamp TIMESTAMP NOT NULL,
  page_url STRING NOT NULL,
  page_title STRING,
  referrer STRING,
  user_agent STRING,
  ip_address STRING,
  country STRING,
  region STRING,
  city STRING,
  device_type STRING, -- desktop, mobile, tablet
  browser STRING,
  os STRING,
  utm_source STRING,
  utm_medium STRING,
  utm_campaign STRING,
  utm_term STRING,
  utm_content STRING,
  duration_seconds INT64,
  bounce BOOLEAN,
  conversion BOOLEAN,
  revenue FLOAT64,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
)
PARTITION BY DATE(timestamp)
CLUSTER BY user_id, session_id;
```

#### Product Analytics Table (`brandwisp-dev.analytics.product_events`)
```sql
CREATE TABLE `brandwisp-dev.analytics.product_events` (
  event_id STRING NOT NULL,
  user_id STRING,
  session_id STRING,
  store_id STRING NOT NULL,
  product_id STRING NOT NULL,
  variant_id STRING,
  event_type STRING NOT NULL, -- view, add_to_cart, remove_from_cart, purchase
  timestamp TIMESTAMP NOT NULL,
  quantity INT64,
  price FLOAT64,
  currency STRING,
  discount_amount FLOAT64,
  page_url STRING,
  referrer STRING,
  utm_source STRING,
  utm_medium STRING,
  utm_campaign STRING,
  device_type STRING,
  country STRING,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
)
PARTITION BY DATE(timestamp)
CLUSTER BY store_id, product_id, event_type;
```

#### Campaign Performance Table (`brandwisp-dev.analytics.campaign_performance`)
```sql
CREATE TABLE `brandwisp-dev.analytics.campaign_performance` (
  record_id STRING NOT NULL,
  campaign_id STRING NOT NULL,
  user_id STRING NOT NULL,
  platform STRING NOT NULL,
  date DATE NOT NULL,
  impressions INT64 DEFAULT 0,
  reach INT64 DEFAULT 0,
  clicks INT64 DEFAULT 0,
  ctr FLOAT64 DEFAULT 0,
  cpc FLOAT64 DEFAULT 0,
  spend FLOAT64 DEFAULT 0,
  conversions INT64 DEFAULT 0,
  revenue FLOAT64 DEFAULT 0,
  roas FLOAT64 DEFAULT 0,
  engagement INT64 DEFAULT 0,
  video_views INT64 DEFAULT 0,
  video_completion_rate FLOAT64 DEFAULT 0,
  cost_per_conversion FLOAT64 DEFAULT 0,
  frequency FLOAT64 DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
)
PARTITION BY date
CLUSTER BY campaign_id, platform;
```

#### Blog Performance Table (`brandwisp-dev.analytics.blog_performance`)
```sql
CREATE TABLE `brandwisp-dev.analytics.blog_performance` (
  record_id STRING NOT NULL,
  blog_id STRING NOT NULL,
  user_id STRING NOT NULL,
  date DATE NOT NULL,
  page_views INT64 DEFAULT 0,
  unique_visitors INT64 DEFAULT 0,
  avg_time_on_page FLOAT64 DEFAULT 0,
  bounce_rate FLOAT64 DEFAULT 0,
  social_shares INT64 DEFAULT 0,
  comments INT64 DEFAULT 0,
  conversions INT64 DEFAULT 0,
  revenue FLOAT64 DEFAULT 0,
  organic_traffic INT64 DEFAULT 0,
  search_impressions INT64 DEFAULT 0,
  search_clicks INT64 DEFAULT 0,
  search_ctr FLOAT64 DEFAULT 0,
  avg_position FLOAT64 DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
)
PARTITION BY date
CLUSTER BY blog_id, user_id;
```

#### Image Analysis Results Table (`brandwisp-dev.analytics.image_analysis`)
```sql
CREATE TABLE `brandwisp-dev.analytics.image_analysis` (
  analysis_id STRING NOT NULL,
  user_id STRING NOT NULL,
  image_id STRING NOT NULL,
  store_id STRING,
  product_id STRING,
  timestamp TIMESTAMP NOT NULL,
  file_size_bytes INT64,
  width INT64,
  height INT64,
  format STRING,
  tags ARRAY<STRUCT<
    label STRING,
    confidence FLOAT64,
    category STRING
  >>,
  objects ARRAY<STRUCT<
    name STRING,
    confidence FLOAT64,
    bounding_box STRUCT<
      x FLOAT64,
      y FLOAT64,
      width FLOAT64,
      height FLOAT64
    >
  >>,
  colors ARRAY<STRUCT<
    hex STRING,
    percentage FLOAT64,
    name STRING
  >>,
  seo_score FLOAT64,
  accessibility_score FLOAT64,
  processing_time_ms INT64,
  model_version STRING,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
)
PARTITION BY DATE(timestamp)
CLUSTER BY user_id, store_id;
```

#### User Sessions Table (`brandwisp-dev.analytics.user_sessions`)
```sql
CREATE TABLE `brandwisp-dev.analytics.user_sessions` (
  session_id STRING NOT NULL,
  user_id STRING,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  duration_seconds INT64,
  page_views INT64 DEFAULT 0,
  bounce BOOLEAN DEFAULT FALSE,
  conversion BOOLEAN DEFAULT FALSE,
  revenue FLOAT64 DEFAULT 0,
  entry_page STRING,
  exit_page STRING,
  referrer STRING,
  utm_source STRING,
  utm_medium STRING,
  utm_campaign STRING,
  device_type STRING,
  browser STRING,
  os STRING,
  country STRING,
  region STRING,
  city STRING,
  ip_address STRING,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
)
PARTITION BY DATE(start_time)
CLUSTER BY user_id, DATE(start_time);
```

### Data Processing Views

#### Daily Traffic Summary View
```sql
CREATE OR REPLACE VIEW `brandwisp-dev.analytics.daily_traffic_summary` AS
SELECT
  DATE(timestamp) as date,
  COUNT(*) as total_page_views,
  COUNT(DISTINCT user_id) as unique_visitors,
  COUNT(DISTINCT session_id) as total_sessions,
  AVG(duration_seconds) as avg_session_duration,
  COUNTIF(bounce) / COUNT(*) as bounce_rate,
  COUNTIF(conversion) as total_conversions,
  SUM(revenue) as total_revenue,
  COUNT(DISTINCT CASE WHEN device_type = 'mobile' THEN session_id END) / COUNT(DISTINCT session_id) as mobile_percentage
FROM `brandwisp-dev.analytics.page_views`
WHERE timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY))
GROUP BY date
ORDER BY date DESC;
```

#### Campaign ROI Summary View
```sql
CREATE VIEW `brandwisp-dev.analytics.campaign_roi_summary` AS
SELECT
  campaign_id,
  platform,
  SUM(spend) as total_spend,
  SUM(revenue) as total_revenue,
  SAFE_DIVIDE(SUM(revenue), SUM(spend)) as roas,
  SUM(conversions) as total_conversions,
  SAFE_DIVIDE(SUM(spend), SUM(conversions)) as cost_per_conversion,
  SUM(clicks) as total_clicks,
  SAFE_DIVIDE(SUM(clicks), SUM(impressions)) as overall_ctr,
  AVG(cpc) as avg_cpc
FROM `brandwisp-dev.analytics.campaign_performance`
WHERE date >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
GROUP BY campaign_id, platform;
```

## Data Pipeline Architecture

### Real-time Data Flow
1. **Frontend Events** → Firebase Analytics → BigQuery (via Firebase Extensions)
2. **API Events** → Cloud Functions → BigQuery
3. **External Platform Data** → Scheduled Cloud Functions → BigQuery
4. **User Actions** → Firestore → Cloud Functions → BigQuery

### Batch Processing
1. **Daily Aggregations**: Cloud Scheduler → Cloud Functions → BigQuery
2. **Weekly Reports**: Cloud Scheduler → Cloud Functions → Email/Notifications
3. **Data Cleanup**: Cloud Scheduler → Cloud Functions → Archive old data

### Security and Privacy
- All PII is encrypted at rest and in transit
- Access controls via Firebase Security Rules and IAM
- Data retention policies implemented via BigQuery table expiration
- GDPR compliance with data deletion capabilities
- API rate limiting and usage tracking

### Monitoring and Alerting
- Cloud Monitoring for system health
- Custom metrics for business KPIs
- Alerting for anomalies and errors
- Performance monitoring for query optimization

This schema provides a comprehensive foundation for all BrandWisp features while maintaining scalability, security, and performance. 