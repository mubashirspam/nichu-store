"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, ShoppingCart } from "lucide-react";
import type { Product } from "@/contexts/ProductContext";
import ChartPreview from "./previews/ChartPreview";
import NutritionPreview from "./previews/NutritionPreview";

interface FeaturedProductProps {
  dark: boolean;
  mainProduct: Product | null;
  handleBuyNow: (product: Product) => void;
}

export default function FeaturedProduct({ dark: d, mainProduct, handleBuyNow }: FeaturedProductProps) {
  if (!mainProduct) return null;

  return (
    <section className="py-20 px-6">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start gap-12">
        <div className="lg:w-1/2">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            Everything in <span className="gradient-text">{mainProduct.short_name}</span>
          </h2>
          <p className={`text-lg mb-8 ${d ? "text-gray-400" : "text-gray-500"}`}>
            The most comprehensive tracking template. Works in Excel and Google Sheets.
          </p>
          <div className="grid sm:grid-cols-2 gap-3 mb-8">
            {mainProduct.features.map((f, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.04 }}
                className={`flex items-start gap-3 p-4 rounded-xl ${
                  d ? "bg-gray-900/50 border border-gray-800" : "bg-white border border-gray-100"
                }`}
              >
                <CheckCircle size={16} className="text-violet-500 mt-0.5 flex-shrink-0" />
                <span className={`text-sm font-medium ${d ? "text-gray-300" : "text-gray-700"}`}>{f}</span>
              </motion.div>
            ))}
          </div>
          <button
            onClick={() => handleBuyNow(mainProduct)}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-8 py-4 rounded-2xl font-semibold flex items-center gap-3 shadow-xl shadow-violet-500/25 transition-all"
          >
            <ShoppingCart size={20} /> Get It Now — ₹{mainProduct.price}
          </button>
        </div>
        <div className="lg:w-1/2 space-y-6 flex flex-col">
          <div className={`rounded-2xl p-4 shadow-lg ${d ? "bg-gray-900/60 border border-gray-800" : "bg-white border border-gray-200"}`}>
            <ChartPreview dark={d} />
          </div>
          <div className={`rounded-2xl p-4 shadow-lg ${d ? "bg-gray-900/60 border border-gray-800" : "bg-white border border-gray-200"}`}>
            <NutritionPreview dark={d} />
          </div>
        </div>
      </div>
    </section>
  );
}
