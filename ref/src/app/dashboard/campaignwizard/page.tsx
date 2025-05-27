"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import DashboardLayout from '../../components/dashboard/DashboardLayout';

const genieImg = '/images/genie.png';

export default function CampaignWizardPage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [adVideoUrl, setAdVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (file: File | null) => {
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleGenerate = async () => {
    if (!imageFile) return;
    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', imageFile);

    try {
      const response = await fetch('/api/generate-ad', { method: 'POST', body: formData });
      const data = await response.json();
      setAdVideoUrl(data.videoUrl); // assuming backend returns a video URL
    } catch (error) {
      console.error('Ad generation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#1E1B4B] text-white px-8 py-10">
        <h1 className="text-4xl font-bold mb-8 text-white">🎯 Campaign Wizard</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* Left Panel */}
          <div className="bg-[#141226] rounded-2xl p-8 shadow-lg relative">
            <div className="absolute -top-20 left-1/7 transform -translate-x-1/2 z-10">
              <div className="absolute inset-0 w-[230px] h-[230px] rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-600 opacity-30 blur-2xl animate-pulse -z-10"></div>
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
              <h1 className="text-xl font-semibold text-center mb-6">Let CampaignWizard generate stunning ad creatives</h1>

              <div className="absolute left-1/2 transform -translate-x-1/2 z-20 flex gap-6">
                {[
                  { step: '1', label: 'Choose Image' },
                  { step: '2', label: 'Click Generate Ad' },
                  { step: '3', label: 'Watch Ad' },
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#2A2153] border border-purple-600 text-white font-bold text-20m shadow-md">
                      {item.step}
                    </div>
                    <div className="mt-1 text-xs text-white font-semibold whitespace-nowrap text-center">{item.label}</div>
                  </div>
                ))}
              </div>

              <p>&nbsp;</p><p>&nbsp;</p><p>&nbsp;</p>

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
                onClick={handleGenerate}
                className="mt-6 w-full bg-purple-700 hover:bg-purple-800 text-white px-6 py-3 rounded-md font-semibold transition"
                disabled={isLoading}
              >
                {isLoading ? 'Generating Ad...' : 'Generate Ad'}
              </button>

              {isLoading && (
                <div className="mt-4 w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-purple-500 h-2.5 animate-pulse rounded-full w-2/3"></div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel */}
          <div className="bg-[#18162F] p-8 rounded-2xl shadow-lg border border-purple-700/40 min-h-[400px] flex flex-col justify-center items-center">
            {adVideoUrl ? (
              <>
                <h2 className="text-2xl font-bold mb-6 text-white text-center">🎥 Generated Advertisement</h2>
                <video controls className="rounded-lg shadow-md max-w-full max-h-[300px]">
                  <source src={adVideoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-6 text-white text-center">Ad Preview Will Appear Here</h2>
                <p className="text-white/60 text-center">Upload an image and click Generate Ad to view your custom video ad.</p>
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
