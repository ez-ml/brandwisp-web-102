'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Loader2,
  Search,
  Globe,
  Users,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  LineChart,
  TrendingUp,
  Target,
  MousePointer,
  Eye,
  Zap,
  Activity,
  MapPin,
  Smartphone,
  Monitor,
  Tablet,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Settings,
  AlertCircle,
  CheckCircle,
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
  BarChart,
  Bar,
  LineChart as RechartsLineChart,
  Line,
  RadialBarChart,
  RadialBar,
  Sankey,
  FunnelChart,
  Funnel,
  LabelList,
} from 'recharts';

interface TrafficData {
  date: string;
  visitors: number;
  pageviews: number;
  sessions: number;
  bounceRate: number;
  avgSessionDuration: number;
}

interface TrafficSource {
  name: string;
  visitors: number;
  change: number;
  percentage: number;
  color: string;
}

interface GeographicData {
  country: string;
  visitors: number;
  sessions: number;
  bounceRate: number;
}

interface DeviceData {
  device: string;
  visitors: number;
  percentage: number;
  color: string;
}

interface ConversionFunnel {
  stage: string;
  visitors: number;
  conversionRate: number;
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

export default function TrafficTracePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState('');
  const [activeView, setActiveView] = useState<'dashboard' | 'analyze' | 'reports'>('dashboard');
  const [dateRange, setDateRange] = useState('7d');
  const [analyzing, setAnalyzing] = useState(false);

  const trafficData: TrafficData[] = [
    { date: 'Mar 10', visitors: 1200, pageviews: 3600, sessions: 1150, bounceRate: 42.3, avgSessionDuration: 245 },
    { date: 'Mar 11', visitors: 1300, pageviews: 4100, sessions: 1250, bounceRate: 38.7, avgSessionDuration: 267 },
    { date: 'Mar 12', visitors: 1400, pageviews: 4300, sessions: 1380, bounceRate: 35.2, avgSessionDuration: 289 },
    { date: 'Mar 13', visitors: 1800, pageviews: 5200, sessions: 1720, bounceRate: 33.8, avgSessionDuration: 312 },
    { date: 'Mar 14', visitors: 2000, pageviews: 6100, sessions: 1950, bounceRate: 31.5, avgSessionDuration: 298 },
    { date: 'Mar 15', visitors: 1900, pageviews: 5800, sessions: 1850, bounceRate: 34.1, avgSessionDuration: 276 },
    { date: 'Mar 16', visitors: 2200, pageviews: 6500, sessions: 2100, bounceRate: 29.8, avgSessionDuration: 325 },
  ];

  const trafficSources: TrafficSource[] = [
    { name: 'Organic Search', visitors: 12500, change: 23.5, percentage: 45.2, color: '#10B981' },
    { name: 'Direct', visitors: 8300, change: -5.2, percentage: 30.1, color: '#3B82F6' },
    { name: 'Social Media', visitors: 6200, change: 15.8, percentage: 22.4, color: '#F59E0B' },
    { name: 'Referral', visitors: 4100, change: 8.3, percentage: 14.8, color: '#EC4899' },
    { name: 'Email', visitors: 2800, change: 12.7, percentage: 10.1, color: '#8B5CF6' },
    { name: 'Paid Search', visitors: 1900, change: -3.4, percentage: 6.9, color: '#EF4444' },
  ];

  const geographicData: GeographicData[] = [
    { country: 'United States', visitors: 8500, sessions: 8200, bounceRate: 32.1 },
    { country: 'United Kingdom', visitors: 3200, sessions: 3100, bounceRate: 35.7 },
    { country: 'Canada', visitors: 2800, sessions: 2700, bounceRate: 38.2 },
    { country: 'Germany', visitors: 2100, sessions: 2000, bounceRate: 41.5 },
    { country: 'France', visitors: 1900, sessions: 1850, bounceRate: 39.8 },
  ];

  const deviceData: DeviceData[] = [
    { device: 'Desktop', visitors: 15200, percentage: 55.2, color: '#10B981' },
    { device: 'Mobile', visitors: 9800, percentage: 35.6, color: '#3B82F6' },
    { device: 'Tablet', visitors: 2500, percentage: 9.2, color: '#F59E0B' },
  ];

  const conversionFunnel: ConversionFunnel[] = [
    { stage: 'Page Views', visitors: 27500, conversionRate: 100 },
    { stage: 'Product Views', visitors: 12400, conversionRate: 45.1 },
    { stage: 'Add to Cart', visitors: 4960, conversionRate: 18.0 },
    { stage: 'Checkout', visitors: 2480, conversionRate: 9.0 },
    { stage: 'Purchase', visitors: 1240, conversionRate: 4.5 },
  ];

  const topPages = [
    { page: '/products/smartphone', views: 8500, bounceRate: 28.3, avgTime: 245 },
    { page: '/blog/tech-trends', views: 6200, bounceRate: 35.7, avgTime: 189 },
    { page: '/about', views: 4800, bounceRate: 42.1, avgTime: 156 },
    { page: '/contact', views: 3900, bounceRate: 38.9, avgTime: 134 },
    { page: '/pricing', views: 3200, bounceRate: 31.2, avgTime: 198 },
  ];

  const handleAnalyze = async () => {
    if (!url) return;
    
    setAnalyzing(true);
    try {
      // TODO: Implement actual traffic analysis API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      alert('Traffic analysis completed successfully!');
    } catch (error) {
      console.error('Error analyzing traffic:', error);
      alert('Error analyzing traffic. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const totalVisitors = trafficData.reduce((sum, day) => sum + day.visitors, 0);
  const totalPageviews = trafficData.reduce((sum, day) => sum + day.pageviews, 0);
  const avgBounceRate = trafficData.reduce((sum, day) => sum + day.bounceRate, 0) / trafficData.length;
  const avgSessionDuration = trafficData.reduce((sum, day) => sum + day.avgSessionDuration, 0) / trafficData.length;

  const renderDashboard = () => (
    <>
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-purple-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-purple-600/30 to-purple-800/30 rounded-xl shadow-lg">
                <Users className="h-6 w-6 text-purple-300" />
              </div>
              <h3 className="font-medium ml-3 text-purple-200">Total Visitors</h3>
            </div>
            <span className="text-green-400 flex items-center text-sm">
              +12.5%
              <ArrowUpRight className="h-4 w-4 ml-1" />
            </span>
          </div>
          <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
            {totalVisitors.toLocaleString()}
          </p>
          <p className="text-sm text-gray-400">Last 7 days</p>
        </Card>

        <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-green-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-green-600/30 to-green-800/30 rounded-xl shadow-lg">
                <Eye className="h-6 w-6 text-green-300" />
              </div>
              <h3 className="font-medium ml-3 text-green-200">Page Views</h3>
            </div>
            <span className="text-green-400 flex items-center text-sm">
              +8.3%
              <ArrowUpRight className="h-4 w-4 ml-1" />
            </span>
          </div>
          <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 mb-2">
            {totalPageviews.toLocaleString()}
          </p>
          <p className="text-sm text-gray-400">Total page views</p>
        </Card>

        <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-blue-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-blue-600/30 to-blue-800/30 rounded-xl shadow-lg">
                <Clock className="h-6 w-6 text-blue-300" />
              </div>
              <h3 className="font-medium ml-3 text-blue-200">Avg. Session</h3>
            </div>
            <span className="text-green-400 flex items-center text-sm">
              +3.2%
              <ArrowUpRight className="h-4 w-4 ml-1" />
            </span>
          </div>
          <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-2">
            {Math.floor(avgSessionDuration / 60)}m {Math.floor(avgSessionDuration % 60)}s
          </p>
          <p className="text-sm text-gray-400">Session duration</p>
        </Card>

        <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-orange-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-orange-600/30 to-orange-800/30 rounded-xl shadow-lg">
                <Target className="h-6 w-6 text-orange-300" />
              </div>
              <h3 className="font-medium ml-3 text-orange-200">Bounce Rate</h3>
            </div>
            <span className="text-red-400 flex items-center text-sm">
              +2.1%
              <ArrowDownRight className="h-4 w-4 ml-1" />
            </span>
          </div>
          <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400 mb-2">
            {avgBounceRate.toFixed(1)}%
          </p>
          <p className="text-sm text-gray-400">Average bounce rate</p>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm shadow-2xl">
          <h2 className="text-xl font-semibold mb-6 text-purple-300 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Traffic Overview
          </h2>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData}>
                <defs>
                  <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPageviews" x1="0" y1="0" x2="0" y2="1">
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
                  dataKey="visitors"
                  stroke="#8B5CF6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorVisitors)"
                />
                <Area
                  type="monotone"
                  dataKey="pageviews"
                  stroke="#10B981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorPageviews)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm shadow-2xl">
          <h2 className="text-xl font-semibold mb-6 text-purple-300 flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            Traffic Sources
          </h2>
          <div className="h-[350px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={trafficSources}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={120}
                  paddingAngle={8}
                  dataKey="visitors"
                >
                  {trafficSources.map((entry, index) => (
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
            {trafficSources.map((item, index) => (
              <div key={index} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2 shadow-lg" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-gray-300">{item.name}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Device & Geographic Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm shadow-2xl">
          <h2 className="text-xl font-semibold mb-6 text-purple-300 flex items-center">
            <Smartphone className="h-5 w-5 mr-2" />
            Device Breakdown
          </h2>
          <div className="space-y-4">
            {deviceData.map((device, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-gradient-to-br from-gray-600/30 to-gray-800/30 rounded-lg mr-3">
                    {device.device === 'Desktop' && <Monitor className="h-5 w-5 text-gray-300" />}
                    {device.device === 'Mobile' && <Smartphone className="h-5 w-5 text-gray-300" />}
                    {device.device === 'Tablet' && <Tablet className="h-5 w-5 text-gray-300" />}
                  </div>
                  <div>
                    <p className="text-white font-medium">{device.device}</p>
                    <p className="text-gray-400 text-sm">{device.visitors.toLocaleString()} visitors</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold">{device.percentage}%</p>
                  <div className="w-20 h-2 bg-gray-700 rounded-full mt-1">
                    <div 
                      className="h-2 rounded-full" 
                      style={{ 
                        width: `${device.percentage}%`, 
                        backgroundColor: device.color 
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm shadow-2xl">
          <h2 className="text-xl font-semibold mb-6 text-purple-300 flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Top Countries
          </h2>
          <div className="space-y-4">
            {geographicData.map((country, index) => (
              <div key={index} className="flex items-center justify-between bg-[#1E1B4B]/60 rounded-lg p-3">
                <div>
                  <p className="text-white font-medium">{country.country}</p>
                  <p className="text-gray-400 text-sm">{country.visitors.toLocaleString()} visitors</p>
                </div>
                <div className="text-right">
                  <p className="text-white text-sm">Bounce: {country.bounceRate}%</p>
                  <p className="text-gray-400 text-xs">{country.sessions.toLocaleString()} sessions</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Conversion Funnel */}
      <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm shadow-2xl">
        <h2 className="text-xl font-semibold mb-6 text-purple-300 flex items-center">
          <Activity className="h-5 w-5 mr-2" />
          Conversion Funnel
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {conversionFunnel.map((stage, index) => (
            <div key={index} className="text-center">
              <div className="bg-gradient-to-br from-purple-600/30 to-purple-800/30 rounded-xl p-4 mb-3">
                <p className="text-2xl font-bold text-white">{stage.visitors.toLocaleString()}</p>
                <p className="text-purple-300 text-sm">{stage.conversionRate}%</p>
              </div>
              <p className="text-gray-300 text-sm">{stage.stage}</p>
              {index < conversionFunnel.length - 1 && (
                <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                  <ArrowUpRight className="h-4 w-4 text-gray-400 rotate-90" />
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </>
  );

  const renderAnalyze = () => (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm shadow-2xl">
        <h2 className="text-xl font-semibold mb-6 text-purple-300 flex items-center">
          <Search className="h-5 w-5 mr-2" />
          Website Traffic Analysis
        </h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">Website URL</label>
            <div className="flex gap-4">
              <Input
                placeholder="Enter your website URL (e.g., https://example.com)"
                className="bg-[#1E1B4B]/70 border-[#3D3A6E] text-white flex-1 backdrop-blur-sm h-12 rounded-xl"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <Button 
                variant="outline" 
                className="text-purple-300 border-purple-300 hover:bg-purple-600/20 px-6"
              >
                <Globe className="h-4 w-4 mr-2" />
                Verify
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">Analysis Period</label>
              <select 
                className="w-full bg-[#1E1B4B]/70 border border-[#3D3A6E] rounded-xl p-3 text-white backdrop-blur-sm"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              >
                <option value="1d">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">Analysis Type</label>
              <select className="w-full bg-[#1E1B4B]/70 border border-[#3D3A6E] rounded-xl p-3 text-white backdrop-blur-sm">
                <option value="comprehensive">Comprehensive Analysis</option>
                <option value="traffic">Traffic Sources Only</option>
                <option value="behavior">User Behavior</option>
                <option value="conversion">Conversion Tracking</option>
                <option value="seo">SEO Performance</option>
              </select>
            </div>
          </div>

          <div className="bg-[#1E1B4B]/60 rounded-xl p-4 border border-[#3D3A6E]">
            <h3 className="text-lg font-semibold text-white mb-3">Analysis Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                  <span className="text-gray-300 text-sm">Traffic source breakdown</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                  <span className="text-gray-300 text-sm">Geographic distribution</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                  <span className="text-gray-300 text-sm">Device & browser analysis</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                  <span className="text-gray-300 text-sm">User behavior patterns</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                  <span className="text-gray-300 text-sm">Conversion funnel analysis</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                  <span className="text-gray-300 text-sm">Performance recommendations</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={handleAnalyze}
              disabled={analyzing || !url}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-3 rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
            >
              {analyzing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Analyzing Traffic...
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5 mr-2" />
                  Start Analysis
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm shadow-2xl">
        <h2 className="text-xl font-semibold mb-6 text-purple-300 flex items-center">
          <BarChart3 className="h-5 w-5 mr-2" />
          Top Performing Pages
        </h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#3D3A6E]">
                <th className="text-left py-3 px-4 text-purple-300 font-medium">Page</th>
                <th className="text-left py-3 px-4 text-purple-300 font-medium">Views</th>
                <th className="text-left py-3 px-4 text-purple-300 font-medium">Bounce Rate</th>
                <th className="text-left py-3 px-4 text-purple-300 font-medium">Avg. Time</th>
                <th className="text-left py-3 px-4 text-purple-300 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {topPages.map((page, index) => (
                <tr key={index} className="border-b border-[#3D3A6E]/50 hover:bg-[#1E1B4B]/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <ExternalLink className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-white font-medium">{page.page}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-300">{page.views.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      page.bounceRate < 30 ? 'bg-green-400/20 text-green-400' :
                      page.bounceRate < 40 ? 'bg-yellow-400/20 text-yellow-400' :
                      'bg-red-400/20 text-red-400'
                    }`}>
                      {page.bounceRate}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-300">
                    {Math.floor(page.avgTime / 60)}m {page.avgTime % 60}s
                  </td>
                  <td className="py-3 px-4">
                    <Button variant="outline" size="sm" className="text-purple-300 border-purple-300 hover:bg-purple-600/20">
                      <Eye className="h-3 w-3 mr-1" />
                      View Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm shadow-2xl">
          <h2 className="text-xl font-semibold mb-6 text-purple-300 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Bounce Rate Trend
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart data={trafficData}>
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
                <Line
                  type="monotone"
                  dataKey="bounceRate"
                  stroke="#EF4444"
                  strokeWidth={3}
                  dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm shadow-2xl">
          <h2 className="text-xl font-semibold mb-6 text-purple-300 flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Session Duration
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trafficData}>
                <defs>
                  <linearGradient id="sessionGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.3} />
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
                <Bar 
                  dataKey="avgSessionDuration" 
                  fill="url(#sessionGradient)" 
                  radius={[4, 4, 0, 0]}
                  stroke="#3B82F6"
                  strokeWidth={1}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
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
                TrafficTrace
              </h1>
              <p className="text-gray-400 mt-2 text-lg">Advanced Website Traffic Analytics & Insights</p>
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
                onClick={() => setActiveView('analyze')}
                className={`px-6 py-2 rounded-xl transition-all duration-300 ${
                  activeView === 'analyze'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                    : 'bg-transparent text-purple-300 hover:bg-purple-600/20 border-purple-400/30'
                }`}
              >
                Analyze
              </Button>
              <Button
                variant="outline"
                onClick={() => setActiveView('reports')}
                className={`px-6 py-2 rounded-xl transition-all duration-300 ${
                  activeView === 'reports'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                    : 'bg-transparent text-purple-300 hover:bg-purple-600/20 border-purple-400/30'
                }`}
              >
                Reports
              </Button>
            </div>
          </div>

          {/* Dynamic Content */}
          {activeView === 'dashboard' && renderDashboard()}
          {activeView === 'analyze' && renderAnalyze()}
          {activeView === 'reports' && renderReports()}
        </div>
      </div>
    </DashboardLayout>
  );
} 