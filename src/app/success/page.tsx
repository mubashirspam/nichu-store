"use client";

import { useSearchParams } from "next/navigation";
import { CheckCircle, Download, ArrowLeft, Dumbbell } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("payment_id");
  const productName = searchParams.get("product");

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center px-6">
      <div className="max-w-2xl w-full">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 md:p-12 text-center shadow-xl">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={48} className="text-emerald-600" />
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            Payment Successful!
          </h1>

          <p className="text-gray-600 text-lg mb-8">
            Thank you for your purchase. Your payment has been processed successfully.
          </p>

          {productName && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 mb-8">
              <p className="text-sm text-emerald-700 font-medium mb-2">Product Purchased</p>
              <p className="text-lg font-bold text-emerald-900">{decodeURIComponent(productName)}</p>
            </div>
          )}

          {paymentId && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-8">
              <p className="text-xs text-gray-500 mb-1">Payment ID</p>
              <p className="text-sm font-mono text-gray-700">{paymentId}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-start gap-3 text-left bg-blue-50 border border-blue-200 rounded-xl p-4">
              <Download size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-blue-900 mb-1">Download Link Sent</p>
                <p className="text-sm text-blue-700">
                  Check your email for the download link. If you don't see it, check your spam folder.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-left bg-purple-50 border border-purple-200 rounded-xl p-4">
              <Dumbbell size={20} className="text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-purple-900 mb-1">Need Help?</p>
                <p className="text-sm text-purple-700">
                  Contact us at support@marketingnizam.com for any questions or issues.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-semibold inline-flex items-center justify-center gap-2 transition-all duration-200"
            >
              <ArrowLeft size={18} />
              Back to Store
            </Link>
          </div>
        </div>

        <p className="text-center text-gray-400 text-sm mt-6">
          You will receive a confirmation email shortly with your purchase details.
        </p>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
