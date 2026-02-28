"use client";

import React, { useEffect, useState } from "react";
import { ShoppingCart, CheckCircle, XCircle, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  discount_amount: number;
  status: string;
  created_at: string;
  razorpay_payment_id: string | null;
  profiles: { email: string } | null;
  order_items: { product_name: string; price: number }[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const supabase = createClient();

  const fetchOrders = async () => {
    let query = supabase
      .from("orders")
      .select("id, order_number, total_amount, discount_amount, status, created_at, razorpay_payment_id, profiles(email), order_items(product_name, price)")
      .order("created_at", { ascending: false });

    if (filter !== "all") {
      query = query.eq("status", filter);
    }

    const { data } = await query;
    setOrders((data as any) || []);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, [filter]);

  const updateStatus = async (orderId: string, status: string) => {
    await supabase.from("orders").update({ status } as any).eq("id", orderId);
    fetchOrders();
  };

  const statusConfig: Record<string, { icon: React.ReactNode; color: string }> = {
    completed: { icon: <CheckCircle size={14} />, color: "text-emerald-600 bg-emerald-50" },
    pending: { icon: <Clock size={14} />, color: "text-yellow-600 bg-yellow-50" },
    failed: { icon: <XCircle size={14} />, color: "text-red-600 bg-red-50" },
    refunded: { icon: <XCircle size={14} />, color: "text-gray-600 bg-gray-100" },
  };

  if (loading) return <div className="text-gray-500">Loading orders...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500 text-sm mt-1">{orders.length} orders total</p>
        </div>
        <div className="flex gap-2">
          {["all", "completed", "pending", "failed", "refunded"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                filter === f ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Order</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Customer</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Products</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Amount</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
              <th className="text-right px-6 py-3 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((order) => {
              const sc = statusConfig[order.status] || statusConfig.pending;
              return (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3">
                    <p className="font-mono text-xs text-gray-900">{order.order_number}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    {(order.profiles as any)?.email || "—"}
                  </td>
                  <td className="px-4 py-3">
                    {order.order_items?.map((item, i) => (
                      <p key={i} className="text-xs text-gray-600">{item.product_name}</p>
                    ))}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-gray-900">₹{order.total_amount}</span>
                    {order.discount_amount > 0 && (
                      <span className="text-xs text-emerald-600 block">-₹{order.discount_amount} disc.</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${sc.color}`}>
                      {sc.icon}
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="failed">Failed</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {orders.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <ShoppingCart size={32} className="mx-auto mb-2" />
            <p>No orders found</p>
          </div>
        )}
      </div>
    </div>
  );
}
