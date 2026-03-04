import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { landingPages, leads } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { getAuthUserId, isAdmin } from "@/lib/auth";

async function checkAdmin() {
  const userId = await getAuthUserId();
  if (!userId) return null;
  const admin = await isAdmin(userId);
  if (!admin) return null;
  return userId;
}

export async function GET() {
  try {
    if (!(await checkAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pages = await db
      .select({
        id: landingPages.id,
        productId: landingPages.productId,
        slug: landingPages.slug,
        isActive: landingPages.isActive,
        heroHeadline: landingPages.heroHeadline,
        metaTitle: landingPages.metaTitle,
        createdAt: landingPages.createdAt,
        updatedAt: landingPages.updatedAt,
        leadsCount: sql<number>`(SELECT COUNT(*) FROM leads WHERE leads.landing_page_id = landing_pages.id)`,
      })
      .from(landingPages)
      .orderBy(desc(landingPages.createdAt));

    return NextResponse.json(pages);
  } catch (error) {
    console.error("Error fetching landing pages:", error);
    return NextResponse.json({ error: "Failed to fetch landing pages" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!(await checkAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const [page] = await db.insert(landingPages).values({
      productId: data.product_id,
      slug: data.slug,
      isActive: data.is_active ?? true,
      metaTitle: data.meta_title || null,
      metaDescription: data.meta_description || null,
      metaPixelId: data.meta_pixel_id || null,
      heroHeadline: data.hero_headline,
      heroSubheadline: data.hero_subheadline || null,
      heroVideoUrl: data.hero_video_url || null,
      heroImageUrls: data.hero_image_urls || [],
      heroCtaText: data.hero_cta_text || "Buy Now",
      leadFormEnabled: data.lead_form_enabled ?? true,
      leadFormHeadline: data.lead_form_headline || null,
      leadFormFields: data.lead_form_fields || ["name", "email", "phone"],
      leadFormCtaText: data.lead_form_cta_text || "Get Access Now",
      leadFormVideoUrl: data.lead_form_video_url || null,
      offerHeadline: data.offer_headline || null,
      offerExpiresAt: data.offer_expires_at ? new Date(data.offer_expires_at) : null,
      offerSlotsTotal: data.offer_slots_total || 100,
      offerSlotsUsed: data.offer_slots_used || 0,
      offerUrgencyText: data.offer_urgency_text || null,
      testimonials: data.testimonials || [],
      stats: data.stats || [],
      faqs: data.faqs || [],
      sections: data.sections || [],
    }).returning();

    return NextResponse.json(page);
  } catch (error) {
    console.error("Error creating landing page:", error);
    return NextResponse.json({ error: "Failed to create landing page" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    if (!(await checkAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    if (!data.id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const [page] = await db.update(landingPages)
      .set({
        productId: data.product_id,
        slug: data.slug,
        isActive: data.is_active,
        metaTitle: data.meta_title || null,
        metaDescription: data.meta_description || null,
        metaPixelId: data.meta_pixel_id || null,
        heroHeadline: data.hero_headline,
        heroSubheadline: data.hero_subheadline || null,
        heroVideoUrl: data.hero_video_url || null,
        heroImageUrls: data.hero_image_urls || [],
        heroCtaText: data.hero_cta_text || "Buy Now",
        leadFormEnabled: data.lead_form_enabled,
        leadFormHeadline: data.lead_form_headline || null,
        leadFormFields: data.lead_form_fields || ["name", "email", "phone"],
        leadFormCtaText: data.lead_form_cta_text || "Get Access Now",
        leadFormVideoUrl: data.lead_form_video_url || null,
        offerHeadline: data.offer_headline || null,
        offerExpiresAt: data.offer_expires_at ? new Date(data.offer_expires_at) : null,
        offerSlotsTotal: data.offer_slots_total,
        offerSlotsUsed: data.offer_slots_used,
        offerUrgencyText: data.offer_urgency_text || null,
        testimonials: data.testimonials || [],
        stats: data.stats || [],
        faqs: data.faqs || [],
        sections: data.sections || [],
        updatedAt: new Date(),
      })
      .where(eq(landingPages.id, data.id))
      .returning();

    return NextResponse.json(page);
  } catch (error) {
    console.error("Error updating landing page:", error);
    return NextResponse.json({ error: "Failed to update landing page" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!(await checkAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    await db.delete(landingPages).where(eq(landingPages.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting landing page:", error);
    return NextResponse.json({ error: "Failed to delete landing page" }, { status: 500 });
  }
}
