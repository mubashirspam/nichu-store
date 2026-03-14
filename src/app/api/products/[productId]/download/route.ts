import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, orderItems, products } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getAuthUserId } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId } = await params;

    // Verify user has purchased this product
    const [orderItem] = await db
      .select({ fileUrl: orderItems.fileUrl, orderId: orderItems.orderId })
      .from(orderItems)
      .innerJoin(orders, eq(orders.id, orderItems.orderId))
      .where(
        and(
          eq(orderItems.productId, productId),
          eq(orders.userId, userId),
          eq(orders.status, "completed")
        )
      )
      .limit(1);

    if (!orderItem) {
      return NextResponse.json({ error: "Product not found in your orders" }, { status: 404 });
    }

    // Get file URL from product if not on order item
    let fileUrl = orderItem.fileUrl;
    if (!fileUrl) {
      const [product] = await db.select({ fileUrl: products.fileUrl }).from(products).where(eq(products.id, productId)).limit(1);
      fileUrl = product?.fileUrl || null;
    }

    if (!fileUrl) {
      return NextResponse.json({ error: "File not available" }, { status: 404 });
    }

    // If it's a Vercel Blob URL, return it directly (Blob URLs are already signed in some plans)
    // For production, generate a short-lived signed URL here
    return NextResponse.json({ url: fileUrl });
  } catch (error) {
    console.error("[download]", error);
    return NextResponse.json({ error: "Failed to generate download link" }, { status: 500 });
  }
}
