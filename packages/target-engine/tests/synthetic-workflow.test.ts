/**
 * @magniom/target-engine
 * Sprint 5 Synthetic End-to-End Workflow & Magniom Engineering Prototype Test
 * Conforms to MAGNIOM-Implementation & Validation Roadmap v1.0 Section 109,
 * MAGNIOM-Synthetic Vertical Slice Implementation Specification v1.0 Sections 18–25,
 * and MAGNIOM-Supabase Database & Security Specification v1.0 Sections 50–86.
 */

import { describe, it, expect } from 'vitest';
import {
  runTargetEngine,
  serializeTargetSlateForDatabase,
  computeSignedDecisionManifest,
  evaluateStaleStatus,
} from '../src/index.js';
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
  ClinicalCase,
  PhenotypeSnapshot,
  TargetSlate,
  ClinicianDecision,
  FinalTarget,
  CandidateDecision,
  AuditEvent,
} from '@magniom/domain';
import { computeSha256 } from '@magniom/scientific-policy';
import {
  validatePublishTargetSlateInput,
  validateSignClinicianDecisionInput,
  validateAuditEvent,
} from '@magniom/schemas';

describe('Sprint 5 — Targeting + Decisions (Magniom Engineering Prototype)', () => {
  const orgId = 'a0000000-0000-0000-0000-000000000001';
  const clinicianId = 'c0000000-0000-0000-0000-000000000001';
  const userId = 'u0000000-0000-0000-0000-000000000001';

  // In-memory simulated audit ledger verifying aggregate hash-chaining
  class MockAuditLedger {
    private events: AuditEvent[] = [];
    private heads: Map<string, { lastSequence: number; lastHash: string }> = new Map();

    appendDomainEvent(params: {
      organisationId: string;
      caseId: string;
      actorType: string;
      actorClinicianId?: string;
      eventType: string;
      aggregateType: string;
      aggregateId: string;
      payload: Record<string, unknown>;
    }): AuditEvent {
      const key = `${params.aggregateType}:${params.aggregateId}`;
      const head = this.heads.get(key) ?? { lastSequence: 0, lastHash: '' };
      const nextSequence = head.lastSequence + 1;
      const previousHash = head.lastHash;

      const eventHash = computeSha256({
        previousHash,
        aggregateType: params.aggregateType,
        aggregateId: params.aggregateId,
        sequence: nextSequence,
        eventType: params.eventType,
        payload: params.payload,
      });

      const event: AuditEvent = {
        id: `audit-${nextSequence}-${params.eventType}`,
        organisationId: params.organisationId,
        caseId: params.caseId,
        actorType: params.actorType,
        actorClinicianId: params.actorClinicianId,
        eventType: params.eventType,
        aggregateType: params.aggregateType,
        aggregateId: params.aggregateId,
        aggregateSequence: nextSequence,
        occurredAt: new Date().toISOString(),
        payload: params.payload,
        previousHash: previousHash || undefined,
        eventHash,
      };

      this.events.push(event);
      this.heads.set(key, { lastSequence: nextSequence, lastHash: eventHash });
      return event;
    }

    getEventsForAggregate(aggregateType: string, aggregateId: string): readonly AuditEvent[] {
      return this.events.filter(
        (e) => e.aggregateType === aggregateType && e.aggregateId === aggregateId
      );
    }
  }

  describe('1. Full Synthetic Lifecycle: Golden Case G02 (High-Convergence Personalisation)', () => {
    it('executes end-to-end prototype workflow from case creation to immutable sign-off with audit trail', () => {
      const auditLedger = new MockAuditLedger();

      // Step A: Case Creation
      let clinicalCase: ClinicalCase = {
        id: 'e0000000-0000-0000-0000-000000000002',
        organisationId: orgId,
        patientId: 'd0000000-0000-0000-0000-000000000002',
        caseCode: 'CASE-G02',
        state: 'draft',
        indicationCode: 'MDD',
        mode: 'CLINICAL',
        version: 1,
        createdAt: '2026-09-02T10:00:00.000Z',
        updatedAt: '2026-09-02T10:00:00.000Z',
      };
      expect(clinicalCase.state).toBe('draft');

      // Step B: Phenotype Snapshot Formulation & Approval
      const snapshot: PhenotypeSnapshot = {
        ...G02_PHENOTYPE,
        confirmedByClinicianId: clinicianId,
      };

      clinicalCase = {
        ...clinicalCase,
        currentPhenotypeSnapshotId: snapshot.id,
        state: 'phenotype_approved',
        version: clinicalCase.version + 1,
        updatedAt: '2026-09-02T10:05:00.000Z',
      };

      auditLedger.appendDomainEvent({
        organisationId: orgId,
        caseId: clinicalCase.id,
        actorType: 'clinician',
        actorClinicianId: clinicianId,
        eventType: 'PHENOTYPE_APPROVED',
        aggregateType: 'case',
        aggregateId: clinicalCase.id,
        payload: { snapshotId: snapshot.id, schemaVersion: '1.0.0' },
      });

      expect(clinicalCase.state).toBe('phenotype_approved');
      expect(clinicalCase.version).toBe(2);

      // Step C: Run Pure Deterministic Target Engine
      const targetSlate: TargetSlate = runTargetEngine({
        phenotypeSnapshot: snapshot,
        connectome: G02_CONNECTOME,
        mode: 'CLINICAL',
        caseId: clinicalCase.id,
      });

      expect(targetSlate.primaryCandidates).toHaveLength(1);
      const primaryCandidate = targetSlate.primaryCandidates[0];
      expect(primaryCandidate.role).toBe('PRIMARY_1');
      expect(primaryCandidate.method).toBe('CONNECTOME_REFINED');
      expect(primaryCandidate.evidenceTier).toBe('T1');
      expect(primaryCandidate.counterarguments).toBeDefined();
      expect(primaryCandidate.counterarguments!.length).toBeGreaterThan(0);

      // Step D: Database Slate Publication
      const publishInput = serializeTargetSlateForDatabase(targetSlate, {
        organisationId: orgId,
        caseId: clinicalCase.id,
      });
      const validatedPublish = validatePublishTargetSlateInput(publishInput);
      expect(validatedPublish.caseId).toBe(clinicalCase.id);
      expect(validatedPublish.candidates.length).toBeGreaterThan(0);

      clinicalCase = {
        ...clinicalCase,
        currentTargetSlateId: targetSlate.id,
        state: 'target_slate_ready',
        version: clinicalCase.version + 1,
        updatedAt: '2026-09-02T10:10:00.000Z',
      };

      auditLedger.appendDomainEvent({
        organisationId: orgId,
        caseId: clinicalCase.id,
        actorType: 'user',
        eventType: 'TARGET_SLATE_GENERATED',
        aggregateType: 'case',
        aggregateId: clinicalCase.id,
        payload: {
          slateId: targetSlate.id,
          manifestHash: targetSlate.deterministicManifestHash,
        },
      });

      expect(clinicalCase.state).toBe('target_slate_ready');
      expect(clinicalCase.version).toBe(3);

      // Step E: Begin Clinician Review
      const stalenessCheck = evaluateStaleStatus({
        caseRecord: clinicalCase,
        slateRecord: {
          id: targetSlate.id,
          phenotypeSnapshotId: targetSlate.phenotypeSnapshotId,
          status: 'ready_for_review',
        },
      });
      expect(stalenessCheck.isStale).toBe(false);
      expect(stalenessCheck.reason).toBe('CURRENT');

      const decisionId = 'dec-g02-001';
      clinicalCase = {
        ...clinicalCase,
        state: 'clinician_review',
        version: clinicalCase.version + 1,
        updatedAt: '2026-09-02T10:15:00.000Z',
      };

      auditLedger.appendDomainEvent({
        organisationId: orgId,
        caseId: clinicalCase.id,
        actorType: 'clinician',
        actorClinicianId: clinicianId,
        eventType: 'CLINICIAN_REVIEW_STARTED',
        aggregateType: 'case',
        aggregateId: clinicalCase.id,
        payload: { decisionId, slateId: targetSlate.id },
      });

      expect(clinicalCase.state).toBe('clinician_review');

      // Step F: Save Itemized Candidate Decision
      const candidateReview: CandidateDecision = {
        targetCandidateId: primaryCandidate.id,
        action: 'accept',
        reasonCodes: ['strong_clinical_fit', 'connectome_support', 'evidence_strength'],
        freeTextReason: 'Connectome refinement is highly reliable and converges with DLPFC anchor.',
        evidenceReviewed: true,
        reliabilityReviewed: true,
        counterargumentsReviewed: true,
      };

      auditLedger.appendDomainEvent({
        organisationId: orgId,
        caseId: clinicalCase.id,
        actorType: 'clinician',
        actorClinicianId: clinicianId,
        eventType: 'CANDIDATE_REVIEWED',
        aggregateType: 'clinician_decision',
        aggregateId: decisionId,
        payload: {
          candidateId: primaryCandidate.id,
          action: 'accept',
          counterargumentsReviewed: true,
        },
      });

      // Step G: Immutable Decision Sign-Off & Cryptographic Sealing
      const finalTargets: FinalTarget[] = [
        {
          sequenceOrder: 1,
          source: 'magniom_candidate',
          sourceCandidateId: primaryCandidate.id,
          targetRegion: primaryCandidate.mniCoordinate as unknown as Record<string, unknown>,
          therapeuticObjectives: ['dysphoria_alleviation', 'sgacc_antisync_engagement'],
        },
      ];

      const draftDecision: ClinicianDecision = {
        id: decisionId,
        caseId: clinicalCase.id,
        slateId: targetSlate.id,
        clinicianId,
        decisionType: 'ACCEPTED_PRIMARY',
        selectedCandidateIds: [primaryCandidate.id],
        overallReasoning:
          'Independent specialist evaluation approves the personalized connectome-refined left-DLPFC target coordinate for clinical treatment.',
        magniomInfluence: 'major',
        candidateDecisions: [candidateReview],
        finalTargets,
        reviewedCounterfactuals: true,
        reviewedConflictingEvidence: true,
        decidedAt: '2026-09-02T10:20:00.000Z',
        attestation: {
          clinicianId,
          clinicianName: 'Dr. Jane Smith, FRANZCP',
          licenseNumber: 'MED0001234567',
          statement:
            'I have independently reviewed the clinical context, evidence provenance, target reliability, alternatives and limitations. The final target selection represents my clinical decision.',
          signedAt: '2026-09-02T10:20:00.000Z',
          digitalSignatureHash: '',
        },
        digitalSignatureHash: '',
        isImmutable: true,
      };

      const { canonicalPayload, digitalSignatureHash } = computeSignedDecisionManifest(
        draftDecision,
        finalTargets,
        {
          fullName: 'Dr. Jane Smith, FRANZCP',
          registrationIdentifier: 'MED0001234567',
        }
      );

      const signInput = {
        decisionId,
        overallReasoning: draftDecision.overallReasoning!,
        magniomInfluence: draftDecision.magniomInfluence!,
        reviewedCounterfactuals: true,
        reviewedConflictingEvidence: true,
        attestationStatement: draftDecision.attestation!.statement,
        finalTargets,
        decisionType: 'ACCEPTED_PRIMARY' as const,
      };
      const validatedSign = validateSignClinicianDecisionInput(signInput);
      expect(validatedSign.decisionId).toBe(decisionId);

      const signedDecision: ClinicianDecision = {
        ...draftDecision,
        status: 'completed',
        attestation: {
          ...draftDecision.attestation!,
          digitalSignatureHash,
        },
        digitalSignatureHash,
      };

      clinicalCase = {
        ...clinicalCase,
        state: 'decision_signed',
        version: clinicalCase.version + 1,
        updatedAt: '2026-09-02T10:20:00.000Z',
      };

      const signAuditEvent = auditLedger.appendDomainEvent({
        organisationId: orgId,
        caseId: clinicalCase.id,
        actorType: 'clinician',
        actorClinicianId: clinicianId,
        eventType: 'TARGET_DECISION_SIGNED',
        aggregateType: 'case',
        aggregateId: clinicalCase.id,
        payload: {
          decisionId,
          slateId: targetSlate.id,
          signatureHash: digitalSignatureHash,
          canonicalPayload,
        },
      });

      expect(validateAuditEvent(signAuditEvent).eventType).toBe('TARGET_DECISION_SIGNED');
      expect(clinicalCase.state).toBe('decision_signed');
      expect(clinicalCase.version).toBe(5);

      // Step H: Verify Audit Trail Hash Chain Integrity
      const caseEvents = auditLedger.getEventsForAggregate('case', clinicalCase.id);
      expect(caseEvents).toHaveLength(4);
      expect(caseEvents[0].eventType).toBe('PHENOTYPE_APPROVED');
      expect(caseEvents[1].eventType).toBe('TARGET_SLATE_GENERATED');
      expect(caseEvents[2].eventType).toBe('CLINICIAN_REVIEW_STARTED');
      expect(caseEvents[3].eventType).toBe('TARGET_DECISION_SIGNED');

      // Validate sequence numbers & cryptographic hash chaining
      expect(caseEvents[0].aggregateSequence).toBe(1);
      expect(caseEvents[1].aggregateSequence).toBe(2);
      expect(caseEvents[1].previousHash).toBe(caseEvents[0].eventHash);
      expect(caseEvents[2].aggregateSequence).toBe(3);
      expect(caseEvents[2].previousHash).toBe(caseEvents[1].eventHash);
      expect(caseEvents[3].aggregateSequence).toBe(4);
      expect(caseEvents[3].previousHash).toBe(caseEvents[2].eventHash);
    });
  });

  describe('2. Multi-Dimensional Stale Protection Invariants', () => {
    it('detects and rejects signing when phenotype snapshot has drifted (STALE_PHENOTYPE_SNAPSHOT)', () => {
      const clinicalCase: ClinicalCase = {
        id: 'case-stale-01',
        organisationId: orgId,
        patientId: 'pat-stale-01',
        caseCode: 'CASE-STALE-01',
        state: 'clinician_review',
        indicationCode: 'MDD',
        mode: 'CLINICAL',
        version: 3,
        currentPhenotypeSnapshotId: 'snap-new-v2', // Updated snapshot!
        currentTargetSlateId: 'slate-old-v1',
        createdAt: '2026-09-02T10:00:00Z',
        updatedAt: '2026-09-02T10:00:00Z',
      };

      const slate = {
        id: 'slate-old-v1',
        phenotypeSnapshotId: 'snap-old-v1', // Generated against old snapshot
        status: 'ready_for_review',
      };

      const result = evaluateStaleStatus({
        caseRecord: clinicalCase,
        slateRecord: slate,
      });

      expect(result.isStale).toBe(true);
      expect(result.reason).toBe('STALE_PHENOTYPE_SNAPSHOT');
    });

    it('detects and rejects signing when a newer slate has been published (TARGET_SLATE_SUPERSEDED)', () => {
      const clinicalCase: ClinicalCase = {
        id: 'case-superseded-01',
        organisationId: orgId,
        patientId: 'pat-01',
        caseCode: 'CASE-01',
        state: 'target_slate_ready',
        indicationCode: 'MDD',
        mode: 'CLINICAL',
        version: 4,
        currentPhenotypeSnapshotId: 'snap-v1',
        currentTargetSlateId: 'slate-new-v2', // Newer slate active
        createdAt: '2026-09-02T10:00:00Z',
        updatedAt: '2026-09-02T10:00:00Z',
      };

      const oldSlate = {
        id: 'slate-old-v1',
        phenotypeSnapshotId: 'snap-v1',
        status: 'superseded',
      };

      const result = evaluateStaleStatus({
        caseRecord: clinicalCase,
        slateRecord: oldSlate,
      });

      expect(result.isStale).toBe(true);
      expect(result.reason).toBe('TARGET_SLATE_SUPERSEDED');
    });

    it('detects optimistic concurrency conflict on case version (STALE_CASE_VERSION)', () => {
      const clinicalCase: ClinicalCase = {
        id: 'case-ver-01',
        organisationId: orgId,
        patientId: 'pat-01',
        caseCode: 'CASE-01',
        state: 'clinician_review',
        indicationCode: 'MDD',
        mode: 'CLINICAL',
        version: 5, // Already modified by another transaction
        currentPhenotypeSnapshotId: 'snap-v1',
        currentTargetSlateId: 'slate-v1',
        createdAt: '2026-09-02T10:00:00Z',
        updatedAt: '2026-09-02T10:00:00Z',
      };

      const slate = {
        id: 'slate-v1',
        phenotypeSnapshotId: 'snap-v1',
        status: 'ready_for_review',
      };

      const result = evaluateStaleStatus({
        caseRecord: clinicalCase,
        slateRecord: slate,
        expectedCaseVersion: 4, // Client sent stale version 4
      });

      expect(result.isStale).toBe(true);
      expect(result.reason).toBe('STALE_CASE_VERSION');
    });
  });

  describe('3. Golden Cases Target Persistence & Slate Verification across G01–G05', () => {
    it('G01: Evidence-Only MDD produces serializable single-primary slate with no connectome', () => {
      const slate = runTargetEngine({
        phenotypeSnapshot: GOLDEN_CASE_01_PHENOTYPE,
        connectome: null,
        mode: 'CLINICAL',
      });

      const dbPayload = serializeTargetSlateForDatabase(slate, {
        organisationId: orgId,
        caseId: 'case-g01',
      });

      expect(dbPayload.candidates).toHaveLength(1);
      expect(dbPayload.candidates[0].candidateRole).toBe('PRIMARY_1');
      expect(dbPayload.candidates[0].targetMethod).toBe('EVIDENCE_ONLY_PRIOR');
      expect(dbPayload.candidates[0].evidenceTier).toBe('T1');
      expect(dbPayload.candidates[0].counterarguments).toBeDefined();
    });

    it('G03: Low Incremental Gain correctly serializes suppressed connectome candidate into suppressed list', () => {
      const slate = runTargetEngine({
        phenotypeSnapshot: G03_PHENOTYPE,
        connectome: G03_CONNECTOME,
        mode: 'CLINICAL',
      });

      expect(slate.primaryCandidates).toHaveLength(1);
      expect(slate.suppressedCandidates).toHaveLength(1);
      expect(slate.suppressedCandidates[0].suppressionReason).toBe('LOW_INCREMENTAL_VALUE');

      const dbPayload = serializeTargetSlateForDatabase(slate, {
        organisationId: orgId,
        caseId: 'case-g03',
      });

      expect(dbPayload.candidates).toHaveLength(2);
      const suppressed = dbPayload.candidates.find((c) => c.isSuppressedOrRedundant === true);
      expect(suppressed).toBeDefined();
      expect(suppressed?.suppressionReason).toBe('LOW_INCREMENTAL_VALUE');
    });

    it('G04: Unreliable Connectome correctly suppresses low-reliability candidate (< 0.70)', () => {
      const slate = runTargetEngine({
        phenotypeSnapshot: G04_PHENOTYPE,
        connectome: G04_CONNECTOME,
        mode: 'CLINICAL',
      });

      expect(slate.primaryCandidates).toHaveLength(1);
      expect(slate.suppressedCandidates).toHaveLength(1);
      expect(slate.suppressedCandidates[0].suppressionReason).toBe('LOW_RELIABILITY');

      const dbPayload = serializeTargetSlateForDatabase(slate, {
        organisationId: orgId,
        caseId: 'case-g04',
      });

      const suppressed = dbPayload.candidates.find((c) => c.isSuppressedOrRedundant === true);
      expect(suppressed?.suppressionReason).toBe('LOW_RELIABILITY');
    });

    it('G05: Anxiosomatic Dual-Circuit populates Primary 1 and Primary 2 candidates with distinct clinical roles', () => {
      const slate = runTargetEngine({
        phenotypeSnapshot: G05_PHENOTYPE,
        connectome: G05_CONNECTOME,
        mode: 'CLINICAL',
      });

      expect(slate.primaryCandidates).toHaveLength(2);
      expect(slate.primaryCandidates[0].role).toBe('PRIMARY_1');
      expect(slate.primaryCandidates[1].role).toBe('PRIMARY_2');
      expect(slate.primaryCandidates[1].familyId).toBe('TF-MDD-ANXIOSOMATIC-DMPFC-001');

      const dbPayload = serializeTargetSlateForDatabase(slate, {
        organisationId: orgId,
        caseId: 'case-g05',
      });

      expect(dbPayload.candidates).toHaveLength(4);
      expect(dbPayload.candidates[0].candidateRole).toBe('PRIMARY_1');
      expect(dbPayload.candidates[1].candidateRole).toBe('PRIMARY_2');
      expect(dbPayload.candidates[2].candidateRole).toBe('ADDITIONAL_A');
    });
  });
});
