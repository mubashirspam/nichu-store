"use client";

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { authClient } from "@/lib/auth/client";

interface AuthContextType {
  user: { id: string; email: string; fullName: string | null } | null;
  loading: boolean;
  avatarUrl: string | null;
  isAdmin: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  const [isAdmin, setIsAdmin] = useState(false);

  const sessionUser = session?.user || null;

  // Sync user to legacy profiles table on sign-in
  useEffect(() => {
    if (!sessionUser) return;
    fetch("/api/auth/sync", { method: "POST" }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionUser?.id]);

  useEffect(() => {
    if (!sessionUser) { setIsAdmin(false); return; }
    // Better Auth user has role field
    setIsAdmin((sessionUser as any).role === "admin");
  }, [sessionUser]);

  const user = useMemo(() => {
    if (!sessionUser) return null;
    return {
      id: sessionUser.id,
      email: sessionUser.email || "",
      fullName: sessionUser.name || null,
    };
  }, [sessionUser]);

  const avatarUrl = (sessionUser as any)?.image || null;

  const handleSignOut = useCallback(async () => {
    await authClient.signOut();
    window.location.href = "/";
  }, []);

  const value = useMemo(() => ({
    user,
    loading: isPending,
    avatarUrl,
    isAdmin,
    signOut: handleSignOut,
  }), [user, isPending, avatarUrl, isAdmin, handleSignOut]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
