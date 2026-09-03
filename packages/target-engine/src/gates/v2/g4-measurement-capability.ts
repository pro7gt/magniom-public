/**
 * @magniom/target-engine - Gate G4: Measurement Capability
 * Conforms to MAGNIOM-Target Engine & Ranking Algorithm Specification v2.0 (§24-25)
 */

import type {
  GateEvaluation,
  CandidateDraft,
  ResolvedTargetEngineContextV2,
} from '@magniom/domain';

export function evaluateGateG4(
  _candidate: CandidateDraft,
  context: ResolvedTargetEngineContextV2,
  requiredCapabilities: readonly string[] = [],
): GateEvaluation {
  const reasons: string[] = [];
  const bundle = context.measurementBundle;

  if (requiredCapabilities.length === 0) {
    return {
      gateCode: 'G4_MEASUREMENT_CAPABILITY',
      applicability: 'not_applicable',
      result: 'pass',
      reasonCodes: [],
      policyRuleIds: ['RULE_G4_MEASUREMENT_CAPABILITY'],
      interpretation: 'No patient-specific measurement capability required for this candidate.',
    };
  }

  for (const capCode of requiredCapabilities) {
    const cap = bundle.requirementEvaluations?.find(c => c.requirementCode === capCode);
    if (!cap) {
      reasons.push(`MEASUREMENT_CAPABILITY_UNAVAILABLE:${capCode}`);
    } else if (!cap.satisfied || cap.resultingCapability === 'disabled') {
      reasons.push(`MEASUREMENT_CAPABILITY_NOT_QUALIFIED:${capCode}:${cap.resultingCapability}`);
    }
  }

  const pass = reasons.length === 0;

  return {
    gateCode: 'G4_MEASUREMENT_CAPABILITY',
    applicability: 'applicable',
    result: pass ? 'pass' : 'fail',
    reasonCodes: reasons,
    policyRuleIds: ['RULE_G4_MEASUREMENT_CAPABILITY'],
    interpretation: pass
      ? 'All required measurement capabilities are qualified in MeasurementBundle.'
      : `Measurement capability qualification failure: ${reasons.join(', ')}`,
  };
}
