/**
 * MAGNIOM Canonical Evidence Knowledge Graph v2 Domain Types
 * Conforms to MAGNIOM-Evidence Knowledge Graph & Therapeutic Circuit Library v2.0
 * (§6, 7, 10, 11, 12, 13, 14, 75, 90, 95, 104)
 */

import type {
  ClaimLifecycleStatus,
  ClaimTypeV2,
  ClaimDirection,
  FindingType,
  ExtractionStatus,
  SourceRelationshipV2,
  SourceIndependence,
  SourceRelevance,
  SynthesisDirectness,
  SynthesisReplication,
  SynthesisDesignStrength,
  SynthesisSampleSupport,
  SynthesisConsistency,
  SynthesisClinicalApplicability,
  SynthesisTargetSpecificity,
  SynthesisContextDependence,
  LegacyEvidenceTier,
  ConflictType,
  ConflictReconciliationStatus,
  EvidenceQuestionStatus,
  TargetGeometryType,
} from './enums.js';
import type { CommonProvenance, TargetFamilyV2 } from './types.js';
import type { EvidencePath } from './evidence-governance.js';

export interface EffectEstimate {
  readonly metric: string;
  readonly value: number;
  readonly ciLower?: number;
  readonly ciUpper?: number;
  readonly pValue?: number;
  readonly sampleSize?: number;
}

export interface DurationDescriptor {
  readonly value: number;
  readonly unit: 'days' | 'weeks' | 'months' | 'years';
}

export interface SourceFinding {
  readonly id: string;
  readonly sourceId: string;
  readonly findingType: FindingType;
  readonly findingStatement: string;
  readonly effectEstimate?: EffectEstimate;
  readonly populationId?: string;
  readonly targetFamilyIds?: readonly string[];
  readonly treatmentContextIds?: readonly string[];
  readonly followupInterval?: DurationDescriptor;
  readonly extractionStatus: ExtractionStatus;
  readonly provenance: CommonProvenance;
}

export interface SourceContribution {
  readonly sourceId: string;
  readonly sourceFindingIds: readonly string[];
  readonly relationship: SourceRelationshipV2;
  readonly independence: SourceIndependence;
  readonly relevance: SourceRelevance;
  readonly curatorNote?: string;
}

export interface ClaimEvidenceSynthesis {
  readonly id: string;
  readonly evidenceClaimId: string;
  readonly directness: SynthesisDirectness;
  readonly replication: SynthesisReplication;
  readonly studyDesignStrength: SynthesisDesignStrength;
  readonly sampleSupport: SynthesisSampleSupport;
  readonly consistency: SynthesisConsistency;
  readonly clinicalApplicability: SynthesisClinicalApplicability;
  readonly targetSpecificity: SynthesisTargetSpecificity;
  readonly treatmentContextDependence: SynthesisContextDependence;
  readonly synthesisStatement: string;
  readonly governanceTierRecommendation?: LegacyEvidenceTier;
  readonly provenance?: CommonProvenance;
}

export interface EvidenceClaimV2 {
  readonly id: string;
  readonly code: string;
  readonly version: string;
  readonly lifecycleStatus: ClaimLifecycleStatus;
  readonly claimType: ClaimTypeV2;
  readonly statement: string;
  readonly direction: ClaimDirection;
  readonly indicationIds: readonly string[];
  readonly clinicalObjectiveDefinitionIds?: readonly string[];
  readonly outcomeDomainIds: readonly string[];
  readonly populationIds: readonly string[];
  readonly diseaseStageDefinitionIds?: readonly string[];
  readonly therapeuticCircuitIds?: readonly string[];
  readonly targetFamilyIds?: readonly string[];
  readonly targetingStrategyIds?: readonly string[];
  readonly targetGeometryClassIds?: readonly string[];
  readonly treatmentContextRequirementIds?: readonly string[];
  readonly sourceContributions: readonly SourceContribution[];
  readonly synthesisId?: string;
  readonly applicabilityConstraints: readonly string[];
  readonly limitations: readonly string[];
  readonly reviewedAt?: string;
  readonly nextReviewDue?: string;
  readonly provenance: CommonProvenance;
}

export interface ClaimConflictSet {
  readonly id: string;
  readonly subjectClaimId: string;
  readonly supportingClaimIds: readonly string[];
  readonly conflictingClaimIds: readonly string[];
  readonly conflictType: ConflictType;
  readonly reconciliationStatus: ConflictReconciliationStatus;
  readonly explanation?: string;
  readonly reviewedBy?: readonly string[];
  readonly provenance: CommonProvenance;
}

export interface EvidenceQuestion {
  readonly id: string;
  readonly indicationId: string;
  readonly population: Record<string, unknown>;
  readonly clinicalObjectiveId: string;
  readonly intervention?: Record<string, unknown>;
  readonly targetFamilyId?: string;
  readonly targetingStrategyId?: string;
  readonly treatmentContextId?: string;
  readonly comparator?: Record<string, unknown>;
  readonly outcomeDomains: readonly string[];
  readonly question: string;
  readonly status: EvidenceQuestionStatus;
}

export interface EvidenceLibraryReleaseV2 {
  readonly id: string;
  readonly code: string;
  readonly semanticVersion: string;
  readonly lifecycleStatus: 'draft' | 'validation' | 'active' | 'superseded' | 'withdrawn';
  readonly sourceIds: readonly string[];
  readonly sourceFindingIds: readonly string[];
  readonly evidenceClaimIds: readonly string[];
  readonly synthesisIds: readonly string[];
  readonly governanceClassificationIds: readonly string[];
  readonly targetFamilyIds: readonly string[];
  readonly evidencePathIds: readonly string[];
  readonly conflictSetIds: readonly string[];
  readonly manifestSha256: string;
  readonly releasedAt?: string;
  readonly provenance: CommonProvenance;
}

// ---------------------------------------------------------------------------
// Therapeutic Circuit & Target System Types (§16, §17, §81)
// ---------------------------------------------------------------------------

export type CircuitKind =
  | 'therapeutic_network'
  | 'target_system'
  | 'interhemispheric_model'
  | 'functional_network'
  | 'lesion_network'
  | 'mechanistic_hypothesis';

export type CircuitScientificStatus =
  | 'treatment_effect_linked'
  | 'prospectively_tested'
  | 'replicated_association'
  | 'mechanistic'
  | 'hypothesis';

export interface TherapeuticCircuitV2 {
  readonly id: string;
  readonly code: string;
  readonly version: string;
  readonly name: string;
  readonly indicationScopeIds: readonly string[];
  readonly clinicalObjectiveDefinitionIds: readonly string[];
  readonly circuitKind: CircuitKind;
  readonly scientificStatus: CircuitScientificStatus;
  readonly circuitDefinition: Record<string, unknown>;
  readonly circuitArtifactIds?: readonly string[];
  readonly supportingEvidenceClaimIds: readonly string[];
  readonly conflictingEvidenceClaimIds: readonly string[];
  readonly limitations: readonly string[];
  readonly provenance: CommonProvenance;
}

export interface CircuitArtifact {
  readonly id: string;
  readonly circuitId: string;
  readonly artifactType:
    'mask' | 'parcellation' | 'connectivity_matrix' | 'lesion_network_map' | 'e_field_model';
  readonly name: string;
  readonly format: string;
  readonly uri: string;
  readonly sha256: string;
  readonly provenance: CommonProvenance;
}

// ---------------------------------------------------------------------------
// Claim ↔ Target Binding (§19)
// ---------------------------------------------------------------------------

export type ClaimTargetRelationship =
  'directly_tested' | 'consistent_with' | 'indirectly_supports' | 'not_tested';

export interface ClaimTargetBinding {
  readonly id?: string;
  readonly evidenceClaimId: string;
  readonly targetFamilyId: string;
  readonly targetingStrategyId?: string;
  readonly geometryClass?: TargetGeometryType;
  readonly relationship: ClaimTargetRelationship;
  readonly limitations: readonly string[];
}

// ---------------------------------------------------------------------------
// Explicit Edge Ontology (§14, §15)
// ---------------------------------------------------------------------------

export type EvidenceEdgeType =
  // Retained v1 edges
  | 'SUPPORTS'
  | 'CONFLICTS_WITH'
  | 'DERIVED_FROM'
  | 'VALIDATES'
  | 'REPLICATES'
  | 'PARTIALLY_REPLICATES'
  | 'APPLIES_TO'
  | 'ADDRESSES'
  | 'MEASURES'
  | 'ENGAGES'
  | 'TARGETS'
  | 'REFINES'
  | 'BELONGS_TO'
  | 'ALTERNATIVE_TO'
  | 'SUPERSEDES'
  | 'USES_MAP'
  | 'USES_SEED'
  | 'USES_SEARCH_SPACE'
  | 'USES_PROTOCOL'
  | 'HAS_PRECEDENT'
  | 'HAS_LIMITATION'
  // Added v2 edges
  | 'APPLIES_AT_STAGE'
  | 'SUPPORTS_OBJECTIVE'
  | 'REQUIRES_CONTEXT'
  | 'WAS_TESTED_WITH'
  | 'USES_TARGET_GEOMETRY'
  | 'USES_DEVICE_CLASS'
  | 'USES_COIL_CLASS'
  | 'MAPS_TO_BODY_REGION'
  | 'REQUIRES_LESION_CONTEXT'
  | 'LIMITS_GENERALISATION'
  | 'DOES_NOT_SUPPORT'
  | 'HAS_NULL_EVIDENCE';

export interface EvidenceEdge {
  readonly id: string;
  readonly sourceNodeId: string;
  readonly sourceNodeType: string;
  readonly edgeType: EvidenceEdgeType;
  readonly targetNodeId: string;
  readonly targetNodeType: string;
  readonly weight?: number;
  readonly metadata?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// First-Class Graph Query Results (§97 - §102)
// ---------------------------------------------------------------------------

export interface WhyThisTargetQueryResult {
  readonly targetFamilyId: string;
  readonly indicationId: string;
  readonly evidencePaths: readonly EvidencePath[];
  readonly strongestDirectSupport: readonly EvidenceClaimV2[];
  readonly materialConflicts: readonly ClaimConflictSet[];
  readonly populationApplicability: readonly string[];
  readonly stageApplicability: readonly string[];
  readonly targetingStrategies: readonly string[];
  readonly targetGeometries: readonly TargetGeometryType[];
  readonly treatmentContexts: readonly string[];
  readonly limitationsAndUncertainties: readonly string[];
  readonly assignedTier?: LegacyEvidenceTier | undefined;
  readonly permittedRoles?: Record<string, boolean> | undefined;
}

export interface ClinicallyPermittedQueryResult {
  readonly indicationModuleReleaseId: string;
  readonly scientificPolicyReleaseId?: string | undefined;
  readonly permittedPaths: readonly EvidencePath[];
  readonly permittedTargetFamilies: readonly TargetFamilyV2[];
  readonly permittedTargetingStrategies: readonly string[];
  readonly permittedTargetGeometries: readonly TargetGeometryType[];
}

export interface EvidenceWithoutTierQueryResult {
  readonly claimId: string;
  readonly claimCode: string;
  readonly statement: string;
  readonly synthesis?: ClaimEvidenceSynthesis | undefined;
  readonly governanceStatus: 'unassigned' | 'under_review' | 'assigned' | 'deferred' | 'withdrawn';
  readonly directness?: string | undefined;
  readonly replication?: string | undefined;
  readonly consistency?: string | undefined;
  readonly targetSpecificity?: string | undefined;
  readonly clinicalApplicability?: string | undefined;
  readonly treatmentContextDependence?: string | undefined;
}

export interface StagingTargetsQueryResult {
  readonly indicationId: string;
  readonly stagingTargetFamilies: readonly TargetFamilyV2[];
  readonly researchTargetFamilies: readonly TargetFamilyV2[];
  readonly clinicalPermission: false;
  readonly stagingPaths: readonly EvidencePath[];
  readonly researchPaths: readonly EvidencePath[];
}

export interface NullEvidenceQueryResult {
  readonly claimId: string;
  readonly claimCode: string;
  readonly nullFindings: readonly SourceFinding[];
  readonly conflictingClaims: readonly EvidenceClaimV2[];
  readonly explanation?: string | undefined;
}

export interface EvidenceReleaseDiffResult {
  readonly oldReleaseCode: string;
  readonly newReleaseCode: string;
  readonly addedSources: readonly string[];
  readonly removedSources: readonly string[];
  readonly addedFindings: readonly string[];
  readonly addedClaims: readonly string[];
  readonly changedClaimWording: readonly {
    readonly claimId: string;
    readonly oldStatement: string;
    readonly newStatement: string;
  }[];
  readonly newConflicts: readonly string[];
  readonly resolvedConflicts: readonly string[];
  readonly changedSyntheses: readonly string[];
  readonly newGovernanceClassifications: readonly string[];
  readonly withdrawnClassifications: readonly string[];
  readonly changedEvidencePaths: readonly string[];
}
