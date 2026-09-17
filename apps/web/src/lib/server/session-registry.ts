import {
  setGlobalSessionRegistrar,
  setGlobalSessionRevocationChecker,
} from '../security/session-crypto';

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
  revision: number; // Monotonically increasing revision for conflict resolution
  updatedAt: number; // Unix timestamp in seconds
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
  try {
    const fs = require('node:fs');
    const path = require('node:path');
    const effectivePath =
      process.env?.MAGNIOM_SESSION_STORE_PATH ??
      path.join(process.cwd(), '.temp', 'session-registry-authority.json');
    const parentDir = path.dirname(effectivePath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    return effectivePath;
  } catch {
    return null;
  }
}

/**
 * Merges two session records deterministically:
 * - Revocation is terminal: any revoked record takes precedence over non-revoked.
 * - If both or neither revoked: higher revision wins.
 * - If revisions equal: higher updatedAt wins.
 */
function mergeRecords(
  current: ServerSessionRecord | undefined,
  incoming: ServerSessionRecord,
): ServerSessionRecord {
  if (!current) return incoming;

  // Revocation tombstone is strictly terminal
  if (incoming.revoked && !current.revoked) return incoming;
  if (current.revoked && !incoming.revoked) return current;

  const currentRev = current.revision ?? 0;
  const incomingRev = incoming.revision ?? 0;

  if (incomingRev > currentRev) return incoming;
  if (currentRev > incomingRev) return current;

  const currentUpdated = current.updatedAt ?? current.lastActivityAt ?? 0;
  const incomingUpdated = incoming.updatedAt ?? incoming.lastActivityAt ?? 0;

  return incomingUpdated >= currentUpdated ? incoming : current;
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
          if (item && item.jti) {
            const existing = sessions.get(item.jti);
            const resolved = mergeRecords(existing, item);
            sessions.set(item.jti, resolved);
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

    // Read existing file to merge disk changes from other processes
    const diskRecords = new Map<string, ServerSessionRecord>();
    if (fs.existsSync(storePath)) {
      try {
        const fileContent = fs.readFileSync(storePath, 'utf-8');
        const parsed = JSON.parse(fileContent);
        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            if (item && item.jti) {
              diskRecords.set(item.jti, item);
            }
          }
        }
      } catch {
        // Disk read issue, proceed with memory
      }
    }

    // Merge in-memory records with disk records
    for (const [jti, memRec] of sessions.entries()) {
      const diskRec = diskRecords.get(jti);
      const merged = mergeRecords(diskRec, memRec);
      diskRecords.set(jti, merged);
      sessions.set(jti, merged);
    }

    // Merge any disk records not currently in memory
    for (const [jti, diskRec] of diskRecords.entries()) {
      if (!sessions.has(jti)) {
        sessions.set(jti, diskRec);
      }
    }

    const records = Array.from(diskRecords.values());
    const tempPath = `${storePath}.tmp.${process.pid}.${Date.now()}`;
    fs.writeFileSync(tempPath, JSON.stringify(records, null, 2), 'utf-8');
    fs.renameSync(tempPath, storePath);
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
  const now = Math.floor(Date.now() / 1000);
  const existing = sessions.get(params.jti);
  const revision = (existing?.revision ?? 0) + 1;

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
    revision,
    updatedAt: now,
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
    record.revision = (record.revision ?? 0) + 1;
    record.updatedAt = now;
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
    revision: 1,
    updatedAt: now,
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
    const now = Math.floor(Date.now() / 1000);
    record.lastActivityAt = now;
    record.revision = (record.revision ?? 0) + 1;
    record.updatedAt = now;
    persistToDurableStore();
  }
}

// Bind authoritative hooks to globalThis for Edge middleware / Next.js server runtime
setGlobalSessionRevocationChecker(isSessionRevoked);
setGlobalSessionRegistrar(registerServerSession);

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
