"use client";

import React from "react";
import { motion } from "framer-motion";

export default function Stats({ dark: d }: { dark: boolean }) {
  return (
    <section className={`py-12 px-6 ${d ? "border-y border-gray-800/50" : "border-y border-gray-100"}`}>
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {[
          { number: "500+", label: "Happy Customers" },
          { number: "4.9★", label: "Average Rating" },
          { number: "10+", label: "Templates" },
          { number: "24/7", label: "Support" },
        ].map((stat, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: idx * 0.1 }}>
            <div className="text-3xl font-extrabold gradient-text">{stat.number}</div>
            <div className={`text-sm mt-1 ${d ? "text-gray-500" : "text-gray-500"}`}>{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
