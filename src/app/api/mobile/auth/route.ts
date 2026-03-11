import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { profiles, userCloudAccounts } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import {
  signMobileJWT,
  verifyGoogleIdToken,
  verifyMicrosoftIdToken,
} from "@/lib/auth/mobile";

export async function POST(request: NextRequest) {
  try {
    const { provider, accessToken, refreshToken, idToken } = await request.json();
    console.log('[mobile-auth] POST received - provider:', provider);
    console.log('[mobile-auth] accessToken:', accessToken ? 'PRESENT' : 'MISSING');
    console.log('[mobile-auth] idToken:', idToken ? 'PRESENT' : 'MISSING');

    if (!provider || !accessToken || !idToken) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify ID token and get user info
    let userInfo: { email: string; name: string; picture?: string } | null = null;

    if (provider === "google") {
      userInfo = await verifyGoogleIdToken(idToken);
    } else if (provider === "microsoft") {
      userInfo = await verifyMicrosoftIdToken(idToken);
    } else {
      return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
    }

    if (!userInfo) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Find or create profile (by email)
    let [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.email, userInfo.email))
      .limit(1);

    if (!profile) {
      const [newProfile] = await db
        .insert(profiles)
        .values({
          id: crypto.randomUUID(),
          email: userInfo.email,
          fullName: userInfo.name,
          avatarUrl: userInfo.picture || null,
          role: "user",
        })
        .returning();
      profile = newProfile;
    }

    // Upsert cloud account credentials
    await db
      .insert(userCloudAccounts)
      .values({
        userId: profile.id,
        provider,
        accessToken,
        refreshToken: refreshToken || null,
        tokenExpiresAt: new Date(Date.now() + 3600 * 1000),
        email: userInfo.email,
      })
      .onConflictDoUpdate({
        target: [userCloudAccounts.userId, userCloudAccounts.provider],
        set: {
          accessToken,
          refreshToken: refreshToken || null,
          tokenExpiresAt: new Date(Date.now() + 3600 * 1000),
          updatedAt: new Date(),
        },
      });

    const sessionToken = await signMobileJWT({
      userId: profile.id,
      email: profile.email,
      provider,
    });

    return NextResponse.json({
      user: {
        id: profile.id,
        email: profile.email,
        name: profile.fullName,
        avatarUrl: profile.avatarUrl,
      },
      sessionToken,
    });
  } catch (error) {
    console.error("Mobile auth error:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}
