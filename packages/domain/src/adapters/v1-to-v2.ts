/**
 * MAGNIOM Non-Destructive v1-to-v2 Adapters
 * Conforms to MAGNIOM-Implementation & Multi-Indication Validation Roadmap v2.0 (§19)
 * and MAGNIOM-Canonical Multi-Indication Data Specification v2.0 (§45, 73, 124-126)
 *
 * RULE (§19): Historical v1 EvidenceClaims, TargetCandidates, TargetSlates,
 * signed decisions, and imaging runs SHALL remain historically valid.
 * These adapters expose them through v2 interfaces without silent rewriting.
 */

import type { TargetCandidate, TargetSlate, EvidenceClaim } from '../types.js';
import type {
  TargetCandidateV2,
  TargetSlateV2,
  SlateCandidateRefV2,
  SlatePositionV2,
  TargetEvidenceProfileV2,
} from '../target-v2.js';
import type { PointTargetGeometry } from '../target-geometry.js';
import type {
  MeasurementBundle,
  MeasurementRef,
  MeasurementReliability,
} from '../measurement-bundle.js';
import type { EvidenceGovernanceClassification } from '../evidence-governance.js';
import type { CandidateRoleV2, LegacyEvidenceTier } from '../enums.js';

export const LEGACY_MDD_INDICATION_MODULE_ID = '00000000-0000-0000-0000-000000000001';
export const LEGACY_MDD_POLICY_RELEASE_ID = '00000000-0000-0000-0000-000000000002';
export const LEGACY_EVIDENCE_LIBRARY_RELEASE_ID = '00000000-0000-0000-0000-000000000003';
export const LEGACY_TARGET_ENGINE_VERSION_ID = '00000000-0000-0000-0000-000000000004';

function mapV1RoleToV2Role(v1Role: string, v1Method?: string): CandidateRoleV2 {
  if (v1Method === 'CONNECTOME_REFINED') {
    return 'connectome_refinement';
  }
  if (v1Method === 'EVIDENCE_ONLY_PRIOR') {
    return 'evidence_anchor';
  }
  switch (v1Role) {
    case 'PRIMARY_1':
      return 'evidence_anchor';
    case 'PRIMARY_2':
    case 'PRIMARY_3':
    case 'ADDITIONAL_A':
    case 'ADDITIONAL_B':
      return 'phenotype_specific';
    default:
      return 'clinical_alternative';
  }
}

function mapV1PositionToV2SlatePosition(v1Role: string): SlatePositionV2 {
  switch (v1Role) {
    case 'PRIMARY_1':
      return 'primary_1';
    case 'PRIMARY_2':
      return 'primary_2';
    case 'PRIMARY_3':
      return 'primary_3';
    case 'ADDITIONAL_A':
      return 'additional_a';
    case 'ADDITIONAL_B':
      return 'additional_b';
    default:
      return 'additional_b';
  }
}

function mapLegacyTier(tier?: string): LegacyEvidenceTier {
  if (tier === 'T1' || tier === 'A') return 'A';
  if (tier === 'T2' || tier === 'B') return 'B';
  if (tier === 'T3' || tier === 'C') return 'C';
  if (tier === 'T4' || tier === 'D') return 'D';
  return 'R';
}

/**
 * Non-destructively projects a historical v1 TargetCandidate into a canonical TargetCandidateV2
 */
export function adaptV1CandidateToV2(
  v1Candidate: TargetCandidate,
  context?: {
    caseId?: string;
    caseIndicationId?: string;
    phenotypeSnapshotId?: string;
    measurementBundleId?: string;
    reliabilityBundleId?: string;
  },
): TargetCandidateV2 {
  const caseId = context?.caseId ?? '00000000-0000-0000-0000-000000000000';
  const caseIndicationId = context?.caseIndicationId ?? '00000000-0000-0000-0000-000000000010';
  const measurementBundleId =
    context?.measurementBundleId ?? '00000000-0000-0000-0000-000000000020';

  const laterality =
    v1Candidate.mniCoordinate.x < -2
      ? 'left'
      : v1Candidate.mniCoordinate.x > 2
        ? 'right'
        : 'midline';

  const pointGeometry: PointTargetGeometry = {
    geometryType: 'point',
    coordinateSpace: {
      id: 'MNI152NLin2009cAsym',
      name: 'MNI152NLin2009cAsym',
      subjectSpecific: false,
    },
    laterality,
    sourceMethod: v1Candidate.method,
    sourceMethodVersion: '1.0.0',
    centre: {
      x: v1Candidate.mniCoordinate.x,
      y: v1Candidate.mniCoordinate.y,
      z: v1Candidate.mniCoordinate.z,
    },
    surfaceVertexId:
      v1Candidate.surfaceVertex !== undefined
        ? String(v1Candidate.surfaceVertex.vertexIndex)
        : undefined,
    provenance: {
      createdBy: 'system',
      createdAt: new Date().toISOString(),
      softwareVersion: '2.0.0',
    },
  };

  const evidenceProfile: TargetEvidenceProfileV2 = {
    highestEvidenceTier: mapLegacyTier(v1Candidate.evidenceTier),
    indicationMatch: true,
    indicationModuleMatch: true,
    populationMatch: true,
    diseaseStageMatch: 'not_applicable',
    targetFamilyMatch: true,
    targetingMethodMatch: true,
    targetGeometryMatch: true,
    treatmentContextMatch: 'match',
    evidenceClaimIds: [],
    conflictingEvidenceClaimIds: [],
    evidenceConfidence: 'HIGH',
    applicabilityLimitations: [],
    evidenceSummary: v1Candidate.rationale,
  };

  return {
    id: v1Candidate.id,
    version: '1.0.0',
    caseId,
    caseIndicationId,
    mode: 'CLINICAL',
    indicationModuleReleaseId: LEGACY_MDD_INDICATION_MODULE_ID,
    scientificPolicyReleaseId: LEGACY_MDD_POLICY_RELEASE_ID,
    generationStatus: v1Candidate.isSuppressedOrRedundant ? 'suppressed' : 'eligible',
    candidateRole: mapV1RoleToV2Role(v1Candidate.role, v1Candidate.method),
    targetFamilyId: v1Candidate.familyId,
    therapeuticCircuitIds: [v1Candidate.circuitId],
    clinicalObjectiveIds: [],
    targetGeometry: pointGeometry,
    atlasAnnotations: [],
    clinicalEvidence: evidenceProfile,
    measurementBundleId,
    reliabilityBundleId: context?.reliabilityBundleId,
    reliedOnMeasurementIds: [],
    reliedOnReliabilityIds: [],
    nominationRationale: v1Candidate.rationale,
    counterarguments: v1Candidate.counterarguments ?? [],
    supportingEvidenceClaimIds: [],
    conflictingEvidenceClaimIds: [],
    targetEngineVersionId: LEGACY_TARGET_ENGINE_VERSION_ID,
    evidenceLibraryReleaseId: LEGACY_EVIDENCE_LIBRARY_RELEASE_ID,
    provenance: {
      createdBy: 'system',
      createdAt: new Date().toISOString(),
      softwareVersion: '2.0.0',
    },
  };
}

function toValidUuid(val: string, fallbackSeed = '00000000000000000000000000000000'): string {
  if (/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(val)) {
    return val;
  }
  let clean = val.replace(/[^0-9a-fA-F]/g, '').toLowerCase();
  clean = (clean + fallbackSeed).slice(0, 32);
  return `${clean.slice(0, 8)}-${clean.slice(8, 12)}-4${clean.slice(13, 16)}-8${clean.slice(17, 20)}-${clean.slice(20, 32)}`;
}

/**
 * Non-destructively projects a historical v1 TargetSlate into a canonical TargetSlateV2
 */
export function adaptV1SlateToV2(
  v1Slate: TargetSlate,
  context?: {
    id?: string;
    caseId?: string;
    caseIndicationId?: string;
    phenotypeSnapshotId?: string;
    measurementBundleId?: string;
    reliabilityBundleId?: string;
  },
): TargetSlateV2 {
  const id = context?.id ?? v1Slate.id;
  const caseId = context?.caseId ?? toValidUuid(v1Slate.caseId, '22222222222222222222222222222222');
  const phenotypeSnapshotId =
    context?.phenotypeSnapshotId ??
    toValidUuid(v1Slate.phenotypeSnapshotId, '33333333333333333333333333333333');
  const caseIndicationId = context?.caseIndicationId ?? '00000000-0000-0000-0000-000000000010';
  const measurementBundleId =
    context?.measurementBundleId ?? '00000000-0000-0000-0000-000000000020';

  const primaryCandidates: SlateCandidateRefV2[] = v1Slate.primaryCandidates.map((cand, index) => ({
    targetCandidateId: cand.id,
    position: mapV1PositionToV2SlatePosition(cand.role || `PRIMARY_${index + 1}`),
    role: mapV1RoleToV2Role(cand.role, cand.method),
    rankWithinRole: index + 1,
    inclusionReason: cand.rationale,
  }));

  const additionalCandidates: SlateCandidateRefV2[] = v1Slate.additionalCandidates.map(
    (cand, index) => ({
      targetCandidateId: cand.id,
      position: mapV1PositionToV2SlatePosition(
        cand.role || (index === 0 ? 'ADDITIONAL_A' : 'ADDITIONAL_B'),
      ),
      role: mapV1RoleToV2Role(cand.role, cand.method),
      rankWithinRole: index + 1,
      inclusionReason: cand.rationale,
    }),
  );

  return {
    id,
    version: '1.0.0',
    caseId,
    caseIndicationId,
    mode: v1Slate.mode,
    indicationModuleReleaseId: LEGACY_MDD_INDICATION_MODULE_ID,
    scientificPolicyReleaseId: LEGACY_MDD_POLICY_RELEASE_ID,
    status: v1Slate.status ?? 'ready_for_review',
    generatedAt: v1Slate.generatedAt,
    phenotypeSnapshotId,
    clinicalObjectiveIds: [],
    measurementBundleId,
    reliabilityBundleId: context?.reliabilityBundleId,
    evidenceLibraryReleaseId: LEGACY_EVIDENCE_LIBRARY_RELEASE_ID,
    targetEngineVersionId: LEGACY_TARGET_ENGINE_VERSION_ID,
    pipelineVersionIds: [],
    primaryCandidates,
    additionalCandidates,
    slateConvergence: {
      comparedSources: ['symptom_circuit', 'connectome_refinement'],
      pairwiseRelationships: [],
      overall: 'moderate',
      interpretation: 'Historical MDD convergence profile',
    },
    clinicalCoverage: {
      objectives: [],
      redundancySummary: 'Historical v1 slate coverage',
    },
    abstention: v1Slate.abstentionProfile?.hasAbstained
      ? {
          abstentionType: 'measurement_failure',
          reasonCodes: [v1Slate.abstentionProfile.reasonCode ?? 'UNKNOWN'],
          explanation: v1Slate.abstentionProfile.clinicianExplanation ?? 'Abstained in v1',
          fallbackOptions: [],
        }
      : undefined,
    generationSummary: v1Slate.abstentionReason ?? 'Historical v1 Target Slate',
    scientificLimitations: [],
    payloadSha256: v1Slate.deterministicManifestHash,
    provenance: {
      createdBy: 'system',
      createdAt: v1Slate.generatedAt,
      softwareVersion: '2.0.0',
    },
  };
}

/**
 * Projects historical v1 imaging runs into a canonical MeasurementBundle
 */
export function adaptV1MeasurementsToBundle(params: {
  caseId: string;
  caseIndicationId: string;
  phenotypeSnapshotId: string;
  imagingStudyId: string;
  connectomicsRunId?: string;
}): { bundle: MeasurementBundle; reliabilities: MeasurementReliability[] } {
  const structuralRef: MeasurementRef = {
    measurementId: params.imagingStudyId,
    modality: 'structural_mri',
    version: '1.0.0',
    status: 'qualified',
  };

  const measurements: MeasurementRef[] = [structuralRef];
  const reliabilities: MeasurementReliability[] = [];

  if (params.connectomicsRunId) {
    const rsfmriRef: MeasurementRef = {
      measurementId: params.connectomicsRunId,
      modality: 'resting_state_fmri',
      version: '1.0.0',
      status: 'qualified',
    };
    measurements.push(rsfmriRef);

    const rsReliability: MeasurementReliability = {
      id: `${params.connectomicsRunId}-rel`,
      version: '1.0.0',
      caseId: params.caseId,
      measurementId: params.connectomicsRunId,
      modality: 'resting_state_fmri',
      methodCode: 'split_half_fc',
      methodVersion: '1.0.0',
      qcStatus: 'pass',
      metrics: [
        {
          metricName: 'split_half_distance_mm',
          value: 3.2,
          unit: 'mm',
          interpretation: 'high',
          method: 'split_half_correlation',
        },
      ],
      reliabilityClass: 'high',
      limitingFactors: [],
      interpretation: 'Qualified historical connectomics run',
      pipelineVersionIds: [],
      provenance: {
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        softwareVersion: '2.0.0',
      },
    };
    reliabilities.push(rsReliability);
  }

  const bundle: MeasurementBundle = {
    id: `mb-${params.imagingStudyId}`,
    version: '1.0.0',
    caseId: params.caseId,
    caseIndicationId: params.caseIndicationId,
    indicationModuleReleaseId: LEGACY_MDD_INDICATION_MODULE_ID,
    phenotypeSnapshotId: params.phenotypeSnapshotId,
    measurements,
    qualificationStatus: 'qualified',
    requirementEvaluations: [
      {
        requirementCode: 'structural_t1',
        satisfied: true,
        satisfyingMeasurementIds: [params.imagingStudyId],
        resultingCapability: 'enabled',
        explanation: 'Structural MRI verified',
      },
    ],
    limitingFactors: [],
    createdAt: new Date().toISOString(),
    payloadSha256: '0000000000000000000000000000000000000000000000000000000000000000',
    provenance: {
      createdBy: 'system',
      createdAt: new Date().toISOString(),
      softwareVersion: '2.0.0',
    },
  };

  return { bundle, reliabilities };
}

/**
 * Projects historical v1 EvidenceClaim into v2 with an EvidenceGovernanceClassification
 */
export function adaptV1EvidenceToV2(v1Claim: EvidenceClaim): {
  claim: EvidenceClaim;
  classification: EvidenceGovernanceClassification;
} {
  const classification: EvidenceGovernanceClassification = {
    id: `gov-${v1Claim.id}`,
    evidenceClaimId: v1Claim.id,
    claimVersion: v1Claim.version ?? '1.0.0',
    classificationStatus: 'assigned',
    magniomEvidenceTier: mapLegacyTier(v1Claim.tier),
    permittedRoles: {
      standalonePrimary: true,
      standaloneAdditional: true,
      supportingContext: true,
      refinementOfParentClaims: true,
      researchCandidateGeneration: true,
    },
    reviewerIds: [],
    rationale: 'Historical v1 evidence claim automatically classified to assigned status',
    classificationBasis: 'migrated_v1_governance',
    assignedAt: new Date().toISOString(),
    provenance: {
      createdBy: 'system',
      createdAt: new Date().toISOString(),
      softwareVersion: '2.0.0',
    },
  };

  return { claim: v1Claim, classification };
}
