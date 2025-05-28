'use client';

import { useState } from 'react';
import { useRealStoreData, useStoreSync } from '@/hooks/useRealStoreData';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Store,
  RefreshCw,
  Plus,
  AlertCircle,
  CheckCircle,
  Clock,
  Package,
  ExternalLink,
  Settings,
  Loader2,
} from 'lucide-react';

interface RealStoreManagerProps {
  onStoreSelect?: (storeId: string) => void;
  selectedStoreId?: string | null;
}

export default function RealStoreManager({ onStoreSelect, selectedStoreId }: RealStoreManagerProps) {
  const { stores, products, loading, error, refetch, syncStore, getStoreProducts, totalProducts, connectedStores } = useRealStoreData();
  const { triggerSync, loading: syncLoading } = useStoreSync();
  const [syncingStores, setSyncingStores] = useState<Set<string>>(new Set());

  const handleSyncStore = async (storeId: string) => {
    setSyncingStores(prev => new Set(prev).add(storeId));
    try {
      await syncStore(storeId);
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setSyncingStores(prev => {
        const newSet = new Set(prev);
        newSet.delete(storeId);
        return newSet;
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'disconnected':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4" />;
      case 'disconnected':
        return <AlertCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <Card className="p-6 bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/20">
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
          <span className="text-white">Loading stores...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 bg-gradient-to-br from-red-900/20 to-pink-900/20 border-red-500/20">
        <div className="flex items-center space-x-2 text-red-400">
          <AlertCircle className="w-5 h-5" />
          <span>Error: {error}</span>
        </div>
        <Button 
          onClick={refetch} 
          className="mt-4 bg-red-600 hover:bg-red-700"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/20">
          <div className="flex items-center space-x-3">
            <Store className="w-8 h-8 text-purple-400" />
            <div>
              <p className="text-sm text-gray-400">Connected Stores</p>
              <p className="text-2xl font-bold text-white">{connectedStores}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-500/20">
          <div className="flex items-center space-x-3">
            <Package className="w-8 h-8 text-blue-400" />
            <div>
              <p className="text-sm text-gray-400">Total Products</p>
              <p className="text-2xl font-bold text-white">{totalProducts}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-green-900/20 to-blue-900/20 border-green-500/20">
          <div className="flex items-center space-x-3">
            <RefreshCw className="w-8 h-8 text-green-400" />
            <div>
              <p className="text-sm text-gray-400">Last Sync</p>
              <p className="text-sm text-white">
                {stores.length > 0 && stores.some(s => s.lastSyncAt) 
                  ? new Date(Math.max(...stores.filter(s => s.lastSyncAt).map(s => new Date(s.lastSyncAt!).getTime()))).toLocaleString()
                  : 'Never'
                }
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Stores List */}
      <Card className="p-6 bg-gradient-to-br from-gray-900/50 to-purple-900/20 border-gray-700/50">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
            <Store className="w-5 h-5" />
            <span>Your Stores</span>
          </h3>
          <div className="flex space-x-2">
            <Button 
              onClick={refetch}
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button 
              size="sm"
              className="bg-purple-600 hover:bg-purple-700"
              onClick={() => window.open('/dashboard/settings', '_blank')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Connect Store
            </Button>
          </div>
        </div>

        {stores.length === 0 ? (
          <div className="text-center py-12">
            <Store className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-white mb-2">No Stores Connected</h4>
            <p className="text-gray-400 mb-6">
              Connect your first store to start analyzing your products with BrandWisp.
            </p>
            <Button 
              className="bg-purple-600 hover:bg-purple-700"
              onClick={() => window.open('/dashboard/settings', '_blank')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Connect Your First Store
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {stores.map((store) => {
              const storeProducts = getStoreProducts(store.id);
              const isSelected = selectedStoreId === store.id;
              const isSyncing = syncingStores.has(store.id);

              return (
                <div
                  key={store.id}
                  className={`p-4 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                  }`}
                  onClick={() => onStoreSelect?.(store.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Store className="w-5 h-5 text-purple-400" />
                        <div>
                          <h4 className="font-medium text-white">{store.storeName}</h4>
                          <p className="text-sm text-gray-400">{store.storeUrl}</p>
                        </div>
                      </div>
                      
                      <Badge className={`${getStatusColor(store.status)} border`}>
                        {getStatusIcon(store.status)}
                        <span className="ml-1 capitalize">{store.status}</span>
                      </Badge>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-white">{storeProducts.length} Products</p>
                        <p className="text-xs text-gray-400">
                          {store.lastSyncAt 
                            ? `Synced ${new Date(store.lastSyncAt).toLocaleDateString()}`
                            : 'Never synced'
                          }
                        </p>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSyncStore(store.id);
                          }}
                          disabled={isSyncing || store.status !== 'connected'}
                          className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          {isSyncing ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <RefreshCw className="w-4 h-4" />
                          )}
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`https://${store.storeUrl}`, '_blank');
                          }}
                          className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Store Products Preview */}
                  {isSelected && storeProducts.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <h5 className="text-sm font-medium text-white mb-2">Recent Products:</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {storeProducts.slice(0, 6).map((product) => (
                          <div
                            key={product.id}
                            className="p-2 bg-gray-800 rounded border border-gray-700 hover:border-gray-600 transition-colors"
                          >
                            <p className="text-sm font-medium text-white truncate">{product.title}</p>
                            <p className="text-xs text-gray-400">{product.vendor}</p>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs text-purple-400">{product.variants?.[0]?.price ? `$${product.variants[0].price}` : 'N/A'}</span>
                              <span className="text-xs text-gray-500">{product.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      {storeProducts.length > 6 && (
                        <p className="text-xs text-gray-400 mt-2">
                          +{storeProducts.length - 6} more products
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
} 