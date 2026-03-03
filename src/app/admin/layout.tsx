"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingCart, Tag, Users, Sparkles, ArrowLeft, Sun, Moon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/offer-codes", label: "Offer Codes", icon: Tag },
  { href: "/admin/users", label: "Users", icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAdmin, loading } = useAuth();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleTheme = () => {
    setDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  };

  const d = dark;

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${d ? "bg-[#0a0a0f] text-gray-400" : "bg-gray-50 text-gray-500"}`}>
        <div className="inline-flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          Loading...
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${d ? "bg-[#0a0a0f] text-white" : "bg-gray-50"}`}>
        <div className="text-center">
          <h1 className={`text-2xl font-bold mb-2 ${d ? "text-white" : "text-gray-900"}`}>Access Denied</h1>
          <p className={`mb-4 ${d ? "text-gray-400" : "text-gray-500"}`}>You don&apos;t have admin access.</p>
          <Link href="/" className="text-violet-500 hover:underline">Back to Store</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex ${d ? "bg-[#0a0a0f]" : "bg-gray-50"}`}>
      {/* Sidebar */}
      <aside className={`w-64 flex flex-col fixed h-full border-r ${d ? "bg-gray-900/80 border-gray-800" : "bg-white border-gray-200"}`}>
        <div className={`p-5 border-b ${d ? "border-gray-800" : "border-gray-100"}`}>
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-violet-500/25">
              <Sparkles size={16} className="text-white" />
            </div>
            <div>
              <span className={`text-sm font-bold ${d ? "text-white" : "text-gray-900"}`}>NichuStore</span>
              <span className={`text-xs block ${d ? "text-gray-500" : "text-gray-400"}`}>Admin Panel</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? d ? "bg-violet-500/10 text-violet-400" : "bg-violet-50 text-violet-700"
                    : d ? "text-gray-400 hover:bg-white/5 hover:text-white" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className={`p-4 border-t space-y-2 ${d ? "border-gray-800" : "border-gray-100"}`}>
          <button onClick={toggleTheme} className={`flex items-center gap-2 text-sm w-full px-3 py-2 rounded-lg transition-colors ${d ? "text-gray-400 hover:bg-white/5 hover:text-white" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}>
            {d ? <Sun size={16} /> : <Moon size={16} />}
            {d ? "Light Mode" : "Dark Mode"}
          </button>
          <Link href="/" className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition-colors ${d ? "text-gray-400 hover:bg-white/5 hover:text-white" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}>
            <ArrowLeft size={16} />
            Back to Store
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ml-64 p-8 ${d ? "text-white" : ""}`}>{children}</main>
    </div>
  );
}
