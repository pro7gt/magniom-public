/**
 * @magniom/web - Authoritative Distributed Session Authority Engine
 * Conforms to MAG-SEC-001 (Mandatory authentication), MAG-SEC-009 (Session Integrity),
 * and MAGNIOM Revision 06 distributed session authority architecture.
 *
 * Implements a pluggable, Edge-compatible, transactional session authority interface
 * supporting database persistence, file-backed atomic persistence, and in-memory caches.
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
  revision: number; // Monotonically increasing revision for conflict resolution
  updatedAt: number; // Unix timestamp in seconds
}

export type SessionLookupStatus = 'active' | 'revoked' | 'unknown';

export interface ISessionAuthority {
  registerSession(record: ServerSessionRecord): Promise<ServerSessionRecord> | ServerSessionRecord;
  getSessionStatus(jti: string): Promise<SessionLookupStatus> | SessionLookupStatus;
  revokeSession(jti: string, reason?: string): Promise<boolean> | boolean;
  revokeUserSessions(userId: string, reason?: string): Promise<number> | number;
  touchSession(jti: string): Promise<void> | void;
  cleanupExpired(): Promise<void> | void;
  getSession(
    jti: string,
  ): Promise<ServerSessionRecord | undefined> | (ServerSessionRecord | undefined);
}

/**
 * Merges two session records deterministically:
 * - Revocation is terminal: any revoked record takes precedence over non-revoked.
 * - If both or neither revoked: higher revision wins.
 * - If revisions equal: higher updatedAt wins.
 */
export function mergeSessionRecords(
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

/**
 * Transactional File-Backed Session Authority
 * Uses atomic rename and deterministic record merging across processes.
 */
export class TransactionalFileSessionAuthority implements ISessionAuthority {
  private inMemoryCache = new Map<string, ServerSessionRecord>();
  private storePath: string | null;

  constructor(customStorePath?: string) {
    this.storePath = customStorePath ?? this.resolveDefaultStorePath();
    this.syncFromDisk();
  }

  private resolveDefaultStorePath(): string | null {
    if (typeof process === 'undefined' || !process.cwd) return null;
    try {
      const path = require('node:path');
      const fs = require('node:fs');
      
      if (process.env?.MAGNIOM_SESSION_STORE_PATH) {
        const p = process.env.MAGNIOM_SESSION_STORE_PATH;
        const dir = path.dirname(p);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        return p;
      }

      // Detect monorepo root whether cwd is in apps/web, services, or root
      const cwd = process.cwd();
      let rootDir = cwd;
      if (cwd.endsWith('/apps/web') || cwd.endsWith('\\apps\\web')) {
        rootDir = path.resolve(cwd, '..', '..');
      } else if (cwd.includes('/apps/') || cwd.includes('\\apps\\') || cwd.includes('/services/') || cwd.includes('\\services\\')) {
        rootDir = path.resolve(cwd, '..', '..');
      } else if (fs.existsSync(path.join(cwd, 'apps', 'web'))) {
        rootDir = cwd;
      }

      const tempDir = path.join(rootDir, '.temp');
      try {
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
        }
        return path.join(tempDir, 'session-registry-authority.json');
      } catch {
        // Fallback to system temp directory in read-only app containers / serverless runtimes
        try {
          const os = require('node:os');
          const sysTemp = path.join(os.tmpdir(), 'magniom-sessions');
          if (!fs.existsSync(sysTemp)) {
            fs.mkdirSync(sysTemp, { recursive: true });
          }
          return path.join(sysTemp, 'session-registry-authority.json');
        } catch {
          return null;
        }
      }
    } catch {
      return null;
    }
  }

  private syncFromDisk(): void {
    if (!this.storePath) return;
    try {
      const fs = require('node:fs');
      if (fs.existsSync(this.storePath)) {
        const raw = fs.readFileSync(this.storePath, 'utf8');
        const data = JSON.parse(raw);
        if (Array.isArray(data)) {
          for (const item of data) {
            if (item && item.jti) {
              const existing = this.inMemoryCache.get(item.jti);
              this.inMemoryCache.set(item.jti, mergeSessionRecords(existing, item));
            }
          }
        }
      }
    } catch {}
  }

  private persistToDisk(): void {
    if (!this.storePath) return;
    try {
      const fs = require('node:fs');
      const diskMap = new Map<string, ServerSessionRecord>();

      if (fs.existsSync(this.storePath)) {
        try {
          const raw = fs.readFileSync(this.storePath, 'utf8');
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            for (const item of parsed) {
              if (item && item.jti) diskMap.set(item.jti, item);
            }
          }
        } catch {}
      }

      for (const [jti, memRec] of this.inMemoryCache.entries()) {
        const diskRec = diskMap.get(jti);
        const merged = mergeSessionRecords(diskRec, memRec);
        diskMap.set(jti, merged);
        this.inMemoryCache.set(jti, merged);
      }

      for (const [jti, diskRec] of diskMap.entries()) {
        if (!this.inMemoryCache.has(jti)) {
          this.inMemoryCache.set(jti, diskRec);
        }
      }

      const records = Array.from(diskMap.values());
      const tempPath = `${this.storePath}.tmp.${process.pid}.${Date.now()}`;
      fs.writeFileSync(tempPath, JSON.stringify(records, null, 2), 'utf8');
      fs.renameSync(tempPath, this.storePath);
    } catch {}
  }

  public registerSession(record: ServerSessionRecord): ServerSessionRecord {
    this.syncFromDisk();
    const existing = this.inMemoryCache.get(record.jti);
    const resolved = mergeSessionRecords(existing, record);
    this.inMemoryCache.set(record.jti, resolved);
    this.persistToDisk();
    return resolved;
  }

  public getSessionStatus(jti: string): SessionLookupStatus {
    this.syncFromDisk();
    const record = this.inMemoryCache.get(jti);
    if (!record) return 'unknown';
    if (record.revoked) return 'revoked';
    const now = Math.floor(Date.now() / 1000);
    if (record.expiresAt < now) return 'revoked';
    return 'active';
  }

  public revokeSession(jti: string, reason = 'CLINICIAN_LOGOUT'): boolean {
    this.syncFromDisk();
    const now = Math.floor(Date.now() / 1000);
    const existing = this.inMemoryCache.get(jti);

    if (existing) {
      existing.revoked = true;
      existing.revokedAt = now;
      existing.revocationReason = reason;
      existing.revision = (existing.revision ?? 0) + 1;
      existing.updatedAt = now;
    } else {
      this.inMemoryCache.set(jti, {
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
    }

    this.persistToDisk();
    return true;
  }

  public revokeUserSessions(userId: string, reason = 'USER_ALL_SESSIONS_REVOKED'): number {
    this.syncFromDisk();
    const now = Math.floor(Date.now() / 1000);
    let revokedCount = 0;

    for (const record of this.inMemoryCache.values()) {
      if (record.userId === userId && !record.revoked) {
        record.revoked = true;
        record.revokedAt = now;
        record.revocationReason = reason;
        record.revision = (record.revision ?? 0) + 1;
        record.updatedAt = now;
        revokedCount++;
      }
    }

    if (revokedCount > 0) {
      this.persistToDisk();
    }
    return revokedCount;
  }

  public touchSession(jti: string): void {
    const record = this.inMemoryCache.get(jti);
    if (record && !record.revoked) {
      const now = Math.floor(Date.now() / 1000);
      record.lastActivityAt = now;
      record.revision = (record.revision ?? 0) + 1;
      record.updatedAt = now;
      this.persistToDisk();
    }
  }

  public cleanupExpired(): void {
    const now = Math.floor(Date.now() / 1000);
    for (const [jti, rec] of this.inMemoryCache.entries()) {
      if (rec.expiresAt < now) {
        this.inMemoryCache.delete(jti);
      }
    }
    this.persistToDisk();
  }

  public getSession(jti: string): ServerSessionRecord | undefined {
    this.syncFromDisk();
    return this.inMemoryCache.get(jti);
  }

  public clearInMemoryForTesting(): void {
    this.inMemoryCache.clear();
  }

  public resetAllForTesting(): void {
    this.inMemoryCache.clear();
    if (this.storePath) {
      try {
        const fs = require('node:fs');
        if (fs.existsSync(this.storePath)) {
          fs.unlinkSync(this.storePath);
        }
      } catch {}
    }
  }
}

// Global authority singleton
declare global {
  // eslint-disable-next-line no-var
  var __magniom_session_authority_instance__: ISessionAuthority | undefined;
}

export function getGlobalSessionAuthority(): ISessionAuthority {
  if (!globalThis.__magniom_session_authority_instance__) {
    globalThis.__magniom_session_authority_instance__ = new TransactionalFileSessionAuthority();
  }
  return globalThis.__magniom_session_authority_instance__;
}

export function setGlobalSessionAuthority(authority: ISessionAuthority): void {
  globalThis.__magniom_session_authority_instance__ = authority;
}
