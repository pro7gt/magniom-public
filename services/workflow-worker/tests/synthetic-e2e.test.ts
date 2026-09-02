/**
 * @magniom/workflow-worker
 * SPRINT 7 EXIT CRITERIA END-TO-END INTEGRATION TEST
 * "synthetic background job can generate and publish Target Slate securely."
 * Conforms to MAGNIOM-Implementation & Validation Roadmap v1.0 Section 111,
 * MAGNIOM-Synthetic Vertical Slice Implementation Specification v1.0 Section 76,
 * and MAGNIOM-Supabase Database & Security Specification v1.0 Sections 87–96, 128–129.
 */

import { describe, it, expect } from 'vitest';
import { WorkflowWorker, TargetGenerationJobHandler } from '../src/index.js';
import type { WorkflowDatabaseClient, TargetEngineContextLoader } from '../src/index.js';
import {
  GOLDEN_CASE_01_PHENOTYPE,
  G02_PHENOTYPE,
  G02_CONNECTOME,
  G03_PHENOTYPE,
  G03_CONNECTOME,
  G04_PHENOTYPE,
  G04_CONNECTOME,
  G05_PHENOTYPE,
  G05_CONNECTOME,
} from '@magniom/test-fixtures';
import type {
  WorkflowJob,
  JobProgress,
  QueueEnvelope,
  ArtifactRecord,
  OutboxEvent,
  ClinicalCase,
  PhenotypeSnapshot,
  PublishTargetSlateInput,
  ConnectomeRefinementMap,
} from '@magniom/domain';
import { computeSignedDecisionManifest } from '@magniom/target-engine';
import { computeSha256 } from '@magniom/scientific-policy';

class MockWorkflowDatabaseClient implements WorkflowDatabaseClient {
  cases: Map<string, ClinicalCase> = new Map();
  jobs: Map<string, WorkflowJob> = new Map();
  progress: JobProgress[] = [];
  artifacts: ArtifactRecord[] = [];
  publishedSlates: Map<string, PublishTargetSlateInput> = new Map();
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

    // Update case state to target_slate_ready
    if (job.caseId && this.cases.has(job.caseId)) {
      const c = this.cases.get(job.caseId)!;
      this.cases.set(job.caseId, {
        ...c,
        currentTargetSlateId: resultReference.slateId as string,
        state: 'target_slate_ready',
        version: c.version + 1,
        updatedAt: new Date().toISOString(),
      });
    }

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

  async publishTargetSlate(input: PublishTargetSlateInput): Promise<{ slateId: string }> {
    const slateId =
      (input.outputPayload as any).id ?? `slate-${Math.random().toString(36).substring(2, 9)}`;
    this.publishedSlates.set(slateId, input);
    return { slateId };
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

class FixtureContextLoader implements TargetEngineContextLoader {
  private readonly snapshots: Map<string, PhenotypeSnapshot> = new Map();
  private readonly connectomes: Map<string, ConnectomeRefinementMap | null> = new Map();

  registerCase(snapshot: PhenotypeSnapshot, connectome: ConnectomeRefinementMap | null) {
    this.snapshots.set(snapshot.id, snapshot);
    if (connectome) {
      this.connectomes.set(snapshot.id, connectome);
    }
  }

  async loadContext(params: {
    organisationId: string;
    caseId: string;
    phenotypeSnapshotId: string;
    connectomeRunId?: string;
  }): Promise<{
    phenotypeSnapshot: PhenotypeSnapshot;
    connectome: ConnectomeRefinementMap | null;
  }> {
    const snapshot = this.snapshots.get(params.phenotypeSnapshotId);
    if (!snapshot) {
      throw new Error(`PHENOTYPE_SNAPSHOT_NOT_FOUND: ${params.phenotypeSnapshotId}`);
    }
    const connectome = this.connectomes.get(params.phenotypeSnapshotId) ?? null;
    return { phenotypeSnapshot: snapshot, connectome };
  }
}

describe('Sprint 7 Exit Criteria: Synthetic Background Worker Target Slate Generation', () => {
  const orgId = 'a0000000-0000-0000-0000-000000000001';
  const clinicianId = 'c0000000-0000-0000-0000-000000000001';

  it('G02: executes complete asynchronous workflow from outbox trigger to published slate and artifact registration', async () => {
    const dbClient = new MockWorkflowDatabaseClient();
    const contextLoader = new FixtureContextLoader();
    contextLoader.registerCase(G02_PHENOTYPE, G02_CONNECTOME);

    const worker = new WorkflowWorker(dbClient, {
      workerId: 'worker-node-g02',
      pollIntervalMs: 100,
    });

    const handler = new TargetGenerationJobHandler(dbClient, contextLoader);
    worker.registerHandler(handler);

    // Step 1: Create Case in phenotype_approved state
    const caseId = 'e0000000-0000-0000-0000-000000000002';
    const initialCase: ClinicalCase = {
      id: caseId,
      organisationId: orgId,
      patientId: 'd0000000-0000-0000-0000-000000000002',
      caseCode: 'CASE-G02-ASYNC',
      state: 'phenotype_approved',
      indicationCode: 'MDD',
      mode: 'CLINICAL',
      version: 2,
      currentPhenotypeSnapshotId: G02_PHENOTYPE.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dbClient.cases.set(caseId, initialCase);

    // Step 2: Enqueue Job & Emit Transactional Outbox Event
    const jobId = '77777777-7777-7777-7777-777777777772';
    const idempotencyKey = computeSha256({
      caseId,
      snapshotId: G02_PHENOTYPE.id,
      engineVersion: '1.0.0',
    });

    dbClient.jobs.set(jobId, {
      id: jobId,
      organisationId: orgId,
      caseId,
      jobType: 'target_generation',
      status: 'queued',
      idempotencyKey,
      inputReference: {
        phenotypeSnapshotId: G02_PHENOTYPE.id,
        targetEngineVersionId: '1.0.0',
        evidenceLibraryReleaseId: 'e0000000-0000-0000-0000-000000000001',
      },
      attemptCount: 0,
      maxAttempts: 3,
      createdAt: new Date().toISOString(),
    });

    dbClient.outbox.push({
      id: 'outbox-g02-001',
      organisationId: orgId,
      aggregateType: 'case',
      aggregateId: caseId,
      eventType: 'TARGET_GENERATION_REQUESTED',
      payload: {
        jobId,
        caseId,
        phenotypeSnapshotId: G02_PHENOTYPE.id,
        targetEngineVersionId: '1.0.0',
        evidenceLibraryReleaseId: 'e0000000-0000-0000-0000-000000000001',
        correlationId: 'corr-g02-001',
      },
      createdAt: new Date().toISOString(),
      attempts: 0,
    });

    // Step 3: Run Worker (Outbox Dispatch + Queue Consumption)
    const runResult = await worker.runOnce(['target_generation']);
    expect(runResult.dispatchedEvents).toBe(1);
    expect(runResult.processedJobs).toBe(1);

    // Step 4: Verify Outbox Event Marked Published
    const outboxEvent = dbClient.outbox.find(e => e.id === 'outbox-g02-001');
    expect(outboxEvent?.publishedAt).toBeDefined();

    // Step 5: Verify Job Succeeded
    const completedJob = dbClient.jobs.get(jobId);
    expect(completedJob?.status).toBe('succeeded');
    expect(completedJob?.workerId).toBe('worker-node-g02');
    expect(completedJob?.completedAt).toBeDefined();

    // Step 6: Verify Honest Progress Milestones
    const jobProgress = dbClient.progress.filter(p => p.jobId === jobId);
    expect(jobProgress.length).toBeGreaterThanOrEqual(6);
    const stages = jobProgress.map(p => p.stage);
    expect(stages).toContain('VALIDATING_JOB_INPUTS');
    expect(stages).toContain('LOADING_CLINICAL_CONTEXT');
    expect(stages).toContain('COMPUTING_TARGET_SLATE');
    expect(stages).toContain('SERIALIZING_PERSISTENCE_PAYLOAD');
    expect(stages).toContain('PUBLISHING_TO_DATABASE');
    expect(stages).toContain('REGISTERING_ARTIFACTS');
    expect(stages).toContain('COMPLETED');

    // Step 7: Verify Database Slate Publication & Invariants
    expect(dbClient.publishedSlates.size).toBe(1);
    const publishedSlate = Array.from(dbClient.publishedSlates.values())[0];
    expect(publishedSlate.caseId).toBe(caseId);
    expect(publishedSlate.phenotypeSnapshotId).toBe(G02_PHENOTYPE.id);
    expect(publishedSlate.candidates.length).toBeGreaterThan(0);

    // G02 Primary candidate must be CONNECTOME_REFINED
    const primaryCandidate = publishedSlate.candidates.find(
      (c: any) => c.candidateRole === 'PRIMARY_1',
    );
    expect(primaryCandidate).toBeDefined();
    expect(primaryCandidate.targetMethod).toBe('CONNECTOME_REFINED');
    expect(primaryCandidate.evidenceTier).toBe('T1');

    // Step 8: Verify Artifact Registry Registration
    expect(dbClient.artifacts.length).toBe(1);
    const artifact = dbClient.artifacts[0];
    expect(artifact.caseId).toBe(caseId);
    expect(artifact.artifactType).toBe('TARGET_SLATE_PAYLOAD');
    expect(artifact.bucket).toBe('clinical-derived');
    expect(artifact.immutable).toBe(true);
    expect(artifact.sha256).toBeDefined();
    expect(artifact.sha256.length).toBe(64);

    // Step 9: Verify Case State Transitioned to target_slate_ready
    const updatedCase = dbClient.cases.get(caseId);
    expect(updatedCase?.state).toBe('target_slate_ready');
    expect(updatedCase?.currentTargetSlateId).toBeDefined();
    expect(updatedCase?.version).toBe(3);

    // Step 10: Verify Queue Message Archived
    expect(dbClient.archivedMessages.has(`target_generation:${jobId}`)).toBe(true);

    // Step 11: Verify Clinician Can Proceed to Sign Off
    const finalTargets = [
      {
        sequenceOrder: 1,
        source: 'magniom_candidate' as const,
        sourceCandidateId: primaryCandidate.candidateCode,
        targetRegion: primaryCandidate.mniCoordinate,
        therapeuticObjectives: ['dysphoria_relief'],
      },
    ];

    const decisionManifest = computeSignedDecisionManifest(
      {
        id: 'dec-g02-async-001',
        caseId,
        slateId: updatedCase!.currentTargetSlateId!,
        clinicianId,
        decisionType: 'ACCEPTED_PRIMARY',
        selectedCandidateIds: [primaryCandidate.candidateCode],
        overallReasoning: 'Background generated slate approved after specialist review.',
        magniomInfluence: 'major',
        candidateDecisions: [],
        finalTargets,
        reviewedCounterfactuals: true,
        reviewedConflictingEvidence: true,
        decidedAt: new Date().toISOString(),
        attestation: {
          clinicianId,
          clinicianName: 'Dr. Jane Smith',
          licenseNumber: 'MED-001',
          statement: 'I approve this connectome-refined target.',
          signedAt: new Date().toISOString(),
          digitalSignatureHash: '',
        },
        digitalSignatureHash: '',
        isImmutable: true,
      },
      finalTargets,
      { fullName: 'Dr. Jane Smith', registrationIdentifier: 'MED-001' },
    );

    expect(decisionManifest.digitalSignatureHash).toBeDefined();
    expect(decisionManifest.digitalSignatureHash.length).toBe(64);
  });

  it('G01, G03, G04, G05: successfully executes across all golden case profiles asynchronously', async () => {
    const dbClient = new MockWorkflowDatabaseClient();
    const contextLoader = new FixtureContextLoader();
    contextLoader.registerCase(GOLDEN_CASE_01_PHENOTYPE, null);
    contextLoader.registerCase(G03_PHENOTYPE, G03_CONNECTOME);
    contextLoader.registerCase(G04_PHENOTYPE, G04_CONNECTOME);
    contextLoader.registerCase(G05_PHENOTYPE, G05_CONNECTOME);

    const worker = new WorkflowWorker(dbClient, { workerId: 'worker-batch' });
    worker.registerHandler(new TargetGenerationJobHandler(dbClient, contextLoader));

    const testCases = [
      {
        caseId: 'case-g01',
        snapshot: GOLDEN_CASE_01_PHENOTYPE,
        expectedPrimaryMethod: 'EVIDENCE_ONLY_PRIOR',
      },
      { caseId: 'case-g03', snapshot: G03_PHENOTYPE, expectedPrimaryMethod: 'EVIDENCE_ONLY_PRIOR' }, // Connectome suppressed (low incremental value)
      { caseId: 'case-g04', snapshot: G04_PHENOTYPE, expectedPrimaryMethod: 'EVIDENCE_ONLY_PRIOR' }, // Connectome suppressed (low reliability)
      { caseId: 'case-g05', snapshot: G05_PHENOTYPE, expectedPrimaryMethod: 'CONNECTOME_REFINED' }, // Anxiosomatic Primary 2 present
    ];

    for (const tc of testCases) {
      const jobId = `job-${tc.caseId}`;
      dbClient.cases.set(tc.caseId, {
        id: tc.caseId,
        organisationId: orgId,
        patientId: `pat-${tc.caseId}`,
        caseCode: `CASE-${tc.caseId.toUpperCase()}`,
        state: 'phenotype_approved',
        indicationCode: 'MDD',
        mode: 'CLINICAL',
        version: 1,
        currentPhenotypeSnapshotId: tc.snapshot.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      dbClient.jobs.set(jobId, {
        id: jobId,
        organisationId: orgId,
        caseId: tc.caseId,
        jobType: 'target_generation',
        status: 'queued',
        idempotencyKey: `idem-${tc.caseId}`,
        inputReference: { phenotypeSnapshotId: tc.snapshot.id },
        attemptCount: 0,
        maxAttempts: 3,
        createdAt: new Date().toISOString(),
      });

      dbClient.outbox.push({
        id: `outbox-${tc.caseId}`,
        organisationId: orgId,
        aggregateType: 'case',
        aggregateId: tc.caseId,
        eventType: 'TARGET_GENERATION_REQUESTED',
        payload: {
          jobId,
          caseId: tc.caseId,
          phenotypeSnapshotId: tc.snapshot.id,
          targetEngineVersionId: '1.0.0',
          evidenceLibraryReleaseId: 'e0000000-0000-0000-0000-000000000001',
          correlationId: `corr-${tc.caseId}`,
        },
        createdAt: new Date().toISOString(),
        attempts: 0,
      });

      const res = await worker.runOnce(['target_generation']);
      expect(res.dispatchedEvents).toBe(1);
      expect(res.processedJobs).toBe(1);

      const job = dbClient.jobs.get(jobId);
      expect(job?.status).toBe('succeeded');

      const updatedCase = dbClient.cases.get(tc.caseId);
      expect(updatedCase?.state).toBe('target_slate_ready');
    }

    // Verify 4 artifacts were registered (1 for each golden case)
    expect(dbClient.artifacts.length).toBe(4);
    for (const art of dbClient.artifacts) {
      expect(art.immutable).toBe(true);
      expect(art.sha256.length).toBe(64);
    }
  });
});
