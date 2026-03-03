import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET() {
  try {
    const data = await db
      .select()
      .from(products)
      .where(eq(products.isActive, true))
      .orderBy(asc(products.createdAt));

    // Map to match the frontend expected format
    const mapped = data.map((p) => ({
      id: p.id,
      name: p.name,
      short_name: p.shortName,
      price: Number(p.price),
      original_price: Number(p.originalPrice),
      currency: p.currency,
      description: p.description,
      features: p.features,
      icon_name: p.iconName,
      color: p.color,
      badge: p.badge,
      file_url: p.fileUrl,
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
