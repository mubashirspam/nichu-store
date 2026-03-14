import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink } from "better-auth/plugins";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { authUser, authSession, authAccount, authVerification, profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { sendMagicLinkEmail } from "@/lib/email";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET || process.env.NEON_AUTH_COOKIE_SECRET,

  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: authUser,
      session: authSession,
      account: authAccount,
      verification: authVerification,
    },
  }),

  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await sendMagicLinkEmail({ to: email, url });
      },
      expiresIn: 48 * 60 * 60, // 48 hours
    }),
  ],

  socialProviders: {
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {}),
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: false,
      },
    },
  },

  session: {
    expiresIn: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60,       // refresh session cookie daily
  },
});

/** Get the current authenticated user ID (server context). */
export async function getAuthUserId(): Promise<string | null> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    return session?.user?.id || null;
  } catch {
    return null;
  }
}

/** Require authentication — returns userId or throws. */
export async function requireAuth(): Promise<string> {
  const userId = await getAuthUserId();
  if (!userId) throw new Error("Unauthorized");
  return userId;
}

/** Check if the given user is an admin. */
export async function isAdmin(userId: string): Promise<boolean> {
  // Check Better Auth user table first
  const [baUser] = await db
    .select({ role: authUser.role })
    .from(authUser)
    .where(eq(authUser.id, userId))
    .limit(1);
  if (baUser?.role === "admin") return true;

  // Fallback: check legacy profiles table
  const [profile] = await db
    .select({ role: profiles.role })
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1);
  return profile?.role === "admin";
}

/** Sync Better Auth session user to the legacy profiles table. */
export async function syncProfile(user: {
  id: string;
  email: string;
  name?: string;
  image?: string | null;
}) {
  await db
    .insert(profiles)
    .values({
      id: user.id,
      email: user.email,
      fullName: user.name || null,
      avatarUrl: user.image || null,
      role: "user",
      authProvider: "better_auth",
    })
    .onConflictDoUpdate({
      target: profiles.id,
      set: {
        email: user.email,
        fullName: user.name || null,
        avatarUrl: user.image || null,
        updatedAt: new Date(),
      },
    });
}
