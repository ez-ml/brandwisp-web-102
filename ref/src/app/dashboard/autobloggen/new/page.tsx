'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { marked } from 'marked';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

export default function AutoBlogGenNewPage() {
  const { user } = useAuth();

  const [stores, setStores] = useState<any[]>([]);
  const [selectedStore, setSelectedStore] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');

  const [blogObjective, setBlogObjective] = useState('Product Promotion');
  const [tone, setTone] = useState('Friendly & Persuasive');
  const [cta, setCTA] = useState('Shop Now');
  const [length, setLength] = useState('Medium');

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedBlog, setGeneratedBlog] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const fetchStores = async () => {
      if (!user) return;
      const storesRef = collection(db, `users/${user.uid}/shopifyStores`);
      const storesSnap = await getDocs(storesRef);
      const storesData = storesSnap.docs.map(doc => ({ id: doc.id, shop: doc.id, ...doc.data() }));
      setStores(storesData);
      if (storesData.length > 0) setSelectedStore(storesData[0].id);
    };
    fetchStores();
  }, [user]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!selectedStore || !user?.uid) return;
      const res = await fetch(`/api/shopify/products?shop=${selectedStore}&userId=${user.uid}`);
      const data = await res.json();
      const productTitles = data.products?.map((p: any) => p.title) || [];
      setProducts(productTitles);
      if (productTitles.length > 0) setSelectedProduct(productTitles[0]);
    };
    fetchProducts();
  }, [selectedStore, user]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedBlog(null);

    try {
      const res = await fetch(`/api/shopify/products?shop=${selectedStore}&userId=${user?.uid}`);
      const data = await res.json();
      const product = data.products?.find((p: any) => p.title === selectedProduct) || {};

      const blogRequestBody = {
        product_name: product.title || selectedProduct,
        product_description: product.body_html || "A great product loved by customers.",
        product_features: product?.tags?.split(",") || ["Great design", "Eco-friendly"],
        keywords: product?.tags?.split(",") || ["trending", "sale"],
        blog_objective: blogObjective,
        tone,
        cta,
        length,
      };

      const blogRes = await fetch('/api/blog/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(blogRequestBody),
      });

      const blogData = await blogRes.json();
      setGeneratedBlog(blogData.blog);
    } catch (err: any) {
      alert(err.message || 'An error occurred while generating the blog.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublish = async () => {
    const content = generatedBlog || 'No content';
    const title = content.split('\n')[0].replace(/^#+\s*/, '') || 'New Blog Post';

    try {
      const res = await fetch('/api/shopify/publish-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop: selectedStore,
          title,
          body_html: content,
          userId: user?.uid,
        }),
      });

      if (res.ok) {
        window.location.href = '/dashboard/autobloggen';
      } else {
        alert('Failed to publish blog.');
      }
    } catch {
      alert('An unexpected error occurred.');
    }
  };

  return (
    <div className="w-[70%] mx-auto text-white">
      <h2 className="text-3xl font-bold mb-4">📝 Create New Blog</h2>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Store and Product Selectors */}
        <div>
          <label className="block mb-1 text-sm font-semibold">Select Store</label>
          <select className="w-full p-2 rounded-lg border border-gray-700 bg-[#2A2153]" value={selectedStore} onChange={(e) => setSelectedStore(e.target.value)}>
            {stores.map(store => <option key={store.id} value={store.id}>{store.shop}</option>)}
          </select>
        </div>

        <div>
          <label className="block mb-1 text-sm font-semibold">Select Product</label>
          <select className="w-full p-2 rounded-lg border border-gray-700 bg-[#2A2153]" value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}>
            {products.map(product => <option key={product} value={product}>{product}</option>)}
          </select>
        </div>

        {/* Meta Controls */}
        <div>
          <label className="block mb-1 text-sm font-semibold">Blog Objective</label>
          <select className="w-full p-2 rounded-lg border border-gray-700 bg-[#2A2153]" value={blogObjective} onChange={(e) => setBlogObjective(e.target.value)}>
            <option>Product Promotion</option><option>Educational</option><option>Trend Highlight</option><option>How-to Guide</option><option>Use Case Story</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 text-sm font-semibold">Tone of Voice</label>
          <select className="w-full p-2 rounded-lg border border-gray-700 bg-[#2A2153]" value={tone} onChange={(e) => setTone(e.target.value)}>
            <option>Friendly & Persuasive</option><option>Professional</option><option>Humorous</option><option>Inspirational</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 text-sm font-semibold">Call to Action</label>
          <select className="w-full p-2 rounded-lg border border-gray-700 bg-[#2A2153]" value={cta} onChange={(e) => setCTA(e.target.value)}>
            <option>Shop Now</option><option>Learn More</option><option>Subscribe</option><option>Explore More</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 text-sm font-semibold">Preferred Length</label>
          <select className="w-full p-2 rounded-lg border border-gray-700 bg-[#2A2153]" value={length} onChange={(e) => setLength(e.target.value)}>
            <option>Short</option><option>Medium</option><option>Long-form</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <button
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-full font-semibold disabled:opacity-50"
          disabled={!selectedStore || !selectedProduct || isGenerating}
          onClick={handleGenerate}
        >
          {isGenerating ? 'Generating...' : 'Generate Blog'}
        </button>
      </div>

      {/* Overlay */}
      {generatedBlog && (
        <div className="fixed top-0 left-0 w-full h-full bg-black/70 z-50 flex justify-center items-center">
          <div className="w-[70%] max-h-[90%] overflow-y-scroll bg-white text-black rounded-2xl shadow-2xl p-8 relative">
            <div className="absolute top-4 right-6 flex gap-3">
              <button onClick={handlePublish} className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded-full font-medium">Publish</button>
              <button onClick={() => setEditing(!editing)} className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-1 rounded-full font-medium">Edit</button>
              <button onClick={() => setGeneratedBlog(null)} className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded-full font-medium">Close</button>
            </div>

            <h2 className="text-2xl font-bold mb-4 text-center text-[#4B0082]">📰 Blog Preview</h2>

            {editing ? (
              <MDEditor value={generatedBlog} onChange={(v) => setGeneratedBlog(v || '')} height={400} />
            ) : (
              <div className="prose prose-lg max-w-full bg-white p-8 text-black rounded-xl shadow-inner" dangerouslySetInnerHTML={{ __html: marked.parse(generatedBlog || '') }} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
