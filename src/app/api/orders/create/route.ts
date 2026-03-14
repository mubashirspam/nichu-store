import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { products as productsTable, orders, orderItems, offerCodes, offerCodeUsage } from "@/lib/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import Razorpay from "razorpay";

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { items, offerCode } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }

    const productIds = items.map((item: { product_id: string }) => item.product_id);
    const dbProducts = await db
      .select()
      .from(productsTable)
      .where(and(inArray(productsTable.id, productIds), eq(productsTable.isActive, true)));

    if (!dbProducts || dbProducts.length === 0) {
      return NextResponse.json({ error: "Products not found" }, { status: 400 });
    }

    let totalAmount = dbProducts.reduce((sum, p) => sum + Number(p.price), 0);
    let discountAmount = 0;
    let offerCodeId: string | null = null;

    if (offerCode) {
      const [code] = await db
        .select()
        .from(offerCodes)
        .where(and(eq(offerCodes.code, offerCode.toUpperCase()), eq(offerCodes.isActive, true)))
        .limit(1);

      if (!code) {
        return NextResponse.json({ error: "Invalid offer code" }, { status: 400 });
      }

      const [usage] = await db
        .select({ id: offerCodeUsage.id })
        .from(offerCodeUsage)
        .where(and(eq(offerCodeUsage.offerCodeId, code.id), eq(offerCodeUsage.userId, userId)))
        .limit(1);

      if (usage) {
        return NextResponse.json({ error: "You have already used this offer code" }, { status: 400 });
      }

      if (code.maxUses && code.usedCount >= code.maxUses) {
        return NextResponse.json({ error: "This offer code has reached its maximum uses" }, { status: 400 });
      }

      if (code.validUntil && new Date(code.validUntil) < new Date()) {
        return NextResponse.json({ error: "This offer code has expired" }, { status: 400 });
      }

      if (code.discountType === "percentage") {
        discountAmount = Math.round((totalAmount * Number(code.discountValue)) / 100);
      } else {
        discountAmount = Number(code.discountValue);
      }

      discountAmount = Math.min(discountAmount, totalAmount);
      totalAmount = totalAmount - discountAmount;
      offerCodeId = code.id;
    }

    totalAmount = Math.max(totalAmount, 1);

    const orderNumber = `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: orderNumber,
      notes: { userId, orderNumber },
    });

    const [order] = await db.insert(orders).values({
      userId,
      orderNumber,
      totalAmount: String(totalAmount),
      currency: "INR",
      razorpayOrderId: razorpayOrder.id,
      offerCodeId,
      discountAmount: String(discountAmount),
      status: "pending",
    }).returning();

    if (!order) {
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }

    const orderItemsData = dbProducts.map((product) => ({
      orderId: order.id,
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity: 1,
      fileUrl: product.fileUrl,
    }));

    await db.insert(orderItems).values(orderItemsData);

    return NextResponse.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      dbOrderId: order.id,
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
