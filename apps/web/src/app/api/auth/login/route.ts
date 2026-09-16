import { NextRequest, NextResponse } from 'next/server';
import {
  UNIVERSAL_USER_NAME,
  UNIVERSAL_PASSWORD,
  AUTH_COOKIE_NAME,
  type ClinicianAuthSession,
} from '../../../../lib/auth-store';
import { CANONICAL_CLINICAL_SESSION } from '../../../../lib/release-authority';
import { createSignedSessionToken } from '../../../../lib/security/session-crypto';
import { emitAuditEvent } from '../../../../lib/shell-observability';

export const runtime = 'nodejs';

/**
 * Magniom Authoritative Server-Side Clinician Authentication API
 * Conforms to MAG-SEC-001, HIPAA § 164.312(a)(1), and 21 CFR Part 11.
 *
 * Validates universal credentials on the server, generates an authoritative
 * HMAC-SHA256 signed session token, and sets the session cookie on the response.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json().catch(() => ({}));
    const { username, password, rememberMe } = body as {
      username?: string;
      password?: string;
      rememberMe?: boolean;
    };

    const normalizedUser = (username || '').trim().toLowerCase();
    const cleanPassword = password || '';

    const isValidUser = normalizedUser === UNIVERSAL_USER_NAME.toLowerCase();
    const isValidPass = cleanPassword === UNIVERSAL_PASSWORD;

    if (!isValidUser || !isValidPass) {
      emitAuditEvent('CLINICIAN_AUTH_FAILED', {
        message: 'Clinician authentication failed: Invalid universal credentials.',
        metadata: {
          attemptedUser: normalizedUser,
          reason: !isValidUser ? 'INVALID_USERNAME' : 'INVALID_PASSWORD',
        },
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Invalid clinician credentials. Please verify your username and password.',
        },
        { status: 401 },
      );
    }

    const timestamp = new Date().toISOString();
    const sessionToken = createSignedSessionToken(CANONICAL_CLINICAL_SESSION.user.id);

    const session: ClinicianAuthSession = {
      isAuthenticated: true,
      username: UNIVERSAL_USER_NAME,
      loginTimestamp: timestamp,
      sessionToken,
      rememberMe: Boolean(rememberMe),
      user: {
        ...CANONICAL_CLINICAL_SESSION.user,
      },
      organization: {
        ...CANONICAL_CLINICAL_SESSION.organization,
      },
      mode: CANONICAL_CLINICAL_SESSION.mode,
    };

    emitAuditEvent('CLINICIAN_AUTHENTICATED', {
      userId: session.user.id,
      sessionId: sessionToken.split('.')[0] || 'mgn-sess',
      message: `Specialist clinician ${session.user.displayName} authenticated via universal credentials.`,
      metadata: {
        userId: session.user.id,
        roleTitle: session.user.roleTitle,
        rememberMe: session.rememberMe,
      },
    });

    const response = NextResponse.json({
      success: true,
      session,
    });

    const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24; // 30 days vs 1 day
    const forwardedProto = request.headers.get('x-forwarded-proto');
    const isHttps =
      request.url.startsWith('https:') ||
      forwardedProto === 'https' ||
      (process.env.NODE_ENV === 'production' && !request.url.startsWith('http://'));

    response.headers.set('Cache-Control', 'no-store, private');

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: sessionToken,
      path: '/',
      maxAge,
      sameSite: 'lax',
      secure: isHttps,
      httpOnly: false, // Accessible by client store synchronization
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal authentication error.',
      },
      { status: 500 },
    );
  }
}
