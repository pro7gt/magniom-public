/**
 * MAGNIOM Canonical Scientific Policy Domain Types v2.0
 * Conforms to MAGNIOM-Scientific Policy & Algorithm Configuration Specification v2.0
 * Pure TypeScript, zero runtime dependencies.
 */

import type {
  MagniomMode,
  CandidateRole,
  CandidateRoleV2,
  TargetGeometryType,
  MeasurementModality,
} from './enums.js';
import type {
  ComponentReleaseRef,
  ComponentRequirementRef,
  ScientificCompatibilityConfiguration,
} from './compatibility-configuration.js';
import type { ComparisonDomainPermission } from './target-v2.js';

export type PolicyLifecycleStatus =
  | 'draft'
  | 'under_review'
  | 'validation'
  | 'release_candidate'
  | 'active'
  | 'superseded'
  | 'withdrawn'
  | 'archived';

export type PolicyValidationStatus =
  | 'design_only'
  | 'engineering_verified'
  | 'retrospective_validated'
  | 'silent_prospective_validated'
  | 'clinician_assisted_validated'
  | 'clinical_release_qualified';

export type ModulePermissionLevel =
  'research_only' | 'validation_only' | 'clinical_permitted' | 'disabled';

export type ScientificChangeClassification =
  | 'INDICATION_MODULE'
  | 'EVIDENCE_PATH'
  | 'MEASUREMENT_CAPABILITY'
  | 'TARGET_GEOMETRY'
  | 'PARAMETER';

export type AnyCandidateRole = CandidateRole | CandidateRoleV2 | string;

export interface ScientificPolicySignature {
  readonly signerRole:
    | 'scientific_lead'
    | 'indication_clinical_lead'
    | 'technical_lead'
    | 'quality_regulatory_lead'
    | 'specialty_reviewer';
  readonly signerName: string;
  readonly signerEmail: string;
  readonly keyId: string;
  readonly algorithm: string;
  readonly signature: string;
  readonly signedAt: string;
}

export interface ScientificPolicyApproval {
  readonly id: string;
  readonly policyReleaseId: string;
  readonly indicationModuleReleaseId?: string | undefined;
  readonly approvalRole:
    'scientific' | 'clinical' | 'technical' | 'quality_regulatory' | 'specialty_reviewer';
  readonly approverId: string;
  readonly approverName: string;
  readonly decision: 'approved' | 'approved_with_conditions' | 'rejected';
  readonly rationale?: string | undefined;
  readonly approvedAt: string;
}

export interface TargetFamilyGeometryPermission {
  readonly targetFamilyId: string;
  readonly permittedGeometryTypes: readonly TargetGeometryType[];
  readonly permittedGeneratorIds: readonly string[];
  readonly transformationRules?: readonly string[] | undefined;
}

export interface TargetGeometryPolicy {
  readonly indicationModuleReleaseId: string;
  readonly targetFamilyPermissions: readonly TargetFamilyGeometryPermission[];
}

export interface MeasurementCapabilityPolicy {
  readonly capabilityCode: string;
  readonly modality: MeasurementModality;
  readonly requirement:
    'required' | 'required_for_refinement' | 'optional' | 'research_only' | 'disabled';
  readonly permittedCandidateRoles: readonly AnyCandidateRole[];
  readonly permittedGeneratorIds: readonly string[];
  readonly minimumQcRuleId?: string | undefined;
  readonly minimumReliabilityRuleId?: string | undefined;
  readonly missingMeasurementBehaviour:
    'block' | 'disable_capability' | 'fallback' | 'allow_with_limitation';
  readonly limitations: readonly string[];
}

export interface MeasurementFallbackRule {
  readonly triggeringConditionCode: string;
  readonly fromCapability: string;
  readonly fallbackConfigurationId?: string | undefined;
  readonly resultingCapabilityState: 'fallback_only' | 'disabled' | 'abstain';
  readonly explanationTemplateId: string;
}

export interface MeasurementPolicy {
  readonly indicationModuleReleaseId: string;
  readonly requirements: readonly MeasurementCapabilityPolicy[];
  readonly multimodalFusionPolicy: 'prohibited' | 'descriptive_only' | 'validated_model_only';
  readonly fallbackRules: readonly MeasurementFallbackRule[];
}

export interface ReliabilityCapabilityRule {
  readonly capabilityCode: string;
  readonly reliabilityMethodIds: readonly string[];
  readonly minimumParameterRefs: readonly string[];
  readonly requiredMeasurementCount?: number | undefined;
  readonly crossRunRequired?: boolean | undefined;
  readonly splitHalfRequired?: boolean | undefined;
  readonly sensitivityAnalysisRequired?: boolean | undefined;
  readonly failureBehaviour: 'disable_capability' | 'fallback' | 'block_module';
  readonly limitations: readonly string[];
}

export interface ReliabilityPolicy {
  readonly indicationModuleReleaseId: string;
  readonly capabilityRules: readonly ReliabilityCapabilityRule[];
  readonly crossMeasurementRules?: readonly string[] | undefined;
  readonly overallBundleBehaviour: 'capability_specific' | 'module_defined';
}

export interface CandidateGeneratorPermission {
  readonly generatorId: string;
  readonly generatorVersion: string;
  readonly status: 'required' | 'permitted' | 'research_only' | 'disabled';
  readonly candidateRoles: readonly AnyCandidateRole[];
  readonly evidencePathIds: readonly string[];
  readonly targetFamilyIds: readonly string[];
  readonly geometryTypes: readonly TargetGeometryType[];
  readonly requiredCapabilityCodes: readonly string[];
  readonly fallbackGeneratorIds?: readonly string[] | undefined;
}

export interface CandidateGenerationPolicy {
  readonly indicationModuleReleaseId: string;
  readonly pluginReleaseId: string;
  readonly generators: readonly CandidateGeneratorPermission[];
}

export interface RankingProfileRef {
  readonly profileId: string;
  readonly modelType: 'lexicographic' | 'weighted_geometric_mean' | 'ordered_deterministic_rules';
  readonly weights?: Readonly<Record<string, number>> | undefined;
  readonly tieBreakingRuleId: string;
}

export interface RankingPolicy {
  readonly indicationModuleReleaseId: string;
  readonly comparisonDomainPermissions: readonly ComparisonDomainPermission[];
  readonly rankingProfiles: readonly RankingProfileRef[];
  readonly crossDomainScalarRanking: 'prohibited' | 'explicitly_validated_only';
}

export interface RefinementPolicyProfile {
  readonly id: string;
  readonly refinementKind: string;
  readonly baselineRole: AnyCandidateRole;
  readonly refinedRole: AnyCandidateRole;
  readonly requiredCapabilityCodes: readonly string[];
  readonly permittedTargetFamilyIds: readonly string[];
  readonly minimumIncrementalValueParameterRefs: readonly string[];
  readonly maximumTransferDistanceParameterRefs?: readonly string[] | undefined;
  readonly accessibilityLossRuleId?: string | undefined;
  readonly geometryChangeRuleId?: string | undefined;
  readonly adoptionBehaviour: 'prefer_if_all_pass' | 'show_as_alternative' | 'research_only';
  readonly fallbackBehaviour: 'retain_baseline' | 'abstain' | 'module_defined';
}

export interface RefinementPolicy {
  readonly indicationModuleReleaseId: string;
  readonly profiles: readonly RefinementPolicyProfile[];
}

export interface RedundancyPolicy {
  readonly indicationModuleReleaseId: string;
  readonly spatialDistanceThresholdMmParameterRef: string;
  readonly networkCorrelationThresholdParameterRef?: string | undefined;
  readonly clinicalDiversityRule: 'enforce_distinct_anatomical_families' | 'allow_family_variants';
}

export interface SlateAssemblyPolicy {
  readonly indicationModuleReleaseId: string;
  readonly minCandidates: number;
  readonly maxCandidates: number;
  readonly primarySlotsCount: number;
  readonly allowPartialPrimarySlots: boolean;
  readonly allowEmptySlateWithAbstention: boolean;
}

export interface AbstentionPolicy {
  readonly indicationModuleReleaseId: string;
  readonly allowedAbstentionClasses: readonly string[];
  readonly supportPartialAbstention: boolean;
  readonly mandatoryClinicianAdvisory: boolean;
}

export interface ExplanationPolicy {
  readonly indicationModuleReleaseId: string;
  readonly requiredSections: readonly string[];
  readonly disclaimers: readonly string[];
}

export interface ParameterBoundsDefinition {
  readonly minValue?: number | undefined;
  readonly maxValue?: number | undefined;
  readonly allowedValues?: readonly (string | number)[] | undefined;
  readonly unit?: string | undefined;
}

export interface ScientificPolicyParameter {
  readonly id: string;
  readonly code: string;
  readonly namespace: string;
  readonly valueType: 'number' | 'string' | 'boolean' | 'string_array';
  readonly defaultValue: string | number | boolean | readonly string[];
  readonly bounds?: ParameterBoundsDefinition | undefined;
  readonly clinicalJustification: string;
  readonly frozen: boolean;
}

export interface ProhibitedScientificConfiguration {
  readonly id: string;
  readonly code: string;
  readonly description: string;
  readonly conditionPredicate: string;
  readonly severity: 'FATAL_REJECT' | 'MODE_DOWNGRADE';
}

export interface IndicationPolicyBinding {
  readonly id: string;
  readonly indicationModuleReleaseId: string;
  readonly modulePermission: ModulePermissionLevel;
  readonly permittedModes: readonly MagniomMode[];
  readonly evidencePathPermissions: readonly import('./evidence-governance.js').EvidencePathPermission[];
  readonly targetGeometryPolicy: TargetGeometryPolicy;
  readonly measurementPolicy: MeasurementPolicy;
  readonly reliabilityPolicy: ReliabilityPolicy;
  readonly candidateGenerationPolicy: CandidateGenerationPolicy;
  readonly rankingPolicy: RankingPolicy;
  readonly refinementPolicy: RefinementPolicy;
  readonly redundancyPolicy: RedundancyPolicy;
  readonly slateAssemblyPolicy: SlateAssemblyPolicy;
  readonly abstentionPolicy: AbstentionPolicy;
  readonly explanationPolicy: ExplanationPolicy;
  readonly permittedCompatibilityConfigurationIds: readonly string[];
  readonly limitations: readonly string[];
}

export interface ScientificPolicyReleaseV2 {
  readonly id: string;
  readonly code: string;
  readonly semanticVersion: string;
  readonly title: string;
  readonly description: string;
  readonly lifecycleStatus: PolicyLifecycleStatus;
  readonly validationStatus: PolicyValidationStatus;
  readonly scope: 'single_indication' | 'multi_indication';
  readonly indicationPolicyBindings: readonly IndicationPolicyBinding[];
  readonly compatibilityConfigurations: readonly ScientificCompatibilityConfiguration[];
  readonly globalProhibitions: readonly ProhibitedScientificConfiguration[];
  readonly parameterDefinitions: readonly ScientificPolicyParameter[];
  readonly parameterValues: Readonly<Record<string, string | number | boolean | readonly string[]>>;
  readonly validationEvidenceIds: readonly string[];
  readonly changeClassification: ScientificChangeClassification;
  readonly supersedesReleaseId?: string | undefined;
  readonly payloadSha256: string;
  readonly compatibilityManifestSha256: string;
  readonly releaseManifestSha256: string;
  readonly approvals: readonly ScientificPolicyApproval[];
  readonly signatures: readonly ScientificPolicySignature[];
  readonly createdAt: string;
  readonly releasedAt?: string | undefined;
}

export interface ScientificPolicyReleaseManifestV2 {
  readonly scientificPolicyReleaseId: string;
  readonly indicationModuleReleaseIds: readonly string[];
  readonly compatibilityConfigurationIds: readonly string[];
  readonly evidenceLibraryReleaseIds: readonly string[];
  readonly targetEngineReleaseIds: readonly string[];
  readonly pluginReleaseRefs: readonly ComponentReleaseRef[];
  readonly generatorReleaseRefs: readonly ComponentReleaseRef[];
  readonly measurementProviderReleaseRefs: readonly (
    ComponentReleaseRef | ComponentRequirementRef
  )[];
  readonly manifestSha256: string;
  readonly generatedAt: string;
}

export interface ScientificImpactReport {
  readonly fromReleaseId: string;
  readonly toReleaseId: string;
  readonly classification: ScientificChangeClassification;
  readonly affectedIndicationModuleIds: readonly string[];
  readonly affectedEvidencePathIds: readonly string[];
  readonly capabilityQualificationChanges: readonly {
    readonly moduleCode: string;
    readonly capabilityCode: string;
    readonly previousState: string;
    readonly newState: string;
  }[];
  readonly parameterDeltas: readonly {
    readonly parameterCode: string;
    readonly oldValue: unknown;
    readonly newValue: unknown;
    readonly unit?: string | undefined;
  }[];
  readonly clinicalReviewRequired: boolean;
  readonly generatedAt: string;
}
