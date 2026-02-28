"use client";

import { useSearchParams } from "next/navigation";
import { CheckCircle, Download, ArrowLeft, Dumbbell, FileSpreadsheet, Shield } from "lucide-react";
import Link from "next/link";
import { Suspense, useState } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("payment_id");
  const productName = searchParams.get("product");
  const productId = searchParams.get("product_id");
  const [downloading, setDownloading] = useState(false);

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center px-6 py-12">
      <div className="max-w-2xl w-full">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 md:p-12 text-center shadow-xl">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={48} className="text-emerald-600" />
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
            Payment Successful!
          </h1>

          <p className="text-gray-600 text-lg mb-8">
            Thank you for your purchase. Your product is ready to download.
          </p>

          {/* Product Info */}
          {productName && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 mb-6">
              <p className="text-sm text-emerald-700 font-medium mb-2">Product Purchased</p>
              <p className="text-lg font-bold text-emerald-900">{decodeURIComponent(productName)}</p>
            </div>
          )}

          {/* Download Button — Main CTA */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-2xl p-6 mb-6">
            <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <FileSpreadsheet size={28} className="text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Download Your Excel Tracker</h2>
            <p className="text-gray-500 text-sm mb-5">
              Click below to download your fitness tracker Excel spreadsheet. Works with Microsoft Excel and Google Sheets.
            </p>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-4 rounded-xl font-bold text-lg inline-flex items-center justify-center gap-3 transition-all duration-200 shadow-lg shadow-emerald-200 disabled:opacity-60 w-full sm:w-auto"
            >
              <Download size={22} />
              {downloading ? "Downloading..." : "Download Now"}
            </button>
            <div className="flex items-center justify-center gap-2 mt-3 text-xs text-gray-400">
              <Shield size={12} />
              Secure download · .xlsx format · 6 sheets included
            </div>
          </div>

          {/* Payment ID */}
          {paymentId && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
              <p className="text-xs text-gray-500 mb-1">Payment ID (save for reference)</p>
              <p className="text-sm font-mono text-gray-700 select-all">{paymentId}</p>
            </div>
          )}

          {/* Info Cards */}
          <div className="space-y-3 mb-8">
            <div className="flex items-start gap-3 text-left bg-blue-50 border border-blue-200 rounded-xl p-4">
              <FileSpreadsheet size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-blue-900 mb-1">What&apos;s Included</p>
                <p className="text-sm text-blue-700">
                  6 sheets: Dashboard, Workout Log, Nutrition, Body Measurements, Sleep & Water, Monthly Progress
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-left bg-purple-50 border border-purple-200 rounded-xl p-4">
              <Dumbbell size={18} className="text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-purple-900 mb-1">Need Help?</p>
                <p className="text-sm text-purple-700">
                  Contact us at support@marketingnizam.com for any questions.
                </p>
              </div>
            </div>
          </div>

          {/* Back to Store */}
          <Link
            href="/"
            className="text-emerald-600 hover:text-emerald-700 font-semibold inline-flex items-center gap-2 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Store
          </Link>
        </div>

        <p className="text-center text-gray-400 text-xs mt-6">
          A confirmation email will also be sent to your registered email address. Save your Payment ID for future reference.
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
