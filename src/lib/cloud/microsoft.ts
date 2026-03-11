import type { ClonedFile } from "./types";

const GRAPH_API = "https://graph.microsoft.com/v1.0";

async function pollForCopyCompletion(
  accessToken: string,
  monitorUrl: string
): Promise<{ id: string; webUrl: string }> {
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    const res = await fetch(monitorUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json();
    if (data.status === "completed") return data.resourceId;
    if (data.status === "failed") throw new Error("OneDrive copy failed");
  }
  throw new Error("OneDrive copy timed out");
}

export async function cloneOneDriveFile(
  accessToken: string,
  templateItemId: string,
  newName: string
): Promise<ClonedFile> {
  const res = await fetch(
    `${GRAPH_API}/me/drive/items/${templateItemId}/copy`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: newName }),
    }
  );

  if (!res.ok) throw new Error(`OneDrive copy failed: ${await res.text()}`);

  const location = res.headers.get("Location");
  if (!location) throw new Error("No monitor URL from OneDrive copy");

  const file = await pollForCopyCompletion(accessToken, location);
  return { id: file.id, webViewLink: file.webUrl };
}

export async function appendToExcel(
  accessToken: string,
  itemId: string,
  worksheetName: string,
  rows: unknown[][]
): Promise<void> {
  const rangeRes = await fetch(
    `${GRAPH_API}/me/drive/items/${itemId}/workbook/worksheets/${worksheetName}/usedRange`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  const usedRange = await rangeRes.json();
  const nextRow = (usedRange.rowCount || 0) + 1;
  const colLetter = String.fromCharCode(64 + (rows[0] as unknown[]).length);
  const range = `A${nextRow}:${colLetter}${nextRow + rows.length - 1}`;

  await fetch(
    `${GRAPH_API}/me/drive/items/${itemId}/workbook/worksheets/${worksheetName}/range(address='${range}')`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ values: rows }),
    }
  );
}

export async function readExcelRange(
  accessToken: string,
  itemId: string,
  worksheetName: string,
  range: string
): Promise<unknown[][]> {
  const res = await fetch(
    `${GRAPH_API}/me/drive/items/${itemId}/workbook/worksheets/${worksheetName}/range(address='${range}')`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!res.ok) throw new Error(`Excel read failed: ${await res.text()}`);
  const data = await res.json();
  return data.values || [];
}

export async function refreshMicrosoftToken(refreshToken: string): Promise<{
  accessToken: string;
  expiresAt: Date;
}> {
  const tenantId = process.env.MICROSOFT_TENANT_ID || "common";
  const res = await fetch(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.MICROSOFT_CLIENT_ID!,
        client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
        scope: "https://graph.microsoft.com/Files.ReadWrite https://graph.microsoft.com/User.Read offline_access",
      }),
    }
  );

  if (!res.ok) throw new Error(`Microsoft token refresh failed: ${await res.text()}`);
  const data = await res.json();
  return {
    accessToken: data.access_token,
    expiresAt: new Date(Date.now() + data.expires_in * 1000),
  };
}
