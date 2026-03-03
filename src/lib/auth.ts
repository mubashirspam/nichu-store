import { createNeonAuth } from "@neondatabase/auth/next/server";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const hasConfig = !!(process.env.NEON_AUTH_BASE_URL && process.env.NEON_AUTH_COOKIE_SECRET);

export const auth = hasConfig
  ? createNeonAuth({
      baseUrl: process.env.NEON_AUTH_BASE_URL!,
      cookies: {
        secret: process.env.NEON_AUTH_COOKIE_SECRET!,
      },
    })
  : ({
      handler: () => {
        const stub = async () => new Response("Auth not configured", { status: 503 });
        return { GET: stub, POST: stub };
      },
      middleware: () => () => {},
      getSession: async () => ({ data: null }),
    } as any);

/**
 * Get the current authenticated user ID from Neon Auth session.
 * Must be called from server context (API route, server component, middleware).
 */
export async function getAuthUserId(): Promise<string | null> {
  const { data: session } = await auth.getSession();
  return session?.user?.id || null;
}

/**
 * Require authentication. Returns userId or throws.
 */
export async function requireAuth(): Promise<string> {
  const userId = await getAuthUserId();
  if (!userId) throw new Error("Unauthorized");
  return userId;
}

/**
 * Check if the given user is an admin.
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const [profile] = await db
    .select({ role: profiles.role })
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1);

  return !!profile && profile.role === "admin";
}

/**
 * Sync Neon Auth user to our profiles table (upsert).
 */
export async function syncProfile(user: { id: string; email: string; name?: string; image?: string | null }) {
  const [profile] = await db
    .insert(profiles)
    .values({
      id: user.id,
      email: user.email,
      fullName: user.name || null,
      avatarUrl: user.image || null,
      role: "user",
    })
    .onConflictDoUpdate({
      target: profiles.id,
      set: {
        email: user.email,
        fullName: user.name || null,
        avatarUrl: user.image || null,
        updatedAt: new Date(),
      },
    })
    .returning();

  return profile;
}
