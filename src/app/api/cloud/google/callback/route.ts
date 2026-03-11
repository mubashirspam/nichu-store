import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userCloudAccounts } from "@/lib/db/schema";
import { exchangeGoogleCode } from "@/lib/cloud";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (!code || !state) {
      return NextResponse.redirect("/tracker/setup?error=missing_params");
    }

    const { userId } = JSON.parse(Buffer.from(state, "base64").toString());
    const tokens = await exchangeGoogleCode(code);

    await db
      .insert(userCloudAccounts)
      .values({
        userId,
        provider: "google",
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenExpiresAt: tokens.expiresAt,
        email: tokens.email,
      })
      .onConflictDoUpdate({
        target: [userCloudAccounts.userId, userCloudAccounts.provider],
        set: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          tokenExpiresAt: tokens.expiresAt,
          updatedAt: new Date(),
        },
      });

    return NextResponse.redirect("/tracker/setup?connected=google");
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    return NextResponse.redirect("/tracker/setup?error=oauth_failed");
  }
}
