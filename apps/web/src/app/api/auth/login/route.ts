import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME } from '../../../../lib/auth-store';
import { createSignedSessionToken } from '../../../../lib/security/session-crypto';
import { emitAuditEvent } from '../../../../lib/shell-observability';
import { verifyClinicianCredentials } from '../../../../lib/server/auth-credentials';

export const runtime = 'nodejs';

/**
 * Magniom Authoritative Server-Side Clinician Authentication API
 * Conforms to MAG-SEC-001 (Mandatory authentication) and MAG-SEC-009 (Session Integrity).
 *
 * Validates credentials on the server, generates an authoritative
 * HMAC-SHA256 signed session token with claims & expiration,
 * and sets an HttpOnly session cookie on the response.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json().catch(() => ({}));
    const { username, password, rememberMe } = body as {
      username?: string;
      password?: string;
      rememberMe?: boolean;
    };

    const authResult = verifyClinicianCredentials(username || '', password || '');

    if (!authResult.valid || !authResult.session) {
      emitAuditEvent('CLINICIAN_AUTH_FAILED', {
        message: 'Clinician authentication failed.',
        metadata: {
          attemptedUser: (username || '').trim().toLowerCase(),
          reason: authResult.error || 'INVALID_CREDENTIALS',
        },
      });

      return NextResponse.json(
        {
          success: false,
          error:
            authResult.error ||
            'Invalid clinician credentials. Please verify your username and password.',
        },
        { status: 401 },
      );
    }

    const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 8; // 30 days vs 8 hours
    const sessionToken = createSignedSessionToken(authResult.session.user.id, {
      expiresInSeconds: maxAge,
      role: authResult.session.user.roleTitle,
    });

    const session = {
      ...authResult.session,
      sessionToken,
      rememberMe: Boolean(rememberMe),
    };

    emitAuditEvent('CLINICIAN_AUTHENTICATED', {
      userId: session.user.id,
      sessionId: sessionToken.split('.')[0] || 'mgn-sess',
      message: `Specialist clinician ${session.user.displayName} authenticated.`,
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
      httpOnly: true, // Secure: inaccessible by browser scripts, preventing XSS extraction
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
