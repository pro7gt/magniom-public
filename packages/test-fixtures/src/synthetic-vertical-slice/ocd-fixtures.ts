/**
 * @magniom/test-fixtures - Phase 5 OCD Golden Suite Fixtures (Roadmap §34, O01–O08)
 */

import { OCD_MODULE_RELEASE_ID } from '@magniom/target-engine';
import {
  type SyntheticGoldenCaseDefinition,
  createMockPhenotypeSnapshot,
  createMockClinicalObjective,
  createMockMeasurementBundle,
  createMockEvidencePath,
  createMockTreatmentContext,
} from './fixture-builders.js';

function createBaseOcdInput(
  caseId: string,
  overrides: Partial<import('@magniom/target-engine').SyntheticVerticalSliceInput> = {},
): import('@magniom/target-engine').SyntheticVerticalSliceInput {
  const phenotypeSnapshot = createMockPhenotypeSnapshot({
    id: `ps-${caseId}`,
    primaryDiagnosis: 'Obsessive-Compulsive Disorder, Severe',
    customFields: {
      contaminationObsessions: 0.9,
      checkingCompulsions: 0.85,
    },
  });

  const clinicalObjectives = [
    createMockClinicalObjective({
      id: `obj-${caseId}-ocd-remission`,
      caseIndicationId: `ci-${caseId}`,
      code: 'OBJ-OCD-CORE',
      display: 'Reduction in Y-BOCS Obsessive-Compulsive Symptoms',
    }),
  ];

  const treatmentContext = createMockTreatmentContext({
    id: `tc-${caseId}`,
    caseIndicationId: `ci-${caseId}`,
    requirementCode: 'REQ-OCD-PROVOCATION',
    interpretation: 'Individualized Symptom Provocation',
  });

  const measurementBundle = createMockMeasurementBundle({
    id: `mb-${caseId}`,
    caseId,
    caseIndicationId: `ci-${caseId}`,
    indicationModuleReleaseId: OCD_MODULE_RELEASE_ID,
    phenotypeSnapshotId: phenotypeSnapshot.id,
  });

  const authorizedEvidencePaths = [
    createMockEvidencePath({
      id: 'EP-OCD-MPFC-ACC-001',
      indicationModuleReleaseId: OCD_MODULE_RELEASE_ID,
      targetFamilyId: 'TF-OCD-MPFC-ACC-001',
      clinicalObjectiveId: clinicalObjectives[0]!.id,
      targetGeometryType: 'coil_field',
    }),
    createMockEvidencePath({
      id: 'EP-OCD-PRESMA-002',
      indicationModuleReleaseId: OCD_MODULE_RELEASE_ID,
      targetFamilyId: 'TF-OCD-PRESMA-001',
      clinicalObjectiveId: clinicalObjectives[0]!.id,
      targetGeometryType: 'point',
    }),
  ];

  return {
    caseId,
    caseIndicationId: `ci-${caseId}`,
    indicationCode: 'OCD',
    mode: 'clinical',
    clinicalContext: {
      phenotypeSnapshot,
      treatmentContext,
    },
    clinicalObjectives,
    measurementBundle,
    authorizedEvidencePaths,
    ...overrides,
  };
}

export const OCD_GOLDEN_SUITE: readonly SyntheticGoldenCaseDefinition[] = [
  // O01: mPFC/ACC field target
  {
    id: 'O01',
    name: 'mPFC/ACC Deep-TMS Field Target',
    indicationCode: 'OCD',
    section: '§34',
    description:
      'Generates bilateral mPFC/ACC candidate with explicit coil_field geometry (BrainsWay H7).',
    input: createBaseOcdInput('ocd-o01'),
    decisionIntent: {
      clinicianId: 'clinician-ocd-01',
      decisionType: 'ACCEPTED_PRIMARY',
      selectedCandidateIds: ['cand-ocd-mpfc-acc-field'],
      overallReasoning:
        'Accepting FDA-cleared bilateral dACC/mPFC deep TMS coil-field target with concurrent symptom provocation.',
      magniomInfluence: 'moderate',
    },
    expected: {
      primaryCandidateCount: 1,
      expectedPrimaryFamilies: ['TF-OCD-MPFC-ACC-001'],
      expectedGeometries: ['coil_field'],
    },
  },

  // O02: Incompatible coil/device
  {
    id: 'O02',
    name: 'Incompatible Coil / Device Blocked',
    indicationCode: 'OCD',
    section: '§34',
    description:
      'Blocks focal figure-8 coil execution when deep mPFC/ACC field protocol is selected.',
    input: createBaseOcdInput('ocd-o02'),
    expected: {
      primaryCandidateCount: 1,
    },
  },

  // O03: pre-SMA/SMA alternative
  {
    id: 'O03',
    name: 'pre-SMA/SMA Clinical Alternative Candidate',
    indicationCode: 'OCD',
    section: '§34',
    description:
      'Generates valid supplementary motor area point/surface ROI alternative candidate for checking compulsions.',
    input: createBaseOcdInput('ocd-o03'),
    decisionIntent: {
      clinicianId: 'clinician-ocd-01',
      decisionType: 'SUBSTITUTED_ALTERNATIVE',
      selectedCandidateIds: ['cand-ocd-presma-point'],
      overallReasoning:
        'Selected pre-SMA alternative protocol for dominant motor checking compulsion phenotype.',
      magniomInfluence: 'major',
    },
    expected: {
      expectedPrimaryFamilies: ['TF-OCD-MPFC-ACC-001'],
    },
  },

  // O04: Field target cannot become point
  {
    id: 'O04',
    name: 'Field Target Cannot Become Point Coercion Rejected',
    indicationCode: 'OCD',
    section: '§34',
    description:
      'Target Engine strictly preserves coil_field geometry and refuses focal MNI point coercion.',
    input: createBaseOcdInput('ocd-o04'),
    expected: {
      expectedGeometries: ['coil_field'],
    },
  },

  // O05: Treatment-context mismatch
  {
    id: 'O05',
    name: 'Treatment-Context Mismatch (Missing Symptom Provocation)',
    indicationCode: 'OCD',
    section: '§34',
    description:
      'Deep-TMS OCD candidate requires explicit symptom provocation co-intervention; flags warning if missing.',
    input: createBaseOcdInput('ocd-o05', {
      clinicalContext: {
        phenotypeSnapshot: createBaseOcdInput('ocd-o05').clinicalContext.phenotypeSnapshot,
        treatmentContext: undefined, // Missing symptom provocation
      },
    }),
    expected: {
      primaryCandidateCount: 1,
    },
  },

  // O06: Research-only target
  {
    id: 'O06',
    name: 'Research-Only OFC Target Blocked in Clinical Mode',
    indicationCode: 'OCD',
    section: '§34',
    description:
      'Exploratory orbitofrontal cortex candidate is permitted in Research Mode but strictly blocked in Clinical Mode.',
    input: createBaseOcdInput('ocd-o06'),
    expected: {
      researchOnlyBlockedInClinical: true,
    },
  },

  // O07: Conflicting evidence visible
  {
    id: 'O07',
    name: 'Conflicting Meta-Analytic Evidence Visible',
    indicationCode: 'OCD',
    section: '§34',
    description:
      'Evidence Drawer prominently displays negative trials (non-navigated LF-TMS nulls) alongside positive dTMS data.',
    input: createBaseOcdInput('ocd-o07'),
    expected: {
      primaryCandidateCount: 1,
    },
  },

  // O08: No valid target (Complete Abstention)
  {
    id: 'O08',
    name: 'No Valid Target (Complete Abstention on Ferromagnetic Implant)',
    indicationCode: 'OCD',
    section: '§34',
    description:
      'Contraindicated cranial metallic implant forces complete abstention with zero valid candidates.',
    input: createBaseOcdInput('ocd-o08', {
      authorizedEvidencePaths: [], // Complete abstention
    }),
    expected: {
      shouldAbstain: true,
    },
  },
];
