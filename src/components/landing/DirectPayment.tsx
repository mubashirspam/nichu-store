"use client";

import React, { useState } from "react";
import { ShieldCheck, Lock, CreditCard, CheckCircle, ArrowRight } from "lucide-react";
import { trackPurchase } from "./MetaPixel";

interface DirectPaymentProps {
  productId: string;
  productName: string;
  price: number;
  originalPrice: number;
  currency?: string;
  landingPageId: string;
  leadId: string | null;
  leadData: { name: string; email: string; phone: string } | null;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function DirectPayment({
  productId,
  productName,
  price,
  originalPrice,
  currency = "INR",
  landingPageId,
  leadId,
  leadData,
}: DirectPaymentProps) {
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const discount = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  const handlePayment = async () => {
    if (!leadData?.email) {
      document.getElementById("lead-form")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    setProcessing(true);
    setError("");
    try {
      const createRes = await fetch("/api/lp/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: leadData.email, name: leadData.name, phone: leadData.phone, productId, landingPageId, leadId }),
      });
      const orderData = await createRes.json();
      if (!createRes.ok) throw new Error(orderData.error || "Failed to create order");

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "NichuStore",
        description: productName,
        order_id: orderData.orderId,
        prefill: { name: leadData.name || "", email: leadData.email, contact: leadData.phone || "" },
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch("/api/lp/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                dbOrderId: orderData.dbOrderId,
                leadId,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyData.verified) {
              trackPurchase(price);
              setSuccess(true);
              setTimeout(() => {
                window.location.href = `/lp/success?payment_id=${response.razorpay_payment_id}&product=${encodeURIComponent(productName)}&order=${orderData.orderNumber}`;
              }, 1500);
            } else throw new Error("Verification failed");
          } catch { setError("Payment verification failed. Contact support."); }
        },
        modal: { ondismiss: () => setProcessing(false) },
        theme: { color: "#7c3aed" },
      };
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setProcessing(false);
    }
  };

  if (success) {
    return (
      <section id="payment" className="py-20 bg-[#0B0D11]">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-2xl p-10">
            <CheckCircle size={56} className="text-emerald-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Payment Successful! 🎉</h3>
            <p className="text-[#9CA3AF] text-sm">Redirecting to your download page...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="payment" className="relative py-20 sm:py-28 bg-[#0B0D11] overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-violet-600/8 rounded-full blur-[120px]" />

      <div className="relative z-10 max-w-md mx-auto px-4">
        <div className="text-center mb-10">
          <p className="text-violet-400 text-sm font-semibold uppercase tracking-widest mb-3">Checkout</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Complete Your Purchase
          </h2>
        </div>

        <div className="bg-[#111318] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
          {/* Product name */}
          <p className="text-[#9CA3AF] text-sm text-center mb-4">{productName}</p>

          {/* Price */}
          <div className="text-center mb-6">
            <div className="flex items-end justify-center gap-3">
              <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">₹{price}</span>
              {discount > 0 && (
                <span className="text-lg text-[#6B7280] line-through pb-1">₹{originalPrice}</span>
              )}
            </div>
            {discount > 0 && (
              <p className="mt-2 text-emerald-400 text-sm font-medium">
                You save ₹{originalPrice - price} ({discount}% off)
              </p>
            )}
          </div>

          {/* CTA */}
          <button
            onClick={handlePayment}
            disabled={processing}
            className="w-full group bg-white text-[#0B0D11] font-bold text-base py-4 rounded-xl transition-all duration-200 hover:bg-gray-100 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2.5"
          >
            <CreditCard size={18} />
            {processing ? "Processing..." : `Buy Now — ₹${price}`}
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </button>

          {error && <p className="mt-3 text-red-400 text-xs text-center">{error}</p>}

          {/* Trust */}
          <div className="mt-5 flex items-center justify-center gap-4 text-[#4B5563] text-[11px]">
            <span className="flex items-center gap-1"><Lock size={12} /> Secure</span>
            <span className="flex items-center gap-1"><ShieldCheck size={12} /> Safe Checkout</span>
            <span className="flex items-center gap-1"><CreditCard size={12} /> Razorpay</span>
          </div>
        </div>
      </div>
    </section>
  );
}
