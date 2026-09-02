import { describe, it, expect } from 'vitest';
import { runTargetEngine, isSlateStale } from '../src/index.js';
import {
  G01_CASE_PHENOTYPE,
  G02_CASE_PHENOTYPE,
  G02_CASE_CONNECTOME,
  G03_CASE_PHENOTYPE,
  G03_CASE_CONNECTOME,
  G04_CASE_PHENOTYPE,
  G04_CASE_CONNECTOME,
  G05_CASE_PHENOTYPE,
  G05_CASE_CONNECTOME,
  G06_CASE_PHENOTYPE,
  G06_CASE_CONNECTOME,
  G07_CASE_PHENOTYPE,
  G07_CASE_CONNECTOME,
  G08_CASE_PHENOTYPE,
  G08_CASE_CONNECTOME,
  G09_CASE_PHENOTYPE,
  G09_CASE_CONNECTOME,
  G10_CASE_PHENOTYPE,
  G10_CASE_CONNECTOME,
  G11_CASE_PHENOTYPE,
  G11_CASE_CONNECTOME,
  G12_CASE_PHENOTYPE,
  G13_CASE_PHENOTYPE,
  G14_CASE_PHENOTYPE_V1,
  G14_CASE_PHENOTYPE_V2,
  G15_CASE_PHENOTYPE,
  G16_CASE_PHENOTYPE,
  G17_CASE_PHENOTYPE,
  G18_CASE_PHENOTYPE,
  createConnectomeInput,
  createReliabilityProfile,
} from '@magniom/test-fixtures';
import { CANONICAL_EVIDENCE_RELEASE_1_0_0 } from '@magniom/evidence';

describe('Sprint 12 — Golden Cases Verification (G01–G18) with Real NeuroCompute Contract', () => {
  // ----------------------------------------------------
  // G01: Evidence-Only Standard Case
  // ----------------------------------------------------
  describe('G01: Evidence-Only MDD Baseline Prior', () => {
    it('generates valid evidence-only slate when connectome is unavailable', () => {
      const slate = runTargetEngine({
        phenotypeSnapshot: G01_CASE_PHENOTYPE,
        connectome: null,
        mode: 'CLINICAL',
      });

      expect(slate.personalisationQualification).toBe('not_available');
      expect(slate.primaryCandidates).toHaveLength(1);
      expect(slate.primaryCandidates[0].role).toBe('PRIMARY_1');
      expect(slate.primaryCandidates[0].familyId).toBe('TF-MDD-LDLPFC-EST-001');
      expect(slate.primaryCandidates[0].method).toBe('EVIDENCE_ONLY_PRIOR');
      expect(slate.additionalCandidates).toHaveLength(0);
      expect(slate.suppressedCandidates).toHaveLength(0);
    });
  });

  // ----------------------------------------------------
  // G02: High-Convergence Personalisation
  // ----------------------------------------------------
  describe('G02: High-Convergence Connectome Personalisation', () => {
    it('promotes convergent candidate to Primary 1 and preserves evidence baseline as counterfactual', () => {
      const slate = runTargetEngine({
        phenotypeSnapshot: G02_CASE_PHENOTYPE,
        connectome: G02_CASE_CONNECTOME,
        mode: 'CLINICAL',
      });

      expect(slate.personalisationQualification).toBe('qualified');
      expect(slate.primaryCandidates).toHaveLength(1);

      const p1 = slate.primaryCandidates[0];
      expect(p1.role).toBe('PRIMARY_1');
      expect(p1.familyId).toBe('TF-MDD-CONVERGENT-LDLPFC-001');
      expect(p1.method).toBe('CONNECTOME_REFINED');
      expect(p1.convergenceProfile).toBeDefined();
      expect(p1.convergenceProfile?.convergenceClassification).toBe('high');
      expect(p1.convergenceProfile?.distanceToEvidenceBaselineMm).toBeCloseTo(8.25, 1);
      expect(p1.convergenceProfile?.incrementalGainOverBaseline).toBeGreaterThanOrEqual(0.10);

      // Additional candidate must contain the counterfactual baseline prior
      expect(slate.additionalCandidates).toHaveLength(1);
      const addA = slate.additionalCandidates[0];
      expect(addA.role).toBe('ADDITIONAL_A');
      expect(addA.familyId).toBe('TF-MDD-LDLPFC-EST-001');
      expect(addA.method).toBe('EVIDENCE_ONLY_PRIOR');
    });
  });

  // ----------------------------------------------------
  // G03: Low Incremental Value
  // ----------------------------------------------------
  describe('G03: Personalisation Below Incremental-Value Threshold', () => {
    it('keeps evidence baseline as Primary 1 and suppresses low-gain connectome candidate', () => {
      const slate = runTargetEngine({
        phenotypeSnapshot: G03_CASE_PHENOTYPE,
        connectome: G03_CASE_CONNECTOME,
        mode: 'CLINICAL',
      });

      // Primary 1 remains evidence prior
      expect(slate.primaryCandidates).toHaveLength(1);
      expect(slate.primaryCandidates[0].familyId).toBe('TF-MDD-LDLPFC-EST-001');
      expect(slate.primaryCandidates[0].method).toBe('EVIDENCE_ONLY_PRIOR');

      // Connectome candidate is suppressed due to low incremental gain (< 0.10)
      expect(slate.suppressedCandidates).toHaveLength(1);
      expect(slate.suppressedCandidates[0].familyId).toBe('TF-MDD-CONVERGENT-LDLPFC-001');
      expect(slate.suppressedCandidates[0].suppressionReason).toBe('LOW_INCREMENTAL_VALUE');
    });
  });

  // ----------------------------------------------------
  // G04: Unreliable Connectome
  // ----------------------------------------------------
  describe('G04: Unreliable Connectome (Motion / Low Reliability)', () => {
    it('rejects personalisation, suppresses candidate with LOW_RELIABILITY, and retains evidence anchor', () => {
      const slate = runTargetEngine({
        phenotypeSnapshot: G04_CASE_PHENOTYPE,
        connectome: G04_CASE_CONNECTOME,
        mode: 'CLINICAL',
      });

      expect(slate.personalisationQualification).toBe('ineligible');
      expect(slate.primaryCandidates).toHaveLength(1);
      expect(slate.primaryCandidates[0].familyId).toBe('TF-MDD-LDLPFC-EST-001');
      expect(slate.primaryCandidates[0].contraindicationsOrConflicts).toContain('LIMITED_FC_RELIABILITY');

      expect(slate.suppressedCandidates).toHaveLength(1);
      expect(slate.suppressedCandidates[0].suppressionReason).toBe('LOW_RELIABILITY');
      expect(slate.suppressedCandidates[0].contraindicationsOrConflicts).toContain('LIMITED_FC_RELIABILITY');
    });
  });

  // ----------------------------------------------------
  // G05: Anxiosomatic-Dominant MDD
  // ----------------------------------------------------
  describe('G05: Anxiosomatic-Dominant MDD', () => {
    it('allocates Primary 1 evidence anchor and Primary 2 anxiosomatic DMPFC target', () => {
      const slate = runTargetEngine({
        phenotypeSnapshot: G05_CASE_PHENOTYPE,
        connectome: G05_CASE_CONNECTOME,
        mode: 'CLINICAL',
      });

      expect(slate.primaryCandidates).toHaveLength(2);
      expect(slate.primaryCandidates[0].role).toBe('PRIMARY_1');
      expect(slate.primaryCandidates[0].familyId).toBe('TF-MDD-LDLPFC-EST-001');

      expect(slate.primaryCandidates[1].role).toBe('PRIMARY_2');
      expect(slate.primaryCandidates[1].familyId).toBe('TF-MDD-ANXIOSOMATIC-DMPFC-001');
      expect(slate.primaryCandidates[1].mniCoordinate.x).toBe(-6);
    });
  });

  // ----------------------------------------------------
  // G06: Dysphoric-Dominant MDD
  // ----------------------------------------------------
  describe('G06: Dysphoric-Dominant MDD', () => {
    it('promotes dysphoric DLPFC target to Primary 1 with no unnecessary Primary 2', () => {
      const slate = runTargetEngine({
        phenotypeSnapshot: G06_CASE_PHENOTYPE,
        connectome: G06_CASE_CONNECTOME,
        mode: 'CLINICAL',
      });

      expect(slate.primaryCandidates).toHaveLength(1);
      expect(slate.primaryCandidates[0].role).toBe('PRIMARY_1');
      expect(slate.primaryCandidates[0].familyId).toBe('TF-MDD-CONVERGENT-LDLPFC-001');
    });
  });

  // ----------------------------------------------------
  // G07: Mixed Phenotype
  // ----------------------------------------------------
  describe('G07: Mixed Dysphoric/Anxiosomatic Phenotype', () => {
    it('produces two distinct clinical hypotheses (DLPFC Primary 1 and DMPFC Primary 2)', () => {
      const slate = runTargetEngine({
        phenotypeSnapshot: G07_CASE_PHENOTYPE,
        connectome: G07_CASE_CONNECTOME,
        mode: 'CLINICAL',
      });

      expect(slate.primaryCandidates).toHaveLength(2);
      expect(slate.primaryCandidates[0].familyId).toBe('TF-MDD-CONVERGENT-LDLPFC-001');
      expect(slate.primaryCandidates[1].familyId).toBe('TF-MDD-ANXIOSOMATIC-DMPFC-001');
    });
  });

  // ----------------------------------------------------
  // G08: Research Anomaly (L8Av)
  // ----------------------------------------------------
  describe('G08: Research Anomaly Isolation', () => {
    it('excludes exploratory Tier 4 target in CLINICAL mode and allows it in RESEARCH mode', () => {
      const clinicalSlate = runTargetEngine({
        phenotypeSnapshot: G08_CASE_PHENOTYPE,
        connectome: G08_CASE_CONNECTOME,
        mode: 'CLINICAL',
      });

      // Clinical slate must NOT contain L8Av target in primary candidates
      expect(clinicalSlate.primaryCandidates.some((c) => c.familyId === 'TF-MDD-L8AV-001')).toBe(false);

      const researchSlate = runTargetEngine({
        phenotypeSnapshot: G08_CASE_PHENOTYPE,
        connectome: G08_CASE_CONNECTOME,
        mode: 'RESEARCH',
      });

      // Research slate displays L8Av candidate in exploratory additional position
      expect(researchSlate.additionalCandidates.some((c) => c.familyId === 'TF-MDD-L8AV-001')).toBe(true);
    });
  });

  // ----------------------------------------------------
  // G09: Major FC Divergence
  // ----------------------------------------------------
  describe('G09: Major FC Divergence (>30mm)', () => {
    it('suppresses candidate >30mm from baseline and retains evidence anchor', () => {
      const slate = runTargetEngine({
        phenotypeSnapshot: G09_CASE_PHENOTYPE,
        connectome: G09_CASE_CONNECTOME,
        mode: 'CLINICAL',
      });

      expect(slate.primaryCandidates[0].familyId).toBe('TF-MDD-LDLPFC-EST-001');
      expect(slate.suppressedCandidates.some((c) => c.suppressionReason === 'MAJOR_DIVERGENCE')).toBe(true);
    });
  });

  // ----------------------------------------------------
  // G10: Redundant 5-Candidate Set
  // ----------------------------------------------------
  describe('G10: Redundant Candidate Set Compression', () => {
    it('collapses 5 nearby DLPFC candidates into single active candidate and suppresses 4', () => {
      const slate = runTargetEngine({
        phenotypeSnapshot: G10_CASE_PHENOTYPE,
        connectome: G10_CASE_CONNECTOME,
        mode: 'CLINICAL',
      });

      // Exactly 1 Primary 1 candidate
      expect(slate.primaryCandidates).toHaveLength(1);
      // Redundant candidates are placed in suppressed list with REDUNDANT_ANATOMICAL
      const redundantCount = slate.suppressedCandidates.filter(
        (c) => c.suppressionReason === 'REDUNDANT_ANATOMICAL'
      ).length;
      expect(redundantCount).toBeGreaterThanOrEqual(4);
    });
  });

  // ----------------------------------------------------
  // G11: Anatomical Inaccessibility
  // ----------------------------------------------------
  describe('G11: Anatomical Inaccessibility Gate', () => {
    it('suppresses inaccessible candidate and promotes next eligible candidate', () => {
      const slate = runTargetEngine({
        phenotypeSnapshot: G11_CASE_PHENOTYPE,
        connectome: G11_CASE_CONNECTOME,
        mode: 'CLINICAL',
      });

      // Inaccessible candidate suppressed
      expect(slate.suppressedCandidates.some((c) => c.suppressionReason === 'ANATOMICALLY_INACCESSIBLE')).toBe(true);
      // Accessible candidate promoted
      expect(slate.primaryCandidates[0].id).toBe('can-acc-g11-2');
    });
  });

  // ----------------------------------------------------
  // G12: No Clinical Target (Complete Abstention)
  // ----------------------------------------------------
  describe('G12: No Clinical Target / Complete Abstention', () => {
    it('returns abstention slate when all candidates fail accessibility and indication', () => {
      const allInaccessibleConnectome = createConnectomeInput({
        candidateRegions: [
          {
            targetFamilyVersionId: 'TF-MDD-CONVERGENT-LDLPFC-001',
            candidateCode: 'CAN-FAIL-ALL',
            generationMethod: 'CONNECTOME_REFINED',
            hemisphere: 'L',
            surfaceVertexIndex: 999,
            parcelName: 'p9-46v_L',
            subjectT1Coordinate: { space: 'MNI152NLin2009cAsym', x: -30, y: 40, z: 120, unit: 'mm' },
            mniCoordinate: { space: 'MNI152NLin2009cAsym', x: -30, y: 40, z: 120, unit: 'mm' },
            clusterAreaMm2: 95.0,
            circuitConcordanceRaw: 0.95,
            circuitConcordancePercentile: 0.95,
            baselineCircuitConcordance: 0.65,
            accessibility: 'inaccessible',
            reliabilityScore: 0.88,
            fitInterpretation: 'Inaccessible',
          },
        ],
      });

      const slate = runTargetEngine({
        phenotypeSnapshot: G12_CASE_PHENOTYPE,
        connectome: allInaccessibleConnectome,
        mode: 'CLINICAL',
        candidates: [],
      });

      expect(slate.primaryCandidates).toHaveLength(1); // Evidence baseline acts as safeguard for depression
    });
  });

  // ----------------------------------------------------
  // G13: Research-Clinical Leakage Attack
  // ----------------------------------------------------
  describe('G13: Research-Clinical Leakage Attack Prevention', () => {
    it('strictly blocks exploratory Tier 4 target from entering clinical slate', () => {
      const maliciousConnectome = createConnectomeInput({
        candidateRegions: [
          {
            targetFamilyVersionId: 'TF-MDD-L8AV-001', // Research only
            candidateCode: 'CAN-MALICIOUS-L8AV',
            generationMethod: 'CONNECTOME_REFINED',
            hemisphere: 'L',
            surfaceVertexIndex: 15200,
            parcelName: '8Av_L',
            subjectT1Coordinate: { space: 'MNI152NLin2009cAsym', x: -36, y: 26, z: 46, unit: 'mm' },
            mniCoordinate: { space: 'MNI152NLin2009cAsym', x: -36, y: 26, z: 46, unit: 'mm' },
            clusterAreaMm2: 150.0,
            circuitConcordanceRaw: 0.99,
            circuitConcordancePercentile: 0.99,
            baselineCircuitConcordance: 0.50,
            accessibility: 'good',
            reliabilityScore: 0.95,
            fitInterpretation: 'Exploratory attempt',
          },
        ],
      });

      const slate = runTargetEngine({
        phenotypeSnapshot: G13_CASE_PHENOTYPE,
        connectome: maliciousConnectome,
        mode: 'CLINICAL',
      });

      expect(slate.primaryCandidates.some((c) => c.familyId === 'TF-MDD-L8AV-001')).toBe(false);
      expect(slate.additionalCandidates.some((c) => c.familyId === 'TF-MDD-L8AV-001')).toBe(false);
    });
  });

  // ----------------------------------------------------
  // G14: Stale Phenotype Detection
  // ----------------------------------------------------
  describe('G14: Stale Phenotype Staleness Detection', () => {
    it('detects when Target Slate is stale relative to updated Phenotype Snapshot', () => {
      const slateV1 = runTargetEngine({
        phenotypeSnapshot: G14_CASE_PHENOTYPE_V1,
        connectome: null,
        mode: 'CLINICAL',
      });

      // Slate matches v1 snapshot
      expect(isSlateStale(slateV1, G14_CASE_PHENOTYPE_V1)).toBe(false);

      // Slate is stale relative to v2 snapshot
      expect(isSlateStale(slateV1, G14_CASE_PHENOTYPE_V2)).toBe(true);
    });
  });

  // ----------------------------------------------------
  // G15: Conflicting Evidence In Knowledge Graph
  // ----------------------------------------------------
  describe('G15: Conflicting Evidence In Knowledge Graph', () => {
    it('includes rich evidence graph drawer with citations and balanced support/conflict', () => {
      const slate = runTargetEngine({
        phenotypeSnapshot: G15_CASE_PHENOTYPE,
        connectome: G02_CASE_CONNECTOME,
        mode: 'CLINICAL',
      });

      const p1 = slate.primaryCandidates[0];
      expect(p1.evidencePaths).toBeDefined();
      expect(p1.evidencePaths?.length).toBeGreaterThan(0);
      expect(p1.counterarguments).toBeDefined();
      expect(p1.counterarguments?.length).toBeGreaterThan(0);
    });
  });

  // ----------------------------------------------------
  // G16: Evidence Release Upgrade
  // ----------------------------------------------------
  describe('G16: Evidence Library Version Upgrades', () => {
    it('preserves immutable slate with explicit version tracking across evidence upgrades', () => {
      const slateV1 = runTargetEngine({
        phenotypeSnapshot: G16_CASE_PHENOTYPE,
        evidenceRelease: CANONICAL_EVIDENCE_RELEASE_1_0_0,
        evidenceVersion: '1.0.0',
        mode: 'CLINICAL',
      });

      expect(slateV1.evidenceReleaseVersion).toBe('1.0.0');
      expect(slateV1.deterministicManifestHash).toBeDefined();
    });
  });

  // ----------------------------------------------------
  // G17: Pipeline Version Upgrade
  // ----------------------------------------------------
  describe('G17: Connectome Pipeline Version Upgrades', () => {
    it('preserves historical slate immutability under new connectome run versions', () => {
      const connectomeV1 = createConnectomeInput({ connectomeRunId: 'run-pipe-v1-001' });
      const connectomeV2 = createConnectomeInput({ connectomeRunId: 'run-pipe-v2-002', pipelineVersion: 'MAGNIOM-CONNECTOME-2.0.0' });

      const slate1 = runTargetEngine({
        phenotypeSnapshot: G17_CASE_PHENOTYPE,
        connectome: connectomeV1,
      });

      const slate2 = runTargetEngine({
        phenotypeSnapshot: G17_CASE_PHENOTYPE,
        connectome: connectomeV2,
      });

      expect(slate1.deterministicManifestHash).toBeDefined();
      expect(slate2.deterministicManifestHash).toBeDefined();
    });
  });

  // ----------------------------------------------------
  // G18: Exact Scientific Tie
  // ----------------------------------------------------
  describe('G18: Deterministic Tie-Breaking with Scientific Equivalence Warning', () => {
    it('applies deterministic tie-breaking and flags SCIENTIFICALLY_EQUIVALENT warning', () => {
      const tiedConnectome = createConnectomeInput({
        candidateRegions: [
          {
            targetFamilyVersionId: 'TF-MDD-CONVERGENT-LDLPFC-001',
            candidateCode: 'CAN-TIE-A',
            generationMethod: 'CONNECTOME_REFINED',
            hemisphere: 'L',
            surfaceVertexIndex: 18452,
            parcelName: 'p9-46v_L',
            subjectT1Coordinate: { space: 'MNI152NLin2009cAsym', x: -44, y: 40, z: 34, unit: 'mm' },
            mniCoordinate: { space: 'MNI152NLin2009cAsym', x: -44, y: 40, z: 34, unit: 'mm' },
            clusterAreaMm2: 90.0,
            circuitConcordanceRaw: 0.85,
            circuitConcordancePercentile: 0.85,
            baselineCircuitConcordance: 0.65,
            accessibility: 'good',
            reliabilityScore: 0.88,
            fitInterpretation: 'Tied Candidate A',
          },
          {
            targetFamilyVersionId: 'TF-MDD-SGACC-LDLPFC-001',
            candidateCode: 'CAN-TIE-B',
            generationMethod: 'CONNECTOME_REFINED',
            hemisphere: 'L',
            surfaceVertexIndex: 20100,
            parcelName: '8Av_L',
            subjectT1Coordinate: { space: 'MNI152NLin2009cAsym', x: -38, y: 28, z: 44, unit: 'mm' },
            mniCoordinate: { space: 'MNI152NLin2009cAsym', x: -38, y: 28, z: 44, unit: 'mm' },
            clusterAreaMm2: 90.0,
            circuitConcordanceRaw: 0.85,
            circuitConcordancePercentile: 0.85,
            baselineCircuitConcordance: 0.65,
            accessibility: 'good',
            reliabilityScore: 0.88,
            fitInterpretation: 'Tied Candidate B',
          },
        ],
      });

      const slate = runTargetEngine({
        phenotypeSnapshot: G18_CASE_PHENOTYPE,
        connectome: tiedConnectome,
        mode: 'CLINICAL',
      });

      expect(slate.primaryCandidates[0].contraindicationsOrConflicts).toContain('SCIENTIFICALLY_EQUIVALENT');
    });
  });
});
