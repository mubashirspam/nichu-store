"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle, Mail, RefreshCw, AlertTriangle,
  Download, FileSpreadsheet, Dumbbell, Shield, ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { authClient } from "@/lib/auth/client";

function SuccessContent() {
  const params = useSearchParams();
  const email = params.get("email") || "";
  const productName = params.get("product") || "";
  const paymentId = params.get("payment_id") || "";

  const [resendState, setResendState] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleResend = async () => {
    if (!email || resendState === "loading") return;
    setResendState("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/auth/resend-magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to resend. Please try again.");
        setResendState("error");
      } else {
        setResendState("sent");
      }
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
      setResendState("error");
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard/orders",
    });
  };

  const handleDownload = () => {
    setDownloading(true);
    const link = document.createElement("a");
    link.href = "/Ultimate-Fitness-Tracker.xlsx";
    link.download = "Ultimate-Fitness-Tracker.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setDownloading(false), 2000);
  };

  // ── Guest checkout success (email param present) ──────────────────────────
  if (email) {
    return (
      <div className="min-h-screen bg-[#0B0D11] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-[#111318] border border-white/[0.06] rounded-2xl p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle size={32} className="text-emerald-400" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-white mb-2">Payment Successful!</h1>
            {productName && (
              <p className="text-[#9CA3AF] text-sm mb-6">
                Thank you for purchasing{" "}
                <span className="text-white font-medium">{decodeURIComponent(productName)}</span>.
              </p>
            )}

            {/* Email notice */}
            <div className="bg-[#0B0D11] border border-white/[0.06] rounded-xl p-4 mb-5 text-left">
              <div className="flex items-start gap-3">
                <Mail size={18} className="text-violet-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-white font-medium">Check your inbox</p>
                  <p className="text-xs text-[#9CA3AF] mt-1">
                    Access link sent to <span className="text-violet-400">{email}</span>
                  </p>
                  <p className="text-xs text-[#6B7280] mt-1">Check spam if you don&apos;t see it.</p>
                </div>
              </div>
            </div>

            {/* Google OAuth — primary CTA */}
            <button
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-2.5 bg-white text-gray-900 font-bold text-sm py-3 rounded-xl transition-all hover:bg-gray-100 disabled:opacity-60 mb-3"
            >
              {googleLoading ? (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              Continue with Google
            </button>

            {/* Resend magic link — secondary */}
            {resendState === "sent" ? (
              <div className="flex items-center justify-center gap-2 text-emerald-400 text-sm py-2">
                <CheckCircle size={15} />
                New link sent! Check your inbox.
              </div>
            ) : (
              <button
                onClick={handleResend}
                disabled={resendState === "loading"}
                className="w-full flex items-center justify-center gap-2 border border-white/[0.08] text-[#9CA3AF] hover:text-white hover:border-white/[0.2] font-medium text-sm py-2.5 rounded-xl transition-all disabled:opacity-50"
              >
                <RefreshCw size={14} className={resendState === "loading" ? "animate-spin" : ""} />
                {resendState === "loading" ? "Sending…" : "Resend Access Link"}
              </button>
            )}

            {resendState === "error" && (
              <div className="flex items-center gap-2 mt-2 text-amber-400 text-xs">
                <AlertTriangle size={12} />
                {errorMsg}
              </div>
            )}

            <p className="mt-5 text-xs text-[#4B5563]">
              <Link href="/dashboard/orders" className="text-violet-400 hover:underline">
                View your orders →
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Authenticated checkout success (existing flow) ────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center px-6 py-12">
      <div className="max-w-2xl w-full">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 md:p-12 text-center shadow-xl">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={48} className="text-emerald-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">Payment Successful!</h1>
          <p className="text-gray-600 text-lg mb-8">Thank you for your purchase. Your product is ready to download.</p>

          {productName && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 mb-6">
              <p className="text-sm text-emerald-700 font-medium mb-2">Product Purchased</p>
              <p className="text-lg font-bold text-emerald-900">{decodeURIComponent(productName)}</p>
            </div>
          )}

          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-2xl p-6 mb-6">
            <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <FileSpreadsheet size={28} className="text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Download Your Excel Tracker</h2>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-4 rounded-xl font-bold text-lg inline-flex items-center justify-center gap-3 transition-all shadow-lg disabled:opacity-60 w-full sm:w-auto"
            >
              <Download size={22} />
              {downloading ? "Downloading..." : "Download Now"}
            </button>
            <div className="flex items-center justify-center gap-2 mt-3 text-xs text-gray-400">
              <Shield size={12} />
              Secure download · .xlsx format
            </div>
          </div>

          {paymentId && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
              <p className="text-xs text-gray-500 mb-1">Payment ID</p>
              <p className="text-sm font-mono text-gray-700 select-all">{paymentId}</p>
            </div>
          )}

          <div className="mb-8">
            <div className="flex items-start gap-3 text-left bg-purple-50 border border-purple-200 rounded-xl p-4">
              <Dumbbell size={18} className="text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-purple-900 mb-1">Need Help?</p>
                <p className="text-sm text-purple-700">Contact us at support@marketingnizam.com</p>
              </div>
            </div>
          </div>

          <Link href="/" className="text-emerald-600 hover:text-emerald-700 font-semibold inline-flex items-center gap-2">
            <ArrowLeft size={16} />
            Back to Store
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0B0D11] flex items-center justify-center">
        <div className="text-gray-500 text-sm">Loading…</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
