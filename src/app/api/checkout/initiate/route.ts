import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getRazorpayClient } from "@/lib/razorpay";

export async function POST(req: NextRequest) {
  try {
    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!product || !product.isActive) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const amountPaise = Math.round(Number(product.price) * 100);

    const razorpay = getRazorpayClient();
    const rzpOrder = await razorpay.orders.create({
      amount: amountPaise,
      currency: product.currency || "INR",
      receipt: `order_${Date.now()}`,
      notes: { productId },
    } as any);

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
