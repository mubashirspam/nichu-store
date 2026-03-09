# Quick Staging Setup Checklist

## 🚀 Quick Steps to Get Staging Running

### 1. Create Git Branch (2 min)
```bash
git checkout -b staging
git push -u origin staging
```

### 2. Neon Database (5 min)
1. [Neon Console](https://console.neon.tech) → Your Project → **Branches**
2. Click **Create Branch**:
   - Name: `staging`
   - Parent: `main`
   - Copy data: ✅
3. Copy connection string → Save as `DATABASE_URL` for staging
4. Enable **Auth** on staging branch
5. Copy `NEON_AUTH_BASE_URL`
6. Generate secret: `openssl rand -base64 32` → Save as `NEON_AUTH_COOKIE_SECRET`

### 3. Vercel Blob (3 min)
1. [Vercel Dashboard](https://vercel.com/dashboard) → **Storage** → **Blob**
2. Click **Create Store**: `nichu-store-staging`
3. Copy token → Save as `BLOB_READ_WRITE_TOKEN`

### 4. Vercel Domain (5 min)
1. Vercel → Your Project → **Settings** → **Domains**
2. Add: `app.staging.marketingnizam.com`
3. DNS Provider → Add CNAME:
   - Name: `app.staging`
   - Value: `cname.vercel-dns.com`

### 5. Vercel Environment Variables (10 min)
Go to **Settings** → **Environment Variables**

For each variable, select **Preview** environment:

| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_URL` | [from step 2] | Staging DB |
| `NEON_AUTH_BASE_URL` | [from step 2] | Staging Auth |
| `NEON_AUTH_COOKIE_SECRET` | [from step 2] | New secret |
| `BLOB_READ_WRITE_TOKEN` | [from step 3] | Staging blob |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | `rzp_test_XXX` | Test mode |
| `RAZORPAY_KEY_SECRET` | [test secret] | Test mode |
| `RAZORPAY_WEBHOOK_SECRET` | [test webhook] | Test mode |
| `NEXT_PUBLIC_APP_URL` | `https://app.staging.marketingnizam.com` | Staging URL |

**Also set Production environment variables** with production values!

### 6. Deploy (2 min)
```bash
git commit --allow-empty -m "Deploy staging"
git push origin staging
```

Visit: `https://app.staging.marketingnizam.com`

---

## 📋 Environment Variables Summary

### Staging (Preview Environment)
- Neon staging branch
- Vercel Blob staging store
- Razorpay **test** keys
- Domain: `app.staging.marketingnizam.com`

### Production (Production Environment)
- Neon main branch
- Vercel Blob production store
- Razorpay **live** keys
- Domain: `app.marketingnizam.com`

---

## 🔄 Workflow

```
feature branch → staging → test → main → production
```

1. Develop on feature branch
2. Merge to `staging` → Auto-deploy to staging domain
3. Test on staging
4. Merge to `main` → Auto-deploy to production

---

## ⚠️ Important Notes

- ✅ Use **different** secrets for staging and production
- ✅ Use Razorpay **test mode** for staging
- ✅ Never commit `.env.staging` or `.env.production`
- ✅ Test thoroughly on staging before production
- ✅ Staging uses separate database branch (safe to test)

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Domain not working | Wait for DNS propagation (up to 48h) |
| Auth errors | Check `NEON_AUTH_BASE_URL` and `NEON_AUTH_COOKIE_SECRET` |
| DB connection fails | Verify `DATABASE_URL` for staging branch |
| File upload fails | Check `BLOB_READ_WRITE_TOKEN` for staging store |
| Payment errors | Ensure using Razorpay test keys |

---

**Total Setup Time**: ~30 minutes

For detailed instructions, see `STAGING_SETUP.md`
