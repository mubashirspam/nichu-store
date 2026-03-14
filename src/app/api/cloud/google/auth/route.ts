import { NextResponse } from "next/server";
import { getAuthUserId, isAdmin } from "@/lib/auth";
import { getGoogleAuthUrl } from "@/lib/cloud";

export async function GET() {
  const userId = await getAuthUserId(); // TODO: verify usage below
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const state = Buffer.from(JSON.stringify({ userId: userId })).toString("base64");
  const url = getGoogleAuthUrl(state);

  return NextResponse.redirect(url);
}
