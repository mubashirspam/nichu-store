import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { orders, offerCodes, offerCodeUsage, cartItems } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { data: __session } = await auth.getSession(); const userId = __session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      dbOrderId,
      offerCode,
    } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing payment details", verified: false }, { status: 400 });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET!;
    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      await db.update(orders).set({ status: "failed" }).where(eq(orders.id, dbOrderId));
      return NextResponse.json({ error: "Payment verification failed", verified: false }, { status: 400 });
    }

    const [updatedOrder] = await db
      .update(orders)
      .set({
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: "completed",
      })
      .where(eq(orders.id, dbOrderId))
      .returning();

    if (!updatedOrder) {
      return NextResponse.json({ error: "Failed to update order", verified: false }, { status: 500 });
    }

    if (offerCode) {
      const [code] = await db
        .select({ id: offerCodes.id, usedCount: offerCodes.usedCount })
        .from(offerCodes)
        .where(eq(offerCodes.code, offerCode.toUpperCase()))
        .limit(1);

      if (code) {
        await db.insert(offerCodeUsage).values({
          offerCodeId: code.id,
          userId,
          orderId: dbOrderId,
        });

        await db
          .update(offerCodes)
          .set({ usedCount: code.usedCount + 1 })
          .where(eq(offerCodes.id, code.id));
      }
    }

    // Clear user's cart
    await db.delete(cartItems).where(eq(cartItems.userId, userId));

    return NextResponse.json({
      verified: true,
      message: "Payment verified successfully",
      orderId: dbOrderId,
      paymentId: razorpay_payment_id,
    });
  } catch (error) {
    console.error("[Verify] Exception:", error);
    return NextResponse.json({ error: "Verification failed", verified: false }, { status: 500 });
  }
}
