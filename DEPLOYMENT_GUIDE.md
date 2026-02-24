# Nizam Store - Deployment Guide

## Overview
This is the subdomain store app for `app.marketingnizam.com` that sells digital products (Habit Tracker) with Razorpay payment integration.

---

## Pre-Deployment Checklist

### 1. Configure Razorpay

**IMPORTANT:** Replace the test Razorpay key with your live key.

1. Sign up at [https://dashboard.razorpay.com](https://dashboard.razorpay.com)
2. Complete KYC verification
3. Go to **Settings → API Keys → Generate Key**
4. Copy your **Key ID** (starts with `rzp_live_...`)
5. Open `src/app/page.tsx` and find line 76:
   ```typescript
   const RAZORPAY_KEY_ID = "rzp_test_XXXXXXXXXXXXXXX";
   ```
6. Replace with your actual key:
   ```typescript
   const RAZORPAY_KEY_ID = "rzp_live_YOUR_ACTUAL_KEY_HERE";
   ```

### 2. Update Contact Email (Optional)

If `contact@marketingnizam.com` is not your actual email, update it in:
- `src/app/privacy/page.tsx`
- `src/app/terms/page.tsx`
- `src/app/refund/page.tsx`
- `src/app/page.tsx` (in the product delivery section)

---

## Deployment Steps

### Option A: Deploy to Netlify (Recommended)

#### Step 1: Push to GitHub
```bash
cd /Users/mymac/projects/web/nichu-store
git init
git add .
git commit -m "Initial commit - Nizam Store"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/nichu-store.git
git push -u origin main
```

#### Step 2: Deploy on Netlify
1. Go to [https://app.netlify.com](https://app.netlify.com)
2. Click **Add new site → Import an existing project**
3. Connect to GitHub and select the `nichu-store` repository
4. Build settings (auto-detected from `netlify.toml`):
   - **Build command:** `next build`
   - **Publish directory:** `out`
5. Click **Deploy site**
6. Wait for deployment to complete

#### Step 3: Add Custom Domain
1. In Netlify, go to **Site settings → Domain management**
2. Click **Add custom domain**
3. Enter: `app.marketingnizam.com`
4. Netlify will show DNS instructions

#### Step 4: Configure DNS
In your domain registrar (where you bought `marketingnizam.com`):

1. Add a **CNAME record**:
   - **Type:** `CNAME`
   - **Name/Host:** `app`
   - **Value/Target:** `YOUR-SITE-NAME.netlify.app`
   - **TTL:** `3600` (or default)

2. Wait 5-30 minutes for DNS propagation
3. Netlify will automatically provision an SSL certificate

---

### Option B: Deploy to Vercel

#### Step 1: Push to GitHub
```bash
cd /Users/mymac/projects/web/nichu-store
git init
git add .
git commit -m "Initial commit - Nizam Store"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/nichu-store.git
git push -u origin main
```

#### Step 2: Deploy on Vercel
1. Go to [https://vercel.com](https://vercel.com)
2. Click **Add New → Project**
3. Import the `nichu-store` repository
4. Framework will auto-detect as **Next.js**
5. Click **Deploy**

#### Step 3: Add Custom Domain
1. In Vercel, go to **Project Settings → Domains**
2. Add domain: `app.marketingnizam.com`
3. Vercel will show DNS instructions

#### Step 4: Configure DNS
Add a **CNAME record** in your domain registrar:
- **Type:** `CNAME`
- **Name/Host:** `app`
- **Value/Target:** `cname.vercel-dns.com`
- **TTL:** `3600`

---

## Post-Deployment

### 1. Test the Store
1. Visit `https://app.marketingnizam.com`
2. Click **Buy Now** and test the Razorpay checkout
3. Use Razorpay test cards (if still in test mode):
   - Card: `4111 1111 1111 1111`
   - CVV: Any 3 digits
   - Expiry: Any future date

### 2. Verify Legal Pages
- `https://app.marketingnizam.com/privacy/`
- `https://app.marketingnizam.com/terms/`
- `https://app.marketingnizam.com/refund/`

### 3. Check Main Site CTA
Visit `https://marketingnizam.com` and verify the product CTA appears between Services and Results sections.

---

## Payment Flow & Product Delivery

### Current Flow (Manual Delivery)
1. Customer clicks **Buy Now** → Razorpay checkout opens
2. Customer completes payment
3. Payment success alert shows with `payment_id`
4. **You manually check Razorpay dashboard** for new payments
5. **You email the Habit Tracker PDF** to the customer

### Future: Automated Delivery (Optional)
To automate product delivery, you'll need:
1. A backend/serverless function (Netlify Functions or Vercel Serverless)
2. Razorpay webhook to trigger on successful payment
3. Email service (SendGrid, Mailgun, etc.) to auto-send the product

---

## Product Configuration

To change product details, edit `src/app/page.tsx`:

```typescript
const PRODUCT = {
  name: "The Ultimate Habit Tracker",
  price: 99,              // Price in INR
  originalPrice: 299,     // Original price for discount display
  currency: "INR",
  description: "...",
  features: [...]
};
```

---

## Troubleshooting

### DNS not propagating
- Wait up to 24 hours (usually 5-30 minutes)
- Check DNS with: `nslookup app.marketingnizam.com`
- Clear browser cache

### Razorpay not loading
- Verify the script tag in `src/app/layout.tsx`
- Check browser console for errors
- Ensure your Razorpay key is correct

### Build fails
```bash
npm install
npm run build
```
Check for TypeScript or ESLint errors

---

## Support

For issues:
- Razorpay: [https://razorpay.com/support/](https://razorpay.com/support/)
- Netlify: [https://docs.netlify.com](https://docs.netlify.com)
- Vercel: [https://vercel.com/docs](https://vercel.com/docs)

---

## File Structure

```
nichu-store/
├── src/
│   └── app/
│       ├── page.tsx          # Product landing page + Razorpay
│       ├── layout.tsx        # Root layout
│       ├── globals.css       # Styles
│       ├── privacy/page.tsx  # Privacy Policy
│       ├── terms/page.tsx    # Terms & Conditions
│       └── refund/page.tsx   # Refund Policy
├── public/                   # Static assets
├── netlify.toml             # Netlify config
├── next.config.ts           # Next.js config
├── package.json
└── DEPLOYMENT_GUIDE.md      # This file
```

---

## Next Steps

1. ✅ Configure Razorpay live key
2. ✅ Push to GitHub
3. ✅ Deploy to Netlify/Vercel
4. ✅ Add custom domain `app.marketingnizam.com`
5. ✅ Test payment flow
6. ✅ Create your Habit Tracker PDF product
7. ✅ Start selling!

Good luck with your store! 🚀
