// Unified layout wrapper
import Link from "next/link";
import SiteHeader from "./SiteHeader";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-gray-100 font-sans text-gray-900 min-h-screen flex flex-col">
      {/* Header */}
       <SiteHeader />

      {/* Page content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white text-center py-6 text-sm">
        © {new Date().getFullYear()} BrandWisp. All rights reserved.
      </footer>
    </div>
  );
}
