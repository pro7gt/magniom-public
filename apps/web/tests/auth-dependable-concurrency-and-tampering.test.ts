/**
 * @magniom/web - Dependable Concurrency, Multi-Device & Cryptographic Tampering Test Suite
 * Conforms to MAG-SEC-001 (Mandatory authentication), MAG-SEC-009 (Session integrity),
 * and IEC 62304 Class C / 21 CFR Part 11 electronic records and session termination.
 *
 * Formally validates:
 * 1. AUTH-DEP-CONC-01: Multi-User Concurrent Session Isolation (User A logout leaves User B unaffected).
 * 2. AUTH-DEP-CONC-02: Multi-Device Concurrent Sessions & Global Logout ({ allDevices: true }).
 * 3. AUTH-DEP-CONC-03: Cryptographic Token Tampering, Claim Alteration & Bit-Flip Rejection.
 * 4. AUTH-DEP-CONC-04: Expiration Boundaries, Reason Attribution & Cookie Eviction.
 * 5. AUTH-DEP-CONC-05: Malformed Cookies, Injection Payloads & Edge Rejection.
 * 6. AUTH-DEP-CONC-06: Concurrency Stress & Collision Resistance (20 rapid cycles, zero file corruption).
 * 7. AUTH-DEP-CONC-07: Client authStore Reactivity, Network Failure Tolerance & Fail-Closed Guard.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
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
  revokeSession,
  resetSessionRegistryForTesting,
} from '../src/lib/server/session-registry';
import {
  createSignedSessionToken,
  verifySessionToken,
  verifySessionTokenWithClaims,
  setGlobalSessionRevocationChecker,
} from '../src/lib/security/session-crypto';

const TEST_STORE_DIR = path.join(process.cwd(), '.temp', 'test-auth-concurrency');
const TEST_STORE_FILE = path.join(TEST_STORE_DIR, 'session-store.json');

describe('Dependable Concurrency, Multi-Device & Tampering Auth Suite', () => {
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
    vi.restoreAllMocks();
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

  it('AUTH-DEP-CONC-01: multi-user concurrent session isolation (User A logout leaves User B active)', async () => {
    // 1. User A (Dr A. Smith) logs in
    const loginReqA = new NextRequest('https://app.magniom.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'dr_asmith',
        password: 'ClinicalPrecision2026!',
      }),
    });
    const loginResA = await loginRoute(loginReqA);
    expect(loginResA.status).toBe(200);
    const tokenA = loginResA.headers
      .get('set-cookie')!
      .match(new RegExp(`${AUTH_COOKIE_NAME}=([^;]+)`))![1];
    const claimsA = (await verifySessionTokenWithClaims(tokenA)).claims!;
    const jtiA = claimsA.jti;

    // 2. User B (Specialist Clinician) logs in
    const loginReqB = new NextRequest('https://app.magniom.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'magniom_spec',
        password: 'Specialist2026!',
      }),
    });
    const loginResB = await loginRoute(loginReqB);
    expect(loginResB.status).toBe(200);
    const tokenB = loginResB.headers
      .get('set-cookie')!
      .match(new RegExp(`${AUTH_COOKIE_NAME}=([^;]+)`))![1];
    const claimsB = (await verifySessionTokenWithClaims(tokenB)).claims!;
    const jtiB = claimsB.jti;

    // Tokens and JTIs must be completely distinct
    expect(tokenA).not.toBe(tokenB);
    expect(jtiA).not.toBe(jtiB);
    expect(claimsA.sub).toBe('usr-spec-001');
    expect(claimsB.sub).toBe('usr-spec-002');

    // Both sessions are initially active
    expect(isSessionRevoked(jtiA)).toBe(false);
    expect(isSessionRevoked(jtiB)).toBe(false);

    // 3. User A signs out
    const logoutReqA = new NextRequest('https://app.magniom.com/api/auth/logout', {
      method: 'POST',
      headers: { cookie: `${AUTH_COOKIE_NAME}=${tokenA}` },
    });
    const logoutResA = await logoutRoute(logoutReqA);
    expect(logoutResA.status).toBe(200);

    // 4. Assert User A is revoked, but User B remains active and unaffected
    expect(isSessionRevoked(jtiA)).toBe(true);
    expect(getSessionStatus(jtiA)).toBe('revoked');
    expect(isSessionRevoked(jtiB)).toBe(false);
    expect(getSessionStatus(jtiB)).toBe('active');

    // User A middleware access is redirected
    const casesReqA = new NextRequest('https://app.magniom.com/cases', {
      headers: { cookie: `${AUTH_COOKIE_NAME}=${tokenA}` },
    });
    const casesResA = await middleware(casesReqA);
    expect(casesResA.status).toBe(307);
    expect(casesResA.headers.get('location')).toContain('/login');

    // User B middleware access succeeds cleanly
    const casesReqB = new NextRequest('https://app.magniom.com/cases', {
      headers: { cookie: `${AUTH_COOKIE_NAME}=${tokenB}` },
    });
    const casesResB = await middleware(casesReqB);
    expect(casesResB.status).toBe(200);
    expect(casesResB.headers.get('x-magniom-authenticated')).toBe('1');

    // User B session introspection returns active profile
    const sessionReqB = new NextRequest('https://app.magniom.com/api/auth/session', {
      headers: { cookie: `${AUTH_COOKIE_NAME}=${tokenB}` },
    });
    const sessionResB = await sessionRoute(sessionReqB);
    expect(sessionResB.status).toBe(200);
    const sessionJsonB = await sessionResB.json();
    expect(sessionJsonB.isAuthenticated).toBe(true);
    expect(sessionJsonB.username).toBe('magniom_spec');
    expect(sessionJsonB.user.displayName).toBe('Specialist Clinician');

    // 5. User B signs out -> both are now revoked
    const logoutReqB = new NextRequest('https://app.magniom.com/api/auth/logout', {
      method: 'POST',
      headers: { cookie: `${AUTH_COOKIE_NAME}=${tokenB}` },
    });
    await logoutRoute(logoutReqB);
    expect(isSessionRevoked(jtiB)).toBe(true);
    expect(getSessionStatus(jtiB)).toBe('revoked');
  });

  it('AUTH-DEP-CONC-02: multi-device concurrent sessions & global sign-out ({ allDevices: true })', async () => {
    // 1. Same clinician logs in on Workstation 1 (Session 1)
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
    const jti1 = (await verifySessionTokenWithClaims(token1)).claims!.jti;

    // 2. Same clinician logs in on Workstation 2 (Session 2)
    const loginReq2 = new NextRequest('https://app.magniom.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'dr_asmith',
        password: 'ClinicalPrecision2026!',
      }),
    });
    const loginRes2 = await loginRoute(loginReq2);
    const token2 = loginRes2.headers
      .get('set-cookie')!
      .match(new RegExp(`${AUTH_COOKIE_NAME}=([^;]+)`))![1];
    const jti2 = (await verifySessionTokenWithClaims(token2)).claims!.jti;

    // 3. Same clinician logs in on Workstation 3 (Session 3)
    const loginReq3 = new NextRequest('https://app.magniom.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'dr_asmith',
        password: 'ClinicalPrecision2026!',
      }),
    });
    const loginRes3 = await loginRoute(loginReq3);
    const token3 = loginRes3.headers
      .get('set-cookie')!
      .match(new RegExp(`${AUTH_COOKIE_NAME}=([^;]+)`))![1];
    const jti3 = (await verifySessionTokenWithClaims(token3)).claims!.jti;

    // All 3 sessions active
    expect(isSessionRevoked(jti1)).toBe(false);
    expect(isSessionRevoked(jti2)).toBe(false);
    expect(isSessionRevoked(jti3)).toBe(false);

    // 4. Selective logout on Workstation 1 (allDevices = false)
    const logoutReq1 = new NextRequest('https://app.magniom.com/api/auth/logout', {
      method: 'POST',
      headers: { cookie: `${AUTH_COOKIE_NAME}=${token1}` },
    });
    await logoutRoute(logoutReq1);

    // Workstation 1 revoked, but Workstations 2 and 3 remain active
    expect(isSessionRevoked(jti1)).toBe(true);
    expect(isSessionRevoked(jti2)).toBe(false);
    expect(isSessionRevoked(jti3)).toBe(false);

    // 5. Global logout on Workstation 2 with { allDevices: true }
    const logoutReqAll = new NextRequest('https://app.magniom.com/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: `${AUTH_COOKIE_NAME}=${token2}`,
      },
      body: JSON.stringify({ allDevices: true }),
    });
    const logoutResAll = await logoutRoute(logoutReqAll);
    expect(logoutResAll.status).toBe(200);

    // Now ALL sessions for dr_asmith are tombstoned
    expect(isSessionRevoked(jti1)).toBe(true);
    expect(isSessionRevoked(jti2)).toBe(true);
    expect(isSessionRevoked(jti3)).toBe(true);

    expect(await verifySessionToken(token1)).toBe(false);
    expect(await verifySessionToken(token2)).toBe(false);
    expect(await verifySessionToken(token3)).toBe(false);
  });

  it('AUTH-DEP-CONC-03: cryptographic token tampering, claim alteration & bit-flip rejection', async () => {
    // Generate valid signed token
    const token = createSignedSessionToken('usr-spec-001', {
      username: 'dr_asmith',
      role: 'TMS Specialist',
      expiresInSeconds: 3600,
    });
    expect(await verifySessionToken(token)).toBe(true);

    const parts = token.split('.');
    expect(parts.length).toBe(2);
    const payloadB64 = parts[0]!;
    const sig = parts[1]!;

    // Attack 1: Alter claims in payload (Privilege escalation: role = SuperAdmin)
    const rawPayload = Buffer.from(payloadB64, 'base64url').toString('utf8');
    const parsedPayload = JSON.parse(rawPayload);
    parsedPayload.role = 'SuperAdmin';
    parsedPayload.sub = 'usr-admin-000';
    const tamperedPayloadB64 = Buffer.from(JSON.stringify(parsedPayload)).toString('base64url');
    const tamperedTokenClaims = `${tamperedPayloadB64}.${sig}`;

    const verifyTamperedClaims = await verifySessionTokenWithClaims(tamperedTokenClaims);
    expect(verifyTamperedClaims.valid).toBe(false);
    expect(verifyTamperedClaims.reason).toBe('SIGNATURE_MISMATCH');

    // Attack 2: Flip 1 hex char in the 64-char HMAC signature
    const flippedChar = sig[0] === 'a' ? 'b' : 'a';
    const tamperedSig = flippedChar + sig.slice(1);
    const tamperedTokenSig = `${payloadB64}.${tamperedSig}`;

    const verifyTamperedSig = await verifySessionTokenWithClaims(tamperedTokenSig);
    expect(verifyTamperedSig.valid).toBe(false);
    expect(verifyTamperedSig.reason).toBe('SIGNATURE_MISMATCH');

    // Attack 3: Truncate signature
    const shortSigToken = `${payloadB64}.${sig.slice(0, 32)}`;
    const verifyShort = await verifySessionTokenWithClaims(shortSigToken);
    expect(verifyShort.valid).toBe(false);
    expect(verifyShort.reason).toBe('INVALID_FORMAT');

    // Attack 4: Non-hex characters in signature
    const nonHexToken = `${payloadB64}.${sig.slice(0, 60)}ZZZZ`;
    const verifyNonHex = await verifySessionTokenWithClaims(nonHexToken);
    expect(verifyNonHex.valid).toBe(false);

    // Attack 5: Malformed JWT structure (too many or too few dots)
    expect((await verifySessionTokenWithClaims('single-segment')).reason).toBe('INVALID_FORMAT');
    expect((await verifySessionTokenWithClaims('one.two.three')).reason).toBe('INVALID_FORMAT');

    // Middleware rejects tampered token on protected route and strips cookie
    const protectedReq = new NextRequest('https://app.magniom.com/cases', {
      headers: { cookie: `${AUTH_COOKIE_NAME}=${tamperedTokenClaims}` },
    });
    const protectedRes = await middleware(protectedReq);
    expect(protectedRes.status).toBe(307);
    expect(protectedRes.headers.get('location')).toBe(
      'https://app.magniom.com/login?redirect=%2Fcases',
    );
    expect(protectedRes.headers.get('set-cookie')).toContain(`${AUTH_COOKIE_NAME}=;`);
  });

  it('AUTH-DEP-CONC-04: expiration boundaries, reason attribution & cookie eviction', async () => {
    // Generate token that expired 10 seconds ago
    const expiredToken = createSignedSessionToken('usr-spec-001', {
      username: 'dr_asmith',
      expiresInSeconds: -10,
    });

    const verifyExpired = await verifySessionTokenWithClaims(expiredToken);
    expect(verifyExpired.valid).toBe(false);
    expect(verifyExpired.reason).toBe('EXPIRED');

    // Session endpoint returns 401 with reason EXPIRED and deletes cookie
    const sessionReq = new NextRequest('https://app.magniom.com/api/auth/session', {
      headers: { cookie: `${AUTH_COOKIE_NAME}=${expiredToken}` },
    });
    const sessionRes = await sessionRoute(sessionReq);
    expect(sessionRes.status).toBe(401);
    const sessionJson = await sessionRes.json();
    expect(sessionJson.isAuthenticated).toBe(false);
    expect(sessionJson.reason).toBe('EXPIRED');

    const cookieHeader = sessionRes.headers.get('set-cookie');
    expect(cookieHeader).toBeDefined();
    expect(cookieHeader).toContain(`${AUTH_COOKIE_NAME}=;`);
  });

  it('AUTH-DEP-CONC-05: malformed cookies, injection payloads & edge rejection', async () => {
    const maliciousCookies = [
      `'; DROP TABLE identity.clinician_sessions; --`,
      `<script>alert(1)</script>`,
      `%00%0D%0A`,
      `Bearer token`,
      `=value`,
      `..`,
      `"quoted_payload"`,
    ];

    for (const badVal of maliciousCookies) {
      // 1. Middleware test: fails closed without 500 error
      const req = new NextRequest('https://app.magniom.com/cases', {
        headers: { cookie: `${AUTH_COOKIE_NAME}=${encodeURIComponent(badVal)}` },
      });
      const res = await middleware(req);
      expect(res.status).toBe(307);
      expect(res.headers.get('location')).toBe('https://app.magniom.com/login?redirect=%2Fcases');

      // 2. Protected API test: fails closed with 401
      const apiReq = new NextRequest('https://app.magniom.com/api/cases/mdd-001/triple-network', {
        headers: { cookie: `${AUTH_COOKIE_NAME}=${encodeURIComponent(badVal)}` },
      });
      const apiRes = await middleware(apiReq);
      expect(apiRes.status).toBe(401);
      const apiJson = await apiRes.json();
      expect(apiJson.code).toBe('MAG-AUTH-401');
    }
  });

  it('AUTH-DEP-CONC-06: concurrency stress & collision resistance (20 rapid cycles, zero file corruption)', async () => {
    const jtis: string[] = [];

    // 20 rapid sequential login transactions
    for (let i = 0; i < 20; i++) {
      const loginReq = new NextRequest('https://app.magniom.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: i % 2 === 0 ? 'dr_asmith' : 'magniom_spec',
          password: i % 2 === 0 ? 'ClinicalPrecision2026!' : 'Specialist2026!',
        }),
      });

      const loginRes = await loginRoute(loginReq);
      expect(loginRes.status).toBe(200);

      const cookieHeader = loginRes.headers.get('set-cookie');
      const token = cookieHeader?.match(new RegExp(`${AUTH_COOKIE_NAME}=([^;]+)`))![1]!;
      const claims = (await verifySessionTokenWithClaims(token)).claims!;
      expect(claims).toBeDefined();

      // Ensure zero JTI collisions across all cycles
      expect(jtis.includes(claims.jti)).toBe(false);
      jtis.push(claims.jti);

      // Verify status is immediately active
      expect(getSessionStatus(claims.jti)).toBe('active');
    }

    expect(jtis.length).toBe(20);

    // Verify durable backing store is valid JSON and contains all 20 records
    const rawDisk = fs.readFileSync(TEST_STORE_FILE, 'utf8');
    const parsedDisk = JSON.parse(rawDisk);
    expect(Array.isArray(parsedDisk)).toBe(true);
    expect(parsedDisk.length).toBe(20);

    // Revoke every even indexed JTI
    for (let i = 0; i < jtis.length; i += 2) {
      revokeSession(jtis[i]!, 'STRESS_TEST_REVOCATION');
    }

    // Assert states: even are revoked, odd remain active
    for (let i = 0; i < jtis.length; i++) {
      const status = getSessionStatus(jtis[i]!);
      if (i % 2 === 0) {
        expect(status).toBe('revoked');
        expect(isSessionRevoked(jtis[i]!)).toBe(true);
      } else {
        expect(status).toBe('active');
        expect(isSessionRevoked(jtis[i]!)).toBe(false);
      }
    }
  });

  it('AUTH-DEP-CONC-07: client authStore reactivity, network failure tolerance & fail-closed guard', async () => {
    // Simulate browser window environment
    (globalThis as any).window = {
      location: { replace: vi.fn() },
      document: { cookie: '' },
      localStorage: { removeItem: vi.fn() },
    };

    try {
      // 1. Verify fail-closed on server 500 error during refresh
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal Server Error' }),
      } as any);

      // Seed client cache
      authStore.setSessionForTesting({
        isAuthenticated: true,
        username: 'dr_asmith',
        loginTimestamp: new Date().toISOString(),
        rememberMe: false,
        user: {
          id: 'usr-spec-001',
          displayName: 'Dr A. Smith',
          roleTitle: 'TMS Specialist',
          hasSigningAuthority: true,
          signingAuthorityLevel: 'Level 3',
          organizationId: 'org-melb',
          organizationName: 'Melbourne TMS',
          siteName: 'Site 1',
          initials: 'AS',
        },
        organization: {
          organizationId: 'org-melb',
          organizationName: 'Melbourne TMS',
          siteId: 'site-1',
          siteName: 'Site 1',
          displayLabel: 'Melb TMS',
        },
        mode: 'CLINICAL',
      });

      expect(authStore.isAuthenticated()).toBe(true);

      let receivedSession: any = 'uncalled';
      const unsub = authStore.subscribe(s => {
        receivedSession = s;
      });

      // Refresh against failing server -> must fail closed to unauthenticated
      const refreshed = await authStore.refreshSessionFromServer();
      expect(refreshed).toBeNull();
      expect(authStore.isAuthenticated()).toBe(false);
      expect(receivedSession).toBeNull();

      unsub();

      // 2. Verify fail-closed when fetch throws network error
      globalThis.fetch = vi.fn().mockRejectedValue(new Error('Failed to fetch'));
      const netResult = await authStore.authenticateClinicianAsync(
        'dr_asmith',
        'ClinicalPrecision2026!',
      );
      expect(netResult.success).toBe(false);
      expect(netResult.error).toContain('Authentication service unavailable');
      expect(authStore.isAuthenticated()).toBe(false);
    } finally {
      delete (globalThis as any).window;
    }
  });
});
