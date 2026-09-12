/**
 * @magniom/domain - Triple-Network Systems Layer Domain Models
 * Conforms to MAGNIOM-Triple-Network Systems Layer v1.0 (§6-45, 65-72)
 * and MAGNIOM Multi-Indication Technical & Scientific Architecture Specification v2.1 (§17-20, 40-47)
 */

import type { CommonProvenance } from './types.js';

export type NetworkSystemCode = 'CEN' | 'DMN' | 'SN';

export type NetworkSystemStatus = 'active' | 'deprecated' | 'research_only';

export interface NetworkSystem {
  readonly id: string;
  readonly code: NetworkSystemCode;
  readonly name: string;
  readonly description: string;
  readonly definition_id: string;
  readonly version: string;
  readonly status: NetworkSystemStatus;
  readonly provenance?: CommonProvenance | undefined;
}

export type NetworkDefinitionStatus = 'validated' | 'provisional' | 'research';

export interface NetworkDefinition {
  readonly id: string;
  readonly network_system_id: string;
  readonly version: string;
  readonly atlas_id: string;
  readonly atlas_version: string;
  readonly parcel_ids: readonly string[];
  readonly membership_method: string;
  readonly membership_parameters: Readonly<Record<string, unknown>>;
  readonly source_evidence_claim_ids: readonly string[];
  readonly definition_hash: string;
  readonly effective_from: string;
  readonly status: NetworkDefinitionStatus;
  readonly provenance?: CommonProvenance | undefined;
}

export interface NetworkNode {
  readonly id: string;
  readonly network_system_id: string;
  readonly parcel_id: string;
  readonly parcel_name: string;
  readonly hemisphere: 'L' | 'R' | 'BILATERAL';
  readonly canonical_mni_coordinate: {
    readonly x: number;
    readonly y: number;
    readonly z: number;
  };
  readonly functional_weight: number;
}

export type NetworkRelationshipCode = 'CEN_DMN' | 'SN_CEN' | 'SN_DMN';

export type NetworkRelationshipDirectionality = 'undirected' | 'directed' | 'not_applicable';

export type NetworkRelationshipStatus = 'validated' | 'provisional' | 'research';

export interface NetworkRelationship {
  readonly id: string;
  readonly network_a_id: string;
  readonly network_b_id: string;
  readonly relationship_code: NetworkRelationshipCode;
  readonly metric_code: string;
  readonly metric_version: string;
  readonly directionality: NetworkRelationshipDirectionality;
  readonly normative_reference_id?: string | undefined;
  readonly evidence_claim_ids: readonly string[];
  readonly status: NetworkRelationshipStatus;
  readonly provenance?: CommonProvenance | undefined;
}

export type NetworkInterpretationStatus =
  'supportive' | 'neutral' | 'contradictory' | 'uncertain' | 'not_interpretable';

export interface NetworkInteractionMeasurement {
  readonly relationship_id: string;
  readonly relationship_code: NetworkRelationshipCode;
  readonly metric_code: string;
  readonly raw_value: number;
  readonly normalized_value?: number | undefined;
  readonly normative_deviation?: number | undefined;
  readonly unit?: string | undefined;
  readonly measurement_run_id: string;
  readonly reliability_profile_id: string;
  readonly interpretation_status: NetworkInterpretationStatus;
}

export interface NetworkMeasurement {
  readonly network_system_id: string;
  readonly network_code: NetworkSystemCode;
  readonly metric_code: string;
  readonly raw_value: number;
  readonly normalized_value?: number | undefined;
  readonly reliability_score?: number | undefined;
  readonly interpretation_status: NetworkInterpretationStatus;
}

export type ReliabilityClassification =
  'high' | 'moderate' | 'low' | 'unreliable' | 'not_assessable';

export interface NetworkReliabilityComponent {
  readonly reliability_class: ReliabilityClassification;
  readonly metric_value?: number | undefined;
  readonly limiting_factors: readonly string[];
}

export type NetworkOverallReliabilityStatus = 'high' | 'moderate' | 'limited' | 'insufficient';

export type NetworkClinicalQualification =
  'qualified' | 'qualified_with_caution' | 'context_only' | 'research_only';

export interface NetworkReliabilityProfile {
  readonly id: string;
  readonly acquisition_quality: NetworkReliabilityComponent;
  readonly preprocessing_reliability: NetworkReliabilityComponent;
  readonly within_network_reliability: NetworkReliabilityComponent;
  readonly pairwise_reliability: {
    readonly cen_dmn: NetworkReliabilityComponent;
    readonly sn_cen: NetworkReliabilityComponent;
    readonly sn_dmn: NetworkReliabilityComponent;
  };
  readonly normative_compatibility: NetworkReliabilityComponent;
  readonly atlas_sensitivity: NetworkReliabilityComponent;
  readonly preprocessing_sensitivity: NetworkReliabilityComponent;
  readonly cross_run_stability?: NetworkReliabilityComponent | undefined;
  readonly overall_status: NetworkOverallReliabilityStatus;
  readonly clinical_qualification: NetworkClinicalQualification;
  readonly provenance?: CommonProvenance | undefined;
}

export type NetworkEvidenceClaimType =
  | 'association'
  | 'phenotype_relationship'
  | 'circuit_relationship'
  | 'target_relationship'
  | 'mechanistic'
  | 'predictive'
  | 'causal'
  | 'safety'
  | 'negative'
  | 'conflicting';

export type NetworkEvidenceLevel = 'A' | 'B' | 'C' | 'D' | 'R';

export interface NetworkEvidenceClaim {
  readonly id: string;
  readonly evidence_claim_id: string;
  readonly network_system_ids: readonly string[];
  readonly relationship_ids?: readonly string[] | undefined;
  readonly indication_id?: string | undefined;
  readonly clinical_objective_id?: string | undefined;
  readonly claim_type: NetworkEvidenceClaimType;
  readonly evidence_level: NetworkEvidenceLevel;
  readonly population_scope: string;
  readonly methodology: string;
  readonly directionality?: string | undefined;
  readonly applicability: 'direct' | 'partial' | 'indirect' | 'research';
  readonly provenance_refs: readonly string[];
  readonly approved_for: 'clinical_context' | 'clinical_refinement' | 'research_only';
}

export interface NetworkEvidenceContext {
  readonly supporting_claim_ids: readonly string[];
  readonly negative_claim_ids: readonly string[];
  readonly conflicting_claim_ids: readonly string[];
  readonly evidence_level_ceiling: NetworkEvidenceLevel;
  readonly applicability: 'strong' | 'moderate' | 'limited' | 'uncertain';
  readonly interpretation: string;
}

export type NetworkConfigurationInterpretationStatus =
  'interpretable' | 'partially_interpretable' | 'uncertain' | 'not_qualified';

export type NetworkConfigurationClinicalUse =
  'contextual' | 'qualified_contextual' | 'research_only';

export interface NormativeNetworkContext {
  readonly normative_reference_id: string;
  readonly model_version: string;
  readonly cohort_description: string;
  readonly compatibility_status: 'compatible' | 'caution' | 'incompatible';
  readonly percentile_cen_dmn?: number | undefined;
  readonly percentile_sn_cen?: number | undefined;
  readonly percentile_sn_dmn?: number | undefined;
  readonly z_score_cen_dmn?: number | undefined;
}

export interface NetworkConfiguration {
  readonly id: string;
  readonly case_id: string;
  readonly connectome_run_id: string;
  readonly network_definition_release_id: string;
  readonly metric_release_id: string;
  readonly within_network_measurements: readonly NetworkMeasurement[];
  readonly pairwise_relationships: readonly NetworkInteractionMeasurement[];
  readonly global_integration?: number | undefined;
  readonly global_segregation?: number | undefined;
  readonly normative_context?: NormativeNetworkContext | undefined;
  readonly reliability_profile_id: string;
  readonly interpretation_status: NetworkConfigurationInterpretationStatus;
  readonly clinical_use: NetworkConfigurationClinicalUse;
  readonly configuration_hash: string;
}

export interface NetworkState {
  readonly code: NetworkSystemCode;
  readonly name: string;
  readonly within_network_integrity: number;
  readonly status: 'intact' | 'altered' | 'hypoconnected' | 'hyperconnected' | 'uncertain';
  readonly interpretation: string;
}

export interface NetworkRelationshipState {
  readonly relationship_code: NetworkRelationshipCode;
  readonly name: string;
  readonly coupling_value: number;
  readonly segregation_index: number;
  readonly status: 'normal' | 'altered' | 'hypocoupled' | 'hypercoupled' | 'uncertain';
  readonly interpretation: string;
}

export type NetworkInterpretationConfidence = 'high' | 'moderate' | 'limited' | 'uncertain';

export type NetworkClinicalImplication =
  | 'supportive_context'
  | 'neutral_context'
  | 'uncertain_context'
  | 'contradictory_context'
  | 'research_only';

export interface NetworkInterpretation {
  readonly summary: string;
  readonly confidence: NetworkInterpretationConfidence;
  readonly supporting_facts: readonly string[];
  readonly contradictory_facts: readonly string[];
  readonly limitations: readonly string[];
  readonly clinical_implication: NetworkClinicalImplication;
}

export type TripleNetworkProfileClinicalAuthority =
  'contextual' | 'qualified_contextual' | 'research';

export interface TripleNetworkProfile {
  readonly id: string;
  readonly case_id: string;
  readonly network_configuration_id: string;
  readonly cen: NetworkState;
  readonly dmn: NetworkState;
  readonly sn: NetworkState;
  readonly cen_dmn: NetworkRelationshipState;
  readonly sn_cen: NetworkRelationshipState;
  readonly sn_dmn: NetworkRelationshipState;
  readonly global_integration?: number | undefined;
  readonly global_segregation?: number | undefined;
  readonly reliability: NetworkReliabilityProfile;
  readonly normative_context?: NormativeNetworkContext | undefined;
  readonly evidence_context: NetworkEvidenceContext;
  readonly interpretation: NetworkInterpretation;
  readonly clinical_authority: TripleNetworkProfileClinicalAuthority;
  readonly version: string;
  readonly profile_hash: string;
  readonly provenance?: CommonProvenance | undefined;
}

export type TherapeuticCircuitNetworkRelationshipType =
  'embedded' | 'intersects' | 'connects' | 'modulates' | 'associated_with';

export interface TherapeuticCircuitNetworkContext {
  readonly therapeutic_circuit_id: string;
  readonly network_system_id: string;
  readonly network_code: NetworkSystemCode;
  readonly relationship_type: TherapeuticCircuitNetworkRelationshipType;
  readonly evidence_claim_ids: readonly string[];
  readonly evidence_level: NetworkEvidenceLevel;
  readonly clinical_authority: 'clinical' | 'contextual' | 'research';
}

export type CandidateNetworkRelationshipType =
  'direct' | 'indirect' | 'circuit_mediated' | 'contextual' | 'not_established';

export type CandidateNetworkInterpretation =
  'supportive' | 'neutral' | 'contradictory' | 'uncertain';

export type CandidateNetworkAuthority = 'clinical_context' | 'qualified_context' | 'research_only';

export interface CandidateNetworkRelationship {
  readonly candidate_id: string;
  readonly network_system_id: string;
  readonly network_code: NetworkSystemCode;
  readonly relationship_type: CandidateNetworkRelationshipType;
  readonly strength?: number | undefined;
  readonly reliability: NetworkReliabilityComponent;
  readonly evidence_claim_ids: readonly string[];
  readonly interpretation: CandidateNetworkInterpretation;
  readonly clinical_authority: CandidateNetworkAuthority;
}

export type TripleNetworkPolicyStatus = 'contextual' | 'qualified_contextual' | 'research_only';

export interface TripleNetworkTargetContext {
  readonly profile_id: string;
  readonly configuration: NetworkConfiguration;
  readonly reliability: NetworkReliabilityProfile;
  readonly evidence_context: NetworkEvidenceContext;
  readonly candidate_relationships: readonly CandidateNetworkRelationship[];
  readonly policy_status: TripleNetworkPolicyStatus;
}

export interface NetworkRankingFeaturePolicy {
  readonly feature_code: string;
  readonly indication_id: string;
  readonly clinical_objective_id?: string | undefined;
  readonly evidence_ceiling: NetworkEvidenceLevel;
  readonly minimum_reliability: NetworkOverallReliabilityStatus;
  readonly allowed_role: 'context' | 'tie_break' | 'ranking_feature' | 'candidate_refinement';
  readonly validation_reference_ids: readonly string[];
  readonly policy_release_id: string;
}

export interface TripleNetworkPolicy {
  readonly enabled: boolean;
  readonly allowed_network_definitions: readonly string[];
  readonly allowed_metric_releases: readonly string[];
  readonly minimum_reliability: NetworkOverallReliabilityStatus;
  readonly allowed_clinical_roles: readonly (
    'context' | 'convergence' | 'explanation' | 'tie_break'
  )[];
  readonly allowed_indications: readonly string[];
  readonly allowed_objectives: readonly string[];
  readonly dynamic_metrics_allowed: boolean;
  readonly ranking_features: readonly NetworkRankingFeaturePolicy[];
}

export interface NetworkOverlapRedundancy {
  readonly cen: number;
  readonly dmn: number;
  readonly sn: number;
  readonly pairwise_relationship_overlap: number;
}

// Canonical Failure Modes (§70)
export const TN_FAILURE_CODES = {
  TN_001_NETWORK_DEFINITION_UNAVAILABLE: 'TN-001',
  TN_002_NETWORK_MEASUREMENT_INCOMPLETE: 'TN-002',
  TN_003_CEN_RELIABILITY_INSUFFICIENT: 'TN-003',
  TN_004_DMN_RELIABILITY_INSUFFICIENT: 'TN-004',
  TN_005_SN_RELIABILITY_INSUFFICIENT: 'TN-005',
  TN_006_CEN_DMN_RELATIONSHIP_UNSTABLE: 'TN-006',
  TN_007_SN_CEN_RELATIONSHIP_UNSTABLE: 'TN-007',
  TN_008_SN_DMN_RELATIONSHIP_UNSTABLE: 'TN-008',
  TN_009_ATLAS_SENSITIVE_CONFIGURATION: 'TN-009',
  TN_010_NORMATIVE_MODEL_INCOMPATIBLE: 'TN-010',
  TN_011_EVIDENCE_INSUFFICIENT_FOR_CLINICAL: 'TN-011',
  TN_012_RESEARCH_FEATURE_REQUESTED_IN_CLINICAL: 'TN-012',
  TN_013_NETWORK_FEATURE_NOT_AUTHORISED_BY_POLICY: 'TN-013',
  TN_014_INTERPRETATION_EXCEEDS_EVIDENCE_CEILING: 'TN-014',
} as const;

export type TnFailureCode = (typeof TN_FAILURE_CODES)[keyof typeof TN_FAILURE_CODES];

// Canonical Engine Warnings (§71)
export const TN_WARNING_CODES = {
  TRIPLE_NETWORK_CONTEXT_UNAVAILABLE: 'TRIPLE_NETWORK_CONTEXT_UNAVAILABLE',
  TRIPLE_NETWORK_LOW_RELIABILITY: 'TRIPLE_NETWORK_LOW_RELIABILITY',
  TRIPLE_NETWORK_PARTIAL: 'TRIPLE_NETWORK_PARTIAL',
  TRIPLE_NETWORK_EVIDENCE_LIMITED: 'TRIPLE_NETWORK_EVIDENCE_LIMITED',
  TRIPLE_NETWORK_EVIDENCE_CONFLICT: 'TRIPLE_NETWORK_EVIDENCE_CONFLICT',
  TRIPLE_NETWORK_NORMATIVE_INCOMPATIBLE: 'TRIPLE_NETWORK_NORMATIVE_INCOMPATIBLE',
  TRIPLE_NETWORK_RESEARCH_ONLY: 'TRIPLE_NETWORK_RESEARCH_ONLY',
  TRIPLE_NETWORK_FEATURE_POLICY_BLOCKED: 'TRIPLE_NETWORK_FEATURE_POLICY_BLOCKED',
  TRIPLE_NETWORK_PERSONALISATION_NOT_QUALIFIED: 'TRIPLE_NETWORK_PERSONALISATION_NOT_QUALIFIED',
  PERSONALISATION_MAJOR_DIVERGENCE: 'PERSONALISATION_MAJOR_DIVERGENCE',
} as const;

export type TnWarningCode = (typeof TN_WARNING_CODES)[keyof typeof TN_WARNING_CODES];
