'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
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
import DashboardLayout from '../components/dashboard/DashboardLayout';

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

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user && !loading) router.push('//login');
  }, [user, loading, router]);

  if (loading || !user) return null;

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-8 text-[#1E293B]">Analytics Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'All Users', value: '10,234' },
          { label: 'Event Count', value: '536' },
          { label: 'Conversations', value: '21' },
          { label: 'New Users', value: '3,321' },
        ].map((stat, idx) => (
          <div
            key={idx}
            className="bg-white border border-[#E5E7EB] rounded-xl shadow-md p-4 text-center"
          >
            <p className="text-sm text-gray-500">{stat.label}</p>
            <h2 className="text-2xl font-bold text-[#4B0082]">{stat.value}</h2>
          </div>
        ))}
      </div>

      {/* Line Chart */}
      <div className="bg-white border border-[#E5E7EB] p-6 rounded-xl shadow-md mb-6">
        <h2 className="text-lg font-semibold mb-4 text-[#1E293B]">Reports Snapshot</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={lineData}>
            <XAxis dataKey="month" stroke="#4B0082" />
            <YAxis stroke="#4B0082" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#F3E8FF',
                borderColor: '#C4B5FD',
                color: '#1E293B'
              }}
            />
            <Line type="monotone" dataKey="value" stroke="#8B5CF6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bar and Pie Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-[#E5E7EB] p-6 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold mb-4 text-[#1E293B]">Users by Country</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData}>
              <XAxis dataKey="name" stroke="#4B0082" />
              <YAxis stroke="#4B0082" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#F3E8FF',
                  borderColor: '#C4B5FD',
                  color: '#1E293B'
                }}
              />
              <Bar dataKey="users" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-[#E5E7EB] p-6 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold mb-4 text-[#1E293B]">Device Breakdown</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                outerRadius={80}
                fill="#8B5CF6"
                label
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#F3E8FF',
                  borderColor: '#C4B5FD',
                  color: '#1E293B'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardLayout>
  );
}
