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

// Dummy daily data for metadata completeness (in percentage)
const dummyData = [
  { date: "2024-06-01", completeness: 76 },
  { date: "2024-06-02", completeness: 78 },
  { date: "2024-06-03", completeness: 81 },
  { date: "2024-06-04", completeness: 84 },
  { date: "2024-06-05", completeness: 87 },
  { date: "2024-06-06", completeness: 89 },
  { date: "2024-06-07", completeness: 91 },
];

export default function MetadataCompletenessChart() {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={dummyData} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
        <XAxis dataKey="date" stroke="#aaa" tick={{ fontSize: 12 }} />
        <YAxis stroke="#aaa" domain={[0, 100]} tickFormatter={(tick) => `${tick}%`} />
        <Tooltip
          formatter={(value: number) => `${value}%`}
          contentStyle={{ backgroundColor: "#18181B", borderColor: "#555", color: "white" }}
          labelStyle={{ color: "#ddd" }}
        />
        <Line
          type="monotone"
          dataKey="completeness"
          stroke="#14b8a6" // Tailwind teal-400
          strokeWidth={2}
          dot={{ r: 3, stroke: "#14b8a6", strokeWidth: 1.5, fill: "#0B0B0E" }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
