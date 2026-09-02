import type { PhenotypeSnapshot } from '@magniom/domain';
import { validatePhenotypeSnapshot } from '@magniom/schemas';
import { computeSha256, canonicalJsonStringify } from '@magniom/scientific-policy';

export { canonicalJsonStringify };

export interface PhenotypeScoreWeights {
  readonly dysphoriaWeight: number;
  readonly anhedoniaWeight: number;
  readonly anxiousSomaticWeight: number;
  readonly ruminationWeight: number;
}

/**
 * Computes deterministic SHA-256 seal for an approved PhenotypeSnapshot
 */
export function computePhenotypeSnapshotHash(snapshot: PhenotypeSnapshot): string {
  // Strip mutable/transient fields from the sealed payload
  const { snapshotHash, ...canonicalPayload } = snapshot;
  return computeSha256(canonicalPayload);
}

/**
 * Validates that a phenotype snapshot satisfies Clinical Mode targeting entry criteria
 */
export function validatePhenotypeForClinicalTargeting(snapshot: PhenotypeSnapshot): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  try {
    validatePhenotypeSnapshot(snapshot);
  } catch (err) {
    errors.push(`Schema validation failed: ${err instanceof Error ? err.message : String(err)}`);
  }

  if (!snapshot.confirmedByClinicianId || snapshot.confirmedByClinicianId.trim().length === 0) {
    errors.push('MAG-CLI-001 violation: Clinical Mode requires an authorised clinician signature.');
  }

  if (snapshot.safetyClearance === 'contraindicated') {
    errors.push('Safety violation: Patient is contraindicated for TMS.');
  }

  if (!snapshot.primaryDiagnosis || snapshot.primaryDiagnosis.trim().length === 0) {
    errors.push('Clinical violation: Primary diagnosis is required.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function calculateDominantSymptomDomain(snapshot: PhenotypeSnapshot): string {
  const scores = [
    { domain: 'DYSPHORIA', score: snapshot.symptomScores.dysphoriaScore },
    { domain: 'ANHEDONIA', score: snapshot.symptomScores.anhedoniaScore },
    { domain: 'ANXIOUS_SOMATIC', score: snapshot.symptomScores.anxiousSomaticScore },
    { domain: 'RUMINATION', score: snapshot.symptomScores.ruminationScore },
  ];

  scores.sort((a, b) => b.score - a.score);
  return scores[0]?.domain ?? 'DYSPHORIA';
}

export const FROZEN_PHENOTYPE_ONTOLOGY_VERSION = 'MAGNIOM-PHENOTYPE-1.0.0';

export interface FrozenPhenotypeOntologyBundle {
  readonly ontologyVersion: string;
  readonly semanticVersion: string;
  readonly status: string;
  readonly releaseTimestamp: string;
  readonly title: string;
  readonly indications: readonly any[];
  readonly symptomDimensions: readonly any[];
  readonly supportedScales: readonly any[];
  readonly verificationSignature: string;
}

export function verifyPhenotypeOntologyIntegrity(bundle: FrozenPhenotypeOntologyBundle): boolean {
  return (
    bundle.ontologyVersion === FROZEN_PHENOTYPE_ONTOLOGY_VERSION &&
    bundle.status === 'FROZEN' &&
    Array.isArray(bundle.symptomDimensions) &&
    bundle.symptomDimensions.length >= 4 &&
    bundle.verificationSignature.length > 0
  );
}

