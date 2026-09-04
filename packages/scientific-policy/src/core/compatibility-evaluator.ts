/**
 * MAGNIOM Scientific Compatibility Tuple & Positive Whitelist Evaluator v2.0
 * Conforms to MAGNIOM-Scientific Policy & Algorithm Configuration Specification v2.0 (§10-26, §110-116, §144-152)
 */

import type {
  MagniomMode,
  ScientificPolicyReleaseV2,
  IndicationPolicyBinding,
  ScientificCompatibilityConfiguration,
} from '@magniom/domain';
import { formatClinicianErrorMessage } from '../errors/failure-codes.js';

export interface CompatibilityEvaluationContext {
  readonly policy: ScientificPolicyReleaseV2;
  readonly indicationModuleReleaseId: string;
  readonly indicationModuleCode: string;
  readonly indicationModuleVersion?: string | undefined;
  readonly indicationModuleMaturity?: string | undefined;
  readonly mode: MagniomMode;
  readonly evidenceLibraryReleaseId: string;
  readonly targetEngineReleaseId: string;
  readonly targetingPluginVersion: string;
  readonly targetingPluginDigest?: string | undefined;
  readonly candidateGeneratorIds: readonly string[];
  readonly requestedCapabilities?: readonly string[] | undefined;
  readonly measurementProviderIds?: readonly string[] | undefined;
  readonly reliabilityResults?:
    | Readonly<
        Record<
          string,
          { passed: boolean; metricValue?: number | undefined; threshold?: number | undefined }
        >
      >
    | undefined;
  readonly lesionContextPresent?: boolean | undefined;
}

export interface CompatibilityEvaluationResult {
  readonly compatible: boolean;
  readonly binding?: IndicationPolicyBinding | undefined;
  readonly matchedConfiguration?: ScientificCompatibilityConfiguration | undefined;
  readonly reasonCode?:
    | 'INDICATION_POLICY_BINDING_NOT_FOUND'
    | 'INDICATION_MODULE_VERSION_INCOMPATIBLE'
    | 'INDICATION_MODULE_NOT_CLINICALLY_PERMITTED'
    | 'SCIENTIFIC_CONFIGURATION_INCOMPATIBLE'
    | 'TARGET_PLUGIN_INTEGRITY_FAILURE'
    | 'RELIABILITY_REQUIREMENT_NOT_MET'
    | 'LESION_CONTEXT_REQUIRED'
    | 'POLICY_PROHIBITED_CONFIGURATION'
    | undefined;
  readonly message?: string | undefined;
  readonly isFallbackEngaged?: boolean | undefined;
  readonly fallbackExplanation?: string | undefined;
  readonly limitations: readonly string[];
}

export function evaluateScientificCompatibility(
  context: CompatibilityEvaluationContext,
): CompatibilityEvaluationResult {
  const { policy, indicationModuleReleaseId, indicationModuleCode, mode } = context;

  // 1. Resolve IndicationPolicyBinding (§15, §16)
  const binding = policy.indicationPolicyBindings.find(
    b => b.indicationModuleReleaseId === indicationModuleReleaseId,
  );

  if (!binding) {
    return {
      compatible: false,
      reasonCode: 'INDICATION_POLICY_BINDING_NOT_FOUND',
      message: formatClinicianErrorMessage('INDICATION_POLICY_BINDING_NOT_FOUND', {
        policyCode: policy.code,
        moduleCode: indicationModuleCode,
      }),
      limitations: ['No indication policy binding registered.'],
    };
  }

  // 2. Evaluate Module-Specific Clinical Authority (§17, §96, §152)
  if (mode === 'clinical') {
    if (binding.modulePermission !== 'clinical_permitted') {
      return {
        compatible: false,
        binding,
        reasonCode: 'INDICATION_MODULE_NOT_CLINICALLY_PERMITTED',
        message: formatClinicianErrorMessage('INDICATION_MODULE_NOT_CLINICALLY_PERMITTED', {
          moduleCode: indicationModuleCode,
          maturity: binding.modulePermission,
        }),
        limitations: [
          `Indication module ${indicationModuleCode} is permitted for ${binding.modulePermission} only.`,
        ],
      };
    }

    if (
      context.indicationModuleMaturity === 'research_only' ||
      context.indicationModuleMaturity === 'research'
    ) {
      return {
        compatible: false,
        binding,
        reasonCode: 'INDICATION_MODULE_NOT_CLINICALLY_PERMITTED',
        message: formatClinicianErrorMessage('INDICATION_MODULE_NOT_CLINICALLY_PERMITTED', {
          moduleCode: indicationModuleCode,
          maturity: context.indicationModuleMaturity,
        }),
        limitations: ['Module maturity cannot be upgraded by policy alone (§17).'],
      };
    }
  }

  // 3. Positive Whitelist Search (§10, §11, §12)
  const permittedConfigs = policy.compatibilityConfigurations.filter(c =>
    binding.permittedCompatibilityConfigurationIds.includes(c.id),
  );

  const matchedConfig = permittedConfigs.find(c => {
    // Mode must match
    if (c.mode !== mode) return false;
    // Indication module must match
    if (c.indicationModuleReleaseId !== indicationModuleReleaseId) return false;
    // Evidence library release must match
    if (c.evidenceLibraryReleaseId !== context.evidenceLibraryReleaseId) return false;
    // Target engine release must match
    if (c.targetEngineReleaseId !== context.targetEngineReleaseId) return false;
    // Targeting plugin version must match
    if (c.targetingPlugin.componentVersion !== context.targetingPluginVersion) return false;

    return true;
  });

  if (!matchedConfig) {
    return {
      compatible: false,
      binding,
      reasonCode: 'SCIENTIFIC_CONFIGURATION_INCOMPATIBLE',
      message: formatClinicianErrorMessage('SCIENTIFIC_CONFIGURATION_INCOMPATIBLE'),
      limitations: ['No positively whitelisted scientific compatibility configuration matched.'],
    };
  }

  // 4. Targeting Plugin Digest Check (§53, §156)
  if (
    context.targetingPluginDigest &&
    matchedConfig.targetingPlugin.manifestSha256 &&
    context.targetingPluginDigest !== matchedConfig.targetingPlugin.manifestSha256
  ) {
    return {
      compatible: false,
      binding,
      matchedConfiguration: matchedConfig,
      reasonCode: 'TARGET_PLUGIN_INTEGRITY_FAILURE',
      message: formatClinicianErrorMessage('TARGET_PLUGIN_INTEGRITY_FAILURE'),
      limitations: ['Plugin package digest does not match approved release.'],
    };
  }

  // 5. Check Neurological Lesion Requirement (§67, §147)
  if (
    (indicationModuleCode.toLowerCase().includes('stroke') ||
      indicationModuleCode.toLowerCase().includes('lesion')) &&
    context.lesionContextPresent === false
  ) {
    // In stroke motor, absent lesion context blocks/abstains; no normal-template fallback (§115, §147)
    return {
      compatible: false,
      binding,
      matchedConfiguration: matchedConfig,
      reasonCode: 'LESION_CONTEXT_REQUIRED',
      message: formatClinicianErrorMessage('LESION_CONTEXT_REQUIRED'),
      isFallbackEngaged: false,
      limitations: ['Required native-space LesionContext is absent. Module fail-closed.'],
    };
  }

  // 6. Reliability Gate & Fallback Evaluation (§42-44, §111-116, §145, §146)
  let isFallbackEngaged = false;
  let fallbackExplanation: string | undefined;

  if (context.reliabilityResults) {
    for (const rule of binding.reliabilityPolicy.capabilityRules) {
      const rel = context.reliabilityResults[rule.capabilityCode];
      if (rel && !rel.passed) {
        if (rule.failureBehaviour === 'fallback') {
          // Look for fallback configuration (§112, §113, §114)
          const fallbackRule = binding.measurementPolicy.fallbackRules.find(
            r => r.fromCapability === rule.capabilityCode,
          );
          if (fallbackRule && fallbackRule.fallbackConfigurationId) {
            const fbConfig = policy.compatibilityConfigurations.find(
              c => c.id === fallbackRule.fallbackConfigurationId,
            );
            if (fbConfig) {
              isFallbackEngaged = true;
              fallbackExplanation = formatClinicianErrorMessage('RELIABILITY_REQUIREMENT_NOT_MET', {
                metric: rule.capabilityCode,
                value: rel.metricValue ?? 'failed',
                threshold: rel.threshold ?? 'required',
              });
              return {
                compatible: true,
                binding,
                matchedConfiguration: fbConfig,
                isFallbackEngaged: true,
                fallbackExplanation,
                limitations: [...binding.limitations, fallbackExplanation],
              };
            }
          }
        }

        if (rule.failureBehaviour === 'block_module') {
          return {
            compatible: false,
            binding,
            matchedConfiguration: matchedConfig,
            reasonCode: 'RELIABILITY_REQUIREMENT_NOT_MET',
            message: formatClinicianErrorMessage('RELIABILITY_REQUIREMENT_NOT_MET', {
              metric: rule.capabilityCode,
              value: rel.metricValue ?? 'failed',
              threshold: rel.threshold ?? 'required',
            }),
            limitations: [`Reliability requirement for ${rule.capabilityCode} failed.`],
          };
        }
      }
    }
  }

  return {
    compatible: true,
    binding,
    matchedConfiguration: matchedConfig,
    isFallbackEngaged,
    fallbackExplanation,
    limitations: binding.limitations,
  };
}
