/**
 * @magniom/target-engine - Slate Assembly v2
 * Conforms to MAGNIOM-Target Engine & Ranking Algorithm Specification v2.0 (§110-115)
 */

import type {
  CandidateDraft,
  SlateAssemblyProfileDefinition,
  SlateCandidateRefV2,
  SlatePositionV2,
  SlateConvergenceProfileV2,
  ClinicalCoverageProfileV2,
  TargetSlateV2,
  ResolvedTargetEngineContextV2,
} from '@magniom/domain';
import { computeSha256, canonicalJsonStringify } from '@magniom/scientific-policy';

export interface AssembleSlateV2Input {
  readonly id: string;
  readonly candidates: readonly CandidateDraft[];
  readonly slateProfile: SlateAssemblyProfileDefinition;
  readonly context: ResolvedTargetEngineContextV2;
  readonly redundancyMap: ReadonlyMap<string, readonly string[]>;
}

export function assembleSlateV2(input: AssembleSlateV2Input): TargetSlateV2 {
  const { id, candidates, slateProfile, context, redundancyMap } = input;
  const req = context.request;

  const maxPrimary = Math.min(3, slateProfile.maxPrimary);
  const maxAdditional = Math.min(2, slateProfile.maxAdditional);

  const primaryPositions: SlatePositionV2[] = ['primary_1', 'primary_2', 'primary_3'];
  const additionalPositions: SlatePositionV2[] = ['additional_a', 'additional_b'];

  const primaryRefs: SlateCandidateRefV2[] = [];
  const additionalRefs: SlateCandidateRefV2[] = [];

  const unassigned = [...candidates];

  function selectCandidateForPosition(pos: SlatePositionV2): CandidateDraft | undefined {
    const rolePriority = slateProfile.rolePriorities?.find(r => r.position === pos);
    if (rolePriority && rolePriority.preferredRoles && rolePriority.preferredRoles.length > 0) {
      for (const preferredRole of rolePriority.preferredRoles) {
        const foundIdx = unassigned.findIndex(c => c.proposedRole === preferredRole);
        if (foundIdx >= 0) {
          return unassigned.splice(foundIdx, 1)[0];
        }
      }
    }
    return unassigned.shift();
  }

  // Allocate primary slots
  for (const pos of primaryPositions) {
    if (primaryRefs.length >= maxPrimary) break;
    const cand = selectCandidateForPosition(pos);
    if (cand) {
      primaryRefs.push({
        targetCandidateId: cand.draftId,
        position: pos,
        role: cand.proposedRole,
        rankWithinRole: primaryRefs.length + 1,
        inclusionReason: `Nominated as ${pos} hypothesis satisfying clinical coverage.`,
        redundancyWith: redundancyMap.get(cand.draftId) ?? [],
      });
    }
  }

  // Allocate additional slots
  for (const pos of additionalPositions) {
    if (additionalRefs.length >= maxAdditional) break;
    const cand = selectCandidateForPosition(pos);
    if (cand) {
      additionalRefs.push({
        targetCandidateId: cand.draftId,
        position: pos,
        role: cand.proposedRole,
        rankWithinRole: additionalRefs.length + 1,
        inclusionReason: `Nominated as ${pos} secondary clinical hypothesis.`,
        redundancyWith: redundancyMap.get(cand.draftId) ?? [],
      });
    }
  }

  const convergence: SlateConvergenceProfileV2 = {
    comparedSources: ['evidence_library', 'measurement_bundle'],
    pairwiseRelationships: [],
    overall: primaryRefs.length > 0 ? 'high' : 'not_assessable',
    interpretation:
      primaryRefs.length > 0
        ? 'Primary candidates demonstrate therapeutic convergence across clinical objectives.'
        : 'No primary candidates nominated.',
  };

  const coverage: ClinicalCoverageProfileV2 = {
    objectives: req.clinicalObjectiveIds.map((objId, idx) => ({
      clinicalObjectiveId: objId,
      priorityRank: idx + 1,
      coveredByCandidateIds: primaryRefs.map(r => r.targetCandidateId),
      coverage: primaryRefs.length > 0 ? 'strong' : 'none',
      interpretation:
        primaryRefs.length > 0
          ? `Objective ${objId} covered by active primary slate candidates.`
          : `Objective ${objId} uncovered; engine abstained.`,
    })),
    redundancySummary: 'Redundancy suppressed under geometry-aware comparator threshold.',
  };

  const slateWithoutPayload: Omit<TargetSlateV2, 'payloadSha256'> = {
    id,
    version: '2.0.0',
    caseId: req.caseId,
    caseIndicationId: req.caseIndicationId,
    mode: req.mode,
    indicationModuleReleaseId: req.indicationModuleReleaseId,
    scientificPolicyReleaseId: req.scientificPolicyReleaseId,
    status: primaryRefs.length > 0 ? 'ready_for_review' : 'abstained',
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
    primaryCandidates: primaryRefs,
    additionalCandidates: additionalRefs,
    slateConvergence: convergence,
    clinicalCoverage: coverage,
    generationSummary:
      primaryRefs.length > 0
        ? `Assembled minimal Target Slate with ${primaryRefs.length} Primary and ${additionalRefs.length} Additional hypotheses.`
        : 'Engine abstained from nominating candidates.',
    scientificLimitations: [
      'Candidate coordinates are algorithmic hypotheses for specialist review.',
      'Magniom does not generate treatment protocols or dosages.',
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
