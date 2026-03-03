"use client";

import React, { useEffect, useState } from "react";
import { ShoppingCart, CheckCircle, XCircle, Clock } from "lucide-react";

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
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const d = dark;

  const fetchOrders = async () => {
    const url = filter && filter !== "all" ? `/api/admin/orders?status=${filter}` : "/api/admin/orders";
    const res = await fetch(url);
    if (res.ok) setOrders(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, [filter]);

  const updateStatus = async (orderId: string, status: string) => {
    await fetch("/api/admin/orders", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: orderId, status }) });
    fetchOrders();
  };

  const statusConfig: Record<string, { icon: React.ReactNode; color: string; darkColor: string }> = {
    completed: { icon: <CheckCircle size={14} />, color: "text-emerald-600 bg-emerald-50", darkColor: "text-emerald-400 bg-emerald-500/10" },
    pending: { icon: <Clock size={14} />, color: "text-yellow-600 bg-yellow-50", darkColor: "text-yellow-400 bg-yellow-500/10" },
    failed: { icon: <XCircle size={14} />, color: "text-red-600 bg-red-50", darkColor: "text-red-400 bg-red-500/10" },
    refunded: { icon: <XCircle size={14} />, color: "text-gray-600 bg-gray-100", darkColor: "text-gray-400 bg-gray-800" },
  };

  const selectCls = `text-xs border rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-violet-500 ${d ? "bg-gray-800 border-gray-700 text-white" : "border-gray-200 text-gray-900"}`;

  if (loading) return <div className={d ? "text-gray-400" : "text-gray-500"}>Loading orders...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className={`text-2xl font-bold ${d ? "text-white" : "text-gray-900"}`}>Orders</h1>
          <p className={`text-sm mt-1 ${d ? "text-gray-400" : "text-gray-500"}`}>{orders.length} orders total</p>
        </div>
        <div className="flex gap-2">
          {["all", "completed", "pending", "failed", "refunded"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                filter === f
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25"
                  : d ? "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className={`rounded-xl overflow-hidden border ${d ? "bg-gray-900/60 border-gray-800" : "bg-white border-gray-200"}`}>
        <table className="w-full text-sm">
          <thead className={`border-b ${d ? "bg-gray-900/80 border-gray-800" : "bg-gray-50 border-gray-200"}`}>
            <tr>
              <th className={`text-left px-6 py-3 font-medium ${d ? "text-gray-400" : "text-gray-500"}`}>Order</th>
              <th className={`text-left px-4 py-3 font-medium ${d ? "text-gray-400" : "text-gray-500"}`}>Customer</th>
              <th className={`text-left px-4 py-3 font-medium ${d ? "text-gray-400" : "text-gray-500"}`}>Products</th>
              <th className={`text-left px-4 py-3 font-medium ${d ? "text-gray-400" : "text-gray-500"}`}>Amount</th>
              <th className={`text-left px-4 py-3 font-medium ${d ? "text-gray-400" : "text-gray-500"}`}>Status</th>
              <th className={`text-right px-6 py-3 font-medium ${d ? "text-gray-400" : "text-gray-500"}`}>Actions</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${d ? "divide-gray-800" : "divide-gray-100"}`}>
            {orders.map((order) => {
              const sc = statusConfig[order.status] || statusConfig.pending;
              return (
                <tr key={order.id} className={`transition-colors ${d ? "hover:bg-white/5" : "hover:bg-gray-50"}`}>
                  <td className="px-6 py-3">
                    <p className={`font-mono text-xs ${d ? "text-white" : "text-gray-900"}`}>{order.order_number}</p>
                    <p className={`text-xs mt-0.5 ${d ? "text-gray-500" : "text-gray-400"}`}>
                      {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </td>
                  <td className={`px-4 py-3 text-xs ${d ? "text-gray-400" : "text-gray-600"}`}>
                    {(order.profiles as any)?.email || "—"}
                  </td>
                  <td className="px-4 py-3">
                    {order.order_items?.map((item, i) => (
                      <p key={i} className={`text-xs ${d ? "text-gray-400" : "text-gray-600"}`}>{item.product_name}</p>
                    ))}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-bold ${d ? "text-white" : "text-gray-900"}`}>₹{order.total_amount}</span>
                    {order.discount_amount > 0 && (
                      <span className="text-xs text-emerald-500 block">-₹{order.discount_amount} disc.</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${d ? sc.darkColor : sc.color}`}>
                      {sc.icon}
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      className={selectCls}
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
          <div className={`text-center py-12 ${d ? "text-gray-600" : "text-gray-400"}`}>
            <ShoppingCart size={32} className="mx-auto mb-2" />
            <p>No orders found</p>
          </div>
        )}
      </div>
    </div>
  );
}
