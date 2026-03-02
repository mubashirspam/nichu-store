"use client";

import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { CheckCircle, Download, ArrowLeft, Sparkles, FileSpreadsheet, Shield, Package, Clock } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Suspense } from "react";

interface OrderDetail {
  id: string;
  order_number: string;
  total_amount: number;
  discount_amount: number;
  currency: string;
  status: string;
  razorpay_payment_id: string | null;
  created_at: string;
  order_items: {
    id: string;
    product_name: string;
    price: number;
    file_url: string | null;
  }[];
}

function OrderContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const isSuccess = searchParams.get("success") === "true";
  const { user } = useAuth();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const d = dark;

  useEffect(() => {
    if (!user || !params.id) return;
    const fetchOrder = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("orders")
        .select(`
          id, order_number, total_amount, discount_amount, currency, status, razorpay_payment_id, created_at,
          order_items (id, product_name, price, file_url)
        `)
        .eq("id", params.id as string)
        .eq("user_id", user.id)
        .single();

      setOrder(data as any);
      setLoading(false);
    };
    fetchOrder();
  }, [user, params.id]);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${d ? "bg-[#0a0a0f]" : "bg-gray-50"}`}>
        <div className="inline-flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <span className={d ? "text-gray-400" : "text-gray-500"}>Loading order...</span>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${d ? "bg-[#0a0a0f]" : "bg-gray-50"}`}>
        <div className="text-center">
          <Package size={48} className={`mx-auto mb-4 ${d ? "text-gray-700" : "text-gray-300"}`} />
          <h2 className="text-xl font-bold mb-2">Order not found</h2>
          <Link href="/orders" className="text-violet-500 hover:underline text-sm">View all orders</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center px-6 py-12 ${d ? "bg-[#0a0a0f]" : "bg-gray-50"}`}>
      <div className="max-w-2xl w-full">
        <div className={`rounded-2xl p-8 md:p-12 text-center shadow-2xl ${d ? "bg-gray-900/80 border border-gray-800" : "bg-white border border-gray-200"}`}>
          {isSuccess ? (
            <>
              <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={48} className="text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold mb-3">Payment Successful!</h1>
              <p className={`text-lg mb-8 ${d ? "text-gray-400" : "text-gray-600"}`}>Your products are ready to download.</p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileSpreadsheet size={32} className="text-white" />
              </div>
              <h1 className="text-2xl font-extrabold mb-2">Invoice</h1>
              <p className={`text-sm font-mono mb-6 ${d ? "text-gray-500" : "text-gray-400"}`}>{order.order_number}</p>
            </>
          )}

          {/* Download Section */}
          <div className={`rounded-2xl p-6 mb-6 ${d ? "bg-violet-500/10 border-2 border-violet-500/30" : "bg-gradient-to-r from-violet-50 to-indigo-50 border-2 border-violet-300"}`}>
            <h2 className="text-xl font-bold mb-4">Download Your Products</h2>
            <div className="space-y-3">
              {order.order_items?.map((item) => (
                <div key={item.id} className={`flex items-center justify-between rounded-xl p-4 ${d ? "bg-gray-900/60 border border-gray-800" : "bg-white border border-violet-200"}`}>
                  <span className="font-medium text-sm">{item.product_name}</span>
                  {item.file_url ? (
                    <a href={`/api/downloads?orderItemId=${item.id}`} target="_blank" rel="noopener noreferrer"
                      className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-lg font-semibold text-sm inline-flex items-center gap-2 shadow-lg shadow-violet-500/25 transition-all">
                      <Download size={16} /> Download
                    </a>
                  ) : (
                    <span className={`text-xs ${d ? "text-gray-600" : "text-gray-400"}`}>Processing...</span>
                  )}
                </div>
              ))}
            </div>
            <div className={`flex items-center justify-center gap-2 mt-3 text-xs ${d ? "text-gray-500" : "text-gray-400"}`}>
              <Shield size={12} /> Secure download · .xlsx format
            </div>
          </div>

          {/* Payment Info */}
          {order.razorpay_payment_id && (
            <div className={`rounded-xl p-4 mb-6 ${d ? "bg-gray-800/50 border border-gray-700" : "bg-gray-50 border border-gray-200"}`}>
              <p className={`text-xs mb-1 ${d ? "text-gray-500" : "text-gray-500"}`}>Payment ID</p>
              <p className={`text-sm font-mono select-all ${d ? "text-gray-300" : "text-gray-700"}`}>{order.razorpay_payment_id}</p>
            </div>
          )}

          {/* Order Summary */}
          <div className={`rounded-xl p-4 mb-6 text-left ${d ? "bg-gray-800/50 border border-gray-700" : "bg-gray-50 border border-gray-200"}`}>
            <div className="flex justify-between text-sm mb-2">
              <span className={d ? "text-gray-400" : "text-gray-500"}>Order Total</span>
              <span className="font-medium">₹{order.total_amount}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-sm text-violet-500">
                <span>Discount</span>
                <span>-₹{order.discount_amount}</span>
              </div>
            )}
            <div className={`flex justify-between text-sm mt-2 pt-2 ${d ? "border-t border-gray-700" : "border-t border-gray-200"}`}>
              <span className={d ? "text-gray-400" : "text-gray-500"}>Date</span>
              <span className="font-medium">{new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/orders" className="text-violet-500 hover:text-violet-600 font-semibold inline-flex items-center justify-center gap-2 transition-colors">
              <Package size={16} /> All Orders
            </Link>
            <Link href="/" className={`font-medium inline-flex items-center justify-center gap-2 transition-colors ${d ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-700"}`}>
              <ArrowLeft size={16} /> Back to Store
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-gray-500">Loading...</div></div>}>
      <OrderContent />
    </Suspense>
  );
}
