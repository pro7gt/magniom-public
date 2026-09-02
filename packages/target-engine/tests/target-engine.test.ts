import { describe, it, expect } from 'vitest';
import {
  runTargetEngine,
  evaluateClinicalScopeGate,
  evaluateReliabilityGate,
} from '../src/index.js';
import {
  GOLDEN_CASE_01_PHENOTYPE,
  GOLDEN_CASE_01_SLATE,
  G04_PHENOTYPE,
  G04_CONNECTOME,
  GOLDEN_CASE_04_SLATE,
  G05_PHENOTYPE,
  G01_PHENOTYPE,
} from '@magniom/test-fixtures';
import { DEFAULT_MDD_SCIENTIFIC_POLICY } from '@magniom/scientific-policy';
import type { PhenotypeSnapshot } from '@magniom/domain';

describe('Sprint 2 — Target Engine Skeleton Verification', () => {
  describe('Golden Case 01: Evidence-Only MDD Target Selection (Sprint 2 Exit Criterion)', () => {
    it('cleanly runs and matches canonical G01 Golden Output with zero connectome', () => {
      const slate = runTargetEngine({
        phenotypeSnapshot: GOLDEN_CASE_01_PHENOTYPE,
        connectome: null,
        mode: 'CLINICAL',
      });

      expect(slate.id).toBe('slate-golden-01');
      expect(slate.caseId).toBe('case-golden-01');
      expect(slate.phenotypeSnapshotId).toBe(GOLDEN_CASE_01_PHENOTYPE.id);
      expect(slate.mode).toBe('CLINICAL');
      expect(slate.personalisationQualification).toBe('not_available');

      // Primary candidates assertions
      expect(slate.primaryCandidates).toHaveLength(1);
      const primary1 = slate.primaryCandidates[0];
      expect(primary1.id).toBe('cand-g01-evidence-ldlpfc');
      expect(primary1.role).toBe('PRIMARY_1');
      expect(primary1.method).toBe('EVIDENCE_ONLY_PRIOR');
      expect(primary1.evidenceTier).toBe('T1');
      expect(primary1.familyId).toBe('TF-MDD-LDLPFC-EST-001');
      expect(primary1.circuitId).toBe('CIRCUIT-MDD-LDLPFC-001');
      expect(primary1.mniCoordinate).toEqual({
        space: 'MNI152NLin2009cAsym',
        x: -38,
        y: 44,
        z: 30,
        unit: 'mm',
      });
      expect(primary1.evidenceScore).toBe(0.95);
      expect(primary1.phenotypeConcordanceScore).toBe(0.92);
      expect(primary1.overallScore).toBe(0.93);
      expect(primary1.isSuppressedOrRedundant).toBe(false);

      // Additional and suppressed candidate empty bounds
      expect(slate.additionalCandidates).toHaveLength(0);
      expect(slate.suppressedCandidates).toHaveLength(0);

      // Coverage profile
      expect(slate.clinicalCoverageProfile).toEqual({
        primaryDomainCovered: 'DOMAIN-MDD-DYSPHORIC-001',
        secondaryDomainsCovered: [],
        overallClinicalCoverageScore: 0.92,
      });

      // Byte-for-byte matching with golden case fixture
      expect(slate).toEqual(GOLDEN_CASE_01_SLATE);
    });

    it('proves 100% determinism over 100 consecutive executions (Determinism Invariant)', () => {
      const hashes = Array.from({ length: 100 }, () => {
        const slate = runTargetEngine({
          phenotypeSnapshot: GOLDEN_CASE_01_PHENOTYPE,
          connectome: null,
          mode: 'CLINICAL',
        });
        return slate.deterministicManifestHash;
      });

      const uniqueHashes = new Set(hashes);
      expect(uniqueHashes.size).toBe(1);
      expect(hashes[0]).toBe(GOLDEN_CASE_01_SLATE.deterministicManifestHash);
    });
  });

  describe('Non-Imaging Golden Cases & Fallback Behavior', () => {
    it('G04: enforces evidence-only baseline when fMRI reliability fails gate (0.42 < 0.70)', () => {
      const slate = runTargetEngine({
        phenotypeSnapshot: G04_PHENOTYPE,
        connectome: G04_CONNECTOME,
        mode: 'CLINICAL',
      });

      expect(slate.personalisationQualification).toBe('ineligible');
      expect(slate.primaryCandidates).toHaveLength(1);
      expect(slate.primaryCandidates[0].role).toBe('PRIMARY_1');
      expect(slate.primaryCandidates[0].method).toBe('EVIDENCE_ONLY_PRIOR');
      expect(slate.primaryCandidates[0].contraindicationsOrConflicts).toContain(
        'LIMITED_FC_RELIABILITY',
      );

      // Unreliable connectome candidate is stored in suppressedCandidates
      expect(slate.suppressedCandidates).toHaveLength(1);
      expect(slate.suppressedCandidates[0].isSuppressedOrRedundant).toBe(true);
      expect(slate.suppressedCandidates[0].suppressionReason).toBe('LOW_RELIABILITY');
      expect(slate.suppressedCandidates[0].contraindicationsOrConflicts).toContain(
        'LIMITED_FC_RELIABILITY',
      );

      expect(slate).toEqual(GOLDEN_CASE_04_SLATE);
    });

    it('evaluates anxiosomatic non-imaging phenotype concordance prioritizing DMPFC target', () => {
      const slate = runTargetEngine({
        phenotypeSnapshot: G05_PHENOTYPE,
        connectome: null,
        mode: 'CLINICAL',
      });

      expect(slate.personalisationQualification).toBe('not_available');
      expect(slate.primaryCandidates.length).toBeGreaterThanOrEqual(1);

      // Primary 1 is the evidence anchor and Primary 2 is the distinct Anxiosomatic DMPFC circuit target
      const primary2 = slate.primaryCandidates.find(c => c.role === 'PRIMARY_2');
      expect(primary2).toBeDefined();
      expect(primary2?.familyId).toBe('TF-MDD-ANXIOSOMATIC-DMPFC-001');
      expect(primary2?.evidenceTier).toBe('T2');
      expect(primary2?.mniCoordinate).toEqual({
        space: 'MNI152NLin2009cAsym',
        x: 0,
        y: 48,
        z: 46,
        unit: 'mm',
      });
    });
  });

  describe('Hard Scientific Gates & Complete Abstention', () => {
    it('abtains cleanly when clinical safety is un-cleared in Clinical Mode', () => {
      const unclearedPhenotype: PhenotypeSnapshot = {
        ...G01_PHENOTYPE,
        id: 'snap-uncleared',
        safetyClearance: 'requires_review',
      };

      const slate = runTargetEngine({
        phenotypeSnapshot: unclearedPhenotype,
        connectome: null,
        mode: 'CLINICAL',
      });

      expect(slate.abstentionReason).toBe('SAFETY_NOT_CLEARED');
      expect(slate.abstentionProfile?.hasAbstained).toBe(true);
      expect(slate.primaryCandidates).toHaveLength(0);
      expect(slate.additionalCandidates).toHaveLength(0);
      expect(slate.deterministicManifestHash).toHaveLength(64);
    });

    it('abstains cleanly when primary diagnosis is outside active scientific policy scope', () => {
      const outOfScopePhenotype: PhenotypeSnapshot = {
        ...G01_PHENOTYPE,
        id: 'snap-bipolar',
        primaryDiagnosis: 'Bipolar I Disorder, Current Episode Manic',
        diagnosisAssertion: {
          code: 'BP1',
          display: 'Bipolar I Disorder',
          status: 'confirmed',
          diagnosticSystem: 'DSM-5',
        },
      };

      const slate = runTargetEngine({
        phenotypeSnapshot: outOfScopePhenotype,
        connectome: null,
        mode: 'CLINICAL',
      });

      expect(slate.abstentionReason).toBe('DIAGNOSIS_OUT_OF_SCOPE');
      expect(slate.abstentionProfile?.hasAbstained).toBe(true);
      expect(slate.primaryCandidates).toHaveLength(0);
      expect(slate.additionalCandidates).toHaveLength(0);
    });

    it('abstains cleanly when episode is inactive', () => {
      const inactivePhenotype: PhenotypeSnapshot = {
        ...G01_PHENOTYPE,
        id: 'snap-inactive',
        episodeProfile: {
          active: false,
          severity: 'MILD',
        },
      };

      const slate = runTargetEngine({
        phenotypeSnapshot: inactivePhenotype,
        connectome: null,
        mode: 'CLINICAL',
      });

      expect(slate.abstentionReason).toBe('INACTIVE_EPISODE');
      expect(slate.abstentionProfile?.hasAbstained).toBe(true);
    });
  });

  describe('Property & Invariant Tests', () => {
    it('guarantees that primary candidate count never exceeds 3', () => {
      const slate = runTargetEngine({
        phenotypeSnapshot: G01_PHENOTYPE,
        connectome: null,
        mode: 'CLINICAL',
      });

      expect(slate.primaryCandidates.length).toBeLessThanOrEqual(3);
    });

    it('guarantees that additional candidate count never exceeds 2', () => {
      const slate = runTargetEngine({
        phenotypeSnapshot: G01_PHENOTYPE,
        connectome: null,
        mode: 'CLINICAL',
      });

      expect(slate.additionalCandidates.length).toBeLessThanOrEqual(2);
    });

    it('guarantees all candidate coordinates and scores are valid numbers in bounds', () => {
      const slate = runTargetEngine({
        phenotypeSnapshot: G05_PHENOTYPE,
        connectome: null,
        mode: 'CLINICAL',
      });

      for (const candidate of [...slate.primaryCandidates, ...slate.additionalCandidates]) {
        expect(candidate.overallScore).toBeGreaterThanOrEqual(0.0);
        expect(candidate.overallScore).toBeLessThanOrEqual(1.0);
        expect(candidate.evidenceScore).toBeGreaterThanOrEqual(0.0);
        expect(candidate.evidenceScore).toBeLessThanOrEqual(1.0);
        expect(candidate.phenotypeConcordanceScore).toBeGreaterThanOrEqual(0.0);
        expect(candidate.phenotypeConcordanceScore).toBeLessThanOrEqual(1.0);
        expect(Number.isFinite(candidate.mniCoordinate.x)).toBe(true);
        expect(Number.isFinite(candidate.mniCoordinate.y)).toBe(true);
        expect(Number.isFinite(candidate.mniCoordinate.z)).toBe(true);
      }
    });
  });
});
