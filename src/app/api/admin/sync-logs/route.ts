import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId, isAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { syncLogs, userTrackers, profiles } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthUserId();
    if (!userId || !(await isAdmin(userId))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const trackerId = searchParams.get("trackerId");

    const query = db
      .select({
        id: syncLogs.id,
        action: syncLogs.action,
        data: syncLogs.data,
        errorMessage: syncLogs.errorMessage,
        createdAt: syncLogs.createdAt,
        tracker: { id: userTrackers.id, trackerType: userTrackers.trackerType },
        user: { email: profiles.email },
      })
      .from(syncLogs)
      .innerJoin(userTrackers, eq(syncLogs.userTrackerId, userTrackers.id))
      .innerJoin(profiles, eq(userTrackers.userId, profiles.id))
      .orderBy(desc(syncLogs.createdAt))
      .limit(200);

    const logs = trackerId
      ? await query.where(eq(syncLogs.userTrackerId, trackerId))
      : await query;

    return NextResponse.json(logs);
  } catch (error) {
    console.error("Admin sync-logs error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
