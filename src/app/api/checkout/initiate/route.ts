import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products, pendingCheckouts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getRazorpayClient } from "@/lib/razorpay";

export async function POST(req: NextRequest) {
  try {
    const { name, email, productId } = await req.json();

    if (!name || !email || !productId) {
      return NextResponse.json({ error: "name, email, and productId are required" }, { status: 400 });
    }

    // Validate product exists
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!product || !product.isActive) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const amountPaise = Math.round(Number(product.price) * 100); // Razorpay uses paise

    // Create Razorpay order
    const razorpay = getRazorpayClient();
    const rzpOrder = await razorpay.orders.create({
      amount: amountPaise,
      currency: product.currency || "INR",
      receipt: `guest_${Date.now()}`,
    });

    // Store pending checkout
    await db.insert(pendingCheckouts).values({
      razorpayOrderId: rzpOrder.id,
      email: email.toLowerCase().trim(),
      name: name.trim(),
      productId,
      status: "pending",
    });

    return NextResponse.json({
      orderId: rzpOrder.id,
      amount: amountPaise,
      currency: rzpOrder.currency,
      razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      productName: product.name,
    });
  } catch (error) {
    console.error("[checkout/initiate]", error);
    return NextResponse.json({ error: "Failed to initiate checkout" }, { status: 500 });
  }
}
