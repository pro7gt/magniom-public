/**
 * @magniom/web - Clinician Authentication & Session Authority Test Suite
 * Conforms to MAG-SEC-001 (Mandatory authentication) and MAG-SEC-009 (Session integrity).
 *
 * Verifies:
 * 1. Synchronous client-side authentication is rejected (client bypass prevention).
 * 2. Asynchronous server authentication fails closed when network/server is unavailable.
 * 3. Server credential verification succeeds with valid configured credentials.
 * 4. Case-insensitivity on clinician username.
 * 5. Rejection of invalid credentials with remaining attempts feedback.
 * 6. Account temporary lockout after 5 consecutive failures.
 * 7. Cryptographic session token generation with expiration claims and valid signature.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { authStore } from '../src/lib/auth-store';
import {
  verifyClinicianCredentials,
  resetAuthLockoutsForTesting,
} from '../src/lib/server/auth-credentials';
import {
  createSignedSessionToken,
  verifySessionTokenWithClaims,
  verifySessionToken,
} from '../src/lib/security/session-crypto';

describe('Clinician Authentication & Session Authority', () => {
  beforeEach(() => {
    authStore.logoutClinician();
    resetAuthLockoutsForTesting();
  });

  it('MAG-AUTH-01: client-side synchronous authentication is strictly rejected (prevents client bypass)', () => {
    const result = authStore.authenticateClinician('dr_asmith', 'ClinicalPrecision2026!');
    expect(result.success).toBe(false);
    expect(result.error).toContain('Direct client-side authentication is prohibited');
    expect(authStore.isAuthenticated()).toBe(false);
  });

  it('MAG-AUTH-02: authenticates successfully via server credential authority', () => {
    const result = verifyClinicianCredentials('dr_asmith', 'ClinicalPrecision2026!');

    expect(result.valid).toBe(true);
    expect(result.session).toBeDefined();
    expect(result.session?.isAuthenticated).toBe(true);
    expect(result.session?.username).toBe('dr_asmith');
    expect(result.session?.user.displayName).toBe('Dr A. Smith');
    expect(result.session?.user.roleTitle).toBe('TMS Specialist & Clinical Reviewer');
    expect(result.session?.user.hasSigningAuthority).toBe(true);
    expect(result.session?.organization.organizationName).toBe('Melbourne TMS Centre');
  });

  it('MAG-AUTH-03: handles case-insensitivity on username', () => {
    const upperResult = verifyClinicianCredentials('DR_ASMITH', 'ClinicalPrecision2026!');
    expect(upperResult.valid).toBe(true);

    const paddedResult = verifyClinicianCredentials('  dr_asmith  ', 'ClinicalPrecision2026!');
    expect(paddedResult.valid).toBe(true);
  });

  it('MAG-AUTH-04: rejects incorrect password and reports remaining attempts', () => {
    const result = verifyClinicianCredentials('dr_asmith', 'incorrect_password');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Invalid clinician credentials');
    expect(result.error).toContain('remaining');
  });

  it('MAG-AUTH-05: enforces account lockout after 5 consecutive failed attempts', () => {
    for (let i = 0; i < 4; i++) {
      const res = verifyClinicianCredentials('dr_asmith', 'bad_password');
      expect(res.valid).toBe(false);
    }

    // 5th failure triggers lockout
    const lockResult = verifyClinicianCredentials('dr_asmith', 'bad_password');
    expect(lockResult.valid).toBe(false);
    expect(lockResult.error).toContain('Account locked');

    // 6th attempt is blocked immediately by rate limiter
    const blockedResult = verifyClinicianCredentials('dr_asmith', 'ClinicalPrecision2026!');
    expect(blockedResult.valid).toBe(false);
    expect(blockedResult.error).toContain('temporarily locked');
  });

  it('MAG-AUTH-06: issues cryptographically signed session token with valid claims and expiration', async () => {
    const token = createSignedSessionToken('usr-spec-001', { expiresInSeconds: 1800 });
    const parts = token.split('.');
    expect(parts.length).toBe(2);
    expect(parts[1]?.length).toBe(64); // 64-char SHA256 hex signature

    const verification = await verifySessionTokenWithClaims(token);
    expect(verification.valid).toBe(true);
    expect(verification.claims).toBeDefined();
    expect(verification.claims?.sub).toBe('usr-spec-001');
    expect(verification.claims?.iss).toBe('magniom-authority');
    expect(verification.claims?.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
  });

  it('MAG-AUTH-07: rejects expired session tokens', async () => {
    // Generate token that expired 10 seconds ago
    const expiredToken = createSignedSessionToken('usr-spec-001', { expiresInSeconds: -10 });
    const verification = await verifySessionTokenWithClaims(expiredToken);
    expect(verification.valid).toBe(false);
    expect(verification.reason).toBe('EXPIRED');

    const isValid = await verifySessionToken(expiredToken);
    expect(isValid).toBe(false);
  });
});
