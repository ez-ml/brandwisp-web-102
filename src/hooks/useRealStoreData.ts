import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, onSnapshot, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { StoreConnection } from '@/types/store';

interface Product {
  id: string;
  storeId: string;
  storeName: string;
  platform: string;
  title: string;
  description: string;
  vendor: string;
  productType: string;
  tags: string[];
  status: string;
  images: Array<{
    id: string;
    src: string;
    altText?: string;
    width: number;
    height: number;
    position: number;
  }>;
  variants: Array<{
    id: string;
    title: string;
    price: number;
    compareAtPrice?: number;
    sku: string;
    inventory: number;
  }>;
  analytics: {
    views: number;
    clicks: number;
    conversions: number;
    revenue: number;
    rating?: number;
    reviews?: number;
  };
  createdAt: Date;
  updatedAt: Date;
  syncedAt?: Date;
}

interface UseRealStoreDataReturn {
  stores: StoreConnection[];
  products: Product[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  syncStore: (storeId: string) => Promise<void>;
  getStoreProducts: (storeId: string) => Product[];
  totalProducts: number;
  connectedStores: number;
}

export function useRealStoreData(): UseRealStoreDataReturn {
  const { user } = useAuth();
  const [stores, setStores] = useState<StoreConnection[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch stores in real-time
  useEffect(() => {
    // Check if user and user.uid exist before making queries
    if (!user?.uid) {
      setStores([]);
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Listen to stores collection for real-time updates
    const storesQuery = query(
      collection(db, 'stores'),
      where('userId', '==', user.uid)
    );

    const unsubscribeStores = onSnapshot(
      storesQuery,
      (snapshot) => {
        const storesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as StoreConnection[];
        
        setStores(storesData);
        
        // Fetch products for all connected stores
        fetchProductsForStores(storesData);
      },
      (err) => {
        console.error('Error fetching stores:', err);
        setError('Failed to fetch stores');
        setLoading(false);
      }
    );

    return () => unsubscribeStores();
  }, [user]);

  const fetchProductsForStores = async (storesList: StoreConnection[]) => {
    try {
      const allProducts: Product[] = [];
      
      for (const store of storesList) {
        if (store.status === 'connected') {
          try {
            // Fetch products from Firestore subcollection
            const productsQuery = query(
              collection(db, 'stores', store.id, 'products')
            );
            
            const productsSnapshot = await getDocs(productsQuery);
            const storeProducts = productsSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              storeId: store.id,
              storeName: store.storeName,
              platform: store.provider,
            })) as Product[];
            
            allProducts.push(...storeProducts);
            console.log(`Found ${storeProducts.length} products for store ${store.storeName}`);
          } catch (err) {
            console.error(`Error fetching products for store ${store.id}:`, err);
          }
        }
      }
      
      setProducts(allProducts);
      console.log('Total products loaded:', allProducts.length);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const refetch = useCallback(async () => {
    // Check if user and user.uid exist before making queries
    if (!user?.uid) {
      console.log('User UID not available, skipping refetch');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Refetch stores
      const storesQuery = query(
        collection(db, 'stores'),
        where('userId', '==', user.uid)
      );
      
      const storesSnapshot = await getDocs(storesQuery);
      const storesData = storesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as StoreConnection[];
      
      setStores(storesData);
      await fetchProductsForStores(storesData);
    } catch (err) {
      console.error('Error refetching data:', err);
      setError('Failed to refetch data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const syncStore = useCallback(async (storeId: string) => {
    if (!user) return;
    
    try {
      // Call the Cloud Function to sync the store
      const token = await user.getIdToken();
      
      const response = await fetch('/api/stores/sync', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ storeId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to sync store');
      }
      
      // Refetch data after sync
      await refetch();
    } catch (err) {
      console.error('Error syncing store:', err);
      throw err;
    }
  }, [user, refetch]);

  const getStoreProducts = useCallback((storeId: string) => {
    return products.filter(product => product.storeId === storeId);
  }, [products]);

  return {
    stores,
    products,
    loading,
    error,
    refetch,
    syncStore,
    getStoreProducts,
    totalProducts: products.length,
    connectedStores: stores.filter(store => store.status === 'connected').length,
  };
}

// Hook for real-time product data with analytics
export function useRealProductAnalytics(productId?: string, storeId?: string) {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchAnalytics = useCallback(async () => {
    if (!user || !productId || !storeId) return;

    setLoading(true);
    setError(null);

    try {
      const token = await user.getIdToken();
      
      const response = await fetch(`/api/analytics/product?productId=${productId}&storeId=${storeId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  }, [user, productId, storeId]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    loading,
    error,
    refetch: fetchAnalytics,
  };
}

// Hook for triggering manual store sync
export function useStoreSync() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const triggerSync = useCallback(async (storeId: string) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    setLoading(true);
    setError(null);

    try {
      const token = await user.getIdToken();
      
      // Call the Cloud Function directly
      const response = await fetch('https://us-central1-brandwisp-dev.cloudfunctions.net/scheduledShopifySync', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ storeId }),
      });

      if (!response.ok) {
        throw new Error('Failed to trigger sync');
      }

      return await response.json();
    } catch (err) {
      console.error('Error triggering sync:', err);
      setError(err instanceof Error ? err.message : 'Failed to trigger sync');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    triggerSync,
    loading,
    error,
  };
} 