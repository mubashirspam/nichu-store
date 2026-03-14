"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, Eye, EyeOff, Sparkles, AlertTriangle, Loader2 } from "lucide-react";
import Link from "next/link";
import { authClient } from "@/lib/auth/client";
import { Suspense } from "react";

function AdminLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackURL = searchParams.get("callbackURL") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || loading) return;
    setLoading(true);
    setError("");

    try {
      const res = await authClient.signIn.email({
        email: email.toLowerCase().trim(),
        password,
      });

      if (res?.error) {
        setError(res.error.message || "Invalid email or password.");
        setLoading(false);
        return;
      }

      router.push(callbackURL);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0D11] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
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
          <div className="flex items-center justify-center gap-2 mb-1">
            <Lock size={16} className="text-violet-400" />
            <h1 className="text-xl font-bold text-white text-center">Admin Login</h1>
          </div>
          <p className="text-[#6B7280] text-sm text-center mb-6">Email &amp; password required</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@email.com"
                required
                className="w-full bg-[#0B0D11] border border-white/[0.08] text-white placeholder-[#4B5563] text-sm rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>

            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563]" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="w-full bg-[#0B0D11] border border-white/[0.08] text-white placeholder-[#4B5563] text-sm rounded-xl pl-9 pr-10 py-2.5 focus:outline-none focus:border-violet-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4B5563] hover:text-[#9CA3AF]"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-amber-400 text-xs">
                <AlertTriangle size={12} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 text-white font-bold text-sm py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 size={14} className="animate-spin" /> Signing in...</> : "Sign In"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#4B5563] mt-5">
          <Link href="/" className="text-violet-400 hover:underline">Back to Store</Link>
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0B0D11] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-violet-500" />
      </div>
    }>
      <AdminLoginContent />
    </Suspense>
  );
}
