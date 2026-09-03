/**
 * @magniom/target-engine - Gate G9: Generator-Specific Constraints
 * Conforms to MAGNIOM-Target Engine & Ranking Algorithm Specification v2.0 (§32, 137)
 * and Section 21 Exit Criterion 6 ("refinement requires declared baseline where applicable")
 */

import type {
  GateEvaluation,
  CandidateDraft,
  ResolvedTargetEngineContextV2,
} from '@magniom/domain';

export function evaluateGateG9(
  candidate: CandidateDraft,
  _context: ResolvedTargetEngineContextV2,
): GateEvaluation {
  const reasons: string[] = [];

  // 1. Exit Criterion 6: Refinement requires declared baseline
  if (candidate.lineage?.lineageType === 'measurement_refinement') {
    if (!candidate.lineage.baselineCandidateDraftId) {
      reasons.push('MISSING_DECLARED_BASELINE');
    }
  }

  // 2. Geometry coordinate validation
  if (candidate.targetGeometry.geometryType === 'point') {
    const coord = candidate.targetGeometry.centre;
    if (!coord || isNaN(coord.x) || isNaN(coord.y) || isNaN(coord.z)) {
      reasons.push('INVALID_POINT_COORDINATE');
    }
  }

  const pass = reasons.length === 0;

  return {
    gateCode: 'G9_GENERATOR_CONSTRAINTS',
    applicability: 'applicable',
    result: pass ? 'pass' : 'fail',
    reasonCodes: reasons,
    policyRuleIds: ['RULE_G9_GENERATOR_SPECIFIC_CONSTRAINTS'],
    interpretation: pass
      ? 'Generator-specific constraints satisfied, including baseline declaration where applicable.'
      : `Generator constraint failure: ${reasons.join(', ')}`,
  };
}
