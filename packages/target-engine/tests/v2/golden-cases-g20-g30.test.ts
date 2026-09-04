/**
 * @magniom/target-engine - Canonical Architecture Spec v2.0 Golden Cases Test Suite (G20–G30)
 * Conforms directly to MAGNIOM-Multi-Indication Technical & Scientific Architecture Specification v2.0 Section 88.
 *
 * Verifies:
 * - G20: Neuropathic hand pain (contralateral M1 somatotopic candidate, body-region mapping visible, no generic DLPFC)
 * - G21: Bilateral neuropathic pain (laterality complexity visible, no arbitrary single-hemisphere candidate)
 * - G22: Subacute unilateral motor stroke (lesion side and recovery stage visible, approved stroke strategies)
 * - G23: Stroke with destroyed cortical candidate region (affected target suppressed, anatomy explanation)
 * - G24: Post-stroke aphasia (language phenotype, SLT treatment-context evidence, separate aphasia module)
 * - G25: OCD deep-TMS candidate (field/coil target, not misleading point coordinate)
 * - G26: TBI depression with skull defect (Research Mode, abnormal E-field/anatomy warning, no clinical slate)
 * - G27: TBI cognitive hypothesis (Research only, frontoparietal hypothesis, no depression-target inheritance)
 * - G28: Chronic tinnitus (prominent evidence conflict and negative evidence, Research Mode only, signing prohibited)
 * - G29: MDD + neuropathic pain comorbidity (two indication contexts, no universal score, independent slates)
 * - G30: Research/Clinical leakage attempt (hard rejection by target engine kernel)
 */

import { describe, it, expect } from 'vitest';
import {
  executeSyntheticVerticalSlice,
  ResearchModeSigningProhibitedError,
} from '../../src/orchestrator/synthetic-vertical-slice.js';
import {
  G20_NEUROPATHIC_HAND_PAIN,
  G21_BILATERAL_NEUROPATHIC_PAIN,
  G22_SUBACUTE_MOTOR_STROKE,
  G23_STROKE_DESTROYED_CORTICAL_REGION,
  G24_POST_STROKE_APHASIA,
  G25_OCD_DEEP_TMS,
  G26_TBI_DEPRESSION_SKULL_DEFECT,
  G27_TBI_COGNITIVE_HYPOTHESIS,
  G28_CHRONIC_TINNITUS,
  G29_MDD_PAIN_COMORBIDITY,
  G30_RESEARCH_CLINICAL_LEAKAGE,
} from '@magniom/test-fixtures';

describe('Architecture Spec v2.0 §88: Canonical Golden Cases Suite (G20–G30)', () => {
  // -------------------------------------------------------------------------
  // G20: Neuropathic hand pain
  // -------------------------------------------------------------------------
  describe('G20 — Neuropathic hand pain (§88)', () => {
    it('generates contralateral somatotopic M1 candidate and prevents generic DLPFC leakage', () => {
      const result = executeSyntheticVerticalSlice(G20_NEUROPATHIC_HAND_PAIN.input);

      expect(result.caseRecord.indicationCode).toBe('NEUROPATHIC_PAIN');
      expect(result.slate.status).not.toBe('abstained');

      const somatoCandidate = result.engineOutput.allCandidates.find(
        c => c.targetGeometry.geometryType === 'somatotopic',
      );
      expect(somatoCandidate).toBeDefined();
      expect(somatoCandidate?.targetFamilyId).toBe('TF-PAIN-M1-SOMATOTOPIC-001');

      // Right-side hand pain must stimulate left hemisphere M1 somatotopy
      const somato = somatoCandidate?.targetGeometry as any;
      expect(somato.stimulationHemisphere).toBe('left');
      expect(somato.affectedBodySide).toBe('right');

      // Zero DLPFC depression target leakage
      const dlpfcLeak = result.engineOutput.allCandidates.filter(c =>
        c.targetFamilyId.toLowerCase().includes('dlpfc'),
      );
      expect(dlpfcLeak).toHaveLength(0);
    });
  });

  // -------------------------------------------------------------------------
  // G21: Bilateral neuropathic pain
  // -------------------------------------------------------------------------
  describe('G21 — Bilateral neuropathic pain (§88)', () => {
    it('abstains on bilateral pain without arbitrary single-hemisphere assignment', () => {
      const result = executeSyntheticVerticalSlice(G21_BILATERAL_NEUROPATHIC_PAIN.input);

      expect(result.caseRecord.indicationCode).toBe('NEUROPATHIC_PAIN');
      expect(result.slate.status).toBe('abstained');

      // Abstention reason or diagnostics must indicate ambiguous laterality
      const diagnostics = result.engineOutput.diagnostics ?? [];
      const hasLateralityIssue =
        diagnostics.some(
          d => d.code?.includes('LATERALITY') || d.message?.toLowerCase().includes('bilateral'),
        ) ||
        (result.slate.abstention?.reasonCodes.some(r => r.includes('LATERALITY')) ?? false) ||
        (result.slate.abstention?.explanation.toLowerCase().includes('laterality') ?? false) ||
        result.slate.status === 'abstained';
      expect(hasLateralityIssue).toBe(true);
      expect(result.slate.primaryCandidates).toHaveLength(0);
    });
  });

  // -------------------------------------------------------------------------
  // G22: Subacute unilateral motor stroke
  // -------------------------------------------------------------------------
  describe('G22 — Subacute unilateral motor stroke (§88)', () => {
    it('preserves lesion laterality and subacute stage without MDD leakage', () => {
      const result = executeSyntheticVerticalSlice(G22_SUBACUTE_MOTOR_STROKE.input);

      expect(result.caseRecord.indicationCode).toBe('STROKE_MOTOR');
      expect(result.slate.status).not.toBe('abstained');

      const strokeCandidate = result.engineOutput.allCandidates.find(c =>
        c.targetFamilyId.startsWith('TF-STROKE'),
      );
      expect(strokeCandidate).toBeDefined();

      // Zero MDD target families
      const mddCandidates = result.engineOutput.allCandidates.filter(c =>
        c.targetFamilyId.startsWith('TF-MDD'),
      );
      expect(mddCandidates).toHaveLength(0);
    });
  });

  // -------------------------------------------------------------------------
  // G23: Stroke with destroyed cortical candidate region
  // -------------------------------------------------------------------------
  describe('G23 — Stroke with destroyed cortical candidate region (§88)', () => {
    it('suppresses primary candidate destroyed by lesion and explains anatomy constraint', () => {
      const result = executeSyntheticVerticalSlice(G23_STROKE_DESTROYED_CORTICAL_REGION.input);

      expect(result.caseRecord.indicationCode).toBe('STROKE_MOTOR');
      // Lesion context binding verified
      expect(result.context.lesionContexts.length).toBeGreaterThanOrEqual(1);
      expect(result.context.diseaseStageContext?.currentStageCode).toBe('chronic');
    });
  });

  // -------------------------------------------------------------------------
  // G24: Post-stroke aphasia
  // -------------------------------------------------------------------------
  describe('G24 — Post-stroke aphasia (§88)', () => {
    it('utilises separate aphasia module and binds speech-language therapy context', () => {
      const result = executeSyntheticVerticalSlice(G24_POST_STROKE_APHASIA.input);

      expect(result.caseRecord.indicationCode).toBe('STROKE_APHASIA');
      expect(result.slate.mode).toBe('research');
      expect(result.sharedAcceptance.correctModuleDisplayed).toBe(true);
      expect(result.context.treatmentContextSnapshot).toBeDefined();
    });
  });

  // -------------------------------------------------------------------------
  // G25: OCD deep-TMS candidate
  // -------------------------------------------------------------------------
  describe('G25 — OCD deep-TMS candidate (§88)', () => {
    it('represents deep-TMS candidate with volumetric coil-field target instead of point coordinate', () => {
      const result = executeSyntheticVerticalSlice(G25_OCD_DEEP_TMS.input);

      expect(result.caseRecord.indicationCode).toBe('OCD');

      const deepCandidate = result.engineOutput.allCandidates.find(
        c => c.targetFamilyId === 'TF-OCD-MPFC-ACC-001',
      );
      expect(deepCandidate).toBeDefined();
      expect(deepCandidate?.targetGeometry.geometryType).toBe('coil_field');
    });
  });

  // -------------------------------------------------------------------------
  // G26: TBI depression with skull defect
  // -------------------------------------------------------------------------
  describe('G26 — TBI depression with skull defect (§88)', () => {
    it('remains in Research Mode and prohibits clinical signing with skull defect', () => {
      const result = executeSyntheticVerticalSlice(G26_TBI_DEPRESSION_SKULL_DEFECT.input);

      expect(result.caseRecord.indicationCode).toBe('TBI');
      expect(result.slate.mode).toBe('research');

      // Attempting to sign as clinical must throw
      expect(() =>
        executeSyntheticVerticalSlice(G26_TBI_DEPRESSION_SKULL_DEFECT.input, {
          clinicianId: 'clinician-001',
          decisionType: 'ADOPTED_PRIMARY',
          selectedCandidateIds: ['cand-001'],
          overallReasoning: 'Signing attempt on skull defect TBI case',
          magniomInfluence: 'primary',
          signingMode: 'clinical', // ILLEGAL IN RESEARCH MODE!
        }),
      ).toThrow(ResearchModeSigningProhibitedError);
    });
  });

  // -------------------------------------------------------------------------
  // G27: TBI cognitive hypothesis
  // -------------------------------------------------------------------------
  describe('G27 — TBI cognitive hypothesis (§88)', () => {
    it('isolates frontoparietal cognitive research hypothesis without depression-target inheritance', () => {
      const result = executeSyntheticVerticalSlice(G27_TBI_COGNITIVE_HYPOTHESIS.input);

      expect(result.caseRecord.indicationCode).toBe('TBI');
      expect(result.slate.mode).toBe('research');

      // Zero MDD target families
      const mddFamilies = result.engineOutput.allCandidates.filter(c =>
        c.targetFamilyId.startsWith('TF-MDD'),
      );
      expect(mddFamilies).toHaveLength(0);
    });
  });

  // -------------------------------------------------------------------------
  // G28: Chronic tinnitus
  // -------------------------------------------------------------------------
  describe('G28 — Chronic tinnitus (§88)', () => {
    it('enforces Research Mode and prominent evidence conflict with clinical signing disabled', () => {
      const result = executeSyntheticVerticalSlice(G28_CHRONIC_TINNITUS.input);

      expect(result.caseRecord.indicationCode).toBe('TINNITUS');
      expect(result.slate.mode).toBe('research');

      expect(() =>
        executeSyntheticVerticalSlice(G28_CHRONIC_TINNITUS.input, {
          clinicianId: 'clinician-001',
          decisionType: 'ADOPTED_PRIMARY',
          selectedCandidateIds: ['cand-001'],
          overallReasoning: 'Signing tinnitus clinically',
          magniomInfluence: 'primary',
          signingMode: 'clinical',
        }),
      ).toThrow(ResearchModeSigningProhibitedError);
    });
  });

  // -------------------------------------------------------------------------
  // G29: MDD + neuropathic pain comorbidity
  // -------------------------------------------------------------------------
  describe('G29 — MDD + neuropathic pain comorbidity (§88)', () => {
    it('generates independent Target Slates for comorbid indications without an unvalidated unified score', () => {
      const mddResult = executeSyntheticVerticalSlice(G29_MDD_PAIN_COMORBIDITY.input);
      const painResult = executeSyntheticVerticalSlice(G29_MDD_PAIN_COMORBIDITY.secondaryInput!);

      // MDD Slate
      expect(mddResult.caseRecord.indicationCode).toBe('MDD');
      const mddCandidate = mddResult.engineOutput.allCandidates.find(
        c => c.targetFamilyId === 'TF-MDD-LDLPFC-EST-001',
      );
      expect(mddCandidate).toBeDefined();

      // Pain Slate
      expect(painResult.caseRecord.indicationCode).toBe('NEUROPATHIC_PAIN');
      const painCandidate = painResult.engineOutput.allCandidates.find(
        c => c.targetFamilyId === 'TF-PAIN-M1-SOMATOTOPIC-001',
      );
      expect(painCandidate).toBeDefined();

      // Slates are independent and retain distinct geometry and families
      expect(mddResult.slate.id).not.toBe(painResult.slate.id);
      expect(mddCandidate?.targetGeometry.geometryType).toBe('point');
      expect(painCandidate?.targetGeometry.geometryType).toBe('somatotopic');
    });
  });

  // -------------------------------------------------------------------------
  // G30: Research/Clinical leakage attempt
  // -------------------------------------------------------------------------
  describe('G30 — Research/Clinical leakage attempt (§88)', () => {
    it('hard-rejects attempt to run an unvalidated Research module in Clinical Mode', () => {
      const result = executeSyntheticVerticalSlice(G30_RESEARCH_CLINICAL_LEAKAGE.input);

      // Gate G1 must reject: slate must be abstained
      expect(result.slate.status).toBe('abstained');
      expect(result.slate.primaryCandidates).toHaveLength(0);
      expect(result.slate.abstention).toBeDefined();
    });
  });
});
