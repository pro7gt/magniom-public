/**
 * @magniom/test-fixtures - Canonical Architecture Spec v2.0 Golden Cases (G20–G30)
 * Conforms directly to MAGNIOM-Multi-Indication Technical & Scientific Architecture Specification v2.0 Section 88.
 *
 * G20: Neuropathic hand pain (contralateral M1 somatotopic candidate, body-region mapping visible, no generic DLPFC)
 * G21: Bilateral neuropathic pain (laterality complexity visible, no arbitrary single-hemisphere answer)
 * G22: Subacute unilateral motor stroke (lesion side/stage visible, approved stroke strategies, no MDD leakage)
 * G23: Stroke with destroyed cortical candidate region (affected target suppressed, anatomy explanation)
 * G24: Post-stroke aphasia (language phenotype, SLT treatment-context evidence, separate aphasia module)
 * G25: OCD deep-TMS candidate (field/coil target, not misleading point coordinate)
 * G26: TBI depression with skull defect (Research Mode, abnormal E-field/anatomy warning, no routine clinical candidate)
 * G27: TBI cognitive hypothesis (Research only, frontoparietal hypothesis, no depression-target inheritance)
 * G28: Chronic tinnitus (prominent evidence conflict and negative evidence, Research Mode only, signing unavailable)
 * G29: MDD + neuropathic pain comorbidity (two indication contexts, no universal score, independent slates)
 * G30: Research/Clinical leakage attempt (hard rejection by kernel)
 */

import {
  MDD_MODULE_RELEASE_ID,
  PAIN_MODULE_RELEASE_ID,
  STROKE_MOTOR_MODULE_RELEASE_ID,
  STROKE_APHASIA_MODULE_RELEASE_ID,
  OCD_MODULE_RELEASE_ID,
  TBI_MODULE_RELEASE_ID,
  TINNITUS_MODULE_RELEASE_ID,
  type SyntheticVerticalSliceInput,
} from '@magniom/target-engine';
import {
  createMockPhenotypeSnapshot,
  createMockClinicalObjective,
  createMockMeasurementBundle,
  createMockEvidencePath,
  createMockDiseaseStageContext,
  createMockLesionContext,
  createMockTreatmentContext,
} from './synthetic-vertical-slice/fixture-builders.js';

export interface ArchitectureGoldenCaseDefinition {
  readonly id: string;
  readonly caseCode: string;
  readonly title: string;
  readonly section: string;
  readonly description: string;
  readonly input: SyntheticVerticalSliceInput;
  readonly secondaryInput?: SyntheticVerticalSliceInput | undefined; // For multi-indication comorbidity (G29)
  readonly expected: {
    readonly shouldAbstain?: boolean;
    readonly expectedAbstentionType?: string;
    readonly expectedAbstentionReasonCode?: string;
    readonly primaryCandidateCount?: number;
    readonly expectedPrimaryFamilies?: readonly string[];
    readonly expectedGeometries?: readonly string[];
    readonly expectedSuppressedCount?: number;
    readonly requiresResearchMode?: boolean;
    readonly clinicalSigningProhibited?: boolean;
    readonly hardRejectionExpected?: boolean;
    readonly comorbidityIndependentSlates?: boolean;
  };
}

// -------------------------------------------------------------
// G20 — Neuropathic hand pain (§88)
// -------------------------------------------------------------
export const G20_NEUROPATHIC_HAND_PAIN: ArchitectureGoldenCaseDefinition = {
  id: 'G20',
  caseCode: 'MGN-V2-G20',
  title: 'G20 — Neuropathic hand pain',
  section: '§88. G20',
  description:
    'Right-sided neuropathic hand pain. Expected: contralateral (left) M1 somatotopic candidate, body-region mapping visible, no generic DLPFC.',
  input: {
    caseId: 'case-g20-pain-hand',
    caseIndicationId: 'ci-g20-pain',
    indicationCode: 'NEUROPATHIC_PAIN',
    mode: 'validation',
    indicationModuleReleaseId: PAIN_MODULE_RELEASE_ID,
    clinicalContext: {
      phenotypeSnapshot: createMockPhenotypeSnapshot({
        id: 'ps-g20',
        primaryDiagnosis: 'Chronic Neuropathic Hand Pain (CRPS Type II)',
        customFields: {
          affectedSide: 'right',
          bodyRegion: 'upper_limb',
          functionalBodyRegion: 'hand',
          numericalPainRatingScale: 8,
        },
      }),
    },
    clinicalObjectives: [
      createMockClinicalObjective({
        id: 'obj-g20-pain',
        caseIndicationId: 'ci-g20-pain',
        code: 'OBJ-PAIN-REDUCE',
        display: 'Neuropathic Pain Severity Reduction',
      }),
    ],
    measurementBundle: createMockMeasurementBundle({
      id: 'mb-g20',
      caseId: 'case-g20-pain-hand',
      caseIndicationId: 'ci-g20-pain',
      indicationModuleReleaseId: PAIN_MODULE_RELEASE_ID,
      phenotypeSnapshotId: 'ps-g20',
      modality: 'motor_mapping',
    }),
    authorizedEvidencePaths: [
      createMockEvidencePath({
        id: 'EP-PAIN-M1-SOMATO-001',
        indicationModuleReleaseId: PAIN_MODULE_RELEASE_ID,
        targetFamilyId: 'TF-PAIN-M1-SOMATOTOPIC-001',
        clinicalObjectiveId: 'obj-g20-pain',
        targetGeometryType: 'somatotopic',
      }),
    ],
  },
  expected: {
    shouldAbstain: false,
    primaryCandidateCount: 1,
    expectedPrimaryFamilies: ['TF-PAIN-M1-SOMATOTOPIC-001'],
    expectedGeometries: ['somatotopic'],
  },
};

// -------------------------------------------------------------
// G21 — Bilateral neuropathic pain (§88)
// -------------------------------------------------------------
export const G21_BILATERAL_NEUROPATHIC_PAIN: ArchitectureGoldenCaseDefinition = {
  id: 'G21',
  caseCode: 'MGN-V2-G21',
  title: 'G21 — Bilateral neuropathic pain',
  section: '§88. G21',
  description:
    'Bilateral neuropathic pain. Expected: laterality complexity visible, no arbitrary single-hemisphere answer; engine abstains requiring clinical review.',
  input: {
    caseId: 'case-g21-pain-bilateral',
    caseIndicationId: 'ci-g21-pain',
    indicationCode: 'NEUROPATHIC_PAIN',
    mode: 'validation',
    indicationModuleReleaseId: PAIN_MODULE_RELEASE_ID,
    clinicalContext: {
      phenotypeSnapshot: createMockPhenotypeSnapshot({
        id: 'ps-g21',
        primaryDiagnosis: 'Bilateral Diabetic Neuropathy',
        customFields: {
          affectedSide: 'bilateral',
          bodyRegion: 'lower_limb',
          numericalPainRatingScale: 7,
        },
      }),
    },
    clinicalObjectives: [
      createMockClinicalObjective({
        id: 'obj-g21-pain',
        caseIndicationId: 'ci-g21-pain',
        code: 'OBJ-PAIN-REDUCE',
        display: 'Neuropathic Pain Severity Reduction',
      }),
    ],
    measurementBundle: createMockMeasurementBundle({
      id: 'mb-g21',
      caseId: 'case-g21-pain-bilateral',
      caseIndicationId: 'ci-g21-pain',
      indicationModuleReleaseId: PAIN_MODULE_RELEASE_ID,
      phenotypeSnapshotId: 'ps-g21',
      modality: 'motor_mapping',
    }),
    authorizedEvidencePaths: [
      createMockEvidencePath({
        id: 'EP-PAIN-M1-SOMATO-001',
        indicationModuleReleaseId: PAIN_MODULE_RELEASE_ID,
        targetFamilyId: 'TF-PAIN-M1-SOMATOTOPIC-001',
        clinicalObjectiveId: 'obj-g21-pain',
        targetGeometryType: 'somatotopic',
      }),
    ],
  },
  expected: {
    shouldAbstain: true,
    expectedAbstentionReasonCode: 'PAIN_LATERALITY_AMBIGUOUS',
  },
};

// -------------------------------------------------------------
// G22 — Subacute unilateral motor stroke (§88)
// -------------------------------------------------------------
export const G22_SUBACUTE_MOTOR_STROKE: ArchitectureGoldenCaseDefinition = {
  id: 'G22',
  caseCode: 'MGN-V2-G22',
  title: 'G22 — Subacute unilateral motor stroke',
  section: '§88. G22',
  description:
    'Subacute left hemisphere motor stroke. Expected: lesion side and recovery stage visible, approved stroke strategies generated, zero MDD leakage.',
  input: {
    caseId: 'case-g22-stroke-subacute',
    caseIndicationId: 'ci-g22-stroke',
    indicationCode: 'STROKE_MOTOR',
    mode: 'validation',
    indicationModuleReleaseId: STROKE_MOTOR_MODULE_RELEASE_ID,
    clinicalContext: {
      phenotypeSnapshot: createMockPhenotypeSnapshot({
        id: 'ps-g22',
        primaryDiagnosis: 'Ischemic Stroke with Upper Extremity Hemiparesis',
        customFields: {
          affectedPareticSide: 'right',
          fuglMeyerScore: 24,
        },
      }),
      diseaseStageContext: createMockDiseaseStageContext({
        id: 'dsc-g22',
        caseIndicationId: 'ci-g22-stroke',
        currentStageCode: 'subacute',
        currentStageLabel: 'Subacute Recovery Stage',
      }),
      lesionContext: createMockLesionContext({
        id: 'lc-g22',
        caseIndicationId: 'ci-g22-stroke',
        lesionLaterality: 'left',
        lesionVolumeCm3: 18.2,
        interpretation: 'Subcortical internal capsule ischemic infarct',
      }),
    },
    clinicalObjectives: [
      createMockClinicalObjective({
        id: 'obj-g22-stroke',
        caseIndicationId: 'ci-g22-stroke',
        code: 'OBJ-STROKE-MOTOR-ARM',
        display: 'Upper Limb Motor Recovery',
      }),
    ],
    measurementBundle: createMockMeasurementBundle({
      id: 'mb-g22',
      caseId: 'case-g22-stroke-subacute',
      caseIndicationId: 'ci-g22-stroke',
      indicationModuleReleaseId: STROKE_MOTOR_MODULE_RELEASE_ID,
      phenotypeSnapshotId: 'ps-g22',
      modality: 'structural_mri',
    }),
    authorizedEvidencePaths: [
      createMockEvidencePath({
        id: 'EP-STRM-CONTRALESIONAL-001',
        indicationModuleReleaseId: STROKE_MOTOR_MODULE_RELEASE_ID,
        targetFamilyId: 'TF-STROKE-CONTRALESIONAL-M1-001',
        clinicalObjectiveId: 'obj-g22-stroke',
        targetGeometryType: 'point',
      }),
      createMockEvidencePath({
        id: 'EP-STRM-IPSILESIONAL-002',
        indicationModuleReleaseId: STROKE_MOTOR_MODULE_RELEASE_ID,
        targetFamilyId: 'TF-STROKE-IPSILESIONAL-M1-001',
        clinicalObjectiveId: 'obj-g22-stroke',
        targetGeometryType: 'point',
      }),
    ],
  },
  expected: {
    shouldAbstain: false,
    primaryCandidateCount: 1,
    expectedPrimaryFamilies: ['TF-STROKE-IPSILESIONAL-M1-001'],
    expectedGeometries: ['somatotopic'],
  },
};

// -------------------------------------------------------------
// G23 — Stroke with destroyed cortical candidate region (§88)
// -------------------------------------------------------------
export const G23_STROKE_DESTROYED_CORTICAL_REGION: ArchitectureGoldenCaseDefinition = {
  id: 'G23',
  caseCode: 'MGN-V2-G23',
  title: 'G23 — Stroke with destroyed cortical candidate region',
  section: '§88. G23',
  description:
    'Stroke with large infarct destroying ipsilesional hand knob. Expected: affected primary candidate suppressed; anatomy explanation provided.',
  input: {
    caseId: 'case-g23-stroke-destroyed',
    caseIndicationId: 'ci-g23-stroke',
    indicationCode: 'STROKE_MOTOR',
    mode: 'validation',
    indicationModuleReleaseId: STROKE_MOTOR_MODULE_RELEASE_ID,
    clinicalContext: {
      phenotypeSnapshot: createMockPhenotypeSnapshot({
        id: 'ps-g23',
        primaryDiagnosis: 'Large Left MCA Cortical Infarct with Dense Hemiplegia',
        customFields: {
          affectedPareticSide: 'right',
          fuglMeyerScore: 12,
        },
      }),
      diseaseStageContext: createMockDiseaseStageContext({
        id: 'dsc-g23',
        caseIndicationId: 'ci-g23-stroke',
        currentStageCode: 'chronic',
        currentStageLabel: 'Chronic Recovery Stage',
      }),
      lesionContext: createMockLesionContext({
        id: 'lc-g23',
        caseIndicationId: 'ci-g23-stroke',
        lesionLaterality: 'left',
        lesionVolumeCm3: 54.0,
        interpretation: 'Large Left MCA Cortical Infarct destroying M1 hand knob',
      }),
    },
    clinicalObjectives: [
      createMockClinicalObjective({
        id: 'obj-g23-stroke',
        caseIndicationId: 'ci-g23-stroke',
        code: 'OBJ-STROKE-MOTOR-ARM',
        display: 'Upper Limb Motor Recovery',
      }),
    ],
    measurementBundle: createMockMeasurementBundle({
      id: 'mb-g23',
      caseId: 'case-g23-stroke-destroyed',
      caseIndicationId: 'ci-g23-stroke',
      indicationModuleReleaseId: STROKE_MOTOR_MODULE_RELEASE_ID,
      phenotypeSnapshotId: 'ps-g23',
      modality: 'structural_mri',
    }),
    authorizedEvidencePaths: [
      createMockEvidencePath({
        id: 'EP-STRM-CONTRALESIONAL-001',
        indicationModuleReleaseId: STROKE_MOTOR_MODULE_RELEASE_ID,
        targetFamilyId: 'TF-STROKE-CONTRALESIONAL-M1-001',
        clinicalObjectiveId: 'obj-g23-stroke',
        targetGeometryType: 'point',
      }),
      createMockEvidencePath({
        id: 'EP-STRM-IPSILESIONAL-002',
        indicationModuleReleaseId: STROKE_MOTOR_MODULE_RELEASE_ID,
        targetFamilyId: 'TF-STROKE-IPSILESIONAL-M1-001',
        clinicalObjectiveId: 'obj-g23-stroke',
        targetGeometryType: 'point',
      }),
    ],
  },
  expected: {
    shouldAbstain: false,
    expectedSuppressedCount: 1, // ipsilesional M1 suppressed due to lesion overlap
  },
};

// -------------------------------------------------------------
// G24 — Post-stroke aphasia (§88)
// -------------------------------------------------------------
export const G24_POST_STROKE_APHASIA: ArchitectureGoldenCaseDefinition = {
  id: 'G24',
  caseCode: 'MGN-V2-G24',
  title: 'G24 — Post-stroke aphasia',
  section: '§88. G24',
  description:
    'Post-stroke non-fluent aphasia. Expected: language phenotype, speech-language therapy treatment context evidence, separate aphasia module.',
  input: {
    caseId: 'case-g24-aphasia',
    caseIndicationId: 'ci-g24-aphasia',
    indicationCode: 'STROKE_APHASIA',
    mode: 'research',
    indicationModuleReleaseId: STROKE_APHASIA_MODULE_RELEASE_ID,
    clinicalContext: {
      phenotypeSnapshot: createMockPhenotypeSnapshot({
        id: 'ps-g24',
        primaryDiagnosis: 'Chronic Post-Stroke Non-Fluent Aphasia (Broca Type)',
        customFields: {
          bostonNamingScore: 18,
          aphasiaSeverity: 'moderate',
        },
      }),
      treatmentContext: createMockTreatmentContext({
        id: 'tc-g24',
        caseIndicationId: 'ci-g24-aphasia',
        requirementCode: 'REQ-CTX-SLT-CONCURRENT',
        interpretation: 'Concurrent Speech-Language Therapy present and active',
      }),
    },
    clinicalObjectives: [
      createMockClinicalObjective({
        id: 'obj-g24-aphasia',
        caseIndicationId: 'ci-g24-aphasia',
        code: 'OBJ-APHASIA-NAMING',
        display: 'Expressive Language and Picture Naming',
      }),
    ],
    measurementBundle: createMockMeasurementBundle({
      id: 'mb-g24',
      caseId: 'case-g24-aphasia',
      caseIndicationId: 'ci-g24-aphasia',
      indicationModuleReleaseId: STROKE_APHASIA_MODULE_RELEASE_ID,
      phenotypeSnapshotId: 'ps-g24',
      modality: 'task_fmri',
    }),
    authorizedEvidencePaths: [
      createMockEvidencePath({
        id: 'EP-STROKE-APHASIA-001',
        indicationModuleReleaseId: STROKE_APHASIA_MODULE_RELEASE_ID,
        targetFamilyId: 'TF-APHASIA-RIGHT-BROCA-HOMOLOGUE-001',
        clinicalObjectiveId: 'obj-g24-aphasia',
        targetGeometryType: 'surface_roi',
      }),
    ],
  },
  expected: {
    shouldAbstain: false,
    requiresResearchMode: true,
    expectedPrimaryFamilies: ['TF-APHASIA-RIGHT-BROCA-HOMOLOGUE-001'],
  },
};

// -------------------------------------------------------------
// G25 — OCD deep-TMS candidate (§88)
// -------------------------------------------------------------
export const G25_OCD_DEEP_TMS: ArchitectureGoldenCaseDefinition = {
  id: 'G25',
  caseCode: 'MGN-V2-G25',
  title: 'G25 — OCD deep-TMS candidate',
  section: '§88. G25',
  description:
    'Treatment-refractory OCD candidate for deep TMS. Expected: field/coil target (CoilFieldTarget with H7 coil), not a misleading point coordinate.',
  input: {
    caseId: 'case-g25-ocd-deep',
    caseIndicationId: 'ci-g25-ocd',
    indicationCode: 'OCD',
    mode: 'validation',
    indicationModuleReleaseId: OCD_MODULE_RELEASE_ID,
    clinicalContext: {
      phenotypeSnapshot: createMockPhenotypeSnapshot({
        id: 'ps-g25',
        primaryDiagnosis: 'Severe Refractory Obsessive-Compulsive Disorder',
        customFields: {
          ybocsScore: 32,
          symptomProvocationConfirmed: true,
        },
      }),
      treatmentContext: createMockTreatmentContext({
        id: 'tc-g25',
        caseIndicationId: 'ci-g25-ocd',
        requirementCode: 'REQ-CTX-OCD-PROVOCATION',
        interpretation: 'Standardized symptom provocation protocol confirmed',
      }),
    },
    clinicalObjectives: [
      createMockClinicalObjective({
        id: 'obj-g25-ocd',
        caseIndicationId: 'ci-g25-ocd',
        code: 'OBJ-OCD-YBOCS',
        display: 'Reduction in Obsessive-Compulsive Burden',
      }),
    ],
    measurementBundle: createMockMeasurementBundle({
      id: 'mb-g25',
      caseId: 'case-g25-ocd-deep',
      caseIndicationId: 'ci-g25-ocd',
      indicationModuleReleaseId: OCD_MODULE_RELEASE_ID,
      phenotypeSnapshotId: 'ps-g25',
      modality: 'structural_mri',
    }),
    authorizedEvidencePaths: [
      createMockEvidencePath({
        id: 'EP-OCD-MPFC-ACC-001',
        indicationModuleReleaseId: OCD_MODULE_RELEASE_ID,
        targetFamilyId: 'TF-OCD-MPFC-ACC-001',
        clinicalObjectiveId: 'obj-g25-ocd',
        targetGeometryType: 'coil_field',
      }),
      createMockEvidencePath({
        id: 'EP-OCD-PRESMA-002',
        indicationModuleReleaseId: OCD_MODULE_RELEASE_ID,
        targetFamilyId: 'TF-OCD-PRESMA-001',
        clinicalObjectiveId: 'obj-g25-ocd',
        targetGeometryType: 'point',
      }),
    ],
  },
  expected: {
    shouldAbstain: false,
    primaryCandidateCount: 1,
    expectedPrimaryFamilies: ['TF-OCD-DMPFC-ACC-DEEP-001'],
    expectedGeometries: ['coil_field'],
  },
};

// -------------------------------------------------------------
// G26 — TBI depression with skull defect (§88)
// -------------------------------------------------------------
export const G26_TBI_DEPRESSION_SKULL_DEFECT: ArchitectureGoldenCaseDefinition = {
  id: 'G26',
  caseCode: 'MGN-V2-G26',
  title: 'G26 — TBI depression with skull defect',
  section: '§88. G26',
  description:
    'TBI depression with craniotomy / skull defect. Expected: Research Mode only, E-field/anatomy safety warning, no routine Clinical candidate.',
  input: {
    caseId: 'case-g26-tbi-defect',
    caseIndicationId: 'ci-g26-tbi',
    indicationCode: 'TBI',
    mode: 'research',
    indicationModuleReleaseId: TBI_MODULE_RELEASE_ID,
    clinicalContext: {
      phenotypeSnapshot: createMockPhenotypeSnapshot({
        id: 'ps-g26',
        primaryDiagnosis: 'Post-Traumatic Brain Injury Depression',
        customFields: {
          tbiSeverity: 'severe',
          postInjuryMonths: 18,
          phq9Score: 21,
        },
      }),
      lesionContext: createMockLesionContext({
        id: 'lc-g26',
        caseIndicationId: 'ci-g26-tbi',
        lesionLaterality: 'right',
        lesionVolumeCm3: 15.0,
        interpretation: 'TBI right craniotomy defect with encephalomalacia',
      }),
    },
    clinicalObjectives: [
      createMockClinicalObjective({
        id: 'obj-g26-tbi',
        caseIndicationId: 'ci-g26-tbi',
        code: 'OBJ-TBI-DEPRESSION',
        display: 'Post-TBI Depressive Symptom Reduction',
      }),
    ],
    measurementBundle: createMockMeasurementBundle({
      id: 'mb-g26',
      caseId: 'case-g26-tbi-defect',
      caseIndicationId: 'ci-g26-tbi',
      indicationModuleReleaseId: TBI_MODULE_RELEASE_ID,
      phenotypeSnapshotId: 'ps-g26',
      modality: 'efield',
    }),
    authorizedEvidencePaths: [
      createMockEvidencePath({
        id: 'EP-TBI-DEP-001',
        indicationModuleReleaseId: TBI_MODULE_RELEASE_ID,
        targetFamilyId: 'TF-TBI-LEFT-DLPFC-001',
        clinicalObjectiveId: 'obj-g26-tbi',
        targetGeometryType: 'point',
      }),
    ],
  },
  expected: {
    shouldAbstain: false,
    requiresResearchMode: true,
    clinicalSigningProhibited: true,
  },
};

// -------------------------------------------------------------
// G27 — TBI cognitive hypothesis (§88)
// -------------------------------------------------------------
export const G27_TBI_COGNITIVE_HYPOTHESIS: ArchitectureGoldenCaseDefinition = {
  id: 'G27',
  caseCode: 'MGN-V2-G27',
  title: 'G27 — TBI cognitive hypothesis',
  section: '§88. G27',
  description:
    'TBI chronic executive dysfunction research case. Expected: Research only, frontoparietal target hypothesis, zero depression-target inheritance.',
  input: {
    caseId: 'case-g27-tbi-cognition',
    caseIndicationId: 'ci-g27-tbi',
    indicationCode: 'TBI',
    mode: 'research',
    indicationModuleReleaseId: TBI_MODULE_RELEASE_ID,
    clinicalContext: {
      phenotypeSnapshot: createMockPhenotypeSnapshot({
        id: 'ps-g27',
        primaryDiagnosis: 'TBI with Dysexecutive Cognitive Syndrome',
        customFields: {
          tbiSeverity: 'moderate',
          cognitiveDomain: 'executive_function_working_memory',
        },
      }),
    },
    clinicalObjectives: [
      createMockClinicalObjective({
        id: 'obj-g27-tbi',
        caseIndicationId: 'ci-g27-tbi',
        code: 'OBJ-TBI-EXECUTIVE',
        display: 'Executive Function / Cognitive Rehabilitation',
      }),
    ],
    measurementBundle: createMockMeasurementBundle({
      id: 'mb-g27',
      caseId: 'case-g27-tbi-cognition',
      caseIndicationId: 'ci-g27-tbi',
      indicationModuleReleaseId: TBI_MODULE_RELEASE_ID,
      phenotypeSnapshotId: 'ps-g27',
      modality: 'resting_state_fmri',
    }),
    authorizedEvidencePaths: [
      createMockEvidencePath({
        id: 'EP-TBI-COG-001',
        indicationModuleReleaseId: TBI_MODULE_RELEASE_ID,
        targetFamilyId: 'TF-TBI-FRONTOPARIETAL-001',
        clinicalObjectiveId: 'obj-g27-tbi',
        targetGeometryType: 'network',
      }),
    ],
  },
  expected: {
    shouldAbstain: false,
    requiresResearchMode: true,
    expectedPrimaryFamilies: ['TF-TBI-FRONTOPARIETAL-001'],
  },
};

// -------------------------------------------------------------
// G28 — Chronic tinnitus (§88)
// -------------------------------------------------------------
export const G28_CHRONIC_TINNITUS: ArchitectureGoldenCaseDefinition = {
  id: 'G28',
  caseCode: 'MGN-V2-G28',
  title: 'G28 — Chronic tinnitus',
  section: '§88. G28',
  description:
    'Chronic bilateral subjective tinnitus. Expected: prominent negative evidence and conflict, Research Mode only, clinical signing unavailable.',
  input: {
    caseId: 'case-g28-tinnitus-research',
    caseIndicationId: 'ci-g28-tinnitus',
    indicationCode: 'TINNITUS',
    mode: 'research',
    indicationModuleReleaseId: TINNITUS_MODULE_RELEASE_ID,
    clinicalContext: {
      phenotypeSnapshot: createMockPhenotypeSnapshot({
        id: 'ps-g28',
        primaryDiagnosis: 'Chronic Subjective Tinnitus',
        customFields: {
          tinnitusLaterality: 'bilateral',
          thiScore: 68,
        },
      }),
    },
    clinicalObjectives: [
      createMockClinicalObjective({
        id: 'obj-g28-tinnitus',
        caseIndicationId: 'ci-g28-tinnitus',
        code: 'OBJ-TINNITUS-DISTRESS',
        display: 'Tinnitus Handicap Inventory Score Reduction',
      }),
    ],
    measurementBundle: createMockMeasurementBundle({
      id: 'mb-g28',
      caseId: 'case-g28-tinnitus-research',
      caseIndicationId: 'ci-g28-tinnitus',
      indicationModuleReleaseId: TINNITUS_MODULE_RELEASE_ID,
      phenotypeSnapshotId: 'ps-g28',
      modality: 'audiology',
    }),
    authorizedEvidencePaths: [
      createMockEvidencePath({
        id: 'EP-TINNITUS-AUDITORY-001',
        indicationModuleReleaseId: TINNITUS_MODULE_RELEASE_ID,
        targetFamilyId: 'TF-TINNITUS-LEFT-TEMPOROPARIETAL-001',
        clinicalObjectiveId: 'obj-g28-tinnitus',
        targetGeometryType: 'surface_roi',
      }),
    ],
  },
  expected: {
    shouldAbstain: false,
    requiresResearchMode: true,
    clinicalSigningProhibited: true,
    expectedPrimaryFamilies: ['TF-TINNITUS-LEFT-TEMPOROPARIETAL-001'],
  },
};

// -------------------------------------------------------------
// G29 — MDD + neuropathic pain comorbidity (§88)
// -------------------------------------------------------------
export const G29_MDD_PAIN_COMORBIDITY: ArchitectureGoldenCaseDefinition = {
  id: 'G29',
  caseCode: 'MGN-V2-G29',
  title: 'G29 — MDD + neuropathic pain comorbidity',
  section: '§88. G29',
  description:
    'Patient with comorbid MDD and chronic neuropathic pain. Expected: two distinct indication contexts, independent Target Slates, zero unvalidated unified score.',
  input: {
    caseId: 'case-g29-comorbid',
    caseIndicationId: 'ci-g29-mdd',
    indicationCode: 'MDD',
    mode: 'clinical',
    indicationModuleReleaseId: MDD_MODULE_RELEASE_ID,
    clinicalContext: {
      phenotypeSnapshot: createMockPhenotypeSnapshot({
        id: 'ps-g29-mdd',
        primaryDiagnosis: 'Major Depressive Disorder with Comorbid Neuropathic Pain',
      }),
    },
    clinicalObjectives: [
      createMockClinicalObjective({
        id: 'obj-g29-mdd',
        caseIndicationId: 'ci-g29-mdd',
        code: 'OBJ-MDD-CORE',
        display: 'Depressive Symptom Remission',
      }),
    ],
    measurementBundle: createMockMeasurementBundle({
      id: 'mb-g29-mdd',
      caseId: 'case-g29-comorbid',
      caseIndicationId: 'ci-g29-mdd',
      indicationModuleReleaseId: MDD_MODULE_RELEASE_ID,
      phenotypeSnapshotId: 'ps-g29-mdd',
      modality: 'resting_state_fmri',
    }),
    authorizedEvidencePaths: [
      createMockEvidencePath({
        id: 'EP-MDD-DLPFC-001',
        indicationModuleReleaseId: MDD_MODULE_RELEASE_ID,
        targetFamilyId: 'TF-MDD-LDLPFC-EST-001',
        clinicalObjectiveId: 'obj-g29-mdd',
        targetGeometryType: 'point',
      }),
    ],
  },
  secondaryInput: {
    caseId: 'case-g29-comorbid-pain',
    caseIndicationId: 'ci-g29-pain',
    indicationCode: 'NEUROPATHIC_PAIN',
    mode: 'validation',
    indicationModuleReleaseId: PAIN_MODULE_RELEASE_ID,
    clinicalContext: {
      phenotypeSnapshot: createMockPhenotypeSnapshot({
        id: 'ps-g29-pain',
        primaryDiagnosis: 'Refractory Post-Herpetic Neuropathic Pain',
        customFields: {
          affectedSide: 'left',
          bodyRegion: 'upper_limb',
        },
      }),
    },
    clinicalObjectives: [
      createMockClinicalObjective({
        id: 'obj-g29-pain',
        caseIndicationId: 'ci-g29-pain',
        code: 'OBJ-PAIN-REDUCE',
        display: 'Neuropathic Pain Severity Reduction',
      }),
    ],
    measurementBundle: createMockMeasurementBundle({
      id: 'mb-g29-pain',
      caseId: 'case-g29-comorbid-pain',
      caseIndicationId: 'ci-g29-pain',
      indicationModuleReleaseId: PAIN_MODULE_RELEASE_ID,
      phenotypeSnapshotId: 'ps-g29-pain',
      modality: 'motor_mapping',
    }),
    authorizedEvidencePaths: [
      createMockEvidencePath({
        id: 'EP-PAIN-M1-SOMATO-001',
        indicationModuleReleaseId: PAIN_MODULE_RELEASE_ID,
        targetFamilyId: 'TF-PAIN-M1-SOMATOTOPIC-001',
        clinicalObjectiveId: 'obj-g29-pain',
        targetGeometryType: 'somatotopic',
      }),
    ],
  },
  expected: {
    comorbidityIndependentSlates: true,
    primaryCandidateCount: 1,
  },
};

// -------------------------------------------------------------
// G30 — Research/Clinical leakage attempt (§88)
// -------------------------------------------------------------
export const G30_RESEARCH_CLINICAL_LEAKAGE: ArchitectureGoldenCaseDefinition = {
  id: 'G30',
  caseCode: 'MGN-V2-G30',
  title: 'G30 — Research/Clinical leakage attempt',
  section: '§88. G30',
  description:
    'Adversarial attempt to execute an unvalidated Research-only module (Tinnitus) in Clinical Mode. Expected: hard rejection by the target engine kernel.',
  input: {
    caseId: 'case-g30-leakage',
    caseIndicationId: 'ci-g30-leakage',
    indicationCode: 'TINNITUS',
    mode: 'clinical', // Illegal mode for research-only module!
    indicationModuleReleaseId: TINNITUS_MODULE_RELEASE_ID,
    clinicalContext: {
      phenotypeSnapshot: createMockPhenotypeSnapshot({
        id: 'ps-g30',
        primaryDiagnosis: 'Tinnitus Clinical Leakage Attempt',
      }),
    },
    clinicalObjectives: [
      createMockClinicalObjective({
        id: 'obj-g30',
        caseIndicationId: 'ci-g30-leakage',
        code: 'OBJ-TIN-LEAK',
        display: 'Unauthorized Clinical Tinnitus',
      }),
    ],
    measurementBundle: createMockMeasurementBundle({
      id: 'mb-g30',
      caseId: 'case-g30-leakage',
      caseIndicationId: 'ci-g30-leakage',
      indicationModuleReleaseId: TINNITUS_MODULE_RELEASE_ID,
      phenotypeSnapshotId: 'ps-g30',
      modality: 'audiology',
    }),
  },
  expected: {
    hardRejectionExpected: true,
  },
};

export const ALL_V2_ARCHITECTURE_GOLDEN_CASES: readonly ArchitectureGoldenCaseDefinition[] = [
  G20_NEUROPATHIC_HAND_PAIN,
  G21_BILATERAL_NEUROPATHIC_PAIN,
  G22_SUBACUTE_MOTOR_STROKE,
  G23_STROKE_DESTROYED_CORTICAL_REGION,
  G24_POST_STROKE_APHASIA,
  G25_OCD_DEEP_TMS,
  G26_TBI_DEPRESSION_SKULL_DEFECT,
  G27_TBI_COGNITIVE_HYPOTHESIS,
  G28_CHRONIC_TINNITUS,
  G29_MDD_PAIN_COMORBIDITY,
  G30_RESEARCH_CLINICAL_LEAKAGE,
];
