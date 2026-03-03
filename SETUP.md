# NichuStore Setup Guide

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Database**: Neon (Serverless PostgreSQL)
- **ORM**: Drizzle ORM
- **Auth**: Neon Auth (powered by Better Auth)
- **File Storage**: Vercel Blob
- **Payments**: Razorpay
- **Hosting**: Vercel

---

## 1. Neon Database + Auth Setup

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project
3. Copy the **Database URL** (looks like `postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require`)
4. Enable **Auth** in Neon Console: Project → Branch → Auth → Enable
5. Copy your **Auth Base URL** from Configuration (looks like `https://ep-xxx.neonauth.us-east-1.aws.neon.tech/neondb/auth`)
6. Open the **SQL Editor** and run `neon-setup.sql`
7. (Optional) Configure social providers (Google, GitHub) in Neon Console → Auth → Providers

### Setting Admin Role

After your first sign-in, run in Neon SQL Editor:
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
```

## 2. Vercel Blob Storage Setup

1. In Vercel Dashboard → Storage → Create → Blob
2. Copy the `BLOB_READ_WRITE_TOKEN`
3. Files are uploaded via `/api/admin/upload` and stored in Vercel Blob
4. Download URLs are full HTTPS URLs stored in the database

## 3. Razorpay Setup

1. Go to [razorpay.com](https://razorpay.com) and create an account
2. Get your API keys from Dashboard → Settings → API Keys
3. Set up webhook URL: `https://yourdomain.com/api/razorpay/webhook`
4. Set webhook events: `payment.captured`, `payment.failed`, `order.paid`

## 4. Environment Variables

Create `.env.local`:

```env
# Neon Database
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require

# Neon Auth
NEON_AUTH_BASE_URL=https://ep-xxx.neonauth.us-east-1.aws.neon.tech/neondb/auth
NEON_AUTH_COOKIE_SECRET=generate-with-openssl-rand-base64-32

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxx

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx
RAZORPAY_WEBHOOK_SECRET=xxx
```

Generate cookie secret:
```bash
openssl rand -base64 32
```

For Vercel deployment, add all these in: **Project Settings → Environment Variables**

## 5. Run Locally

```bash
npm install
npm run dev
```

> **Safari users**: Safari blocks third-party cookies on non-HTTPS. Use `npm run dev -- --experimental-https` and open `https://localhost:3000`

## 6. Deploy to Vercel

```bash
vercel --prod
# Or connect GitHub repo in Vercel dashboard
```

## 7. Post-Deployment Checklist

- [ ] Run `neon-setup.sql` in Neon SQL Editor
- [ ] Enable Auth in Neon Console
- [ ] Set all environment variables in Vercel
- [ ] Set up Razorpay webhook for production URL
- [ ] Sign in and set yourself as admin (see step 1)
- [ ] Test: Browse products → Add to cart → Checkout → Download

---

## Auth Pages

| URL | Description |
|-----|-------------|
| `/auth/sign-in` | Sign in with email/password or social providers |
| `/auth/sign-up` | New account registration |
| `/auth/sign-out` | Sign out |
| `/account/settings` | Manage profile details |
| `/account/security` | Change password, view sessions |

## Architecture Overview

```
src/
├── app/
│   ├── api/
│   │   ├── admin/          # Admin CRUD (stats, products, orders, users, offer-codes, upload)
│   │   ├── auth/[...path]/ # Neon Auth API handler
│   │   ├── cart/           # User cart (GET/POST/DELETE)
│   │   ├── downloads/      # Secure file downloads
│   │   ├── offer-codes/    # Offer code validation
│   │   ├── orders/         # User orders + create/verify
│   │   └── razorpay/       # Payment creation, verification, webhooks
│   ├── admin/              # Admin dashboard pages
│   ├── auth/[path]/        # Neon Auth UI (sign-in, sign-up, sign-out)
│   ├── account/[path]/     # Account management (settings, security)
│   ├── cart/               # Shopping cart page
│   ├── orders/             # User orders pages
│   └── page.tsx            # Main store page
├── components/
│   ├── auth/LoginModal.tsx # Sign-in redirect modal
│   └── home/               # Homepage sections
├── contexts/
│   ├── AuthContext.tsx      # Neon Auth session wrapper
│   ├── CartContext.tsx      # Cart state via API routes
│   └── ProductContext.tsx   # Product caching
├── lib/
│   ├── auth.ts             # Neon Auth server instance + helpers
│   ├── auth/client.ts      # Neon Auth client instance
│   └── db/
│       ├── index.ts        # Neon/Drizzle client
│       └── schema.ts       # Drizzle schema (all tables)
└── middleware.ts            # Neon Auth route protection
```

## Key Differences from Supabase

| Feature | Supabase | New Stack |
|---------|----------|-----------|
| Database | Supabase PostgreSQL | Neon PostgreSQL |
| Auth | Supabase Auth | Neon Auth (Better Auth) |
| Storage | Supabase Storage | Vercel Blob |
| ORM | Supabase JS Client | Drizzle ORM |
| RLS | Row Level Security | API-level auth checks |
| Admin pages | Direct DB queries | API routes |
| Auth UI | Custom forms | Neon Auth UI components |
| Middleware | Cookie-based session | Neon Auth middleware |
