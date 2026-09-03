/**
 * MAGNIOM Canonical Indication Module Domain Types v2.0
 * Conforms to MAGNIOM-Canonical Multi-Indication Data Specification v2.0 (§11-15)
 * and MAGNIOM-Implementation & Multi-Indication Validation Roadmap v2.0
 */

import type {
  MagniomMode,
  ModuleLifecycleStatus,
  ModuleGovernanceStatus,
  ModuleQualificationLevel,
  TargetGeometryType,
  MeasurementModality,
  MeasurementRequirementStatus,
  MeasurementRequirementPurpose,
  MissingDataBehaviour,
} from './enums.js';
import type { CommonProvenance } from './types.js';

export interface IndicationRef {
  readonly conceptId: string;
  readonly label: string;
  readonly codingSystem?: string;
  readonly code?: string;
}

export interface PopulationDefinition {
  readonly code: string;
  readonly label: string;
  readonly description: string;
  readonly minAgeYears?: number;
  readonly maxAgeYears?: number;
  readonly diagnosticCriteria?: readonly string[];
  readonly exclusionCriteria?: readonly string[];
}

export interface MeasurementRequirement {
  readonly code: string;
  readonly modality: MeasurementModality;
  readonly requirement: MeasurementRequirementStatus;
  readonly purpose: MeasurementRequirementPurpose;
  readonly minimumQualityPolicyRef?: string;
  readonly missingDataBehaviour: MissingDataBehaviour;
  readonly fallbackRuleRef?: string;
  readonly rationale: string;
}

export interface DeviceCapabilityRequirement {
  readonly deviceClass?: string;
  readonly coilClass?: string;
  readonly capabilityCode: string;
  readonly requirement: 'required' | 'optional';
  readonly rationale: string;
}

export interface IndicationModuleRelease {
  readonly id: string;
  readonly code: string;
  readonly semanticVersion: string;
  readonly title: string;
  readonly description: string;
  readonly indication: IndicationRef;
  readonly lifecycleStatus: ModuleLifecycleStatus;
  readonly moduleStatus: ModuleGovernanceStatus;
  readonly qualificationLevel: ModuleQualificationLevel;
  readonly permittedModes: readonly MagniomMode[];
  readonly intendedPopulation: PopulationDefinition;
  readonly excludedPopulations?: readonly PopulationDefinition[];
  readonly phenotypeSchemaVersionId: string;
  readonly clinicalObjectiveDefinitionIds: readonly string[];
  readonly diseaseStageDefinitionIds?: readonly string[];
  readonly evidenceScopeId: string;
  readonly permittedTargetFamilyIds: readonly string[];
  readonly permittedCandidateGenerationMethodIds: readonly string[];
  readonly measurementRequirements: readonly MeasurementRequirement[];
  readonly reliabilityPolicyRefs: readonly string[];
  readonly permittedTargetGeometryTypes: readonly TargetGeometryType[];
  readonly treatmentContextRequirementIds?: readonly string[];
  readonly deviceRequirements?: readonly DeviceCapabilityRequirement[];
  readonly scientificPolicyCompatibilityRefs: readonly string[];
  readonly knownLimitations: readonly string[];
  readonly validationEvidenceIds: readonly string[];
  readonly payloadSha256: string;
  readonly manifestSha256: string;
  readonly createdAt: string;
  readonly releasedAt?: string;
  readonly supersedesReleaseId?: string;
  readonly provenance: CommonProvenance;
}
