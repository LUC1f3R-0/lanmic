import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get the access token from cookies (backend sets 'access_token' cookie)
  const accessToken = request.cookies.get('access_token')?.value;
  
  // Create response
  const response = NextResponse.next();
  
  // Add security headers to all responses
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // unsafe-eval needed for Next.js
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' " + (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'),
    "frame-ancestors 'none'",
  ].join('; ');
  response.headers.set('Content-Security-Policy', csp);
  
  // Only handle dashboard and login routes
  if (pathname.startsWith('/dashboard')) {
    // If it's a protected route and no access token, redirect to admin
    if (!accessToken) {
      // No access token, redirecting to admin
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    // If user has access token, allow access to dashboard
    // Access token found, allowing dashboard access
    return response;
  }
  
  if (pathname === '/admin') {
    // If user is on admin page and has access token, redirect to dashboard
    if (accessToken) {
      // Has access token, redirecting to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    // If no access token, allow access to admin page
    // No access token, allowing admin access
    return response;
  }
  
  // For all other routes, return response with security headers
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
