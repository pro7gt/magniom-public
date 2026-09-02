/**
 * Target Slate Invariants Validator
 * Conforms to MAGNIOM-Canonical Target Data Specification v1.0, Section 54–55 & Target Engine Spec Section 161.
 */

import type { TargetSlate } from '@magniom/domain';

export interface InvariantValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export function validateSlateInvariants(slate: TargetSlate): InvariantValidationResult {
  const errors: string[] = [];

  // If abstained, verify no active candidates
  if (slate.abstentionReason || slate.abstentionProfile?.hasAbstained) {
    if (slate.primaryCandidates.length > 0 || slate.additionalCandidates.length > 0) {
      errors.push('Abstained Target Slate must have 0 primary and 0 additional candidates.');
    }
  } else {
    // 1. Primary candidate count bounds: 1 <= primary <= 3
    if (slate.primaryCandidates.length < 1 || slate.primaryCandidates.length > 3) {
      errors.push(`Primary candidate count (${slate.primaryCandidates.length}) must be between 1 and 3.`);
    }

    // 2. Additional candidate count bounds: 0 <= additional <= 2
    if (slate.additionalCandidates.length > 2) {
      errors.push(`Additional candidate count (${slate.additionalCandidates.length}) exceeds maximum limit of 2.`);
    }
  }

  // 3. Coordinate validity & score ranges for all candidates
  const allCandidates = [...slate.primaryCandidates, ...slate.additionalCandidates, ...slate.suppressedCandidates];
  for (const candidate of allCandidates) {
    if (typeof candidate.mniCoordinate.x !== 'number' || typeof candidate.mniCoordinate.y !== 'number' || typeof candidate.mniCoordinate.z !== 'number') {
      errors.push(`Candidate '${candidate.id}' has invalid non-numeric MNI coordinate.`);
    }

    if (candidate.overallScore < 0.0 || candidate.overallScore > 1.0) {
      errors.push(`Candidate '${candidate.id}' overallScore (${candidate.overallScore}) is outside [0.0, 1.0].`);
    }

    if (candidate.evidenceScore < 0.0 || candidate.evidenceScore > 1.0) {
      errors.push(`Candidate '${candidate.id}' evidenceScore (${candidate.evidenceScore}) is outside [0.0, 1.0].`);
    }

    if (candidate.phenotypeConcordanceScore < 0.0 || candidate.phenotypeConcordanceScore > 1.0) {
      errors.push(`Candidate '${candidate.id}' phenotypeConcordanceScore (${candidate.phenotypeConcordanceScore}) is outside [0.0, 1.0].`);
    }
  }

  // 4. SHA-256 hash format (64 hex characters)
  if (!/^[a-f0-9]{64}$/i.test(slate.deterministicManifestHash)) {
    errors.push(`deterministicManifestHash '${slate.deterministicManifestHash}' is not a valid 64-character SHA-256 hex string.`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
