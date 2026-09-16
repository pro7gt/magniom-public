import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME } from '../../../../lib/auth-store';
import { emitAuditEvent } from '../../../../lib/shell-observability';

export const runtime = 'nodejs';

/**
 * Magniom Authoritative Server-Side Clinician Sign-Out API
 * Conforms to MAG-SEC-001 and 21 CFR Part 11 session termination.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const sessionCookie = request.cookies.get(AUTH_COOKIE_NAME);

  emitAuditEvent('CLINICIAN_LOGGED_OUT', {
    sessionId: sessionCookie?.value,
    message: 'Clinician signed out via server API.',
  });

  const response = NextResponse.json({ success: true });
  response.headers.set('Cache-Control', 'no-store, private');

  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: '',
    path: '/',
    maxAge: 0,
    sameSite: 'lax',
  });

  return response;
}
