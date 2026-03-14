import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId, isAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { offerCodes } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const userId = await getAuthUserId();
    if (!userId || !(await isAdmin(userId))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = await db.select().from(offerCodes).orderBy(desc(offerCodes.createdAt));

    const mapped = data.map((c) => ({
      id: c.id, code: c.code, discount_type: c.discountType,
      discount_value: Number(c.discountValue), max_uses: c.maxUses,
      used_count: c.usedCount, is_active: c.isActive,
      requires_auth: c.requiresAuth,
      valid_from: c.validFrom, valid_until: c.validUntil,
    }));

    return NextResponse.json(mapped);
  } catch (error: any) {
    console.error("Error fetching offer codes:", error);
    return NextResponse.json({ error: error?.message || "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthUserId();
    if (!userId || !(await isAdmin(userId))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    const [code] = await db.insert(offerCodes).values({
      code: body.code.toUpperCase(),
      discountType: body.discount_type,
      discountValue: String(body.discount_value),
      maxUses: body.max_uses ? Number(body.max_uses) : null,
      isActive: body.is_active ?? true,
      requiresAuth: false,
      validUntil: body.valid_until ? new Date(body.valid_until) : null,
    }).returning();

    return NextResponse.json(code);
  } catch (error: any) {
    console.error("Error creating offer code:", error);
    return NextResponse.json({ error: error?.message || "Failed" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const userId = await getAuthUserId();
    if (!userId || !(await isAdmin(userId))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    if (!body.id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    await db.update(offerCodes).set({
      code: body.code.toUpperCase(),
      discountType: body.discount_type,
      discountValue: String(body.discount_value),
      maxUses: body.max_uses ? Number(body.max_uses) : null,
      isActive: body.is_active,
      requiresAuth: false,
      validUntil: body.valid_until ? new Date(body.valid_until) : null,
      updatedAt: new Date(),
    }).where(eq(offerCodes.id, body.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating offer code:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = await getAuthUserId();
    if (!userId || !(await isAdmin(userId))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    await db.delete(offerCodes).where(eq(offerCodes.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting offer code:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
