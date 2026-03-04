"use client";

import React, { useState } from "react";
import MetaPixel, { trackLead } from "@/components/landing/MetaPixel";
import LandingHero from "@/components/landing/LandingHero";
import LeadCaptureForm from "@/components/landing/LeadCaptureForm";
import FeaturesTimeline from "@/components/landing/FeaturesTimeline";
import DirectPayment from "@/components/landing/DirectPayment";
import LandingTestimonials from "@/components/landing/LandingTestimonials";
import LandingFAQ from "@/components/landing/LandingFAQ";

interface PageData {
  id: string;
  productId: string;
  slug: string;
  metaPixelId: string | null;
  heroHeadline: string;
  heroSubheadline: string | null;
  heroVideoUrl: string | null;
  heroImageUrls: string[];
  heroCtaText: string;
  leadFormEnabled: boolean;
  leadFormHeadline: string | null;
  leadFormFields: string[];
  leadFormCtaText: string;
  leadFormVideoUrl: string | null;
  offerHeadline: string | null;
  offerExpiresAt: string | null;
  offerSlotsTotal: number;
  offerSlotsUsed: number;
  offerUrgencyText: string | null;
  testimonials: { name: string; text: string; avatar_url?: string; rating?: number }[];
  stats: { label: string; value: string }[];
  faqs: { question: string; answer: string }[];
  features: { title: string; description: string; image_url?: string; video_url?: string }[];
}

interface ProductData {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  currency: string;
}

interface LandingPageClientProps {
  page: PageData;
  product: ProductData;
}

export default function LandingPageClient({ page, product }: LandingPageClientProps) {
  const [leadId, setLeadId] = useState<string | null>(null);
  const [leadData, setLeadData] = useState<{ name: string; email: string; phone: string } | null>(null);

  const handleCtaClick = () => {
    if (page.leadFormEnabled) {
      document.getElementById("lead-form")?.scrollIntoView({ behavior: "smooth" });
    } else {
      document.getElementById("payment")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleLeadCaptured = (id: string, data: { name: string; email: string; phone: string }) => {
    setLeadId(id);
    setLeadData(data);
    trackLead(product.price);
    setTimeout(() => {
      document.getElementById("payment")?.scrollIntoView({ behavior: "smooth" });
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#0B0D11] text-white">
      <MetaPixel pixelId={page.metaPixelId} />

      {/* 1. Hero — everything above the fold */}
      <LandingHero
        headline={page.heroHeadline}
        subheadline={page.heroSubheadline}
        videoUrl={page.heroVideoUrl}
        imageUrls={page.heroImageUrls}
        ctaText={page.heroCtaText}
        onCtaClick={handleCtaClick}
        price={product.price}
        originalPrice={product.originalPrice}
        offerExpiresAt={page.offerExpiresAt}
        offerSlotsTotal={page.offerSlotsTotal}
        offerSlotsUsed={page.offerSlotsUsed}
      />

      {/* 2. Stats bar */}
      {page.stats.length > 0 && (
        <section className="py-10 bg-[#0B0D11] border-y border-white/[0.04]">
          <div className="max-w-5xl mx-auto px-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
              {page.stats.map((stat, i) => (
                <div key={i}>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{stat.value}</div>
                  <div className="text-xs text-[#6B7280] mt-1 uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. Features Timeline */}
      {page.features.length > 0 && (
        <FeaturesTimeline features={page.features} sectionTitle="What's Inside" />
      )}

      {/* 4. Lead Capture Form */}
      {page.leadFormEnabled && (
        <LeadCaptureForm
          landingPageId={page.id}
          productId={page.productId}
          headline={page.leadFormHeadline}
          ctaText={page.leadFormCtaText}
          fields={page.leadFormFields}
          videoUrl={page.leadFormVideoUrl}
          onLeadCaptured={handleLeadCaptured}
        />
      )}

      {/* 5. Testimonials */}
      <LandingTestimonials testimonials={page.testimonials} />

      {/* 6. FAQ */}
      <LandingFAQ faqs={page.faqs} />

      {/* 7. Direct Payment */}
      <DirectPayment
        productId={product.id}
        productName={product.name}
        price={product.price}
        originalPrice={product.originalPrice}
        currency={product.currency}
        landingPageId={page.id}
        leadId={leadId}
        leadData={leadData}
      />

      {/* Footer */}
      <footer className="py-8 bg-[#08090C] border-t border-white/[0.04] text-center">
        <p className="text-[#4B5563] text-xs">
          © {new Date().getFullYear()} NichuStore. All rights reserved.
        </p>
        <div className="flex items-center justify-center gap-4 mt-3">
          <a href="/privacy" className="text-[#4B5563] text-xs hover:text-[#9CA3AF] transition-colors">Privacy Policy</a>
          <a href="/terms" className="text-[#4B5563] text-xs hover:text-[#9CA3AF] transition-colors">Terms & Conditions</a>
          <a href="/refund" className="text-[#4B5563] text-xs hover:text-[#9CA3AF] transition-colors">Refund Policy</a>
        </div>
      </footer>
    </div>
  );
}
