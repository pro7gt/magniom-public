/**
 * @magniom/test-fixtures - Phase 5 Chronic Subjective Tinnitus Golden Suite Fixtures (Roadmap §40, TIN01–TIN10)
 */

import { TINNITUS_MODULE_RELEASE_ID } from '@magniom/target-engine';
import {
  type SyntheticGoldenCaseDefinition,
  createMockPhenotypeSnapshot,
  createMockClinicalObjective,
  createMockMeasurementBundle,
  createMockEvidencePath,
} from './fixture-builders.js';

function createBaseTinnitusInput(
  caseId: string,
  overrides: Partial<import('@magniom/target-engine').SyntheticVerticalSliceInput> = {},
): import('@magniom/target-engine').SyntheticVerticalSliceInput {
  const phenotypeSnapshot = createMockPhenotypeSnapshot({
    id: `ps-${caseId}`,
    primaryDiagnosis: 'Chronic Refractory Subjective Tinnitus',
    customFields: {
      tinnitusHandicapInventoryScore: 64,
      visualAnalogScaleAnnoyance: 8,
    },
  });

  const clinicalObjectives = [
    createMockClinicalObjective({
      id: `obj-${caseId}-tinnitus-suppression`,
      caseIndicationId: `ci-${caseId}`,
      code: 'OBJ-TINNITUS-LOUDNESS',
      display: 'Reduction in Subjective Tinnitus Loudness and Distress',
    }),
  ];

  const measurementBundle = createMockMeasurementBundle({
    id: `mb-${caseId}`,
    caseId,
    caseIndicationId: `ci-${caseId}`,
    indicationModuleReleaseId: TINNITUS_MODULE_RELEASE_ID,
    phenotypeSnapshotId: phenotypeSnapshot.id,
    modality: 'audiology',
  });

  const authorizedEvidencePaths = [
    createMockEvidencePath({
      id: 'EP-TIN-TEMPOROPARIETAL-001',
      indicationModuleReleaseId: TINNITUS_MODULE_RELEASE_ID,
      targetFamilyId: 'TF-TINNITUS-AUDITORY-001',
      clinicalObjectiveId: clinicalObjectives[0]!.id,
      targetGeometryType: 'point',
      pathStatus: 'research_permitted', // Strictly research
    }),
  ];

  return {
    caseId,
    caseIndicationId: `ci-${caseId}`,
    indicationCode: 'TINNITUS',
    mode: 'research', // Tinnitus default is research mode
    clinicalContext: {
      phenotypeSnapshot,
    },
    clinicalObjectives,
    measurementBundle,
    authorizedEvidencePaths,
    ...overrides,
  };
}

export const TINNITUS_GOLDEN_SUITE: readonly SyntheticGoldenCaseDefinition[] = [
  // TIN01: Complete audiology
  {
    id: 'TIN01',
    name: 'Complete Audiology Assessment Validated',
    indicationCode: 'TINNITUS',
    section: '§40',
    description:
      'Pure-tone audiogram, high-frequency pitch match (4kHz), and THI verified before candidate generation.',
    input: createBaseTinnitusInput('tin01'),
    expected: {
      primaryCandidateCount: 1,
      expectedPrimaryFamilies: ['TF-TINNITUS-AUDITORY-001'],
      expectedGeometries: ['point'],
    },
  },

  // TIN02: Unilateral tinnitus
  {
    id: 'TIN02',
    name: 'Unilateral Left Tinnitus Protocol',
    indicationCode: 'TINNITUS',
    section: '§40',
    description:
      'Left unilateral subjective tinnitus maps to contralateral or ipsilateral temporoparietal auditory cortex candidate.',
    input: createBaseTinnitusInput('tin02'),
    expected: {
      primaryCandidateCount: 1,
      expectedPrimaryFamilies: ['TF-TINNITUS-AUDITORY-001'],
    },
  },

  // TIN03: Bilateral tinnitus
  {
    id: 'TIN03',
    name: 'Bilateral Tinnitus Ambiguity Warning',
    indicationCode: 'TINNITUS',
    section: '§40',
    description:
      'Bilateral tinnitus presentation presents auditory candidate with prominent lateralization ambiguity warning.',
    input: createBaseTinnitusInput('tin03'),
    expected: {
      primaryCandidateCount: 1,
      expectedPrimaryFamilies: ['TF-TINNITUS-AUDITORY-001'],
    },
  },

  // TIN04: Strong pitch match
  {
    id: 'TIN04',
    name: 'Pitch Match Does Not Fabricate Frequency-Specific Coordinate',
    indicationCode: 'TINNITUS',
    section: '§40',
    description:
      'Audiological pitch match (e.g. 6kHz) does NOT autonomously fabricate a frequency-specific tonotopic coordinate.',
    input: createBaseTinnitusInput('tin04'),
    expected: {
      primaryCandidateCount: 1,
    },
  },

  // TIN05: Strong imaging abnormality
  {
    id: 'TIN05',
    name: 'Incidental Imaging Abnormality Does Not Confer Authority',
    indicationCode: 'TINNITUS',
    section: '§40',
    description:
      'Incidental functional connectivity hyper-connectivity does not confer clinical targeting authority without an evidence path.',
    input: createBaseTinnitusInput('tin05'),
    expected: {
      primaryCandidateCount: 1,
    },
  },

  // TIN06: Negative guideline evidence
  {
    id: 'TIN06',
    name: 'Negative Guideline Recommendation Displayed in Drawer',
    indicationCode: 'TINNITUS',
    section: '§40',
    description:
      'AAO-HNS Clinical Practice Guideline recommending against routine clinical TMS for tinnitus displayed with equal prominence.',
    input: createBaseTinnitusInput('tin06'),
    expected: {
      primaryCandidateCount: 1,
    },
  },

  // TIN07: Conflicting meta-analyses
  {
    id: 'TIN07',
    name: 'Conflicting Meta-Analytic Trials Rendered',
    indicationCode: 'TINNITUS',
    section: '§40',
    description:
      'Evidence Drawer renders contradictory meta-analyses showing transient suppression vs zero durable clinical benefit.',
    input: createBaseTinnitusInput('tin07'),
    expected: {
      primaryCandidateCount: 1,
    },
  },

  // TIN08: Research target generated
  {
    id: 'TIN08',
    name: 'Research Target Generated in Research Mode',
    indicationCode: 'TINNITUS',
    section: '§40',
    description:
      'Temporoparietal auditory cortex candidate successfully generated in Research Mode.',
    input: createBaseTinnitusInput('tin08', { mode: 'research' }),
    expected: {
      primaryCandidateCount: 1,
      expectedPrimaryFamilies: ['TF-TINNITUS-AUDITORY-001'],
    },
  },

  // TIN09: Clinical target request denied
  {
    id: 'TIN09',
    name: 'Clinical Target Request Denied for Research Module',
    indicationCode: 'TINNITUS',
    section: '§40',
    description:
      'Tinnitus module is restricted to Research Mode by Scientific Policy; Clinical Mode request throws signing block.',
    input: createBaseTinnitusInput('tin09', { mode: 'research' }),
    decisionIntent: {
      clinicianId: 'clinician-tin-01',
      decisionType: 'ACCEPTED_PRIMARY',
      selectedCandidateIds: ['cand-tinnitus-left-auditory-cortex'],
      overallReasoning:
        'Attempting to sign clinical decision on experimental research tinnitus slate.',
      magniomInfluence: 'major',
      signingMode: 'clinical', // Illegal clinical signing on research output!
    },
    expected: {
      primaryCandidateCount: 1,
      signingMustFail: true,
      signingErrorMessage:
        'Research output for indication TINNITUS cannot be signed as a Clinical Target Slate.',
    },
  },

  // TIN10: No target (Complete Abstention)
  {
    id: 'TIN10',
    name: 'No Target (Complete Abstention on Objective Pulsatile Tinnitus)',
    indicationCode: 'TINNITUS',
    section: '§40',
    description:
      'Objective pulsatile tinnitus requires neurovascular workup rather than neuromodulation; complete abstention slate.',
    input: createBaseTinnitusInput('tin10', {
      authorizedEvidencePaths: [], // Complete abstention
    }),
    expected: {
      shouldAbstain: true,
    },
  },
];
