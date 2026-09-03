/**
 * @magniom/target-engine - Scientific Ties & Deterministic Tie-Breaking
 * Conforms to MAGNIOM-Target Engine & Ranking Algorithm Specification v2.0 (§122-124)
 */

import type { CandidateDraft, TiePolicy } from '@magniom/domain';
import { computeSha256, canonicalJsonStringify } from '@magniom/scientific-policy';

export interface ScoredCandidate {
  readonly candidate: CandidateDraft;
  readonly score: number;
  readonly rankingFeatures: Readonly<Record<string, number>>;
  readonly isScientificTieWithPrevious?: boolean | undefined;
}

export function breakTiesDeterministically(
  a: ScoredCandidate,
  b: ScoredCandidate,
  tiePolicy: TiePolicy,
): number {
  const diff = Math.abs(a.score - b.score);

  if (diff > tiePolicy.toleranceEpsilon) {
    return b.score - a.score; // Higher score first
  }

  // Candidates are in a scientific tie; use deterministic tie-breaking hierarchy
  for (const seq of tiePolicy.breakSequences) {
    if (seq === 'role_priority') {
      const roleOrder: Record<string, number> = {
        evidence_anchor: 1,
        connectome_refinement: 2,
        somatotopic_target: 3,
        phenotype_specific: 4,
        ipsilesional_strategy: 5,
        contralesional_strategy: 6,
        field_target: 7,
        clinical_alternative: 8,
        network_alternative: 9,
        research_hypothesis: 10,
      };
      const orderA = roleOrder[a.candidate.proposedRole] ?? 99;
      const orderB = roleOrder[b.candidate.proposedRole] ?? 99;
      if (orderA !== orderB) {
        return orderA - orderB;
      }
    } else if (seq === 'target_family_code') {
      const cmp = a.candidate.targetFamilyId.localeCompare(b.candidate.targetFamilyId);
      if (cmp !== 0) return cmp;
    } else if (seq === 'geometry_hash') {
      const hashA = computeSha256(canonicalJsonStringify(a.candidate.targetGeometry));
      const hashB = computeSha256(canonicalJsonStringify(b.candidate.targetGeometry));
      const cmp = hashA.localeCompare(hashB);
      if (cmp !== 0) return cmp;
    }
  }

  // Ultimate deterministic fallback: draftId string comparison
  return a.candidate.draftId.localeCompare(b.candidate.draftId);
}
