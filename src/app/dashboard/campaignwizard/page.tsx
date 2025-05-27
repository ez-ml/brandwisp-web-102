'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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

interface Campaign {
  id: string;
  name: string;
  platform: string;
  budget: number;
  spent: number;
  status: 'active' | 'scheduled' | 'paused' | 'ended';
  startDate: Date;
  endDate: Date;
  objective: string;
  targetAudience: string;
  creativeType: 'image' | 'video' | 'carousel';
  metrics: {
    reach: number;
    impressions: number;
    clicks: number;
    engagement: number;
    conversions: number;
    ctr: number;
    cpc: number;
    roas: number;
  };
}

interface CampaignMetrics {
  date: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  roas: number;
}

interface PlatformData {
  platform: string;
  campaigns: number;
  spend: number;
  roas: number;
  color: string;
}

interface CreativeAsset {
  id: string;
  name: string;
  type: 'image' | 'video';
  url: string;
  performance: {
    ctr: number;
    engagement: number;
    conversions: number;
  };
  status: 'active' | 'draft' | 'archived';
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

export default function CampaignWizardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState<'dashboard' | 'create' | 'manage' | 'creatives'>('dashboard');
  
  // Campaign creation states
  const [campaignName, setCampaignName] = useState('');
  const [platform, setPlatform] = useState('');
  const [budget, setBudget] = useState('');
  const [objective, setObjective] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [creativeType, setCreativeType] = useState<'image' | 'video' | 'carousel'>('image');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [generating, setGenerating] = useState(false);
  
  // Campaign management states
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  
  // Creative assets states
  const [creativeAssets, setCreativeAssets] = useState<CreativeAsset[]>([]);
  const [showCreativeModal, setShowCreativeModal] = useState(false);

  const metricsData: CampaignMetrics[] = [
    { date: 'Mar 10', spend: 1200, impressions: 45000, clicks: 890, conversions: 45, roas: 3.2 },
    { date: 'Mar 11', spend: 1350, impressions: 52000, clicks: 1020, conversions: 58, roas: 3.8 },
    { date: 'Mar 12', spend: 980, impressions: 38000, clicks: 750, conversions: 42, roas: 2.9 },
    { date: 'Mar 13', spend: 1580, impressions: 67000, clicks: 1340, conversions: 78, roas: 4.2 },
    { date: 'Mar 14', spend: 1420, impressions: 58000, clicks: 1150, conversions: 65, roas: 3.6 },
    { date: 'Mar 15', spend: 1680, impressions: 71000, clicks: 1420, conversions: 89, roas: 4.5 },
    { date: 'Mar 16', spend: 1520, impressions: 63000, clicks: 1260, conversions: 72, roas: 3.9 },
  ];

  const platformData: PlatformData[] = [
    { platform: 'Facebook', campaigns: 12, spend: 8500, roas: 3.8, color: '#1877F2' },
    { platform: 'Instagram', campaigns: 8, spend: 6200, roas: 4.2, color: '#E4405F' },
    { platform: 'Google Ads', campaigns: 15, spend: 12000, roas: 3.5, color: '#4285F4' },
    { platform: 'TikTok', campaigns: 5, spend: 3800, roas: 4.8, color: '#000000' },
    { platform: 'LinkedIn', campaigns: 6, spend: 4500, roas: 2.9, color: '#0A66C2' },
  ];

  const objectiveData = [
    { name: 'Brand Awareness', campaigns: 8, spend: 5200, color: '#8B5CF6' },
    { name: 'Lead Generation', campaigns: 12, spend: 8900, color: '#10B981' },
    { name: 'Sales', campaigns: 15, spend: 12400, color: '#F59E0B' },
    { name: 'Website Traffic', campaigns: 10, spend: 6800, color: '#3B82F6' },
  ];

  // Sample data
  useEffect(() => {
    setCampaigns([
      {
        id: '1',
        name: 'Summer Sale 2024',
        platform: 'Facebook & Instagram',
        budget: 5000,
        spent: 3200,
        status: 'active',
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-03-31'),
        objective: 'Sales',
        targetAudience: 'Young Adults (18-35)',
        creativeType: 'carousel',
        metrics: {
          reach: 50000,
          impressions: 125000,
          clicks: 2500,
          engagement: 1800,
          conversions: 150,
          ctr: 2.0,
          cpc: 1.28,
          roas: 4.2,
        },
      },
      {
        id: '2',
        name: 'Product Launch Campaign',
        platform: 'Google Ads',
        budget: 3000,
        spent: 1200,
        status: 'scheduled',
        startDate: new Date('2024-04-01'),
        endDate: new Date('2024-04-15'),
        objective: 'Brand Awareness',
        targetAudience: 'Tech Enthusiasts',
        creativeType: 'video',
        metrics: {
          reach: 0,
          impressions: 0,
          clicks: 0,
          engagement: 0,
          conversions: 0,
          ctr: 0,
          cpc: 0,
          roas: 0,
        },
      },
      {
        id: '3',
        name: 'Holiday Special',
        platform: 'TikTok',
        budget: 2500,
        spent: 2500,
        status: 'ended',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-02-28'),
        objective: 'Lead Generation',
        targetAudience: 'Gen Z (16-24)',
        creativeType: 'video',
        metrics: {
          reach: 85000,
          impressions: 180000,
          clicks: 3600,
          engagement: 4200,
          conversions: 280,
          ctr: 2.0,
          cpc: 0.69,
          roas: 5.8,
        },
      },
    ]);

    setCreativeAssets([
      {
        id: '1',
        name: 'Summer Sale Hero Image',
        type: 'image',
        url: '/placeholder-1.jpg',
        performance: { ctr: 2.4, engagement: 1800, conversions: 89 },
        status: 'active',
      },
      {
        id: '2',
        name: 'Product Demo Video',
        type: 'video',
        url: '/placeholder-video.mp4',
        performance: { ctr: 3.1, engagement: 2400, conversions: 156 },
        status: 'active',
      },
    ]);
  }, []);

  const handleCreateCampaign = async () => {
    if (!campaignName || !platform || !budget) return;
    
    setGenerating(true);
    try {
      // TODO: Implement actual campaign creation API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Reset form
      setCampaignName('');
      setPlatform('');
      setBudget('');
      setObjective('');
      setTargetAudience('');
      setStartDate('');
      setEndDate('');
      setSelectedFiles([]);
      
      alert('Campaign created successfully!');
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Error creating campaign. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const totalSpend = campaigns.reduce((sum, campaign) => sum + campaign.spent, 0);
  const totalConversions = campaigns.reduce((sum, campaign) => sum + campaign.metrics.conversions, 0);
  const avgROAS = campaigns.reduce((sum, campaign) => sum + campaign.metrics.roas, 0) / campaigns.length || 0;
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;

  const renderDashboard = () => (
    <>
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-purple-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-purple-600/30 to-purple-800/30 rounded-xl shadow-lg">
                <Activity className="h-6 w-6 text-purple-300" />
              </div>
              <h3 className="font-medium ml-3 text-purple-200">Active Campaigns</h3>
            </div>
          </div>
          <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
            {activeCampaigns}
          </p>
          <p className="text-sm text-gray-400">Currently running</p>
        </Card>

        <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-green-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-green-600/30 to-green-800/30 rounded-xl shadow-lg">
                <DollarSign className="h-6 w-6 text-green-300" />
              </div>
              <h3 className="font-medium ml-3 text-green-200">Total Spend</h3>
            </div>
            <span className="text-green-400 flex items-center text-sm">
              +15.2%
            </span>
          </div>
          <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 mb-2">
            ${totalSpend.toLocaleString()}
          </p>
          <p className="text-sm text-gray-400">This month</p>
        </Card>

        <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-blue-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-blue-600/30 to-blue-800/30 rounded-xl shadow-lg">
                <Target className="h-6 w-6 text-blue-300" />
              </div>
              <h3 className="font-medium ml-3 text-blue-200">Conversions</h3>
            </div>
            <span className="text-green-400 flex items-center text-sm">
              +23.8%
            </span>
          </div>
          <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-2">
            {totalConversions.toLocaleString()}
          </p>
          <p className="text-sm text-gray-400">Total conversions</p>
        </Card>

        <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-orange-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-orange-600/30 to-orange-800/30 rounded-xl shadow-lg">
                <TrendingUp className="h-6 w-6 text-orange-300" />
              </div>
              <h3 className="font-medium ml-3 text-orange-200">Avg ROAS</h3>
            </div>
            <span className="text-green-400 flex items-center text-sm">
              +8.4%
            </span>
          </div>
          <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400 mb-2">
            {avgROAS.toFixed(1)}x
          </p>
          <p className="text-sm text-gray-400">Return on ad spend</p>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm shadow-2xl">
          <h2 className="text-xl font-semibold mb-6 text-purple-300 flex items-center">
            <BarChart className="h-5 w-5 mr-2" />
            Campaign Performance
          </h2>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={metricsData}>
                <defs>
                  <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#3D3A6E" opacity={0.3} />
                <XAxis dataKey="date" stroke="#A78BFA" fontSize={12} />
                <YAxis yAxisId="left" stroke="#A78BFA" fontSize={12} />
                <YAxis yAxisId="right" orientation="right" stroke="#A78BFA" fontSize={12} />
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
                  yAxisId="left"
                  type="monotone"
                  dataKey="spend"
                  stroke="#8B5CF6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#spendGradient)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="roas"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm shadow-2xl">
          <h2 className="text-xl font-semibold mb-6 text-purple-300 flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            Platform Distribution
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
                  dataKey="spend"
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
          <div className="grid grid-cols-2 gap-2 mt-4">
            {platformData.map((item, index) => (
              <div key={index} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2 shadow-lg" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-gray-300">{item.platform}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Campaign Objectives */}
      <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm shadow-2xl">
        <h2 className="text-xl font-semibold mb-6 text-purple-300 flex items-center">
          <Target className="h-5 w-5 mr-2" />
          Campaign Objectives Performance
        </h2>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart data={objectiveData}>
              <defs>
                <linearGradient id="objectiveGradient" x1="0" y1="0" x2="0" y2="1">
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
                dataKey="spend" 
                fill="url(#objectiveGradient)" 
                radius={[4, 4, 0, 0]}
                stroke="#8B5CF6"
                strokeWidth={1}
              />
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </>
  );

  const renderCreate = () => (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm shadow-2xl">
        <h2 className="text-xl font-semibold mb-6 text-purple-300 flex items-center">
          <Wand2 className="h-5 w-5 mr-2" />
          Create New Campaign
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">Campaign Name</label>
              <Input
                placeholder="Enter campaign name..."
                className="bg-[#1E1B4B]/70 border-[#3D3A6E] text-white backdrop-blur-sm h-12 rounded-xl"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">Platform</label>
              <select 
                className="w-full bg-[#1E1B4B]/70 border border-[#3D3A6E] rounded-xl p-3 text-white backdrop-blur-sm"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
              >
                <option value="">Select platform...</option>
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
                <option value="google">Google Ads</option>
                <option value="tiktok">TikTok</option>
                <option value="linkedin">LinkedIn</option>
                <option value="twitter">Twitter</option>
                <option value="youtube">YouTube</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">Budget</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="number"
                  placeholder="Enter budget amount..."
                  className="bg-[#1E1B4B]/70 border-[#3D3A6E] text-white pl-10 backdrop-blur-sm h-12 rounded-xl"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">Campaign Objective</label>
              <select 
                className="w-full bg-[#1E1B4B]/70 border border-[#3D3A6E] rounded-xl p-3 text-white backdrop-blur-sm"
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
              >
                <option value="">Select objective...</option>
                <option value="brand-awareness">Brand Awareness</option>
                <option value="reach">Reach</option>
                <option value="traffic">Website Traffic</option>
                <option value="engagement">Engagement</option>
                <option value="lead-generation">Lead Generation</option>
                <option value="conversions">Conversions</option>
                <option value="sales">Sales</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">Target Audience</label>
              <Textarea
                placeholder="Describe your target audience..."
                className="bg-[#1E1B4B]/70 border-[#3D3A6E] text-white backdrop-blur-sm rounded-xl"
                rows={3}
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">Start Date</label>
                <Input
                  type="date"
                  className="bg-[#1E1B4B]/70 border-[#3D3A6E] text-white backdrop-blur-sm h-12 rounded-xl"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">End Date</label>
                <Input
                  type="date"
                  className="bg-[#1E1B4B]/70 border-[#3D3A6E] text-white backdrop-blur-sm h-12 rounded-xl"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">Creative Type</label>
              <div className="grid grid-cols-3 gap-2">
                {(['image', 'video', 'carousel'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setCreativeType(type)}
                    className={`p-3 rounded-xl border transition-all duration-300 ${
                      creativeType === type
                        ? 'bg-purple-600 border-purple-400 text-white'
                        : 'bg-[#1E1B4B]/60 border-[#3D3A6E] text-gray-300 hover:bg-purple-600/20'
                    }`}
                  >
                    {type === 'image' && <ImageIcon className="h-5 w-5 mx-auto mb-1" />}
                    {type === 'video' && <Video className="h-5 w-5 mx-auto mb-1" />}
                    {type === 'carousel' && <BarChart className="h-5 w-5 mx-auto mb-1" />}
                    <span className="text-xs capitalize">{type}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Creative Upload */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-purple-200 mb-2">Upload Creative Assets</label>
          <div className="border-2 border-dashed border-[#3D3A6E] rounded-xl p-6 text-center hover:border-purple-500 transition-colors">
            <div className="flex flex-col items-center">
              <div className="p-3 bg-gradient-to-br from-purple-600/30 to-purple-800/30 rounded-full mb-3">
                <Upload className="h-8 w-8 text-purple-300" />
              </div>
              <p className="text-gray-300 mb-2">
                Drop your {creativeType === 'video' ? 'videos' : 'images'} here or click to browse
              </p>
              <p className="text-sm text-gray-400 mb-4">
                {creativeType === 'video' ? 'MP4, MOV (Max 100MB)' : 'JPG, PNG, GIF (Max 10MB)'}
              </p>
              <input
                type="file"
                multiple
                accept={creativeType === 'video' ? 'video/*' : 'image/*'}
                onChange={handleFileSelect}
                className="hidden"
                id="creative-upload"
              />
              <label
                htmlFor="creative-upload"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-2 rounded-xl text-white font-medium cursor-pointer transition-all duration-300"
              >
                Select Files
              </label>
            </div>
          </div>

          {selectedFiles.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-purple-200 mb-2">Selected Files ({selectedFiles.length})</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="relative bg-[#1E1B4B]/60 rounded-lg p-2 border border-[#3D3A6E]">
                    <div className="aspect-square bg-gray-800 rounded-lg mb-2 flex items-center justify-center">
                      {creativeType === 'video' ? (
                        <Video className="h-6 w-6 text-gray-400" />
                      ) : (
                        <ImageIcon className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    <p className="text-xs text-gray-300 truncate">{file.name}</p>
                    <button
                      onClick={() => setSelectedFiles(files => files.filter((_, i) => i !== index))}
                      className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-center mt-8">
          <Button
            onClick={handleCreateCampaign}
            disabled={generating || !campaignName || !platform || !budget}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-3 rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
          >
            {generating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Creating Campaign...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                Create Campaign
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );

  const renderManage = () => (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm shadow-2xl">
        <h2 className="text-xl font-semibold mb-6 text-purple-300 flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          Campaign Management
        </h2>
        
        <div className="space-y-4">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="bg-gradient-to-r from-[#1E1B4B]/60 to-[#1E1B4B]/40 rounded-xl border border-[#3D3A6E] p-6 backdrop-blur-sm hover:bg-[#1E1B4B]/80 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{campaign.name}</h3>
                  <p className="text-gray-400 text-sm">{campaign.platform} • {campaign.objective}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      campaign.status === 'active'
                        ? 'bg-green-400/20 text-green-400 border border-green-400/30'
                        : campaign.status === 'scheduled'
                        ? 'bg-blue-400/20 text-blue-400 border border-blue-400/30'
                        : campaign.status === 'paused'
                        ? 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30'
                        : 'bg-red-400/20 text-red-400 border border-red-400/30'
                    }`}
                  >
                    {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                  </span>
                  <div className="flex gap-2">
                    {campaign.status === 'active' && (
                      <Button variant="outline" size="sm" className="text-yellow-300 border-yellow-300 hover:bg-yellow-600/20">
                        <Pause className="h-3 w-3 mr-1" />
                        Pause
                      </Button>
                    )}
                    {campaign.status === 'paused' && (
                      <Button variant="outline" size="sm" className="text-green-300 border-green-300 hover:bg-green-600/20">
                        <Play className="h-3 w-3 mr-1" />
                        Resume
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-purple-300 border-purple-300 hover:bg-purple-600/20"
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
                  <p className="text-gray-400 text-xs">Budget</p>
                  <p className="text-white font-semibold">${campaign.budget.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Spent</p>
                  <p className="text-white font-semibold">${campaign.spent.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Reach</p>
                  <p className="text-white font-semibold">{campaign.metrics.reach.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Clicks</p>
                  <p className="text-white font-semibold">{campaign.metrics.clicks.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Conversions</p>
                  <p className="text-white font-semibold">{campaign.metrics.conversions.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">ROAS</p>
                  <p className="text-white font-semibold">{campaign.metrics.roas.toFixed(1)}x</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-gray-400">
                  <Calendar className="h-4 w-4 mr-1" />
                  {campaign.startDate.toLocaleDateString()} - {campaign.endDate.toLocaleDateString()}
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-gray-400">CTR: {campaign.metrics.ctr}%</span>
                  <span className="text-gray-400">CPC: ${campaign.metrics.cpc}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderCreatives = () => (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm shadow-2xl">
        <h2 className="text-xl font-semibold mb-6 text-purple-300 flex items-center">
          <ImageIcon className="h-5 w-5 mr-2" />
          Creative Assets Library
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {creativeAssets.map((asset) => (
            <div
              key={asset.id}
              className="bg-gradient-to-br from-[#1E1B4B]/60 to-[#1E1B4B]/40 rounded-xl border border-[#3D3A6E] backdrop-blur-sm hover:bg-[#1E1B4B]/80 transition-all duration-300 transform hover:scale-102 shadow-lg overflow-hidden"
            >
              <div className="aspect-video bg-gray-800 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  {asset.type === 'video' ? (
                    <Video className="h-12 w-12 text-gray-400" />
                  ) : (
                    <ImageIcon className="h-12 w-12 text-gray-400" />
                  )}
                </div>
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    asset.status === 'active' ? 'bg-green-400/20 text-green-400 border border-green-400/30' :
                    asset.status === 'draft' ? 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30' :
                    'bg-gray-400/20 text-gray-400 border border-gray-400/30'
                  }`}>
                    {asset.status}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg text-white mb-2">{asset.name}</h3>
                <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
                  <div>
                    <p className="text-gray-400 text-xs">CTR</p>
                    <p className="text-white font-semibold">{asset.performance.ctr}%</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Engagement</p>
                    <p className="text-white font-semibold">{asset.performance.engagement}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Conversions</p>
                    <p className="text-white font-semibold">{asset.performance.conversions}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-purple-300 border-purple-300 hover:bg-purple-600/20 flex-1"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-blue-300 border-blue-300 hover:bg-blue-600/20 flex-1"
                  >
                    <Edit3 className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
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
                CampaignWizard
              </h1>
              <p className="text-gray-400 mt-2 text-lg">AI-Powered Campaign Creation & Management</p>
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
                Create
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
                Manage
              </Button>
              <Button
                variant="outline"
                onClick={() => setActiveView('creatives')}
                className={`px-6 py-2 rounded-xl transition-all duration-300 ${
                  activeView === 'creatives'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                    : 'bg-transparent text-purple-300 hover:bg-purple-600/20 border-purple-400/30'
                }`}
              >
                Creatives
              </Button>
            </div>
          </div>

          {/* Dynamic Content */}
          {activeView === 'dashboard' && renderDashboard()}
          {activeView === 'create' && renderCreate()}
          {activeView === 'manage' && renderManage()}
          {activeView === 'creatives' && renderCreatives()}

          {/* Campaign Detail Modal */}
          {showCampaignModal && selectedCampaign && (
            <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4">
              <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-[#2A2153] to-[#1E1B4B] rounded-2xl shadow-2xl border border-[#3D3A6E]">
                <div className="sticky top-0 bg-gradient-to-r from-[#2A2153] to-[#1E1B4B] border-b border-[#3D3A6E] p-6 flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white">Campaign Details</h2>
                  <Button 
                    onClick={() => setShowCampaignModal(false)} 
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Close
                  </Button>
                </div>

                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Campaign Information</h3>
                      <div className="space-y-3">
                        <div>
                          <span className="text-gray-400 text-sm">Name:</span>
                          <span className="text-white ml-2 font-medium">{selectedCampaign.name}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 text-sm">Platform:</span>
                          <span className="text-white ml-2">{selectedCampaign.platform}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 text-sm">Objective:</span>
                          <span className="text-white ml-2">{selectedCampaign.objective}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 text-sm">Target Audience:</span>
                          <span className="text-white ml-2">{selectedCampaign.targetAudience}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 text-sm">Duration:</span>
                          <span className="text-white ml-2">
                            {selectedCampaign.startDate.toLocaleDateString()} - {selectedCampaign.endDate.toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Performance Metrics</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#1E1B4B]/60 rounded-lg p-3">
                          <p className="text-gray-400 text-xs">Impressions</p>
                          <p className="text-white text-lg font-bold">{selectedCampaign.metrics.impressions.toLocaleString()}</p>
                        </div>
                        <div className="bg-[#1E1B4B]/60 rounded-lg p-3">
                          <p className="text-gray-400 text-xs">Clicks</p>
                          <p className="text-white text-lg font-bold">{selectedCampaign.metrics.clicks.toLocaleString()}</p>
                        </div>
                        <div className="bg-[#1E1B4B]/60 rounded-lg p-3">
                          <p className="text-gray-400 text-xs">CTR</p>
                          <p className="text-white text-lg font-bold">{selectedCampaign.metrics.ctr}%</p>
                        </div>
                        <div className="bg-[#1E1B4B]/60 rounded-lg p-3">
                          <p className="text-gray-400 text-xs">ROAS</p>
                          <p className="text-white text-lg font-bold">{selectedCampaign.metrics.roas.toFixed(1)}x</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Budget & Spend</h3>
                    <div className="bg-[#1E1B4B]/60 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400">Budget Utilization</span>
                        <span className="text-white font-semibold">
                          ${selectedCampaign.spent.toLocaleString()} / ${selectedCampaign.budget.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full transition-all duration-300" 
                          style={{ width: `${(selectedCampaign.spent / selectedCampaign.budget) * 100}%` }}
                        />
                      </div>
                      <p className="text-gray-400 text-sm mt-2">
                        {((selectedCampaign.spent / selectedCampaign.budget) * 100).toFixed(1)}% of budget used
                      </p>
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