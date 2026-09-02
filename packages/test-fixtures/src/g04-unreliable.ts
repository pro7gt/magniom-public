import type {
  PhenotypeSnapshot,
  TargetCandidate,
  TargetSlate,
  TargetReliabilityProfile,
} from '@magniom/domain';
import { computeSha256 } from '@magniom/scientific-policy';
import { EvidenceKnowledgeGraph, CANONICAL_EVIDENCE_RELEASE_1_0_0 } from '@magniom/evidence';

const graph = new EvidenceKnowledgeGraph(CANONICAL_EVIDENCE_RELEASE_1_0_0);

export const G04_PHENOTYPE: PhenotypeSnapshot = {
  id: 'snap-golden-04',
  patientId: 'synth-pat-g04',
  primaryDiagnosis: 'Major Depressive Disorder, Recurrent, Severe without Psychotic Features',
  episodeSeverity: 'SEVERE_WITHOUT_PSYCHOSIS',
  diagnosisAssertion: {
    code: 'MDD',
    display: 'Major Depressive Disorder',
    status: 'confirmed',
    diagnosticSystem: 'DSM-5',
  },
  episodeProfile: {
    active: true,
    severity: 'SEVERE_WITHOUT_PSYCHOSIS',
    durationMonths: 18,
    treatmentResistanceStage: 3,
  },
  safetyClearance: 'cleared',
  symptomScores: {
    dysphoriaScore: 0.95,
    anhedoniaScore: 0.85,
    anxiousSomaticScore: 0.4,
    ruminationScore: 0.7,
  },
  symptomPriorities: [
    {
      domainCode: 'DOMAIN-MDD-DYSPHORIC-001',
      priorityRank: 1,
      clinicianWeight: 1.0,
      evidenceMappability: 'direct',
      rationale: 'Severe debilitating depressive mood state.',
    },
  ],
  treatmentHistory: {
    medicationFailuresCount: 3,
    priorTmsExposure: false,
  },
  phenotypeConfidence: 'HIGH',
  clinicianSummary: 'Synthetic severe recurrent MDD case with severe head motion during rs-fMRI.',
  confirmedByClinicianId: 'clin-demo-001',
  confirmedAt: '2026-09-01T10:00:00.000Z',
  snapshotHash: computeSha256({
    patientId: 'synth-pat-g04',
    diagnosis: 'MDD',
    scores: { dysphoria: 0.95, anhedonia: 0.85, anxiousSomatic: 0.4, rumination: 0.7 },
  }),
};

export const G04_RELIABILITY_PROFILE: TargetReliabilityProfile = {
  candidateId: 'cand-g04-unreliable-fc',
  scanDurationMinutes: 4.0, // Failed duration (< 10 min)
  meanFramewiseDisplacementMm: 0.55, // Failed FD (> 0.25 mm)
  retainedFramesPercentage: 42.0, // Failed retained frames (< 70%)
  temporalSnr: 45.0, // Failed tSNR (< 80)
  overallReliabilityScore: 0.42, // Composite reliability score below 0.70 threshold
  isReliableForPersonalisation: false,
  warnings: [
    'EXCESSIVE_MOTION_FD_EXCEEDED',
    'SCAN_DURATION_INSUFFICIENT',
    'LOW_TEMPORAL_SNR',
    'HIGH_MOTION_ARTIFACT',
  ],
};

export const G04_CONNECTOME = {
  schemaVersion: 'synthetic-connectome/1.0',
  quality: 'fail' as const,
  reliabilityProfile: G04_RELIABILITY_PROFILE,
  candidates: [
    {
      candidateCode: 'SYN-UNRELIABLE-G04',
      targetFamilyCode: 'TF-MDD-CONVERGENT-LDLPFC-001',
      reliabilityScore: 0.42,
      circuitConcordance: 0.95,
      baselineCircuitConcordance: 0.65,
      mniCoordinate: {
        space: 'MNI152NLin2009cAsym' as const,
        x: -58,
        y: 20,
        z: 40,
        unit: 'mm' as const,
      },
      accessibility: 'good',
    },
  ],
};

export const G04_PRIMARY_1: TargetCandidate = {
  id: 'cand-g04-evidence-ldlpfc',
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
  phenotypeConcordanceScore: 1.0,
  overallScore: 0.97,
  rationale:
    'Standard evidence baseline enforced because FC failed reliability gate (reliability 0.42 < 0.70 threshold).',
  contraindicationsOrConflicts: ['LIMITED_FC_RELIABILITY'],
  isSuppressedOrRedundant: false,
  evidencePaths: graph.findEvidencePaths('TF-MDD-LDLPFC-EST-001'),
  conflictingEvidence: graph.getConflictingClaims('TF-MDD-LDLPFC-EST-001'),
  counterarguments: [
    'LIMITED_FC_RELIABILITY',
    'Fixed group anchor does not account for patient-specific functional anatomy variations.',
  ],
};

export const G04_SUPPRESSED_CANDIDATE: TargetCandidate = {
  id: 'cand-g04-unreliable-fc',
  familyId: 'TF-MDD-CONVERGENT-LDLPFC-001',
  circuitId: 'CIRCUIT-MDD-CONVERGENT-001',
  role: 'RESERVE',
  method: 'CONNECTOME_REFINED',
  evidenceTier: 'T1',
  mniCoordinate: {
    space: 'MNI152NLin2009cAsym',
    x: -58,
    y: 20,
    z: 40,
    unit: 'mm',
  },
  evidenceScore: 0.95,
  phenotypeConcordanceScore: 1.0,
  connectomeRefinementScore: 0.95,
  overallScore: 0.45,
  rationale:
    'Suppressed: extreme connectivity concordance (0.95) disqualified due to severe unreliability (score 0.42).',
  contraindicationsOrConflicts: ['LIMITED_FC_RELIABILITY', 'HIGH_MOTION_ARTIFACT'],
  isSuppressedOrRedundant: true,
  suppressionReason: 'LOW_RELIABILITY',
  evidencePaths: graph.findEvidencePaths('TF-MDD-CONVERGENT-LDLPFC-001'),
  conflictingEvidence: graph.getConflictingClaims('TF-MDD-CONVERGENT-LDLPFC-001'),
  counterarguments: [
    'LIMITED_FC_RELIABILITY',
    'HIGH_MOTION_ARTIFACT',
    'Personalised fMRI targeting does not establish universal superiority across all unselected patients (EC-PERSONALISED-SUPERIORITY-001).',
  ],
};

const g04SlatePayload = {
  id: 'slate-golden-04',
  caseId: 'case-golden-04',
  phenotypeSnapshotId: G04_PHENOTYPE.id,
  scientificPolicyVersion: 'MAGNIOM-POLICY-MDD-1.0.0',
  evidenceReleaseVersion: 'MAGNIOM-EVIDENCE-1.0.0',
  generatedAt: '2026-09-01T10:20:00.000Z',
  mode: 'CLINICAL' as const,
  primaryCandidates: [G04_PRIMARY_1],
  additionalCandidates: [],
  suppressedCandidates: [G04_SUPPRESSED_CANDIDATE],
  personalisationQualification: 'ineligible' as const,
  clinicalCoverageProfile: {
    primaryDomainCovered: 'DOMAIN-MDD-DYSPHORIC-001',
    secondaryDomainsCovered: [],
    overallClinicalCoverageScore: 1.0,
  },
};

export const GOLDEN_CASE_04_SLATE: TargetSlate = {
  ...g04SlatePayload,
  deterministicManifestHash: computeSha256(g04SlatePayload),
};

export const GOLDEN_CASE_04 = {
  caseCode: 'G04',
  title: 'G04 — Dramatic but Unreliable Connectome',
  phenotype: G04_PHENOTYPE,
  connectome: G04_CONNECTOME,
  expectedSlate: GOLDEN_CASE_04_SLATE,
};
