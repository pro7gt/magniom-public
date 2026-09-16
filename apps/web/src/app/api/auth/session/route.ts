import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME } from '../../../../lib/auth-store';
import { CANONICAL_CLINICAL_SESSION } from '../../../../lib/release-authority';
import { verifySessionTokenWithClaims } from '../../../../lib/security/session-crypto';

export const runtime = 'nodejs';

/**
 * Magniom Authoritative Active Session Verification Endpoint
 * Reads the HttpOnly clinician session cookie and returns current session details.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const sessionCookie = request.cookies.get(AUTH_COOKIE_NAME);
  if (!sessionCookie || !sessionCookie.value) {
    return NextResponse.json(
      { isAuthenticated: false, error: 'No active session cookie found.' },
      { status: 401 },
    );
  }

  const verification = await verifySessionTokenWithClaims(sessionCookie.value);
  if (!verification.valid || !verification.claims) {
    const response = NextResponse.json(
      {
        isAuthenticated: false,
        error: 'Session expired or invalid signature.',
        reason: verification.reason,
      },
      { status: 401 },
    );
    // Clear invalid or expired cookie
    response.cookies.delete(AUTH_COOKIE_NAME);
    return response;
  }

  return NextResponse.json({
    isAuthenticated: true,
    user: CANONICAL_CLINICAL_SESSION.user,
    organization: CANONICAL_CLINICAL_SESSION.organization,
    mode: CANONICAL_CLINICAL_SESSION.mode,
    username: verification.claims.sub,
    issuedAt: new Date(verification.claims.iat * 1000).toISOString(),
    expiresAt: new Date(verification.claims.exp * 1000).toISOString(),
  });
}
