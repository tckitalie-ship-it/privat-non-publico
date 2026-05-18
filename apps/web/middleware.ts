import { NextRequest, NextResponse } from 'next/server';

const protectedRoutes = [
  '/dashboard',
  '/events',
  '/members',
  '/finance',
  '/settings',
  '/associations',
];

const guestRoutes = ['/login'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token');

  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  const isGuestRoute = guestRoutes.some((route) =>
    pathname.startsWith(route),
  );

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isGuestRoute && token) {
    return NextResponse.redirect(
      new URL('/dashboard', request.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/events/:path*',
    '/members/:path*',
    '/finance/:path*',
    '/settings/:path*',
    '/associations/:path*',
    '/login',
  ],
};