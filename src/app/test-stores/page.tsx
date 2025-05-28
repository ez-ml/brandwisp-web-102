'use client';

import { useRealStoreData } from '@/hooks/useRealStoreData';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Store, Package, AlertCircle, RefreshCw } from 'lucide-react';

export default function TestStoresPage() {
  const { user } = useAuth();
  const { stores, products, loading, error, refetch, totalProducts, connectedStores } = useRealStoreData();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1E1B4B] via-[#2D2A5E] to-[#1E1B4B] p-6 flex items-center justify-center">
        <Card className="p-6 bg-gradient-to-br from-red-900/20 to-pink-900/20 border-red-500/20">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Authentication Required</h2>
            <p className="text-gray-400">Please log in to view your stores.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E1B4B] via-[#2D2A5E] to-[#1E1B4B] p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 mb-2">
            Store Connection Test
          </h1>
          <p className="text-gray-400">Testing real Firestore integration</p>
        </div>

        {/* User Info */}
        <Card className="p-6 bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-500/20">
          <h2 className="text-xl font-semibold text-white mb-4">User Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400">User ID</p>
              <p className="text-white font-mono text-sm">{user.uid}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Email</p>
              <p className="text-white">{user.email}</p>
            </div>
          </div>
        </Card>

        {/* Loading State */}
        {loading && (
          <Card className="p-6 bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/20">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
              <span className="text-white">Loading stores from Firestore...</span>
            </div>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card className="p-6 bg-gradient-to-br from-red-900/20 to-pink-900/20 border-red-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-red-400">
                <AlertCircle className="w-5 h-5" />
                <span>Error: {error}</span>
              </div>
              <Button 
                onClick={refetch} 
                className="bg-red-600 hover:bg-red-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          </Card>
        )}

        {/* Stats */}
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
                <p className="text-sm text-gray-400">Data Source</p>
                <p className="text-sm text-white">Real Firestore</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Stores List */}
        <Card className="p-6 bg-gradient-to-br from-gray-900/50 to-purple-900/20 border-gray-700/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Stores in Firestore</h3>
            <Button 
              onClick={refetch}
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          {stores.length === 0 ? (
            <div className="text-center py-12">
              <Store className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-white mb-2">No Stores Found</h4>
              <p className="text-gray-400 mb-6">
                No stores found in Firestore for your account. This could mean:
              </p>
              <ul className="text-left text-gray-400 space-y-2 max-w-md mx-auto mb-6">
                <li>• You haven't connected any stores yet</li>
                <li>• Stores are connected but not synced to Firestore</li>
                <li>• There's an issue with the Firestore connection</li>
              </ul>
              <Button 
                className="bg-purple-600 hover:bg-purple-700"
                onClick={() => window.open('/dashboard/settings', '_blank')}
              >
                Go to Settings
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {stores.map((store) => (
                <div
                  key={store.id}
                  className="p-4 rounded-lg border border-gray-700 bg-gray-800/50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-white">{store.storeName}</h4>
                      <p className="text-sm text-gray-400">{store.storeUrl}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          store.status === 'connected' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {store.status}
                        </span>
                        <span className="text-xs text-gray-500">
                          Provider: {store.provider}
                        </span>
                        <span className="text-xs text-gray-500">
                          Created: {new Date(store.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-white">
                        {products.filter(p => p.storeId === store.id).length} Products
                      </p>
                      <p className="text-xs text-gray-400">
                        {store.lastSyncAt 
                          ? `Last sync: ${new Date(store.lastSyncAt).toLocaleDateString()}`
                          : 'Never synced'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Products List */}
        {products.length > 0 && (
          <Card className="p-6 bg-gradient-to-br from-gray-900/50 to-purple-900/20 border-gray-700/50">
            <h3 className="text-xl font-semibold text-white mb-6">Products in Firestore</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.slice(0, 12).map((product) => (
                <div
                  key={product.id}
                  className="p-4 rounded-lg border border-gray-700 bg-gray-800/50"
                >
                  <h4 className="font-medium text-white truncate">{product.title}</h4>
                  <p className="text-sm text-gray-400">{product.vendor}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-purple-400">
                      {product.variants?.[0]?.price ? `$${product.variants[0].price}` : 'N/A'}
                    </span>
                    <span className="text-xs text-gray-500">{product.status}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Store: {product.storeName}
                  </p>
                </div>
              ))}
            </div>
            {products.length > 12 && (
              <p className="text-center text-gray-400 mt-4">
                +{products.length - 12} more products
              </p>
            )}
          </Card>
        )}

        {/* Debug Info */}
        <Card className="p-6 bg-gradient-to-br from-gray-900/50 to-purple-900/20 border-gray-700/50">
          <h3 className="text-xl font-semibold text-white mb-4">Debug Information</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Firestore Query:</span>
              <span className="text-white">collection('stores').where('userId', '==', '{user.uid}')</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Loading State:</span>
              <span className="text-white">{loading ? 'Loading...' : 'Complete'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Error State:</span>
              <span className="text-white">{error || 'None'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Stores Found:</span>
              <span className="text-white">{stores.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Products Found:</span>
              <span className="text-white">{products.length}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 