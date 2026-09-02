/**
 * @magniom/workflow-worker
 * Main Background Workflow Worker Runtime
 * Conforms to MAGNIOM-Supabase Database & Security Specification v1.0 Section 128-129
 */

import type { WorkerConfig, WorkflowDatabaseClient, JobHandler } from './types.js';
import { getWorkerConfig } from './config.js';
import { QueueConsumer } from './queue-consumer.js';
import { OutboxDispatcher } from './handlers/outbox-dispatcher.js';

export class WorkflowWorker {
  private readonly config: WorkerConfig;
  private readonly dbClient: WorkflowDatabaseClient;
  private readonly consumer: QueueConsumer;
  private readonly dispatcher: OutboxDispatcher;
  private isRunning = false;
  private runTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(dbClient: WorkflowDatabaseClient, configOverrides?: Partial<WorkerConfig>) {
    this.config = getWorkerConfig(configOverrides);
    this.dbClient = dbClient;
    this.consumer = new QueueConsumer(this.config, dbClient);
    this.dispatcher = new OutboxDispatcher(dbClient);
  }

  registerHandler(handler: JobHandler) {
    this.consumer.registerHandler(handler);
  }

  async runOnce(
    queues: string[] = ['target_generation', 'neurocompute', 'imaging_ingest'],
  ): Promise<{
    dispatchedEvents: number;
    processedJobs: number;
  }> {
    // 1. Dispatch pending outbox events
    const dispatchResult = await this.dispatcher.dispatchPendingEvents();

    // 2. Poll and process one job from each queue
    let processedJobs = 0;
    for (const queue of queues) {
      const processed = await this.consumer.processNextMessage(queue);
      if (processed) {
        processedJobs++;
      }
    }

    return {
      dispatchedEvents: dispatchResult.dispatchedCount,
      processedJobs,
    };
  }

  start(queues: string[] = ['target_generation', 'neurocompute', 'imaging_ingest']) {
    this.isRunning = true;
    const loop = async () => {
      if (!this.isRunning) return;
      try {
        await this.runOnce(queues);
      } catch (err) {
        console.error(`[Worker ${this.config.workerId}] Error in worker loop:`, err);
      }
      if (this.isRunning) {
        this.runTimer = setTimeout(loop, this.config.pollIntervalMs);
      }
    };
    loop();
  }

  stop() {
    this.isRunning = false;
    if (this.runTimer) {
      clearTimeout(this.runTimer);
      this.runTimer = null;
    }
  }

  getConfig(): WorkerConfig {
    return this.config;
  }

  getDatabaseClient(): WorkflowDatabaseClient {
    return this.dbClient;
  }
}
