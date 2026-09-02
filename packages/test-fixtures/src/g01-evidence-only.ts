import type { PhenotypeSnapshot, TargetCandidate, TargetSlate } from '@magniom/domain';
import { computeSha256 } from '@magniom/scientific-policy';
import { EvidenceKnowledgeGraph, CANONICAL_EVIDENCE_RELEASE_1_0_0 } from '@magniom/evidence';

const graph = new EvidenceKnowledgeGraph(CANONICAL_EVIDENCE_RELEASE_1_0_0);

export const G01_PHENOTYPE: PhenotypeSnapshot = {
  id: 'snap-golden-01',
  patientId: 'synth-pat-g01',
  primaryDiagnosis: 'Major Depressive Disorder, Single Episode, Severe without Psychotic Features',
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
    durationMonths: 14,
    treatmentResistanceStage: 2,
  },
  safetyClearance: 'cleared',
  symptomScores: {
    dysphoriaScore: 0.88,
    anhedoniaScore: 0.75,
    anxiousSomaticScore: 0.3,
    ruminationScore: 0.65,
  },
  symptomPriorities: [
    {
      domainCode: 'DOMAIN-MDD-DYSPHORIC-001',
      priorityRank: 1,
      clinicianWeight: 0.9,
      evidenceMappability: 'direct',
      rationale: 'Dysphoric burden is the dominant synthetic treatment objective.',
    },
    {
      domainCode: 'DOMAIN-MDD-ANXIOSOMATIC-001',
      priorityRank: 2,
      clinicianWeight: 0.2,
      evidenceMappability: 'direct',
      rationale: 'Low synthetic anxiosomatic burden.',
    },
  ],
  treatmentHistory: {
    medicationFailuresCount: 2,
    priorTmsExposure: false,
  },
  phenotypeConfidence: 'HIGH',
  clinicianSummary:
    'Synthetic severe MDD case with predominantly dysphoric burden. Connectome is not acquired.',
  confirmedByClinicianId: 'clin-demo-001',
  confirmedAt: '2026-09-01T10:00:00.000Z',
  snapshotHash: computeSha256({
    patientId: 'synth-pat-g01',
    diagnosis: 'MDD',
    scores: { dysphoria: 0.88, anhedonia: 0.75, anxiousSomatic: 0.3, rumination: 0.65 },
  }),
};

export const G01_CONNECTOME = null;

export const G01_PRIMARY_1: TargetCandidate = {
  id: 'cand-g01-evidence-ldlpfc',
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
  phenotypeConcordanceScore: 0.92,
  overallScore: 0.93,
  rationale: 'Standard evidence-based left prefrontal depression anchor (no connectome available).',
  contraindicationsOrConflicts: [],
  isSuppressedOrRedundant: false,
  evidencePaths: graph.findEvidencePaths('TF-MDD-LDLPFC-EST-001'),
  conflictingEvidence: graph.getConflictingClaims('TF-MDD-LDLPFC-EST-001'),
  counterarguments: [
    'Fixed group anchor does not account for patient-specific functional anatomy variations.',
  ],
};

const g01SlatePayload = {
  id: 'slate-golden-01',
  caseId: 'case-golden-01',
  phenotypeSnapshotId: G01_PHENOTYPE.id,
  scientificPolicyVersion: 'MAGNIOM-POLICY-MDD-1.0.0',
  evidenceReleaseVersion: 'MAGNIOM-EVIDENCE-1.0.0',
  generatedAt: '2026-09-01T10:05:00.000Z',
  mode: 'CLINICAL' as const,
  primaryCandidates: [G01_PRIMARY_1],
  additionalCandidates: [],
  suppressedCandidates: [],
  personalisationQualification: 'not_available' as const,
  clinicalCoverageProfile: {
    primaryDomainCovered: 'DOMAIN-MDD-DYSPHORIC-001',
    secondaryDomainsCovered: [],
    overallClinicalCoverageScore: 0.92,
  },
};

export const GOLDEN_CASE_01_SLATE: TargetSlate = {
  ...g01SlatePayload,
  deterministicManifestHash: computeSha256(g01SlatePayload),
};

export const GOLDEN_CASE_01 = {
  caseCode: 'G01',
  title: 'G01 — Evidence Only MDD Target Selection',
  phenotype: G01_PHENOTYPE,
  connectome: G01_CONNECTOME,
  expectedSlate: GOLDEN_CASE_01_SLATE,
};

export const GOLDEN_CASE_01_PHENOTYPE = G01_PHENOTYPE;
export const GOLDEN_CASE_01_PRIMARY_CANDIDATE = G01_PRIMARY_1;
