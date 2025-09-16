import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get the access token from cookies (backend sets 'access_token' cookie)
  const accessToken = request.cookies.get('access_token')?.value;
  
  console.log('Middleware: Processing request for', pathname, 'hasAccessToken:', !!accessToken);
  
  // Only handle dashboard and admin routes
  if (pathname.startsWith('/dashboard')) {
    // If it's a protected route and no access token, redirect to admin
    if (!accessToken) {
      console.log('Middleware: No access token, redirecting to admin');
      const adminUrl = new URL('/admin', request.url);
      adminUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(adminUrl);
    }
    // If user has access token, allow access to dashboard
    console.log('Middleware: Access token found, allowing dashboard access');
    return NextResponse.next();
  }
  
  if (pathname === '/admin') {
    // If user is on admin page and has access token, redirect to dashboard
    if (accessToken) {
      console.log('Middleware: Has access token, redirecting to dashboard');
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    // If no access token, allow access to admin page
    console.log('Middleware: No access token, allowing admin access');
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
