import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { leads } from "@/lib/db/schema";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    if (!data.landing_page_id || !data.product_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!data.email && !data.phone) {
      return NextResponse.json({ error: "Email or phone is required" }, { status: 400 });
    }

    const [lead] = await db.insert(leads).values({
      landingPageId: data.landing_page_id,
      productId: data.product_id,
      name: data.name || null,
      email: data.email || null,
      phone: data.phone || null,
      utmSource: data.utm_source || null,
      utmMedium: data.utm_medium || null,
      utmCampaign: data.utm_campaign || null,
    }).returning();

    return NextResponse.json({ success: true, leadId: lead.id });
  } catch (error) {
    console.error("Error saving lead:", error);
    return NextResponse.json({ error: "Failed to save lead" }, { status: 500 });
  }
}
