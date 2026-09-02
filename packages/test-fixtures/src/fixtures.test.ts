import { describe, it, expect } from 'vitest';
import {
  ALL_GOLDEN_CASES,
  GOLDEN_CASE_01,
  GOLDEN_CASE_02,
  GOLDEN_CASE_03,
  GOLDEN_CASE_04,
  GOLDEN_CASE_05,
} from './index.js';
import {
  validateTargetSlate,
  validatePhenotypeSnapshot,
  TargetSlateSchema,
} from '@magniom/schemas';
import { computeSha256 } from '@magniom/scientific-policy';

describe('Golden Cases G01–G05 & Sprint 1 Exit Criteria', () => {
  it.each(ALL_GOLDEN_CASES)(
    'should cleanly validate $caseCode ($title) without a database',
    fixture => {
      const validatedSlate = validateTargetSlate(fixture.expectedSlate);
      expect(validatedSlate.id).toBe(fixture.expectedSlate.id);
      expect(validatedSlate.primaryCandidates.length).toBeLessThanOrEqual(3);
      expect(validatedSlate.additionalCandidates.length).toBeLessThanOrEqual(2);

      const validatedPhenotype = validatePhenotypeSnapshot(fixture.phenotype);
      expect(validatedPhenotype.patientId).toBe(fixture.phenotype.patientId);

      // Verify deterministic hash length
      expect(validatedSlate.deterministicManifestHash).toHaveLength(64);
    }
  );

  it('G01: should enforce evidence-only targeting when connectome is null', () => {
    expect(GOLDEN_CASE_01.connectome).toBeNull();
    const slate = GOLDEN_CASE_01.expectedSlate;
    expect(slate.primaryCandidates).toHaveLength(1);
    expect(slate.primaryCandidates[0]?.method).toBe('EVIDENCE_ONLY_PRIOR');
    expect(slate.personalisationQualification).toBe('not_available');
    expect(slate.additionalCandidates).toHaveLength(0);
  });

  it('G02: should adopt qualified connectome-refined personalisation with preserved baseline counterfactual', () => {
    const slate = GOLDEN_CASE_02.expectedSlate;
    expect(slate.primaryCandidates).toHaveLength(1);
    expect(slate.primaryCandidates[0]?.method).toBe('CONNECTOME_REFINED');
    expect(slate.primaryCandidates[0]?.role).toBe('PRIMARY_1');
    expect(slate.personalisationQualification).toBe('qualified');

    // Baseline is preserved as Additional A
    expect(slate.additionalCandidates).toHaveLength(1);
    expect(slate.additionalCandidates[0]?.role).toBe('ADDITIONAL_A');
    expect(slate.additionalCandidates[0]?.method).toBe('EVIDENCE_ONLY_PRIOR');
    expect(slate.counterfactualSummary?.expectedMechanisticGain).toBe(0.18);
  });

  it('G03: should suppress connectome candidate due to low incremental gain over baseline', () => {
    const slate = GOLDEN_CASE_03.expectedSlate;
    expect(slate.primaryCandidates).toHaveLength(1);
    expect(slate.primaryCandidates[0]?.method).toBe('EVIDENCE_ONLY_PRIOR');

    expect(slate.suppressedCandidates).toHaveLength(1);
    expect(slate.suppressedCandidates[0]?.isSuppressedOrRedundant).toBe(true);
    expect(slate.suppressedCandidates[0]?.suppressionReason).toBe('LOW_INCREMENTAL_VALUE');
    expect(slate.personalisationQualification).toBe('limited');
  });

  it('G04: should suppress dramatic connectome candidate due to poor fMRI reliability', () => {
    const slate = GOLDEN_CASE_04.expectedSlate;
    expect(slate.primaryCandidates).toHaveLength(1);
    expect(slate.primaryCandidates[0]?.method).toBe('EVIDENCE_ONLY_PRIOR');

    expect(slate.suppressedCandidates).toHaveLength(1);
    expect(slate.suppressedCandidates[0]?.isSuppressedOrRedundant).toBe(true);
    expect(slate.suppressedCandidates[0]?.suppressionReason).toBe('LOW_RELIABILITY');
    expect(slate.personalisationQualification).toBe('ineligible');
  });

  it('G05: should generate distinct Anxiosomatic Primary 2 target when anxiety is clinically dominant', () => {
    const slate = GOLDEN_CASE_05.expectedSlate;
    expect(slate.primaryCandidates).toHaveLength(2);

    const primary1 = slate.primaryCandidates[0];
    const primary2 = slate.primaryCandidates[1];

    expect(primary1?.role).toBe('PRIMARY_1');
    expect(primary1?.method).toBe('CONNECTOME_REFINED');

    expect(primary2?.role).toBe('PRIMARY_2');
    expect(primary2?.familyId).toBe('TF-MDD-ANXIOSOMATIC-DMPFC-001');
    expect(primary2?.mniCoordinate.x).toBe(0);
    expect(primary2?.mniCoordinate.y).toBe(48);
    expect(primary2?.mniCoordinate.z).toBe(46);

    expect(slate.additionalCandidates).toHaveLength(1);
    expect(slate.additionalCandidates[0]?.role).toBe('ADDITIONAL_A');
  });

  it('Property Test: Deterministic hashing generates identical hashes for repeated runs', () => {
    const iterations = Array.from({ length: 100 }, () =>
      computeSha256(GOLDEN_CASE_02.expectedSlate)
    );
    const unique = new Set(iterations);
    expect(unique.size).toBe(1);
  });
});
