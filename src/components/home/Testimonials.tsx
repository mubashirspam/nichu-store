"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

export default function Testimonials({ dark: d }: { dark: boolean }) {
  return (
    <section className="py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
            What Customers <span className="gradient-text">Say</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: "Rahul S.", text: "These trackers changed how I manage my goals. Charts update automatically — feels like a premium app!", rating: 5 },
            { name: "Priya M.", text: "Bought the expense planner and fitness tracker. Visualizations are amazing. I can finally see where my money goes.", rating: 5 },
            { name: "Arjun K.", text: "Best ₹299 I've spent. Everything is pre-built, I just enter data. Super easy and looks professional.", rating: 5 },
          ].map((r, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`rounded-2xl p-6 ${d ? "bg-gray-900/50 border border-gray-800" : "bg-white border border-gray-200"}`}
            >
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: r.rating }).map((_, i) => (
                  <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className={`text-sm mb-4 leading-relaxed ${d ? "text-gray-400" : "text-gray-600"}`}>
                &ldquo;{r.text}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                  {r.name[0]}
                </div>
                <span className="font-semibold text-sm">{r.name}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
