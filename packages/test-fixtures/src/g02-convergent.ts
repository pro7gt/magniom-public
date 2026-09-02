import type {
  PhenotypeSnapshot,
  TargetCandidate,
  TargetSlate,
  TargetReliabilityProfile,
} from '@magniom/domain';
import { computeSha256 } from '@magniom/scientific-policy';
import { EvidenceKnowledgeGraph, CANONICAL_EVIDENCE_RELEASE_1_0_0 } from '@magniom/evidence';

const graph = new EvidenceKnowledgeGraph(CANONICAL_EVIDENCE_RELEASE_1_0_0);

export const G02_PHENOTYPE: PhenotypeSnapshot = {
  id: 'snap-golden-02',
  patientId: 'synth-pat-g02',
  primaryDiagnosis: 'Major Depressive Disorder, Recurrent, Moderate without Psychotic Features',
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
    durationMonths: 8,
    treatmentResistanceStage: 1,
  },
  safetyClearance: 'cleared',
  symptomScores: {
    dysphoriaScore: 0.82,
    anhedoniaScore: 0.7,
    anxiousSomaticScore: 0.25,
    ruminationScore: 0.6,
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
  clinicianSummary:
    'Synthetic moderate recurrent MDD with high-quality rs-fMRI connectome available.',
  confirmedByClinicianId: 'clin-demo-001',
  confirmedAt: '2026-09-01T10:00:00.000Z',
  snapshotHash: computeSha256({
    patientId: 'synth-pat-g02',
    diagnosis: 'MDD',
    scores: { dysphoria: 0.82, anhedonia: 0.7, anxiousSomatic: 0.25, rumination: 0.6 },
  }),
};

export const G02_RELIABILITY_PROFILE: TargetReliabilityProfile = {
  candidateId: 'cand-g02-convergent',
  scanDurationMinutes: 15.0,
  meanFramewiseDisplacementMm: 0.14,
  retainedFramesPercentage: 94.0,
  temporalSnr: 110.0,
  splitHalfLocalisationDistanceMm: 2.1,
  overallReliabilityScore: 0.88,
  isReliableForPersonalisation: true,
  warnings: [],
};

export const G02_CONNECTOME = {
  schemaVersion: 'synthetic-connectome/1.0',
  quality: 'pass' as const,
  reliabilityProfile: G02_RELIABILITY_PROFILE,
  candidates: [
    {
      candidateCode: 'SYN-CONVERGENT-G02',
      targetFamilyCode: 'TF-MDD-CONVERGENT-LDLPFC-001',
      reliabilityScore: 0.88,
      circuitConcordance: 0.84,
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

export const G02_PRIMARY_1: TargetCandidate = {
  id: 'cand-g02-convergent-ldlpfc',
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
  phenotypeConcordanceScore: 0.84,
  connectomeRefinementScore: 0.84,
  overallScore: 0.88,
  rationale:
    'Qualified connectome-refined left prefrontal depression target addressing core depressive symptoms.',
  contraindicationsOrConflicts: [],
  isSuppressedOrRedundant: false,
  convergenceProfile: {
    distanceToEvidenceBaselineMm: 8.25,
    convergenceClassification: 'high',
    incrementalGainOverBaseline: 0.18,
  },
  evidencePaths: graph.findEvidencePaths('TF-MDD-CONVERGENT-LDLPFC-001'),
  conflictingEvidence: graph.getConflictingClaims('TF-MDD-CONVERGENT-LDLPFC-001'),
  counterarguments: [
    'Personalised fMRI targeting does not establish universal superiority across all unselected patients (EC-PERSONALISED-SUPERIORITY-001).',
  ],
};

export const G02_ADDITIONAL_A: TargetCandidate = {
  id: 'cand-g02-evidence-ldlpfc',
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
  phenotypeConcordanceScore: 0.92,
  overallScore: 0.93,
  rationale: 'Counterfactual standard left-prefrontal evidence prior.',
  contraindicationsOrConflicts: [],
  isSuppressedOrRedundant: false,
  evidencePaths: graph.findEvidencePaths('TF-MDD-LDLPFC-EST-001'),
  conflictingEvidence: graph.getConflictingClaims('TF-MDD-LDLPFC-EST-001'),
  counterarguments: [
    'Fixed group anchor does not account for patient-specific functional anatomy variations.',
  ],
};

const g02SlatePayload = {
  id: 'slate-golden-02',
  caseId: 'case-golden-02',
  phenotypeSnapshotId: G02_PHENOTYPE.id,
  scientificPolicyVersion: 'MAGNIOM-POLICY-MDD-1.0.0',
  evidenceReleaseVersion: 'MAGNIOM-EVIDENCE-1.0.0',
  generatedAt: '2026-09-01T10:10:00.000Z',
  mode: 'CLINICAL' as const,
  primaryCandidates: [G02_PRIMARY_1],
  additionalCandidates: [G02_ADDITIONAL_A],
  suppressedCandidates: [],
  personalisationQualification: 'qualified' as const,
  counterfactualSummary: {
    evidenceBaselineCoordinate: G02_ADDITIONAL_A.mniCoordinate,
    candidateCoordinate: G02_PRIMARY_1.mniCoordinate,
    displacementDistanceMm: 8.25,
    expectedMechanisticGain: 0.18,
    justificationSummary:
      'Qualified connectome refinement shows +0.18 gain over standard baseline within 8.25mm.',
  },
  clinicalCoverageProfile: {
    primaryDomainCovered: 'DOMAIN-MDD-DYSPHORIC-001',
    secondaryDomainsCovered: [],
    overallClinicalCoverageScore: 0.92,
  },
};

export const GOLDEN_CASE_02_SLATE: TargetSlate = {
  ...g02SlatePayload,
  deterministicManifestHash: computeSha256(g02SlatePayload),
};

export const GOLDEN_CASE_02 = {
  caseCode: 'G02',
  title: 'G02 — High-Convergence Personalisation',
  phenotype: G02_PHENOTYPE,
  connectome: G02_CONNECTOME,
  expectedSlate: GOLDEN_CASE_02_SLATE,
};
