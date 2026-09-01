import { describe, it, expect } from 'vitest';
import type { TargetSlate, TargetCandidate, MniCoordinate } from './types.js';

describe('Canonical Domain Types', () => {
  it('should instantiate a valid TargetSlate data structure according to 3+2 rule', () => {
    const mockCoord: MniCoordinate = {
      space: 'MNI152NLin2009cAsym',
      x: -44,
      y: 38,
      z: 32,
    };

    const mockPrimary: TargetCandidate = {
      id: 'cand-001',
      familyId: 'fam-ba46-l',
      circuitId: 'circ-sgacc-antisync',
      role: 'PRIMARY_1',
      method: 'EVIDENCE_ONLY_PRIOR',
      evidenceTier: 'T1',
      mniCoordinate: mockCoord,
      evidenceScore: 0.95,
      phenotypeConcordanceScore: 0.9,
      overallScore: 0.93,
      rationale: 'Primary evidence-anchored left DLPFC target for major depression',
      contraindicationsOrConflicts: [],
      isSuppressedOrRedundant: false,
    };

    const slate: TargetSlate = {
      id: 'slate-001',
      caseId: 'case-synthetic-01',
      phenotypeSnapshotId: 'snap-001',
      scientificPolicyVersion: 'MAGNIOM-POLICY-0.1.0-SYNTHETIC',
      evidenceReleaseVersion: 'MAGNIOM-EVIDENCE-DEV-1.0.0',
      generatedAt: new Date().toISOString(),
      mode: 'RESEARCH',
      primaryCandidates: [mockPrimary],
      additionalCandidates: [],
      suppressedCandidates: [],
      deterministicManifestHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    };

    expect(slate.primaryCandidates.length).toBeLessThanOrEqual(3);
    expect(slate.additionalCandidates.length).toBeLessThanOrEqual(2);
    expect(slate.primaryCandidates[0]?.role).toBe('PRIMARY_1');
  });
});
