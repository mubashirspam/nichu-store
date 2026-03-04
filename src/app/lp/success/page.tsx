"use client";

import { useSearchParams } from "next/navigation";
import { CheckCircle, Download, ArrowLeft, Shield } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("payment_id");
  const productName = searchParams.get("product");
  const orderNumber = searchParams.get("order");

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 sm:p-12 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={48} className="text-emerald-400" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
            Payment Successful! 🎉
          </h1>

          <p className="text-gray-400 text-lg mb-8">
            Thank you for your purchase. Your product is ready!
          </p>

          {/* Product Info */}
          {productName && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 mb-6">
              <p className="text-sm text-emerald-400 font-medium mb-1">Product Purchased</p>
              <p className="text-lg font-bold text-white">{decodeURIComponent(productName)}</p>
            </div>
          )}

          {/* Order Number */}
          {orderNumber && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
              <p className="text-xs text-gray-500 mb-1">Order Number</p>
              <p className="text-sm font-mono text-gray-300 select-all">{orderNumber}</p>
            </div>
          )}

          {/* Payment ID */}
          {paymentId && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
              <p className="text-xs text-gray-500 mb-1">Payment ID (save for reference)</p>
              <p className="text-sm font-mono text-gray-300 select-all">{paymentId}</p>
            </div>
          )}

          {/* Support */}
          <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-4 mb-8 text-left">
            <p className="font-medium text-violet-300 mb-1">Need Help?</p>
            <p className="text-sm text-gray-400">
              Contact us at support@marketingnizam.com for any questions.
            </p>
          </div>

          {/* Back to Store */}
          <Link
            href="/"
            className="text-violet-400 hover:text-violet-300 font-semibold inline-flex items-center gap-2 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Store
          </Link>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          A confirmation email will be sent to your email address.
        </p>
      </div>
    </div>
  );
}

export default function LPSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
          <div className="text-gray-400">Loading...</div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
