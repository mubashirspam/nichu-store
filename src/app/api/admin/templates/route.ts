import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId, isAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { masterTemplates, products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const userId = await getAuthUserId();
    if (!userId || !(await isAdmin(userId))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const templates = await db
      .select({
        id: masterTemplates.id,
        productId: masterTemplates.productId,
        provider: masterTemplates.provider,
        fileId: masterTemplates.fileId,
        fileUrl: masterTemplates.fileUrl,
        trackerType: masterTemplates.trackerType,
        version: masterTemplates.version,
        createdAt: masterTemplates.createdAt,
        product: { id: products.id, name: products.name },
      })
      .from(masterTemplates)
      .innerJoin(products, eq(masterTemplates.productId, products.id));

    return NextResponse.json(templates);
  } catch (error) {
    console.error("Admin templates GET error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthUserId();
    if (!userId || !(await isAdmin(userId))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { productId, provider, fileId, fileUrl, trackerType, version } = await request.json();
    if (!productId || !provider || !fileId || !trackerType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const [template] = await db
      .insert(masterTemplates)
      .values({ productId, provider, fileId, fileUrl, trackerType, version })
      .returning();

    return NextResponse.json(template);
  } catch (error) {
    console.error("Admin templates POST error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = await getAuthUserId();
    if (!userId || !(await isAdmin(userId))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id, fileId, fileUrl, trackerType, version } = await request.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    await db
      .update(masterTemplates)
      .set({ fileId, fileUrl, trackerType, version, updatedAt: new Date() })
      .where(eq(masterTemplates.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin templates PUT error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await getAuthUserId();
    if (!userId || !(await isAdmin(userId))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    await db.delete(masterTemplates).where(eq(masterTemplates.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin templates DELETE error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
