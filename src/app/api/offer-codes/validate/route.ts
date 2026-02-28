import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code, cartTotal } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "No code provided" }, { status: 400 });
    }

    const { data: offerCode, error } = await supabase
      .from("offer_codes")
      .select("*")
      .eq("code", code.toUpperCase())
      .eq("is_active", true)
      .single();

    if (error || !offerCode) {
      return NextResponse.json({ error: "Invalid offer code" }, { status: 404 });
    }

    // Check if user already used this code
    const { data: usage } = await supabase
      .from("offer_code_usage")
      .select("id")
      .eq("offer_code_id", (offerCode as any).id)
      .eq("user_id", user.id)
      .single();

    if (usage) {
      return NextResponse.json({ error: "You have already used this offer code" }, { status: 400 });
    }

    const oc = offerCode as any;

    // Check max uses
    if (oc.max_uses && oc.used_count >= oc.max_uses) {
      return NextResponse.json({ error: "This offer code has reached its maximum uses" }, { status: 400 });
    }

    // Check validity period
    const now = new Date();
    if (oc.valid_until && new Date(oc.valid_until) < now) {
      return NextResponse.json({ error: "This offer code has expired" }, { status: 400 });
    }

    // Calculate discount
    let discountAmount = 0;
    if (oc.discount_type === "percentage") {
      discountAmount = Math.round(((cartTotal || 0) * oc.discount_value) / 100);
    } else {
      discountAmount = oc.discount_value;
    }

    discountAmount = Math.min(discountAmount, cartTotal || 0);

    return NextResponse.json({
      valid: true,
      code: oc.code,
      discountType: oc.discount_type,
      discountValue: oc.discount_value,
      discountAmount,
      message: oc.discount_type === "percentage"
        ? `${oc.discount_value}% off applied!`
        : `₹${oc.discount_value} off applied!`,
    });
  } catch (error) {
    console.error("Error validating offer code:", error);
    return NextResponse.json({ error: "Failed to validate code" }, { status: 500 });
  }
}
