/**
 * Clinical Coverage Profile Calculator
 * Conforms to MAGNIOM-Canonical Target Data Specification v1.0, Section 57 & Target Engine Spec Section 80.
 * Computes coverage across confirmed clinical priority domains.
 */

import type { ClinicalCoverageProfile, PhenotypeSnapshot, TargetCandidate } from '@magniom/domain';

export function calculateClinicalCoverageProfile(
  primaryCandidates: readonly TargetCandidate[],
  additionalCandidates: readonly TargetCandidate[],
  phenotype: PhenotypeSnapshot,
): ClinicalCoverageProfile {
  const priorities =
    phenotype.symptomPriorities && phenotype.symptomPriorities.length > 0
      ? phenotype.symptomPriorities
      : [
          {
            domainCode: 'DOMAIN-MDD-DYSPHORIC-001',
            priorityRank: 1,
            clinicianWeight: phenotype.symptomScores?.dysphoriaScore ?? 0.9,
            evidenceMappability: 'direct' as const,
          },
        ];

  const sortedPriorities = [...priorities].sort((a, b) => a.priorityRank - b.priorityRank);
  const primaryDomain = sortedPriorities[0]?.domainCode ?? 'DOMAIN-MDD-DYSPHORIC-001';

  // Check which domains are covered by the selected active candidates
  const secondaryDomains: string[] = [];
  for (let i = 1; i < sortedPriorities.length; i++) {
    const priority = sortedPriorities[i];
    if (!priority) continue;
    const domain = priority.domainCode;
    // Check if any primary or additional candidate covers this domain
    const isCovered = [...primaryCandidates, ...additionalCandidates].some(c => {
      if (
        domain === 'DOMAIN-MDD-DYSPHORIC-001' &&
        (c.circuitId?.includes('LDLPFC') || c.familyId?.includes('LDLPFC'))
      ) {
        return true;
      }
      if (
        domain === 'DOMAIN-MDD-ANXIOSOMATIC-001' &&
        (c.circuitId?.includes('ANXIOSOMATIC') || c.familyId?.includes('ANXIOSOMATIC'))
      ) {
        return true;
      }
      return false;
    });

    if (isCovered) {
      secondaryDomains.push(domain);
    }
  }

  // Calculate overall clinical coverage score
  const primary1 = primaryCandidates[0];
  const overallClinicalCoverageScore = primary1 ? primary1.phenotypeConcordanceScore : 0.0;

  return {
    primaryDomainCovered: primaryDomain,
    secondaryDomainsCovered: secondaryDomains,
    overallClinicalCoverageScore: Number(overallClinicalCoverageScore.toFixed(2)),
  };
}
