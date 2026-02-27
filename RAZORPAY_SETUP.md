# 🔐 Razorpay Integration Setup Guide

This guide will help you securely integrate Razorpay with your fitness tracker store.

## 📋 Prerequisites

1. A Razorpay account (sign up at https://razorpay.com)
2. Your Razorpay API keys

---

## 🚀 Step-by-Step Setup

### Step 1: Get Your Razorpay Credentials

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/app/keys)
2. Copy your **Key ID** (starts with `rzp_test_` for test mode or `rzp_live_` for production)
3. Copy your **Key Secret** (keep this private!)

### Step 2: Create Environment File

1. In the root of your project, create a file named `.env.local`
2. Add your Razorpay credentials:

```bash
# Razorpay Configuration
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID_HERE
RAZORPAY_KEY_SECRET=YOUR_SECRET_KEY_HERE

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

**Important:** 
- Replace `YOUR_KEY_ID_HERE` and `YOUR_SECRET_KEY_HERE` with your actual credentials
- Never commit `.env.local` to Git (it's already in `.gitignore`)
- Use `rzp_test_` keys for testing, `rzp_live_` for production

### Step 3: Install Dependencies

The Razorpay package should already be installed. If not, run:

```bash
npm install razorpay
```

### Step 4: Restart Development Server

After creating `.env.local`, restart your dev server:

```bash
# Stop the current server (Ctrl+C)
npm run dev
```

---

## 🏗️ Architecture Overview

### Security Features Implemented

✅ **Server-Side Order Creation** — Orders are created on the server to prevent tampering  
✅ **Payment Signature Verification** — All payments are verified using HMAC SHA256  
✅ **Environment Variables** — Sensitive keys stored in `.env.local`  
✅ **API Routes** — Secure Next.js API routes handle payment logic  
✅ **Success/Failure Pages** — Proper user feedback after payment  

### File Structure

```
src/
├── app/
│   ├── api/
│   │   └── razorpay/
│   │       ├── create-order/route.ts    # Creates Razorpay order
│   │       └── verify-payment/route.ts  # Verifies payment signature
│   ├── success/page.tsx                 # Payment success page
│   ├── failed/page.tsx                  # Payment failure page
│   └── page.tsx                         # Main store (updated)
└── ...
```

---

## 🔄 Payment Flow

1. **User clicks "Buy Now"**
2. **Client → Server:** Request to create Razorpay order
3. **Server → Razorpay:** Create order with amount, currency, product details
4. **Razorpay → Server:** Return order ID
5. **Server → Client:** Send order ID to client
6. **Client:** Open Razorpay checkout modal
7. **User:** Complete payment
8. **Razorpay → Client:** Return payment details (payment_id, order_id, signature)
9. **Client → Server:** Send payment details for verification
10. **Server:** Verify signature using HMAC SHA256
11. **Server → Client:** Confirm verification
12. **Client:** Redirect to success/failure page

---

## 🧪 Testing

### Test Mode

Use test credentials from Razorpay dashboard:
- Test cards: https://razorpay.com/docs/payments/payments/test-card-details/

### Common Test Cards

| Card Number         | CVV | Expiry  | Result  |
|---------------------|-----|---------|---------|
| 4111 1111 1111 1111 | Any | Future  | Success |
| 4000 0000 0000 0002 | Any | Future  | Failure |

---

## 🔒 Security Best Practices

1. **Never expose `RAZORPAY_KEY_SECRET`** — Keep it server-side only
2. **Always verify payment signatures** — Don't trust client-side data
3. **Use HTTPS in production** — Required by Razorpay
4. **Enable webhook verification** — For additional security
5. **Log all transactions** — For debugging and auditing

---

## 📧 Post-Payment Actions (TODO)

After successful payment verification, you should:

1. **Send email to customer** with download link
2. **Store transaction** in database
3. **Generate download token** for the Excel file
4. **Send receipt** via email

### Recommended Email Service

- **Resend** (https://resend.com) — Modern, developer-friendly
- **SendGrid** — Enterprise-grade
- **Mailgun** — Reliable and affordable

---

## 🚀 Going Live

### Checklist

- [ ] Switch to live Razorpay keys (`rzp_live_...`)
- [ ] Update `NEXT_PUBLIC_APP_URL` to your production domain
- [ ] Enable HTTPS on your domain
- [ ] Set up Razorpay webhooks (optional but recommended)
- [ ] Test with real small amount (₹1)
- [ ] Set up email delivery system
- [ ] Configure database for storing orders
- [ ] Add proper error logging (Sentry, LogRocket, etc.)

### Environment Variables for Production

```bash
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_YOUR_LIVE_KEY
RAZORPAY_KEY_SECRET=YOUR_LIVE_SECRET
NEXT_PUBLIC_APP_URL=https://app.marketingnizam.com
```

---

## 🐛 Troubleshooting

### Payment modal doesn't open
- Check if Razorpay script is loaded in `layout.tsx`
- Verify `NEXT_PUBLIC_RAZORPAY_KEY_ID` is set correctly
- Check browser console for errors

### "Failed to create order" error
- Verify `RAZORPAY_KEY_SECRET` is set in `.env.local`
- Check server logs for detailed error
- Ensure amount is a valid number

### Payment verification fails
- Check if signature verification logic is correct
- Verify `RAZORPAY_KEY_SECRET` matches your dashboard
- Check server logs for signature mismatch details

### Environment variables not loading
- Restart dev server after creating/updating `.env.local`
- Ensure `.env.local` is in project root
- Check for typos in variable names

---

## 📚 Resources

- [Razorpay Documentation](https://razorpay.com/docs/)
- [Razorpay Node.js SDK](https://github.com/razorpay/razorpay-node)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Razorpay Test Cards](https://razorpay.com/docs/payments/payments/test-card-details/)

---

## 💡 Next Steps

1. Create `.env.local` with your Razorpay credentials
2. Restart the dev server
3. Test a payment with test card
4. Set up email delivery for download links
5. Deploy to Vercel and configure production environment variables

---

**Need Help?** Contact support@marketingnizam.com
