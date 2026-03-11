import type { ClonedFile } from "./types";

const SHEETS_API = "https://sheets.googleapis.com/v4/spreadsheets";
const DRIVE_API = "https://www.googleapis.com/drive/v3";

export async function cloneGoogleSheet(
  accessToken: string,
  templateFileId: string,
  newName: string
): Promise<ClonedFile> {
  const res = await fetch(`${DRIVE_API}/files/${templateFileId}/copy`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: newName }),
  });

  if (!res.ok) throw new Error(`Google Drive copy failed: ${await res.text()}`);

  const file = await res.json();
  return {
    id: file.id,
    webViewLink: `https://docs.google.com/spreadsheets/d/${file.id}`,
  };
}

export async function appendToGoogleSheet(
  accessToken: string,
  spreadsheetId: string,
  sheetName: string,
  rows: unknown[][]
): Promise<void> {
  const range = `${sheetName}!A:Z`;
  const res = await fetch(
    `${SHEETS_API}/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ values: rows }),
    }
  );

  if (!res.ok) throw new Error(`Google Sheets append failed: ${await res.text()}`);
}

export async function readGoogleSheetRange(
  accessToken: string,
  spreadsheetId: string,
  range: string
): Promise<unknown[][]> {
  const res = await fetch(
    `${SHEETS_API}/${spreadsheetId}/values/${encodeURIComponent(range)}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!res.ok) throw new Error(`Google Sheets read failed: ${await res.text()}`);

  const data = await res.json();
  return data.values || [];
}

export async function refreshGoogleToken(refreshToken: string): Promise<{
  accessToken: string;
  expiresAt: Date;
}> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) throw new Error(`Google token refresh failed: ${await res.text()}`);

  const data = await res.json();
  return {
    accessToken: data.access_token,
    expiresAt: new Date(Date.now() + data.expires_in * 1000),
  };
}
