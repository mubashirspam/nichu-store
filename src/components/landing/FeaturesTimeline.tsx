"use client";

import React from "react";
import { CheckCircle } from "lucide-react";

interface Feature {
  title: string;
  description: string;
  image_url?: string;
  video_url?: string;
}

interface FeaturesTimelineProps {
  features: Feature[];
  sectionTitle?: string;
}

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

export default function FeaturesTimeline({ features, sectionTitle = "What's Inside" }: FeaturesTimelineProps) {
  if (!features || features.length === 0) return null;

  return (
    <section className="relative py-20 sm:py-28 bg-[#0B0D11] overflow-hidden">
      {/* Dot grid bg */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
        {/* Section header */}
        <div className="text-center mb-16 sm:mb-20">
          <p className="text-violet-400 text-sm font-semibold uppercase tracking-widest mb-3">Features</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            {sectionTitle}
          </h2>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 sm:left-1/2 sm:-translate-x-px top-0 bottom-0 w-px bg-gradient-to-b from-violet-600/40 via-indigo-600/20 to-transparent" />

          <div className="space-y-16 sm:space-y-20">
            {features.map((feature, i) => {
              const isLeft = i % 2 === 0;
              const youtubeId = feature.video_url ? getYouTubeId(feature.video_url) : null;
              const hasMedia = feature.image_url || feature.video_url;

              return (
                <div key={i} className="relative">
                  {/* Timeline dot */}
                  <div className="absolute left-6 sm:left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-violet-500 ring-4 ring-[#0B0D11] z-10" />

                  <div className={`sm:grid sm:grid-cols-2 sm:gap-12 items-center ${isLeft ? "" : "sm:direction-rtl"}`}>
                    {/* Text side */}
                    <div className={`pl-16 sm:pl-0 ${isLeft ? "sm:text-right sm:pr-12" : "sm:text-left sm:pl-12 sm:order-2"} mb-6 sm:mb-0`}>
                      <div className={`inline-flex items-center gap-2 text-violet-400 text-xs font-bold uppercase tracking-wider mb-3 ${isLeft ? "sm:flex-row-reverse" : ""}`}>
                        <CheckCircle size={14} />
                        <span>Step {i + 1}</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 leading-tight">
                        {feature.title}
                      </h3>
                      <p className="text-[#9CA3AF] text-sm sm:text-base leading-relaxed">
                        {feature.description}
                      </p>
                    </div>

                    {/* Media side */}
                    <div className={`pl-16 sm:pl-0 ${isLeft ? "sm:pl-12" : "sm:pr-12 sm:order-1"}`}>
                      {youtubeId ? (
                        <div className="rounded-xl overflow-hidden border border-white/10 aspect-video bg-[#111318]">
                          <iframe
                            src={`https://www.youtube.com/embed/${youtubeId}?rel=0`}
                            title={feature.title}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      ) : feature.video_url ? (
                        <div className="rounded-xl overflow-hidden border border-white/10 aspect-video bg-[#111318]">
                          <video src={feature.video_url} controls className="w-full h-full object-cover" />
                        </div>
                      ) : feature.image_url ? (
                        <div className="rounded-xl overflow-hidden border border-white/10 bg-[#111318]">
                          <img src={feature.image_url} alt={feature.title} className="w-full h-auto object-cover" />
                        </div>
                      ) : (
                        <div className="rounded-xl border border-white/5 bg-gradient-to-br from-violet-600/5 to-indigo-600/5 aspect-video flex items-center justify-center">
                          <div className="w-16 h-16 rounded-full bg-violet-600/10 flex items-center justify-center">
                            <CheckCircle size={28} className="text-violet-500/40" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
