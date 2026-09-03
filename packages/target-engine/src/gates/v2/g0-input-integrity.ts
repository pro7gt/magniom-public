/**
 * @magniom/target-engine - Gate G0: Input & Manifest Integrity
 * Conforms to MAGNIOM-Target Engine & Ranking Algorithm Specification v2.0 (§18)
 */

import type { GateEvaluation, ResolvedTargetEngineContextV2 } from '@magniom/domain';

export function evaluateGateG0(context: ResolvedTargetEngineContextV2): GateEvaluation {
  const reasons: string[] = [];
  const req = context.request;

  if (!req.caseId) {
    reasons.push('CASE_ID_MISSING');
  }

  if (!context.phenotypeSnapshot) {
    reasons.push('PHENOTYPE_SNAPSHOT_MISSING');
  } else if (context.phenotypeSnapshot.id !== req.phenotypeSnapshotId) {
    reasons.push('PHENOTYPE_ID_MISMATCH');
  }

  if (!context.indicationModule) {
    reasons.push('INDICATION_MODULE_MISSING');
  } else if (context.indicationModule.id !== req.indicationModuleReleaseId) {
    reasons.push('INDICATION_MODULE_ID_MISMATCH');
  }

  if (!context.measurementBundle) {
    reasons.push('MEASUREMENT_BUNDLE_MISSING');
  } else if (context.measurementBundle.caseId !== req.caseId) {
    reasons.push('MEASUREMENT_BUNDLE_CASE_MISMATCH');
  }

  if (req.reliabilityBundleId && context.reliabilityBundle) {
    if (context.reliabilityBundle.caseId !== req.caseId) {
      reasons.push('RELIABILITY_BUNDLE_CASE_MISMATCH');
    }
  }

  const pass = reasons.length === 0;

  return {
    gateCode: 'G0_INPUT_INTEGRITY',
    applicability: 'applicable',
    result: pass ? 'pass' : 'fail',
    reasonCodes: reasons,
    policyRuleIds: ['RULE_G0_INPUT_INTEGRITY'],
    interpretation: pass
      ? 'Input manifest and case identity verified.'
      : `Input integrity verification failed: ${reasons.join(', ')}`,
  };
}
