import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId, isAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { userTrackers, userCloudAccounts, masterTemplates } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { cloneGoogleSheet, cloneOneDriveFile, ensureValidToken } from "@/lib/cloud";

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthUserId(); // TODO: verify usage below
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId, cloudAccountId } = await request.json();
    if (!productId || !cloudAccountId) {
      return NextResponse.json({ error: "Missing productId or cloudAccountId" }, { status: 400 });
    }

    // Verify user owns this cloud account
    const [cloudAccount] = await db
      .select()
      .from(userCloudAccounts)
      .where(
        and(
          eq(userCloudAccounts.id, cloudAccountId),
          eq(userCloudAccounts.userId, userId)
        )
      )
      .limit(1);

    if (!cloudAccount) {
      return NextResponse.json({ error: "Cloud account not found" }, { status: 404 });
    }

    // Get master template for this product + provider
    const [template] = await db
      .select()
      .from(masterTemplates)
      .where(
        and(
          eq(masterTemplates.productId, productId),
          eq(masterTemplates.provider, cloudAccount.provider)
        )
      )
      .limit(1);

    if (!template) {
      return NextResponse.json(
        { error: `No ${cloudAccount.provider} template configured for this product` },
        { status: 404 }
      );
    }

    // Ensure token is valid
    const accessToken = await ensureValidToken({
      id: cloudAccount.id,
      provider: cloudAccount.provider,
      accessToken: cloudAccount.accessToken,
      refreshToken: cloudAccount.refreshToken,
      tokenExpiresAt: cloudAccount.tokenExpiresAt,
    });

    // Clone the template
    const newName = `Nichu Tracker - ${new Date().toLocaleDateString("en-IN")}`;
    const clonedFile =
      cloudAccount.provider === "google"
        ? await cloneGoogleSheet(accessToken, template.fileId, newName)
        : await cloneOneDriveFile(accessToken, template.fileId, newName);

    // Save tracker reference
    const [tracker] = await db
      .insert(userTrackers)
      .values({
        userId: userId,
        productId,
        cloudAccountId,
        fileId: clonedFile.id,
        fileUrl: clonedFile.webViewLink,
        trackerType: template.trackerType,
      })
      .returning();

    return NextResponse.json(tracker);
  } catch (error) {
    console.error("Clone error:", error);
    return NextResponse.json({ error: "Clone failed" }, { status: 500 });
  }
}
