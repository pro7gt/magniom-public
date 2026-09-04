/**
 * MAGNIOM Scientific Policy Manifest Builder & Integrity Verifier
 * Conforms to MAGNIOM-Scientific Policy & Algorithm Configuration Specification v2.0 (§123-128)
 */

import type { ScientificPolicyReleaseV2, ScientificPolicyReleaseManifestV2 } from '@magniom/domain';
import { computeSha256 } from '../policy-hasher.js';

export function buildScientificPolicyReleaseManifest(
  policy: ScientificPolicyReleaseV2,
): ScientificPolicyReleaseManifestV2 {
  const indicationModuleReleaseIds = policy.indicationPolicyBindings.map(
    b => b.indicationModuleReleaseId,
  );
  const compatibilityConfigurationIds = policy.compatibilityConfigurations.map(c => c.id);
  const evidenceLibraryReleaseIds = Array.from(
    new Set(policy.compatibilityConfigurations.map(c => c.evidenceLibraryReleaseId)),
  );
  const targetEngineReleaseIds = Array.from(
    new Set(policy.compatibilityConfigurations.map(c => c.targetEngineReleaseId)),
  );

  const pluginReleaseRefs = policy.compatibilityConfigurations.map(c => c.targetingPlugin);
  const generatorReleaseRefs = policy.compatibilityConfigurations.flatMap(
    c => c.candidateGenerators,
  );
  const measurementProviderReleaseRefs = policy.compatibilityConfigurations.flatMap(
    c => c.measurementProviders,
  );

  const unsignedManifestData = {
    scientificPolicyReleaseId: policy.id,
    indicationModuleReleaseIds,
    compatibilityConfigurationIds,
    evidenceLibraryReleaseIds,
    targetEngineReleaseIds,
    pluginReleaseRefs,
    generatorReleaseRefs,
    measurementProviderReleaseRefs,
  };

  const manifestSha256 = computeSha256(unsignedManifestData);

  return {
    ...unsignedManifestData,
    manifestSha256,
    generatedAt: new Date().toISOString(),
  };
}

export function computePolicyPayloadHash(
  policy: Omit<
    ScientificPolicyReleaseV2,
    | 'payloadSha256'
    | 'compatibilityManifestSha256'
    | 'releaseManifestSha256'
    | 'signatures'
    | 'approvals'
  >,
): string {
  return computeSha256(policy);
}

export function verifyPolicyIntegrity(policy: ScientificPolicyReleaseV2): {
  passed: boolean;
  reasonCode?: 'SCIENTIFIC_POLICY_INTEGRITY_FAILURE';
  message?: string;
} {
  const {
    payloadSha256: storedHash,
    compatibilityManifestSha256: _compatHash,
    releaseManifestSha256: _relHash,
    signatures: _sigs,
    approvals: _apps,
    ...payloadData
  } = policy;

  const computedHash = computeSha256(payloadData);

  if (storedHash !== computedHash) {
    return {
      passed: false,
      reasonCode: 'SCIENTIFIC_POLICY_INTEGRITY_FAILURE',
      message: `Scientific policy payload hash mismatch: stored [${storedHash}] vs recomputed [${computedHash}] (§126)`,
    };
  }

  return { passed: true };
}

export function verifyPolicySignatures(policy: ScientificPolicyReleaseV2): {
  passed: boolean;
  reasonCode?: 'SCIENTIFIC_POLICY_SIGNATURE_INVALID';
  message?: string;
} {
  if (!policy.signatures || policy.signatures.length === 0) {
    return {
      passed: false,
      reasonCode: 'SCIENTIFIC_POLICY_SIGNATURE_INVALID',
      message: `Scientific policy release '${policy.code}' has no digital signatures (§127)`,
    };
  }

  for (const sig of policy.signatures) {
    if (!sig.signature || sig.signature.length < 32) {
      return {
        passed: false,
        reasonCode: 'SCIENTIFIC_POLICY_SIGNATURE_INVALID',
        message: `Invalid signature for role '${sig.signerRole}' in policy '${policy.code}' (§127)`,
      };
    }
  }

  return { passed: true };
}
