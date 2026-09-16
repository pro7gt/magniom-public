/**
 * @magniom/web - Authoritative Server-Side Auth API Endpoints Test Suite
 * Conforms to MAG-SEC-001 (Mandatory authentication) and MAG-SEC-009 (Session integrity).
 *
 * Verifies:
 * 1. POST /api/auth/login with valid credentials returns 200, valid session, and sets HttpOnly cookie.
 * 2. POST /api/auth/login with invalid credentials returns 401 with error message.
 * 3. POST /api/auth/logout clears session cookie.
 * 4. GET /api/auth/session verifies active session via cookie.
 * 5. Edge middleware allows unauthenticated access to /api/auth/login, /logout, /session.
 * 6. authStore.authenticateClinicianAsync fails closed when server/fetch fails (no offline fallback).
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as loginRoute } from '../src/app/api/auth/login/route';
import { POST as logoutRoute } from '../src/app/api/auth/logout/route';
import { GET as sessionRoute } from '../src/app/api/auth/session/route';
import { middleware, AUTH_COOKIE_NAME } from '../src/middleware';
import { authStore } from '../src/lib/auth-store';
import { verifySessionTokenWithClaims } from '../src/lib/security/session-crypto';
import { resetAuthLockoutsForTesting } from '../src/lib/server/auth-credentials';

describe('Server-Side Authentication API Endpoints', () => {
  beforeEach(() => {
    authStore.logoutClinician();
    resetAuthLockoutsForTesting();
  });

  it('AUTH-API-01: POST /api/auth/login issues valid session and HttpOnly session cookie on valid credentials', async () => {
    const req = new NextRequest('https://app.magniom.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'dr_asmith',
        password: 'ClinicalPrecision2026!',
        rememberMe: true,
      }),
    });

    const res = await loginRoute(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.session).toBeDefined();
    expect(json.session.isAuthenticated).toBe(true);
    expect(json.session.username).toBe('dr_asmith');
    expect(json.session.user.displayName).toBe('Dr A. Smith');

    const cookieHeader = res.headers.get('set-cookie');
    expect(cookieHeader).toBeDefined();
    expect(cookieHeader).toContain(AUTH_COOKIE_NAME);
    // Assert HttpOnly flag is set
    expect(cookieHeader?.toLowerCase()).toContain('httponly');

    // Verify cryptographic signature and claims of issued cookie
    const match = cookieHeader?.match(new RegExp(`${AUTH_COOKIE_NAME}=([^;]+)`));
    expect(match).not.toBeNull();
    const token = match![1];
    const verification = await verifySessionTokenWithClaims(token);
    expect(verification.valid).toBe(true);
    expect(verification.claims?.sub).toBe('usr-spec-001');
  });

  it('AUTH-API-02: POST /api/auth/login rejects invalid credentials with 401', async () => {
    const req = new NextRequest('https://app.magniom.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'dr_asmith',
        password: 'wrong_password',
      }),
    });

    const res = await loginRoute(req);
    expect(res.status).toBe(401);

    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toContain('Invalid clinician credentials');
  });

  it('AUTH-API-03: POST /api/auth/logout expires session cookie', async () => {
    const req = new NextRequest('https://app.magniom.com/api/auth/logout', {
      method: 'POST',
    });

    const res = await logoutRoute(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);

    const cookieHeader = res.headers.get('set-cookie');
    expect(cookieHeader).toBeDefined();
    expect(cookieHeader?.toLowerCase()).toMatch(/max-age=0|expires=/);
  });

  it('AUTH-API-04: GET /api/auth/session validates active HttpOnly cookie', async () => {
    // 1. Unauthenticated request returns 401
    const unauthReq = new NextRequest('https://app.magniom.com/api/auth/session');
    const unauthRes = await sessionRoute(unauthReq);
    expect(unauthRes.status).toBe(401);

    // 2. Authenticated request with valid cookie returns 200
    const loginReq = new NextRequest('https://app.magniom.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'dr_asmith',
        password: 'ClinicalPrecision2026!',
      }),
    });
    const loginRes = await loginRoute(loginReq);
    const setCookie = loginRes.headers.get('set-cookie');
    const token = setCookie?.match(new RegExp(`${AUTH_COOKIE_NAME}=([^;]+)`))?.[1];

    const authReq = new NextRequest('https://app.magniom.com/api/auth/session', {
      headers: {
        cookie: `${AUTH_COOKIE_NAME}=${token}`,
      },
    });
    const authRes = await sessionRoute(authReq);
    expect(authRes.status).toBe(200);
    const authJson = await authRes.json();
    expect(authJson.isAuthenticated).toBe(true);
    expect(authJson.user.displayName).toBe('Dr A. Smith');
  });

  it('AUTH-API-05: Edge middleware allows access to public auth endpoints', async () => {
    const loginReq = new NextRequest('https://app.magniom.com/api/auth/login');
    const loginRes = await middleware(loginReq);
    expect(loginRes.status).toBe(200);

    const sessionReq = new NextRequest('https://app.magniom.com/api/auth/session');
    const sessionRes = await middleware(sessionReq);
    expect(sessionRes.status).toBe(200);

    const logoutReq = new NextRequest('https://app.magniom.com/api/auth/logout');
    const logoutRes = await middleware(logoutReq);
    expect(logoutRes.status).toBe(200);
  });

  it('AUTH-API-06: authStore fails closed and denies access when server is unreachable (no offline fallback)', async () => {
    // In node/vitest test environment where window fetch to relative URL fails or is mocked to fail
    const result = await authStore.authenticateClinicianAsync(
      'dr_asmith',
      'ClinicalPrecision2026!',
    );
    // If fetch fails (because no local server is listening on relative /api/auth/login in unit test),
    // it must return failure, NOT authenticate client-side!
    expect(result.success).toBe(false);
    expect(result.error).toContain('unavailable');
    expect(authStore.isAuthenticated()).toBe(false);
  });
});
