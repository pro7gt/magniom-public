/**
 * @magniom/test-fixtures - Phase 5 Post-Traumatic Stress Disorder (PTSD) Golden Suite Fixtures (Roadmap §39, PTSD01–PTSD07)
 */

import { PTSD_MODULE_RELEASE_ID } from '@magniom/target-engine';
import {
  type SyntheticGoldenCaseDefinition,
  createMockPhenotypeSnapshot,
  createMockClinicalObjective,
  createMockMeasurementBundle,
  createMockEvidencePath,
} from './fixture-builders.js';

function createBasePtsdInput(
  caseId: string,
  options?: {
    customFields?: Record<string, unknown>;
    overrides?: Partial<import('@magniom/target-engine').SyntheticVerticalSliceInput>;
  },
): import('@magniom/target-engine').SyntheticVerticalSliceInput {
  const phenotypeSnapshot = createMockPhenotypeSnapshot({
    id: `ps-${caseId}`,
    primaryDiagnosis: 'Chronic Treatment-Resistant Post-Traumatic Stress Disorder',
    customFields: {
      pcl5TotalScore: 58,
      hyperarousalSubscore: 22,
      ...(options?.customFields ?? {}),
    },
  });

  const clinicalObjectives = [
    createMockClinicalObjective({
      id: `obj-${caseId}-ptsd-hyperarousal`,
      caseIndicationId: `ci-${caseId}`,
      code: 'OBJ-PTSD-HYPERAROUSAL',
      display: 'Reduction in Hyperarousal and Intrusive Re-experiencing Symptoms',
    }),
  ];

  const measurementBundle = createMockMeasurementBundle({
    id: `mb-${caseId}`,
    caseId,
    caseIndicationId: `ci-${caseId}`,
    indicationModuleReleaseId: PTSD_MODULE_RELEASE_ID,
    phenotypeSnapshotId: phenotypeSnapshot.id,
  });

  const authorizedEvidencePaths = [
    createMockEvidencePath({
      id: 'EP-PTSD-RIGHT-DLPFC-001',
      indicationModuleReleaseId: PTSD_MODULE_RELEASE_ID,
      targetFamilyId: 'TF-PTSD-RDLPFC-001',
      clinicalObjectiveId: clinicalObjectives[0]!.id,
      targetGeometryType: 'point',
    }),
  ];

  return {
    caseId,
    caseIndicationId: `ci-${caseId}`,
    indicationCode: 'PTSD',
    mode: 'clinical',
    clinicalContext: {
      phenotypeSnapshot,
    },
    clinicalObjectives,
    measurementBundle,
    authorizedEvidencePaths,
    ...(options?.overrides ?? {}),
  };
}

export const PTSD_GOLDEN_SUITE: readonly SyntheticGoldenCaseDefinition[] = [
  // PTSD01: General PTSD target path
  {
    id: 'PTSD01',
    name: 'General PTSD Right DLPFC 1Hz Inhibitory Target',
    indicationCode: 'PTSD',
    section: '§39',
    description: 'Generates Right DLPFC 1Hz inhibitory candidate for core hyperarousal symptoms.',
    input: createBasePtsdInput('ptsd01'),
    decisionIntent: {
      clinicianId: 'clinician-ptsd-01',
      decisionType: 'ACCEPTED_PRIMARY',
      selectedCandidateIds: ['cand-ptsd-rdlpfc-point'],
      overallReasoning:
        'Accepting Right DLPFC 1Hz inhibitory protocol for severe hyperarousal and intrusive re-experiencing.',
      magniomInfluence: 'major',
    },
    expected: {
      primaryCandidateCount: 1,
      expectedPrimaryFamilies: ['TF-PTSD-RDLPFC-001'],
      expectedGeometries: ['point'],
    },
  },

  // PTSD02: Combat-population applicability limitation
  {
    id: 'PTSD02',
    name: 'Combat Trauma Population Applicability Limitation',
    indicationCode: 'PTSD',
    section: '§39',
    description:
      'Veteran combat trauma context triggers prominent applicability limitation based on negative VA trial evidence.',
    input: createBasePtsdInput('ptsd02', {
      customFields: {
        traumaType: 'combat_blast_exposure',
        veteranStatus: true,
      },
    }),
    expected: {
      primaryCandidateCount: 1,
      expectedPrimaryFamilies: ['TF-PTSD-RDLPFC-001'],
    },
  },

  // PTSD03: Right-vs-left target evidence distinction
  {
    id: 'PTSD03',
    name: 'Right vs Left Target Evidence Distinction',
    indicationCode: 'PTSD',
    section: '§39',
    description:
      'Right DLPFC 1Hz inhibitory and Left DLPFC 10Hz excitatory presented as distinct competing hypotheses.',
    input: createBasePtsdInput('ptsd03'),
    expected: {
      primaryCandidateCount: 1,
      expectedPrimaryFamilies: ['TF-PTSD-RDLPFC-001'],
    },
  },

  // PTSD04: MDD evidence inheritance prohibited
  {
    id: 'PTSD04',
    name: 'MDD Evidence Inheritance Prohibited',
    indicationCode: 'PTSD',
    section: '§39',
    description:
      'System prevents unverified inheritance of MDD Left DLPFC depression prior into PTSD clinical targeting.',
    input: createBasePtsdInput('ptsd04'),
    expected: {
      primaryCandidateCount: 1,
      expectedPrimaryFamilies: ['TF-PTSD-RDLPFC-001'],
    },
  },

  // PTSD05: Research connectome refinement
  {
    id: 'PTSD05',
    name: 'Research Amygdala-DLPFC Connectome Refinement',
    indicationCode: 'PTSD',
    section: '§39',
    description:
      'Amygdala-DLPFC functional connectivity candidate generated strictly in Research Mode.',
    input: createBasePtsdInput('ptsd05', { overrides: { mode: 'research' } }),
    expected: {
      primaryCandidateCount: 1,
    },
  },

  // PTSD06: Conflicting evidence visible
  {
    id: 'PTSD06',
    name: 'Conflicting Meta-Analytic Trials Visible in Drawer',
    indicationCode: 'PTSD',
    section: '§39',
    description:
      'Evidence Drawer renders balanced display of positive civilian trauma trials vs Kozel 2018 VA negative trial.',
    input: createBasePtsdInput('ptsd06'),
    expected: {
      primaryCandidateCount: 1,
    },
  },

  // PTSD07: No target (Complete Abstention)
  {
    id: 'PTSD07',
    name: 'No Target (Complete Abstention for Severe Dissociation Contraindication)',
    indicationCode: 'PTSD',
    section: '§39',
    description:
      'Severe dissociative symptoms or clinical psychiatric contraindications force complete abstention.',
    input: createBasePtsdInput('ptsd07', {
      overrides: { authorizedEvidencePaths: [] },
    }),
    expected: {
      shouldAbstain: true,
    },
  },
];
