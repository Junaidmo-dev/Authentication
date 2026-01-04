import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const cookieName = 'secure_dash_session';
const key = new TextEncoder().encode(process.env.JWT_SECRET || 'default_secret_key_change_me');

// Routes that don't require authentication
const publicRoutes = ['/login', '/signup'];

// Routes that are API routes and should be handled differently
const apiAuthRoutes = ['/api/auth/me'];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip static files and Next.js internals
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/favicon.ico') ||
        pathname.includes('.')
    ) {
        return NextResponse.next();
    }

    const sessionCookie = request.cookies.get(cookieName)?.value;
    let isAuthenticated = false;

    if (sessionCookie) {
        try {
            await jwtVerify(sessionCookie, key, { algorithms: ['HS256'] });
            isAuthenticated = true;
        } catch {
            // Invalid or expired token
            isAuthenticated = false;
        }
    }

    const isPublicRoute = publicRoutes.includes(pathname);

    // If user is NOT authenticated and trying to access a protected route
    if (!isAuthenticated && !isPublicRoute) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('from', pathname); // Optional: redirect back after login
        return NextResponse.redirect(loginUrl);
    }

    // If user IS authenticated and trying to access login/signup pages
    if (isAuthenticated && isPublicRoute) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
