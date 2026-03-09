# Staging Environment Setup Guide

This guide walks you through setting up a staging environment for your Nichu Store application on Vercel.

## Overview

- **Production**: `app.marketingnizam.com` (main branch)
- **Staging**: `app.staging.marketingnizam.com` (staging branch)

## Prerequisites

- Vercel account with project deployed
- Neon account with existing production database
- Razorpay account
- Git repository with `main` and `staging` branches

---

## Step 1: Create Git Staging Branch

```bash
# Create and push staging branch from main
git checkout main
git pull origin main
git checkout -b staging
git push -u origin staging
```

---

## Step 2: Set Up Neon Database Staging Branch

### 2.1 Create Database Branch

1. Go to [Neon Console](https://console.neon.tech)
2. Select your project
3. Click **Branches** in the sidebar
4. Click **Create Branch**
5. Configure:
   - **Branch name**: `staging`
   - **Parent branch**: `main`
   - **Copy data**: Yes (to clone production data)
6. Click **Create Branch**
7. Copy the new connection string

### 2.2 Set Up Neon Auth for Staging

1. In Neon Console, select the `staging` branch
2. Go to **Auth** section
3. Click **Enable Auth** (if not already enabled)
4. Copy the `NEON_AUTH_BASE_URL` for staging
5. Generate a new cookie secret:
   ```bash
   openssl rand -base64 32
   ```
6. Save this secret securely

---

## Step 3: Create Vercel Blob Staging Store

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to **Storage** → **Blob**
3. Click **Create Store**
4. Configure:
   - **Store name**: `nichu-store-staging`
   - **Region**: Same as production (for consistency)
5. Click **Create**
6. Copy the `BLOB_READ_WRITE_TOKEN`

---

## Step 4: Configure Vercel Project

### 4.1 Connect Staging Branch

1. Go to Vercel Dashboard → Your Project
2. Go to **Settings** → **Git**
3. Under **Production Branch**, ensure `main` is set
4. Under **Deploy Hooks**, you can create a hook for staging if needed

### 4.2 Add Staging Domain

1. Go to **Settings** → **Domains**
2. Click **Add Domain**
3. Enter: `app.staging.marketingnizam.com`
4. Configure DNS:
   - Add CNAME record in your DNS provider:
     - **Name**: `app.staging`
     - **Value**: `cname.vercel-dns.com`
5. Wait for DNS propagation (can take up to 48 hours)

### 4.3 Set Environment Variables for Staging

1. Go to **Settings** → **Environment Variables**
2. For each variable below, set the **Environment** to **Preview** (staging branch):

#### Database Variables
```
DATABASE_URL = [staging branch connection string from Step 2]
```

#### Neon Auth Variables
```
NEON_AUTH_BASE_URL = [staging auth URL from Step 2]
NEON_AUTH_COOKIE_SECRET = [new secret from Step 2]
```

#### Vercel Blob Variables
```
BLOB_READ_WRITE_TOKEN = [staging token from Step 3]
```

#### Razorpay Variables (Use TEST mode)
```
NEXT_PUBLIC_RAZORPAY_KEY_ID = rzp_test_XXXXXXXXXXXXXXX
RAZORPAY_KEY_SECRET = [test mode secret]
RAZORPAY_WEBHOOK_SECRET = [test mode webhook secret]
```

#### App Configuration
```
NEXT_PUBLIC_APP_URL = https://app.staging.marketingnizam.com
```

### 4.4 Set Environment Variables for Production

1. For each variable, also set the **Environment** to **Production** (main branch)
2. Use production values from `.env.production` file

---

## Step 5: Configure Branch-Specific Deployments

### 5.1 Update Vercel Git Settings

1. Go to **Settings** → **Git**
2. Enable **Automatic Deployments** for both branches:
   - `main` → Production (`app.marketingnizam.com`)
   - `staging` → Preview (`app.staging.marketingnizam.com`)

### 5.2 Link Staging Branch to Staging Domain

1. Go to **Deployments**
2. Find a deployment from the `staging` branch
3. Click on it → **Domains**
4. Assign `app.staging.marketingnizam.com` to this branch

---

## Step 6: Deploy and Test

### 6.1 Trigger Staging Deployment

```bash
# Make a small change to staging branch
git checkout staging
git commit --allow-empty -m "Trigger staging deployment"
git push origin staging
```

### 6.2 Verify Deployment

1. Check Vercel Dashboard → **Deployments**
2. Wait for staging deployment to complete
3. Visit `https://app.staging.marketingnizam.com`
4. Test key functionality:
   - ✅ Authentication (Neon Auth)
   - ✅ Product listing
   - ✅ Cart operations
   - ✅ Checkout with Razorpay (test mode)
   - ✅ File uploads (Vercel Blob)
   - ✅ Admin panel

---

## Step 7: Workflow Best Practices

### Development Workflow

```bash
# Feature development
git checkout staging
git pull origin staging
git checkout -b feature/new-feature
# ... make changes ...
git commit -m "Add new feature"
git push origin feature/new-feature

# Create PR to staging
# Test on staging environment
# After approval, merge to staging
# Test thoroughly on staging

# When ready for production
# Create PR from staging to main
# Deploy to production
```

### Environment Promotion

1. **Development** → Local (`.env.local`)
2. **Staging** → `app.staging.marketingnizam.com` (staging branch)
3. **Production** → `app.marketingnizam.com` (main branch)

---

## Step 8: Database Migration Strategy

### For Schema Changes

```bash
# 1. Test migration on staging
git checkout staging
# Update schema in src/lib/db/schema.ts
npm run db:push  # or your migration command

# 2. Deploy to staging
git commit -m "Update database schema"
git push origin staging

# 3. Test on staging environment
# Verify all functionality works

# 4. Merge to production
git checkout main
git merge staging
git push origin main
```

### Using Neon Branching for Safe Migrations

1. Create a temporary branch from staging for testing
2. Run migrations on temporary branch
3. Test thoroughly
4. If successful, apply to staging
5. After staging validation, apply to production

---

## Troubleshooting

### Issue: Staging domain not working
- **Solution**: Check DNS propagation, ensure CNAME is correct

### Issue: Database connection errors
- **Solution**: Verify `DATABASE_URL` is set correctly for staging environment

### Issue: Auth not working
- **Solution**: Check `NEON_AUTH_BASE_URL` and `NEON_AUTH_COOKIE_SECRET` are set

### Issue: File uploads failing
- **Solution**: Verify `BLOB_READ_WRITE_TOKEN` is for staging store

### Issue: Razorpay errors
- **Solution**: Ensure using test mode keys for staging

---

## Environment Variables Checklist

### Staging Environment
- [ ] `DATABASE_URL` (Neon staging branch)
- [ ] `NEON_AUTH_BASE_URL` (staging auth endpoint)
- [ ] `NEON_AUTH_COOKIE_SECRET` (unique for staging)
- [ ] `BLOB_READ_WRITE_TOKEN` (staging blob store)
- [ ] `NEXT_PUBLIC_RAZORPAY_KEY_ID` (test mode)
- [ ] `RAZORPAY_KEY_SECRET` (test mode)
- [ ] `RAZORPAY_WEBHOOK_SECRET` (test mode)
- [ ] `NEXT_PUBLIC_APP_URL` (staging domain)

### Production Environment
- [ ] `DATABASE_URL` (Neon main branch)
- [ ] `NEON_AUTH_BASE_URL` (production auth endpoint)
- [ ] `NEON_AUTH_COOKIE_SECRET` (unique for production)
- [ ] `BLOB_READ_WRITE_TOKEN` (production blob store)
- [ ] `NEXT_PUBLIC_RAZORPAY_KEY_ID` (live mode)
- [ ] `RAZORPAY_KEY_SECRET` (live mode)
- [ ] `RAZORPAY_WEBHOOK_SECRET` (live mode)
- [ ] `NEXT_PUBLIC_APP_URL` (production domain)

---

## Security Notes

1. **Never commit `.env.local`, `.env.staging`, or `.env.production` to Git**
2. **Use different secrets for staging and production**
3. **Regularly rotate secrets**
4. **Use Razorpay test mode for staging**
5. **Limit staging database access**
6. **Monitor staging for suspicious activity**

---

## Cost Optimization

- **Neon**: Staging branch shares compute with main, minimal cost
- **Vercel Blob**: Separate staging store, pay for usage
- **Vercel Hosting**: Preview deployments included in plan
- **Razorpay**: Test mode is free

---

## Next Steps

1. ✅ Complete all steps above
2. ✅ Test staging environment thoroughly
3. ✅ Document any custom configurations
4. ✅ Train team on staging workflow
5. ✅ Set up monitoring for staging (optional)
6. ✅ Configure CI/CD pipelines (optional)

---

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Neon Docs**: https://neon.tech/docs
- **Razorpay Docs**: https://razorpay.com/docs

---

**Last Updated**: March 2026
