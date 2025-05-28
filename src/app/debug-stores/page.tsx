'use client';

import { useAuth } from '@/context/AuthContext';
import { useRealStoreData } from '@/hooks/useRealStoreData';
import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function DebugStoresPage() {
  const { user } = useAuth();
  const { stores, products, loading, error } = useRealStoreData();
  const [allStores, setAllStores] = useState<any[]>([]);
  const [userStores, setUserStores] = useState<any[]>([]);

  useEffect(() => {
    const fetchAllStores = async () => {
      try {
        // Get all stores
        const allStoresSnap = await getDocs(collection(db, 'stores'));
        const allStoresData = allStoresSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAllStores(allStoresData);

        // Get user-specific stores if user is logged in
        if (user) {
          const userStoresQuery = query(
            collection(db, 'stores'),
            where('userId', '==', user.uid)
          );
          const userStoresSnap = await getDocs(userStoresQuery);
          const userStoresData = userStoresSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setUserStores(userStoresData);
        }
      } catch (err) {
        console.error('Error fetching stores:', err);
      }
    };

    fetchAllStores();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Store Debug Page</h1>
      
      <div className="space-y-8">
        {/* User Info */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">User Info</h2>
          <div className="space-y-2">
            <p><strong>User ID:</strong> {user?.uid || 'Not logged in'}</p>
            <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
          </div>
        </div>

        {/* useRealStoreData Hook Results */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">useRealStoreData Hook Results</h2>
          <div className="space-y-2">
            <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
            <p><strong>Error:</strong> {error || 'None'}</p>
            <p><strong>Stores Count:</strong> {stores.length}</p>
            <p><strong>Products Count:</strong> {products.length}</p>
          </div>
          
          {stores.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Stores from Hook:</h3>
              <div className="space-y-2">
                {stores.map(store => (
                  <div key={store.id} className="bg-gray-700 p-3 rounded">
                    <p><strong>ID:</strong> {store.id}</p>
                    <p><strong>Name:</strong> {store.storeName}</p>
                    <p><strong>Provider:</strong> {store.provider}</p>
                    <p><strong>Status:</strong> {store.status}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* All Stores in Firestore */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">All Stores in Firestore</h2>
          <p><strong>Total Count:</strong> {allStores.length}</p>
          
          {allStores.length > 0 && (
            <div className="mt-4 space-y-2">
              {allStores.map(store => (
                <div key={store.id} className="bg-gray-700 p-3 rounded">
                  <p><strong>ID:</strong> {store.id}</p>
                  <p><strong>Name:</strong> {store.storeName}</p>
                  <p><strong>UserId:</strong> {store.userId}</p>
                  <p><strong>Provider:</strong> {store.provider}</p>
                  <p><strong>Status:</strong> {store.status}</p>
                  <p><strong>Matches Current User:</strong> {store.userId === user?.uid ? 'YES' : 'NO'}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User-Specific Stores Query */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">User-Specific Stores (Direct Query)</h2>
          <p><strong>Count:</strong> {userStores.length}</p>
          
          {userStores.length > 0 && (
            <div className="mt-4 space-y-2">
              {userStores.map(store => (
                <div key={store.id} className="bg-gray-700 p-3 rounded">
                  <p><strong>ID:</strong> {store.id}</p>
                  <p><strong>Name:</strong> {store.storeName}</p>
                  <p><strong>Provider:</strong> {store.provider}</p>
                  <p><strong>Status:</strong> {store.status}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Products */}
        {products.length > 0 && (
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Products from Hook</h2>
            <p><strong>Total Count:</strong> {products.length}</p>
            
            <div className="mt-4 space-y-2">
              {products.slice(0, 5).map(product => (
                <div key={product.id} className="bg-gray-700 p-3 rounded">
                  <p><strong>ID:</strong> {product.id}</p>
                  <p><strong>Title:</strong> {product.title}</p>
                  <p><strong>Store ID:</strong> {product.storeId}</p>
                  <p><strong>Store Name:</strong> {product.storeName}</p>
                </div>
              ))}
              {products.length > 5 && (
                <p className="text-gray-400">... and {products.length - 5} more products</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 