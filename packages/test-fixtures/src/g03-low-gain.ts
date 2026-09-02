import type { PhenotypeSnapshot, TargetCandidate, TargetSlate, TargetReliabilityProfile } from '@magniom/domain';
import { computeSha256 } from '@magniom/scientific-policy';
import { EvidenceKnowledgeGraph, CANONICAL_EVIDENCE_RELEASE_1_0_0 } from '@magniom/evidence';

const graph = new EvidenceKnowledgeGraph(CANONICAL_EVIDENCE_RELEASE_1_0_0);

export const G03_PHENOTYPE: PhenotypeSnapshot = {
  id: 'snap-golden-03',
  patientId: 'synth-pat-g03',
  primaryDiagnosis: 'Major Depressive Disorder, Single Episode, Moderate without Psychotic Features',
  episodeSeverity: 'MODERATE',
  diagnosisAssertion: {
    code: 'MDD',
    display: 'Major Depressive Disorder',
    status: 'confirmed',
    diagnosticSystem: 'DSM-5',
  },
  episodeProfile: {
    active: true,
    severity: 'MODERATE',
    durationMonths: 6,
    treatmentResistanceStage: 1,
  },
  safetyClearance: 'cleared',
  symptomScores: {
    dysphoriaScore: 0.8,
    anhedoniaScore: 0.65,
    anxiousSomaticScore: 0.3,
    ruminationScore: 0.55,
  },
  symptomPriorities: [
    {
      domainCode: 'DOMAIN-MDD-DYSPHORIC-001',
      priorityRank: 1,
      clinicianWeight: 0.85,
      evidenceMappability: 'direct',
      rationale: 'Primary target is core dysphoric mood symptoms.',
    },
  ],
  treatmentHistory: {
    medicationFailuresCount: 1,
    priorTmsExposure: false,
  },
  phenotypeConfidence: 'HIGH',
  clinicianSummary: 'Synthetic moderate MDD case where connectome provides minimal gain over evidence baseline.',
  confirmedByClinicianId: 'clin-demo-001',
  confirmedAt: '2026-09-01T10:00:00.000Z',
  snapshotHash: computeSha256({
    patientId: 'synth-pat-g03',
    diagnosis: 'MDD',
    scores: { dysphoria: 0.8, anhedonia: 0.65, anxiousSomatic: 0.3, rumination: 0.55 },
  }),
};

export const G03_RELIABILITY_PROFILE: TargetReliabilityProfile = {
  candidateId: 'cand-g03-low-gain-fc',
  scanDurationMinutes: 10.0,
  meanFramewiseDisplacementMm: 0.18,
  retainedFramesPercentage: 88.0,
  temporalSnr: 95.0,
  splitHalfLocalisationDistanceMm: 3.2,
  overallReliabilityScore: 0.78,
  isReliableForPersonalisation: true,
  warnings: [],
};

export const G03_CONNECTOME = {
  schemaVersion: 'synthetic-connectome/1.0',
  quality: 'pass' as const,
  reliabilityProfile: G03_RELIABILITY_PROFILE,
  candidates: [
    {
      candidateCode: 'SYN-LOW-GAIN-G03',
      targetFamilyCode: 'TF-MDD-CONVERGENT-LDLPFC-001',
      reliabilityScore: 0.78,
      circuitConcordance: 0.76,
      baselineCircuitConcordance: 0.70, // gain = 0.06 (< 0.10 threshold)
      mniCoordinate: {
        space: 'MNI152NLin2009cAsym' as const,
        x: -42,
        y: 42,
        z: 32,
        unit: 'mm' as const,
      },
      accessibility: 'good',
    },
  ],
};

export const G03_PRIMARY_1: TargetCandidate = {
  id: 'cand-g03-evidence-ldlpfc',
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
  phenotypeConcordanceScore: 0.9,
  overallScore: 0.92,
  rationale: 'Standard evidence-based left prefrontal depression anchor (no connectome available).',
  contraindicationsOrConflicts: [],
  isSuppressedOrRedundant: false,
  evidencePaths: graph.findEvidencePaths('TF-MDD-LDLPFC-EST-001'),
  conflictingEvidence: graph.getConflictingClaims('TF-MDD-LDLPFC-EST-001'),
  counterarguments: ['Fixed group anchor does not account for patient-specific functional anatomy variations.'],
};

export const G03_SUPPRESSED_CANDIDATE: TargetCandidate = {
  id: 'cand-g03-low-gain-fc',
  familyId: 'TF-MDD-CONVERGENT-LDLPFC-001',
  circuitId: 'CIRCUIT-MDD-CONVERGENT-001',
  role: 'RESERVE',
  method: 'CONNECTOME_REFINED',
  evidenceTier: 'T1',
  mniCoordinate: {
    space: 'MNI152NLin2009cAsym',
    x: -42,
    y: 42,
    z: 32,
    unit: 'mm',
  },
  evidenceScore: 0.95,
  phenotypeConcordanceScore: 0.76,
  connectomeRefinementScore: 0.76,
  overallScore: 0.82,
  rationale: 'Suppressed: connectome candidate demonstrated insufficient incremental value (< 0.10) over evidence baseline.',
  contraindicationsOrConflicts: [],
  isSuppressedOrRedundant: true,
  suppressionReason: 'LOW_INCREMENTAL_VALUE',
  convergenceProfile: {
    distanceToEvidenceBaselineMm: 8.25,
    convergenceClassification: 'moderate',
    incrementalGainOverBaseline: 0.06,
  },
  evidencePaths: graph.findEvidencePaths('TF-MDD-CONVERGENT-LDLPFC-001'),
  conflictingEvidence: graph.getConflictingClaims('TF-MDD-CONVERGENT-LDLPFC-001'),
  counterarguments: [
    'Personalised fMRI targeting does not establish universal superiority across all unselected patients (EC-PERSONALISED-SUPERIORITY-001).',
  ],
};

const g03SlatePayload = {
  id: 'slate-golden-03',
  caseId: 'case-golden-03',
  phenotypeSnapshotId: G03_PHENOTYPE.id,
  scientificPolicyVersion: 'MAGNIOM-POLICY-MDD-1.0.0',
  evidenceReleaseVersion: 'MAGNIOM-EVIDENCE-1.0.0',
  generatedAt: '2026-09-01T10:15:00.000Z',
  mode: 'CLINICAL' as const,
  primaryCandidates: [G03_PRIMARY_1],
  additionalCandidates: [],
  suppressedCandidates: [G03_SUPPRESSED_CANDIDATE],
  personalisationQualification: 'limited' as const,
  clinicalCoverageProfile: {
    primaryDomainCovered: 'DOMAIN-MDD-DYSPHORIC-001',
    secondaryDomainsCovered: [],
    overallClinicalCoverageScore: 0.92,
  },
};

export const GOLDEN_CASE_03_SLATE: TargetSlate = {
  ...g03SlatePayload,
  deterministicManifestHash: computeSha256(g03SlatePayload),
};

export const GOLDEN_CASE_03 = {
  caseCode: 'G03',
  title: 'G03 — Reliable but Low Incremental Value Connectome',
  phenotype: G03_PHENOTYPE,
  connectome: G03_CONNECTOME,
  expectedSlate: GOLDEN_CASE_03_SLATE,
};
