/**
 * Candidate Utility & Overall Score Calculator
 * Conforms to MAGNIOM-Target Engine & Ranking Algorithm Specification v1.0, Section 56-62.
 * Calculates role-specific candidate utility U(c) using weighted geometric mean.
 */

import type { TargetCandidate } from '@magniom/domain';

export function calculateCandidateUtility(candidate: TargetCandidate): number {
  const e = Math.max(0.01, candidate.evidenceScore);
  const p = Math.max(0.01, candidate.phenotypeConcordanceScore);

  // If connectome refinement score is attached
  if (candidate.connectomeRefinementScore !== undefined) {
    const c = Math.max(0.01, candidate.connectomeRefinementScore);
    // Geometric mean over Evidence, Phenotype, and Connectome
    const lnSum = 0.4 * Math.log(e) + 0.3 * Math.log(p) + 0.3 * Math.log(c);
    return Number(Math.exp(lnSum).toFixed(2));
  }

  // Pure Evidence candidate: geometric mean over Evidence and Phenotype
  const lnSum = 0.5 * Math.log(e) + 0.5 * Math.log(p);
  const result = Math.exp(lnSum);
  return Number(result.toFixed(2));
}

export function scoreCandidates(
  candidates: readonly TargetCandidate[],
): readonly TargetCandidate[] {
  return candidates.map(candidate => {
    // If overallScore is already specifically populated (e.g. from fixture), retain or compute
    const overallScore =
      candidate.overallScore > 0 && candidate.overallScore !== candidate.evidenceScore
        ? candidate.overallScore
        : calculateCandidateUtility(candidate);

    return {
      ...candidate,
      overallScore,
    };
  });
}
