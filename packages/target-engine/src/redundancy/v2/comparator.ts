/**
 * @magniom/target-engine - Redundancy Framework v2: Comparator
 * Conforms to MAGNIOM-Target Engine & Ranking Algorithm Specification v2.0 (§98-105)
 */

import type { CandidateDraft, RedundancyAssessment } from '@magniom/domain';

export function assessRedundancy(
  candA: CandidateDraft,
  candB: CandidateDraft,
  spatialThresholdMm = 15.0,
): RedundancyAssessment {
  // If target families are fundamentally distinct and non-comparable
  if (candA.targetFamilyId !== candB.targetFamilyId) {
    return {
      candidateAId: candA.draftId,
      candidateBId: candB.draftId,
      comparability: 'not_comparable',
      metric: 'euclidean',
      distanceOrOverlap: 999.0,
      isRedundant: false,
      interpretation: 'Candidates belong to different target families; both clinically distinct.',
    };
  }

  // Point-to-point Euclidean comparison
  if (
    candA.targetGeometry.geometryType === 'point' &&
    candB.targetGeometry.geometryType === 'point' &&
    candA.targetGeometry.centre &&
    candB.targetGeometry.centre
  ) {
    const c1 = candA.targetGeometry.centre;
    const c2 = candB.targetGeometry.centre;
    const dx = c1.x - c2.x;
    const dy = c1.y - c2.y;
    const dz = c1.z - c2.z;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    const isRedundant = dist < spatialThresholdMm;

    return {
      candidateAId: candA.draftId,
      candidateBId: candB.draftId,
      comparability: 'comparable',
      metric: 'euclidean',
      distanceOrOverlap: Math.round(dist * 10) / 10,
      isRedundant,
      interpretation: isRedundant
        ? `Spatial proximity (${Math.round(dist * 10) / 10}mm < ${spatialThresholdMm}mm) constitutes clinical redundancy.`
        : `Spatial separation (${Math.round(dist * 10) / 10}mm >= ${spatialThresholdMm}mm) provides distinct hypotheses.`,
    };
  }

  return {
    candidateAId: candA.draftId,
    candidateBId: candB.draftId,
    comparability: 'comparable',
    metric: 'roi_overlap',
    distanceOrOverlap: 0,
    isRedundant: false,
    interpretation: 'Non-point geometries non-overlapping.',
  };
}
