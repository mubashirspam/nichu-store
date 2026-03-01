"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, ShoppingCart, Eye, Shield, Download, Zap, FileSpreadsheet, Star } from "lucide-react";
import type { Product } from "@/contexts/ProductContext";
import DashboardPreview from "./previews/DashboardPreview";

interface HeroProps {
  dark: boolean;
  mainProduct: Product | null;
  loading: boolean;
  handleBuyNow: (product: Product) => void;
  onPreview: (product: Product) => void;
}

export default function Hero({ dark: d, mainProduct, loading, handleBuyNow, onPreview }: HeroProps) {
  return (
    <section className="relative pt-28 pb-24 px-6 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-violet-500/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-indigo-500/15 rounded-full blur-[100px]" />
        <div className="absolute top-40 right-10 w-[300px] h-[300px] bg-pink-500/10 rounded-full blur-[80px]" />
      </div>
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <div className="lg:w-1/2">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6 bg-gradient-to-r from-violet-500/10 to-indigo-500/10 border border-violet-500/20 text-violet-400">
                <Sparkles size={14} /> Premium Excel Trackers & Planners
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-[1.1] tracking-tight">
                Organize Your Life <span className="gradient-text">Beautifully</span>
              </h1>
              <p className={`text-lg mb-8 leading-relaxed max-w-lg ${d ? "text-gray-400" : "text-gray-600"}`}>
                Stunning Excel spreadsheets with auto-generated charts to track fitness, expenses, habits, projects & more. One purchase, lifetime access.
              </p>
              {mainProduct && (
                <div className="flex items-center gap-4 mb-8">
                  <span className="text-4xl font-extrabold">₹{mainProduct.price}</span>
                  <span className={`text-xl line-through ${d ? "text-gray-600" : "text-gray-400"}`}>₹{mainProduct.original_price}</span>
                  <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                    {Math.round(((mainProduct.original_price - mainProduct.price) / mainProduct.original_price) * 100)}% OFF
                  </span>
                </div>
              )}
              <div className="flex flex-wrap gap-3 mb-8">
                <button
                  onClick={() => mainProduct && handleBuyNow(mainProduct)}
                  disabled={!mainProduct || loading}
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-8 py-4 rounded-2xl font-semibold text-base flex items-center gap-3 shadow-xl shadow-violet-500/25 transition-all disabled:opacity-50"
                >
                  <ShoppingCart size={20} /> {mainProduct ? `Buy Now — ₹${mainProduct.price}` : "Loading..."}
                </button>
                <button
                  onClick={() => mainProduct && onPreview(mainProduct)}
                  className={`px-6 py-4 rounded-2xl font-semibold text-base flex items-center gap-2 transition-all border-2 ${d ? "border-gray-700 hover:border-violet-500 text-gray-300" : "border-gray-200 hover:border-violet-400 text-gray-700"}`}
                >
                  <Eye size={20} /> Preview
                </button>
              </div>
              <div className={`flex flex-wrap items-center gap-5 text-sm ${d ? "text-gray-500" : "text-gray-500"}`}>
                <div className="flex items-center gap-1.5"><Shield size={14} className="text-violet-500" /> Secure Payment</div>
                <div className="flex items-center gap-1.5"><Download size={14} className="text-violet-500" /> Instant Download</div>
                <div className="flex items-center gap-1.5"><Zap size={14} className="text-violet-500" /> Lifetime Updates</div>
              </div>
            </motion.div>
          </div>
          <div className="lg:w-1/2">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="relative">
              <div className="absolute -inset-6 bg-gradient-to-r from-violet-500/20 to-indigo-500/20 rounded-3xl blur-3xl" />
              <div className={`relative rounded-2xl p-5 shadow-2xl ${d ? "bg-gray-900/80 border border-gray-800" : "bg-white border border-gray-200"}`}>
                <DashboardPreview dark={d} />
                <div className="mt-4 flex items-center justify-between px-1">
                  <div className={`flex items-center gap-1.5 text-xs ${d ? "text-gray-500" : "text-gray-400"}`}>
                    <FileSpreadsheet size={14} /> Excel / Google Sheets
                  </div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={12} className="text-yellow-400 fill-yellow-400" />)}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
