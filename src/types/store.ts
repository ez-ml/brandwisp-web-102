export type StoreProvider = 'shopify' | 'amazon' | 'etsy';

export type StoreStatus = 'connected' | 'disconnected' | 'expired' | 'reconnecting';

export interface StoreWebhook {
  id: string;
  storeId: string;
  topic: string;
  address: string;
  format: 'json';
  secret?: string;
  createdAt: Date;
  updatedAt: Date;
  lastTriggeredAt?: Date;
  status: 'active' | 'inactive';
}

export interface StoreConnection {
  id: string;
  userId: string;
  provider: StoreProvider;
  status: StoreStatus;
  storeName: string;
  storeUrl: string;
  accessToken?: string;
  refreshToken?: string;
  scope?: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  lastSyncAt?: Date;
  webhooks?: StoreWebhook[];
  metadata?: {
    email?: string;
    currency?: string;
    country?: string;
    timezone?: string;
    plan?: string;
    [key: string]: any;
  };
}

export interface OAuthResponse {
  accessToken: string;
  refreshToken?: string;
  scope: string;
  expiresIn?: number;
  storeName: string;
  storeUrl: string;
}

export interface StoreValidationError {
  code: 'DUPLICATE_STORE' | 'STORE_LIMIT_EXCEEDED' | 'INVALID_DOMAIN' | 'CONNECTION_FAILED';
  message: string;
  details?: any;
} 