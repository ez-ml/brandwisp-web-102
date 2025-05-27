'use client';

import { useRouter } from 'next/navigation';
import { LayoutDashboard, Package, PenTool, Settings , Lightbulb, GlassesIcon, RouteIcon, TvMinimalPlayIcon} from 'lucide-react';
import SiteHeader from '../SiteHeader';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <div className="bg-[white] w-screen h-screen flex justify-center items-center">
      <div className="w-[98%] h-[98%] bg-[#1E1B4B] rounded-[2rem] shadow-xl flex justify-center items-center">
        <div className="w-full h-full bg-[#1E1B4B] text-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col">

          {/* Header */}
          <SiteHeader />

          {/* Content with Sidebar */}
          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <aside className="w-20 bg-[#1E1B4B] flex flex-col items-center py-6 space-y-8">
              <button onClick={() => router.push('/dashboard')} title="Dashboard">
                <LayoutDashboard className="text-white hover:text-purple-300 transition" />
              </button>

              <button onClick={() => router.push('/dashboard/productideagenie')} title="Product Idea Genie">
                <Lightbulb className="text-white hover:text-purple-300 transition" />
              </button>
              
              <button onClick={() => router.push('/dashboard/productpulse')} title="Product Pulse">
                <Package className="text-white hover:text-purple-300 transition" />
              </button>
              <button onClick={() => router.push('/dashboard/autobloggen')} title="AutoBlogGen">
                <PenTool className="text-white hover:text-purple-300 transition" />
              </button>

              <button onClick={() => router.push('/dashboard/visiontagger')} title="AutoBlogGen">
                <GlassesIcon className="text-white hover:text-purple-300 transition" />
              </button>

              <button onClick={() => router.push('/dashboard/traffictrace')} title="AutoBlogGen">
                <RouteIcon className="text-white hover:text-purple-300 transition" />
              </button>
              <button onClick={() => router.push('/dashboard/campaignwizard')} title="AutoBlogGen">
                <TvMinimalPlayIcon className="text-white hover:text-purple-300 transition" />
              </button>
              <button onClick={() => router.push('/dashboard/stores')} title="Settings">
                <Settings className="text-white hover:text-purple-300 transition" />
              </button>
            </aside>
           
            {/* Main Panel */}
            <main className="flex-1 overflow-y-auto px-8 py-10 bg-[#1E1B4B] text-white">
              {children}
            </main>
          </div>

          {/* Footer */}
          <footer className="text-center text-xs text-white/60 py-4">
            © {new Date().getFullYear()} BrandWisp. All rights reserved.
          </footer>
        </div>
      </div>
    </div>
  );
}
