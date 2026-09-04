/**
 * MAGNIOM Canonical Indication Module Domain Types v2.0
 * Conforms to MAGNIOM-Canonical Multi-Indication Data Specification v2.0 (§11-15)
 * and MAGNIOM-Implementation & Multi-Indication Validation Roadmap v2.0
 */

import type {
  MagniomMode,
  ModuleLifecycleStatus,
  ModuleGovernanceStatus,
  IndicationModuleStatus,
  ModuleQualificationLevel,
  TargetGeometryType,
  MeasurementModality,
  MeasurementRequirementStatus,
  MeasurementRequirementPurpose,
  MissingDataBehaviour,
} from './enums.js';
import type { CommonProvenance, ClinicalConceptRef } from './types.js';
import type {
  ClinicalObjectiveDefinition,
  TreatmentContextRequirement,
} from './clinical-context.js';

export interface IndicationRef {
  readonly conceptId: string;
  readonly label: string;
  readonly codingSystem?: string;
  readonly code?: string;
}

export interface TargetingStrategyRef {
  readonly strategyId: string;
  readonly code: string;
  readonly label: string;
  readonly description?: string;
}

export interface DeviceContext {
  readonly deviceModelId?: string;
  readonly coilModelId?: string;
  readonly stimulatorClass?: string;
  readonly coolingType?: string;
  readonly notes?: string;
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

/**
 * §12. CANONICAL OBJECT — IndicationModule
 * Conforms to MAGNIOM-Multi-Indication Technical & Scientific Architecture Specification v2.0 Section 12
 */
export interface IndicationModule {
  readonly id: string;
  readonly code: string;
  readonly version: string;
  readonly indication: ClinicalConceptRef;
  readonly title: string;
  readonly status: IndicationModuleStatus;
  readonly intended_population: PopulationDefinition;
  readonly allowed_modes: readonly MagniomMode[];
  readonly phenotype_schema_version_id: string;
  readonly evidence_scope_id: string;
  readonly clinical_objectives: readonly ClinicalObjectiveDefinition[];
  readonly candidate_generation_methods: readonly TargetingStrategyRef[];
  readonly measurement_requirements: readonly MeasurementRequirement[];
  readonly target_geometry_types: readonly TargetGeometryType[];
  readonly reliability_policy_refs: readonly string[];
  readonly scientific_policy_compatibility: readonly string[];
  readonly adjunctive_context_requirements: readonly TreatmentContextRequirement[];
  readonly limitations: readonly string[];
  readonly validation_evidence_ids: readonly string[];
  readonly manifest_sha256: string;
}

/**
 * §34. INDICATION ENGINE CONTRACT — IndicationTargetingContext
 * Conforms to MAGNIOM-Multi-Indication Technical & Scientific Architecture Specification v2.0 Section 34
 */
export interface IndicationTargetingContext {
  readonly case_id: string;
  readonly indication_module_release_id: string;
  readonly clinical_objective_snapshot_id: string;
  readonly phenotype_snapshot_id: string;
  readonly evidence_library_release_id: string;
  readonly scientific_policy_release_id: string;
  readonly measurement_bundle_id: string;
  readonly reliability_bundle_id?: string;
  readonly target_engine_version_id: string;
  readonly device_context?: readonly DeviceContext[];
}
