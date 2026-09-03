/**
 * @magniom/target-engine - Context Resolver & Builder
 * Conforms to MAGNIOM-Target Engine & Ranking Algorithm Specification v2.0 (§9-10)
 */

import type {
  ResolvedTargetEngineContextV2,
  MagniomTargetEngineRequestV2,
  CommonProvenance,
} from '@magniom/domain';
import { MDD_MODULE_RELEASE_ID } from '../plugins/mdd/mdd-plugin.js';

const DEFAULT_PROVENANCE: CommonProvenance = {
  createdBy: 'magniom-system',
  createdAt: '2026-09-02T12:00:00.000Z',
  softwareVersion: '2.0.0',
};

export function createCanonicalResolvedContextV2(
  overrides: Partial<ResolvedTargetEngineContextV2> = {},
): ResolvedTargetEngineContextV2 {
  const {
    request: overrideRequest,
    indicationModule: overrideIndicationModule,
    ...otherOverrides
  } = overrides;

  const defaultRequest: MagniomTargetEngineRequestV2 = {
    caseId: '00000000-0000-0000-0000-000000000010',
    caseIndicationId: '00000000-0000-0000-0000-000000000020',
    mode: 'clinical',
    indicationModuleReleaseId: MDD_MODULE_RELEASE_ID,
    phenotypeSnapshotId: '00000000-0000-0000-0000-000000000030',
    clinicalObjectiveIds: ['00000000-0000-0000-0000-000000000040'],
    measurementBundleId: '00000000-0000-0000-0000-000000000050',
    reliabilityBundleId: '00000000-0000-0000-0000-000000000060',
    evidenceLibraryReleaseId: '00000000-0000-0000-0000-000000000070',
    scientificPolicyReleaseId: '00000000-0000-0000-0000-000000000080',
    targetEngineReleaseId: '00000000-0000-0000-0000-000000000090',
    requestedAt: '2026-09-02T12:00:00.000Z',
  };

  const request = { ...defaultRequest, ...(overrideRequest ?? {}) };

  return {
    phenotypeSnapshot: {
      id: request.phenotypeSnapshotId,
      patientId: 'patient-test-01',
      state: 'ready_for_review',
      primaryDiagnosis: 'Major Depressive Disorder, Recurrent, Severe',
      episodeSeverity: 'SEVERE_WITHOUT_PSYCHOSIS',
      symptomScores: {
        dysphoriaScore: 0.8,
        anhedoniaScore: 0.85,
        anxiousSomaticScore: 0.6,
        ruminationScore: 0.7,
      },
      treatmentHistory: {
        medicationFailuresCount: 3,
        priorTmsExposure: false,
      },
      confirmedByClinicianId: 'clinician-01',
      confirmedAt: '2026-09-02T12:00:00.000Z',
      snapshotHash: 'hash-phenotype',
    },
    clinicalObjectives: [
      {
        id: '00000000-0000-0000-0000-000000000040',
        caseIndicationId: request.caseIndicationId,
        objectiveDefinitionId: 'OBJ-DEF-MDD-01',
        concept: {
          system: 'MAGNIOM-ONTOLOGY',
          code: 'OBJ-MDD-CORE',
          display: 'Remission of Core Depressive Symptoms',
        },
        priorityRank: 1,
        confidence: 'HIGH',
        targetMappability: 'clinically_supported',
        provenance: DEFAULT_PROVENANCE,
      },
    ],
    measurementBundle: {
      id: request.measurementBundleId,
      version: '2.0.0',
      caseId: request.caseId,
      caseIndicationId: request.caseIndicationId,
      indicationModuleReleaseId: request.indicationModuleReleaseId,
      phenotypeSnapshotId: request.phenotypeSnapshotId,
      qualificationStatus: 'qualified',
      measurements: [
        {
          measurementId: 'MEAS-01',
          modality: 'resting_state_fmri',
          version: '2.0.0',
          status: 'qualified',
        },
      ],
      requirementEvaluations: [
        {
          requirementCode: 'individual_fc_refinement',
          satisfied: true,
          satisfyingMeasurementIds: ['MEAS-01'],
          resultingCapability: 'enabled',
          explanation: 'Resting state fMRI meets motion and quality criteria for FC mapping.',
        },
      ],
      limitingFactors: [],
      createdAt: '2026-09-02T12:00:00.000Z',
      payloadSha256: 'hash-bundle-payload',
      provenance: DEFAULT_PROVENANCE,
    },
    reliabilityBundle: {
      id: request.reliabilityBundleId!,
      version: '2.0.0',
      caseId: request.caseId,
      caseIndicationId: request.caseIndicationId,
      indicationModuleReleaseId: request.indicationModuleReleaseId,
      measurementBundleId: request.measurementBundleId,
      componentReliabilityIds: ['MEAS-REL-01'],
      capabilityQualification: [
        {
          capabilityCode: 'individual_fc_refinement',
          status: 'qualified',
          reliedOnMeasurementIds: ['MEAS-01'],
          reliedOnReliabilityIds: ['MEAS-REL-01'],
          policyRuleId: 'RULE-REL-01',
          explanation: 'High test-retest reliability in sgACC-DLPFC anti-correlation map.',
        },
      ],
      overallQualification: 'qualified',
      limitingFactors: [],
      interpretation: 'High reliability in individual functional connectivity mapping.',
      payloadSha256: 'hash-reliability-payload',
      provenance: DEFAULT_PROVENANCE,
    },
    permittedEvidencePaths: [
      {
        id: 'PATH-MDD-BA46',
        indicationModuleReleaseId: request.indicationModuleReleaseId,
        evidenceClaimIds: ['CLAIM-BA46-01'],
        populationId: 'POP-ADULT-TRD',
        clinicalObjectiveId: '00000000-0000-0000-0000-000000000040',
        targetFamilyId: 'TF-MDD-LDLPFC-EST-001',
        targetingStrategyId: 'STRAT-LEFT-DLPFC',
        targetGeometryType: 'point',
        governanceClassificationIds: ['GOV-CLASS-A'],
        pathStatus: 'clinical_permitted',
        provenance: DEFAULT_PROVENANCE,
      },
      {
        id: 'PATH-MDD-DMPFC',
        indicationModuleReleaseId: request.indicationModuleReleaseId,
        evidenceClaimIds: ['CLAIM-DMPFC-01'],
        populationId: 'POP-ADULT-TRD',
        clinicalObjectiveId: '00000000-0000-0000-0000-000000000040',
        targetFamilyId: 'TF-MDD-ANXIOSOMATIC-DMPFC-001',
        targetingStrategyId: 'STRAT-DMPFC',
        targetGeometryType: 'point',
        governanceClassificationIds: ['GOV-CLASS-B'],
        pathStatus: 'clinical_permitted',
        provenance: DEFAULT_PROVENANCE,
      },
    ],
    permittedTargetFamilies: [
      {
        id: 'TF-MDD-LDLPFC-EST-001',
        code: 'LEFT_DLPFC_BA46',
        name: 'Left Dorsolateral Prefrontal Cortex (BA46)',
        hemisphere: 'L',
        primaryHcpParcel: '46',
        fallbackMniCoordinate: { x: -44, y: 40, z: 28, space: 'MNI152NLin2009cAsym' },
        maxAllowableDisplacementMm: 20.0,
        evidenceCeilingTier: 'T1',
        provenance: DEFAULT_PROVENANCE,
      },
      {
        id: 'TF-MDD-ANXIOSOMATIC-DMPFC-001',
        code: 'DMPFC_BA9_32',
        name: 'Dorsomedial Prefrontal Cortex (BA9/32)',
        hemisphere: 'BILATERAL',
        primaryHcpParcel: '9m',
        fallbackMniCoordinate: { x: 0, y: 30, z: 36, space: 'MNI152NLin2009cAsym' },
        maxAllowableDisplacementMm: 15.0,
        evidenceCeilingTier: 'T2',
        provenance: DEFAULT_PROVENANCE,
      },
    ],
    scientificPolicy: {
      id: request.scientificPolicyReleaseId,
      code: 'MAGNIOM-POLICY-MDD-2026',
      semanticVersion: '2.0.0',
      parameters: {
        minReliabilityForPersonalisation: 0.7,
        minIncrementalGainThreshold: 0.05,
      },
    },
    lesionContexts: [],
    ...otherOverrides,
    indicationModule: {
      id: request.indicationModuleReleaseId,
      code: 'MAGNIOM-MODULE-MDD',
      semanticVersion: '2.0.0',
      title: 'Major Depressive Disorder Indication Module',
      description: 'Canonical MDD indication module conforming to Q5 standards.',
      indication: {
        conceptId: 'MDD-F33.2',
        label: 'Major Depressive Disorder, Recurrent, Severe',
      },
      lifecycleStatus: 'active',
      moduleStatus: 'clinical_active',
      qualificationLevel: 'Q5',
      permittedModes: ['clinical', 'research', 'validation'],
      intendedPopulation: {
        code: 'POP-ADULT-TRD',
        label: 'Adult Treatment-Resistant Depression',
        description: 'Adults aged 18-75 with unipolar treatment-resistant depression.',
        minAgeYears: 18,
        maxAgeYears: 75,
      },
      phenotypeSchemaVersionId: 'SCHEMA-PHENOTYPE-2.0.0',
      clinicalObjectiveDefinitionIds: ['OBJ-DEF-MDD-01'],
      evidenceScopeId: 'EV-SCOPE-MDD-01',
      permittedTargetFamilyIds: ['TF-MDD-LDLPFC-EST-001', 'TF-MDD-ANXIOSOMATIC-DMPFC-001'],
      permittedCandidateGenerationMethodIds: ['GEN-MDD-EVIDENCE-001', 'GEN-MDD-REFINED-001'],
      measurementRequirements: [],
      reliabilityPolicyRefs: ['REL-POL-MDD-01'],
      permittedTargetGeometryTypes: ['point'],
      scientificPolicyCompatibilityRefs: ['POL-MDD-2026-V1'],
      knownLimitations: [],
      validationEvidenceIds: [],
      payloadSha256: 'hash-module-payload',
      manifestSha256: 'hash-module-manifest',
      createdAt: '2026-09-02T12:00:00.000Z',
      provenance: DEFAULT_PROVENANCE,
      ...(overrideIndicationModule ?? {}),
    },
    request,
  };
}
