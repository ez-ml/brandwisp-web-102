'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

import dynamic from 'next/dynamic';
const FullyOptimizedChart = dynamic(() => import('../charts/FullyOptimizedChart'), { ssr: false });
const VisibilityDistributionChart = dynamic(() => import('../charts/VisibilityDistributionChart'), { ssr: false });

function getSeoLabel(score: number): string {
  if (score >= 75) return 'Optimum';
  if (score >= 50) return 'Average';
  return 'Low';
}

export default function StoreHealth() {
  const { user } = useAuth();
  const [stores, setStores] = useState<any[]>([]);
  const [selectedStore, setSelectedStore] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchStores = async () => {
      if (!user) return;
      const storesRef = collection(db, `users/${user.uid}/shopifyStores`);
      const storesSnap = await getDocs(storesRef);
      const storesData = storesSnap.docs.map(doc => ({ id: doc.id, shop: doc.id, ...doc.data() }));
      setStores(storesData);
      if (storesData.length > 0) handleStoreChange(storesData[0].id);
    };
    fetchStores();
  }, [user]);

  const handleStoreChange = async (storeId: string) => {
    const store = stores.find(s => s.id === storeId);
    setSelectedStore(store);
    if (!store) return;

    try {
      const res = await fetch(`/api/shopify/products?shop=${store.shop}&userId=${user?.uid}`);
      const data = await res.json();
      const enriched = data.products.map((p: any) => {
        const score = p.score || 0;
        const tags = p.tags?.split(',').filter((tag: string) => tag.trim()) || [];
        const altCount = p.images?.filter((img: any) => img.alt && img.alt.trim()).length || 0;
        const impressions = p.impressions || 0;
        return { ...p, seoScore: score, tagCount: tags.length, altCount, impressions };
      });
      setProducts(enriched);
    } catch (err) {
      console.error("Failed to fetch store products:", err);
      setProducts([]);
    }
  };

  const avgSeo = products.length > 0 ? products.reduce((acc, p) => acc + (p.seoScore || 0), 0) / products.length : 0;
  const fullyOptimizedCount = products.filter(p => p.seoScore >= 80).length;
  const missingTagOrAlt = products.filter(p => {
    const tagCount = p.tags?.split(',').filter((tag: string) => tag.trim()).length || 0;
    const altTextCount = p.images?.filter((img: any) => img.alt && img.alt.trim()).length || 0;
    return tagCount < 3 || altTextCount === 0;
  }).length;

  const visibilityDistribution = {
    high: products.filter(p => p.impressions > 3000).length,
    medium: products.filter(p => p.impressions <= 3000 && p.impressions > 1500).length,
    low: products.filter(p => p.impressions <= 1500).length,
  };

  return (
    <div className="space-y-6 text-white">
      <h2 className="text-2xl font-bold mb-4 text-white">Store-Level Metrics Overview</h2>

      {/* Store Select */}
      <div className="flex items-center space-x-4">
        <label className="text-sm font-medium text-white">Select Store:</label>
        <select
          onChange={(e) => handleStoreChange(e.target.value)}
          className="bg-[#2A2153] text-white border-none p-2 rounded shadow-sm"
        >
          <option value="">-- Choose Store --</option>
          {stores.map(store => (
            <option key={store.id} value={store.id}>{store.shop}</option>
          ))}
        </select>
      </div>

      {/* Metrics Cards */}
      <div className="space-y-6">
  {/* First Two Rows */}
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
    <div className="bg-[#2A2153] p-6 rounded-2xl shadow-md">
      <h3 className="text-md font-semibold mb-3 text-[#C084FC]">Average SEO Score</h3>
      <div className="text-3xl font-bold" style={{ color: avgSeo >= 75 ? '#4ade80' : avgSeo >= 50 ? '#facc15' : '#f87171' }}>
        {getSeoLabel(avgSeo)}
      </div>
    </div>

    <div className="bg-[#2A2153] p-6 rounded-2xl shadow-md">
      <h3 className="text-md font-semibold mb-3 text-[#C084FC]">% Products Fully Optimized</h3>
      <FullyOptimizedChart value={(fullyOptimizedCount / (products.length || 1)) * 100} />
    </div>

    <div className="bg-[#2A2153] p-6 rounded-2xl shadow-md text-center">
      <h3 className="text-md font-semibold mb-3 text-[#C084FC]">Missing Tags/Alt Text</h3>
      <div className="text-5xl font-bold text-red-400">{missingTagOrAlt}</div>
    </div>

    <div className="bg-[#2A2153] p-6 rounded-2xl shadow-md">
      <h3 className="text-md font-semibold mb-3 text-[#C084FC]">Visibility Distribution</h3>
      <VisibilityDistributionChart data={visibilityDistribution} />
    </div>

    <div className="bg-[#2A2153] p-6 rounded-2xl shadow-md">
      <h3 className="text-md font-semibold mb-3 text-[#C084FC]">Click-Through Rate (CTR)</h3>
      <p className="text-white/70">Coming soon...</p>
    </div>

    <div className="bg-[#2A2153] p-6 rounded-2xl shadow-md">
      <h3 className="text-md font-semibold mb-3 text-[#C084FC]">Conversion Rate (CVR)</h3>
      <p className="text-white/70">Coming soon...</p>
    </div>
  </div>

    { /* Third Row */}
    <div className="space-y-6">
  {/* First Two Rows */}
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
    {/* ...existing first and second row cards... */}
  </div>

  {/* Third Row - Increased Height */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[50vh]">
    <div className="bg-[#2A2153] p-6 rounded-2xl shadow-md h-full">
      <h3 className="text-md font-semibold mb-3 text-[#C084FC]">Meta Keyword Usage</h3>
      <p className="text-white/80">Coming soon...</p>
    </div>

    <div className="bg-[#2A2153] p-6 rounded-2xl shadow-md col-span-1 md:col-span-2 h-full">
      <h3 className="text-md font-semibold mb-3 text-[#C084FC]">Performance Summary</h3>
      <p className="text-white/70">
        This section spans two columns and can be used to show charts, summaries, or alerts related to SEO, traffic, or conversion trends.
      </p>
    </div>
  </div>
    </div>
     {/* Metrics Cards */}


</div>

    </div>
  );
}
