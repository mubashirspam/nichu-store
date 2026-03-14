import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { orders, orderItems, pendingCheckouts, authUser, products } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { sendPurchaseConfirmationEmail } from "@/lib/email";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "No signature provided" }, { status: 400 });
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("RAZORPAY_WEBHOOK_SECRET not configured");
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
    }

    // ── Verify HMAC SHA256 signature ─────────────────────────────────────────
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.error("Webhook signature verification failed");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body);

    switch (event.event) {
      case "payment.captured":
        await handlePaymentCaptured(event);
        break;
      case "payment.failed":
        await handlePaymentFailed(event);
        break;
      case "payment.authorized":
        console.log("Payment authorized:", event.payload?.payment?.entity?.id);
        break;
      case "order.paid":
        console.log("Order paid:", event.payload?.order?.entity?.id);
        break;
      case "refund.created":
        console.log("Refund created:", event.payload?.refund?.entity?.id);
        break;
      default:
        console.log("Unhandled webhook event:", event.event);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

async function handlePaymentCaptured(event: any) {
  const payment = event.payload.payment.entity;
  const razorpayOrderId: string = payment.order_id;
  const razorpayPaymentId: string = payment.id;
  const amountPaid = payment.amount / 100; // convert paise → rupees

  // ── Find matching pending checkout (guest flow) ───────────────────────────
  const [pending] = await db
    .select()
    .from(pendingCheckouts)
    .where(and(eq(pendingCheckouts.razorpayOrderId, razorpayOrderId), eq(pendingCheckouts.status, "pending")))
    .limit(1);

  if (pending) {
    // Guest checkout flow
    await db.update(pendingCheckouts).set({ status: "completed" }).where(eq(pendingCheckouts.id, pending.id));

    const email = pending.email.toLowerCase();

    // Find or create user in Better Auth user table
    let userId: string;
    const [existingUser] = await db.select({ id: authUser.id }).from(authUser).where(eq(authUser.email, email)).limit(1);

    if (existingUser) {
      userId = existingUser.id;
    } else {
      // Create user directly in Better Auth's user table
      const newId = crypto.randomUUID();
      await db.insert(authUser).values({
        id: newId,
        name: pending.name,
        email,
        emailVerified: false,
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      userId = newId;
    }

    // Fetch product for order details
    const [product] = await db.select().from(products).where(eq(products.id, pending.productId)).limit(1);

    // Create order record
    const orderNumber = `ORD-${Date.now()}`;
    const [order] = await db
      .insert(orders)
      .values({
        userId,
        orderNumber,
        totalAmount: String(amountPaid),
        discountAmount: "0",
        currency: payment.currency || "INR",
        status: "completed",
        razorpayOrderId,
        razorpayPaymentId,
      })
      .returning();

    if (product) {
      await db.insert(orderItems).values({
        orderId: order.id,
        productId: product.id,
        productName: product.name,
        price: String(amountPaid),
        quantity: 1,
        fileUrl: product.fileUrl || null,
      });
    }

    // Send magic link via Better Auth
    try {
      const callbackURL = `${BASE_URL}/dashboard/orders`;

      // Use Better Auth magic link API to generate and send the link
      await auth.api.signInMagicLink({
        body: { email, callbackURL },
        headers: new Headers({ "Content-Type": "application/json" }),
      });

      console.log(`[webhook] Magic link sent to ${email} for order ${orderNumber}`);
    } catch (emailErr) {
      console.error("[webhook] Failed to send magic link:", emailErr);
      // Fallback: send custom email with a direct link
      try {
        const magicLinkUrl = `${BASE_URL}/login?email=${encodeURIComponent(email)}`;
        await sendPurchaseConfirmationEmail({
          to: email,
          name: pending.name,
          productName: product?.name || "your product",
          amountPaid,
          currency: payment.currency || "INR",
          magicLinkUrl,
        });
      } catch (fallbackErr) {
        console.error("[webhook] Fallback email also failed:", fallbackErr);
      }
    }

    return;
  }

  // ── Authenticated checkout (update existing order) ────────────────────────
  await db
    .update(orders)
    .set({ status: "completed", razorpayPaymentId })
    .where(eq(orders.razorpayOrderId, razorpayOrderId));

  console.log("[webhook] Authenticated order marked completed:", razorpayOrderId);
}

async function handlePaymentFailed(event: any) {
  const payment = event.payload.payment.entity;
  console.log("Payment failed:", payment.id, payment.error_code);

  await db
    .update(pendingCheckouts)
    .set({ status: "failed" })
    .where(and(eq(pendingCheckouts.razorpayOrderId, payment.order_id), eq(pendingCheckouts.status, "pending")));
}
