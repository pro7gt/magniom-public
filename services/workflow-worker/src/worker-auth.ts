/**
 * Worker Machine-to-Machine Authentication & Scoped Permission Management
 * Conforms to MAG-SEC-010, MAG-SEC-011, MAG-SEC-029 and Section 128 of Technical Architecture
 */

import { createHash, randomUUID } from 'node:crypto';

export interface WorkerClaims {
  sub: string; // Worker machine ID
  role: 'service_worker';
  orgId?: string | undefined;
  scope: string[];
  iat: number;
  exp: number;
  jti: string;
}

export interface WorkerJobContext {
  jobId: string;
  workerId: string;
  correlationId: string;
  traceId: string;
  caseId: string;
  orgId: string;
}

export class WorkerAuthManager {
  private allowedWorkerIds: Set<string>;
  private activeTokens: Map<string, WorkerClaims>;

  constructor(allowedWorkerIds: string[] = ['neurocompute-worker-01', 'workflow-worker-01', 'efield-worker-01', 'report-worker-01']) {
    this.allowedWorkerIds = new Set(allowedWorkerIds);
    this.activeTokens = new Map();
  }

  /**
   * Generates a signed M2M Worker Token with bounded TTL
   */
  public generateWorkerToken(workerId: string, scope: string[] = ['job.process', 'artifact.write'], ttlSeconds: number = 900): { token: string; claims: WorkerClaims } {
    if (!this.allowedWorkerIds.has(workerId)) {
      throw new Error(`MAG-SEC-010: Worker ID '${workerId}' is not registered in authorized worker registry.`);
    }

    const now = Math.floor(Date.now() / 1000);
    const claims: WorkerClaims = {
      sub: workerId,
      role: 'service_worker',
      scope,
      iat: now,
      exp: now + Math.min(ttlSeconds, 3600), // Max 1 hour
      jti: randomUUID(),
    };

    const tokenPayload = Buffer.from(JSON.stringify(claims)).toString('base64url');
    const signature = createHash('sha256').update(tokenPayload + ':MAGNIOM_WORKER_SECRET_KEY').digest('base64url');
    const token = `${tokenPayload}.${signature}`;

    this.activeTokens.set(claims.jti, claims);
    return { token, claims };
  }

  /**
   * Validates M2M Worker Token
   */
  public validateWorkerToken(token: string): { valid: boolean; claims?: WorkerClaims | undefined; error?: string | undefined } {
    try {
      const parts = token.split('.');
      if (parts.length !== 2) {
        return { valid: false, error: 'Malformed token structure' };
      }

      const payload = parts[0];
      const signature = parts[1];
      if (!payload || !signature) {
        return { valid: false, error: 'Malformed token structure' };
      }

      const expectedSignature = createHash('sha256').update(payload + ':MAGNIOM_WORKER_SECRET_KEY').digest('base64url');
      if (signature !== expectedSignature) {
        return { valid: false, error: 'Invalid token signature' };
      }

      const claims: WorkerClaims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
      const now = Math.floor(Date.now() / 1000);

      if (claims.exp <= now) {
        return { valid: false, error: 'Token has expired' };
      }

      if (claims.role !== 'service_worker') {
        return { valid: false, error: 'Token lacks service_worker role' };
      }

      return { valid: true, claims };
    } catch (err: any) {
      return { valid: false, error: err.message || 'Token verification failed' };
    }
  }

  /**
   * Builds de-identified job execution context (MAG-SEC-029: No patient PII in queue/logs)
   */
  public createJobContext(jobId: string, workerId: string, caseId: string, orgId: string, incomingCorrelationId?: string | undefined): WorkerJobContext {
    return {
      jobId,
      workerId,
      correlationId: incomingCorrelationId || `corr-${randomUUID().slice(0, 8)}`,
      traceId: `tr-${randomUUID().slice(0, 12)}`,
      caseId,
      orgId,
    };
  }

  /**
   * Validates storage path bounded access (MAG-SEC-014, Section 107)
   */
  public validateStorageAccess(workerScope: string[], requestedPath: string, allowedOrgId: string, allowedCaseId: string): boolean {
    if (!workerScope.includes('artifact.write') && !workerScope.includes('artifact.read')) {
      return false;
    }

    const expectedPrefix = `org/${allowedOrgId}/case/${allowedCaseId}/`;
    return requestedPath.startsWith(expectedPrefix);
  }
}
