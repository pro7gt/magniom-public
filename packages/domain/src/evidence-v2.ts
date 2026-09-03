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
} from './enums.js';
import type { CommonProvenance } from './types.js';

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
