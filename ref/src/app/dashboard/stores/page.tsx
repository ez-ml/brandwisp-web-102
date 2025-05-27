'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { X } from 'lucide-react';

export default function StoreManagementPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [shopDomain, setShopDomain] = useState('');
  const [realStores, setRealStores] = useState<any[]>([]);
  const [selectedStore, setSelectedStore] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    if (!user && !loading) router.push('//login');
  }, [user, loading, router]);

  useEffect(() => {
    const fetchStores = async () => {
      if (!user) return;
      const storesRef = collection(db, `users/${user.uid}/shopifyStores`);
      const storesSnap = await getDocs(storesRef);
      const stores = storesSnap.docs.map(doc => ({
        id: doc.id,
        shop: doc.id,
        ...doc.data(),
        platform: 'Shopify',
        logo: '/images/shopify-icon.png'
      }));
      setRealStores(stores);
    };
    fetchStores();
  }, [user]);

  const handleConnect = async () => {
  let shop = shopDomain.trim().toLowerCase();
  if (!shop) return alert('Enter Shopify store name (e.g. mystore)');
  if (!shop.endsWith('.myshopify.com')) shop = `${shop}.myshopify.com`;

  const sync = true; // Set to false if you want old behavior

  // ✅ New behavior: use redirect for OAuth with sync
  if (sync) {
    window.location.href = `/api/shopify/initiate?shop=${encodeURIComponent(shop)}&userId=${user?.uid}&sync=${sync}`;
    return;
  }

  // ✅ Legacy support: still uses fetch() expecting JSON response
  try {
    const res = await fetch(`/api/shopify/initiate?shop=${encodeURIComponent(shop)}&userId=${user?.uid}`);
    const data = await res.json();

    if (res.ok) {
      alert('Store connected and products synced!');
      setModalOpen(false);
      window.location.reload();
    } else {
      alert('Connection failed: ' + data.error);
    }
  } catch (err) {
    console.error('Connect error:', err);
    alert('Unexpected error during connection.');
  }
};



  const handleDisconnect = async (storeId: string) => {
    setRealStores(prev => prev.filter(s => s.id !== storeId));
    // Firestore removal or backend sync logic can go here if needed.
  };

  const handleViewProducts = async (store: any) => {
    setSelectedStore(store);
    setLoadingProducts(true);
    try {
      const res = await fetch(`/api/shopify/products?shop=${store.shop}&userId=${user?.uid}`);
      const data = await res.json();
      if (res.status === 401) {
        alert('This store has been disconnected. Please reconnect.');
        setRealStores([]);
        setSelectedStore(null);
      } else {
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error(err);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const closeProductOverlay = () => {
    setSelectedStore(null);
    setProducts([]);
  };

  if (loading || !user) return null;

  return (
    <DashboardLayout>
      <section className="max-w-7xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Your Connected Stores</h1>
        <div className="mb-6">
          <button onClick={() => setModalOpen(true)} className="bg-purple-700 text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-purple-800">
            Connect Shopify Store
          </button>
        </div>

        {realStores.length === 0 ? (
          <p className="text-gray-400">No stores connected yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-[#18181B] text-white rounded-xl overflow-hidden">
              <thead>
                <tr>
                  <th className="text-left px-6 py-3 text-sm">Store Name</th>
                  <th className="text-left px-6 py-3 text-sm">Platform</th>
                  <th className="text-right px-6 py-3 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {realStores.map(store => (
                  <tr key={store.id} className="border-t border-gray-700">
                    <td className="px-6 py-4 flex items-center">
                      <img src={store.logo} alt="logo" className="w-8 h-8 mr-4 rounded-full border" />
                      {store.shop}
                    </td>
                    <td className="px-6 py-4">{store.platform}</td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button onClick={() => handleViewProducts(store)} className="bg-purple-700 text-white px-4 py-1 rounded hover:bg-purple-800 text-sm">View Products</button>
                      <button onClick={() => handleDisconnect(store.id)} className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700 text-sm">Disconnect</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedStore && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex flex-col p-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-white text-xl font-semibold">Products from {selectedStore.shop}</h2>
            <button onClick={closeProductOverlay} className="text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-full">
              <X size={18} /> Close
            </button>
          </div>
          {loadingProducts ? (
            <p className="text-white">Loading products...</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 overflow-y-auto">
              {products.map(product => (
                <div key={product.id} className="bg-white text-black border p-4 rounded-md">
                  <img src={product.image?.src || "/placeholder.png"} alt={product.title} className="w-full h-36 object-contain rounded mb-2" />
                  <h3 className="font-medium text-sm">{product.title}</h3>
                  <p className="text-xs text-gray-500">{product.variants?.[0]?.price ? `$${product.variants[0].price}` : "No price"}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4 text-black">Connect Your Shopify Store</h2>
            <input
              type="text"
              value={shopDomain}
              onChange={e => setShopDomain(e.target.value)}
              placeholder="yourstore.myshopify.com"
              className="w-full px-4 py-2 border border-gray-300 text-black rounded-md focus:ring-2 focus:ring-purple-600 mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-gray-700 hover:text-gray-900">Cancel</button>
              <button onClick={handleConnect} className="bg-purple-700 text-white px-4 py-2 rounded-md hover:bg-purple-800">Connect</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
