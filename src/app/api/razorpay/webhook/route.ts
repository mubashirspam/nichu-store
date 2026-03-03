import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      console.error("No signature found in webhook request");
      return NextResponse.json(
        { error: "No signature provided" },
        { status: 400 }
      );
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("RAZORPAY_WEBHOOK_SECRET not configured");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.error("Webhook signature verification failed");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    const event = JSON.parse(body);
    const eventType = event.event;

    console.log(`Webhook received: ${eventType}`, {
      paymentId: event.payload?.payment?.entity?.id,
      orderId: event.payload?.payment?.entity?.order_id,
      amount: event.payload?.payment?.entity?.amount,
    });

    switch (eventType) {
      case "payment.authorized":
        await handlePaymentAuthorized(event);
        break;

      case "payment.captured":
        await handlePaymentCaptured(event);
        break;

      case "payment.failed":
        await handlePaymentFailed(event);
        break;

      case "order.paid":
        await handleOrderPaid(event);
        break;

      case "refund.created":
        await handleRefundCreated(event);
        break;

      case "refund.processed":
        await handleRefundProcessed(event);
        break;

      default:
        console.log(`Unhandled webhook event: ${eventType}`);
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handlePaymentAuthorized(event: any) {
  const payment = event.payload.payment.entity;
  console.log("Payment authorized:", {
    id: payment.id,
    orderId: payment.order_id,
    amount: payment.amount / 100,
    email: payment.email,
    contact: payment.contact,
  });

  // TODO: Update database - mark payment as authorized
  // TODO: Send confirmation email to customer
}

async function handlePaymentCaptured(event: any) {
  const payment = event.payload.payment.entity;
  console.log("Payment captured:", {
    id: payment.id,
    orderId: payment.order_id,
    amount: payment.amount / 100,
    status: payment.status,
  });

  try {
    await db
      .update(orders)
      .set({
        status: "completed",
        razorpayPaymentId: payment.id,
      })
      .where(eq(orders.razorpayOrderId, payment.order_id));

    console.log("Order marked as completed:", payment.order_id);
  } catch (error) {
    console.error("Error in handlePaymentCaptured:", error);
  }
}

async function handlePaymentFailed(event: any) {
  const payment = event.payload.payment.entity;
  console.log("Payment failed:", {
    id: payment.id,
    orderId: payment.order_id,
    errorCode: payment.error_code,
    errorDescription: payment.error_description,
  });

  // TODO: Update database - mark payment as failed
  // TODO: Send failure notification email (optional)
  // TODO: Log for analytics
}

async function handleOrderPaid(event: any) {
  const order = event.payload.order.entity;
  console.log("Order paid:", {
    id: order.id,
    amount: order.amount / 100,
    amountPaid: order.amount_paid / 100,
    status: order.status,
  });

  // TODO: Update database - mark order as paid
  // TODO: Trigger fulfillment process
}

async function handleRefundCreated(event: any) {
  const refund = event.payload.refund.entity;
  console.log("Refund created:", {
    id: refund.id,
    paymentId: refund.payment_id,
    amount: refund.amount / 100,
    status: refund.status,
  });

  // TODO: Update database - create refund record
  // TODO: Send refund initiated email
}

async function handleRefundProcessed(event: any) {
  const refund = event.payload.refund.entity;
  console.log("Refund processed:", {
    id: refund.id,
    paymentId: refund.payment_id,
    amount: refund.amount / 100,
    status: refund.status,
  });

  // TODO: Update database - mark refund as processed
  // TODO: Send refund confirmation email
}
