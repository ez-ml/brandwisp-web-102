import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface DashboardDataOptions {
  module: 'visiontagger' | 'traffictrace' | 'campaignwizard' | 'productpulse';
  view?: string;
  days?: number;
  limit?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
  productId?: string;
  storeId?: string;
}

interface DashboardDataState<T = any> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useDashboardData<T = any>(options: DashboardDataOptions): DashboardDataState<T> {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, 
      (user) => {
        setUser(user);
        setAuthLoading(false);
        setAuthError(null);
      },
      (error) => {
        setAuthError(error.message);
        setAuthLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const fetchData = async () => {
    if (!user && process.env.NODE_ENV !== 'development') {
      setDataError('User not authenticated');
      setDataLoading(false);
      return;
    }

    try {
      setDataLoading(true);
      setDataError(null);

      // Get Firebase ID token
      const token = process.env.NODE_ENV === 'development' ? 'test' : await user?.getIdToken();

      // Build query parameters
      const params = new URLSearchParams();
      if (options.view) params.append('view', options.view);
      if (options.days) params.append('days', options.days.toString());
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.productId) params.append('productId', options.productId);
      if (options.storeId) params.append('storeId', options.storeId);

      // Make API request
      const response = await fetch(`/api/dashboard/${options.module}?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setDataError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setDataLoading(false);
    }
  };

  // Initial fetch and dependency updates
  useEffect(() => {
    if (!authLoading && !authError) {
      fetchData();
    }
  }, [user, authLoading, authError, options.module, options.view, options.days, options.limit, options.productId, options.storeId]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!options.autoRefresh || !user) return;

    const interval = setInterval(() => {
      fetchData();
    }, options.refreshInterval || 30000); // Default 30 seconds

    return () => clearInterval(interval);
  }, [options.autoRefresh, options.refreshInterval, user]);

  return {
    data,
    loading: authLoading || dataLoading,
    error: authError || dataError,
    refetch: fetchData,
  };
}

// Specialized hooks for each dashboard module
export function useVisionTaggerData(view: string = 'dashboard', options?: Partial<DashboardDataOptions>) {
  return useDashboardData({
    module: 'visiontagger',
    view,
    ...options,
  });
}

export function useTrafficTraceData(view: string = 'dashboard', days: number = 30, options?: Partial<DashboardDataOptions>) {
  return useDashboardData({
    module: 'traffictrace',
    view,
    days,
    ...options,
  });
}

export function useCampaignWizardData(view: string = 'dashboard', days: number = 30, options?: Partial<DashboardDataOptions>) {
  return useDashboardData({
    module: 'campaignwizard',
    view,
    days,
    ...options,
  });
}

export function useProductPulseData(view: string = 'overview', productId?: string, storeId?: string, days: number = 30, options?: Partial<DashboardDataOptions>) {
  return useDashboardData({
    module: 'productpulse',
    view,
    days,
    productId,
    storeId,
    ...options,
  });
}

// Hook for making POST requests to dashboard APIs
export function useDashboardMutation(module: 'visiontagger' | 'traffictrace' | 'campaignwizard' | 'productpulse') {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  const mutate = async (data: any) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      setLoading(true);
      setError(null);

      const token = await user.getIdToken();

      const response = await fetch(`/api/dashboard/${module}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Mutation failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    mutate,
    loading,
    error,
  };
} 