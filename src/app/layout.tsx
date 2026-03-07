import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { authClient } from "@/lib/auth/client";
import { NeonAuthUIProvider } from "@neondatabase/auth/react";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { ProductProvider } from "@/contexts/ProductContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Premium Excel Trackers & Planners | by Nizamudheen KC",
  description:
    "Beautiful Excel spreadsheets to track fitness, expenses, habits, projects & more. Auto-generated charts, instant download. Starting at ₹149.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* @ts-ignore - beta package type mismatch */}
        <NeonAuthUIProvider authClient={authClient} redirectTo="/account/settings">
          <AuthProvider>
            <ProductProvider>
              <CartProvider>
                {children}
              </CartProvider>
            </ProductProvider>
          </AuthProvider>
        </NeonAuthUIProvider>
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}

