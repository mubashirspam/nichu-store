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

const GUEST_CART_KEY = "nichu_guest_cart";
const CartContext = createContext<CartContextType | undefined>(undefined);

// ── localStorage helpers for guest cart ─────────────────────────────────────
function readGuestCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
function writeGuestCart(items: CartItem[]) {
  try { localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items)); } catch {}
}
function clearGuestCartStorage() {
  try { localStorage.removeItem(GUEST_CART_KEY); } catch {}
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [addingProductIds, setAddingProductIds] = useState<Set<string>>(new Set());
  const [removingItemIds, setRemovingItemIds] = useState<Set<string>>(new Set());
  const { user } = useAuth();
  const fetchRef = useRef(false);
  const prevUserId = useRef<string | null>(null);

  // ── Merge guest cart into server cart after login ─────────────────────────
  const mergeGuestCart = useCallback(async () => {
    const guest = readGuestCart();
    if (guest.length === 0) return;
    for (const item of guest) {
      try {
        await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: item.product_id }),
        });
      } catch {}
    }
    clearGuestCartStorage();
  }, []);

  const refreshCart = useCallback(async (background = false) => {
    if (!user) {
      // Guest — load from localStorage
      setItems(readGuestCart());
      setLoading(false);
      setInitialLoaded(true);
      return;
    }
    if (!background && !initialLoaded) setLoading(true);
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

  // On user change: merge guest cart then load server cart
  useEffect(() => {
    const userId = user?.id || null;
    const justLoggedIn = userId && prevUserId.current !== userId;
    prevUserId.current = userId;

    fetchRef.current = false;
    setInitialLoaded(false);
    setLoading(true);

    if (justLoggedIn) {
      mergeGuestCart().then(() => refreshCart(false));
    } else {
      refreshCart(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Initial load
  useEffect(() => {
    if (!fetchRef.current) {
      fetchRef.current = true;
      refreshCart(false);
    }
  }, [refreshCart]);

  const addToCart = useCallback(async (productId: string, productData?: Partial<CartItem["product"]>) => {
    const existing = items.find((item) => item.product_id === productId);
    if (existing) return;

    setAddingProductIds((prev) => new Set(prev).add(productId));

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

    if (!user) {
      // Guest: save to localStorage
      const updated = [...readGuestCart().filter(i => i.product_id !== productId), optimisticItem];
      writeGuestCart(updated);
      setItems(updated);
      setAddingProductIds((prev) => { const next = new Set(prev); next.delete(productId); return next; });
      return;
    }

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      if (res.ok) {
        await refreshCart(true);
      } else {
        setItems((prev) => prev.filter((item) => item.id !== tempId));
        const data = await res.json();
        console.error(data.error || "Failed to add to cart");
      }
    } catch (err) {
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
    setRemovingItemIds((prev) => new Set(prev).add(cartItemId));

    const removedItem = items.find((item) => item.id === cartItemId);
    setItems((prev) => prev.filter((item) => item.id !== cartItemId));

    if (!user) {
      // Guest: remove from localStorage
      const updated = readGuestCart().filter(i => i.id !== cartItemId);
      writeGuestCart(updated);
      setRemovingItemIds((prev) => { const next = new Set(prev); next.delete(cartItemId); return next; });
      return;
    }

    try {
      const res = await fetch(`/api/cart?id=${cartItemId}`, { method: "DELETE" });
      if (!res.ok && removedItem) {
        setItems((prev) => [...prev, removedItem]);
      }
    } catch (err) {
      if (removedItem) setItems((prev) => [...prev, removedItem]);
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
    const previousItems = [...items];
    setItems([]);
    if (!user) {
      clearGuestCartStorage();
      return;
    }
    try {
      await fetch("/api/cart?all=true", { method: "DELETE" });
    } catch (err) {
      setItems(previousItems);
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
