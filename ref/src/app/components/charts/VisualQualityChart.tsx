"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from "recharts";

// Sample stacked data for visual quality breakdown
const dummyData = [
  { date: "Jan", withAltText: 50, withProperImages: 28 },
  { date: "Feb", withAltText: 55, withProperImages: 27 },
  { date: "Mar", withAltText: 52, withProperImages: 27 },
  { date: "Apr", withAltText: 60, withProperImages: 25 },
  { date: "May", withAltText: 63, withProperImages: 25 },
  { date: "Jun", withAltText: 65, withProperImages: 25 },
];

export default function VisualQualityChart() {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={dummyData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
        <XAxis dataKey="date" stroke="#aaa" />
        <YAxis stroke="#aaa" />
        <Tooltip
          contentStyle={{ backgroundColor: '#18181B', borderColor: '#555', color: 'white' }}
          cursor={{ fill: '#1f2937' }}
        />
        <Legend />
        <Bar dataKey="withAltText" stackId="a" fill="#4ade80" name="Alt Text Present" />
        <Bar dataKey="withProperImages" stackId="a" fill="#38bdf8" name="Proper Images" />
      </BarChart>
    </ResponsiveContainer>
  );
}
