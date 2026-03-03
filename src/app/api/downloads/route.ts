import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { orderItems, orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { data: __session } = await auth.getSession(); const userId = __session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orderItemId = req.nextUrl.searchParams.get("orderItemId");
    if (!orderItemId) {
      return NextResponse.json({ error: "Missing orderItemId" }, { status: 400 });
    }

    // Fetch order item with its parent order
    const [item] = await db
      .select({
        id: orderItems.id,
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

    // Verify the order belongs to this user
    const [order] = await db
      .select({ userId: orders.userId })
      .from(orders)
      .where(eq(orders.id, item.orderId))
      .limit(1);

    if (!order || order.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!item.fileUrl) {
      return NextResponse.json({ error: "No file available for this product" }, { status: 404 });
    }

    // If the file_url is a full Vercel Blob URL, redirect to it directly
    if (item.fileUrl.startsWith("https://")) {
      return NextResponse.redirect(item.fileUrl);
    }

    // For legacy Supabase storage paths, construct the blob URL
    const blobBaseUrl = process.env.BLOB_BASE_URL;
    if (blobBaseUrl) {
      return NextResponse.redirect(`${blobBaseUrl}/${item.fileUrl}`);
    }

    return NextResponse.json({ error: "File storage not configured" }, { status: 500 });
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}
