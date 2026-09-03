/**
 * MAGNIOM Canonical Evidence Governance & EvidencePath Domain Types v2.0
 * Conforms to MAGNIOM-Evidence Knowledge Graph & Therapeutic Circuit Library v2.0 (§7, 95)
 * and MAGNIOM-Scientific Policy & Algorithm Configuration Specification v2.0 (§30)
 */

import type {
  MagniomMode,
  LegacyEvidenceTier,
  GovernanceClassificationStatus,
  EvidencePathStatus,
  TargetGeometryType,
  CandidateRoleV2,
} from './enums.js';
import type { CommonProvenance } from './types.js';

export interface PermittedRolesDefinition {
  readonly standalonePrimary: boolean;
  readonly standaloneAdditional: boolean;
  readonly supportingContext: boolean;
  readonly refinementOfParentClaims: boolean;
  readonly researchCandidateGeneration: boolean;
}

export interface EvidenceGovernanceClassification {
  readonly id: string;
  readonly evidenceClaimId: string;
  readonly claimVersion: string;
  readonly classificationStatus: GovernanceClassificationStatus;
  readonly magniomEvidenceTier?: LegacyEvidenceTier;
  readonly permittedRoles?: PermittedRolesDefinition;
  readonly reviewerIds: readonly string[];
  readonly rationale?: string;
  readonly classificationBasis?: string;
  readonly supportingSynthesisId?: string;
  readonly assignedAt?: string;
  readonly supersedesClassificationId?: string;
  readonly provenance: CommonProvenance;
}

export interface EvidencePath {
  readonly id: string;
  readonly indicationModuleReleaseId: string;
  readonly evidenceClaimIds: readonly string[];
  readonly populationId: string;
  readonly clinicalObjectiveId: string;
  readonly diseaseStageId?: string;
  readonly therapeuticCircuitId?: string;
  readonly targetFamilyId: string;
  readonly targetingStrategyId: string;
  readonly targetGeometryType: TargetGeometryType;
  readonly treatmentContextRequirementIds?: readonly string[];
  readonly governanceClassificationIds: readonly string[];
  readonly pathStatus: EvidencePathStatus;
  readonly scientificPolicyReleaseId?: string;
  readonly provenance: CommonProvenance;
}

export interface EvidencePathPermission {
  readonly evidencePathId: string;
  readonly permittedModes: readonly MagniomMode[];
  readonly candidateRoles: readonly CandidateRoleV2[];
  readonly candidateGenerationMethodIds: readonly string[];
  readonly standalonePrimary: boolean;
  readonly standaloneAdditional: boolean;
  readonly supportingContext: boolean;
  readonly refinementParentPathIds?: readonly string[];
  readonly populationConstraints?: readonly string[];
  readonly diseaseStageConstraints?: readonly string[];
  readonly treatmentContextConstraints?: readonly string[];
  readonly targetGeometryTypes: readonly TargetGeometryType[];
  readonly limitations: readonly string[];
}
