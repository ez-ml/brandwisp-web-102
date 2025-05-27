"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const data = [
  { name: "Content Richness", value: 72 },
  { name: "Remaining", value: 28 },
];

const COLORS = ["#22D3EE", "#1E1E24"]; // Cyan + dark

export default function ContentRichnessDonutChart() {
  const total = data.reduce((sum, entry) => sum + entry.value, 0);
  const richness = data[0].value;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          innerRadius={60}
          outerRadius={90}
          dataKey="value"
          startAngle={90}
          endAngle={-270}
          paddingAngle={2}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index]}
              stroke="#0B0B0E"
              strokeWidth={2}
            />
          ))}
        </Pie>

        {/* Center Label */}
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="22"
          fontWeight="bold"
          fill="#ffffff"
        >
          {richness}%
        </text>

        <Tooltip
          contentStyle={{
            backgroundColor: "#18181B",
            borderColor: "#333",
            color: "#fff",
          }}
        />

        <Legend
          verticalAlign="bottom"
          iconType="square"
          align="center"
          formatter={() => (
            <span style={{ color: "#E5E7EB", fontSize: "14px" }}>
              Content Richness
            </span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
