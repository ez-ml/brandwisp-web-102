"use client";

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import SiteHeader from "../../components/SiteHeader";

export default function ProductPulsePage() {
  const steps = [
    {
      step: "1",
      title: "Product SEO Scoring",
      description: "Evaluate your entire catalog’s search-readiness at a glance.",
      content: {
        heading: "SEO Health at Scale",
        text: "ProductPulse analyzes SEO strength across your catalog using a proprietary scoring model. It highlights products with missing metadata, low scores, and offers prescriptive fixes — all to ensure better visibility across search engines.",
        image: "/images/seo_score_insight.png"
      }
    },
    {
      step: "2",
      title: "Click & Conversion Metrics",
      description: "Track real customer behavior with SKU-level engagement insights.",
      content: {
        heading: "CTR and CVR Insights by Product",
        text: "Understand how users interact with each product listing. ProductPulse maps impressions, clicks, and conversions per SKU — helping you pinpoint what’s driving sales and what needs attention.",
        image: "/images/ctr_cvr_insight.png"
      }
    },
    {
      step: "3",
      title: "User Engagement Intelligence",
      description: "Discover how your team uses ProductPulse to improve listings.",
      content: {
        heading: "Behavior & Optimization Analytics",
        text: "Track which users trigger the most fixes, spend time in dashboards, resolve alerts, and generate reports. These insights help optimize internal adoption and guide support or training efforts.",
        image: "/images/user_engagement_insight.png"
      }
    }
  ];

  const [activeStep, setActiveStep] = useState(0);

  return (
    <div className="bg-white w-screen h-screen flex justify-center items-center">
      <div className="w-[98%] h-[98%] bg-[#2A203A] backdrop-blur-sm rounded-[2rem] shadow-xl flex justify-center items-center">
        <div className="w-[96%] h-[96%] bg-[#1F182B] rounded-[2rem] shadow-2xl overflow-hidden p-6 md:p-10 text-white flex flex-col justify-between">
          <main className="flex-grow">
            <SiteHeader />

            <section className="max-w-7xl mx-auto pt-12 pb-16 px-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Chart Display */}
              <div className="lg:col-span-2 bg-[#18181B] p-8 rounded-2xl shadow-xl border border-gray-700">
                <h2 className="text-3xl font-bold mb-4">{steps[activeStep].content.heading}</h2>
                <p className="text-md text-gray-300 mb-6 max-w-2xl">{steps[activeStep].content.text}</p>
                <div className="mx-auto w-auto max-w-full">
                  <Image
                    src={steps[activeStep].content.image}
                    alt={steps[activeStep].title}
                    className="object-contain rounded-xl shadow-xl w-full h-auto"
                    width={0}
                    height={0}
                    sizes="100vw"
                  />
                </div>
              </div>

              {/* Sidebar Steps */}
              <div className="bg-white/5 backdrop-blur-md border border-purple-700/30 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
                <div className="space-y-6">
                  {steps.map((item, index) => (
                    <div
                      key={index}
                      onClick={() => setActiveStep(index)}
                      className={`cursor-pointer p-4 rounded-xl transition-all duration-300 ${
                        activeStep === index
                          ? "bg-purple-700 shadow-lg transform scale-105"
                          : "bg-[#1f1f30] hover:bg-[#2a2a45]"
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="text-3xl font-bold text-purple-400">{item.step}</div>
                        <div>
                          <h3 className="text-lg font-semibold">{item.title}</h3>
                          <p className="text-sm text-gray-300">{item.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-10 text-center">
                  <Link href="/pages/plan">
                    <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300">
                      Get Started
                    </button>
                  </Link>
                </div>
              </div>
            </section>
          </main>

          <footer className="text-center text-xs text-gray-500 mt-6">
            © {new Date().getFullYear()} BrandWisp. All rights reserved.
            <span className="ml-2">
              <Link href="/" className="underline hover:text-purple-400">Back to Home</Link>
            </span>
          </footer>
        </div>
      </div>
    </div>
  );
} 
