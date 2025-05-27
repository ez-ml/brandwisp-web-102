'use client';

import { useState } from 'react';
import ProductHealth from '../../components/productpulse/ProductHealth';
import StoreHealth from '../../components/productpulse/StoreHealth';
import Layout from '../../components/dashboard/DashboardLayout';

export default function ProductPulseOverviewPage() {
  const [activeTab, setActiveTab] = useState<'store' | 'product'>('store');

  const renderActiveTab = () => {
    return activeTab === 'store' ? <StoreHealth /> : <ProductHealth />;
  };

  const getHeaderTitle = () => {
    return activeTab === 'store' ? '🏬 Store Health' : '🩺 Product Health';
  };

  const getDescription = () => {
    return activeTab === 'store'
      ? 'Analyze the overall store performance and SEO metrics across your product catalog. Fix systemic issues and track improvement over time.'
      : 'Diagnose and optimize individual products to boost visibility, engagement, and conversions. Let BrandWisp act as your AI doctor.';
  };

  return (
    <Layout>
      <div className="bg-[#1E1B4B] min-h-screen text-white px-6 py-10 rounded-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-stretch">
          {/* Info Panel */}
          <div className="col-span-1 bg-[#2A2153] rounded-2xl p-6 shadow-lg flex flex-col justify-between min-h-[90vh]">
            <div>
              <h1 className="text-4xl font-bold mb-4 text-white">{getHeaderTitle()}</h1>
              <p className="text-white/80 text-sm mb-6">{getDescription()}</p>

              {/* Tab Buttons */}
              <div className="flex flex-col space-y-4">
                <button
                  className={`px-6 py-2 rounded-full font-medium text-sm transition-all shadow-md ${
                    activeTab === 'store'
                      ? 'bg-[#7C3AED] text-white'
                      : 'bg-[#1F1A3F] text-white/80 hover:bg-[#312E81]'
                  }`}
                  onClick={() => setActiveTab('store')}
                >
                  🏬 Store Health
                </button>

                <button
                  className={`px-6 py-2 rounded-full font-medium text-sm transition-all shadow-md ${
                    activeTab === 'product'
                      ? 'bg-[#7C3AED] text-white'
                      : 'bg-[#1F1A3F] text-white/80 hover:bg-[#312E81]'
                  }`}
                  onClick={() => setActiveTab('product')}
                >
                  🩺 Product Health
                </button>
              </div>
            </div>

            {/* Doctor Image Placeholder */}
            <div className="mt-10 w-full">
              
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-2 space-y-6 flex flex-col">{renderActiveTab()}</div>
        </div>
      </div>
    </Layout>
  );
}
