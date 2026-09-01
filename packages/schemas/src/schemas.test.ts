import { describe, it, expect } from 'vitest';
import { TargetSlateSchema, ClinicianDecisionSchema } from './schemas.js';

describe('Zod Runtime Schemas', () => {
  it('should validate a valid TargetSlate structure', () => {
    const validSlate = {
      id: 'slate-001',
      caseId: 'case-synthetic-01',
      phenotypeSnapshotId: 'snap-001',
      scientificPolicyVersion: 'MAGNIOM-POLICY-0.1.0-SYNTHETIC',
      evidenceReleaseVersion: 'MAGNIOM-EVIDENCE-DEV-1.0.0',
      generatedAt: '2026-09-01T12:00:00.000Z',
      mode: 'RESEARCH',
      primaryCandidates: [
        {
          id: 'cand-001',
          familyId: 'fam-ba46-l',
          circuitId: 'circ-sgacc-antisync',
          role: 'PRIMARY_1',
          method: 'EVIDENCE_ONLY_PRIOR',
          evidenceTier: 'T1',
          mniCoordinate: {
            space: 'MNI152NLin2009cAsym',
            x: -44,
            y: 38,
            z: 32,
          },
          evidenceScore: 0.95,
          phenotypeConcordanceScore: 0.9,
          overallScore: 0.93,
          rationale: 'Evidence-anchored left DLPFC target',
          contraindicationsOrConflicts: [],
          isSuppressedOrRedundant: false,
        },
      ],
      additionalCandidates: [],
      suppressedCandidates: [],
      deterministicManifestHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    };

    const parsed = TargetSlateSchema.safeParse(validSlate);
    expect(parsed.success).toBe(true);
  });

  it('should reject a TargetSlate with more than 3 primary candidates', () => {
    const candidate = {
      id: 'cand-001',
      familyId: 'fam-ba46-l',
      circuitId: 'circ-sgacc-antisync',
      role: 'PRIMARY_1' as const,
      method: 'EVIDENCE_ONLY_PRIOR' as const,
      evidenceTier: 'T1' as const,
      mniCoordinate: {
        space: 'MNI152NLin2009cAsym' as const,
        x: -44,
        y: 38,
        z: 32,
      },
      evidenceScore: 0.95,
      phenotypeConcordanceScore: 0.9,
      overallScore: 0.93,
      rationale: 'Primary target',
      contraindicationsOrConflicts: [],
      isSuppressedOrRedundant: false,
    };

    const invalidSlate = {
      id: 'slate-002',
      caseId: 'case-002',
      phenotypeSnapshotId: 'snap-002',
      scientificPolicyVersion: 'v1',
      evidenceReleaseVersion: 'v1',
      generatedAt: '2026-09-01T12:00:00.000Z',
      mode: 'RESEARCH',
      primaryCandidates: [candidate, candidate, candidate, candidate], // 4 candidates! (max 3 allowed)
      additionalCandidates: [],
      suppressedCandidates: [],
      deterministicManifestHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    };

    const parsed = TargetSlateSchema.safeParse(invalidSlate);
    expect(parsed.success).toBe(false);
  });
});
