import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, leads } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      dbOrderId,
      leadId,
    } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing payment details" }, { status: 400 });
    }

    // Verify signature
    const keySecret = process.env.RAZORPAY_KEY_SECRET!;
    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Payment verification failed", verified: false }, { status: 400 });
    }

    // Update order status
    if (dbOrderId) {
      await db.update(orders)
        .set({
          status: "paid",
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, dbOrderId));
    }

    // Mark lead as converted
    if (leadId) {
      await db.update(leads)
        .set({ converted: true })
        .where(eq(leads.id, leadId));
    }

    return NextResponse.json({
      verified: true,
      message: "Payment verified successfully",
      paymentId: razorpay_payment_id,
    });
  } catch (error) {
    console.error("Error verifying guest payment:", error);
    return NextResponse.json({ error: "Payment verification failed", verified: false }, { status: 500 });
  }
}
