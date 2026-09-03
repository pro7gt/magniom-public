/**
 * @magniom/target-engine - Gate G5: Reliability Qualification
 * Conforms to MAGNIOM-Target Engine & Ranking Algorithm Specification v2.0 (§26-27)
 */

import type {
  GateEvaluation,
  CandidateDraft,
  ResolvedTargetEngineContextV2,
} from '@magniom/domain';

export function evaluateGateG5(
  candidate: CandidateDraft,
  context: ResolvedTargetEngineContextV2,
): GateEvaluation {
  const isPersonalised =
    candidate.proposedRole === 'connectome_refinement' ||
    candidate.lineage?.lineageType === 'measurement_refinement' ||
    (candidate.reliedOnReliabilityIds && candidate.reliedOnReliabilityIds.length > 0);

  if (!isPersonalised) {
    return {
      gateCode: 'G5_RELIABILITY',
      applicability: 'not_applicable',
      result: 'pass',
      reasonCodes: [],
      policyRuleIds: ['RULE_G5_RELIABILITY_QUALIFICATION'],
      interpretation: 'Reliability qualification not applicable to evidence baseline candidate.',
    };
  }

  const reasons: string[] = [];
  const reliabilityBundle = context.reliabilityBundle;

  if (!reliabilityBundle) {
    reasons.push('RELIABILITY_BUNDLE_MISSING_FOR_REFINED_TARGET');
  } else {
    // Check if capabilities are qualified in reliability bundle
    if (
      reliabilityBundle.capabilityQualification &&
      reliabilityBundle.capabilityQualification.length > 0
    ) {
      const allPassed = reliabilityBundle.capabilityQualification.every(
        q => q.status === 'qualified' || q.status === 'qualified_with_limits',
      );
      if (!allPassed) {
        reasons.push('RELIABILITY_QUALIFICATION_FAILED');
      }
    } else if (reliabilityBundle.overallQualification) {
      if (
        reliabilityBundle.overallQualification !== 'qualified' &&
        reliabilityBundle.overallQualification !== 'qualified_with_limits'
      ) {
        reasons.push(`RELIABILITY_STATUS_INSUFFICIENT:${reliabilityBundle.overallQualification}`);
      }
    }
  }

  const pass = reasons.length === 0;

  return {
    gateCode: 'G5_RELIABILITY',
    applicability: 'applicable',
    result: pass ? 'pass' : 'fail',
    reasonCodes: reasons,
    policyRuleIds: ['RULE_G5_RELIABILITY_QUALIFICATION'],
    interpretation: pass
      ? 'Patient-specific measurement reliability qualified for clinical influence.'
      : `Reliability qualification failure: ${reasons.join(', ')}`,
  };
}
