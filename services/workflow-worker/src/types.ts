/**
 * @magniom/workflow-worker
 * Worker Type Definitions and Handler Interfaces
 * Conforms to MAGNIOM-Supabase Database & Security Specification v1.0 Section 128-129
 */

import type {
  QueueEnvelope,
  WorkflowJob,
  JobProgress,
  ArtifactRecord,
  PublishTargetSlateInput,
  OutboxEvent,
} from '@magniom/domain';

export interface WorkerConfig {
  readonly workerId: string;
  readonly organisationId?: string;
  readonly pollIntervalMs: number;
  readonly leaseSeconds: number;
  readonly heartbeatIntervalMs: number;
  readonly maxConcurrency: number;
}

export interface JobExecutionContext<T = Record<string, unknown>> {
  readonly job: WorkflowJob;
  readonly envelope: QueueEnvelope<T>;
  readonly workerId: string;
  reportProgress(stage: string, description: string, progressPercent?: number, detail?: Record<string, unknown>): Promise<void>;
  heartbeat(): Promise<void>;
}

export interface JobHandlerResult {
  readonly success: boolean;
  readonly resultReference?: Record<string, unknown>;
  readonly registeredArtifacts?: readonly ArtifactRecord[];
  readonly publishedSlateInput?: PublishTargetSlateInput;
  readonly error?: {
    readonly code: string;
    readonly message: string;
    readonly detail?: Record<string, unknown>;
    readonly retryable: boolean;
  };
}

export interface JobHandler<T = Record<string, unknown>> {
  readonly jobType: string;
  execute(ctx: JobExecutionContext<T>): Promise<JobHandlerResult>;
}

export interface WorkflowDatabaseClient {
  claimJob(jobId: string, workerId: string, leaseSeconds: number): Promise<boolean>;
  heartbeatJob(jobId: string, workerId: string): Promise<boolean>;
  recordJobProgress(progress: Omit<JobProgress, 'id' | 'recordedAt'>): Promise<string>;
  completeJob(jobId: string, workerId: string, resultReference: Record<string, unknown>): Promise<boolean>;
  failJob(jobId: string, workerId: string, errorCode: string, errorDetail: Record<string, unknown>, retryable: boolean): Promise<boolean>;
  publishTargetSlate(input: PublishTargetSlateInput): Promise<{ slateId: string }>;
  registerArtifact(artifact: Omit<ArtifactRecord, 'id' | 'createdAt'>): Promise<ArtifactRecord>;
  fetchPendingOutboxEvents(batchSize?: number): Promise<readonly OutboxEvent[]>;
  markOutboxEventPublished(eventId: string): Promise<boolean>;
  incrementOutboxAttempts(eventId: string): Promise<boolean>;
  enqueueQueueMessage(queueName: string, envelope: QueueEnvelope): Promise<number>;
  readQueueMessages(queueName: string, visibilityTimeoutSeconds: number, quantity: number): Promise<readonly QueueEnvelope[]>;
  archiveQueueMessage(queueName: string, messageId: number | string): Promise<boolean>;
}
