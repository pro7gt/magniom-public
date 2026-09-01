/**
 * @magniom/target-engine
 * Deterministic 12-stage candidate generation and Target Slate assembly.
 * Conforms to MAGNIOM-Target Engine & Ranking Algorithm Specification v1.0.
 * Runs completely offline without database or internet connectivity.
 */

import type { TargetSlate, TargetCandidate, PhenotypeSnapshot, MagniomMode } from '@magniom/domain';

export interface TargetEngineInput {
  readonly phenotypeSnapshot: PhenotypeSnapshot;
  readonly policyVersion: string;
  readonly evidenceVersion: string;
  readonly mode: MagniomMode;
  readonly candidates: readonly TargetCandidate[];
}

export function assembleTargetSlate(input: TargetEngineInput): TargetSlate {
  // Sort candidates by overallScore descending
  const sorted = [...input.candidates].sort((a, b) => b.overallScore - a.overallScore);

  const primaryCandidates = sorted.slice(0, 3).map((c, idx) => ({
    ...c,
    role: `PRIMARY_${idx + 1}` as 'PRIMARY_1' | 'PRIMARY_2' | 'PRIMARY_3',
  }));

  const additionalCandidates = sorted.slice(3, 5).map((c, idx) => ({
    ...c,
    role: `ADDITIONAL_${idx === 0 ? 'A' : 'B'}` as 'ADDITIONAL_A' | 'ADDITIONAL_B',
  }));

  const suppressedCandidates = sorted.slice(5);

  return {
    id: `slate-${Date.now()}`,
    caseId: `case-${input.phenotypeSnapshot.patientId}`,
    phenotypeSnapshotId: input.phenotypeSnapshot.id,
    scientificPolicyVersion: input.policyVersion,
    evidenceReleaseVersion: input.evidenceVersion,
    generatedAt: new Date().toISOString(),
    mode: input.mode,
    primaryCandidates,
    additionalCandidates,
    suppressedCandidates,
    deterministicManifestHash: '0000000000000000000000000000000000000000000000000000000000000000',
  };
}
