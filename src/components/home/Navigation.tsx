"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Sun,
  Moon,
  ShoppingCart,
  User,
  Package,
  Settings,
  LogOut,
} from "lucide-react";

interface NavigationProps {
  dark: boolean;
  toggleTheme: () => void;
  itemCount: number;
  user: any;
  profile: any;
  isAdmin: boolean;
  avatarUrl: string | null;
  signOut: () => void;
  showUserMenu: boolean;
  setShowUserMenu: (show: boolean) => void;
  showLogin: boolean;
  setShowLogin: (show: boolean) => void;
}

export default function Navigation({
  dark: d,
  toggleTheme,
  itemCount,
  user,
  profile,
  isAdmin,
  avatarUrl,
  signOut,
  showUserMenu,
  setShowUserMenu,
  setShowLogin,
}: NavigationProps) {
  const displayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "U";

  return (
    <nav className={`fixed top-0 w-full z-50 glass ${d ? "glass-light" : "glass-light"}`}>
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <Sparkles size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold">
              Nichu<span className="gradient-text">Store</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <a href="#products" className={`hidden md:block text-sm font-medium transition-colors ${d ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"}`}>
              Products
            </a>
            <a href="#previews" className={`hidden md:block text-sm font-medium transition-colors ${d ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"}`}>
              Previews
            </a>
            <a href="#faq" className={`hidden md:block text-sm font-medium transition-colors ${d ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"}`}>
              FAQ
            </a>
            <button onClick={toggleTheme} className={`p-2 rounded-lg transition-colors ${d ? "text-yellow-400 hover:bg-white/10" : "text-gray-500 hover:bg-gray-100"}`}>
              {d ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link href="/cart" className={`relative p-2 rounded-lg transition-colors ${d ? "text-gray-400 hover:bg-white/10" : "text-gray-500 hover:bg-gray-100"}`}>
              <ShoppingCart size={18} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                  {itemCount}
                </span>
              )}
            </Link>
            {user ? (
              <div className="relative">
                <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center">
                  {avatarUrl ? (
                    <Image src={avatarUrl} alt="" width={32} height={32} className="w-8 h-8 rounded-full object-cover ring-2 ring-violet-500/50" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                      {displayName[0]?.toUpperCase()}
                    </div>
                  )}
                </button>
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      className={`absolute right-0 mt-2 w-56 rounded-2xl shadow-2xl py-2 z-50 ${d ? "bg-gray-900 border border-gray-800" : "bg-white border border-gray-200"}`}>
                      <div className={`px-4 py-3 ${d ? "border-b border-gray-800" : "border-b border-gray-100"}`}>
                        <p className="text-sm font-semibold truncate">{displayName}</p>
                        <p className={`text-xs truncate ${d ? "text-gray-500" : "text-gray-400"}`}>{user.email}</p>
                      </div>
                      <Link href="/orders" className={`flex items-center gap-3 px-4 py-2.5 text-sm ${d ? "hover:bg-white/5" : "hover:bg-gray-50"}`} onClick={() => setShowUserMenu(false)}>
                        <Package size={15} /> My Orders
                      </Link>
                      {isAdmin && (
                        <Link href="/admin" className={`flex items-center gap-3 px-4 py-2.5 text-sm ${d ? "hover:bg-white/5" : "hover:bg-gray-50"}`} onClick={() => setShowUserMenu(false)}>
                          <Settings size={15} /> Admin Dashboard
                        </Link>
                      )}
                      <button onClick={() => { signOut(); setShowUserMenu(false); }} className={`flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 w-full ${d ? "hover:bg-white/5" : "hover:bg-red-50"}`}>
                        <LogOut size={15} /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button onClick={() => setShowLogin(true)} className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-5 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-lg shadow-violet-500/25 transition-all">
                <User size={15} />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
