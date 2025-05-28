import { useState, useEffect } from 'react';
import { ShopifyService } from '@/lib/services/shopify';
import { AnalyticsService } from '@/lib/services/analytics';
import { StoreModel } from '@/lib/models/store';

export interface UseRealProductDataOptions {
  storeId: string;
  productId?: string;
  days?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface RealProductData {
  product?: any;
  analytics?: any;
  metrics?: any[];
  reviews?: any[];
  seoMetrics?: any;
  platformData?: any[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useRealProductData(options: UseRealProductDataOptions): RealProductData {
  const { storeId, productId, days = 30, autoRefresh = false, refreshInterval = 300000 } = options;
  
  const [data, setData] = useState<Partial<RealProductData>>({
    loading: true,
    error: null,
  });

  const fetchData = async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));

      // Verify store exists and is connected
      const store = await StoreModel.getById(storeId);
      if (!store || store.status !== 'connected') {
        throw new Error('Store not found or not connected');
      }

      let result: any = {};

      if (productId) {
        // Fetch specific product data
        try {
          const product = await ShopifyService.getProduct(storeId, productId);
          const analytics = await AnalyticsService.getProductAnalytics(storeId, productId, days);
          const metrics = await AnalyticsService.getProductMetrics(productId, days);
          const reviews = await AnalyticsService.getProductReviews(productId);
          const seoMetrics = await AnalyticsService.getProductSEOMetrics(productId);
          const platformData = await AnalyticsService.getPlatformData(productId);

          result = {
            product,
            analytics,
            metrics,
            reviews,
            seoMetrics,
            platformData,
          };
        } catch (error) {
          console.error('Error fetching product data:', error);
          throw new Error('Failed to fetch product data');
        }
      } else {
        // Fetch store overview data
        try {
          const products = await ShopifyService.getProducts(storeId);
          const storeAnalytics = await AnalyticsService.getStoreAnalytics(storeId, days);

          result = {
            products,
            storeAnalytics,
          };
        } catch (error) {
          console.error('Error fetching store data:', error);
          throw new Error('Failed to fetch store data');
        }
      }

      setData(prev => ({
        ...prev,
        ...result,
        loading: false,
        error: null,
      }));
    } catch (error) {
      console.error('Error in useRealProductData:', error);
      setData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      }));
    }
  };

  const refresh = async () => {
    await fetchData();
  };

  useEffect(() => {
    fetchData();
  }, [storeId, productId, days]);

  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, storeId, productId, days]);

  return {
    ...data,
    loading: data.loading || false,
    error: data.error || null,
    refresh,
  } as RealProductData;
}

// Hook for real-time store sync status
export function useStoreSyncStatus(storeId: string) {
  const [syncStatus, setSyncStatus] = useState<{
    isSync: boolean;
    lastSync: Date | null;
    error: string | null;
  }>({
    isSync: false,
    lastSync: null,
    error: null,
  });

  const triggerSync = async () => {
    try {
      setSyncStatus(prev => ({ ...prev, isSync: true, error: null }));
      
      await ShopifyService.syncStoreData(storeId);
      
      setSyncStatus(prev => ({
        ...prev,
        isSync: false,
        lastSync: new Date(),
        error: null,
      }));
    } catch (error) {
      setSyncStatus(prev => ({
        ...prev,
        isSync: false,
        error: error instanceof Error ? error.message : 'Sync failed',
      }));
    }
  };

  useEffect(() => {
    // Check last sync status on mount
    const checkLastSync = async () => {
      try {
        const store = await StoreModel.getById(storeId);
        if (store?.lastSyncAt) {
          setSyncStatus(prev => ({
            ...prev,
            lastSync: store.lastSyncAt || null,
          }));
        }
      } catch (error) {
        console.error('Error checking last sync:', error);
      }
    };

    checkLastSync();
  }, [storeId]);

  return {
    ...syncStatus,
    triggerSync,
  };
} 