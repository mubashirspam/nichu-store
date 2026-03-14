import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId, isAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET() {
  try {
    const userId = await getAuthUserId();
    if (!userId || !(await isAdmin(userId))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = await db.select().from(products).orderBy(asc(products.createdAt));

    const mapped = data.map((p) => ({
      id: p.id, name: p.name, short_name: p.shortName, description: p.description,
      price: Number(p.price), original_price: Number(p.originalPrice), currency: p.currency,
      features: p.features, icon_name: p.iconName, color: p.color,
      badge: p.badge, file_url: p.fileUrl, is_active: p.isActive, created_at: p.createdAt,
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error("Error fetching admin products:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthUserId();
    if (!userId || !(await isAdmin(userId))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    const [product] = await db.insert(products).values({
      name: body.name,
      shortName: body.short_name,
      description: body.description,
      price: String(body.price),
      originalPrice: String(body.original_price),
      currency: body.currency || "INR",
      features: body.features || [],
      iconName: body.icon_name || "Dumbbell",
      color: body.color || "emerald",
      badge: body.badge || null,
      fileUrl: body.file_url || null,
      isActive: body.is_active ?? true,
    }).returning();

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
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

    await db.update(products).set({
      name: body.name,
      shortName: body.short_name,
      description: body.description,
      price: String(body.price),
      originalPrice: String(body.original_price),
      currency: body.currency,
      features: body.features,
      iconName: body.icon_name,
      color: body.color,
      badge: body.badge || null,
      fileUrl: body.file_url || null,
      isActive: body.is_active,
      updatedAt: new Date(),
    }).where(eq(products.id, body.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating product:", error);
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

    await db.delete(products).where(eq(products.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
