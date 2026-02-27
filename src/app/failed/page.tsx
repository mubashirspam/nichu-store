"use client";

import { XCircle, ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";

export default function FailedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center px-6">
      <div className="max-w-2xl w-full">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 md:p-12 text-center shadow-xl">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle size={48} className="text-red-600" />
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            Payment Failed
          </h1>

          <p className="text-gray-600 text-lg mb-8">
            Unfortunately, your payment could not be processed. Please try again.
          </p>

          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <p className="text-sm text-red-700 mb-3 font-medium">Common reasons for payment failure:</p>
            <ul className="text-sm text-red-600 space-y-2 text-left max-w-md mx-auto">
              <li>• Insufficient funds in your account</li>
              <li>• Incorrect card details or expired card</li>
              <li>• Payment declined by your bank</li>
              <li>• Network connectivity issues</li>
            </ul>
          </div>

          <div className="flex items-start gap-3 text-left bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
            <Mail size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-blue-900 mb-1">Need Assistance?</p>
              <p className="text-sm text-blue-700">
                Contact us at support@marketingnizam.com and we'll help you complete your purchase.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-semibold inline-flex items-center justify-center gap-2 transition-all duration-200"
            >
              <ArrowLeft size={18} />
              Try Again
            </Link>
          </div>
        </div>

        <p className="text-center text-gray-400 text-sm mt-6">
          No amount has been deducted from your account.
        </p>
      </div>
    </div>
  );
}
