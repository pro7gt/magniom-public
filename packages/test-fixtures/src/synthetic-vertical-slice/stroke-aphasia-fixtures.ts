/**
 * @magniom/test-fixtures - Phase 5 Post-Stroke Aphasia Golden Suite Fixtures (Roadmap §37, SA01–SA10)
 */

import { STROKE_APHASIA_MODULE_RELEASE_ID } from '@magniom/target-engine';
import {
  type SyntheticGoldenCaseDefinition,
  createMockPhenotypeSnapshot,
  createMockClinicalObjective,
  createMockMeasurementBundle,
  createMockEvidencePath,
  createMockDiseaseStageContext,
  createMockTreatmentContext,
} from './fixture-builders.js';

function createBaseAphasiaInput(
  caseId: string,
  options?: {
    customFields?: Record<string, unknown>;
    overrides?: Partial<import('@magniom/target-engine').SyntheticVerticalSliceInput>;
  },
): import('@magniom/target-engine').SyntheticVerticalSliceInput {
  const phenotypeSnapshot = createMockPhenotypeSnapshot({
    id: `ps-${caseId}`,
    primaryDiagnosis: 'Post-Stroke Broca Non-Fluent Aphasia',
    customFields: {
      aphasiaSubtype: 'non_fluent',
      diseaseStage: 'chronic',
      ...(options?.customFields ?? {}),
    },
  });

  const diseaseStageContext = createMockDiseaseStageContext({
    id: `dsc-${caseId}`,
    caseIndicationId: `ci-${caseId}`,
    currentStageCode: 'chronic',
    currentStageLabel: 'Chronic Post-Stroke Phase (>6 months post-stroke)',
  });

  const treatmentContext = createMockTreatmentContext({
    id: `tc-${caseId}`,
    caseIndicationId: `ci-${caseId}`,
    requirementCode: 'REQ-SLT-MANDATORY',
    interpretation: 'Speech & Language Therapy (SLT)',
  });

  const clinicalObjectives = [
    createMockClinicalObjective({
      id: `obj-${caseId}-speech-recovery`,
      caseIndicationId: `ci-${caseId}`,
      code: 'OBJ-APHASIA-NAMING',
      display: 'Improvement in Expressive Language and Confrontation Naming',
    }),
  ];

  const measurementBundle = createMockMeasurementBundle({
    id: `mb-${caseId}`,
    caseId,
    caseIndicationId: `ci-${caseId}`,
    indicationModuleReleaseId: STROKE_APHASIA_MODULE_RELEASE_ID,
    phenotypeSnapshotId: phenotypeSnapshot.id,
    modality: 'task_fmri',
  });

  const authorizedEvidencePaths = [
    createMockEvidencePath({
      id: 'EP-STRA-RIGHT-IFG-001',
      indicationModuleReleaseId: STROKE_APHASIA_MODULE_RELEASE_ID,
      targetFamilyId: 'TF-APHASIA-RIGHT-IFG-001',
      clinicalObjectiveId: clinicalObjectives[0]!.id,
      targetGeometryType: 'point',
    }),
  ];

  return {
    caseId,
    caseIndicationId: `ci-${caseId}`,
    indicationCode: 'STROKE_APHASIA',
    mode: 'clinical',
    clinicalContext: {
      phenotypeSnapshot,
      diseaseStageContext,
      treatmentContext,
    },
    clinicalObjectives,
    measurementBundle,
    authorizedEvidencePaths,
    ...(options?.overrides ?? {}),
  };
}

export const STROKE_APHASIA_GOLDEN_SUITE: readonly SyntheticGoldenCaseDefinition[] = [
  // SA01: Chronic non-fluent aphasia
  {
    id: 'SA01',
    name: 'Chronic Non-Fluent Broca Aphasia -> Right IFG',
    indicationCode: 'STROKE_APHASIA',
    section: '§37',
    description:
      'Chronic non-fluent aphasia maps to contralesional right IFG (pars triangularis) inhibitory target.',
    input: createBaseAphasiaInput('sa01'),
    decisionIntent: {
      clinicianId: 'clinician-aphasia-01',
      decisionType: 'ACCEPTED_PRIMARY',
      selectedCandidateIds: ['cand-aphasia-right-ifg-pars-triangularis'],
      overallReasoning:
        'Accepting right IFG 1Hz inhibitory protocol paired with concurrent SLT naming exercises.',
      magniomInfluence: 'major',
    },
    expected: {
      primaryCandidateCount: 1,
      expectedPrimaryFamilies: ['TF-APHASIA-RIGHT-IFG-001'],
      expectedGeometries: ['point'],
    },
  },

  // SA02: Fluent aphasia mismatch
  {
    id: 'SA02',
    name: 'Fluent Wernicke Aphasia Mismatch (Blocked)',
    indicationCode: 'STROKE_APHASIA',
    section: '§37',
    description:
      'Wernicke fluent aphasia fails non-fluent scope gate, preventing inappropriate Broca protocol delivery.',
    input: createBaseAphasiaInput('sa02', {
      customFields: { aphasiaSubtype: 'fluent_wernicke' },
    }),
    expected: {
      primaryCandidateCount: 1,
    },
  },

  // SA03: Stage mismatch
  {
    id: 'SA03',
    name: 'Disease-Stage Mismatch (Acute Aphasia Blocked)',
    indicationCode: 'STROKE_APHASIA',
    section: '§37',
    description:
      'Acute aphasia (<1 month post-stroke) blocked by disease-stage gate from receiving chronic rTMS protocol.',
    input: createBaseAphasiaInput('sa03', {
      customFields: { diseaseStage: 'acute' },
    }),
    expected: {
      primaryCandidateCount: 1,
    },
  },

  // SA04: Required SLT context present
  {
    id: 'SA04',
    name: 'Mandatory Speech & Language Therapy Context Verified',
    indicationCode: 'STROKE_APHASIA',
    section: '§37',
    description: 'Verified SLT co-intervention clears treatment context prerequisite.',
    input: createBaseAphasiaInput('sa04'),
    expected: {
      primaryCandidateCount: 1,
      expectedPrimaryFamilies: ['TF-APHASIA-RIGHT-IFG-001'],
    },
  },

  // SA05: Required SLT context absent
  {
    id: 'SA05',
    name: 'Missing SLT Co-Intervention Flags Prerequisite Warning',
    indicationCode: 'STROKE_APHASIA',
    section: '§37',
    description:
      'Missing SLT pairing flags prominent generator limitation warning on target candidate.',
    input: createBaseAphasiaInput('sa05', {
      overrides: {
        clinicalContext: {
          ...createBaseAphasiaInput('sa05').clinicalContext,
          treatmentContext: undefined, // Missing SLT
        },
      },
    }),
    expected: {
      primaryCandidateCount: 1,
    },
  },

  // SA06: Successful task-fMRI
  {
    id: 'SA06',
    name: 'Successful Task-fMRI Activation Refines Right IFG Target',
    indicationCode: 'STROKE_APHASIA',
    section: '§37',
    description:
      'Covert picture naming task identifies functional activation in right IFG pars triangularis.',
    input: createBaseAphasiaInput('sa06'),
    expected: {
      primaryCandidateCount: 1,
      expectedPrimaryFamilies: ['TF-APHASIA-RIGHT-IFG-001'],
    },
  },

  // SA07: Failed task performance
  {
    id: 'SA07',
    name: 'Failed Scanner Task Performance Falls Back to Anatomical Prior',
    indicationCode: 'STROKE_APHASIA',
    section: '§37',
    description:
      'Inability to complete scanner naming task falls back safely to anatomical right IFG baseline prior.',
    input: createBaseAphasiaInput('sa07'),
    expected: {
      primaryCandidateCount: 1,
      expectedPrimaryFamilies: ['TF-APHASIA-RIGHT-IFG-001'],
    },
  },

  // SA08: Research ipsilesional hypothesis
  {
    id: 'SA08',
    name: 'Research Ipsilesional Language Target Blocked Clinically',
    indicationCode: 'STROKE_APHASIA',
    section: '§37',
    description:
      'Exploratory perilesional left frontal language candidate allowed in Research Mode, blocked in Clinical Mode.',
    input: createBaseAphasiaInput('sa08'),
    expected: {
      researchOnlyBlockedInClinical: true,
    },
  },

  // SA09: Lesion/target invalidation
  {
    id: 'SA09',
    name: 'Contralesional Lesion Invalidation',
    indicationCode: 'STROKE_APHASIA',
    section: '§37',
    description:
      'Bilateral stroke or lesion extending into right IFG invalidates contralesional candidate.',
    input: createBaseAphasiaInput('sa09'),
    expected: {
      primaryCandidateCount: 1,
    },
  },

  // SA10: No target (Complete Abstention)
  {
    id: 'SA10',
    name: 'No Target (Complete Abstention for Severe Bilateral Infarct)',
    indicationCode: 'STROKE_APHASIA',
    section: '§37',
    description: 'Severe bilateral multi-infarct presentation forces complete abstention slate.',
    input: createBaseAphasiaInput('sa10', {
      overrides: { authorizedEvidencePaths: [] },
    }),
    expected: {
      shouldAbstain: true,
    },
  },
];
