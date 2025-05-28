"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useState } from "react";
import { Home } from "lucide-react";

export default function SiteHeader() {
  const { user, loading } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="flex justify-between items-center bg-[#1E1B4B] text-white px-8 py-4 sticky top-0 z-50 shadow-md rounded-t-[2rem]">
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

      {/* Right: Nav and Auth */}
      <nav className="flex items-center gap-6 text-sm">
      

        {user ? (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="bg-purple-600 px-4 py-2 rounded-full hover:bg-purple-700 text-white text-sm transition-all shadow-lg"
            >
              {user.displayName || user.email}
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-[#1E1B4B] rounded-xl shadow-2xl z-50 text-white">
                <Link
                  href="/dashboard"
                  className="block w-full text-left px-4 py-2 hover:bg-[#2a245e] text-sm rounded-t-xl"
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/settings"
                  className="block w-full text-left px-4 py-2 hover:bg-[#2a245e] text-sm"
                >
                  Settings
                </Link>
                <Link
                  href="/pages/plan"
                  className="block w-full text-left px-4 py-2 hover:bg-[#2a245e] text-sm"
                >
                  Plans
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 hover:bg-[#2a245e] text-sm text-red-400 hover:text-red-300 rounded-b-xl"
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full text-sm transition-all shadow-lg"
          >
            Log in
          </Link>
        )}
      </nav>
    </header>
  );
} 