// VisionTaggerPage.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { X } from 'lucide-react';

export default function VisionTaggerPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [showSuggestionOverlay, setShowSuggestionOverlay] = useState<any | null>(null);
  const [stats, setStats] = useState({ processed: 0, alt: 0, caption: 0, description: 0 });

  useEffect(() => {
    if (!user && !loading) router.push('//login');
  }, [user, loading, router]);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await fetch('/api/vision/products');
      const data = await res.json();
      setAllProducts(data.products || []);
      const fixed = data.products.filter((p: any) => p.fix_status === 'fixed');
      setStats({
        processed: data.products.length,
        alt: fixed.filter((p: any) => p.alt_text_suggested).length,
        caption: fixed.filter((p: any) => p.caption_suggested).length,
        description: fixed.filter((p: any) => p.description_suggested).length,
      });
    } catch (err) {
      console.error('Error fetching vision data', err);
      setAllProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    if (user) fetchProducts();
  }, [user]);

  const handleFixProduct = async (product: any) => {
    try {
      const res = await fetch('/api/vision/fix-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.product_id }),
      });
      const result = await res.json();
      if (result.success) {
        alert('✅ Fix applied');
        setShowSuggestionOverlay(null);
        fetchProducts();
      } else {
        alert('❌ Fix failed');
      }
    } catch (err) {
      alert('❌ Error fixing product');
    }
  };

  if (loading || !user) return null;

  return (
    <DashboardLayout>
      <section className="max-w-7xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold text-white mb-6">VisionTagger — Smart Image Tagging</h1>
        <p className="text-white/70 mb-10">Auto-generates alt text, captions, and descriptions for SEO & accessibility.</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard label="Images Processed" value={stats.processed} />
          <StatCard label="Alt Text Fixed" value={stats.alt} />
          <StatCard label="Captions Generated" value={stats.caption} />
          <StatCard label="Descriptions Added" value={stats.description} />
        </div>

        {loadingProducts ? (
          <p className="text-white">Loading products...</p>
        ) : (
          <div className="bg-white text-black rounded-xl shadow overflow-hidden">
            <table className="min-w-full table-fixed border border-gray-300 rounded-xl">
              <thead className="bg-purple-100">
                <tr>
                  <th className="w-1/4 px-4 py-2 text-left text-sm font-semibold">Product</th>
                  <th className="w-1/4 px-4 py-2 text-left text-sm font-semibold">Current Tags</th>
                  <th className="w-1/4 px-4 py-2 text-left text-sm font-semibold">Suggestions</th>
                  <th className="w-1/4 px-4 py-2 text-left text-sm font-semibold">Fixes</th>
                </tr>
              </thead>
              <tbody>
                {allProducts.map((product, idx) => (
                  <tr key={idx} className="border-t border-gray-200 hover:bg-purple-50 transition-all">
                    <td className="px-4 py-4 flex items-center space-x-3">
                      <img
                        src={product.image_url || "/placeholder.png"}
                        alt={product.title}
                        className="w-16 h-16 object-contain rounded border"
                      />
                      <div className="text-sm font-medium text-gray-800">{product.title}</div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      <ul className="list-disc pl-5">
                        <li><strong>Alt:</strong> {product.fix_status === 'fixed' ? product.alt_text_suggested : product.alt_text || 'N/A'}</li>
                        <li><strong>Caption:</strong> {product.fix_status === 'fixed' ? product.caption_suggested : product.caption || 'N/A'}</li>
                        <li><strong>Description:</strong> {product.fix_status === 'fixed' ? product.description_suggested : product.description || 'N/A'}</li>
                      </ul>
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <button
                        className="bg-blue-600 hover:bg-blue-800 text-white text-xs px-3 py-1 rounded shadow"
                        onClick={() => setShowSuggestionOverlay(product)}
                      >
                        Issues Flagged
                      </button>
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        product.fix_status === 'fixed'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {product.fix_status || 'not_fixed'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showSuggestionOverlay && (
          <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-start pt-16 px-6 overflow-auto">
            <div className="bg-white max-w-3xl w-full rounded-2xl p-6 shadow-xl relative text-black">
              <button onClick={() => setShowSuggestionOverlay(null)} className="absolute top-4 right-4 text-gray-600 hover:text-red-600">
                <X size={22} />
              </button>
              <div className="space-y-4">
                <h2 className="text-xl font-bold">Suggestions for: {showSuggestionOverlay.title}</h2>
                <ul className="list-disc pl-5 space-y-2 text-sm">
                  <li><strong>Alt Text:</strong> {showSuggestionOverlay.alt_text_suggested || 'Pending'}</li>
                  <li><strong>Caption:</strong> {showSuggestionOverlay.caption_suggested || 'Pending'}</li>
                  <li><strong>Description:</strong> {showSuggestionOverlay.description_suggested || 'Pending'}</li>
                </ul>
                <button
                  onClick={() => handleFixProduct(showSuggestionOverlay)}
                  className="mt-4 bg-purple-700 text-white px-4 py-2 rounded hover:bg-purple-800"
                >
                  ✅ Fix Issue
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </DashboardLayout>
  );
}

function StatCard({ label, value }: { label: string, value: number }) {
  return (
    <div className="bg-[#2A2153] p-5 rounded-xl shadow text-white">
      <p className="text-sm text-purple-300 mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
