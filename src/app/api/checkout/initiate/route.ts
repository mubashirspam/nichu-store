import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products, offerCodes } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getRazorpayClient } from "@/lib/razorpay";

export async function POST(req: NextRequest) {
  try {
    const { productId, offerCodeId } = await req.json();

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

    let totalAmount = Number(product.price);
    let discountAmount = 0;

    // Apply offer code if provided
    if (offerCodeId) {
      const [oc] = await db
        .select()
        .from(offerCodes)
        .where(and(eq(offerCodes.id, offerCodeId), eq(offerCodes.isActive, true)))
        .limit(1);

      if (oc) {
        const discountValue = Number(oc.discountValue);
        if (oc.discountType === "percentage") {
          discountAmount = Math.round((totalAmount * discountValue) / 100);
        } else {
          discountAmount = discountValue;
        }
        discountAmount = Math.min(discountAmount, totalAmount);
        totalAmount = totalAmount - discountAmount;
      }
    }

    const amountPaise = Math.round(totalAmount * 100);

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
