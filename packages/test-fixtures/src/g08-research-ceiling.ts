/**
 * Golden Case G08 — Research Ceiling & Multi-Circuit Research Exploration
 * Conforms to MAGNIOM-Synthetic Vertical Slice Implementation Specification v1.0 & Sprint 4 Exit Criteria.
 * 100% synthetic data — zero PHI.
 */

import type {
  PhenotypeSnapshot,
  TargetCandidate,
  TargetSlate,
  TargetReliabilityProfile,
} from '@magniom/domain';
import { computeSha256 } from '@magniom/scientific-policy';
import { EvidenceKnowledgeGraph, CANONICAL_EVIDENCE_RELEASE_1_0_0 } from '@magniom/evidence';

const graph = new EvidenceKnowledgeGraph(CANONICAL_EVIDENCE_RELEASE_1_0_0);

export const G08_PHENOTYPE: PhenotypeSnapshot = {
  id: 'snap-golden-08',
  patientId: 'synth-pat-g08',
  primaryDiagnosis: 'Major Depressive Disorder with Comorbid Generalized Anxiety (Research Protocol)',
  episodeSeverity: 'SEVERE_WITHOUT_PSYCHOSIS',
  diagnosisAssertion: {
    code: 'MDD',
    display: 'Major Depressive Disorder with Comorbid Anxiety Protocol',
    status: 'confirmed',
    diagnosticSystem: 'DSM-5',
  },
  episodeProfile: {
    active: true,
    severity: 'SEVERE_WITHOUT_PSYCHOSIS',
    durationMonths: 24,
    treatmentResistanceStage: 3,
  },
  safetyClearance: 'cleared',
  symptomScores: {
    dysphoriaScore: 0.85,
    anhedoniaScore: 0.80,
    anxiousSomaticScore: 0.90,
    ruminationScore: 0.85,
  },
  symptomPriorities: [
    {
      domainCode: 'DOMAIN-MDD-DYSPHORIC-001',
      priorityRank: 1,
      clinicianWeight: 0.9,
      evidenceMappability: 'direct',
      rationale: 'Severe treatment-resistant depression.',
    },
    {
      domainCode: 'DOMAIN-MDD-ANXIOSOMATIC-001',
      priorityRank: 2,
      clinicianWeight: 0.85,
      evidenceMappability: 'direct',
      rationale: 'Severe comorbid anxiety exploring cingulo-opercular circuits in research protocol.',
    },
  ],
  treatmentHistory: {
    medicationFailuresCount: 3,
    priorTmsExposure: false,
  },
  phenotypeConfidence: 'HIGH',
  clinicianSummary: 'Synthetic research cohort patient evaluating Tier 4 causal anxiety circuit targets.',
  confirmedByClinicianId: 'clin-research-001',
  confirmedAt: '2026-09-01T10:00:00.000Z',
  snapshotHash: computeSha256({
    patientId: 'synth-pat-g08',
    diagnosis: 'MDD-GAD-Research',
    scores: { dysphoria: 0.85, anhedonia: 0.8, anxiousSomatic: 0.9, rumination: 0.85 },
  }),
};

export const G08_RELIABILITY_PROFILE: TargetReliabilityProfile = {
  candidateId: 'cand-g08-cing-l8av-research',
  scanDurationMinutes: 12.0,
  meanFramewiseDisplacementMm: 0.12,
  retainedFramesPercentage: 96.5,
  temporalSnr: 125.0,
  splitHalfLocalisationDistanceMm: 1.8,
  overallReliabilityScore: 0.91,
  isReliableForPersonalisation: true,
  warnings: [],
};

export const G08_CONNECTOME = {
  schemaVersion: 'synthetic-connectome/1.0',
  quality: 'pass' as const,
  reliabilityProfile: G08_RELIABILITY_PROFILE,
  candidates: [
    {
      candidateCode: 'SYN-RESEARCH-CING-L8AV',
      targetFamilyCode: 'TF-RES-CING-L8AV-001',
      reliabilityScore: 0.91,
      circuitConcordance: 0.89,
      baselineCircuitConcordance: 0.60,
      mniCoordinate: {
        space: 'MNI152NLin2009cAsym' as const,
        x: -26,
        y: 38,
        z: 48,
        unit: 'mm' as const,
      },
      surfaceVertex: {
        space: 'fsLR_32k' as const,
        hemisphere: 'L' as const,
        vertexIndex: 12490,
        parcelName: '8Av_L',
      },
      accessibility: 'good',
    },
  ],
};

export const G08_CLINICAL_PRIMARY_1: TargetCandidate = {
  id: 'cand-g08-evidence-ldlpfc',
  familyId: 'TF-MDD-LDLPFC-EST-001',
  circuitId: 'CIRCUIT-MDD-LDLPFC-001',
  role: 'PRIMARY_1',
  method: 'EVIDENCE_ONLY_PRIOR',
  evidenceTier: 'T1',
  mniCoordinate: {
    space: 'MNI152NLin2009cAsym',
    x: -38,
    y: 44,
    z: 30,
    unit: 'mm',
  },
  evidenceScore: 0.95,
  phenotypeConcordanceScore: 0.98,
  overallScore: 0.96,
  rationale: 'Standard evidence-based left prefrontal depression anchor (no connectome available).',
  contraindicationsOrConflicts: [],
  isSuppressedOrRedundant: false,
  evidencePaths: graph.findEvidencePaths('TF-MDD-LDLPFC-EST-001'),
  conflictingEvidence: graph.getConflictingClaims('TF-MDD-LDLPFC-EST-001'),
  counterarguments: ['Fixed group anchor does not account for patient-specific functional anatomy variations.'],
};

export const G08_CLINICAL_PRIMARY_2: TargetCandidate = {
  id: 'cand-g08-anxiosomatic-dmpfc',
  familyId: 'TF-MDD-ANXIOSOMATIC-DMPFC-001',
  circuitId: 'CIRCUIT-MDD-ANXIOSOMATIC-001',
  role: 'PRIMARY_2',
  method: 'EVIDENCE_ONLY_PRIOR',
  evidenceTier: 'T2',
  mniCoordinate: {
    space: 'MNI152NLin2009cAsym',
    x: 0,
    y: 48,
    z: 46,
    unit: 'mm',
  },
  evidenceScore: 0.88,
  phenotypeConcordanceScore: 0.85,
  overallScore: 0.86,
  rationale:
    'Distinct clinical hypothesis: Anxiosomatic DMPFC circuit target (BA9/32, MNI [0,48,46]) derived from 2026 randomized prospective circuit trial for prominent anxiety.',
  contraindicationsOrConflicts: [],
  isSuppressedOrRedundant: false,
  evidencePaths: graph.findEvidencePaths('TF-MDD-ANXIOSOMATIC-DMPFC-001'),
  conflictingEvidence: graph.getConflictingClaims('TF-MDD-ANXIOSOMATIC-DMPFC-001'),
  counterarguments: ['Fixed group anchor does not account for patient-specific functional anatomy variations.'],
};

const g08ClinicalSlatePayload = {
  id: 'slate-snap-golden-08',
  caseId: 'case-synth-pat-g08',
  phenotypeSnapshotId: G08_PHENOTYPE.id,
  scientificPolicyVersion: 'MAGNIOM-POLICY-MDD-1.0.0',
  evidenceReleaseVersion: 'MAGNIOM-EVIDENCE-1.0.0',
  generatedAt: '2026-09-01T10:00:00.000Z',
  mode: 'CLINICAL' as const,
  primaryCandidates: [G08_CLINICAL_PRIMARY_1, G08_CLINICAL_PRIMARY_2],
  additionalCandidates: [],
  suppressedCandidates: [],
  personalisationQualification: 'qualified' as const,
  clinicalCoverageProfile: {
    primaryDomainCovered: 'DOMAIN-MDD-DYSPHORIC-001',
    secondaryDomainsCovered: ['DOMAIN-MDD-ANXIOSOMATIC-001'],
    overallClinicalCoverageScore: 0.98,
  },
};

export const GOLDEN_CASE_08_CLINICAL_SLATE: TargetSlate = {
  ...g08ClinicalSlatePayload,
  deterministicManifestHash: computeSha256(g08ClinicalSlatePayload),
};

export const GOLDEN_CASE_08 = {
  caseCode: 'G08',
  title: 'G08 — Research Ceiling & Multi-Circuit Exploration',
  phenotype: G08_PHENOTYPE,
  connectome: G08_CONNECTOME,
  expectedSlate: GOLDEN_CASE_08_CLINICAL_SLATE,
};
