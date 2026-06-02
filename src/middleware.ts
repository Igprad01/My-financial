import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = process.env.JWT_SECRET || "rahasia-keuangan-app-super-aman-2024";
const key = new TextEncoder().encode(SECRET_KEY);

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;


  
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      console.log('[Middleware] No token found, redirecting to /login');
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      // Verify token validity
      await jwtVerify(token, key);
      console.log('[Middleware] Token is valid for dashboard access');
    } catch (error) {
      console.log('[Middleware] Token is invalid or expired, redirecting to /login', error);
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Prevent logged-in users from accessing the login page
  if (pathname === '/login') {
    if (token) {
      try {
        await jwtVerify(token, key);
        console.log('[Middleware] Valid token on /login, redirecting to /dashboard');
        return NextResponse.redirect(new URL('/dashboard', request.url));
      } catch (error) {
        console.log('[Middleware] Token invalid on /login, staying on page');
      }
    }
  }

  return NextResponse.next();
}

// Specify the paths where this middleware should run
export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};
