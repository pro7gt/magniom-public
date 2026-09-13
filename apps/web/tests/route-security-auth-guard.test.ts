/**
 * @magniom/web - Edge Middleware & Client AuthGuard Security Test Suite
 * Conforms to MAG-SEC-001 (Mandatory authentication for clinical routes),
 * HIPAA Security Rule (§ 164.312(a)(1)), and SaMD Class IIb / Class B baseline.
 *
 * Verifies:
 * 1. Edge middleware intercepts unauthenticated requests to protected pages (/, /cases, /evidence, /admin)
 *    and redirects to /login?redirect=<path>.
 * 2. Edge middleware protects /api/cases/* endpoints with HTTP 401 Unauthorized JSON.
 * 3. Public endpoints (/login, /api/health) are exempt from redirection.
 * 4. Authenticated requests bearing valid Web Crypto HMAC-SHA256 'magniom_session' cookie pass downstream.
 * 5. Forged or unsigned cookies (e.g. 'attacker_fake_token') are immediately rejected and cleared via response cookies.
 * 6. SignOffGuard isSessionValid() integrates directly with authStore.
 * 7. Decision signing preconditions block signatures without signing authority or in FAIL_CLOSED/RESEARCH mode.
 * 8. next.config.ts exports mandatory HTTP security headers (HSTS, X-Frame-Options, etc.).
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware, AUTH_COOKIE_NAME } from '../src/middleware';
import { authStore } from '../src/lib/auth-store';
import { isSessionValid, validateSignOffPreconditions } from '../src/lib/security/sign-off-guard';
import { createSignedSessionToken, verifySessionToken } from '../src/lib/security/session-crypto';
import { resolveCaseShellContext } from '../src/lib/shell-authority';
import nextConfig from '../next.config';
import type { ClinicalActionCapabilities } from '@magniom/presentation';

function createMockRequest(url: string, cookies: Record<string, string> = {}): NextRequest {
  const req = new NextRequest(new URL(url, 'https://app.magniom.com'));
  for (const [key, value] of Object.entries(cookies)) {
    req.cookies.set(key, value);
  }
  return req;
}

describe('MAG-SEC-001: Edge Middleware Route Protection & Access Control', () => {
  beforeEach(() => {
    authStore.logoutClinician();
  });

  it('SEC-MW-01: redirects unauthenticated request on root dashboard (/) to /login', async () => {
    const req = createMockRequest('https://app.magniom.com/');
    const res = await middleware(req);

    expect(res.status).toBe(307);
    const location = res.headers.get('location');
    expect(location).toBe('https://app.magniom.com/login');
  });

  it('SEC-MW-02: redirects unauthenticated request on /cases to /login?redirect=%2Fcases', async () => {
    const req = createMockRequest('https://app.magniom.com/cases');
    const res = await middleware(req);

    expect(res.status).toBe(307);
    const location = res.headers.get('location');
    expect(location).toBe('https://app.magniom.com/login?redirect=%2Fcases');
  });

  it('SEC-MW-03: redirects unauthenticated request on deep clinical case route to /login preserving deep path', async () => {
    const req = createMockRequest(
      'https://app.magniom.com/cases/case-ux-g01/indications/ind-01/decision',
    );
    const res = await middleware(req);

    expect(res.status).toBe(307);
    const location = res.headers.get('location');
    expect(location).toBe(
      'https://app.magniom.com/login?redirect=%2Fcases%2Fcase-ux-g01%2Findications%2Find-01%2Fdecision',
    );
  });

  it('SEC-MW-04: redirects unauthenticated request on /evidence and /admin to /login with redirect parameter', async () => {
    const evReq = createMockRequest('https://app.magniom.com/evidence');
    const evRes = await middleware(evReq);
    expect(evRes.status).toBe(307);
    expect(evRes.headers.get('location')).toBe(
      'https://app.magniom.com/login?redirect=%2Fevidence',
    );

    const adminReq = createMockRequest('https://app.magniom.com/admin');
    const adminRes = await middleware(adminReq);
    expect(adminRes.status).toBe(307);
    expect(adminRes.headers.get('location')).toBe(
      'https://app.magniom.com/login?redirect=%2Fadmin',
    );
  });

  it('SEC-MW-05: returns HTTP 401 Unauthorized for unauthenticated API requests (/api/cases/...)', async () => {
    const apiReq = createMockRequest(
      'https://app.magniom.com/api/cases/case-ux-g01/triple-network',
    );
    const apiRes = await middleware(apiReq);

    expect(apiRes.status).toBe(401);
    expect(apiRes.headers.get('content-type')).toContain('application/json');
    expect(apiRes.headers.get('www-authenticate')).toContain('magniom-clinician-session');

    const json = await apiRes.json();
    expect(json.code).toBe('MAG-AUTH-401');
    expect(json.error).toContain('Authorised clinician session required');
  });

  it('SEC-MW-06: permits unauthenticated access to public routes (/login and /api/health)', async () => {
    const loginReq = createMockRequest('https://app.magniom.com/login');
    const loginRes = await middleware(loginReq);
    expect(loginRes.status).toBe(200);
    expect(loginRes.headers.get('location')).toBeNull();

    const healthReq = createMockRequest('https://app.magniom.com/api/health');
    const healthRes = await middleware(healthReq);
    expect(healthRes.status).toBe(200);
    expect(healthRes.headers.get('location')).toBeNull();
  });

  it('SEC-MW-07: permits request and sets x-magniom-authenticated header when genuine signed cookie is present', async () => {
    const validToken = createSignedSessionToken('usr-spec-001');
    const isTokenCryptographicallyValid = await verifySessionToken(validToken);
    expect(isTokenCryptographicallyValid).toBe(true);

    const authReq = createMockRequest('https://app.magniom.com/cases', {
      [AUTH_COOKIE_NAME]: validToken,
    });
    const authRes = await middleware(authReq);

    expect(authRes.status).toBe(200);
    expect(authRes.headers.get('location')).toBeNull();
    expect(authRes.headers.get('x-magniom-authenticated')).toBe('1');
  });

  it('SEC-MW-08: blocks and immediately deletes forged or unsigned cookies on page requests', async () => {
    const forgedReq = createMockRequest('https://app.magniom.com/cases', {
      [AUTH_COOKIE_NAME]: 'attacker_fake_token',
    });
    const forgedRes = await middleware(forgedReq);

    // 1. Must redirect to /login
    expect(forgedRes.status).toBe(307);
    expect(forgedRes.headers.get('location')).toContain('/login?redirect=');

    // 2. Must immediately delete/clear the forged cookie
    const setCookieHeader = forgedRes.headers.get('set-cookie');
    expect(setCookieHeader).toBeDefined();
    expect(setCookieHeader).toContain(`${AUTH_COOKIE_NAME}=`);
    expect(setCookieHeader?.toLowerCase()).toMatch(/max-age=0|expires=/);
  });

  it('SEC-MW-09: blocks and deletes forged cookies on API requests with HTTP 401', async () => {
    const forgedApiReq = createMockRequest(
      'https://app.magniom.com/api/cases/case-ux-g01/triple-network',
      {
        [AUTH_COOKIE_NAME]: 'attacker_fake_token_123',
      },
    );
    const forgedApiRes = await middleware(forgedApiReq);

    expect(forgedApiRes.status).toBe(401);
    const setCookie = forgedApiRes.headers.get('set-cookie');
    expect(setCookie).toBeDefined();
    expect(setCookie).toContain(AUTH_COOKIE_NAME);
  });

  it('SEC-MW-10: blocks tampered session cookie where signature does not match payload', async () => {
    const validToken = createSignedSessionToken('usr-spec-001');
    const tamperedToken = validToken.slice(0, -4) + 'abcd'; // Corrupt signature

    const tamperedReq = createMockRequest('https://app.magniom.com/cases', {
      [AUTH_COOKIE_NAME]: tamperedToken,
    });
    const tamperedRes = await middleware(tamperedReq);

    expect(tamperedRes.status).toBe(307);
    expect(tamperedRes.headers.get('location')).toContain('/login');
  });
});

describe('MAG-SEC-002: Sign-Off Guard Session Expiry Integration', () => {
  beforeEach(() => {
    authStore.logoutClinician();
  });

  it('SEC-SIG-01: isSessionValid() returns false when clinician is unauthenticated', () => {
    expect(authStore.isAuthenticated()).toBe(false);
    expect(isSessionValid()).toBe(false);
  });

  it('SEC-SIG-02: isSessionValid() returns true when clinician is authenticated with universal credentials', () => {
    authStore.authenticateClinician('magniom', 'amygdala');
    expect(authStore.isAuthenticated()).toBe(true);
    expect(isSessionValid()).toBe(true);
  });

  it('SEC-SIG-03: isSessionValid() immediately reverts to false after clinician logout', () => {
    authStore.authenticateClinician('magniom', 'amygdala');
    expect(isSessionValid()).toBe(true);

    authStore.logoutClinician();
    expect(isSessionValid()).toBe(false);
  });
});

describe('MAG-SEC-004: 21 CFR Part 11 Pre-Signing Safety Gating', () => {
  it('SEC-SIG-04: validateSignOffPreconditions blocks signing when user lacks hasSigningAuthority', () => {
    const shellVm = resolveCaseShellContext({ caseId: 'case-ux-v2-01' });
    expect(shellVm).not.toBeNull();

    const nonSigningCaps: ClinicalActionCapabilities = {
      may_generate_target_slate: true,
      may_review_target_slate: true,
      may_create_clinician_decision: true,
      may_sign_target_decision: false, // Clinician lacks signing authority
      may_export_navigation_target: false,
    };

    const result = validateSignOffPreconditions(shellVm!, nonSigningCaps);
    expect(result.canSign).toBe(false);
    expect(result.blockedReasons.some(r => r.includes('signing authority'))).toBe(true);
  });

  it('SEC-SIG-05: validateSignOffPreconditions blocks signing in FAIL_CLOSED state', () => {
    const shellVm = resolveCaseShellContext({ caseId: 'case-ux-v2-10' });
    expect(shellVm).not.toBeNull();
    expect(shellVm?.safetyState).toBe('FAIL_CLOSED');

    const caps: ClinicalActionCapabilities = {
      may_generate_target_slate: true,
      may_review_target_slate: true,
      may_create_clinician_decision: true,
      may_sign_target_decision: true,
      may_export_navigation_target: true,
    };

    const result = validateSignOffPreconditions(shellVm!, caps);
    expect(result.canSign).toBe(false);
    expect(result.blockedReasons.some(r => r.includes('FAIL CLOSED'))).toBe(true);
  });

  it('SEC-SIG-06: validateSignOffPreconditions blocks signing in RESEARCH mode', () => {
    const shellVm = resolveCaseShellContext({ caseId: 'case-ux-v2-08' });
    expect(shellVm).not.toBeNull();
    expect(shellVm?.mode.isResearch).toBe(true);

    const caps: ClinicalActionCapabilities = {
      may_generate_target_slate: true,
      may_review_target_slate: true,
      may_create_clinician_decision: true,
      may_sign_target_decision: true,
      may_export_navigation_target: true,
    };

    const result = validateSignOffPreconditions(shellVm!, caps);
    expect(result.canSign).toBe(false);
    expect(result.blockedReasons.some(r => r.includes('Research Mode'))).toBe(true);
  });
});

describe('MAG-SEC-003: HTTP Security Headers Configuration', () => {
  it('SEC-HDR-01: next.config.ts exports mandatory HTTP security headers for healthcare compliance', async () => {
    expect(typeof nextConfig.headers).toBe('function');
    const headerConfigs = await nextConfig.headers!();

    expect(headerConfigs).toBeInstanceOf(Array);
    expect(headerConfigs.length).toBeGreaterThan(0);

    const rootConfig = headerConfigs.find(h => h.source === '/:path*');
    expect(rootConfig).toBeDefined();

    const headersMap = new Map(rootConfig!.headers.map(h => [h.key, h.value]));

    expect(headersMap.get('X-Frame-Options')).toBe('DENY');
    expect(headersMap.get('X-Content-Type-Options')).toBe('nosniff');
    expect(headersMap.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    expect(headersMap.get('Strict-Transport-Security')).toContain('max-age=');
    expect(headersMap.get('Permissions-Policy')).toBeDefined();
  });
});
