/**
 * @magniom/web - Server-Side Clinician Session Registry & Revocation Authority
 * Conforms to MAG-SEC-001 (Mandatory Authentication) & MAG-SEC-009 (Session Integrity).
 *
 * Implements authoritative server-side session tracking keyed by JWT ID (jti).
 * Ensures server-side revocation on logout or compromise, protecting against token replay.
 */

export interface ServerSessionRecord {
  readonly jti: string;
  readonly userId: string;
  readonly username: string;
  readonly organizationId: string;
  readonly issuedAt: number; // Unix timestamp in seconds
  readonly expiresAt: number; // Unix timestamp in seconds
  revoked: boolean;
  revokedAt?: number;
  revocationReason?: string;
  readonly authAssuranceLevel: 'AAL1' | 'AAL2' | 'AAL3';
  lastActivityAt: number; // Unix timestamp in seconds
  readonly keyVersion: number;
}

// Global registry store preserved across hot reloads and worker executions
declare global {
  // eslint-disable-next-line no-var
  var __magniom_session_registry__: Map<string, ServerSessionRecord> | undefined;
  // eslint-disable-next-line no-var
  var __magniom_session_durable_loaded__: boolean | undefined;
}

export type SessionLookupStatus = 'active' | 'revoked' | 'unknown';

const sessions: Map<string, ServerSessionRecord> =
  globalThis.__magniom_session_registry__ ?? new Map<string, ServerSessionRecord>();

// Unconditionally attach to globalThis across all environments (production, development, test)
globalThis.__magniom_session_registry__ = sessions;

function getDurableStorePath(): string | null {
  if (typeof process === 'undefined' || !process.cwd) return null;
  const storeOverride = process.env?.MAGNIOM_SESSION_STORE_PATH;
  if (storeOverride) return storeOverride;
  try {
    const fs = require('node:fs');
    const path = require('node:path');
    const tempDir = path.join(process.cwd(), '.temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    return path.join(tempDir, 'session-registry-authority.json');
  } catch {
    return null;
  }
}

function syncFromDurableStore(): void {
  const storePath = getDurableStorePath();
  if (!storePath) return;
  try {
    const fs = require('node:fs');
    if (fs.existsSync(storePath)) {
      const data = JSON.parse(fs.readFileSync(storePath, 'utf-8'));
      if (Array.isArray(data)) {
        for (const item of data) {
          if (item && item.jti && !sessions.has(item.jti)) {
            sessions.set(item.jti, item);
          }
        }
      }
    }
  } catch {
    // Durable store read error - fall back to memory
  }
}

function persistToDurableStore(): void {
  const storePath = getDurableStorePath();
  if (!storePath) return;
  try {
    const fs = require('node:fs');
    const records = Array.from(sessions.values());
    fs.writeFileSync(storePath, JSON.stringify(records, null, 2), 'utf-8');
  } catch {
    // Durable store write error - remain in memory
  }
}

// Initial load if running in Node.js
if (!globalThis.__magniom_session_durable_loaded__) {
  syncFromDurableStore();
  globalThis.__magniom_session_durable_loaded__ = true;
}

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
  const record: ServerSessionRecord = {
    jti: params.jti,
    userId: params.userId,
    username: params.username,
    organizationId: params.organizationId ?? 'melb-tms-01',
    issuedAt: params.issuedAt,
    expiresAt: params.expiresAt,
    revoked: false,
    authAssuranceLevel: params.authAssuranceLevel ?? 'AAL2',
    lastActivityAt: Math.floor(Date.now() / 1000),
    keyVersion: params.keyVersion ?? 1,
  };

  sessions.set(params.jti, record);
  persistToDurableStore();
  return record;
}

/**
 * Returns the authoritative session lookup status: 'active' | 'revoked' | 'unknown'.
 * Fails closed: unlisted JTIs are strictly 'unknown'.
 */
export function getSessionStatus(jti: string): SessionLookupStatus {
  syncFromDurableStore();
  const record = sessions.get(jti);
  if (!record) {
    return 'unknown';
  }
  if (record.revoked) {
    return 'revoked';
  }
  const now = Math.floor(Date.now() / 1000);
  if (record.expiresAt < now) {
    return 'revoked';
  }
  return 'active';
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
  syncFromDurableStore();
  const record = sessions.get(jti);
  const now = Math.floor(Date.now() / 1000);
  if (record) {
    record.revoked = true;
    record.revokedAt = now;
    record.revocationReason = reason;
    persistToDurableStore();
    return true;
  }

  // If token record wasn't previously registered, persist a durable tombstone record
  sessions.set(jti, {
    jti,
    userId: 'unknown',
    username: 'unknown',
    organizationId: 'unknown',
    issuedAt: now,
    expiresAt: now + 3600 * 24 * 30,
    revoked: true,
    revokedAt: now,
    revocationReason: reason,
    authAssuranceLevel: 'AAL2',
    lastActivityAt: now,
    keyVersion: 1,
  });
  persistToDurableStore();
  return true;
}

/**
 * Updates last active timestamp for an active session.
 */
export function touchSessionActivity(jti: string): void {
  const record = sessions.get(jti);
  if (record && !record.revoked) {
    record.lastActivityAt = Math.floor(Date.now() / 1000);
    persistToDurableStore();
  }
}

/**
 * Retrieves a session record by jti.
 */
export function getServerSession(jti: string): ServerSessionRecord | undefined {
  syncFromDurableStore();
  return sessions.get(jti);
}

/**
 * Purges expired sessions from memory and durable store.
 */
export function cleanupExpiredSessions(): void {
  const now = Math.floor(Date.now() / 1000);
  for (const [jti, record] of sessions.entries()) {
    if (record.expiresAt < now) {
      sessions.delete(jti);
    }
  }
  persistToDurableStore();
}

/**
 * Simulates process restart by clearing in-memory Map while retaining durable backing.
 */
export function simulateServerRestartForTesting(): void {
  sessions.clear();
}

/**
 * Resets the session registry and durable backing (for testing only).
 */
export function resetSessionRegistryForTesting(): void {
  sessions.clear();
  const storePath = getDurableStorePath();
  if (storePath) {
    try {
      const fs = require('node:fs');
      if (fs.existsSync(storePath)) {
        fs.unlinkSync(storePath);
      }
    } catch {}
  }
}
