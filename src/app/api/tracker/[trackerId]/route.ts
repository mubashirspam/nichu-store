import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId, isAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { userTrackers, userCloudAccounts, products } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ trackerId: string }> }
) {
  try {
    const userId = await getAuthUserId(); // TODO: verify usage below
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { trackerId } = await params;

    const [tracker] = await db
      .select({
        id: userTrackers.id,
        fileId: userTrackers.fileId,
        fileUrl: userTrackers.fileUrl,
        trackerType: userTrackers.trackerType,
        isActive: userTrackers.isActive,
        lastSyncedAt: userTrackers.lastSyncedAt,
        createdAt: userTrackers.createdAt,
        product: { id: products.id, name: products.name },
        cloudAccount: {
          id: userCloudAccounts.id,
          provider: userCloudAccounts.provider,
          email: userCloudAccounts.email,
        },
      })
      .from(userTrackers)
      .innerJoin(products, eq(userTrackers.productId, products.id))
      .innerJoin(userCloudAccounts, eq(userTrackers.cloudAccountId, userCloudAccounts.id))
      .where(
        and(eq(userTrackers.id, trackerId), eq(userTrackers.userId, userId))
      )
      .limit(1);

    if (!tracker) {
      return NextResponse.json({ error: "Tracker not found" }, { status: 404 });
    }

    return NextResponse.json(tracker);
  } catch (error) {
    console.error("Get tracker error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ trackerId: string }> }
) {
  try {
    const userId = await getAuthUserId(); // TODO: verify usage below
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { trackerId } = await params;
    const { isActive } = await request.json();

    await db
      .update(userTrackers)
      .set({ isActive })
      .where(
        and(eq(userTrackers.id, trackerId), eq(userTrackers.userId, userId))
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Patch tracker error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ trackerId: string }> }
) {
  try {
    const userId = await getAuthUserId(); // TODO: verify usage below
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { trackerId } = await params;

    await db
      .delete(userTrackers)
      .where(
        and(eq(userTrackers.id, trackerId), eq(userTrackers.userId, userId))
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete tracker error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
