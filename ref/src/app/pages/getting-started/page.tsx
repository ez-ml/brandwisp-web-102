"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import CommonLayout from "../../components/CommonLayout";

const steps = [
  {
    step: "1",
    title: "Subscribe to a Pln",
    description: "Subscribe to appropriate plan.",
    content: {
      heading: "Connect Your Store",
      text: "Integrate your e-commerce platform to unlock the power of BrandWisp’s AI engine.",
      image: "/images/connect_store.png",
    },
  },
  {
    step: "2",
    title: "Connect Your Store",
    description: "Link your Shopify, Amazon, Etsy, or WooCommerce store to BrandWisp securely.",
    content: {
      heading: "Connect Your Store",
      text: "Integrate your e-commerce platform to unlock the power of BrandWisp’s AI engine.",
      image: "/images/connect_store.png",
    },
  },
  {
    step: "3",
    title: "Activate Modules",
    description: "Turn on AI modules like ProductPulse, AutoBlogGen, and ProductIdeaGenie.",
    content: {
      heading: "Activate AI Modules",
      text: "Enable powerful modules to generate content, score SEO, and explore product ideas instantly.",
      image: "/images/activate_modules.png",
    },
  },
  {
    step: "4",
    title: "Start Monitoring",
    description: "Act on the insights from Brandwisp.",
    content: {
      heading: "Ingest Product Data",
      text: "Bring in your entire product catalog in just a few clicks and let the AI begin analyzing.",
      image: "/images/ingest_data.png",
    },
  },

];

export default function GettingStartedPage() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <CommonLayout>
      {/* Hero Section */}
      

      {/* Step Grid */}
      <section className="bg-[#1F182B] py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left: Visual Content */}
          <div className="flex flex-col justify-center items-center text-white px-6">
            <h2 className="text-3xl font-bold mb-4">{steps[activeStep].content.heading}</h2>
            <p className="text-lg text-gray-300 mb-6 text-center max-w-xl">{steps[activeStep].content.text}</p>
            <div className="w-full h-[400px] relative rounded-xl shadow-lg border border-gray-700 overflow-hidden">
              <Image
                src={steps[activeStep].content.image}
                alt={steps[activeStep].content.heading}
                fill
                className="object-contain"
              />
            </div>
          </div>

          {/* Right: Step Cards */}
          <div className="flex flex-col justify-center gap-6">
            <h3 className="text-xl font-semibold text-white text-center mb-4">Get Started</h3>
            {steps.map((step, index) => (
              <div
                key={step.step}
                onClick={() => setActiveStep(index)}
                className={`cursor-pointer p-5 rounded-xl border border-gray-700 transition-transform ${
                  activeStep === index
                    ? "bg-purple-700 scale-105 shadow-lg"
                    : "bg-[#2A203A] hover:bg-[#322944]"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="text-3xl font-bold text-purple-400">{step.step}</div>
                  <div>
                    <h4 className="text-lg font-semibold text-white">{step.title}</h4>
                    <p className="text-sm text-gray-300">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="text-center py-12 px-6 bg-gray-950">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">Ready to Accelerate Your Sales?</h2>
        <p className="text-md text-gray-300 mb-6 max-w-xl mx-auto">
          Once you're set up, you can activate any AI module and begin transforming your product strategy instantly.
        </p>
        <Link
          href="/dashboard"
          className="bg-purple-700 hover:bg-purple-800 text-white px-6 py-3 text-md rounded-full"
        >
          Go to Dashboard
        </Link>
      </section>
    </CommonLayout>
  );
}
