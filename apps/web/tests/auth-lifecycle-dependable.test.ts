/**
 * @magniom/web - Dependable User Login & Sign-Out Verification Suite
 * Conforms to MAG-SEC-001 (Mandatory authentication), MAG-SEC-009 (Session integrity),
 * and IEC 62304 / 21 CFR Part 11 electronic records and session termination requirements.
 *
 * Verifies the authoritative end-to-end lifecycle:
 * 1. Initial unauthenticated access rejection & redirection.
 * 2. Authoritative server credential verification & cryptographic token issuance.
 * 3. Protected route authorization with secure HttpOnly cookies.
 * 4. Active session introspection and profile accuracy.
 * 5. Authoritative server sign-out with RFC 6265bis-compliant cookie purging.
 * 6. Immediate post-logout session rejection & protected route re-interception.
 * 7. Re-authentication freshness and non-reuse of revoked JTIs.
 * 8. Sign-out idempotency across edge/corrupt/missing cookie conditions.
 * 9. Brute-force rate limiting & temporary account lockout defense.
 * 10. Open redirect immunization on post-login redirection targets.
 * 11. Cross-process revocation synchronization via transactional durable store.
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
import {
  verifyClinicianCredentials,
  resetAuthLockoutsForTesting,
} from '../src/lib/server/auth-credentials';
import {
  registerServerSession,
  isSessionRevoked,
  revokeSession,
  getSessionStatus,
  getServerSession,
  resetSessionRegistryForTesting,
  type ServerSessionRecord,
} from '../src/lib/server/session-registry';
import {
  createSignedSessionToken,
  verifySessionTokenWithClaims,
  verifySessionToken,
  setGlobalSessionRevocationChecker,
} from '../src/lib/security/session-crypto';
import { sanitizeRedirectUrl } from '../src/lib/security/redirect-sanitizer';
import { CANONICAL_CLINICAL_SESSION } from '../src/lib/release-authority';

const TEST_STORE_DIR = path.join(process.cwd(), '.temp', 'test-auth-lifecycle-dependable');
const TEST_STORE_FILE = path.join(TEST_STORE_DIR, 'session-store.json');

describe('Dependable User Login & Sign-Out Lifecycle Suite', () => {
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

  it('AUTH-DEP-01: complete round-trip user login, protected authorization, and authoritative sign-out', async () => {
    // ------------------------------------------------------------------------
    // Step 1: Initial unauthenticated request to /cases is intercepted and redirected
    // ------------------------------------------------------------------------
    const unauthReq = new NextRequest('https://app.magniom.com/cases');
    const unauthRes = await middleware(unauthReq);
    expect(unauthRes.status).toBe(307);
    expect(unauthRes.headers.get('location')).toBe(
      'https://app.magniom.com/login?redirect=%2Fcases',
    );

    // ------------------------------------------------------------------------
    // Step 2: Authoritative Login with valid specialist credentials
    // ------------------------------------------------------------------------
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
    expect(loginJson.session).toBeDefined();
    expect(loginJson.session.isAuthenticated).toBe(true);
    expect(loginJson.session.username).toBe('dr_asmith');
    expect(loginJson.session.user.displayName).toBe('Dr A. Smith');
    expect(loginJson.session.user.hasSigningAuthority).toBe(true);
    expect(loginJson.session.sessionToken).toBeUndefined(); // Never leaked in JSON

    // Verify Set-Cookie header contains HttpOnly, Path=/, SameSite=lax, Secure
    const cookieHeader = loginRes.headers.get('set-cookie');
    expect(cookieHeader).toBeDefined();
    expect(cookieHeader).toContain(AUTH_COOKIE_NAME);
    expect(cookieHeader?.toLowerCase()).toContain('httponly');
    expect(cookieHeader?.toLowerCase()).toContain('samesite=lax');
    expect(cookieHeader?.toLowerCase()).toContain('path=/');

    const tokenMatch = cookieHeader?.match(new RegExp(`${AUTH_COOKIE_NAME}=([^;]+)`));
    expect(tokenMatch).not.toBeNull();
    const token = tokenMatch![1];

    // Verify cryptographic token properties & server session registration
    const tokenVerify = await verifySessionTokenWithClaims(token);
    expect(tokenVerify.valid).toBe(true);
    expect(tokenVerify.claims?.sub).toBe('usr-spec-001');
    expect(tokenVerify.claims?.username).toBe('dr_asmith');
    expect(tokenVerify.claims?.iss).toBe('magniom-authority');
    expect(tokenVerify.claims?.jti).toBeDefined();
    const initialJti = tokenVerify.claims!.jti;

    expect(isSessionRevoked(initialJti)).toBe(false);
    expect(getSessionStatus(initialJti)).toBe('active');

    // ------------------------------------------------------------------------
    // Step 3: Session Introspection Endpoint validates active cookie
    // ------------------------------------------------------------------------
    const sessionReq = new NextRequest('https://app.magniom.com/api/auth/session', {
      headers: { cookie: `${AUTH_COOKIE_NAME}=${token}` },
    });
    const sessionRes = await sessionRoute(sessionReq);
    expect(sessionRes.status).toBe(200);

    const sessionJson = await sessionRes.json();
    expect(sessionJson.isAuthenticated).toBe(true);
    expect(sessionJson.username).toBe('dr_asmith');
    expect(sessionJson.user.displayName).toBe('Dr A. Smith');
    expect(sessionJson.organization.organizationName).toBe('Melbourne TMS Centre');

    // ------------------------------------------------------------------------
    // Step 4: Protected routes permit authenticated requests with downstream header
    // ------------------------------------------------------------------------
    const protectedRoutes = ['/cases', '/evidence', '/decisions', '/admin'];
    for (const route of protectedRoutes) {
      const authReq = new NextRequest(`https://app.magniom.com${route}`, {
        headers: { cookie: `${AUTH_COOKIE_NAME}=${token}` },
      });
      const authRes = await middleware(authReq);
      expect(authRes.status).toBe(200);
      expect(authRes.headers.get('location')).toBeNull();
      expect(authRes.headers.get('x-magniom-authenticated')).toBe('1');
    }

    // ------------------------------------------------------------------------
    // Step 5: Authoritative Sign-Out (POST /api/auth/logout)
    // ------------------------------------------------------------------------
    const logoutReq = new NextRequest('https://app.magniom.com/api/auth/logout', {
      method: 'POST',
      headers: { cookie: `${AUTH_COOKIE_NAME}=${token}` },
    });

    const logoutRes = await logoutRoute(logoutReq);
    expect(logoutRes.status).toBe(200);

    const logoutJson = await logoutRes.json();
    expect(logoutJson.success).toBe(true);

    // RFC 6265bis: logout cookie MUST match HttpOnly, Secure, SameSite, and set Max-Age=0 / expired
    const logoutCookie = logoutRes.headers.get('set-cookie');
    expect(logoutCookie).toBeDefined();
    expect(logoutCookie?.toLowerCase()).toMatch(/max-age=0|expires=/);
    expect(logoutCookie?.toLowerCase()).toContain('httponly');
    expect(logoutCookie?.toLowerCase()).toContain('secure');
    expect(logoutCookie?.toLowerCase()).toContain('samesite=lax');

    // JTI is strictly revoked on the server
    expect(isSessionRevoked(initialJti)).toBe(true);
    expect(getSessionStatus(initialJti)).toBe('revoked');

    // ------------------------------------------------------------------------
    // Step 6: Post-Logout Rejection & Redirection Verification
    // ------------------------------------------------------------------------
    // Session endpoint now rejects the revoked token with 401
    const postLogoutSessionReq = new NextRequest('https://app.magniom.com/api/auth/session', {
      headers: { cookie: `${AUTH_COOKIE_NAME}=${token}` },
    });
    const postLogoutSessionRes = await sessionRoute(postLogoutSessionReq);
    expect(postLogoutSessionRes.status).toBe(401);
    const postLogoutSessionJson = await postLogoutSessionRes.json();
    expect(postLogoutSessionJson.reason).toBe('REVOKED');

    // Middleware rejects request on protected route with revoked token and redirects to /login
    const postLogoutCasesReq = new NextRequest('https://app.magniom.com/cases', {
      headers: { cookie: `${AUTH_COOKIE_NAME}=${token}` },
    });
    const postLogoutCasesRes = await middleware(postLogoutCasesReq);
    expect(postLogoutCasesRes.status).toBe(307);
    expect(postLogoutCasesRes.headers.get('location')).toBe(
      'https://app.magniom.com/login?redirect=%2Fcases',
    );

    // Cryptographic verification fails
    expect(await verifySessionToken(token)).toBe(false);
  });

  it('AUTH-DEP-02: re-authentication generates fresh cryptographic JTI while keeping prior JTI tombstoned', async () => {
    // 1. Initial login
    const loginReq1 = new NextRequest('https://app.magniom.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'dr_asmith',
        password: 'ClinicalPrecision2026!',
      }),
    });
    const loginRes1 = await loginRoute(loginReq1);
    const token1 = loginRes1.headers
      .get('set-cookie')!
      .match(new RegExp(`${AUTH_COOKIE_NAME}=([^;]+)`))![1];
    const claims1 = (await verifySessionTokenWithClaims(token1)).claims!;
    const jti1 = claims1.jti;

    // 2. Sign out
    const logoutReq = new NextRequest('https://app.magniom.com/api/auth/logout', {
      method: 'POST',
      headers: { cookie: `${AUTH_COOKIE_NAME}=${token1}` },
    });
    await logoutRoute(logoutReq);
    expect(isSessionRevoked(jti1)).toBe(true);

    // 3. Re-login with valid credentials
    const loginReq2 = new NextRequest('https://app.magniom.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'dr_asmith',
        password: 'ClinicalPrecision2026!',
      }),
    });
    const loginRes2 = await loginRoute(loginReq2);
    expect(loginRes2.status).toBe(200);
    const token2 = loginRes2.headers
      .get('set-cookie')!
      .match(new RegExp(`${AUTH_COOKIE_NAME}=([^;]+)`))![1];
    const claims2 = (await verifySessionTokenWithClaims(token2)).claims!;
    const jti2 = claims2.jti;

    // JTIs MUST be distinct
    expect(jti2).not.toBe(jti1);

    // Prior JTI remains permanently revoked (tombstoned)
    expect(isSessionRevoked(jti1)).toBe(true);
    expect(await verifySessionToken(token1)).toBe(false);

    // New session is active and valid
    expect(isSessionRevoked(jti2)).toBe(false);
    expect(await verifySessionToken(token2)).toBe(true);
  });

  it('AUTH-DEP-03: sign-out endpoint is idempotent and fault-tolerant', async () => {
    // 1. Sign out without any cookie returns 200 and expires cookie
    const anonReq = new NextRequest('https://app.magniom.com/api/auth/logout', { method: 'POST' });
    const anonRes = await logoutRoute(anonReq);
    expect(anonRes.status).toBe(200);
    expect((await anonRes.json()).success).toBe(true);
    expect(anonRes.headers.get('set-cookie')?.toLowerCase()).toMatch(/max-age=0|expires=/);

    // 2. Sign out with malformed cookie returns 200 without error
    const corruptReq = new NextRequest('https://app.magniom.com/api/auth/logout', {
      method: 'POST',
      headers: { cookie: `${AUTH_COOKIE_NAME}=malformed.bad-token` },
    });
    const corruptRes = await logoutRoute(corruptReq);
    expect(corruptRes.status).toBe(200);
    expect((await corruptRes.json()).success).toBe(true);

    // 3. Sign out with already-revoked session succeeds cleanly
    const token = createSignedSessionToken('usr-spec-001', { expiresInSeconds: 3600 });
    const claims = (await verifySessionTokenWithClaims(token)).claims!;
    revokeSession(claims.jti, 'ADMIN_FORCE_REVOKE');

    const doubleLogoutReq = new NextRequest('https://app.magniom.com/api/auth/logout', {
      method: 'POST',
      headers: { cookie: `${AUTH_COOKIE_NAME}=${token}` },
    });
    const doubleLogoutRes = await logoutRoute(doubleLogoutReq);
    expect(doubleLogoutRes.status).toBe(200);
    expect((await doubleLogoutRes.json()).success).toBe(true);
  });

  it('AUTH-DEP-04: brute-force rate limiting enforces temporary account lockout', async () => {
    // 4 failed attempts
    for (let i = 1; i <= 4; i++) {
      const res = verifyClinicianCredentials('dr_asmith', 'wrong-pass');
      expect(res.valid).toBe(false);
      expect(res.error).toContain('remaining');
    }

    // 5th failed attempt triggers lockout
    const fifthRes = verifyClinicianCredentials('dr_asmith', 'wrong-pass');
    expect(fifthRes.valid).toBe(false);
    expect(fifthRes.error).toContain('Account locked');

    // 6th attempt with valid password is blocked
    const sixthRes = verifyClinicianCredentials('dr_asmith', 'ClinicalPrecision2026!');
    expect(sixthRes.valid).toBe(false);
    expect(sixthRes.error).toContain('temporarily locked');

    // Unlock clears lockout and permits login
    resetAuthLockoutsForTesting();
    const validRes = verifyClinicianCredentials('dr_asmith', 'ClinicalPrecision2026!');
    expect(validRes.valid).toBe(true);
  });

  it('AUTH-DEP-05: handles case-insensitive usernames and trims surrounding whitespace', () => {
    const uppercase = verifyClinicianCredentials('DR_ASMITH', 'ClinicalPrecision2026!');
    expect(uppercase.valid).toBe(true);
    expect(uppercase.session?.username).toBe('dr_asmith');

    const padded = verifyClinicianCredentials('   dr_asmith   ', 'ClinicalPrecision2026!');
    expect(padded.valid).toBe(true);
    expect(padded.session?.username).toBe('dr_asmith');

    const mixedPadded = verifyClinicianCredentials('  Dr_ASmith  ', 'ClinicalPrecision2026!');
    expect(mixedPadded.valid).toBe(true);
    expect(mixedPadded.session?.username).toBe('dr_asmith');
  });

  it('AUTH-DEP-06: immunizes post-login redirection against open-redirect attacks', () => {
    // Malicious redirection targets sanitized to default '/'
    expect(sanitizeRedirectUrl('//evil.com')).toBe('/');
    expect(sanitizeRedirectUrl('//attacker.org/phish')).toBe('/');
    expect(sanitizeRedirectUrl('/\\evil.com')).toBe('/');
    expect(sanitizeRedirectUrl('https://evil.com')).toBe('/');
    expect(sanitizeRedirectUrl('http://attacker.com/steal')).toBe('/');
    expect(sanitizeRedirectUrl('javascript:alert(document.cookie)')).toBe('/');
    expect(sanitizeRedirectUrl('data:text/html,evil')).toBe('/');
    expect(sanitizeRedirectUrl('/login')).toBe('/'); // Avoid redirect loop

    // Legitimate internal clinical paths preserved
    expect(sanitizeRedirectUrl('/cases')).toBe('/cases');
    expect(sanitizeRedirectUrl('/cases/mdd-001/decision')).toBe('/cases/mdd-001/decision');
    expect(sanitizeRedirectUrl('/evidence/viewer?targetId=tgt-001')).toBe(
      '/evidence/viewer?targetId=tgt-001',
    );
    expect(sanitizeRedirectUrl('/admin')).toBe('/admin');
  });

  it('AUTH-DEP-07: authStore client-side asynchronous sign-out notifies listeners and purges session', async () => {
    // Mock active session in authStore
    authStore.setSessionForTesting({
      isAuthenticated: true,
      username: 'dr_asmith',
      loginTimestamp: new Date().toISOString(),
      rememberMe: false,
      user: CANONICAL_CLINICAL_SESSION.user,
      organization: CANONICAL_CLINICAL_SESSION.organization,
      mode: CANONICAL_CLINICAL_SESSION.mode,
    });

    expect(authStore.isAuthenticated()).toBe(true);

    let notifiedSession: any = 'not-called';
    const unsubscribe = authStore.subscribe(session => {
      notifiedSession = session;
    });

    await authStore.logoutClinicianAsync();

    expect(authStore.isAuthenticated()).toBe(false);
    expect(authStore.getAuthSession()).toBeNull();
    expect(notifiedSession).toBeNull();

    unsubscribe();
  });

  it('AUTH-DEP-08: multi-process sign-out propagates revocation via durable transaction store', () => {
    const jti = 'jti-dep-multi-proc-01';
    const now = Math.floor(Date.now() / 1000);

    // Process A: Registers active session
    registerServerSession({
      jti,
      userId: 'usr-spec-001',
      username: 'dr_asmith',
      issuedAt: now,
      expiresAt: now + 3600,
    });

    expect(isSessionRevoked(jti)).toBe(false);

    // Process B: Revokes session directly in shared backing store
    const diskRecords: ServerSessionRecord[] = JSON.parse(
      fs.readFileSync(TEST_STORE_FILE, 'utf-8'),
    );
    const targetRecord = diskRecords.find(r => r.jti === jti);
    expect(targetRecord).toBeDefined();

    const revokedRecord: ServerSessionRecord = {
      ...targetRecord!,
      revoked: true,
      revokedAt: now + 2,
      revocationReason: 'LOGOUT_FROM_DIFFERENT_TERMINAL',
      revision: (targetRecord?.revision ?? 1) + 1,
      updatedAt: now + 2,
    };

    fs.writeFileSync(TEST_STORE_FILE, JSON.stringify([revokedRecord], null, 2), 'utf-8');

    // Process A: Checks session status and synchronizes immediately
    expect(isSessionRevoked(jti)).toBe(true);
    expect(getSessionStatus(jti)).toBe('revoked');
    const session = getServerSession(jti);
    expect(session?.revocationReason).toBe('LOGOUT_FROM_DIFFERENT_TERMINAL');
  });
});
