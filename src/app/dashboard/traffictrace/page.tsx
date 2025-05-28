'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTrafficTraceData, useDashboardMutation } from '@/hooks/useDashboardData';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Loader2,
  Search,
  Globe,
  Users,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
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
  Plus,
  Edit3,
  Trash2,
  Bell,
  BellOff,
  X,
  Check,
  TrendingDown,
  Wifi,
  WifiOff,
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
  LineChart,
  Line,
  RadialBarChart,
  RadialBar,
} from 'recharts';

interface StoreConnection {
  id: string;
  userId: string;
  provider: 'shopify' | 'amazon' | 'etsy';
  status: 'connected' | 'disconnected' | 'expired' | 'reconnecting';
  storeName: string;
  storeUrl: string;
  accessToken?: string;
  refreshToken?: string;
  scope?: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  lastSyncAt?: Date;
  webhooks?: any[];
  metadata?: {
    email?: string;
    currency?: string;
    country?: string;
    timezone?: string;
    plan?: string;
    trafficTracking?: {
      enabled: boolean;
      trackingCode: string;
      enabledAt: Date;
      lastDataUpdate: Date;
      settings: {
        timezone: string;
        currency: string;
        goals: Array<{
          name: string;
          value: number;
          type: 'conversion' | 'engagement' | 'lead';
        }>;
      };
    };
    [key: string]: any;
  };
}

interface TrafficMetrics {
  date: string;
  visitors: number;
  pageViews: number;
  sessions: number;
  bounceRate: number;
  avgSessionDuration: number;
  conversions: number;
}

interface TrafficSource {
  name: string;
  visitors: number;
  percentage: number;
}

interface DeviceData {
  device: string;
  visitors: number;
  percentage: number;
}

interface GeographicData {
  country: string;
  visitors: number;
  sessions: number;
}

interface TopPage {
  path: string;
  views: number;
  avgTime: number;
}

interface TrafficGoal {
  id: string;
  name: string;
  type: 'conversion' | 'engagement' | 'lead';
  value: number;
  completions: number;
  conversionRate: number;
  totalValue: number;
  isActive: boolean;
}

interface TrafficAlert {
  id: string;
  name: string;
  type: 'traffic_drop' | 'traffic_spike' | 'bounce_rate' | 'conversion_drop';
  condition: {
    metric: string;
    operator: string;
    value: number;
    period: string;
  };
  isActive: boolean;
  lastTriggered: Date | null;
  notifications: {
    email: boolean;
    push: boolean;
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

export default function TrafficTracePage() {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<'dashboard' | 'reports'>('dashboard');
  const [selectedStore, setSelectedStore] = useState<StoreConnection | null>(null);
  const [dateRange, setDateRange] = useState('30');
  const [loading, setLoading] = useState(false);
  
  // Modal states
  const [showWebsiteModal, setShowWebsiteModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<TrafficGoal | null>(null);
  const [editingAlert, setEditingAlert] = useState<TrafficAlert | null>(null);
  
  // Form states
  const [websiteForm, setWebsiteForm] = useState({
    domain: '',
    name: '',
    timezone: 'UTC',
    currency: 'USD'
  });
  
  // Fetch data from backend
  const { data: dashboardData, loading: dataLoading, error: dataError, refetch } = useTrafficTraceData(
    activeView, 
    parseInt(dateRange), 
    { 
      autoRefresh: activeView === 'dashboard',
      refreshInterval: 30000
    }
  );
  const { mutate: trafficMutation } = useDashboardMutation('traffictrace');

  // Set selected store when data loads (for data calculation purposes)
  useEffect(() => {
    if (dashboardData?.stores && dashboardData.stores.length > 0) {
      // Always use the first store for summary calculations
      setSelectedStore(dashboardData.stores[0]);
    }
  }, [dashboardData?.stores]);

  // Update form defaults when modal opens for a specific store
  useEffect(() => {
    if (showWebsiteModal && selectedStore) {
      setWebsiteForm({
        domain: selectedStore.storeUrl,
        name: selectedStore.storeName,
        timezone: selectedStore.metadata?.timezone || 'UTC',
        currency: selectedStore.metadata?.currency || 'USD'
      });
    }
  }, [showWebsiteModal, selectedStore]);

  // Handle enabling/disabling traffic tracking for store
  const handleToggleTracking = async () => {
    if (!selectedStore) return;
    
    const isEnabled = selectedStore.metadata?.trafficTracking?.enabled;
    const action = isEnabled ? 'disable-tracking' : 'enable-tracking';
    
    setLoading(true);
    try {
      await trafficMutation({
        action,
        storeId: selectedStore.id,
        storeData: {
          settings: {
            timezone: websiteForm.timezone,
            currency: websiteForm.currency,
            goals: []
          }
        }
      });
      
      setShowWebsiteModal(false);
      setWebsiteForm({ domain: '', name: '', timezone: 'UTC', currency: 'USD' });
      await refetch();
    } catch (error) {
      console.error('Error toggling traffic tracking:', error);
      alert('Failed to update tracking settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (dataLoading && !dashboardData) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-[#1A1B3A] via-[#2A2153] to-[#1A1B3A] text-white flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-purple-400 mx-auto mb-4" />
            <p className="text-gray-300">Loading TrafficTrace data...</p>
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
            <p className="text-red-300 text-lg mb-2">Error loading TrafficTrace data</p>
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

  // Extract data with fallbacks
  const stores = dashboardData?.stores || [];
  const summary = dashboardData?.summary || {};
  const charts = dashboardData?.charts || {};
  const goals = dashboardData?.goals || [];
  const alerts = dashboardData?.alerts || [];
  const realTimeData = summary.realTime;

  // Dashboard view component
  const renderDashboard = () => {
    // Filter stores with tracking enabled for summary calculations
    const trackingEnabledStores = stores.filter((store: StoreConnection) => 
      store.metadata?.trafficTracking?.enabled === true
    );

    return (
      <div className="space-y-6">
        {/* Summary Cards - Only show when there are tracking-enabled stores */}
        {trackingEnabledStores.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Total Visitors</p>
                  <p className="text-3xl font-bold text-white">{(summary.totalVisitors || 0).toLocaleString()}</p>
                  <p className="text-xs text-green-400 mt-1">
                    +{Math.floor((summary.totalVisitors || 0) * 0.12)} this period
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-purple-600/30 to-purple-800/30 rounded-xl">
                  <Users className="h-8 w-8 text-purple-300" />
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Page Views</p>
                  <p className="text-3xl font-bold text-white">{(summary.totalPageViews || 0).toLocaleString()}</p>
                  <p className="text-xs text-blue-400 mt-1">
                    {summary.totalSessions > 0 ? ((summary.totalPageViews || 0) / summary.totalSessions).toFixed(1) : '0'} per session
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-600/30 to-blue-800/30 rounded-xl">
                  <Eye className="h-8 w-8 text-blue-300" />
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Bounce Rate</p>
                  <p className="text-3xl font-bold text-white">{(summary.avgBounceRate || 0).toFixed(1)}%</p>
                  <p className={`text-xs mt-1 ${
                    (summary.avgBounceRate || 0) < 40 ? 'text-green-400' : 
                    (summary.avgBounceRate || 0) < 60 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {(summary.avgBounceRate || 0) < 40 ? 'Excellent' : 
                     (summary.avgBounceRate || 0) < 60 ? 'Good' : 'Needs improvement'}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-orange-600/30 to-orange-800/30 rounded-xl">
                  <TrendingDown className="h-8 w-8 text-orange-300" />
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Avg. Session</p>
                  <p className="text-3xl font-bold text-white">
                    {Math.floor((summary.avgSessionDuration || 0) / 60)}:{String(Math.floor((summary.avgSessionDuration || 0) % 60)).padStart(2, '0')}
                  </p>
                  <p className="text-xs text-green-400 mt-1">
                    {summary.totalConversions || 0} conversions
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-green-600/30 to-green-800/30 rounded-xl">
                  <Clock className="h-8 w-8 text-green-300" />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Website Analytics - Show All Connected Stores */}
        <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-purple-300 flex items-center">
              <Globe className="h-5 w-5 mr-2" />
              Website Analytics
            </h2>
          </div>

          {stores.length === 0 ? (
            <div className="text-center py-12">
              <Globe className="h-16 w-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Stores Connected</h3>
              <p className="text-gray-400 mb-6">Connect your stores in Settings to start monitoring analytics</p>
              <Button
                onClick={() => window.location.href = '/dashboard/settings'}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Settings className="h-4 w-4 mr-2" />
                Go to Settings
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {stores.map((store: StoreConnection) => (
                <div key={store.id} className="bg-gradient-to-br from-purple-600/10 to-pink-600/10 rounded-lg p-4 border border-purple-400/20">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-white">{store.storeName}</h3>
                        <Button
                          onClick={() => {
                            setSelectedStore(store);
                            setShowWebsiteModal(true);
                          }}
                          className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                          size="sm"
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Tracking Settings
                        </Button>
                      </div>
                      <p className="text-gray-300 text-sm mb-3">{store.storeUrl}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Status:</span>
                          <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                            store.status === 'connected' ? 'bg-green-400/20 text-green-400' :
                            store.status === 'disconnected' ? 'bg-yellow-400/20 text-yellow-400' :
                            'bg-red-400/20 text-red-400'
                          }`}>
                            {store.status}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">Provider:</span>
                          <span className="text-white ml-2 capitalize">{store.provider}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Tracking:</span>
                          <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                            store.metadata?.trafficTracking?.enabled ? 'bg-green-400/20 text-green-400' : 'bg-red-400/20 text-red-400'
                          }`}>
                            {store.metadata?.trafficTracking?.enabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">Last Update:</span>
                          <span className="text-white ml-2 text-xs">
                            {store.metadata?.trafficTracking?.lastDataUpdate ? 
                              new Date(store.metadata.trafficTracking.lastDataUpdate).toLocaleDateString() : 'Never'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Real-time Data */}
        {realTimeData && (
          <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm shadow-2xl">
            <h2 className="text-xl font-semibold mb-6 text-purple-300 flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Real-Time Activity
              <span className="ml-2 flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-1"></div>
                <span className="text-sm text-green-400">Live</span>
              </span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">{realTimeData.activeUsers}</div>
                <div className="text-gray-400 text-sm">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">{realTimeData.currentPageViews}</div>
                <div className="text-gray-400 text-sm">Page Views (Last 30 min)</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-gray-400 mb-2">Top Active Pages</div>
                {realTimeData.topActivePages?.slice(0, 3).map((page: any, index: number) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-300 truncate">{page.path}</span>
                    <span className="text-white">{page.activeUsers}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Charts Row */}
        {charts.trafficTrend && charts.trafficTrend.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Traffic Trend */}
            <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm shadow-2xl">
              <h2 className="text-xl font-semibold mb-6 text-purple-300 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Traffic Trend
              </h2>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={charts.trafficTrend}>
                    <defs>
                      <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorPageViews" x1="0" y1="0" x2="0" y2="1">
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
                      dataKey="pageViews"
                      stroke="#10B981"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorPageViews)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Traffic Sources */}
            <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm shadow-2xl">
              <h2 className="text-xl font-semibold mb-6 text-purple-300 flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                Traffic Sources
              </h2>
              {charts.trafficSources && charts.trafficSources.length > 0 ? (
                <div className="h-[300px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={charts.trafficSources}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={8}
                        dataKey="visitors"
                      >
                        {charts.trafficSources.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={[
                            '#10B981', '#3B82F6', '#F59E0B', '#EC4899', '#8B5CF6', '#EF4444'
                          ][index % 6]} />
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
              ) : (
                <div className="h-[300px] flex items-center justify-center">
                  <div className="text-center">
                    <Globe className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">No traffic source data available</p>
                  </div>
                </div>
              )}
              {charts.trafficSources && charts.trafficSources.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {charts.trafficSources.slice(0, 6).map((item: any, index: number) => (
                    <div key={index} className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: [
                          '#10B981', '#3B82F6', '#F59E0B', '#EC4899', '#8B5CF6', '#EF4444'
                        ][index % 6] }}
                      />
                      <span className="text-xs text-gray-300 truncate">{item.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Device & Geographic Data */}
        {(charts.devices || charts.geographic) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Device Breakdown */}
            {charts.devices && charts.devices.length > 0 && (
              <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm shadow-2xl">
                <h2 className="text-xl font-semibold mb-6 text-purple-300 flex items-center">
                  <Smartphone className="h-5 w-5 mr-2" />
                  Device Breakdown
                </h2>
                <div className="space-y-4">
                  {charts.devices.map((device: any, index: number) => (
                    <div key={index} className="flex items-center justify-between bg-[#1E1B4B]/60 rounded-lg p-3">
                      <div className="flex items-center">
                        {device.device === 'Desktop' && <Monitor className="h-5 w-5 text-blue-400 mr-3" />}
                        {device.device === 'Mobile' && <Smartphone className="h-5 w-5 text-green-400 mr-3" />}
                        {device.device === 'Tablet' && <Tablet className="h-5 w-5 text-orange-400 mr-3" />}
                        <div>
                          <p className="text-white font-medium">{device.device}</p>
                          <p className="text-gray-400 text-sm">{device.visitors.toLocaleString()} visitors</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white text-lg font-semibold">{device.percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Geographic Data */}
            {charts.geographic && charts.geographic.length > 0 && (
              <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm shadow-2xl">
                <h2 className="text-xl font-semibold mb-6 text-purple-300 flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Top Countries
                </h2>
                <div className="space-y-4">
                  {charts.geographic.slice(0, 5).map((country: any, index: number) => (
                    <div key={index} className="flex items-center justify-between bg-[#1E1B4B]/60 rounded-lg p-3">
                      <div>
                        <p className="text-white font-medium">{country.country}</p>
                        <p className="text-gray-400 text-sm">{country.visitors.toLocaleString()} visitors</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white text-sm">{country.sessions.toLocaleString()} sessions</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Goals and Alerts */}
        {(goals.length > 0 || alerts.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Goals */}
            <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-purple-300 flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Conversion Goals
                </h2>
                <Button
                  onClick={() => setShowGoalModal(true)}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Goal
                </Button>
              </div>
              
              {goals.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No conversion goals set</p>
                  <p className="text-gray-500 text-sm mb-4">Track important actions on your website</p>
                  <Button
                    onClick={() => setShowGoalModal(true)}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Goal
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {goals.slice(0, 3).map((goal: TrafficGoal) => (
                    <div key={goal.id} className="bg-[#1E1B4B]/60 rounded-lg p-3 border border-[#3D3A6E]">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-white">{goal.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          goal.isActive ? 'bg-green-400/20 text-green-400' : 'bg-gray-400/20 text-gray-400'
                        }`}>
                          {goal.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Completions:</span>
                          <span className="text-white ml-1">{goal.completions}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Rate:</span>
                          <span className="text-white ml-1">{goal.conversionRate.toFixed(1)}%</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Value:</span>
                          <span className="text-white ml-1">${goal.totalValue.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Alerts */}
            <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-purple-300 flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Traffic Alerts
                </h2>
                <Button
                  onClick={() => setShowAlertModal(true)}
                  size="sm"
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Alert
                </Button>
              </div>
              
              {alerts.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No alerts configured</p>
                  <p className="text-gray-500 text-sm mb-4">Get notified about traffic changes</p>
                  <Button
                    onClick={() => setShowAlertModal(true)}
                    className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Alert
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {alerts.slice(0, 3).map((alert: TrafficAlert) => (
                    <div key={alert.id} className="bg-[#1E1B4B]/60 rounded-lg p-3 border border-[#3D3A6E]">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-white">{alert.name}</h3>
                        <div className="flex items-center gap-2">
                          {alert.isActive ? (
                            <Bell className="h-4 w-4 text-green-400" />
                          ) : (
                            <BellOff className="h-4 w-4 text-gray-400" />
                          )}
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            alert.isActive ? 'bg-green-400/20 text-green-400' : 'bg-gray-400/20 text-gray-400'
                          }`}>
                            {alert.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-300">
                        {alert.condition.metric} {alert.condition.operator} {alert.condition.value}
                        {alert.condition.period && ` per ${alert.condition.period}`}
                      </div>
                      {alert.lastTriggered && (
                        <div className="text-xs text-gray-400 mt-1">
                          Last triggered: {new Date(alert.lastTriggered).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    );
  };

  // Reports view component
  const renderReports = () => (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-[#2A2153]/90 to-[#2A2153]/70 border-[#3D3A6E] p-6 backdrop-blur-sm shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-purple-300 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Traffic Reports
          </h2>
          <div className="flex gap-3">
            <select
              className="bg-[#1E1B4B]/70 border border-[#3D3A6E] rounded-lg px-4 py-2 text-white backdrop-blur-sm"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
            <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Report Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#1E1B4B]/60 rounded-lg p-4 border border-[#3D3A6E]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Sessions</p>
                <p className="text-2xl font-bold text-white">{(summary.totalSessions || 0).toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-purple-400" />
            </div>
          </div>
          
          <div className="bg-[#1E1B4B]/60 rounded-lg p-4 border border-[#3D3A6E]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Unique Visitors</p>
                <p className="text-2xl font-bold text-white">{(summary.totalVisitors || 0).toLocaleString()}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-[#1E1B4B]/60 rounded-lg p-4 border border-[#3D3A6E]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Conversion Rate</p>
                <p className="text-2xl font-bold text-white">
                  {summary.totalSessions > 0 ? ((summary.totalConversions || 0) / summary.totalSessions * 100).toFixed(1) : '0'}%
                </p>
              </div>
              <Target className="h-8 w-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-[#1E1B4B]/60 rounded-lg p-4 border border-[#3D3A6E]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Revenue</p>
                <p className="text-2xl font-bold text-white">
                  ${((summary.totalConversions || 0) * 25).toLocaleString()}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-400" />
            </div>
          </div>
        </div>

        {/* Detailed Charts */}
        {charts.trafficTrend && charts.trafficTrend.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#1E1B4B]/60 rounded-lg p-4 border border-[#3D3A6E]">
              <h3 className="text-lg font-semibold text-white mb-4">Traffic Over Time</h3>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={charts.trafficTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3D3A6E" opacity={0.3} />
                    <XAxis dataKey="date" stroke="#A78BFA" fontSize={12} />
                    <YAxis stroke="#A78BFA" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(30, 27, 75, 0.95)',
                        borderColor: '#3D3A6E',
                        borderRadius: '12px',
                      }}
                    />
                    <Line type="monotone" dataKey="visitors" stroke="#8B5CF6" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-[#1E1B4B]/60 rounded-lg p-4 border border-[#3D3A6E]">
              <h3 className="text-lg font-semibold text-white mb-4">Conversion Funnel</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Visitors</span>
                  <span className="text-white font-semibold">{(summary.totalVisitors || 0).toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Sessions</span>
                  <span className="text-white font-semibold">{(summary.totalSessions || 0).toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Conversions</span>
                  <span className="text-white font-semibold">{(summary.totalConversions || 0).toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '12%' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );

  // Main component return
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-[#1A1B3A] via-[#2A2153] to-[#1A1B3A] text-white">
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                TrafficTrace
              </h1>
              <p className="text-gray-400 mt-2">Advanced website analytics and traffic monitoring</p>
            </div>
            
            <div className="flex items-center gap-4">
              <select
                className="bg-[#1E1B4B]/70 border border-[#3D3A6E] rounded-lg px-4 py-2 text-white backdrop-blur-sm"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
              
              <Button
                onClick={() => refetch()}
                disabled={dataLoading}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {dataLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Refresh
              </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 mb-8 bg-[#1E1B4B]/60 rounded-lg p-1 backdrop-blur-sm border border-[#3D3A6E]">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'reports', label: 'Reports', icon: Calendar },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id as any)}
                className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeView === tab.id
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-[#2A2153]/50'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          {activeView === 'dashboard' && renderDashboard()}
          {activeView === 'reports' && renderReports()}

          {/* Website Modal */}
          {showWebsiteModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-gradient-to-br from-[#2A2153] to-[#1E1B4B] rounded-xl p-6 w-full max-w-md border border-[#3D3A6E] shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">Traffic Tracking Settings</h3>
                  <Button
                    onClick={() => setShowWebsiteModal(false)}
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Selected Store
                    </label>
                    <div className="bg-[#1E1B4B]/70 border border-[#3D3A6E] rounded-lg px-3 py-2 text-white">
                      {selectedStore ? `${selectedStore.storeName} (${selectedStore.storeUrl})` : 'No store selected'}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Traffic Tracking Status
                    </label>
                    <div className="bg-[#1E1B4B]/70 border border-[#3D3A6E] rounded-lg px-3 py-2 text-white">
                      {selectedStore?.metadata?.trafficTracking?.enabled ? 'Enabled' : 'Not enabled'}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Timezone
                      </label>
                      <select
                        value={websiteForm.timezone}
                        onChange={(e) => setWebsiteForm({ ...websiteForm, timezone: e.target.value })}
                        className="w-full bg-[#1E1B4B]/70 border border-[#3D3A6E] rounded-lg px-3 py-2 text-white"
                      >
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">Eastern</option>
                        <option value="America/Chicago">Central</option>
                        <option value="America/Denver">Mountain</option>
                        <option value="America/Los_Angeles">Pacific</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Currency
                      </label>
                      <select
                        value={websiteForm.currency}
                        onChange={(e) => setWebsiteForm({ ...websiteForm, currency: e.target.value })}
                        className="w-full bg-[#1E1B4B]/70 border border-[#3D3A6E] rounded-lg px-3 py-2 text-white"
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="CAD">CAD</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={() => setShowWebsiteModal(false)}
                    variant="outline"
                    className="flex-1 border-[#3D3A6E] text-gray-300 hover:text-white"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleToggleTracking}
                    disabled={loading || !selectedStore}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    {selectedStore?.metadata?.trafficTracking?.enabled ? 'Disable Tracking' : 'Enable Tracking'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
} 