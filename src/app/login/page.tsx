"use client";

import { useState } from "react";
import { Mail, CheckCircle, AlertTriangle, Sparkles } from "lucide-react";
import Link from "next/link";
import { authClient } from "@/lib/auth/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [magicState, setMagicState] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || magicState === "loading") return;
    setMagicState("loading");
    setErrorMsg("");

    try {
      const res = await (authClient as any).signIn.magicLink({
        email: email.toLowerCase().trim(),
        callbackURL: "/dashboard/orders",
      });
      if (res?.error) {
        setErrorMsg(res.error.message || "No account found with this email.");
        setMagicState("error");
      } else {
        setMagicState("sent");
      }
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
      setMagicState("error");
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard/orders",
    });
    if (error) setGoogleLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0B0D11] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="text-lg font-bold text-white">
              Nichu<span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">Store</span>
            </span>
          </Link>
        </div>

        <div className="bg-[#111318] border border-white/[0.06] rounded-2xl p-8">
          <h1 className="text-xl font-bold text-white mb-1 text-center">Sign in to your account</h1>
          <p className="text-[#6B7280] text-sm text-center mb-6">No password needed.</p>

          {/* Google OAuth */}
          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-2.5 bg-white text-gray-900 font-bold text-sm py-3 rounded-xl hover:bg-gray-100 transition-all disabled:opacity-60 mb-4"
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

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-[10px] text-[#4B5563] uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>

          {/* Magic Link */}
          {magicState === "sent" ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                <CheckCircle size={28} className="text-emerald-400" />
              </div>
              <p className="text-white font-semibold mb-1">Check your inbox</p>
              <p className="text-[#9CA3AF] text-sm">
                Access link sent to <span className="text-violet-400">{email}</span>
              </p>
              <button onClick={() => setMagicState("idle")} className="mt-3 text-xs text-[#6B7280] hover:text-[#9CA3AF] underline">
                Use a different email
              </button>
            </div>
          ) : (
            <form onSubmit={handleMagicLink} className="space-y-3">
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full bg-[#0B0D11] border border-white/[0.08] text-white placeholder-[#4B5563] text-sm rounded-xl pl-8 pr-4 py-2.5 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              {magicState === "error" && (
                <div className="flex items-center gap-2 text-amber-400 text-xs">
                  <AlertTriangle size={12} />
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={magicState === "loading"}
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 text-white font-bold text-sm py-3 rounded-xl transition-all disabled:opacity-50"
              >
                {magicState === "loading" ? "Sending…" : "Send Access Link"}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-[#4B5563] mt-5">
          Don&apos;t have an account?{" "}
          <Link href="/" className="text-violet-400 hover:underline">Browse products</Link>
        </p>
      </div>
    </div>
  );
}
