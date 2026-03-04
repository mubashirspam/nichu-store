import { NextResponse } from "next/server";
import { auth, syncProfile } from "@/lib/auth";

export async function POST() {
  try {
    const { data: session } = await auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ synced: false });
    }

    const user = session.user;
    await syncProfile({
      id: user.id,
      email: user.email || "",
      name: user.name || undefined,
      image: user.image || null,
    });

    return NextResponse.json({ synced: true });
  } catch (error) {
    console.error("Error syncing profile:", error);
    return NextResponse.json({ error: "Failed to sync" }, { status: 500 });
  }
}
