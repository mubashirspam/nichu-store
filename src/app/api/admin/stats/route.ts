import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { orders, products, profiles } from "@/lib/db/schema";
import { eq, desc, count, sql } from "drizzle-orm";

export async function GET() {
  try {
    const { data: __session } = await auth.getSession(); const userId = __session?.user?.id;
    if (!userId || !(await isAdmin(userId))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [completedOrders, productCount, userCount, recentOrdersData] = await Promise.all([
      db.select({ totalAmount: orders.totalAmount }).from(orders).where(eq(orders.status, "completed")),
      db.select({ value: count() }).from(products),
      db.select({ value: count() }).from(profiles),
      db
        .select({
          id: orders.id,
          order_number: orders.orderNumber,
          total_amount: orders.totalAmount,
          status: orders.status,
          created_at: orders.createdAt,
          user_id: orders.userId,
        })
        .from(orders)
        .orderBy(desc(orders.createdAt))
        .limit(5),
    ]);

    const totalRevenue = completedOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);

    // Get emails for recent orders
    const recentOrders = [];
    for (const order of recentOrdersData) {
      const [profile] = await db
        .select({ email: profiles.email })
        .from(profiles)
        .where(eq(profiles.id, order.user_id))
        .limit(1);

      recentOrders.push({
        ...order,
        profiles: profile ? { email: profile.email } : null,
      });
    }

    return NextResponse.json({
      totalRevenue,
      totalOrders: completedOrders.length,
      totalProducts: productCount[0]?.value || 0,
      totalUsers: userCount[0]?.value || 0,
      recentOrders,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
