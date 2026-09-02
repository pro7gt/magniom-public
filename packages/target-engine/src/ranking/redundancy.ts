/**
 * Redundancy Suppression & Conflict Resolution
 * Conforms to MAGNIOM-Target Engine & Ranking Algorithm Specification v1.0, Section 82–89.
 * Identifies spatial and mechanistic redundancy and suppresses duplicate candidates.
 */

import type { TargetCandidate } from '@magniom/domain';

export function calculateMniDistanceMm(c1: TargetCandidate, c2: TargetCandidate): number {
  const dx = c1.mniCoordinate.x - c2.mniCoordinate.x;
  const dy = c1.mniCoordinate.y - c2.mniCoordinate.y;
  const dz = c1.mniCoordinate.z - c2.mniCoordinate.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function suppressRedundantCandidates(
  candidates: readonly TargetCandidate[],
  spatialThresholdMm = 10.0,
): { activeCandidates: TargetCandidate[]; suppressedCandidates: TargetCandidate[] } {
  const activeCandidates: TargetCandidate[] = [];
  const suppressedCandidates: TargetCandidate[] = [];

  // Sort candidates: qualified connectome candidates first, then overallScore descending
  const sorted = [...candidates].sort((a, b) => {
    if (!a.isSuppressedOrRedundant && !b.isSuppressedOrRedundant) {
      if (a.method === 'CONNECTOME_REFINED' && b.method === 'EVIDENCE_ONLY_PRIOR') return -1;
      if (b.method === 'CONNECTOME_REFINED' && a.method === 'EVIDENCE_ONLY_PRIOR') return 1;
    }
    if (b.overallScore !== a.overallScore) return b.overallScore - a.overallScore;
    return b.evidenceScore - a.evidenceScore;
  });

  for (const candidate of sorted) {
    // If already suppressed due to reliability or incremental value
    if (candidate.isSuppressedOrRedundant) {
      suppressedCandidates.push(candidate);
      continue;
    }

    // Check if redundant with any already active candidate
    const redundantWith = activeCandidates.find(active => {
      // Must share family or circuit or be within spatial threshold
      const distance = calculateMniDistanceMm(candidate, active);
      const sameCircuitOrFamily =
        candidate.circuitId === active.circuitId || candidate.familyId === active.familyId;

      // If one is refined and the other is evidence only prior for the primary DLPFC anchor, preserve as counterfactual
      if (
        (active.method === 'CONNECTOME_REFINED' &&
          candidate.method === 'EVIDENCE_ONLY_PRIOR' &&
          candidate.familyId === 'TF-MDD-LDLPFC-EST-001') ||
        (active.method === 'EVIDENCE_ONLY_PRIOR' &&
          candidate.method === 'CONNECTOME_REFINED' &&
          active.familyId === 'TF-MDD-LDLPFC-EST-001')
      ) {
        return false;
      }

      return distance < spatialThresholdMm && sameCircuitOrFamily;
    });

    if (redundantWith) {
      suppressedCandidates.push({
        ...candidate,
        isSuppressedOrRedundant: true,
        suppressionReason: 'REDUNDANT_ANATOMICAL' as const,
      });
    } else {
      activeCandidates.push(candidate);
    }
  }

  return { activeCandidates, suppressedCandidates };
}
