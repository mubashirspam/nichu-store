"use client";

import React, { createContext, useContext, useEffect, useState, useRef, useMemo, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User, SupabaseClient } from "@supabase/supabase-js";

const LOG_PREFIX = "[🔐 Auth]";

// Helper: wrap a promise with a timeout so it never hangs forever
function withTimeout<T = any>(promise: Promise<T> | PromiseLike<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    ),
  ]);
}

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  avatarUrl: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabaseRef = useRef<SupabaseClient | null>(null);
  const signingOut = useRef(false);

  if (typeof window !== "undefined" && !supabaseRef.current) {
    supabaseRef.current = createClient();
    console.log(LOG_PREFIX, "Supabase client initialized");
  }
  const supabase = supabaseRef.current;

  const fetchProfile = useCallback(async (userId: string) => {
    if (!supabase) {
      console.warn(LOG_PREFIX, "fetchProfile: supabase is null");
      return;
    }
    console.log(LOG_PREFIX, "Fetching profile for user:", userId);
    try {
      const { data, error } = await withTimeout(
        supabase.from("profiles").select("*").eq("id", userId).single(),
        10000,
        "fetchProfile"
      );
      if (error) {
        console.error(LOG_PREFIX, "fetchProfile error:", error.message);
      } else {
        console.log(LOG_PREFIX, "Profile loaded:", data?.email, "role:", data?.role);
      }
      setProfile(data);
    } catch (err: any) {
      console.error(LOG_PREFIX, "fetchProfile failed:", err.message);
      setProfile(null);
    }
  }, [supabase]);

  useEffect(() => {
    if (!supabase) {
      console.warn(LOG_PREFIX, "No supabase client, skipping auth init");
      setLoading(false);
      return;
    }

    const getUser = async () => {
      console.log(LOG_PREFIX, "Getting current user...");
      try {
        const { data: { user: u }, error } = await withTimeout(
          supabase.auth.getUser(),
          10000,
          "getUser"
        );
        if (error) {
          console.error(LOG_PREFIX, "getUser error:", error.message);
        }
        console.log(LOG_PREFIX, "Current user:", u ? `${u.email} (${u.id})` : "null (not logged in)");
        setUser(u);
        if (u) {
          await fetchProfile(u.id);
        }
      } catch (err: any) {
        console.error(LOG_PREFIX, "getUser failed:", err.message);
        setUser(null);
      }
      setLoading(false);
      console.log(LOG_PREFIX, "Auth init complete, loading=false");
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(LOG_PREFIX, "Auth state changed:", event, "user:", session?.user?.email || "null");
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          await fetchProfile(currentUser.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase, fetchProfile]);

  const avatarUrl = useMemo(() => {
    return user?.user_metadata?.avatar_url || user?.user_metadata?.picture || profile?.avatar_url || null;
  }, [user, profile]);

  const signInWithGoogle = useCallback(async () => {
    if (!supabase) {
      console.error(LOG_PREFIX, "signInWithGoogle: supabase is null");
      return;
    }
    console.log(LOG_PREFIX, "Signing in with Google...");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) console.error(LOG_PREFIX, "Google sign in error:", error.message);
  }, [supabase]);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    if (!supabase) {
      console.error(LOG_PREFIX, "signInWithEmail: supabase is null");
      return { error: "Supabase not configured" };
    }
    console.log(LOG_PREFIX, "Signing in with email:", email);
    try {
      const { error } = await withTimeout(
        supabase.auth.signInWithPassword({ email, password }),
        10000,
        "signInWithEmail"
      );
      if (error) {
        console.error(LOG_PREFIX, "Email sign in error:", error.message);
      } else {
        console.log(LOG_PREFIX, "Email sign in successful");
      }
      return { error: error?.message ?? null };
    } catch (err: any) {
      console.error(LOG_PREFIX, "signInWithEmail failed:", err.message);
      return { error: err.message };
    }
  }, [supabase]);

  const signUpWithEmail = useCallback(async (email: string, password: string, fullName: string) => {
    if (!supabase) {
      console.error(LOG_PREFIX, "signUpWithEmail: supabase is null");
      return { error: "Supabase not configured" };
    }
    console.log(LOG_PREFIX, "Signing up with email:", email);
    try {
      const { error } = await withTimeout(
        supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        }),
        10000,
        "signUpWithEmail"
      );
      if (error) {
        console.error(LOG_PREFIX, "Sign up error:", error.message);
      } else {
        console.log(LOG_PREFIX, "Sign up successful");
      }
      return { error: error?.message ?? null };
    } catch (err: any) {
      console.error(LOG_PREFIX, "signUpWithEmail failed:", err.message);
      return { error: err.message };
    }
  }, [supabase]);

  const handleSignOut = useCallback(async () => {
    if (signingOut.current) {
      console.log(LOG_PREFIX, "Sign out already in progress, skipping");
      return;
    }
    if (!supabase) {
      console.error(LOG_PREFIX, "handleSignOut: supabase is null");
      return;
    }
    signingOut.current = true;
    console.log(LOG_PREFIX, "Signing out...");
    try {
      const { error } = await withTimeout(
        supabase.auth.signOut(),
        5000,
        "signOut"
      );
      if (error) {
        console.error(LOG_PREFIX, "Sign out error:", error.message);
      } else {
        console.log(LOG_PREFIX, "Sign out successful");
      }
    } catch (err: any) {
      console.error(LOG_PREFIX, "Sign out timed out or failed:", err.message, "— forcing cleanup");
    }
    // Always clean up, even if signOut hangs or fails
    setUser(null);
    setProfile(null);
    signingOut.current = false;
    window.location.href = "/";
  }, [supabase]);

  const value = useMemo(() => ({
    user,
    profile,
    loading,
    avatarUrl,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut: handleSignOut,
    isAdmin: profile?.role === "admin",
  }), [user, profile, loading, avatarUrl, signInWithGoogle, signInWithEmail, signUpWithEmail, handleSignOut]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
