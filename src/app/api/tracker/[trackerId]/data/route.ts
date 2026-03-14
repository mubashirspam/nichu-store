import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId, isAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { userTrackers, userCloudAccounts } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { readGoogleSheetRange, readExcelRange, ensureValidToken } from "@/lib/cloud";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ trackerId: string }> }
) {
  try {
    const userId = await getAuthUserId(); // TODO: verify usage below
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { trackerId } = await params;
    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "Daily Log!A:Z";

    const [row] = await db
      .select({
        tracker: userTrackers,
        cloudAccount: userCloudAccounts,
      })
      .from(userTrackers)
      .innerJoin(userCloudAccounts, eq(userTrackers.cloudAccountId, userCloudAccounts.id))
      .where(
        and(eq(userTrackers.id, trackerId), eq(userTrackers.userId, userId))
      )
      .limit(1);

    if (!row) {
      return NextResponse.json({ error: "Tracker not found" }, { status: 404 });
    }

    const accessToken = await ensureValidToken({
      id: row.cloudAccount.id,
      provider: row.cloudAccount.provider,
      accessToken: row.cloudAccount.accessToken,
      refreshToken: row.cloudAccount.refreshToken,
      tokenExpiresAt: row.cloudAccount.tokenExpiresAt,
    });

    let values: unknown[][];
    if (row.cloudAccount.provider === "google") {
      values = await readGoogleSheetRange(accessToken, row.tracker.fileId, range);
    } else {
      const [sheet, addr] = range.split("!");
      values = await readExcelRange(accessToken, row.tracker.fileId, sheet, addr || "A:Z");
    }

    return NextResponse.json({ values });
  } catch (error) {
    console.error("Read data error:", error);
    return NextResponse.json({ error: "Failed to read data" }, { status: 500 });
  }
}
