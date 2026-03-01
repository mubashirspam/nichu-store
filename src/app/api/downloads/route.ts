import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Raw admin client that fully bypasses RLS (including storage)
function getStorageAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function GET(req: NextRequest) {
  try {
    // 1. Verify the user is authenticated
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Get the order item ID from query params
    const orderItemId = req.nextUrl.searchParams.get("orderItemId");

    if (!orderItemId) {
      return NextResponse.json({ error: "Missing orderItemId" }, { status: 400 });
    }

    // 3. Verify the order item belongs to this user AND the order is completed
    const { data: orderItem, error: itemError } = await supabase
      .from("order_items")
      .select(`
        id,
        file_url,
        product_name,
        order:orders!inner (
          id,
          user_id,
          status
        )
      `)
      .eq("id", orderItemId)
      .single();

    if (itemError || !orderItem) {
      return NextResponse.json({ error: "Order item not found" }, { status: 404 });
    }

    // Type-safe access to order
    const order = orderItem.order as any;

    // 4. Security checks
    if (order.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden: This order does not belong to you" }, { status: 403 });
    }

    if (order.status !== "completed") {
      return NextResponse.json({ error: "Forbidden: Payment not completed" }, { status: 403 });
    }

    if (!orderItem.file_url) {
      return NextResponse.json({ error: "No file available for this product" }, { status: 404 });
    }

    // 5. Generate a signed URL (60 seconds expiry) using raw admin client (bypasses RLS)
    const adminClient = getStorageAdminClient();
    const { data: signedUrlData, error: signedUrlError } = await adminClient.storage
      .from("products")
      .createSignedUrl(orderItem.file_url, 60); // 60 second expiry

    if (signedUrlError || !signedUrlData?.signedUrl) {
      console.error("Signed URL error:", signedUrlError);
      return NextResponse.json({ error: "Failed to generate download link" }, { status: 500 });
    }

    // 6. Redirect to the signed URL for download
    return NextResponse.redirect(signedUrlData.signedUrl);
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}
