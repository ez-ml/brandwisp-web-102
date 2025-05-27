"use client";

import { ArrowUpRight } from "lucide-react";

export default function FlaggedProductsStatCard() {
  const flaggedCount = 12;
  const trend = "up"; // could be 'up' or 'down' for future use
  const trendColor = trend === "up" ? "text-cyan-400" : "text-red-400";

  return (
    <div className="bg-[#18181B] rounded-xl p-4 shadow-md w-full h-full flex flex-col justify-between">
      <h3 className="text-sm font-medium text-white mb-2">Flagged Products</h3>
      <div className="flex items-center justify-start space-x-2">
        <span className="text-4xl font-bold text-white">{flaggedCount}</span>
        <ArrowUpRight className={`w-5 h-5 ${trendColor}`} />
      </div>
    </div>
  );
}
