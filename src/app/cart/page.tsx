"use client";

import React, { useState } from "react";
import { ShoppingCart, Trash2, Tag, ArrowLeft, Dumbbell, ShieldCheck, CreditCard, TrendingUp, Apple, Ruler } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import LoginModal from "@/components/auth/LoginModal";

const iconMap: Record<string, React.ReactNode> = {
  Dumbbell: <Dumbbell size={24} />,
  TrendingUp: <TrendingUp size={24} />,
  Apple: <Apple size={24} />,
  Ruler: <Ruler size={24} />,
};

const colorMap: Record<string, { bg: string; text: string }> = {
  emerald: { bg: "bg-emerald-100", text: "text-emerald-600" },
  blue: { bg: "bg-blue-100", text: "text-blue-600" },
  orange: { bg: "bg-orange-100", text: "text-orange-600" },
  pink: { bg: "bg-pink-100", text: "text-pink-600" },
};

export default function CartPage() {
  const { user } = useAuth();
  const { items, itemCount, totalAmount, removeFromCart, loading: cartLoading } = useCart();
  const [offerCode, setOfferCode] = useState("");
  const [offerDiscount, setOfferDiscount] = useState(0);
  const [offerMessage, setOfferMessage] = useState("");
  const [offerError, setOfferError] = useState("");
  const [offerApplied, setOfferApplied] = useState(false);
  const [checkingCode, setCheckingCode] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

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
      setShowLogin(true);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Dumbbell size={16} className="text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">Nizam<span className="text-emerald-600">Store</span></span>
          </Link>
          <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <ShoppingCart size={20} />
            Cart ({itemCount})
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {cartLoading ? (
          <div className="text-center py-20 text-gray-500">Loading cart...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingCart size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Add some fitness trackers to get started</p>
            <Link href="/" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-semibold inline-flex items-center gap-2 transition-colors">
              <ArrowLeft size={16} />
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => {
                const colors = colorMap[item.product.color] || colorMap.emerald;
                return (
                  <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4">
                    <div className={`w-14 h-14 ${colors.bg} rounded-xl flex items-center justify-center ${colors.text} flex-shrink-0`}>
                      {iconMap[item.product.icon_name] || <Dumbbell size={24} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 truncate">{item.product.name}</h3>
                      <p className="text-sm text-gray-500">Digital Download · Excel</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-bold text-gray-900">₹{item.product.price}</div>
                      <div className="text-xs text-gray-400 line-through">₹{item.product.original_price}</div>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-24">
                <h3 className="font-bold text-gray-900 text-lg mb-4">Order Summary</h3>

                <div className="space-y-3 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal ({itemCount} items)</span>
                    <span className="font-medium">₹{totalAmount}</span>
                  </div>
                  {offerApplied && offerDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount</span>
                      <span className="font-medium">-₹{offerDiscount}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-100 pt-3 flex justify-between text-base">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="font-bold text-gray-900">₹{finalAmount}</span>
                  </div>
                </div>

                {/* Offer Code */}
                <div className="mb-4">
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Offer Code</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Enter code"
                        value={offerCode}
                        onChange={(e) => {
                          setOfferCode(e.target.value.toUpperCase());
                          if (offerApplied) {
                            setOfferApplied(false);
                            setOfferDiscount(0);
                            setOfferMessage("");
                          }
                        }}
                        disabled={offerApplied}
                        className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-50"
                      />
                    </div>
                    <button
                      onClick={handleApplyCode}
                      disabled={checkingCode || offerApplied || !offerCode.trim()}
                      className="px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-gray-800 transition-colors"
                    >
                      {checkingCode ? "..." : offerApplied ? "Applied" : "Apply"}
                    </button>
                  </div>
                  {offerMessage && <p className="text-xs text-emerald-600 mt-1">{offerMessage}</p>}
                  {offerError && <p className="text-xs text-red-500 mt-1">{offerError}</p>}
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  disabled={processing || items.length === 0}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <CreditCard size={18} />
                  {processing ? "Processing..." : `Pay ₹${finalAmount}`}
                </button>

                <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-gray-400">
                  <ShieldCheck size={12} />
                  Secure payment via Razorpay
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
