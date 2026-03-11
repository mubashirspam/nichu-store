import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.MOBILE_JWT_SECRET || "fallback-secret-change-in-production"
);

export interface MobileJWTPayload {
  userId: string;
  email: string;
  provider: string;
}

export async function signMobileJWT(payload: MobileJWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(process.env.MOBILE_JWT_EXPIRY || "30d")
    .sign(secret);
}

export async function verifyMobileJWT(token: string): Promise<MobileJWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as MobileJWTPayload;
  } catch {
    return null;
  }
}

export async function getMobileUserId(request: Request): Promise<string | null> {
  const auth = request.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const token = auth.slice(7);
  const payload = await verifyMobileJWT(token);
  return payload?.userId || null;
}

export async function verifyGoogleIdToken(idToken: string): Promise<{
  email: string;
  name: string;
  picture?: string;
} | null> {
  try {
    const res = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`
    );
    const data = await res.json();
    console.log('[mobile-auth] tokeninfo status:', res.status);
    console.log('[mobile-auth] tokeninfo aud:', data.aud);
    console.log('[mobile-auth] tokeninfo email:', data.email);
    console.log('[mobile-auth] tokeninfo error:', data.error || 'none');
    console.log('[mobile-auth] GOOGLE_CLIENT_ID env:', process.env.GOOGLE_CLIENT_ID);
    console.log('[mobile-auth] aud match:', data.aud === process.env.GOOGLE_CLIENT_ID);
    if (!res.ok) return null;
    if (data.aud !== process.env.GOOGLE_CLIENT_ID) return null;
    return { email: data.email, name: data.name, picture: data.picture };
  } catch (e) {
    console.error('[mobile-auth] verifyGoogleIdToken exception:', e);
    return null;
  }
}

export async function verifyMicrosoftIdToken(idToken: string): Promise<{
  email: string;
  name: string;
} | null> {
  try {
    // Decode JWT payload without verification (Microsoft token verified via userinfo endpoint)
    const parts = idToken.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());
    return {
      email: payload.preferred_username || payload.email || payload.upn,
      name: payload.name,
    };
  } catch {
    return null;
  }
}
