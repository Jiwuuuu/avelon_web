/**
 * Next.js Proxy for Route Protection (Next.js 16+)
 * Unified RBAC: protects both admin and investor portal routes.
 */
import { NextRequest, NextResponse } from 'next/server';

// Routes that require authentication (prefix-matched)
const protectedPrefixes = ['/admin', '/investor/dashboard', '/investor/invest', '/investor/withdraw', '/investor/pool', '/investor/transactions', '/investor/earnings', '/investor/notifications', '/investor/profile', '/investor/help'];

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ['/login'];

/**
 * Proxy function - runs before every request
 * Named export required for Next.js 16+
 */
export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check for auth cookie
    const authCookie = request.cookies.get('avelon:authenticated');
    const isAuthenticated = authCookie?.value === 'true';

    // Check if current path is protected
    const isProtectedRoute = protectedPrefixes.some(route => pathname.startsWith(route));
    const isAuthRoute = authRoutes.some(route => pathname === route);

    // Redirect to login if not authenticated and trying to access protected route
    if (isProtectedRoute && !isAuthenticated) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('from', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Redirect to home if authenticated and trying to access auth routes
    // (actual role-based redirect happens client-side after reading user data)
    if (isAuthRoute && isAuthenticated) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (images, etc.)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$|.*\\.webp$).*)',
    ],
};
