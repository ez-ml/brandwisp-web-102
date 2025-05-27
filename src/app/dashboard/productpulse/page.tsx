'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProductPulseData, useDashboardMutation } from '@/hooks/useDashboardData';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Loader2,
  Search,
  Star,
  TrendingUp,
  TrendingDown,
  BarChart2,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  ShoppingBag,
  Eye,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  DollarSign,
  Activity,
  Package,
  X,
  RefreshCw,
  AlertCircle,
  Filter,
  Store,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  RadialBarChart,
  RadialBar,
} from 'recharts';
import Image from 'next/image';

interface Product {
  id: string;
  storeId: string;
  storeName: string;
  platform: string;
  title: string;
  description: string;
  handle: string;
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
  seo: {
    title?: string;
    description?: string;
    keywords: string[];
  };
  analytics: {
    views: number;
    clicks: number;
    conversions: number;
    revenue: number;
    rating?: number;
    reviews?: number;
  };
}

interface ProductReview {
  id: string;
  platform: string;
  rating: number;
  comment: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  date: string | Date;
}

interface ProductMetrics {
  date: string;
  rating: number;
  reviews: number;
  sentiment: number;
  impressions: number;
  conversions: number;
  clicks: number;
  revenue: number;
}

interface SEOMetrics {
  score: number;
  titleOptimization: number;
  keywordDensity: number;
  altTextCoverage: number;
  metaDescription: number;
}

const COLORS = {
  primary: '#7C3AED',
  secondary: '#EC4899',
  tertiary: '#F59E0B',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  background: '#1E1B4B',
  cardBg: '#2A2153',
  border: '#3D3A6E',
  text: '#FFFFFF',
  textMuted: 'rgba(255, 255, 255, 0.6)',
};

export default function ProductPulsePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [productId, setProductId] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeView, setActiveView] = useState<'overview' | 'details' | 'seo'>('overview');
  const [showProductModal, setShowProductModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [storeFilter, setStoreFilter] = useState('all');

  // Fetch data from backend
  const { data: overviewData, loading: overviewLoading, error: overviewError, refetch: refetchOverview } = useProductPulseData(
    'overview',
    selectedProduct?.id,
    selectedProduct?.storeId
  );

  const { data: productsData, loading: productsLoading, error: productsError, refetch: refetchProducts } = useProductPulseData(
    'products'
  );

  // Filter products for the modal
  const filteredProducts = productsData?.products?.filter((product: Product) => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.productType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStore = storeFilter === 'all' || product.storeId === storeFilter;
    return matchesSearch && matchesStore;
  }) || [];

  const handleAnalyze = async () => {
    if (!selectedProduct) {
      alert('Please select a product first');
      return;
    }
    
    setLoading(true);
    try {
      // Refresh data for the selected product
      await refetchOverview();
    } catch (error) {
      console.error('Error analyzing product:', error);
      alert('Error analyzing product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setProductId(product.id);
    setShowProductModal(false);
  };

  // Generate empty chart data when no product is selected
  const emptyMetrics: ProductMetrics[] = Array.from({ length: 7 }, (_, i) => ({
    date: `Day ${i + 1}`,
    rating: 0,
    reviews: 0,
    sentiment: 0,
    impressions: 0,
    conversions: 0,
    clicks: 0,
    revenue: 0,
  }));

  // Use real data if product is selected, otherwise show overview data
  const metrics: ProductMetrics[] = selectedProduct && overviewData?.metrics?.length > 0 
    ? overviewData.metrics 
    : emptyMetrics;

  const seoMetrics: SEOMetrics = selectedProduct && overviewData?.seoMetrics 
    ? overviewData.seoMetrics 
    : {
        score: 0,
        titleOptimization: 0,
        keywordDensity: 0,
        altTextCoverage: 0,
        metaDescription: 0,
      };

  const reviews: ProductReview[] = selectedProduct && overviewData?.reviews 
    ? overviewData.reviews 
    : [];

  // Chart data
  const pieData = selectedProduct ? [
    { name: 'Positive', value: reviews.filter(r => r.sentiment === 'positive').length, color: '#10B981' },
    { name: 'Neutral', value: reviews.filter(r => r.sentiment === 'neutral').length, color: '#F59E0B' },
    { name: 'Negative', value: reviews.filter(r => r.sentiment === 'negative').length, color: '#EF4444' },
  ] : [
    { name: 'No Data', value: 1, color: '#6B7280' }
  ];

  const seoData = [
    { name: 'Title', value: seoMetrics.titleOptimization, fill: '#8B5CF6' },
    { name: 'Keywords', value: seoMetrics.keywordDensity, fill: '#EC4899' },
    { name: 'Alt Text', value: seoMetrics.altTextCoverage, fill: '#F59E0B' },
    { name: 'Meta Desc', value: seoMetrics.metaDescription, fill: '#10B981' },
  ];

  const platformData = selectedProduct && overviewData?.platformData?.length > 0 
    ? overviewData.platformData 
    : [];

  // Overview stats when no product is selected
  const overviewStats = overviewData?.totalAnalytics || {
    totalProducts: 0,
    totalViews: 0,
    totalRevenue: 0,
    avgRating: 0,
    totalReviews: 0
  };

  // Show loading state
  if (overviewLoading && !overviewData) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-[#1A1B3A] via-[#2A2153] to-[#1A1B3A] text-white flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-purple-400 mx-auto mb-4" />
            <p className="text-gray-300">Loading ProductPulse data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show no stores message
  if (overviewData?.message) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-[#1A1B3A] via-[#2A2153] to-[#1A1B3A] text-white p-6">
          <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400">
                  ProductPulse
                </h1>
                <p className="text-gray-400 mt-2 text-lg">
                  AI-Powered Product Analytics & Performance Insights
                </p>
              </div>
            </div>

            {/* No Stores Message */}
            <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-12 backdrop-blur-sm shadow-2xl text-center">
              <Store className="h-16 w-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Stores Connected</h3>
              <p className="text-gray-400 mb-6">{overviewData.message}</p>
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => window.location.href = '/dashboard/settings'}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Store className="h-4 w-4 mr-2" />
                  Connect Store
                </Button>
                <Button
                  onClick={async () => {
                    try {
                      const token = await user?.getIdToken();
                      const response = await fetch('/api/test/mock-stores', {
                        method: 'POST',
                        headers: {
                          'Authorization': `Bearer ${token}`,
                          'Content-Type': 'application/json',
                        },
                      });
                      if (response.ok) {
                        window.location.reload();
                      }
                    } catch (error) {
                      console.error('Error creating mock stores:', error);
                    }
                  }}
                  variant="outline"
                  className="border-purple-400/30 text-purple-300 hover:bg-purple-600/20"
                >
                  <Package className="h-4 w-4 mr-2" />
                  Add Demo Stores
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show error state
  if (overviewError) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-[#1A1B3A] via-[#2A2153] to-[#1A1B3A] text-white flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <p className="text-gray-300 mb-4">Error loading data: {overviewError}</p>
            <Button onClick={() => refetchOverview()} className="bg-purple-600 hover:bg-purple-700">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const renderOverview = () => (
    <>
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-purple-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-purple-600/30 to-purple-800/30 rounded-xl shadow-lg">
                <Star className="h-6 w-6 text-purple-300" />
              </div>
              <h3 className="font-medium ml-3 text-purple-200">
                {selectedProduct ? 'Product Rating' : 'Avg Rating'}
              </h3>
            </div>
            {selectedProduct && (
              <span className="text-green-400 flex items-center text-sm bg-green-400/10 px-2 py-1 rounded-full border border-green-400/20">
                +0.3
                <TrendingUp className="h-4 w-4 ml-1" />
              </span>
            )}
          </div>
          <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
            {selectedProduct 
              ? (overviewData?.analytics?.rating || 0).toFixed(1)
              : overviewStats.avgRating.toFixed(1)
            }
          </p>
          <p className="text-sm text-gray-400">
            {selectedProduct 
              ? `Based on ${reviews.length} reviews`
              : `Across ${overviewStats.totalProducts} products`
            }
          </p>
        </Card>

        <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-green-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-green-600/30 to-green-800/30 rounded-xl shadow-lg">
                <DollarSign className="h-6 w-6 text-green-300" />
              </div>
              <h3 className="font-medium ml-3 text-green-200">
                {selectedProduct ? 'Revenue' : 'Total Revenue'}
              </h3>
            </div>
            {selectedProduct && (
              <span className="text-green-400 flex items-center text-sm bg-green-400/10 px-2 py-1 rounded-full border border-green-400/20">
                +12%
                <TrendingUp className="h-4 w-4 ml-1" />
              </span>
            )}
          </div>
          <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 mb-2">
            ${selectedProduct 
              ? (overviewData?.analytics?.revenue || 0).toLocaleString()
              : overviewStats.totalRevenue.toLocaleString()
            }
          </p>
          <p className="text-sm text-gray-400">
            {selectedProduct ? 'Last 30 days' : 'All products'}
          </p>
        </Card>

        <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-blue-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-blue-600/30 to-blue-800/30 rounded-xl shadow-lg">
                <Eye className="h-6 w-6 text-blue-300" />
              </div>
              <h3 className="font-medium ml-3 text-blue-200">
                {selectedProduct ? 'Views' : 'Total Views'}
              </h3>
            </div>
            {selectedProduct && (
              <span className="text-green-400 flex items-center text-sm bg-green-400/10 px-2 py-1 rounded-full border border-green-400/20">
                +8%
                <TrendingUp className="h-4 w-4 ml-1" />
              </span>
            )}
          </div>
          <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-2">
            {selectedProduct 
              ? (overviewData?.analytics?.views || 0).toLocaleString()
              : overviewStats.totalViews.toLocaleString()
            }
          </p>
          <p className="text-sm text-gray-400">
            {selectedProduct ? 'Last 30 days' : 'All products'}
          </p>
        </Card>

        <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-orange-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-orange-600/30 to-orange-800/30 rounded-xl shadow-lg">
                <Target className="h-6 w-6 text-orange-300" />
              </div>
              <h3 className="font-medium ml-3 text-orange-200">
                {selectedProduct ? 'Conversions' : 'Total Products'}
              </h3>
            </div>
            {selectedProduct && (
              <span className="text-green-400 flex items-center text-sm bg-green-400/10 px-2 py-1 rounded-full border border-green-400/20">
                +15%
                <TrendingUp className="h-4 w-4 ml-1" />
              </span>
            )}
          </div>
          <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400 mb-2">
            {selectedProduct 
              ? (overviewData?.analytics?.conversions || 0).toLocaleString()
              : overviewStats.totalProducts.toLocaleString()
            }
          </p>
          <p className="text-sm text-gray-400">
            {selectedProduct ? 'Last 30 days' : 'Across all stores'}
          </p>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm shadow-2xl">
          <h2 className="text-xl font-semibold mb-6 text-purple-300 flex items-center">
            <BarChart2 className="h-5 w-5 mr-2" />
            {selectedProduct ? 'Performance Trends' : 'Overall Performance'}
          </h2>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={selectedProduct ? metrics : (overviewData?.performanceMetrics || emptyMetrics)}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#3D3A6E" opacity={0.3} />
                <XAxis dataKey="date" stroke="#A78BFA" fontSize={12} />
                <YAxis stroke="#A78BFA" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(30, 27, 75, 0.95)',
                    borderColor: '#3D3A6E',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                    backdropFilter: 'blur(10px)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey={selectedProduct ? "revenue" : "totalRevenue"}
                  stroke="#10B981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
                <Area
                  type="monotone"
                  dataKey={selectedProduct ? "impressions" : "totalViews"}
                  stroke="#8B5CF6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorViews)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm shadow-2xl">
          <h2 className="text-xl font-semibold mb-6 text-purple-300 flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            {selectedProduct ? 'Review Sentiment' : 'Category Breakdown'}
          </h2>
          <div className="h-[350px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={selectedProduct ? pieData : (overviewData?.categoryBreakdown || pieData)}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={120}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {(selectedProduct ? pieData : (overviewData?.categoryBreakdown || pieData)).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(30, 27, 75, 0.95)',
                    borderColor: '#3D3A6E',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                    backdropFilter: 'blur(10px)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {(selectedProduct ? pieData : (overviewData?.categoryBreakdown || pieData)).map((item: any, index: number) => (
              <div key={index} className="flex items-center">
                <div 
                  className="w-4 h-4 rounded-full mr-2 shadow-lg" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-300">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {selectedProduct && (
        <>
          {/* Platform Performance */}
          {platformData.length > 0 && (
            <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm shadow-2xl">
              <h2 className="text-xl font-semibold mb-6 text-purple-300 flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Platform Performance
              </h2>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={platformData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3D3A6E" opacity={0.3} />
                    <XAxis dataKey="name" stroke="#A78BFA" fontSize={12} />
                    <YAxis stroke="#A78BFA" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(30, 27, 75, 0.95)',
                        borderColor: '#3D3A6E',
                        borderRadius: '12px',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                        backdropFilter: 'blur(10px)',
                      }}
                    />
                    <Bar dataKey="reviews" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="rating" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}

          {/* Recent Reviews */}
          {reviews.length > 0 && (
            <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm shadow-2xl">
              <h2 className="text-xl font-semibold mb-6 text-purple-300 flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Recent Reviews
              </h2>
              <div className="space-y-4">
                {reviews.slice(0, 5).map((review) => (
                  <div
                    key={review.id}
                    className="bg-gradient-to-r from-[#1E1B4B]/60 to-[#1E1B4B]/40 rounded-xl border border-[#3D3A6E] p-4 backdrop-blur-sm"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="bg-purple-600/20 text-purple-300 px-3 py-1 rounded-full text-sm font-medium border border-purple-400/30">
                          {review.platform}
                        </span>
                        <div className="flex items-center">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          review.sentiment === 'positive' ? 'bg-green-400/20 text-green-400 border border-green-400/30' :
                          review.sentiment === 'negative' ? 'bg-red-400/20 text-red-400 border border-red-400/30' :
                          'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30'
                        }`}>
                          {review.sentiment}
                        </span>
                        <span className="text-sm text-gray-400">
                          {new Date(review.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-300 leading-relaxed">{review.comment}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}

      {/* Top Products when no product selected */}
      {!selectedProduct && overviewData?.topProducts?.length > 0 && (
        <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm shadow-2xl">
          <h2 className="text-xl font-semibold mb-6 text-purple-300 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Top Performing Products
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {overviewData.topProducts.slice(0, 6).map((product: Product) => (
              <div
                key={product.id}
                className="bg-gradient-to-br from-[#1E1B4B]/60 to-[#1E1B4B]/40 rounded-xl border border-[#3D3A6E] p-4 backdrop-blur-sm hover:bg-[#1E1B4B]/80 transition-all duration-300 cursor-pointer"
                onClick={() => handleProductSelect(product)}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-lg flex items-center justify-center border border-green-400/30 overflow-hidden">
                    {product.images?.[0]?.src ? (
                      <Image
                        src={product.images[0].src}
                        alt={product.images[0].altText || product.title}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = `<div class="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-md flex items-center justify-center text-white text-xs font-bold">${product.productType?.charAt(0) || 'P'}</div>`;
                          }
                        }}
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-md flex items-center justify-center text-white text-xs font-bold">
                        {product.productType?.charAt(0) || 'P'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white truncate">{product.title}</h3>
                    <p className="text-sm text-gray-400">{product.storeName}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-400">Revenue:</span>
                    <span className="text-green-400 ml-1 font-semibold">
                      ${product.analytics?.revenue?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Views:</span>
                    <span className="text-blue-400 ml-1 font-semibold">
                      {product.analytics?.views?.toLocaleString() || 0}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </>
  );

  const renderDetails = () => (
    <div className="space-y-6">
      {!selectedProduct ? (
        <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-12 backdrop-blur-sm shadow-2xl text-center">
          <Package className="h-16 w-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Product Selected</h3>
          <p className="text-gray-400 mb-6">Select a product to view detailed analytics and insights</p>
          <Button
            onClick={() => setShowProductModal(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Search className="h-4 w-4 mr-2" />
            Browse Products
          </Button>
        </Card>
      ) : (
        <>
          {/* Product Details */}
          <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm shadow-2xl">
            <h2 className="text-xl font-semibold mb-6 text-purple-300 flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Product Information
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <div className="aspect-square bg-gradient-to-br from-purple-600/10 to-pink-600/10 rounded-lg mb-4 flex items-center justify-center border border-purple-400/20 overflow-hidden">
                  {selectedProduct.images?.[0]?.src ? (
                    <Image
                      src={selectedProduct.images[0].src}
                      alt={selectedProduct.images[0].altText || selectedProduct.title}
                      width={400}
                      height={400}
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `<div class="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white text-4xl font-bold shadow-2xl">${selectedProduct.productType?.charAt(0) || 'P'}</div>`;
                        }
                      }}
                    />
                  ) : (
                    <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white text-4xl font-bold shadow-2xl">
                      {selectedProduct.productType?.charAt(0) || 'P'}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">{selectedProduct.title}</h3>
                  <p className="text-gray-300">{selectedProduct.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Vendor:</span>
                    <span className="text-white ml-2">{selectedProduct.vendor}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Type:</span>
                    <span className="text-white ml-2">{selectedProduct.productType}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Status:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      selectedProduct.status === 'active' ? 'bg-green-400/20 text-green-400' : 'bg-gray-400/20 text-gray-400'
                    }`}>
                      {selectedProduct.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Store:</span>
                    <span className="text-white ml-2">{selectedProduct.storeName}</span>
                  </div>
                </div>
                <div>
                  <span className="text-gray-400">Tags:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedProduct.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-purple-600/20 text-purple-300 px-2 py-1 rounded text-xs border border-purple-400/30"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Variants */}
          {selectedProduct.variants?.length > 0 && (
            <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm shadow-2xl">
              <h2 className="text-xl font-semibold mb-6 text-purple-300 flex items-center">
                <ShoppingBag className="h-5 w-5 mr-2" />
                Product Variants
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedProduct.variants.map((variant) => (
                  <div
                    key={variant.id}
                    className="bg-gradient-to-br from-[#1E1B4B]/60 to-[#1E1B4B]/40 rounded-xl border border-[#3D3A6E] p-4 backdrop-blur-sm"
                  >
                    <h3 className="font-semibold text-white mb-2">{variant.title}</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Price:</span>
                        <span className="text-green-400 font-semibold">${variant.price}</span>
                      </div>
                      {variant.compareAtPrice && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Compare at:</span>
                          <span className="text-gray-500 line-through">${variant.compareAtPrice}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-400">SKU:</span>
                        <span className="text-white">{variant.sku}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Inventory:</span>
                        <span className={`font-semibold ${
                          variant.inventory > 10 ? 'text-green-400' : 
                          variant.inventory > 0 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {variant.inventory}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );

  const renderSEOView = () => (
    <div className="space-y-6">
      {!selectedProduct ? (
        <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-12 backdrop-blur-sm shadow-2xl text-center">
          <Target className="h-16 w-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Product Selected</h3>
          <p className="text-gray-400 mb-6">Select a product to view SEO analysis and recommendations</p>
          <Button
            onClick={() => setShowProductModal(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Search className="h-4 w-4 mr-2" />
            Browse Products
          </Button>
        </Card>
      ) : (
        <>
          {/* SEO Score Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm shadow-2xl">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={[{ value: seoMetrics.score }]}>
                      <RadialBar dataKey="value" cornerRadius={10} fill="#10B981" />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
                <h3 className="text-lg font-semibold text-white">Overall SEO</h3>
                <p className="text-3xl font-bold text-green-400">{seoMetrics.score}%</p>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm shadow-2xl">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={[{ value: seoMetrics.titleOptimization }]}>
                      <RadialBar dataKey="value" cornerRadius={10} fill="#8B5CF6" />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
                <h3 className="text-lg font-semibold text-white">Title</h3>
                <p className="text-3xl font-bold text-purple-400">{seoMetrics.titleOptimization}%</p>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm shadow-2xl">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={[{ value: seoMetrics.keywordDensity }]}>
                      <RadialBar dataKey="value" cornerRadius={10} fill="#EC4899" />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
                <h3 className="text-lg font-semibold text-white">Keywords</h3>
                <p className="text-3xl font-bold text-pink-400">{seoMetrics.keywordDensity}%</p>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm shadow-2xl">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={[{ value: seoMetrics.altTextCoverage }]}>
                      <RadialBar dataKey="value" cornerRadius={10} fill="#F59E0B" />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
                <h3 className="text-lg font-semibold text-white">Alt Text</h3>
                <p className="text-3xl font-bold text-orange-400">{seoMetrics.altTextCoverage}%</p>
              </div>
            </Card>
          </div>

          {/* SEO Details */}
          <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm shadow-2xl">
            <h2 className="text-xl font-semibold mb-6 text-purple-300 flex items-center">
              <Target className="h-5 w-5 mr-2" />
              SEO Analysis
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Current SEO Data</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400">Title</label>
                    <p className="text-white bg-[#1E1B4B]/60 rounded-lg p-3 mt-1">
                      {selectedProduct.seo?.title || selectedProduct.title}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Description</label>
                    <p className="text-white bg-[#1E1B4B]/60 rounded-lg p-3 mt-1">
                      {selectedProduct.seo?.description || selectedProduct.description}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Keywords</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedProduct.seo?.keywords?.map((keyword, index) => (
                        <span
                          key={index}
                          className="bg-blue-600/20 text-blue-300 px-2 py-1 rounded text-sm border border-blue-400/30"
                        >
                          {keyword}
                        </span>
                      )) || <span className="text-gray-500">No keywords defined</span>}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-4">SEO Breakdown</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={seoData} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" stroke="#3D3A6E" opacity={0.3} />
                      <XAxis type="number" domain={[0, 100]} stroke="#A78BFA" fontSize={12} />
                      <YAxis dataKey="name" type="category" stroke="#A78BFA" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(30, 27, 75, 0.95)',
                          borderColor: '#3D3A6E',
                          borderRadius: '12px',
                          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                          backdropFilter: 'blur(10px)',
                        }}
                      />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-[#1E1B4B] via-[#2D2A5E] to-[#1E1B4B] p-6">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400">
                ProductPulse
              </h1>
              <p className="text-gray-400 mt-2 text-lg">
                {selectedProduct 
                  ? `Analyzing: ${selectedProduct.title}`
                  : 'AI-Powered Product Analytics & Performance Insights'
                }
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setActiveView('overview')}
                className={`px-6 py-2 rounded-xl transition-all duration-300 ${
                  activeView === 'overview'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                    : 'bg-transparent text-purple-300 hover:bg-purple-600/20 border-purple-400/30'
                }`}
              >
                Overview
              </Button>
              <Button
                variant="outline"
                onClick={() => setActiveView('details')}
                className={`px-6 py-2 rounded-xl transition-all duration-300 ${
                  activeView === 'details'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                    : 'bg-transparent text-purple-300 hover:bg-purple-600/20 border-purple-400/30'
                }`}
              >
                Details
              </Button>
              <Button
                variant="outline"
                onClick={() => setActiveView('seo')}
                className={`px-6 py-2 rounded-xl transition-all duration-300 ${
                  activeView === 'seo'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                    : 'bg-transparent text-purple-300 hover:bg-purple-600/20 border-purple-400/30'
                }`}
              >
                SEO
              </Button>
            </div>
          </div>

          {/* Product Selection */}
          <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm shadow-2xl">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1">
                <Input
                  placeholder="Enter Product ID or search..."
                  className="bg-[#1E1B4B]/70 border-[#3D3A6E] text-white backdrop-blur-sm"
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowProductModal(true)}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 px-6 py-2 rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Browse Products
                </Button>
                <Button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-6 py-2 rounded-xl shadow-lg hover:shadow-green-500/25 transition-all duration-300"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <BarChart2 className="h-4 w-4 mr-2" />
                      Analyze Product
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>

          {/* Dynamic Content */}
          {activeView === 'overview' && renderOverview()}
          {activeView === 'details' && renderDetails()}
          {activeView === 'seo' && renderSEOView()}

          {/* Product Selection Modal */}
          {showProductModal && (
            <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4">
              <div className="w-full max-w-6xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-[#2A2153] to-[#1E1B4B] rounded-2xl shadow-2xl border border-[#3D3A6E]">
                <div className="sticky top-0 bg-gradient-to-r from-[#2A2153] to-[#1E1B4B] border-b border-[#3D3A6E] p-6 flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white">Select Product</h2>
                  <Button 
                    onClick={() => setShowProductModal(false)} 
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="p-6">
                  {/* Summary Statistics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 p-4 rounded-xl border border-purple-400/30">
                      <p className="text-sm text-purple-300 mb-1">Total Products</p>
                      <p className="text-2xl font-bold text-white">{productsData?.totalCount || 0}</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 p-4 rounded-xl border border-blue-400/30">
                      <p className="text-sm text-blue-300 mb-1">Active Products</p>
                      <p className="text-2xl font-bold text-white">
                        {filteredProducts.filter((p: Product) => p.status === 'active').length}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 p-4 rounded-xl border border-green-400/30">
                      <p className="text-sm text-green-300 mb-1">Total Revenue</p>
                      <p className="text-2xl font-bold text-white">
                        ${filteredProducts.reduce((sum: number, p: Product) => sum + (p.analytics?.revenue || 0), 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-600/20 to-orange-800/20 p-4 rounded-xl border border-orange-400/30">
                      <p className="text-sm text-orange-300 mb-1">Avg Rating</p>
                      <p className="text-2xl font-bold text-white">
                        {filteredProducts.length > 0 
                          ? (filteredProducts.reduce((sum: number, p: Product) => sum + (p.analytics?.rating || 0), 0) / filteredProducts.length).toFixed(1)
                          : '0.0'
                        }
                      </p>
                    </div>
                  </div>

                  {/* Search and Filter */}
                  <div className="flex gap-4 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search products..."
                        className="bg-[#1E1B4B]/70 border-[#3D3A6E] text-white pl-10 backdrop-blur-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <select
                      className="bg-[#1E1B4B]/70 border border-[#3D3A6E] rounded-lg px-4 py-2 text-white backdrop-blur-sm min-w-[200px]"
                      value={storeFilter}
                      onChange={(e) => setStoreFilter(e.target.value)}
                    >
                      <option value="all">All Stores</option>
                      {productsData?.stores?.map((store: any) => (
                        <option key={store.id} value={store.id}>
                          {store.name} ({store.platform})
                        </option>
                      ))}
                    </select>
                  </div>

                                    {/* Products List */}
                  <div className="max-h-[60vh] overflow-y-auto">
                    {productsLoading ? (
                      <div className="text-center py-12">
                        <Loader2 className="h-12 w-12 animate-spin text-purple-400 mx-auto mb-4" />
                        <p className="text-gray-300">Loading products...</p>
                      </div>
                    ) : productsData?.products?.length === 0 ? (
                      <div className="text-center py-12">
                        <Package className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                        <p className="text-gray-400 text-lg">No products available</p>
                        <p className="text-gray-500 text-sm mb-4">
                          {productsData?.stores?.length === 0 
                            ? 'No stores connected. Please connect a store first.'
                            : 'No products found in your connected stores.'
                          }
                        </p>
                        {productsData?.stores?.length === 0 && (
                          <Button
                            onClick={() => {
                              setShowProductModal(false);
                              window.location.href = '/dashboard/settings';
                            }}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                          >
                            <Store className="h-4 w-4 mr-2" />
                            Connect Store
                          </Button>
                        )}
                      </div>
                    ) : filteredProducts.length === 0 ? (
                      <div className="text-center py-12">
                        <Package className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                        <p className="text-gray-400 text-lg">No products found</p>
                        <p className="text-gray-500 text-sm">Try adjusting your search or filter criteria</p>
                      </div>
                    ) : (
                      <div className="bg-gradient-to-br from-[#1E1B4B]/90 to-[#1E1B4B]/70 rounded-xl border border-[#3D3A6E] overflow-hidden">
                        <table className="min-w-full">
                          <thead className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-b border-[#3D3A6E]">
                            <tr>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-purple-300">Product</th>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-purple-300">Store & Platform</th>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-purple-300">Analytics</th>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-purple-300">Performance</th>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-purple-300">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredProducts.map((product: Product, index: number) => (
                              <tr 
                                key={product.id} 
                                className="border-b border-[#3D3A6E]/50 hover:bg-gradient-to-r hover:from-purple-600/10 hover:to-pink-600/10 transition-all duration-300 cursor-pointer group"
                                onClick={() => handleProductSelect(product)}
                              >
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-xl flex items-center justify-center border border-purple-400/30 group-hover:scale-110 transition-transform duration-300 group-hover:shadow-lg group-hover:shadow-purple-500/25 overflow-hidden">
                                      {product.images?.[0]?.src ? (
                                        <Image
                                          src={product.images[0].src}
                                          alt={product.images[0].altText || product.title}
                                          width={64}
                                          height={64}
                                          className="w-full h-full object-cover rounded-xl"
                                          onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                            const parent = target.parentElement;
                                            if (parent) {
                                              parent.innerHTML = `<div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">${product.productType?.charAt(0) || 'P'}</div>`;
                                            }
                                          }}
                                        />
                                      ) : (
                                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                                          {product.productType?.charAt(0) || 'P'}
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h3 className="font-semibold text-white group-hover:text-purple-300 transition-colors duration-300 truncate">
                                        {product.title}
                                      </h3>
                                      <p className="text-sm text-gray-400 truncate">{product.vendor}</p>
                                      <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-gray-500">{product.productType}</span>
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                          product.status === 'active' 
                                            ? 'bg-green-400/20 text-green-400 border border-green-400/30' 
                                            : 'bg-gray-400/20 text-gray-400 border border-gray-400/30'
                                        }`}>
                                          {product.status}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <Store className="h-4 w-4 text-gray-400" />
                                      <span className="text-white text-sm">{product.storeName}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-sm"></div>
                                      <span className="text-gray-300 text-sm capitalize">{product.platform}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-gray-400">Views:</span>
                                      <span className="text-blue-400 font-medium">
                                        {product.analytics?.views?.toLocaleString() || '0'}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-400">Clicks:</span>
                                      <span className="text-purple-400 font-medium">
                                        {product.analytics?.clicks?.toLocaleString() || '0'}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-400">Conversions:</span>
                                      <span className="text-green-400 font-medium">
                                        {product.analytics?.conversions?.toLocaleString() || '0'}
                                      </span>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-gray-400">Revenue:</span>
                                      <span className="text-green-400 font-bold">
                                        ${product.analytics?.revenue?.toLocaleString() || '0'}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-400">Rating:</span>
                                      <div className="flex items-center gap-1">
                                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                                        <span className="text-yellow-400 font-medium">
                                          {product.analytics?.rating?.toFixed(1) || '0.0'}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-400">Reviews:</span>
                                      <span className="text-gray-300 font-medium">
                                        {product.analytics?.reviews?.toLocaleString() || '0'}
                                      </span>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <Button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleProductSelect(product);
                                    }}
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-purple-500/25"
                                  >
                                    <BarChart2 className="h-4 w-4 mr-2" />
                                    Analyze
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
} 