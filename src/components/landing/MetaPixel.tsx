"use client";

import React from "react";

interface MetaPixelProps {
  pixelId: string | null;
}

const DEFAULT_PIXEL_ID = "679891645180554";

export default function MetaPixel({ pixelId }: MetaPixelProps) {
  const activePixelId = pixelId || DEFAULT_PIXEL_ID;
  if (!activePixelId) return null;

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${activePixelId}');
            fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${activePixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}

// Helper functions to fire pixel events from client components
export function trackLead(value?: number) {
  if (typeof window !== "undefined" && (window as any).fbq) {
    (window as any).fbq("track", "Lead", value ? { value, currency: "INR" } : {});
  }
}

export function trackPurchase(value: number, currency = "INR") {
  if (typeof window !== "undefined" && (window as any).fbq) {
    (window as any).fbq("track", "Purchase", { value, currency });
  }
}

export function trackAddToCart(value: number, currency = "INR") {
  if (typeof window !== "undefined" && (window as any).fbq) {
    (window as any).fbq("track", "AddToCart", { value, currency });
  }
}
