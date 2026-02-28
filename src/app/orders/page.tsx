"use client";

import React, { useEffect, useState } from "react";
import { Package, Download, ArrowLeft, Dumbbell, Clock, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
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

const statusConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  completed: { icon: <CheckCircle size={14} />, color: "text-emerald-600 bg-emerald-50", label: "Completed" },
  pending: { icon: <Clock size={14} />, color: "text-yellow-600 bg-yellow-50", label: "Pending" },
  failed: { icon: <XCircle size={14} />, color: "text-red-600 bg-red-50", label: "Failed" },
  refunded: { icon: <XCircle size={14} />, color: "text-gray-600 bg-gray-50", label: "Refunded" },
};

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("orders")
        .select(`
          id, order_number, total_amount, discount_amount, currency, status, created_at,
          order_items (id, product_name, price, file_url)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setOrders((data as any) || []);
      setLoading(false);
    };
    fetchOrders();
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Dumbbell size={16} className="text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">Nizam<span className="text-emerald-600">Store</span></span>
          </Link>
          <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Package size={20} />
            My Orders
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {orders.length === 0 ? (
          <div className="text-center py-20">
            <Package size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-500 mb-6">Your purchases will appear here</p>
            <Link href="/" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-semibold inline-flex items-center gap-2 transition-colors">
              <ArrowLeft size={16} />
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = statusConfig[order.status] || statusConfig.pending;
              return (
                <div key={order.id} className="bg-white border border-gray-200 rounded-xl p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div>
                      <p className="text-xs text-gray-400 font-mono">{order.order_number}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(order.created_at).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
                        {status.icon}
                        {status.label}
                      </span>
                      <span className="font-bold text-gray-900">₹{order.total_amount}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {order.order_items?.map((item) => (
                      <div key={item.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{item.product_name}</p>
                          <p className="text-xs text-gray-400">₹{item.price}</p>
                        </div>
                        {order.status === "completed" && item.file_url && (
                          <a
                            href={item.file_url}
                            download
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                          >
                            <Download size={14} />
                            Download
                          </a>
                        )}
                      </div>
                    ))}
                  </div>

                  {order.discount_amount > 0 && (
                    <p className="text-xs text-emerald-600 mt-3">Discount applied: -₹{order.discount_amount}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
