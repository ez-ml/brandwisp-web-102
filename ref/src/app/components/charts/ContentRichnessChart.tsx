"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

// Weekly dummy data for content richness percentage
const dummyData = [
  { week: "Week 1", richness: 62 },
  { week: "Week 2", richness: 68 },
  { week: "Week 3", richness: 73 },
  { week: "Week 4", richness: 78 },
  { week: "Week 5", richness: 81 },
  { week: "Week 6", richness: 85 },
];

export default function ContentRichnessChart() {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={dummyData} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
        <XAxis dataKey="week" stroke="#aaa" tick={{ fontSize: 12 }} />
        <YAxis stroke="#aaa" domain={[0, 100]} tickFormatter={(tick) => `${tick}%`} />
        <Tooltip
          formatter={(value: number) => `${value}%`}
          contentStyle={{ backgroundColor: "#18181B", borderColor: "#555", color: "white" }}
          labelStyle={{ color: "#ddd" }}
        />
        <Area
          type="monotone"
          dataKey="richness"
          stroke="#06b6d4" // Tailwind cyan-400
          fill="#06b6d4"
          fillOpacity={0.25}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
