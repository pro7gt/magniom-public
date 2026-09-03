/**
 * @magniom/target-engine - Gate G6: Anatomy, Lesion & Accessibility
 * Conforms to MAGNIOM-Target Engine & Ranking Algorithm Specification v2.0 (§28-29)
 */

import type {
  GateEvaluation,
  CandidateDraft,
  ResolvedTargetEngineContextV2,
} from '@magniom/domain';

export function evaluateGateG6(
  candidate: CandidateDraft,
  context: ResolvedTargetEngineContextV2,
): GateEvaluation {
  const reasons: string[] = [];

  // 1. Accessibility Check: Point geometries must be within scalp distance limits
  const geom = candidate.targetGeometry;
  if (geom.geometryType === 'point' && geom.centre) {
    // If an accessibility depth/distance is explicitly specified in features or metadata
    const accessibilityFeature = candidate.rawScientificFeatures.find(
      f => f.code === 'cortical_depth_mm',
    );
    if (accessibilityFeature && accessibilityFeature.value > 35) {
      reasons.push(`CORTICAL_DEPTH_EXCEEDED:${accessibilityFeature.value}mm`);
    }
  }

  // 2. Lesion Conflict Check: Destroyed tissue cannot be arbitrarily shifted
  if (context.lesionContexts && context.lesionContexts.length > 0) {
    for (const lesion of context.lesionContexts) {
      if (
        lesion.registrationQuality === 'fail' ||
        (lesion.targetRegionExclusions && lesion.targetRegionExclusions.length > 0)
      ) {
        reasons.push('TARGET_REGION_DESTROYED_OR_ABSENT');
      }
    }
  }

  const pass = reasons.length === 0;

  return {
    gateCode: 'G6_ANATOMY_LESION',
    applicability: 'applicable',
    result: pass ? 'pass' : 'fail',
    reasonCodes: reasons,
    policyRuleIds: ['RULE_G6_ANATOMY_LESION_ACCESSIBILITY'],
    interpretation: pass
      ? 'Target anatomy is intact, accessible and free of destructive lesion conflict.'
      : `Anatomical / lesion / accessibility failure: ${reasons.join(', ')}`,
  };
}
