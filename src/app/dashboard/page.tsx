"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/card';
import {
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Users,
  DollarSign,
  Package,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight,
  Zap,
  Eye,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const lineData = [
  { month: 'Jan', value: 400 },
  { month: 'Feb', value: 300 },
  { month: 'Mar', value: 200 },
  { month: 'Apr', value: 278 },
  { month: 'May', value: 189 },
  { month: 'Jun', value: 239 },
  { month: 'Jul', value: 349 }
];

const barData = [
  { name: 'USA', users: 400 },
  { name: 'UK', users: 300 },
  { name: 'Canada', users: 200 },
  { name: 'Germany', users: 278 },
  { name: 'India', users: 189 }
];

const pieData = [
  { name: 'Mobile', value: 400 },
  { name: 'Desktop', value: 300 },
  { name: 'Tablet', value: 300 }
];

const COLORS = ['#8B5CF6', '#A78BFA', '#C4B5FD'];

// Mock data - Replace with real API calls
const storeStats = {
  totalStores: 5,
  activeStores: 4,
  totalProducts: 1250,
  totalRevenue: 125000,
  monthlyGrowth: 15.8,
  averageOrderValue: 85,
  customerCount: 2800,
};

const productHealth = {
  optimizedProducts: 850,
  needsAttention: 125,
  outOfStock: 45,
  lowInventory: 78,
};

const aiInsights = {
  blogPostsGenerated: 24,
  productIdeasEvaluated: 156,
  imagesTagged: 890,
  supportQueries: 450,
};

export default function DashboardHomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [timeframe, setTimeframe] = useState('7d');

  if (loading || !user) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
            <p className="text-purple-200/70">Your e-commerce ecosystem at a glance</p>
          </div>
          <div className="flex gap-2">
            {['24h', '7d', '30d', '90d'].map((period) => (
              <Button
                key={period}
                variant={timeframe === period ? 'default' : 'outline'}
                className={timeframe === period ? 'bg-purple-600' : 'border-purple-500/20 text-purple-200'}
                onClick={() => setTimeframe(period)}
              >
                {period}
              </Button>
            ))}
          </div>
        </div>

        {/* Store Performance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-[#2D2A5E] border-purple-500/20 p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-purple-200/70">Total Revenue</p>
                <h3 className="text-2xl font-bold text-white">${storeStats.totalRevenue.toLocaleString()}</h3>
                <p className="text-green-400 flex items-center text-sm mt-1">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +{storeStats.monthlyGrowth}%
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-400" />
            </div>
          </Card>

          <Card className="bg-[#2D2A5E] border-purple-500/20 p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-purple-200/70">Active Stores</p>
                <h3 className="text-2xl font-bold text-white">{storeStats.activeStores}/{storeStats.totalStores}</h3>
                <p className="text-purple-200/50 text-sm mt-1">Stores Connected</p>
              </div>
              <ShoppingBag className="h-8 w-8 text-purple-400" />
            </div>
          </Card>

          <Card className="bg-[#2D2A5E] border-purple-500/20 p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-purple-200/70">Total Products</p>
                <h3 className="text-2xl font-bold text-white">{storeStats.totalProducts}</h3>
                <p className="text-purple-200/50 text-sm mt-1">Across All Stores</p>
              </div>
              <Package className="h-8 w-8 text-purple-400" />
            </div>
          </Card>

          <Card className="bg-[#2D2A5E] border-purple-500/20 p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-purple-200/70">Total Customers</p>
                <h3 className="text-2xl font-bold text-white">{storeStats.customerCount}</h3>
                <p className="text-purple-200/50 text-sm mt-1">Unique Buyers</p>
              </div>
              <Users className="h-8 w-8 text-purple-400" />
            </div>
          </Card>
        </div>

        {/* Product Health Overview */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Product Health</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/dashboard/productpulse" className="block">
              <Card className="bg-[#2D2A5E] border-purple-500/20 p-6 hover:bg-[#353167] transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <CheckCircle2 className="h-6 w-6 text-green-400" />
                  <ArrowUpRight className="h-5 w-5 text-purple-400" />
                </div>
                <p className="text-purple-200/70">Optimized Products</p>
                <h3 className="text-2xl font-bold text-white">{productHealth.optimizedProducts}</h3>
                <div className="mt-2 bg-purple-500/20 rounded-full h-2">
                  <div className="bg-green-400 h-2 rounded-full" style={{ width: '70%' }}></div>
                </div>
              </Card>
            </Link>

            <Link href="/dashboard/productpulse" className="block">
              <Card className="bg-[#2D2A5E] border-purple-500/20 p-6 hover:bg-[#353167] transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <AlertCircle className="h-6 w-6 text-yellow-400" />
                  <ArrowUpRight className="h-5 w-5 text-purple-400" />
                </div>
                <p className="text-purple-200/70">Needs Attention</p>
                <h3 className="text-2xl font-bold text-white">{productHealth.needsAttention}</h3>
                <div className="mt-2 bg-purple-500/20 rounded-full h-2">
                  <div className="bg-yellow-400 h-2 rounded-full" style={{ width: '30%' }}></div>
                </div>
              </Card>
            </Link>

            <Link href="/dashboard/productpulse" className="block">
              <Card className="bg-[#2D2A5E] border-purple-500/20 p-6 hover:bg-[#353167] transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <Package className="h-6 w-6 text-red-400" />
                  <ArrowUpRight className="h-5 w-5 text-purple-400" />
                </div>
                <p className="text-purple-200/70">Out of Stock</p>
                <h3 className="text-2xl font-bold text-white">{productHealth.outOfStock}</h3>
                <div className="mt-2 bg-purple-500/20 rounded-full h-2">
                  <div className="bg-red-400 h-2 rounded-full" style={{ width: '15%' }}></div>
                </div>
              </Card>
            </Link>

            <Link href="/dashboard/productpulse" className="block">
              <Card className="bg-[#2D2A5E] border-purple-500/20 p-6 hover:bg-[#353167] transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <AlertCircle className="h-6 w-6 text-orange-400" />
                  <ArrowUpRight className="h-5 w-5 text-purple-400" />
                </div>
                <p className="text-purple-200/70">Low Inventory</p>
                <h3 className="text-2xl font-bold text-white">{productHealth.lowInventory}</h3>
                <div className="mt-2 bg-purple-500/20 rounded-full h-2">
                  <div className="bg-orange-400 h-2 rounded-full" style={{ width: '25%' }}></div>
                </div>
              </Card>
            </Link>
          </div>
        </div>

        {/* AI Tools Performance */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">AI Tools Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/dashboard/autobloggen" className="block">
              <Card className="bg-[#2D2A5E] border-purple-500/20 p-6 hover:bg-[#353167] transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <Zap className="h-6 w-6 text-yellow-400" />
                  <ArrowUpRight className="h-5 w-5 text-purple-400" />
                </div>
                <p className="text-purple-200/70">Blog Posts Generated</p>
                <h3 className="text-2xl font-bold text-white">{aiInsights.blogPostsGenerated}</h3>
                <p className="text-purple-200/50 text-sm mt-2">Last 30 days</p>
              </Card>
            </Link>

            <Link href="/dashboard/productideagenie" className="block">
              <Card className="bg-[#2D2A5E] border-purple-500/20 p-6 hover:bg-[#353167] transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp className="h-6 w-6 text-green-400" />
                  <ArrowUpRight className="h-5 w-5 text-purple-400" />
                </div>
                <p className="text-purple-200/70">Product Ideas Evaluated</p>
                <h3 className="text-2xl font-bold text-white">{aiInsights.productIdeasEvaluated}</h3>
                <p className="text-purple-200/50 text-sm mt-2">Last 30 days</p>
              </Card>
            </Link>

            <Link href="/dashboard/visiontagger" className="block">
              <Card className="bg-[#2D2A5E] border-purple-500/20 p-6 hover:bg-[#353167] transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <Eye className="h-6 w-6 text-blue-400" />
                  <ArrowUpRight className="h-5 w-5 text-purple-400" />
                </div>
                <p className="text-purple-200/70">Images Tagged</p>
                <h3 className="text-2xl font-bold text-white">{aiInsights.imagesTagged}</h3>
                <p className="text-purple-200/50 text-sm mt-2">Total Tagged</p>
              </Card>
            </Link>

            <Link href="/dashboard/chatgenie" className="block">
              <Card className="bg-[#2D2A5E] border-purple-500/20 p-6 hover:bg-[#353167] transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <MessageSquare className="h-6 w-6 text-purple-400" />
                  <ArrowUpRight className="h-5 w-5 text-purple-400" />
                </div>
                <p className="text-purple-200/70">Support Queries</p>
                <h3 className="text-2xl font-bold text-white">{aiInsights.supportQueries}</h3>
                <p className="text-purple-200/50 text-sm mt-2">Auto-Resolved</p>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 