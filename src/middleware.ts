import { NextRequest, NextResponse } from "next/server";
import { betterFetch } from "@better-fetch/fetch";

interface Session {
  user?: { id: string; email: string };
}

const PROTECTED_PATHS = [
  "/cart",
  "/orders",
  "/admin",
  "/account",
  "/tracker",
  "/dashboard",
];

// Paths that must never require auth (even if they match a protected prefix)
const PUBLIC_API_PATTERNS = ["/api/webhooks/", "/api/auth/", "/api/checkout/", "/api/lp/"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip auth check for public API endpoints
  if (PUBLIC_API_PATTERNS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  // Check Better Auth session via its own API
  try {
    const { data: session } = await betterFetch<Session>("/api/auth/get-session", {
      baseURL: request.nextUrl.origin,
      headers: { cookie: request.headers.get("cookie") || "" },
    });

    if (session?.user?.id) return NextResponse.next();
  } catch {
    // Session fetch failed — treat as unauthenticated
  }

  // Redirect to login
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("callbackURL", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/cart/:path*",
    "/orders/:path*",
    "/admin/:path*",
    "/account/:path*",
    "/tracker/:path*",
    "/dashboard/:path*",
  ],
};
