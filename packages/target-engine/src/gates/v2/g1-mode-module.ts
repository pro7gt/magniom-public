/**
 * @magniom/target-engine - Gate G1: Mode & Module Authority
 * Conforms to MAGNIOM-Target Engine & Ranking Algorithm Specification v2.0 (§19)
 */

import type { GateEvaluation, ResolvedTargetEngineContextV2 } from '@magniom/domain';

export function evaluateGateG1(context: ResolvedTargetEngineContextV2): GateEvaluation {
  const reasons: string[] = [];
  const mode = context.request.mode;
  const module = context.indicationModule;

  if (mode === 'clinical') {
    if (!module.permittedModes || !module.permittedModes.includes('clinical')) {
      reasons.push('MODULE_RESEARCH_ONLY_IN_CLINICAL_MODE');
    }

    if (module.lifecycleStatus === 'withdrawn' || module.lifecycleStatus === 'superseded') {
      reasons.push('MODULE_LIFECYCLE_STATUS_NOT_PERMITTED');
    }

    if (module.qualificationLevel === 'Q0') {
      reasons.push('MODULE_QUALIFICATION_INSUFFICIENT_FOR_CLINICAL');
    }
  }

  const pass = reasons.length === 0;

  return {
    gateCode: 'G1_MODE_MODULE',
    applicability: 'applicable',
    result: pass ? 'pass' : 'fail',
    reasonCodes: reasons,
    policyRuleIds: ['RULE_G1_MODE_MODULE_AUTHORITY'],
    interpretation: pass
      ? `Mode ${mode} authorized for module ${module.code}.`
      : `Mode and module authority failure: ${reasons.join(', ')}`,
  };
}
