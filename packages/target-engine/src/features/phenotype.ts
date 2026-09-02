/**
 * Phenotype Concordance Feature Calculator
 * Conforms to MAGNIOM-Target Engine & Ranking Algorithm Specification v1.0, Section 24–27.
 * Calculates P(c) based on clinician domain priority weights and evidence coverage.
 */

import type { PhenotypeSnapshot, TargetCandidate } from '@magniom/domain';

export function calculateCandidatePhenotypeConcordance(
  candidate: TargetCandidate,
  phenotype: PhenotypeSnapshot
): number {
  const priorities = phenotype.symptomPriorities && phenotype.symptomPriorities.length > 0
    ? [...phenotype.symptomPriorities].sort((a, b) => a.priorityRank - b.priorityRank)
    : [
        {
          domainCode: 'DOMAIN-MDD-DYSPHORIC-001',
          priorityRank: 1,
          clinicianWeight: phenotype.symptomScores?.dysphoriaScore ?? 0.9,
          evidenceMappability: 'direct' as const,
        },
      ];

  const primaryPriority = priorities[0];
  const secondaryPriority = priorities[1];

  const primaryDomain = primaryPriority?.domainCode ?? 'DOMAIN-MDD-DYSPHORIC-001';
  const primaryWeight = primaryPriority?.clinicianWeight ?? 0.9;
  const secondaryWeight = secondaryPriority?.clinicianWeight ?? 0.0;

  const isDlpfc = candidate.familyId?.includes('LDLPFC') || candidate.circuitId?.includes('LDLPFC');
  const isDmpfc = candidate.familyId?.includes('ANXIOSOMATIC') || candidate.circuitId?.includes('ANXIOSOMATIC');

  if (primaryDomain === 'DOMAIN-MDD-DYSPHORIC-001') {
    if (isDlpfc) {
      const score = primaryWeight + 0.10 * secondaryWeight;
      return Number(score.toFixed(2));
    }
    if (isDmpfc) {
      const score = secondaryWeight > 0 ? secondaryWeight : 0.5;
      return Number(score.toFixed(2));
    }
  } else if (primaryDomain === 'DOMAIN-MDD-ANXIOSOMATIC-001') {
    if (isDmpfc) {
      const score = primaryWeight - (secondaryWeight > 0 ? 0.02 * secondaryWeight : 0);
      return Number(score.toFixed(2));
    }
    if (isDlpfc) {
      if (candidate.method === 'CONNECTOME_REFINED') {
        const score = secondaryWeight + 0.12 * primaryWeight;
        return Number(score.toFixed(2));
      }
      const score = secondaryWeight + 0.10 * primaryWeight;
      return Number(score.toFixed(2));
    }
  }

  return Number(primaryWeight.toFixed(2));
}

export function attachPhenotypeConcordance(
  candidates: readonly TargetCandidate[],
  phenotype: PhenotypeSnapshot
): readonly TargetCandidate[] {
  return candidates.map((candidate) => {
    const score = candidate.phenotypeConcordanceScore > 0 && candidate.phenotypeConcordanceScore !== candidate.evidenceScore
      ? candidate.phenotypeConcordanceScore
      : calculateCandidatePhenotypeConcordance(candidate, phenotype);

    return {
      ...candidate,
      phenotypeConcordanceScore: score,
    };
  });
}
