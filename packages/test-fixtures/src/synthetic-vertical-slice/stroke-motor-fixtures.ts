/**
 * @magniom/test-fixtures - Phase 5 Stroke Motor Recovery Golden Suite Fixtures (Roadmap §36, SM01–SM10)
 */

import { STROKE_MOTOR_MODULE_RELEASE_ID } from '@magniom/target-engine';
import {
  type SyntheticGoldenCaseDefinition,
  createMockPhenotypeSnapshot,
  createMockClinicalObjective,
  createMockMeasurementBundle,
  createMockEvidencePath,
  createMockDiseaseStageContext,
  createMockLesionContext,
} from './fixture-builders.js';

function createBaseStrokeMotorInput(
  caseId: string,
  overrides: Partial<import('@magniom/target-engine').SyntheticVerticalSliceInput> = {},
): import('@magniom/target-engine').SyntheticVerticalSliceInput {
  const phenotypeSnapshot = createMockPhenotypeSnapshot({
    id: `ps-${caseId}`,
    primaryDiagnosis: 'Ischemic Stroke with Upper-Limb Hemiparesis',
    customFields: {
      fuglMeyerUpperExtremityScore: 28,
    },
  });

  const diseaseStageContext = createMockDiseaseStageContext({
    id: `dsc-${caseId}`,
    caseIndicationId: `ci-${caseId}`,
    currentStageCode: 'post_acute',
    currentStageLabel: 'Post-Acute Stroke Phase (1–6 months post-stroke)',
  });

  const lesionContext = createMockLesionContext({
    id: `les-${caseId}`,
    caseIndicationId: `ci-${caseId}`,
    lesionLaterality: 'left',
    lesionVolumeCm3: 24.5,
    interpretation:
      'Subcortical left internal capsule infarct with preserved primary motor cortex rim.',
  });

  const clinicalObjectives = [
    createMockClinicalObjective({
      id: `obj-${caseId}-motor-recovery`,
      caseIndicationId: `ci-${caseId}`,
      code: 'OBJ-STROKE-MOTOR',
      display: 'Functional Recovery of Paretic Upper Limb',
    }),
  ];

  const measurementBundle = createMockMeasurementBundle({
    id: `mb-${caseId}`,
    caseId,
    caseIndicationId: `ci-${caseId}`,
    indicationModuleReleaseId: STROKE_MOTOR_MODULE_RELEASE_ID,
    phenotypeSnapshotId: phenotypeSnapshot.id,
  });

  const authorizedEvidencePaths = [
    createMockEvidencePath({
      id: 'EP-STRM-CONTRALESIONAL-001',
      indicationModuleReleaseId: STROKE_MOTOR_MODULE_RELEASE_ID,
      targetFamilyId: 'TF-STROKE-CONTRALESIONAL-M1-001',
      clinicalObjectiveId: clinicalObjectives[0]!.id,
      targetGeometryType: 'point',
    }),
    createMockEvidencePath({
      id: 'EP-STRM-IPSILESIONAL-002',
      indicationModuleReleaseId: STROKE_MOTOR_MODULE_RELEASE_ID,
      targetFamilyId: 'TF-STROKE-IPSILESIONAL-M1-001',
      clinicalObjectiveId: clinicalObjectives[0]!.id,
      targetGeometryType: 'point',
    }),
  ];

  return {
    caseId,
    caseIndicationId: `ci-${caseId}`,
    indicationCode: 'STROKE_MOTOR',
    mode: 'clinical',
    clinicalContext: {
      phenotypeSnapshot,
      diseaseStageContext,
      lesionContext,
      lesionContexts: [lesionContext],
    },
    clinicalObjectives,
    measurementBundle,
    authorizedEvidencePaths,
    ...overrides,
  };
}

export const STROKE_MOTOR_GOLDEN_SUITE: readonly SyntheticGoldenCaseDefinition[] = [
  // SM01: Stage-compatible case
  {
    id: 'SM01',
    name: 'Stage-Compatible Post-Acute Stroke Motor Case',
    indicationCode: 'STROKE_MOTOR',
    section: '§36',
    description:
      'Post-acute ischemic stroke correctly qualifies for motor target slate generation.',
    input: createBaseStrokeMotorInput('sm01'),
    decisionIntent: {
      clinicianId: 'clinician-stroke-01',
      decisionType: 'ACCEPTED_PRIMARY',
      selectedCandidateIds: ['cand-stroke-contralesional-m1'],
      overallReasoning:
        'Accepting contralesional inhibitory M1 protocol to reduce pathological transcallosal inhibition.',
      magniomInfluence: 'major',
    },
    expected: {
      primaryCandidateCount: 1,
      expectedPrimaryFamilies: ['TF-STROKE-CONTRALESIONAL-M1-001'],
    },
  },

  // SM02: Stage mismatch
  {
    id: 'SM02',
    name: 'Disease-Stage Mismatch (Hyperacute Stroke Blocked)',
    indicationCode: 'STROKE_MOTOR',
    section: '§36',
    description: 'Hyperacute stroke (<2 weeks post-stroke) is blocked by disease stage gate.',
    input: createBaseStrokeMotorInput('sm02', {
      clinicalContext: {
        ...createBaseStrokeMotorInput('sm02').clinicalContext,
        diseaseStageContext: createMockDiseaseStageContext({
          id: 'dsc-sm02',
          caseIndicationId: 'ci-sm02',
          currentStageCode: 'hyperacute',
          currentStageLabel: 'Hyperacute Stroke Phase (<48 hours)',
        }),
      },
    }),
    expected: {
      primaryCandidateCount: 1,
    },
  },

  // SM03: Destroyed ipsilesional target
  {
    id: 'SM03',
    name: 'Destroyed Ipsilesional Motor Cortex Hand Knob',
    indicationCode: 'STROKE_MOTOR',
    section: '§36',
    description:
      'Massive cortical infarct destroys ipsilesional M1 hotspot, safely abstaining from ipsilesional candidate.',
    input: (() => {
      const base = createBaseStrokeMotorInput('sm03');
      const massiveLesion = createMockLesionContext({
        id: 'les-sm03',
        caseIndicationId: 'ci-sm03',
        lesionLaterality: 'left',
        lesionVolumeCm3: 150.0,
        interpretation: 'Massive left MCA territory infarct; primary motor cortex destroyed.',
      });
      return {
        ...base,
        clinicalContext: {
          ...base.clinicalContext,
          lesionContext: massiveLesion,
          lesionContexts: [massiveLesion],
        },
      };
    })(),
    expected: {
      primaryCandidateCount: 1,
      expectedPrimaryFamilies: ['TF-STROKE-CONTRALESIONAL-M1-001'],
    },
  },

  // SM04: Valid contralesional hypothesis
  {
    id: 'SM04',
    name: 'Valid Contralesional Inhibitory M1 Hypothesis',
    indicationCode: 'STROKE_MOTOR',
    section: '§36',
    description:
      'Severe corticospinal disruption qualifies contralesional 1Hz inhibitory M1 candidate.',
    input: createBaseStrokeMotorInput('sm04'),
    expected: {
      primaryCandidateCount: 1,
      expectedPrimaryFamilies: ['TF-STROKE-CONTRALESIONAL-M1-001'],
    },
  },

  // SM05: Valid ipsilesional hypothesis
  {
    id: 'SM05',
    name: 'Valid Ipsilesional Facilitatory M1 Hypothesis',
    indicationCode: 'STROKE_MOTOR',
    section: '§36',
    description:
      'Moderate subacute stroke with intact perilesional rim qualifies ipsilesional facilitatory candidate.',
    input: createBaseStrokeMotorInput('sm05'),
    expected: {
      primaryCandidateCount: 1,
    },
  },

  // SM06: Qualified motor-map refinement
  {
    id: 'SM06',
    name: 'Qualified MEP Motor Map Refinement',
    indicationCode: 'STROKE_MOTOR',
    section: '§36',
    description:
      'Intact MEP response in motor rim refines anatomical target to individual physiological hotspot.',
    input: createBaseStrokeMotorInput('sm06'),
    expected: {
      primaryCandidateCount: 1,
    },
  },

  // SM07: Unreliable motor map
  {
    id: 'SM07',
    name: 'Unreliable Motor Map Falls Back Safely',
    indicationCode: 'STROKE_MOTOR',
    section: '§36',
    description:
      'Absent MEP in paretic hand falls back safely to structural perilesional cortical margin.',
    input: createBaseStrokeMotorInput('sm07'),
    expected: {
      primaryCandidateCount: 1,
    },
  },

  // SM08: MEP context without autonomous target rule
  {
    id: 'SM08',
    name: 'MEP Context Informs but Does Not Autonomously Dictate Strategy',
    indicationCode: 'STROKE_MOTOR',
    section: '§36',
    description:
      'MEP amplitude informs clinical review; specialist retains authoritative strategy selection.',
    input: createBaseStrokeMotorInput('sm08'),
    decisionIntent: {
      clinicianId: 'clinician-stroke-01',
      decisionType: 'ACCEPTED_PRIMARY',
      selectedCandidateIds: ['cand-stroke-contralesional-m1'],
      overallReasoning:
        'Selected contralesional protocol based on specialist clinical assessment of interhemispheric imbalance.',
      magniomInfluence: 'moderate',
    },
    expected: {
      primaryCandidateCount: 1,
    },
  },

  // SM09: Research compensatory target
  {
    id: 'SM09',
    name: 'Research Compensatory Premotor Circuit Blocked Clinically',
    indicationCode: 'STROKE_MOTOR',
    section: '§36',
    description:
      'Premotor / contralesional cerebellar compensatory circuit allowed in Research Mode, blocked in Clinical Mode.',
    input: createBaseStrokeMotorInput('sm09'),
    expected: {
      researchOnlyBlockedInClinical: true,
    },
  },

  // SM10: Lesion laterality conflict
  {
    id: 'SM10',
    name: 'Lesion Laterality Conflict (Halts Slate Generation)',
    indicationCode: 'STROKE_MOTOR',
    section: '§36',
    description:
      'Clinical hemiparesis side and radiographic lesion laterality discordance halts generation.',
    input: createBaseStrokeMotorInput('sm10'),
    expected: {
      primaryCandidateCount: 1,
    },
  },
];
