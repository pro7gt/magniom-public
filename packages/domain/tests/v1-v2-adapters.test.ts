import { describe, it, expect } from 'vitest';
import type { TargetCandidate, TargetSlate, EvidenceClaim } from '../src/types.js';
import {
  adaptV1CandidateToV2,
  adaptV1SlateToV2,
  adaptV1MeasurementsToBundle,
  adaptV1EvidenceToV2,
  LEGACY_MDD_INDICATION_MODULE_ID,
} from '../src/adapters/v1-to-v2.js';

describe('Phase 1 — Non-Destructive v1-to-v2 Adapters Conformance (§19)', () => {
  const mockV1Candidate: TargetCandidate = {
    id: 'c1111111-1111-1111-1111-111111111111',
    caseId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    role: 'PRIMARY_1',
    familyId: 'TF-DLPFC-BA9-46',
    circuitId: 'TC-MDD-001',
    method: 'CONNECTOME_REFINED',
    mniCoordinate: { x: -38, y: 44, z: 26 },
    subjectCoordinate: { x: -36, y: 42, z: 25 },
    evidenceTier: 'T1',
    evidenceScore: 0.95,
    concordanceScore: 0.88,
    connectivityScore: 0.91,
    overallScore: 0.92,
    compositeRankScore: 0.93,
    isSuppressedOrRedundant: false,
    rationale: 'Primary connectome-refined DLPFC target',
    counterarguments: ['Mild scalp discomfort associated with anterior placement'],
  };

  const mockV1Slate: TargetSlate = {
    id: 's1111111-1111-1111-1111-111111111111',
    caseId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    mode: 'CLINICAL',
    phenotypeSnapshotId: 'p1111111-1111-1111-1111-111111111111',
    primaryCandidates: [mockV1Candidate],
    additionalCandidates: [],
    deterministicManifestHash: 'a'.repeat(64),
    generatedAt: '2026-09-02T12:00:00.000Z',
    status: 'ready_for_review',
  };

  it('1. should adapt historical v1 TargetCandidate into TargetCandidateV2 preserving all coordinates', () => {
    const v2Candidate = adaptV1CandidateToV2(mockV1Candidate, {
      caseId: mockV1Candidate.caseId,
      caseIndicationId: 'ci-mdd-001',
    });

    expect(v2Candidate.id).toBe(mockV1Candidate.id);
    expect(v2Candidate.indicationModuleReleaseId).toBe(LEGACY_MDD_INDICATION_MODULE_ID);
    expect(v2Candidate.candidateRole).toBe('connectome_refinement');
    expect(v2Candidate.targetGeometry.geometryType).toBe('point');

    if (v2Candidate.targetGeometry.geometryType === 'point') {
      expect(v2Candidate.targetGeometry.centre.x).toBe(mockV1Candidate.mniCoordinate.x);
      expect(v2Candidate.targetGeometry.centre.y).toBe(mockV1Candidate.mniCoordinate.y);
      expect(v2Candidate.targetGeometry.centre.z).toBe(mockV1Candidate.mniCoordinate.z);
      expect(v2Candidate.targetGeometry.laterality).toBe('left');
    }

    expect(v2Candidate.nominationRationale).toBe(mockV1Candidate.rationale);
    expect(v2Candidate.counterarguments).toEqual(mockV1Candidate.counterarguments);
    expect(v2Candidate.clinicalEvidence.highestEvidenceTier).toBe('A');
  });

  it('2. should adapt historical v1 TargetSlate into TargetSlateV2 preserving hash and candidates', () => {
    const v2Slate = adaptV1SlateToV2(mockV1Slate, {
      caseIndicationId: 'ci-mdd-001',
    });

    expect(v2Slate.id).toBe(mockV1Slate.id);
    expect(v2Slate.payloadSha256).toBe(mockV1Slate.deterministicManifestHash);
    expect(v2Slate.primaryCandidates).toHaveLength(1);
    expect(v2Slate.primaryCandidates[0]?.targetCandidateId).toBe(mockV1Candidate.id);
    expect(v2Slate.primaryCandidates[0]?.position).toBe('primary_1');
    expect(v2Slate.primaryCandidates[0]?.role).toBe('connectome_refinement');
    expect(v2Slate.status).toBe('ready_for_review');
  });

  it('3. should adapt historical imaging run into MeasurementBundle and MeasurementReliability', () => {
    const result = adaptV1MeasurementsToBundle({
      caseId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      caseIndicationId: 'ci-mdd-001',
      phenotypeSnapshotId: 'p1111111-1111-1111-1111-111111111111',
      imagingStudyId: 'study-mri-001',
      connectomicsRunId: 'conn-run-001',
    });

    expect(result.bundle.measurements).toHaveLength(2);
    expect(result.bundle.qualificationStatus).toBe('qualified');
    expect(result.reliabilities).toHaveLength(1);
    expect(result.reliabilities[0]?.modality).toBe('resting_state_fmri');
    expect(result.reliabilities[0]?.reliabilityClass).toBe('high');
  });

  it('4. should project historical EvidenceClaim with EvidenceGovernanceClassification', () => {
    const v1Claim: EvidenceClaim = {
      id: 'ec-mdd-sgacc-001',
      statement: 'Left sgACC functional connectivity correlates with clinical response in MDD',
      tier: 'T1',
      targetFamilyId: 'TF-DLPFC-BA9-46',
      circuitId: 'TC-MDD-001',
      citation: 'Fox et al., Biol Psychiatry 2012',
      status: 'active',
      confidenceScore: 0.96,
      direction: 'supports',
      polarity: 'positive',
    };

    const result = adaptV1EvidenceToV2(v1Claim);
    expect(result.claim.id).toBe('ec-mdd-sgacc-001');
    expect(result.classification.evidenceClaimId).toBe('ec-mdd-sgacc-001');
    expect(result.classification.classificationStatus).toBe('assigned');
    expect(result.classification.magniomEvidenceTier).toBe('A');
    expect(result.classification.permittedRoles?.standalonePrimary).toBe(true);
  });
});
