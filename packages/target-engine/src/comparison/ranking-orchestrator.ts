/**
 * @magniom/target-engine - Comparison Domain Ranking Orchestrator
 * Conforms to MAGNIOM-Target Engine & Ranking Algorithm Specification v2.0 (§85-89)
 */

import type { CandidateDraft, RankingProfileDefinition } from '@magniom/domain';
import { breakTiesDeterministically, type ScoredCandidate } from './ties.js';

export type { ScoredCandidate };

export function calculateCandidateDomainScore(
  candidate: CandidateDraft,
  profile: RankingProfileDefinition,
): { score: number; features: Record<string, number> } {
  const featureMap: Record<string, number> = {};

  for (const rawFeat of candidate.rawScientificFeatures) {
    featureMap[rawFeat.code] = rawFeat.value;
  }

  if (profile.rankingModel === 'weighted_geometric_mean') {
    let sumWeightedLog = 0;
    let sumWeight = 0;
    const epsilon = 1e-4;

    for (const def of profile.featureDefinitions) {
      let val = featureMap[def.code];
      if (val === undefined || isNaN(val)) {
        if (def.missingValuePolicy === 'zero') {
          val = 0;
        } else if (def.missingValuePolicy === 'neutral') {
          val = 0.5;
        } else {
          // reject candidate policy
          return { score: 0, features: featureMap };
        }
      }

      const clamped = Math.min(1.0, Math.max(epsilon, val));
      sumWeightedLog += def.weight * Math.log(clamped);
      sumWeight += def.weight;
    }

    const score = sumWeight > 0 ? Math.exp(sumWeightedLog / sumWeight) : 0;
    return { score, features: featureMap };
  }

  if (profile.rankingModel === 'lexicographic') {
    // Score based on primary feature weight, then second
    let score = 0;
    let factor = 1.0;
    for (const def of profile.featureDefinitions) {
      const val = featureMap[def.code] ?? 0;
      score += val * factor;
      factor *= 0.1;
    }
    return { score, features: featureMap };
  }

  // Ordered rules fallback: simple weighted average
  let totalScore = 0;
  let totalWeight = 0;
  for (const def of profile.featureDefinitions) {
    const val = featureMap[def.code] ?? 0;
    totalScore += val * def.weight;
    totalWeight += def.weight;
  }
  const score = totalWeight > 0 ? totalScore / totalWeight : 0;
  return { score, features: featureMap };
}

export function rankCandidatesInDomain(
  candidates: readonly CandidateDraft[],
  profile: RankingProfileDefinition,
): readonly ScoredCandidate[] {
  if (candidates.length === 0) return [];

  const scored: ScoredCandidate[] = candidates.map(cand => {
    const res = calculateCandidateDomainScore(cand, profile);
    return {
      candidate: cand,
      score: res.score,
      rankingFeatures: res.features,
    };
  });

  // Sort deterministically with tie policy
  scored.sort((a, b) => breakTiesDeterministically(a, b, profile.tiePolicy));

  // Mark scientific ties
  return scored.map((item, idx) => {
    const prev = idx > 0 ? scored[idx - 1] : undefined;
    const isTie =
      prev !== undefined && Math.abs(item.score - prev.score) <= profile.tiePolicy.toleranceEpsilon;
    return {
      ...item,
      isScientificTieWithPrevious: isTie,
    };
  });
}
