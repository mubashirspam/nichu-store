"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useProducts, type Product } from "@/contexts/ProductContext";
import Navigation from "@/components/home/Navigation";
import Hero from "@/components/home/Hero";
import Products from "@/components/home/Products";
import FeaturedProduct from "@/components/home/FeaturedProduct";
import Previews from "@/components/home/Previews";
import Stats from "@/components/home/Stats";
import HowItWorks from "@/components/home/HowItWorks";
import Testimonials from "@/components/home/Testimonials";
import FAQ from "@/components/home/FAQ";
import { FinalCTA, Footer, PreviewModal } from "@/components/home/FinalSections";

export default function StorePage() {
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [dark, setDark] = useState(false);
  
  const { user, signOut, isAdmin, avatarUrl, loading: authLoading } = useAuth();
  const { addToCart, isInCart, itemCount, addingProductIds } = useCart();
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

  // Buy Now: Direct to checkout (no cart, instant purchase flow)
  const handleBuyNow = useCallback(async (product: Product) => {
    if (authLoading) return;
    if (!user) {
      router.push(`/auth/sign-in?callbackURL=${encodeURIComponent(`/checkout?product=${product.id}`)}`);
      return;
    }
    // Direct to checkout with product ID
    router.push(`/checkout?product=${product.id}`);
  }, [user, authLoading, router]);

  // Add to Cart: Add item and navigate to cart page
  const handleAddToCart = useCallback(async (product: Product) => {
    if (authLoading) return;
    if (!user) {
      router.push("/auth/sign-in");
      return;
    }
    // Add to cart first
    if (!isInCart(product.id)) {
      await addToCart(product.id, {
        name: product.name,
        short_name: product.short_name,
        price: product.price,
        original_price: product.original_price,
        currency: product.currency,
        icon_name: product.icon_name,
        color: product.color,
        badge: product.badge || null,
      });
    }
    // Then navigate to cart
    router.push("/cart");
  }, [user, authLoading, addToCart, isInCart, router]);

  const mainProduct = products[0] || null;
  const d = dark; // shorthand

  return (
    <div className={`min-h-screen transition-colors duration-300 ${d ? "bg-[#0a0a0f] text-white" : "bg-white text-gray-900"}`}>
      {/* 1. Navigation */}
      <Navigation
        dark={d}
        toggleTheme={toggleTheme}
        itemCount={itemCount}
        user={user}
        isAdmin={isAdmin}
        avatarUrl={avatarUrl}
        authLoading={authLoading}
        signOut={signOut}
        showUserMenu={showUserMenu}
        setShowUserMenu={setShowUserMenu}
      />

      {/* 2. Hero */}
      <Hero
        dark={d}
        mainProduct={mainProduct}
        loading={loading}
        handleBuyNow={handleBuyNow}
        onPreview={(p) => { setSelectedProduct(p); setShowPreview(true); }}
      />

      {/* 3. Products (Templates) */}
      <Products
        dark={d}
        loading={loading}
        products={products}
        isInCart={isInCart}
        addingProductIds={addingProductIds}
        handleBuyNow={handleBuyNow}
        handleAddToCart={handleAddToCart}
        onPreview={(p) => { setSelectedProduct(p); setShowPreview(true); }}
      />

      {/* 4. Featured Product */}
      <FeaturedProduct
        dark={d}
        mainProduct={mainProduct}
        handleBuyNow={handleBuyNow}
      />

      {/* 5. Previews */}
      <Previews dark={d} />

      {/* 6. Stats */}
      <Stats dark={d} />

      {/* 7. How It Works */}
      <HowItWorks dark={d} />

      {/* 8. Testimonials */}
      <Testimonials dark={d} />

      {/* 9. FAQ */}
      <FAQ dark={d} />

      {/* 10. Final CTA */}
      <FinalCTA
        mainProduct={mainProduct}
        handleBuyNow={handleBuyNow}
      />

      {/* 11. Footer */}
      <Footer dark={d} />

      {/* Shared Preview Modal */}
      <PreviewModal
        dark={d}
        showPreview={showPreview}
        selectedProduct={selectedProduct}
        setShowPreview={setShowPreview}
        handleBuyNow={handleBuyNow}
      />

      {/* Scroll to Top */}
      <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-3 rounded-full shadow-xl shadow-violet-500/25 transition-all hover:scale-110 z-50">
        <ChevronUp size={20} />
      </button>
    </div>
  );
}
