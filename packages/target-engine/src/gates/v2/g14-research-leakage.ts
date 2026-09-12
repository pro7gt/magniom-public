/**
 * @magniom/target-engine - Gate G14: Research Leakage Prevention
 * Conforms to MAGNIOM Target Engine & Ranking Algorithm Specification v2.1 (§40)
 *
 * Enforces hermetic isolation: exploratory features, dynamic functional connectivity,
 * and unvalidated research algorithms strictly fail closed in Clinical Mode.
 */

import type {
  GateEvaluation,
  CandidateDraft,
  ResolvedTargetEngineContextV2,
} from '@magniom/domain';

export function evaluateGateG14(
  candidate: CandidateDraft,
  context: ResolvedTargetEngineContextV2,
): GateEvaluation {
  const reasons: string[] = [];
  const isClinical = context.request.mode.toLowerCase() === 'clinical';

  if (isClinical) {
    // 1. Check if candidate proposed role is research hypothesis
    if (candidate.proposedRole === 'research_hypothesis') {
      reasons.push('TN-012:RESEARCH_CANDIDATE_PROHIBITED_IN_CLINICAL_MODE');
    }

    // 2. Check if relying on research-only features
    if (candidate.generatorLimitations?.includes('DYNAMIC_FC_RESEARCH_ONLY')) {
      reasons.push('TN-012:DYNAMIC_FC_PROHIBITED_IN_CLINICAL_MODE');
    }

    // 3. Check if relying on experimental unvalidated ML predictions
    if (candidate.generatorLimitations?.includes('UNVALIDATED_ML_MODEL')) {
      reasons.push('TN-012:UNVALIDATED_ML_PREDICTION_PROHIBITED_IN_CLINICAL_MODE');
    }
  }

  const pass = reasons.length === 0;

  return {
    gateCode: 'G14_RESEARCH_LEAKAGE_PREVENTION',
    applicability: 'applicable',
    result: pass ? 'pass' : 'fail',
    reasonCodes: reasons,
    policyRuleIds: ['RULE_G14_HERMETIC_RESEARCH_ISOLATION'],
    interpretation: pass
      ? 'Candidate passes hermetic research isolation; zero clinical leakage detected.'
      : `Research leakage prevention failure: ${reasons.join(', ')}`,
  };
}
