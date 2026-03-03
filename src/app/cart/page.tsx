"use client";

import React, { useState, useEffect } from "react";
import { ShoppingCart, Trash2, Tag, ArrowLeft, Sparkles, ShieldCheck, CreditCard, TrendingUp, Apple, Ruler, Dumbbell, FileSpreadsheet, Calculator, Wallet, Calendar, Target, Heart, BarChart3, Loader2 } from "lucide-react";
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
    <div className={`rounded-2xl p-5 flex items-center gap-4 animate-pulse ${d ? "bg-gray-900/60 border border-gray-800" : "bg-white border border-gray-200"}`}>
      <div className={`w-14 h-14 rounded-xl flex-shrink-0 ${d ? "bg-gray-800" : "bg-gray-200"}`} />
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
    <div className={`rounded-2xl p-6 sticky top-24 animate-pulse ${d ? "bg-gray-900/60 border border-gray-800" : "bg-white border border-gray-200"}`}>
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
  const [offerCode, setOfferCode] = useState("");
  const [offerDiscount, setOfferDiscount] = useState(0);
  const [offerMessage, setOfferMessage] = useState("");
  const [offerError, setOfferError] = useState("");
  const [offerApplied, setOfferApplied] = useState(false);
  const [checkingCode, setCheckingCode] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const d = dark;

  const handleApplyCode = async () => {
    if (!offerCode.trim()) return;
    setCheckingCode(true);
    setOfferError("");
    setOfferMessage("");

    try {
      const res = await fetch("/api/offer-codes/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: offerCode, cartTotal: totalAmount }),
      });
      const data = await res.json();

      if (res.ok && data.valid) {
        setOfferDiscount(data.discountAmount);
        setOfferMessage(data.message);
        setOfferApplied(true);
        setOfferError("");
      } else {
        setOfferError(data.error || "Invalid code");
        setOfferDiscount(0);
        setOfferApplied(false);
      }
    } catch {
      setOfferError("Failed to validate code");
    } finally {
      setCheckingCode(false);
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      router.push("/auth/sign-in?callbackURL=/cart");
      return;
    }

    setProcessing(true);
    try {
      const orderItems = items.map((item) => ({ product_id: item.product_id }));
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: orderItems,
          offerCode: offerApplied ? offerCode : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create order");

      // Open Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: data.amount,
        currency: data.currency,
        name: "Nizam Store",
        description: `Order ${data.orderNumber}`,
        order_id: data.orderId,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/orders/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                dbOrderId: data.dbOrderId,
                offerCode: offerApplied ? offerCode : null,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.verified) {
              window.location.href = `/orders/${data.dbOrderId}/?success=true`;
            } else {
              window.location.href = "/failed/";
            }
          } catch {
            window.location.href = "/failed/";
          }
        },
        prefill: { email: user.email || "" },
        theme: { color: "#10b981" },
        modal: {
          ondismiss: () => setProcessing(false),
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", () => {
        setProcessing(false);
        window.location.href = "/failed/";
      });
      rzp.open();
    } catch (error: any) {
      alert(error.message || "Failed to initiate payment");
      setProcessing(false);
    }
  };

  const finalAmount = Math.max(totalAmount - offerDiscount, 1);

  // Show skeleton while initial loading, but if we already have items show them
  const showSkeleton = cartLoading && items.length === 0;
  const hasItems = items.length > 0;

  return (
    <div className={`min-h-screen ${d ? "bg-[#0a0a0f] text-white" : "bg-gray-50 text-gray-900"}`}>

      <div className={`${d ? "border-b border-gray-800 bg-[#0a0a0f]/80" : "bg-white border-b border-gray-200"} glass`}>
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
              <Sparkles size={14} className="text-white" />
            </div>
            <span className="text-lg font-bold">Nichu<span className="gradient-text">Store</span></span>
          </Link>
          <h1 className="text-lg font-bold flex items-center gap-2">
            <ShoppingCart size={20} /> Cart ({itemCount})
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {showSkeleton ? (
          /* Skeleton loading state */
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <CartItemSkeleton dark={d} />
              <CartItemSkeleton dark={d} />
              <CartItemSkeleton dark={d} />
            </div>
            <div className="lg:col-span-1">
              <OrderSummarySkeleton dark={d} />
            </div>
          </div>
        ) : !hasItems ? (
          <div className="text-center py-20">
            <ShoppingCart size={64} className={`mx-auto mb-4 ${d ? "text-gray-700" : "text-gray-300"}`} />
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className={`mb-6 ${d ? "text-gray-500" : "text-gray-500"}`}>Add some templates to get started</p>
            <Link href="/" className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold inline-flex items-center gap-2 shadow-lg shadow-violet-500/25 transition-all">
              <ArrowLeft size={16} /> Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => {
                const colors = colorMap[item.product.color] || colorMap.emerald;
                const isRemoving = removingItemIds.has(item.id);
                const isTemp = item.id.startsWith("temp-");
                return (
                  <div key={item.id} className={`rounded-2xl p-5 flex items-center gap-4 transition-all duration-200 ${isRemoving ? "opacity-40 scale-[0.98]" : ""} ${isTemp ? "opacity-70" : ""} ${d ? "bg-gray-900/60 border border-gray-800" : "bg-white border border-gray-200"}`}>
                    <div className={`w-14 h-14 ${d ? colors.darkBg : colors.bg} rounded-xl flex items-center justify-center ${d ? colors.darkText : colors.text} flex-shrink-0`}>
                      {iconMap[item.product.icon_name] || <FileSpreadsheet size={24} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold truncate">{item.product.name}</h3>
                      <p className={`text-sm ${d ? "text-gray-500" : "text-gray-500"}`}>
                        {isTemp ? "Adding to cart..." : "Digital Download · Excel"}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-bold">₹{item.product.price}</div>
                      <div className={`text-xs line-through ${d ? "text-gray-600" : "text-gray-400"}`}>₹{item.product.original_price}</div>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      disabled={isRemoving || isTemp}
                      className={`flex-shrink-0 p-2 rounded-lg transition-all ${isRemoving ? "text-red-400" : "text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"} disabled:cursor-not-allowed`}
                    >
                      {isRemoving ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Trash2 size={18} />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="lg:col-span-1">
              <div className={`rounded-2xl p-6 sticky top-24 ${d ? "bg-gray-900/60 border border-gray-800" : "bg-white border border-gray-200"}`}>
                <h3 className="font-bold text-lg mb-4">Order Summary</h3>
                <div className="space-y-3 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className={d ? "text-gray-400" : "text-gray-500"}>Subtotal ({itemCount} items)</span>
                    <span className="font-medium">₹{totalAmount}</span>
                  </div>
                  {offerApplied && offerDiscount > 0 && (
                    <div className="flex justify-between text-violet-500">
                      <span>Discount</span>
                      <span className="font-medium">-₹{offerDiscount}</span>
                    </div>
                  )}
                  <div className={`pt-3 flex justify-between text-base ${d ? "border-t border-gray-800" : "border-t border-gray-100"}`}>
                    <span className="font-bold">Total</span>
                    <span className="font-bold">₹{finalAmount}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <label className={`text-xs font-medium mb-1 block ${d ? "text-gray-500" : "text-gray-500"}`}>Offer Code</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${d ? "text-gray-600" : "text-gray-400"}`} />
                      <input type="text" placeholder="Enter code" value={offerCode}
                        onChange={(e) => { setOfferCode(e.target.value.toUpperCase()); if (offerApplied) { setOfferApplied(false); setOfferDiscount(0); setOfferMessage(""); } }}
                        disabled={offerApplied}
                        className={`w-full pl-9 pr-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 ${d ? "bg-gray-800 border border-gray-700 text-white disabled:bg-gray-800/50" : "border border-gray-200 disabled:bg-gray-50"}`} />
                    </div>
                    <button onClick={handleApplyCode} disabled={checkingCode || offerApplied || !offerCode.trim()}
                      className={`px-4 py-2.5 rounded-lg text-sm font-medium disabled:opacity-40 transition-colors ${d ? "bg-white text-gray-900 hover:bg-gray-200" : "bg-gray-900 text-white hover:bg-gray-800"}`}>
                      {checkingCode ? "..." : offerApplied ? "Applied" : "Apply"}
                    </button>
                  </div>
                  {offerMessage && <p className="text-xs text-violet-500 mt-1">{offerMessage}</p>}
                  {offerError && <p className="text-xs text-red-500 mt-1">{offerError}</p>}
                </div>

                <button onClick={handleCheckout} disabled={processing || items.length === 0}
                  className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25 transition-all disabled:opacity-50">
                  <CreditCard size={18} /> {processing ? "Processing..." : `Pay ₹${finalAmount}`}
                </button>

                <div className={`flex items-center justify-center gap-1.5 mt-3 text-xs ${d ? "text-gray-600" : "text-gray-400"}`}>
                  <ShieldCheck size={12} /> Secure payment via Razorpay
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
