import {
  setGlobalSessionRegistrar,
  setGlobalSessionRevocationChecker,
} from '../security/session-crypto';
import {
  ServerSessionRecord,
  SessionLookupStatus,
  ISessionAuthority,
  getGlobalSessionAuthority,
  TransactionalFileSessionAuthority,
} from './session-authority';

export type { ServerSessionRecord, SessionLookupStatus, ISessionAuthority };

/**
 * Registers a newly issued clinician session in the authoritative registry.
 */
export function registerServerSession(params: {
  jti: string;
  userId: string;
  username: string;
  organizationId?: string;
  issuedAt: number;
  expiresAt: number;
  authAssuranceLevel?: 'AAL1' | 'AAL2' | 'AAL3';
  keyVersion?: number;
}): ServerSessionRecord {
  const now = Math.floor(Date.now() / 1000);
  const authority = getGlobalSessionAuthority();

  const record: ServerSessionRecord = {
    jti: params.jti,
    userId: params.userId,
    username: params.username,
    organizationId: params.organizationId ?? 'melb-tms-01',
    issuedAt: params.issuedAt,
    expiresAt: params.expiresAt,
    revoked: false,
    authAssuranceLevel: params.authAssuranceLevel ?? 'AAL2',
    lastActivityAt: now,
    keyVersion: params.keyVersion ?? 1,
    revision: 1,
    updatedAt: now,
  };

  return authority.registerSession(record) as ServerSessionRecord;
}

/**
 * Returns the authoritative session lookup status: 'active' | 'revoked' | 'unknown'.
 * Fails closed: unlisted JTIs are strictly 'unknown'.
 */
export function getSessionStatus(jti: string): SessionLookupStatus {
  const authority = getGlobalSessionAuthority();
  return authority.getSessionStatus(jti) as SessionLookupStatus;
}

/**
 * Checks if a session is invalid or revoked.
 * Fails closed: unlisted JTIs ('unknown') are treated as revoked/invalid.
 */
export function isSessionRevoked(jti: string): boolean {
  return getSessionStatus(jti) !== 'active';
}

/**
 * Revokes an active session by jti and records a tombstone.
 */
export function revokeSession(jti: string, reason = 'CLINICIAN_LOGOUT'): boolean {
  const authority = getGlobalSessionAuthority();
  return authority.revokeSession(jti, reason) as boolean;
}

/**
 * Revokes all active sessions for a given clinician userId and records tombstones.
 */
export function revokeUserSessions(userId: string, reason = 'USER_ALL_SESSIONS_REVOKED'): number {
  const authority = getGlobalSessionAuthority();
  return authority.revokeUserSessions(userId, reason) as number;
}

/**
 * Updates last active timestamp for an active session.
 */
export function touchSessionActivity(jti: string): void {
  const authority = getGlobalSessionAuthority();
  authority.touchSession(jti);
}

// Bind authoritative hooks to globalThis for Edge middleware / Next.js server runtime
setGlobalSessionRevocationChecker(isSessionRevoked);
setGlobalSessionRegistrar(registerServerSession);

/**
 * Retrieves a session record by jti.
 */
export function getServerSession(jti: string): ServerSessionRecord | undefined {
  const authority = getGlobalSessionAuthority();
  return authority.getSession(jti) as ServerSessionRecord | undefined;
}

/**
 * Purges expired sessions from memory and durable store.
 */
export function cleanupExpiredSessions(): void {
  const authority = getGlobalSessionAuthority();
  authority.cleanupExpired();
}

/**
 * Simulates process restart by clearing in-memory Map while retaining durable backing.
 */
export function simulateServerRestartForTesting(): void {
  const authority = getGlobalSessionAuthority();
  if (authority instanceof TransactionalFileSessionAuthority) {
    authority.clearInMemoryForTesting();
  }
}

/**
 * Resets the session registry and durable backing (for testing only).
 */
export function resetSessionRegistryForTesting(): void {
  const authority = getGlobalSessionAuthority();
  if (authority instanceof TransactionalFileSessionAuthority) {
    authority.resetAllForTesting();
  }
}
