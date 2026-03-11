import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userTrackers, syncLogs } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getMobileUserId } from "@/lib/auth/mobile";

// POST: Mobile app reports a sync result
export async function POST(request: NextRequest) {
  try {
    const userId = await getMobileUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { trackerId, action, data, errorMessage } = await request.json();
    if (!trackerId || !action) {
      return NextResponse.json({ error: "Missing trackerId or action" }, { status: 400 });
    }

    // Verify ownership
    const [tracker] = await db
      .select({ id: userTrackers.id })
      .from(userTrackers)
      .where(and(eq(userTrackers.id, trackerId), eq(userTrackers.userId, userId)))
      .limit(1);

    if (!tracker) {
      return NextResponse.json({ error: "Tracker not found" }, { status: 404 });
    }

    // Log the sync event
    await db.insert(syncLogs).values({
      userTrackerId: trackerId,
      action,
      data: data || null,
      errorMessage: errorMessage || null,
    });

    // Update lastSyncedAt if successful write
    if (action === "write") {
      await db
        .update(userTrackers)
        .set({ lastSyncedAt: new Date() })
        .where(eq(userTrackers.id, trackerId));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Mobile sync error:", error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}

// GET: pending sync count (useful for mobile UI badges)
export async function GET(request: NextRequest) {
  try {
    const userId = await getMobileUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const trackers = await db
      .select({
        id: userTrackers.id,
        lastSyncedAt: userTrackers.lastSyncedAt,
        trackerType: userTrackers.trackerType,
      })
      .from(userTrackers)
      .where(and(eq(userTrackers.userId, userId), eq(userTrackers.isActive, true)));

    return NextResponse.json({ trackers });
  } catch (error) {
    console.error("Mobile sync status error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
