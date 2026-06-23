"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingCart, LogOut, Tag, Radio } from "lucide-react";
import LogoutButton from "@/components/account/LogoutButton";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/products", label: "Sản phẩm", icon: Package },
    { href: "/admin/promotions", label: "Khuyến mãi", icon: Tag },
    { href: "/admin/orders", label: "Đơn hàng", icon: ShoppingCart },
    { href: "/admin/live", label: "Livestream", icon: Radio },
  ];

  return (
    <nav className="w-64 shrink-0 border-r border-gray-200/60 bg-white/50 backdrop-blur-xl min-h-screen p-6 flex flex-col gap-6 shadow-sm relative z-10">
      <div className="flex items-center gap-3 px-2">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
          V
        </div>
        <span className="text-sm font-bold uppercase tracking-widest text-slate-800">
          V-Try Admin
        </span>
      </div>

      <div className="flex flex-col gap-2 mt-4">
        {links.map((link) => {
          const isActive = pathname.startsWith(link.href);
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-indigo-50 text-indigo-700 shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5",
                  isActive ? "text-indigo-600" : "text-slate-400",
                )}
              />
              {link.label}
            </Link>
          );
        })}
      </div>

      <div className="mt-auto px-3">
        <LogoutButton className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 transition-all duration-200">
          <LogOut className="w-5 h-5" />
          Đăng xuất
        </LogoutButton>
      </div>
    </nav>
  );
}
