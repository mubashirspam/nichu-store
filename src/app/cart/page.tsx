"use client";

import React, { useState, useEffect } from "react";
import { ShoppingCart, Trash2, ArrowLeft, ArrowRight, Sparkles, ShieldCheck, TrendingUp, Apple, Ruler, Dumbbell, FileSpreadsheet, Calculator, Wallet, Calendar, Target, Heart, BarChart3, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";

const iconMap: Record<string, React.ReactNode> = {
  Dumbbell: <Dumbbell size={24} />, TrendingUp: <TrendingUp size={24} />,
  Apple: <Apple size={24} />, Ruler: <Ruler size={24} />,
  Calculator: <Calculator size={24} />, Wallet: <Wallet size={24} />,
  Calendar: <Calendar size={24} />, Target: <Target size={24} />,
  Heart: <Heart size={24} />, BarChart3: <BarChart3 size={24} />,
};

const colorMap: Record<string, { bg: string; text: string; darkBg: string; darkText: string }> = {
  emerald: { bg: "bg-emerald-100", text: "text-emerald-600", darkBg: "bg-emerald-500/10", darkText: "text-emerald-400" },
  blue: { bg: "bg-blue-100", text: "text-blue-600", darkBg: "bg-blue-500/10", darkText: "text-blue-400" },
  orange: { bg: "bg-orange-100", text: "text-orange-600", darkBg: "bg-orange-500/10", darkText: "text-orange-400" },
  pink: { bg: "bg-pink-100", text: "text-pink-600", darkBg: "bg-pink-500/10", darkText: "text-pink-400" },
  purple: { bg: "bg-purple-100", text: "text-purple-600", darkBg: "bg-purple-500/10", darkText: "text-purple-400" },
};

function CartItemSkeleton({ dark }: { dark: boolean }) {
  const d = dark;
  return (
    <div className={`rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4 animate-pulse ${d ? "bg-gray-900/60 border border-gray-800" : "bg-white border border-gray-200"}`}>
      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex-shrink-0 ${d ? "bg-gray-800" : "bg-gray-200"}`} />
      <div className="flex-1 min-w-0 space-y-2">
        <div className={`h-4 rounded w-3/4 ${d ? "bg-gray-800" : "bg-gray-200"}`} />
        <div className={`h-3 rounded w-1/2 ${d ? "bg-gray-800/60" : "bg-gray-100"}`} />
      </div>
      <div className="text-right flex-shrink-0 space-y-2">
        <div className={`h-4 rounded w-12 ml-auto ${d ? "bg-gray-800" : "bg-gray-200"}`} />
        <div className={`h-3 rounded w-8 ml-auto ${d ? "bg-gray-800/60" : "bg-gray-100"}`} />
      </div>
      <div className={`w-8 h-8 rounded flex-shrink-0 ${d ? "bg-gray-800" : "bg-gray-200"}`} />
    </div>
  );
}

function OrderSummarySkeleton({ dark }: { dark: boolean }) {
  const d = dark;
  return (
    <div className={`rounded-2xl p-5 sm:p-6 sticky top-24 animate-pulse ${d ? "bg-gray-900/60 border border-gray-800" : "bg-white border border-gray-200"}`}>
      <div className={`h-5 rounded w-1/2 mb-4 ${d ? "bg-gray-800" : "bg-gray-200"}`} />
      <div className="space-y-3 mb-4">
        <div className="flex justify-between">
          <div className={`h-3 rounded w-1/3 ${d ? "bg-gray-800" : "bg-gray-200"}`} />
          <div className={`h-3 rounded w-12 ${d ? "bg-gray-800" : "bg-gray-200"}`} />
        </div>
        <div className={`pt-3 flex justify-between ${d ? "border-t border-gray-800" : "border-t border-gray-100"}`}>
          <div className={`h-4 rounded w-1/4 ${d ? "bg-gray-800" : "bg-gray-200"}`} />
          <div className={`h-4 rounded w-14 ${d ? "bg-gray-800" : "bg-gray-200"}`} />
        </div>
      </div>
      <div className={`h-12 rounded-xl w-full ${d ? "bg-gray-800" : "bg-gray-200"}`} />
    </div>
  );
}

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, itemCount, totalAmount, removeFromCart, loading: cartLoading, removingItemIds } = useCart();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const d = dark;

  const handleContinueToCheckout = () => {
    router.push("/checkout?source=cart");
  };

  const showSkeleton = cartLoading && items.length === 0;
  const hasItems = items.length > 0;

  return (
    <div className={`min-h-screen ${d ? "bg-[#0a0a0f] text-white" : "bg-gray-50 text-gray-900"}`}>
      {/* Header */}
      <div className={`sticky top-0 z-30 ${d ? "border-b border-gray-800 bg-[#0a0a0f]/80 backdrop-blur-xl" : "bg-white/80 backdrop-blur-xl border-b border-gray-200"}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
              <Sparkles size={14} className="text-white" />
            </div>
            <span className="text-base sm:text-lg font-bold">Nichu<span className="gradient-text">Store</span></span>
          </Link>
          <h1 className="text-sm sm:text-lg font-bold flex items-center gap-2">
            <ShoppingCart size={16} className="sm:w-5 sm:h-5" /> Cart ({itemCount})
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 sm:py-8">
        {showSkeleton ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-8">
            <div className="lg:col-span-2 space-y-3 sm:space-y-4">
              <CartItemSkeleton dark={d} />
              <CartItemSkeleton dark={d} />
              <CartItemSkeleton dark={d} />
            </div>
            <div className="lg:col-span-1">
              <OrderSummarySkeleton dark={d} />
            </div>
          </div>
        ) : !hasItems ? (
          <div className="text-center py-16 sm:py-20">
            <ShoppingCart size={48} className={`mx-auto mb-4 sm:w-16 sm:h-16 ${d ? "text-gray-700" : "text-gray-300"}`} />
            <h2 className="text-xl sm:text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className={`mb-6 text-sm sm:text-base ${d ? "text-gray-500" : "text-gray-500"}`}>Add some templates to get started</p>
            <Link href="/" className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl font-semibold inline-flex items-center gap-2 shadow-lg shadow-violet-500/25 transition-all text-sm sm:text-base">
              <ArrowLeft size={16} /> Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-3">
              {items.map((item) => {
                const colors = colorMap[item.product.color] || colorMap.emerald;
                const isRemoving = removingItemIds.has(item.id);
                const isTemp = item.id.startsWith("temp-");
                return (
                  <div key={item.id} className={`rounded-xl sm:rounded-2xl p-3 sm:p-5 flex items-center gap-3 sm:gap-4 transition-all duration-200 ${isRemoving ? "opacity-40 scale-[0.98]" : ""} ${isTemp ? "opacity-70" : ""} ${d ? "bg-gray-900/60 border border-gray-800" : "bg-white border border-gray-200"}`}>
                    <div className={`w-10 h-10 sm:w-14 sm:h-14 ${d ? colors.darkBg : colors.bg} rounded-lg sm:rounded-xl flex items-center justify-center ${d ? colors.darkText : colors.text} flex-shrink-0 [&>svg]:w-5 [&>svg]:h-5 sm:[&>svg]:w-6 sm:[&>svg]:h-6`}>
                      {iconMap[item.product.icon_name] || <FileSpreadsheet size={20} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-xs sm:text-base truncate">{item.product.name}</h3>
                      <p className={`text-[10px] sm:text-sm ${d ? "text-gray-500" : "text-gray-500"}`}>
                        {isTemp ? "Adding..." : "Digital Download"}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-bold text-xs sm:text-base">₹{item.product.price}</div>
                      {Number(item.product.original_price) > Number(item.product.price) && (
                        <div className={`text-[10px] sm:text-xs line-through ${d ? "text-gray-600" : "text-gray-400"}`}>₹{item.product.original_price}</div>
                      )}
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      disabled={isRemoving || isTemp}
                      className={`flex-shrink-0 p-1.5 sm:p-2 rounded-lg transition-all ${isRemoving ? "text-red-400" : "text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"} disabled:cursor-not-allowed`}
                    >
                      {isRemoving ? (
                        <Loader2 size={14} className="sm:w-[18px] sm:h-[18px] animate-spin" />
                      ) : (
                        <Trash2 size={14} className="sm:w-[18px] sm:h-[18px]" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className={`rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:sticky lg:top-24 ${d ? "bg-gray-900/60 border border-gray-800" : "bg-white border border-gray-200"}`}>
                <h3 className="font-bold text-base sm:text-lg mb-4">Order Summary</h3>
                <div className="space-y-3 text-sm mb-5">
                  <div className="flex justify-between">
                    <span className={d ? "text-gray-400" : "text-gray-500"}>Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})</span>
                    <span className="font-medium">₹{totalAmount}</span>
                  </div>
                  <div className={`pt-3 flex justify-between text-base ${d ? "border-t border-gray-800" : "border-t border-gray-100"}`}>
                    <span className="font-bold">Total</span>
                    <span className="font-bold">₹{totalAmount}</span>
                  </div>
                </div>

                <button
                  onClick={handleContinueToCheckout}
                  disabled={items.length === 0}
                  className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white py-3 sm:py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25 transition-all disabled:opacity-50 text-sm sm:text-base"
                >
                  Continue to Checkout <ArrowRight size={16} className="sm:w-[18px] sm:h-[18px]" />
                </button>

                <div className={`flex items-center justify-center gap-1.5 mt-3 text-[10px] sm:text-xs ${d ? "text-gray-600" : "text-gray-400"}`}>
                  <ShieldCheck size={12} /> Secure checkout
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile sticky bottom bar */}
      {hasItems && (
        <div className={`fixed bottom-0 left-0 right-0 z-40 lg:hidden ${d ? "bg-[#0a0a0f]/95 border-t border-gray-800 backdrop-blur-xl" : "bg-white/95 border-t border-gray-200 backdrop-blur-xl"}`}>
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <div>
              <p className={`text-[10px] ${d ? "text-gray-500" : "text-gray-400"}`}>{itemCount} {itemCount === 1 ? "item" : "items"}</p>
              <p className="font-bold text-base">₹{totalAmount}</p>
            </div>
            <button
              onClick={handleContinueToCheckout}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white py-2.5 px-6 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-violet-500/25 transition-all text-sm"
            >
              Checkout <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
