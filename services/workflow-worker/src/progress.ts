/**
 * @magniom/workflow-worker
 * Honest Milestone Progress Reporter & Heartbeat Controller
 * Conforms to MAGNIOM-Clinician Workspace & UX Specification v1.0 Section 126
 * and MAGNIOM-Supabase Database & Security Specification v1.0 Section 110
 */

import type { JobProgress } from '@magniom/domain';
import type { WorkflowDatabaseClient } from './types.js';

export class ProgressReporter {
  private readonly jobId: string;
  private readonly workerId: string;
  private readonly dbClient: WorkflowDatabaseClient;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;

  constructor(jobId: string, workerId: string, dbClient: WorkflowDatabaseClient) {
    this.jobId = jobId;
    this.workerId = workerId;
    this.dbClient = dbClient;
  }

  startHeartbeat(intervalMs = 10000) {
    if (this.heartbeatTimer) return;
    this.heartbeatTimer = setInterval(async () => {
      try {
        await this.dbClient.heartbeatJob(this.jobId, this.workerId);
      } catch (err) {
        console.error(`[Worker ${this.workerId}] Heartbeat failed for job ${this.jobId}:`, err);
      }
    }, intervalMs);
  }

  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  async report(
    stage: string,
    stageDescription: string,
    progressPercent?: number,
    detail: Record<string, unknown> = {},
  ): Promise<string> {
    const progress: Omit<JobProgress, 'id' | 'recordedAt'> = {
      jobId: this.jobId,
      stage,
      stageDescription,
      ...(progressPercent !== undefined ? { progressPercent } : {}),
      detail,
    };
    return this.dbClient.recordJobProgress(progress);
  }
}
