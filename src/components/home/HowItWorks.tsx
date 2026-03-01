"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Download, BarChart3 } from "lucide-react";

export default function HowItWorks({ dark: d }: { dark: boolean }) {
  return (
    <section className="py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className={`text-lg max-w-2xl mx-auto ${d ? "text-gray-400" : "text-gray-500"}`}>
            Get started in 3 simple steps
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: "01", title: "Pick Your Template", desc: "Browse our collection of beautifully designed Excel templates.", icon: <ShoppingCart size={24} /> },
            { step: "02", title: "Pay & Download", desc: "Secure checkout via Razorpay. Instant access to your files.", icon: <Download size={24} /> },
            { step: "03", title: "Track & Grow", desc: "Open in Excel or Sheets, enter data, watch charts come alive.", icon: <BarChart3 size={24} /> },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className={`p-6 rounded-2xl text-center transition-all ${
                d ? "bg-gray-900/50 border border-gray-800 hover:border-violet-500/30" : "bg-gray-50 border border-gray-100 hover:border-violet-300"
              }`}
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-violet-500/25">
                {item.icon}
              </div>
              <span className={`text-xs font-bold ${d ? "text-gray-600" : "text-gray-300"}`}>STEP {item.step}</span>
              <h3 className="text-lg font-bold mt-1 mb-2">{item.title}</h3>
              <p className={`text-sm ${d ? "text-gray-500" : "text-gray-500"}`}>{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
