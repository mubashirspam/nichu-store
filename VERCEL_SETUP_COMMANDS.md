# Vercel Staging Setup - Command Reference

## Step-by-Step Commands for Vercel Dashboard

### 1. Git Branch Setup
```bash
# Create staging branch
git checkout main
git pull origin main
git checkout -b staging
git push -u origin staging
```

### 2. Vercel Dashboard Configuration

#### A. Domain Setup
**Path:** Vercel Dashboard → Your Project → Settings → Domains

1. Click **"Add Domain"**
2. Enter: `app.staging.marketingnizam.com`
3. Click **"Add"**

#### B. DNS Configuration (Your DNS Provider)
Add CNAME record:
```
Type: CNAME
Name: app.staging
Value: cname.vercel-dns.com
TTL: 3600 (or Auto)
```

#### C. Environment Variables Setup
**Path:** Vercel Dashboard → Your Project → Settings → Environment Variables

**For STAGING (Preview Environment):**

Click "Add New" for each variable below and select **"Preview"** environment:

```
Variable Name: DATABASE_URL
Value: [Your Neon staging branch connection string]
Environment: ✅ Preview
```

```
Variable Name: NEON_AUTH_BASE_URL
Value: [Your Neon staging auth URL]
Environment: ✅ Preview
```

```
Variable Name: NEON_AUTH_COOKIE_SECRET
Value: [Generate with: openssl rand -base64 32]
Environment: ✅ Preview
```

```
Variable Name: BLOB_READ_WRITE_TOKEN
Value: [Your staging blob store token]
Environment: ✅ Preview
```

```
Variable Name: NEXT_PUBLIC_RAZORPAY_KEY_ID
Value: rzp_test_XXXXXXXXXXXXXXX
Environment: ✅ Preview
```

```
Variable Name: RAZORPAY_KEY_SECRET
Value: [Your test mode secret]
Environment: ✅ Preview
```

```
Variable Name: RAZORPAY_WEBHOOK_SECRET
Value: [Your test mode webhook secret]
Environment: ✅ Preview
```

```
Variable Name: NEXT_PUBLIC_APP_URL
Value: https://app.staging.marketingnizam.com
Environment: ✅ Preview
```

**For PRODUCTION (Production Environment):**

Repeat the same variables but select **"Production"** environment and use production values:

```
DATABASE_URL → Production (main branch connection)
NEON_AUTH_BASE_URL → Production (main branch auth)
NEON_AUTH_COOKIE_SECRET → Production (different secret!)
BLOB_READ_WRITE_TOKEN → Production (production blob store)
NEXT_PUBLIC_RAZORPAY_KEY_ID → Production (rzp_live_XXX)
RAZORPAY_KEY_SECRET → Production (live secret)
RAZORPAY_WEBHOOK_SECRET → Production (live webhook)
NEXT_PUBLIC_APP_URL → Production (https://app.marketingnizam.com)
```

### 3. Link Staging Branch to Staging Domain

**Path:** Vercel Dashboard → Your Project → Deployments

1. Find a deployment from the `staging` branch
2. Click on the deployment
3. Click **"Domains"** tab
4. Click **"Add Domain"**
5. Select: `app.staging.marketingnizam.com`
6. Click **"Add"**

### 4. Verify Git Integration

**Path:** Vercel Dashboard → Your Project → Settings → Git

Ensure:
- ✅ **Production Branch:** `main`
- ✅ **Automatic Deployments:** Enabled
- ✅ Both `main` and `staging` branches are tracked

### 5. Deploy Staging

```bash
# Trigger deployment
git checkout staging
git commit --allow-empty -m "Initial staging deployment"
git push origin staging
```

### 6. Monitor Deployment

**Path:** Vercel Dashboard → Your Project → Deployments

Watch for:
1. Build starts automatically
2. Build completes successfully
3. Deployment goes live on `app.staging.marketingnizam.com`

---

## Quick Commands Reference

### Generate Cookie Secret
```bash
openssl rand -base64 32
```

### Check Current Branch
```bash
git branch --show-current
```

### Switch Between Environments
```bash
# To staging
git checkout staging
git pull origin staging

# To production
git checkout main
git pull origin main
```

### Deploy to Staging
```bash
git checkout staging
# ... make changes ...
git add .
git commit -m "Your commit message"
git push origin staging
```

### Deploy to Production
```bash
git checkout main
git merge staging
git push origin main
```

---

## Neon Database Commands

### Create Staging Branch (Neon Console)
1. Go to: https://console.neon.tech
2. Select your project
3. Click **"Branches"** → **"Create Branch"**
4. Settings:
   - Name: `staging`
   - Parent: `main`
   - Copy data: ✅ Yes
5. Click **"Create Branch"**
6. Copy connection string

### Enable Neon Auth on Staging Branch
1. Select `staging` branch
2. Click **"Auth"** tab
3. Click **"Enable Auth"**
4. Copy `NEON_AUTH_BASE_URL`

---

## Vercel Blob Commands

### Create Staging Blob Store
1. Go to: https://vercel.com/dashboard
2. Navigate to **Storage** → **Blob**
3. Click **"Create Store"**
4. Name: `nichu-store-staging`
5. Region: (same as production)
6. Click **"Create"**
7. Copy `BLOB_READ_WRITE_TOKEN`

---

## Testing Checklist

After deployment, test on `https://app.staging.marketingnizam.com`:

- [ ] Homepage loads
- [ ] Sign in/Sign up works (Neon Auth)
- [ ] Product listing displays
- [ ] Add to cart works
- [ ] Checkout page loads
- [ ] Razorpay test payment works
- [ ] Order confirmation received
- [ ] File download works (Vercel Blob)
- [ ] Admin panel accessible (if admin user)
- [ ] Profile settings work

---

## Troubleshooting Commands

### Check Deployment Logs
**Path:** Vercel Dashboard → Deployments → [Click deployment] → Logs

### Check Environment Variables
**Path:** Vercel Dashboard → Settings → Environment Variables

### Redeploy
```bash
git commit --allow-empty -m "Redeploy"
git push origin staging
```

### Check DNS Propagation
```bash
# macOS/Linux
dig app.staging.marketingnizam.com

# Or use online tool
# https://dnschecker.org
```

---

## Important Notes

⚠️ **Never commit these files:**
- `.env.local`
- `.env.staging`
- `.env.production`

✅ **Always use Vercel Dashboard for environment variables**

✅ **Use different secrets for staging and production**

✅ **Use Razorpay test mode for staging**

---

## Support Links

- **Vercel Docs:** https://vercel.com/docs/projects/environment-variables
- **Neon Branching:** https://neon.tech/docs/guides/branching
- **Vercel Blob:** https://vercel.com/docs/storage/vercel-blob
- **Razorpay Test Mode:** https://razorpay.com/docs/payments/payments/test-card-details/
