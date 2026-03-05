"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

interface Testimonial {
  name: string;
  text: string;
  avatar_url?: string;
  rating?: number;
}

interface LandingTestimonialsProps {
  testimonials: Testimonial[];
}

export default function LandingTestimonials({ testimonials }: LandingTestimonialsProps) {
  if (!testimonials || testimonials.length === 0) return null;

  return (
    <section className="relative py-20 sm:py-28 bg-[#0B0D11] overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
      <div className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-violet-600/8 rounded-full blur-[120px]" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <p className="text-violet-400 text-sm font-semibold uppercase tracking-widest mb-3">Social Proof</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            What Our Customers Say
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="group bg-[#111318] border border-white/[0.06] rounded-xl p-6 transition-all duration-300 hover:border-violet-500/20 hover:bg-[#13161d]"
            >
              <Quote size={20} className="text-violet-500/20 mb-4" />

              {/* Rating */}
              {t.rating && t.rating > 0 && (
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} size={14} className={j < t.rating! ? "text-amber-400 fill-amber-400" : "text-[#374151]"} />
                  ))}
                </div>
              )}

              <p className="text-[#D1D5DB] text-sm leading-relaxed mb-5">&ldquo;{t.text}&rdquo;</p>

              <div className="flex items-center gap-3 pt-4 border-t border-white/[0.04]">
                {t.avatar_url ? (
                  <img src={t.avatar_url} alt={t.name} className="w-9 h-9 rounded-full object-cover" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                    {t.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-white text-sm font-medium">{t.name}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
