"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";

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
  addingProductIds: Set<string>;
  removingItemIds: Set<string>;
  addToCart: (productId: string, productData?: Partial<CartItem["product"]>) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  isInCart: (productId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [addingProductIds, setAddingProductIds] = useState<Set<string>>(new Set());
  const [removingItemIds, setRemovingItemIds] = useState<Set<string>>(new Set());
  const { user } = useAuth();
  const fetchRef = useRef(false);

  const refreshCart = useCallback(async (background = false) => {
    if (!user) {
      setItems([]);
      setLoading(false);
      setInitialLoaded(true);
      return;
    }
    // Only show loading spinner on first load, not on background refresh
    if (!background && !initialLoaded) {
      setLoading(true);
    }
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (err) {
      console.error("Error fetching cart:", err);
    } finally {
      setLoading(false);
      setInitialLoaded(true);
    }
  }, [user, initialLoaded]);

  useEffect(() => {
    if (!fetchRef.current) {
      fetchRef.current = true;
      refreshCart(false);
    }
  }, [refreshCart]);

  // Reset on user change
  useEffect(() => {
    fetchRef.current = false;
    setInitialLoaded(false);
    setLoading(true);
  }, [user]);

  const addToCart = useCallback(async (productId: string, productData?: Partial<CartItem["product"]>) => {
    if (!user) return;
    const existing = items.find((item) => item.product_id === productId);
    if (existing) return;

    // Mark as adding
    setAddingProductIds((prev) => new Set(prev).add(productId));

    // Optimistic: add a temporary item immediately so UI updates fast
    const tempId = `temp-${productId}`;
    const optimisticItem: CartItem = {
      id: tempId,
      product_id: productId,
      quantity: 1,
      product: {
        id: productId,
        name: productData?.name || "Loading...",
        short_name: productData?.short_name || "...",
        price: productData?.price || 0,
        original_price: productData?.original_price || 0,
        currency: productData?.currency || "INR",
        icon_name: productData?.icon_name || "FileSpreadsheet",
        color: productData?.color || "emerald",
        badge: productData?.badge || null,
      },
    };
    setItems((prev) => [...prev, optimisticItem]);

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      if (res.ok) {
        // Refresh in background to get real IDs
        await refreshCart(true);
      } else {
        // Rollback on failure
        setItems((prev) => prev.filter((item) => item.id !== tempId));
        const data = await res.json();
        console.error(data.error || "Failed to add to cart");
      }
    } catch (err) {
      // Rollback on error
      setItems((prev) => prev.filter((item) => item.id !== tempId));
      console.error("Error adding to cart:", err);
    } finally {
      setAddingProductIds((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  }, [user, items, refreshCart]);

  const removeFromCart = useCallback(async (cartItemId: string) => {
    if (!user) return;

    // Mark as removing
    setRemovingItemIds((prev) => new Set(prev).add(cartItemId));

    // Optimistic: remove immediately
    const removedItem = items.find((item) => item.id === cartItemId);
    setItems((prev) => prev.filter((item) => item.id !== cartItemId));

    try {
      const res = await fetch(`/api/cart?id=${cartItemId}`, { method: "DELETE" });
      if (!res.ok && removedItem) {
        // Rollback on failure
        setItems((prev) => [...prev, removedItem]);
      }
    } catch (err) {
      // Rollback on error
      if (removedItem) {
        setItems((prev) => [...prev, removedItem]);
      }
      console.error("Error removing from cart:", err);
    } finally {
      setRemovingItemIds((prev) => {
        const next = new Set(prev);
        next.delete(cartItemId);
        return next;
      });
    }
  }, [user, items]);

  const clearCart = useCallback(async () => {
    if (!user) return;
    const previousItems = [...items];
    setItems([]); // Optimistic
    try {
      await fetch("/api/cart?all=true", { method: "DELETE" });
    } catch (err) {
      setItems(previousItems); // Rollback
      console.error("Error clearing cart:", err);
    }
  }, [user, items]);

  const isInCart = useCallback((productId: string) => {
    return items.some((item) => item.product_id === productId) || addingProductIds.has(productId);
  }, [items, addingProductIds]);

  const itemCount = items.length;
  const totalAmount = items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);

  const value = useMemo(() => ({
    items, itemCount, totalAmount, loading,
    addingProductIds, removingItemIds,
    addToCart, removeFromCart, clearCart,
    refreshCart: () => refreshCart(true),
    isInCart,
  }), [items, itemCount, totalAmount, loading, addingProductIds, removingItemIds, addToCart, removeFromCart, clearCart, refreshCart, isInCart]);

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
