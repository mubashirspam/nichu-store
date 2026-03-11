import { db } from "@/lib/db";
import { userCloudAccounts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { refreshGoogleToken } from "./google";
import { refreshMicrosoftToken } from "./microsoft";

export async function ensureValidToken(account: {
  id: string;
  provider: string;
  accessToken: string;
  refreshToken: string | null;
  tokenExpiresAt: Date | null;
}): Promise<string> {
  const now = new Date();
  const expiresAt = account.tokenExpiresAt;

  // If expires within 5 minutes, refresh
  if (expiresAt && expiresAt.getTime() - now.getTime() < 5 * 60 * 1000) {
    if (!account.refreshToken) throw new Error("No refresh token available");

    let refreshed: { accessToken: string; expiresAt: Date };

    if (account.provider === "google") {
      refreshed = await refreshGoogleToken(account.refreshToken);
    } else {
      refreshed = await refreshMicrosoftToken(account.refreshToken);
    }

    await db
      .update(userCloudAccounts)
      .set({
        accessToken: refreshed.accessToken,
        tokenExpiresAt: refreshed.expiresAt,
        updatedAt: new Date(),
      })
      .where(eq(userCloudAccounts.id, account.id));

    return refreshed.accessToken;
  }

  return account.accessToken;
}

export function getGoogleAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
    response_type: "code",
    scope: [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive.file",
      "email",
      "profile",
    ].join(" "),
    access_type: "offline",
    prompt: "consent",
    state,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export async function exchangeGoogleCode(code: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  email: string;
}> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
      grant_type: "authorization_code",
    }),
  });

  if (!res.ok) throw new Error(`Google code exchange failed: ${await res.text()}`);
  const data = await res.json();

  // Get user email
  const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${data.access_token}` },
  });
  const user = await userRes.json();

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: new Date(Date.now() + data.expires_in * 1000),
    email: user.email,
  };
}

export function getMicrosoftAuthUrl(state: string): string {
  const tenantId = process.env.MICROSOFT_TENANT_ID || "common";
  const params = new URLSearchParams({
    client_id: process.env.MICROSOFT_CLIENT_ID!,
    redirect_uri: process.env.MICROSOFT_REDIRECT_URI!,
    response_type: "code",
    scope: "https://graph.microsoft.com/Files.ReadWrite https://graph.microsoft.com/User.Read offline_access",
    state,
  });

  return `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?${params}`;
}

export async function exchangeMicrosoftCode(code: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  email: string;
}> {
  const tenantId = process.env.MICROSOFT_TENANT_ID || "common";
  const res = await fetch(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.MICROSOFT_CLIENT_ID!,
        client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
        redirect_uri: process.env.MICROSOFT_REDIRECT_URI!,
        grant_type: "authorization_code",
        scope: "https://graph.microsoft.com/Files.ReadWrite https://graph.microsoft.com/User.Read offline_access",
      }),
    }
  );

  if (!res.ok) throw new Error(`Microsoft code exchange failed: ${await res.text()}`);
  const data = await res.json();

  const userRes = await fetch("https://graph.microsoft.com/v1.0/me", {
    headers: { Authorization: `Bearer ${data.access_token}` },
  });
  const user = await userRes.json();

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: new Date(Date.now() + data.expires_in * 1000),
    email: user.mail || user.userPrincipalName,
  };
}
