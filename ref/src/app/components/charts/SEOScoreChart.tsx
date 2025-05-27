// components/charts/SEOScoreChart.tsx
"use client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { date: '2024-05-01', score: 62 },
  { date: '2024-05-08', score: 67 },
  { date: '2024-05-15', score: 73 },
  { date: '2024-05-22', score: 78 },
  { date: '2024-05-29', score: 81 },
];

export default function SEOScoreChart() {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
        <XAxis dataKey="date" stroke="#ccc" />
        <YAxis stroke="#ccc" />
        <Tooltip />
        <Line type="monotone" dataKey="score" stroke="#3B82F6" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
