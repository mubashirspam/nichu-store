import crypto from "crypto";

function getSecret(): string {
  return (process.env.BETTER_AUTH_SECRET || process.env.NEON_AUTH_COOKIE_SECRET || "fallback-secret").slice(0, 32).padEnd(32, "0");
}

/** Encrypt orderItemId to create a secure download token */
export function encryptToken(orderItemId: string): string {
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(getSecret()), Buffer.alloc(16, 0));
  let encrypted = cipher.update(orderItemId, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

/** Decrypt token to get orderItemId */
export function decryptToken(token: string): string {
  const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(getSecret()), Buffer.alloc(16, 0));
  let decrypted = decipher.update(token, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
