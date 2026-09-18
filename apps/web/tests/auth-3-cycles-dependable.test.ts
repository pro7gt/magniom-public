/**
 * @magniom/web - 3-Cycle Dependable User Login & Sign-Out Validation Test Suite
 * Conforms to MAG-SEC-001 (Mandatory authentication), MAG-SEC-009 (Session integrity),
 * and IEC 62304 / 21 CFR Part 11 electronic records and session termination requirements.
 *
 * Formally executes and validates at least 3 complete independent authentication and sign-out cycles.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { POST as loginRoute } from '../src/app/api/auth/login/route';
import { POST as logoutRoute } from '../src/app/api/auth/logout/route';
import { GET as sessionRoute } from '../src/app/api/auth/session/route';
import { middleware, AUTH_COOKIE_NAME } from '../src/middleware';
import { authStore } from '../src/lib/auth-store';
import { resetAuthLockoutsForTesting } from '../src/lib/server/auth-credentials';
import {
  isSessionRevoked,
  getSessionStatus,
  resetSessionRegistryForTesting,
} from '../src/lib/server/session-registry';
import {
  verifySessionTokenWithClaims,
  setGlobalSessionRevocationChecker,
} from '../src/lib/security/session-crypto';

const TEST_STORE_DIR = path.join(process.cwd(), '.temp', 'test-auth-3-cycles');
const TEST_STORE_FILE = path.join(TEST_STORE_DIR, 'session-store.json');

describe('3-Cycle Dependable Login and Sign-Out Lifecycle Validation', () => {
  const originalEnv = process.env.MAGNIOM_SESSION_STORE_PATH;

  beforeEach(() => {
    process.env.MAGNIOM_SESSION_STORE_PATH = TEST_STORE_FILE;
    if (!fs.existsSync(TEST_STORE_DIR)) {
      fs.mkdirSync(TEST_STORE_DIR, { recursive: true });
    }
    if (fs.existsSync(TEST_STORE_FILE)) {
      fs.unlinkSync(TEST_STORE_FILE);
    }
    authStore.logoutClinician();
    resetAuthLockoutsForTesting();
    resetSessionRegistryForTesting();
    setGlobalSessionRevocationChecker(isSessionRevoked);
  });

  afterEach(() => {
    authStore.logoutClinician();
    resetSessionRegistryForTesting();
    resetAuthLockoutsForTesting();
    if (originalEnv !== undefined) {
      process.env.MAGNIOM_SESSION_STORE_PATH = originalEnv;
    } else {
      delete process.env.MAGNIOM_SESSION_STORE_PATH;
    }
    if (fs.existsSync(TEST_STORE_FILE)) {
      try {
        fs.unlinkSync(TEST_STORE_FILE);
      } catch {}
    }
  });

  it('performs 3 consecutive, authoritative cycles of login, authorization, session verification, and sign-out', async () => {
    const priorJtis: string[] = [];

    for (let cycle = 1; cycle <= 3; cycle++) {
      // 1. Initial State: Unauthenticated access to / is redirected to /login
      const unauthReq = new NextRequest('https://app.magniom.com/');
      const unauthRes = await middleware(unauthReq);
      expect(unauthRes.status).toBe(307);
      expect(unauthRes.headers.get('location')).toBe('https://app.magniom.com/login');

      // 2. Perform Login via /api/auth/login
      const loginReq = new NextRequest('https://app.magniom.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'dr_asmith',
          password: 'ClinicalPrecision2026!',
          rememberMe: true,
        }),
      });

      const loginRes = await loginRoute(loginReq);
      expect(loginRes.status).toBe(200);

      const loginJson = await loginRes.json();
      expect(loginJson.success).toBe(true);
      expect(loginJson.session.isAuthenticated).toBe(true);
      expect(loginJson.session.username).toBe('dr_asmith');
      expect(loginJson.session.user.displayName).toBe('Dr A. Smith');
      expect(loginJson.session.user.roleTitle).toBe('TMS Specialist & Clinical Reviewer');

      // Extract set-cookie
      const cookieHeader = loginRes.headers.get('set-cookie');
      expect(cookieHeader).toBeDefined();
      expect(cookieHeader).toContain(AUTH_COOKIE_NAME);
      expect(cookieHeader?.toLowerCase()).toContain('httponly');

      const tokenMatch = cookieHeader?.match(new RegExp(`${AUTH_COOKIE_NAME}=([^;]+)`));
      expect(tokenMatch).not.toBeNull();
      const token = tokenMatch![1];

      // Verify token claims & uniqueness across cycles
      const tokenVerify = await verifySessionTokenWithClaims(token);
      expect(tokenVerify.valid).toBe(true);
      expect(tokenVerify.claims?.sub).toBe('usr-spec-001');
      const jti = tokenVerify.claims!.jti;
      expect(priorJtis.includes(jti)).toBe(false);
      priorJtis.push(jti);
      expect(isSessionRevoked(jti)).toBe(false);
      expect(getSessionStatus(jti)).toBe('active');

      // 3. Introspect active session via /api/auth/session
      const sessionReq = new NextRequest('https://app.magniom.com/api/auth/session', {
        headers: { cookie: `${AUTH_COOKIE_NAME}=${token}` },
      });
      const sessionRes = await sessionRoute(sessionReq);
      expect(sessionRes.status).toBe(200);
      const sessionJson = await sessionRes.json();
      expect(sessionJson.isAuthenticated).toBe(true);
      expect(sessionJson.user.displayName).toBe('Dr A. Smith');

      // 4. Access protected workspace route through middleware
      const authReq = new NextRequest('https://app.magniom.com/', {
        headers: { cookie: `${AUTH_COOKIE_NAME}=${token}` },
      });
      const authRes = await middleware(authReq);
      expect(authRes.status).toBe(200);
      expect(authRes.headers.get('x-magniom-authenticated')).toBe('1');

      // 5. Authoritative Sign-Out via /api/auth/logout
      const logoutReq = new NextRequest('https://app.magniom.com/api/auth/logout', {
        method: 'POST',
        headers: {
          cookie: `${AUTH_COOKIE_NAME}=${token}`,
        },
      });
      const logoutRes = await logoutRoute(logoutReq);
      expect(logoutRes.status).toBe(200);
      const logoutJson = await logoutRes.json();
      expect(logoutJson.success).toBe(true);

      // Verify Set-Cookie purges session cookie
      const purgeCookie = logoutRes.headers.get('set-cookie');
      expect(purgeCookie).toBeDefined();
      expect(purgeCookie).toContain(`${AUTH_COOKIE_NAME}=;`);
      expect(purgeCookie?.toLowerCase()).toContain('max-age=0');

      // 6. Verify JTI is permanently revoked
      expect(isSessionRevoked(jti)).toBe(true);
      expect(getSessionStatus(jti)).toBe('revoked');

      // 7. Verify revoked token can no longer access protected route
      const postLogoutReq = new NextRequest('https://app.magniom.com/cases', {
        headers: { cookie: `${AUTH_COOKIE_NAME}=${token}` },
      });
      const postLogoutRes = await middleware(postLogoutReq);
      expect(postLogoutRes.status).toBe(307);
      expect(postLogoutRes.headers.get('location')).toBe(
        'https://app.magniom.com/login?redirect=%2Fcases',
      );

      // 8. Verify session endpoint rejects revoked token
      const revokedSessionReq = new NextRequest('https://app.magniom.com/api/auth/session', {
        headers: { cookie: `${AUTH_COOKIE_NAME}=${token}` },
      });
      const revokedSessionRes = await sessionRoute(revokedSessionReq);
      expect(revokedSessionRes.status).toBe(401);
    }

    expect(priorJtis.length).toBe(3);
  });
});
