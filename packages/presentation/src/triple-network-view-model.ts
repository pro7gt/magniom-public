/**
 * @magniom/presentation - Triple-Network Systems Layer View Models
 * Conforms to MAGNIOM-Triple-Network Systems Layer v1.0 (§73–80)
 *
 * Rules:
 * - Pure presentation mapping: strictly displays resolved domain data.
 * - Does not perform scientific calculations, re-ranking, or target generation.
 * - Enforces progressive disclosure:
 *     Level 1: Summary badge + Primary relationship overview + Reliability badge + Non-causal disclaimer.
 *     Level 2: Detailed pairwise metrics, z-scores, segregation indices, normative distributions, parcel breakdown.
 *     Level 3: Full audit trail, profile SHA-256 hash, raw parcels, processing parameters, evidence citation links.
 * - Mandatory non-causal disclaimer present in all representations.
 */

import type {
  TripleNetworkProfile,
  NetworkState,
  NetworkRelationshipState,
  NetworkReliabilityProfile,
  NetworkOverallReliabilityStatus,
  TripleNetworkProfileClinicalAuthority,
  NetworkRelationshipCode,
} from '@magniom/domain';

export const TRIPLE_NETWORK_NON_CAUSAL_DISCLAIMER =
  'Triple-network metrics represent observational functional connectivity and systems-level context. They do not constitute autonomous diagnostic or therapeutic directives, and cannot independently dictate target selection or override evidence-based clinical indications.';

export interface NetworkNodeDisplayViewModel {
  readonly code: 'CEN' | 'DMN' | 'SN';
  readonly name: string;
  readonly integrityFormatted: string;
  readonly status: string;
  readonly interpretation: string;
  readonly statusBadgeColor: string;
}

export interface NetworkRelationshipDisplayViewModel {
  readonly code: NetworkRelationshipCode;
  readonly name: string;
  readonly couplingFormatted: string;
  readonly segregationFormatted: string;
  readonly status: string;
  readonly interpretation: string;
  readonly badgeColor: string;
}

export interface ReliabilityDisplayViewModel {
  readonly status: NetworkOverallReliabilityStatus;
  readonly label: string;
  readonly badgeClass: string;
  readonly clinicalQualification: string;
  readonly limitingFactors: readonly string[];
  readonly hasWarnings: boolean;
}

export interface EvidenceContextDisplayViewModel {
  readonly supportingClaimIds: readonly string[];
  readonly negativeClaimIds: readonly string[];
  readonly conflictingClaimIds: readonly string[];
  readonly evidenceLevelCeiling: string;
  readonly applicability: string;
  readonly interpretation: string;
}

export interface TripleNetworkProfileViewModel {
  readonly profileId: string;
  readonly profileHash: string;
  readonly version: string;
  readonly clinicalAuthority: TripleNetworkProfileClinicalAuthority;
  readonly clinicalAuthorityLabel: string;
  readonly nonCausalDisclaimer: string;
  readonly networks: {
    readonly cen: NetworkNodeDisplayViewModel;
    readonly dmn: NetworkNodeDisplayViewModel;
    readonly sn: NetworkNodeDisplayViewModel;
  };
  readonly relationships: {
    readonly cen_dmn: NetworkRelationshipDisplayViewModel;
    readonly sn_cen: NetworkRelationshipDisplayViewModel;
    readonly sn_dmn: NetworkRelationshipDisplayViewModel;
  };
  readonly globalIntegrationFormatted?: string | undefined;
  readonly globalSegregationFormatted?: string | undefined;
  readonly reliability: ReliabilityDisplayViewModel;
  readonly evidenceContext: EvidenceContextDisplayViewModel;
  readonly interpretationSummary: string;
  readonly interpretationConfidence: string;
  readonly supportingFacts: readonly string[];
  readonly contradictoryFacts: readonly string[];
  readonly limitations: readonly string[];
}

function formatNumber(val: number | undefined, decimals = 3): string {
  if (val === undefined || Number.isNaN(val)) return 'N/A';
  const sign = val > 0 ? '+' : '';
  return `${sign}${val.toFixed(decimals)}`;
}

function mapNetworkNode(node: NetworkState): NetworkNodeDisplayViewModel {
  let statusBadgeColor = 'badge-success';
  if (node.status === 'altered' || node.status === 'hypoconnected') {
    statusBadgeColor = 'badge-warning';
  } else if (node.status === 'hyperconnected') {
    statusBadgeColor = 'badge-tier2';
  } else if (node.status === 'uncertain') {
    statusBadgeColor = 'badge-neutral';
  }

  return {
    code: node.code,
    name: node.name,
    integrityFormatted: formatNumber(node.within_network_integrity),
    status: node.status,
    interpretation: node.interpretation,
    statusBadgeColor,
  };
}

function mapRelationship(rel: NetworkRelationshipState): NetworkRelationshipDisplayViewModel {
  let badgeColor = 'badge-success';
  if (rel.status === 'altered' || rel.status === 'hypocoupled') {
    badgeColor = 'badge-warning';
  } else if (rel.status === 'hypercoupled') {
    badgeColor = 'badge-tier2';
  } else if (rel.status === 'uncertain') {
    badgeColor = 'badge-neutral';
  }

  return {
    code: rel.relationship_code,
    name: rel.name,
    couplingFormatted: formatNumber(rel.coupling_value),
    segregationFormatted: formatNumber(rel.segregation_index),
    status: rel.status,
    interpretation: rel.interpretation,
    badgeColor,
  };
}

function mapReliability(rel: NetworkReliabilityProfile): ReliabilityDisplayViewModel {
  let badgeClass = 'badge-reliability-high';
  if (rel.overall_status === 'moderate') {
    badgeClass = 'badge-reliability-moderate';
  } else if (rel.overall_status === 'limited') {
    badgeClass = 'badge-reliability-low';
  } else if (rel.overall_status === 'insufficient') {
    badgeClass = 'badge-reliability-unusable';
  }

  const limitingFactors: string[] = [
    ...rel.acquisition_quality.limiting_factors,
    ...rel.preprocessing_reliability.limiting_factors,
    ...rel.within_network_reliability.limiting_factors,
  ];

  return {
    status: rel.overall_status,
    label: rel.overall_status.toUpperCase(),
    badgeClass,
    clinicalQualification: rel.clinical_qualification,
    limitingFactors,
    hasWarnings:
      limitingFactors.length > 0 ||
      rel.overall_status === 'limited' ||
      rel.overall_status === 'insufficient',
  };
}

export function buildTripleNetworkViewModel(
  profile: TripleNetworkProfile,
): TripleNetworkProfileViewModel {
  return {
    profileId: profile.id,
    profileHash: profile.profile_hash,
    version: profile.version,
    clinicalAuthority: profile.clinical_authority,
    clinicalAuthorityLabel:
      profile.clinical_authority === 'contextual'
        ? 'Contextual Systems Observation Only (Non-Directive)'
        : profile.clinical_authority === 'qualified_contextual'
          ? 'Qualified Contextual (Adjunctive Systems Context)'
          : 'Research Observation Only (Exploratory)',
    nonCausalDisclaimer: TRIPLE_NETWORK_NON_CAUSAL_DISCLAIMER,
    networks: {
      cen: mapNetworkNode(profile.cen),
      dmn: mapNetworkNode(profile.dmn),
      sn: mapNetworkNode(profile.sn),
    },
    relationships: {
      cen_dmn: mapRelationship(profile.cen_dmn),
      sn_cen: mapRelationship(profile.sn_cen),
      sn_dmn: mapRelationship(profile.sn_dmn),
    },
    globalIntegrationFormatted:
      profile.global_integration !== undefined
        ? formatNumber(profile.global_integration)
        : undefined,
    globalSegregationFormatted:
      profile.global_segregation !== undefined
        ? formatNumber(profile.global_segregation)
        : undefined,
    reliability: mapReliability(profile.reliability),
    evidenceContext: {
      supportingClaimIds: profile.evidence_context.supporting_claim_ids,
      negativeClaimIds: profile.evidence_context.negative_claim_ids,
      conflictingClaimIds: profile.evidence_context.conflicting_claim_ids,
      evidenceLevelCeiling: profile.evidence_context.evidence_level_ceiling,
      applicability: profile.evidence_context.applicability,
      interpretation: profile.evidence_context.interpretation,
    },
    interpretationSummary: profile.interpretation.summary,
    interpretationConfidence: profile.interpretation.confidence,
    supportingFacts: profile.interpretation.supporting_facts,
    contradictoryFacts: profile.interpretation.contradictory_facts,
    limitations: profile.interpretation.limitations,
  };
}
