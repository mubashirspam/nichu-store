"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, ArrowRight, ShieldCheck, Lock, CheckCircle, Sparkles, Menu, X, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MetaPixel, { trackPurchase, trackLead } from "@/components/landing/MetaPixel";
import LandingHero from "@/components/landing/LandingHero";
import FeaturesTimeline from "@/components/landing/FeaturesTimeline";
import LandingTestimonials from "@/components/landing/LandingTestimonials";
import LandingFAQ from "@/components/landing/LandingFAQ";
import { useAuth } from "@/contexts/AuthContext";

interface PageData {
  id: string;
  productId: string;
  slug: string;
  metaPixelId: string | null;
  heroHeadline: string;
  heroSubheadline: string | null;
  heroVideoUrl: string | null;
  heroImageUrls: string[];
  heroCtaText: string;
  leadFormEnabled: boolean;
  leadFormHeadline: string | null;
  leadFormFields: string[];
  leadFormCtaText: string;
  leadFormVideoUrl: string | null;
  offerHeadline: string | null;
  offerExpiresAt: string | null;
  offerSlotsTotal: number;
  offerSlotsUsed: number;
  offerUrgencyText: string | null;
  testimonials: { name: string; text: string; avatar_url?: string; rating?: number }[];
  stats: { label: string; value: string }[];
  faqs: { question: string; answer: string }[];
  features: { title: string; description: string; image_url?: string; video_url?: string }[];
}

interface ProductData {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  currency: string;
}

interface LandingPageClientProps {
  page: PageData;
  product: ProductData;
}

export default function LandingPageClient({ page, product }: LandingPageClientProps) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const discount = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Silently capture lead when user is logged in
  const captureLeadSilently = async () => {
    if (!user) return;
    try {
      await fetch("/api/lp/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          landing_page_id: page.id,
          product_id: page.productId,
          name: user.fullName || null,
          email: user.email || null,
          phone: null,
          utm_source: new URLSearchParams(window.location.search).get("utm_source") || undefined,
          utm_medium: new URLSearchParams(window.location.search).get("utm_medium") || undefined,
          utm_campaign: new URLSearchParams(window.location.search).get("utm_campaign") || undefined,
        }),
      });
      trackLead(product.price);
    } catch {}
  };

  const handleBuyNow = async () => {
    if (authLoading) return;

    // Not logged in -> redirect to login, come back here after
    if (!user) {
      router.push(`/auth/sign-in?callbackURL=${encodeURIComponent(`/lp/${page.slug}`)}`);
      return;
    }

    // Capture lead silently
    captureLeadSilently();

    // Start payment
    setProcessing(true);
    setError("");

    try {
      const createRes = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{ product_id: page.productId }],
          offerCode: null,
        }),
      });
      const orderData = await createRes.json();
      if (!createRes.ok) throw new Error(orderData.error || "Failed to create order");

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "NichuStore",
        description: product.name,
        order_id: orderData.orderId,
        prefill: { name: user.fullName || "", email: user.email || "" },
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch("/api/orders/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                dbOrderId: orderData.dbOrderId,
                offerCode: null,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyData.verified) {
              trackPurchase(product.price);
              setSuccess(true);
              setTimeout(() => {
                window.location.href = "/orders?success=true";
              }, 1500);
            } else throw new Error("Verification failed");
          } catch {
            setError("Payment verification failed. Contact support.");
            setProcessing(false);
          }
        },
        modal: { ondismiss: () => setProcessing(false) },
        theme: { color: "#7c3aed" },
      };
      const razorpay = new (window as any).Razorpay(options);
      razorpay.on("payment.failed", () => {
        setProcessing(false);
        setError("Payment failed. Please try again.");
      });
      razorpay.open();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0D11] text-white">
      <MetaPixel pixelId={page.metaPixelId} />

      {/* ── Responsive Navbar ──────────────────────────── */}
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#0B0D11]/90 backdrop-blur-xl border-b border-white/[0.06] shadow-lg shadow-black/20" : "bg-transparent"}`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
              <Sparkles size={14} className="text-white" />
            </div>
            <span className="text-base sm:text-lg font-bold">Nichu<span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">Store</span></span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-4">
            {user ? (
              <span className="text-xs text-gray-400">Hi, {user.fullName || user.email}</span>
            ) : null}
            <button onClick={handleBuyNow} disabled={processing}
              className="bg-white text-[#0B0D11] font-bold text-sm px-5 py-2 rounded-lg hover:bg-gray-100 transition-all disabled:opacity-50 flex items-center gap-2">
              <ShoppingCart size={14} /> {page.heroCtaText || "Buy Now"} — ₹{product.price}
            </button>
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="sm:hidden p-2 text-gray-400 hover:text-white">
            {showMobileMenu ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="sm:hidden bg-[#0B0D11]/95 backdrop-blur-xl border-b border-white/[0.06] overflow-hidden"
            >
              <div className="px-4 py-4 space-y-3">
                {user && <p className="text-xs text-gray-500">Signed in as {user.email}</p>}
                <button onClick={() => { setShowMobileMenu(false); handleBuyNow(); }} disabled={processing}
                  className="w-full bg-white text-[#0B0D11] font-bold text-sm px-5 py-3 rounded-xl hover:bg-gray-100 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  <ShoppingCart size={14} /> {page.heroCtaText || "Buy Now"} — ₹{product.price}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* 1. Hero */}
      <LandingHero
        headline={page.heroHeadline}
        subheadline={page.heroSubheadline}
        videoUrl={page.heroVideoUrl}
        imageUrls={page.heroImageUrls}
        ctaText={page.heroCtaText}
        onCtaClick={handleBuyNow}
        price={product.price}
        originalPrice={product.originalPrice}
        offerExpiresAt={page.offerExpiresAt}
        offerSlotsTotal={page.offerSlotsTotal}
        offerSlotsUsed={page.offerSlotsUsed}
      />

      {/* 2. Stats bar */}
      {page.stats.length > 0 && (
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="py-10 bg-[#0B0D11] border-y border-white/[0.04]"
        >
          <div className="max-w-5xl mx-auto px-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 text-center">
              {page.stats.map((stat, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.1 }}>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{stat.value}</div>
                  <div className="text-xs text-[#6B7280] mt-1 uppercase tracking-wider">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* 3. Features Timeline */}
      {page.features.length > 0 && (
        <FeaturesTimeline features={page.features} sectionTitle="What's Inside" />
      )}

      {/* 4. Testimonials */}
      <LandingTestimonials testimonials={page.testimonials} />

      {/* 5. FAQ */}
      <LandingFAQ faqs={page.faqs} />

      {/* 6. Checkout section (inline) */}
      <section id="payment" className="relative py-20 sm:py-28 bg-[#0B0D11] overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-violet-600/8 rounded-full blur-[120px]" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-md mx-auto px-4"
        >
          {success ? (
            <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-2xl p-10 text-center">
              <CheckCircle size={56} className="text-emerald-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Payment Successful!</h3>
              <p className="text-[#9CA3AF] text-sm">Redirecting to your orders...</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-10">
                <p className="text-violet-400 text-sm font-semibold uppercase tracking-widest mb-3">Checkout</p>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  Complete Your Purchase
                </h2>
              </div>

              <div className="bg-[#111318] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
                <p className="text-[#9CA3AF] text-sm text-center mb-4">{product.name}</p>

                <div className="text-center mb-6">
                  <div className="flex items-end justify-center gap-3">
                    <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">₹{product.price}</span>
                    {discount > 0 && (
                      <span className="text-lg text-[#6B7280] line-through pb-1">₹{product.originalPrice}</span>
                    )}
                  </div>
                  {discount > 0 && (
                    <p className="mt-2 text-emerald-400 text-sm font-medium">
                      You save ₹{product.originalPrice - product.price} ({discount}% off)
                    </p>
                  )}
                </div>

                <button
                  onClick={handleBuyNow}
                  disabled={processing}
                  className="w-full group bg-white text-[#0B0D11] font-bold text-base py-4 rounded-xl transition-all duration-200 hover:bg-gray-100 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2.5"
                >
                  <CreditCard size={18} />
                  {processing ? "Processing..." : user ? `Pay ₹${product.price}` : "Sign In & Buy"}
                  <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </button>

                {error && <p className="mt-3 text-red-400 text-xs text-center">{error}</p>}

                <div className="mt-5 flex items-center justify-center gap-4 text-[#4B5563] text-[11px]">
                  <span className="flex items-center gap-1"><Lock size={12} /> Secure</span>
                  <span className="flex items-center gap-1"><ShieldCheck size={12} /> Safe Checkout</span>
                  <span className="flex items-center gap-1"><CreditCard size={12} /> Razorpay</span>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </section>

      {/* ── Floating CTA Button (always visible) ──────── */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="fixed bottom-0 left-0 right-0 z-50 sm:bottom-6 sm:left-auto sm:right-6 sm:w-auto"
      >
        <div className="sm:hidden bg-[#0B0D11]/95 backdrop-blur-xl border-t border-white/[0.06] px-4 py-3">
          <button
            onClick={handleBuyNow}
            disabled={processing || success}
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-sm py-3.5 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25"
          >
            <ShoppingCart size={16} />
            {processing ? "Processing..." : success ? "Success!" : `${page.heroCtaText || "Buy Now"} — ₹${product.price}`}
          </button>
        </div>
        <button
          onClick={handleBuyNow}
          disabled={processing || success}
          className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-sm px-6 py-3.5 rounded-xl transition-all disabled:opacity-50 shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/40 hover:scale-105 active:scale-[0.98]"
        >
          <ShoppingCart size={16} />
          {processing ? "Processing..." : success ? "Success!" : `${page.heroCtaText || "Buy Now"} — ₹${product.price}`}
        </button>
      </motion.div>

      {/* Footer */}
      <footer className="py-8 pb-24 sm:pb-8 bg-[#08090C] border-t border-white/[0.04] text-center">
        <p className="text-[#4B5563] text-xs">
          © {new Date().getFullYear()} NichuStore. All rights reserved.
        </p>
        <div className="flex items-center justify-center gap-4 mt-3">
          <a href="/privacy" className="text-[#4B5563] text-xs hover:text-[#9CA3AF] transition-colors">Privacy Policy</a>
          <a href="/terms" className="text-[#4B5563] text-xs hover:text-[#9CA3AF] transition-colors">Terms & Conditions</a>
          <a href="/refund" className="text-[#4B5563] text-xs hover:text-[#9CA3AF] transition-colors">Refund Policy</a>
        </div>
      </footer>
    </div>
  );
}
