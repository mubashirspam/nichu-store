# Nizam Store

Digital product store 

## Live Site
- **Store:** https://app.marketingnizam.com
- **Main Site:** https://marketingnizam.com

## Tech Stack
- **Framework:** Next.js 15 (Static Export)
- **Styling:** Tailwind CSS v4
- **Animations:** Framer Motion
- **Payment:** Razorpay
- **Hosting:** Netlify/Vercel

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
See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for complete deployment instructions.

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

Built with ❤️ by Nizamudheen KC
