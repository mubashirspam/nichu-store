import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, orderItems } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { getAuthUserId } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("id");

    if (orderId) {
      const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
      if (!order || order.userId !== userId) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
      return NextResponse.json({
        id: order.id,
        order_number: order.orderNumber,
        total_amount: Number(order.totalAmount),
        discount_amount: Number(order.discountAmount),
        currency: order.currency,
        status: order.status,
        razorpay_payment_id: order.razorpayPaymentId,
        created_at: order.createdAt,
        order_items: items.map((i) => ({
          id: i.id,
          product_id: i.productId,
          product_name: i.productName,
          price: Number(i.price),
          file_url: i.fileUrl,
        })),
      });
    }

    const userOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));

    const result = [];
    for (const order of userOrders) {
      const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
      result.push({
        id: order.id,
        order_number: order.orderNumber,
        total_amount: Number(order.totalAmount),
        discount_amount: Number(order.discountAmount),
        currency: order.currency,
        status: order.status,
        created_at: order.createdAt,
        order_items: items.map((i) => ({
          id: i.id,
          product_id: i.productId,
          product_name: i.productName,
          price: Number(i.price),
          file_url: i.fileUrl,
        })),
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
