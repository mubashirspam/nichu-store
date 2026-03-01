"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";

export interface Product {
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

interface ProductContextType {
  products: Product[];
  loading: boolean;
  refreshProducts: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);

  const fetchProducts = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchProducts(true);
  }, [fetchProducts]);

  const refreshProducts = useCallback(async () => {
    await fetchProducts(false);
  }, [fetchProducts]);

  return (
    <ProductContext.Provider value={{ products, loading, refreshProducts }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductProvider");
  }
  return context;
}
