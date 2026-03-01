"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "./AuthContext";
import type { SupabaseClient } from "@supabase/supabase-js";

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    short_name: string;
    price: number;
    original_price: number;
    currency: string;
    icon_name: string;
    color: string;
    badge: string | null;
  };
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  totalAmount: number;
  loading: boolean;
  addToCart: (productId: string) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  isInCart: (productId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function getSupabase(): SupabaseClient | null {
  if (
    typeof window === "undefined" ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return null;
  }
  return createClient();
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const supabaseRef = useRef<SupabaseClient | null>(null);

  if (!supabaseRef.current) {
    supabaseRef.current = getSupabase();
  }
  const supabase = supabaseRef.current;

  const refreshCart = useCallback(async () => {
    if (!user || !supabase) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("cart_items")
        .select(`
          id,
          product_id,
          quantity,
          product:products (
            id, name, short_name, price, original_price, currency, icon_name, color, badge
          )
        `)
        .eq("user_id", user.id);

      if (!error && data) {
        const mapped = data
          .filter((item: any) => item.product !== null)
          .map((item: any) => ({
            id: item.id,
            product_id: item.product_id,
            quantity: item.quantity,
            product: item.product,
          }));
        setItems(mapped);
      }
    } catch (err) {
      console.error("Error fetching cart:", err);
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = useCallback(async (productId: string) => {
    if (!user || !supabase) return;
    const existing = items.find((item) => item.product_id === productId);
    if (existing) return;

    const { error } = await supabase.from("cart_items").insert({
      user_id: user.id,
      product_id: productId,
      quantity: 1,
    });

    if (!error) {
      await refreshCart();
    }
  }, [user, supabase, items, refreshCart]);

  const removeFromCart = useCallback(async (cartItemId: string) => {
    if (!user || !supabase) return;
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", cartItemId)
      .eq("user_id", user.id);

    if (!error) {
      await refreshCart();
    }
  }, [user, supabase, refreshCart]);

  const clearCart = useCallback(async () => {
    if (!user || !supabase) return;
    await supabase.from("cart_items").delete().eq("user_id", user.id);
    setItems([]);
  }, [user, supabase]);

  const isInCart = useCallback((productId: string) => {
    return items.some((item) => item.product_id === productId);
  }, [items]);

  const itemCount = items.length;
  const totalAmount = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const value = useMemo(() => ({
    items,
    itemCount,
    totalAmount,
    loading,
    addToCart,
    removeFromCart,
    clearCart,
    refreshCart,
    isInCart,
  }), [items, itemCount, totalAmount, loading, addToCart, removeFromCart, clearCart, refreshCart, isInCart]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
