/**
 * @magniom/workflow-worker
 * Storage Client & Artifact Registry Integration
 * Conforms to MAGNIOM-Supabase Database & Security Specification v1.0 Sections 30, 97-109
 * and MAGNIOM-Technical Architecture v1.0 Sections 22-25
 */

import type { ArtifactRecord, ArtifactType, StorageBucket, StoragePathInfo } from '@magniom/domain';
import { computeSha256 } from '@magniom/scientific-policy';
import type { WorkflowDatabaseClient } from './types.js';

export class StorageClient {
  private readonly dbClient: WorkflowDatabaseClient;

  constructor(dbClient: WorkflowDatabaseClient) {
    this.dbClient = dbClient;
  }

  buildStoragePath(info: StoragePathInfo): string {
    if (info.slateId && info.candidateId) {
      return `org/${info.organisationId}/case/${info.caseId}/slate/${info.slateId}/candidate/${info.candidateId}/${info.filename}`;
    }
    if (info.runId) {
      return `org/${info.organisationId}/case/${info.caseId}/run/${info.runId}/artifact/${info.artifactId}/${info.filename}`;
    }
    if (info.studyId) {
      return `org/${info.organisationId}/case/${info.caseId}/study/${info.studyId}/artifact/${info.artifactId}/${info.filename}`;
    }
    if (info.decisionId) {
      return `org/${info.organisationId}/case/${info.caseId}/decision/${info.decisionId}/report/${info.artifactId}/${info.filename}`;
    }
    return `org/${info.organisationId}/case/${info.caseId}/artifact/${info.artifactId}/${info.filename}`;
  }

  async registerArtifact(params: {
    organisationId: string;
    caseId: string;
    artifactType: ArtifactType;
    bucket: StorageBucket | string;
    objectPath: string;
    content: string | Record<string, unknown>;
    mimeType?: string;
    processingRunId?: string;
  }): Promise<ArtifactRecord> {
    const rawContent = typeof params.content === 'string' ? params.content : JSON.stringify(params.content);
    const sha256 = computeSha256(params.content);
    const sizeBytes = Buffer.byteLength(rawContent, 'utf8');

    return this.dbClient.registerArtifact({
      organisationId: params.organisationId,
      caseId: params.caseId,
      artifactType: params.artifactType,
      bucket: params.bucket,
      objectPath: params.objectPath,
      mimeType: params.mimeType ?? 'application/json',
      sha256,
      sizeBytes,
      immutable: true,
      ...(params.processingRunId ? { processingRunId: params.processingRunId } : {}),
    });
  }
}
