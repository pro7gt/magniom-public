/**
 * Golden Cases Test Suite Fixtures (G01–G18)
 * Conforms to MAGNIOM-Implementation & Validation Roadmap v1.0 Sections 40–57
 * and MAGNIOM-Target Engine & Ranking Algorithm Specification v1.0 Section 135
 */

import type {
  PhenotypeSnapshot,
  ConnectomeTargetInput,
  CanonicalTargetReliabilityProfile,
} from '@magniom/domain';
import { computeSha256 } from '@magniom/scientific-policy';

// Helper to create valid phenotype snapshot
export function createPhenotypeSnapshot(overrides: Partial<PhenotypeSnapshot>): PhenotypeSnapshot {
  const base: PhenotypeSnapshot = {
    id: 'snap-generic',
    patientId: 'pat-generic',
    primaryDiagnosis: 'Major Depressive Disorder, Recurrent, Moderate',
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
      dysphoriaScore: 0.85,
      anhedoniaScore: 0.75,
      anxiousSomaticScore: 0.2,
      ruminationScore: 0.6,
    },
    symptomPriorities: [
      {
        domainCode: 'DOMAIN-MDD-DYSPHORIC-001',
        priorityRank: 1,
        clinicianWeight: 0.9,
        evidenceMappability: 'direct',
        rationale: 'Core depressive symptoms priority.',
      },
    ],
    treatmentHistory: {
      medicationFailuresCount: 1,
      priorTmsExposure: false,
    },
    phenotypeConfidence: 'HIGH',
    clinicianSummary: 'Standard MDD phenotype for targeting validation.',
    confirmedByClinicianId: 'clin-001',
    confirmedAt: '2026-09-01T10:00:00.000Z',
    snapshotHash: 'hash-placeholder',
  };

  const snapshot = { ...base, ...overrides };
  const snapshotHash = computeSha256({
    patientId: snapshot.patientId,
    diagnosis: snapshot.primaryDiagnosis,
    scores: snapshot.symptomScores,
  });

  return {
    ...snapshot,
    snapshotHash,
  };
}

// Helper to create canonical reliability profile
export function createReliabilityProfile(
  overrides: Partial<CanonicalTargetReliabilityProfile>,
): CanonicalTargetReliabilityProfile {
  const base: CanonicalTargetReliabilityProfile = {
    id: 'rel-profile-001',
    version: '1.0.0',
    caseId: 'case-test-001',
    imagingStudyId: 'study-test-001',
    connectomeRunId: 'run-test-001',
    targetCandidateId: 'cand-conv-001',
    targetFamilyVersionId: 'TF-MDD-CONVERGENT-LDLPFC-001',
    qcStatus: 'pass',
    usableRestingStateMinutes: 14.5,
    meanFramewiseDisplacementMm: 0.12,
    censoredVolumeFraction: 0.04,
    registrationQuality: 'high',
    segmentationQuality: 'high',
    parcelCoverageQuality: 'high',
    compositeSpatialDistanceMm: 2.2,
    splitHalfSpatialDistanceMm: 1.9,
    crossRunSpatialDistanceMm: 2.4,
    connectivityReliabilityMetric: 0.86,
    connectivityReliabilityMethod: 'pearson_correlation',
    spatialReliabilityScore: 0.9,
    connectivityReliabilityScore: 0.88,
    qcReliabilityScore: 0.92,
    overallReliabilityScore: 0.89,
    reliabilityClass: 'high',
    isReliableForPersonalisation: true,
    limitingFactors: [],
    interpretation: 'High-quality rs-fMRI with high spatial stability.',
    pipelineVersion: 'MAGNIOM-CONNECTOME-1.0.0',
    atlasVersions: ['HCP-MMP1.0'],
    createdAt: '2026-09-01T10:00:00.000Z',
    warnings: [],
  };
  return { ...base, ...overrides };
}

// Helper to create ConnectomeTargetInput
export function createConnectomeInput(
  overrides: Partial<ConnectomeTargetInput>,
): ConnectomeTargetInput {
  const base: ConnectomeTargetInput = {
    connectomeRunId: 'run-test-001',
    pipelineVersion: 'MAGNIOM-CONNECTOME-1.0.0',
    qcStatus: 'pass',
    retainedMinutes: 14.5,
    atlasName: 'HCP-MMP1.0',
    circuitMetrics: [],
    candidateRegions: [],
    reliabilityProfiles: [],
  };
  return { ...base, ...overrides };
}

// ==========================================
// G01: Evidence-Only Baseline
// ==========================================
export const G01_CASE_PHENOTYPE = createPhenotypeSnapshot({
  id: 'snap-golden-01',
  patientId: 'pat-g01-evidence-only',
});

// ==========================================
// G02: High-Convergence Personalisation
// ==========================================
export const G02_CASE_PHENOTYPE = createPhenotypeSnapshot({
  id: 'snap-golden-02',
  patientId: 'pat-g02-high-convergence',
});

export const G02_CASE_CONNECTOME = createConnectomeInput({
  connectomeRunId: 'run-g02-01',
  retainedMinutes: 15.0,
  reliabilityProfiles: [
    createReliabilityProfile({
      caseId: 'case-g02',
      overallReliabilityScore: 0.88,
      isReliableForPersonalisation: true,
    }),
  ],
  candidateRegions: [
    {
      targetFamilyVersionId: 'TF-MDD-CONVERGENT-LDLPFC-001',
      candidateCode: 'CAN-CONV-G02',
      generationMethod: 'CONNECTOME_REFINED',
      hemisphere: 'L',
      surfaceVertexIndex: 18452,
      parcelName: 'p9-46v_L',
      subjectT1Coordinate: { space: 'MNI152NLin2009cAsym', x: -44, y: 40, z: 34, unit: 'mm' },
      mniCoordinate: { space: 'MNI152NLin2009cAsym', x: -44, y: 40, z: 34, unit: 'mm' },
      clusterAreaMm2: 95.0,
      circuitConcordanceRaw: 0.84,
      circuitConcordancePercentile: 0.84,
      baselineCircuitConcordance: 0.65,
      accessibility: 'good',
      reliabilityScore: 0.88,
      fitInterpretation: 'Qualified high-concordance convergent depression target.',
    },
  ],
});

// ==========================================
// G03: Low Incremental Value
// ==========================================
export const G03_CASE_PHENOTYPE = createPhenotypeSnapshot({
  id: 'snap-golden-03',
  patientId: 'pat-g03-low-gain',
});

export const G03_CASE_CONNECTOME = createConnectomeInput({
  connectomeRunId: 'run-g03-01',
  retainedMinutes: 14.0,
  reliabilityProfiles: [
    createReliabilityProfile({
      caseId: 'case-g03',
      overallReliabilityScore: 0.85,
      isReliableForPersonalisation: true,
    }),
  ],
  candidateRegions: [
    {
      targetFamilyVersionId: 'TF-MDD-CONVERGENT-LDLPFC-001',
      candidateCode: 'CAN-CONV-G03',
      generationMethod: 'CONNECTOME_REFINED',
      hemisphere: 'L',
      surfaceVertexIndex: 18452,
      parcelName: 'p9-46v_L',
      subjectT1Coordinate: { space: 'MNI152NLin2009cAsym', x: -40, y: 42, z: 32, unit: 'mm' },
      mniCoordinate: { space: 'MNI152NLin2009cAsym', x: -40, y: 42, z: 32, unit: 'mm' },
      clusterAreaMm2: 80.0,
      circuitConcordanceRaw: 0.68,
      circuitConcordancePercentile: 0.68,
      baselineCircuitConcordance: 0.65, // gain = 0.03 < 0.10 threshold
      accessibility: 'good',
      reliabilityScore: 0.85,
      fitInterpretation: 'Low incremental gain candidate over baseline prior.',
    },
  ],
});

// ==========================================
// G04: Unreliable Connectome
// ==========================================
export const G04_CASE_PHENOTYPE = createPhenotypeSnapshot({
  id: 'snap-golden-04',
  patientId: 'pat-g04-unreliable',
});

export const G04_CASE_CONNECTOME = createConnectomeInput({
  connectomeRunId: 'run-g04-01',
  retainedMinutes: 8.5,
  reliabilityProfiles: [
    createReliabilityProfile({
      caseId: 'case-g04',
      meanFramewiseDisplacementMm: 0.38,
      censoredVolumeFraction: 0.35,
      compositeSpatialDistanceMm: 9.8,
      overallReliabilityScore: 0.42,
      reliabilityClass: 'unreliable',
      isReliableForPersonalisation: false,
      warnings: ['HIGH_MOTION_ARTIFACT', 'EXCESSIVE_SPATIAL_DISPERSION'],
      limitingFactors: ['HIGH_MOTION_ARTIFACT'],
    }),
  ],
  candidateRegions: [
    {
      targetFamilyVersionId: 'TF-MDD-CONVERGENT-LDLPFC-001',
      candidateCode: 'CAN-CONV-G04',
      generationMethod: 'CONNECTOME_REFINED',
      hemisphere: 'L',
      surfaceVertexIndex: 18452,
      parcelName: 'p9-46v_L',
      subjectT1Coordinate: { space: 'MNI152NLin2009cAsym', x: -44, y: 40, z: 34, unit: 'mm' },
      mniCoordinate: { space: 'MNI152NLin2009cAsym', x: -44, y: 40, z: 34, unit: 'mm' },
      clusterAreaMm2: 60.0,
      circuitConcordanceRaw: 0.86,
      circuitConcordancePercentile: 0.86,
      baselineCircuitConcordance: 0.65,
      accessibility: 'good',
      reliabilityScore: 0.42,
      fitInterpretation: 'Candidate derived from motion-contaminated unvalidated scan.',
    },
  ],
});

// ==========================================
// G05: Anxiosomatic-Dominant MDD
// ==========================================
export const G05_CASE_PHENOTYPE = createPhenotypeSnapshot({
  id: 'snap-golden-05',
  patientId: 'pat-g05-anxiosomatic',
  symptomScores: {
    dysphoriaScore: 0.7,
    anhedoniaScore: 0.6,
    anxiousSomaticScore: 0.88,
    ruminationScore: 0.65,
  },
  symptomPriorities: [
    {
      domainCode: 'DOMAIN-MDD-ANXIOSOMATIC-001',
      priorityRank: 1,
      clinicianWeight: 0.85,
      evidenceMappability: 'direct',
      rationale: 'Severe anxiety and somatic symptoms require targeted hypothesis.',
    },
    {
      domainCode: 'DOMAIN-MDD-DYSPHORIC-001',
      priorityRank: 2,
      clinicianWeight: 0.65,
      evidenceMappability: 'direct',
    },
  ],
});

export const G05_CASE_CONNECTOME = createConnectomeInput({
  connectomeRunId: 'run-g05-01',
  retainedMinutes: 15.0,
  reliabilityProfiles: [
    createReliabilityProfile({
      caseId: 'case-g05',
      overallReliabilityScore: 0.89,
      isReliableForPersonalisation: true,
    }),
  ],
  candidateRegions: [
    {
      targetFamilyVersionId: 'TF-MDD-ANXIOSOMATIC-DMPFC-001',
      candidateCode: 'CAN-ANX-G05',
      generationMethod: 'CONNECTOME_REFINED',
      hemisphere: 'L',
      surfaceVertexIndex: 12050,
      parcelName: '8BM_L',
      subjectT1Coordinate: { space: 'MNI152NLin2009cAsym', x: -6, y: 24, z: 48, unit: 'mm' },
      mniCoordinate: { space: 'MNI152NLin2009cAsym', x: -6, y: 24, z: 48, unit: 'mm' },
      clusterAreaMm2: 85.0,
      circuitConcordanceRaw: 0.88,
      circuitConcordancePercentile: 0.88,
      baselineCircuitConcordance: 0.6,
      accessibility: 'good',
      reliabilityScore: 0.9,
      fitInterpretation: 'Dorsomedial prefrontal cortex target for anxious-somatic depression.',
    },
  ],
});

// ==========================================
// G06: Dysphoric-Dominant MDD
// ==========================================
export const G06_CASE_PHENOTYPE = createPhenotypeSnapshot({
  id: 'snap-golden-06',
  patientId: 'pat-g06-dysphoric',
  symptomScores: {
    dysphoriaScore: 0.95,
    anhedoniaScore: 0.85,
    anxiousSomaticScore: 0.1,
    ruminationScore: 0.7,
  },
  symptomPriorities: [
    {
      domainCode: 'DOMAIN-MDD-DYSPHORIC-001',
      priorityRank: 1,
      clinicianWeight: 0.95,
      evidenceMappability: 'direct',
    },
  ],
});

export const G06_CASE_CONNECTOME = createConnectomeInput({
  connectomeRunId: 'run-g06-01',
  retainedMinutes: 14.5,
  reliabilityProfiles: [
    createReliabilityProfile({ caseId: 'case-g06', overallReliabilityScore: 0.91 }),
  ],
  candidateRegions: [
    {
      targetFamilyVersionId: 'TF-MDD-CONVERGENT-LDLPFC-001',
      candidateCode: 'CAN-CONV-G06',
      generationMethod: 'CONNECTOME_REFINED',
      hemisphere: 'L',
      surfaceVertexIndex: 18450,
      parcelName: 'p9-46v_L',
      subjectT1Coordinate: { space: 'MNI152NLin2009cAsym', x: -42, y: 42, z: 32, unit: 'mm' },
      mniCoordinate: { space: 'MNI152NLin2009cAsym', x: -42, y: 42, z: 32, unit: 'mm' },
      clusterAreaMm2: 90.0,
      circuitConcordanceRaw: 0.87,
      circuitConcordancePercentile: 0.87,
      baselineCircuitConcordance: 0.65,
      accessibility: 'good',
      reliabilityScore: 0.91,
      fitInterpretation: 'Convergent Left DLPFC target for severe dysphoric depression.',
    },
  ],
});

// ==========================================
// G07: Mixed Phenotype
// ==========================================
export const G07_CASE_PHENOTYPE = createPhenotypeSnapshot({
  id: 'snap-golden-07',
  patientId: 'pat-g07-mixed',
  symptomScores: {
    dysphoriaScore: 0.88,
    anhedoniaScore: 0.8,
    anxiousSomaticScore: 0.82,
    ruminationScore: 0.75,
  },
  symptomPriorities: [
    {
      domainCode: 'DOMAIN-MDD-DYSPHORIC-001',
      priorityRank: 1,
      clinicianWeight: 0.88,
      evidenceMappability: 'direct',
    },
    {
      domainCode: 'DOMAIN-MDD-ANXIOSOMATIC-001',
      priorityRank: 2,
      clinicianWeight: 0.82,
      evidenceMappability: 'direct',
    },
  ],
});

export const G07_CASE_CONNECTOME = createConnectomeInput({
  connectomeRunId: 'run-g07-01',
  retainedMinutes: 15.0,
  reliabilityProfiles: [
    createReliabilityProfile({ caseId: 'case-g07', overallReliabilityScore: 0.88 }),
  ],
  candidateRegions: [
    {
      targetFamilyVersionId: 'TF-MDD-CONVERGENT-LDLPFC-001',
      candidateCode: 'CAN-CONV-G07',
      generationMethod: 'CONNECTOME_REFINED',
      hemisphere: 'L',
      surfaceVertexIndex: 18452,
      parcelName: 'p9-46v_L',
      subjectT1Coordinate: { space: 'MNI152NLin2009cAsym', x: -44, y: 40, z: 34, unit: 'mm' },
      mniCoordinate: { space: 'MNI152NLin2009cAsym', x: -44, y: 40, z: 34, unit: 'mm' },
      clusterAreaMm2: 92.0,
      circuitConcordanceRaw: 0.85,
      circuitConcordancePercentile: 0.85,
      baselineCircuitConcordance: 0.65,
      accessibility: 'good',
      reliabilityScore: 0.88,
      fitInterpretation: 'Primary dysphoric depression target in Left DLPFC.',
    },
    {
      targetFamilyVersionId: 'TF-MDD-ANXIOSOMATIC-DMPFC-001',
      candidateCode: 'CAN-ANX-G07',
      generationMethod: 'SYMPTOM_CIRCUIT',
      hemisphere: 'L',
      surfaceVertexIndex: 12050,
      parcelName: '8BM_L',
      subjectT1Coordinate: { space: 'MNI152NLin2009cAsym', x: -6, y: 24, z: 48, unit: 'mm' },
      mniCoordinate: { space: 'MNI152NLin2009cAsym', x: -6, y: 24, z: 48, unit: 'mm' },
      clusterAreaMm2: 80.0,
      circuitConcordanceRaw: 0.84,
      circuitConcordancePercentile: 0.84,
      baselineCircuitConcordance: 0.6,
      accessibility: 'good',
      reliabilityScore: 0.87,
      fitInterpretation: 'Anxiosomatic distinct target in DMPFC.',
    },
  ],
});

// ==========================================
// G08: Research Anomaly (L8Av)
// ==========================================
export const G08_CASE_PHENOTYPE = createPhenotypeSnapshot({
  id: 'snap-golden-08',
  patientId: 'pat-g08-research',
});

export const G08_CASE_CONNECTOME = createConnectomeInput({
  connectomeRunId: 'run-g08-01',
  retainedMinutes: 15.0,
  reliabilityProfiles: [
    createReliabilityProfile({ caseId: 'case-g08', overallReliabilityScore: 0.9 }),
  ],
  candidateRegions: [
    {
      targetFamilyVersionId: 'TF-MDD-L8AV-001',
      candidateCode: 'CAN-L8AV-G08',
      generationMethod: 'CONNECTOME_REFINED',
      hemisphere: 'L',
      surfaceVertexIndex: 15200,
      parcelName: '8Av_L',
      subjectT1Coordinate: { space: 'MNI152NLin2009cAsym', x: -36, y: 26, z: 46, unit: 'mm' },
      mniCoordinate: { space: 'MNI152NLin2009cAsym', x: -36, y: 26, z: 46, unit: 'mm' },
      clusterAreaMm2: 120.0,
      circuitConcordanceRaw: 0.94,
      circuitConcordancePercentile: 0.94,
      baselineCircuitConcordance: 0.5,
      accessibility: 'good',
      reliabilityScore: 0.9,
      fitInterpretation: 'Research-only exploratory normative deviation candidate in Area 8Av.',
    },
  ],
});

// ==========================================
// G09: Major FC Divergence (>30mm)
// ==========================================
export const G09_CASE_PHENOTYPE = createPhenotypeSnapshot({
  id: 'snap-golden-09',
  patientId: 'pat-g09-divergence',
});

export const G09_CASE_CONNECTOME = createConnectomeInput({
  connectomeRunId: 'run-g09-01',
  retainedMinutes: 14.5,
  reliabilityProfiles: [
    createReliabilityProfile({ caseId: 'case-g09', overallReliabilityScore: 0.88 }),
  ],
  candidateRegions: [
    {
      targetFamilyVersionId: 'TF-MDD-CONVERGENT-LDLPFC-001',
      candidateCode: 'CAN-DIV-G09',
      generationMethod: 'CONNECTOME_REFINED',
      hemisphere: 'L',
      surfaceVertexIndex: 22100,
      parcelName: 'p9-46v_L',
      subjectT1Coordinate: { space: 'MNI152NLin2009cAsym', x: -58, y: 12, z: 18, unit: 'mm' }, // ~38mm from [-38, 44, 30]
      mniCoordinate: { space: 'MNI152NLin2009cAsym', x: -58, y: 12, z: 18, unit: 'mm' },
      clusterAreaMm2: 85.0,
      circuitConcordanceRaw: 0.89,
      circuitConcordancePercentile: 0.89,
      baselineCircuitConcordance: 0.65,
      accessibility: 'good',
      reliabilityScore: 0.88,
      fitInterpretation: 'Majorly divergent candidate >30mm from standard evidence baseline.',
    },
  ],
});

// ==========================================
// G10: Redundant 5-Candidate Set
// ==========================================
export const G10_CASE_PHENOTYPE = createPhenotypeSnapshot({
  id: 'snap-golden-10',
  patientId: 'pat-g10-redundant',
});

export const G10_CASE_CONNECTOME = createConnectomeInput({
  connectomeRunId: 'run-g10-01',
  retainedMinutes: 15.0,
  reliabilityProfiles: [
    createReliabilityProfile({ caseId: 'case-g10', overallReliabilityScore: 0.89 }),
  ],
  candidateRegions: [
    {
      targetFamilyVersionId: 'TF-MDD-CONVERGENT-LDLPFC-001',
      candidateCode: 'CAN-CONV-G10-A',
      generationMethod: 'CONNECTOME_REFINED',
      hemisphere: 'L',
      surfaceVertexIndex: 18452,
      parcelName: 'p9-46v_L',
      subjectT1Coordinate: { space: 'MNI152NLin2009cAsym', x: -44, y: 40, z: 34, unit: 'mm' },
      mniCoordinate: { space: 'MNI152NLin2009cAsym', x: -44, y: 40, z: 34, unit: 'mm' },
      clusterAreaMm2: 95.0,
      circuitConcordanceRaw: 0.88,
      circuitConcordancePercentile: 0.88,
      baselineCircuitConcordance: 0.65,
      accessibility: 'good',
      reliabilityScore: 0.89,
      fitInterpretation: 'Peak candidate A.',
    },
    {
      targetFamilyVersionId: 'TF-MDD-CONVERGENT-LDLPFC-001',
      candidateCode: 'CAN-CONV-G10-B',
      generationMethod: 'CONNECTOME_REFINED',
      hemisphere: 'L',
      surfaceVertexIndex: 18453,
      parcelName: 'p9-46v_L',
      subjectT1Coordinate: { space: 'MNI152NLin2009cAsym', x: -43, y: 41, z: 33, unit: 'mm' }, // 1.7mm from A
      mniCoordinate: { space: 'MNI152NLin2009cAsym', x: -43, y: 41, z: 33, unit: 'mm' },
      clusterAreaMm2: 90.0,
      circuitConcordanceRaw: 0.87,
      circuitConcordancePercentile: 0.87,
      baselineCircuitConcordance: 0.65,
      accessibility: 'good',
      reliabilityScore: 0.89,
      fitInterpretation: 'Nearby redundant candidate B.',
    },
    {
      targetFamilyVersionId: 'TF-MDD-CONVERGENT-LDLPFC-001',
      candidateCode: 'CAN-CONV-G10-C',
      generationMethod: 'CONNECTOME_REFINED',
      hemisphere: 'L',
      surfaceVertexIndex: 18454,
      parcelName: 'p9-46v_L',
      subjectT1Coordinate: { space: 'MNI152NLin2009cAsym', x: -45, y: 39, z: 35, unit: 'mm' }, // 1.7mm from A
      mniCoordinate: { space: 'MNI152NLin2009cAsym', x: -45, y: 39, z: 35, unit: 'mm' },
      clusterAreaMm2: 88.0,
      circuitConcordanceRaw: 0.86,
      circuitConcordancePercentile: 0.86,
      baselineCircuitConcordance: 0.65,
      accessibility: 'good',
      reliabilityScore: 0.89,
      fitInterpretation: 'Nearby redundant candidate C.',
    },
    {
      targetFamilyVersionId: 'TF-MDD-CONVERGENT-LDLPFC-001',
      candidateCode: 'CAN-CONV-G10-D',
      generationMethod: 'CONNECTOME_REFINED',
      hemisphere: 'L',
      surfaceVertexIndex: 18455,
      parcelName: 'p9-46v_L',
      subjectT1Coordinate: { space: 'MNI152NLin2009cAsym', x: -42, y: 42, z: 32, unit: 'mm' }, // 3.4mm from A
      mniCoordinate: { space: 'MNI152NLin2009cAsym', x: -42, y: 42, z: 32, unit: 'mm' },
      clusterAreaMm2: 82.0,
      circuitConcordanceRaw: 0.85,
      circuitConcordancePercentile: 0.85,
      baselineCircuitConcordance: 0.65,
      accessibility: 'good',
      reliabilityScore: 0.89,
      fitInterpretation: 'Nearby redundant candidate D.',
    },
    {
      targetFamilyVersionId: 'TF-MDD-CONVERGENT-LDLPFC-001',
      candidateCode: 'CAN-CONV-G10-E',
      generationMethod: 'CONNECTOME_REFINED',
      hemisphere: 'L',
      surfaceVertexIndex: 18456,
      parcelName: 'p9-46v_L',
      subjectT1Coordinate: { space: 'MNI152NLin2009cAsym', x: -44, y: 42, z: 34, unit: 'mm' }, // 2.0mm from A
      mniCoordinate: { space: 'MNI152NLin2009cAsym', x: -44, y: 42, z: 34, unit: 'mm' },
      clusterAreaMm2: 80.0,
      circuitConcordanceRaw: 0.84,
      circuitConcordancePercentile: 0.84,
      baselineCircuitConcordance: 0.65,
      accessibility: 'good',
      reliabilityScore: 0.89,
      fitInterpretation: 'Nearby redundant candidate E.',
    },
  ],
});

// ==========================================
// G11: Anatomical Inaccessibility
// ==========================================
export const G11_CASE_PHENOTYPE = createPhenotypeSnapshot({
  id: 'snap-golden-11',
  patientId: 'pat-g11-inaccessible',
});

export const G11_CASE_CONNECTOME = createConnectomeInput({
  connectomeRunId: 'run-g11-01',
  retainedMinutes: 14.5,
  reliabilityProfiles: [
    createReliabilityProfile({ caseId: 'case-g11', overallReliabilityScore: 0.88 }),
  ],
  candidateRegions: [
    {
      targetFamilyVersionId: 'TF-MDD-CONVERGENT-LDLPFC-001',
      candidateCode: 'CAN-INACC-G11-1',
      generationMethod: 'CONNECTOME_REFINED',
      hemisphere: 'L',
      surfaceVertexIndex: 99999,
      parcelName: 'p9-46v_L',
      subjectT1Coordinate: { space: 'MNI152NLin2009cAsym', x: -30, y: 40, z: 120, unit: 'mm' }, // Outside cortical envelope
      mniCoordinate: { space: 'MNI152NLin2009cAsym', x: -30, y: 40, z: 120, unit: 'mm' },
      clusterAreaMm2: 95.0,
      circuitConcordanceRaw: 0.95,
      circuitConcordancePercentile: 0.95,
      baselineCircuitConcordance: 0.65,
      accessibility: 'inaccessible',
      reliabilityScore: 0.88,
      fitInterpretation: 'Highest concordance candidate located in inaccessible deep sulcal cleft.',
    },
    {
      targetFamilyVersionId: 'TF-MDD-CONVERGENT-LDLPFC-001',
      candidateCode: 'CAN-ACC-G11-2',
      generationMethod: 'CONNECTOME_REFINED',
      hemisphere: 'L',
      surfaceVertexIndex: 18452,
      parcelName: 'p9-46v_L',
      subjectT1Coordinate: { space: 'MNI152NLin2009cAsym', x: -44, y: 40, z: 34, unit: 'mm' },
      mniCoordinate: { space: 'MNI152NLin2009cAsym', x: -44, y: 40, z: 34, unit: 'mm' },
      clusterAreaMm2: 85.0,
      circuitConcordanceRaw: 0.84,
      circuitConcordancePercentile: 0.84,
      baselineCircuitConcordance: 0.65,
      accessibility: 'good',
      reliabilityScore: 0.88,
      fitInterpretation: 'Next eligible accessible candidate.',
    },
  ],
});

// ==========================================
// G12: No Clinical Target (All Fail / Abstention)
// ==========================================
export const G12_CASE_PHENOTYPE = createPhenotypeSnapshot({
  id: 'snap-golden-12',
  patientId: 'pat-g12-no-target',
});

// ==========================================
// G13: Research-Clinical Leakage Attack
// ==========================================
export const G13_CASE_PHENOTYPE = createPhenotypeSnapshot({
  id: 'snap-golden-13',
  patientId: 'pat-g13-leakage-attack',
});

// ==========================================
// G14: Stale Phenotype
// ==========================================
export const G14_CASE_PHENOTYPE_V1 = createPhenotypeSnapshot({
  id: 'snap-golden-14-v1',
  patientId: 'pat-g14-stale',
  confirmedAt: '2026-09-01T10:00:00.000Z',
});

export const G14_CASE_PHENOTYPE_V2 = createPhenotypeSnapshot({
  id: 'snap-golden-14-v2',
  patientId: 'pat-g14-stale',
  confirmedAt: '2026-09-01T12:00:00.000Z',
  symptomScores: {
    dysphoriaScore: 0.9,
    anhedoniaScore: 0.8,
    anxiousSomaticScore: 0.85,
    ruminationScore: 0.7,
  },
});

// ==========================================
// G15: Conflicting Evidence
// ==========================================
export const G15_CASE_PHENOTYPE = createPhenotypeSnapshot({
  id: 'snap-golden-15',
  patientId: 'pat-g15-conflicting-evidence',
});

// ==========================================
// G16: Evidence Release Change (v1.0 vs v1.1)
// ==========================================
export const G16_CASE_PHENOTYPE = createPhenotypeSnapshot({
  id: 'snap-golden-16',
  patientId: 'pat-g16-evidence-upgrade',
});

// ==========================================
// G17: Pipeline Version Change (Pipeline v1 vs v2)
// ==========================================
export const G17_CASE_PHENOTYPE = createPhenotypeSnapshot({
  id: 'snap-golden-17',
  patientId: 'pat-g17-pipeline-upgrade',
});

// ==========================================
// G18: Exact Scientific Tie
// ==========================================
export const G18_CASE_PHENOTYPE = createPhenotypeSnapshot({
  id: 'snap-golden-18',
  patientId: 'pat-g18-exact-tie',
});
