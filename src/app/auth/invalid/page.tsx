import Link from "next/link";
import { XCircle, ArrowLeft } from "lucide-react";

export default function InvalidLinkPage() {
  return (
    <div className="min-h-screen bg-[#0B0D11] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="bg-[#111318] border border-white/[0.06] rounded-2xl p-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
              <XCircle size={32} className="text-red-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Invalid Link</h1>
          <p className="text-[#9CA3AF] text-sm mb-6">
            This access link is invalid or doesn&apos;t exist. Please check your email for the correct link, or request a new one.
          </p>
          <Link
            href="/login"
            className="block w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold py-3 rounded-xl text-sm transition-all hover:opacity-90 mb-4"
          >
            Request New Access Link
          </Link>
          <Link href="/" className="inline-flex items-center gap-2 text-[#6B7280] hover:text-[#9CA3AF] text-sm transition-colors">
            <ArrowLeft size={14} />
            Back to store
          </Link>
        </div>
      </div>
    </div>
  );
}
