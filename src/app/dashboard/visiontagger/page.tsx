'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useVisionTaggerData, useDashboardMutation } from '@/hooks/useDashboardData';
import { useRealStoreData } from '@/hooks/useRealStoreData';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Loader2,
  Search,
  Tag,
  Eye,
  Edit3,
  Check,
  X,
  Image as ImageIcon,
  Sparkles,
  Target,
  BarChart3,
  TrendingUp,
  Zap,
  Camera,
  FileText,
  Settings,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Filter,
  Grid,
  List,
  Package,
  Store,
  Wand2,
  Upload,
  Download,
  ExternalLink,
  ShoppingBag,
  Star,
  AlertTriangle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  RadialBarChart,
  RadialBar,
  LineChart,
  Line,
} from 'recharts';
import Image from 'next/image';

interface Product {
  id: string;
  storeId: string;
  storeName: string;
  platform: string;
  title: string;
  description: string;
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
  analytics: {
    views: number;
    clicks: number;
    conversions: number;
    revenue: number;
    rating?: number;
    reviews?: number;
  };
}

interface ImageAnalysis {
  id: string;
  productId: string;
  imageUrl: string;
  status: 'pending' | 'analyzing' | 'completed' | 'error';
  analysis: {
    tags: Array<{
      label: string;
      confidence: number;
      category: string;
    }>;
    objects: Array<{
      name: string;
      confidence: number;
      boundingBox: {
        x: number;
        y: number;
        width: number;
        height: number;
      };
    }>;
    colors: Array<{
      hex: string;
      percentage: number;
      name: string;
    }>;
    text?: Array<{
      content: string;
      confidence: number;
      language: string;
    }>;
  };
  seo: {
    currentAltText?: string;
    suggestedAltText: string;
    currentCaption?: string;
    suggestedCaption: string;
    currentDescription?: string;
    suggestedDescription: string;
    score: number;
  };
  accessibility: {
    score: number;
    issues: string[];
    suggestions: string[];
  };
  createdAt: Date;
  analyzedAt?: Date;
  updatedAt: Date;
}

interface VisionMetrics {
  date: string;
  imagesAnalyzed: number;
  seoScore: number;
  accessibilityScore: number;
  issuesFixed: number;
}

const COLORS = {
  primary: '#7C3AED',
  secondary: '#EC4899',
  tertiary: '#F59E0B',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
};

export default function VisionTaggerPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState<'dashboard' | 'analyze' | 'manage'>('dashboard');
  
  // Product and store data
  const { stores, products: realProducts, loading: storesLoading, error: storesError } = useRealStoreData();
  
  // Fetch data from backend
  const { data: dashboardData, loading: dataLoading, error: dataError, refetch } = useVisionTaggerData(activeView);
  const { mutate: analyzeImage } = useDashboardMutation('visiontagger');
  
  // Product selection states
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [storeFilter, setStoreFilter] = useState('all');
  
  // Image analysis states
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingImage, setEditingImage] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzingImages, setAnalyzingImages] = useState<Set<string>>(new Set());
  
  // Management states
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Auto-scan settings
  const [autoScanEnabled, setAutoScanEnabled] = useState(false);
  const [scanFrequency, setScanFrequency] = useState('daily');
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Filter products for the modal
  const allProducts = realProducts.length > 0 ? realProducts : [];
  const filteredProducts = allProducts.filter((product: Product) => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.productType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStore = storeFilter === 'all' || product.storeId === storeFilter;
    return matchesSearch && matchesStore;
  });

  // Get images for selected product or all analyzed images
  const getProductImages = useCallback(() => {
    if (!selectedProduct) return [];
    return selectedProduct.images || [];
  }, [selectedProduct]);

  // Generate metrics data from backend data
  const metricsData: VisionMetrics[] = dashboardData?.analytics?.topTags ? 
    dashboardData.analytics.topTags.slice(0, 7).map((tag: any, index: number) => ({
      date: `Day ${index + 1}`,
      imagesAnalyzed: tag.count || 0,
      seoScore: dashboardData.analytics.avgSeoScore || 0,
      accessibilityScore: dashboardData.analytics.avgAccessibilityScore || 0,
      issuesFixed: Math.floor((tag.count || 0) * 0.7),
    })) : [];

  const categoryData = dashboardData?.analytics?.topTags ? 
    dashboardData.analytics.topTags.slice(0, 4).map((tag: any, index: number) => ({
      name: tag.label,
      value: tag.count,
      color: ['#10B981', '#F59E0B', '#8B5CF6', '#EC4899'][index] || '#6B7280',
    })) : [];

  const backendSeoScore = dashboardData?.analytics?.avgSeoScore || 0;
  const backendAccessibilityScore = dashboardData?.analytics?.avgAccessibilityScore || 0;

  const seoScoreData = [
    { name: 'SEO Score', value: backendSeoScore, fill: '#10B981' },
    { name: 'Remaining', value: 100 - backendSeoScore, fill: '#374151' },
  ];

  const accessibilityData = [
    { name: 'Accessibility', value: backendAccessibilityScore, fill: '#3B82F6' },
    { name: 'Remaining', value: 100 - backendAccessibilityScore, fill: '#374151' },
  ];

  // Handle product selection
  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setShowProductModal(false);
    setActiveView('analyze');
  };

  // Handle image analysis
  const handleAnalyzeImage = async (imageUrl: string, imageId: string) => {
    if (!selectedProduct) return;
    
    setAnalyzingImages(prev => new Set(prev).add(imageId));
    
    try {
      const result = await analyzeImage({
        action: 'analyze',
        productId: selectedProduct.id,
        imageUrl,
        imageId,
        imageData: {
          productTitle: selectedProduct.title,
          productDescription: selectedProduct.description,
        }
      });
      
      console.log('✅ Image analysis result:', result);
      
      // Refresh data after analysis
      await refetch();
    } catch (error) {
      console.error('❌ Error analyzing image:', error);
      // Show user-friendly error message
      alert('Failed to analyze image. Please try again.');
    } finally {
      setAnalyzingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(imageId);
        return newSet;
      });
    }
  };

  // Handle bulk analysis
  const handleAnalyzeAllImages = async () => {
    if (!selectedProduct) return;
    
    setAnalyzing(true);
    
    try {
      const images = getProductImages();
      for (const image of images) {
        await handleAnalyzeImage(image.src, image.id);
      }
    } catch (error) {
      console.error('Error analyzing images:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  // Handle image fixing
  const handleFixImage = async (imageData: any) => {
    try {
      await analyzeImage({
        action: 'update',
        imageId: imageData.id,
        imageData: {
          seo: {
            currentAltText: imageData.altText,
            currentCaption: imageData.caption,
            currentDescription: imageData.description,
          },
          status: 'fixed',
        },
      });
      
      setShowEditModal(false);
      setEditingImage(null);
      await refetch();
    } catch (error) {
      console.error('Error fixing image:', error);
    }
  };

  // Auto-scan settings
  const handleSaveAutoScanSettings = async () => {
    try {
      await analyzeImage({
        action: 'configure-autoscan',
        settings: {
          enabled: autoScanEnabled,
          frequency: scanFrequency,
        },
      });
      
      setShowSettingsModal(false);
    } catch (error) {
      console.error('Error saving auto-scan settings:', error);
    }
  };

  // Show loading state
  if (dataLoading && !dashboardData) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-[#1A1B3A] via-[#2A2153] to-[#1A1B3A] text-white flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-purple-400 mx-auto mb-4" />
            <p className="text-gray-300">Loading VisionTagger data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show error state
  if (dataError) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-[#1A1B3A] via-[#2A2153] to-[#1A1B3A] text-white flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-300 text-lg mb-2">Error loading VisionTagger data</p>
            <p className="text-gray-400 mb-4">{dataError}</p>
            <Button onClick={() => refetch()} className="bg-purple-600 hover:bg-purple-700">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Dashboard view component
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Total Products</p>
              <p className="text-3xl font-bold text-white">{allProducts.length}</p>
              <p className="text-xs text-green-400 mt-1">
                +{Math.floor(allProducts.length * 0.1)} this week
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-purple-600/30 to-purple-800/30 rounded-xl">
              <Package className="h-8 w-8 text-purple-300" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Images Analyzed</p>
              <p className="text-3xl font-bold text-white">{dashboardData?.summary?.totalImages || 0}</p>
              <p className="text-xs text-blue-400 mt-1">
                {dashboardData?.summary?.pendingAnalysis || 0} pending
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-blue-600/30 to-blue-800/30 rounded-xl">
              <Camera className="h-8 w-8 text-blue-300" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Avg SEO Score</p>
              <p className="text-3xl font-bold text-white">{backendSeoScore}</p>
              <p className="text-xs text-green-400 mt-1">
                +{Math.floor(backendSeoScore * 0.05)} improvement
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-green-600/30 to-green-800/30 rounded-xl">
              <Target className="h-8 w-8 text-green-300" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Accessibility Score</p>
              <p className="text-3xl font-bold text-white">{backendAccessibilityScore}</p>
              <p className="text-xs text-orange-400 mt-1">
                {100 - backendAccessibilityScore} issues to fix
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-orange-600/30 to-orange-800/30 rounded-xl">
              <Eye className="h-8 w-8 text-orange-300" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Trends */}
        <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm shadow-2xl">
          <h2 className="text-xl font-semibold mb-6 text-purple-300 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Analysis Performance
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metricsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3D3A6E" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(30, 27, 75, 0.95)',
                    borderColor: '#3D3A6E',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="imagesAnalyzed"
                  stackId="1"
                  stroke="#8B5CF6"
                  fill="url(#colorAnalyzed)"
                />
                <Area
                  type="monotone"
                  dataKey="issuesFixed"
                  stackId="1"
                  stroke="#10B981"
                  fill="url(#colorFixed)"
                />
                <defs>
                  <linearGradient id="colorAnalyzed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorFixed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category Distribution */}
        <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm shadow-2xl">
          <h2 className="text-xl font-semibold mb-6 text-purple-300 flex items-center">
            <Tag className="h-5 w-5 mr-2" />
            Top Image Categories
          </h2>
          <div className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {categoryData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(30, 27, 75, 0.95)',
                    borderColor: '#3D3A6E',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            {categoryData.map((item: any, index: number) => (
              <div key={index} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-300">{item.name}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SEO Score */}
        <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm shadow-2xl">
          <h2 className="text-xl font-semibold mb-6 text-purple-300 flex items-center">
            <Target className="h-5 w-5 mr-2" />
            SEO Optimization
          </h2>
          <div className="h-[200px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={seoScoreData}>
                <RadialBar
                  dataKey="value"
                  cornerRadius={10}
                  fill="#10B981"
                />
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-white text-2xl font-bold">
                  {backendSeoScore}%
                </text>
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-sm">Average SEO Score</p>
            <p className="text-green-400 text-xs mt-1">
              {backendSeoScore >= 80 ? 'Excellent' : backendSeoScore >= 60 ? 'Good' : 'Needs Improvement'}
            </p>
          </div>
        </Card>

        {/* Accessibility Score */}
        <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm shadow-2xl">
          <h2 className="text-xl font-semibold mb-6 text-purple-300 flex items-center">
            <Eye className="h-5 w-5 mr-2" />
            Accessibility Score
          </h2>
          <div className="h-[200px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={accessibilityData}>
                <RadialBar
                  dataKey="value"
                  cornerRadius={10}
                  fill="#3B82F6"
                />
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-white text-2xl font-bold">
                  {backendAccessibilityScore}%
                </text>
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-sm">Average Accessibility Score</p>
            <p className="text-blue-400 text-xs mt-1">
              {backendAccessibilityScore >= 80 ? 'Excellent' : backendAccessibilityScore >= 60 ? 'Good' : 'Needs Improvement'}
            </p>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      {dashboardData?.recentImages && dashboardData.recentImages.length > 0 && (
        <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm shadow-2xl">
          <h2 className="text-xl font-semibold mb-6 text-purple-300 flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Recent Analysis
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboardData.recentImages.slice(0, 6).map((image: any) => (
              <div
                key={image.id}
                className="bg-gradient-to-br from-[#1E1B4B]/60 to-[#1E1B4B]/40 rounded-xl border border-[#3D3A6E] p-4 backdrop-blur-sm hover:bg-[#1E1B4B]/80 transition-all duration-300"
              >
                <div className="aspect-video bg-gray-800 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                  {image.url ? (
                    <Image
                      src={image.url}
                      alt={image.filename}
                      width={200}
                      height={150}
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = '<div class="flex items-center justify-center h-full"><svg class="h-8 w-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"></path></svg></div>';
                        }
                      }}
                    />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <h3 className="font-semibold text-white text-sm mb-2 truncate">{image.filename}</h3>
                <div className="flex items-center justify-between text-xs">
                  <span className={`px-2 py-1 rounded-full ${
                    image.status === 'completed' ? 'bg-green-400/20 text-green-400' :
                    image.status === 'analyzing' ? 'bg-blue-400/20 text-blue-400' :
                    image.status === 'pending' ? 'bg-yellow-400/20 text-yellow-400' :
                    'bg-red-400/20 text-red-400'
                  }`}>
                    {image.status}
                  </span>
                  <span className="text-gray-400">
                    SEO: {image.seo?.score || 0}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );

  // Analyze view component
  const renderAnalyze = () => (
    <div className="space-y-6">
      {/* Product Selection */}
      <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm shadow-2xl">
        <h2 className="text-xl font-semibold mb-6 text-purple-300 flex items-center">
          <Package className="h-5 w-5 mr-2" />
          Select Product to Analyze
        </h2>
        
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1">
            <Input
              placeholder="Search products..."
              className="bg-[#1E1B4B]/70 border-[#3D3A6E] text-white backdrop-blur-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
            {selectedProduct && (
              <Button
                onClick={handleAnalyzeAllImages}
                disabled={analyzing}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-6 py-2 rounded-xl shadow-lg hover:shadow-green-500/25 transition-all duration-300"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Analyze All Images
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Selected Product Info */}
      {selectedProduct ? (
        <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm shadow-2xl">
          <h2 className="text-xl font-semibold mb-6 text-purple-300 flex items-center">
            <ShoppingBag className="h-5 w-5 mr-2" />
            Product Information
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="aspect-square bg-gradient-to-br from-purple-600/10 to-pink-600/10 rounded-lg flex items-center justify-center border border-purple-400/20 overflow-hidden">
                {selectedProduct.images?.[0]?.src ? (
                  <Image
                    src={selectedProduct.images[0].src}
                    alt={selectedProduct.images[0].altText || selectedProduct.title}
                    width={300}
                    height={300}
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `<div class="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-2xl">${selectedProduct.productType?.charAt(0) || 'P'}</div>`;
                      }
                    }}
                  />
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-2xl">
                    {selectedProduct.productType?.charAt(0) || 'P'}
                  </div>
                )}
              </div>
            </div>
            
            <div className="lg:col-span-2 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">{selectedProduct.title}</h3>
                <p className="text-gray-300 text-sm">{selectedProduct.description}</p>
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
                  <span className="text-gray-400">Store:</span>
                  <span className="text-white ml-2">{selectedProduct.storeName}</span>
                </div>
                <div>
                  <span className="text-gray-400">Images:</span>
                  <span className="text-white ml-2">{selectedProduct.images?.length || 0}</span>
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
      ) : (
        <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-12 backdrop-blur-sm shadow-2xl text-center">
          <Package className="h-16 w-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Product Selected</h3>
          <p className="text-gray-400 mb-6">Select a product to analyze its images for SEO and accessibility optimization</p>
          <Button
            onClick={() => setShowProductModal(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Search className="h-4 w-4 mr-2" />
            Browse Products
          </Button>
        </Card>
      )}

      {/* Product Images Analysis */}
      {selectedProduct && (
        <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm shadow-2xl">
          <h2 className="text-xl font-semibold mb-6 text-purple-300 flex items-center">
            <Camera className="h-5 w-5 mr-2" />
            Product Images ({getProductImages().length})
          </h2>
          
          {getProductImages().length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="h-16 w-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No images found</p>
              <p className="text-gray-500 text-sm">This product doesn't have any images to analyze</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getProductImages().map((image, index) => {
                const isAnalyzing = analyzingImages.has(image.id);
                
                return (
                  <div
                    key={image.id}
                    className="bg-gradient-to-br from-[#1E1B4B]/60 to-[#1E1B4B]/40 rounded-xl border border-[#3D3A6E] backdrop-blur-sm hover:bg-[#1E1B4B]/80 transition-all duration-300 overflow-hidden"
                  >
                    <div className="aspect-video bg-gray-800 relative overflow-hidden">
                      <Image
                        src={image.src}
                        alt={image.altText || `Product image ${index + 1}`}
                        width={300}
                        height={200}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = '<div class="flex items-center justify-center h-full"><svg class="h-12 w-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"></path></svg></div>';
                          }
                        }}
                      />
                      
                      {isAnalyzing && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <div className="text-center">
                            <Loader2 className="h-8 w-8 animate-spin text-purple-400 mx-auto mb-2" />
                            <p className="text-white text-sm">Analyzing...</p>
                          </div>
                        </div>
                      )}
                      
                      <div className="absolute top-2 right-2">
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-900/80 text-white border border-gray-600">
                          {image.width}x{image.height}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-white text-sm">Image {index + 1}</h3>
                        <span className="text-xs text-gray-400">Position {image.position}</span>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">Alt Text:</span>
                          <span className={`${image.altText ? 'text-green-400' : 'text-red-400'}`}>
                            {image.altText ? '✓' : '✗'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-300 truncate">
                          {image.altText || 'No alt text'}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAnalyzeImage(image.src, image.id)}
                          disabled={isAnalyzing}
                          className="text-purple-300 border-purple-300 hover:bg-purple-600/20 flex-1"
                        >
                          {isAnalyzing ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <>
                              <Sparkles className="h-3 w-3 mr-1" />
                              Analyze
                            </>
                          )}
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedImage(image);
                            setShowImageModal(true);
                          }}
                          className="text-blue-300 border-blue-300 hover:bg-blue-600/20"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}
    </div>
  );

  // Manage view component (Auto-scan settings)
  const renderManage = () => (
    <div className="space-y-6">
      {/* Auto-scan Configuration */}
      <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm shadow-2xl">
        <h2 className="text-xl font-semibold mb-6 text-purple-300 flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          Automatic Image Analysis Settings
        </h2>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Enable Auto-Scan</h3>
              <p className="text-gray-400 text-sm">
                Automatically analyze new and updated product images from your connected stores
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoScanEnabled}
                onChange={(e) => setAutoScanEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
          
          {autoScanEnabled && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Scan Frequency
                </label>
                <select
                  value={scanFrequency}
                  onChange={(e) => setScanFrequency(e.target.value)}
                  className="bg-[#1E1B4B]/70 border border-[#3D3A6E] rounded-lg px-4 py-2 text-white backdrop-blur-sm w-full"
                >
                  <option value="hourly">Every Hour</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              
              <div className="bg-gradient-to-br from-blue-600/10 to-blue-800/10 rounded-lg p-4 border border-blue-400/20">
                <h4 className="text-sm font-semibold text-blue-300 mb-2">What happens during auto-scan?</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Scans all connected stores for new or updated products</li>
                  <li>• Analyzes product images that haven't been processed</li>
                  <li>• Generates SEO-optimized alt text and descriptions</li>
                  <li>• Updates your store with improved image metadata</li>
                  <li>• Sends you a summary report via email</li>
                </ul>
              </div>
            </div>
          )}
          
          <div className="flex justify-end">
            <Button
              onClick={handleSaveAutoScanSettings}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              <Check className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </div>
      </Card>

      {/* Store Sync Status */}
      <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm shadow-2xl">
        <h2 className="text-xl font-semibold mb-6 text-purple-300 flex items-center">
          <Store className="h-5 w-5 mr-2" />
          Store Synchronization
        </h2>
        
        <div className="space-y-4">
          {stores.length === 0 ? (
            <div className="text-center py-8">
              <Store className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No stores connected</p>
              <p className="text-gray-500 text-sm mb-4">Connect your e-commerce stores to enable automatic image analysis</p>
              <Button
                onClick={() => window.location.href = '/dashboard/settings'}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Store className="h-4 w-4 mr-2" />
                Connect Store
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stores.map((store) => (
                <div
                  key={store.id}
                  className="bg-gradient-to-br from-[#1E1B4B]/60 to-[#1E1B4B]/40 rounded-xl border border-[#3D3A6E] p-4 backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-white">{store.storeName}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      store.status === 'connected' ? 'bg-green-400/20 text-green-400 border border-green-400/30' :
                      'bg-red-400/20 text-red-400 border border-red-400/30'
                    }`}>
                      {store.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Platform:</span>
                      <span className="text-white">{store.provider}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Products:</span>
                      <span className="text-white">{allProducts.filter(p => p.storeId === store.id).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Last Sync:</span>
                      <span className="text-white text-xs">
                        {store.lastSyncAt ? new Date(store.lastSyncAt).toLocaleDateString() : 'Never'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-purple-300 border-purple-300 hover:bg-purple-600/20 flex-1"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Sync Now
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(`https://${store.storeUrl}`, '_blank')}
                      className="text-blue-300 border-blue-300 hover:bg-blue-600/20"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Analysis History */}
      {dashboardData?.recentImages && dashboardData.recentImages.length > 0 && (
        <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm shadow-2xl">
          <h2 className="text-xl font-semibold mb-6 text-purple-300 flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Recent Analysis History
          </h2>
          
          <div className="space-y-3">
            {dashboardData.recentImages.slice(0, 10).map((image: any) => (
              <div
                key={image.id}
                className="flex items-center justify-between bg-gradient-to-br from-[#1E1B4B]/60 to-[#1E1B4B]/40 rounded-lg border border-[#3D3A6E] p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden">
                    {image.url ? (
                      <Image
                        src={image.url}
                        alt={image.filename}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = '<svg class="h-6 w-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"></path></svg>';
                          }
                        }}
                      />
                    ) : (
                      <ImageIcon className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">{image.filename}</h3>
                    <p className="text-gray-400 text-xs">
                      {image.analyzedAt ? new Date(image.analyzedAt.toDate()).toLocaleDateString() : 'Pending'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    image.status === 'completed' ? 'bg-green-400/20 text-green-400' :
                    image.status === 'analyzing' ? 'bg-blue-400/20 text-blue-400' :
                    image.status === 'pending' ? 'bg-yellow-400/20 text-yellow-400' :
                    'bg-red-400/20 text-red-400'
                  }`}>
                    {image.status}
                  </span>
                  <span className="text-gray-400 text-xs">
                    SEO: {image.seo?.score || 0}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
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
                VisionTagger
              </h1>
              <p className="text-gray-400 mt-2 text-lg">
                {selectedProduct 
                  ? `Analyzing: ${selectedProduct.title}`
                  : 'AI-Powered Product Image Analysis & SEO Optimization'
                }
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setActiveView('dashboard')}
                className={`px-6 py-2 rounded-xl transition-all duration-300 ${
                  activeView === 'dashboard'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                    : 'bg-transparent text-purple-300 hover:bg-purple-600/20 border-purple-400/30'
                }`}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <Button
                variant="outline"
                onClick={() => setActiveView('analyze')}
                className={`px-6 py-2 rounded-xl transition-all duration-300 ${
                  activeView === 'analyze'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                    : 'bg-transparent text-purple-300 hover:bg-purple-600/20 border-purple-400/30'
                }`}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Analyze
              </Button>
              <Button
                variant="outline"
                onClick={() => setActiveView('manage')}
                className={`px-6 py-2 rounded-xl transition-all duration-300 ${
                  activeView === 'manage'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                    : 'bg-transparent text-purple-300 hover:bg-purple-600/20 border-purple-400/30'
                }`}
              >
                <Settings className="h-4 w-4 mr-2" />
                Manage
              </Button>
            </div>
          </div>

          {/* Dynamic Content */}
          {activeView === 'dashboard' && renderDashboard()}
          {activeView === 'analyze' && renderAnalyze()}
          {activeView === 'manage' && renderManage()}

          {/* Product Selection Modal */}
          {showProductModal && (
            <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4">
              <div className="w-full max-w-6xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-[#2A2153] to-[#1E1B4B] rounded-2xl shadow-2xl border border-[#3D3A6E]">
                <div className="sticky top-0 bg-gradient-to-r from-[#2A2153] to-[#1E1B4B] border-b border-[#3D3A6E] p-6 flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white">Select Product to Analyze</h2>
                  <Button 
                    onClick={() => setShowProductModal(false)} 
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="p-6">
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
                      {stores?.map((store: any) => (
                        <option key={store.id} value={store.id}>
                          {store.storeName} ({store.provider})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Products List */}
                  <div className="max-h-[60vh] overflow-y-auto">
                    {storesLoading ? (
                      <div className="text-center py-12">
                        <Loader2 className="h-12 w-12 animate-spin text-purple-400 mx-auto mb-4" />
                        <p className="text-gray-300">Loading products...</p>
                      </div>
                    ) : allProducts?.length === 0 ? (
                      <div className="text-center py-12">
                        <Package className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                        <p className="text-gray-400 text-lg">No products available</p>
                        <p className="text-gray-500 text-sm mb-4">
                          {stores?.length === 0 
                            ? 'No stores connected. Please connect a store first.'
                            : 'No products found in your connected stores.'
                          }
                        </p>
                        {stores?.length === 0 && (
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
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredProducts.map((product: Product) => (
                          <div
                            key={product.id}
                            className="bg-gradient-to-br from-[#1E1B4B]/60 to-[#1E1B4B]/40 rounded-xl border border-[#3D3A6E] p-4 backdrop-blur-sm hover:bg-[#1E1B4B]/80 transition-all duration-300 cursor-pointer transform hover:scale-102"
                            onClick={() => handleProductSelect(product)}
                          >
                            <div className="aspect-square bg-gray-800 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                              {product.images?.[0]?.src ? (
                                <Image
                                  src={product.images[0].src}
                                  alt={product.images[0].altText || product.title}
                                  width={200}
                                  height={200}
                                  className="w-full h-full object-cover rounded-lg"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const parent = target.parentElement;
                                    if (parent) {
                                      parent.innerHTML = `<div class="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-xl font-bold">${product.productType?.charAt(0) || 'P'}</div>`;
                                    }
                                  }}
                                />
                              ) : (
                                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-xl font-bold">
                                  {product.productType?.charAt(0) || 'P'}
                                </div>
                              )}
                            </div>
                            
                            <h3 className="font-semibold text-white mb-2 truncate">{product.title}</h3>
                            <p className="text-gray-400 text-sm mb-2">{product.vendor}</p>
                            
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-purple-300">{product.storeName}</span>
                              <span className="text-gray-400">{product.images?.length || 0} images</span>
                            </div>
                            
                            <div className="flex flex-wrap gap-1 mt-2">
                              {product.tags.slice(0, 2).map((tag, index) => (
                                <span
                                  key={index}
                                  className="bg-purple-600/20 text-purple-300 px-2 py-1 rounded text-xs border border-purple-400/30"
                                >
                                  {tag}
                                </span>
                              ))}
                              {product.tags.length > 2 && (
                                <span className="text-gray-400 text-xs">+{product.tags.length - 2}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Image Detail Modal */}
          {showImageModal && selectedImage && (
            <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4">
              <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-[#2A2153] to-[#1E1B4B] rounded-2xl shadow-2xl border border-[#3D3A6E]">
                <div className="sticky top-0 bg-gradient-to-r from-[#2A2153] to-[#1E1B4B] border-b border-[#3D3A6E] p-6 flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white">Image Details</h2>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setEditingImage(selectedImage);
                        setShowEditModal(true);
                        setShowImageModal(false);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button 
                      onClick={() => setShowImageModal(false)} 
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden mb-4">
                        <Image
                          src={selectedImage.src}
                          alt={selectedImage.altText || 'Product image'}
                          width={400}
                          height={300}
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = '<div class="flex items-center justify-center h-full"><svg class="h-16 w-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"></path></svg></div>';
                            }
                          }}
                        />
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Dimensions:</span>
                          <span className="text-white">{selectedImage.width}x{selectedImage.height}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Position:</span>
                          <span className="text-white">{selectedImage.position}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">Current Alt Text</h3>
                        <p className="text-gray-300 bg-[#1E1B4B]/60 rounded-lg p-3 border border-[#3D3A6E]">
                          {selectedImage.altText || 'No alt text provided'}
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">AI Suggestions</h3>
                        <div className="space-y-3">
                          <div className="bg-green-600/10 rounded-lg p-3 border border-green-400/20">
                            <h4 className="text-sm font-semibold text-green-300 mb-1">Suggested Alt Text</h4>
                            <p className="text-gray-300 text-sm">High-quality product image showcasing modern design</p>
                          </div>
                          
                          <div className="bg-blue-600/10 rounded-lg p-3 border border-blue-400/20">
                            <h4 className="text-sm font-semibold text-blue-300 mb-1">SEO Caption</h4>
                            <p className="text-gray-300 text-sm">Premium product perfect for modern lifestyle and everyday use</p>
                          </div>
                          
                          <div className="bg-purple-600/10 rounded-lg p-3 border border-purple-400/20">
                            <h4 className="text-sm font-semibold text-purple-300 mb-1">Description</h4>
                            <p className="text-gray-300 text-sm">Detailed product photography highlighting key features and quality craftsmanship</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Edit Image Modal */}
          {showEditModal && editingImage && (
            <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4">
              <div className="w-full max-w-2xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-[#2A2153] to-[#1E1B4B] rounded-2xl shadow-2xl border border-[#3D3A6E]">
                <div className="sticky top-0 bg-gradient-to-r from-[#2A2153] to-[#1E1B4B] border-b border-[#3D3A6E] p-6 flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white">Edit Image Metadata</h2>
                  <Button 
                    onClick={() => setShowEditModal(false)} 
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Alt Text
                      </label>
                      <Textarea
                        placeholder="Enter descriptive alt text..."
                        className="bg-[#1E1B4B]/70 border-[#3D3A6E] text-white backdrop-blur-sm"
                        rows={3}
                        defaultValue={editingImage.altText || ''}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Caption
                      </label>
                      <Textarea
                        placeholder="Enter image caption..."
                        className="bg-[#1E1B4B]/70 border-[#3D3A6E] text-white backdrop-blur-sm"
                        rows={2}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Description
                      </label>
                      <Textarea
                        placeholder="Enter detailed description..."
                        className="bg-[#1E1B4B]/70 border-[#3D3A6E] text-white backdrop-blur-sm"
                        rows={4}
                      />
                    </div>
                    
                    <div className="flex justify-end gap-3 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setShowEditModal(false)}
                        className="text-gray-300 border-gray-300 hover:bg-gray-600/20"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => handleFixImage(editingImage)}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
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