# Production Authentication Issues - Fix Guide

## 🔴 Problem
- Cart/Orders pages redirect to login even when logged in
- Sign out not working properly
- Products not loading
- Session not persisting in production

## ✅ Fixes Applied

### 1. **Middleware Cookie Handling** (`src/middleware.ts`)
- Added proper cookie options for production
- Set `sameSite: 'lax'` for cross-site compatibility
- Set `secure: true` for HTTPS in production
- Changed from `getUser()` to `getSession()` for better session refresh

### 2. **Client-Side Cookie Management** (`src/lib/supabase/client.ts`)
- Implemented custom cookie handlers
- Proper cookie parsing and setting
- HTTPS-aware secure flag
- Consistent path and maxAge settings

## 🚀 Additional Steps Required

### **Step 1: Environment Variables**
Ensure these are set in your production environment (Vercel/Netlify):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret
```

### **Step 2: Supabase Dashboard Settings**

1. Go to **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. Add your production URL to **Site URL**: `https://yourdomain.com`
3. Add to **Redirect URLs**:
   ```
   https://yourdomain.com/auth/callback
   https://yourdomain.com
   http://localhost:3000/auth/callback (for dev)
   ```

### **Step 3: Cookie Domain Settings**

If using a custom domain, check your deployment platform:

**Vercel:**
- No additional config needed
- Cookies automatically scoped to domain

**Netlify:**
- Add to `netlify.toml`:
```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

### **Step 4: CORS Settings in Supabase**

1. Go to **Supabase Dashboard** → **Settings** → **API**
2. Under **CORS Allowed Origins**, add:
   ```
   https://yourdomain.com
   http://localhost:3000
   ```

### **Step 5: Google OAuth Settings** (if using Google login)

1. Go to **Google Cloud Console** → **APIs & Services** → **Credentials**
2. Edit your OAuth 2.0 Client ID
3. Add to **Authorized JavaScript origins**:
   ```
   https://yourdomain.com
   https://your-project.supabase.co
   ```
4. Add to **Authorized redirect URIs**:
   ```
   https://your-project.supabase.co/auth/v1/callback
   https://yourdomain.com/auth/callback
   ```

## 🧪 Testing Checklist

After deploying the fixes:

- [ ] Login with email/password
- [ ] Login with Google OAuth
- [ ] Navigate to `/cart` while logged in
- [ ] Navigate to `/orders` while logged in
- [ ] Add product to cart
- [ ] Sign out
- [ ] Try accessing `/cart` without login (should redirect)
- [ ] Login again and verify cart persists
- [ ] Complete a purchase
- [ ] Download file from orders page

## 🐛 Common Issues & Solutions

### Issue: Still redirecting to login after fixes
**Solution:**
```bash
# Clear all cookies and cache
1. Open DevTools (F12)
2. Application tab → Storage → Clear site data
3. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
```

### Issue: Sign out not working
**Solution:**
Check AuthContext signOut function includes:
```typescript
await supabase.auth.signOut();
// Clear local state
setUser(null);
setProfile(null);
// Redirect to home
window.location.href = '/';
```

### Issue: Session expires too quickly
**Solution:**
In Supabase Dashboard → Authentication → Settings:
- Set **JWT Expiry** to 3600 (1 hour)
- Enable **Refresh Token Rotation**

### Issue: Products not loading
**Solution:**
1. Check browser console for errors
2. Verify API routes are accessible: `/api/products`
3. Check Supabase RLS policies allow public read on products table

## 📊 Performance Optimization

### Enable Edge Runtime (Optional)
```typescript
// app/api/products/route.ts
export const runtime = 'edge';
export const dynamic = 'force-dynamic';
```

### Add Response Caching
```typescript
// app/api/products/route.ts
export async function GET() {
  const data = await fetchProducts();
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
    },
  });
}
```

## 🔍 Debugging Production Issues

### Enable Verbose Logging
```typescript
// middleware.ts - Add more detailed logs
console.log('[Middleware] Session:', {
  hasSession: !!session,
  userId: session?.user?.id,
  expiresAt: session?.expires_at,
  cookies: request.cookies.getAll().map(c => c.name),
});
```

### Check Deployment Logs
**Vercel:**
```bash
vercel logs <deployment-url>
```

**Netlify:**
```bash
netlify logs
```

### Monitor Supabase
1. Dashboard → Logs → API Logs
2. Check for 401/403 errors
3. Monitor query performance

## 📝 Deployment Commands

```bash
# Test production build locally
npm run build
npm run start

# Deploy to Vercel
vercel --prod

# Deploy to Netlify
netlify deploy --prod
```

## ⚠️ Important Notes

1. **Always test locally first**: `npm run build && npm run start`
2. **Clear browser cache** after each deployment
3. **Check environment variables** are set in production
4. **Monitor error logs** for the first 24 hours after deployment
5. **Keep Supabase URLs updated** in all OAuth providers

## 🆘 Still Having Issues?

1. Check browser DevTools → Network tab for failed requests
2. Check Supabase Dashboard → Logs for auth errors
3. Verify all environment variables are set correctly
4. Try incognito/private browsing mode
5. Check if issue is specific to certain browsers

## 📞 Support Resources

- Supabase Docs: https://supabase.com/docs/guides/auth
- Next.js SSR Guide: https://nextjs.org/docs/app/building-your-application/rendering/server-components
- Supabase SSR Package: https://github.com/supabase/ssr
