import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Razorpay from "razorpay";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { items, offerCode } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }

    // Fetch products from database to get real prices
    const productIds = items.map((item: { product_id: string }) => item.product_id);
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("*")
      .in("id", productIds)
      .eq("is_active", true);

    if (productsError || !products || products.length === 0) {
      return NextResponse.json({ error: "Products not found" }, { status: 400 });
    }

    // Calculate total from DB prices (not client-submitted prices)
    let totalAmount = products.reduce((sum, product) => sum + Number(product.price), 0);
    let discountAmount = 0;
    let offerCodeId: string | null = null;

    // Apply offer code if provided
    if (offerCode) {
      const { data: code } = await supabase
        .from("offer_codes")
        .select("*")
        .eq("code", offerCode.toUpperCase())
        .eq("is_active", true)
        .single();

      if (code) {
        // Check if user already used this code
        const { data: usage } = await supabase
          .from("offer_code_usage")
          .select("id")
          .eq("offer_code_id", code.id)
          .eq("user_id", user.id)
          .single();

        if (usage) {
          return NextResponse.json({ error: "You have already used this offer code" }, { status: 400 });
        }

        // Check max uses
        if (code.max_uses && code.used_count >= code.max_uses) {
          return NextResponse.json({ error: "This offer code has reached its maximum uses" }, { status: 400 });
        }

        // Check validity period
        const now = new Date();
        if (code.valid_until && new Date(code.valid_until) < now) {
          return NextResponse.json({ error: "This offer code has expired" }, { status: 400 });
        }

        // Calculate discount
        if (code.discount_type === "percentage") {
          discountAmount = Math.round((totalAmount * Number(code.discount_value)) / 100);
        } else {
          discountAmount = Number(code.discount_value);
        }

        discountAmount = Math.min(discountAmount, totalAmount);
        totalAmount = totalAmount - discountAmount;
        offerCodeId = code.id;
      } else {
        return NextResponse.json({ error: "Invalid offer code" }, { status: 400 });
      }
    }

    // Ensure minimum amount for Razorpay (₹1)
    totalAmount = Math.max(totalAmount, 1);

    // Generate order number
    const orderNumber = `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Create Razorpay order
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100), // paise
      currency: "INR",
      receipt: orderNumber,
      notes: {
        userId: user.id,
        orderNumber,
      },
    });

    // Create order in database
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        order_number: orderNumber,
        total_amount: totalAmount,
        currency: "INR",
        razorpay_order_id: razorpayOrder.id,
        offer_code_id: offerCodeId,
        discount_amount: discountAmount,
        status: "pending",
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error("Order creation error:", orderError);
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }

    // Create order items
    const orderItems = products.map((product) => ({
      order_id: order.id,
      product_id: product.id,
      product_name: product.name,
      price: Number(product.price),
      quantity: 1,
      file_url: product.file_url,
    }));

    await supabase.from("order_items").insert(orderItems);

    return NextResponse.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      dbOrderId: order.id,
      orderNumber: order.order_number,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
