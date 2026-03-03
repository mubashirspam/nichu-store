"use client";

import React, { useEffect, useState } from "react";
import { DollarSign, Package, ShoppingCart, Users, TrendingUp } from "lucide-react";

interface Stats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  recentOrders: any[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0, totalOrders: 0, totalProducts: 0, totalUsers: 0, recentOrders: [],
  });
  const [loading, setLoading] = useState(true);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
    const fetchStats = async () => {
      const res = await fetch("/api/admin/stats");
      if (res.ok) setStats(await res.json());
      setLoading(false);
    };
    fetchStats();
  }, []);

  const d = dark;

  const statCards = [
    { label: "Total Revenue", value: `₹${stats.totalRevenue}`, icon: DollarSign, color: d ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-600" },
    { label: "Completed Orders", value: stats.totalOrders, icon: ShoppingCart, color: d ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600" },
    { label: "Products", value: stats.totalProducts, icon: Package, color: d ? "bg-orange-500/10 text-orange-400" : "bg-orange-50 text-orange-600" },
    { label: "Users", value: stats.totalUsers, icon: Users, color: d ? "bg-purple-500/10 text-purple-400" : "bg-purple-50 text-purple-600" },
  ];

  if (loading) {
    return (
      <div className={d ? "text-gray-400" : "text-gray-500"}>
        <div className="inline-flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className={`text-2xl font-bold ${d ? "text-white" : "text-gray-900"}`}>Dashboard</h1>
          <p className={`text-sm mt-1 ${d ? "text-gray-400" : "text-gray-500"}`}>Overview of your store</p>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-500 text-sm font-medium">
          <TrendingUp size={16} />
          Live
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => (
          <div key={stat.label} className={`rounded-xl p-5 border ${d ? "bg-gray-900/60 border-gray-800" : "bg-white border-gray-200"}`}>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-sm ${d ? "text-gray-400" : "text-gray-500"}`}>{stat.label}</span>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon size={18} />
              </div>
            </div>
            <p className={`text-2xl font-bold ${d ? "text-white" : "text-gray-900"}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className={`rounded-xl border ${d ? "bg-gray-900/60 border-gray-800" : "bg-white border-gray-200"}`}>
        <div className={`px-6 py-4 border-b ${d ? "border-gray-800" : "border-gray-100"}`}>
          <h2 className={`font-bold ${d ? "text-white" : "text-gray-900"}`}>Recent Orders</h2>
        </div>
        <div className={`divide-y ${d ? "divide-gray-800" : "divide-gray-100"}`}>
          {stats.recentOrders.length === 0 ? (
            <div className={`px-6 py-8 text-center text-sm ${d ? "text-gray-600" : "text-gray-400"}`}>No orders yet</div>
          ) : (
            stats.recentOrders.map((order: any) => (
              <div key={order.id} className="px-6 py-3 flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${d ? "text-white" : "text-gray-900"}`}>{order.order_number}</p>
                  <p className={`text-xs ${d ? "text-gray-500" : "text-gray-400"}`}>{(order.profiles as any)?.email || "—"}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${d ? "text-white" : "text-gray-900"}`}>₹{order.total_amount}</p>
                  <span className={`text-xs font-medium ${
                    order.status === "completed" ? "text-emerald-500" :
                    order.status === "failed" ? "text-red-500" : "text-yellow-500"
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
