"use client";

import React, { useEffect, useState } from "react";
import { Package, Download, ArrowLeft, Sparkles, Clock, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  discount_amount: number;
  currency: string;
  status: string;
  created_at: string;
  order_items: {
    id: string;
    product_name: string;
    price: number;
    file_url: string | null;
  }[];
}

const statusConfig: Record<string, { icon: React.ReactNode; color: string; darkColor: string; label: string }> = {
  completed: { icon: <CheckCircle size={14} />, color: "text-emerald-600 bg-emerald-50", darkColor: "text-emerald-400 bg-emerald-500/10", label: "Completed" },
  pending: { icon: <Clock size={14} />, color: "text-yellow-600 bg-yellow-50", darkColor: "text-yellow-400 bg-yellow-500/10", label: "Pending" },
  failed: { icon: <XCircle size={14} />, color: "text-red-600 bg-red-50", darkColor: "text-red-400 bg-red-500/10", label: "Failed" },
  refunded: { icon: <XCircle size={14} />, color: "text-gray-600 bg-gray-50", darkColor: "text-gray-400 bg-gray-500/10", label: "Refunded" },
};

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    const fetchOrders = async () => {
      const res = await fetch("/api/orders");
      if (res.ok) {
        setOrders(await res.json());
      }
      setLoading(false);
    };
    fetchOrders();
  }, [user, authLoading]);

  const d = dark;

  if (authLoading || loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${d ? "bg-[#0a0a0f]" : "bg-gray-50"}`}>
        <div className="inline-flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <span className={d ? "text-gray-400" : "text-gray-500"}>Loading orders...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${d ? "bg-[#0a0a0f] text-white" : "bg-gray-50 text-gray-900"}`}>
      <div className={`${d ? "border-b border-gray-800 bg-[#0a0a0f]/80" : "bg-white border-b border-gray-200"} glass`}>
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
              <Sparkles size={14} className="text-white" />
            </div>
            <span className="text-lg font-bold">Nichu<span className="gradient-text">Store</span></span>
          </Link>
          <h1 className="text-lg font-bold flex items-center gap-2">
            <Package size={20} /> My Orders
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {!user ? (
          <div className="text-center py-20">
            <Package size={64} className={`mx-auto mb-4 ${d ? "text-gray-700" : "text-gray-300"}`} />
            <h2 className="text-2xl font-bold mb-2">Sign in to see orders</h2>
            <p className={`mb-6 ${d ? "text-gray-500" : "text-gray-500"}`}>You need to be logged in to view your orders</p>
            <Link href="/" className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold inline-flex items-center gap-2 shadow-lg shadow-violet-500/25 transition-all">
              <ArrowLeft size={16} /> Go Home
            </Link>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <Package size={64} className={`mx-auto mb-4 ${d ? "text-gray-700" : "text-gray-300"}`} />
            <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
            <p className={`mb-6 ${d ? "text-gray-500" : "text-gray-500"}`}>Your purchases will appear here</p>
            <Link href="/" className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold inline-flex items-center gap-2 shadow-lg shadow-violet-500/25 transition-all">
              <ArrowLeft size={16} /> Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = statusConfig[order.status] || statusConfig.pending;
              return (
                <div key={order.id} className={`rounded-2xl p-6 ${d ? "bg-gray-900/60 border border-gray-800" : "bg-white border border-gray-200"}`}>
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div>
                      <p className={`text-xs font-mono ${d ? "text-gray-500" : "text-gray-400"}`}>{order.order_number}</p>
                      <p className={`text-xs mt-0.5 ${d ? "text-gray-600" : "text-gray-400"}`}>
                        {new Date(order.created_at).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold">₹{order.total_amount}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {order.order_items?.map((item) => (
                      <div key={item.id} className={`flex items-center justify-between rounded-xl p-3 ${d ? "bg-gray-800/50" : "bg-gray-50"}`}>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.product_name}</p>
                          <p className={`text-xs ${d ? "text-gray-500" : "text-gray-400"}`}>₹{item.price}</p>
                        </div>
                        {item.file_url ? (
                          <a href={`/api/downloads?orderItemId=${item.id}`} target="_blank" rel="noopener noreferrer"
                            className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 shadow-lg shadow-violet-500/25 transition-all hover:from-violet-700 hover:to-indigo-700">
                            <Download size={14} /> Download
                          </a>
                        ) : (
                          <span className={`text-xs px-3 py-1.5 rounded-lg ${d ? "bg-yellow-500/10 text-yellow-400" : "bg-yellow-50 text-yellow-600"}`}>
                            Processing...
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className={`flex items-center justify-between mt-4 pt-4 ${d ? "border-t border-gray-800" : "border-t border-gray-100"}`}>
                    {order.discount_amount > 0 && (
                      <p className="text-xs text-violet-500">Discount: -₹{order.discount_amount}</p>
                    )}
                    <a href={`/orders/${order.id}`} target="_blank" rel="noopener noreferrer"
                      className={`text-xs font-medium inline-flex items-center gap-1.5 transition-colors ml-auto ${d ? "text-violet-400 hover:text-violet-300" : "text-violet-600 hover:text-violet-700"}`}>
                      <Download size={12} /> View Invoice
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
