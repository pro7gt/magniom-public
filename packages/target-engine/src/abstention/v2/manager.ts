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

/**
 * §74 Canonical Abstention Explanations
 * Conforms to MAGNIOM-Multi-Indication Technical & Scientific Architecture Specification v2.0 (§74)
 */
export const ABSTENTION_TYPE_EXPLANATIONS: Partial<Record<AbstentionType, string>> = {
  unsupported_indication:
    'The requested clinical concept or ICD/SNOMED indication is not supported by any registered and active Indication Module.',
  unsupported_disease_stage:
    'Patient clinical disease stage is not compatible with authorized evidence scope or generator eligibility criteria.',
  module_not_clinically_qualified:
    'Indication module has not attained clinical qualification level required for Clinical Mode operation.',
  lesion_registration_failure:
    'Anatomical lesion segmentation or co-registration failed quality criteria, precluding safe spatial target derivation.',
  target_region_destroyed_by_lesion:
    'Stroke, resection, or necrotic cavity materially destroys the proposed cortical stimulation target region.',
  protocol_context_missing:
    'Evidence-mandatory adjunctive treatment context (e.g. concurrent rehabilitation or symptom provocation) is missing or unverified.',
  motor_map_unreliable:
    'Patient-specific motor mapping reliability metrics fell below quality policy thresholds for somatotopic target refinement.',
  body_region_mapping_uncertain:
    'Somatotopic mapping from pain phenotype or clinical deficits to cortical homunculus lacks sufficient certainty.',
  audiology_incomplete:
    'Mandatory audiometric assessments required for tinnitus target analysis are absent or incomplete.',
  coil_not_compatible:
    'Treatment delivery coil or device class is incompatible with required target depth, field distribution, or evidence precedents.',
  field_model_unreliable:
    'Volumetric electric field simulation failed convergence or mesh validity criteria over non-standard cranial anatomy.',
  no_nonredundant_candidate:
    'All generated candidate hypotheses were suppressed by mandatory hard gates or deemed redundant with higher-ranking targets.',
  scientific_configuration_invalid:
    'Target engine runtime scientific configuration violated integrity or compatibility constraints.',
};

export interface CreateAbstentionSlateV2Options {
  readonly id: string;
  readonly context: ResolvedTargetEngineContextV2;
  readonly abstentionType: AbstentionType;
  readonly reasonCodes: readonly string[];
  readonly explanation?: string;
  readonly fallbackOptions?: readonly string[];
}

export function createAbstentionSlateV2(options: CreateAbstentionSlateV2Options): TargetSlateV2 {
  const { id, context, abstentionType, reasonCodes, fallbackOptions } = options;
  const explanation =
    options.explanation ??
    ABSTENTION_TYPE_EXPLANATIONS[abstentionType] ??
    'Target engine abstained due to clinical governance or safety criteria.';
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
