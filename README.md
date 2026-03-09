# Nizam Store

Digital product store 

## Live Sites
- **Production:** https://app.marketingnizam.com
- **Staging:** https://app.staging.marketingnizam.com
- **Main Site:** https://marketingnizam.com

## Tech Stack
- **Framework:** Next.js 15 App Router
- **Database:** Neon (Serverless PostgreSQL)
- **ORM:** Drizzle ORM
- **Auth:** Neon Auth (Better Auth)
- **Storage:** Vercel Blob
- **Styling:** Tailwind CSS v4
- **Animations:** Framer Motion
- **Payment:** Razorpay
- **Hosting:** Vercel

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Important Files
- `src/app/page.tsx` - Product landing page with Razorpay integration
- `src/app/privacy/page.tsx` - Privacy Policy
- `src/app/terms/page.tsx` - Terms & Conditions
- `src/app/refund/page.tsx` - Refund Policy (no refund)

## Deployment

### Staging Environment Setup
- **Quick Setup:** See [QUICK_STAGING_SETUP.md](./QUICK_STAGING_SETUP.md) (~30 min)
- **Detailed Guide:** See [STAGING_SETUP.md](./STAGING_SETUP.md)

### Architecture
- **Full Architecture:** See [ARCHITECTURE.md](./ARCHITECTURE.md)

## Product Configuration
Edit the `PRODUCT` object in `src/app/page.tsx`:
```typescript
const PRODUCT = {
  name: "The Ultimate Habit Tracker",
  price: 99,
  originalPrice: 299,
  currency: "INR",
  // ...
};
```

## Razorpay Setup
Replace the test key in `src/app/page.tsx` line 76 with your live Razorpay key.

---

Built with ❤️ by Mubashir
