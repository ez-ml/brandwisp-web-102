'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const ContentRichnessDonutChart = dynamic(() => import('../charts/ContentRichnessDonutChart'), { ssr: false });
const FlaggedProductsChart = dynamic(() => import('../charts/FlaggedProductsChart'), { ssr: false });
const MetadataCompletenessChart = dynamic(() => import('../charts/MetadataCompletenessChart'), { ssr: false });
const SEOScoreChart = dynamic(() => import('../charts/SEOScoreChart'), { ssr: false });

export default function UserMetrics() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">User-Level Metrics Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#18181B] p-6 rounded-xl shadow-md">
          <h3 className="text-md font-semibold mb-3 text-gray-300">Total Connected Stores</h3>
          <ContentRichnessDonutChart />
        </div>

        <div className="bg-[#18181B] p-6 rounded-xl shadow-md">
          <h3 className="text-md font-semibold mb-3 text-gray-300">Total Flagged Products (All Stores)</h3>
          <FlaggedProductsChart />
        </div>

        <div className="bg-[#18181B] p-6 rounded-xl shadow-md">
          <h3 className="text-md font-semibold mb-3 text-gray-300">Average Store Quality</h3>
          <MetadataCompletenessChart />
        </div>

        <div className="bg-[#18181B] p-6 rounded-xl shadow-md">
          <h3 className="text-md font-semibold mb-3 text-gray-300">SEO Performance Across All Stores</h3>
          <SEOScoreChart />
        </div>
      </div>
    </div>
  );
}
