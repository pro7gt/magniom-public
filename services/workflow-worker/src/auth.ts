/**
 * @magniom/workflow-worker
 * Machine Worker Authentication and Least-Privilege Role Context
 * Conforms to MAGNIOM-Supabase Database & Security Specification v1.0 Sections 128-129
 * and MAGNIOM-Technical Architecture v1.0 Section 123
 */

import type { AppRole } from '@magniom/domain';

export interface WorkerAuthContext {
  readonly workerId: string;
  readonly role: AppRole;
  readonly organisationId?: string;
  readonly authenticatedAt: string;
}

export class WorkerAuthService {
  private readonly workerId: string;
  private readonly role: AppRole = 'service_worker';
  private readonly organisationId: string | undefined;

  constructor(options: { workerId: string; organisationId?: string | undefined }) {
    this.workerId = options.workerId;
    this.organisationId = options.organisationId;
  }

  getAuthContext(): WorkerAuthContext {
    return {
      workerId: this.workerId,
      role: this.role,
      ...(this.organisationId ? { organisationId: this.organisationId } : {}),
      authenticatedAt: new Date().toISOString(),
    };
  }

  assertWorkerPermission(permission: string): boolean {
    const allowedPermissions = new Set([
      'target.generate',
      'imaging.read',
      'imaging.upload',
      'connectome.read',
    ]);
    if (!allowedPermissions.has(permission)) {
      throw new Error(`WORKER_PERMISSION_DENIED: Machine worker does not possess permission '${permission}'`);
    }
    return true;
  }
}
