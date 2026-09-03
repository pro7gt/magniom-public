/**
 * @magniom/target-engine - Refinement Framework: Counterfactual Comparison
 * Conforms to MAGNIOM-Target Engine & Ranking Algorithm Specification v2.0 (§90-97)
 */

import type {
  CandidateDraft,
  GeometryDifference,
  RefinementDecision,
  RefinementDecisionStatus,
  GateEvaluation,
} from '@magniom/domain';

export function calculateGeometryDifference(
  baseline: CandidateDraft,
  refined: CandidateDraft,
  maxDisplacementMm = 20.0,
): GeometryDifference {
  if (
    baseline.targetGeometry.geometryType === 'point' &&
    refined.targetGeometry.geometryType === 'point' &&
    baseline.targetGeometry.centre &&
    refined.targetGeometry.centre
  ) {
    const c1 = baseline.targetGeometry.centre;
    const c2 = refined.targetGeometry.centre;
    const dx = c1.x - c2.x;
    const dy = c1.y - c2.y;
    const dz = c1.z - c2.z;
    const distanceMm = Math.sqrt(dx * dx + dy * dy + dz * dz);

    return {
      metric: 'euclidean',
      value: Math.round(distanceMm * 10) / 10,
      unit: 'mm',
      withinAcceptableBound: distanceMm <= maxDisplacementMm,
    };
  }

  // Default neutral difference
  return {
    metric: 'euclidean',
    value: 0,
    unit: 'mm',
    withinAcceptableBound: true,
  };
}

export function buildRefinementDecision(
  baseline: CandidateDraft,
  refined: CandidateDraft,
  status: RefinementDecisionStatus,
  conditions: readonly GateEvaluation[],
  interpretation: string,
  maxDisplacementMm = 20.0,
): RefinementDecision {
  const geomDiff = calculateGeometryDifference(baseline, refined, maxDisplacementMm);

  const baseFeatMap = new Map(baseline.rawScientificFeatures.map(f => [f.code, f.value]));
  const featureDiffs = refined.rawScientificFeatures.map(rf => {
    const bVal = baseFeatMap.get(rf.code) ?? 0;
    return {
      featureCode: rf.code,
      baselineValue: bVal,
      refinedValue: rf.value,
      delta: Math.round((rf.value - bVal) * 1000) / 1000,
    };
  });

  return {
    baselineCandidateId: baseline.draftId,
    refinedCandidateId: refined.draftId,
    refinementKind: refined.lineage?.refinementKind ?? 'functional_connectivity',
    geometryDifference: geomDiff,
    featureDifferences: featureDiffs,
    adoptionConditions: conditions,
    status,
    interpretation,
  };
}
