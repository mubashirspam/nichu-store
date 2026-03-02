"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";
import { useAuth } from "./AuthContext";

const LOG_PREFIX = "[🛒 Cart]";

// Helper: wrap a promise with a timeout so it never hangs forever
function withTimeout<T = any>(promise: Promise<T> | PromiseLike<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    ),
  ]);
}

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

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const supabaseRef = useRef<SupabaseClient | null>(null);
  const addingToCart = useRef<Set<string>>(new Set());

  if (typeof window !== "undefined" && !supabaseRef.current) {
    supabaseRef.current = createClient();
    console.log(LOG_PREFIX, "Supabase client initialized");
  }
  const supabase = supabaseRef.current;

  // Verify the current session is valid before making DB calls
  const verifySession = useCallback(async (): Promise<boolean> => {
    if (!supabase) return false;
    try {
      const { data: { session }, error } = await withTimeout(
        supabase.auth.getSession(),
        5000,
        "verifySession"
      );
      if (error || !session) {
        console.error(LOG_PREFIX, "Session invalid:", error?.message || "no session");
        return false;
      }
      return true;
    } catch (err: any) {
      console.error(LOG_PREFIX, "Session check failed:", err.message);
      return false;
    }
  }, [supabase]);

  const refreshCart = useCallback(async () => {
    if (!user) {
      console.log(LOG_PREFIX, "refreshCart: no user, clearing cart");
      setItems([]);
      return;
    }
    if (!supabase) {
      console.warn(LOG_PREFIX, "refreshCart: supabase is null");
      setItems([]);
      return;
    }
    console.log(LOG_PREFIX, "Refreshing cart for user:", user.email, `(${user.id})`);
    setLoading(true);
    try {
      const { data, error } = await withTimeout(
        supabase
          .from("cart_items")
          .select(`
            id,
            product_id,
            quantity,
            product:products (
              id, name, short_name, price, original_price, currency, icon_name, color, badge
            )
          `)
          .eq("user_id", user.id),
        10000,
        "refreshCart"
      );

      if (error) {
        console.error(LOG_PREFIX, "refreshCart error:", error.message, error.code);
      } else if (data) {
        const mapped = data
          .filter((item: any) => item.product !== null)
          .map((item: any) => ({
            id: item.id,
            product_id: item.product_id,
            quantity: item.quantity,
            product: item.product,
          }));
        console.log(LOG_PREFIX, "Cart loaded:", mapped.length, "items");
        setItems(mapped);
      }
    } catch (err: any) {
      console.error(LOG_PREFIX, "refreshCart failed:", err.message);
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = useCallback(async (productId: string) => {
    if (!user) {
      console.warn(LOG_PREFIX, "addToCart: no user — user must sign in first");
      return;
    }
    if (!supabase) {
      console.error(LOG_PREFIX, "addToCart: supabase is null");
      return;
    }

    // Prevent duplicate simultaneous calls for the same product
    if (addingToCart.current.has(productId)) {
      console.log(LOG_PREFIX, "addToCart: already adding product:", productId, "— skipping duplicate");
      return;
    }

    const existing = items.find((item) => item.product_id === productId);
    if (existing) {
      console.log(LOG_PREFIX, "addToCart: product already in cart:", productId);
      return;
    }

    // Verify session is still valid before making the call
    const sessionValid = await verifySession();
    if (!sessionValid) {
      console.error(LOG_PREFIX, "addToCart: session expired, cannot add to cart");
      alert("Your session has expired. Please sign in again.");
      window.location.href = "/login";
      return;
    }

    addingToCart.current.add(productId);
    console.log(LOG_PREFIX, "Adding to cart:", productId, "for user:", user.email);

    try {
      const { error } = await withTimeout(
        supabase.from("cart_items").insert({
          user_id: user.id,
          product_id: productId,
          quantity: 1,
        }),
        10000,
        "addToCart"
      );

      if (error) {
        console.error(LOG_PREFIX, "addToCart error:", error.message, error.code);
        alert("Failed to add to cart: " + error.message);
      } else {
        console.log(LOG_PREFIX, "addToCart success, refreshing...");
        await refreshCart();
      }
    } catch (err: any) {
      console.error(LOG_PREFIX, "addToCart failed:", err.message);
      alert("Failed to add to cart. Please try again.");
    } finally {
      addingToCart.current.delete(productId);
    }
  }, [user, supabase, items, refreshCart, verifySession]);

  const removeFromCart = useCallback(async (cartItemId: string) => {
    if (!user || !supabase) {
      console.warn(LOG_PREFIX, "removeFromCart: no user or supabase");
      return;
    }
    console.log(LOG_PREFIX, "Removing from cart:", cartItemId);
    try {
      const { error } = await withTimeout(
        supabase
          .from("cart_items")
          .delete()
          .eq("id", cartItemId)
          .eq("user_id", user.id),
        10000,
        "removeFromCart"
      );

      if (error) {
        console.error(LOG_PREFIX, "removeFromCart error:", error.message);
      } else {
        console.log(LOG_PREFIX, "removeFromCart success, refreshing...");
        await refreshCart();
      }
    } catch (err: any) {
      console.error(LOG_PREFIX, "removeFromCart failed:", err.message);
    }
  }, [user, supabase, refreshCart]);

  const clearCart = useCallback(async () => {
    if (!user || !supabase) {
      console.warn(LOG_PREFIX, "clearCart: no user or supabase");
      return;
    }
    console.log(LOG_PREFIX, "Clearing cart for user:", user.email);
    try {
      await withTimeout(
        supabase.from("cart_items").delete().eq("user_id", user.id),
        10000,
        "clearCart"
      );
      setItems([]);
    } catch (err: any) {
      console.error(LOG_PREFIX, "clearCart failed:", err.message);
    }
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
