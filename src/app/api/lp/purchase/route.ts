import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products as productsTable, orders, orderItems } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import Razorpay from "razorpay";

export async function POST(req: NextRequest) {
  try {
    const { email, name, phone, productId, landingPageId, leadId } = await req.json();

    if (!email || !productId) {
      return NextResponse.json({ error: "Email and product ID are required" }, { status: 400 });
    }

    // Fetch product
    const [product] = await db
      .select()
      .from(productsTable)
      .where(and(eq(productsTable.id, productId), eq(productsTable.isActive, true)))
      .limit(1);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const totalAmount = Number(product.price);
    const orderNumber = `LP-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Create Razorpay order
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: orderNumber,
      notes: {
        guestEmail: email,
        guestName: name || "",
        guestPhone: phone || "",
        landingPageId: landingPageId || "",
        leadId: leadId || "",
        productName: product.name,
      },
    });

    // Create DB order with guest user ID
    const guestUserId = `guest:${email}`;
    const [order] = await db.insert(orders).values({
      userId: guestUserId,
      orderNumber,
      totalAmount: String(totalAmount),
      currency: "INR",
      razorpayOrderId: razorpayOrder.id,
      status: "pending",
    }).returning();

    // Create order item
    await db.insert(orderItems).values({
      orderId: order.id,
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity: 1,
      fileUrl: product.fileUrl,
    });

    return NextResponse.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      dbOrderId: order.id,
      orderNumber: order.orderNumber,
      productName: product.name,
    });
  } catch (error) {
    console.error("Error creating guest order:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
