"use client";

import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { CheckCircle, Download, ArrowLeft, Dumbbell, FileSpreadsheet, Shield, Package } from "lucide-react";
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
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center">
        <div className="text-gray-500">Loading order...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package size={48} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Order not found</h2>
          <Link href="/orders" className="text-emerald-600 hover:underline text-sm">View all orders</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center px-6 py-12">
      <div className="max-w-2xl w-full">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 md:p-12 text-center shadow-xl">
          {isSuccess && order.status === "completed" && (
            <>
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={48} className="text-emerald-600" />
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">Payment Successful!</h1>
              <p className="text-gray-600 text-lg mb-8">Your products are ready to download.</p>
            </>
          )}

          {!isSuccess && (
            <>
              <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Order Details</h1>
              <p className="text-gray-400 text-sm font-mono mb-6">{order.order_number}</p>
            </>
          )}

          {/* Download Section */}
          {order.status === "completed" && (
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-2xl p-6 mb-6">
              <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <FileSpreadsheet size={28} className="text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Download Your Products</h2>

              <div className="space-y-3">
                {order.order_items?.map((item) => (
                  <div key={item.id} className="flex items-center justify-between bg-white rounded-xl p-4 border border-emerald-200">
                    <span className="font-medium text-gray-900 text-sm">{item.product_name}</span>
                    {item.file_url ? (
                      <a
                        href={item.file_url}
                        download
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg font-semibold text-sm inline-flex items-center gap-2 transition-colors"
                      >
                        <Download size={16} />
                        Download
                      </a>
                    ) : (
                      <span className="text-gray-400 text-xs">Coming soon</span>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center gap-2 mt-3 text-xs text-gray-400">
                <Shield size={12} />
                Secure download · .xlsx format
              </div>
            </div>
          )}

          {/* Payment Info */}
          {order.razorpay_payment_id && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
              <p className="text-xs text-gray-500 mb-1">Payment ID</p>
              <p className="text-sm font-mono text-gray-700 select-all">{order.razorpay_payment_id}</p>
            </div>
          )}

          {/* Order Summary */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 text-left">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Order Total</span>
              <span className="font-medium">₹{order.total_amount}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-sm text-emerald-600">
                <span>Discount</span>
                <span>-₹{order.discount_amount}</span>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/orders" className="text-emerald-600 hover:text-emerald-700 font-semibold inline-flex items-center justify-center gap-2 transition-colors">
              <Package size={16} />
              All Orders
            </Link>
            <Link href="/" className="text-gray-500 hover:text-gray-700 font-medium inline-flex items-center justify-center gap-2 transition-colors">
              <ArrowLeft size={16} />
              Back to Store
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
