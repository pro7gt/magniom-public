/**
 * @magniom/target-engine - Gate G13: Systems Context Authority
 * Conforms to MAGNIOM Target Engine & Ranking Algorithm Specification v2.1 (§39)
 *
 * Enforces that Triple-Network and large-scale systems context operates strictly
 * as an adjunctive contextual modifier and never autonomously creates or promotes targets.
 */

import type {
  GateEvaluation,
  CandidateDraft,
  ResolvedTargetEngineContextV2,
} from '@magniom/domain';

export function evaluateGateG13(
  candidate: CandidateDraft,
  context: ResolvedTargetEngineContextV2,
): GateEvaluation {
  const reasons: string[] = [];
  const isClinical = context.request.mode.toLowerCase() === 'clinical';

  // 1. In Clinical Mode, candidate generator cannot be an autonomous network generator
  if (isClinical) {
    if (
      candidate.generatorId.toLowerCase().includes('autonomous_network') ||
      candidate.generatorId.toLowerCase().includes('network_only_generator')
    ) {
      reasons.push('AUTONOMOUS_NETWORK_TARGET_GENERATION_PROHIBITED_IN_CLINICAL_MODE');
    }
  }

  // 2. Systems context cannot override evidence ceiling (Level D cannot be promoted to Level A/B)
  if (context.tripleNetworkContext) {
    const tn = context.tripleNetworkContext;
    if (
      isClinical &&
      tn.policy_status === 'research_only' &&
      candidate.proposedRole === 'A1_network_alternative'
    ) {
      reasons.push('RESEARCH_ONLY_NETWORK_CONTEXT_CANNOT_AUTHORIZE_CLINICAL_ALTERNATIVE');
    }
  }

  const pass = reasons.length === 0;

  return {
    gateCode: 'G13_SYSTEMS_CONTEXT_AUTHORITY',
    applicability: 'applicable',
    result: pass ? 'pass' : 'fail',
    reasonCodes: reasons,
    policyRuleIds: ['RULE_G13_SYSTEMS_CONTEXT_AUTHORITY'],
    interpretation: pass
      ? 'Candidate conforms to systems context authority boundary and non-autonomous invariant.'
      : `Systems context authority failure: ${reasons.join(', ')}`,
  };
}
