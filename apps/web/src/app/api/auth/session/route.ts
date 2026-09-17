import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME } from '../../../../lib/auth-store';
import { CANONICAL_CLINICAL_SESSION } from '../../../../lib/release-authority';
import { verifySessionTokenWithClaims } from '../../../../lib/security/session-crypto';
import { touchSessionActivity, getServerSession } from '../../../../lib/server/session-registry';

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
        error: 'Session expired, revoked, or invalid signature.',
        reason: verification.reason,
      },
      { status: 401 },
    );
    // Clear invalid or expired cookie
    response.cookies.delete(AUTH_COOKIE_NAME);
    return response;
  }

  const serverSession = verification.claims.jti
    ? getServerSession(verification.claims.jti)
    : undefined;

  if (verification.claims.jti) {
    touchSessionActivity(verification.claims.jti);
  }

  const effectiveUsername =
    verification.claims.username ?? serverSession?.username ?? verification.claims.sub;
  const isSpecUser = effectiveUsername === 'magniom_spec';

  const userProfile = isSpecUser
    ? {
        id: 'usr-spec-002',
        displayName: 'Specialist Clinician',
        roleTitle: 'Consultant TMS Specialist',
        hasSigningAuthority: true,
        signingAuthorityLevel: 'Full Specialist Target Attestation (IEC 62304 / ISO 14971)',
        organizationId: 'org-melb-tms',
        organizationName: 'Melbourne TMS Centre',
        siteName: 'Site 1 — Surrey Hills Clinic',
        initials: 'SC',
      }
    : CANONICAL_CLINICAL_SESSION.user;

  return NextResponse.json({
    isAuthenticated: true,
    user: userProfile,
    organization: CANONICAL_CLINICAL_SESSION.organization,
    mode: CANONICAL_CLINICAL_SESSION.mode,
    username: effectiveUsername,
    issuedAt: new Date(verification.claims.iat * 1000).toISOString(),
    expiresAt: new Date(verification.claims.exp * 1000).toISOString(),
  });
}
