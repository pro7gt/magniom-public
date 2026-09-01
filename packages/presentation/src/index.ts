/**
 * @magniom/presentation
 * View models and formatting utilities for UI components.
 * Conforms to MAGNIOM-Clinician Workspace & UX Specification v1.0.
 */

import type { TargetCandidate, MniCoordinate } from '@magniom/domain';

export interface TargetCandidateViewModel {
  readonly id: string;
  readonly roleLabel: string;
  readonly targetName: string;
  readonly coordinateFormatted: string;
  readonly evidenceTierLabel: string;
  readonly confidenceScorePercentage: string;
  readonly rationale: string;
  readonly hasConflicts: boolean;
}

export function formatMniCoordinate(coord: MniCoordinate): string {
  return `(${coord.x >= 0 ? '+' : ''}${coord.x}, ${coord.y >= 0 ? '+' : ''}${coord.y}, ${coord.z >= 0 ? '+' : ''}${coord.z})`;
}

export function toCandidateViewModel(candidate: TargetCandidate): TargetCandidateViewModel {
  const roleMap: Record<string, string> = {
    PRIMARY_1: 'Primary Candidate 1',
    PRIMARY_2: 'Primary Candidate 2',
    PRIMARY_3: 'Primary Candidate 3',
    ADDITIONAL_A: 'Additional Candidate A',
    ADDITIONAL_B: 'Additional Candidate B',
    RESERVE: 'Reserve Candidate',
  };

  return {
    id: candidate.id,
    roleLabel: roleMap[candidate.role] ?? candidate.role,
    targetName: candidate.familyId,
    coordinateFormatted: formatMniCoordinate(candidate.mniCoordinate),
    evidenceTierLabel: `Tier ${candidate.evidenceTier}`,
    confidenceScorePercentage: `${Math.round(candidate.overallScore * 100)}%`,
    rationale: candidate.rationale,
    hasConflicts: candidate.contraindicationsOrConflicts.length > 0,
  };
}
