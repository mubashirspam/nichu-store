"use client";

import React, { useState } from "react";
import { Send, CheckCircle, User, Mail, Phone } from "lucide-react";

interface LeadCaptureFormProps {
  landingPageId: string;
  productId: string;
  headline?: string | null;
  ctaText?: string;
  fields?: string[];
  videoUrl?: string | null;
  onLeadCaptured: (leadId: string, data: { name: string; email: string; phone: string }) => void;
}

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

export default function LeadCaptureForm({
  landingPageId,
  productId,
  headline = "Get Instant Access",
  ctaText = "Get Access Now",
  fields = ["name", "email", "phone"],
  videoUrl,
  onLeadCaptured,
}: LeadCaptureFormProps) {
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const youtubeId = videoUrl ? getYouTubeId(videoUrl) : null;

  const getUtmParams = () => {
    if (typeof window === "undefined") return {};
    const params = new URLSearchParams(window.location.search);
    return {
      utm_source: params.get("utm_source") || undefined,
      utm_medium: params.get("utm_medium") || undefined,
      utm_campaign: params.get("utm_campaign") || undefined,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (fields.includes("email") && !form.email) { setError("Email is required"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/lp/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          landing_page_id: landingPageId, product_id: productId,
          name: form.name || null, email: form.email || null, phone: form.phone || null,
          ...getUtmParams(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit");
      setSubmitted(true);
      onLeadCaptured(data.leadId, form);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <section id="lead-form" className="py-16 sm:py-20 bg-[#0B0D11]">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-2xl p-10">
            <CheckCircle size={44} className="text-emerald-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">You&apos;re In! 🎉</h3>
            <p className="text-[#9CA3AF] text-sm">Scroll down to complete your purchase and get instant access.</p>
          </div>
        </div>
      </section>
    );
  }

  const iconMap: Record<string, React.ReactNode> = {
    name: <User size={16} className="text-[#4B5563]" />,
    email: <Mail size={16} className="text-[#4B5563]" />,
    phone: <Phone size={16} className="text-[#4B5563]" />,
  };
  const placeholders: Record<string, string> = { name: "Full Name", email: "Email Address", phone: "Phone Number" };
  const types: Record<string, string> = { name: "text", email: "email", phone: "tel" };

  return (
    <section id="lead-form" className="relative py-16 sm:py-24 bg-[#0B0D11] overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-violet-600/10 rounded-full blur-[100px]" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
        <div className={`grid ${videoUrl ? "lg:grid-cols-2" : ""} gap-10 lg:gap-16 items-center`}>
          {/* Video */}
          {videoUrl && (
            <div>
              {youtubeId ? (
                <div className="rounded-xl overflow-hidden border border-white/10 aspect-video bg-[#111318]">
                  <iframe src={`https://www.youtube.com/embed/${youtubeId}?rel=0`} title="Video" className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                </div>
              ) : (
                <div className="rounded-xl overflow-hidden border border-white/10 aspect-video bg-[#111318]">
                  <video src={videoUrl} controls className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          )}

          {/* Form */}
          <div className={videoUrl ? "" : "max-w-md mx-auto w-full"}>
            <div className="bg-[#111318] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 text-center">{headline}</h2>
              <p className="text-[#6B7280] text-xs text-center mb-6">Fill in your details to continue</p>

              <form onSubmit={handleSubmit} className="space-y-3">
                {fields.map((field) => (
                  <div key={field} className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2">{iconMap[field]}</span>
                    <input
                      type={types[field] || "text"}
                      placeholder={placeholders[field] || field}
                      required={field === "email"}
                      value={(form as any)[field]}
                      onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm placeholder:text-[#4B5563] focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/30 transition-all"
                    />
                  </div>
                ))}

                {error && <p className="text-red-400 text-xs text-center">{error}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-white text-[#0B0D11] font-bold text-sm py-3.5 rounded-xl transition-all duration-200 hover:bg-gray-100 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Send size={16} />
                  {submitting ? "Submitting..." : ctaText}
                </button>

                <p className="text-[#4B5563] text-[11px] text-center">🔒 Your data is secure and never shared</p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
