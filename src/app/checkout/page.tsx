"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { ShoppingCart, CreditCard, ArrowLeft, Tag, Sparkles, ShieldCheck, Lock, CheckCircle, Loader2, Package, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useProducts } from "@/contexts/ProductContext";
import { useCart } from "@/contexts/CartContext";

interface CheckoutItem {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { products, loading: productsLoading } = useProducts();
  const { items: cartItems, totalAmount: cartTotal, loading: cartLoading, clearCart } = useCart();

  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [dark, setDark] = useState(false);

  // Offer code state
  const [offerCode, setOfferCode] = useState("");
  const [offerDiscount, setOfferDiscount] = useState(0);
  const [offerMessage, setOfferMessage] = useState("");
  const [offerError, setOfferError] = useState("");
  const [offerApplied, setOfferApplied] = useState(false);
  const [checkingCode, setCheckingCode] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const d = dark;
  const source = searchParams.get("source"); // "cart" or null
  const productId = searchParams.get("product"); // single product from LP

  // Determine checkout items based on source
  const checkoutItems: CheckoutItem[] = useMemo(() => {
    if (source === "cart") {
      return cartItems.map((item) => ({
        id: item.product_id,
        name: item.product.name,
        price: Number(item.product.price),
        originalPrice: Number(item.product.original_price),
      }));
    }
    if (productId) {
      const product = products.find((p) => p.id === productId);
      if (product) {
        return [{
          id: product.id,
          name: product.name,
          price: Number(product.price),
          originalPrice: Number(product.original_price),
        }];
      }
    }
    return [];
  }, [source, productId, cartItems, products]);

  const subtotal = checkoutItems.reduce((sum, item) => sum + item.price, 0);
  const totalSaved = checkoutItems.reduce((sum, item) => sum + Math.max(0, item.originalPrice - item.price), 0);
  const finalAmount = Math.max(subtotal - offerDiscount, 1);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      const currentUrl = typeof window !== "undefined" ? window.location.pathname + window.location.search : "/checkout";
      router.push(`/auth/sign-in?callbackURL=${encodeURIComponent(currentUrl)}`);
    }
  }, [user, authLoading, router]);

  const isLoading = authLoading || productsLoading || (source === "cart" && cartLoading);

  // Validate offer code
  const handleApplyCode = async () => {
    if (!offerCode.trim()) return;
    setCheckingCode(true);
    setOfferError("");
    setOfferMessage("");

    try {
      const res = await fetch("/api/offer-codes/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: offerCode, cartTotal: subtotal }),
      });
      const data = await res.json();

      if (res.ok && data.valid) {
        setOfferDiscount(data.discountAmount);
        setOfferMessage(data.message);
        setOfferApplied(true);
        setOfferError("");
      } else {
        setOfferError(data.error || "Invalid code");
        setOfferDiscount(0);
        setOfferApplied(false);
      }
    } catch {
      setOfferError("Failed to validate code");
    } finally {
      setCheckingCode(false);
    }
  };

  const handleRemoveCode = () => {
    setOfferCode("");
    setOfferDiscount(0);
    setOfferMessage("");
    setOfferError("");
    setOfferApplied(false);
  };

  // Process payment via Razorpay
  const handlePay = async () => {
    if (!user || checkoutItems.length === 0) return;

    setProcessing(true);
    setError("");

    try {
      const orderItems = checkoutItems.map((item) => ({ product_id: item.id }));
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: orderItems,
          offerCode: offerApplied ? offerCode : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create order");

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: data.amount,
        currency: data.currency,
        name: "NichuStore",
        description: `Order ${data.orderNumber}`,
        order_id: data.orderId,
        prefill: {
          name: user.fullName || "",
          email: user.email || "",
        },
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/orders/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                dbOrderId: data.dbOrderId,
                offerCode: offerApplied ? offerCode : null,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.verified) {
              setSuccess(true);
              // Clear cart if source was cart
              if (source === "cart") {
                try { await clearCart(); } catch {}
              }
              setTimeout(() => {
                window.location.href = "/orders?success=true";
              }, 1500);
            } else {
              setError("Payment verification failed. Please contact support.");
              setProcessing(false);
            }
          } catch {
            setError("Payment verification failed. Please contact support.");
            setProcessing(false);
          }
        },
        theme: { color: "#7c3aed" },
        modal: {
          ondismiss: () => setProcessing(false),
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", (resp: any) => {
        setProcessing(false);
        setError(resp?.error?.description || "Payment failed. Please try again.");
      });
      rzp.open();
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
      setProcessing(false);
    }
  };

  // Success state
  if (success) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${d ? "bg-[#0a0a0f] text-white" : "bg-gray-50 text-gray-900"}`}>
        <div className="text-center px-4">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={40} className="text-emerald-400" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Payment Successful!</h2>
          <p className={`text-sm sm:text-base ${d ? "text-gray-400" : "text-gray-500"}`}>Redirecting to your orders...</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${d ? "bg-[#0a0a0f] text-white" : "bg-gray-50 text-gray-900"}`}>
        <div className="text-center">
          <Loader2 size={40} className="mx-auto mb-4 animate-spin text-violet-500" />
          <p className={`text-sm ${d ? "text-gray-400" : "text-gray-500"}`}>Loading checkout...</p>
        </div>
      </div>
    );
  }

  // No items state
  if (checkoutItems.length === 0) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${d ? "bg-[#0a0a0f] text-white" : "bg-gray-50 text-gray-900"}`}>
        <div className="text-center px-4">
          <ShoppingCart size={48} className={`mx-auto mb-4 ${d ? "text-gray-700" : "text-gray-300"}`} />
          <h2 className="text-xl sm:text-2xl font-bold mb-2">Nothing to checkout</h2>
          <p className={`mb-6 text-sm ${d ? "text-gray-500" : "text-gray-500"}`}>Add some products first</p>
          <Link href="/" className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold inline-flex items-center gap-2 text-sm">
            <ArrowLeft size={16} /> Browse Products
          </Link>
        </div>
      </div>
    );
  }

  const backHref = source === "cart" ? "/cart" : "/";

  return (
    <div className={`min-h-screen pb-28 sm:pb-8 ${d ? "bg-[#0a0a0f] text-white" : "bg-gray-50 text-gray-900"}`}>
      {/* Header */}
      <div className={`sticky top-0 z-30 ${d ? "border-b border-gray-800 bg-[#0a0a0f]/80 backdrop-blur-xl" : "bg-white/80 backdrop-blur-xl border-b border-gray-200"}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
              <Sparkles size={14} className="text-white" />
            </div>
            <span className="text-base sm:text-lg font-bold">Nichu<span className="gradient-text">Store</span></span>
          </Link>
          <div className="flex items-center gap-2">
            <Lock size={14} className="text-emerald-500" />
            <span className="text-sm sm:text-base font-bold">Secure Checkout</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 sm:py-8">
        <Link href={backHref} className={`inline-flex items-center gap-2 text-xs sm:text-sm mb-5 sm:mb-6 transition-colors ${d ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"}`}>
          <ArrowLeft size={14} /> {source === "cart" ? "Back to cart" : "Back to store"}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 sm:gap-8">
          {/* Left: Order Items */}
          <div className="lg:col-span-3 space-y-4">
            <div className={`rounded-xl sm:rounded-2xl p-4 sm:p-6 ${d ? "bg-gray-900/60 border border-gray-800" : "bg-white border border-gray-200"}`}>
              <h2 className="text-base sm:text-xl font-bold mb-4 flex items-center gap-2">
                <Package size={18} className="sm:w-5 sm:h-5" /> Order Items ({checkoutItems.length})
              </h2>
              <div className="space-y-3">
                {checkoutItems.map((item, i) => (
                  <div key={item.id} className={`flex items-center gap-3 sm:gap-4 py-3 ${i > 0 ? (d ? "border-t border-gray-800" : "border-t border-gray-100") : ""}`}>
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 ${d ? "bg-violet-500/10 text-violet-400" : "bg-violet-100 text-violet-600"}`}>
                      <Package size={18} className="sm:w-5 sm:h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-xs sm:text-base truncate">{item.name}</h3>
                      <p className={`text-[10px] sm:text-sm ${d ? "text-gray-500" : "text-gray-400"}`}>Digital Download</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-bold text-xs sm:text-base">₹{item.price}</div>
                      {item.originalPrice > item.price && (
                        <div className={`text-[10px] sm:text-xs line-through ${d ? "text-gray-600" : "text-gray-400"}`}>₹{item.originalPrice}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Offer Code Section */}
            <div className={`rounded-xl sm:rounded-2xl p-4 sm:p-6 ${d ? "bg-gray-900/60 border border-gray-800" : "bg-white border border-gray-200"}`}>
              <h3 className="text-sm sm:text-base font-bold mb-3 flex items-center gap-2">
                <Tag size={16} /> Have an offer code?
              </h3>
              {offerApplied ? (
                <div className={`flex items-center justify-between p-3 rounded-lg ${d ? "bg-violet-500/10 border border-violet-500/20" : "bg-violet-50 border border-violet-200"}`}>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-violet-500" />
                    <span className="text-sm font-medium text-violet-500">{offerCode}</span>
                    <span className={`text-xs ${d ? "text-gray-400" : "text-gray-500"}`}>— {offerMessage}</span>
                  </div>
                  <button onClick={handleRemoveCode} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${d ? "text-gray-600" : "text-gray-400"}`} />
                    <input
                      type="text"
                      placeholder="Enter offer code"
                      value={offerCode}
                      onChange={(e) => setOfferCode(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === "Enter" && handleApplyCode()}
                      className={`w-full pl-9 pr-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 ${d ? "bg-gray-800 border border-gray-700 text-white placeholder:text-gray-600" : "border border-gray-200 placeholder:text-gray-400"}`}
                    />
                  </div>
                  <button
                    onClick={handleApplyCode}
                    disabled={checkingCode || !offerCode.trim()}
                    className={`px-4 sm:px-5 py-2.5 rounded-lg text-sm font-medium disabled:opacity-40 transition-colors flex-shrink-0 ${d ? "bg-white text-gray-900 hover:bg-gray-200" : "bg-gray-900 text-white hover:bg-gray-800"}`}
                  >
                    {checkingCode ? <Loader2 size={16} className="animate-spin" /> : "Apply"}
                  </button>
                </div>
              )}
              {offerError && <p className="text-xs text-red-500 mt-2">{offerError}</p>}
            </div>
          </div>

          {/* Right: Payment Summary */}
          <div className="lg:col-span-2">
            <div className={`rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:sticky lg:top-24 ${d ? "bg-gray-900/60 border border-gray-800" : "bg-white border border-gray-200"}`}>
              <h3 className="font-bold text-base sm:text-lg mb-4">Payment Summary</h3>
              <div className="space-y-2.5 text-sm mb-4">
                <div className="flex justify-between">
                  <span className={d ? "text-gray-400" : "text-gray-500"}>Subtotal ({checkoutItems.length} {checkoutItems.length === 1 ? "item" : "items"})</span>
                  <span className="font-medium">₹{subtotal}</span>
                </div>
                {totalSaved > 0 && (
                  <div className="flex justify-between text-emerald-500">
                    <span>You save</span>
                    <span className="font-medium">-₹{totalSaved}</span>
                  </div>
                )}
                {offerApplied && offerDiscount > 0 && (
                  <div className="flex justify-between text-violet-500">
                    <span>Offer discount</span>
                    <span className="font-medium">-₹{offerDiscount}</span>
                  </div>
                )}
                <div className={`pt-3 flex justify-between text-base ${d ? "border-t border-gray-800" : "border-t border-gray-100"}`}>
                  <span className="font-bold">Total</span>
                  <span className="font-bold">₹{finalAmount}</span>
                </div>
              </div>

              {error && (
                <div className="mb-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs sm:text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handlePay}
                disabled={processing || checkoutItems.length === 0}
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white py-3 sm:py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25 transition-all disabled:opacity-50 text-sm sm:text-base active:scale-[0.98]"
              >
                {processing ? (
                  <><Loader2 size={16} className="animate-spin" /> Processing...</>
                ) : (
                  <><CreditCard size={16} className="sm:w-[18px] sm:h-[18px]" /> Pay ₹{finalAmount}</>
                )}
              </button>

              <div className={`flex flex-col items-center gap-2 mt-4 text-[10px] sm:text-xs ${d ? "text-gray-600" : "text-gray-400"}`}>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1"><Lock size={11} /> Encrypted</span>
                  <span className="flex items-center gap-1"><ShieldCheck size={11} /> Secure</span>
                  <span className="flex items-center gap-1"><CreditCard size={11} /> Razorpay</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky pay bar */}
      <div className={`fixed bottom-0 left-0 right-0 z-40 sm:hidden ${d ? "bg-[#0a0a0f]/95 border-t border-gray-800 backdrop-blur-xl" : "bg-white/95 border-t border-gray-200 backdrop-blur-xl"}`}>
        <div className="px-4 py-3 flex items-center justify-between gap-3">
          <div>
            <p className={`text-[10px] ${d ? "text-gray-500" : "text-gray-400"}`}>
              {checkoutItems.length} {checkoutItems.length === 1 ? "item" : "items"}
              {offerApplied ? " · Code applied" : ""}
            </p>
            <p className="font-bold text-base">₹{finalAmount}</p>
          </div>
          <button
            onClick={handlePay}
            disabled={processing || checkoutItems.length === 0}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white py-2.5 px-5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-violet-500/25 transition-all disabled:opacity-50 text-sm active:scale-[0.98]"
          >
            {processing ? <Loader2 size={14} className="animate-spin" /> : <CreditCard size={14} />}
            {processing ? "Processing..." : `Pay ₹${finalAmount}`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-violet-500" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
