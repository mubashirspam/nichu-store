"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck, Lock, CreditCard, User, Mail, AlertTriangle } from "lucide-react";

interface Props {
  product: { id: string; name: string; price: number; currency: string };
  open: boolean;
  onClose: () => void;
}


function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) return resolve(true);
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

export default function GuestCheckoutModal({ product, open, onClose }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"form" | "loading" | "error">("form");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === "loading") return;
    setStep("loading");
    setErrorMsg("");

    try {
      // 1. Load Razorpay script
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error("Failed to load payment library. Check your internet connection.");

      // 2. Create Razorpay order via our API
      const res = await fetch("/api/checkout/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, productId: product.id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to initiate checkout");

      // 3. Open Razorpay modal
      const rzp = new window.Razorpay({
        key: data.razorpayKeyId,
        amount: data.amount,
        currency: data.currency,
        name: "NichuStore",
        description: product.name,
        order_id: data.orderId,
        prefill: { name, email },
        theme: { color: "#7c3aed" },
        handler: (response: { razorpay_payment_id: string }) => {
          // Payment captured — webhook handles the rest
          const params = new URLSearchParams({
            email,
            product: encodeURIComponent(product.name),
            ref: response.razorpay_payment_id,
          });
          window.location.href = `/success?${params.toString()}`;
        },
        modal: {
          ondismiss: () => {
            setStep("form");
          },
        },
      });

      rzp.open();
      // Keep modal loading state while Razorpay is open
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setStep("error");
    }
  };

  const reset = () => {
    setStep("form");
    setErrorMsg("");
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[70] flex items-center justify-center px-4 pointer-events-none"
          >
            <div className="w-full max-w-sm bg-[#111318] border border-white/[0.08] rounded-2xl shadow-2xl pointer-events-auto">
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/[0.06]">
                <div>
                  <p className="text-xs text-violet-400 font-semibold uppercase tracking-widest mb-0.5">Checkout</p>
                  <h2 className="text-base font-bold text-white">{product.name}</h2>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-[#6B7280] hover:text-white transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Price */}
              <div className="px-6 py-4 flex items-center justify-between border-b border-white/[0.06]">
                <span className="text-sm text-[#9CA3AF]">Total</span>
                <span className="text-xl font-black text-white">
                  ₹{product.price}
                </span>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">Full Name</label>
                  <div className="relative">
                    <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563]" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      required
                      disabled={step === "loading"}
                      className="w-full bg-[#0B0D11] border border-white/[0.08] text-white placeholder-[#4B5563] text-sm rounded-xl pl-8 pr-4 py-2.5 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563]" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      disabled={step === "loading"}
                      className="w-full bg-[#0B0D11] border border-white/[0.08] text-white placeholder-[#4B5563] text-sm rounded-xl pl-8 pr-4 py-2.5 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
                    />
                  </div>
                  <p className="text-[10px] text-[#4B5563] mt-1">Your access link will be sent here</p>
                </div>

                {step === "error" && (
                  <div className="flex items-start gap-2 text-amber-400 text-xs bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2.5">
                    <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={step === "loading"}
                  onClick={step === "error" ? reset : undefined}
                  className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-sm py-3.5 rounded-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {step === "loading" ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Opening Payment…
                    </>
                  ) : (
                    <>
                      <CreditCard size={16} />
                      Pay ₹{product.price} with Razorpay
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-4 text-[#374151] text-[10px] pt-1">
                  <span className="flex items-center gap-1"><Lock size={10} /> Secure</span>
                  <span className="flex items-center gap-1"><ShieldCheck size={10} /> No account needed</span>
                  <span className="flex items-center gap-1"><CreditCard size={10} /> Razorpay</span>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
