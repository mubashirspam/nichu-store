'use client';

import '@/lib/crypto-polyfill';
import { authClient } from '@/lib/auth/client';
import { NeonAuthUIProvider } from '@neondatabase/auth/react';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { ProductProvider } from '@/contexts/ProductContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    // @ts-ignore - beta package type mismatch
    <NeonAuthUIProvider authClient={authClient} redirectTo="/account/settings">
      <AuthProvider>
        <ProductProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </ProductProvider>
      </AuthProvider>
    </NeonAuthUIProvider>
  );
}
