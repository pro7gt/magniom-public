/**
 * MAGNIOM Scientific Policy — 6 Special Policy Traps (§153-158)
 * Conforms to MAGNIOM-Scientific Policy & Algorithm Configuration Specification v2.0
 */

import { describe, it, expect } from 'vitest';
import {
  CANONICAL_SCIENTIFIC_POLICY_V2_0_0,
  evaluateScientificCompatibility,
  evaluateScientificProhibitions,
  evaluatePolicyParameterBounds,
  CANONICAL_POLICY_V2_PARAMETERS,
  MDD_MODULE_RELEASE_ID,
  PAIN_MODULE_RELEASE_ID,
} from '../src/index.js';

describe('MAGNIOM Scientific Policy — 6 Special Policy Traps (§153-158)', () => {
  // -------------------------------------------------------------------------
  // §153. Trap 1 — Research Measurement Leakage
  // -------------------------------------------------------------------------
  it('§153 Trap 1: Research component referenced in Clinical configuration should fail closed', () => {
    const result = evaluateScientificProhibitions({
      mode: 'clinical',
      indicationModuleCode: 'STROKE_MOTOR',
      researchComponentsReferenced: ['research_dwi_structural_connectivity_feature'],
    });

    expect(result.passed).toBe(false);
    expect(result.reasonCode).toBe('RESEARCH_COMPONENT_IN_CLINICAL_CONFIGURATION');
    expect(result.message).toContain('Research-only component');
  });

  // -------------------------------------------------------------------------
  // §154. Trap 2 — Unassigned Evidence
  // -------------------------------------------------------------------------
  it('§154 Trap 2: Unassigned EvidenceClaim classification cannot establish Clinical authority', () => {
    const result = evaluateScientificProhibitions({
      mode: 'clinical',
      indicationModuleCode: 'MDD',
      evidencePathId: 'ep-experimental-claim-001',
      evidenceClassification: 'unassigned',
    });

    expect(result.passed).toBe(false);
    expect(result.reasonCode).toBe('EVIDENCE_CLASSIFICATION_UNASSIGNED');
    expect(result.message).toContain("classification status is 'unassigned'");
  });

  // -------------------------------------------------------------------------
  // §155. Trap 3 — Module Version Mismatch
  // -------------------------------------------------------------------------
  it('§155 Trap 3: Unapproved module version should fail with positive whitelist mismatch', () => {
    // Policy authorises PainModule 2.0.0; runtime provides unapproved version
    const result = evaluateScientificCompatibility({
      policy: CANONICAL_SCIENTIFIC_POLICY_V2_0_0,
      indicationModuleReleaseId: PAIN_MODULE_RELEASE_ID,
      indicationModuleCode: 'PAIN',
      indicationModuleMaturity: 'validation_candidate',
      mode: 'validation',
      evidenceLibraryReleaseId: '00000000-0000-0000-0000-000000000102',
      targetEngineReleaseId: '00000000-0000-0000-0000-000000000201',
      targetingPluginVersion: '9.9.9', // Unapproved plugin version!
      candidateGeneratorIds: ['gen-pain-somatotopic-baseline'],
    });

    expect(result.compatible).toBe(false);
    expect(result.reasonCode).toBe('SCIENTIFIC_CONFIGURATION_INCOMPATIBLE');
  });

  // -------------------------------------------------------------------------
  // §156. Trap 4 — Plugin Digest Mismatch
  // -------------------------------------------------------------------------
  it('§156 Trap 4: Altered plugin package digest should fail with TARGET_PLUGIN_INTEGRITY_FAILURE', () => {
    const result = evaluateScientificCompatibility({
      policy: CANONICAL_SCIENTIFIC_POLICY_V2_0_0,
      indicationModuleReleaseId: MDD_MODULE_RELEASE_ID,
      indicationModuleCode: 'MDD',
      indicationModuleMaturity: 'clinical_active',
      mode: 'clinical',
      evidenceLibraryReleaseId: '00000000-0000-0000-0000-000000000101',
      targetEngineReleaseId: '00000000-0000-0000-0000-000000000201',
      targetingPluginVersion: '2.0.0',
      targetingPluginDigest: 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', // Deliberate tampered hash!
      candidateGeneratorIds: ['gen-mdd-evidence-prior'],
    });

    expect(result.compatible).toBe(false);
    expect(result.reasonCode).toBe('TARGET_PLUGIN_INTEGRITY_FAILURE');
    expect(result.message).toContain('Targeting plugin package digest mismatch');
  });

  // -------------------------------------------------------------------------
  // §157. Trap 5 — Out-of-Bounds Parameter Rejection Without Clamping
  // -------------------------------------------------------------------------
  it('§157 Trap 5: Configured parameter outside validated bounds should reject without clamping', () => {
    // Parameter min_incremental_gain has bounds [0.01, 0.50]. Test with 0.85 (out of bounds)
    const params = {
      'param.mdd.min_incremental_gain': 0.85,
    };

    const result = evaluatePolicyParameterBounds(params, CANONICAL_POLICY_V2_PARAMETERS);

    expect(result.valid).toBe(false);
    expect(result.reasonCode).toBe('POLICY_PARAMETER_OUT_OF_BOUNDS');
    expect(result.message).toContain('exceeds maximum 0.5');
    expect(result.message).toContain('no clamping permitted');
  });

  // -------------------------------------------------------------------------
  // §158. Trap 6 — Multimodal Fusion Trap
  // -------------------------------------------------------------------------
  it('§158 Trap 6: Coordinate fusion of rs-fMRI + DWI + task fMRI without approved model should reject', () => {
    const result = evaluateScientificProhibitions({
      mode: 'clinical',
      indicationModuleCode: 'MDD',
      isMultimodalFusionAttempted: true,
      isMultimodalModelApproved: false,
    });

    expect(result.passed).toBe(false);
    expect(result.reasonCode).toBe('MULTIMODAL_FUSION_NOT_PERMITTED');
    expect(result.message).toContain('Multimodal coordinate fusion is prohibited');
  });
});
