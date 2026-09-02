/**
 * Complete Abstention Slate Builder
 * Conforms to MAGNIOM-Target Engine & Ranking Algorithm Specification v1.0, Section 108–110.
 * Constructs immutable abstention slates when mandatory clinical safety or indication gates fail.
 */

import type { TargetSlate, PhenotypeSnapshot, MagniomMode } from '@magniom/domain';
import { computeSha256 } from '@magniom/scientific-policy';

export interface CreateAbstentionSlateOptions {
  readonly id?: string | undefined;
  readonly caseId?: string | undefined;
  readonly phenotypeSnapshot: PhenotypeSnapshot;
  readonly scientificPolicyVersion: string;
  readonly evidenceReleaseVersion: string;
  readonly mode: MagniomMode;
  readonly reasonCode: string;
  readonly clinicianExplanation: string;
  readonly generatedAt?: string | undefined;
}

export function createAbstentionSlate(options: CreateAbstentionSlateOptions): TargetSlate {
  const caseId = options.caseId ?? `case-${options.phenotypeSnapshot.patientId}`;
  const id = options.id ?? `slate-abstained-${options.phenotypeSnapshot.id}`;
  const generatedAt = options.generatedAt ?? '2026-09-01T10:00:00.000Z';

  const slatePayload = {
    id,
    caseId,
    phenotypeSnapshotId: options.phenotypeSnapshot.id,
    scientificPolicyVersion: options.scientificPolicyVersion,
    evidenceReleaseVersion: options.evidenceReleaseVersion,
    generatedAt,
    mode: options.mode,
    primaryCandidates: [] as const,
    additionalCandidates: [] as const,
    suppressedCandidates: [] as const,
    abstentionReason: options.reasonCode,
    abstentionProfile: {
      hasAbstained: true,
      reasonCode: options.reasonCode,
      clinicianExplanation: options.clinicianExplanation,
    },
    clinicalCoverageProfile: {
      primaryDomainCovered: 'NONE',
      secondaryDomainsCovered: [],
      overallClinicalCoverageScore: 0.0,
    },
  };

  const deterministicManifestHash = computeSha256(slatePayload);

  return {
    ...slatePayload,
    deterministicManifestHash,
  };
}
