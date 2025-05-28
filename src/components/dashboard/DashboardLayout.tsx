'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Package, 
  PenTool, 
  Settings, 
  Lightbulb, 
  Glasses, 
  Route, 
  MonitorPlay,
  Store,
  Home,
  Bell,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

interface NavItem {
  icon: typeof LayoutDashboard;
  href: string;
  title: string;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, href: '/dashboard', title: 'Dashboard' },
  { icon: Lightbulb, href: '/dashboard/productideagenie', title: 'Product Idea Genie' },
  { icon: Package, href: '/dashboard/productpulse', title: 'Product Pulse' },
  { icon: PenTool, href: '/dashboard/autobloggen', title: 'AutoBlogGen' },
  { icon: Glasses, href: '/dashboard/visiontagger', title: 'Vision Tagger' },
  { icon: Route, href: '/dashboard/traffictrace', title: 'Traffic Trace' },
  { icon: MonitorPlay, href: '/dashboard/campaignwizard', title: 'Campaign Wizard' },
  { icon: Store, href: '/dashboard/stores', title: 'Stores' },
  { icon: Settings, href: '/dashboard/settings', title: 'Settings' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      logout();
      setDropdownOpen(false);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Close dropdown when clicking outside
  const handleDropdownToggle = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <div className="bg-[white] w-screen h-screen flex justify-center items-center">
      <div className="w-[98%] h-[98%] bg-[#1E1B4B] rounded-[2rem] shadow-xl flex justify-center items-center">
        <div className="w-full h-full bg-[#1E1B4B] text-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col">
          {/* Header */}
          <header className="flex justify-between items-center bg-[#1E1B4B] text-white px-8 py-4 sticky top-0 z-50 shadow-md rounded-t-[2rem] border-b border-white/10">
            {/* Left: Home icon and Brand */}
            <div className="flex items-center gap-4">
              <Link href="/" title="Home">
                <Home className="w-5 h-5 text-white hover:text-purple-300 transition" />
              </Link>
              <Link
                href="/"
                className="text-2xl font-bold tracking-tight hover:text-purple-300 transition"
              >
                BrandWisp
              </Link>
            </div>

            {/* Right: User Actions */}
            <div className="flex items-center space-x-4">
              <button className="hover:text-purple-300 transition">
                <Bell className="h-5 w-5" />
              </button>
              <div className="relative">
                <button
                  onClick={handleDropdownToggle}
                  className="bg-purple-600 px-4 py-2 rounded-full hover:bg-purple-700 text-white text-sm transition-all shadow-lg"
                >
                  {user?.displayName || user?.email || 'User'}
                </button>

                {dropdownOpen && (
                  <>
                    {/* Backdrop to close dropdown when clicking outside */}
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-44 bg-[#1E1B4B] rounded-xl shadow-2xl z-50 text-white border border-white/10">
                      <Link
                        href="/dashboard"
                        className="block w-full text-left px-4 py-2 hover:bg-[#2a245e] text-sm rounded-t-xl transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/dashboard/settings"
                        className="block w-full text-left px-4 py-2 hover:bg-[#2a245e] text-sm transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Settings
                      </Link>
                      <Link
                        href="/pages/plan"
                        className="block w-full text-left px-4 py-2 hover:bg-[#2a245e] text-sm transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Plans
                      </Link>
                      <hr className="border-white/10 my-1" />
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 hover:bg-[#2a245e] text-sm text-red-400 hover:text-red-300 rounded-b-xl transition-colors"
                      >
                        Log Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </header>

          {/* Content with Sidebar */}
          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <aside className="w-20 bg-[#1E1B4B] flex flex-col items-center py-6 space-y-8">
              {navItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  title={item.title}
                  className="group relative"
                >
                  <item.icon className="text-white group-hover:text-purple-300 transition" />
                  <div className="absolute left-full ml-2 px-2 py-1 bg-[#2D2A5E] rounded-md text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.title}
                  </div>
                </button>
              ))}
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