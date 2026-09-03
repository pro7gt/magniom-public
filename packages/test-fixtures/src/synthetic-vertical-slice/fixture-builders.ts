/**
 * @magniom/test-fixtures - Synthetic Vertical Slice Helper Builders
 * Creates strictly typed domain mocks for all 8 indication golden suites.
 */

import type {
  PhenotypeSnapshot,
  ClinicalObjective,
  MeasurementBundle,
  ReliabilityBundle,
  EvidencePath,
  DiseaseStageContext,
  LesionContext,
  TreatmentContextSnapshot,
  LesionLaterality,
  TargetGeometryType,
  MeasurementModality,
  EvidencePathStatus,
} from '@magniom/domain';
import type { SyntheticVerticalSliceInput, ClinicianDecisionIntent } from '@magniom/target-engine';

export interface SyntheticGoldenCaseDefinition {
  readonly id: string;
  readonly name: string;
  readonly indicationCode: string;
  readonly section: string;
  readonly description: string;
  readonly input: SyntheticVerticalSliceInput;
  readonly decisionIntent?: ClinicianDecisionIntent | undefined;
  readonly expected: {
    readonly shouldAbstain?: boolean | undefined;
    readonly expectedAbstentionType?: string | undefined;
    readonly primaryCandidateCount?: number | undefined;
    readonly expectedPrimaryFamilies?: readonly string[] | undefined;
    readonly expectedGeometries?: readonly string[] | undefined;
    readonly expectedSuppressedCount?: number | undefined;
    readonly researchOnlyBlockedInClinical?: boolean | undefined;
    readonly signingMustFail?: boolean | undefined;
    readonly signingErrorMessage?: string | undefined;
  };
}

export function createMockPhenotypeSnapshot(params: {
  id: string;
  primaryDiagnosis: string;
  customFields?: Record<string, unknown> | undefined;
}): PhenotypeSnapshot {
  const base: Record<string, unknown> = {
    id: params.id,
    patientId: `pat-${params.id}`,
    state: 'ready_for_review',
    primaryDiagnosis: params.primaryDiagnosis,
    episodeSeverity: 'severe_without_psychosis',
    safetyClearance: 'cleared',
    symptomScores: {
      dysphoriaScore: 0.8,
      anhedoniaScore: 0.7,
      anxiousSomaticScore: 0.5,
      ruminationScore: 0.6,
    },
    treatmentHistory: {
      medicationFailuresCount: 2,
      priorTmsExposure: false,
    },
    confirmedByClinicianId: 'clinician-01',
    confirmedAt: '2026-09-03T10:00:00.000Z',
    snapshotHash: `hash-${params.id}`,
    ...(params.customFields ?? {}),
  };

  return base as unknown as PhenotypeSnapshot;
}

export function createMockClinicalObjective(params: {
  id: string;
  caseIndicationId: string;
  code: string;
  display: string;
  priorityRank?: number | undefined;
}): ClinicalObjective {
  return {
    id: params.id,
    caseIndicationId: params.caseIndicationId,
    objectiveDefinitionId: `def-${params.code}`,
    concept: {
      system: 'MAGNIOM-ONTOLOGY',
      code: params.code,
      display: params.display,
    },
    priorityRank: params.priorityRank ?? 1,
    confidence: 'HIGH',
    targetMappability: 'clinically_supported',
    provenance: {
      createdBy: 'clinician-01',
      createdAt: '2026-09-03T10:00:00.000Z',
      softwareVersion: '2.0.0',
    },
  };
}

export function createMockMeasurementBundle(params: {
  id: string;
  caseId: string;
  caseIndicationId: string;
  indicationModuleReleaseId: string;
  phenotypeSnapshotId: string;
  modality?: MeasurementModality | undefined;
}): MeasurementBundle {
  return {
    id: params.id,
    version: '2.0.0',
    caseId: params.caseId,
    caseIndicationId: params.caseIndicationId,
    indicationModuleReleaseId: params.indicationModuleReleaseId,
    phenotypeSnapshotId: params.phenotypeSnapshotId,
    qualificationStatus: 'qualified',
    measurements: [
      {
        measurementId: `meas-${params.id}-primary`,
        modality: params.modality ?? 'structural_mri',
        version: '2.0.0',
        status: 'qualified',
      },
    ],
    requirementEvaluations: [
      {
        requirementCode: 'primary_imaging_qualification',
        satisfied: true,
        satisfyingMeasurementIds: [`meas-${params.id}-primary`],
        resultingCapability: 'enabled',
        explanation: 'Measurement bundle qualified for vertical slice execution.',
      },
    ],
    limitingFactors: [],
    createdAt: '2026-09-03T10:00:00.000Z',
    payloadSha256: `hash-bundle-${params.id}`,
    provenance: {
      createdBy: 'measurement-service',
      createdAt: '2026-09-03T10:00:00.000Z',
      softwareVersion: '2.0.0',
    },
  };
}

export function createMockReliabilityBundle(params: {
  id: string;
  caseId: string;
  caseIndicationId: string;
  indicationModuleReleaseId: string;
  measurementBundleId: string;
}): ReliabilityBundle {
  return {
    id: params.id,
    version: '2.0.0',
    caseId: params.caseId,
    caseIndicationId: params.caseIndicationId,
    indicationModuleReleaseId: params.indicationModuleReleaseId,
    measurementBundleId: params.measurementBundleId,
    componentReliabilityIds: [`rel-comp-${params.id}`],
    capabilityQualification: [
      {
        capabilityCode: 'primary_targeting_capability',
        status: 'qualified',
        reliedOnMeasurementIds: [`meas-${params.id}-primary`],
        reliedOnReliabilityIds: [`rel-comp-${params.id}`],
        policyRuleId: 'RULE-REL-01',
        explanation: 'High signal quality',
      },
    ],
    overallQualification: 'qualified',
    limitingFactors: [],
    interpretation: 'Reliability bundle qualified for targeting execution.',
    payloadSha256: `hash-rel-${params.id}`,
    provenance: {
      createdBy: 'reliability-engine',
      createdAt: '2026-09-03T10:00:00.000Z',
      softwareVersion: '2.0.0',
    },
  };
}

export function createMockEvidencePath(params: {
  id: string;
  indicationModuleReleaseId: string;
  targetFamilyId: string;
  clinicalObjectiveId: string;
  targetGeometryType?: TargetGeometryType | undefined;
  pathStatus?: EvidencePathStatus | undefined;
}): EvidencePath {
  return {
    id: params.id,
    indicationModuleReleaseId: params.indicationModuleReleaseId,
    evidenceClaimIds: [`claim-${params.id}`],
    populationId: `pop-${params.id}`,
    clinicalObjectiveId: params.clinicalObjectiveId,
    targetFamilyId: params.targetFamilyId,
    targetingStrategyId: `strat-${params.id}`,
    targetGeometryType: params.targetGeometryType ?? 'point',
    governanceClassificationIds: [`gov-${params.id}`],
    pathStatus: params.pathStatus ?? 'clinical_permitted',
    provenance: {
      createdBy: 'evidence-librarian',
      createdAt: '2026-09-03T10:00:00.000Z',
      softwareVersion: '2.0.0',
    },
  };
}

export function createMockDiseaseStageContext(params: {
  id: string;
  caseIndicationId: string;
  currentStageCode: string;
  currentStageLabel: string;
}): DiseaseStageContext {
  return {
    id: params.id,
    version: '1.0',
    caseIndicationId: params.caseIndicationId,
    stageDefinitionId: `stage-def-${params.currentStageCode}`,
    currentStageCode: params.currentStageCode,
    currentStageLabel: params.currentStageLabel,
    determinationMethod: 'clinician_assessed',
    confidence: 'HIGH',
    dataQuality: 'verified',
    provenance: {
      createdBy: 'stage-service',
      createdAt: '2026-09-03T10:00:00.000Z',
      softwareVersion: '2.0.0',
    },
  };
}

export function createMockLesionContext(params: {
  id: string;
  caseIndicationId: string;
  lesionLaterality: LesionLaterality;
  lesionVolumeCm3?: number | undefined;
  interpretation: string;
}): LesionContext {
  return {
    id: params.id,
    version: '1.0',
    caseIndicationId: params.caseIndicationId,
    lesionType: 'ischemic',
    lesionLaterality: params.lesionLaterality,
    sourceImagingStudyIds: [`study-${params.id}`],
    lesionVolumeCm3: params.lesionVolumeCm3 ?? 24.5,
    corticalRegionsAffected: [],
    subcorticalRegionsAffected: [],
    registrationQuality: 'high',
    segmentationQuality: 'high',
    structuralDistortion: 'HIGH',
    efieldRelevance: 'material',
    dataQuality: 'verified',
    interpretation: params.interpretation,
    provenance: {
      createdBy: 'neuroradiology',
      createdAt: '2026-09-03T10:00:00.000Z',
      softwareVersion: '2.0.0',
    },
  };
}

export function createMockTreatmentContext(params: {
  id: string;
  caseIndicationId: string;
  requirementCode?: string | undefined;
  interpretation?: string | undefined;
}): TreatmentContextSnapshot {
  return {
    id: params.id,
    version: '1.0',
    caseIndicationId: params.caseIndicationId,
    payloadSha256: `hash-tc-${params.id}`,
    requirementEvaluations: [
      {
        treatmentContextRequirementId: params.requirementCode ?? 'REQ-TREATMENT-MANDATORY',
        status: 'present',
        dataQuality: 'verified',
        interpretation: params.interpretation ?? 'Treatment context verified and satisfied.',
      },
    ],
    provenance: {
      createdBy: 'treatment-service',
      createdAt: '2026-09-03T10:00:00.000Z',
      softwareVersion: '2.0.0',
    },
  };
}
