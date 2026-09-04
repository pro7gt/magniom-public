/**
 * MAGNIOM Scientific Policy — 9 Golden Policy Test Cases (§144-152)
 * Conforms to MAGNIOM-Scientific Policy & Algorithm Configuration Specification v2.0
 */

import { describe, it, expect } from 'vitest';
import {
  CANONICAL_SCIENTIFIC_POLICY_V2_0_0,
  evaluateScientificCompatibility,
  evaluateScientificProhibitions,
  MDD_MODULE_RELEASE_ID,
  PAIN_MODULE_RELEASE_ID,
  STROKE_MOTOR_MODULE_RELEASE_ID,
  APHASIA_MODULE_RELEASE_ID,
  OCD_MODULE_RELEASE_ID,
  TBI_MODULE_RELEASE_ID,
  PTSD_MODULE_RELEASE_ID,
  TINNITUS_MODULE_RELEASE_ID,
} from '../src/index.js';

describe('MAGNIOM Scientific Policy — 9 Golden Policy Test Cases (§144-152)', () => {
  // -------------------------------------------------------------------------
  // §144. Golden Policy Test — MDD Normal Clinical Path
  // -------------------------------------------------------------------------
  it('§144: MDD in Clinical mode with qualified rs-fMRI should select connectome configuration', () => {
    const result = evaluateScientificCompatibility({
      policy: CANONICAL_SCIENTIFIC_POLICY_V2_0_0,
      indicationModuleReleaseId: MDD_MODULE_RELEASE_ID,
      indicationModuleCode: 'MDD',
      indicationModuleMaturity: 'clinical_active',
      mode: 'clinical',
      evidenceLibraryReleaseId: '00000000-0000-0000-0000-000000000101',
      targetEngineReleaseId: '00000000-0000-0000-0000-000000000201',
      targetingPluginVersion: '2.0.0',
      candidateGeneratorIds: ['gen-mdd-evidence-prior', 'gen-mdd-fc-refinement'],
      reliabilityResults: {
        individual_fc_refinement: { passed: true, metricValue: 0.82, threshold: 0.7 },
      },
    });

    expect(result.compatible).toBe(true);
    expect(result.matchedConfiguration?.code).toBe('MDD-CONNECTOME-CLINICAL-2.0');
    expect(result.isFallbackEngaged).toBe(false);
    expect(result.binding?.modulePermission).toBe('clinical_permitted');
  });

  // -------------------------------------------------------------------------
  // §145. Golden Policy Test — MDD FC Failure Fallback
  // -------------------------------------------------------------------------
  it('§145: MDD FC reliability failure should engage evidence-baseline fallback', () => {
    const result = evaluateScientificCompatibility({
      policy: CANONICAL_SCIENTIFIC_POLICY_V2_0_0,
      indicationModuleReleaseId: MDD_MODULE_RELEASE_ID,
      indicationModuleCode: 'MDD',
      indicationModuleMaturity: 'clinical_active',
      mode: 'clinical',
      evidenceLibraryReleaseId: '00000000-0000-0000-0000-000000000101',
      targetEngineReleaseId: '00000000-0000-0000-0000-000000000201',
      targetingPluginVersion: '2.0.0',
      candidateGeneratorIds: ['gen-mdd-evidence-prior', 'gen-mdd-fc-refinement'],
      reliabilityResults: {
        individual_fc_refinement: { passed: false, metricValue: 0.58, threshold: 0.7 },
      },
    });

    expect(result.compatible).toBe(true);
    expect(result.isFallbackEngaged).toBe(true);
    expect(result.matchedConfiguration?.code).toBe('MDD-EVIDENCE-BASELINE-2.0');
    expect(result.fallbackExplanation).toContain(
      'did not meet the validated reliability requirement',
    );
  });

  // -------------------------------------------------------------------------
  // §146. Golden Policy Test — Neuropathic Pain
  // -------------------------------------------------------------------------
  it('§146: Neuropathic Pain in Validation mode should permit somatotopic generator and evaluate hotspot repeatability', () => {
    // Normal reliable hotspot (repeatability 3.2mm <= 5.0mm)
    const resultPass = evaluateScientificCompatibility({
      policy: CANONICAL_SCIENTIFIC_POLICY_V2_0_0,
      indicationModuleReleaseId: PAIN_MODULE_RELEASE_ID,
      indicationModuleCode: 'PAIN',
      indicationModuleMaturity: 'validation_candidate',
      mode: 'validation',
      evidenceLibraryReleaseId: '00000000-0000-0000-0000-000000000102',
      targetEngineReleaseId: '00000000-0000-0000-0000-000000000201',
      targetingPluginVersion: '2.0.0',
      candidateGeneratorIds: ['gen-pain-somatotopic-baseline', 'gen-pain-motor-map-refinement'],
      reliabilityResults: {
        motor_hotspot_refinement: { passed: true, metricValue: 3.2, threshold: 5.0 },
      },
    });

    expect(resultPass.compatible).toBe(true);
    expect(resultPass.matchedConfiguration?.code).toBe('PAIN-MOTOR-MAP-VALIDATION-2.0');
    expect(resultPass.isFallbackEngaged).toBe(false);

    // Unreliable hotspot (repeatability 12.4mm > 5.0mm threshold -> fallback to baseline)
    const resultFail = evaluateScientificCompatibility({
      policy: CANONICAL_SCIENTIFIC_POLICY_V2_0_0,
      indicationModuleReleaseId: PAIN_MODULE_RELEASE_ID,
      indicationModuleCode: 'PAIN',
      indicationModuleMaturity: 'validation_candidate',
      mode: 'validation',
      evidenceLibraryReleaseId: '00000000-0000-0000-0000-000000000102',
      targetEngineReleaseId: '00000000-0000-0000-0000-000000000201',
      targetingPluginVersion: '2.0.0',
      candidateGeneratorIds: ['gen-pain-somatotopic-baseline', 'gen-pain-motor-map-refinement'],
      reliabilityResults: {
        motor_hotspot_refinement: { passed: false, metricValue: 12.4, threshold: 5.0 },
      },
    });

    expect(resultFail.compatible).toBe(true);
    expect(resultFail.isFallbackEngaged).toBe(true);
    expect(resultFail.matchedConfiguration?.code).toBe('PAIN-SOMATOTOPIC-BASELINE-2.0');
  });

  // -------------------------------------------------------------------------
  // §147. Golden Policy Test — Stroke Motor Absent Lesion Context
  // -------------------------------------------------------------------------
  it('§147: Stroke Motor with absent LesionContext should fail-closed and reject normal-template fallback', () => {
    const result = evaluateScientificCompatibility({
      policy: CANONICAL_SCIENTIFIC_POLICY_V2_0_0,
      indicationModuleReleaseId: STROKE_MOTOR_MODULE_RELEASE_ID,
      indicationModuleCode: 'STROKE_MOTOR',
      indicationModuleMaturity: 'validation_candidate',
      mode: 'validation',
      evidenceLibraryReleaseId: '00000000-0000-0000-0000-000000000103',
      targetEngineReleaseId: '00000000-0000-0000-0000-000000000201',
      targetingPluginVersion: '2.0.0',
      candidateGeneratorIds: ['gen-stroke-ipsilesional-m1'],
      lesionContextPresent: false, // Absent lesion context!
    });

    expect(result.compatible).toBe(false);
    expect(result.reasonCode).toBe('LESION_CONTEXT_REQUIRED');
    expect(result.message).toContain('LesionContext');
    expect(result.isFallbackEngaged).toBe(false); // No fallback to normal template!
  });

  // -------------------------------------------------------------------------
  // §148. Golden Policy Test — Stroke Aphasia Phenotype / Stage Mismatch
  // -------------------------------------------------------------------------
  it('§148: Stroke Aphasia should enforce chronic stage and non-fluent phenotype constraints', () => {
    const binding = CANONICAL_SCIENTIFIC_POLICY_V2_0_0.indicationPolicyBindings.find(
      b => b.indicationModuleReleaseId === APHASIA_MODULE_RELEASE_ID,
    );

    expect(binding).toBeDefined();
    const rightIfgPermission = binding?.evidencePathPermissions.find(
      p => p.evidencePathId === 'ep-aphasia-chronic-right-ifg',
    );

    expect(rightIfgPermission).toBeDefined();
    expect(rightIfgPermission?.diseaseStageConstraints).toContain('stage-chronic');
    expect(rightIfgPermission?.populationConstraints).toContain('pop-chronic-nonfluent-aphasia');
    expect(rightIfgPermission?.treatmentContextConstraints).toContain('ctx-concurrent-slt');
  });

  // -------------------------------------------------------------------------
  // §149. Golden Policy Test — OCD Field vs Point Geometry Rejection
  // -------------------------------------------------------------------------
  it('§149: OCD field target should require coil_field geometry and prohibit point-target generators', () => {
    const binding = CANONICAL_SCIENTIFIC_POLICY_V2_0_0.indicationPolicyBindings.find(
      b => b.indicationModuleReleaseId === OCD_MODULE_RELEASE_ID,
    );

    expect(binding).toBeDefined();
    const geomPolicy = binding?.targetGeometryPolicy;
    const fieldFamily = geomPolicy?.targetFamilyPermissions.find(
      f => f.targetFamilyId === 'tf-ocd-field',
    );

    expect(fieldFamily?.permittedGeometryTypes).toEqual(['coil_field']);
    expect(fieldFamily?.permittedGeometryTypes).not.toContain('point');

    // Generator permissions must strictly match coil_field
    const fieldGen = binding?.candidateGenerationPolicy.generators.find(
      g => g.generatorId === 'gen-ocd-mpfc-acc-field',
    );
    expect(fieldGen?.geometryTypes).toEqual(['coil_field']);
    expect(fieldGen?.geometryTypes).not.toContain('point');
  });

  // -------------------------------------------------------------------------
  // §150. Golden Policy Test — TBI Hard Cross-Indication Rejection
  // -------------------------------------------------------------------------
  it('§150: Attempting to borrow MDD evidence for TBI should trigger hard cross-indication rejection', () => {
    const result = evaluateScientificProhibitions({
      mode: 'research',
      indicationModuleCode: 'TBI',
      isCrossIndicationBorrowAttempted: true,
      borrowingSourceIndication: 'MDD',
    });

    expect(result.passed).toBe(false);
    expect(result.reasonCode).toBe('POLICY_PROHIBITED_CONFIGURATION');
    expect(result.message).toContain('Cross-indication borrowing violation');
  });

  // -------------------------------------------------------------------------
  // §151. Golden Policy Test — PTSD Subpopulation Applicability Retained
  // -------------------------------------------------------------------------
  it('§151: PTSD policy must preserve subpopulation constraints without hidden upgrade', () => {
    const binding = CANONICAL_SCIENTIFIC_POLICY_V2_0_0.indicationPolicyBindings.find(
      b => b.indicationModuleReleaseId === PTSD_MODULE_RELEASE_ID,
    );

    const path = binding?.evidencePathPermissions.find(
      p => p.evidencePathId === 'ep-ptsd-general-circuit',
    );

    expect(path?.populationConstraints).toContain('pop-general-ptsd');
    expect(path?.limitations.some(l => l.includes('Partial applicability'))).toBe(true);
  });

  // -------------------------------------------------------------------------
  // §152. Golden Policy Test — Tinnitus Research in Clinical Mode Rejection
  // -------------------------------------------------------------------------
  it('§152: Requesting Clinical mode for Research-only Tinnitus module should reject with INDICATION_MODULE_NOT_CLINICALLY_PERMITTED', () => {
    const result = evaluateScientificCompatibility({
      policy: CANONICAL_SCIENTIFIC_POLICY_V2_0_0,
      indicationModuleReleaseId: TINNITUS_MODULE_RELEASE_ID,
      indicationModuleCode: 'TINNITUS',
      indicationModuleMaturity: 'research_only',
      mode: 'clinical', // Strictly prohibited!
      evidenceLibraryReleaseId: '00000000-0000-0000-0000-000000000108',
      targetEngineReleaseId: '00000000-0000-0000-0000-000000000201',
      targetingPluginVersion: '2.0.0',
      candidateGeneratorIds: ['gen-tinnitus-temporoparietal-research'],
    });

    expect(result.compatible).toBe(false);
    expect(result.reasonCode).toBe('INDICATION_MODULE_NOT_CLINICALLY_PERMITTED');
    expect(result.message).toContain('is not authorized for Clinical Mode');
  });
});
