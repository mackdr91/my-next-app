import { withAuth } from 'next-auth/middleware';

// Define public paths that don't require authentication
const publicPaths = [
  '/auth/signin',
  '/auth/signup',
  '/auth/error',
  '/',
  '/about',
  '/contact'
];

export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      // Allow access to public paths
      const path = req.nextUrl.pathname;
      if (publicPaths.includes(path)) return true;
      
      // Require token for protected paths
      return !!token;
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  },
});

export const config = {
  matcher: [
    // Protect API routes
    '/api/sneakers/:path*',
    '/api/favorites/:path*',
    '/api/profile/:path*',
    
    // Protect app routes
    '/dashboard/:path*',
    '/profile/:path*',
    '/sneakers/:path*',
    '/favorites/:path*',
    
    // Don't protect auth routes
    '/((?!api/auth|auth|_next/static|_next/image|favicon.ico).*)',
  ]
};
