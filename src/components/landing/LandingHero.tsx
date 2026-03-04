"use client";

import React, { useState, useEffect } from "react";
import { Play, Clock, Flame, ArrowRight, ShieldCheck, Zap } from "lucide-react";

interface LandingHeroProps {
  headline: string;
  subheadline?: string | null;
  videoUrl?: string | null;
  imageUrls?: string[];
  ctaText?: string;
  onCtaClick: () => void;
  price?: number;
  originalPrice?: number;
  offerExpiresAt?: string | null;
  offerSlotsTotal?: number;
  offerSlotsUsed?: number;
}

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

function useCountdown(targetDate: string | null) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0, expired: false });
  useEffect(() => {
    if (!targetDate) return;
    const target = new Date(targetDate).getTime();
    const update = () => {
      const diff = target - Date.now();
      if (diff <= 0) { setTimeLeft({ hours: 0, minutes: 0, seconds: 0, expired: true }); return; }
      setTimeLeft({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
        expired: false,
      });
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [targetDate]);
  return timeLeft;
}

export default function LandingHero({
  headline,
  subheadline,
  videoUrl,
  imageUrls = [],
  ctaText = "Get Instant Access",
  onCtaClick,
  price,
  originalPrice,
  offerExpiresAt,
  offerSlotsTotal = 100,
  offerSlotsUsed = 0,
}: LandingHeroProps) {
  const [currentImage, setCurrentImage] = useState(0);
  const countdown = useCountdown(offerExpiresAt || null);
  const discount = (price && originalPrice && originalPrice > price) ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  const slotsRemaining = Math.max(0, offerSlotsTotal - offerSlotsUsed);
  const gaugePercent = Math.min(100, (offerSlotsUsed / offerSlotsTotal) * 100);
  const [gauge, setGauge] = useState(0);

  useEffect(() => { const t = setTimeout(() => setGauge(gaugePercent), 600); return () => clearTimeout(t); }, [gaugePercent]);

  useEffect(() => {
    if (imageUrls.length <= 1) return;
    const timer = setInterval(() => setCurrentImage((p) => (p + 1) % imageUrls.length), 4000);
    return () => clearInterval(timer);
  }, [imageUrls.length]);

  const youtubeId = videoUrl ? getYouTubeId(videoUrl) : null;

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* BG — Railway-style: deep dark with subtle radial accents */}
      <div className="absolute inset-0 bg-[#0B0D11]" />
      {/* Dot grid overlay */}
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
      {/* Accent glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-violet-600/15 via-transparent to-transparent blur-3xl" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-tl from-indigo-600/10 to-transparent blur-3xl" />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        {/* Top urgency banner */}
        {offerExpiresAt && !countdown.expired && (
          <div className="flex items-center justify-center mb-8">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-full px-5 py-2.5">
              <Flame size={16} className="text-amber-400 animate-pulse" />
              <span className="text-amber-300 text-sm font-semibold tracking-wide">OFFER ENDS IN</span>
              <div className="flex items-center gap-1.5 font-mono">
                {[
                  { v: countdown.hours, l: "h" },
                  { v: countdown.minutes, l: "m" },
                  { v: countdown.seconds, l: "s" },
                ].map(({ v, l }) => (
                  <span key={l} className="bg-black/40 text-white text-sm font-bold px-2 py-0.5 rounded">
                    {String(v).padStart(2, "0")}{l}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* LEFT — Text + Price + CTA */}
          <div className="order-2 lg:order-1 text-center lg:text-left">
            {/* Discount badge */}
            {discount > 0 && (
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-full mb-5 uppercase tracking-wider">
                <Zap size={14} />
                {discount}% OFF — Limited Time
              </div>
            )}

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.4rem] font-extrabold text-white leading-[1.12] tracking-tight">
              {headline}
            </h1>

            {subheadline && (
              <p className="mt-5 text-base sm:text-lg text-[#9CA3AF] leading-relaxed max-w-lg mx-auto lg:mx-0">
                {subheadline}
              </p>
            )}

            {/* Price block */}
            {price && (
              <div className="mt-7 flex items-end gap-3 justify-center lg:justify-start">
                <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">₹{price}</span>
                {originalPrice && originalPrice > price && (
                  <span className="text-xl text-[#6B7280] line-through pb-1">₹{originalPrice}</span>
                )}
              </div>
            )}

            {/* CTA */}
            <button
              onClick={onCtaClick}
              className="mt-7 w-full sm:w-auto group inline-flex items-center justify-center gap-2.5 bg-white text-[#0B0D11] font-bold text-base sm:text-lg px-8 sm:px-12 py-4 rounded-xl transition-all duration-200 hover:bg-gray-100 hover:shadow-lg hover:shadow-white/10 active:scale-[0.98]"
            >
              {ctaText}
              <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Trust line */}
            <div className="mt-5 flex items-center gap-4 justify-center lg:justify-start text-[#6B7280] text-xs">
              <span className="flex items-center gap-1"><ShieldCheck size={13} /> Secure Checkout</span>
              <span>•</span>
              <span>Instant Access</span>
              <span>•</span>
              <span>7-Day Guarantee</span>
            </div>

            {/* Slots gauge — compact inline */}
            {offerSlotsUsed > 0 && (
              <div className="mt-6 max-w-xs mx-auto lg:mx-0">
                <div className="flex items-center justify-between text-xs text-[#9CA3AF] mb-1.5">
                  <span className="flex items-center gap-1"><Flame size={12} className="text-orange-400" /> {offerSlotsUsed} claimed</span>
                  <span className="text-orange-400 font-semibold">{slotsRemaining} left</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-1000 ease-out" style={{ width: `${gauge}%` }} />
                </div>
              </div>
            )}
          </div>

          {/* RIGHT — Media */}
          <div className="order-1 lg:order-2">
            <div className="relative">
              {/* Glow behind media */}
              <div className="absolute -inset-4 bg-gradient-to-br from-violet-600/20 to-indigo-600/20 rounded-3xl blur-2xl opacity-60" />

              {youtubeId ? (
                <div className="relative rounded-2xl overflow-hidden border border-white/10 aspect-video bg-[#111318]">
                  <iframe
                    src={`https://www.youtube.com/embed/${youtubeId}?autoplay=0&rel=0`}
                    title="Product Video"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : videoUrl ? (
                <div className="relative rounded-2xl overflow-hidden border border-white/10 aspect-video bg-[#111318]">
                  <video src={videoUrl} controls className="w-full h-full object-cover" poster={imageUrls[0] || undefined} />
                </div>
              ) : imageUrls.length > 0 ? (
                <div className="relative rounded-2xl overflow-hidden border border-white/10 aspect-video bg-[#111318]">
                  {imageUrls.map((url, i) => (
                    <img key={i} src={url} alt={`Product ${i + 1}`} className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i === currentImage ? "opacity-100" : "opacity-0"}`} />
                  ))}
                  {imageUrls.length > 1 && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                      {imageUrls.map((_, i) => (
                        <button key={i} onClick={() => setCurrentImage(i)} className={`w-2 h-2 rounded-full transition-all ${i === currentImage ? "bg-white w-5" : "bg-white/30"}`} />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden border border-white/10 aspect-video bg-gradient-to-br from-[#1a1d27] to-[#111318] flex items-center justify-center">
                  <Play size={56} className="text-white/20" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
