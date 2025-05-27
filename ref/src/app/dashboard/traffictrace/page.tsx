"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  Sankey, LabelList
} from 'recharts';

export default function TrafficTracePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [trafficSources, setTrafficSources] = useState([]);
  const [topPages, setTopPages] = useState([]);
  const [utmBreakdown, setUtmBreakdown] = useState([]);

  useEffect(() => {
    if (!user && !loading) router.push('//login');
  }, [user, loading, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/bigquery/traffictrace');
        const data = await res.json();
        setTrafficSources(data.trafficSources || []);
        setTopPages(data.topPages || []);
        setUtmBreakdown(data.utmBreakdown || []);
      } catch (error) {
        console.error('Failed to load traffic trace data:', error);
      }
    };

    fetchData();
  }, []);

  if (loading || !user) return null;

  const COLORS = ['#8B5CF6', '#22D3EE', '#F59E0B', '#10B981', '#EF4444'];



   const totalSessions = utmBreakdown.reduce((sum, r) => sum + (r.sessions || 0), 0);
   const totalConversions = utmBreakdown.reduce((sum, r) => sum + (r.conversions || 0), 0);


  const conversionRate = totalSessions
  ? `${((totalConversions / totalSessions) * 100).toFixed(2)}%`
  : '0.0%';
 

  const sankeyData = {
    nodes: [
      { name: 'Page View' },
      { name: 'Add to Cart' },
      { name: 'Checkout' },
      { name: 'Conversions' },
    ],
    links: [
      { source: 0, target: 1, value: 400 },
      { source: 1, target: 2, value: 300 },
      { source: 2, target: 3, value: 180 },
    ],
  };

  return (
    <DashboardLayout>
      <section className="max-w-7xl mx-auto py-10 px-4 text-white">
        <h1 className="text-3xl font-bold mb-6">TrafficTrace — Know What Drives Conversions</h1>
        <p className="text-white/70 mb-10">Visualize where your users come from, how they navigate, and what drives conversions.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="flex flex-col gap-8">
            {/* Pie Chart */}
            <div className="bg-[#1E1B4B] rounded-2xl p-6 shadow-2xl">
              <h2 className="text-lg font-semibold mb-4">Traffic Sources</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={trafficSources}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  >
                    {trafficSources.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Top Pages */}
            <div className="bg-[#1E1B4B] rounded-2xl p-6 shadow-2xl">
              <h2 className="text-lg font-semibold mb-4">Top Pages Before Conversion</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topPages} layout="vertical">
                  <XAxis type="number" stroke="#fff" />
                  <YAxis type="category" dataKey="page" stroke="#fff" />
                  <Tooltip />
                  <Bar dataKey="views" fill="#8B5CF6">
                    <LabelList dataKey="views" position="right" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-8">
            {/* KPI Panels */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-[#2A2153] p-6 rounded-2xl shadow-2xl text-center">
                <p className="text-sm text-purple-300 mb-1">% Conversion Rate</p>
                <p className="text-3xl font-bold text-white">{conversionRate}</p>
              </div>
              <div className="bg-[#2A2153] p-6 rounded-2xl shadow-2xl text-center">
                <p className="text-sm text-purple-300 mb-1">Total Conversions</p>
                <p className="text-3xl font-bold text-white">{totalConversions}</p>
              </div>
            </div>

            {/* Sankey Chart */}
            <div className="bg-[#1E1B4B] rounded-2xl p-6 shadow-2xl">
              <h2 className="text-lg font-semibold mb-4">Conversion Flow</h2>
              <ResponsiveContainer width="100%" height={300}>
                <Sankey
                  width={730}
                  height={300}
                  data={sankeyData}
                  nodePadding={50}
                  nodeWidth={15}
                  linkCurvature={0.5}
                  node={({ x, y, width, height, index }) => {
                    const name = sankeyData.nodes[index].name;
                    return (
                      <>
                        <rect x={x} y={y} width={width} height={height} fill="#8B5CF6" stroke="#fff" />
                        <text x={x + width + 6} y={y + height / 2} fill="#fff" fontSize={12} alignmentBaseline="middle">
                          {name}
                        </text>
                      </>
                    );
                  }}
                  link={{ stroke: '#8B5CF6', strokeOpacity: 0.4 }}
                >
                  <Tooltip />
                </Sankey>
              </ResponsiveContainer>
            </div>

            {/* UTM Breakdown */}
            <div className="bg-[#1E1B4B] rounded-2xl p-6 shadow-2xl">
              <h2 className="text-lg font-semibold mb-4">UTM Breakdown</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left text-white">
                  <thead className="bg-[#2A2153]">
                    <tr>
                      <th className="px-4 py-2">Source</th>
                      <th className="px-4 py-2">Medium</th>
                      <th className="px-4 py-2">Campaign</th>
                      <th className="px-4 py-2">Sessions</th>
                      <th className="px-4 py-2">Conversions</th>
                      <th className="px-4 py-2">Conversion Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {utmBreakdown.map((row, idx) => (
                      <tr key={idx} className="border-t border-gray-600">
                        <td className="px-4 py-2">{row.source}</td>
                        <td className="px-4 py-2">{row.medium}</td>
                        <td className="px-4 py-2">{row.campaign}</td>
                        <td className="px-4 py-2">{row.sessions}</td>
                        <td className="px-4 py-2">{row.conversions}</td>
                        <td className="px-4 py-2">{row.conversion_rate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}
