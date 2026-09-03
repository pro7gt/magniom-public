/**
 * @magniom/test-fixtures
 * Canonical v2 UX Golden Cases conforming to MAGNIOM-Application Shell, Navigation & Clinical Context Specification v2.0 Sections 250–262.
 * 100% Synthetic — Zero PHI.
 */

import type {
  ClinicalCase,
  PhenotypeSnapshot,
  TargetSlate,
  ClinicianDecision,
  ModuleQualificationLevel,
} from '@magniom/domain';
import { G01_PHENOTYPE, GOLDEN_CASE_01_SLATE } from './g01-evidence-only.js';
import { G02_PHENOTYPE, GOLDEN_CASE_02_SLATE } from './g02-convergent.js';

export interface UXGoldenCaseBundleV2 {
  readonly id: string;
  readonly code: string;
  readonly title: string;
  readonly indicationCode: string;
  readonly indicationFormatted: string;
  readonly mode: 'CLINICAL' | 'VALIDATION' | 'RESEARCH';
  readonly qualificationLevel: ModuleQualificationLevel;
  readonly permittedModes: readonly string[];
  readonly expectedPattern: string;
  readonly clinicalCase: ClinicalCase;
  readonly phenotype?: PhenotypeSnapshot | undefined;
  readonly slate?: TargetSlate | undefined;
  readonly isStale?: boolean | undefined;
  readonly staleReason?: string | undefined;
  readonly isContradictory?: boolean | undefined;
  readonly isBlindedValidation?: boolean | undefined;
  readonly initialDecision?: ClinicianDecision | undefined;
  readonly clinicalObjective?:
    | {
        readonly id: string;
        readonly title: string;
        readonly priorityRank: number;
        readonly burdenScoreText?: string | undefined;
        readonly isEvidenceMappable: boolean;
      }
    | undefined;
  readonly diseaseStage?:
    | {
        readonly stageCode: string;
        readonly stageLabel: string;
        readonly determinationMethod: string;
        readonly isSubacuteOrAcute: boolean;
      }
    | undefined;
  readonly lesionContext?:
    | {
        readonly hasLesion: boolean;
        readonly lesionType?: string | undefined;
        readonly laterality?: string | undefined;
        readonly interpretation?: string | undefined;
        readonly affectedRegionsCount: number;
        readonly hasTargetOverlapWarning: boolean;
        readonly skullAbnormalityPresent: boolean;
      }
    | undefined;
  readonly treatmentContext?:
    | {
        readonly contextType: string;
        readonly statusLabel: string;
        readonly isConfirmed: boolean;
        readonly summaryText: string;
      }
    | undefined;
  readonly availableIndications?:
    | readonly {
        readonly caseIndicationId: string;
        readonly indicationCode: string;
        readonly label: string;
        readonly isPrimary: boolean;
        readonly status: string;
      }[]
    | undefined;
}

// -------------------------------------------------------------
// 1. §250: v2 UX GOLDEN CASE — MDD CLINICAL
// -------------------------------------------------------------
export const UX_V2_CASE_01_MDD_CLINICAL: UXGoldenCaseBundleV2 = {
  id: 'case-ux-v2-01',
  code: 'MGN-26-0041',
  title: 'v2 UX Golden Case 1 — MDD Clinical Baseline',
  indicationCode: 'MDD',
  indicationFormatted: 'Major Depressive Disorder ± Anxious Distress',
  mode: 'CLINICAL',
  qualificationLevel: 'Q8',
  permittedModes: ['CLINICAL', 'VALIDATION', 'RESEARCH'],
  expectedPattern:
    'Clinical mode obvious, MDD indication obvious, Target Slate current, FC refinement visible, evidence baseline inspectable, zero preselection.',
  clinicalCase: {
    id: 'case-ux-v2-01',
    organisationId: 'org-synthetic-001',
    patientId: 'pat-synth-041',
    caseCode: 'MGN-26-0041',
    state: 'target_slate_ready',
    indicationCode: 'MDD',
    mode: 'CLINICAL',
    version: 1,
    currentPhenotypeSnapshotId: G02_PHENOTYPE.id,
    currentTargetSlateId: GOLDEN_CASE_02_SLATE.id,
    createdAt: '2026-09-01T10:00:00Z',
    updatedAt: '2026-09-01T10:30:00Z',
  },
  phenotype: G02_PHENOTYPE,
  slate: { ...GOLDEN_CASE_02_SLATE, caseId: 'case-ux-v2-01' },
  clinicalObjective: {
    id: 'obj-mdd-01',
    title: 'Reduce core depressive symptoms & negative affective bias',
    priorityRank: 1,
    burdenScoreText: 'MADRS 34 (Severe)',
    isEvidenceMappable: true,
  },
};

// -------------------------------------------------------------
// 2. §251: v2 UX GOLDEN CASE — PAIN MOTOR MAP
// -------------------------------------------------------------
export const UX_V2_CASE_02_PAIN_MOTOR_MAP: UXGoldenCaseBundleV2 = {
  id: 'case-ux-v2-02',
  code: 'MGN-26-0042',
  title: 'v2 UX Golden Case 2 — Neuropathic Pain (M1/S1 Somatotopy)',
  indicationCode: 'PAIN',
  indicationFormatted: 'Intractable Neuropathic Pain',
  mode: 'CLINICAL',
  qualificationLevel: 'Q8',
  permittedModes: ['CLINICAL', 'VALIDATION', 'RESEARCH'],
  expectedPattern:
    'Right-hand pain obvious, left M1 somatotopy obvious, motor map qualified, baseline and refinement relationship visible.',
  clinicalCase: {
    id: 'case-ux-v2-02',
    organisationId: 'org-synthetic-001',
    patientId: 'pat-synth-042',
    caseCode: 'MGN-26-0042',
    state: 'target_slate_ready',
    indicationCode: 'PAIN',
    mode: 'CLINICAL',
    version: 1,
    currentPhenotypeSnapshotId: G01_PHENOTYPE.id,
    currentTargetSlateId: GOLDEN_CASE_01_SLATE.id,
    createdAt: '2026-09-01T11:00:00Z',
    updatedAt: '2026-09-01T11:45:00Z',
  },
  clinicalObjective: {
    id: 'obj-pain-01',
    title: 'Alleviate right upper extremity neuropathic allodynia',
    priorityRank: 1,
    burdenScoreText: 'NRS 8/10 (Severe)',
    isEvidenceMappable: true,
  },
};

// -------------------------------------------------------------
// 3. §252: v2 UX GOLDEN CASE — PAIN MOTOR MAP FAILURE
// -------------------------------------------------------------
export const UX_V2_CASE_03_PAIN_MOTOR_MAP_FAILURE: UXGoldenCaseBundleV2 = {
  id: 'case-ux-v2-03',
  code: 'MGN-26-0043',
  title: 'v2 UX Golden Case 3 — Pain Motor Map Failure (Graceful Fallback)',
  indicationCode: 'PAIN',
  indicationFormatted: 'Intractable Neuropathic Pain',
  mode: 'CLINICAL',
  qualificationLevel: 'Q8',
  permittedModes: ['CLINICAL', 'VALIDATION', 'RESEARCH'],
  expectedPattern:
    'Motor mapping not qualified, refinement not used, evidence baseline remains available, graceful failure without application collapse.',
  clinicalCase: {
    id: 'case-ux-v2-03',
    organisationId: 'org-synthetic-001',
    patientId: 'pat-synth-043',
    caseCode: 'MGN-26-0043',
    state: 'target_slate_ready',
    indicationCode: 'PAIN',
    mode: 'CLINICAL',
    version: 1,
    currentPhenotypeSnapshotId: G01_PHENOTYPE.id,
    currentTargetSlateId: GOLDEN_CASE_01_SLATE.id,
    createdAt: '2026-09-01T12:00:00Z',
    updatedAt: '2026-09-01T12:30:00Z',
  },
  clinicalObjective: {
    id: 'obj-pain-02',
    title: 'Neuropathic pain relief — Fallback to standard hand knob',
    priorityRank: 1,
    isEvidenceMappable: true,
  },
};

// -------------------------------------------------------------
// 4. §253: v2 UX GOLDEN CASE — STROKE LESION
// -------------------------------------------------------------
export const UX_V2_CASE_04_STROKE_LESION: UXGoldenCaseBundleV2 = {
  id: 'case-ux-v2-04',
  code: 'MGN-26-0044',
  title: 'v2 UX Golden Case 4 — Stroke Lesion Conflict (Safety Blocking)',
  indicationCode: 'STROKE_MOTOR',
  indicationFormatted: 'Post-Stroke Motor Recovery',
  mode: 'CLINICAL',
  qualificationLevel: 'Q8',
  permittedModes: ['CLINICAL', 'VALIDATION', 'RESEARCH'],
  expectedPattern:
    'Lesion context prominent, target-overlap warning blocking, no guessed target, clinician understands why candidate is unavailable.',
  clinicalCase: {
    id: 'case-ux-v2-04',
    organisationId: 'org-synthetic-001',
    patientId: 'pat-synth-044',
    caseCode: 'MGN-26-0044',
    state: 'target_slate_ready',
    indicationCode: 'STROKE_MOTOR',
    mode: 'CLINICAL',
    version: 1,
    currentPhenotypeSnapshotId: G01_PHENOTYPE.id,
    currentTargetSlateId: GOLDEN_CASE_01_SLATE.id,
    createdAt: '2026-09-01T13:00:00Z',
    updatedAt: '2026-09-01T13:30:00Z',
  },
  diseaseStage: {
    stageCode: 'SUBACUTE',
    stageLabel: 'Subacute Stage (45 days post-stroke)',
    determinationMethod: 'combined',
    isSubacuteOrAcute: true,
  },
  lesionContext: {
    hasLesion: true,
    lesionType: 'ischemic',
    laterality: 'left',
    interpretation:
      'Left MCA territory infarct overlapping primary motor cortex hand representation.',
    affectedRegionsCount: 4,
    hasTargetOverlapWarning: true,
    skullAbnormalityPresent: false,
  },
};

// -------------------------------------------------------------
// 5. §254: v2 UX GOLDEN CASE — STROKE STAGE MISMATCH
// -------------------------------------------------------------
export const UX_V2_CASE_05_STROKE_STAGE_MISMATCH: UXGoldenCaseBundleV2 = {
  id: 'case-ux-v2-05',
  code: 'MGN-26-0045',
  title: 'v2 UX Golden Case 5 — Stroke Stage Mismatch',
  indicationCode: 'STROKE_MOTOR',
  indicationFormatted: 'Post-Stroke Motor Recovery',
  mode: 'CLINICAL',
  qualificationLevel: 'Q8',
  permittedModes: ['CLINICAL', 'VALIDATION', 'RESEARCH'],
  expectedPattern:
    'Chronic stage mismatch visible, EvidencePath unavailable for acute protocol, no target presented as eligible.',
  clinicalCase: {
    id: 'case-ux-v2-05',
    organisationId: 'org-synthetic-001',
    patientId: 'pat-synth-045',
    caseCode: 'MGN-26-0045',
    state: 'target_slate_ready',
    indicationCode: 'STROKE_MOTOR',
    mode: 'CLINICAL',
    version: 1,
    currentPhenotypeSnapshotId: G01_PHENOTYPE.id,
    currentTargetSlateId: GOLDEN_CASE_01_SLATE.id,
    createdAt: '2026-09-01T14:00:00Z',
    updatedAt: '2026-09-01T14:20:00Z',
  },
  diseaseStage: {
    stageCode: 'CHRONIC',
    stageLabel: 'Chronic Stage (>365 days post-stroke)',
    determinationMethod: 'date_based',
    isSubacuteOrAcute: false,
  },
};

// -------------------------------------------------------------
// 6. §255: v2 UX GOLDEN CASE — OCD FIELD TARGET
// -------------------------------------------------------------
export const UX_V2_CASE_06_OCD_FIELD_TARGET: UXGoldenCaseBundleV2 = {
  id: 'case-ux-v2-06',
  code: 'MGN-26-0046',
  title: 'v2 UX Golden Case 6 — OCD Coil-Field Geometry (Brainsway H-Coil)',
  indicationCode: 'OCD',
  indicationFormatted: 'Obsessive-Compulsive Disorder (Deep TMS)',
  mode: 'CLINICAL',
  qualificationLevel: 'Q8',
  permittedModes: ['CLINICAL', 'VALIDATION', 'RESEARCH'],
  expectedPattern:
    'Coil-field geometry shown, compatible Brainsway H7 coil visible, no misleading focal bullseye, field vs focal clearly distinct.',
  clinicalCase: {
    id: 'case-ux-v2-06',
    organisationId: 'org-synthetic-001',
    patientId: 'pat-synth-046',
    caseCode: 'MGN-26-0046',
    state: 'target_slate_ready',
    indicationCode: 'OCD',
    mode: 'CLINICAL',
    version: 1,
    currentPhenotypeSnapshotId: G01_PHENOTYPE.id,
    currentTargetSlateId: GOLDEN_CASE_01_SLATE.id,
    createdAt: '2026-09-01T15:00:00Z',
    updatedAt: '2026-09-01T15:40:00Z',
  },
  treatmentContext: {
    contextType: 'provocation_protocol',
    statusLabel: 'Standardised YBOCS Symptom Provocation Confirmed',
    isConfirmed: true,
    summaryText:
      'Individualised contamination hierarchy provoked immediately prior to stimulation.',
  },
};

// -------------------------------------------------------------
// 7. §256: v2 UX GOLDEN CASE — APHASIA CONTEXT
// -------------------------------------------------------------
export const UX_V2_CASE_07_APHASIA_CONTEXT: UXGoldenCaseBundleV2 = {
  id: 'case-ux-v2-07',
  code: 'MGN-26-0047',
  title: 'v2 UX Golden Case 7 — Post-Stroke Aphasia & SLT Context',
  indicationCode: 'STROKE_APHASIA',
  indicationFormatted: 'Post-Stroke Expressive Aphasia',
  mode: 'CLINICAL',
  qualificationLevel: 'Q8',
  permittedModes: ['CLINICAL', 'VALIDATION', 'RESEARCH'],
  expectedPattern:
    'Aphasia phenotype, disease stage, SLT context, and left frontal lesion context visible before Target Slate reasoning.',
  clinicalCase: {
    id: 'case-ux-v2-07',
    organisationId: 'org-synthetic-001',
    patientId: 'pat-synth-047',
    caseCode: 'MGN-26-0047',
    state: 'target_slate_ready',
    indicationCode: 'STROKE_APHASIA',
    mode: 'CLINICAL',
    version: 1,
    currentPhenotypeSnapshotId: G01_PHENOTYPE.id,
    currentTargetSlateId: GOLDEN_CASE_01_SLATE.id,
    createdAt: '2026-09-01T16:00:00Z',
    updatedAt: '2026-09-01T16:30:00Z',
  },
  diseaseStage: {
    stageCode: 'SUBACUTE',
    stageLabel: 'Subacute Stage (60 days)',
    determinationMethod: 'combined',
    isSubacuteOrAcute: true,
  },
  treatmentContext: {
    contextType: 'speech_therapy',
    statusLabel: 'Concomitant Intensive SLT Scheduled',
    isConfirmed: true,
    summaryText: 'Daily 45-min naming therapy coordinated within 1 hour post-TMS.',
  },
};

// -------------------------------------------------------------
// 8. §257: v2 UX GOLDEN CASE — TBI RESEARCH
// -------------------------------------------------------------
export const UX_V2_CASE_08_TBI_RESEARCH: UXGoldenCaseBundleV2 = {
  id: 'case-ux-v2-08',
  code: 'MGN-26-0048',
  title: 'v2 UX Golden Case 8 — TBI Research (Exploratory Prototype)',
  indicationCode: 'TBI',
  indicationFormatted: 'Chronic Traumatic Brain Injury (Research)',
  mode: 'RESEARCH',
  qualificationLevel: 'Q3',
  permittedModes: ['RESEARCH'],
  expectedPattern:
    'Research Mode persistent, weak target specificity visible, zero Clinical decision action, zero imported MDD authority.',
  clinicalCase: {
    id: 'case-ux-v2-08',
    organisationId: 'org-synthetic-001',
    patientId: 'pat-synth-048',
    caseCode: 'MGN-26-0048',
    state: 'target_slate_ready',
    indicationCode: 'TBI',
    mode: 'RESEARCH',
    version: 1,
    currentPhenotypeSnapshotId: G01_PHENOTYPE.id,
    currentTargetSlateId: GOLDEN_CASE_01_SLATE.id,
    createdAt: '2026-09-01T17:00:00Z',
    updatedAt: '2026-09-01T17:15:00Z',
  },
};

// -------------------------------------------------------------
// 9. §258: v2 UX GOLDEN CASE — TINNITUS RESEARCH
// -------------------------------------------------------------
export const UX_V2_CASE_09_TINNITUS_RESEARCH: UXGoldenCaseBundleV2 = {
  id: 'case-ux-v2-09',
  code: 'MGN-26-0049',
  title: 'v2 UX Golden Case 9 — Tinnitus Research (Audiology First)',
  indicationCode: 'TINNITUS',
  indicationFormatted: 'Subjective Refractory Tinnitus (Research)',
  mode: 'RESEARCH',
  qualificationLevel: 'Q2',
  permittedModes: ['RESEARCH'],
  expectedPattern:
    'Audiology visible, conflicting evidence prominent, Research target clearly labelled, Clinical sign-off unavailable.',
  clinicalCase: {
    id: 'case-ux-v2-09',
    organisationId: 'org-synthetic-001',
    patientId: 'pat-synth-049',
    caseCode: 'MGN-26-0049',
    state: 'target_slate_ready',
    indicationCode: 'TINNITUS',
    mode: 'RESEARCH',
    version: 1,
    currentPhenotypeSnapshotId: G01_PHENOTYPE.id,
    currentTargetSlateId: GOLDEN_CASE_01_SLATE.id,
    createdAt: '2026-09-01T18:00:00Z',
    updatedAt: '2026-09-01T18:25:00Z',
  },
};

// -------------------------------------------------------------
// 10. §259: v2 UX GOLDEN CASE — MODULE AUTHORITY CONFLICT
// -------------------------------------------------------------
export const UX_V2_CASE_10_MODULE_AUTHORITY_CONFLICT: UXGoldenCaseBundleV2 = {
  id: 'case-ux-v2-10',
  code: 'MGN-26-0050',
  title: 'v2 UX Golden Case 10 — Module Authority Conflict (Fail-Closed Stop)',
  indicationCode: 'TINNITUS',
  indicationFormatted: 'Subjective Refractory Tinnitus',
  mode: 'CLINICAL', // Deliberate mismatch with Q2 Research module!
  qualificationLevel: 'Q2',
  permittedModes: ['RESEARCH'],
  isContradictory: true,
  expectedPattern:
    'Contradictory configuration detected, Clinical action blocked, configuration error visible, zero Target Slate sign-off.',
  clinicalCase: {
    id: 'case-ux-v2-10',
    organisationId: 'org-synthetic-001',
    patientId: 'pat-synth-050',
    caseCode: 'MGN-26-0050',
    state: 'target_slate_ready',
    indicationCode: 'TINNITUS',
    mode: 'CLINICAL',
    version: 1,
    currentPhenotypeSnapshotId: G01_PHENOTYPE.id,
    currentTargetSlateId: GOLDEN_CASE_01_SLATE.id,
    createdAt: '2026-09-01T19:00:00Z',
    updatedAt: '2026-09-01T19:10:00Z',
  },
};

// -------------------------------------------------------------
// 11. §260: v2 UX GOLDEN CASE — MULTIPLE INDICATIONS (MDD + PTSD)
// -------------------------------------------------------------
export const UX_V2_CASE_11_MULTIPLE_INDICATIONS: UXGoldenCaseBundleV2 = {
  id: 'case-ux-v2-11',
  code: 'MGN-26-0051',
  title: 'v2 UX Golden Case 11 — Comorbid Indications (MDD + PTSD Isolation)',
  indicationCode: 'MDD',
  indicationFormatted: 'Major Depressive Disorder (Targeting Indication)',
  mode: 'CLINICAL',
  qualificationLevel: 'Q8',
  permittedModes: ['CLINICAL', 'VALIDATION', 'RESEARCH'],
  expectedPattern:
    'Selected targeting indication explicit, switching indication loads separate context, MDD Slate never displayed under PTSD context.',
  clinicalCase: {
    id: 'case-ux-v2-11',
    organisationId: 'org-synthetic-001',
    patientId: 'pat-synth-051',
    caseCode: 'MGN-26-0051',
    state: 'target_slate_ready',
    indicationCode: 'MDD',
    mode: 'CLINICAL',
    version: 1,
    currentPhenotypeSnapshotId: G02_PHENOTYPE.id,
    currentTargetSlateId: GOLDEN_CASE_02_SLATE.id,
    createdAt: '2026-09-01T20:00:00Z',
    updatedAt: '2026-09-01T20:45:00Z',
  },
  availableIndications: [
    {
      caseIndicationId: 'ci-51-mdd',
      indicationCode: 'MDD',
      label: 'Major Depressive Disorder (Primary Target)',
      isPrimary: true,
      status: 'confirmed',
    },
    {
      caseIndicationId: 'ci-51-ptsd',
      indicationCode: 'PTSD',
      label: 'Post-Traumatic Stress Disorder (Comorbid)',
      isPrimary: false,
      status: 'confirmed',
    },
  ],
};

// -------------------------------------------------------------
// 12. §261: v2 UX GOLDEN CASE — SILENT PROSPECTIVE
// -------------------------------------------------------------
export const UX_V2_CASE_12_SILENT_PROSPECTIVE: UXGoldenCaseBundleV2 = {
  id: 'case-ux-v2-12',
  code: 'MGN-26-0052',
  title: 'v2 UX Golden Case 12 — Silent Prospective Study (Double-Blind)',
  indicationCode: 'STROKE_MOTOR',
  indicationFormatted: 'Post-Stroke Motor Recovery (Study Protocol)',
  mode: 'VALIDATION',
  qualificationLevel: 'Q5',
  permittedModes: ['VALIDATION'],
  isBlindedValidation: true,
  expectedPattern:
    'Treating clinician completes ordinary workflow, hidden MAGNIOM Slate inaccessible before study unblinding, study operator confirms generation.',
  clinicalCase: {
    id: 'case-ux-v2-12',
    organisationId: 'org-synthetic-001',
    patientId: 'pat-synth-052',
    caseCode: 'MGN-26-0052',
    state: 'target_slate_ready',
    indicationCode: 'STROKE_MOTOR',
    mode: 'VALIDATION',
    version: 1,
    currentPhenotypeSnapshotId: G01_PHENOTYPE.id,
    currentTargetSlateId: GOLDEN_CASE_01_SLATE.id,
    createdAt: '2026-09-01T21:00:00Z',
    updatedAt: '2026-09-01T21:30:00Z',
  },
};

// -------------------------------------------------------------
// 13. §262: v2 UX GOLDEN CASE — STALE LESION CONTEXT
// -------------------------------------------------------------
export const UX_V2_CASE_13_STALE_LESION_CONTEXT: UXGoldenCaseBundleV2 = {
  id: 'case-ux-v2-13',
  code: 'MGN-26-0053',
  title: 'v2 UX Golden Case 13 — Stale Lesion Context Post-Generation',
  indicationCode: 'STROKE_MOTOR',
  indicationFormatted: 'Post-Stroke Motor Recovery',
  mode: 'CLINICAL',
  qualificationLevel: 'Q8',
  permittedModes: ['CLINICAL', 'VALIDATION', 'RESEARCH'],
  isStale: true,
  staleReason:
    'Lesion review was updated after Target Slate generation. Invalidation blocking sign-off.',
  expectedPattern:
    'Target Slate stale, signing blocked, regeneration required with updated lesion boundary mask.',
  clinicalCase: {
    id: 'case-ux-v2-13',
    organisationId: 'org-synthetic-001',
    patientId: 'pat-synth-053',
    caseCode: 'MGN-26-0053',
    state: 'target_slate_ready',
    indicationCode: 'STROKE_MOTOR',
    mode: 'CLINICAL',
    version: 1,
    currentPhenotypeSnapshotId: G01_PHENOTYPE.id,
    currentTargetSlateId: GOLDEN_CASE_01_SLATE.id,
    createdAt: '2026-09-01T22:00:00Z',
    updatedAt: '2026-09-01T22:50:00Z',
  },
  diseaseStage: {
    stageCode: 'SUBACUTE',
    stageLabel: 'Subacute Stage (30 days post-stroke)',
    determinationMethod: 'combined',
    isSubacuteOrAcute: true,
  },
  lesionContext: {
    hasLesion: true,
    lesionType: 'ischemic',
    laterality: 'left',
    interpretation:
      'Secondary neuroradiology review expanded perilesional ischemic penumbra boundary.',
    affectedRegionsCount: 3,
    hasTargetOverlapWarning: false,
    skullAbnormalityPresent: false,
  },
};

export const ALL_UX_GOLDEN_CASES_V2: readonly UXGoldenCaseBundleV2[] = [
  UX_V2_CASE_01_MDD_CLINICAL,
  UX_V2_CASE_02_PAIN_MOTOR_MAP,
  UX_V2_CASE_03_PAIN_MOTOR_MAP_FAILURE,
  UX_V2_CASE_04_STROKE_LESION,
  UX_V2_CASE_05_STROKE_STAGE_MISMATCH,
  UX_V2_CASE_06_OCD_FIELD_TARGET,
  UX_V2_CASE_07_APHASIA_CONTEXT,
  UX_V2_CASE_08_TBI_RESEARCH,
  UX_V2_CASE_09_TINNITUS_RESEARCH,
  UX_V2_CASE_10_MODULE_AUTHORITY_CONFLICT,
  UX_V2_CASE_11_MULTIPLE_INDICATIONS,
  UX_V2_CASE_12_SILENT_PROSPECTIVE,
  UX_V2_CASE_13_STALE_LESION_CONTEXT,
];
