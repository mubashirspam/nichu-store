/**
 * Email helpers — uses Resend for delivery.
 * Called by Better Auth's magicLink plugin and directly from webhook.
 */
import { getResendClient } from "@/lib/resend";

const FROM = process.env.EMAIL_FROM || "NichuStore <noreply@nichustore.com>";

/** Called by Better Auth magic link plugin */
export async function sendMagicLinkEmail({ to, url }: { to: string; url: string }) {
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0b0d11;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#e5e7eb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:40px auto;background:#111318;border-radius:16px;border:1px solid rgba(255,255,255,0.06);">
    <tr>
      <td style="padding:40px 40px 24px;text-align:center;">
        <div style="width:48px;height:48px;background:linear-gradient(135deg,#7c3aed,#4f46e5);border-radius:12px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:20px;font-size:22px;">✨</div>
        <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#fff;">Your Access Link</h1>
        <p style="margin:0;color:#9ca3af;font-size:14px;">Click the button below to sign in. This link is valid for 48 hours.</p>
      </td>
    </tr>
    <tr>
      <td style="padding:0 40px 32px;text-align:center;">
        <a href="${url}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#fff;font-weight:700;font-size:15px;padding:14px 32px;border-radius:10px;text-decoration:none;">
          Sign In to NichuStore →
        </a>
        <p style="margin:20px 0 0;font-size:11px;color:#4b5563;">
          Or copy this link: <span style="color:#7c3aed;word-break:break-all;">${url}</span>
        </p>
        <p style="margin:12px 0 0;font-size:11px;color:#374151;">
          This link expires in 48 hours and can only be used once.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;

  if (!process.env.RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY not set — magic link URL:", url);
    return;
  }

  const resend = getResendClient();
  await resend.emails.send({ from: FROM, to, subject: "Your NichuStore access link", html });
}

/** Download link email — called from webhook after guest payment */
export async function sendDownloadLinkEmail({
  to,
  name,
  productName,
  amountPaid,
  currency,
  downloadUrl,
}: {
  to: string;
  name: string;
  productName: string;
  amountPaid: number;
  currency: string;
  downloadUrl: string;
}) {
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0b0d11;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#e5e7eb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:40px auto;background:#111318;border-radius:16px;border:1px solid rgba(255,255,255,0.06);">
    <tr>
      <td style="padding:40px 40px 24px;text-align:center;">
        <div style="font-size:36px;margin-bottom:16px;">🎉</div>
        <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#fff;">Payment Confirmed!</h1>
        <p style="margin:0;color:#9ca3af;font-size:14px;">Hi ${name}, your purchase is ready to download.</p>
      </td>
    </tr>
    <tr>
      <td style="padding:0 40px 16px;">
        <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:18px;">
          <p style="margin:0 0 4px;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:.08em;">Product</p>
          <p style="margin:0 0 8px;font-size:16px;font-weight:600;color:#fff;">${productName}</p>
          <p style="margin:0;font-size:13px;color:#10b981;">Amount Paid: ${currency} ${amountPaid}</p>
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding:0 40px 32px;text-align:center;">
        <p style="margin:0 0 16px;font-size:14px;color:#d1d5db;">Click below to download your product.</p>
        <a href="${downloadUrl}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#fff;font-weight:700;font-size:15px;padding:14px 32px;border-radius:10px;text-decoration:none;">
          Download Now →
        </a>
        <p style="margin:16px 0 0;font-size:11px;color:#4b5563;">
          Link: <span style="color:#7c3aed;word-break:break-all;">${downloadUrl}</span>
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:16px 40px;border-top:1px solid rgba(255,255,255,0.04);text-align:center;">
        <p style="margin:0;font-size:11px;color:#374151;">© ${new Date().getFullYear()} NichuStore · Questions? support@marketingnizam.com</p>
      </td>
    </tr>
  </table>
</body>
</html>`;

  if (!process.env.RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY not set — download URL:", downloadUrl);
    return;
  }

  const resend = getResendClient();
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Your ${productName} is ready to download 🎉`,
    html,
  });
}

/** Rich purchase confirmation email — called from webhook after payment */
export async function sendPurchaseConfirmationEmail({
  to,
  name,
  productName,
  amountPaid,
  currency,
  magicLinkUrl,
}: {
  to: string;
  name: string;
  productName: string;
  amountPaid: number;
  currency: string;
  magicLinkUrl: string;
}) {
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0b0d11;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#e5e7eb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:40px auto;background:#111318;border-radius:16px;border:1px solid rgba(255,255,255,0.06);">
    <tr>
      <td style="padding:40px 40px 24px;text-align:center;">
        <div style="font-size:36px;margin-bottom:16px;">🎉</div>
        <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#fff;">Payment Confirmed!</h1>
        <p style="margin:0;color:#9ca3af;font-size:14px;">Hi ${name}, your purchase is ready.</p>
      </td>
    </tr>
    <tr>
      <td style="padding:0 40px 16px;">
        <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:18px;">
          <p style="margin:0 0 4px;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:.08em;">Product</p>
          <p style="margin:0 0 8px;font-size:16px;font-weight:600;color:#fff;">${productName}</p>
          <p style="margin:0;font-size:13px;color:#10b981;">Amount Paid: ${currency} ${amountPaid}</p>
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding:0 40px 32px;text-align:center;">
        <p style="margin:0 0 16px;font-size:14px;color:#d1d5db;">Click below to access your product. Link valid for 48 hours.</p>
        <a href="${magicLinkUrl}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#fff;font-weight:700;font-size:15px;padding:14px 32px;border-radius:10px;text-decoration:none;">
          Access Your Product →
        </a>
        <p style="margin:16px 0 0;font-size:11px;color:#4b5563;">
          Link: <span style="color:#7c3aed;word-break:break-all;">${magicLinkUrl}</span>
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:16px 40px;border-top:1px solid rgba(255,255,255,0.04);text-align:center;">
        <p style="margin:0;font-size:11px;color:#374151;">© ${new Date().getFullYear()} NichuStore · One-time use link · Expires in 48h</p>
      </td>
    </tr>
  </table>
</body>
</html>`;

  if (!process.env.RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY not set — magic link URL:", magicLinkUrl);
    return;
  }

  const resend = getResendClient();
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Your ${productName} is ready 🎉`,
    html,
  });
}
