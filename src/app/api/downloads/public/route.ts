import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orderItems, orders } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { get } from "@vercel/blob";
import { decryptToken } from "@/lib/download-token";

/**
 * Public download endpoint with secure token
 * URL format: /api/downloads/public?token=<encrypted_orderItemId>
 */
export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token");
    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    // Decrypt token to get orderItemId
    let orderItemId: string;
    try {
      orderItemId = decryptToken(token);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 403 });
    }

    // Fetch order item
    const [item] = await db
      .select({
        fileUrl: orderItems.fileUrl,
        productName: orderItems.productName,
        orderId: orderItems.orderId,
      })
      .from(orderItems)
      .where(eq(orderItems.id, orderItemId))
      .limit(1);

    if (!item) {
      return NextResponse.json({ error: "Order item not found" }, { status: 404 });
    }

    // Verify the order is completed
    const [order] = await db
      .select({ status: orders.status })
      .from(orders)
      .where(eq(orders.id, item.orderId))
      .limit(1);

    if (!order || order.status !== "completed") {
      return NextResponse.json({ error: "Order not completed" }, { status: 403 });
    }

    // Check file URL exists
    if (!item.fileUrl) {
      return NextResponse.json({ error: "No file associated with this product" }, { status: 404 });
    }

    // Fetch the file from private Vercel Blob store
    const blobResult = await get(item.fileUrl, { access: "private" });

    if (!blobResult || blobResult.statusCode !== 200) {
      return NextResponse.json({ error: "File not found in storage" }, { status: 404 });
    }

    // Determine filename
    const ext = item.fileUrl.split(".").pop() || "xlsx";
    const safeName = item.productName.replace(/[^a-zA-Z0-9-_ ]/g, "").replace(/\s+/g, "-");
    const filename = `${safeName}.${ext}`;

    // Stream the file back to the user
    return new Response(blobResult.stream, {
      headers: {
        "Content-Type": blobResult.blob.contentType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Public download error:", error);
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}

