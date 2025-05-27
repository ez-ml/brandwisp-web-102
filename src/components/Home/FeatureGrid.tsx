import { 
  Wand2,
  LineChart,
  FileEdit,
  Camera,
  Activity,
  MessageSquareMore,
  Rocket,
  Globe2,
  TrendingUp
} from 'lucide-react';

const features = [
  {
    icon: Wand2,
    name: 'ProductIdeaGenie',
    description: 'AI-powered product research and validation',
    gradient: 'from-purple-500/20 to-pink-500/20'
  },
  {
    icon: LineChart,
    name: 'ProductPulse',
    description: 'Real-time product performance analytics',
    gradient: 'from-blue-500/20 to-cyan-500/20'
  },
  {
    icon: FileEdit,
    name: 'AutoBlogGen',
    description: 'AI content generation for product blogs',
    gradient: 'from-green-500/20 to-emerald-500/20'
  },
  {
    icon: Camera,
    name: 'VisionTagger',
    description: 'Automated product image optimization',
    gradient: 'from-yellow-500/20 to-orange-500/20'
  },
  {
    icon: Activity,
    name: 'TrafficTrace',
    description: 'Advanced traffic and conversion tracking',
    gradient: 'from-red-500/20 to-rose-500/20'
  },
  {
    icon: MessageSquareMore,
    name: 'ChatGenie',
    description: 'AI-powered customer support automation',
    gradient: 'from-indigo-500/20 to-violet-500/20'
  },
  {
    icon: Rocket,
    name: 'CampaignWizard',
    description: 'Automated marketing campaign manager',
    gradient: 'from-fuchsia-500/20 to-pink-500/20'
  },
  {
    icon: Globe2,
    name: 'WispGlobal',
    description: 'Global marketplace integration hub',
    gradient: 'from-teal-500/20 to-cyan-500/20'
  },
  {
    icon: TrendingUp,
    name: 'TrendLens',
    description: 'Market trend analysis and predictions',
    gradient: 'from-amber-500/20 to-yellow-500/20'
  }
];

export function FeatureGrid() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          Your Secret Weapons to Sell More — Faster
        </h2>
        <p className="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Powerful AI tools designed to supercharge your e-commerce success
        </p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.name}
                className={`
                  relative rounded-2xl p-6
                  bg-gradient-to-br ${feature.gradient}
                  hover:scale-[1.02] transition-transform duration-300
                  group cursor-pointer
                `}
              >
                <div className="absolute inset-0 bg-white/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <Icon className="h-10 w-10 text-gray-800 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{feature.name}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
} 