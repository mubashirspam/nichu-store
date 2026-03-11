import { NextResponse } from "next/server";
import { auth, isAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { userTrackers, userCloudAccounts, products, profiles } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const { data: session } = await auth.getSession();
    if (!session?.user?.id || !(await isAdmin(session.user.id))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const trackers = await db
      .select({
        id: userTrackers.id,
        fileUrl: userTrackers.fileUrl,
        trackerType: userTrackers.trackerType,
        isActive: userTrackers.isActive,
        lastSyncedAt: userTrackers.lastSyncedAt,
        createdAt: userTrackers.createdAt,
        user: { id: profiles.id, email: profiles.email, fullName: profiles.fullName },
        product: { id: products.id, name: products.name },
        cloudAccount: { provider: userCloudAccounts.provider, email: userCloudAccounts.email },
      })
      .from(userTrackers)
      .innerJoin(profiles, eq(userTrackers.userId, profiles.id))
      .innerJoin(products, eq(userTrackers.productId, products.id))
      .innerJoin(userCloudAccounts, eq(userTrackers.cloudAccountId, userCloudAccounts.id))
      .orderBy(desc(userTrackers.createdAt));

    return NextResponse.json(trackers);
  } catch (error) {
    console.error("Admin trackers error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
