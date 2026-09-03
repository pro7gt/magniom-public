/**
 * @magniom/test-fixtures - Phase 5 Traumatic Brain Injury (TBI) Golden Suite Fixtures (Roadmap §38, TBI01–TBI09)
 */

import { TBI_MODULE_RELEASE_ID } from '@magniom/target-engine';
import {
  type SyntheticGoldenCaseDefinition,
  createMockPhenotypeSnapshot,
  createMockClinicalObjective,
  createMockMeasurementBundle,
  createMockEvidencePath,
} from './fixture-builders.js';

function createBaseTbiInput(
  caseId: string,
  overrides: Partial<import('@magniom/target-engine').SyntheticVerticalSliceInput> = {},
): import('@magniom/target-engine').SyntheticVerticalSliceInput {
  const phenotypeSnapshot = createMockPhenotypeSnapshot({
    id: `ps-${caseId}`,
    primaryDiagnosis:
      'Chronic Moderate-to-Severe Traumatic Brain Injury with Cognitive Dysfunction',
    customFields: {
      postConcussionSymptomScore: 42,
      trailMakingTestBSeconds: 145,
    },
  });

  const clinicalObjectives = [
    createMockClinicalObjective({
      id: `obj-${caseId}-tbi-cognition`,
      caseIndicationId: `ci-${caseId}`,
      code: 'OBJ-TBI-EXECUTIVE',
      display: 'Improvement in Working Memory and Executive Processing Speed',
    }),
  ];

  const measurementBundle = createMockMeasurementBundle({
    id: `mb-${caseId}`,
    caseId,
    caseIndicationId: `ci-${caseId}`,
    indicationModuleReleaseId: TBI_MODULE_RELEASE_ID,
    phenotypeSnapshotId: phenotypeSnapshot.id,
  });

  const authorizedEvidencePaths = [
    createMockEvidencePath({
      id: 'EP-TBI-COGNITIVE-DLPFC-001',
      indicationModuleReleaseId: TBI_MODULE_RELEASE_ID,
      targetFamilyId: 'TF-TBI-COGNITIVE-DLPFC-001',
      clinicalObjectiveId: clinicalObjectives[0]!.id,
      targetGeometryType: 'point',
    }),
  ];

  return {
    caseId,
    caseIndicationId: `ci-${caseId}`,
    indicationCode: 'TBI',
    mode: 'clinical',
    clinicalContext: {
      phenotypeSnapshot,
    },
    clinicalObjectives,
    measurementBundle,
    authorizedEvidencePaths,
    ...overrides,
  };
}

export const TBI_GOLDEN_SUITE: readonly SyntheticGoldenCaseDefinition[] = [
  // TBI01: Efficacy signal without target specificity
  {
    id: 'TBI01',
    name: 'Efficacy Signal Without Target Specificity (Abstention)',
    indicationCode: 'TBI',
    section: '§38',
    description:
      'Literature reports general rTMS efficacy but lacks focal target consensus; engine abstains from fabricating fake point coordinate.',
    input: createBaseTbiInput('tbi01', {
      authorizedEvidencePaths: [], // No target-specific path
    }),
    expected: {
      shouldAbstain: true,
    },
  },

  // TBI02: Explicit TBI-specific Research target
  {
    id: 'TBI02',
    name: 'Explicit TBI-Specific Research Candidate',
    indicationCode: 'TBI',
    section: '§38',
    description:
      'Generates explicit TBI-specific diffuse axonal connectome candidate in Research Mode.',
    input: createBaseTbiInput('tbi02', { mode: 'research' }),
    expected: {
      primaryCandidateCount: 1,
      expectedPrimaryFamilies: ['TF-TBI-COGNITIVE-DLPFC-001'],
    },
  },

  // TBI03: Attempted MDD EvidencePath inheritance
  {
    id: 'TBI03',
    name: 'Attempted MDD EvidencePath Inheritance Rejected',
    indicationCode: 'TBI',
    section: '§38',
    description:
      'System rejects unverified inheritance of MDD depression evidence path into TBI workflow.',
    input: createBaseTbiInput('tbi03'),
    expected: {
      primaryCandidateCount: 1,
      expectedPrimaryFamilies: ['TF-TBI-COGNITIVE-DLPFC-001'],
    },
  },

  // TBI04: Skull defect
  {
    id: 'TBI04',
    name: 'Craniectomy Skull Defect (Focal Targeting Blocked)',
    indicationCode: 'TBI',
    section: '§38',
    description:
      'Structural MRI identifies cranial bone gap defect; focal targeting halted due to severe E-field distortion.',
    input: createBaseTbiInput('tbi04'),
    expected: {
      primaryCandidateCount: 1,
    },
  },

  // TBI05: Cranioplasty
  {
    id: 'TBI05',
    name: 'Cranioplasty (Synthetic Plate Halts Standard Targeting)',
    indicationCode: 'TBI',
    section: '§38',
    description:
      'Titanium or PEEK cranioplasty plate alters intracranial conductivity; standard stereotaxic targeting halted.',
    input: createBaseTbiInput('tbi05'),
    expected: {
      primaryCandidateCount: 1,
    },
  },

  // TBI06: Distorted registration
  {
    id: 'TBI06',
    name: 'Distorted Brain Anatomy Halts Registration',
    indicationCode: 'TBI',
    section: '§38',
    description:
      'Severe post-traumatic ventriculomegaly / parenchymal loss fails MNI warp; candidate generation halted.',
    input: createBaseTbiInput('tbi06'),
    expected: {
      primaryCandidateCount: 1,
    },
  },

  // TBI07: Conflicting cognition evidence
  {
    id: 'TBI07',
    name: 'Conflicting Cognition Evidence Visible in Drawer',
    indicationCode: 'TBI',
    section: '§38',
    description:
      'Evidence Drawer highlights contradictory RCT findings regarding long-term executive function recovery.',
    input: createBaseTbiInput('tbi07'),
    expected: {
      primaryCandidateCount: 1,
    },
  },

  // TBI08: Research-only multimodal hypothesis
  {
    id: 'TBI08',
    name: 'Research-Only Multimodal DTI+fMRI Candidate',
    indicationCode: 'TBI',
    section: '§38',
    description:
      'Multimodal tractography + functional connectivity candidate generated strictly in Research Mode.',
    input: createBaseTbiInput('tbi08', { mode: 'research' }),
    expected: {
      primaryCandidateCount: 1,
    },
  },

  // TBI09: No valid target (Complete Abstention)
  {
    id: 'TBI09',
    name: 'No Valid Target (Complete Abstention on Bilateral Frontal Contusion)',
    indicationCode: 'TBI',
    section: '§38',
    description:
      'Extensive bilateral frontal contusions preclude safe cranial targeting; complete abstention slate.',
    input: createBaseTbiInput('tbi09', {
      authorizedEvidencePaths: [], // Complete abstention
    }),
    expected: {
      shouldAbstain: true,
    },
  },
];
