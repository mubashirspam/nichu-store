"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle,
  ShoppingCart,
  Shield,
  Sparkles,
  Star,
  ArrowRight,
  FileSpreadsheet,
  ChevronDown,
  Download,
  Zap,
  Eye,
  X,
  Dumbbell,
  TrendingUp,
  Apple,
  Ruler,
  User,
  LogOut,
  Package,
  Plus,
  Settings,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import LoginModal from "@/components/auth/LoginModal";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  short_name: string;
  price: number;
  original_price: number;
  currency: string;
  description: string;
  features: string[];
  icon_name: string;
  color: string;
  badge: string | null;
  file_url: string | null;
}

const iconMap: Record<string, React.ReactNode> = {
  Dumbbell: <Dumbbell size={28} />,
  TrendingUp: <TrendingUp size={28} />,
  Apple: <Apple size={28} />,
  Ruler: <Ruler size={28} />,
};

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  image?: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  notes?: Record<string, string>;
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, callback: () => void) => void;
}

// ─── RAZORPAY KEY ────────────────────────────────────────────────
const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";

// ─── SVG PREVIEW COMPONENTS ─────────────────────────────────────

function SpreadsheetPreview() {
  return (
    <svg viewBox="0 0 400 280" className="w-full rounded-xl shadow-lg">
      <rect width="400" height="280" fill="#f8fafc" rx="12" />
      <rect x="0" y="0" width="400" height="36" fill="#10b981" rx="12" />
      <rect x="0" y="24" width="400" height="12" fill="#10b981" />
      <text x="16" y="24" fill="white" fontSize="13" fontWeight="bold">Ultimate Fitness Tracker — Weekly Dashboard</text>
      {/* Column headers */}
      <rect x="12" y="46" width="70" height="22" fill="#e2e8f0" rx="4" />
      <text x="22" y="61" fill="#475569" fontSize="9" fontWeight="600">Day</text>
      <rect x="90" y="46" width="70" height="22" fill="#e2e8f0" rx="4" />
      <text x="96" y="61" fill="#475569" fontSize="9" fontWeight="600">Workout</text>
      <rect x="168" y="46" width="56" height="22" fill="#e2e8f0" rx="4" />
      <text x="174" y="61" fill="#475569" fontSize="9" fontWeight="600">Calories</text>
      <rect x="232" y="46" width="50" height="22" fill="#e2e8f0" rx="4" />
      <text x="238" y="61" fill="#475569" fontSize="9" fontWeight="600">Water</text>
      <rect x="290" y="46" width="50" height="22" fill="#e2e8f0" rx="4" />
      <text x="296" y="61" fill="#475569" fontSize="9" fontWeight="600">Sleep</text>
      <rect x="348" y="46" width="42" height="22" fill="#e2e8f0" rx="4" />
      <text x="352" y="61" fill="#475569" fontSize="9" fontWeight="600">Weight</text>
      {/* Data rows */}
      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => {
        const y = 76 + i * 24;
        const bg = i % 2 === 0 ? "#ffffff" : "#f1f5f9";
        return (
          <g key={day}>
            <rect x="12" y={y} width="378" height="22" fill={bg} rx="3" />
            <text x="22" y={y + 15} fill="#334155" fontSize="9">{day}</text>
            <text x="96" y={y + 15} fill="#10b981" fontSize="9">{["Chest", "Back", "Legs", "Arms", "Cardio", "Full Body", "Rest"][i]}</text>
            <text x="174" y={y + 15} fill="#334155" fontSize="9">{[2200, 2100, 2350, 2150, 2000, 2400, 1900][i]}</text>
            <text x="238" y={y + 15} fill="#3b82f6" fontSize="9">{[3.2, 2.8, 3.5, 3.0, 2.5, 3.8, 2.0][i]}L</text>
            <text x="296" y={y + 15} fill="#8b5cf6" fontSize="9">{[7.5, 6.8, 8.0, 7.2, 6.5, 8.5, 9.0][i]}h</text>
            <text x="352" y={y + 15} fill="#334155" fontSize="9">{[75.2, 75.1, 75.0, 74.9, 74.8, 74.9, 74.7][i]}kg</text>
          </g>
        );
      })}
      {/* Mini chart area */}
      <rect x="12" y="250" width="120" height="5" fill="#10b981" rx="2" opacity="0.3" />
      <rect x="12" y="250" width="85" height="5" fill="#10b981" rx="2" />
      <text x="140" y="256" fill="#10b981" fontSize="8" fontWeight="600">Weekly Goal: 71%</text>
    </svg>
  );
}

function ChartPreview() {
  return (
    <svg viewBox="0 0 400 260" className="w-full rounded-xl shadow-lg">
      <rect width="400" height="260" fill="#f8fafc" rx="12" />
      <text x="20" y="28" fill="#1e293b" fontSize="13" fontWeight="bold">Weight Progress — Last 8 Weeks</text>
      {/* Y axis */}
      <line x1="50" y1="45" x2="50" y2="210" stroke="#cbd5e1" strokeWidth="1" />
      {["78", "76", "74", "72", "70"].map((v, i) => (
        <g key={v}>
          <text x="14" y={52 + i * 40} fill="#94a3b8" fontSize="9">{v}kg</text>
          <line x1="48" y1={48 + i * 40} x2="380" y2={48 + i * 40} stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="4" />
        </g>
      ))}
      {/* X axis */}
      <line x1="50" y1="210" x2="380" y2="210" stroke="#cbd5e1" strokeWidth="1" />
      {/* Line chart */}
      <polyline
        fill="none"
        stroke="#10b981"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points="70,58 112,68 154,75 196,90 238,105 280,120 322,128 364,145"
      />
      {/* Data points */}
      {[
        [70, 58], [112, 68], [154, 75], [196, 90],
        [238, 105], [280, 120], [322, 128], [364, 145],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="4" fill="#10b981" stroke="white" strokeWidth="2" />
      ))}
      {/* Area fill */}
      <polygon
        points="70,58 112,68 154,75 196,90 238,105 280,120 322,128 364,145 364,210 70,210"
        fill="url(#areaGrad)"
        opacity="0.2"
      />
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Week labels */}
      {["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"].map((w, i) => (
        <text key={w} x={64 + i * 42} y="228" fill="#94a3b8" fontSize="9">{w}</text>
      ))}
      {/* Legend */}
      <rect x="280" y="235" width="10" height="10" fill="#10b981" rx="2" />
      <text x="295" y="244" fill="#64748b" fontSize="9">Weight (kg)</text>
    </svg>
  );
}

function NutritionChartPreview() {
  const bars = [
    { label: "Mon", protein: 80, carbs: 55, fat: 35 },
    { label: "Tue", protein: 70, carbs: 65, fat: 30 },
    { label: "Wed", protein: 90, carbs: 50, fat: 40 },
    { label: "Thu", protein: 75, carbs: 60, fat: 25 },
    { label: "Fri", protein: 85, carbs: 45, fat: 35 },
    { label: "Sat", protein: 65, carbs: 70, fat: 45 },
    { label: "Sun", protein: 60, carbs: 55, fat: 30 },
  ];
  return (
    <svg viewBox="0 0 400 260" className="w-full rounded-xl shadow-lg">
      <rect width="400" height="260" fill="#f8fafc" rx="12" />
      <text x="20" y="28" fill="#1e293b" fontSize="13" fontWeight="bold">Macro Breakdown — This Week</text>
      {bars.map((b, i) => {
        const x = 45 + i * 50;
        return (
          <g key={b.label}>
            <rect x={x} y={210 - b.protein} width="12" height={b.protein} fill="#10b981" rx="2" />
            <rect x={x + 14} y={210 - b.carbs} width="12" height={b.carbs} fill="#3b82f6" rx="2" />
            <rect x={x + 28} y={210 - b.fat} width="12" height={b.fat} fill="#f59e0b" rx="2" />
            <text x={x + 14} y="228" fill="#94a3b8" fontSize="9" textAnchor="middle">{b.label}</text>
          </g>
        );
      })}
      <line x1="40" y1="210" x2="390" y2="210" stroke="#cbd5e1" strokeWidth="1" />
      {/* Legend */}
      <rect x="120" y="240" width="10" height="10" fill="#10b981" rx="2" />
      <text x="134" y="249" fill="#64748b" fontSize="9">Protein</text>
      <rect x="180" y="240" width="10" height="10" fill="#3b82f6" rx="2" />
      <text x="194" y="249" fill="#64748b" fontSize="9">Carbs</text>
      <rect x="235" y="240" width="10" height="10" fill="#f59e0b" rx="2" />
      <text x="249" y="249" fill="#64748b" fontSize="9">Fat</text>
    </svg>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────

const colorMap: Record<string, { bg: string; text: string; border: string; light: string; badge: string; btn: string; btnHover: string }> = {
  emerald: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-200",
    light: "bg-emerald-100",
    badge: "bg-emerald-500",
    btn: "bg-emerald-600 hover:bg-emerald-700",
    btnHover: "hover:border-emerald-300",
  },
  blue: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-200",
    light: "bg-blue-100",
    badge: "bg-blue-500",
    btn: "bg-blue-600 hover:bg-blue-700",
    btnHover: "hover:border-blue-300",
  },
  orange: {
    bg: "bg-orange-50",
    text: "text-orange-600",
    border: "border-orange-200",
    light: "bg-orange-100",
    badge: "bg-orange-500",
    btn: "bg-orange-600 hover:bg-orange-700",
    btnHover: "hover:border-orange-300",
  },
  pink: {
    bg: "bg-pink-50",
    text: "text-pink-600",
    border: "border-pink-200",
    light: "bg-pink-100",
    badge: "bg-pink-500",
    btn: "bg-pink-600 hover:bg-pink-700",
    btnHover: "hover:border-pink-300",
  },
};

export default function StorePage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, profile, signOut, isAdmin } = useAuth();
  const { addToCart, isInCart, itemCount } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        if (Array.isArray(data)) setProducts(data);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleAddToCart = async (product: Product) => {
    if (!user) {
      setShowLogin(true);
      return;
    }
    await addToCart(product.id);
  };

  const handleBuyNow = async (product: Product) => {
    if (!user) {
      setShowLogin(true);
      return;
    }

    // Add to cart first, then redirect to cart for checkout
    if (!isInCart(product.id)) {
      await addToCart(product.id);
    }
    window.location.href = "/cart";
  };

  const mainProduct = products[0] || null;
  const otherProducts = products.slice(1);

  // Show loading state during initial render/build
  if (loading || !mainProduct) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />

      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-lg z-50 border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <a href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center">
                <Dumbbell size={18} className="text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                Nizam<span className="text-emerald-600">Store</span>
              </span>
            </a>
            <div className="flex items-center gap-4">
              <a href="#products" className="hidden md:block text-gray-600 hover:text-emerald-600 transition-colors text-sm font-medium">
                Products
              </a>
              <a href="#previews" className="hidden md:block text-gray-600 hover:text-emerald-600 transition-colors text-sm font-medium">
                Previews
              </a>
              <a href="#faq" className="hidden md:block text-gray-600 hover:text-emerald-600 transition-colors text-sm font-medium">
                FAQ
              </a>

              {/* Cart Button */}
              <Link href="/cart" className="relative text-gray-600 hover:text-emerald-600 transition-colors">
                <ShoppingCart size={20} />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-emerald-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {itemCount}
                  </span>
                )}
              </Link>

              {/* Auth */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors text-sm font-medium"
                  >
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                      <User size={16} className="text-emerald-600" />
                    </div>
                  </button>
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <Link href="/orders" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setShowUserMenu(false)}>
                        <Package size={14} />
                        My Orders
                      </Link>
                      {isAdmin && (
                        <Link href="/admin" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setShowUserMenu(false)}>
                          <Settings size={14} />
                          Admin Dashboard
                        </Link>
                      )}
                      <button onClick={() => { signOut(); setShowUserMenu(false); }} className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full">
                        <LogOut size={14} />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowLogin(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all duration-200 shadow-sm"
                >
                  <User size={16} />
                  <span className="hidden sm:inline">Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-28 pb-20 px-6 bg-gradient-to-b from-emerald-50/60 to-white relative overflow-hidden">
        <div className="absolute top-20 right-0 w-96 h-96 bg-emerald-100 rounded-full blur-3xl opacity-40" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-100 rounded-full blur-3xl opacity-30" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Left */}
            <div className="lg:w-1/2">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 rounded-full text-emerald-700 text-sm font-medium mb-6">
                  <Sparkles size={16} />
                  Premium Excel Fitness Trackers
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight text-gray-900">
                  Track Your Fitness{" "}
                  <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                    Like a Pro
                  </span>
                </h1>

                <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-lg">
                  Beautiful, ready-to-use Excel spreadsheets with auto-generated charts to track workouts, nutrition, body measurements, sleep and more.
                </p>

                <div className="flex items-center gap-4 mb-8">
                  <span className="text-4xl font-extrabold text-gray-900">
                    ₹{mainProduct?.price}
                  </span>
                  <span className="text-xl text-gray-400 line-through">
                    ₹{mainProduct?.original_price}
                  </span>
                  {mainProduct && (
                    <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold">
                      {Math.round(
                        ((mainProduct.original_price - mainProduct.price) /
                          mainProduct.original_price) *
                          100
                      )}
                      % OFF
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-3 mb-8">
                  <button
                    onClick={() => handleBuyNow(mainProduct)}
                    disabled={isProcessing}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl font-semibold text-base flex items-center gap-3 transition-all duration-200 shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      "Processing..."
                    ) : (
                      <>
                        <ShoppingCart size={20} />
                        Buy Now — ₹{mainProduct.price}
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => { setSelectedProduct(mainProduct); setShowPreview(true); }}
                    className="border-2 border-gray-200 hover:border-emerald-300 text-gray-700 px-6 py-4 rounded-xl font-semibold text-base flex items-center gap-2 transition-all duration-200"
                  >
                    <Eye size={20} />
                    Preview
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-gray-500 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Shield size={14} className="text-emerald-600" />
                    Secure Payment
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Download size={14} className="text-emerald-600" />
                    Instant Download
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Zap size={14} className="text-emerald-600" />
                    Lifetime Updates
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right — Spreadsheet Preview */}
            <div className="lg:w-1/2">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative"
              >
                <div className="absolute -inset-4 bg-gradient-to-r from-emerald-200 to-teal-200 rounded-2xl blur-2xl opacity-30" />
                <div className="relative bg-white border border-gray-200 rounded-2xl p-4 shadow-xl">
                  <SpreadsheetPreview />
                  <div className="mt-3 flex items-center justify-between px-2">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <FileSpreadsheet size={14} />
                      Excel / Google Sheets compatible
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={12} className="text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-10 px-6 border-b border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { number: "500+", label: "Happy Customers" },
              { number: "4.9★", label: "Average Rating" },
              { number: "4", label: "Tracker Products" },
              { number: "24/7", label: "Email Support" },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
              >
                <div className="text-2xl md:text-3xl font-extrabold text-emerald-600">{stat.number}</div>
                <div className="text-gray-500 text-sm mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* All Products */}
      <section id="products" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3 text-gray-900">
              Our Fitness Trackers
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Professional Excel spreadsheets designed to help you crush your fitness goals. Pick one or grab them all.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product, idx) => {
              const colors = colorMap[product.color];
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className={`relative bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 ${colors.btnHover} group`}
                >
                  {product.badge && (
                    <div className={`absolute -top-3 left-6 ${colors.badge} text-white text-xs font-bold px-3 py-1 rounded-full`}>
                      {product.badge}
                    </div>
                  )}

                  <div className={`w-14 h-14 ${colors.light} rounded-xl flex items-center justify-center mb-4 ${colors.text}`}>
                    {iconMap[product.icon_name] || <Dumbbell size={28} />}
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2">{product.short_name}</h3>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">{product.description}</p>

                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-2xl font-extrabold text-gray-900">₹{product.price}</span>
                    <span className="text-sm text-gray-400 line-through">₹{product.original_price}</span>
                  </div>

                  <ul className="space-y-2 mb-6">
                    {product.features.slice(0, 4).map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <CheckCircle size={14} className={`${colors.text} mt-0.5 flex-shrink-0`} />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={isInCart(product.id)}
                      className={`flex-1 ${isInCart(product.id) ? 'bg-gray-200 text-gray-600' : colors.btn + ' text-white'} py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-70`}
                    >
                      {isInCart(product.id) ? (
                        <><CheckCircle size={16} /> In Cart</>
                      ) : (
                        <><Plus size={16} /> Add to Cart</>
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Product Detail */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-start gap-12">
            <div className="lg:w-1/2">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-gray-900">
                Everything in the{" "}
                <span className="text-emerald-600">Ultimate Fitness Tracker</span>
              </h2>
              <p className="text-gray-500 text-lg mb-8">
                The most comprehensive fitness tracking Excel sheet you&apos;ll ever need. Works perfectly in Microsoft Excel and Google Sheets.
              </p>

              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {mainProduct.features.map((feature, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="flex items-start gap-3 bg-white p-4 rounded-xl border border-gray-100"
                  >
                    <CheckCircle size={18} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 text-sm font-medium">{feature}</span>
                  </motion.div>
                ))}
              </div>

              <button
                onClick={() => handleBuyNow(mainProduct)}
                disabled={isProcessing}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl font-semibold text-base flex items-center gap-3 transition-all duration-200 shadow-lg shadow-emerald-200 disabled:opacity-50"
              >
                {isProcessing ? "Processing..." : (
                  <>
                    <ShoppingCart size={20} />
                    Get It Now — ₹{mainProduct.price}
                  </>
                )}
              </button>
            </div>

            <div className="lg:w-1/2 space-y-6">
              <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-md">
                <ChartPreview />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-md">
                <NutritionChartPreview />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Preview Section */}
      <section id="previews" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3 text-gray-900">
              See What You Get
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Real previews from our Excel fitness trackers. Beautiful charts that update automatically as you enter data.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Weekly Dashboard", desc: "Track all your daily metrics in one glance", preview: <SpreadsheetPreview /> },
              { title: "Weight Progress", desc: "Auto-generated charts show your transformation", preview: <ChartPreview /> },
              { title: "Macro Breakdown", desc: "Visualise your nutrition with stacked bar charts", preview: <NutritionChartPreview /> },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <div className="p-3">{item.preview}</div>
                <div className="px-5 pb-5">
                  <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-gray-500 text-sm">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3 text-gray-900">
              What Our Customers Say
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Rahul S.",
                text: "This fitness tracker completely changed how I log my workouts. The charts update automatically — it feels like a premium app, but in Excel!",
                rating: 5,
              },
              {
                name: "Priya M.",
                text: "I bought the nutrition planner and body tracker. The macro charts are amazing. I can finally see where my diet needs improvement.",
                rating: 5,
              },
              {
                name: "Arjun K.",
                text: "Best ₹299 I've ever spent. The workout log has 200+ exercises already filled in. I just enter my sets and reps. Super easy.",
                rating: 5,
              },
            ].map((review, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-white border border-gray-200 rounded-2xl p-6"
              >
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">&ldquo;{review.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold text-sm">
                    {review.name[0]}
                  </div>
                  <span className="font-semibold text-gray-900 text-sm">{review.name}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3 text-gray-900">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "What format are the trackers in?",
                a: "All trackers are Excel (.xlsx) files. They work perfectly in Microsoft Excel, Google Sheets, and other spreadsheet apps.",
              },
              {
                q: "Do the charts update automatically?",
                a: "Yes! All charts and graphs are linked to your data cells. As you enter your numbers, the charts update instantly.",
              },
              {
                q: "Can I use this on my phone?",
                a: "Absolutely. Open the Excel file in the Google Sheets or Microsoft Excel app on your phone and track on the go.",
              },
              {
                q: "Do I get free updates?",
                a: "Yes, you get lifetime access to all future updates. We regularly add new features and improve the templates.",
              },
              {
                q: "How do I receive the file after purchase?",
                a: "After successful payment, you'll receive an instant download link. We also send a copy to your email.",
              },
              {
                q: "Can I get a refund?",
                a: "Yes, we offer a 7-day refund policy. If you're not satisfied, contact us for a full refund.",
              },
            ].map((faq, idx) => (
              <FaqItem key={idx} question={faq.q} answer={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-white">
              Start Your Fitness Journey Today
            </h2>
            <p className="text-emerald-100 text-lg mb-8 max-w-xl mx-auto">
              One-time purchase. Lifetime access. No subscriptions. Track your progress and see real results.
            </p>

            <div className="flex items-center justify-center gap-4 mb-8">
              <span className="text-4xl font-extrabold text-white">₹{mainProduct?.price}</span>
              <span className="text-xl text-emerald-200 line-through">₹{mainProduct?.original_price}</span>
            </div>

            <button
              onClick={() => mainProduct && handleBuyNow(mainProduct)}
              disabled={isProcessing || !mainProduct}
              className="bg-white text-emerald-700 hover:bg-emerald-50 px-10 py-4 rounded-xl font-bold text-lg inline-flex items-center gap-3 transition-all duration-200 shadow-xl disabled:opacity-50"
            >
              {isProcessing ? "Processing..." : (
                <>
                  Get the Ultimate Tracker <ArrowRight size={22} />
                </>
              )}
            </button>

            <p className="text-emerald-200 text-xs mt-4">
              By purchasing, you agree to our{" "}
              <a href="/terms/" className="text-white underline">Terms & Conditions</a>{" "}
              and{" "}
              <a href="/refund/" className="text-white underline">Refund Policy</a>.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <Dumbbell size={16} className="text-white" />
              </div>
              <div>
                <span className="text-lg font-bold text-gray-900">
                  Nizam<span className="text-emerald-600">Store</span>
                </span>
                <p className="text-gray-400 text-xs">Digital Products by Nizamudheen KC</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-6 text-sm">
              <a href="/privacy/" className="text-gray-500 hover:text-emerald-600 transition-colors">Privacy Policy</a>
              <a href="/terms/" className="text-gray-500 hover:text-emerald-600 transition-colors">Terms & Conditions</a>
              <a href="/refund/" className="text-gray-500 hover:text-emerald-600 transition-colors">Refund Policy</a>
            </div>
          </div>

          <div className="text-center text-gray-400 text-xs mt-8">
            © {new Date().getFullYear()} Nizamudheen KC. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4" onClick={() => setShowPreview(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">{selectedProduct?.name} — Preview</h3>
              <button onClick={() => setShowPreview(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-6">
              <SpreadsheetPreview />
              <ChartPreview />
              <NutritionChartPreview />
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => { setShowPreview(false); if (selectedProduct) handleBuyNow(selectedProduct); }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
              >
                <ShoppingCart size={18} />
                Buy Now — ₹{selectedProduct?.price}
              </button>
              <button onClick={() => setShowPreview(false)} className="px-6 py-3 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50">
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Scroll to top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-6 right-6 bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-full transition-all duration-200 shadow-lg"
      >
        <ChevronDown className="rotate-180" size={22} />
      </button>
    </div>
  );
}

// ─── FAQ ACCORDION COMPONENT ─────────────────────────────────────

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="font-semibold text-gray-900 text-sm">{question}</span>
        <ChevronDown size={18} className={`text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-5 pb-5 text-gray-600 text-sm leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
}
