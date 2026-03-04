import { Metadata } from "next";

export default function LandingPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Razorpay SDK */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />
      {children}
    </>
  );
}
