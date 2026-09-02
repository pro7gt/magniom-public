import { describe, it, expect } from 'vitest';
import {
  canonicalJsonStringify,
  computePhenotypeSnapshotHash,
  validatePhenotypeForClinicalTargeting,
  calculateDominantSymptomDomain,
} from './index.js';
import type { PhenotypeSnapshot } from '@magniom/domain';

describe('@magniom/phenotype', () => {
  const mockSnapshot: PhenotypeSnapshot = {
    id: 'snap-test-01',
    patientId: 'pat-test-01',
    primaryDiagnosis: 'Major Depressive Disorder',
    episodeSeverity: 'SEVERE_WITHOUT_PSYCHOSIS',
    safetyClearance: 'cleared',
    symptomScores: {
      dysphoriaScore: 0.9,
      anhedoniaScore: 0.6,
      anxiousSomaticScore: 0.3,
      ruminationScore: 0.5,
    },
    treatmentHistory: {
      medicationFailuresCount: 2,
      priorTmsExposure: false,
    },
    confirmedByClinicianId: 'clin-001',
    confirmedAt: '2026-09-02T00:00:00.000Z',
  };

  it('determines dominant symptom domain correctly', () => {
    const dominant = calculateDominantSymptomDomain(mockSnapshot);
    expect(dominant).toBe('DYSPHORIA');
  });

  it('computes deterministic SHA-256 seal for identical content with different key order', () => {
    const snapshot1 = { ...mockSnapshot };
    const snapshot2: PhenotypeSnapshot = {
      confirmedAt: '2026-09-02T00:00:00.000Z',
      confirmedByClinicianId: 'clin-001',
      id: 'snap-test-01',
      patientId: 'pat-test-01',
      primaryDiagnosis: 'Major Depressive Disorder',
      episodeSeverity: 'SEVERE_WITHOUT_PSYCHOSIS',
      safetyClearance: 'cleared',
      treatmentHistory: {
        priorTmsExposure: false,
        medicationFailuresCount: 2,
      },
      symptomScores: {
        ruminationScore: 0.5,
        anxiousSomaticScore: 0.3,
        anhedoniaScore: 0.6,
        dysphoriaScore: 0.9,
      },
    };

    const hash1 = computePhenotypeSnapshotHash(snapshot1);
    const hash2 = computePhenotypeSnapshotHash(snapshot2);

    expect(hash1).toHaveLength(64);
    expect(hash1).toBe(hash2);
  });

  it('validates phenotype satisfying clinical targeting requirements', () => {
    const result = validatePhenotypeForClinicalTargeting(mockSnapshot);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects contraindicated patients or missing clinician signatures', () => {
    const contraindicated = { ...mockSnapshot, safetyClearance: 'contraindicated' as const };
    const res1 = validatePhenotypeForClinicalTargeting(contraindicated);
    expect(res1.valid).toBe(false);
    expect(res1.errors.some(e => e.includes('contraindicated'))).toBe(true);

    const unsigned = { ...mockSnapshot, confirmedByClinicianId: '' };
    const res2 = validatePhenotypeForClinicalTargeting(unsigned);
    expect(res2.valid).toBe(false);
    expect(res2.errors.some(e => e.includes('MAG-CLI-001'))).toBe(true);
  });
});
