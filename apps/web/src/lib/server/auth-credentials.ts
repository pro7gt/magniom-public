/**
 * @magniom/web - Server-Side Clinician Credential & Rate-Limiting Authority
 * Conforms to MAG-SEC-001 (Mandatory Authentication) & MAG-SEC-009 (Session Integrity).
 *
 * Strictly executed in Node.js server context. NEVER import in client code.
 */

import { CANONICAL_CLINICAL_SESSION } from '../release-authority';
import type { ClinicianAuthSession } from '../auth-store';
import type { UserIdentityViewModel } from '@magniom/presentation';

interface AttemptRecord {
  failedCount: number;
  lockUntilMs: number;
}

// In-memory rate-limiting and lockout tracker (15-minute lockout after 5 consecutive failures)
const loginAttempts = new Map<string, AttemptRecord>();

export function checkRateLimitAndLockout(username: string): {
  isLocked: boolean;
  remainingSec: number;
} {
  const normUser = username.trim().toLowerCase();
  const record = loginAttempts.get(normUser);
  if (!record) return { isLocked: false, remainingSec: 0 };

  const now = Date.now();
  if (record.lockUntilMs > now) {
    return { isLocked: true, remainingSec: Math.ceil((record.lockUntilMs - now) / 1000) };
  }
  if (record.lockUntilMs !== 0 && record.lockUntilMs <= now) {
    loginAttempts.delete(normUser);
  }
  return { isLocked: false, remainingSec: 0 };
}

export function recordLoginFailure(username: string): {
  isNowLocked: boolean;
  attemptsLeft: number;
} {
  const normUser = username.trim().toLowerCase();
  const now = Date.now();
  const record = loginAttempts.get(normUser) ?? { failedCount: 0, lockUntilMs: 0 };
  record.failedCount += 1;
  if (record.failedCount >= 5) {
    record.lockUntilMs = now + 15 * 60 * 1000; // 15 minute lockout
    loginAttempts.set(normUser, record);
    return { isNowLocked: true, attemptsLeft: 0 };
  }
  loginAttempts.set(normUser, record);
  return { isNowLocked: false, attemptsLeft: 5 - record.failedCount };
}

export function recordLoginSuccess(username: string): void {
  loginAttempts.delete(username.trim().toLowerCase());
}

/**
 * Resets all lockout tracking (for testing purposes only).
 */
export function resetAuthLockoutsForTesting(): void {
  loginAttempts.clear();
}

/**
 * Authoritatively verifies specialist credentials on the server.
 * Reads configured specialist identity from server environment variables:
 *   MAGNIOM_CLINICIAN_USER (defaults to 'dr_asmith' in development/test)
 *   MAGNIOM_CLINICIAN_PASSWORD (defaults to 'ClinicalPrecision2026!' in development/test)
 */
export function verifyClinicianCredentials(
  usernameInput: string,
  passwordInput: string,
): { valid: boolean; session?: ClinicianAuthSession; error?: string } {
  const normalizedUser = (usernameInput || '').trim().toLowerCase();
  const cleanPassword = passwordInput || '';

  if (!normalizedUser || !cleanPassword) {
    return {
      valid: false,
      error: 'Username and password are required.',
    };
  }

  const lockStatus = checkRateLimitAndLockout(normalizedUser);
  if (lockStatus.isLocked) {
    return {
      valid: false,
      error: `Account temporarily locked due to repeated authentication failures. Try again in ${lockStatus.remainingSec}s.`,
    };
  }

  const isProduction = typeof process !== 'undefined' && process.env?.NODE_ENV === 'production';

  const isDevOrTest =
    !isProduction &&
    typeof process !== 'undefined' &&
    (process.env?.NODE_ENV === 'test' ||
      Boolean(process.env?.VITEST) ||
      process.env?.NODE_ENV !== 'production');

  const configuredUser = (
    typeof process !== 'undefined' ? process.env?.MAGNIOM_CLINICIAN_USER : undefined
  )
    ?.trim()
    .toLowerCase();

  const configuredPassword =
    typeof process !== 'undefined' ? process.env?.MAGNIOM_CLINICIAN_PASSWORD : undefined;

  const configuredSpecUser = (
    typeof process !== 'undefined' ? process.env?.MAGNIOM_SPECIALIST_USER : undefined
  )
    ?.trim()
    .toLowerCase();

  const configuredSpecPassword =
    typeof process !== 'undefined' ? process.env?.MAGNIOM_SPECIALIST_PASSWORD : undefined;

  if (!isDevOrTest && (!configuredUser || !configuredPassword)) {
    throw new Error(
      'CRITICAL SECURITY ERROR: Production deployment requires MAGNIOM_CLINICIAN_USER and ' +
        'MAGNIOM_CLINICIAN_PASSWORD environment variables to be explicitly configured. ' +
        'Public development defaults are strictly disabled in production mode.',
    );
  }

  const effectiveUser = configuredUser || (isDevOrTest ? 'dr_asmith' : '');
  const effectivePassword = configuredPassword || (isDevOrTest ? 'ClinicalPrecision2026!' : '');

  const effectiveSpecUser = configuredSpecUser || (isDevOrTest ? 'magniom_spec' : '');
  const effectiveSpecPassword = configuredSpecPassword || (isDevOrTest ? 'Specialist2026!' : '');

  function timingSafePasswordCheck(input: string, expected: string): boolean {
    if (!input || !expected) return false;
    try {
      const crypto = require('node:crypto');
      const a = Buffer.from(input, 'utf-8');
      const b = Buffer.from(expected, 'utf-8');
      if (a.length !== b.length) {
        crypto.timingSafeEqual(a, a);
        return false;
      }
      return crypto.timingSafeEqual(a, b);
    } catch {
      return input === expected;
    }
  }

  const isPrimaryMatch =
    effectiveUser !== '' &&
    normalizedUser === effectiveUser &&
    timingSafePasswordCheck(cleanPassword, effectivePassword);

  const isSpecMatch =
    effectiveSpecUser !== '' &&
    normalizedUser === effectiveSpecUser &&
    timingSafePasswordCheck(cleanPassword, effectiveSpecPassword);

  if (!isPrimaryMatch && !isSpecMatch) {
    const failInfo = recordLoginFailure(normalizedUser);
    if (failInfo.isNowLocked) {
      return {
        valid: false,
        error:
          'Account locked due to 5 consecutive authentication failures. Please contact IT governance.',
      };
    }
    return {
      valid: false,
      error: `Invalid clinician credentials. ${failInfo.attemptsLeft} attempt(s) remaining before temporary lockout.`,
    };
  }

  recordLoginSuccess(normalizedUser);

  const timestamp = new Date().toISOString();

  const userProfile: UserIdentityViewModel = isSpecMatch
    ? {
        id: 'usr-spec-002',
        displayName: 'Specialist Clinician',
        roleTitle: 'Consultant TMS Specialist',
        hasSigningAuthority: true,
        signingAuthorityLevel: 'Full Specialist Target Attestation (IEC 62304 / ISO 14971)',
        organizationId: 'org-melb-tms',
        organizationName: 'Melbourne TMS Centre',
        siteName: 'Site 1 — Surrey Hills Clinic',
        initials: 'SC',
      }
    : {
        ...CANONICAL_CLINICAL_SESSION.user,
      };

  const session: ClinicianAuthSession = {
    isAuthenticated: true,
    username: normalizedUser,
    loginTimestamp: timestamp,
    rememberMe: false,
    user: userProfile,
    organization: {
      ...CANONICAL_CLINICAL_SESSION.organization,
    },
    mode: CANONICAL_CLINICAL_SESSION.mode,
  };

  return { valid: true, session };
}
