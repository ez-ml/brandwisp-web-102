'use client';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Store,
  Package,
  PenTool,
  FileText,
  CreditCard,
  Settings
} from 'lucide-react';

export default function Sidebar() {
  const router = useRouter();
  const path = usePathname();

  const menu = [
    { icon: LayoutDashboard, path: "/dashboard", tooltip: "Dashboard" },
    { icon: Package, path: "/dashboard/productpulse", tooltip: "Product Pulse" },
    { icon: PenTool, path: "/dashboard/autobloggen", tooltip: "AutoBlogGen" },
    { icon: Settings, path: "/dashboard/stores", tooltip: "Settings" }, // ← Gear icon added here
  ];

  return (
    <aside className="w-20 bg-[#111113] flex flex-col items-center py-6 space-y-6">
      {menu.map(({ icon: Icon, path: p, tooltip }) => (
        <button
          key={p}
          onClick={() => router.push(p)}
          title={tooltip}
          className={`p-2 rounded hover:bg-[#2A2A2A] ${
            path === p ? 'bg-[#2A2A2A]' : ''
          }`}
        >
          <Icon className={`text-white ${path === p ? 'text-purple-500' : ''}`} />
        </button>
      ))}
    </aside>
  );
}
