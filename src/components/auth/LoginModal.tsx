"use client";

import React from "react";
import { X, LogIn, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectAfter?: string;
}

export default function LoginModal({ isOpen, onClose, redirectAfter }: LoginModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleSignIn = () => {
    onClose();
    router.push("/auth/sign-in");
  };

  const handleSignUp = () => {
    onClose();
    router.push("/auth/sign-up");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-8 animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/25">
            <Sparkles size={24} className="text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Sign in to continue</h2>
          <p className="text-gray-500 text-sm mt-1">Access your cart and orders</p>
        </div>

        <button
          onClick={handleSignIn}
          className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white py-3.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-violet-500/25 flex items-center justify-center gap-2 mb-3"
        >
          <LogIn size={16} />
          Sign In
        </button>

        <button
          onClick={handleSignUp}
          className="w-full border-2 border-gray-200 hover:border-gray-300 text-gray-700 py-3 rounded-xl font-medium text-sm transition-colors"
        >
          Create Account
        </button>
      </div>
    </div>
  );
}
