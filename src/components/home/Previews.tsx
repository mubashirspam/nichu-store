"use client";

import React from "react";
import { motion } from "framer-motion";
import DashboardPreview from "./previews/DashboardPreview";
import ChartPreview from "./previews/ChartPreview";
import NutritionPreview from "./previews/NutritionPreview";

interface PreviewsProps {
  dark: boolean;
}

export default function Previews({ dark: d }: PreviewsProps) {
  return (
    <section id="previews" className={`py-20 px-6 ${d ? "bg-gray-900/30" : "bg-gray-50/80"}`}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
            See What You <span className="gradient-text">Get</span>
          </h2>
          <p className={`text-lg max-w-2xl mx-auto ${d ? "text-gray-400" : "text-gray-500"}`}>
            Real previews. Beautiful auto-updating charts.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { title: "Weekly Dashboard", desc: "Track all daily metrics in one glance", preview: <DashboardPreview dark={d} /> },
            { title: "Progress Charts", desc: "Auto-generated charts show your growth", preview: <ChartPreview dark={d} /> },
            { title: "Analytics View", desc: "Visualize data with beautiful breakdowns", preview: <NutritionPreview dark={d} /> },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className={`rounded-2xl overflow-hidden transition-all duration-300 ${d ? "bg-gray-900/60 border border-gray-800 hover:border-violet-500/30" : "bg-white border border-gray-200 hover:shadow-xl"}`}
            >
              <div className="p-4">{item.preview}</div>
              <div className="px-5 pb-5">
                <h3 className="font-bold mb-1">{item.title}</h3>
                <p className={`text-sm ${d ? "text-gray-500" : "text-gray-500"}`}>{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
