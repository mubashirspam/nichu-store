import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userTrackers, userCloudAccounts, products } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getMobileUserId } from "@/lib/auth/mobile";

export async function GET(request: NextRequest) {
  try {
    const userId = await getMobileUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const trackers = await db
      .select({
        id: userTrackers.id,
        fileId: userTrackers.fileId,
        fileUrl: userTrackers.fileUrl,
        trackerType: userTrackers.trackerType,
        isActive: userTrackers.isActive,
        lastSyncedAt: userTrackers.lastSyncedAt,
        createdAt: userTrackers.createdAt,
        product: {
          id: products.id,
          name: products.name,
          shortName: products.shortName,
        },
        cloudAccount: {
          id: userCloudAccounts.id,
          provider: userCloudAccounts.provider,
          email: userCloudAccounts.email,
        },
      })
      .from(userTrackers)
      .innerJoin(products, eq(userTrackers.productId, products.id))
      .innerJoin(userCloudAccounts, eq(userTrackers.cloudAccountId, userCloudAccounts.id))
      .where(and(eq(userTrackers.userId, userId), eq(userTrackers.isActive, true)));

    return NextResponse.json(trackers);
  } catch (error) {
    console.error("Mobile trackers error:", error);
    return NextResponse.json({ error: "Failed to fetch trackers" }, { status: 500 });
  }
}
