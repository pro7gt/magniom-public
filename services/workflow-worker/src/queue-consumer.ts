/**
 * @magniom/workflow-worker
 * Queue Consumer & Job Execution Loop
 * Conforms to MAGNIOM-Supabase Database & Security Specification v1.0 Sections 93-95
 */

import type { WorkflowJob } from '@magniom/domain';
import type {
  JobHandler,
  JobExecutionContext,
  WorkflowDatabaseClient,
  WorkerConfig,
} from './types.js';
import { ProgressReporter } from './progress.js';

export class QueueConsumer {
  private readonly config: WorkerConfig;
  private readonly dbClient: WorkflowDatabaseClient;
  private readonly handlers: Map<string, JobHandler> = new Map();

  constructor(config: WorkerConfig, dbClient: WorkflowDatabaseClient) {
    this.config = config;
    this.dbClient = dbClient;
  }

  registerHandler(handler: JobHandler) {
    this.handlers.set(handler.jobType, handler);
  }

  async processNextMessage(queueName: string): Promise<boolean> {
    const messages = await this.dbClient.readQueueMessages(
      queueName,
      this.config.leaseSeconds,
      1
    );

    if (messages.length === 0 || !messages[0]) {
      return false;
    }

    const envelope = messages[0];
    const handler = this.handlers.get(envelope.requestedOperation) ?? this.handlers.get(queueName);

    if (!handler) {
      console.warn(`[Worker ${this.config.workerId}] No registered handler for operation '${envelope.requestedOperation}'`);
      return false;
    }

    // Atomically claim the job
    const claimed = await this.dbClient.claimJob(
      envelope.jobId,
      this.config.workerId,
      this.config.leaseSeconds
    );

    if (!claimed) {
      // Job was claimed by another worker or is already completed
      return false;
    }

    const progressReporter = new ProgressReporter(
      envelope.jobId,
      this.config.workerId,
      this.dbClient
    );
    progressReporter.startHeartbeat(this.config.heartbeatIntervalMs);

    const jobStub: WorkflowJob = {
      id: envelope.jobId,
      organisationId: envelope.organisationId,
      ...(envelope.caseId ? { caseId: envelope.caseId } : {}),
      jobType: envelope.requestedOperation,
      status: 'running',
      idempotencyKey: envelope.jobId,
      inputReference: envelope.payload,
      workerId: this.config.workerId,
      attemptCount: 1,
      maxAttempts: 3,
      createdAt: envelope.createdAt,
    };

    const ctx: JobExecutionContext = {
      job: jobStub,
      envelope,
      workerId: this.config.workerId,
      reportProgress: async (stage, desc, pct, detail) => {
        await progressReporter.report(stage, desc, pct, detail);
      },
      heartbeat: async () => {
        await this.dbClient.heartbeatJob(envelope.jobId, this.config.workerId);
      },
    };

    try {
      const result = await handler.execute(ctx);

      if (result.success) {
        await this.dbClient.completeJob(
          envelope.jobId,
          this.config.workerId,
          result.resultReference ?? {}
        );
        await this.dbClient.archiveQueueMessage(queueName, envelope.jobId);
      } else {
        await this.dbClient.failJob(
          envelope.jobId,
          this.config.workerId,
          result.error?.code ?? 'JOB_EXECUTION_FAILED',
          result.error?.detail ?? { message: result.error?.message ?? 'Failed' },
          result.error?.retryable ?? false
        );
      }
    } catch (err: any) {
      await this.dbClient.failJob(
        envelope.jobId,
        this.config.workerId,
        'UNHANDLED_EXCEPTION',
        { message: err.message, stack: err.stack },
        true
      );
    } finally {
      progressReporter.stopHeartbeat();
    }

    return true;
  }
}
