"use client";

import React, { useState, useEffect, Suspense } from "react";
import { ShoppingCart, CreditCard, ArrowLeft, Sparkles, ShieldCheck, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useProducts } from "@/contexts/ProductContext";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { products } = useProducts();
  const [processing, setProcessing] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const productId = searchParams.get("product");
  const product = products.find(p => p.id === productId);

  useEffect(() => {
    if (!user) {
      router.push(`/auth/sign-in?callbackURL=${encodeURIComponent(`/checkout?product=${productId}`)}`);
    }
  }, [user, router, productId]);

  const handleCheckout = async () => {
    if (!user || !product) return;

    setProcessing(true);
    try {
      const orderItems = [{ product_id: product.id }];
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: orderItems,
          offerCode: null,
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
                offerCode: null,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.verified) {
              window.location.href = "/orders?success=true";
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

  const d = dark;

  if (!product) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${d ? "bg-[#0a0a0f] text-white" : "bg-gray-50 text-gray-900"}`}>
        <div className="text-center">
          <Loader2 size={48} className="mx-auto mb-4 animate-spin text-violet-500" />
          <p className={d ? "text-gray-400" : "text-gray-500"}>Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${d ? "bg-[#0a0a0f] text-white" : "bg-gray-50 text-gray-900"}`}>
      <div className={`${d ? "border-b border-gray-800 bg-[#0a0a0f]/80" : "bg-white border-b border-gray-200"} glass`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
              <Sparkles size={14} className="text-white" />
            </div>
            <span className="text-lg font-bold">Nichu<span className="gradient-text">Store</span></span>
          </Link>
          <h1 className="text-base sm:text-lg font-bold flex items-center gap-2">
            <ShoppingCart size={20} /> Checkout
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Link href="/" className={`inline-flex items-center gap-2 text-sm mb-6 transition-colors ${d ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"}`}>
          <ArrowLeft size={16} /> Back to store
        </Link>

        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2">
            <div className={`rounded-2xl p-4 sm:p-6 ${d ? "bg-gray-900/60 border border-gray-800" : "bg-white border border-gray-200"}`}>
              <h2 className="text-xl font-bold mb-4">Order Details</h2>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 ${d ? "bg-violet-500/10 text-violet-400" : "bg-violet-100 text-violet-600"}`}>
                  <ShoppingCart size={28} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg">{product.name}</h3>
                  <p className={`text-sm ${d ? "text-gray-500" : "text-gray-500"}`}>Digital Download · Excel Template</p>
                </div>
                <div className="text-left sm:text-right flex-shrink-0">
                  <div className="font-bold text-xl">₹{product.price}</div>
                  <div className={`text-sm line-through ${d ? "text-gray-600" : "text-gray-400"}`}>₹{product.original_price}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className={`rounded-2xl p-4 sm:p-6 sticky top-24 ${d ? "bg-gray-900/60 border border-gray-800" : "bg-white border border-gray-200"}`}>
              <h3 className="font-bold text-lg mb-4">Payment Summary</h3>
              <div className="space-y-3 text-sm mb-4">
                <div className="flex justify-between">
                  <span className={d ? "text-gray-400" : "text-gray-500"}>Subtotal</span>
                  <span className="font-medium">₹{product.price}</span>
                </div>
                <div className={`pt-3 flex justify-between text-base ${d ? "border-t border-gray-800" : "border-t border-gray-100"}`}>
                  <span className="font-bold">Total</span>
                  <span className="font-bold">₹{product.price}</span>
                </div>
              </div>

              <button onClick={handleCheckout} disabled={processing}
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white py-3 sm:py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25 transition-all disabled:opacity-50 text-sm sm:text-base">
                <CreditCard size={18} /> {processing ? "Processing..." : `Pay ₹${product.price}`}
              </button>

              <div className={`flex items-center justify-center gap-1.5 mt-3 text-xs ${d ? "text-gray-600" : "text-gray-400"}`}>
                <ShieldCheck size={12} /> Secure payment via Razorpay
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={48} className="animate-spin text-violet-500" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
