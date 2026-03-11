import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { userTrackers, userCloudAccounts, products } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET() {
  try {
    const { data: session } = await auth.getSession();
    if (!session?.user?.id) {
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
      .where(eq(userTrackers.userId, session.user.id));

    return NextResponse.json(trackers);
  } catch (error) {
    console.error("Error fetching trackers:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
