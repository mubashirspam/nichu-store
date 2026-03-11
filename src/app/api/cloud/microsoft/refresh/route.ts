import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { userCloudAccounts } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { refreshMicrosoftToken } from "@/lib/cloud";

export async function POST(request: NextRequest) {
  try {
    const { data: session } = await auth.getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [account] = await db
      .select()
      .from(userCloudAccounts)
      .where(
        and(
          eq(userCloudAccounts.userId, session.user.id),
          eq(userCloudAccounts.provider, "microsoft")
        )
      )
      .limit(1);

    if (!account?.refreshToken) {
      return NextResponse.json({ error: "No refresh token" }, { status: 400 });
    }

    const refreshed = await refreshMicrosoftToken(account.refreshToken);

    await db
      .update(userCloudAccounts)
      .set({
        accessToken: refreshed.accessToken,
        tokenExpiresAt: refreshed.expiresAt,
        updatedAt: new Date(),
      })
      .where(eq(userCloudAccounts.id, account.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Microsoft refresh error:", error);
    return NextResponse.json({ error: "Refresh failed" }, { status: 500 });
  }
}
