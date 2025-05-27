import { Button } from '@/components/ui/button';
import { PlayCircle } from 'lucide-react';
import Link from 'next/link';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-transparent pt-32 pb-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4">
            Struggling to sell Online?
          </h1>
          <h2 className="text-3xl md:text-4xl font-semibold text-primary mb-6">
            We turn Your Products into Bestsellers
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl">
            AI meets performance. Scale your store with effortless automation.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <Button size="lg" className="text-lg px-8" asChild>
              <Link href="/signup">Get Started Free</Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8" asChild>
              <Link href="#demo">
                <PlayCircle className="mr-2 h-5 w-5" />
                Watch Demo
              </Link>
            </Button>
          </div>

          {/* Metrics Strip */}
          <div className="bg-white/50 backdrop-blur-sm rounded-full py-4 px-8 flex flex-col sm:flex-row gap-8 border shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-primary font-bold">+200%</span>
              <span className="text-sm text-gray-600">Sales Acceleration</span>
            </div>
            <div className="hidden sm:block w-px bg-gray-200" />
            <div className="flex items-center gap-2">
              <span className="text-primary font-bold">10+</span>
              <span className="text-sm text-gray-600">Shopify, Amazon, Etsy & More</span>
            </div>
            <div className="hidden sm:block w-px bg-gray-200" />
            <div className="flex items-center gap-2">
              <span className="text-primary font-bold">25+</span>
              <span className="text-sm text-gray-600">AI Modules</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 