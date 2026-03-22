/**
 * Next.js Proxy for Route Protection (Next.js 16+)
 * Protects admin routes and handles auth redirects
 *
 * Investor portal routes (/investor/dashboard, etc.) are NOT gated here: demo auth
 * lives in localStorage and is enforced in `InvestorPortalLayout` (client). Server
 * middleware cannot read localStorage; cookie-based checks caused broken sign-in.
 */
import { NextRequest, NextResponse } from 'next/server';

// Routes that require authentication
const protectedRoutes = ['/admin'];

// Routes that should redirect to admin if already authenticated
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
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    const isAuthRoute = authRoutes.some(route => pathname === route);

    // Redirect to login if not authenticated and trying to access protected route
    if (isProtectedRoute && !isAuthenticated) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('from', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Redirect to admin if authenticated and trying to access auth routes
    if (isAuthRoute && isAuthenticated) {
        return NextResponse.redirect(new URL('/admin', request.url));
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
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)',
    ],
};
