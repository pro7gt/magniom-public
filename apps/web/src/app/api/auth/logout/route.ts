import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME } from '../../../../lib/auth-store';
import { emitAuditEvent } from '../../../../lib/shell-observability';
import {
  verifySessionTokenWithClaims,
  hashJtiForAudit,
} from '../../../../lib/security/session-crypto';
import { revokeSession } from '../../../../lib/server/session-registry';

export const runtime = 'nodejs';

/**
 * Magniom Authoritative Server-Side Clinician Sign-Out API
 * Conforms to MAG-SEC-001 and 21 CFR Part 11 session termination.
 * Server-side revokes token jti and purges HttpOnly session cookie.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const sessionCookie = request.cookies.get(AUTH_COOKIE_NAME);
  let sessionAuditId = 'anonymous-logout';

  if (sessionCookie?.value) {
    const verification = await verifySessionTokenWithClaims(sessionCookie.value, undefined, {
      checkRevocation: false,
    });
    if (verification.claims?.jti) {
      revokeSession(verification.claims.jti, 'CLINICIAN_LOGOUT');
      sessionAuditId = hashJtiForAudit(verification.claims.jti);
    }
  }

  emitAuditEvent('CLINICIAN_LOGGED_OUT', {
    sessionId: sessionAuditId,
    message: 'Clinician signed out via server API.',
  });

  const forwardedProto = request.headers.get('x-forwarded-proto');
  const isHttps =
    request.url.startsWith('https:') ||
    forwardedProto === 'https' ||
    (process.env.NODE_ENV === 'production' && !request.url.startsWith('http://'));

  const response = NextResponse.json({ success: true });
  response.headers.set('Cache-Control', 'no-store, private');

  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: '',
    path: '/',
    maxAge: 0,
    expires: new Date(0),
    sameSite: 'lax',
    secure: isHttps,
    httpOnly: true,
  });

  return response;
}
