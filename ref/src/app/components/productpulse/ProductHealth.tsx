'use client';

import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { useAuth } from "@/hooks/useAuth";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import dynamic from "next/dynamic";

import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const FullyOptimizedChart = dynamic(() => import('../charts/FullyOptimizedChart'), { ssr: false });
const VisibilityDistributionChart = dynamic(() => import('../charts/VisibilityDistributionChart'), { ssr: false });

function calculateSeoScore(product: any) {
  let score = 0;
  const suggestions: string[] = [];

  const titleLength = product.title?.length || 0;
  if (titleLength >= 50 && titleLength <= 70) score += 20;
  else suggestions.push(`Title length is ${titleLength} — aim for 50–70 characters.`);

  const keywords = ["essential", "natural", "organic", "soothing", "wellness"];
  const combinedText = `${product.title || ""} ${product.body_html || ""}`.toLowerCase();
  const keywordMatch = keywords.some(keyword => combinedText.includes(keyword));
  if (keywordMatch) score += 25;
  else suggestions.push("No top SEO keywords found in title or description.");

  const altTextCount = product.images?.filter((img: any) => img.alt && img.alt.trim()).length || 0;
  if (altTextCount > 0) score += 15;
  else suggestions.push("No descriptive alt text found for product images.");

  const tagCount = product.tags?.split(",").filter((tag: string) => tag.trim()).length || 0;
  if (tagCount >= 3) score += 15;
  else suggestions.push(`Only ${tagCount} tags found — add at least 3 relevant tags.`);

  const bulletCount = (product.body_html?.match(/<li>/g) || []).length;
  if (bulletCount >= 3) score += 15;
  else suggestions.push(`Only ${bulletCount} bullet points — add at least 3 feature bullets.`);

  const categoryDepth = (product.product_type || "").split(">").filter(Boolean).length;
  if (categoryDepth >= 2) score += 10;
  else suggestions.push(`Category depth is ${categoryDepth} — use at least 2 levels (e.g., Skin > Cream).`);

  return { score, suggestions };
}

function getSeoLabel(score: number): string {
  if (score >= 75) return "Optimum";
  if (score >= 50) return "Average";
  return "Low";
}

function getSeoColor(score: number): string {
  if (score >= 75) return "#4ade80";
  if (score >= 50) return "#facc15";
  return "#f87171";
}

export default function ProductHealth() {
  const { user } = useAuth();
  const [stores, setStores] = useState<any[]>([]);
  const [selectedStore, setSelectedStore] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  useEffect(() => {
    const fetchStores = async () => {
      if (!user) return;
      const storesRef = collection(db, `users/${user.uid}/shopifyStores`);
      const storesSnap = await getDocs(storesRef);
      const storesData = storesSnap.docs.map(doc => ({ id: doc.id, shop: doc.id, ...doc.data() }));
      setStores(storesData);

      // Auto-select the first store and load its products
      if (storesData.length > 0) {
        const firstStore = storesData[0];
        setSelectedStore(firstStore);
        fetchProducts(firstStore.id, firstStore.shop);
      }
    };

    fetchStores();
  }, [user]);

  const fetchProducts = async (storeId: string, shop: string) => {
    try {
      const res = await fetch(`/api/shopify/products?shop=${shop}&userId=${user?.uid}`);
      const data = await res.json();
      const enriched = data.products.map((p: any) => {
        const result = calculateSeoScore(p);
        return {
          id: String(p.id),
          name: p.title,
          seoScore: result.score,
          seoSuggestions: result.suggestions,
          titleLength: p.title.length,
          keywordMatch: result.score >= 25,
          altTextCount: p.images?.filter((img: any) => img.alt).length || 0,
          metadataCount: p.tags?.split(",").filter((tag: string) => tag.trim()).length || 0,
          bulletCount: (p.body_html?.match(/<li>/g) || []).length,
          categoryDepth: (p.product_type || "").split(">").filter(Boolean).length,
          clicks: Array.from({ length: 8 }, () => Math.floor(Math.random() * 30) + 10),
          impressions: Array.from({ length: 8 }, () => Math.floor(Math.random() * 1000) + 2800),
          conversions: Array.from({ length: 8 }, () => Math.floor(Math.random() * 10) + 5),
        };
      });
      setProducts(enriched);
      setSelectedProduct(enriched[0]); // auto-select first product
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setProducts([]);
      setSelectedProduct(null);
    }
  };

  const handleStoreChange = (storeId: string) => {
    const store = stores.find(s => s.id === storeId);
    setSelectedStore(store);
    if (store) fetchProducts(store.id, store.shop);
  };

  const handleProductChange = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) setSelectedProduct(product);
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
      {/* Store and Product Selectors */}
      <div className="flex flex-wrap items-center space-x-8">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium">Select Store:</label>
          <select
            onChange={(e) => handleStoreChange(e.target.value)}
            className="bg-[#2A2153] text-white border-none p-2 rounded shadow-sm"
            value={selectedStore?.id || ''}
          >
            {stores.map(store => (
              <option key={store.id} value={store.id}>{store.shop}</option>
            ))}
          </select>
        </div>

        {products.length > 0 && (
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium">Select Product:</label>
            <select
              onChange={(e) => handleProductChange(e.target.value)}
              className="bg-[#2A2153] text-white border-none p-2 rounded shadow-sm"
              value={selectedProduct?.id || ''}
            >
              {products.map(product => (
                <option key={product.id} value={product.id}>{product.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Render metrics and charts */}
      {selectedProduct && (
        <>
          {/* Metrics Row */}
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

          {/* Additional rows, charts, suggestions can follow here */}
        </>
      )}
    </div>
  );
}
