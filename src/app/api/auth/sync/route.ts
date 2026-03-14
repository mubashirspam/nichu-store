import { NextResponse } from "next/server";
import { getAuthUserId, syncProfile } from "@/lib/auth";
import { db } from "@/lib/db";
import { authUser } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST() {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ synced: false });

    const [user] = await db.select().from(authUser).where(eq(authUser.id, userId)).limit(1);
    if (!user) return NextResponse.json({ synced: false });

    await syncProfile({ id: user.id, email: user.email, name: user.name, image: user.image });
    return NextResponse.json({ synced: true });
  } catch (error) {
    console.error("Error syncing profile:", error);
    return NextResponse.json({ error: "Failed to sync" }, { status: 500 });
  }
}
