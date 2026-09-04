/**
 * @magniom/target-engine - Sections 98 & 101: Non-Transitive Validation & Anti-Global Clinical Mode
 * Conforms to MAGNIOM-Multi-Indication Technical & Scientific Architecture Specification v2.0:
 * - §98: Non-Transitive Clinical Qualification Invariant
 * - §101: Absolute Prohibition of Global Clinical Mode
 */

import { describe, it, expect } from 'vitest';
import {
  executeSyntheticVerticalSlice,
  ResearchModeSigningProhibitedError,
} from '../../src/orchestrator/synthetic-vertical-slice.js';
import {
  MDD_MODULE_RELEASE_ID,
  TINNITUS_MODULE_RELEASE_ID,
  TBI_MODULE_RELEASE_ID,
} from '../../src/index.js';
import {
  createMockPhenotypeSnapshot,
  createMockClinicalObjective,
  createMockMeasurementBundle,
  createMockEvidencePath,
} from '@magniom/test-fixtures';

describe('Architecture Spec v2.0 §98 & §101: Non-Transitive Governance Invariants', () => {
  // -------------------------------------------------------------------------
  // §98: Non-Transitive Validation Invariant
  // -------------------------------------------------------------------------
  describe('§98: Non-Transitive Validation Invariant', () => {
    it('proves clinical qualification of MDD does not transitively qualify Tinnitus or TBI', () => {
      // Step 1: Execute MDD (clinically qualified) in Clinical Mode -> PASSES
      const mddInput = {
        caseId: 'case-governance-01',
        caseIndicationId: 'ci-mdd-01',
        indicationCode: 'MDD',
        mode: 'clinical' as const,
        indicationModuleReleaseId: MDD_MODULE_RELEASE_ID,
        clinicalContext: {
          phenotypeSnapshot: createMockPhenotypeSnapshot({
            id: 'ps-mdd-gov',
            primaryDiagnosis: 'Major Depressive Disorder',
          }),
        },
        clinicalObjectives: [
          createMockClinicalObjective({
            id: 'obj-mdd-gov',
            caseIndicationId: 'ci-mdd-01',
            code: 'OBJ-MDD-CORE',
            display: 'Depression Remission',
          }),
        ],
        measurementBundle: createMockMeasurementBundle({
          id: 'mb-mdd-gov',
          caseId: 'case-governance-01',
          caseIndicationId: 'ci-mdd-01',
          indicationModuleReleaseId: MDD_MODULE_RELEASE_ID,
          phenotypeSnapshotId: 'ps-mdd-gov',
          modality: 'structural_mri',
        }),
        authorizedEvidencePaths: [
          createMockEvidencePath({
            id: 'EP-MDD-001',
            indicationModuleReleaseId: MDD_MODULE_RELEASE_ID,
            targetFamilyId: 'TF-MDD-LDLPFC-EST-001',
            clinicalObjectiveId: 'obj-mdd-gov',
            targetGeometryType: 'point',
          }),
        ],
      };

      const mddResult = executeSyntheticVerticalSlice(mddInput);
      expect(mddResult.slate.status).not.toBe('abstained');
      expect(mddResult.slate.primaryCandidates.length).toBeGreaterThan(0);

      // Step 2: Attempt to execute Tinnitus (Research-only, unvalidated) in Clinical Mode -> ABSTAINS / REJECTED
      const tinnitusInput = {
        caseId: 'case-governance-01', // Same case!
        caseIndicationId: 'ci-tin-01',
        indicationCode: 'TINNITUS',
        mode: 'clinical' as const, // Illegal clinical mode for research-only module!
        indicationModuleReleaseId: TINNITUS_MODULE_RELEASE_ID,
        clinicalContext: {
          phenotypeSnapshot: createMockPhenotypeSnapshot({
            id: 'ps-tin-gov',
            primaryDiagnosis: 'Chronic Tinnitus',
          }),
        },
        clinicalObjectives: [
          createMockClinicalObjective({
            id: 'obj-tin-gov',
            caseIndicationId: 'ci-tin-01',
            code: 'OBJ-TIN-CORE',
            display: 'Tinnitus Relief',
          }),
        ],
        measurementBundle: createMockMeasurementBundle({
          id: 'mb-tin-gov',
          caseId: 'case-governance-01',
          caseIndicationId: 'ci-tin-01',
          indicationModuleReleaseId: TINNITUS_MODULE_RELEASE_ID,
          phenotypeSnapshotId: 'ps-tin-gov',
          modality: 'audiology',
        }),
      };

      const tinnitusResult = executeSyntheticVerticalSlice(tinnitusInput);
      expect(tinnitusResult.slate.status).toBe('abstained');
      expect(tinnitusResult.slate.primaryCandidates).toHaveLength(0);
      expect(tinnitusResult.slate.abstention).toBeDefined();

      // Step 3: Attempt to execute TBI in Clinical Mode -> ABSTAINS / REJECTED
      const tbiInput = {
        caseId: 'case-governance-01',
        caseIndicationId: 'ci-tbi-01',
        indicationCode: 'TBI',
        mode: 'clinical' as const,
        indicationModuleReleaseId: TBI_MODULE_RELEASE_ID,
        clinicalContext: {
          phenotypeSnapshot: createMockPhenotypeSnapshot({
            id: 'ps-tbi-gov',
            primaryDiagnosis: 'Traumatic Brain Injury',
          }),
        },
        clinicalObjectives: [
          createMockClinicalObjective({
            id: 'obj-tbi-gov',
            caseIndicationId: 'ci-tbi-01',
            code: 'OBJ-TBI-CORE',
            display: 'TBI Rehabilitation',
          }),
        ],
        measurementBundle: createMockMeasurementBundle({
          id: 'mb-tbi-gov',
          caseId: 'case-governance-01',
          caseIndicationId: 'ci-tbi-01',
          indicationModuleReleaseId: TBI_MODULE_RELEASE_ID,
          phenotypeSnapshotId: 'ps-tbi-gov',
          modality: 'structural_mri',
        }),
      };

      const tbiResult = executeSyntheticVerticalSlice(tbiInput);
      expect(tbiResult.slate.status).toBe('abstained');
      expect(tbiResult.slate.primaryCandidates).toHaveLength(0);
    });
  });

  // -------------------------------------------------------------------------
  // §101: Absolute Prohibition of Global Clinical Mode
  // -------------------------------------------------------------------------
  describe('§101: Absolute Prohibition of Global Clinical Mode', () => {
    it('rejects attempt to globally bypass module qualification with adversarial overrides', () => {
      // Create research-only TBI input with adversarial override attempt
      const adversarialTbiInput = {
        caseId: 'case-adversarial-01',
        caseIndicationId: 'ci-tbi-adv',
        indicationCode: 'TBI',
        mode: 'clinical' as const,
        indicationModuleReleaseId: TBI_MODULE_RELEASE_ID,
        clinicalContext: {
          phenotypeSnapshot: createMockPhenotypeSnapshot({
            id: 'ps-tbi-adv',
            primaryDiagnosis: 'TBI Cognitive Deficit',
          }),
        },
        clinicalObjectives: [
          createMockClinicalObjective({
            id: 'obj-tbi-adv',
            caseIndicationId: 'ci-tbi-adv',
            code: 'OBJ-TBI-COG',
            display: 'Cognitive Recovery',
          }),
        ],
        measurementBundle: createMockMeasurementBundle({
          id: 'mb-tbi-adv',
          caseId: 'case-adversarial-01',
          caseIndicationId: 'ci-tbi-adv',
          indicationModuleReleaseId: TBI_MODULE_RELEASE_ID,
          phenotypeSnapshotId: 'ps-tbi-adv',
          modality: 'resting_state_fmri',
        }),
        // Adversarial attempts to inject global clinical override
        globalClinicalOverride: true,
        systemMode: 'clinical',
      } as any;

      const result = executeSyntheticVerticalSlice(adversarialTbiInput);

      // Gate G1 must still enforce module qualification: engine abstains
      expect(result.slate.status).toBe('abstained');
      expect(result.slate.primaryCandidates).toHaveLength(0);
    });

    it('prohibits signing research-mode slates as clinical even if clinician requests it', () => {
      const tinnitusResearchInput = {
        caseId: 'case-tin-sign-adv',
        caseIndicationId: 'ci-tin-sign-adv',
        indicationCode: 'TINNITUS',
        mode: 'research' as const,
        indicationModuleReleaseId: TINNITUS_MODULE_RELEASE_ID,
        clinicalContext: {
          phenotypeSnapshot: createMockPhenotypeSnapshot({
            id: 'ps-tin-sign',
            primaryDiagnosis: 'Tinnitus',
          }),
        },
        clinicalObjectives: [
          createMockClinicalObjective({
            id: 'obj-tin-sign',
            caseIndicationId: 'ci-tin-sign-adv',
            code: 'OBJ-TIN',
            display: 'Tinnitus Symptom Relief',
          }),
        ],
        measurementBundle: createMockMeasurementBundle({
          id: 'mb-tin-sign',
          caseId: 'case-tin-sign-adv',
          caseIndicationId: 'ci-tin-sign-adv',
          indicationModuleReleaseId: TINNITUS_MODULE_RELEASE_ID,
          phenotypeSnapshotId: 'ps-tin-sign',
          modality: 'audiology',
        }),
      };

      // Clinician attempts to sign research output with signingMode: 'clinical'
      expect(() =>
        executeSyntheticVerticalSlice(tinnitusResearchInput, {
          clinicianId: 'clinician-adv-001',
          decisionType: 'ADOPTED_PRIMARY',
          selectedCandidateIds: ['cand-tin-01'],
          overallReasoning: 'Attempting to clinically sign research output',
          magniomInfluence: 'primary',
          signingMode: 'clinical', // STRICTLY PROHIBITED
        }),
      ).toThrow(ResearchModeSigningProhibitedError);
    });
  });
});
