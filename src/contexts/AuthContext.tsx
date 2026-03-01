"use client";

import React, { createContext, useContext, useEffect, useState, useRef, useMemo, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User, SupabaseClient } from "@supabase/supabase-js";

const LOG_PREFIX = "[🔐 Auth]";

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
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (error) {
      console.error(LOG_PREFIX, "fetchProfile error:", error.message);
    } else {
      console.log(LOG_PREFIX, "Profile loaded:", data?.email, "role:", data?.role);
    }
    setProfile(data);
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
        const { data: { user: u }, error } = await supabase.auth.getUser();
        if (error) {
          console.error(LOG_PREFIX, "getUser error:", error.message);
        }
        console.log(LOG_PREFIX, "Current user:", u ? `${u.email} (${u.id})` : "null (not logged in)");
        setUser(u);
        if (u) {
          await fetchProfile(u.id);
        }
      } catch (err) {
        console.error(LOG_PREFIX, "getUser exception:", err);
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
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      console.error(LOG_PREFIX, "Email sign in error:", error.message);
    } else {
      console.log(LOG_PREFIX, "Email sign in successful");
    }
    return { error: error?.message ?? null };
  }, [supabase]);

  const signUpWithEmail = useCallback(async (email: string, password: string, fullName: string) => {
    if (!supabase) {
      console.error(LOG_PREFIX, "signUpWithEmail: supabase is null");
      return { error: "Supabase not configured" };
    }
    console.log(LOG_PREFIX, "Signing up with email:", email);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      console.error(LOG_PREFIX, "Sign up error:", error.message);
    } else {
      console.log(LOG_PREFIX, "Sign up successful");
    }
    return { error: error?.message ?? null };
  }, [supabase]);

  const handleSignOut = useCallback(async () => {
    if (!supabase) {
      console.error(LOG_PREFIX, "handleSignOut: supabase is null");
      return;
    }
    console.log(LOG_PREFIX, "Signing out...");
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error(LOG_PREFIX, "Sign out error:", error.message);
    } else {
      console.log(LOG_PREFIX, "Sign out successful, redirecting to /");
    }
    setUser(null);
    setProfile(null);
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
