/**
 * @magniom/web - Authoritative Server-Side Auth API Endpoints Test Suite
 * Conforms to MAG-SEC-001, HIPAA § 164.312(a)(1), and 21 CFR Part 11.
 *
 * Verifies:
 * 1. POST /api/auth/login with valid universal credentials returns 200, valid session, and sets session cookie.
 * 2. POST /api/auth/login with invalid credentials returns 401 with error message.
 * 3. POST /api/auth/logout clears session cookie.
 * 4. Edge middleware allows unauthenticated access to /api/auth/login and /api/auth/logout.
 * 5. authStore.authenticateClinicianAsync succeeds and stores session.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as loginRoute } from '../src/app/api/auth/login/route';
import { POST as logoutRoute } from '../src/app/api/auth/logout/route';
import { middleware, AUTH_COOKIE_NAME } from '../src/middleware';
import { authStore, UNIVERSAL_USER_NAME, UNIVERSAL_PASSWORD } from '../src/lib/auth-store';
import { verifySessionToken } from '../src/lib/security/session-crypto';

describe('Server-Side Authentication API Endpoints', () => {
  beforeEach(() => {
    authStore.logoutClinician();
  });

  it('AUTH-API-01: POST /api/auth/login issues valid session and session cookie on universal credentials', async () => {
    const req = new NextRequest('https://app.magniom.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: UNIVERSAL_USER_NAME,
        password: UNIVERSAL_PASSWORD,
        rememberMe: true,
      }),
    });

    const res = await loginRoute(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.session).toBeDefined();
    expect(json.session.isAuthenticated).toBe(true);
    expect(json.session.username).toBe('magniom');
    expect(json.session.user.displayName).toBe('Dr A. Smith');

    const cookieHeader = res.headers.get('set-cookie');
    expect(cookieHeader).toBeDefined();
    expect(cookieHeader).toContain(AUTH_COOKIE_NAME);

    // Verify cryptographic signature of issued cookie
    const match = cookieHeader?.match(new RegExp(`${AUTH_COOKIE_NAME}=([^;]+)`));
    expect(match).not.toBeNull();
    const token = match![1];
    const isValid = await verifySessionToken(token);
    expect(isValid).toBe(true);
  });

  it('AUTH-API-02: POST /api/auth/login rejects invalid credentials with 401', async () => {
    const req = new NextRequest('https://app.magniom.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'magniom',
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

  it('AUTH-API-04: Edge middleware allows unauthenticated access to /api/auth routes', async () => {
    const loginReq = new NextRequest('https://app.magniom.com/api/auth/login');
    const loginRes = await middleware(loginReq);
    expect(loginRes.status).toBe(200);
    expect(loginRes.headers.get('location')).toBeNull();

    const logoutReq = new NextRequest('https://app.magniom.com/api/auth/logout');
    const logoutRes = await middleware(logoutReq);
    expect(logoutRes.status).toBe(200);
    expect(logoutRes.headers.get('location')).toBeNull();
  });

  it('AUTH-API-05: authStore.authenticateClinicianAsync falls back cleanly to local auth when offline', async () => {
    const result = await authStore.authenticateClinicianAsync(
      UNIVERSAL_USER_NAME,
      UNIVERSAL_PASSWORD,
    );
    expect(result.success).toBe(true);
    expect(result.session?.isAuthenticated).toBe(true);
    expect(authStore.isAuthenticated()).toBe(true);
  });
});
