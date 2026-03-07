"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Zap, Target, TrendingUp, Shield, Award } from "lucide-react";

interface Section {
  title: string;
  content: string;
  image_url?: string;
  layout?: "left" | "right";
}

interface ImageContentSectionsProps {
  sections: Section[];
}

const decorativeIcons = [Sparkles, Zap, Target, TrendingUp, Shield, Award];

export default function ImageContentSections({ sections }: ImageContentSectionsProps) {
  if (!sections || sections.length === 0) return null;

  return (
    <section className="relative py-20 sm:py-28 bg-[#0B0D11] overflow-hidden">
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 space-y-24 sm:space-y-32">
        {sections.map((section, index) => {
          const isLeft = section.layout === "left" || (!section.layout && index % 2 === 0);
          const Icon = decorativeIcons[index % decorativeIcons.length];
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
              className={`grid lg:grid-cols-2 gap-10 lg:gap-16 items-center ${!isLeft ? "lg:grid-flow-dense" : ""}`}
            >
              <motion.div
                initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className={`relative ${!isLeft ? "lg:col-start-2" : ""}`}
              >
                <div className="relative group">
                  <motion.div
                    animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className={`absolute ${isLeft ? "-right-12" : "-left-12"} top-1/4 w-32 h-32 bg-gradient-to-br from-violet-500/20 to-indigo-500/20 rounded-full blur-2xl`}
                  />
                  
                  <div className="absolute -inset-4 bg-gradient-to-br from-violet-600/20 via-indigo-600/20 to-purple-600/20 rounded-3xl blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                  
                  <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#111318] aspect-[4/3]">
                    {section.image_url ? (
                      <motion.img
                        src={section.image_url}
                        alt={section.title}
                        className="w-full h-full object-cover"
                        initial={{ scale: 1.1 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        whileHover={{ scale: 1.05 }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1a1d27] to-[#111318]">
                        <Sparkles size={64} className="text-white/10" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className={`absolute ${isLeft ? "-bottom-4 -right-4" : "-bottom-4 -left-4"} w-20 h-20 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-violet-500/30`}
                  >
                    <Icon size={32} className="text-white" strokeWidth={1.5} />
                  </motion.div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: isLeft ? 40 : -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className={`${!isLeft ? "lg:col-start-1 lg:row-start-1" : ""}`}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold px-3 py-1.5 rounded-full mb-5 uppercase tracking-wider"
                >
                  <Sparkles size={12} />
                  Feature #{index + 1}
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-white leading-[1.15] tracking-tight mb-6"
                >
                  {section.title}
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="text-base sm:text-lg text-[#9CA3AF] leading-relaxed"
                >
                  {section.content}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, scaleX: 0 }}
                  whileInView={{ opacity: 1, scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                  className="mt-6 h-1 w-20 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full origin-left"
                />
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
