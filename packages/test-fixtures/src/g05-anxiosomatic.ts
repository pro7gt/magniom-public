import type { PhenotypeSnapshot, TargetCandidate, TargetSlate, TargetReliabilityProfile } from '@magniom/domain';
import { computeSha256 } from '@magniom/scientific-policy';
import { EvidenceKnowledgeGraph, CANONICAL_EVIDENCE_RELEASE_1_0_0 } from '@magniom/evidence';

const graph = new EvidenceKnowledgeGraph(CANONICAL_EVIDENCE_RELEASE_1_0_0);

export const G05_PHENOTYPE: PhenotypeSnapshot = {
  id: 'snap-golden-05',
  patientId: 'synth-pat-g05',
  primaryDiagnosis: 'Major Depressive Disorder with Clinically Significant Anxious Distress',
  episodeSeverity: 'SEVERE_WITHOUT_PSYCHOSIS',
  diagnosisAssertion: {
    code: 'MDD',
    display: 'Major Depressive Disorder with Anxious Distress Specifier',
    status: 'confirmed',
    diagnosticSystem: 'DSM-5',
  },
  episodeProfile: {
    active: true,
    severity: 'SEVERE_WITHOUT_PSYCHOSIS',
    durationMonths: 16,
    treatmentResistanceStage: 2,
  },
  safetyClearance: 'cleared',
  symptomScores: {
    dysphoriaScore: 0.7,
    anhedoniaScore: 0.65,
    anxiousSomaticScore: 0.95,
    ruminationScore: 0.8,
  },
  symptomPriorities: [
    {
      domainCode: 'DOMAIN-MDD-ANXIOSOMATIC-001',
      priorityRank: 1,
      clinicianWeight: 1.0,
      evidenceMappability: 'direct',
      rationale: 'Severe debilitating anxious somatic distress is the primary clinical objective.',
    },
    {
      domainCode: 'DOMAIN-MDD-DYSPHORIC-001',
      priorityRank: 2,
      clinicianWeight: 0.7,
      evidenceMappability: 'direct',
      rationale: 'Concurrent severe dysphoric depression.',
    },
  ],
  treatmentHistory: {
    medicationFailuresCount: 2,
    priorTmsExposure: false,
  },
  phenotypeConfidence: 'HIGH',
  clinicianSummary: 'Synthetic MDD case where anxiosomatic distress is dominant over dysphoria.',
  confirmedByClinicianId: 'clin-demo-001',
  confirmedAt: '2026-09-01T10:00:00.000Z',
  snapshotHash: computeSha256({
    patientId: 'synth-pat-g05',
    diagnosis: 'MDD-AnxiousDistress',
    scores: { dysphoria: 0.7, anhedonia: 0.65, anxiousSomatic: 0.95, rumination: 0.8 },
  }),
};

export const G05_RELIABILITY_PROFILE: TargetReliabilityProfile = {
  candidateId: 'cand-g05-convergent-ldlpfc',
  scanDurationMinutes: 15.0,
  meanFramewiseDisplacementMm: 0.12,
  retainedFramesPercentage: 96.0,
  temporalSnr: 120.0,
  splitHalfLocalisationDistanceMm: 1.9,
  overallReliabilityScore: 0.9,
  isReliableForPersonalisation: true,
  warnings: [],
};

export const G05_CONNECTOME = {
  schemaVersion: 'synthetic-connectome/1.0',
  quality: 'pass' as const,
  reliabilityProfile: G05_RELIABILITY_PROFILE,
  candidates: [
    {
      candidateCode: 'SYN-CONVERGENT-G05',
      targetFamilyCode: 'TF-MDD-CONVERGENT-LDLPFC-001',
      reliabilityScore: 0.9,
      circuitConcordance: 0.82,
      baselineCircuitConcordance: 0.66,
      mniCoordinate: {
        space: 'MNI152NLin2009cAsym' as const,
        x: -44,
        y: 40,
        z: 34,
        unit: 'mm' as const,
      },
      surfaceVertex: {
        space: 'fsLR_32k' as const,
        hemisphere: 'L' as const,
        vertexIndex: 18452,
        parcelName: 'p9-46v_L',
      },
      accessibility: 'good',
    },
  ],
};

export const G05_PRIMARY_1: TargetCandidate = {
  id: 'cand-g05-convergent-ldlpfc',
  familyId: 'TF-MDD-CONVERGENT-LDLPFC-001',
  circuitId: 'CIRCUIT-MDD-CONVERGENT-001',
  role: 'PRIMARY_1',
  method: 'CONNECTOME_REFINED',
  evidenceTier: 'T1',
  mniCoordinate: {
    space: 'MNI152NLin2009cAsym',
    x: -44,
    y: 40,
    z: 34,
    unit: 'mm',
  },
  surfaceVertex: {
    space: 'fsLR_32k',
    hemisphere: 'L',
    vertexIndex: 18452,
    parcelName: 'p9-46v_L',
  },
  evidenceScore: 0.95,
  phenotypeConcordanceScore: 0.82,
  connectomeRefinementScore: 0.82,
  overallScore: 0.88,
  rationale: 'Qualified connectome-refined left prefrontal depression target addressing core depressive symptoms.',
  contraindicationsOrConflicts: [],
  isSuppressedOrRedundant: false,
  convergenceProfile: {
    distanceToEvidenceBaselineMm: 8.25,
    convergenceClassification: 'high',
    incrementalGainOverBaseline: 0.16,
  },
  evidencePaths: graph.findEvidencePaths('TF-MDD-CONVERGENT-LDLPFC-001'),
  conflictingEvidence: graph.getConflictingClaims('TF-MDD-CONVERGENT-LDLPFC-001'),
  counterarguments: [
    'Personalised fMRI targeting does not establish universal superiority across all unselected patients (EC-PERSONALISED-SUPERIORITY-001).',
  ],
};

export const G05_PRIMARY_2: TargetCandidate = {
  id: 'cand-g05-anxiosomatic-dmpfc',
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
  phenotypeConcordanceScore: 0.98,
  overallScore: 0.91,
  rationale:
    'Distinct clinical hypothesis: Anxiosomatic DMPFC circuit target (BA9/32, MNI [0,48,46]) derived from 2026 randomized prospective circuit trial for prominent anxiety.',
  contraindicationsOrConflicts: [],
  isSuppressedOrRedundant: false,
  evidencePaths: graph.findEvidencePaths('TF-MDD-ANXIOSOMATIC-DMPFC-001'),
  conflictingEvidence: graph.getConflictingClaims('TF-MDD-ANXIOSOMATIC-DMPFC-001'),
  counterarguments: ['Fixed group anchor does not account for patient-specific functional anatomy variations.'],
};

export const G05_ADDITIONAL_A: TargetCandidate = {
  id: 'cand-g05-evidence-ldlpfc',
  familyId: 'TF-MDD-LDLPFC-EST-001',
  circuitId: 'CIRCUIT-MDD-LDLPFC-001',
  role: 'ADDITIONAL_A',
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
  phenotypeConcordanceScore: 0.8,
  overallScore: 0.88,
  rationale: 'Counterfactual standard left-prefrontal evidence prior.',
  contraindicationsOrConflicts: [],
  isSuppressedOrRedundant: false,
  evidencePaths: graph.findEvidencePaths('TF-MDD-LDLPFC-EST-001'),
  conflictingEvidence: graph.getConflictingClaims('TF-MDD-LDLPFC-EST-001'),
  counterarguments: ['Fixed group anchor does not account for patient-specific functional anatomy variations.'],
};

const g05SlatePayload = {
  id: 'slate-golden-05',
  caseId: 'case-golden-05',
  phenotypeSnapshotId: G05_PHENOTYPE.id,
  scientificPolicyVersion: 'MAGNIOM-POLICY-MDD-1.0.0',
  evidenceReleaseVersion: 'MAGNIOM-EVIDENCE-1.0.0',
  generatedAt: '2026-09-01T10:25:00.000Z',
  mode: 'CLINICAL' as const,
  primaryCandidates: [G05_PRIMARY_1, G05_PRIMARY_2],
  additionalCandidates: [G05_ADDITIONAL_A],
  suppressedCandidates: [],
  personalisationQualification: 'qualified' as const,
  counterfactualSummary: {
    evidenceBaselineCoordinate: G05_ADDITIONAL_A.mniCoordinate,
    candidateCoordinate: G05_PRIMARY_1.mniCoordinate,
    displacementDistanceMm: 8.25,
    expectedMechanisticGain: 0.16,
    justificationSummary: 'Qualified connectome refinement shows +0.16 gain over standard baseline within 8.25mm.',
  },
  clinicalCoverageProfile: {
    primaryDomainCovered: 'DOMAIN-MDD-ANXIOSOMATIC-001',
    secondaryDomainsCovered: ['DOMAIN-MDD-DYSPHORIC-001'],
    overallClinicalCoverageScore: 0.98,
  },
};

export const GOLDEN_CASE_05_SLATE: TargetSlate = {
  ...g05SlatePayload,
  deterministicManifestHash: computeSha256(g05SlatePayload),
};

export const GOLDEN_CASE_05 = {
  caseCode: 'G05',
  title: 'G05 — Anxiosomatic-Dominant Dual-Circuit Case',
  phenotype: G05_PHENOTYPE,
  connectome: G05_CONNECTOME,
  expectedSlate: GOLDEN_CASE_05_SLATE,
};
