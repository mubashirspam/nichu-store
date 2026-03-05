"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, Plus, Eye, FileSpreadsheet, Dumbbell, TrendingUp, Apple, Ruler, Calculator, Wallet, Calendar, Target, Heart, BarChart3 } from "lucide-react";
import type { Product } from "@/contexts/ProductContext";

const iconMap: Record<string, React.ReactNode> = {
  Dumbbell: <Dumbbell size={28} />, TrendingUp: <TrendingUp size={28} />,
  Apple: <Apple size={28} />, Ruler: <Ruler size={28} />,
  Calculator: <Calculator size={28} />, Wallet: <Wallet size={28} />,
  Calendar: <Calendar size={28} />, Target: <Target size={28} />,
  Heart: <Heart size={28} />, BarChart3: <BarChart3 size={28} />,
};

const colorMap: Record<string, { light: string; text: string; badge: string; btn: string }> = {
  emerald: { light: "bg-emerald-500/10", text: "text-emerald-400", badge: "bg-emerald-500", btn: "from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600" },
  blue: { light: "bg-blue-500/10", text: "text-blue-400", badge: "bg-blue-500", btn: "from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600" },
  orange: { light: "bg-orange-500/10", text: "text-orange-400", badge: "bg-orange-500", btn: "from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600" },
  pink: { light: "bg-pink-500/10", text: "text-pink-400", badge: "bg-pink-500", btn: "from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600" },
  purple: { light: "bg-purple-500/10", text: "text-purple-400", badge: "bg-purple-500", btn: "from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600" },
};

interface ProductsProps {
  dark: boolean;
  loading: boolean;
  products: Product[];
  isInCart: (id: string) => boolean;
  addingProductIds?: Set<string>;
  handleBuyNow: (product: Product) => void;
  handleAddToCart: (product: Product) => void;
  onPreview: (product: Product) => void;
}

export default function Products({ dark: d, loading, products, isInCart, addingProductIds, handleBuyNow, handleAddToCart, onPreview }: ProductsProps) {
  return (
    <section id="products" className={`py-20 px-6 ${d ? "bg-gray-900/30" : "bg-gray-50/80"}`}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3">Premium <span className="gradient-text">Templates</span></h2>
          <p className={`text-lg max-w-2xl mx-auto ${d ? "text-gray-400" : "text-gray-500"}`}>Professional Excel spreadsheets to help you track anything.</p>
        </div>
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
              <span className={d ? "text-gray-400" : "text-gray-500"}>Loading templates...</span>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product, idx) => {
              const c = colorMap[product.color] || colorMap.emerald;
              const inCart = isInCart(product.id);
              const isAdding = addingProductIds?.has(product.id) ?? false;
              return (
                <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: idx * 0.08 }}
                  className={`relative group rounded-2xl p-6 transition-all duration-300 ${d ? "bg-gray-900/60 border border-gray-800 hover:border-violet-500/40" : "bg-white border border-gray-200 hover:border-violet-300 hover:shadow-xl"}`}>
                  {product.badge && <div className={`absolute -top-3 left-6 ${c.badge} text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg`}>{product.badge}</div>}
                  <div className={`w-14 h-14 ${c.light} rounded-2xl flex items-center justify-center mb-4 ${c.text}`}>{iconMap[product.icon_name] || <FileSpreadsheet size={28} />}</div>
                  <h3 className="text-lg font-bold mb-1">{product.short_name}</h3>
                  <p className={`text-sm mb-4 line-clamp-2 ${d ? "text-gray-500" : "text-gray-500"}`}>{product.description}</p>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-2xl font-extrabold">₹{product.price}</span>
                    <span className={`text-sm line-through ${d ? "text-gray-600" : "text-gray-400"}`}>₹{product.original_price}</span>
                  </div>
                  <ul className="space-y-1.5 mb-5">
                    {product.features.slice(0, 3).map((f, i) => (
                      <li key={i} className={`flex items-start gap-2 text-sm ${d ? "text-gray-400" : "text-gray-600"}`}>
                        <CheckCircle size={13} className={`${c.text} mt-0.5 flex-shrink-0`} /><span className="line-clamp-1">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex gap-2">
                    <button onClick={() => handleBuyNow(product)}
                      className={`flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all bg-gradient-to-r ${c.btn} text-white shadow-lg`}>
                      Buy Now
                    </button>
                    <button onClick={() => handleAddToCart(product)} disabled={inCart || isAdding}
                      className={`px-3 py-3 rounded-xl transition-all ${inCart ? (d ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-500") : (d ? "bg-gray-800 hover:bg-gray-700 text-gray-400" : "bg-gray-100 hover:bg-gray-200 text-gray-500")} ${isAdding ? "opacity-80" : ""}`}
                      title={inCart ? "In Cart" : "Add to Cart"}>
                      {isAdding ? (
                        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      ) : inCart ? (
                        <CheckCircle size={16} />
                      ) : (
                        <Plus size={16} />
                      )}
                    </button>
                    <button onClick={() => onPreview(product)}
                      className={`px-3 py-3 rounded-xl transition-all ${d ? "bg-gray-800 hover:bg-gray-700 text-gray-400" : "bg-gray-100 hover:bg-gray-200 text-gray-500"}`}
                      title="Preview">
                      <Eye size={16} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
