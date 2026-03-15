import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { offerCodes, offerCodeUsage } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthUserId(); // null for guests — that's OK
    const { code, cartTotal } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "No code provided" }, { status: 400 });
    }

    const [oc] = await db
      .select()
      .from(offerCodes)
      .where(and(eq(offerCodes.code, code.toUpperCase()), eq(offerCodes.isActive, true)))
      .limit(1);

    if (!oc) {
      return NextResponse.json({ error: "Invalid offer code" }, { status: 404 });
    }

    // Authorized-only codes require a logged-in user
    if (oc.requiresAuth && !userId) {
      return NextResponse.json({ error: "Please sign in to use this offer code" }, { status: 401 });
    }

    // Per-user duplicate check (only for logged-in users)
    if (userId) {
      const [usage] = await db
        .select({ id: offerCodeUsage.id })
        .from(offerCodeUsage)
        .where(and(eq(offerCodeUsage.offerCodeId, oc.id), eq(offerCodeUsage.userId, userId)))
        .limit(1);

      if (usage) {
        return NextResponse.json({ error: "You have already used this offer code" }, { status: 400 });
      }
    }

    if (oc.maxUses && oc.usedCount >= oc.maxUses) {
      return NextResponse.json({ error: "This offer code has reached its maximum uses" }, { status: 400 });
    }

    if (oc.validUntil && new Date(oc.validUntil) < new Date()) {
      return NextResponse.json({ error: "This offer code has expired" }, { status: 400 });
    }

    const discountValue = Number(oc.discountValue);
    let discountAmount = 0;
    if (oc.discountType === "percentage") {
      discountAmount = Math.round(((cartTotal || 0) * discountValue) / 100);
    } else {
      discountAmount = discountValue;
    }
    discountAmount = Math.min(discountAmount, cartTotal || 0);

    return NextResponse.json({
      valid: true,
      id: oc.id,
      code: oc.code,
      discountType: oc.discountType,
      discountValue,
      discountAmount,
      requiresAuth: oc.requiresAuth,
      message: oc.discountType === "percentage"
        ? `${discountValue}% off applied!`
        : `₹${discountValue} off applied!`,
    });
  } catch (error) {
    console.error("Error validating offer code:", error);
    return NextResponse.json({ error: "Failed to validate code" }, { status: 500 });
  }
}
