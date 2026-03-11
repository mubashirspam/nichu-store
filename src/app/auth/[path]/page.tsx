"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, Mail, Lock, User, ArrowLeft, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { authClient } from "@/lib/auth/client";
import { trackCompleteRegistration } from "@/components/landing/MetaPixel";

export default function AuthPage({ params }: { params: Promise<{ path: string }> }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <AuthContent params={params} />
    </Suspense>
  );
}

function AuthContent({ params }: { params: Promise<{ path: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [path, setPath] = useState<string>("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [dark, setDark] = useState(false);

  useEffect(() => {
    params.then(({ path: p }) => setPath(p));
    setDark(document.documentElement.classList.contains("dark"));
  }, [params]);

  const isSignUp = path === "sign-up";
  const callbackURL = searchParams.get("callbackURL") || "/";

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isSignUp) {
        const { error } = await authClient.signUp.email({
          email,
          password,
          name: name || email.split("@")[0],
        });
        if (error) throw new Error(error.message || "Sign up failed");
        trackCompleteRegistration();
      } else {
        const { error } = await authClient.signIn.email({
          email,
          password,
        });
        if (error) throw new Error(error.message || "Sign in failed");
      }
      router.push(callbackURL);
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: "google" | "github") => {
    setSocialLoading(provider);
    setError("");
    try {
      await authClient.signIn.social({
        provider,
        callbackURL,
      });
    } catch (err: any) {
      setError(err.message || `Failed to sign in with ${provider}`);
      setSocialLoading(null);
    }
  };

  const d = dark;

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 py-12 ${d ? "bg-[#0a0a0f]" : "bg-gray-50"}`}>
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute top-1/4 -left-32 w-96 h-96 rounded-full blur-[128px] ${d ? "bg-violet-600/15" : "bg-violet-200/40"}`} />
        <div className={`absolute bottom-1/4 -right-32 w-96 h-96 rounded-full blur-[128px] ${d ? "bg-indigo-600/15" : "bg-indigo-200/40"}`} />
      </div>

      <div className="relative w-full max-w-md">
        {/* Back to store */}
        <Link href="/" className={`inline-flex items-center gap-2 text-sm font-medium mb-8 transition-colors ${d ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"}`}>
          <ArrowLeft size={16} />
          Back to store
        </Link>

        {/* Card */}
        <div className={`rounded-3xl p-8 shadow-2xl ${d ? "bg-gray-900/80 border border-gray-800 shadow-black/20" : "bg-white border border-gray-200 shadow-gray-200/50"}`}>
          {/* Logo + Title */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/25">
              <Sparkles size={28} className="text-white" />
            </div>
            <h1 className={`text-2xl font-bold ${d ? "text-white" : "text-gray-900"}`}>
              {isSignUp ? "Create your account" : "Welcome back"}
            </h1>
            <p className={`text-sm mt-2 ${d ? "text-gray-400" : "text-gray-500"}`}>
              {isSignUp ? "Start your fitness journey today" : "Sign in to access your templates"}
            </p>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3 mb-6">
            <button
              onClick={() => handleSocialLogin("google")}
              disabled={!!socialLoading}
              className={`w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl font-medium text-sm transition-all disabled:opacity-60 ${d
                ? "bg-white/5 border border-gray-700 hover:bg-white/10 text-white"
                : "bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 shadow-sm hover:shadow"
              }`}
            >
              {socialLoading === "google" ? (
                <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              Continue with Google
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className={`absolute inset-0 flex items-center`}>
              <div className={`w-full border-t ${d ? "border-gray-800" : "border-gray-200"}`} />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className={`px-3 ${d ? "bg-gray-900/80 text-gray-500" : "bg-white text-gray-400"}`}>or continue with email</span>
            </div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {isSignUp && (
              <div>
                <label className={`text-xs font-medium mb-1.5 block ${d ? "text-gray-400" : "text-gray-600"}`}>Full Name</label>
                <div className="relative">
                  <User size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${d ? "text-gray-600" : "text-gray-400"}`} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all ${d
                      ? "bg-gray-800/50 border border-gray-700 text-white placeholder:text-gray-600"
                      : "bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400"
                    }`}
                  />
                </div>
              </div>
            )}

            <div>
              <label className={`text-xs font-medium mb-1.5 block ${d ? "text-gray-400" : "text-gray-600"}`}>Email</label>
              <div className="relative">
                <Mail size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${d ? "text-gray-600" : "text-gray-400"}`} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all ${d
                    ? "bg-gray-800/50 border border-gray-700 text-white placeholder:text-gray-600"
                    : "bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400"
                  }`}
                />
              </div>
            </div>

            <div>
              <label className={`text-xs font-medium mb-1.5 block ${d ? "text-gray-400" : "text-gray-600"}`}>Password</label>
              <div className="relative">
                <Lock size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${d ? "text-gray-600" : "text-gray-400"}`} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  className={`w-full pl-10 pr-12 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all ${d
                    ? "bg-gray-800/50 border border-gray-700 text-white placeholder:text-gray-600"
                    : "bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3.5 top-1/2 -translate-y-1/2 ${d ? "text-gray-600 hover:text-gray-400" : "text-gray-400 hover:text-gray-600"}`}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-500">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white py-3.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-violet-500/25 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                isSignUp ? "Create Account" : "Sign In"
              )}
            </button>
          </form>

          {/* Switch mode */}
          <p className={`text-center text-sm mt-6 ${d ? "text-gray-500" : "text-gray-500"}`}>
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <Link
              href={isSignUp ? `/auth/sign-in${callbackURL !== "/" ? `?callbackURL=${encodeURIComponent(callbackURL)}` : ""}` : `/auth/sign-up${callbackURL !== "/" ? `?callbackURL=${encodeURIComponent(callbackURL)}` : ""}`}
              className="text-violet-500 hover:text-violet-400 font-medium transition-colors"
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className={`text-center text-xs mt-6 ${d ? "text-gray-600" : "text-gray-400"}`}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
