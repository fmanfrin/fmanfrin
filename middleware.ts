import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Public routes that don't require authentication
const publicRoutes = ['/login', '/signup', '/forgot-password', '/reset-password'];

// Routes that require authentication
const protectedRoutes = ['/app', '/admin', '/manager', '/dashboard'];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if route is public
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // Check if route requires authentication
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  // Get session from request cookies
  const session = request.cookies.get('sb-access-token');

  // If trying to access protected route without session, redirect to login
  if (isProtectedRoute && !session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If trying to access public auth routes with session, redirect to app
  if (isPublicRoute && pathname !== '/' && session) {
    return NextResponse.redirect(new URL('/app/dashboard', request.url));
  }

  // Continue with the request
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
