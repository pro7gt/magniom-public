/**
 * @magniom/networks - Triple-Network Policy Evaluator
 * Conforms to MAGNIOM-Triple-Network Systems Layer v1.0 (§45-49)
 */

import type { TripleNetworkPolicy, TripleNetworkTargetContext, MagniomMode } from '@magniom/domain';
import { TN_FAILURE_CODES, TN_WARNING_CODES } from '@magniom/domain';

export interface PolicyEvaluationResult {
  readonly permitted: boolean;
  readonly failureCodes: readonly string[];
  readonly warnings: readonly string[];
  readonly effectiveClinicalRole: 'context' | 'research_only' | 'blocked';
}

export function evaluateTripleNetworkPolicy(
  context: TripleNetworkTargetContext | undefined,
  policy: TripleNetworkPolicy | undefined,
  mode: MagniomMode,
): PolicyEvaluationResult {
  const isClinical = mode.toLowerCase() === 'clinical';
  const warnings: string[] = [];

  if (!context) {
    return {
      permitted: true,
      failureCodes: [],
      warnings: [TN_WARNING_CODES.TRIPLE_NETWORK_CONTEXT_UNAVAILABLE],
      effectiveClinicalRole: 'context',
    };
  }

  if (!policy || !policy.enabled) {
    if (isClinical) {
      warnings.push(TN_WARNING_CODES.TRIPLE_NETWORK_FEATURE_POLICY_BLOCKED);
      return {
        permitted: false,
        failureCodes: [TN_FAILURE_CODES.TN_013_NETWORK_FEATURE_NOT_AUTHORISED_BY_POLICY],
        warnings,
        effectiveClinicalRole: 'blocked',
      };
    }
    return {
      permitted: true,
      failureCodes: [],
      warnings: [TN_WARNING_CODES.TRIPLE_NETWORK_RESEARCH_ONLY],
      effectiveClinicalRole: 'research_only',
    };
  }

  // Dynamic metrics prohibition in Clinical Mode (§40, §46, §47)
  if (isClinical && policy.dynamic_metrics_allowed) {
    return {
      permitted: false,
      failureCodes: [TN_FAILURE_CODES.TN_012_RESEARCH_FEATURE_REQUESTED_IN_CLINICAL],
      warnings,
      effectiveClinicalRole: 'blocked',
    };
  }

  // Check ranking feature authorizations (§2, §34)
  if (isClinical && policy.ranking_features && policy.ranking_features.length > 0) {
    for (const feat of policy.ranking_features) {
      if (feat.allowed_role !== 'context') {
        return {
          permitted: false,
          failureCodes: [TN_FAILURE_CODES.TN_013_NETWORK_FEATURE_NOT_AUTHORISED_BY_POLICY],
          warnings,
          effectiveClinicalRole: 'blocked',
        };
      }
    }
  }

  // Check reliability requirement (§44, §72)
  const relStatus = context.reliability.overall_status;
  if (relStatus === 'limited' || relStatus === 'insufficient') {
    warnings.push(TN_WARNING_CODES.TRIPLE_NETWORK_LOW_RELIABILITY);
    if (isClinical && relStatus === 'insufficient') {
      return {
        permitted: false,
        failureCodes: [TN_FAILURE_CODES.TN_003_CEN_RELIABILITY_INSUFFICIENT],
        warnings,
        effectiveClinicalRole: 'blocked',
      };
    }
  }

  // Check research leakage
  if (isClinical && context.policy_status === 'research_only') {
    warnings.push(TN_WARNING_CODES.TRIPLE_NETWORK_RESEARCH_ONLY);
    return {
      permitted: false,
      failureCodes: [TN_FAILURE_CODES.TN_012_RESEARCH_FEATURE_REQUESTED_IN_CLINICAL],
      warnings,
      effectiveClinicalRole: 'blocked',
    };
  }

  return {
    permitted: true,
    failureCodes: [],
    warnings,
    effectiveClinicalRole: isClinical ? 'context' : 'research_only',
  };
}
