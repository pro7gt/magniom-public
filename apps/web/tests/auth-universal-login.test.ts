/**
 * @magniom/web - Universal Clinician Authentication Test Suite
 *
 * Verifies:
 * 1. Universal credentials (user_name=magniom, password=cingulum) authenticate successfully.
 * 2. Case-insensitivity and whitespace trimming on username.
 * 3. Rejection of invalid credentials with calibrated error feedback.
 * 4. Authoritative clinician profile matching CANONICAL_CLINICAL_SESSION.
 * 5. Sign-out / session termination.
 * 6. Audit event logging (CLINICIAN_AUTHENTICATED, CLINICIAN_AUTH_FAILED, CLINICIAN_LOGGED_OUT).
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { authStore, UNIVERSAL_USER_NAME, UNIVERSAL_PASSWORD } from '../src/lib/auth-store';
import { onAuditEvent, type ShellAuditEvent } from '../src/lib/shell-observability';

describe('Universal Clinician Authentication & Session Authority', () => {
  beforeEach(() => {
    authStore.logoutClinician();
  });

  it('MAG-AUTH-01: authenticates successfully with universal credentials (magniom / cingulum)', () => {
    const result = authStore.authenticateClinician('magniom', 'cingulum');

    expect(result.success).toBe(true);
    expect(result.session).toBeDefined();
    expect(result.session?.isAuthenticated).toBe(true);
    expect(result.session?.username).toBe('magniom');
    expect(result.session?.user.displayName).toBe('Dr A. Smith');
    expect(result.session?.user.roleTitle).toBe('TMS Specialist & Clinical Reviewer');
    expect(result.session?.user.hasSigningAuthority).toBe(true);
    expect(result.session?.organization.organizationName).toBe('Melbourne TMS Centre');
    expect(authStore.isAuthenticated()).toBe(true);
  });

  it('MAG-AUTH-02: handles case-insensitivity and leading/trailing whitespace on username', () => {
    const upperResult = authStore.authenticateClinician('MAGNIOM', 'cingulum');
    expect(upperResult.success).toBe(true);
    expect(authStore.isAuthenticated()).toBe(true);

    authStore.logoutClinician();

    const paddedResult = authStore.authenticateClinician('  magniom  ', 'cingulum');
    expect(paddedResult.success).toBe(true);
  });

  it('MAG-AUTH-03: rejects incorrect password and emits CLINICIAN_AUTH_FAILED audit event', () => {
    const auditLogs: ShellAuditEvent[] = [];
    const unsubscribe = onAuditEvent(ev => auditLogs.push(ev));

    const result = authStore.authenticateClinician('magniom', 'incorrect_password');

    unsubscribe();

    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid clinician credentials');
    expect(authStore.isAuthenticated()).toBe(false);

    const failEvent = auditLogs.find(e => e.eventType === 'CLINICIAN_AUTH_FAILED');
    expect(failEvent).toBeDefined();
    expect(failEvent?.message).toContain('failed');
  });

  it('MAG-AUTH-04: rejects unknown username', () => {
    const result = authStore.authenticateClinician('invalid_user', 'cingulum');

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(authStore.isAuthenticated()).toBe(false);
  });

  it('MAG-AUTH-05: terminates active clinician session upon logout and emits CLINICIAN_LOGGED_OUT', () => {
    authStore.authenticateClinician('magniom', 'cingulum');
    expect(authStore.isAuthenticated()).toBe(true);

    const auditLogs: ShellAuditEvent[] = [];
    const unsubscribe = onAuditEvent(ev => auditLogs.push(ev));

    authStore.logoutClinician();

    unsubscribe();

    expect(authStore.isAuthenticated()).toBe(false);
    expect(authStore.getAuthSession()).toBeNull();

    const logoutEvent = auditLogs.find(e => e.eventType === 'CLINICIAN_LOGGED_OUT');
    expect(logoutEvent).toBeDefined();
  });

  it('MAG-AUTH-06: emits CLINICIAN_AUTHENTICATED audit event with full specialist metadata upon successful login', () => {
    const auditLogs: ShellAuditEvent[] = [];
    const unsubscribe = onAuditEvent(ev => auditLogs.push(ev));

    authStore.authenticateClinician(UNIVERSAL_USER_NAME, UNIVERSAL_PASSWORD, { rememberMe: true });

    unsubscribe();

    const authEvent = auditLogs.find(e => e.eventType === 'CLINICIAN_AUTHENTICATED');
    expect(authEvent).toBeDefined();
    expect(authEvent?.userId).toBe('usr-spec-001');
    expect(authEvent?.sessionId).toMatch(/^mgn-sess-/);
  });
});
