"use client";

import React, { useEffect, useState } from "react";
import { DollarSign, Package, ShoppingCart, Users, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Stats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  recentOrders: any[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const supabase = createClient();

      const [ordersRes, productsRes, usersRes, recentRes] = await Promise.all([
        supabase.from("orders").select("total_amount, status").eq("status", "completed"),
        supabase.from("products").select("id", { count: "exact" }),
        supabase.from("profiles").select("id", { count: "exact" }),
        supabase
          .from("orders")
          .select("id, order_number, total_amount, status, created_at, profiles(email)")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      const completedOrders = ordersRes.data || [];
      const totalRevenue = completedOrders.reduce((sum: number, o: { total_amount: any; }) => sum + Number(o.total_amount), 0);

      setStats({
        totalRevenue,
        totalOrders: completedOrders.length,
        totalProducts: productsRes.count || 0,
        totalUsers: usersRes.count || 0,
        recentOrders: recentRes.data || [],
      });
      setLoading(false);
    };
    fetchStats();
  }, []);

  const statCards = [
    { label: "Total Revenue", value: `₹${stats.totalRevenue}`, icon: DollarSign, color: "bg-emerald-50 text-emerald-600" },
    { label: "Completed Orders", value: stats.totalOrders, icon: ShoppingCart, color: "bg-blue-50 text-blue-600" },
    { label: "Products", value: stats.totalProducts, icon: Package, color: "bg-orange-50 text-orange-600" },
    { label: "Users", value: stats.totalUsers, icon: Users, color: "bg-purple-50 text-purple-600" },
  ];

  if (loading) {
    return <div className="text-gray-500">Loading dashboard...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Overview of your store</p>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium">
          <TrendingUp size={16} />
          Live
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">{stat.label}</span>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon size={18} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white border border-gray-200 rounded-xl">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Recent Orders</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {stats.recentOrders.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-400 text-sm">No orders yet</div>
          ) : (
            stats.recentOrders.map((order: any) => (
              <div key={order.id} className="px-6 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{order.order_number}</p>
                  <p className="text-xs text-gray-400">{(order.profiles as any)?.email || "—"}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">₹{order.total_amount}</p>
                  <span className={`text-xs font-medium ${
                    order.status === "completed" ? "text-emerald-600" :
                    order.status === "failed" ? "text-red-500" : "text-yellow-600"
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
