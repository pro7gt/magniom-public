/**
 * @magniom/target-engine - Gate G8: Treatment Context
 * Conforms to MAGNIOM-Target Engine & Ranking Algorithm Specification v2.0 (§31)
 */

import type {
  GateEvaluation,
  CandidateDraft,
  ResolvedTargetEngineContextV2,
} from '@magniom/domain';

export function evaluateGateG8(
  candidate: CandidateDraft,
  context: ResolvedTargetEngineContextV2,
): GateEvaluation {
  const reasons: string[] = [];
  const treatmentContext = context.treatmentContextSnapshot;

  const paths = context.permittedEvidencePaths.filter(p =>
    candidate.evidencePathIds.includes(p.id),
  );
  for (const path of paths) {
    if (path.treatmentContextRequirementIds && path.treatmentContextRequirementIds.length > 0) {
      if (!treatmentContext) {
        reasons.push('TREATMENT_CONTEXT_SNAPSHOT_MISSING');
      } else {
        // If treatment context requirement is absent or missing
        const hasConflict = treatmentContext.requirementEvaluations.some(
          e => e.status === 'absent',
        );
        if (hasConflict) {
          reasons.push('TREATMENT_CONTEXT_MISMATCH');
        }
      }
    }
  }

  const pass = reasons.length === 0;

  return {
    gateCode: 'G8_TREATMENT_CONTEXT',
    applicability:
      reasons.length > 0 || treatmentContext !== undefined ? 'applicable' : 'not_applicable',
    result: pass ? 'pass' : 'fail',
    reasonCodes: reasons,
    policyRuleIds: ['RULE_G8_TREATMENT_CONTEXT'],
    interpretation: pass
      ? 'Treatment context requirements satisfied.'
      : `Treatment context failure: ${reasons.join(', ')}`,
  };
}
