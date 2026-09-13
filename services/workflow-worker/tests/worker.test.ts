/**
 * @magniom/workflow-worker
 * Worker Unit Tests — Claiming, Heartbeats, Progress, and Failure Handling
 */

import { describe, it, expect, vi } from 'vitest';
import {
  WorkflowWorker,
  ProgressReporter,
  WorkerAuthService,
  StorageClient,
} from '../src/index.js';
import type { WorkflowDatabaseClient, JobExecutionContext, JobHandler } from '../src/index.js';
import type {
  WorkflowJob,
  JobProgress,
  QueueEnvelope,
  ArtifactRecord,
  OutboxEvent,
} from '@magniom/domain';

class MockWorkflowDatabaseClient implements WorkflowDatabaseClient {
  jobs: Map<string, WorkflowJob> = new Map();
  progress: JobProgress[] = [];
  artifacts: ArtifactRecord[] = [];
  outbox: OutboxEvent[] = [];
  queues: Map<string, QueueEnvelope[]> = new Map();
  archivedMessages: Set<string> = new Set();

  async claimJob(jobId: string, workerId: string, _leaseSeconds: number): Promise<boolean> {
    const job = this.jobs.get(jobId);
    if (!job || job.status === 'succeeded' || job.status === 'running') {
      return false;
    }
    this.jobs.set(jobId, {
      ...job,
      status: 'running',
      workerId,
      attemptCount: job.attemptCount + 1,
      claimedAt: new Date().toISOString(),
      startedAt: new Date().toISOString(),
      lastHeartbeatAt: new Date().toISOString(),
    });
    return true;
  }

  async heartbeatJob(jobId: string, workerId: string): Promise<boolean> {
    const job = this.jobs.get(jobId);
    if (!job || job.workerId !== workerId || job.status !== 'running') {
      return false;
    }
    this.jobs.set(jobId, {
      ...job,
      lastHeartbeatAt: new Date().toISOString(),
    });
    return true;
  }

  async recordJobProgress(p: Omit<JobProgress, 'id' | 'recordedAt'>): Promise<string> {
    const id = `prog-${this.progress.length + 1}`;
    this.progress.push({
      ...p,
      id,
      recordedAt: new Date().toISOString(),
    });
    return id;
  }

  async completeJob(
    jobId: string,
    workerId: string,
    resultReference: Record<string, unknown>,
  ): Promise<boolean> {
    const job = this.jobs.get(jobId);
    if (!job || job.workerId !== workerId || job.status !== 'running') {
      return false;
    }
    this.jobs.set(jobId, {
      ...job,
      status: 'succeeded',
      completedAt: new Date().toISOString(),
      inputReference: { ...job.inputReference, ...resultReference },
    });
    return true;
  }

  async failJob(
    jobId: string,
    workerId: string,
    errorCode: string,
    errorDetail: Record<string, unknown>,
    retryable: boolean,
  ): Promise<boolean> {
    const job = this.jobs.get(jobId);
    if (!job || job.workerId !== workerId) {
      return false;
    }
    const nextStatus =
      retryable && job.attemptCount < job.maxAttempts ? 'failed_retryable' : 'failed_terminal';
    this.jobs.set(jobId, {
      ...job,
      status: nextStatus,
      errorCode,
      errorDetail,
      lastHeartbeatAt: new Date().toISOString(),
    });
    return true;
  }

  async publishTargetSlate(_input: any): Promise<{ slateId: string }> {
    return { slateId: 'slate-mock-001' };
  }

  async registerArtifact(
    artifact: Omit<ArtifactRecord, 'id' | 'createdAt'>,
  ): Promise<ArtifactRecord> {
    const record: ArtifactRecord = {
      ...artifact,
      id: `art-${this.artifacts.length + 1}`,
      createdAt: new Date().toISOString(),
    };
    this.artifacts.push(record);
    return record;
  }

  async fetchPendingOutboxEvents(_batchSize = 50): Promise<readonly OutboxEvent[]> {
    return this.outbox.filter(e => !e.publishedAt);
  }

  async markOutboxEventPublished(eventId: string): Promise<boolean> {
    const event = this.outbox.find(e => e.id === eventId);
    if (event) {
      (event as any).publishedAt = new Date().toISOString();
      return true;
    }
    return false;
  }

  async incrementOutboxAttempts(eventId: string): Promise<boolean> {
    const event = this.outbox.find(e => e.id === eventId);
    if (event) {
      (event as any).attempts = event.attempts + 1;
      return true;
    }
    return false;
  }

  async enqueueQueueMessage(queueName: string, envelope: QueueEnvelope): Promise<number> {
    const list = this.queues.get(queueName) ?? [];
    list.push(envelope);
    this.queues.set(queueName, list);
    return list.length;
  }

  async readQueueMessages(
    queueName: string,
    _vt: number,
    qty: number,
  ): Promise<readonly QueueEnvelope[]> {
    const list = this.queues.get(queueName) ?? [];
    const available = list.filter(m => !this.archivedMessages.has(`${queueName}:${m.jobId}`));
    return available.slice(0, qty);
  }

  async archiveQueueMessage(queueName: string, messageId: number | string): Promise<boolean> {
    this.archivedMessages.add(`${queueName}:${messageId}`);
    return true;
  }
}

describe('Worker Unit & Lifecycle Invariants', () => {
  it('authenticates machine worker with service_worker role and allowed permissions', () => {
    const auth = new WorkerAuthService({ workerId: 'worker-node-01' });
    const ctx = auth.getAuthContext();
    expect(ctx.role).toBe('service_worker');
    expect(ctx.workerId).toBe('worker-node-01');

    expect(auth.assertWorkerPermission('target.generate')).toBe(true);
    expect(auth.assertWorkerPermission('imaging.read')).toBe(true);
    expect(() => auth.assertWorkerPermission('phenotype.approve')).toThrowError(
      'WORKER_PERMISSION_DENIED',
    );
  });

  it('records progress milestones and maintains heartbeat during active execution', async () => {
    const dbClient = new MockWorkflowDatabaseClient();
    const jobId = 'job-001';
    const workerId = 'worker-test-01';

    dbClient.jobs.set(jobId, {
      id: jobId,
      organisationId: 'org-01',
      jobType: 'target_generation',
      status: 'queued',
      idempotencyKey: 'idem-01',
      inputReference: {},
      attemptCount: 0,
      maxAttempts: 3,
      createdAt: new Date().toISOString(),
    });

    const claimed = await dbClient.claimJob(jobId, workerId, 300);
    expect(claimed).toBe(true);

    const reporter = new ProgressReporter(jobId, workerId, dbClient);
    await reporter.report('VALIDATING_INPUTS', 'Verifying inputs', 20);
    await reporter.report('COMPUTING', 'Processing computation', 60);

    expect(dbClient.progress).toHaveLength(2);
    expect(dbClient.progress[0].stage).toBe('VALIDATING_INPUTS');
    expect(dbClient.progress[1].stage).toBe('COMPUTING');
    expect(dbClient.progress[1].progressPercent).toBe(60);

    reporter.stopHeartbeat();
  });

  it('handles job failure with retryable state when within attempt limits', async () => {
    const dbClient = new MockWorkflowDatabaseClient();
    const worker = new WorkflowWorker(dbClient, { workerId: 'worker-fail-test' });

    const jobId = 'job-fail-01';
    dbClient.jobs.set(jobId, {
      id: jobId,
      organisationId: 'org-01',
      jobType: 'target_generation',
      status: 'queued',
      idempotencyKey: 'idem-fail-01',
      inputReference: {},
      attemptCount: 0,
      maxAttempts: 3,
      createdAt: new Date().toISOString(),
    });

    await dbClient.enqueueQueueMessage('target_generation', {
      schemaVersion: '1.0',
      jobId,
      organisationId: 'org-01',
      caseId: 'case-01',
      correlationId: 'corr-01',
      requestedOperation: 'target_generation',
      createdAt: new Date().toISOString(),
      payload: {},
    });

    const failingHandler: JobHandler = {
      jobType: 'target_generation',
      execute: async () => {
        return {
          success: false,
          error: {
            code: 'TRANSIENT_RESOURCE_BUSY',
            message: 'Database connection saturated',
            retryable: true,
          },
        };
      },
    };

    worker.registerHandler(failingHandler);
    const result = await worker.runOnce(['target_generation']);
    expect(result.processedJobs).toBe(1);

    const job = dbClient.jobs.get(jobId);
    expect(job?.status).toBe('failed_retryable');
    expect(job?.attemptCount).toBe(1);
    expect(job?.errorCode).toBe('TRANSIENT_RESOURCE_BUSY');
  });

  it('processes Sprint 8 NeuroCompute structural processing job in Research Mode', async () => {
    const dbClient = new MockWorkflowDatabaseClient();
    const worker = new WorkflowWorker(dbClient, { workerId: 'worker-neuro-test' });

    const jobId = 'job-structural-01';
    dbClient.jobs.set(jobId, {
      id: jobId,
      organisationId: 'a0000000-0000-0000-0000-000000000001',
      caseId: 'e0000000-0000-0000-0000-000000000001',
      jobType: 'structural_processing',
      status: 'queued',
      idempotencyKey: 'idem-struct-01',
      inputReference: {},
      attemptCount: 0,
      maxAttempts: 3,
      createdAt: new Date().toISOString(),
    });

    await dbClient.enqueueQueueMessage('neurocompute', {
      schemaVersion: '1.0',
      jobId,
      organisationId: 'a0000000-0000-0000-0000-000000000001',
      caseId: 'e0000000-0000-0000-0000-000000000001',
      correlationId: 'corr-struct-01',
      requestedOperation: 'structural_processing',
      createdAt: new Date().toISOString(),
      payload: {
        imagingStudyId: 'img-study-syn-001',
        connectomicsRunId: 'run-struct-001',
        mode: 'RESEARCH',
      },
    });

    const handler = new (
      await import('../src/handlers/structural-processing.js')
    ).StructuralProcessingJobHandler(dbClient);
    worker.registerHandler(handler);

    const result = await worker.runOnce(['neurocompute']);
    expect(result.processedJobs).toBe(1);

    const job = dbClient.jobs.get(jobId);
    expect(job?.status).toBe('succeeded');
    expect(dbClient.artifacts.length).toBeGreaterThan(0);
    expect(dbClient.progress.some(p => p.stage === 'SURFACE_RECONSTRUCTION')).toBe(true);
  });

  describe('Spec v2.0 §47: Queue Resilience, Idempotency & Failure Simulation', () => {
    it('prevents duplicate processing when duplicate queue message is delivered (idempotency)', async () => {
      const dbClient = new MockWorkflowDatabaseClient();
      const worker = new WorkflowWorker(dbClient, { workerId: 'worker-idempotency-test' });

      const jobId = 'job-idem-dup-01';
      dbClient.jobs.set(jobId, {
        id: jobId,
        organisationId: 'org-01',
        jobType: 'target_generation',
        status: 'queued',
        idempotencyKey: 'idem-key-duplicate-01',
        inputReference: {},
        attemptCount: 0,
        maxAttempts: 3,
        createdAt: new Date().toISOString(),
      });

      let executionCount = 0;
      const handler: JobHandler = {
        jobType: 'target_generation',
        execute: async () => {
          executionCount++;
          return {
            success: true,
            resultReference: { slateId: 'slate-single-001' },
          };
        },
      };
      worker.registerHandler(handler);

      // Enqueue first delivery
      await dbClient.enqueueQueueMessage('target_generation', {
        schemaVersion: '1.0',
        jobId,
        organisationId: 'org-01',
        caseId: 'case-01',
        correlationId: 'corr-idem-1',
        requestedOperation: 'target_generation',
        createdAt: new Date().toISOString(),
        payload: {},
      });

      // Run once -> succeeds
      const result1 = await worker.runOnce(['target_generation']);
      expect(result1.processedJobs).toBe(1);
      expect(executionCount).toBe(1);
      expect(dbClient.jobs.get(jobId)?.status).toBe('succeeded');

      // Now simulate duplicate message delivery in the queue
      await dbClient.enqueueQueueMessage('target_generation', {
        schemaVersion: '1.0',
        jobId,
        organisationId: 'org-01',
        caseId: 'case-01',
        correlationId: 'corr-idem-dup',
        requestedOperation: 'target_generation',
        createdAt: new Date().toISOString(),
        payload: {},
      });

      // Claiming an already succeeded job must fail (status !== queued)
      const canReclaim = await dbClient.claimJob(jobId, 'worker-idempotency-test', 300);
      expect(canReclaim).toBe(false);

      // Job status remains succeeded, executionCount remains 1
      expect(executionCount).toBe(1);
      expect(dbClient.jobs.get(jobId)?.status).toBe('succeeded');
    });

    it('transitions to failed_terminal when attempt count reaches maxAttempts', async () => {
      const dbClient = new MockWorkflowDatabaseClient();
      const worker = new WorkflowWorker(dbClient, { workerId: 'worker-terminal-test' });

      const jobId = 'job-max-attempts-01';
      dbClient.jobs.set(jobId, {
        id: jobId,
        organisationId: 'org-01',
        jobType: 'target_generation',
        status: 'queued',
        idempotencyKey: 'idem-max-01',
        inputReference: {},
        attemptCount: 2, // Already attempted twice, max is 3
        maxAttempts: 3,
        createdAt: new Date().toISOString(),
      });

      await dbClient.enqueueQueueMessage('target_generation', {
        schemaVersion: '1.0',
        jobId,
        organisationId: 'org-01',
        caseId: 'case-01',
        correlationId: 'corr-max-01',
        requestedOperation: 'target_generation',
        createdAt: new Date().toISOString(),
        payload: {},
      });

      const failingHandler: JobHandler = {
        jobType: 'target_generation',
        execute: async () => {
          return {
            success: false,
            error: {
              code: 'TRANSIENT_RESOURCE_BUSY',
              message: 'Temporary lock conflict',
              retryable: true,
            },
          };
        },
      };

      worker.registerHandler(failingHandler);
      const result = await worker.runOnce(['target_generation']);
      expect(result.processedJobs).toBe(1);

      // Since attemptCount reached maxAttempts (3), status transitions to failed_terminal
      const job = dbClient.jobs.get(jobId);
      expect(job?.status).toBe('failed_terminal');
      expect(job?.attemptCount).toBe(3);
    });

    it('transitions immediately to failed_terminal on non-retryable poison message', async () => {
      const dbClient = new MockWorkflowDatabaseClient();
      const worker = new WorkflowWorker(dbClient, { workerId: 'worker-poison-test' });

      const jobId = 'job-poison-01';
      dbClient.jobs.set(jobId, {
        id: jobId,
        organisationId: 'org-01',
        jobType: 'target_generation',
        status: 'queued',
        idempotencyKey: 'idem-poison-01',
        inputReference: {},
        attemptCount: 0,
        maxAttempts: 5,
        createdAt: new Date().toISOString(),
      });

      await dbClient.enqueueQueueMessage('target_generation', {
        schemaVersion: '1.0',
        jobId,
        organisationId: 'org-01',
        caseId: 'case-01',
        correlationId: 'corr-poison-01',
        requestedOperation: 'target_generation',
        createdAt: new Date().toISOString(),
        payload: { malformedPayload: true },
      });

      const poisonHandler: JobHandler = {
        jobType: 'target_generation',
        execute: async () => {
          return {
            success: false,
            error: {
              code: 'FATAL_CORRUPT_PAYLOAD',
              message: 'Payload fails canonical schema validation and cannot be parsed',
              retryable: false, // Non-retryable poison message
            },
          };
        },
      };

      worker.registerHandler(poisonHandler);
      const result = await worker.runOnce(['target_generation']);
      expect(result.processedJobs).toBe(1);

      // Fails terminally on attempt 1 without retry
      const job = dbClient.jobs.get(jobId);
      expect(job?.status).toBe('failed_terminal');
      expect(job?.attemptCount).toBe(1);
      expect(job?.errorCode).toBe('FATAL_CORRUPT_PAYLOAD');
    });
  });
});
