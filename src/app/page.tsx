"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle,
  ShoppingCart,
  Shield,
  Sparkles,
  Star,
  ArrowRight,
  FileText,
  Clock,
  Target,
  BarChart3,
  ChevronDown,
} from "lucide-react";

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image?: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  notes?: Record<string, string>;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, callback: () => void) => void;
}

const PRODUCT = {
  name: "The Ultimate Habit Tracker",
  price: 99,
  originalPrice: 299,
  currency: "INR",
  description:
    "A beautifully designed digital habit tracker to help you build powerful daily habits, track your progress, and transform your life.",
  features: [
    "30-day habit tracking sheets",
    "Weekly review templates",
    "Goal setting framework",
    "Progress analytics dashboard",
    "Printable & digital formats",
    "Lifetime access to updates",
  ],
};

// ─── RAZORPAY KEY ────────────────────────────────────────────────
// Replace with your Razorpay Key ID from https://dashboard.razorpay.com
const RAZORPAY_KEY_ID = "rzp_test_XXXXXXXXXXXXXXX";

export default function StorePage() {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBuyNow = () => {
    setIsProcessing(true);

    const options: RazorpayOptions = {
      key: RAZORPAY_KEY_ID,
      amount: PRODUCT.price * 100, // Razorpay expects amount in paise
      currency: PRODUCT.currency,
      name: "Nizam Store",
      description: PRODUCT.name,
      handler: function (response: RazorpayResponse) {
        // Payment successful
        alert(
          `Payment successful! Payment ID: ${response.razorpay_payment_id}\n\nYou will receive the Habit Tracker via email shortly.`
        );
        setIsProcessing(false);
      },
      prefill: {
        name: "",
        email: "",
        contact: "",
      },
      theme: {
        color: "#7c3aed",
      },
      notes: {
        product: PRODUCT.name,
      },
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function () {
        alert("Payment failed. Please try again.");
        setIsProcessing(false);
      });
      rzp.open();
    } catch {
      alert("Unable to load payment gateway. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-black/20 backdrop-blur-lg z-50 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <a
              href="https://marketingnizam.com"
              className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
            >
              Nizam Store
            </a>
            <div className="flex items-center gap-6">
              <a
                href="https://marketingnizam.com"
                className="text-white/70 hover:text-purple-400 transition-colors text-sm"
              >
                ← Back to Main Site
              </a>
              <button
                onClick={handleBuyNow}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-5 py-2 rounded-full font-semibold text-sm flex items-center gap-2 transition-all duration-300"
              >
                <ShoppingCart size={16} />
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-28 pb-16 px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/10 rounded-full blur-3xl"></div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Left - Product Info */}
            <div className="lg:w-1/2">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 rounded-full text-purple-300 text-sm mb-6">
                  <Sparkles size={16} />
                  Digital Product by Nizamudheen KC
                </div>

                <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                  The Ultimate{" "}
                  <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Habit Tracker
                  </span>
                </h1>

                <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                  {PRODUCT.description}
                </p>

                {/* Price */}
                <div className="flex items-center gap-4 mb-8">
                  <span className="text-4xl font-bold text-white">
                    ₹{PRODUCT.price}
                  </span>
                  <span className="text-xl text-gray-500 line-through">
                    ₹{PRODUCT.originalPrice}
                  </span>
                  <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-semibold">
                    {Math.round(
                      ((PRODUCT.originalPrice - PRODUCT.price) /
                        PRODUCT.originalPrice) *
                        100
                    )}
                    % OFF
                  </span>
                </div>

                <button
                  onClick={handleBuyNow}
                  disabled={isProcessing}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-10 py-4 rounded-full font-semibold text-lg flex items-center gap-3 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    "Processing..."
                  ) : (
                    <>
                      <ShoppingCart size={22} />
                      Buy Now — ₹{PRODUCT.price}
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2 mt-4 text-gray-400 text-sm">
                  <Shield size={14} />
                  Secure payment via Razorpay
                </div>
              </motion.div>
            </div>

            {/* Right - Product Visual */}
            <div className="lg:w-1/2">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl blur-3xl opacity-20 animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-purple-500/30 rounded-3xl p-8 md:p-12">
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Target size={40} className="text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Habit Tracker</h3>
                    <p className="text-gray-400">
                      Your path to a better daily routine
                    </p>
                  </div>

                  {/* Feature Preview */}
                  <div className="space-y-4">
                    {[
                      {
                        icon: <Clock size={18} />,
                        text: "Track habits daily, weekly & monthly",
                      },
                      {
                        icon: <BarChart3 size={18} />,
                        text: "Visual progress charts & analytics",
                      },
                      {
                        icon: <Target size={18} />,
                        text: "Set & achieve meaningful goals",
                      },
                      {
                        icon: <FileText size={18} />,
                        text: "Print-ready & digital versions",
                      },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 bg-white/5 rounded-xl p-3"
                      >
                        <div className="text-purple-400">{item.icon}</div>
                        <span className="text-gray-300 text-sm">
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              What&apos;s{" "}
              <span className="text-purple-400">Inside</span>
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Everything you need to build lasting habits and transform your productivity.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PRODUCT.features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/20 rounded-2xl p-6 hover:border-purple-400/40 transition-all duration-300"
              >
                <CheckCircle
                  size={24}
                  className="text-purple-400 mb-3"
                />
                <p className="text-gray-200 font-medium">{feature}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-12">
            Why People <span className="text-purple-400">Love It</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              { number: "500+", label: "Happy Customers" },
              { number: "4.9", label: "Average Rating" },
              { number: "30+", label: "Pages of Content" },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          <div className="flex justify-center gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={24}
                className="text-yellow-400 fill-yellow-400"
              />
            ))}
          </div>
          <p className="text-gray-400 text-sm">
            Rated 4.9/5 by our customers
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border border-purple-500/30 rounded-3xl p-8 md:p-12 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Transform Your Habits?
            </h2>
            <p className="text-gray-300 text-lg mb-8 max-w-xl mx-auto">
              Start building powerful daily habits today. One-time purchase,
              lifetime access. No subscriptions.
            </p>

            <div className="flex items-center justify-center gap-4 mb-8">
              <span className="text-4xl font-bold">₹{PRODUCT.price}</span>
              <span className="text-xl text-gray-500 line-through">
                ₹{PRODUCT.originalPrice}
              </span>
            </div>

            <button
              onClick={handleBuyNow}
              disabled={isProcessing}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-10 py-4 rounded-full font-semibold text-lg inline-flex items-center gap-3 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/25 disabled:opacity-50"
            >
              {isProcessing ? (
                "Processing..."
              ) : (
                <>
                  Get It Now <ArrowRight size={22} />
                </>
              )}
            </button>

            <p className="text-gray-500 text-xs mt-4">
              By purchasing, you agree to our{" "}
              <a
                href="/terms/"
                className="text-purple-400 hover:underline"
              >
                Terms & Conditions
              </a>{" "}
              and{" "}
              <a
                href="/refund/"
                className="text-purple-400 hover:underline"
              >
                Refund Policy
              </a>
              .
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <a
                href="https://marketingnizam.com"
                className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
              >
                Nizam Store
              </a>
              <p className="text-gray-500 text-sm mt-1">
                Digital Products by Nizamudheen KC
              </p>
            </div>

            <div className="flex gap-6 text-sm">
              <a
                href="/privacy/"
                className="text-gray-400 hover:text-purple-400 transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="/terms/"
                className="text-gray-400 hover:text-purple-400 transition-colors"
              >
                Terms & Conditions
              </a>
              <a
                href="/refund/"
                className="text-gray-400 hover:text-purple-400 transition-colors"
              >
                Refund Policy
              </a>
              <a
                href="https://marketingnizam.com"
                className="text-gray-400 hover:text-purple-400 transition-colors"
              >
                Main Site
              </a>
            </div>
          </div>

          <div className="text-center text-gray-600 text-xs mt-8">
            © {new Date().getFullYear()} Nizamudheen KC. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Scroll to top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-8 right-8 bg-purple-600 hover:bg-purple-700 p-3 rounded-full transition-all duration-300 transform hover:scale-110"
      >
        <ChevronDown className="rotate-180" size={24} />
      </button>
    </div>
  );
}
