"use client";

import Link from "next/link";
import { Store, BarChart3, Zap, Globe, Users, Settings } from "lucide-react";

const features = [
  {
    title: "Multi-Store Integration",
    description: "Connect and manage multiple e-commerce platforms seamlessly",
    icon: Store,
    color: "bg-blue-500",
    details: {
      title: "Unified Store Management",
      description: "Connect and manage multiple e-commerce stores from a single dashboard. Support for Shopify, Amazon, Etsy, and more.",
      benefits: [
        "Centralized inventory management",
        "Cross-platform order fulfillment",
        "Unified product catalog",
        "Real-time sync across platforms"
      ]
    }
  },
  {
    title: "Analytics Dashboard",
    description: "Track performance metrics across all your stores",
    icon: BarChart3,
    color: "bg-purple-500",
    details: {
      title: "Comprehensive Analytics",
      description: "Get detailed insights into your business performance across all connected stores.",
      benefits: [
        "Real-time sales tracking",
        "Customer behavior analysis",
        "Inventory performance metrics",
        "Cross-platform comparisons"
      ]
    }
  },
  {
    title: "Campaign Management",
    description: "Create and manage marketing campaigns effortlessly",
    icon: Zap,
    color: "bg-green-500",
    details: {
      title: "Unified Campaign Control",
      description: "Launch and manage marketing campaigns across multiple platforms simultaneously.",
      benefits: [
        "Multi-platform campaign creation",
        "Automated scheduling",
        "Performance tracking",
        "A/B testing capabilities"
      ]
    }
  },
  {
    title: "Global Reach",
    description: "Expand your business across borders",
    icon: Globe,
    color: "bg-orange-500",
    details: {
      title: "International Commerce",
      description: "Reach customers worldwide with our comprehensive global commerce solutions.",
      benefits: [
        "Multi-currency support",
        "International shipping",
        "Local payment methods",
        "Language localization"
      ]
    }
  },
  {
    title: "Customer Management",
    description: "Build and maintain customer relationships",
    icon: Users,
    color: "bg-pink-500",
    details: {
      title: "Customer Relationship Hub",
      description: "Manage all your customer interactions and data in one place.",
      benefits: [
        "Unified customer profiles",
        "Order history tracking",
        "Customer support integration",
        "Loyalty program management"
      ]
    }
  },
  {
    title: "Advanced Settings",
    description: "Customize your experience",
    icon: Settings,
    color: "bg-indigo-500",
    details: {
      title: "Platform Customization",
      description: "Tailor the platform to your specific business needs with advanced settings.",
      benefits: [
        "Custom automation rules",
        "API integrations",
        "Workflow customization",
        "User role management"
      ]
    }
  }
];

export default function Footer() {
  // Create three sets of features for a smoother infinite loop
  const scrollingFeatures = [...features, ...features, ...features];

  return (
    <footer className="bg-[#1E1B4B] text-white py-16 border-t border-purple-700">
      <div className="container mx-auto px-4">
      

        {/* Footer Links and Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-8 border-t border-purple-700/30">
          <div>
            <h4 className="text-lg font-semibold mb-4">&nbsp;</h4>
            
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/features" className="text-gray-400 hover:text-white transition">Features</Link></li>
              <li><Link href="/pricing" className="text-gray-400 hover:text-white transition">Pricing</Link></li>
              <li><Link href="/blog" className="text-gray-400 hover:text-white transition">Blog</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white transition">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li><Link href="/help" className="text-gray-400 hover:text-white transition">Help Center</Link></li>
              <li><Link href="/documentation" className="text-gray-400 hover:text-white transition">Documentation</Link></li>
              <li><Link href="/api" className="text-gray-400 hover:text-white transition">API Reference</Link></li>
              <li><Link href="/status" className="text-gray-400 hover:text-white transition">System Status</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="text-gray-400 hover:text-white transition">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-gray-400 hover:text-white transition">Terms of Service</Link></li>
              <li><Link href="/security" className="text-gray-400 hover:text-white transition">Security</Link></li>
              <li><Link href="/compliance" className="text-gray-400 hover:text-white transition">Compliance</Link></li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center pt-8 border-t border-purple-700/30">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} BrandWisp. All rights reserved.
          </p>
        </div>

          {/* Features Marquee */}
          <div className="relative mb-12 overflow-hidden py-8 before:absolute before:left-0 before:top-0 before:z-10 before:h-full before:w-[100px] before:bg-gradient-to-r before:from-[#1E1B4B] before:to-transparent after:absolute after:right-0 after:top-0 after:z-10 after:h-full after:w-[100px] after:bg-gradient-to-l after:from-[#1E1B4B] after:to-transparent">
          <div className="features-scroll-container group">
            <div className="flex animate-scroll gap-8 hover:pause">
              {scrollingFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div 
                    key={index} 
                    className="flex-none transform transition-all duration-300 hover:scale-105 hover:-translate-y-1"
                  >
                    <div className="flex items-center space-x-4 rounded-xl bg-gradient-to-br from-purple-900/40 to-purple-900/20 p-4 backdrop-blur-sm border border-purple-700/30 shadow-lg hover:border-purple-500/50 hover:shadow-purple-500/10">
                      <div className={`${feature.color} w-12 h-12 rounded-lg flex items-center justify-center transform transition-transform group-hover:scale-110`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="min-w-[200px]">
                        <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-gray-300 group-hover:text-gray-200 transition-colors">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 