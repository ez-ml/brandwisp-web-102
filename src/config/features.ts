export interface FeatureConfig {
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

export const features: FeatureConfig[] = [
  {
    key: "ProductIdeaGenie",
    title: "ProductIdeaGenie",
    description: "Discover trends and deals that actually sell before you invest inventory.",
    icon: "/images/productideagenie.png",
    overlay: {
      heading: "ProductIdeaGenie — Turn Raw Ideas Into Winning Products",
      description: "ProductIdeaGenie helps you evaluate whether your next product concept will thrive in the real world — before you invest a single dollar. It ingests early-stage ideas (images, sketches, or simple descriptions) and runs them through advanced market intelligence models to predict <strong>trend alignment</strong>, <strong>niche potential</strong>, and <strong>competitive viability</strong>.",
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
      description: "ProductPulse audits your product catalog to surface SEO gaps, engagement trends, and behavior-driven insights. It helps maximize your product visibility and conversion rates across e-commerce platforms.",
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
      description: "AutoBlogGen is your hands-free content engine that turns product data, market trends, and user behavior into compelling blog posts. It analyzes what's popular, what your customers care about, and what drives conversions — then crafts SEO-optimized articles tailored to your store.",
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
      description: "VisionTagger uses AI to generate alt text, captions, and descriptions for your product images — boosting both discoverability and compliance.",
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
      description: "TrafficTrace reveals where your users come from, how they navigate, and what drives their buying decisions — giving you crystal-clear ROI on your channels.",
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
      description: "ChatGenie is your tireless customer support agent. It handles FAQs, order tracking, product queries, and returns — all in real time, across your website and messaging apps. Trained on your policies, product catalog, and tone of voice, ChatGenie responds instantly and keeps customers happy without adding headcount.",
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
      description: "CampaignWizard turns your store data into high-performing ads without the guesswork. It writes ad copy, generates visuals, and continuously optimizes bids and placements across channels like Meta, Google, and TikTok.",
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
      description: "WispGlobal brings instant, localized content to your global customers. It analyzes locale-specific SERP trends and customer behavior to auto-translate blogs, product descriptions, and marketing pages with cultural relevance.",
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
]; 