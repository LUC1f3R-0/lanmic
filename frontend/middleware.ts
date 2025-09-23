import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get the access token from cookies (backend sets 'access_token' cookie)
  const accessToken = request.cookies.get('access_token')?.value;
  
  // Processing request for pathname
  
  // Only handle dashboard and login routes
  if (pathname.startsWith('/dashboard')) {
    // If it's a protected route and no access token, redirect to admin
    if (!accessToken) {
      // No access token, redirecting to admin
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    // If user has access token, allow access to dashboard
    // Access token found, allowing dashboard access
    return NextResponse.next();
  }
  
  if (pathname === '/admin') {
    // If user is on admin page and has access token, redirect to dashboard
    if (accessToken) {
      // Has access token, redirecting to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    // If no access token, allow access to admin page
    // No access token, allowing admin access
    return NextResponse.next();
  }
  
  // For all other routes, just continue
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin'
  ],
};
