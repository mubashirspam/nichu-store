"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ShoppingCart, Sparkles, X } from "lucide-react";
import type { Product } from "@/contexts/ProductContext";
import DashboardPreview from "./previews/DashboardPreview";
import ChartPreview from "./previews/ChartPreview";
import NutritionPreview from "./previews/NutritionPreview";

interface FinalCTAProps {
  mainProduct: Product | null;
  handleBuyNow: (product: Product) => void;
}

export function FinalCTA({ mainProduct, handleBuyNow }: FinalCTAProps) {
  return (
    <section className="py-24 px-6 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-500/20 rounded-full blur-[80px]" />
      </div>
      <div className="max-w-3xl mx-auto text-center relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4 text-white">Start Tracking Today</h2>
          <p className="text-violet-200 text-lg mb-8 max-w-xl mx-auto">One-time purchase. Lifetime access. No subscriptions.</p>
          {mainProduct && (
            <div className="flex items-center justify-center gap-4 mb-8">
              <span className="text-4xl font-extrabold text-white">₹{mainProduct.price}</span>
              <span className="text-xl text-violet-200 line-through">₹{mainProduct.original_price}</span>
            </div>
          )}
          <button
            onClick={() => mainProduct && handleBuyNow(mainProduct)}
            disabled={!mainProduct}
            className="bg-white text-violet-700 hover:bg-violet-50 px-10 py-4 rounded-2xl font-bold text-lg inline-flex items-center gap-3 shadow-2xl transition-all disabled:opacity-50"
          >
            Get Started <ArrowRight size={22} />
          </button>
          <p className="text-violet-300 text-xs mt-4">
            By purchasing, you agree to our <a href="/terms/" className="text-white underline">Terms</a> and <a href="/refund/" className="text-white underline">Refund Policy</a>.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export function Footer({ dark: d }: { dark: boolean }) {
  return (
    <footer className={`py-12 px-6 ${d ? "border-t border-gray-800" : "border-t border-gray-100"}`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
              <Sparkles size={14} className="text-white" />
            </div>
            <div>
              <span className="text-lg font-bold">
                Nichu<span className="gradient-text">Store</span>
              </span>
              <p className={`text-xs ${d ? "text-gray-600" : "text-gray-400"}`}>Digital Products by Nizamudheen KC</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-6 text-sm">
            <a href="/privacy/" className={`transition-colors ${d ? "text-gray-500 hover:text-white" : "text-gray-500 hover:text-gray-900"}`}>Privacy Policy</a>
            <a href="/terms/" className={`transition-colors ${d ? "text-gray-500 hover:text-white" : "text-gray-500 hover:text-gray-900"}`}>Terms & Conditions</a>
            <a href="/refund/" className={`transition-colors ${d ? "text-gray-500 hover:text-white" : "text-gray-500 hover:text-gray-900"}`}>Refund Policy</a>
          </div>
        </div>
        <div className={`text-center text-xs mt-8 ${d ? "text-gray-700" : "text-gray-400"}`}>
          © {new Date().getFullYear()} Nizamudheen KC. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

interface PreviewModalProps {
  dark: boolean;
  showPreview: boolean;
  selectedProduct: Product | null;
  setShowPreview: (show: boolean) => void;
  handleBuyNow: (product: Product) => void;
}

export function PreviewModal({ dark: d, showPreview, selectedProduct, setShowPreview, handleBuyNow }: PreviewModalProps) {
  return (
    <AnimatePresence>
      {showPreview && selectedProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={() => setShowPreview(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 ${d ? "bg-gray-900 border border-gray-800" : "bg-white"}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">{selectedProduct.name} — Preview</h3>
              <button
                onClick={() => setShowPreview(false)}
                className={`p-1 rounded-lg ${d ? "text-gray-500 hover:text-white" : "text-gray-400 hover:text-gray-600"}`}
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-6">
              <DashboardPreview dark={d} />
              <ChartPreview dark={d} />
              <NutritionPreview dark={d} />
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setShowPreview(false);
                  handleBuyNow(selectedProduct);
                }}
                className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg"
              >
                <ShoppingCart size={18} /> Buy Now — ₹{selectedProduct.price}
              </button>
              <button
                onClick={() => setShowPreview(false)}
                className={`px-6 py-3 rounded-xl font-medium ${d ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
