"use client";

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import CommonLayout from "../../components/CommonLayout";

export default function AutoBlogGenPage() {
  const steps = [
    {
      step: "1",
      title: "Automated Blog Publishing",
      description: "Let AutoBlogGen write and publish content for you.",
      content: {
        heading: "Hands-Free Content Generation",
        text: "AutoBlogGen autonomously crafts high-quality blogs based on your product data, market trends, and SEO needs — then publishes them directly to your site. No manual editing or scheduling required.",
        image: "/images/autobloggen-auto-publish.png"
      }
    },
    {
      step: "2",
      title: "Audience Engagement",
      description: "Understand how your audience interacts with each blog.",
      content: {
        heading: "Blog View & Bounce Analytics",
        text: "Visualize the number of views per blog and bounce rate trends to assess which content is being read versus skipped. Identify what resonates and what needs reworking.",
        image: "/images/autobloggen-views-bounce.png"
      }
    },
    {
      step: "3",
      title: "Click-through Performance",
      description: "Evaluate how effectively blogs drive clicks.",
      content: {
        heading: "Click-through Rate Insights",
        text: "Analyze the percentage of users who clicked on your blog CTA from preview cards. A high CTR means your headlines and summaries are compelling.",
        image: "/images/autobloggen-ctr.png"
      }
    }
  ];

  const [activeStep, setActiveStep] = useState(0);

  return (
    <CommonLayout>
      <section className="max-w-7xl mx-auto pt-12 pb-16 px-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Content Display */}
        <div className="lg:col-span-2 bg-[#18181B] p-8 rounded-2xl shadow-xl border border-gray-700">
          <h2 className="text-3xl font-bold mb-4">{steps[activeStep].content.heading}</h2>
          <p className="text-md text-gray-300 mb-6 max-w-2xl">{steps[activeStep].content.text}</p>
          <div className="relative w-full max-w-3xl mx-auto">
            <Image
              src={steps[activeStep].content.image}
              alt={steps[activeStep].title}
              width={850}
              height={550}
              className="object-contain rounded-xl shadow-xl"
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
    </CommonLayout>
  );
}
