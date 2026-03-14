import { NextRequest, NextResponse } from "next/server";
import { betterFetch } from "@better-fetch/fetch";

interface Session {
  user?: { id: string; email: string };
}

// Paths that require a logged-in user
const USER_PROTECTED = ["/orders", "/account", "/tracker", "/dashboard"];

// Admin paths require login (redirects to /admin/login)
const ADMIN_PREFIX = "/admin";

// Paths that must never require auth
const PUBLIC_API_PATTERNS = ["/api/webhooks/", "/api/auth/", "/api/checkout/", "/api/lp/", "/api/products"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip auth check for public API endpoints
  if (PUBLIC_API_PATTERNS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Admin login page itself is public
  if (pathname === "/admin/login") return NextResponse.next();

  const isUserProtected = USER_PROTECTED.some((p) => pathname.startsWith(p));
  const isAdmin = pathname.startsWith(ADMIN_PREFIX);

  if (!isUserProtected && !isAdmin) return NextResponse.next();

  // Check Better Auth session via its own API
  let session: Session | null = null;
  try {
    const { data } = await betterFetch<Session>("/api/auth/get-session", {
      baseURL: request.nextUrl.origin,
      headers: { cookie: request.headers.get("cookie") || "" },
    });
    session = data;
  } catch {
    // Session fetch failed — treat as unauthenticated
  }

  if (session?.user?.id) return NextResponse.next();

  // Redirect: admin routes → /admin/login, user routes → /login
  if (isAdmin) {
    const adminLoginUrl = new URL("/admin/login", request.url);
    adminLoginUrl.searchParams.set("callbackURL", pathname);
    return NextResponse.redirect(adminLoginUrl);
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("callbackURL", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/orders/:path*",
    "/admin/:path*",
    "/account/:path*",
    "/tracker/:path*",
    "/dashboard/:path*",
  ],
};
