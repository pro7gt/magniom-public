/**
 * @magniom/workflow-worker
 * Worker Runtime Configuration
 */

import type { WorkerConfig } from './types.js';

export function getWorkerConfig(overrides?: Partial<WorkerConfig>): WorkerConfig {
  const workerId = overrides?.workerId ?? `worker-${Math.random().toString(36).substring(2, 10)}`;
  const orgId = overrides?.organisationId ?? process.env.MAGNIOM_ORG_ID;
  return {
    workerId,
    ...(orgId ? { organisationId: orgId } : {}),
    pollIntervalMs: overrides?.pollIntervalMs ?? 1000,
    leaseSeconds: overrides?.leaseSeconds ?? 300,
    heartbeatIntervalMs: overrides?.heartbeatIntervalMs ?? 10000,
    maxConcurrency: overrides?.maxConcurrency ?? 5,
  };
}
