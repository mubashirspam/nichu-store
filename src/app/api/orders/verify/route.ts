import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error("[Verify] No user session found — user is unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[Verify] User authenticated:", user.email, user.id);

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      dbOrderId,
      offerCode,
    } = await req.json();

    console.log("[Verify] Received:", { razorpay_order_id, razorpay_payment_id, dbOrderId, offerCode });

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
      console.error("[Verify] Signature mismatch for order:", dbOrderId);
      // Use admin client to ensure the update goes through
      const adminSupabase = await createAdminClient();
      await adminSupabase
        .from("orders")
        .update({ status: "failed" })
        .eq("id", dbOrderId);

      return NextResponse.json({ error: "Payment verification failed", verified: false }, { status: 400 });
    }

    console.log("[Verify] Signature verified ✅ — updating order to completed");

    // Use admin client (service role) to bypass RLS and ensure the update succeeds
    const adminSupabase = await createAdminClient();

    const { data: updatedOrder, error: updateError } = await adminSupabase
      .from("orders")
      .update({
        razorpay_payment_id,
        razorpay_signature,
        status: "completed",
      })
      .eq("id", dbOrderId)
      .select()
      .single();

    if (updateError) {
      console.error("[Verify] FAILED to update order status:", updateError.message, updateError.code);
      return NextResponse.json({ error: "Failed to update order", verified: false }, { status: 500 });
    }

    console.log("[Verify] Order updated to completed:", updatedOrder?.id, "status:", updatedOrder?.status);

    // If offer code was used, record usage and increment count
    if (offerCode) {
      const { data: code } = await adminSupabase
        .from("offer_codes")
        .select("id, used_count")
        .eq("code", offerCode.toUpperCase())
        .single();

      if (code) {
        await adminSupabase.from("offer_code_usage").insert({
          offer_code_id: code.id,
          user_id: user.id,
          order_id: dbOrderId,
        });

        await adminSupabase
          .from("offer_codes")
          .update({ used_count: code.used_count + 1 })
          .eq("id", code.id);
      }
    }

    // Clear user's cart after successful payment
    await adminSupabase.from("cart_items").delete().eq("user_id", user.id);

    console.log("[Verify] Payment verified ✅:", { userId: user.id, orderId: dbOrderId, paymentId: razorpay_payment_id });

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
