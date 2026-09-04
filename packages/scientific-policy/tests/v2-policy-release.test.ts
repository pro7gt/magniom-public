/**
 * MAGNIOM Scientific Policy v2.0 Release Governance & Validation Tests
 * Conforms to MAGNIOM-Scientific Policy & Algorithm Configuration Specification v2.0
 */

import { describe, it, expect } from 'vitest';
import {
  CANONICAL_SCIENTIFIC_POLICY_V2_0_0,
  CANONICAL_POLICY_V2_PARAMETERS,
  buildScientificPolicyReleaseManifest,
  verifyPolicyIntegrity,
  verifyPolicySignatures,
  evaluatePolicyParameterBounds,
  analyzePolicyChangeImpact,
} from '../src/index.js';
import { validateScientificPolicyReleaseV2 } from '@magniom/schemas';

describe('MAGNIOM Scientific Policy v2.0 Release Governance', () => {
  it('should validate CANONICAL_SCIENTIFIC_POLICY_V2_0_0 against Zod schema', () => {
    const validated = validateScientificPolicyReleaseV2(CANONICAL_SCIENTIFIC_POLICY_V2_0_0);
    expect(validated.code).toBe('MAGNIOM-POLICY-V2.0.0');
    expect(validated.lifecycleStatus).toBe('active');
    expect(validated.validationStatus).toBe('clinical_release_qualified');
    expect(validated.scope).toBe('multi_indication');
    expect(validated.indicationPolicyBindings.length).toBe(8);
    expect(validated.compatibilityConfigurations.length).toBe(10);
    expect(validated.approvals.length).toBe(4);
    expect(validated.signatures.length).toBe(2);
  });

  it('should verify cryptographic integrity of policy payload (§126)', () => {
    const integrity = verifyPolicyIntegrity(CANONICAL_SCIENTIFIC_POLICY_V2_0_0);
    expect(integrity.passed).toBe(true);

    // Tampered policy payload should fail
    const tampered = {
      ...CANONICAL_SCIENTIFIC_POLICY_V2_0_0,
      description: 'TAMPERED DESCRIPTION VALUE',
    };
    const tamperedResult = verifyPolicyIntegrity(tampered);
    expect(tamperedResult.passed).toBe(false);
    expect(tamperedResult.reasonCode).toBe('SCIENTIFIC_POLICY_INTEGRITY_FAILURE');
  });

  it('should verify release manifest generation and signatures (§124, §127, §128)', () => {
    const manifest = buildScientificPolicyReleaseManifest(CANONICAL_SCIENTIFIC_POLICY_V2_0_0);
    expect(manifest.scientificPolicyReleaseId).toBe(CANONICAL_SCIENTIFIC_POLICY_V2_0_0.id);
    expect(manifest.indicationModuleReleaseIds.length).toBe(8);
    expect(manifest.compatibilityConfigurationIds.length).toBe(10);
    expect(manifest.manifestSha256).toMatch(/^[0-9a-fA-F]{64}$/);

    const sigResult = verifyPolicySignatures(CANONICAL_SCIENTIFIC_POLICY_V2_0_0);
    expect(sigResult.passed).toBe(true);
  });

  it('should pass parameter bounds evaluation when all parameters are valid (§90-95)', () => {
    const validParams = {
      'param.mdd.fc_reliability_threshold': 0.75,
      'param.mdd.min_incremental_gain': 0.12,
      'param.pain.max_hotspot_repeatability_mm': 4.5,
      'param.stroke.min_lesion_dice': 0.85,
    };

    const result = evaluatePolicyParameterBounds(validParams, CANONICAL_POLICY_V2_PARAMETERS);
    expect(result.valid).toBe(true);
    expect(result.violations.length).toBe(0);
  });

  it('should compute differential scientific impact report between releases (§136-143, §196)', () => {
    // Construct a simulated next release with a parameter update and a new capability requirement
    const modifiedPolicy = {
      ...CANONICAL_SCIENTIFIC_POLICY_V2_0_0,
      id: '00000000-0000-0000-0000-000000000098',
      parameterValues: {
        ...CANONICAL_SCIENTIFIC_POLICY_V2_0_0.parameterValues,
        'param.mdd.fc_reliability_threshold': 0.75, // Delta
      },
    };

    const report = analyzePolicyChangeImpact(CANONICAL_SCIENTIFIC_POLICY_V2_0_0, modifiedPolicy);
    expect(report.fromReleaseId).toBe(CANONICAL_SCIENTIFIC_POLICY_V2_0_0.id);
    expect(report.toReleaseId).toBe(modifiedPolicy.id);
    expect(
      report.parameterDeltas.some(d => d.parameterCode === 'param.mdd.fc_reliability_threshold'),
    ).toBe(true);
  });
});
