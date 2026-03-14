import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId, isAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { orders, orderItems, profiles } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const userId = await getAuthUserId();
    if (!userId || !(await isAdmin(userId))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("status");

    let query = db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt));

    const allOrders = filter && filter !== "all"
      ? await db.select().from(orders).where(eq(orders.status, filter)).orderBy(desc(orders.createdAt))
      : await db.select().from(orders).orderBy(desc(orders.createdAt));

    const result = [];
    for (const order of allOrders) {
      const [profile] = await db
        .select({ email: profiles.email })
        .from(profiles)
        .where(eq(profiles.id, order.userId))
        .limit(1);

      const items = await db
        .select({ product_name: orderItems.productName, price: orderItems.price })
        .from(orderItems)
        .where(eq(orderItems.orderId, order.id));

      result.push({
        id: order.id,
        order_number: order.orderNumber,
        total_amount: Number(order.totalAmount),
        discount_amount: Number(order.discountAmount),
        status: order.status,
        created_at: order.createdAt,
        razorpay_payment_id: order.razorpayPaymentId,
        profiles: profile ? { email: profile.email } : null,
        order_items: items.map((i) => ({ product_name: i.product_name, price: Number(i.price) })),
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching admin orders:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const userId = await getAuthUserId();
    if (!userId || !(await isAdmin(userId))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id, status } = await req.json();
    if (!id || !status) return NextResponse.json({ error: "Missing id or status" }, { status: 400 });

    await db.update(orders).set({ status, updatedAt: new Date() }).where(eq(orders.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
