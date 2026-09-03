/**
 * @magniom/target-engine - Abstention Framework v2
 * Conforms to MAGNIOM-Target Engine & Ranking Algorithm Specification v2.0 (§116-118)
 * and Section 21 Exit Criterion 8 ("zero-candidate result is supported")
 */

import type {
  TargetSlateV2,
  AbstentionProfileV2,
  AbstentionType,
  ResolvedTargetEngineContextV2,
} from '@magniom/domain';
import { computeSha256, canonicalJsonStringify } from '@magniom/scientific-policy';

export interface CreateAbstentionSlateV2Options {
  readonly id: string;
  readonly context: ResolvedTargetEngineContextV2;
  readonly abstentionType: AbstentionType;
  readonly reasonCodes: readonly string[];
  readonly explanation: string;
  readonly fallbackOptions?: readonly string[];
}

export function createAbstentionSlateV2(options: CreateAbstentionSlateV2Options): TargetSlateV2 {
  const { id, context, abstentionType, reasonCodes, explanation, fallbackOptions } = options;
  const req = context.request;

  const abstentionProfile: AbstentionProfileV2 = {
    abstentionType,
    reasonCodes,
    explanation,
    fallbackOptions: fallbackOptions ?? [
      'Specialist manual targeting review',
      'Acquire required multimodal measurement or repeat scan with motion control',
    ],
  };

  const slateWithoutPayload: Omit<TargetSlateV2, 'payloadSha256'> = {
    id,
    version: '2.0.0',
    caseId: req.caseId,
    caseIndicationId: req.caseIndicationId,
    mode: req.mode,
    indicationModuleReleaseId: req.indicationModuleReleaseId,
    scientificPolicyReleaseId: req.scientificPolicyReleaseId,
    status: 'abstained',
    generatedAt: req.requestedAt ?? '2026-09-02T12:00:00.000Z',
    phenotypeSnapshotId: req.phenotypeSnapshotId,
    clinicalObjectiveIds: req.clinicalObjectiveIds,
    diseaseStageContextId: req.diseaseStageContextId,
    lesionContextIds: req.lesionContextIds,
    measurementBundleId: req.measurementBundleId,
    reliabilityBundleId: req.reliabilityBundleId,
    evidenceLibraryReleaseId: req.evidenceLibraryReleaseId,
    targetEngineVersionId: req.targetEngineReleaseId,
    pipelineVersionIds: [],
    primaryCandidates: [],
    additionalCandidates: [],
    slateConvergence: {
      comparedSources: [],
      pairwiseRelationships: [],
      overall: 'not_assessable',
      interpretation: `Engine abstained with reason: ${explanation}`,
    },
    clinicalCoverage: {
      objectives: (req.clinicalObjectiveIds ?? []).map((objId, idx) => ({
        clinicalObjectiveId: objId,
        priorityRank: idx + 1,
        coveredByCandidateIds: [],
        coverage: 'none',
        interpretation: `Abstained: ${explanation}`,
      })),
      redundancySummary: 'Zero candidates nominated.',
    },
    abstention: abstentionProfile,
    generationSummary: `Engine abstained: ${explanation}`,
    scientificLimitations: [
      'No candidate hypotheses satisfied all mandatory hard gates.',
      'Clinical mode prohibits unverified fallback guessing.',
    ],
    provenance: {
      createdBy: 'magniom-target-engine-v2',
      createdAt: req.requestedAt ?? '2026-09-02T12:00:00.000Z',
      softwareVersion: '2.0.0',
    },
  };

  const payloadSha256 = computeSha256(canonicalJsonStringify(slateWithoutPayload));

  return {
    ...slateWithoutPayload,
    payloadSha256,
  };
}
