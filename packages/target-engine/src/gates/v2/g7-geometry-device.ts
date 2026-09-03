/**
 * @magniom/target-engine - Gate G7: Geometry & Device Compatibility
 * Conforms to MAGNIOM-Target Engine & Ranking Algorithm Specification v2.0 (§30)
 */

import type {
  GateEvaluation,
  CandidateDraft,
  ResolvedTargetEngineContextV2,
} from '@magniom/domain';

export function evaluateGateG7(
  candidate: CandidateDraft,
  context: ResolvedTargetEngineContextV2,
): GateEvaluation {
  const reasons: string[] = [];
  const candidateGeometryType = candidate.targetGeometry.geometryType;

  // 1. Check IndicationModule permitted geometry types
  const modulePermitted = context.indicationModule.permittedTargetGeometryTypes;
  if (modulePermitted && modulePermitted.length > 0) {
    if (!modulePermitted.includes(candidateGeometryType)) {
      reasons.push(`GEOMETRY_TYPE_NOT_PERMITTED_BY_MODULE:${candidateGeometryType}`);
    }
  }

  // 2. Check EvidencePath permitted geometry type
  const paths = context.permittedEvidencePaths.filter(p =>
    candidate.evidencePathIds.includes(p.id),
  );
  for (const path of paths) {
    if (path.targetGeometryType && path.targetGeometryType !== candidateGeometryType) {
      reasons.push(
        `GEOMETRY_MISMATCH_WITH_EVIDENCE_PATH:${path.targetGeometryType}_vs_${candidateGeometryType}`,
      );
    }
  }

  // 3. Reject downcasting (e.g., if geometry is point but underlying concept is coil_field or network)
  if (candidate.proposedRole === 'field_target' && candidateGeometryType === 'point') {
    reasons.push('INVALID_GEOMETRY_DOWNCASTING:field_target_cannot_be_point');
  }

  const pass = reasons.length === 0;

  return {
    gateCode: 'G7_GEOMETRY_DEVICE',
    applicability: 'applicable',
    result: pass ? 'pass' : 'fail',
    reasonCodes: reasons,
    policyRuleIds: ['RULE_G7_GEOMETRY_DEVICE_COMPATIBILITY'],
    interpretation: pass
      ? 'Target geometry matches module, evidence path and device constraints.'
      : `Geometry / device compatibility failure: ${reasons.join(', ')}`,
  };
}
