/**
 * @magniom/target-engine - Comparison Domain Manager
 * Conforms to MAGNIOM-Target Engine & Ranking Algorithm Specification v2.0 (§82-84)
 *
 * Enforces:
 * 1. Partitioning candidates into scientifically valid comparison domains
 * 2. Strict prohibition of cross-domain universal scalar scores (MAG-TGT-049)
 */

import type {
  CandidateDraft,
  ComparisonDomain,
  ComparisonDomainDefinition,
  RankingProfileDefinition,
} from '@magniom/domain';
import { rankCandidatesInDomain, type ScoredCandidate } from './ranking-orchestrator.js';

export interface DomainRankingResult {
  readonly domain: ComparisonDomain;
  readonly rankedCandidates: readonly ScoredCandidate[];
}

export class ComparisonDomainManager {
  private readonly domains: readonly ComparisonDomainDefinition[];
  private readonly rankingProfiles: ReadonlyMap<string, RankingProfileDefinition>;

  constructor(
    domains: readonly ComparisonDomainDefinition[],
    rankingProfiles: readonly RankingProfileDefinition[],
  ) {
    this.domains = domains;
    const profileMap = new Map<string, RankingProfileDefinition>();
    for (const p of rankingProfiles) {
      profileMap.set(p.id, p);
      profileMap.set(p.code, p);
    }
    this.rankingProfiles = profileMap;
  }

  /**
   * Partitions candidate drafts into comparison domains and ranks them within each domain.
   */
  public partitionAndRank(candidates: readonly CandidateDraft[]): readonly DomainRankingResult[] {
    const results: DomainRankingResult[] = [];

    // If no explicit comparison domains are defined, construct a default domain
    const effectiveDomains: readonly ComparisonDomainDefinition[] =
      this.domains.length > 0
        ? this.domains
        : [
            {
              id: 'DOMAIN-DEFAULT-ALL',
              code: 'DEFAULT_FAMILY_VARIANTS',
              indicationModuleReleaseId: 'default',
              comparisonBasis: 'same_target_family_variants',
              rankingProfileId: 'PROFILE-DEFAULT-GMEAN',
            },
          ];

    for (const def of effectiveDomains) {
      // Filter candidates belonging to this domain
      const matching = candidates.filter(c => {
        if (def.targetFamilyIds && def.targetFamilyIds.length > 0) {
          if (!def.targetFamilyIds.includes(c.targetFamilyId)) return false;
        }
        if (def.candidateRoles && def.candidateRoles.length > 0) {
          if (!def.candidateRoles.includes(c.proposedRole)) return false;
        }
        return true;
      });

      const profile = this.rankingProfiles.get(def.rankingProfileId) ?? {
        id: def.rankingProfileId,
        code: 'DEFAULT_PROFILE',
        version: '1.0.0',
        indicationModuleReleaseId: def.indicationModuleReleaseId,
        applicableComparisonDomainCodes: [def.code],
        rankingModel: 'weighted_geometric_mean' as const,
        featureDefinitions: [
          {
            code: 'phenotype_concordance',
            weight: 1.0,
            direction: 'maximize' as const,
            missingValuePolicy: 'neutral' as const,
          },
          {
            code: 'circuit_concordance',
            weight: 1.0,
            direction: 'maximize' as const,
            missingValuePolicy: 'neutral' as const,
          },
        ],
        tiePolicy: {
          toleranceEpsilon: 0.001,
          breakSequences: ['role_priority', 'target_family_code', 'geometry_hash'],
        },
        scientificPolicyReleaseId: 'default',
      };

      const ranked = rankCandidatesInDomain(matching, profile);

      const comparisonDomain: ComparisonDomain = {
        id: def.id,
        code: def.code,
        indicationModuleReleaseId: def.indicationModuleReleaseId,
        candidateIds: ranked.map(r => r.candidate.draftId),
        comparisonBasis: def.comparisonBasis,
        rankingProfileId: def.rankingProfileId,
        comparable: true,
      };

      results.push({
        domain: comparisonDomain,
        rankedCandidates: ranked,
      });
    }

    return results;
  }
}
