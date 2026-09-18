import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionToken } from './lib/security/session-crypto';

export const AUTH_COOKIE_NAME = 'magniom_session';

/**
 * Magniom Authoritative Edge Authentication & Access Control Middleware
 * Conforms to MAG-SEC-001 (Mandatory authentication for clinical routes)
 * and HIPAA Security Rule (§ 164.312(a)(1)).
 *
 * Rules:
 * - Public routes: /login, /api/health (public liveness probe)
 * - Protected API routes: /api/* -> Returns HTTP 401 Unauthorized JSON and clears invalid cookie
 * - Protected Page routes: /, /cases, /evidence, /decisions, /admin, etc. -> Redirects to /login?redirect=<path> and clears invalid cookie
 * - Authenticated requests: Pass downstream with authentication confirmation header
 */
export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname, search } = request.nextUrl;

  // 1. Allow login portal, explicitly allowlisted public auth endpoints, static assets, and public system health checks
  const isPublicAuthRoute =
    pathname === '/api/auth/login' ||
    pathname === '/api/auth/logout' ||
    pathname === '/api/auth/session';

  const isStaticAsset =
    pathname.startsWith('/_next/') ||
    /\.(?:png|jpg|jpeg|gif|webp|svg|ico|woff|woff2|ttf|eot|css|js|json|map)$/i.test(pathname);

  if (
    pathname.startsWith('/login') ||
    isPublicAuthRoute ||
    pathname === '/api/health' ||
    isStaticAsset
  ) {
    return NextResponse.next();
  }

  // 2. Evaluate clinician session cookie using Web Crypto HMAC-SHA256
  const sessionCookie = request.cookies.get(AUTH_COOKIE_NAME);
  const isValidSession = sessionCookie ? await verifySessionToken(sessionCookie.value) : false;

  if (!isValidSession) {
    // Dedicated 401 for API endpoints
    if (pathname.startsWith('/api/')) {
      const apiResponse = NextResponse.json(
        {
          error: 'Unauthorized: Authorised clinician session required.',
          code: 'MAG-AUTH-401',
          timestamp: new Date().toISOString(),
          requestedPath: pathname,
        },
        {
          status: 401,
          headers: {
            'WWW-Authenticate': 'Bearer realm="magniom-clinician-session"',
            'Cache-Control': 'no-store, private',
          },
        },
      );
      if (sessionCookie) {
        apiResponse.cookies.delete(AUTH_COOKIE_NAME);
      }
      return apiResponse;
    }

    // Redirect to /login preserving intended destination
    const redirectUrl = new URL('/login', request.url);
    const fullTarget = pathname + (search || '');
    if (fullTarget && fullTarget !== '/' && !fullTarget.startsWith('/login')) {
      redirectUrl.searchParams.set('redirect', fullTarget);
    }

    const redirectResponse = NextResponse.redirect(redirectUrl);
    redirectResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    redirectResponse.headers.set('Pragma', 'no-cache');
    if (sessionCookie) {
      redirectResponse.cookies.delete(AUTH_COOKIE_NAME);
    }
    return redirectResponse;
  }

  // 3. Authenticated specialist session active -> proceed
  const response = NextResponse.next();
  response.headers.set('x-magniom-authenticated', '1');
  return response;
}

export const config = {
  matcher: [
    /*
     * Intercept all request paths except:
     * - _next/static (static JS/CSS files)
     * - _next/image (image optimization files)
     * - Static asset files (favicons, icons, manifest, public media)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|favicon\\.svg|icon\\.svg|apple-touch-icon\\.png|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|woff|woff2|ttf|eot|css|js|json|map)$).*)',
  ],
};
