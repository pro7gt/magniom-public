import { describe, it, expect } from 'vitest';
import { runTargetEngine, evaluateAccessibilityGate } from '../src/index.js';
import {
  G01_CASE_PHENOTYPE,
  G02_CASE_PHENOTYPE,
  G02_CASE_CONNECTOME,
  G04_CASE_PHENOTYPE,
  G04_CASE_CONNECTOME,
  G05_CASE_PHENOTYPE,
  G05_CASE_CONNECTOME,
  G07_CASE_PHENOTYPE,
  G07_CASE_CONNECTOME,
  G08_CASE_PHENOTYPE,
  G08_CASE_CONNECTOME,
  createConnectomeInput,
} from '@magniom/test-fixtures';

describe('Sprint 12 — Determinism & Scientific Invariants Verification (M2 Exit Gate)', () => {
  // ----------------------------------------------------
  // 1. 100-Run Determinism Invariant
  // ----------------------------------------------------
  describe('Determinism Invariant (100 Iterations per Case)', () => {
    const cases = [
      { name: 'G01 Evidence-Only', phenotype: G01_CASE_PHENOTYPE, connectome: null },
      { name: 'G02 High-Convergence', phenotype: G02_CASE_PHENOTYPE, connectome: G02_CASE_CONNECTOME },
      { name: 'G04 Unreliable', phenotype: G04_CASE_PHENOTYPE, connectome: G04_CASE_CONNECTOME },
      { name: 'G05 Anxiosomatic', phenotype: G05_CASE_PHENOTYPE, connectome: G05_CASE_CONNECTOME },
      { name: 'G07 Mixed Phenotype', phenotype: G07_CASE_PHENOTYPE, connectome: G07_CASE_CONNECTOME },
    ];

    for (const testCase of cases) {
      it(`Case ${testCase.name} generates 100% identical manifest hash over 100 executions`, () => {
        const hashes = Array.from({ length: 100 }, () => {
          const slate = runTargetEngine({
            phenotypeSnapshot: testCase.phenotype,
            connectome: testCase.connectome,
            mode: 'CLINICAL',
          });
          return slate.deterministicManifestHash;
        });

        const uniqueHashes = new Set(hashes);
        expect(uniqueHashes.size).toBe(1);
      });
    }
  });

  // ----------------------------------------------------
  // 2. Monotonicity Invariants
  // ----------------------------------------------------
  describe('Monotonicity Invariants', () => {
    it('improving candidate reliability never decreases its overall score or ranking', () => {
      const lowRelConnectome = createConnectomeInput({
        candidateRegions: [
          {
            targetFamilyVersionId: 'TF-MDD-CONVERGENT-LDLPFC-001',
            candidateCode: 'CAN-MONO-LOW',
            generationMethod: 'CONNECTOME_REFINED',
            hemisphere: 'L',
            surfaceVertexIndex: 18452,
            parcelName: 'p9-46v_L',
            subjectT1Coordinate: { space: 'MNI152NLin2009cAsym', x: -44, y: 40, z: 34, unit: 'mm' },
            mniCoordinate: { space: 'MNI152NLin2009cAsym', x: -44, y: 40, z: 34, unit: 'mm' },
            clusterAreaMm2: 90.0,
            circuitConcordanceRaw: 0.75,
            circuitConcordancePercentile: 0.75,
            baselineCircuitConcordance: 0.60,
            accessibility: 'good',
            reliabilityScore: 0.72,
            fitInterpretation: 'Low reliability',
          },
        ],
      });

      const highRelConnectome = createConnectomeInput({
        candidateRegions: [
          {
            targetFamilyVersionId: 'TF-MDD-CONVERGENT-LDLPFC-001',
            candidateCode: 'CAN-MONO-HIGH',
            generationMethod: 'CONNECTOME_REFINED',
            hemisphere: 'L',
            surfaceVertexIndex: 18452,
            parcelName: 'p9-46v_L',
            subjectT1Coordinate: { space: 'MNI152NLin2009cAsym', x: -44, y: 40, z: 34, unit: 'mm' },
            mniCoordinate: { space: 'MNI152NLin2009cAsym', x: -44, y: 40, z: 34, unit: 'mm' },
            clusterAreaMm2: 90.0,
            circuitConcordanceRaw: 0.90,
            circuitConcordancePercentile: 0.90,
            baselineCircuitConcordance: 0.60,
            accessibility: 'good',
            reliabilityScore: 0.95,
            fitInterpretation: 'High reliability',
          },
        ],
      });

      const slateLow = runTargetEngine({
        phenotypeSnapshot: G02_CASE_PHENOTYPE,
        connectome: lowRelConnectome,
      });

      const slateHigh = runTargetEngine({
        phenotypeSnapshot: G02_CASE_PHENOTYPE,
        connectome: highRelConnectome,
      });

      expect(slateHigh.primaryCandidates[0].overallScore).toBeGreaterThanOrEqual(
        slateLow.primaryCandidates[0].overallScore
      );
    });
  });

  // ----------------------------------------------------
  // 3. Laterality Invariant (MAG-IMG-023 / Section 175)
  // ----------------------------------------------------
  describe('Laterality Invariant', () => {
    it('rejects a right-hemisphere coordinate (x >= 0) for a Left DLPFC TargetFamily', () => {
      const checkValidLeft = evaluateAccessibilityGate(
        { space: 'MNI152NLin2009cAsym', x: -44, y: 40, z: 34, unit: 'mm' },
        undefined,
        'TF-MDD-CONVERGENT-LDLPFC-001'
      );
      expect(checkValidLeft.accessible).toBe(true);

      const checkFlippedRight = evaluateAccessibilityGate(
        { space: 'MNI152NLin2009cAsym', x: 44, y: 40, z: 34, unit: 'mm' },
        undefined,
        'TF-MDD-CONVERGENT-LDLPFC-001'
      );
      expect(checkFlippedRight.accessible).toBe(false);
      expect(checkFlippedRight.lateralityViolation).toBe(true);
      expect(checkFlippedRight.warning).toContain('Laterality invariant violation');
    });
  });

  // ----------------------------------------------------
  // 4. Clinical vs Research Mode Leakage Isolation
  // ----------------------------------------------------
  describe('Mode Isolation Invariant (Zero Research Leakage)', () => {
    it('guarantees 0 exploratory research targets in Clinical Mode Slates', () => {
      const slate = runTargetEngine({
        phenotypeSnapshot: G08_CASE_PHENOTYPE,
        connectome: G08_CASE_CONNECTOME,
        mode: 'CLINICAL',
      });

      const allCandidates = [
        ...slate.primaryCandidates,
        ...slate.additionalCandidates,
      ];

      for (const candidate of allCandidates) {
        expect(candidate.evidenceTier).not.toBe('T4');
        expect(candidate.familyId).not.toBe('TF-MDD-L8AV-001');
      }
    });
  });

  // ----------------------------------------------------
  // 5. Counterfactual Baseline Preservation Invariant
  // ----------------------------------------------------
  describe('Counterfactual Baseline Preservation Invariant', () => {
    it('always preserves evidence baseline as counterfactual whenever personalisation qualifies', () => {
      const slate = runTargetEngine({
        phenotypeSnapshot: G02_CASE_PHENOTYPE,
        connectome: G02_CASE_CONNECTOME,
        mode: 'CLINICAL',
      });

      expect(slate.personalisationQualification).toBe('qualified');
      expect(slate.primaryCandidates[0].method).toBe('CONNECTOME_REFINED');

      // Additional candidate slot must contain the evidence baseline
      const counterfactual = slate.additionalCandidates.find(
        (c) => c.familyId === 'TF-MDD-LDLPFC-EST-001' && c.method === 'EVIDENCE_ONLY_PRIOR'
      );
      expect(counterfactual).toBeDefined();
      expect(counterfactual?.role).toBe('ADDITIONAL_A');
    });
  });
});
