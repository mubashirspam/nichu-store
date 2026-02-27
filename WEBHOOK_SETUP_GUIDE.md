# 🔔 Razorpay Webhook Setup Guide

Complete step-by-step guide to configure Razorpay webhooks for your fitness tracker store.

---

## 📋 What are Webhooks?

Webhooks are automated notifications sent by Razorpay to your server when payment events occur (payment success, failure, refund, etc.). They provide:

✅ **Real-time updates** — Know instantly when payments succeed/fail  
✅ **Reliability** — Backup if user closes browser before redirect  
✅ **Automation** — Trigger emails, database updates, fulfillment  
✅ **Security** — Server-side verification of all transactions  

---

## 🚀 Step-by-Step Setup

### Step 1: Get Your Webhook URL

Your webhook URL will be:

**For Development (Testing):**
```
https://your-ngrok-url.ngrok.io/api/razorpay/webhook
```

**For Production (Live):**
```
https://app.marketingnizam.com/api/razorpay/webhook
```

⚠️ **Important:** 
- Razorpay requires HTTPS (not HTTP)
- For local testing, use **ngrok** or **localtunnel** to expose your localhost
- Production URL will be your deployed Vercel/Netlify domain

---

### Step 2: Set Up ngrok for Local Testing (Optional)

If you want to test webhooks locally:

1. **Install ngrok:**
   ```bash
   # macOS
   brew install ngrok
   
   # Or download from: https://ngrok.com/download
   ```

2. **Start your Next.js dev server:**
   ```bash
   npm run dev
   ```

3. **In a new terminal, start ngrok:**
   ```bash
   ngrok http 3001
   ```

4. **Copy the HTTPS URL** (looks like `https://abc123.ngrok.io`)

5. **Your webhook URL will be:**
   ```
   https://abc123.ngrok.io/api/razorpay/webhook
   ```

---

### Step 3: Configure Webhook in Razorpay Dashboard

1. **Go to Razorpay Dashboard:**
   - Visit: https://dashboard.razorpay.com/app/webhooks

2. **Click "Add New Webhook"**

3. **Enter Webhook Details:**

   **Webhook URL:**
   ```
   https://your-domain.com/api/razorpay/webhook
   ```
   
   **Alert Email (Optional):**
   ```
   your-email@example.com
   ```
   
   **Secret (Auto-generated):**
   - Razorpay will generate this for you
   - Copy it immediately (you'll need it for `.env.local`)

4. **Select Active Events** (Check all these):

   #### ✅ Payment Events (REQUIRED)
   - [x] `payment.authorized` — Payment authorized (card charged)
   - [x] `payment.captured` — Payment captured successfully
   - [x] `payment.failed` — Payment failed

   #### ✅ Order Events (RECOMMENDED)
   - [x] `order.paid` — Order fully paid

   #### ✅ Refund Events (RECOMMENDED)
   - [x] `refund.created` — Refund initiated
   - [x] `refund.processed` — Refund completed
   - [x] `refund.failed` — Refund failed

   #### 📊 Optional Events (For Advanced Use)
   - [ ] `payment.pending` — Payment pending
   - [ ] `payment.dispute.created` — Customer disputed payment
   - [ ] `settlement.processed` — Money settled to your account
   - [ ] `virtual_account.credited` — Virtual account credited

5. **Click "Create Webhook"**

6. **Copy the Webhook Secret** — You'll see it only once!

---

### Step 4: Add Webhook Secret to Environment Variables

1. **Open your `.env.local` file**

2. **Add the webhook secret:**
   ```bash
   RAZORPAY_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE
   ```

3. **Your complete `.env.local` should look like:**
   ```bash
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXX
   RAZORPAY_KEY_SECRET=YOUR_SECRET_KEY_HERE
   RAZORPAY_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
   NEXT_PUBLIC_APP_URL=http://localhost:3001
   ```

4. **Restart your dev server:**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

---

### Step 5: Test Your Webhook

1. **Make a test payment** using test card:
   ```
   Card: 4111 1111 1111 1111
   CVV: Any 3 digits
   Expiry: Any future date
   ```

2. **Check your server logs** — You should see:
   ```
   Webhook received: payment.authorized
   Webhook received: payment.captured
   ```

3. **Verify in Razorpay Dashboard:**
   - Go to: https://dashboard.razorpay.com/app/webhooks
   - Click on your webhook
   - Check "Recent Deliveries" tab
   - Status should be **200 OK** (green)

---

## 🔒 Security Features Implemented

✅ **HMAC SHA256 Signature Verification** — Every webhook is verified  
✅ **Secret Key Validation** — Only Razorpay can trigger webhooks  
✅ **Request Body Validation** — Prevents tampering  
✅ **Error Logging** — All failures logged for debugging  

---

## 📊 Webhook Event Handlers

The webhook route (`/api/razorpay/webhook/route.ts`) handles these events:

### `payment.authorized`
- **When:** Payment is authorized (card charged)
- **Action:** Log payment, update database
- **TODO:** Send confirmation email

### `payment.captured`
- **When:** Payment successfully captured
- **Action:** Mark order as complete
- **TODO:** Send download link email, generate invoice

### `payment.failed`
- **When:** Payment failed
- **Action:** Log failure reason
- **TODO:** Send failure notification (optional)

### `order.paid`
- **When:** Order fully paid
- **Action:** Trigger fulfillment
- **TODO:** Update inventory, send receipt

### `refund.created`
- **When:** Refund initiated
- **Action:** Create refund record
- **TODO:** Send refund initiated email

### `refund.processed`
- **When:** Refund completed
- **Action:** Mark refund as complete
- **TODO:** Send refund confirmation email

---

## 🛠️ Customizing Webhook Handlers

Edit `/src/app/api/razorpay/webhook/route.ts` to add your logic:

```typescript
async function handlePaymentCaptured(event: any) {
  const payment = event.payload.payment.entity;
  
  // 1. Update database
  await db.orders.update({
    where: { razorpayOrderId: payment.order_id },
    data: { status: 'completed', paymentId: payment.id }
  });
  
  // 2. Send download email
  await sendEmail({
    to: payment.email,
    subject: 'Your Fitness Tracker Download Link',
    template: 'download-link',
    data: {
      productName: payment.notes.productName,
      downloadUrl: generateDownloadUrl(payment.id)
    }
  });
  
  // 3. Log analytics
  await analytics.track('purchase_completed', {
    productId: payment.notes.productId,
    amount: payment.amount / 100,
    email: payment.email
  });
}
```

---

## 🧪 Testing Webhooks

### Method 1: Razorpay Dashboard (Recommended)

1. Go to: https://dashboard.razorpay.com/app/webhooks
2. Click on your webhook
3. Click "Send Test Webhook"
4. Select event type (e.g., `payment.captured`)
5. Click "Send"
6. Check your server logs

### Method 2: Real Test Payment

1. Use test card: `4111 1111 1111 1111`
2. Complete payment
3. Check webhook delivery in dashboard
4. Verify logs in your terminal

### Method 3: cURL (Advanced)

```bash
curl -X POST https://your-domain.com/api/razorpay/webhook \
  -H "Content-Type: application/json" \
  -H "x-razorpay-signature: YOUR_SIGNATURE" \
  -d '{"event":"payment.captured","payload":{"payment":{"entity":{"id":"pay_test123"}}}}'
```

---

## 🐛 Troubleshooting

### Webhook returns 400/500 error

**Check:**
- Is `RAZORPAY_WEBHOOK_SECRET` set in `.env.local`?
- Did you restart server after adding the secret?
- Is the webhook URL correct (HTTPS)?

**Solution:**
```bash
# Verify environment variable
echo $RAZORPAY_WEBHOOK_SECRET

# Restart server
npm run dev
```

### Signature verification fails

**Check:**
- Webhook secret matches Razorpay dashboard
- No extra spaces in `.env.local`
- Using the correct webhook (not mixing test/live)

**Debug:**
```typescript
// Add to webhook route temporarily
console.log('Received signature:', signature);
console.log('Expected signature:', expectedSignature);
console.log('Webhook secret:', webhookSecret);
```

### Webhooks not received

**Check:**
- Server is running and accessible
- Webhook URL is HTTPS (use ngrok for local)
- Events are enabled in Razorpay dashboard
- Firewall/security not blocking Razorpay IPs

**Razorpay Webhook IPs (Whitelist these):**
```
52.66.145.106
52.66.145.107
52.66.145.108
```

### ngrok session expired

**Issue:** Free ngrok URLs expire after 2 hours

**Solution:**
- Restart ngrok: `ngrok http 3001`
- Update webhook URL in Razorpay dashboard
- Or use ngrok paid plan for static URLs

---

## 🚀 Production Deployment

### Vercel Deployment

1. **Deploy to Vercel:**
   ```bash
   vercel --prod
   ```

2. **Add environment variables in Vercel:**
   - Go to: Project Settings → Environment Variables
   - Add:
     - `NEXT_PUBLIC_RAZORPAY_KEY_ID`
     - `RAZORPAY_KEY_SECRET`
     - `RAZORPAY_WEBHOOK_SECRET`

3. **Update webhook URL in Razorpay:**
   ```
   https://app.marketingnizam.com/api/razorpay/webhook
   ```

4. **Test with live keys:**
   - Switch to `rzp_live_` keys
   - Create new webhook for production
   - Test with small real payment (₹1)

---

## 📧 Next Steps: Email Integration

After webhook setup, integrate email service:

### Recommended: Resend

```bash
npm install resend
```

```typescript
// In webhook handler
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function handlePaymentCaptured(event: any) {
  const payment = event.payload.payment.entity;
  
  await resend.emails.send({
    from: 'Nizam Store <orders@marketingnizam.com>',
    to: payment.email,
    subject: 'Your Fitness Tracker Download Link',
    html: `
      <h1>Thank you for your purchase!</h1>
      <p>Download your ${payment.notes.productName}:</p>
      <a href="https://app.marketingnizam.com/download/${payment.id}">
        Download Now
      </a>
    `
  });
}
```

---

## 📊 Monitoring & Logs

### View Webhook Logs in Razorpay

1. Go to: https://dashboard.razorpay.com/app/webhooks
2. Click on your webhook
3. Check "Recent Deliveries" tab
4. See status, response, retry attempts

### Server Logs

All webhook events are logged to console:
```
Webhook received: payment.captured
Payment captured: {
  id: 'pay_123',
  orderId: 'order_456',
  amount: 299,
  status: 'captured'
}
```

### Production Logging (Recommended)

Use a logging service:
- **Sentry** — Error tracking
- **LogRocket** — Session replay
- **Datadog** — Full observability

---

## ✅ Webhook Setup Checklist

- [ ] Created webhook in Razorpay dashboard
- [ ] Copied webhook secret
- [ ] Added `RAZORPAY_WEBHOOK_SECRET` to `.env.local`
- [ ] Restarted dev server
- [ ] Enabled required events (payment.*, order.*, refund.*)
- [ ] Tested with test payment
- [ ] Verified webhook delivery (200 OK)
- [ ] Checked server logs
- [ ] Customized event handlers (optional)
- [ ] Set up email delivery (recommended)
- [ ] Deployed to production
- [ ] Updated webhook URL for production
- [ ] Tested with live payment

---

## 📚 Resources

- [Razorpay Webhooks Documentation](https://razorpay.com/docs/webhooks/)
- [Webhook Events Reference](https://razorpay.com/docs/webhooks/payloads/)
- [Webhook Signature Verification](https://razorpay.com/docs/webhooks/validate-test/)
- [ngrok Documentation](https://ngrok.com/docs)

---

## 🆘 Need Help?

**Common Issues:**
- Signature mismatch → Check webhook secret
- 404 error → Verify webhook URL path
- Timeout → Check server is running

**Contact:** support@marketingnizam.com

---

**Your webhook is now ready to receive real-time payment notifications! 🎉**
