"use client";

import React, { useState, useEffect } from "react";
import { Clock, Flame, Zap } from "lucide-react";

interface OfferGaugeProps {
  headline?: string | null;
  expiresAt?: string | null;
  slotsTotal?: number;
  slotsUsed?: number;
  urgencyText?: string | null;
}

function useCountdown(targetDate: string | null) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: false });

  useEffect(() => {
    if (!targetDate) return;
    const target = new Date(targetDate).getTime();

    const update = () => {
      const now = Date.now();
      const diff = target - now;
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
        expired: false,
      });
    };

    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
}

export default function OfferGauge({
  headline = "🔥 Limited Time Offer",
  expiresAt,
  slotsTotal = 100,
  slotsUsed = 0,
  urgencyText,
}: OfferGaugeProps) {
  const countdown = useCountdown(expiresAt || null);
  const slotsRemaining = Math.max(0, slotsTotal - slotsUsed);
  const percentUsed = Math.min(100, (slotsUsed / slotsTotal) * 100);

  // Animated gauge on mount
  const [gaugeWidth, setGaugeWidth] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => setGaugeWidth(percentUsed), 500);
    return () => clearTimeout(timer);
  }, [percentUsed]);

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-b from-gray-900 to-gray-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-br from-orange-500/10 via-red-500/10 to-pink-500/10 border border-orange-500/20 rounded-2xl p-6 sm:p-10">
          {/* Headline */}
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-8">
            {headline}
          </h2>

          {/* Countdown Timer */}
          {expiresAt && !countdown.expired && (
            <div className="mb-8">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-4">
                <Clock size={16} className="text-orange-400" />
                <span>Offer ends in</span>
              </div>
              <div className="grid grid-cols-4 gap-3 max-w-sm mx-auto">
                {[
                  { value: countdown.days, label: "Days" },
                  { value: countdown.hours, label: "Hours" },
                  { value: countdown.minutes, label: "Mins" },
                  { value: countdown.seconds, label: "Secs" },
                ].map(({ value, label }) => (
                  <div key={label} className="bg-black/30 border border-white/10 rounded-xl p-3 text-center">
                    <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                      {String(value).padStart(2, "0")}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 uppercase tracking-wider">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {countdown.expired && expiresAt && (
            <div className="mb-8 text-center">
              <p className="text-red-400 font-bold text-lg">⏰ Offer has expired!</p>
            </div>
          )}

          {/* Spots Gauge */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Flame size={16} className="text-orange-400" />
                <span>Spots claimed</span>
              </div>
              <span className="text-sm font-bold text-orange-400">
                {slotsUsed} / {slotsTotal}
              </span>
            </div>
            <div className="w-full h-4 bg-black/30 rounded-full overflow-hidden border border-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 transition-all duration-1000 ease-out relative"
                style={{ width: `${gaugeWidth}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
              </div>
            </div>
          </div>

          {/* Urgency text */}
          {urgencyText ? (
            <div className="text-center">
              <p className="inline-flex items-center gap-2 text-orange-400 font-bold text-lg animate-pulse">
                <Zap size={20} className="text-yellow-400" />
                {urgencyText}
              </p>
            </div>
          ) : slotsRemaining > 0 && slotsRemaining <= 20 ? (
            <div className="text-center">
              <p className="inline-flex items-center gap-2 text-orange-400 font-bold text-lg animate-pulse">
                <Zap size={20} className="text-yellow-400" />
                Only {slotsRemaining} spots remaining!
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
