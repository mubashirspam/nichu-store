"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle, ShoppingCart, Shield, Sparkles, Star, ArrowRight,
  FileSpreadsheet, ChevronUp, Download, Zap, Eye, X,
  Dumbbell, TrendingUp, Apple, Ruler, User, LogOut, Package, Plus,
  Settings, Sun, Moon, BarChart3, Calculator, Target, Wallet,
  Calendar, Heart, Layers,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useProducts, type Product } from "@/contexts/ProductContext";
import LoginModal from "@/components/auth/LoginModal";
import Link from "next/link";
import Image from "next/image";

const iconMap: Record<string, React.ReactNode> = {
  Dumbbell: <Dumbbell size={28} />, TrendingUp: <TrendingUp size={28} />,
  Apple: <Apple size={28} />, Ruler: <Ruler size={28} />,
  Calculator: <Calculator size={28} />, Wallet: <Wallet size={28} />,
  Calendar: <Calendar size={28} />, Target: <Target size={28} />,
  Heart: <Heart size={28} />, BarChart3: <BarChart3 size={28} />,
};

const colorMap: Record<string, { light: string; text: string; badge: string; btn: string }> = {
  emerald: { light: "bg-emerald-500/10", text: "text-emerald-400", badge: "bg-emerald-500", btn: "from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600" },
  blue: { light: "bg-blue-500/10", text: "text-blue-400", badge: "bg-blue-500", btn: "from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600" },
  orange: { light: "bg-orange-500/10", text: "text-orange-400", badge: "bg-orange-500", btn: "from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600" },
  pink: { light: "bg-pink-500/10", text: "text-pink-400", badge: "bg-pink-500", btn: "from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600" },
  purple: { light: "bg-purple-500/10", text: "text-purple-400", badge: "bg-purple-500", btn: "from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600" },
};

export default function StorePage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [dark, setDark] = useState(false);
  const { user, profile, signOut, isAdmin, avatarUrl } = useAuth();
  const { addToCart, isInCart, itemCount } = useCart();
  const { products, loading } = useProducts();

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  }, []);

  const handleAddToCart = useCallback(async (product: Product) => {
    if (!user) { setShowLogin(true); return; }
    await addToCart(product.id);
  }, [user, addToCart]);

  const handleBuyNow = useCallback(async (product: Product) => {
    if (!user) { setShowLogin(true); return; }
    if (!isInCart(product.id)) await addToCart(product.id);
    window.location.href = "/cart";
  }, [user, addToCart, isInCart]);

  const mainProduct = products[0] || null;
  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "U";
  const d = dark; // shorthand

  return (
    <div className={`min-h-screen transition-colors duration-300 ${d ? "bg-[#0a0a0f] text-white" : "bg-white text-gray-900"}`}>
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />

      {/* ── Navigation ── */}
      <nav className={`fixed top-0 w-full z-50 glass ${d ? "glass-light" : "glass-light"}`}>
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                <Sparkles size={18} className="text-white" />
              </div>
              <span className="text-xl font-bold">Nichu<span className="gradient-text">Store</span></span>
            </Link>
            <div className="flex items-center gap-3">
              <a href="#products" className={`hidden md:block text-sm font-medium transition-colors ${d ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"}`}>Products</a>
              <a href="#previews" className={`hidden md:block text-sm font-medium transition-colors ${d ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"}`}>Previews</a>
              <a href="#faq" className={`hidden md:block text-sm font-medium transition-colors ${d ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"}`}>FAQ</a>
              <button onClick={toggleTheme} className={`p-2 rounded-lg transition-colors ${d ? "text-yellow-400 hover:bg-white/10" : "text-gray-500 hover:bg-gray-100"}`}>
                {d ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <Link href="/cart" className={`relative p-2 rounded-lg transition-colors ${d ? "text-gray-400 hover:bg-white/10" : "text-gray-500 hover:bg-gray-100"}`}>
                <ShoppingCart size={18} />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[10px] rounded-full flex items-center justify-center font-bold">{itemCount}</span>
                )}
              </Link>
              {user ? (
                <div className="relative">
                  <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center">
                    {avatarUrl ? (
                      <Image src={avatarUrl} alt="" width={32} height={32} className="w-8 h-8 rounded-full object-cover ring-2 ring-violet-500/50" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                        {displayName[0]?.toUpperCase()}
                      </div>
                    )}
                  </button>
                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        className={`absolute right-0 mt-2 w-56 rounded-2xl shadow-2xl py-2 z-50 ${d ? "bg-gray-900 border border-gray-800" : "bg-white border border-gray-200"}`}>
                        <div className={`px-4 py-3 ${d ? "border-b border-gray-800" : "border-b border-gray-100"}`}>
                          <p className="text-sm font-semibold truncate">{displayName}</p>
                          <p className={`text-xs truncate ${d ? "text-gray-500" : "text-gray-400"}`}>{user.email}</p>
                        </div>
                        <Link href="/orders" className={`flex items-center gap-3 px-4 py-2.5 text-sm ${d ? "hover:bg-white/5" : "hover:bg-gray-50"}`} onClick={() => setShowUserMenu(false)}>
                          <Package size={15} /> My Orders
                        </Link>
                        {isAdmin && (
                          <Link href="/admin" className={`flex items-center gap-3 px-4 py-2.5 text-sm ${d ? "hover:bg-white/5" : "hover:bg-gray-50"}`} onClick={() => setShowUserMenu(false)}>
                            <Settings size={15} /> Admin Dashboard
                          </Link>
                        )}
                        <button onClick={() => { signOut(); setShowUserMenu(false); }} className={`flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 w-full ${d ? "hover:bg-white/5" : "hover:bg-red-50"}`}>
                          <LogOut size={15} /> Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button onClick={() => setShowLogin(true)} className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-5 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-lg shadow-violet-500/25 transition-all">
                  <User size={15} /><span className="hidden sm:inline">Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-28 pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-violet-500/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-indigo-500/15 rounded-full blur-[100px]" />
          <div className="absolute top-40 right-10 w-[300px] h-[300px] bg-pink-500/10 rounded-full blur-[80px]" />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="lg:w-1/2">
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6 bg-gradient-to-r from-violet-500/10 to-indigo-500/10 border border-violet-500/20 text-violet-400">
                  <Sparkles size={14} /> Premium Excel Trackers & Planners
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-[1.1] tracking-tight">
                  Organize Your Life{" "}<span className="gradient-text">Beautifully</span>
                </h1>
                <p className={`text-lg mb-8 leading-relaxed max-w-lg ${d ? "text-gray-400" : "text-gray-600"}`}>
                  Stunning Excel spreadsheets with auto-generated charts to track fitness, expenses, habits, projects & more. One purchase, lifetime access.
                </p>
                {mainProduct && (
                  <div className="flex items-center gap-4 mb-8">
                    <span className="text-4xl font-extrabold">₹{mainProduct.price}</span>
                    <span className={`text-xl line-through ${d ? "text-gray-600" : "text-gray-400"}`}>₹{mainProduct.original_price}</span>
                    <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      {Math.round(((mainProduct.original_price - mainProduct.price) / mainProduct.original_price) * 100)}% OFF
                    </span>
                  </div>
                )}
                <div className="flex flex-wrap gap-3 mb-8">
                  <button onClick={() => mainProduct && handleBuyNow(mainProduct)} disabled={!mainProduct || loading}
                    className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-8 py-4 rounded-2xl font-semibold text-base flex items-center gap-3 shadow-xl shadow-violet-500/25 transition-all disabled:opacity-50">
                    <ShoppingCart size={20} /> {mainProduct ? `Buy Now — ₹${mainProduct.price}` : "Loading..."}
                  </button>
                  <button onClick={() => { if (mainProduct) { setSelectedProduct(mainProduct); setShowPreview(true); } }}
                    className={`px-6 py-4 rounded-2xl font-semibold text-base flex items-center gap-2 transition-all border-2 ${d ? "border-gray-700 hover:border-violet-500 text-gray-300" : "border-gray-200 hover:border-violet-400 text-gray-700"}`}>
                    <Eye size={20} /> Preview
                  </button>
                </div>
                <div className={`flex flex-wrap items-center gap-5 text-sm ${d ? "text-gray-500" : "text-gray-500"}`}>
                  <div className="flex items-center gap-1.5"><Shield size={14} className="text-violet-500" /> Secure Payment</div>
                  <div className="flex items-center gap-1.5"><Download size={14} className="text-violet-500" /> Instant Download</div>
                  <div className="flex items-center gap-1.5"><Zap size={14} className="text-violet-500" /> Lifetime Updates</div>
                </div>
              </motion.div>
            </div>
            <div className="lg:w-1/2">
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="relative">
                <div className="absolute -inset-6 bg-gradient-to-r from-violet-500/20 to-indigo-500/20 rounded-3xl blur-3xl" />
                <div className={`relative rounded-2xl p-5 shadow-2xl ${d ? "bg-gray-900/80 border border-gray-800" : "bg-white border border-gray-200"}`}>
                  <DashboardPreview dark={d} />
                  <div className="mt-4 flex items-center justify-between px-1">
                    <div className={`flex items-center gap-1.5 text-xs ${d ? "text-gray-500" : "text-gray-400"}`}>
                      <FileSpreadsheet size={14} /> Excel / Google Sheets
                    </div>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map((s) => <Star key={s} size={12} className="text-yellow-400 fill-yellow-400" />)}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className={`py-12 px-6 ${d ? "border-y border-gray-800/50" : "border-y border-gray-100"}`}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { number: "500+", label: "Happy Customers" },
            { number: "4.9★", label: "Average Rating" },
            { number: "10+", label: "Templates" },
            { number: "24/7", label: "Support" },
          ].map((stat, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: idx * 0.1 }}>
              <div className="text-3xl font-extrabold gradient-text">{stat.number}</div>
              <div className={`text-sm mt-1 ${d ? "text-gray-500" : "text-gray-500"}`}>{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3">How It <span className="gradient-text">Works</span></h2>
            <p className={`text-lg max-w-2xl mx-auto ${d ? "text-gray-400" : "text-gray-500"}`}>Get started in 3 simple steps</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Pick Your Template", desc: "Browse our collection of beautifully designed Excel templates.", icon: <ShoppingCart size={24} /> },
              { step: "02", title: "Pay & Download", desc: "Secure checkout via Razorpay. Instant access to your files.", icon: <Download size={24} /> },
              { step: "03", title: "Track & Grow", desc: "Open in Excel or Sheets, enter data, watch charts come alive.", icon: <BarChart3 size={24} /> },
            ].map((item, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: idx * 0.15 }}
                className={`p-6 rounded-2xl text-center transition-all ${d ? "bg-gray-900/50 border border-gray-800 hover:border-violet-500/30" : "bg-gray-50 border border-gray-100 hover:border-violet-300"}`}>
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-violet-500/25">{item.icon}</div>
                <span className={`text-xs font-bold ${d ? "text-gray-600" : "text-gray-300"}`}>STEP {item.step}</span>
                <h3 className="text-lg font-bold mt-1 mb-2">{item.title}</h3>
                <p className={`text-sm ${d ? "text-gray-500" : "text-gray-500"}`}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Products ── */}
      <section id="products" className={`py-20 px-6 ${d ? "bg-gray-900/30" : "bg-gray-50/80"}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3">Premium <span className="gradient-text">Templates</span></h2>
            <p className={`text-lg max-w-2xl mx-auto ${d ? "text-gray-400" : "text-gray-500"}`}>Professional Excel spreadsheets to help you track anything.</p>
          </div>
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                <span className={d ? "text-gray-400" : "text-gray-500"}>Loading templates...</span>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product, idx) => {
                const c = colorMap[product.color] || colorMap.emerald;
                const inCart = isInCart(product.id);
                return (
                  <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: idx * 0.08 }}
                    className={`relative group rounded-2xl p-6 transition-all duration-300 ${d ? "bg-gray-900/60 border border-gray-800 hover:border-violet-500/40" : "bg-white border border-gray-200 hover:border-violet-300 hover:shadow-xl"}`}>
                    {product.badge && <div className={`absolute -top-3 left-6 ${c.badge} text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg`}>{product.badge}</div>}
                    <div className={`w-14 h-14 ${c.light} rounded-2xl flex items-center justify-center mb-4 ${c.text}`}>{iconMap[product.icon_name] || <FileSpreadsheet size={28} />}</div>
                    <h3 className="text-lg font-bold mb-1">{product.short_name}</h3>
                    <p className={`text-sm mb-4 line-clamp-2 ${d ? "text-gray-500" : "text-gray-500"}`}>{product.description}</p>
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-2xl font-extrabold">₹{product.price}</span>
                      <span className={`text-sm line-through ${d ? "text-gray-600" : "text-gray-400"}`}>₹{product.original_price}</span>
                    </div>
                    <ul className="space-y-1.5 mb-5">
                      {product.features.slice(0, 3).map((f, i) => (
                        <li key={i} className={`flex items-start gap-2 text-sm ${d ? "text-gray-400" : "text-gray-600"}`}>
                          <CheckCircle size={13} className={`${c.text} mt-0.5 flex-shrink-0`} /><span className="line-clamp-1">{f}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="flex gap-2">
                      <button onClick={() => handleAddToCart(product)} disabled={inCart}
                        className={`flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${inCart ? (d ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-500") : `bg-gradient-to-r ${c.btn} text-white shadow-lg`}`}>
                        {inCart ? <><CheckCircle size={15} /> In Cart</> : <><Plus size={15} /> Add to Cart</>}
                      </button>
                      <button onClick={() => { setSelectedProduct(product); setShowPreview(true); }}
                        className={`px-3 py-3 rounded-xl transition-all ${d ? "bg-gray-800 hover:bg-gray-700 text-gray-400" : "bg-gray-100 hover:bg-gray-200 text-gray-500"}`}>
                        <Eye size={16} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── Featured Product ── */}
      {mainProduct && (
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start gap-12">
            <div className="lg:w-1/2">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Everything in <span className="gradient-text">{mainProduct.short_name}</span></h2>
              <p className={`text-lg mb-8 ${d ? "text-gray-400" : "text-gray-500"}`}>The most comprehensive tracking template. Works in Excel and Google Sheets.</p>
              <div className="grid sm:grid-cols-2 gap-3 mb-8">
                {mainProduct.features.map((f, idx) => (
                  <motion.div key={idx} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.3, delay: idx * 0.04 }}
                    className={`flex items-start gap-3 p-4 rounded-xl ${d ? "bg-gray-900/50 border border-gray-800" : "bg-white border border-gray-100"}`}>
                    <CheckCircle size={16} className="text-violet-500 mt-0.5 flex-shrink-0" />
                    <span className={`text-sm font-medium ${d ? "text-gray-300" : "text-gray-700"}`}>{f}</span>
                  </motion.div>
                ))}
              </div>
              <button onClick={() => handleBuyNow(mainProduct)}
                className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-8 py-4 rounded-2xl font-semibold flex items-center gap-3 shadow-xl shadow-violet-500/25 transition-all">
                <ShoppingCart size={20} /> Get It Now — ₹{mainProduct.price}
              </button>
            </div>
            <div className="lg:w-1/2 space-y-6">
              <div className={`rounded-2xl p-4 shadow-lg ${d ? "bg-gray-900/60 border border-gray-800" : "bg-white border border-gray-200"}`}><ChartPreview dark={d} /></div>
              <div className={`rounded-2xl p-4 shadow-lg ${d ? "bg-gray-900/60 border border-gray-800" : "bg-white border border-gray-200"}`}><NutritionPreview dark={d} /></div>
            </div>
          </div>
        </section>
      )}

      {/* ── Previews ── */}
      <section id="previews" className={`py-20 px-6 ${d ? "bg-gray-900/30" : "bg-gray-50/80"}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3">See What You <span className="gradient-text">Get</span></h2>
            <p className={`text-lg max-w-2xl mx-auto ${d ? "text-gray-400" : "text-gray-500"}`}>Real previews. Beautiful auto-updating charts.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Weekly Dashboard", desc: "Track all daily metrics in one glance", preview: <DashboardPreview dark={d} /> },
              { title: "Progress Charts", desc: "Auto-generated charts show your growth", preview: <ChartPreview dark={d} /> },
              { title: "Analytics View", desc: "Visualize data with beautiful breakdowns", preview: <NutritionPreview dark={d} /> },
            ].map((item, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: idx * 0.15 }}
                className={`rounded-2xl overflow-hidden transition-all duration-300 ${d ? "bg-gray-900/60 border border-gray-800 hover:border-violet-500/30" : "bg-white border border-gray-200 hover:shadow-xl"}`}>
                <div className="p-4">{item.preview}</div>
                <div className="px-5 pb-5">
                  <h3 className="font-bold mb-1">{item.title}</h3>
                  <p className={`text-sm ${d ? "text-gray-500" : "text-gray-500"}`}>{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14"><h2 className="text-3xl md:text-4xl font-extrabold mb-3">What Customers <span className="gradient-text">Say</span></h2></div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Rahul S.", text: "These trackers changed how I manage my goals. Charts update automatically — feels like a premium app!", rating: 5 },
              { name: "Priya M.", text: "Bought the expense planner and fitness tracker. Visualizations are amazing. I can finally see where my money goes.", rating: 5 },
              { name: "Arjun K.", text: "Best ₹299 I've spent. Everything is pre-built, I just enter data. Super easy and looks professional.", rating: 5 },
            ].map((r, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`rounded-2xl p-6 ${d ? "bg-gray-900/50 border border-gray-800" : "bg-white border border-gray-200"}`}>
                <div className="flex gap-0.5 mb-3">{Array.from({ length: r.rating }).map((_, i) => <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />)}</div>
                <p className={`text-sm mb-4 leading-relaxed ${d ? "text-gray-400" : "text-gray-600"}`}>&ldquo;{r.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">{r.name[0]}</div>
                  <span className="font-semibold text-sm">{r.name}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className={`py-20 px-6 ${d ? "bg-gray-900/30" : "bg-gray-50/80"}`}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14"><h2 className="text-3xl md:text-4xl font-extrabold mb-3">Frequently Asked <span className="gradient-text">Questions</span></h2></div>
          <div className="space-y-3">
            {[
              { q: "What format are the templates in?", a: "All templates are Excel (.xlsx) files. They work in Microsoft Excel, Google Sheets, and other spreadsheet apps." },
              { q: "Do the charts update automatically?", a: "Yes! All charts are linked to your data cells. Enter numbers, charts update instantly." },
              { q: "Can I use this on my phone?", a: "Absolutely. Open in Google Sheets or Excel app on your phone." },
              { q: "Do I get free updates?", a: "Yes, lifetime access to all future updates." },
              { q: "How do I receive the file?", a: "After payment, get an instant download link on the orders page." },
              { q: "Can I get a refund?", a: "Yes, 7-day refund policy. Not satisfied? Full refund." },
            ].map((faq, idx) => <FaqItem key={idx} question={faq.q} answer={faq.a} dark={d} />)}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-500/20 rounded-full blur-[80px]" />
        </div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4 text-white">Start Tracking Today</h2>
            <p className="text-violet-200 text-lg mb-8 max-w-xl mx-auto">One-time purchase. Lifetime access. No subscriptions.</p>
            {mainProduct && (
              <div className="flex items-center justify-center gap-4 mb-8">
                <span className="text-4xl font-extrabold text-white">₹{mainProduct.price}</span>
                <span className="text-xl text-violet-200 line-through">₹{mainProduct.original_price}</span>
              </div>
            )}
            <button onClick={() => mainProduct && handleBuyNow(mainProduct)} disabled={!mainProduct}
              className="bg-white text-violet-700 hover:bg-violet-50 px-10 py-4 rounded-2xl font-bold text-lg inline-flex items-center gap-3 shadow-2xl transition-all disabled:opacity-50">
              Get Started <ArrowRight size={22} />
            </button>
            <p className="text-violet-300 text-xs mt-4">
              By purchasing, you agree to our <a href="/terms/" className="text-white underline">Terms</a> and <a href="/refund/" className="text-white underline">Refund Policy</a>.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className={`py-12 px-6 ${d ? "border-t border-gray-800" : "border-t border-gray-100"}`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center"><Sparkles size={14} className="text-white" /></div>
              <div>
                <span className="text-lg font-bold">Nichu<span className="gradient-text">Store</span></span>
                <p className={`text-xs ${d ? "text-gray-600" : "text-gray-400"}`}>Digital Products by Nizamudheen KC</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-6 text-sm">
              <a href="/privacy/" className={`transition-colors ${d ? "text-gray-500 hover:text-white" : "text-gray-500 hover:text-gray-900"}`}>Privacy Policy</a>
              <a href="/terms/" className={`transition-colors ${d ? "text-gray-500 hover:text-white" : "text-gray-500 hover:text-gray-900"}`}>Terms & Conditions</a>
              <a href="/refund/" className={`transition-colors ${d ? "text-gray-500 hover:text-white" : "text-gray-500 hover:text-gray-900"}`}>Refund Policy</a>
            </div>
          </div>
          <div className={`text-center text-xs mt-8 ${d ? "text-gray-700" : "text-gray-400"}`}>© {new Date().getFullYear()} Nizamudheen KC. All rights reserved.</div>
        </div>
      </footer>

      {/* ── Preview Modal ── */}
      <AnimatePresence>
        {showPreview && selectedProduct && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={() => setShowPreview(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 ${d ? "bg-gray-900 border border-gray-800" : "bg-white"}`}
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">{selectedProduct.name} — Preview</h3>
                <button onClick={() => setShowPreview(false)} className={`p-1 rounded-lg ${d ? "text-gray-500 hover:text-white" : "text-gray-400 hover:text-gray-600"}`}><X size={24} /></button>
              </div>
              <div className="space-y-6">
                <DashboardPreview dark={d} />
                <ChartPreview dark={d} />
                <NutritionPreview dark={d} />
              </div>
              <div className="mt-6 flex gap-3">
                <button onClick={() => { setShowPreview(false); handleBuyNow(selectedProduct); }}
                  className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg">
                  <ShoppingCart size={18} /> Buy Now — ₹{selectedProduct.price}
                </button>
                <button onClick={() => setShowPreview(false)} className={`px-6 py-3 rounded-xl font-medium ${d ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>Close</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-3 rounded-full shadow-xl shadow-violet-500/25 transition-all hover:scale-110">
        <ChevronUp size={20} />
      </button>
    </div>
  );
}

// ── SVG Previews ──
function DashboardPreview({ dark }: { dark: boolean }) {
  const bg = dark ? "#1a1a2e" : "#f8fafc";
  const hdr = dark ? "#6366f1" : "#8b5cf6";
  const alt = dark ? "#151530" : "#f1f5f9";
  const txt = dark ? "#94a3b8" : "#334155";
  const sub = dark ? "#64748b" : "#475569";
  return (
    <svg viewBox="0 0 400 280" className="w-full rounded-xl">
      <rect width="400" height="280" fill={bg} rx="12" />
      <rect x="0" y="0" width="400" height="36" fill={hdr} rx="12" /><rect x="0" y="24" width="400" height="12" fill={hdr} />
      <text x="16" y="24" fill="white" fontSize="13" fontWeight="bold">Dashboard — Weekly Overview</text>
      {["Day","Category","Amount","Status","Score","Progress"].map((h,i) => (
        <g key={h}><rect x={12+i*65} y="46" width="58" height="22" fill={dark?"#1e1e3a":"#e2e8f0"} rx="4"/><text x={18+i*65} y="61" fill={sub} fontSize="8" fontWeight="600">{h}</text></g>
      ))}
      {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((day, i) => {
        const y = 76 + i * 24; return (
        <g key={day}>
          <rect x="12" y={y} width="378" height="22" fill={i%2===0?(dark?"#0f0f23":"#ffffff"):alt} rx="3" />
          <text x="22" y={y+15} fill={txt} fontSize="9">{day}</text>
          <text x="83" y={y+15} fill="#8b5cf6" fontSize="9">{["Work","Gym","Study","Code","Plan","Free","Rest"][i]}</text>
          <text x="148" y={y+15} fill={txt} fontSize="9">{["₹500","₹200","₹0","₹350","₹100","₹800","₹50"][i]}</text>
          <text x="213" y={y+15} fill="#10b981" fontSize="9">{["Done","Done","Skip","Done","Done","Done","Rest"][i]}</text>
          <text x="278" y={y+15} fill="#3b82f6" fontSize="9">{["85%","92%","70%","88%","95%","78%","—"][i]}</text>
          <rect x="340" y={y+6} width="40" height="6" fill={dark?"#1e1e3a":"#e2e8f0"} rx="3"/>
          <rect x="340" y={y+6} width={[32,38,28,35,40,30,0][i]} height="6" fill="#8b5cf6" rx="3"/>
        </g>);
      })}
      <rect x="12" y="250" width="120" height="5" fill="#8b5cf6" rx="2" opacity="0.3" />
      <rect x="12" y="250" width="85" height="5" fill="#8b5cf6" rx="2" />
      <text x="140" y="256" fill="#8b5cf6" fontSize="8" fontWeight="600">Weekly Goal: 71%</text>
    </svg>
  );
}

function ChartPreview({ dark }: { dark: boolean }) {
  const bg = dark ? "#1a1a2e" : "#f8fafc";
  const txt = dark ? "#94a3b8" : "#334155";
  const grid = dark ? "#1e1e3a" : "#e2e8f0";
  return (
    <svg viewBox="0 0 400 260" className="w-full rounded-xl">
      <rect width="400" height="260" fill={bg} rx="12" />
      <text x="20" y="28" fill={txt} fontSize="13" fontWeight="bold">Progress — Last 8 Weeks</text>
      <line x1="50" y1="45" x2="50" y2="210" stroke={grid} strokeWidth="1" />
      {["100","80","60","40","20"].map((v, i) => (
        <g key={v}><text x="14" y={52+i*40} fill={dark?"#475569":"#94a3b8"} fontSize="9">{v}%</text>
        <line x1="48" y1={48+i*40} x2="380" y2={48+i*40} stroke={grid} strokeWidth="0.5" strokeDasharray="4"/></g>
      ))}
      <line x1="50" y1="210" x2="380" y2="210" stroke={grid} strokeWidth="1" />
      <polyline fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points="70,140 112,120 154,100 196,95 238,80 280,70 322,55 364,50" />
      {[[70,140],[112,120],[154,100],[196,95],[238,80],[280,70],[322,55],[364,50]].map(([cx,cy],i) => (
        <circle key={i} cx={cx} cy={cy} r="4" fill="#8b5cf6" stroke={bg} strokeWidth="2" />
      ))}
      <polygon points="70,140 112,120 154,100 196,95 238,80 280,70 322,55 364,50 364,210 70,210" fill="url(#areaGrad2)" opacity="0.2" />
      <defs><linearGradient id="areaGrad2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8b5cf6"/><stop offset="100%" stopColor="#8b5cf6" stopOpacity="0"/></linearGradient></defs>
      {["W1","W2","W3","W4","W5","W6","W7","W8"].map((w, i) => <text key={w} x={64+i*42} y="228" fill={dark?"#475569":"#94a3b8"} fontSize="9">{w}</text>)}
    </svg>
  );
}

function NutritionPreview({ dark }: { dark: boolean }) {
  const bg = dark ? "#1a1a2e" : "#f8fafc";
  const txt = dark ? "#94a3b8" : "#334155";
  const grid = dark ? "#1e1e3a" : "#e2e8f0";
  const bars = [
    { label: "Mon", a: 80, b: 55, c: 35 }, { label: "Tue", a: 70, b: 65, c: 30 },
    { label: "Wed", a: 90, b: 50, c: 40 }, { label: "Thu", a: 75, b: 60, c: 25 },
    { label: "Fri", a: 85, b: 45, c: 35 }, { label: "Sat", a: 65, b: 70, c: 45 },
    { label: "Sun", a: 60, b: 55, c: 30 },
  ];
  return (
    <svg viewBox="0 0 400 260" className="w-full rounded-xl">
      <rect width="400" height="260" fill={bg} rx="12" />
      <text x="20" y="28" fill={txt} fontSize="13" fontWeight="bold">Analytics — This Week</text>
      {bars.map((b, i) => { const x = 45+i*50; return (
        <g key={b.label}>
          <rect x={x} y={210-b.a} width="12" height={b.a} fill="#8b5cf6" rx="2" />
          <rect x={x+14} y={210-b.b} width="12" height={b.b} fill="#3b82f6" rx="2" />
          <rect x={x+28} y={210-b.c} width="12" height={b.c} fill="#f59e0b" rx="2" />
          <text x={x+14} y="228" fill={dark?"#475569":"#94a3b8"} fontSize="9" textAnchor="middle">{b.label}</text>
        </g>);
      })}
      <line x1="40" y1="210" x2="390" y2="210" stroke={grid} strokeWidth="1" />
      <rect x="120" y="240" width="10" height="10" fill="#8b5cf6" rx="2" /><text x="134" y="249" fill={dark?"#475569":"#64748b"} fontSize="9">Series A</text>
      <rect x="185" y="240" width="10" height="10" fill="#3b82f6" rx="2" /><text x="199" y="249" fill={dark?"#475569":"#64748b"} fontSize="9">Series B</text>
      <rect x="250" y="240" width="10" height="10" fill="#f59e0b" rx="2" /><text x="264" y="249" fill={dark?"#475569":"#64748b"} fontSize="9">Series C</text>
    </svg>
  );
}

function FaqItem({ question, answer, dark }: { question: string; answer: string; dark: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`rounded-xl overflow-hidden ${dark ? "border border-gray-800" : "border border-gray-200"}`}>
      <button onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between p-5 text-left transition-colors ${dark ? "hover:bg-white/5" : "hover:bg-gray-50"}`}>
        <span className="font-semibold text-sm">{question}</span>
        <ChevronUp size={18} className={`transition-transform duration-200 ${dark ? "text-gray-500" : "text-gray-400"} ${open ? "" : "rotate-180"}`} />
      </button>
      {open && <div className={`px-5 pb-5 text-sm leading-relaxed ${dark ? "text-gray-400" : "text-gray-600"}`}>{answer}</div>}
    </div>
  );
}
