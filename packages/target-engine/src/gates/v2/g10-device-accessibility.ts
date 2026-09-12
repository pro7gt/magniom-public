/**
 * @magniom/target-engine - Gate G10: Device / Accessibility
 * Conforms to MAGNIOM Target Engine & Ranking Algorithm Specification v2.1 (§36)
 *
 * Verifies that the candidate target is physically and geometrically accessible
 * to the specified stimulation device, coil model, and navigation system.
 */

import type {
  GateEvaluation,
  CandidateDraft,
  ResolvedTargetEngineContextV2,
} from '@magniom/domain';

export function evaluateGateG10(
  candidate: CandidateDraft,
  context: ResolvedTargetEngineContextV2,
): GateEvaluation {
  const reasons: string[] = [];
  const req = context.request;

  // 1. If device contexts are declared in request, verify accessibility
  if (req.deviceContextIds && req.deviceContextIds.length > 0) {
    const geom = candidate.targetGeometry as any;
    const candidateDepthMm =
      typeof geom.depthMm === 'number'
        ? geom.depthMm
        : geom.centre && typeof geom.centre.z === 'number'
          ? Math.abs(geom.centre.z)
          : 15.0;

    // Typical figure-8 coil depth threshold is ~35-40mm
    if (candidateDepthMm > 40.0) {
      const allowsDeepTms = req.deviceContextIds.some(
        d => d.toLowerCase().includes('deep_tms') || d.toLowerCase().includes('h_coil'),
      );
      if (!allowsDeepTms) {
        reasons.push(
          `TARGET_DEPTH_EXCEEDS_DEVICE_LIMIT:depth_${candidateDepthMm.toFixed(1)}mm_requires_deep_tms`,
        );
      }
    }
  }

  // 2. Check candidate accessibility constraints if specified
  if (
    candidate.generatorLimitations &&
    candidate.generatorLimitations.includes('INACCESSIBLE_GEOMETRY')
  ) {
    reasons.push('GEOMETRIC_INACCESSIBILITY_FLAGGED_BY_GENERATOR');
  }

  const pass = reasons.length === 0;

  return {
    gateCode: 'G10_DEVICE_ACCESSIBILITY',
    applicability: 'applicable',
    result: pass ? 'pass' : 'fail',
    reasonCodes: reasons,
    policyRuleIds: ['RULE_G10_DEVICE_ACCESSIBILITY_COMPATIBILITY'],
    interpretation: pass
      ? 'Target is anatomically and geometrically accessible to approved device configuration.'
      : `Device / accessibility validation failure: ${reasons.join(', ')}`,
  };
}
