import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
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

    // Verify signature
    const keySecret = process.env.RAZORPAY_KEY_SECRET!;
    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      // Update order status to failed
      await supabase
        .from("orders")
        .update({ status: "failed" })
        .eq("id", dbOrderId)
        .eq("user_id", user.id);

      return NextResponse.json({ error: "Payment verification failed", verified: false }, { status: 400 });
    }

    // Update order to completed
    await supabase
      .from("orders")
      .update({
        razorpay_payment_id,
        razorpay_signature,
        status: "completed",
      })
      .eq("id", dbOrderId)
      .eq("user_id", user.id);

    // If offer code was used, record usage and increment count
    if (offerCode) {
      const { data: code } = await supabase
        .from("offer_codes")
        .select("id, used_count")
        .eq("code", offerCode.toUpperCase())
        .single();

      if (code) {
        await supabase.from("offer_code_usage").insert({
          offer_code_id: code.id,
          user_id: user.id,
          order_id: dbOrderId,
        });

        await supabase
          .from("offer_codes")
          .update({ used_count: code.used_count + 1 })
          .eq("id", code.id);
      }
    }

    // Clear user's cart after successful payment
    await supabase.from("cart_items").delete().eq("user_id", user.id);

    console.log("Payment verified:", { userId: user.id, orderId: dbOrderId, paymentId: razorpay_payment_id });

    return NextResponse.json({
      verified: true,
      message: "Payment verified successfully",
      orderId: dbOrderId,
      paymentId: razorpay_payment_id,
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json({ error: "Verification failed", verified: false }, { status: 500 });
  }
}
