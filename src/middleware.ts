import { auth } from '@/lib/auth';

export default auth.middleware({
  loginUrl: '/auth/sign-in',
});

export const config = {
  matcher: [
    '/cart/:path*',
    '/orders/:path*',
    '/checkout/:path*',
    '/admin/:path*',
    '/account/:path*',
  ],
};
