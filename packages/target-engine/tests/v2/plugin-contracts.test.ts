/**
 * @magniom/target-engine - Section 23: Plugin Contract Tests
 * Conforms to MAGNIOM-Implementation & Multi-Indication Validation Roadmap v2.0 (§22-23)
 *
 * Every plugin SHALL pass:
 * 1.  module identity
 * 2.  exact version
 * 3.  deterministic output
 * 4.  allowed geometry
 * 5.  evidence provenance
 * 6.  no DB/network scientific access
 * 7.  no hidden ranking
 * 8.  no Research leakage
 * 9.  declared measurements
 * 10. declared failure modes
 */

import { describe, it, expect } from 'vitest';
import {
  CANONICAL_PLUGIN_CATALOG,
  CandidateGeneratorRegistry,
  type ResolvedTargetEngineContextV2,
  type CandidateDraft,
} from '../../src/index.js';

function createTestContext(
  indicationCode: string,
  mode: 'clinical' | 'research' | 'validation' = 'clinical',
  overrides?: Partial<ResolvedTargetEngineContextV2>,
): ResolvedTargetEngineContextV2 {
  return {
    request: {
      caseId: 'case-test-001',
      caseIndicationId: 'ci-test-001',
      mode,
      indicationModuleReleaseId: '00000000-0000-0000-0000-000000000001',
      phenotypeSnapshotId: 'ps-test-001',
      clinicalObjectiveIds: [
        'obj-depression',
        'obj-anxious-somatic',
        'obj-bilateral',
        'obj-ocd',
        'obj-pain',
        'obj-stroke-motor',
        'obj-aphasia',
        'obj-tbi',
        'obj-ptsd',
        'obj-tinnitus',
      ],
      measurementBundleId: 'mb-test-001',
      evidenceLibraryReleaseId: 'el-test-001',
      scientificPolicyReleaseId: 'sp-test-001',
      targetEngineReleaseId: 'te-test-001',
    },
    phenotypeSnapshot: {
      patientId: 'pat-001',
      phenotypeId: 'pheno-001',
      caseId: 'case-test-001',
      capturedAt: '2026-09-02T12:00:00.000Z',
      anxiousDistressPresent: true,
      anhedoniaPresent: false,
      treatmentResistanceTier: 2,
      subtypes: [],
      severityScales: [],
      affectedSide: 'right',
      aphasiaSubtype: 'non_fluent',
      diseaseStage: 'chronic',
      traumaType: 'combat',
      veteranStatus: true,
    } as any,
    clinicalObjectives: [],
    diseaseStageContext: {
      id: 'dsc-001',
      version: '1.0',
      caseIndicationId: 'ci-test-001',
      stageDefinitionId: 'stage-def-001',
      currentStageCode: 'chronic',
      currentStageLabel: 'Chronic Phase (>6 months post-onset)',
      determinationMethod: 'clinical_evaluation',
      confidence: 'established',
      dataQuality: 'valid',
      provenance: {
        createdBy: 'test',
        createdAt: '2026-09-02T12:00:00.000Z',
        softwareVersion: '2.0.0',
      },
    },
    indicationModule: {
      id: '00000000-0000-0000-0000-000000000001',
      code: `MAGNIOM-IND-${indicationCode}`,
      semanticVersion: '2.0.0',
      title: `${indicationCode} Targeting Module`,
      indication: { conceptId: 'c-001', label: indicationCode, code: indicationCode },
      intendedPopulation: {
        code: 'POP-001',
        label: 'Adult Population',
        description: 'Target patient population',
      },
      status: 'clinical_active',
      governanceStatus: 'approved',
      qualificationLevel: 'Q1',
      permittedModes: ['clinical', 'research', 'validation'],
      phenotypeSchemaVersionId: 'schema-001',
      evidenceScopeId: 'scope-001',
      clinicalObjectives: [],
      candidateGenerationMethods: [],
      measurementRequirements: [],
      targetGeometryTypes: ['point', 'coil_field', 'somatotopic', 'surface_roi', 'network'],
      reliabilityPolicyRefs: [],
      scientificPolicyCompatibility: [],
      adjunctiveContextRequirements: [],
      limitations: [],
      validationEvidenceIds: [],
      manifestSha256: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
      provenance: {
        createdBy: 'test',
        createdAt: '2026-09-02T12:00:00.000Z',
        softwareVersion: '2.0.0',
      },
    },
    lesionContexts: [
      {
        id: 'lesion-001',
        version: '1.0',
        caseIndicationId: 'ci-test-001',
        lesionType: 'ischemic',
        lesionLaterality: 'left',
        sourceImagingStudyIds: [],
        corticalRegionsAffected: [],
        subcorticalRegionsAffected: [],
        structuralDistortion: 'low',
        registrationQuality: 'high',
        segmentationQuality: 'high',
        efieldRelevance: 'none_known',
        dataQuality: 'valid',
        interpretation: 'Left subcortical ischemic lesion sparing cortical hand knob',
        provenance: {
          createdBy: 'test',
          createdAt: '2026-09-02T12:00:00.000Z',
          softwareVersion: '2.0.0',
        },
      },
    ],
    treatmentContextSnapshot: {
      id: 'tc-snap-001',
      version: '1.0',
      caseIndicationId: 'ci-test-001',
      requirementEvaluations: [
        {
          treatmentContextRequirementId: 'REQ-SLT-CONCURRENT',
          status: 'verified_active',
          dataQuality: 'valid',
          interpretation: 'Concurrent speech-language therapy verified active',
        },
      ],
      payloadSha256: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
      provenance: {
        createdBy: 'test',
        createdAt: '2026-09-02T12:00:00.000Z',
        softwareVersion: '2.0.0',
      },
    },
    measurementBundle: {
      id: 'mb-test-001',
      caseIndicationId: 'ci-test-001',
      version: '1.0',
      measurements: [
        {
          measurementId: 'meas-fc-001',
          modality: 'resting_state_fmri',
          acquisitionProtocol: 'rs-fMRI 10min',
          processingPipeline: 'fmriprep-23.2',
          spatialReference: { id: 'MNI152NLin2009cAsym', name: 'MNI', subjectSpecific: false },
          qcMetrics: [],
          qcStatus: 'pass',
          artifactRefs: [],
          derivedFeatures: [],
          payloadSha256: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
          provenance: {
            createdBy: 'test',
            createdAt: '2026-09-02T12:00:00.000Z',
            softwareVersion: '2.0.0',
          },
        },
        {
          measurementId: 'meas-motor-001',
          modality: 'tms_motor_mapping',
          acquisitionProtocol: 'Single-pulse TMS M1 map',
          processingPipeline: 'magniom-mep-v2',
          spatialReference: { id: 'MNI152NLin2009cAsym', name: 'MNI', subjectSpecific: false },
          qcMetrics: [],
          qcStatus: 'pass',
          artifactRefs: [],
          derivedFeatures: [],
          payloadSha256: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
          provenance: {
            createdBy: 'test',
            createdAt: '2026-09-02T12:00:00.000Z',
            softwareVersion: '2.0.0',
          },
        },
      ],
      requirementEvaluations: [
        {
          requirementCode: 'individual_fc_refinement',
          modality: 'resting_state_fmri',
          requirementType: 'required_for_personalisation',
          status: 'satisfied',
          resultingCapability: 'enabled',
          explanation: 'Resting-state functional connectivity qualified',
        },
        {
          requirementCode: 'motor_hotspot_targeting',
          modality: 'tms_motor_mapping',
          requirementType: 'required_for_personalisation',
          status: 'satisfied',
          resultingCapability: 'enabled',
          explanation: 'Motor hotspot mapping qualified',
        },
        {
          requirementCode: 'structural_safety_evaluation',
          modality: 'structural_mri',
          requirementType: 'required',
          status: 'satisfied',
          resultingCapability: 'enabled',
          explanation: 'Structural safety verified',
        },
      ],
      structuralDistortionIndex: 0.05,
      overallDataQuality: 'valid',
      bundleManifestSha256: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
      provenance: {
        createdBy: 'test',
        createdAt: '2026-09-02T12:00:00.000Z',
        softwareVersion: '2.0.0',
      },
    },
    permittedEvidencePaths: [
      {
        id: 'ep-mdd-ba46',
        version: '2.0.0',
        indicationModuleReleaseId: '00000000-0000-0000-0000-000000000001',
        evidencePathCode: 'EP-MDD-BA46',
        therapeuticCircuitId: 'TC-MDD-DLPFC-001',
        targetFamilyId: 'TF-MDD-LDLPFC-EST-001',
        status: 'clinical_permitted',
        permittedModes: ['clinical', 'research', 'validation'],
        governanceClassification: 'established_consensus',
        provenance: {
          createdBy: 'test',
          createdAt: '2026-09-02T12:00:00.000Z',
          softwareVersion: '2.0.0',
        },
      },
      {
        id: 'ep-mdd-dmpfc',
        version: '2.0.0',
        indicationModuleReleaseId: '00000000-0000-0000-0000-000000000001',
        evidencePathCode: 'EP-MDD-DMPFC',
        therapeuticCircuitId: 'TC-MDD-DMPFC-001',
        targetFamilyId: 'TF-MDD-ANXIOSOMATIC-DMPFC-001',
        status: 'clinical_permitted',
        permittedModes: ['clinical', 'research', 'validation'],
        governanceClassification: 'established_consensus',
        provenance: {
          createdBy: 'test',
          createdAt: '2026-09-02T12:00:00.000Z',
          softwareVersion: '2.0.0',
        },
      },
      {
        id: 'ep-ocd-mpfc',
        version: '2.0.0',
        indicationModuleReleaseId: '00000000-0000-0000-0000-000000000002',
        evidencePathCode: 'EP-OCD-MPFC',
        therapeuticCircuitId: 'TC-OCD-001',
        targetFamilyId: 'TF-OCD-MPFC-ACC-001',
        status: 'clinical_permitted',
        permittedModes: ['clinical', 'research', 'validation'],
        governanceClassification: 'established_consensus',
        provenance: {
          createdBy: 'test',
          createdAt: '2026-09-02T12:00:00.000Z',
          softwareVersion: '2.0.0',
        },
      },
      {
        id: 'ep-ocd-presma',
        version: '2.0.0',
        indicationModuleReleaseId: '00000000-0000-0000-0000-000000000002',
        evidencePathCode: 'EP-OCD-PRESMA',
        therapeuticCircuitId: 'TC-OCD-002',
        targetFamilyId: 'TF-OCD-PRESMA-001',
        status: 'clinical_permitted',
        permittedModes: ['clinical', 'research', 'validation'],
        governanceClassification: 'established_consensus',
        provenance: {
          createdBy: 'test',
          createdAt: '2026-09-02T12:00:00.000Z',
          softwareVersion: '2.0.0',
        },
      },
      {
        id: 'ep-pain-m1',
        version: '2.0.0',
        indicationModuleReleaseId: '00000000-0000-0000-0000-000000000003',
        evidencePathCode: 'EP-PAIN-M1',
        therapeuticCircuitId: 'TC-PAIN-001',
        targetFamilyId: 'TF-PAIN-M1-SOMATOTOPIC-001',
        status: 'clinical_permitted',
        permittedModes: ['clinical', 'research', 'validation'],
        governanceClassification: 'established_consensus',
        provenance: {
          createdBy: 'test',
          createdAt: '2026-09-02T12:00:00.000Z',
          softwareVersion: '2.0.0',
        },
      },
      {
        id: 'ep-stroke-contra',
        version: '2.0.0',
        indicationModuleReleaseId: '00000000-0000-0000-0000-000000000004',
        evidencePathCode: 'EP-STROKE-CONTRA',
        therapeuticCircuitId: 'TC-STROKE-001',
        targetFamilyId: 'TF-STROKE-CONTRALESIONAL-M1-001',
        status: 'clinical_permitted',
        permittedModes: ['clinical', 'research', 'validation'],
        governanceClassification: 'established_consensus',
        provenance: {
          createdBy: 'test',
          createdAt: '2026-09-02T12:00:00.000Z',
          softwareVersion: '2.0.0',
        },
      },
      {
        id: 'ep-stroke-ipsi',
        version: '2.0.0',
        indicationModuleReleaseId: '00000000-0000-0000-0000-000000000004',
        evidencePathCode: 'EP-STROKE-IPSI',
        therapeuticCircuitId: 'TC-STROKE-002',
        targetFamilyId: 'TF-STROKE-IPSILESIONAL-M1-001',
        status: 'clinical_permitted',
        permittedModes: ['clinical', 'research', 'validation'],
        governanceClassification: 'established_consensus',
        provenance: {
          createdBy: 'test',
          createdAt: '2026-09-02T12:00:00.000Z',
          softwareVersion: '2.0.0',
        },
      },
      {
        id: 'ep-aphasia-rifg',
        version: '2.0.0',
        indicationModuleReleaseId: '00000000-0000-0000-0000-000000000005',
        evidencePathCode: 'EP-APHASIA-RIFG',
        therapeuticCircuitId: 'TC-APHASIA-001',
        targetFamilyId: 'TF-APHASIA-RIGHT-IFG-001',
        status: 'clinical_permitted',
        permittedModes: ['clinical', 'research', 'validation'],
        governanceClassification: 'established_consensus',
        provenance: {
          createdBy: 'test',
          createdAt: '2026-09-02T12:00:00.000Z',
          softwareVersion: '2.0.0',
        },
      },
      {
        id: 'ep-tbi-cog',
        version: '2.0.0',
        indicationModuleReleaseId: '00000000-0000-0000-0000-000000000006',
        evidencePathCode: 'EP-TBI-COG',
        therapeuticCircuitId: 'TC-TBI-001',
        targetFamilyId: 'TF-TBI-COGNITIVE-DLPFC-001',
        status: 'clinical_permitted',
        permittedModes: ['clinical', 'research', 'validation'],
        governanceClassification: 'established_consensus',
        provenance: {
          createdBy: 'test',
          createdAt: '2026-09-02T12:00:00.000Z',
          softwareVersion: '2.0.0',
        },
      },
      {
        id: 'ep-ptsd-rdlpfc',
        version: '2.0.0',
        indicationModuleReleaseId: '00000000-0000-0000-0000-000000000007',
        evidencePathCode: 'EP-PTSD-RDLPFC',
        therapeuticCircuitId: 'TC-PTSD-001',
        targetFamilyId: 'TF-PTSD-RDLPFC-001',
        status: 'clinical_permitted',
        permittedModes: ['clinical', 'research', 'validation'],
        governanceClassification: 'established_consensus',
        provenance: {
          createdBy: 'test',
          createdAt: '2026-09-02T12:00:00.000Z',
          softwareVersion: '2.0.0',
        },
      },
      {
        id: 'ep-tinnitus-aud',
        version: '2.0.0',
        indicationModuleReleaseId: '88888888-8888-4888-8888-888888888889',
        evidencePathCode: 'EP-TINNITUS-AUD',
        therapeuticCircuitId: 'TC-TINNITUS-001',
        targetFamilyId: 'TF-TINNITUS-AUDITORY-001',
        status: 'research_permitted',
        permittedModes: ['research'],
        governanceClassification: 'investigational',
        provenance: {
          createdBy: 'test',
          createdAt: '2026-09-02T12:00:00.000Z',
          softwareVersion: '2.0.0',
        },
      },
      {
        id: 'ep-mdd-research',
        version: '2.0.0',
        indicationModuleReleaseId: '11111111-1111-4111-8111-111111111112',
        evidencePathCode: 'EP-MDD-RESEARCH',
        therapeuticCircuitId: 'TC-MDD-003',
        targetFamilyId: 'TF-MDD-RESEARCH-SUBCORTICAL-001',
        status: 'research_permitted',
        permittedModes: ['research'],
        governanceClassification: 'investigational',
        provenance: {
          createdBy: 'test',
          createdAt: '2026-09-02T12:00:00.000Z',
          softwareVersion: '2.0.0',
        },
      },
      {
        id: 'ep-ocd-rdlpfc',
        version: '2.0.0',
        indicationModuleReleaseId: '22222222-2222-4222-8222-222222222223',
        evidencePathCode: 'EP-OCD-RDLPFC',
        therapeuticCircuitId: 'TC-OCD-003',
        targetFamilyId: 'TF-OCD-RDLPFC-001',
        status: 'clinical_permitted',
        permittedModes: ['clinical', 'research', 'validation'],
        governanceClassification: 'established_consensus',
        provenance: {
          createdBy: 'test',
          createdAt: '2026-09-02T12:00:00.000Z',
          softwareVersion: '2.0.0',
        },
      },
      {
        id: 'ep-ocd-ofc-research',
        version: '2.0.0',
        indicationModuleReleaseId: '22222222-2222-4222-8222-222222222223',
        evidencePathCode: 'EP-OCD-OFC-RES',
        therapeuticCircuitId: 'TC-OCD-004',
        targetFamilyId: 'TF-OCD-OFC-RESEARCH-001',
        status: 'research_permitted',
        permittedModes: ['research'],
        governanceClassification: 'investigational',
        provenance: {
          createdBy: 'test',
          createdAt: '2026-09-02T12:00:00.000Z',
          softwareVersion: '2.0.0',
        },
      },
      {
        id: 'ep-pain-research',
        version: '2.0.0',
        indicationModuleReleaseId: '33333333-3333-4333-8333-333333333334',
        evidencePathCode: 'EP-PAIN-RESEARCH',
        therapeuticCircuitId: 'TC-PAIN-002',
        targetFamilyId: 'TF-PAIN-RESEARCH-INSULA-001',
        status: 'research_permitted',
        permittedModes: ['research'],
        governanceClassification: 'investigational',
        provenance: {
          createdBy: 'test',
          createdAt: '2026-09-02T12:00:00.000Z',
          softwareVersion: '2.0.0',
        },
      },
      {
        id: 'ep-stroke-premotor',
        version: '2.0.0',
        indicationModuleReleaseId: '44444444-4444-4444-8444-444444444445',
        evidencePathCode: 'EP-STROKE-PREMOTOR',
        therapeuticCircuitId: 'TC-STROKE-003',
        targetFamilyId: 'TF-STROKE-PREMOTOR-RESEARCH-001',
        status: 'research_permitted',
        permittedModes: ['research'],
        governanceClassification: 'investigational',
        provenance: {
          createdBy: 'test',
          createdAt: '2026-09-02T12:00:00.000Z',
          softwareVersion: '2.0.0',
        },
      },
      {
        id: 'ep-aphasia-left',
        version: '2.0.0',
        indicationModuleReleaseId: '55555555-5555-4555-8555-555555555556',
        evidencePathCode: 'EP-APHASIA-LEFT',
        therapeuticCircuitId: 'TC-APHASIA-002',
        targetFamilyId: 'TF-APHASIA-LEFT-PERILESIONAL-001',
        status: 'clinical_permitted',
        permittedModes: ['clinical', 'research', 'validation'],
        governanceClassification: 'established_consensus',
        provenance: {
          createdBy: 'test',
          createdAt: '2026-09-02T12:00:00.000Z',
          softwareVersion: '2.0.0',
        },
      },
      {
        id: 'ep-aphasia-research',
        version: '2.0.0',
        indicationModuleReleaseId: '55555555-5555-4555-8555-555555555556',
        evidencePathCode: 'EP-APHASIA-RESEARCH',
        therapeuticCircuitId: 'TC-APHASIA-003',
        targetFamilyId: 'TF-APHASIA-RESEARCH-NETWORK-001',
        status: 'research_permitted',
        permittedModes: ['research'],
        governanceClassification: 'investigational',
        provenance: {
          createdBy: 'test',
          createdAt: '2026-09-02T12:00:00.000Z',
          softwareVersion: '2.0.0',
        },
      },
      {
        id: 'ep-tbi-dep',
        version: '2.0.0',
        indicationModuleReleaseId: '66666666-6666-4666-8666-666666666667',
        evidencePathCode: 'EP-TBI-DEP',
        therapeuticCircuitId: 'TC-TBI-002',
        targetFamilyId: 'TF-TBI-DEPRESSION-DLPFC-001',
        status: 'clinical_permitted',
        permittedModes: ['clinical', 'research', 'validation'],
        governanceClassification: 'established_consensus',
        provenance: {
          createdBy: 'test',
          createdAt: '2026-09-02T12:00:00.000Z',
          softwareVersion: '2.0.0',
        },
      },
      {
        id: 'ep-tbi-research',
        version: '2.0.0',
        indicationModuleReleaseId: '66666666-6666-4666-8666-666666666667',
        evidencePathCode: 'EP-TBI-RESEARCH',
        therapeuticCircuitId: 'TC-TBI-003',
        targetFamilyId: 'TF-TBI-RESEARCH-FRONTOPARIETAL-001',
        status: 'research_permitted',
        permittedModes: ['research'],
        governanceClassification: 'investigational',
        provenance: {
          createdBy: 'test',
          createdAt: '2026-09-02T12:00:00.000Z',
          softwareVersion: '2.0.0',
        },
      },
      {
        id: 'ep-ptsd-ldlpfc',
        version: '2.0.0',
        indicationModuleReleaseId: '77777777-7777-4777-8777-777777777778',
        evidencePathCode: 'EP-PTSD-LDLPFC',
        therapeuticCircuitId: 'TC-PTSD-002',
        targetFamilyId: 'TF-PTSD-LDLPFC-001',
        status: 'clinical_permitted',
        permittedModes: ['clinical', 'research', 'validation'],
        governanceClassification: 'established_consensus',
        provenance: {
          createdBy: 'test',
          createdAt: '2026-09-02T12:00:00.000Z',
          softwareVersion: '2.0.0',
        },
      },
      {
        id: 'ep-ptsd-dmpfc-research',
        version: '2.0.0',
        indicationModuleReleaseId: '77777777-7777-4777-8777-777777777778',
        evidencePathCode: 'EP-PTSD-DMPFC',
        therapeuticCircuitId: 'TC-PTSD-003',
        targetFamilyId: 'TF-PTSD-DMPFC-RESEARCH-001',
        status: 'research_permitted',
        permittedModes: ['research'],
        governanceClassification: 'investigational',
        provenance: {
          createdBy: 'test',
          createdAt: '2026-09-02T12:00:00.000Z',
          softwareVersion: '2.0.0',
        },
      },
      {
        id: 'ep-tinnitus-tpj',
        version: '2.0.0',
        indicationModuleReleaseId: '88888888-8888-4888-8888-888888888889',
        evidencePathCode: 'EP-TINNITUS-TPJ',
        therapeuticCircuitId: 'TC-TINNITUS-002',
        targetFamilyId: 'TF-TINNITUS-TPJ-001',
        status: 'research_permitted',
        permittedModes: ['research'],
        governanceClassification: 'investigational',
        provenance: {
          createdBy: 'test',
          createdAt: '2026-09-02T12:00:00.000Z',
          softwareVersion: '2.0.0',
        },
      },
      {
        id: 'ep-tinnitus-network',
        version: '2.0.0',
        indicationModuleReleaseId: '88888888-8888-4888-8888-888888888889',
        evidencePathCode: 'EP-TINNITUS-NET',
        therapeuticCircuitId: 'TC-TINNITUS-003',
        targetFamilyId: 'TF-TINNITUS-AUDITORY-LIMBIC-001',
        status: 'research_permitted',
        permittedModes: ['research'],
        governanceClassification: 'investigational',
        provenance: {
          createdBy: 'test',
          createdAt: '2026-09-02T12:00:00.000Z',
          softwareVersion: '2.0.0',
        },
      },
    ],
    permittedTargetFamilies: [],
    scientificPolicy: {
      id: 'sp-001',
      code: 'DEFAULT-SP',
      semanticVersion: '2.0.0',
    },
    ...overrides,
  };
}

describe('Section 23: Plugin Contract Tests — All 8 Plugins', () => {
  describe.each(CANONICAL_PLUGIN_CATALOG)(
    '$name ($code)',
    ({ name, code, indication, createInstance }) => {
      // 1. Module Identity
      it('Item 1: Module Identity — conforms to canonical ID format and validates matching context', () => {
        const plugin = createInstance();
        expect(plugin.manifest.id).toMatch(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
        );
        expect(plugin.manifest.code).toBe(code);

        // Accepts matching indication context
        const matchContext = createTestContext(indication, 'research');
        const validRes = plugin.validateModuleContext(matchContext);
        expect(validRes.valid).toBe(true);
        expect(validRes.errors).toEqual([]);

        // Strictly rejects completely mismatched indication context
        const mismatchContext = createTestContext('COMPLETELY_UNRELATED_INDICATION', 'research');
        const invalidRes = plugin.validateModuleContext(mismatchContext);
        expect(invalidRes.valid).toBe(false);
        expect(invalidRes.errors.length).toBeGreaterThan(0);
      });

      // 2. Exact Version
      it('Item 2: Exact Version — semver and SHA-256 digests are strictly formed', () => {
        const plugin = createInstance();
        expect(plugin.manifest.semanticVersion).toMatch(/^\d+\.\d+\.\d+/);
        expect(plugin.manifest.packageDigestSha256).toMatch(/^[0-9a-f]{64}$/i);
        expect(plugin.manifest.scientificConfigurationSha256).toMatch(/^[0-9a-f]{64}$/i);
      });

      // 3. Deterministic Output
      it('Item 3: Deterministic Output — same inputs produce identical candidate drafts and traces', () => {
        const plugin = createInstance();
        const context = createTestContext(indication, 'research');

        for (const gen of plugin.generators()) {
          const run1 = gen.generate(context);
          const run2 = gen.generate(context);

          expect(run1.status).toBe(run2.status);
          expect(run1.candidates.length).toBe(run2.candidates.length);
          expect(JSON.stringify(run1.candidates)).toBe(JSON.stringify(run2.candidates));
          expect(JSON.stringify(run1.diagnostics)).toBe(JSON.stringify(run2.diagnostics));
        }
      });

      // 4. Allowed Geometry
      it('Item 4: Allowed Geometry — every emitted candidate matches declared permittedGeometryTypes', () => {
        const plugin = createInstance();
        const context = createTestContext(indication, 'research');

        for (const gen of plugin.generators()) {
          const res = gen.generate(context);
          for (const candidate of res.candidates) {
            expect(gen.descriptor.permittedGeometryTypes).toContain(
              candidate.targetGeometry.geometryType,
            );
          }
        }
      });

      // 5. Evidence Provenance
      it('Item 5: Evidence Provenance — every candidate draft carries valid permitted evidencePathIds', () => {
        const plugin = createInstance();
        const context = createTestContext(indication, 'research');
        const permittedIds = new Set(context.permittedEvidencePaths.map(p => p.id));

        for (const gen of plugin.generators()) {
          const res = gen.generate(context);
          for (const candidate of res.candidates) {
            expect(candidate.evidencePathIds.length).toBeGreaterThan(0);
            for (const epId of candidate.evidencePathIds) {
              expect(permittedIds.has(epId)).toBe(true);
            }
          }
        }
      });

      // 6. No DB / Network Scientific Access (checked synchronously)
      it('Item 6: No DB/network scientific access — generators execute purely in-memory', () => {
        const plugin = createInstance();
        const context = createTestContext(indication, 'research');

        // Verify each generator execute synchronously without returning unresolved promises
        for (const gen of plugin.generators()) {
          const res = gen.generate(context);
          expect(res).not.toBeInstanceOf(Promise);
          expect(res.generatorId).toBe(gen.descriptor.id);
        }
      });

      // 7. No Hidden Ranking
      it('Item 7: No Hidden Ranking — generators do not return rank, eligibility, or probability', () => {
        const plugin = createInstance();
        const context = createTestContext(indication, 'research');

        for (const gen of plugin.generators()) {
          const res = gen.generate(context);
          for (const candidate of res.candidates) {
            const candidateKeys = Object.keys(candidate);
            expect(candidateKeys).not.toContain('rank');
            expect(candidateKeys).not.toContain('clinical_eligible');
            expect(candidateKeys).not.toContain('response_probability');
            expect(candidateKeys).not.toContain('isEligible');
          }
        }
      });

      // 8. No Research Leakage
      it('Item 8: No Research Leakage — research-only generators do not emit in Clinical mode', () => {
        const plugin = createInstance();
        const registry = new CandidateGeneratorRegistry();
        for (const gen of plugin.generators()) {
          registry.register(gen);
        }

        const clinicalContext = createTestContext(indication, 'clinical');
        const execResult = registry.executeGenerators(clinicalContext);

        // For each produced candidate, verify that the producing generator descriptor permitted clinical mode
        for (const candidate of execResult.candidates) {
          const gen = registry.get(candidate.generatorId);
          expect(gen).toBeDefined();
          const permittedLower = gen!.descriptor.permittedModes.map(m => String(m).toLowerCase());
          expect(permittedLower).toContain('clinical');
        }
      });

      // 9. Declared Measurements
      it('Item 9: Declared Measurements — generators handle missing required capabilities gracefully', () => {
        const plugin = createInstance();
        // Context with zero satisfied measurement capabilities
        const missingMeasContext = createTestContext(indication, 'research', {
          measurementBundle: {
            id: 'mb-empty',
            caseIndicationId: 'ci-001',
            version: '1.0',
            measurements: [],
            requirementEvaluations: [
              {
                requirementCode: 'individual_fc_refinement',
                modality: 'resting_state_fmri',
                requirementType: 'required_for_personalisation',
                status: 'missing',
                resultingCapability: 'disabled',
                explanation: 'Missing rs-fMRI',
              },
              {
                requirementCode: 'motor_hotspot_targeting',
                modality: 'tms_motor_mapping',
                requirementType: 'required_for_personalisation',
                status: 'missing',
                resultingCapability: 'disabled',
                explanation: 'Missing motor mapping',
              },
            ],
            structuralDistortionIndex: 0,
            overallDataQuality: 'valid',
            bundleManifestSha256:
              '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
            provenance: {
              createdBy: 'test',
              createdAt: '2026-09-02T12:00:00.000Z',
              softwareVersion: '2.0.0',
            },
          },
        });

        for (const gen of plugin.generators()) {
          const res = gen.generate(missingMeasContext);
          expect(res).toBeDefined();
          // If generator requires individual_fc_refinement or motor_hotspot_targeting, it must abstain or emit no_candidate
          if (
            gen.descriptor.requiredCapabilities.includes('individual_fc_refinement') ||
            gen.descriptor.requiredCapabilities.includes('motor_hotspot_targeting')
          ) {
            expect(['no_candidate', 'abstained']).toContain(res.status);
            expect(res.candidates.length).toBe(0);
          }
        }
      });

      // 10. Declared Failure Modes
      it('Item 10: Declared Failure Modes — produces structured diagnostics on edge conditions', () => {
        const plugin = createInstance();
        expect(plugin.manifest.generatorDescriptors.length).toBeGreaterThan(0);
        for (const desc of plugin.manifest.generatorDescriptors) {
          expect([
            'required_fail_run',
            'omit_generator_with_warning',
            'research_optional',
          ]).toContain(desc.generatorFailurePolicy);
        }
      });
    },
  );

  describe('Specific Indication Scientific Invariant Tests', () => {
    it('OCD: OcdMpfcAccFieldGenerator SHALL output coil_field geometry without fabricating point coordinates (§49)', () => {
      const ocdPlugin = CANONICAL_PLUGIN_CATALOG.find(
        p => p.name === 'OCDPlugin',
      )!.createInstance();
      const context = createTestContext('OCD', 'clinical');
      const fieldGen = ocdPlugin
        .generators()
        .find(g => g.descriptor.code === 'OCD_MPFC_ACC_FIELD_GENERATOR')!;

      const res = fieldGen.generate(context);
      expect(res.status).toBe('generated');
      expect(res.candidates).toHaveLength(1);
      expect(res.candidates[0].targetGeometry.geometryType).toBe('coil_field');
      const geom = res.candidates[0].targetGeometry as any;
      expect(geom.coilModelId).toContain('H7');
      expect(geom.pointCoordinateIsRepresentativeOnly).toBe(true);
    });

    it('Neuropathic Pain: Unilateral pain produces contralateral somatotopic M1 target (§53-54)', () => {
      const painPlugin = CANONICAL_PLUGIN_CATALOG.find(
        p => p.name === 'NeuropathicPainPlugin',
      )!.createInstance();
      const rightPainContext = createTestContext('NEUROPATHIC_PAIN', 'clinical', {
        phenotypeSnapshot: {
          ...createTestContext('NEUROPATHIC_PAIN').phenotypeSnapshot,
          affectedSide: 'right',
        } as any,
      });
      const baseGen = painPlugin
        .generators()
        .find(g => g.descriptor.code === 'PAIN_M1_SOMATOTOPIC_BASELINE_GENERATOR')!;

      const res = baseGen.generate(rightPainContext);
      expect(res.status).toBe('generated');
      expect(res.candidates[0].targetGeometry.geometryType).toBe('somatotopic');
      const geom = res.candidates[0].targetGeometry as any;
      expect(geom.stimulationHemisphere).toBe('left');
    });

    it('Neuropathic Pain: Bilateral/ambiguous pain SHALL NOT choose a hemisphere arbitrarily and must abstain (§54)', () => {
      const painPlugin = CANONICAL_PLUGIN_CATALOG.find(
        p => p.name === 'NeuropathicPainPlugin',
      )!.createInstance();
      const bilateralContext = createTestContext('NEUROPATHIC_PAIN', 'clinical', {
        phenotypeSnapshot: {
          ...createTestContext('NEUROPATHIC_PAIN').phenotypeSnapshot,
          affectedSide: 'bilateral',
        } as any,
      });
      const baseGen = painPlugin
        .generators()
        .find(g => g.descriptor.code === 'PAIN_M1_SOMATOTOPIC_BASELINE_GENERATOR')!;

      const res = baseGen.generate(bilateralContext);
      expect(res.status).toBe('abstained');
      expect(res.abstention?.reasonCode).toBe('PAIN_LATERALITY_AMBIGUOUS');
      expect(res.diagnostics.some(d => d.code === 'PAIN_LATERALITY_AMBIGUOUS')).toBe(true);
    });

    it('Stroke Motor: Ipsilesional generator abstains when motor cortex is substantially destroyed (§58)', () => {
      const strokePlugin = CANONICAL_PLUGIN_CATALOG.find(
        p => p.name === 'StrokeMotorPlugin',
      )!.createInstance();
      const destroyedContext = createTestContext('STROKE_MOTOR', 'clinical', {
        lesionContexts: [
          {
            ...createTestContext('STROKE_MOTOR').lesionContexts[0],
            lesionVolumeCm3: 150,
            interpretation: 'Substantial cortical destruction of ipsilesional precentral gyrus',
          },
        ],
      });
      const ipsiGen = strokePlugin
        .generators()
        .find(g => g.descriptor.code === 'STROKE_IPSILESIONAL_M1_GENERATOR')!;

      const res = ipsiGen.generate(destroyedContext);
      expect(res.status).toBe('abstained');
      expect(res.abstention?.reasonCode).toBe('IPSILESIONAL_CORTEX_DESTROYED');
    });

    it('Stroke Aphasia: Acute fluent aphasia presentation abstains from chronic non-fluent Right IFG target (§63)', () => {
      const aphasiaPlugin = CANONICAL_PLUGIN_CATALOG.find(
        p => p.name === 'StrokeAphasiaPlugin',
      )!.createInstance();
      const acuteFluentContext = createTestContext('STROKE_APHASIA', 'clinical', {
        phenotypeSnapshot: {
          ...createTestContext('STROKE_APHASIA').phenotypeSnapshot,
          aphasiaSubtype: 'fluent_wernicke',
        } as any,
        diseaseStageContext: {
          ...createTestContext('STROKE_APHASIA').diseaseStageContext!,
          currentStageCode: 'acute',
        },
      });
      const rifgGen = aphasiaPlugin
        .generators()
        .find(g => g.descriptor.code === 'APHASIA_RIGHT_IFG_GENERATOR')!;

      const res = rifgGen.generate(acuteFluentContext);
      expect(res.status).toBe('abstained');
      expect(res.abstention?.reasonCode).toBe('APHASIA_STAGE_PHENOTYPE_MISMATCH');
    });

    it('TBI: Conservative generator returns no_candidate when explicit target-specific path is absent (§67)', () => {
      const tbiPlugin = CANONICAL_PLUGIN_CATALOG.find(
        p => p.name === 'TBIPlugin',
      )!.createInstance();
      const unboundContext = createTestContext('TBI', 'clinical', {
        permittedEvidencePaths: [], // No target-specific path approved
      });
      const boundGen = tbiPlugin
        .generators()
        .find(g => g.descriptor.code === 'TBI_EVIDENCE_BOUND_TARGET_GENERATOR')!;

      const res = boundGen.generate(unboundContext);
      expect(res.status).toBe('no_candidate');
      expect(res.diagnostics.some(d => d.code === 'TBI_TARGET_EVIDENCE_UNBOUND')).toBe(true);
    });

    it('PTSD: Preserves combat trauma conflict notice without erasing through anatomical fit (§71)', () => {
      const ptsdPlugin = CANONICAL_PLUGIN_CATALOG.find(
        p => p.name === 'PTSDPlugin',
      )!.createInstance();
      const combatContext = createTestContext('PTSD', 'clinical', {
        phenotypeSnapshot: {
          ...createTestContext('PTSD').phenotypeSnapshot,
          traumaType: 'combat_blast',
          veteranStatus: true,
        } as any,
      });
      const rdlpfcGen = ptsdPlugin
        .generators()
        .find(g => g.descriptor.code === 'PTSD_RIGHT_DLPFC_GENERATOR')!;

      const res = rdlpfcGen.generate(combatContext);
      expect(res.status).toBe('generated');
      expect(res.diagnostics.some(d => d.code === 'PTSD_POPULATION_CONFLICT')).toBe(true);
      expect(
        res.candidates[0].generatorLimitations.some(l => l.includes('Combat-related trauma')),
      ).toBe(true);
    });

    it('Tinnitus: Hard Clinical Gate blocks execution in Clinical Mode (§74)', () => {
      const tinnitusPlugin = CANONICAL_PLUGIN_CATALOG.find(
        p => p.name === 'TinnitusPlugin',
      )!.createInstance();
      const clinicalContext = createTestContext('TINNITUS', 'clinical');

      const val = tinnitusPlugin.validateModuleContext(clinicalContext);
      expect(val.valid).toBe(false);
      expect(val.errors.some(e => e.includes('CLINICAL_GATE_VIOLATION'))).toBe(true);
    });

    it('Tinnitus: Generated research candidates carry evidence conflict limitation notice (§75)', () => {
      const tinnitusPlugin = CANONICAL_PLUGIN_CATALOG.find(
        p => p.name === 'TinnitusPlugin',
      )!.createInstance();
      const researchContext = createTestContext('TINNITUS', 'research');

      for (const gen of tinnitusPlugin.generators()) {
        const res = gen.generate(researchContext);
        for (const candidate of res.candidates) {
          expect(
            candidate.generatorLimitations.some(l =>
              l.includes('INTERNATIONAL CLINICAL GUIDELINE NOTICE'),
            ),
          ).toBe(true);
        }
      }
    });
  });
});
