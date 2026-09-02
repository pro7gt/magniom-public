/**
 * @magniom/workflow-worker
 * Transactional Outbox Event Dispatcher
 * Conforms to MAGNIOM-Supabase Database & Security Specification v1.0 Section 87
 * and MAGNIOM-Technical Architecture v1.0 Section 127
 */

import type { QueueEnvelope, QueueName } from '@magniom/domain';
import type { WorkflowDatabaseClient } from '../types.js';

export class OutboxDispatcher {
  private readonly dbClient: WorkflowDatabaseClient;

  constructor(dbClient: WorkflowDatabaseClient) {
    this.dbClient = dbClient;
  }

  async dispatchPendingEvents(
    batchSize = 50,
  ): Promise<{ dispatchedCount: number; errors: number }> {
    const events = await this.dbClient.fetchPendingOutboxEvents(batchSize);
    let dispatchedCount = 0;
    let errors = 0;

    for (const event of events) {
      try {
        const queueName = this.mapEventToQueue(event.eventType);
        if (queueName) {
          const envelope: QueueEnvelope = {
            schemaVersion: '1.0',
            jobId: (event.payload['jobId'] as string) ?? event.id,
            organisationId: event.organisationId ?? 'a0000000-0000-0000-0000-000000000001',
            caseId: (event.payload['caseId'] as string) ?? event.aggregateId,
            correlationId: (event.payload['correlationId'] as string) ?? event.id,
            queueName: queueName as QueueName,
            requestedOperation: event.eventType,
            createdAt: event.createdAt,
            payload: event.payload,
          };

          await this.dbClient.enqueueQueueMessage(queueName, envelope);
        }

        await this.dbClient.markOutboxEventPublished(event.id);
        dispatchedCount++;
      } catch (err) {
        console.error(`Failed to dispatch outbox event ${event.id}:`, err);
        await this.dbClient.incrementOutboxAttempts(event.id);
        errors++;
      }
    }

    return { dispatchedCount, errors };
  }

  private mapEventToQueue(eventType: string): string | null {
    switch (eventType) {
      case 'TARGET_GENERATION_REQUESTED':
      case 'PHENOTYPE_APPROVED':
        return 'target_generation';
      case 'IMAGING_UPLOADED':
        return 'imaging_ingest';
      case 'NEUROCOMPUTE_REQUESTED':
        return 'neurocompute';
      case 'REPORT_REQUESTED':
        return 'report_generation';
      default:
        return 'outbox_dispatch';
    }
  }
}
