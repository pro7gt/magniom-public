/**
 * @magniom/workflow-worker
 * Synthetic Target Slate Generation Job Handler
 * Conforms to MAGNIOM-Implementation & Validation Roadmap v1.0 Section 111 (Sprint 7 Exit Criteria)
 * and MAGNIOM-Synthetic Vertical Slice Implementation Specification v1.0 Section 76
 */

import type {
  JobHandler,
  JobExecutionContext,
  JobHandlerResult,
  WorkflowDatabaseClient,
} from '../types.js';
import type {
  TargetGenerationMessage,
  PhenotypeSnapshot,
} from '@magniom/domain';
import {
  runTargetEngine,
  serializeTargetSlateForDatabase,
  type TargetEngineConnectomeInput,
} from '@magniom/target-engine';
import { validateTargetGenerationMessage } from '@magniom/schemas';
import { StorageClient } from '../storage-client.js';

export interface TargetEngineContextLoader {
  loadContext(params: {
    organisationId: string;
    caseId: string;
    phenotypeSnapshotId: string;
    connectomeRunId?: string | undefined;
  }): Promise<{
    phenotypeSnapshot: PhenotypeSnapshot;
    connectome: TargetEngineConnectomeInput | null;
  }>;
}

export class TargetGenerationJobHandler implements JobHandler<Record<string, unknown>> {
  readonly jobType = 'target_generation';
  private readonly dbClient: WorkflowDatabaseClient;
  private readonly contextLoader: TargetEngineContextLoader;
  private readonly storageClient: StorageClient;

  constructor(
    dbClient: WorkflowDatabaseClient,
    contextLoader: TargetEngineContextLoader
  ) {
    this.dbClient = dbClient;
    this.contextLoader = contextLoader;
    this.storageClient = new StorageClient(dbClient);
  }

  async execute(ctx: JobExecutionContext<Record<string, unknown>>): Promise<JobHandlerResult> {
    try {
      // Step 1: Validate Envelope Schema (Zero PHI)
      await ctx.reportProgress(
        'VALIDATING_JOB_INPUTS',
        'Validating zero-PHI target generation envelope and job parameters',
        10
      );

      const rawPayload = ctx.envelope.payload as Record<string, unknown>;
      const targetMsg: TargetGenerationMessage = validateTargetGenerationMessage({
        schemaVersion: ctx.envelope.schemaVersion,
        jobId: ctx.envelope.jobId,
        organisationId: ctx.envelope.organisationId,
        caseId: ctx.envelope.caseId,
        phenotypeSnapshotId: rawPayload['phenotypeSnapshotId'] as string,
        ...(rawPayload['connectomeRunId'] ? { connectomeRunId: rawPayload['connectomeRunId'] as string } : {}),
        targetEngineVersionId: (rawPayload['targetEngineVersionId'] as string) ?? '1.0.0',
        evidenceLibraryReleaseId: (rawPayload['evidenceLibraryReleaseId'] as string) ?? 'e0000000-0000-0000-0000-000000000001',
        correlationId: ctx.envelope.correlationId,
      });

      // Step 2: Load Clinical Context (Phenotype Snapshot & Optional Connectome)
      await ctx.reportProgress(
        'LOADING_CLINICAL_CONTEXT',
        'Retrieving approved phenotype snapshot and connectome matrices',
        30
      );

      const context = await this.contextLoader.loadContext({
        organisationId: targetMsg.organisationId,
        caseId: targetMsg.caseId,
        phenotypeSnapshotId: targetMsg.phenotypeSnapshotId,
        ...(targetMsg.connectomeRunId ? { connectomeRunId: targetMsg.connectomeRunId } : {}),
      });

      // Step 3: Run Deterministic Target Engine
      await ctx.reportProgress(
        'COMPUTING_TARGET_SLATE',
        'Executing pure deterministic target engine algorithm with 3+2 ranking',
        60
      );

      const slate = runTargetEngine({
        phenotypeSnapshot: context.phenotypeSnapshot,
        connectome: context.connectome,
        mode: 'CLINICAL',
        caseId: targetMsg.caseId,
      });

      // Step 4: Serialize Database Publication Payload
      await ctx.reportProgress(
        'SERIALIZING_PERSISTENCE_PAYLOAD',
        'Serializing candidate coordinates, convergence metrics, and manifest hashes',
        80
      );

      const publishInput = serializeTargetSlateForDatabase(slate, {
        organisationId: targetMsg.organisationId,
        caseId: targetMsg.caseId,
        evidenceReleaseId: targetMsg.evidenceLibraryReleaseId,
      });

      // Step 5: Publish Slate to Database via RPC
      await ctx.reportProgress(
        'PUBLISHING_TO_DATABASE',
        'Persisting immutable Target Slate and candidate members to database',
        90
      );

      const publishResult = await this.dbClient.publishTargetSlate(publishInput);

      // Step 6: Register Generated Slate in Artifact Registry
      await ctx.reportProgress(
        'REGISTERING_ARTIFACTS',
        'Registering immutable scientific artifacts with SHA-256 integrity hash',
        95
      );

      const artifactPath = this.storageClient.buildStoragePath({
        organisationId: targetMsg.organisationId,
        caseId: targetMsg.caseId,
        artifactId: slate.id,
        filename: 'target_slate.json',
      });

      const registeredArtifact = await this.storageClient.registerArtifact({
        organisationId: targetMsg.organisationId,
        caseId: targetMsg.caseId,
        artifactType: 'TARGET_SLATE_PAYLOAD',
        bucket: 'clinical-derived',
        objectPath: artifactPath,
        content: publishInput.outputPayload,
        mimeType: 'application/json',
      });

      await ctx.reportProgress(
        'COMPLETED',
        'Target Slate successfully generated, published, and registered in artifact registry',
        100
      );

      return {
        success: true,
        resultReference: {
          slateId: publishResult.slateId,
          primaryCandidateCount: slate.primaryCandidates.length,
          additionalCandidateCount: slate.additionalCandidates.length,
          suppressedCandidateCount: slate.suppressedCandidates.length,
          manifestHash: slate.deterministicManifestHash,
          artifactId: registeredArtifact.id,
        },
        registeredArtifacts: [registeredArtifact],
        publishedSlateInput: publishInput,
      };
    } catch (err: any) {
      return {
        success: false,
        error: {
          code: err.code ?? 'TARGET_GENERATION_FAILED',
          message: err.message ?? 'Failed to generate target slate',
          detail: { stack: err.stack },
          retryable: false,
        },
      };
    }
  }
}
