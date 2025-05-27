"use client";

import SiteHeader from "./SiteHeader";
import Link from "next/link";

export default function CommonLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[white] w-screen h-screen flex justify-center items-center">
      <div className="w-[98%] h-[98%] bg-[#1E1B4B] rounded-[2rem] shadow-xl overflow-hidden flex justify-center items-center">
        <div className="w-full h-full bg-[#1E1B4B] text-white rounded-[2rem] shadow-2xl overflow-y-scroll scroll-smooth flex flex-col">

          {/* Sticky header */}
          <div className="sticky top-0 z-40 bg-gradient-to-r from-[#4C1D95] via-[#6D28D9] to-[#7C3AED] border-b border-purple-800">
            <SiteHeader />
          </div>

          {/* Solid Hero Section (No Gradient) */}
          {/* Solid Hero Section (Reduced Height) */}
<div className="bg-[#1E1B4B] rounded-b-[4rem] text-white py-12 px-6 text-center">
  <h1 className="text-4xl md:text-5xl font-black tracking-tight drop-shadow-md mb-3">
    Struggling to sell Online?
  </h1>
  <h2 className="text-2xl md:text-3xl font-black tracking-tight drop-shadow-md mb-3">
    We turn Your Products into Bestsellers
  </h2>


  <div className="flex flex-col sm:flex-row justify-center gap-4 mb-10">
    <Link href="/pages/plan" className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-3 rounded-full shadow-lg">
      Get Started Free
    </Link>
    <Link href="/demo" className="border-2 border-white hover:border-purple-400 text-white font-bold px-6 py-3 rounded-full">
      Watch Demo
    </Link>
  </div>

  {/* Stat Cards */}
  <div className="bg-gradient-to-r from-[#7C3AED] via-[#9333EA] to-[#A855F7] text-white shadow-xl rounded-full px-6 py-4 max-w-4xl mx-auto flex flex-wrap justify-around gap-y-4">
    {[
      { value: "+200%", label: "Sales Acceleration" },
      { value: "10+", label: "Shopify, Amazon, Etsy & More" },
      { value: "25+", label: "AI Modules" },
      
    ].map((stat, idx) => (
      <div key={idx} className="text-center min-w-[100px]">
        <div className="text-xl font-extrabold">{stat.value}</div>
        <div className="text-xs tracking-wide text-white/90">{stat.label}</div>
      </div>
    ))}
  </div>
</div>


          {/* Unified body */}
          <main className="flex-grow bg-[#1E1B4B] text-white">{children}</main>

          {/* Footer */}
          <footer className="text-center text-xs text-white/60 py-6 border-t border-purple-700">
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
