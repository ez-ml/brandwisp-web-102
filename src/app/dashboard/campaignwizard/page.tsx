'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Loader2,
  Wand2,
  Target,
  Calendar,
  DollarSign,
  Users,
  BarChart,
  CheckCircle,
  Clock,
  TrendingUp,
  Eye,
  Edit3,
  Play,
  Pause,
  Settings,
  Download,
  Upload,
  Image as ImageIcon,
  Video,
  Sparkles,
  Zap,
  Activity,
  MousePointer,
  Globe,
  Smartphone,
  Monitor,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Search,
  Plus,
  X,
  Check,
  AlertCircle,
  RefreshCw,
  Trash2,
  Copy,
  ExternalLink,
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
  BarChart as RechartsBarChart,
  Bar,
  LineChart,
  Line,
  RadialBarChart,
  RadialBar,
  ComposedChart,
} from 'recharts';
import Image from 'next/image';
import { toast } from 'sonner';

// Types
interface Campaign {
  id: string;
  name: string;
  platform: string;
  type: string;
  objective: string;
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'ended' | 'error';
  budget: {
    total: number;
    daily?: number;
    spent: number;
    currency: string;
  };
  schedule: {
    startDate: string;
    endDate?: string;
    timezone: string;
  };
  targeting: {
    audience: string;
    demographics: any;
    interests: string[];
    behaviors: string[];
    customAudiences?: string[];
  };
  creatives: Creative[];
  metrics: {
    impressions: number;
    reach: number;
    clicks: number;
    ctr: number;
    cpc: number;
    engagement: number;
    conversions: number;
    revenue: number;
    roas: number;
    lastUpdated: string;
  };
  performance?: {
    impressions: number;
    clicks: number;
    ctr: number;
    cpc: number;
    conversions: number;
    revenue: number;
    roas: number;
    engagement: number;
  };
  budgetUtilization?: number;
  createdAt: string;
  updatedAt: string;
}

interface Creative {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  headline?: string;
  description?: string;
  callToAction?: string;
  performance?: {
    impressions: number;
    clicks: number;
    ctr: number;
    cpc: number;
    conversions: number;
  };
  campaignId?: string;
  campaignName?: string;
  platform?: string;
  status?: string;
  createdAt?: string;
}

interface Store {
  id: string;
  name: string;
  url: string;
  platform: string;
  status: string;
}

interface DashboardData {
  campaigns: Campaign[];
  stores: Store[];
  summary: {
    totalCampaigns: number;
    totalSpend: number;
    totalBudget: number;
    totalRevenue: number;
    avgRoas: number;
    totalConversions: number;
    campaignsByStatus: Record<string, number>;
    platformStats: Record<string, any>;
  };
  performance: {
    dailyMetrics: any[];
    topPerforming: Campaign[];
    recentActivity: Campaign[];
  };
}

interface CreativeGenerationRequest {
  template: string;
  platform: string;
  duration: number;
  assets: {
    images: string[];
    logo?: string;
    backgroundMusic?: string;
  };
  content: {
    headline: string;
    subheadline?: string;
    description: string;
    callToAction: string;
    brandName: string;
    brandColors: {
      primary: string;
      secondary: string;
      accent?: string;
    };
  };
  style: {
    theme: string;
    animation: string;
    typography: string;
  };
  specifications: {
    width: number;
    height: number;
    fps: number;
    format: string;
    quality: string;
  };
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

const PLATFORM_COLORS = {
  facebook: '#1877F2',
  instagram: '#E4405F',
  google: '#4285F4',
  tiktok: '#000000',
  linkedin: '#0A66C2',
  twitter: '#1DA1F2',
  youtube: '#FF0000',
};

export default function CampaignWizardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'dashboard' | 'create' | 'manage' | 'creatives'>('dashboard');
  
  // Data states
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [createData, setCreateData] = useState<any>(null);
  const [manageData, setManageData] = useState<any>(null);
  const [creativesData, setCreativesData] = useState<any>(null);
  
  // Campaign creation states
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    platform: '',
    type: 'image',
    objective: '',
    storeId: '',
    budget: {
      total: 0,
      daily: 0,
      currency: 'USD'
    },
    schedule: {
      startDate: '',
      endDate: '',
      timezone: 'UTC'
    },
    targeting: {
      audience: '',
      demographics: {},
      interests: [],
      behaviors: [],
      customAudiences: []
    },
    creatives: []
  });
  
  // Creative generation states
  const [showCreativeModal, setShowCreativeModal] = useState(false);
  const [generatingCreative, setGeneratingCreative] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showVideoPreviewModal, setShowVideoPreviewModal] = useState(false);
  const [selectedVideoForPreview, setSelectedVideoForPreview] = useState<Creative | null>(null);
  const [selectedCreativeForPublish, setSelectedCreativeForPublish] = useState<Creative | null>(null);
  const [publishForm, setPublishForm] = useState({
    action: 'save', // 'save', 'publish', 'schedule'
    platforms: [] as string[],
    scheduleDate: '',
    scheduleTime: '',
    caption: '',
    hashtags: '',
  });
  const [creativeForm, setCreativeForm] = useState<CreativeGenerationRequest>({
    template: 'product-showcase',
    platform: 'facebook',
    duration: 30,
    assets: {
      images: [],
    },
    content: {
      headline: '',
      description: '',
      callToAction: '',
      brandName: '',
      brandColors: {
        primary: '#7C3AED',
        secondary: '#EC4899',
      },
    },
    style: {
      theme: 'modern',
      animation: 'smooth',
      typography: 'sans-serif',
    },
    specifications: {
      width: 1280,
      height: 720,
      fps: 30,
      format: 'mp4',
      quality: 'high',
    },
  });
  
  // Campaign management states
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [showCampaignModal, setShowCampaignModal] = useState(false);

  // Fetch data based on active view
  const fetchData = async (view: string) => {
    try {
      setLoading(true);
      const token = await user?.getIdToken();
      
      const response = await fetch(`/api/dashboard/campaignwizard?view=${view}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const data = await response.json();
      
      switch (view) {
        case 'dashboard':
          setDashboardData(data);
          break;
        case 'create':
          setCreateData(data);
          break;
        case 'manage':
          setManageData(data);
          break;
        case 'creatives':
          setCreativesData(data);
          break;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Load data when view changes
  useEffect(() => {
    if (user) {
      fetchData(activeView);
    }
  }, [user, activeView]);

  // Handle campaign creation
  const handleCreateCampaign = async () => {
    try {
      setLoading(true);
      const token = await user?.getIdToken();
      
      const response = await fetch('/api/dashboard/campaignwizard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'create-campaign',
          campaignData: campaignForm,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create campaign');
      }
      
      const result = await response.json();
      toast.success('Campaign created successfully!');
      
      // Reset form and refresh data
      setCampaignForm({
        name: '',
        platform: '',
        type: 'image',
        objective: '',
        storeId: '',
        budget: { total: 0, daily: 0, currency: 'USD' },
        schedule: { startDate: '', endDate: '', timezone: 'UTC' },
        targeting: { audience: '', demographics: {}, interests: [], behaviors: [], customAudiences: [] },
        creatives: []
      });
      
      // Switch to manage view to see the new campaign
      setActiveView('manage');
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast.error('Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  // Handle creative generation
  const handleGenerateCreative = async () => {
    try {
      setGeneratingCreative(true);
      const token = await user?.getIdToken();
      
      const response = await fetch('/api/dashboard/campaignwizard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'generate-creative',
          creativeData: creativeForm,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate creative');
      }
      
      const result = await response.json();
      toast.success('Video generated successfully!');
      
      // Close modal and refresh creatives data
      setShowCreativeModal(false);
      if (activeView === 'creatives') {
        fetchData('creatives');
      }
      
      // Reset form
      setCreativeForm({
        template: 'product-showcase',
        platform: 'facebook',
        duration: 30,
        assets: { images: [] },
        content: {
          headline: '',
          description: '',
          callToAction: '',
          brandName: '',
          brandColors: { primary: '#7C3AED', secondary: '#EC4899' },
        },
        style: { theme: 'modern', animation: 'smooth', typography: 'sans-serif' },
        specifications: { width: 1280, height: 720, fps: 30, format: 'mp4', quality: 'high' },
      });
    } catch (error) {
      console.error('Error generating creative:', error);
      toast.error('Failed to generate creative');
    } finally {
      setGeneratingCreative(false);
    }
  };

  // Handle file upload
  const handleFileUpload = (files: FileList) => {
    const fileArray = Array.from(files);
    
    fileArray.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target && e.target.result) {
            setCreativeForm(prev => ({
              ...prev,
              assets: {
                ...prev.assets,
                images: [...prev.assets.images, e.target!.result as string]
              }
            }));
          }
        };
        reader.readAsDataURL(file);
      } else {
        toast.error('Please upload only image files (JPG, PNG, GIF, etc.)');
      }
    });
  };

  // Handle publishing actions
  const handlePublishAction = async (creative: Creative, action: 'save' | 'publish' | 'schedule') => {
    setSelectedCreativeForPublish(creative);
    setPublishForm(prev => ({
      ...prev,
      action,
      platforms: [],
      caption: creative.headline || '',
      hashtags: '',
      scheduleDate: '',
      scheduleTime: ''
    }));
    setShowPublishModal(true);
  };

  const handleVideoPreview = (creative: Creative) => {
    setSelectedVideoForPreview(creative);
    setShowVideoPreviewModal(true);
  };

  // Handle final publish/schedule
  const handleFinalPublish = async () => {
    try {
      const token = await user?.getIdToken();
      
      const response = await fetch('/api/dashboard/campaignwizard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: publishForm.action === 'publish' ? 'publish-creative' : 'schedule-creative',
          creativeId: selectedCreativeForPublish?.id,
          publishData: publishForm,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${publishForm.action} creative`);
      }
      
      const result = await response.json();
      toast.success(result.message);
      
      // Close modal and refresh data
      setShowPublishModal(false);
      setSelectedCreativeForPublish(null);
      setPublishForm({
        action: 'save',
        platforms: [],
        scheduleDate: '',
        scheduleTime: '',
        caption: '',
        hashtags: '',
      });
      
      if (activeView === 'creatives') {
        fetchData('creatives');
      }
    } catch (error) {
      console.error(`Error ${publishForm.action}ing creative:`, error);
      toast.error(`Failed to ${publishForm.action} creative`);
    }
  };

  // Handle campaign actions
  const handleCampaignAction = async (action: string, campaignId: string) => {
    try {
      const token = await user?.getIdToken();
      
      const response = await fetch('/api/dashboard/campaignwizard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action,
          campaignId,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${action.replace('-', ' ')}`);
      }
      
      const result = await response.json();
      toast.success(result.message);
      
      // Refresh data
      fetchData(activeView);
    } catch (error) {
      console.error(`Error ${action}:`, error);
      toast.error(`Failed to ${action.replace('-', ' ')}`);
    }
  };

  const renderDashboard = () => {
    if (!dashboardData) return <div>Loading...</div>;

    const { campaigns, stores, summary, performance } = dashboardData;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Campaign Wizard
            </h1>
            <p className="text-gray-600 mt-1">
              Create, manage, and optimize your advertising campaigns with AI-powered insights
            </p>
          </div>
          <Button 
            onClick={() => setActiveView('create')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Campaign
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-[#2A2153] to-[#1E1B4B] border border-[#3D3A6E] rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-300">Total Campaigns</p>
                <p className="text-3xl font-bold text-white">{summary.totalCampaigns}</p>
              </div>
              <div className="p-3 bg-purple-600/20 rounded-full">
                <Target className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#2A2153] to-[#1E1B4B] border border-[#3D3A6E] rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-300">Total Spend</p>
                <p className="text-3xl font-bold text-white">
                  ${summary.totalSpend.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-green-600/20 rounded-full">
                <DollarSign className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#2A2153] to-[#1E1B4B] border border-[#3D3A6E] rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-300">ROAS</p>
                <p className="text-3xl font-bold text-white">
                  {summary.avgRoas.toFixed(1)}x
                </p>
              </div>
              <div className="p-3 bg-blue-600/20 rounded-full">
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#2A2153] to-[#1E1B4B] border border-[#3D3A6E] rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-300">Conversions</p>
                <p className="text-3xl font-bold text-white">
                  {summary.totalConversions.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-orange-600/20 rounded-full">
                <CheckCircle className="w-6 h-6 text-orange-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Chart */}
          <div className="bg-gradient-to-br from-[#2A2153] to-[#1E1B4B] border border-[#3D3A6E] rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-6 text-white">Performance Overview</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={performance.dailyMetrics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3D3A6E" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1E1B4B', 
                    border: '1px solid #3D3A6E', 
                    borderRadius: '8px',
                    color: '#fff'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="spend" 
                  stackId="1" 
                  stroke="#7C3AED" 
                  fill="#7C3AED" 
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="conversions" 
                  stackId="2" 
                  stroke="#EC4899" 
                  fill="#EC4899" 
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Platform Distribution */}
          <div className="bg-gradient-to-br from-[#2A2153] to-[#1E1B4B] border border-[#3D3A6E] rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-6 text-white">Platform Distribution</h3>
            <div className="space-y-4">
              {Object.entries(summary.platformStats).map(([platform, stats]: [string, any]) => (
                <div key={platform} className="flex items-center justify-between p-3 bg-[#1E1B4B]/50 rounded-lg border border-[#3D3A6E]/50">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: PLATFORM_COLORS[platform as keyof typeof PLATFORM_COLORS] || '#7C3AED' }}
                    />
                    <span className="font-medium capitalize text-white">{platform}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-white">{stats.campaigns} campaigns</p>
                    <p className="text-sm text-gray-400">${stats.spend.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Campaigns */}
        <div className="bg-gradient-to-br from-[#2A2153] to-[#1E1B4B] border border-[#3D3A6E] rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Recent Campaigns</h3>
            <button 
              onClick={() => setActiveView('manage')}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {campaigns.slice(0, 5).map((campaign) => (
              <div key={campaign.id} className="flex items-center justify-between p-4 bg-[#1E1B4B]/50 border border-[#3D3A6E]/50 rounded-lg hover:bg-[#1E1B4B]/70 transition-colors">
                <div className="flex items-center space-x-4">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: PLATFORM_COLORS[campaign.platform as keyof typeof PLATFORM_COLORS] || '#7C3AED' }}
                  />
                  <div>
                    <p className="font-medium text-white">{campaign.name}</p>
                    <p className="text-sm text-gray-400 capitalize">
                      {campaign.platform} • {campaign.objective}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span 
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      campaign.status === 'active' 
                        ? 'bg-green-600/20 text-green-400 border border-green-600/30' 
                        : 'bg-gray-600/20 text-gray-400 border border-gray-600/30'
                    }`}
                  >
                    {campaign.status}
                  </span>
                  <div className="text-right">
                    <p className="font-semibold text-white">${campaign.budget.spent.toLocaleString()}</p>
                    <p className="text-sm text-gray-400">
                      {campaign.performance?.roas ? `${campaign.performance.roas.toFixed(1)}x ROAS` : 'No data'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderCreate = () => {
    if (!createData) return <div>Loading...</div>;

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-[#2A2153] to-[#1E1B4B] border border-[#3D3A6E] rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-semibold mb-8 flex items-center text-white">
            <Wand2 className="h-6 w-6 mr-3 text-purple-400" />
            Create New Campaign
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Campaign Name</label>
                <input
                  type="text"
                  placeholder="Enter campaign name..."
                  value={campaignForm.name}
                  onChange={(e) => setCampaignForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-[#1E1B4B]/70 border border-[#3D3A6E] rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Platform</label>
                <Select 
                  value={campaignForm.platform}
                  onValueChange={(value) => setCampaignForm(prev => ({ ...prev, platform: value }))}
                >
                  <SelectTrigger className="w-full bg-[#1E1B4B]/70 border border-[#3D3A6E] text-white">
                    <SelectValue placeholder="Select platform..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1E1B4B] border border-[#3D3A6E]">
                    <SelectItem value="facebook" className="text-white hover:bg-[#2A2153]">Facebook</SelectItem>
                    <SelectItem value="instagram" className="text-white hover:bg-[#2A2153]">Instagram</SelectItem>
                    <SelectItem value="google" className="text-white hover:bg-[#2A2153]">Google Ads</SelectItem>
                    <SelectItem value="tiktok" className="text-white hover:bg-[#2A2153]">TikTok</SelectItem>
                    <SelectItem value="linkedin" className="text-white hover:bg-[#2A2153]">LinkedIn</SelectItem>
                    <SelectItem value="twitter" className="text-white hover:bg-[#2A2153]">Twitter</SelectItem>
                    <SelectItem value="youtube" className="text-white hover:bg-[#2A2153]">YouTube</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Budget ($)</label>
                <input
                  type="number"
                  placeholder="Enter budget amount..."
                  value={campaignForm.budget.total}
                  onChange={(e) => setCampaignForm(prev => ({ 
                    ...prev, 
                    budget: { ...prev.budget, total: Number(e.target.value) }
                  }))}
                  className="w-full bg-[#1E1B4B]/70 border border-[#3D3A6E] rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Campaign Objective</Label>
                <Select 
                  value={campaignForm.objective}
                  onValueChange={(value) => setCampaignForm(prev => ({ ...prev, objective: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select objective..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brand-awareness">Brand Awareness</SelectItem>
                    <SelectItem value="reach">Reach</SelectItem>
                    <SelectItem value="traffic">Website Traffic</SelectItem>
                    <SelectItem value="engagement">Engagement</SelectItem>
                    <SelectItem value="lead-generation">Lead Generation</SelectItem>
                    <SelectItem value="conversions">Conversions</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Target Audience</Label>
                <Textarea
                  placeholder="Describe your target audience..."
                  rows={3}
                  value={campaignForm.targeting.audience}
                  onChange={(e) => setCampaignForm(prev => ({ 
                    ...prev, 
                    targeting: { ...prev.targeting, audience: e.target.value }
                  }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={campaignForm.schedule.startDate}
                    onChange={(e) => setCampaignForm(prev => ({ 
                      ...prev, 
                      schedule: { ...prev.schedule, startDate: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={campaignForm.schedule.endDate}
                    onChange={(e) => setCampaignForm(prev => ({ 
                      ...prev, 
                      schedule: { ...prev.schedule, endDate: e.target.value }
                    }))}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-8">
            <Button
              onClick={handleCreateCampaign}
              disabled={loading || !campaignForm.name || !campaignForm.platform || !campaignForm.budget.total}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating Campaign...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Create Campaign
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderManage = () => {
    if (!manageData) return <div>Loading...</div>;

    const { campaigns } = manageData;

    return (
      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Campaign Management
          </h2>
          
          <div className="space-y-4">
            {campaigns.map((campaign: Campaign) => (
              <div
                key={campaign.id}
                className="border rounded-lg p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{campaign.name}</h3>
                    <p className="text-gray-600 text-sm">{campaign.platform} • {campaign.objective}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant={campaign.status === 'active' ? 'default' : 'secondary'}
                      className={campaign.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                    >
                      {campaign.status}
                    </Badge>
                    <div className="flex gap-2">
                      {campaign.status === 'active' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleCampaignAction('pause-campaign', campaign.id)}
                        >
                          <Pause className="h-3 w-3 mr-1" />
                          Pause
                        </Button>
                      )}
                      {campaign.status === 'paused' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleCampaignAction('resume-campaign', campaign.id)}
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Resume
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedCampaign(campaign);
                          setShowCampaignModal(true);
                        }}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
                  <div>
                    <p className="text-gray-600 text-xs">Budget</p>
                    <p className="font-semibold">${campaign.budget.total.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs">Spent</p>
                    <p className="font-semibold">${campaign.budget.spent.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs">Reach</p>
                    <p className="font-semibold">{campaign.metrics.reach.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs">Clicks</p>
                    <p className="font-semibold">{campaign.metrics.clicks.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs">Conversions</p>
                    <p className="font-semibold">{campaign.metrics.conversions.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs">ROAS</p>
                    <p className="font-semibold">{campaign.metrics.roas.toFixed(1)}x</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-1" />
                    {campaign.schedule.startDate} - {campaign.schedule.endDate}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-600">CTR: {campaign.metrics.ctr}%</span>
                    <span className="text-gray-600">CPC: ${campaign.metrics.cpc}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  };

  const renderCreatives = () => {
    if (!creativesData) return <div className="text-white">Loading...</div>;

    const { creatives, generationTemplates } = creativesData;

    return (
      <div className="space-y-8">
        {/* Header with Stats */}
        <div className="bg-gradient-to-br from-[#2A2153] to-[#1E1B4B] border border-[#3D3A6E] rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-white flex items-center">
                <Video className="h-6 w-6 mr-3 text-purple-400" />
                AI Creative Studio
              </h2>
              <p className="text-gray-400 mt-1">Generate professional videos with React Remotion & Three.js</p>
            </div>
            <Dialog open={showCreativeModal} onOpenChange={setShowCreativeModal}>
              <DialogTrigger asChild>
                <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg shadow-purple-500/25">
                  <Sparkles className="h-5 w-5 mr-2 inline" />
                  Generate Video
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl bg-[#1E1B4B] border-[#3D3A6E] text-white">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    AI Video Generator
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6 max-h-[70vh] overflow-y-auto">
                  {/* Template Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">Video Template</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {generationTemplates?.map((template: any) => (
                        <div
                          key={template.id}
                          onClick={() => setCreativeForm(prev => ({ ...prev, template: template.id }))}
                          className={`p-4 rounded-lg border cursor-pointer transition-all ${
                            creativeForm.template === template.id
                              ? 'border-purple-500 bg-purple-600/20'
                              : 'border-[#3D3A6E] bg-[#2A2153]/50 hover:border-purple-400'
                          }`}
                        >
                          <h4 className="font-medium text-white">{template.name}</h4>
                          <p className="text-xs text-gray-400 mt-1">{template.duration}</p>
                          <p className="text-xs text-gray-500 mt-1">{template.style}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Platform & Duration */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Target Platform</label>
                      <Select 
                        value={creativeForm.platform}
                        onValueChange={(value) => {
                          setCreativeForm(prev => ({ 
                            ...prev, 
                            platform: value,
                            specifications: {
                              ...prev.specifications,
                              ...(value === 'tiktok' ? { width: 1080, height: 1920 } :
                                 value === 'youtube' ? { width: 1920, height: 1080 } :
                                 value === 'instagram' ? { width: 1080, height: 1080 } :
                                 { width: 1280, height: 720 })
                            }
                          }))
                        }}
                      >
                        <SelectTrigger className="bg-[#2A2153] border-[#3D3A6E] text-white">
                          <SelectValue placeholder="Select platform..." />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1E1B4B] border-[#3D3A6E]">
                          <SelectItem value="facebook" className="text-white hover:bg-[#2A2153]">
                            <div className="flex items-center">
                              <Facebook className="h-4 w-4 mr-2 text-blue-500" />
                              Facebook (16:9)
                            </div>
                          </SelectItem>
                          <SelectItem value="instagram" className="text-white hover:bg-[#2A2153]">
                            <div className="flex items-center">
                              <Instagram className="h-4 w-4 mr-2 text-pink-500" />
                              Instagram (1:1)
                            </div>
                          </SelectItem>
                          <SelectItem value="youtube" className="text-white hover:bg-[#2A2153]">
                            <div className="flex items-center">
                              <Youtube className="h-4 w-4 mr-2 text-red-500" />
                              YouTube (16:9)
                            </div>
                          </SelectItem>
                          <SelectItem value="tiktok" className="text-white hover:bg-[#2A2153]">
                            <div className="flex items-center">
                              <Smartphone className="h-4 w-4 mr-2 text-black" />
                              TikTok (9:16)
                            </div>
                          </SelectItem>
                          <SelectItem value="linkedin" className="text-white hover:bg-[#2A2153]">
                            <div className="flex items-center">
                              <Globe className="h-4 w-4 mr-2 text-blue-600" />
                              LinkedIn (16:9)
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Duration (seconds)</label>
                      <input
                        type="range"
                        min="30"
                        max="60"
                        value={creativeForm.duration}
                        onChange={(e) => setCreativeForm(prev => ({ ...prev, duration: Number(e.target.value) }))}
                        className="w-full h-2 bg-[#2A2153] rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>30s</span>
                        <span className="text-purple-400 font-medium">{creativeForm.duration}s</span>
                        <span>60s</span>
                      </div>
                    </div>
                  </div>

                  {/* Asset Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">Upload Images/Assets</label>
                    <div className="border-2 border-dashed border-[#3D3A6E] rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-400 mb-2">Drag & drop images or click to browse</p>
                      <p className="text-xs text-gray-500 mb-3">Upload product images, logos, or any visuals for your video</p>
                      <input
                         type="file"
                         multiple
                         accept="image/*"
                         className="hidden"
                         id="asset-upload"
                         onChange={(e) => {
                           if (e.target.files) {
                             handleFileUpload(e.target.files);
                           }
                         }}
                       />
                      <label
                        htmlFor="asset-upload"
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg cursor-pointer inline-block transition-colors"
                      >
                        Choose Files
                      </label>
                    </div>
                    {creativeForm.assets.images.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {creativeForm.assets.images.map((image, index) => (
                          <div key={index} className="relative">
                            <img src={image} alt={`Asset ${index + 1}`} className="w-16 h-16 object-cover rounded border border-[#3D3A6E]" />
                            <button
                              onClick={() => setCreativeForm(prev => ({
                                ...prev,
                                assets: {
                                  ...prev.assets,
                                  images: prev.assets.images.filter((_, i) => i !== index)
                                }
                              }))}
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Content Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Headline</label>
                      <input
                        type="text"
                        placeholder="Enter compelling headline..."
                        value={creativeForm.content.headline}
                        onChange={(e) => setCreativeForm(prev => ({ 
                          ...prev, 
                          content: { ...prev.content, headline: e.target.value }
                        }))}
                        className="w-full bg-[#2A2153] border border-[#3D3A6E] rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Brand Name</label>
                      <input
                        type="text"
                        placeholder="Your brand name..."
                        value={creativeForm.content.brandName}
                        onChange={(e) => setCreativeForm(prev => ({ 
                          ...prev, 
                          content: { ...prev.content, brandName: e.target.value }
                        }))}
                        className="w-full bg-[#2A2153] border border-[#3D3A6E] rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Call to Action</label>
                      <input
                        type="text"
                        placeholder="e.g., Shop Now, Learn More..."
                        value={creativeForm.content.callToAction}
                        onChange={(e) => setCreativeForm(prev => ({ 
                          ...prev, 
                          content: { ...prev.content, callToAction: e.target.value }
                        }))}
                        className="w-full bg-[#2A2153] border border-[#3D3A6E] rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div></div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                    <textarea
                      rows={3}
                      placeholder="Describe your product/service..."
                      value={creativeForm.content.description}
                      onChange={(e) => setCreativeForm(prev => ({ 
                        ...prev, 
                        content: { ...prev.content, description: e.target.value }
                      }))}
                      className="w-full bg-[#2A2153] border border-[#3D3A6E] rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {/* Brand Colors */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">Brand Colors</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Primary Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={creativeForm.content.brandColors.primary}
                            onChange={(e) => setCreativeForm(prev => ({
                              ...prev,
                              content: {
                                ...prev.content,
                                brandColors: { ...prev.content.brandColors, primary: e.target.value }
                              }
                            }))}
                            className="w-12 h-10 rounded border border-[#3D3A6E] bg-[#2A2153]"
                          />
                          <input
                            type="text"
                            value={creativeForm.content.brandColors.primary}
                            onChange={(e) => setCreativeForm(prev => ({
                              ...prev,
                              content: {
                                ...prev.content,
                                brandColors: { ...prev.content.brandColors, primary: e.target.value }
                              }
                            }))}
                            className="flex-1 bg-[#2A2153] border border-[#3D3A6E] rounded px-3 py-2 text-white text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Secondary Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={creativeForm.content.brandColors.secondary}
                            onChange={(e) => setCreativeForm(prev => ({
                              ...prev,
                              content: {
                                ...prev.content,
                                brandColors: { ...prev.content.brandColors, secondary: e.target.value }
                              }
                            }))}
                            className="w-12 h-10 rounded border border-[#3D3A6E] bg-[#2A2153]"
                          />
                          <input
                            type="text"
                            value={creativeForm.content.brandColors.secondary}
                            onChange={(e) => setCreativeForm(prev => ({
                              ...prev,
                              content: {
                                ...prev.content,
                                brandColors: { ...prev.content.brandColors, secondary: e.target.value }
                              }
                            }))}
                            className="flex-1 bg-[#2A2153] border border-[#3D3A6E] rounded px-3 py-2 text-white text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Style Options */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Theme</label>
                      <Select 
                        value={creativeForm.style.theme}
                        onValueChange={(value) => setCreativeForm(prev => ({ 
                          ...prev, 
                          style: { ...prev.style, theme: value }
                        }))}
                      >
                        <SelectTrigger className="bg-[#2A2153] border-[#3D3A6E] text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1E1B4B] border-[#3D3A6E]">
                          <SelectItem value="modern" className="text-white hover:bg-[#2A2153]">Modern</SelectItem>
                          <SelectItem value="minimal" className="text-white hover:bg-[#2A2153]">Minimal</SelectItem>
                          <SelectItem value="bold" className="text-white hover:bg-[#2A2153]">Bold</SelectItem>
                          <SelectItem value="elegant" className="text-white hover:bg-[#2A2153]">Elegant</SelectItem>
                          <SelectItem value="playful" className="text-white hover:bg-[#2A2153]">Playful</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Animation</label>
                      <Select 
                        value={creativeForm.style.animation}
                        onValueChange={(value) => setCreativeForm(prev => ({ 
                          ...prev, 
                          style: { ...prev.style, animation: value }
                        }))}
                      >
                        <SelectTrigger className="bg-[#2A2153] border-[#3D3A6E] text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1E1B4B] border-[#3D3A6E]">
                          <SelectItem value="smooth" className="text-white hover:bg-[#2A2153]">Smooth</SelectItem>
                          <SelectItem value="dynamic" className="text-white hover:bg-[#2A2153]">Dynamic</SelectItem>
                          <SelectItem value="subtle" className="text-white hover:bg-[#2A2153]">Subtle</SelectItem>
                          <SelectItem value="energetic" className="text-white hover:bg-[#2A2153]">Energetic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Typography</label>
                      <Select 
                        value={creativeForm.style.typography}
                        onValueChange={(value) => setCreativeForm(prev => ({ 
                          ...prev, 
                          style: { ...prev.style, typography: value }
                        }))}
                      >
                        <SelectTrigger className="bg-[#2A2153] border-[#3D3A6E] text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1E1B4B] border-[#3D3A6E]">
                          <SelectItem value="sans-serif" className="text-white hover:bg-[#2A2153]">Sans Serif</SelectItem>
                          <SelectItem value="serif" className="text-white hover:bg-[#2A2153]">Serif</SelectItem>
                          <SelectItem value="display" className="text-white hover:bg-[#2A2153]">Display</SelectItem>
                          <SelectItem value="script" className="text-white hover:bg-[#2A2153]">Script</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3 pt-4 border-t border-[#3D3A6E]">
                    <button 
                      onClick={() => setShowCreativeModal(false)}
                      className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <div className="flex flex-col items-end">
                      {(!creativeForm.content.headline || !creativeForm.content.description || !creativeForm.content.brandName || creativeForm.assets.images.length === 0) && !generatingCreative && (
                        <p className="text-xs text-gray-400 mb-2">
                          {!creativeForm.content.headline ? 'Headline required' :
                           !creativeForm.content.description ? 'Description required' :
                           !creativeForm.content.brandName ? 'Brand name required' :
                           creativeForm.assets.images.length === 0 ? 'At least one image required' : ''}
                        </p>
                      )}
                      <button 
                        onClick={handleGenerateCreative}
                        disabled={generatingCreative || !creativeForm.content.headline || !creativeForm.content.description || !creativeForm.content.brandName || creativeForm.assets.images.length === 0}
                        className="px-8 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {generatingCreative ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2 inline" />
                            Generating Video...
                          </>
                        ) : (
                          <>
                            <Zap className="h-4 w-4 mr-2 inline" />
                            Generate Video
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{creatives?.length || 0}</p>
              <p className="text-sm text-gray-400">Total Videos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">
                {creatives?.filter((c: Creative) => c.status === 'active').length || 0}
              </p>
              <p className="text-sm text-gray-400">Active</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-400">
                {creatives?.reduce((sum: number, c: Creative) => sum + (c.performance?.clicks || 0), 0) || 0}
              </p>
              <p className="text-sm text-gray-400">Total Clicks</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-400">
                {creatives?.reduce((sum: number, c: Creative) => sum + (c.performance?.conversions || 0), 0) || 0}
              </p>
              <p className="text-sm text-gray-400">Conversions</p>
            </div>
          </div>
        </div>

        {/* Generated Videos Grid */}
        <div className="bg-gradient-to-br from-[#2A2153] to-[#1E1B4B] border border-[#3D3A6E] rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-semibold text-white mb-6">Generated Videos</h3>
          
          {creatives && creatives.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {creatives.map((creative: Creative) => (
                <div
                  key={creative.id}
                  className="bg-[#1E1B4B]/50 border border-[#3D3A6E]/50 rounded-xl overflow-hidden hover:border-purple-400/50 transition-all duration-300 group"
                >
                  {/* Video Preview */}
                  <div className="aspect-video bg-[#1E1B4B] relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      {creative.type === 'video' ? (
                        <div className="text-center">
                          <Video className="h-12 w-12 text-purple-400 mx-auto mb-2" />
                          <p className="text-xs text-gray-400">Video Ready</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-xs text-gray-400">Image Asset</p>
                        </div>
                      )}
                    </div>
                    {creative.thumbnail && (
                      <img 
                        src={creative.thumbnail} 
                        alt="Creative thumbnail"
                        className="w-full h-full object-cover"
                      />
                    )}
                    
                    {/* Platform Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-1 bg-black/70 text-white text-xs rounded-full capitalize">
                        {creative.platform}
                      </span>
                    </div>

                    {/* Play Button Overlay */}
                    {creative.type === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                        <button className="bg-white/20 backdrop-blur-sm rounded-full p-4 hover:bg-white/30 transition-colors">
                          <Play className="h-6 w-6 text-white" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h4 className="font-semibold text-white mb-2 line-clamp-1">
                      {creative.headline || 'Untitled Creative'}
                    </h4>
                    
                    {/* Performance Metrics */}
                    <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
                      <div className="text-center">
                        <p className="text-gray-400 text-xs">CTR</p>
                        <p className="font-semibold text-white">{creative.performance?.ctr || 0}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-400 text-xs">Clicks</p>
                        <p className="font-semibold text-white">{creative.performance?.clicks || 0}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-400 text-xs">Conv.</p>
                        <p className="font-semibold text-white">{creative.performance?.conversions || 0}</p>
                      </div>
                    </div>

                                         {/* Action Buttons */}
                     <div className="flex gap-2">
                       <button 
                         onClick={() => handleVideoPreview(creative)}
                         className="flex-1 bg-[#2A2153] hover:bg-[#3D3A6E] text-white py-2 px-3 rounded-lg text-sm transition-colors flex items-center justify-center"
                       >
                         <Eye className="h-3 w-3 mr-1" />
                         Preview
                       </button>
                       <button 
                         onClick={() => handlePublishAction(creative, 'save')}
                         className="flex-1 bg-[#2A2153] hover:bg-[#3D3A6E] text-white py-2 px-3 rounded-lg text-sm transition-colors flex items-center justify-center"
                       >
                         <Download className="h-3 w-3 mr-1" />
                         Save
                       </button>
                     </div>

                     {/* Publishing Options */}
                     <div className="mt-3 pt-3 border-t border-[#3D3A6E]/50">
                       <div className="flex gap-2">
                         <button 
                           onClick={() => handlePublishAction(creative, 'publish')}
                           className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-sm transition-colors flex items-center justify-center"
                         >
                           <Zap className="h-3 w-3 mr-1" />
                           Publish Now
                         </button>
                         <button 
                           onClick={() => handlePublishAction(creative, 'schedule')}
                           className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm transition-colors flex items-center justify-center"
                         >
                           <Calendar className="h-3 w-3 mr-1" />
                           Schedule
                         </button>
                       </div>
                     </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-white mb-2">No videos generated yet</h4>
              <p className="text-gray-400 mb-6">Create your first AI-powered video to get started</p>
              <button 
                onClick={() => setShowCreativeModal(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300"
              >
                Generate Your First Video
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-[#1E1B4B] via-[#2D2A5E] to-[#1E1B4B] p-6">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400">
                Campaign Wizard
              </h1>
              <p className="text-gray-400 mt-2 text-lg">AI-Powered Campaign Creation & Management</p>
            </div>
          </div>

          {/* Navigation */}
          <Tabs value={activeView} onValueChange={(value) => setActiveView(value as any)}>
            <div className="flex gap-3 mb-8">
              <button
                onClick={() => setActiveView('dashboard')}
                className={`px-6 py-3 rounded-xl transition-all duration-300 font-medium ${
                  activeView === 'dashboard'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                    : 'bg-[#2A2153] text-purple-300 hover:bg-purple-600/20 border border-[#3D3A6E]'
                }`}
              >
                <BarChart className="w-4 h-4 mr-2 inline" />
                Dashboard
              </button>
              <button
                onClick={() => setActiveView('create')}
                className={`px-6 py-3 rounded-xl transition-all duration-300 font-medium ${
                  activeView === 'create'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                    : 'bg-[#2A2153] text-purple-300 hover:bg-purple-600/20 border border-[#3D3A6E]'
                }`}
              >
                <Plus className="w-4 h-4 mr-2 inline" />
                Create
              </button>
              <button
                onClick={() => setActiveView('manage')}
                className={`px-6 py-3 rounded-xl transition-all duration-300 font-medium ${
                  activeView === 'manage'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                    : 'bg-[#2A2153] text-purple-300 hover:bg-purple-600/20 border border-[#3D3A6E]'
                }`}
              >
                <Settings className="w-4 h-4 mr-2 inline" />
                Manage
              </button>
              <button
                onClick={() => setActiveView('creatives')}
                className={`px-6 py-3 rounded-xl transition-all duration-300 font-medium ${
                  activeView === 'creatives'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                    : 'bg-[#2A2153] text-purple-300 hover:bg-purple-600/20 border border-[#3D3A6E]'
                }`}
              >
                <ImageIcon className="w-4 h-4 mr-2 inline" />
                Creatives
              </button>
            </div>

          <TabsContent value="dashboard">
            {renderDashboard()}
          </TabsContent>

          <TabsContent value="create">
            {renderCreate()}
          </TabsContent>

          <TabsContent value="manage">
            {renderManage()}
          </TabsContent>

          <TabsContent value="creatives">
            {renderCreatives()}
          </TabsContent>
        </Tabs>

        {/* Campaign Details Modal */}
        <Dialog open={showCampaignModal} onOpenChange={setShowCampaignModal}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedCampaign?.name}</DialogTitle>
            </DialogHeader>
            {selectedCampaign && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <span className="text-gray-600 text-sm">Platform:</span>
                      <span className="ml-2 font-medium">{selectedCampaign.platform}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Objective:</span>
                      <span className="ml-2 font-medium">{selectedCampaign.objective}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Target Audience:</span>
                      <span className="ml-2 font-medium">{selectedCampaign.targeting.audience}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Duration:</span>
                      <span className="ml-2 font-medium">
                        {selectedCampaign.schedule.startDate} - {selectedCampaign.schedule.endDate}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Budget Utilization</span>
                      <span className="font-semibold">
                        ${selectedCampaign.budget.spent.toLocaleString()} / ${selectedCampaign.budget.total.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full transition-all duration-300" 
                        style={{ width: `${(selectedCampaign.budget.spent / selectedCampaign.budget.total) * 100}%` }}
                      />
                    </div>
                    <p className="text-gray-600 text-sm">
                      {((selectedCampaign.budget.spent / selectedCampaign.budget.total) * 100).toFixed(1)}% of budget used
                    </p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Publish/Schedule Modal */}
        <Dialog open={showPublishModal} onOpenChange={setShowPublishModal}>
          <DialogContent className="max-w-2xl bg-[#1E1B4B] border-[#3D3A6E] text-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {publishForm.action === 'publish' ? 'Publish Video' : 'Schedule Video'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Platform Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Select Platforms</label>
                <div className="grid grid-cols-2 gap-3">
                  {['facebook', 'instagram', 'youtube', 'tiktok', 'linkedin', 'twitter'].map((platform) => (
                    <label key={platform} className="flex items-center space-x-3 p-3 bg-[#2A2153] rounded-lg border border-[#3D3A6E] hover:border-purple-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={publishForm.platforms.includes(platform)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setPublishForm(prev => ({
                              ...prev,
                              platforms: [...prev.platforms, platform]
                            }));
                          } else {
                            setPublishForm(prev => ({
                              ...prev,
                              platforms: prev.platforms.filter(p => p !== platform)
                            }));
                          }
                        }}
                        className="w-4 h-4 text-purple-600 bg-[#1E1B4B] border-[#3D3A6E] rounded focus:ring-purple-500"
                      />
                      <span className="capitalize text-white">{platform}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Schedule Date/Time (only for schedule action) */}
              {publishForm.action === 'schedule' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Schedule Date</label>
                    <input
                      type="date"
                      value={publishForm.scheduleDate}
                      onChange={(e) => setPublishForm(prev => ({ ...prev, scheduleDate: e.target.value }))}
                      className="w-full bg-[#2A2153] border border-[#3D3A6E] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Schedule Time</label>
                    <input
                      type="time"
                      value={publishForm.scheduleTime}
                      onChange={(e) => setPublishForm(prev => ({ ...prev, scheduleTime: e.target.value }))}
                      className="w-full bg-[#2A2153] border border-[#3D3A6E] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              )}

              {/* Caption */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Caption</label>
                <textarea
                  rows={3}
                  placeholder="Write a compelling caption for your video..."
                  value={publishForm.caption}
                  onChange={(e) => setPublishForm(prev => ({ ...prev, caption: e.target.value }))}
                  className="w-full bg-[#2A2153] border border-[#3D3A6E] rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Hashtags */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Hashtags</label>
                <input
                  type="text"
                  placeholder="#marketing #ai #video #brand"
                  value={publishForm.hashtags}
                  onChange={(e) => setPublishForm(prev => ({ ...prev, hashtags: e.target.value }))}
                  className="w-full bg-[#2A2153] border border-[#3D3A6E] rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-[#3D3A6E]">
                <button 
                  onClick={() => setShowPublishModal(false)}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleFinalPublish}
                  disabled={publishForm.platforms.length === 0 || (publishForm.action === 'schedule' && (!publishForm.scheduleDate || !publishForm.scheduleTime))}
                  className="px-8 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {publishForm.action === 'publish' ? (
                    <>
                      <Zap className="h-4 w-4 mr-2 inline" />
                      Publish Now
                    </>
                  ) : (
                    <>
                      <Calendar className="h-4 w-4 mr-2 inline" />
                      Schedule Post
                    </>
                  )}
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Video Preview Modal */}
        <Dialog open={showVideoPreviewModal} onOpenChange={setShowVideoPreviewModal}>
          <DialogContent className="max-w-4xl bg-[#1E1B4B] border-[#3D3A6E] text-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Video Preview
              </DialogTitle>
            </DialogHeader>
            
            {selectedVideoForPreview && (
              <div className="space-y-6">
                {/* Video Player */}
                <div className="relative bg-black rounded-lg overflow-hidden">
                  <video
                    controls
                    autoPlay
                    className="w-full h-auto max-h-[70vh] object-contain"
                    poster={selectedVideoForPreview.thumbnail}
                  >
                    <source src={selectedVideoForPreview.url} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>

                {/* Video Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Video Details</h3>
                      <div className="space-y-2">
                        {selectedVideoForPreview.headline && (
                          <div>
                            <span className="text-gray-400 text-sm">Headline:</span>
                            <p className="text-white font-medium">{selectedVideoForPreview.headline}</p>
                          </div>
                        )}
                        {selectedVideoForPreview.description && (
                          <div>
                            <span className="text-gray-400 text-sm">Description:</span>
                            <p className="text-white">{selectedVideoForPreview.description}</p>
                          </div>
                        )}
                        {selectedVideoForPreview.callToAction && (
                          <div>
                            <span className="text-gray-400 text-sm">Call to Action:</span>
                            <p className="text-white font-medium">{selectedVideoForPreview.callToAction}</p>
                          </div>
                        )}
                        {selectedVideoForPreview.platform && (
                          <div>
                            <span className="text-gray-400 text-sm">Platform:</span>
                            <span className="ml-2 px-2 py-1 bg-purple-600 text-white text-xs rounded-full capitalize">
                              {selectedVideoForPreview.platform}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Performance Metrics</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#2A2153] p-3 rounded-lg border border-[#3D3A6E]">
                          <p className="text-gray-400 text-xs">Impressions</p>
                          <p className="text-white font-semibold text-lg">
                            {selectedVideoForPreview.performance?.impressions?.toLocaleString() || '0'}
                          </p>
                        </div>
                        <div className="bg-[#2A2153] p-3 rounded-lg border border-[#3D3A6E]">
                          <p className="text-gray-400 text-xs">Clicks</p>
                          <p className="text-white font-semibold text-lg">
                            {selectedVideoForPreview.performance?.clicks?.toLocaleString() || '0'}
                          </p>
                        </div>
                        <div className="bg-[#2A2153] p-3 rounded-lg border border-[#3D3A6E]">
                          <p className="text-gray-400 text-xs">CTR</p>
                          <p className="text-white font-semibold text-lg">
                            {selectedVideoForPreview.performance?.ctr ? `${selectedVideoForPreview.performance.ctr.toFixed(2)}%` : '0%'}
                          </p>
                        </div>
                        <div className="bg-[#2A2153] p-3 rounded-lg border border-[#3D3A6E]">
                          <p className="text-gray-400 text-xs">Conversions</p>
                          <p className="text-white font-semibold text-lg">
                            {selectedVideoForPreview.performance?.conversions || '0'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-4 border-t border-[#3D3A6E]">
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = selectedVideoForPreview.url;
                        link.download = `${selectedVideoForPreview.id}.mp4`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="px-4 py-2 bg-[#2A2153] hover:bg-[#3D3A6E] text-white rounded-lg transition-colors flex items-center"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </button>
                    <button 
                      onClick={() => {
                        setShowVideoPreviewModal(false);
                        handlePublishAction(selectedVideoForPreview, 'publish');
                      }}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Publish Now
                    </button>
                    <button 
                      onClick={() => {
                        setShowVideoPreviewModal(false);
                        handlePublishAction(selectedVideoForPreview, 'schedule');
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule
                    </button>
                  </div>
                  <button 
                    onClick={() => setShowVideoPreviewModal(false)}
                    className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
        </div>
      </div>
    </DashboardLayout>
  );
} 