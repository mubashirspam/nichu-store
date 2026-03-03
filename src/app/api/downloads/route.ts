import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { orderItems, orders } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { get } from "@vercel/blob";

export async function GET(req: NextRequest) {
  try {
    // 1. Authenticate
    const { data: session } = await auth.getSession();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Get orderItemId from query
    const orderItemId = req.nextUrl.searchParams.get("orderItemId");
    if (!orderItemId) {
      return NextResponse.json({ error: "Missing orderItemId" }, { status: 400 });
    }

    // 3. Fetch order item and verify ownership
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

    // 4. Verify the order belongs to this user and is completed
    const [order] = await db
      .select({ userId: orders.userId, status: orders.status })
      .from(orders)
      .where(and(eq(orders.id, item.orderId), eq(orders.userId, userId)))
      .limit(1);

    if (!order) {
      return NextResponse.json({ error: "Order not found or unauthorized" }, { status: 403 });
    }

    if (order.status !== "completed") {
      return NextResponse.json({ error: "Order is not completed yet" }, { status: 403 });
    }

    // 5. Check file URL exists
    if (!item.fileUrl) {
      return NextResponse.json({ error: "No file associated with this product" }, { status: 404 });
    }

    // 6. Fetch the file from private Vercel Blob store
    const blobResult = await get(item.fileUrl, { access: "private" });

    if (!blobResult || blobResult.statusCode !== 200) {
      return NextResponse.json({ error: "File not found in storage" }, { status: 404 });
    }

    // 7. Determine filename
    const ext = item.fileUrl.split(".").pop() || "xlsx";
    const safeName = item.productName.replace(/[^a-zA-Z0-9-_ ]/g, "").replace(/\s+/g, "-");
    const filename = `${safeName}.${ext}`;

    // 8. Stream the file back to the user
    return new Response(blobResult.stream, {
      headers: {
        "Content-Type": blobResult.blob.contentType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}
