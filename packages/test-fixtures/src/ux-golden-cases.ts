/**
 * @magniom/test-fixtures
 * UX Golden Cases (G01–G09) conforming to MAGNIOM-Clinician Workspace & UX Specification v1.0 Sections 195–203.
 * 100% Synthetic — Zero PHI.
 */

import type {
  ClinicalCase,
  PhenotypeSnapshot,
  TargetSlate,
  ClinicianDecision,
  TargetCandidate,
} from '@magniom/domain';

import { G01_PHENOTYPE, GOLDEN_CASE_01_SLATE } from './g01-evidence-only.js';
import { G02_PHENOTYPE, GOLDEN_CASE_02_SLATE } from './g02-convergent.js';
import { G04_PHENOTYPE, GOLDEN_CASE_04_SLATE } from './g04-unreliable.js';
import { G05_PHENOTYPE, GOLDEN_CASE_05_SLATE } from './g05-anxiosomatic.js';
import { G08_PHENOTYPE, GOLDEN_CASE_08_CLINICAL_SLATE } from './g08-research-ceiling.js';

export interface UXGoldenCaseBundle {
  readonly id: string;
  readonly code: string;
  readonly title: string;
  readonly expectedPattern: string;
  readonly clinicalCase: ClinicalCase;
  readonly phenotype: PhenotypeSnapshot;
  readonly slate: TargetSlate;
  readonly isStale?: boolean;
  readonly staleReason?: string;
  readonly initialDecision?: ClinicianDecision;
}

// -------------------------------------------------------------
// G01: High Convergence (One strong Primary + Evidence baseline)
// -------------------------------------------------------------
export const UX_GOLDEN_CASE_01: UXGoldenCaseBundle = {
  id: 'case-ux-g01',
  code: 'MGN-26-0001',
  title: 'UX Golden Case 1 — High Convergence MDD',
  expectedPattern:
    'One strong Primary 1 with evidence-only reference visible as alternative; high convergence (Δ ≤ 12mm); no artificial Primary 2 duplication.',
  clinicalCase: {
    id: 'case-ux-g01',
    organisationId: 'org-synthetic-001',
    patientId: 'pat-synth-001',
    caseCode: 'MGN-26-0001',
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
  slate: { ...GOLDEN_CASE_02_SLATE, caseId: 'case-ux-g01' },
};

// -------------------------------------------------------------
// G02: Anxious Depression (Dual-Circuit Hypotheses)
// -------------------------------------------------------------
export const UX_GOLDEN_CASE_02: UXGoldenCaseBundle = {
  id: 'case-ux-g02',
  code: 'MGN-26-0002',
  title: 'UX Golden Case 2 — Anxious Depression Dual Circuit',
  expectedPattern:
    'Evidence anchor (Primary 1) and anxiosomatic hypothesis (Primary 2) both visible with distinct clinical purposes; neither displayed as universal winner.',
  clinicalCase: {
    id: 'case-ux-g02',
    organisationId: 'org-synthetic-001',
    patientId: 'pat-synth-002',
    caseCode: 'MGN-26-0002',
    state: 'target_slate_ready',
    indicationCode: 'MDD_ANXIOUS',
    mode: 'CLINICAL',
    version: 1,
    currentPhenotypeSnapshotId: G05_PHENOTYPE.id,
    currentTargetSlateId: GOLDEN_CASE_05_SLATE.id,
    createdAt: '2026-09-01T11:00:00Z',
    updatedAt: '2026-09-01T11:30:00Z',
  },
  phenotype: G05_PHENOTYPE,
  slate: { ...GOLDEN_CASE_05_SLATE, caseId: 'case-ux-g02' },
};

// -------------------------------------------------------------
// G03: Low Reliability Connectome
// -------------------------------------------------------------
export const UX_GOLDEN_CASE_03: UXGoldenCaseBundle = {
  id: 'case-ux-g03',
  code: 'MGN-26-0003',
  title: 'UX Golden Case 3 — Low Reliability Connectome',
  expectedPattern:
    'Personalised location displayed for context only with prominent "Not used for ranking" badge; evidence anchor dominates by scientific reason.',
  clinicalCase: {
    id: 'case-ux-g03',
    organisationId: 'org-synthetic-001',
    patientId: 'pat-synth-003',
    caseCode: 'MGN-26-0003',
    state: 'target_slate_ready',
    indicationCode: 'MDD',
    mode: 'CLINICAL',
    version: 1,
    currentPhenotypeSnapshotId: G04_PHENOTYPE.id,
    currentTargetSlateId: GOLDEN_CASE_04_SLATE.id,
    createdAt: '2026-09-01T12:00:00Z',
    updatedAt: '2026-09-01T12:30:00Z',
  },
  phenotype: G04_PHENOTYPE,
  slate: { ...GOLDEN_CASE_04_SLATE, caseId: 'case-ux-g03' },
};

// -------------------------------------------------------------
// G04: Low Convergence (Divergent Hypotheses)
// -------------------------------------------------------------
const lowConvergencePrimary2: TargetCandidate = {
  id: 'tc-g04-lowconv-p2',
  familyId: 'TF-MDD-L-DLPFC-001',
  circuitId: 'CIRCUIT-MDD-DLPFC-001',
  role: 'PRIMARY_2',
  method: 'CONNECTOME_REFINED',
  evidenceTier: 'T2',
  mniCoordinate: { space: 'MNI152NLin2009cAsym', x: -30.0, y: 15.0, z: 52.0 },
  evidenceScore: 0.85,
  phenotypeConcordanceScore: 0.82,
  overallScore: 0.72,
  rationale: 'Divergent functional connectivity cluster located in dorsal superior frontal cortex.',
  contraindicationsOrConflicts: [
    'Peak coordinate is > 30 mm away from standard evidence reference.',
  ],
  isSuppressedOrRedundant: false,
};

const LOW_CONVERGENCE_SLATE: TargetSlate = {
  ...GOLDEN_CASE_02_SLATE,
  id: 'slate-ux-g04-lowconv',
  caseId: 'case-ux-g04',
  primaryCandidates: [
    GOLDEN_CASE_02_SLATE.primaryCandidates[0] || lowConvergencePrimary2,
    lowConvergencePrimary2,
  ],
};

export const UX_GOLDEN_CASE_04: UXGoldenCaseBundle = {
  id: 'case-ux-g04',
  code: 'MGN-26-0004',
  title: 'UX Golden Case 4 — Low Convergence Divergence',
  expectedPattern:
    'Disagreement clearly visible with Low Convergence warning; no compromise target invented; clinician prompted to inspect competing bases.',
  clinicalCase: {
    id: 'case-ux-g04',
    organisationId: 'org-synthetic-001',
    patientId: 'pat-synth-004',
    caseCode: 'MGN-26-0004',
    state: 'target_slate_ready',
    indicationCode: 'MDD',
    mode: 'CLINICAL',
    version: 1,
    currentPhenotypeSnapshotId: G02_PHENOTYPE.id,
    currentTargetSlateId: LOW_CONVERGENCE_SLATE.id,
    createdAt: '2026-09-01T13:00:00Z',
    updatedAt: '2026-09-01T13:30:00Z',
  },
  phenotype: G02_PHENOTYPE,
  slate: LOW_CONVERGENCE_SLATE,
};

// -------------------------------------------------------------
// G05: Research Mode Anomaly
// -------------------------------------------------------------
export const UX_GOLDEN_CASE_05: UXGoldenCaseBundle = {
  id: 'case-ux-g05',
  code: 'MGN-26-0005',
  title: 'UX Golden Case 5 — Research Mode Anomaly',
  expectedPattern:
    'Prominent Research Mode Banner; Tier Exp experimental targets visible; Clinical "Accept & Sign" disabled for experimental targets.',
  clinicalCase: {
    id: 'case-ux-g05',
    organisationId: 'org-synthetic-001',
    patientId: 'pat-synth-005',
    caseCode: 'MGN-26-0005-RES',
    state: 'target_slate_ready',
    indicationCode: 'MDD_RESEARCH',
    mode: 'RESEARCH',
    version: 1,
    currentPhenotypeSnapshotId: G08_PHENOTYPE.id,
    currentTargetSlateId: GOLDEN_CASE_08_CLINICAL_SLATE.id,
    createdAt: '2026-09-01T14:00:00Z',
    updatedAt: '2026-09-01T14:30:00Z',
  },
  phenotype: G08_PHENOTYPE,
  slate: { ...GOLDEN_CASE_08_CLINICAL_SLATE, caseId: 'case-ux-g05' },
};

// -------------------------------------------------------------
// G06: Stale Slate (Phenotype updated after slate generation)
// -------------------------------------------------------------
export const UX_GOLDEN_CASE_06: UXGoldenCaseBundle = {
  id: 'case-ux-g06',
  code: 'MGN-26-0006',
  title: 'UX Golden Case 6 — Stale Target Slate',
  expectedPattern:
    'Staleness warning immediately displayed in header; Sign Target Decision button disabled; "Regenerate Slate" prompt visible.',
  clinicalCase: {
    id: 'case-ux-g06',
    organisationId: 'org-synthetic-001',
    patientId: 'pat-synth-006',
    caseCode: 'MGN-26-0006',
    state: 'target_slate_ready',
    indicationCode: 'MDD',
    mode: 'CLINICAL',
    version: 2,
    currentPhenotypeSnapshotId: 'snap-synth-new-006',
    currentTargetSlateId: GOLDEN_CASE_01_SLATE.id,
    createdAt: '2026-09-01T15:00:00Z',
    updatedAt: '2026-09-01T15:45:00Z',
  },
  phenotype: {
    ...G01_PHENOTYPE,
    id: 'snap-synth-new-006',
    symptomScores: { ...G01_PHENOTYPE.symptomScores, anxiousSomaticScore: 9 },
  },
  slate: {
    ...GOLDEN_CASE_01_SLATE,
    caseId: 'case-ux-g06',
    phenotypeSnapshotId: 'snap-synth-old-006',
  },
  isStale: true,
  staleReason:
    'Target Slate was generated before the latest clinical phenotype update (Anxiosomatic score changed).',
};

// -------------------------------------------------------------
// G07: Clinician Override (Rejected Primary 1 + Structured Reason)
// -------------------------------------------------------------
const SIGNED_OVERRIDE_DECISION: ClinicianDecision = {
  id: 'dec-ux-g07',
  caseId: 'case-ux-g07',
  slateId: GOLDEN_CASE_02_SLATE.id,
  clinicianId: 'clin-specialist-001',
  status: 'completed',
  decisionType: 'SUBSTITUTED_ALTERNATIVE',
  selectedCandidateIds: [GOLDEN_CASE_02_SLATE.additionalCandidates[0]?.id || 'tc-g02-additional-a'],
  candidateDecisions: [
    {
      targetCandidateId: GOLDEN_CASE_02_SLATE.primaryCandidates[0]?.id || 'tc-p1-fallback',
      action: 'reject',
      reasonCodes: ['Patient preference / prior response', 'Clinician judgement'],
      freeTextReason:
        'Patient had excellent previous remission on standard F3 protocol; opting for established baseline.',
      evidenceReviewed: true,
      reliabilityReviewed: true,
      counterargumentsReviewed: true,
    },
    {
      targetCandidateId: GOLDEN_CASE_02_SLATE.additionalCandidates[0]?.id || 'tc-g02-additional-a',
      action: 'accept',
      reasonCodes: ['Prior response', 'Strong evidence'],
      freeTextReason: 'Proven prior clinical responsiveness with Beam F3 coordinate.',
      evidenceReviewed: true,
      reliabilityReviewed: true,
      counterargumentsReviewed: true,
    },
  ],
  overallReasoning:
    'Treating clinician selected standard evidence reference over connectome refinement based on documented past treatment response.',
  magniomInfluence: 'minor',
  disagreementWithMagniom:
    'Prior treatment history favored standard coordinates over novel personalised displacement.',
  decidedAt: '2026-09-01T16:20:00Z',
  attestation: {
    clinicianId: 'clin-specialist-001',
    clinicianName: 'Dr. Sarah Lin, MD, FRANZCP',
    licenseNumber: 'MED-TMS-99281',
    statement:
      'I have independently reviewed the clinical context, evidence provenance, target reliability, alternatives and limitations. The final target selection represents my clinical decision and not an autonomous Magniom prescription.',
    signedAt: '2026-09-01T16:20:00Z',
    digitalSignatureHash: 'a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890',
  },
  digitalSignatureHash: 'a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890',
  isImmutable: true,
  reviewedCounterfactuals: true,
  reviewedConflictingEvidence: true,
};

export const UX_GOLDEN_CASE_07: UXGoldenCaseBundle = {
  id: 'case-ux-g07',
  code: 'MGN-26-0007',
  title: 'UX Golden Case 7 — Clinician Override Decision',
  expectedPattern:
    'Override straightforward; structured rationale required; no threatening "Are you sure?" language; immutable signed state.',
  clinicalCase: {
    id: 'case-ux-g07',
    organisationId: 'org-synthetic-001',
    patientId: 'pat-synth-007',
    caseCode: 'MGN-26-0007',
    state: 'decision_signed',
    indicationCode: 'MDD',
    mode: 'CLINICAL',
    version: 1,
    currentPhenotypeSnapshotId: G02_PHENOTYPE.id,
    currentTargetSlateId: GOLDEN_CASE_02_SLATE.id,
    createdAt: '2026-09-01T16:00:00Z',
    updatedAt: '2026-09-01T16:20:00Z',
  },
  phenotype: G02_PHENOTYPE,
  slate: { ...GOLDEN_CASE_02_SLATE, caseId: 'case-ux-g07' },
  initialDecision: SIGNED_OVERRIDE_DECISION,
};

// -------------------------------------------------------------
// G08: No Target Selected (Deferred TMS Pathway)
// -------------------------------------------------------------
const SIGNED_NO_TARGET_DECISION: ClinicianDecision = {
  id: 'dec-ux-g08',
  caseId: 'case-ux-g08',
  slateId: GOLDEN_CASE_01_SLATE.id,
  clinicianId: 'clin-specialist-001',
  status: 'completed',
  decisionType: 'DEFERRED',
  selectedCandidateIds: [],
  candidateDecisions: [
    {
      targetCandidateId: GOLDEN_CASE_01_SLATE.primaryCandidates[0]?.id || 'tc-p1-fallback',
      action: 'defer',
      reasonCodes: ['Clinical reassessment needed', 'Patient preference'],
      freeTextReason:
        'Patient developed emergent medical condition requiring pharmacological stabilization prior to TMS course.',
      evidenceReviewed: true,
      reliabilityReviewed: true,
      counterargumentsReviewed: true,
    },
  ],
  overallReasoning:
    'TMS course deferred pending medical stabilization. No cortical target selected at this time.',
  magniomInfluence: 'none',
  decidedAt: '2026-09-01T17:00:00Z',
  attestation: {
    clinicianId: 'clin-specialist-001',
    clinicianName: 'Dr. Sarah Lin, MD, FRANZCP',
    licenseNumber: 'MED-TMS-99281',
    statement:
      'I have independently reviewed the clinical context and determined that TMS treatment is deferred.',
    signedAt: '2026-09-01T17:00:00Z',
    digitalSignatureHash: 'b2c3d4e5f67890a1bcdef1234567890abcdef1234567890abcdef1234567890a',
  },
  digitalSignatureHash: 'b2c3d4e5f67890a1bcdef1234567890abcdef1234567890abcdef1234567890a',
  isImmutable: true,
  reviewedCounterfactuals: true,
  reviewedConflictingEvidence: true,
};

export const UX_GOLDEN_CASE_08: UXGoldenCaseBundle = {
  id: 'case-ux-g08',
  code: 'MGN-26-0008',
  title: 'UX Golden Case 8 — No Target / TMS Plan Deferred',
  expectedPattern:
    'Clinician can complete decision with no target selected; no error; valid clinical deferral pathway.',
  clinicalCase: {
    id: 'case-ux-g08',
    organisationId: 'org-synthetic-001',
    patientId: 'pat-synth-008',
    caseCode: 'MGN-26-0008',
    state: 'decision_signed',
    indicationCode: 'MDD',
    mode: 'CLINICAL',
    version: 1,
    currentPhenotypeSnapshotId: G01_PHENOTYPE.id,
    currentTargetSlateId: GOLDEN_CASE_01_SLATE.id,
    createdAt: '2026-09-01T16:30:00Z',
    updatedAt: '2026-09-01T17:00:00Z',
  },
  phenotype: G01_PHENOTYPE,
  slate: { ...GOLDEN_CASE_01_SLATE, caseId: 'case-ux-g08' },
  initialDecision: SIGNED_NO_TARGET_DECISION,
};

// -------------------------------------------------------------
// G09: Modified Target Coordinate
// -------------------------------------------------------------
export const UX_GOLDEN_CASE_09: UXGoldenCaseBundle = {
  id: 'case-ux-g09',
  code: 'MGN-26-0009',
  title: 'UX Golden Case 9 — Modified Target Coordinate',
  expectedPattern:
    'Clinician adjusts MNI coordinate; live delta distance calculated; original candidate preserved immutably.',
  clinicalCase: {
    id: 'case-ux-g09',
    organisationId: 'org-synthetic-001',
    patientId: 'pat-synth-009',
    caseCode: 'MGN-26-0009',
    state: 'target_slate_ready',
    indicationCode: 'MDD',
    mode: 'CLINICAL',
    version: 1,
    currentPhenotypeSnapshotId: G02_PHENOTYPE.id,
    currentTargetSlateId: GOLDEN_CASE_02_SLATE.id,
    createdAt: '2026-09-01T17:30:00Z',
    updatedAt: '2026-09-01T18:00:00Z',
  },
  phenotype: G02_PHENOTYPE,
  slate: { ...GOLDEN_CASE_02_SLATE, caseId: 'case-ux-g09' },
};

export const ALL_UX_GOLDEN_CASES: readonly UXGoldenCaseBundle[] = [
  UX_GOLDEN_CASE_01,
  UX_GOLDEN_CASE_02,
  UX_GOLDEN_CASE_03,
  UX_GOLDEN_CASE_04,
  UX_GOLDEN_CASE_05,
  UX_GOLDEN_CASE_06,
  UX_GOLDEN_CASE_07,
  UX_GOLDEN_CASE_08,
  UX_GOLDEN_CASE_09,
];
