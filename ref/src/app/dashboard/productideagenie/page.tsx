"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import DashboardLayout from '../../components/dashboard/DashboardLayout';

const genieImg = '/images/genie.png';

const getColorForLevel = (level: string) => {
  switch (level?.toLowerCase()) {
    case 'high':
      return 'bg-green-600 text-white';
    case 'medium':
      return 'bg-yellow-400 text-black';
    case 'low':
      return 'bg-red-500 text-white';
    default:
      return 'bg-gray-500 text-white';
  }
};

export default function ProductIdeaGeniePage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [summaryVisible, setSummaryVisible] = useState(false);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (file: File | null) => {
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else setImagePreview(null);
  };

  const handleAnalyze = async () => {
    if (!imageFile) return;
    setIsLoading(true);
    setSummaryVisible(false);
    const formData = new FormData();
    formData.append('file', imageFile);

    try {
      const response = await fetch('/api/analyze-image', { method: 'POST', body: formData });
      const data = await response.json();
      setSummaryData(data);
      setSummaryVisible(true);
    } catch (error) {
      console.error('Image upload failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#1E1B4B] text-white px-8 py-10">
        <h1 className="text-4xl font-bold mb-8 text-white">🧞 Product Idea Genie</h1>
        <p>&nbsp;</p>
        <p>&nbsp;</p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* Left Panel */}
          <div className="bg-[#141226] rounded-2xl p-8 shadow-lg relative">

             {/* Step Buttons */}


             <div className="absolute -top-20 left-1/7 transform -translate-x-1/2 z-10">
  {/* Glowing gradient background */}
  <div className="absolute inset-0 w-[230px] h-[230px] rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-600 opacity-30 blur-2xl animate-pulse -z-10"></div>

  {/* Genie Image */}
  <Image
    src={genieImg}
    width={230}
    height={230}
    alt="Genie"
    className="relative z-10 drop-shadow-[0_0_25px_rgba(147,51,234,0.8)]"
  />
</div>


            <div className="mt-20">
              <h1 className="text-2xl font-semibold text-center mb-6">Upload Your Product Image</h1>

              <h1 className="text-xl font-semibold text-center mb-6">Let our AI Genie evluate your product's market potentials</h1>

              
              <div className="absolute left-1/2 transform -translate-x-1/2 z-20 flex gap-6">
  {[
    { step: '1', label: 'Choose Image' },
    { step: '2', label: 'Click Analyze' },
    { step: '3', label: 'View Insights' },
  ].map((item, idx) => (
    <div key={idx} className="flex flex-col items-center">
      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#2A2153] border border-purple-600 text-white font-bold text-20m shadow-md">
        {item.step}
      </div>
      <div className="mt-1 text-xs text-white font-semibold whitespace-nowrap text-center">{item.label}</div>
    </div>
  ))}
</div>
 <p>&nbsp;</p> <p>&nbsp;</p> <p>&nbsp;</p> <p>&nbsp;</p>
                
               <label className="block w-full bg-[#25223A] hover:bg-[#2F2B4A] text-white px-5 py-3 rounded-md cursor-pointer text-center transition font-bold">
  Choose Image
  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} />
</label>

              {imagePreview && (
                <div className="mt-6">
                  <p className="text-xs text-gray-400 mb-2">Preview:</p>
                  <img src={imagePreview} alt="Selected" className="w-full max-h-72 object-contain rounded-md border border-gray-600" />
                </div>
              )}

              <button
                onClick={handleAnalyze}
                className="mt-6 w-full bg-purple-700 hover:bg-purple-800 text-white px-6 py-3 rounded-md font-semibold transition"
                disabled={isLoading}
              >
                {isLoading ? 'Analyzing...' : 'Analyze'}
              </button>

              {isLoading && (
                <div className="mt-4 w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-purple-500 h-2.5 animate-pulse rounded-full w-2/3"></div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel */}
          {!summaryVisible ? (
            <div className="bg-[#18162F] p-8 rounded-2xl shadow-lg border border-purple-700/40">
              <h2 className="text-3xl font-bold mb-6 text-white text-center">How Product Idea Genie Works</h2>
              <p className="text-2xl text-white/80 text-center mb-10">
                Upload a product photo or idea sketch and let BrandWisp AI work its magic!
              </p>
              <ul className="text-xl space-y-2 text-sm text-white/70 px-4">
                <li>✓ Extracts key product details</li>
                <li>✓ Evaluates SEO & metadata completeness</li>
                <li>✓ Detects market saturation vs opportunity</li>
                <li>✓ Suggests next steps for product launch</li>
                <li>✓ Benchmarks against top-selling competitors</li>
                <li>✓ Scores product potential using trend, niche, and visual appeal signals</li>
              </ul>
            </div>
          ) : (
            <div className="bg-[#18162F] p-8 rounded-2xl shadow-lg border border-purple-700/40">
              <h2 className="text-2xl font-bold mb-6 text-white text-center">Analysis</h2>

              <div className="space-y-4 mb-6">
                {['Trend Signal', 'Searchability Index', 'Visual Appeal', 'Competitive Niche'].map((label, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-15m font-large text-white/80">{label}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getColorForLevel(summaryData[label.toLowerCase().replace(/ /g, '_')])}`}>
                      {summaryData[label.toLowerCase().replace(/ /g, '_')]}
                      
                    </span>
                  
                  </div>
                  
                ))}
              </div>
                <p>&nbsp;</p>
              <h3 className="text-lg font-semibold text-white mb-2">Market Summary</h3>
              <p className="bg-[#1F1A3F] text-10m text-white/80 p-4 rounded-md border border-gray-700 whitespace-pre-wrap">
                {summaryData.summary}
              </p>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md font-medium">Add to ProductPulse</button>
                <button className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md font-medium">Generate Blog</button>
                <button className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md font-medium">Create Listing</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
