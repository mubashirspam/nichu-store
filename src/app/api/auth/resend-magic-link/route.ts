import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authUser } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

// Simple in-memory rate limit (resets on server restart — good enough for most cases)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 3;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

function isRateLimited(email: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(email);
  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(email, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  if (entry.count >= RATE_LIMIT) return true;
  entry.count++;
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

    const normalizedEmail = email.toLowerCase().trim();

    // Verify user exists
    const [user] = await db
      .select({ id: authUser.id })
      .from(authUser)
      .where(eq(authUser.email, normalizedEmail))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "No account found with this email" }, { status: 404 });
    }

    if (isRateLimited(normalizedEmail)) {
      return NextResponse.json({ error: "Too many requests. Please wait before requesting another link." }, { status: 429 });
    }

    // Send magic link via Better Auth
    await auth.api.signInMagicLink({
      body: { email: normalizedEmail, callbackURL: `${BASE_URL}/dashboard/orders` },
      headers: new Headers({ "Content-Type": "application/json" }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[resend-magic-link]", error);
    return NextResponse.json({ error: "Failed to resend access link" }, { status: 500 });
  }
}
