import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { userTrackers, userCloudAccounts, syncLogs } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { appendToGoogleSheet, appendToExcel, ensureValidToken } from "@/lib/cloud";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ trackerId: string }> }
) {
  try {
    const { data: session } = await auth.getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { trackerId } = await params;
    const { data, sheetName } = await request.json();

    // Get tracker with cloud account
    const [row] = await db
      .select({
        tracker: userTrackers,
        cloudAccount: userCloudAccounts,
      })
      .from(userTrackers)
      .innerJoin(userCloudAccounts, eq(userTrackers.cloudAccountId, userCloudAccounts.id))
      .where(
        and(eq(userTrackers.id, trackerId), eq(userTrackers.userId, session.user.id))
      )
      .limit(1);

    if (!row) {
      return NextResponse.json({ error: "Tracker not found" }, { status: 404 });
    }

    try {
      const accessToken = await ensureValidToken({
        id: row.cloudAccount.id,
        provider: row.cloudAccount.provider,
        accessToken: row.cloudAccount.accessToken,
        refreshToken: row.cloudAccount.refreshToken,
        tokenExpiresAt: row.cloudAccount.tokenExpiresAt,
      });

      const sheet = sheetName || "Daily Log";

      if (row.cloudAccount.provider === "google") {
        await appendToGoogleSheet(accessToken, row.tracker.fileId, sheet, [data]);
      } else {
        await appendToExcel(accessToken, row.tracker.fileId, sheet, [data]);
      }

      await db
        .update(userTrackers)
        .set({ lastSyncedAt: new Date() })
        .where(eq(userTrackers.id, trackerId));

      await db.insert(syncLogs).values({
        userTrackerId: trackerId,
        action: "write",
        data: { sheetName: sheet, rowCount: 1 },
      });

      return NextResponse.json({ success: true });
    } catch (err) {
      await db.insert(syncLogs).values({
        userTrackerId: trackerId,
        action: "error",
        errorMessage: err instanceof Error ? err.message : "Unknown error",
      });
      throw err;
    }
  } catch (error) {
    console.error("Log error:", error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
