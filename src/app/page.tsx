"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import CommonLayout from '@/app/components/CommonLayout';
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
} from 'lucide-react';

interface FeatureConfig {
  key: string;
  title: string;
  description: string;
  icon: string;
  overlay: {
    heading: string;
    description: string;
    whyItMatters: {
      heading: string;
      bullets: string[];
    };
    illustration: {
      src: string;
      alt: string;
    };
    ctaLink: string;
  };
}

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

export const features: FeatureConfig[] = [
  {
    key: "ProductIdeaGenie",
    title: "ProductIdeaGenie",
    description: "Discover trends and deals that actually sell before you invest inventory.",
    icon: "/images/productideagenie.png",
    overlay: {
      heading: "ProductIdeaGenie — Turn Raw Ideas Into Winning Products",
      description:
        "ProductIdeaGenie helps you evaluate whether your next product concept will thrive in the real world — before you invest a single dollar. It ingests early-stage ideas (images, sketches, or simple descriptions) and runs them through advanced market intelligence models to predict <strong>trend alignment</strong>, <strong>niche potential</strong>, and <strong>competitive viability</strong>.",
      whyItMatters: {
        heading: "Why It Matters",
        bullets: [
          "Avoid dead-end products",
          "Identify high-potential niches early",
          "Make faster go/no-go decisions",
          "Save on inventory, R&D, and launch costs",
        ],
      },
      illustration: {
        src: "/images/productideagenie-illustration.png",
        alt: "ProductIdeaGenie Illustration",
      },
      ctaLink: "/pages/getting-started",
    },
  },
  {
    key: "ProductPulse",
    title: "ProductPulse",
    description: "Ensure your product listings are SEO-rich, complete, and ready to convert across platforms.",
    icon: "/images/productpulse.png",
    overlay: {
      heading: "ProductPulse — Optimize Product Listings with Precision",
      description:
        "ProductPulse audits your product catalog to surface SEO gaps, engagement trends, and behavior-driven insights. It helps maximize your product visibility and conversion rates across e-commerce platforms.",
      whyItMatters: {
        heading: "Why It Matters",
        bullets: [
          "Real-time SEO scoring and actionable fixes",
          "Tracks impressions, clicks, and conversions per SKU",
          "Surfaces top and underperforming listings",
          "Visualizes internal usage for adoption and training",
        ],
      },
      illustration: {
        src: "/images/seo_score_insight.png",
        alt: "ProductPulse SEO Insight",
      },
      ctaLink: "/pages/productpulse",
    },
  },
  {
    key: "AutoBlogGen",
    title: "AutoBlogGen",
    description: "Auto-generate content for blogs, product pages, and social posts to keep traffic coming.",
    icon: "/images/autobloggen.png",
    overlay: {
      heading: "AutoBlogGen — AI-Powered Content Creation",
      description:
        "AutoBlogGen is your hands-free content engine that turns product data, market trends, and user behavior into compelling blog posts. It analyzes what's popular, what your customers care about, and what drives conversions — then crafts SEO-optimized articles tailored to your store. With automated publishing, your blog stays active and relevant without lifting a finger. Let AutoBlogGen drive organic traffic, improve engagement, and boost your store's visibility.",
      whyItMatters: {
        heading: "Why It Matters",
        bullets: [
          "Hands-free blog generation and publishing",
          "Optimized for SEO and product promotion",
          "Includes engagement and bounce analytics",
          "Drives consistent organic traffic to your listings",
        ],
      },
      illustration: {
        src: "/images/autobloggen-auto-publish.png",
        alt: "AutoBlogGen Publishing Insight",
      },
      ctaLink: "/pages/autobloggen",
    },
  },
  
  {
    key: "VisionTagger",
    title: "VisionTagger",
    description: "Auto-generate image descriptions and product captions for SEO and ADA compliance.",
    icon: "/images/visiontagger.png",
    overlay: {
      heading: "VisionTagger — Smarter Visual SEO and Accessibility",
      description:
        "VisionTagger uses AI to generate alt text, captions, and descriptions for your product images — boosting both discoverability and compliance.",
      whyItMatters: {
        heading: "Why It Matters",
        bullets: [
          "Auto-generates SEO-friendly image descriptions",
          "Improves ADA accessibility at scale",
          "Boosts ranking through better visual tagging",
          "Saves time on manual captioning",
        ],
      },
      illustration: {
        src: "/images/visiontagger.png",
        alt: "VisionTagger SEO & ADA",
      },
      ctaLink: "/pages/visiontagger",
    },
  },
  {
    key: "TrafficTrace",
    title: "TrafficTrace",
    description: "Understand where your users are coming from and how they convert for smarter marketing.",
    icon: "/images/traffictrace.png",
    overlay: {
      heading: "TrafficTrace — Know What Drives Conversions",
      description:
        "TrafficTrace reveals where your users come from, how they navigate, and what drives their buying decisions — giving you crystal-clear ROI on your channels.",
      whyItMatters: {
        heading: "Why It Matters",
        bullets: [
          "Visualize traffic sources and conversion paths",
          "Identify top-performing channels and campaigns",
          "Reduce attribution guesswork",
          "Empower marketing teams with clarity",
        ],
      },
      illustration: {
        src: "/images/traffictrace.png",
        alt: "TrafficTrace Conversion Flow",
      },
      ctaLink: "/pages/traffictrace",
    },
  },


{
  key: "ChatGenie",
  title: "ChatGenie",
  description: "Deliver 24/7 intelligent support with an AI chatbot trained on your store data.",
  icon: "/images/chatgenie.png",
  overlay: {
    heading: "ChatGenie — AI Customer Support Assistant",
    description:
      "ChatGenie is your tireless customer support agent. It handles FAQs, order tracking, product queries, and returns — all in real time, across your website and messaging apps. Trained on your policies, product catalog, and tone of voice, ChatGenie responds instantly and keeps customers happy without adding headcount.",
    whyItMatters: {
      heading: "Why It Matters",
      bullets: [
        "24/7 AI support without human agents",
        "Reduces tickets with instant, accurate answers",
        "Integrates with Shopify, WhatsApp, Messenger, and more",
        "Improves CSAT while lowering operational costs",
      ],
    },
    illustration: {
      src: "/images/chatgenie-support.png",
      alt: "ChatGenie Live Chat Window",
    },
    ctaLink: "/pages/chatgenie",
  },
},
{
  key: "CampaignWizard",
  title: "CampaignWizard",
  description: "Auto-generate and optimize ad campaigns across Google, Facebook, and beyond with AI.",
  icon: "/images/campaignwizard.png",
  overlay: {
    heading: "CampaignWizard — AI-Powered Ad Automation",
    description:
      "CampaignWizard turns your store data into high-performing ads without the guesswork. It writes ad copy, generates visuals, and continuously optimizes bids and placements across channels like Meta, Google, and TikTok. From budget allocation to ROI tracking, this is your plug-and-play growth engine — fully autonomous, always learning.",
    whyItMatters: {
      heading: "Why It Matters",
      bullets: [
        "No-code campaign creation in minutes",
        "Optimized creatives, CTAs, and keywords",
        "Live performance tracking and improvement",
        "Eliminates manual ad testing and media buying",
      ],
    },
    illustration: {
      src: "/images/campaignwizard-ads.png",
      alt: "CampaignWizard Ad Dashboard",
    },
    ctaLink: "/pages/campaignwizard",
  },
},

{
  key: "WispGlobal",
  title: "WispGlobal",
  description: "Break language barriers with real-time AI translation for blogs, products, and pages.",
  icon: "/images/wispglobal.png",
  overlay: {
    heading: "WispGlobal — Multilingual AI Localization",
    description:
      "WispGlobal brings instant, localized content to your global customers. It analyzes locale-specific SERP trends and customer behavior to auto-translate blogs, product descriptions, and marketing pages with cultural relevance. Whether you're expanding to LATAM, Europe, or APAC — WispGlobal makes sure your content speaks the right language, tone, and style.",
    whyItMatters: {
      heading: "Why It Matters",
      bullets: [
        "Real-time translation with SEO awareness",
        "Supports 30+ languages and locale variants",
        "Boosts discoverability in local search engines",
        "Creates authentic, native-brand experiences",
      ],
    },
    illustration: {
      src: "/images/wispglobal-translate.png",
      alt: "WispGlobal Translation Illustration",
    },
    ctaLink: "/pages/wispglobal",
  },
},
{
  key: "TrendLens",
  title: "TrendLens",
  description: "Track keyword popularity and seasonal demand cycles to time your campaigns perfectly.",
  icon: "/images/trendlens.png",
  overlay: {
    heading: "TrendLens — Ride the Wave of Search Demand",
    description:
      "TrendLens monitors keyword popularity and seasonal demand cycles so you can launch campaigns aligned with peak customer interest.",
    whyItMatters: {
      heading: "Why It Matters",
      bullets: [
        "Track real-time and seasonal keyword spikes",
        "Identify high-demand trends early",
        "Optimize product timing and positioning",
        "Drive better marketing ROI with trend data",
      ],
    },
    illustration: {
      src: "/images/trendlens.png",
      alt: "TrendLens Trend Tracking",
    },
    ctaLink: "/pages/trendlens",
  },
},

];

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);

  const handleGetStarted = () => {
    if (user) {
      router.push('/dashboard/settings');
    } else {
      router.push('/login');
    }
  };

  return (
    <CommonLayout>
      <div className="flex flex-col items-center">
        {/* Hero Section */}
        <div className="w-full bg-[#1E1B4B] text-white py-16 px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight drop-shadow-md mb-3">
            Struggling to sell Online?
          </h1>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight drop-shadow-md mb-6">
            We turn Your Products into Bestsellers
          </h2>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-10">
            <Button 
              onClick={handleGetStarted}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-3 rounded-full shadow-lg transition-all duration-300"
            >
              Get Started Free
            </Button>
            <Link href="/demo" className="border-2 border-white hover:border-purple-400 text-white font-bold px-6 py-3 rounded-full transition-all duration-300">
              Watch Demo
            </Link>
          </div>

          {/* Stats Section */}
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

        {/* Features Grid */}
        <div className="w-full max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 place-items-center p-8">
          {features.map((feature, index) => {
            const Icon = featureIcons[index % featureIcons.length];
            const gradient = gradientClasses[index % gradientClasses.length];

            return (
              <Dialog key={feature.key} open={selectedFeature === feature.key} onOpenChange={(open) => {
                setSelectedFeature(open ? feature.key : null);
              }}>
                <DialogTrigger asChild>
                  <div
                    className={`
                      group perspective
                      w-full max-w-[300px] 
                      bg-gradient-to-br ${gradient} 
                      rounded-2xl p-6 border border-white/10 
                      text-white text-left shadow-[0_10px_25px_rgba(0,0,0,0.15)]
                      backdrop-blur-md bg-opacity-90
                      cursor-pointer transform-gpu transition-all duration-300
                      hover:scale-105 hover:brightness-110
                    `}
                  >
                    <div className="transform-gpu group-hover:-rotate-x-3 group-hover:rotate-y-6 transition-all duration-300">
                      <Icon className="w-8 h-8 mb-3" />
                      <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                      <p className="text-sm text-white/90">{feature.description}</p>
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className="bg-[#1E1B4B] border-purple-500/20 max-w-4xl">
                  <DialogHeader>
                    <DialogTitle className="text-4xl font-bold bg-gradient-to-r from-purple-300 to-purple-100 bg-clip-text text-transparent">
                      {feature.overlay.heading}
                    </DialogTitle>
                    <DialogDescription className="text-xl text-purple-200/80" dangerouslySetInnerHTML={{ __html: feature.overlay.description }} />
                  </DialogHeader>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <h3 className="text-2xl font-bold mb-4 text-purple-300">{feature.overlay.whyItMatters.heading}</h3>
                      <ul className="space-y-3">
                        {feature.overlay.whyItMatters.bullets.map((bullet, idx) => (
                          <li key={idx} className="flex items-center text-lg text-purple-100/80 hover:text-purple-200 transition-colors">
                            <span className="w-2 h-2 rounded-full bg-purple-500 mr-3"></span>
                            {bullet}
                          </li>
                        ))}
                      </ul>
                      <Button
                        size="lg"
                        className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-8 py-6 mt-8 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25"
                        onClick={handleGetStarted}
                      >
                        Get Started Now
                      </Button>
                    </div>
                    <div className="flex items-center justify-center p-4 bg-[#2D2A5E] rounded-2xl">
                      <div className="relative w-full h-[300px] transform transition-all duration-300 hover:scale-105">
                        <Image
                          src={feature.overlay.illustration.src}
                          alt={feature.overlay.illustration.alt}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          quality={90}
                          priority={index < 3}
                          loading={index < 3 ? "eager" : "lazy"}
                          className="object-contain rounded-xl transition-all duration-300"
                        />
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            );
          })}
        </div>
      </div>
    </CommonLayout>
  );
}
