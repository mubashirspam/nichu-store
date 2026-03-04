import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { leads } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { getAuthUserId, isAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const userId = await getAuthUserId();
    if (!userId || !(await isAdmin(userId))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allLeads = await db
      .select()
      .from(leads)
      .orderBy(desc(leads.createdAt))
      .limit(500);

    return NextResponse.json(allLeads);
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
  }
}
