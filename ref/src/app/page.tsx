"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import CommonLayout from "./components/CommonLayout";
import { features } from "@/config/features";

import {
  Rocket,
  Zap,
  ShoppingCart,
  Layers,
  Star,
  TrendingUp,
  Globe,
  Megaphone,
  MessageCircle,
} from "lucide-react";

const featureIcons = [
  Rocket,
  TrendingUp,
  Star,
  Zap,
  Layers,
  ShoppingCart,
  Globe,
  Megaphone,
  MessageCircle,
];

export default function Home() {
  const [buttonState, setButtonState] = useState("guest");
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayTitle, setOverlayTitle] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      const token = await user.getIdToken();
      try {
        const res = await fetch("/api/subscriptions/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.subscription?.status === "active") {
          setButtonState("active");
        } else if (res.ok && data.subscription?.status === "cancelled") {
          setButtonState("cancelled");
        }
      } catch (err) {
        console.error("❌ Error fetching subscription:", err);
      }
    });
    return () => unsubscribe();
  }, []);

  const renderCTAButton = () => {
    const classes = "bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 text-md rounded-full";
    switch (buttonState) {
      case "active":
        return <Link href="/dashboard" className={classes}>Go to Dashboard</Link>;
      case "cancelled":
        return <Link href="/pages/plan" className={classes}>Subscribe</Link>;
      default:
        return <Link href="/getting-started" className={classes}>Get Started Free</Link>;
    }
  };

  const gradientClasses = [
    "from-[#8B5CF6] to-[#7C3AED]",
    "from-[#2563EB] to-[#3B82F6]",
    "from-[#EC4899] to-[#F472B6]",
    "from-[#059669] to-[#10B981]",
    "from-[#D97706] to-[#F59E0B]",
    "from-[#EF4444] to-[#F87171]",
    "from-[#06B6D4] to-[#3B82F6]",
    "from-[#F43F5E] to-[#E11D48]",
   "from-[#4CAF50] to-[#388E3C]",
  ];

 

  return (
    <CommonLayout>
      <section className="py-16 px-4 bg-transparent text-white text-center">
       

        <div className="w-full max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 place-items-center">
          {features.map((feature, index) => {
            const Icon = featureIcons[index % featureIcons.length];
            const gradient = gradientClasses[index % gradientClasses.length];

            return (
              <div
  key={feature.key}
  onClick={() => {
    setOverlayTitle(feature.key);
    setShowOverlay(true);
  }}
  className={`
    group perspective
    w-full max-w-[300px] 
    bg-gradient-to-br ${gradient} 
    rounded-2xl p-6 border border-white/10 
    text-white text-left shadow-[0_10px_25px_rgba(0,0,0,0.15)]
    backdrop-blur-md bg-opacity-90
    cursor-pointer transform-gpu transition-transform duration-500
    hover:scale-105 hover:brightness-110
  `}
>
  <div className="transform-gpu group-hover:-rotate-x-3 group-hover:rotate-y-6 transition-transform duration-500 ease-out">
    <Icon className="w-8 h-8 mb-3" />
    <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
    <p className="text-sm text-white/90">{feature.description}</p>
  </div>
</div>

            );
          })}
        </div>
      </section>

      <section className="text-center py-16 px-6 bg-gradient-to-br from-[#312e81] to-[#4C1D95] rounded-3xl shadow-inner max-w-6xl mx-auto my-16 text-white">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Sell on Shopify, Amazon, Etsy — But Grow Faster with BrandWisp
        </h2>
        <p className="text-md text-white/80 mb-6 max-w-2xl mx-auto">
          BrandWisp doesn't replace your e-commerce platform — it amplifies it. Plug into any store, sync your products, and let our AI modules elevate performance, rankings, and revenue.
        </p>
        <Link
          href="/pages/getting-started"
          className="bg-white text-purple-800 hover:text-purple-900 font-semibold px-6 py-3 text-md rounded-full shadow-lg transition"
        >
          Get Started Now
        </Link>
      </section>

      {showOverlay && (() => {
        const feature = features.find((f) => f.key === overlayTitle);
        if (!feature?.overlay) return null;

        const { heading, description, whyItMatters, illustration, ctaLink } = feature.overlay;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Animated dark overlay with fade+scale */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-all duration-500 animate-fadeInOverlay" onClick={() => setShowOverlay(false)} />
            {/* Modal with glassmorphism, slide+fade, and shadow */}
            <div className="relative z-10 bg-white/10 backdrop-blur-2xl border border-purple-400/30 shadow-2xl rounded-3xl p-8 w-[90vw] max-w-4xl h-[75vh] flex flex-col gap-4 overflow-y-auto animate-slideUpModal">
              <button
                className="absolute top-4 right-4 text-white bg-red-600 hover:bg-red-700 rounded-full px-3 py-1 shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400"
                onClick={() => setShowOverlay(false)}
                aria-label="Close overlay"
              >
                ✕
              </button>
              <h2 className="text-4xl font-bold mb-2 drop-shadow-lg text-white/90">{feature.overlay.heading}</h2>
              <p className="text-2xl text-white/80 mb-6" dangerouslySetInnerHTML={{ __html: feature.overlay.description }} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-3xl font-bold mb-2 text-purple-300 drop-shadow">{feature.overlay.whyItMatters.heading}</h3>
                  <ul className="text-xl list-disc list-inside text-md text-white/90 mb-4">
                    {feature.overlay.whyItMatters.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                  <Link href={feature.overlay.ctaLink} className="bg-white text-purple-800 hover:text-purple-900 font-semibold px-6 py-3 text-md rounded-full inline-block mt-4 shadow-md transition-all duration-200">
                    Get Started Now
                  </Link>
                </div>
                <div className="flex items-center justify-center">
                  <img
                    src={feature.overlay.illustration.src}
                    alt={feature.overlay.illustration.alt}
                    className="w-full h-full object-contain rounded-xl border border-purple-700 shadow-xl bg-white/10"
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </CommonLayout>
  );
}
