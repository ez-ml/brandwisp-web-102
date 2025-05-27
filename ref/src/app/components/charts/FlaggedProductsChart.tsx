"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

// Dummy daily data for flagged product counts
const dummyData = [
  { date: "2024-06-01", flagged: 22 },
  { date: "2024-06-02", flagged: 18 },
  { date: "2024-06-03", flagged: 15 },
  { date: "2024-06-04", flagged: 17 },
  { date: "2024-06-05", flagged: 12 },
  { date: "2024-06-06", flagged: 9 },
  { date: "2024-06-07", flagged: 11 },
];

export default function FlaggedProductsChart() {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={dummyData} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
        <XAxis dataKey="date" stroke="#aaa" tick={{ fontSize: 12 }} />
        <YAxis stroke="#aaa" />
        <Tooltip
          contentStyle={{ backgroundColor: "#18181B", borderColor: "#555", color: "white" }}
          labelStyle={{ color: "#ddd" }}
        />
        <Line
          type="monotone"
          dataKey="flagged"
          stroke="#f472b6" // pink-400
          strokeWidth={2}
          dot={{ r: 3, stroke: "#f472b6", strokeWidth: 1.5, fill: "#0B0B0E" }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
