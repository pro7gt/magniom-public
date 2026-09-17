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
import {
  verifyClinicianCredentials,
  resetAuthLockoutsForTesting,
} from '../src/lib/server/auth-credentials';
import { sanitizeRedirectUrl } from '../src/lib/security/redirect-sanitizer';

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
    // Session token MUST NOT be exposed in JSON response (P0 finding #2)
    expect(json.session.sessionToken).toBeUndefined();

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

  it('AUTH-API-03: POST /api/auth/logout expires session cookie and revokes session server-side', async () => {
    // 1. Log in to establish an active session
    const loginReq = new NextRequest('https://app.magniom.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'dr_asmith',
        password: 'ClinicalPrecision2026!',
      }),
    });
    const loginRes = await loginRoute(loginReq);
    const token = loginRes.headers
      .get('set-cookie')
      ?.match(new RegExp(`${AUTH_COOKIE_NAME}=([^;]+)`))?.[1];
    expect(token).toBeDefined();

    // Verify session is initially valid
    const preLogoutCheck = await verifySessionTokenWithClaims(token);
    expect(preLogoutCheck.valid).toBe(true);

    // 2. Perform logout
    const logoutReq = new NextRequest('https://app.magniom.com/api/auth/logout', {
      method: 'POST',
      headers: {
        cookie: `${AUTH_COOKIE_NAME}=${token}`,
      },
    });

    const res = await logoutRoute(logoutReq);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);

    const cookieHeader = res.headers.get('set-cookie');
    expect(cookieHeader).toBeDefined();
    expect(cookieHeader?.toLowerCase()).toMatch(/max-age=0|expires=/);

    // 3. Server-side revocation verification: same token is now rejected with REVOKED
    const postLogoutVerification = await verifySessionTokenWithClaims(token);
    expect(postLogoutVerification.valid).toBe(false);
    expect(postLogoutVerification.reason).toBe('REVOKED');

    // 4. Session endpoint rejects revoked token
    const revokedSessionReq = new NextRequest('https://app.magniom.com/api/auth/session', {
      headers: {
        cookie: `${AUTH_COOKIE_NAME}=${token}`,
      },
    });
    const revokedRes = await sessionRoute(revokedSessionReq);
    expect(revokedRes.status).toBe(401);
    const revokedJson = await revokedRes.json();
    expect(revokedJson.reason).toBe('REVOKED');
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
    const result = await authStore.authenticateClinicianAsync(
      'dr_asmith',
      'ClinicalPrecision2026!',
    );
    expect(result.success).toBe(false);
    expect(result.error).toContain('unavailable');
    expect(authStore.isAuthenticated()).toBe(false);
  });

  it('AUTH-API-07: prevents open redirects and protocol-relative navigation after login', () => {
    expect(sanitizeRedirectUrl('//evil.com')).toBe('/');
    expect(sanitizeRedirectUrl('//evil.com/path')).toBe('/');
    expect(sanitizeRedirectUrl('/\\evil.com')).toBe('/');
    expect(sanitizeRedirectUrl('https://evil.com')).toBe('/');
    expect(sanitizeRedirectUrl('javascript:alert(1)')).toBe('/');
    expect(sanitizeRedirectUrl('/login')).toBe('/');
    expect(sanitizeRedirectUrl('/cases')).toBe('/cases');
    expect(sanitizeRedirectUrl('/evidence/viewer?id=src-001')).toBe('/evidence/viewer?id=src-001');
  });

  it('AUTH-API-08: production fails fast when clinician credentials are missing', () => {
    const prevEnv = process.env.NODE_ENV;
    const prevUser = process.env.MAGNIOM_CLINICIAN_USER;
    const prevPass = process.env.MAGNIOM_CLINICIAN_PASSWORD;
    try {
      (process.env as Record<string, string | undefined>).NODE_ENV = 'production';
      delete process.env.MAGNIOM_CLINICIAN_USER;
      delete process.env.MAGNIOM_CLINICIAN_PASSWORD;

      expect(() => {
        verifyClinicianCredentials('dr_asmith', 'ClinicalPrecision2026!');
      }).toThrow('CRITICAL SECURITY ERROR');
    } finally {
      (process.env as Record<string, string | undefined>).NODE_ENV = prevEnv;
      if (prevUser) process.env.MAGNIOM_CLINICIAN_USER = prevUser;
      if (prevPass) process.env.MAGNIOM_CLINICIAN_PASSWORD = prevPass;
    }
  });

  it('AUTH-API-09: authenticates secondary specialist credentials and respects environment overrides', () => {
    // Default specialist credentials in dev/test
    const resDefault = verifyClinicianCredentials('magniom_spec', 'Specialist2026!');
    expect(resDefault.valid).toBe(true);
    expect(resDefault.session?.username).toBe('magniom_spec');

    // Custom specialist credentials via environment variables
    const prevSpecUser = process.env.MAGNIOM_SPECIALIST_USER;
    const prevSpecPass = process.env.MAGNIOM_SPECIALIST_PASSWORD;
    try {
      process.env.MAGNIOM_SPECIALIST_USER = 'custom_spec';
      process.env.MAGNIOM_SPECIALIST_PASSWORD = 'CustomSpecPassword2026!';

      const resCustom = verifyClinicianCredentials('custom_spec', 'CustomSpecPassword2026!');
      expect(resCustom.valid).toBe(true);
      expect(resCustom.session?.username).toBe('custom_spec');

      const resOld = verifyClinicianCredentials('magniom_spec', 'Specialist2026!');
      expect(resOld.valid).toBe(false);
    } finally {
      if (prevSpecUser) process.env.MAGNIOM_SPECIALIST_USER = prevSpecUser;
      else delete process.env.MAGNIOM_SPECIALIST_USER;
      if (prevSpecPass) process.env.MAGNIOM_SPECIALIST_PASSWORD = prevSpecPass;
      else delete process.env.MAGNIOM_SPECIALIST_PASSWORD;
    }
  });
});
