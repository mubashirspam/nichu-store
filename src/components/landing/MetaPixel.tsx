"use client";

import { useEffect } from "react";

const DEFAULT_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "679891645180554";

interface MetaPixelProps {
  pixelId?: string | null;
}

export default function MetaPixel({ pixelId }: MetaPixelProps) {
  const activePixelId = pixelId || DEFAULT_PIXEL_ID;

  useEffect(() => {
    if (!activePixelId || (window as any).fbq) return;

    // Inject Facebook Pixel base code
    const script = document.createElement("script");
    script.innerHTML = `
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
    `;
    document.head.appendChild(script);

    // Noscript fallback
    const noscript = document.createElement("noscript");
    noscript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${activePixelId}&ev=PageView&noscript=1" alt="" />`;
    document.head.appendChild(noscript);
  }, [activePixelId]);

  return null;
}

// ── Event helpers ─────────────────────────────────────────────

function fbq(...args: any[]) {
  if (typeof window !== "undefined" && (window as any).fbq) {
    (window as any).fbq(...args);
  }
}

/** Fire when user views a product/landing page */
export function trackViewContent(productName: string, value: number, currency = "INR") {
  fbq("track", "ViewContent", {
    content_name: productName,
    content_type: "product",
    value,
    currency,
  });
}

/** Fire when user submits lead form or clicks Buy Now (authenticated) */
export function trackLead(value?: number) {
  fbq("track", "Lead", value ? { value, currency: "INR" } : {});
}

/** Fire when user reaches checkout page */
export function trackInitiateCheckout(value: number, numItems: number, currency = "INR") {
  fbq("track", "InitiateCheckout", {
    value,
    currency,
    num_items: numItems,
  });
}

/** Fire after payment is verified successfully */
export function trackPurchase(value: number, orderId?: string, currency = "INR") {
  fbq("track", "Purchase", {
    value,
    currency,
    ...(orderId ? { order_id: orderId } : {}),
  });
}

/** Fire after successful account creation */
export function trackCompleteRegistration() {
  fbq("track", "CompleteRegistration");
}

/** Fire when user adds to cart */
export function trackAddToCart(value: number, currency = "INR") {
  fbq("track", "AddToCart", { value, currency });
}
