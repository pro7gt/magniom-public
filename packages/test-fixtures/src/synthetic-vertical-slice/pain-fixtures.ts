/**
 * @magniom/test-fixtures - Phase 5 Neuropathic Pain Golden Suite Fixtures (Roadmap §35, P01–P08)
 */

import { PAIN_MODULE_RELEASE_ID } from '@magniom/target-engine';
import {
  type SyntheticGoldenCaseDefinition,
  createMockPhenotypeSnapshot,
  createMockClinicalObjective,
  createMockMeasurementBundle,
  createMockEvidencePath,
} from './fixture-builders.js';

function createBasePainInput(
  caseId: string,
  options?: {
    customFields?: Record<string, unknown>;
    overrides?: Partial<import('@magniom/target-engine').SyntheticVerticalSliceInput>;
  },
): import('@magniom/target-engine').SyntheticVerticalSliceInput {
  const phenotypeSnapshot = createMockPhenotypeSnapshot({
    id: `ps-${caseId}`,
    primaryDiagnosis: 'Chronic Refractory Peripheral Neuropathic Pain',
    customFields: {
      affectedSide: 'right',
      numericalPainRatingScale: 8,
      ...(options?.customFields ?? {}),
    },
  });

  const clinicalObjectives = [
    createMockClinicalObjective({
      id: `obj-${caseId}-pain-reduction`,
      caseIndicationId: `ci-${caseId}`,
      code: 'OBJ-PAIN-CORE',
      display: 'Significant Reduction in Neuropathic Pain Severity',
    }),
  ];

  const measurementBundle = createMockMeasurementBundle({
    id: `mb-${caseId}`,
    caseId,
    caseIndicationId: `ci-${caseId}`,
    indicationModuleReleaseId: PAIN_MODULE_RELEASE_ID,
    phenotypeSnapshotId: phenotypeSnapshot.id,
    modality: 'motor_evoked_potential',
  });

  const authorizedEvidencePaths = [
    createMockEvidencePath({
      id: 'EP-PAIN-M1-SOMATO-001',
      indicationModuleReleaseId: PAIN_MODULE_RELEASE_ID,
      targetFamilyId: 'TF-PAIN-M1-SOMATOTOPIC-001',
      clinicalObjectiveId: clinicalObjectives[0]!.id,
      targetGeometryType: 'somatotopic',
    }),
  ];

  return {
    caseId,
    caseIndicationId: `ci-${caseId}`,
    indicationCode: 'NEUROPATHIC_PAIN',
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

export const PAIN_GOLDEN_SUITE: readonly SyntheticGoldenCaseDefinition[] = [
  // P01: Unilateral hand pain
  {
    id: 'P01',
    name: 'Unilateral Right Hand Pain -> Contralateral Left M1',
    indicationCode: 'NEUROPATHIC_PAIN',
    section: '§35',
    description:
      'Right hand neuropathic pain correctly maps to contralateral left primary motor cortex hand knob somatotopic target.',
    input: createBasePainInput('pain-p01'),
    decisionIntent: {
      clinicianId: 'clinician-pain-01',
      decisionType: 'ACCEPTED_PRIMARY',
      selectedCandidateIds: ['cand-pain-m1-left-somatotopic'],
      overallReasoning:
        'Accepting Level A contralateral Left M1 hand knob target for severe right hand neuropathic pain.',
      magniomInfluence: 'major',
    },
    expected: {
      primaryCandidateCount: 1,
      expectedPrimaryFamilies: ['TF-PAIN-M1-SOMATOTOPIC-001'],
      expectedGeometries: ['somatotopic'],
    },
  },

  // P02: Unilateral lower-limb pain
  {
    id: 'P02',
    name: 'Unilateral Left Lower-Limb Pain -> Contralateral Right M1',
    indicationCode: 'NEUROPATHIC_PAIN',
    section: '§35',
    description:
      'Left lower limb neuropathic pain correctly maps to contralateral right medial primary motor cortex leg representation.',
    input: createBasePainInput('pain-p02', {
      customFields: { affectedSide: 'left' },
    }),
    decisionIntent: {
      clinicianId: 'clinician-pain-01',
      decisionType: 'ACCEPTED_PRIMARY',
      selectedCandidateIds: ['cand-pain-m1-right-somatotopic'],
      overallReasoning:
        'Accepting contralateral right M1 somatotopic target for left lower limb pain.',
      magniomInfluence: 'moderate',
    },
    expected: {
      primaryCandidateCount: 1,
      expectedPrimaryFamilies: ['TF-PAIN-M1-SOMATOTOPIC-001'],
      expectedGeometries: ['somatotopic'],
    },
  },

  // P03: Qualified motor-map refinement
  {
    id: 'P03',
    name: 'Qualified Motor-Map MEP Hotspot Refinement',
    indicationCode: 'NEUROPATHIC_PAIN',
    section: '§35',
    description:
      'High-reliability MEP motor mapping (reliability > 0.80) refines anatomical prior to individual physiological hotspot.',
    input: createBasePainInput('pain-p03'),
    expected: {
      primaryCandidateCount: 1,
      expectedPrimaryFamilies: ['TF-PAIN-M1-SOMATOTOPIC-001'],
    },
  },

  // P04: Unreliable motor mapping
  {
    id: 'P04',
    name: 'Unreliable Motor Mapping Falls Back to Anatomical Prior',
    indicationCode: 'NEUROPATHIC_PAIN',
    section: '§35',
    description:
      'Low-reliability MEP map falls back safely to anatomical M1 somatotopic baseline prior without crashing.',
    input: createBasePainInput('pain-p04'),
    expected: {
      primaryCandidateCount: 1,
      expectedPrimaryFamilies: ['TF-PAIN-M1-SOMATOTOPIC-001'],
    },
  },

  // P05: Bilateral pain ambiguity
  {
    id: 'P05',
    name: 'Bilateral Pain Ambiguity (Abstains from Arbitrary Lateralization)',
    indicationCode: 'NEUROPATHIC_PAIN',
    section: '§35',
    description:
      'Bilateral neuropathic pain presentation safely abstains from arbitrary unilateral hemisphere selection.',
    input: createBasePainInput('pain-p05', {
      customFields: { affectedSide: 'bilateral' },
    }),
    expected: {
      shouldAbstain: true,
      expectedAbstentionType: 'PAIN_LATERALITY_AMBIGUOUS',
    },
  },

  // P06: Body-region mismatch
  {
    id: 'P06',
    name: 'Body-Region Mismatch (Facial Pain Fails Hand/Leg Generators)',
    indicationCode: 'NEUROPATHIC_PAIN',
    section: '§35',
    description:
      'Trigeminal neuropathic pain fails limb somatotopic mapping, safely generating zero ungrounded candidates.',
    input: createBasePainInput('pain-p06', {
      overrides: { authorizedEvidencePaths: [] },
    }),
    expected: {
      shouldAbstain: true,
    },
  },

  // P07: Laterality error
  {
    id: 'P07',
    name: 'Laterality Error (Ipsilateral Stimulation Blocked by Gate)',
    indicationCode: 'NEUROPATHIC_PAIN',
    section: '§35',
    description:
      'Attempted generation of ipsilateral motor candidate is rejected by anatomical contralateral consistency gate.',
    input: createBasePainInput('pain-p07'),
    expected: {
      primaryCandidateCount: 1,
    },
  },

  // P08: No clinically useful second target
  {
    id: 'P08',
    name: 'No Clinically Useful Second Target (Single Primary 1 Output)',
    indicationCode: 'NEUROPATHIC_PAIN',
    section: '§35',
    description:
      'Neuropathic pain module outputs single verified Primary 1 candidate without fabricating a forced secondary target.',
    input: createBasePainInput('pain-p08'),
    expected: {
      primaryCandidateCount: 1,
      expectedPrimaryFamilies: ['TF-PAIN-M1-SOMATOTOPIC-001'],
    },
  },
];
