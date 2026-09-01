/**
 * @magniom/test-fixtures
 * Synthetic Golden Cases G01–G05 conforming to MAGNIOM-Synthetic Vertical Slice Specification v1.0.
 * No protected health information (PHI). 100% synthetic.
 */

import type { PhenotypeSnapshot, TargetCandidate } from '@magniom/domain';

export const GOLDEN_CASE_01_PHENOTYPE: PhenotypeSnapshot = {
  id: 'snap-golden-01',
  patientId: 'synth-pat-g01',
  primaryDiagnosis: 'Major Depressive Disorder, Single Episode, Severe without Psychotic Features',
  episodeSeverity: 'SEVERE_WITHOUT_PSYCHOSIS',
  symptomScores: {
    dysphoriaScore: 0.88,
    anhedoniaScore: 0.75,
    anxiousSomaticScore: 0.3,
    ruminationScore: 0.65,
  },
  treatmentHistory: {
    medicationFailuresCount: 2,
    priorTmsExposure: false,
  },
  confirmedByClinicianId: 'clin-demo-001',
  confirmedAt: '2026-09-01T10:00:00.000Z',
};

export const GOLDEN_CASE_01_PRIMARY_CANDIDATE: TargetCandidate = {
  id: 'cand-g01-prim1',
  familyId: 'LEFT_DLPFC_BA46',
  circuitId: 'DLPFC_SGACC_ANTISYNC',
  role: 'PRIMARY_1',
  method: 'CONNECTOME_REFINED',
  evidenceTier: 'T1',
  mniCoordinate: {
    space: 'MNI152NLin2009cAsym',
    x: -44,
    y: 38,
    z: 32,
  },
  surfaceVertex: {
    space: 'fsLR_32k',
    hemisphere: 'L',
    vertexIndex: 18452,
    parcelName: 'p9-46v_L',
  },
  evidenceScore: 0.96,
  phenotypeConcordanceScore: 0.92,
  connectomeRefinementScore: 0.88,
  overallScore: 0.93,
  rationale: 'High sgACC anticorrelation with robust DLPFC evidence baseline for severe dysphoric depression.',
  contraindicationsOrConflicts: [],
  isSuppressedOrRedundant: false,
};
