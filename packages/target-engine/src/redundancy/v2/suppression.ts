/**
 * @magniom/target-engine - Redundancy Framework v2: Candidate Suppression
 * Conforms to MAGNIOM-Target Engine & Ranking Algorithm Specification v2.0 (§98-105, 114)
 * and Section 21 Exit Criterion 7 ("suppressed candidates remain reconstructable")
 */

import type { CandidateDraft, RedundancyAssessment } from '@magniom/domain';
import { assessRedundancy } from './comparator.js';

export interface RedundancySuppressionResult {
  readonly survivingCandidates: readonly CandidateDraft[];
  readonly suppressedCandidates: readonly CandidateDraft[];
  readonly redundancyAssessments: readonly RedundancyAssessment[];
  readonly redundancyMap: ReadonlyMap<string, readonly string[]>;
}

export function suppressRedundantCandidatesV2(
  candidates: readonly CandidateDraft[],
  spatialThresholdMm = 15.0,
): RedundancySuppressionResult {
  const surviving: CandidateDraft[] = [];
  const suppressed: CandidateDraft[] = [];
  const assessments: RedundancyAssessment[] = [];
  const redundancyMap = new Map<string, string[]>();

  for (const cand of candidates) {
    let isRedundantWithExisting = false;

    for (const kept of surviving) {
      const assessment = assessRedundancy(kept, cand, spatialThresholdMm);
      assessments.push(assessment);

      if (assessment.isRedundant) {
        isRedundantWithExisting = true;

        const list = redundancyMap.get(cand.draftId) ?? [];
        list.push(kept.draftId);
        redundancyMap.set(cand.draftId, list);
        break;
      }
    }

    if (isRedundantWithExisting) {
      suppressed.push(cand);
    } else {
      surviving.push(cand);
    }
  }

  return {
    survivingCandidates: surviving,
    suppressedCandidates: suppressed,
    redundancyAssessments: assessments,
    redundancyMap,
  };
}
