"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Package, Download, Calendar, ExternalLink, Sparkles, LogOut, AlertTriangle } from "lucide-react";
import { authClient } from "@/lib/auth/client";
import Link from "next/link";

interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  price: number;
  file_url: string | null;
}

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  currency: string;
  status: string;
  created_at: string;
  order_items: OrderItem[];
}

export default function DashboardOrdersPage() {
  const { data: session, isPending } = authClient.useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    if (isPending) return;
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => { setOrders(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [isPending]);

  const handleDownload = async (productId: string, productName: string) => {
    setDownloading(productId);
    try {
      const res = await fetch(`/api/products/${productId}/download`);
      if (!res.ok) throw new Error("Download failed");
      const { url } = await res.json();
      const a = document.createElement("a");
      a.href = url;
      a.download = productName;
      a.click();
    } catch {
      alert("Download failed. Please try again.");
    } finally {
      setDownloading(null);
    }
  };

  if (isPending || loading) {
    return (
      <div className="min-h-screen bg-[#0B0D11] flex items-center justify-center">
        <div className="flex items-center gap-2 text-[#6B7280] text-sm">
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading your orders…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0D11] text-white">
      {/* Navbar */}
      <nav className="border-b border-white/[0.06] px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
            <Sparkles size={12} className="text-white" />
          </div>
          <span className="text-sm font-bold">Nichu<span className="text-violet-400">Store</span></span>
        </Link>
        <div className="flex items-center gap-3">
          {session?.user && (
            <span className="text-xs text-[#6B7280] hidden sm:block">{session.user.email}</span>
          )}
          <button
            onClick={() => authClient.signOut().then(() => window.location.href = "/")}
            className="flex items-center gap-1.5 text-xs text-[#6B7280] hover:text-white transition-colors"
          >
            <LogOut size={13} />
            Sign out
          </button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Your Orders</h1>
          <p className="text-[#9CA3AF] text-sm mt-1">
            {session?.user?.email && `Signed in as ${session.user.email}`}
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-[#111318] border border-white/[0.06] rounded-2xl p-10 text-center">
            <AlertTriangle size={32} className="text-[#4B5563] mx-auto mb-3" />
            <p className="text-white font-semibold mb-1">No orders found</p>
            <p className="text-[#6B7280] text-sm mb-4">
              If you just purchased, your order will appear here within a minute.
            </p>
            <Link href="/" className="text-violet-400 hover:underline text-sm">
              Browse products →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-[#111318] border border-white/[0.06] rounded-2xl p-5 sm:p-6"
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <p className="text-xs text-[#6B7280] font-mono">{order.order_number}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-base font-bold text-white">
                        ₹{order.total_amount}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-medium">
                        {order.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#6B7280] text-xs">
                    <Calendar size={12} />
                    {new Date(order.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </div>

                <div className="space-y-3">
                  {order.order_items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#0B0D11] border border-white/[0.04]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-violet-600/10 flex items-center justify-center shrink-0">
                          <Package size={14} className="text-violet-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{item.product_name}</p>
                          <p className="text-xs text-[#6B7280]">₹{item.price}</p>
                        </div>
                      </div>

                      {item.file_url ? (
                        <button
                          onClick={() => handleDownload(item.product_id, item.product_name)}
                          disabled={downloading === item.product_id}
                          className="flex items-center gap-1.5 text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors disabled:opacity-50"
                        >
                          {downloading === item.product_id ? (
                            <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                          ) : (
                            <Download size={13} />
                          )}
                          Download
                        </button>
                      ) : (
                        <span className="text-xs text-[#4B5563] flex items-center gap-1">
                          <ExternalLink size={12} />
                          Coming soon
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
