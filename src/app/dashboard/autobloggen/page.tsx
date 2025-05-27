'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import dynamic from 'next/dynamic';
import { marked } from 'marked';
import {
  Loader2,
  PenLine,
  Image as ImageIcon,
  Link as LinkIcon,
  Edit3,
  Eye,
  Calendar,
  TrendingUp,
  BarChart3,
  Users,
  Target,
  Sparkles,
  FileText,
  Settings,
  Plus,
  X,
  Check,
  Clock,
  Globe,
  Zap,
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
} from 'recharts';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

interface BlogPost {
  id: string;
  title: string;
  content: string;
  status: 'draft' | 'published';
  createdAt: Date;
  readingTime?: number;
  seoScore?: number;
  platform?: string;
  views?: number;
  engagement?: number;
}

interface BlogMetrics {
  date: string;
  posts: number;
  views: number;
  engagement: number;
  ctr: number;
}

interface Store {
  id: string;
  shop: string;
  name?: string;
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

export default function AutoBlogGenPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showNewBlogModal, setShowNewBlogModal] = useState(false);
  const [activeView, setActiveView] = useState<'dashboard' | 'create' | 'manage'>('dashboard');
  
  // Blog creation states
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [topic, setTopic] = useState('');
  const [blogObjective, setBlogObjective] = useState('Product Promotion');
  const [tone, setTone] = useState('Friendly & Persuasive');
  const [cta, setCTA] = useState('Shop Now');
  const [length, setLength] = useState('Medium');
  const [targetAudience, setTargetAudience] = useState('General Consumers');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  
  // Generated blog states
  const [generatedBlog, setGeneratedBlog] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Blog management states
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);

  const metrics: BlogMetrics[] = [
    { date: 'Mar 10', posts: 2, views: 1200, engagement: 0.08, ctr: 0.045 },
    { date: 'Mar 11', posts: 3, views: 1800, engagement: 0.12, ctr: 0.052 },
    { date: 'Mar 12', posts: 1, views: 900, engagement: 0.06, ctr: 0.038 },
    { date: 'Mar 13', posts: 4, views: 2200, engagement: 0.15, ctr: 0.068 },
    { date: 'Mar 14', posts: 2, views: 1600, engagement: 0.10, ctr: 0.055 },
    { date: 'Mar 15', posts: 3, views: 2000, engagement: 0.14, ctr: 0.072 },
    { date: 'Mar 16', posts: 2, views: 1400, engagement: 0.09, ctr: 0.048 },
  ];

  const performanceData = [
    { name: 'Product Reviews', posts: 45, engagement: 8.2 },
    { name: 'How-to Guides', posts: 32, engagement: 12.5 },
    { name: 'Trend Articles', posts: 28, engagement: 6.8 },
    { name: 'Use Cases', posts: 22, engagement: 9.1 },
  ];

  const platformData = [
    { name: 'Shopify', value: 65, color: '#10B981' },
    { name: 'WordPress', value: 25, color: '#F59E0B' },
    { name: 'Medium', value: 10, color: '#8B5CF6' },
  ];

  useEffect(() => {
    const fetchStores = async () => {
      if (!user) return;
      try {
        const storesRef = collection(db, `users/${user.uid}/shopifyStores`);
        const storesSnap = await getDocs(storesRef);
        const storesData = storesSnap.docs.map(doc => ({ 
          id: doc.id, 
          shop: doc.id, 
          ...doc.data() 
        }));
        setStores(storesData);
        if (storesData.length > 0) {
          setSelectedStore(storesData[0].id);
        }
      } catch (error) {
        console.error('Error fetching stores:', error);
      }
    };

    const fetchBlogs = async () => {
      if (!user || !selectedStore) return;
      try {
        const response = await fetch(`/api/shopify/fetch-blogs?shop=${selectedStore}&userId=${user.uid}`);
        const data = await response.json();
        setBlogs(Array.isArray(data.articles) ? data.articles : []);
      } catch (error) {
        console.error('Error fetching blogs:', error);
        setBlogs([]);
      }
    };

    fetchStores();
    if (selectedStore) {
      fetchBlogs();
    }
  }, [user, selectedStore]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!selectedStore || !user?.uid) return;
      try {
        const res = await fetch(`/api/shopify/products?shop=${selectedStore}&userId=${user.uid}`);
        const data = await res.json();
        const productTitles = data.products?.map((p: any) => p.title) || [];
        setProducts(productTitles);
        if (productTitles.length > 0) {
          setSelectedProduct(productTitles[0]);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    if (selectedStore) {
      fetchProducts();
    }
  }, [selectedStore, user]);

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      setKeywords([...keywords, keywordInput.trim()]);
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setKeywords(keywords.filter(k => k !== keyword));
  };

  const handleGenerateBlog = async () => {
    setIsGenerating(true);
    setGeneratedBlog(null);

    try {
      let blogRequestBody;

      if (selectedStore && selectedProduct) {
        // Product-based blog generation
        const res = await fetch(`/api/shopify/products?shop=${selectedStore}&userId=${user?.uid}`);
        const data = await res.json();
        const product = data.products?.find((p: any) => p.title === selectedProduct) || {};

        blogRequestBody = {
          product_name: product.title || selectedProduct,
          product_description: product.body_html || "A great product loved by customers.",
          product_features: product?.tags?.split(",") || ["Great design", "Eco-friendly"],
          keywords: keywords.length > 0 ? keywords : (product?.tags?.split(",") || ["trending", "sale"]),
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
      } else {
        // Topic-based blog generation
        blogRequestBody = {
          topic,
          targetAudience,
          tone,
          keywords,
        };

        const blogRes = await fetch('/api/autobloggen/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(blogRequestBody),
        });

        const blogData = await blogRes.json();
        setGeneratedBlog(blogData.content);
      }
    } catch (error) {
      console.error('Error generating blog:', error);
      alert('An error occurred while generating the blog.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublishBlog = async () => {
    if (!generatedBlog || !selectedStore) return;

    const content = generatedBlog;
    const title = content.split('\n')[0].replace(/^#+\s*/, '') || topic || 'New Blog Post';

    try {
      const res = await fetch('/api/shopify/publish-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop: selectedStore,
          title,
          body_html: marked.parse(content),
          userId: user?.uid,
        }),
      });

      if (res.ok) {
        setGeneratedBlog(null);
        setTopic('');
        setKeywords([]);
        alert('Blog published successfully!');
        // Refresh blogs list
        const response = await fetch(`/api/shopify/fetch-blogs?shop=${selectedStore}&userId=${user?.uid}`);
        const data = await response.json();
        setBlogs(Array.isArray(data.articles) ? data.articles : []);
      } else {
        alert('Failed to publish blog.');
      }
    } catch (error) {
      console.error('Error publishing blog:', error);
      alert('An unexpected error occurred.');
    }
  };

  const blogsThisWeek = blogs.filter(blog => {
    const createdAt = new Date(blog.created_at);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return createdAt > oneWeekAgo;
  });

  const topBlog = blogs.length > 0 ? blogs[0] : null;

  const renderDashboard = () => (
    <>
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-purple-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-purple-600/30 to-purple-800/30 rounded-xl shadow-lg">
                <FileText className="h-6 w-6 text-purple-300" />
              </div>
              <h3 className="font-medium ml-3 text-purple-200">Blogs This Week</h3>
            </div>
          </div>
          <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
            {blogsThisWeek.length}
          </p>
          <p className="text-sm text-gray-400">+{Math.round(blogsThisWeek.length * 0.2)} from last week</p>
        </Card>

        <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-green-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-green-600/30 to-green-800/30 rounded-xl shadow-lg">
                <TrendingUp className="h-6 w-6 text-green-300" />
              </div>
              <h3 className="font-medium ml-3 text-green-200">Avg Engagement</h3>
            </div>
          </div>
          <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 mb-2">
            8.4%
          </p>
          <p className="text-sm text-gray-400">+2.1% from last month</p>
        </Card>

        <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-blue-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-blue-600/30 to-blue-800/30 rounded-xl shadow-lg">
                <Eye className="h-6 w-6 text-blue-300" />
              </div>
              <h3 className="font-medium ml-3 text-blue-200">Total Views</h3>
            </div>
          </div>
          <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-2">
            12.8K
          </p>
          <p className="text-sm text-gray-400">Last 30 days</p>
        </Card>

        <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-orange-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-orange-600/30 to-orange-800/30 rounded-xl shadow-lg">
                <Target className="h-6 w-6 text-orange-300" />
              </div>
              <h3 className="font-medium ml-3 text-orange-200">Click Rate</h3>
            </div>
          </div>
          <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400 mb-2">
            5.2%
          </p>
          <p className="text-sm text-gray-400">Average CTR</p>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm shadow-2xl">
          <h2 className="text-xl font-semibold mb-6 text-purple-300 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Blog Performance Trends
          </h2>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
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
                  dataKey="views"
                  stroke="#8B5CF6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorViews)"
                />
                <Area
                  type="monotone"
                  dataKey="engagement"
                  stroke="#10B981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorEngagement)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm shadow-2xl">
          <h2 className="text-xl font-semibold mb-6 text-purple-300 flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            Publishing Platforms
          </h2>
          <div className="h-[350px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={platformData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={120}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {platformData.map((entry, index) => (
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
            {platformData.map((item, index) => (
              <div key={index} className="flex items-center">
                <div 
                  className="w-4 h-4 rounded-full mr-2 shadow-lg" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-300">{item.name} ({item.value}%)</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Content Performance */}
      <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm shadow-2xl">
        <h2 className="text-xl font-semibold mb-6 text-purple-300 flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Content Type Performance
        </h2>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={performanceData}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.3} />
                </linearGradient>
              </defs>
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
              <Bar 
                dataKey="engagement" 
                fill="url(#barGradient)" 
                radius={[4, 4, 0, 0]}
                stroke="#8B5CF6"
                strokeWidth={1}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </>
  );

  const renderCreateBlog = () => (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm shadow-2xl">
        <h2 className="text-xl font-semibold mb-6 text-purple-300 flex items-center">
          <Sparkles className="h-5 w-5 mr-2" />
          Blog Configuration
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Store Selection */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-purple-200">Select Store</label>
            <select 
              className="w-full p-3 rounded-xl border border-gray-700 bg-[#1E1B4B]/70 text-white backdrop-blur-sm"
              value={selectedStore} 
              onChange={(e) => setSelectedStore(e.target.value)}
            >
              <option value="">Choose a store...</option>
              {stores.map(store => (
                <option key={store.id} value={store.id}>{store.shop}</option>
              ))}
            </select>
          </div>

          {/* Product Selection */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-purple-200">Select Product (Optional)</label>
            <select 
              className="w-full p-3 rounded-xl border border-gray-700 bg-[#1E1B4B]/70 text-white backdrop-blur-sm"
              value={selectedProduct} 
              onChange={(e) => setSelectedProduct(e.target.value)}
            >
              <option value="">Choose a product...</option>
              {products.map(product => (
                <option key={product} value={product}>{product}</option>
              ))}
            </select>
          </div>

          {/* Blog Topic */}
          <div className="md:col-span-2">
            <label className="block mb-2 text-sm font-semibold text-purple-200">Blog Topic</label>
            <Input
              placeholder="Enter your blog topic or let AI generate from product..."
              className="bg-[#1E1B4B]/70 border-[#3D3A6E] text-white backdrop-blur-sm h-12 rounded-xl"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          {/* Blog Objective */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-purple-200">Blog Objective</label>
            <select 
              className="w-full p-3 rounded-xl border border-gray-700 bg-[#1E1B4B]/70 text-white backdrop-blur-sm"
              value={blogObjective} 
              onChange={(e) => setBlogObjective(e.target.value)}
            >
              <option>Product Promotion</option>
              <option>Educational</option>
              <option>Trend Highlight</option>
              <option>How-to Guide</option>
              <option>Use Case Story</option>
              <option>Brand Awareness</option>
            </select>
          </div>

          {/* Tone */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-purple-200">Tone of Voice</label>
            <select 
              className="w-full p-3 rounded-xl border border-gray-700 bg-[#1E1B4B]/70 text-white backdrop-blur-sm"
              value={tone} 
              onChange={(e) => setTone(e.target.value)}
            >
              <option>Friendly & Persuasive</option>
              <option>Professional</option>
              <option>Humorous</option>
              <option>Inspirational</option>
              <option>Authoritative</option>
              <option>Conversational</option>
            </select>
          </div>

          {/* Target Audience */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-purple-200">Target Audience</label>
            <select 
              className="w-full p-3 rounded-xl border border-gray-700 bg-[#1E1B4B]/70 text-white backdrop-blur-sm"
              value={targetAudience} 
              onChange={(e) => setTargetAudience(e.target.value)}
            >
              <option>General Consumers</option>
              <option>Young Adults (18-30)</option>
              <option>Professionals</option>
              <option>Parents</option>
              <option>Tech Enthusiasts</option>
              <option>Health Conscious</option>
            </select>
          </div>

          {/* Length */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-purple-200">Content Length</label>
            <select 
              className="w-full p-3 rounded-xl border border-gray-700 bg-[#1E1B4B]/70 text-white backdrop-blur-sm"
              value={length} 
              onChange={(e) => setLength(e.target.value)}
            >
              <option>Short (300-500 words)</option>
              <option>Medium (500-800 words)</option>
              <option>Long-form (800+ words)</option>
            </select>
          </div>

          {/* Keywords */}
          <div className="md:col-span-2">
            <label className="block mb-2 text-sm font-semibold text-purple-200">Keywords</label>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="Add keywords..."
                className="bg-[#1E1B4B]/70 border-[#3D3A6E] text-white backdrop-blur-sm flex-1"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
              />
              <Button 
                onClick={handleAddKeyword}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword, index) => (
                <span 
                  key={index}
                  className="bg-purple-600/20 text-purple-300 px-3 py-1 rounded-full text-sm flex items-center gap-2 border border-purple-400/30"
                >
                  {keyword}
                  <button 
                    onClick={() => handleRemoveKeyword(keyword)}
                    className="hover:text-red-400"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="md:col-span-2">
            <label className="block mb-2 text-sm font-semibold text-purple-200">Call to Action</label>
            <select 
              className="w-full p-3 rounded-xl border border-gray-700 bg-[#1E1B4B]/70 text-white backdrop-blur-sm"
              value={cta} 
              onChange={(e) => setCTA(e.target.value)}
            >
              <option>Shop Now</option>
              <option>Learn More</option>
              <option>Subscribe</option>
              <option>Explore More</option>
              <option>Get Started</option>
              <option>Contact Us</option>
            </select>
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <Button
            onClick={handleGenerateBlog}
            disabled={isGenerating || (!topic && !selectedProduct)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-3 rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Zap className="h-5 w-5 mr-2" />
                Generate Blog Post
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );

  const renderManageBlogs = () => (
    <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm shadow-2xl">
      <h2 className="text-xl font-semibold mb-6 text-purple-300 flex items-center">
        <FileText className="h-5 w-5 mr-2" />
        Published Blogs
      </h2>
      
      {blogs.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No blogs found</p>
          <p className="text-gray-500 text-sm">Create your first blog to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {blogs.map((blog, index) => (
            <div
              key={index}
              className="p-4 bg-gradient-to-br from-[#1E1B4B]/60 to-[#1E1B4B]/40 rounded-xl border border-[#3D3A6E] backdrop-blur-sm hover:bg-[#1E1B4B]/80 transition-all duration-300 transform hover:scale-102 shadow-lg"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-lg text-white line-clamp-2">{blog.title}</h3>
                <span className="bg-green-400/20 text-green-400 px-2 py-1 rounded-full text-xs border border-green-400/30">
                  Published
                </span>
              </div>
              <p className="text-sm text-gray-300 mb-4 line-clamp-3">
                {blog.body_html?.replace(/<[^>]+>/g, '').slice(0, 120)}...
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(blog.created_at).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {Math.ceil(blog.body_html?.split(' ').length / 200) || 3} min read
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="text-purple-300 border-purple-300 hover:bg-purple-600/20">
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="text-blue-300 border-blue-300 hover:bg-blue-600/20">
                    <Edit3 className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-[#1E1B4B] via-[#2D2A5E] to-[#1E1B4B] p-6">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400">
                AutoBlogGen
              </h1>
              <p className="text-gray-400 mt-2 text-lg">AI-Powered Blog & Content Automation</p>
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
                Dashboard
              </Button>
              <Button
                variant="outline"
                onClick={() => setActiveView('create')}
                className={`px-6 py-2 rounded-xl transition-all duration-300 ${
                  activeView === 'create'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                    : 'bg-transparent text-purple-300 hover:bg-purple-600/20 border-purple-400/30'
                }`}
              >
                Create Blog
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
                Manage Blogs
              </Button>
            </div>
          </div>

          {/* Dynamic Content */}
          {activeView === 'dashboard' && renderDashboard()}
          {activeView === 'create' && renderCreateBlog()}
          {activeView === 'manage' && renderManageBlogs()}

          {/* Blog Preview Modal */}
          {generatedBlog && (
            <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4">
              <div className="w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-white text-black rounded-2xl shadow-2xl relative">
                <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-purple-800">📰 Blog Preview</h2>
                  <div className="flex gap-3">
                    <Button 
                      onClick={handlePublishBlog} 
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Publish to Shopify
                    </Button>
                    <Button 
                      onClick={() => setEditing(!editing)} 
                      className="bg-yellow-500 hover:bg-yellow-600 text-white"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      {editing ? 'Preview' : 'Edit'}
                    </Button>
                    <Button 
                      onClick={() => setGeneratedBlog(null)} 
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Close
                    </Button>
                  </div>
                </div>

                <div className="p-8">
                  {editing ? (
                    <MDEditor 
                      value={generatedBlog} 
                      onChange={(v: string | undefined) => setGeneratedBlog(v || '')} 
                      height={500}
                      data-color-mode="light"
                    />
                  ) : (
                    <div 
                      className="prose prose-lg max-w-full"
                      dangerouslySetInnerHTML={{ __html: marked.parse(generatedBlog || '') }} 
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
} 