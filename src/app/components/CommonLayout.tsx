"use client";

import SiteHeader from "./SiteHeader";
import Footer from "./Footer";

export default function CommonLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[white] w-screen min-h-screen flex justify-center items-center">
      <div className="w-[98%] h-full bg-[#1E1B4B] rounded-[2rem] shadow-xl overflow-hidden flex justify-center items-center">
        <div className="w-full h-full bg-[#1E1B4B] text-white rounded-[2rem] shadow-2xl overflow-y-scroll scroll-smooth flex flex-col">
          {/* Sticky header */}
          <div className="sticky top-0 z-40 bg-gradient-to-r from-[#4C1D95] via-[#6D28D9] to-[#7C3AED] border-b border-purple-800">
            <SiteHeader />
          </div>

          {/* Main content */}
          <main className="flex-grow bg-[#1E1B4B] text-white">{children}</main>

          {/* Enhanced Footer */}
          <Footer />
        </div>
      </div>
    </div>
  );
} 