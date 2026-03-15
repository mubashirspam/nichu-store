import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orderItems, orders } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { get } from "@vercel/blob";
import crypto from "crypto";

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

/**
 * Encrypt orderItemId to create a secure token
 */
export function encryptToken(orderItemId: string): string {
  const secret = process.env.BETTER_AUTH_SECRET || process.env.NEON_AUTH_COOKIE_SECRET || "fallback-secret";
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(secret.slice(0, 32).padEnd(32, "0")), Buffer.alloc(16, 0));
  let encrypted = cipher.update(orderItemId, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

/**
 * Decrypt token to get orderItemId
 */
function decryptToken(token: string): string {
  const secret = process.env.BETTER_AUTH_SECRET || process.env.NEON_AUTH_COOKIE_SECRET || "fallback-secret";
  const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(secret.slice(0, 32).padEnd(32, "0")), Buffer.alloc(16, 0));
  let decrypted = decipher.update(token, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
