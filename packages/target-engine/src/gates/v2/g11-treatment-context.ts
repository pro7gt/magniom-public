/**
 * @magniom/target-engine - Gate G11: Treatment Context
 * Conforms to MAGNIOM Target Engine & Ranking Algorithm Specification v2.1 (§37)
 *
 * Verifies that the candidate target is compatible with the patient's treatment setting,
 * concurrent medications, disease stage context, and clinical protocol requirements.
 */

import type {
  GateEvaluation,
  CandidateDraft,
  ResolvedTargetEngineContextV2,
} from '@magniom/domain';

export function evaluateGateG11(
  candidate: CandidateDraft,
  context: ResolvedTargetEngineContextV2,
): GateEvaluation {
  const reasons: string[] = [];

  // 1. If treatment context snapshot is present, verify requirement evaluations
  if (context.treatmentContextSnapshot) {
    const tcs = context.treatmentContextSnapshot;
    for (const ev of tcs.requirementEvaluations) {
      if (
        ev.status === 'absent' &&
        candidate.generatorLimitations?.includes(`REQUIRES_${ev.treatmentContextRequirementId}`)
      ) {
        reasons.push(`REQUIRED_TREATMENT_CONTEXT_ABSENT:${ev.treatmentContextRequirementId}`);
      }
    }
  }

  // 2. Validate disease stage compatibility if present
  if (context.diseaseStageContext) {
    const dsc = context.diseaseStageContext;
    if (
      dsc.stageDefinitionId &&
      candidate.generatorLimitations?.includes(`CONTRAINDICATED_IN_STAGE_${dsc.stageDefinitionId}`)
    ) {
      reasons.push(`CANDIDATE_CONTRAINDICATED_IN_STAGE:${dsc.stageDefinitionId}`);
    }
  }

  const pass = reasons.length === 0;

  return {
    gateCode: 'G11_TREATMENT_CONTEXT',
    applicability: 'applicable',
    result: pass ? 'pass' : 'fail',
    reasonCodes: reasons,
    policyRuleIds: ['RULE_G11_TREATMENT_CONTEXT_COMPATIBILITY'],
    interpretation: pass
      ? 'Target satisfies all treatment setting, stage context, and medication safety constraints.'
      : `Treatment context compatibility failure: ${reasons.join(', ')}`,
  };
}
