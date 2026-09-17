/**
 * MAGNIOM Canonical Target Candidate & Slate Domain Types v2.0
 * Conforms to MAGNIOM-Canonical Multi-Indication Data Specification v2.0 (§69-87)
 */

import type {
  MagniomMode,
  CandidateStatus,
  CandidateRoleV2,
  LegacyEvidenceTier,
  ConfidenceLevel,
  SlateStatus,
  AbstentionType,
} from './enums.js';
import type { CommonProvenance, AtlasRef, UncertaintyObject } from './types.js';
import type { TargetGeometry, BodyRegionRef, Coordinate3D } from './target-geometry.js';

export interface TargetEvidenceProfileV2 {
  readonly highestEvidenceTier: LegacyEvidenceTier;
  readonly indicationMatch: boolean;
  readonly indicationModuleMatch: boolean;
  readonly populationMatch: boolean;
  readonly diseaseStageMatch: 'match' | 'mismatch' | 'not_applicable' | 'uncertain';
  readonly targetFamilyMatch: boolean;
  readonly targetingMethodMatch: boolean;
  readonly targetGeometryMatch: boolean;
  readonly treatmentContextMatch?: 'match' | 'partial' | 'mismatch' | 'unknown' | undefined;
  readonly evidenceClaimIds: readonly string[];
  readonly conflictingEvidenceClaimIds?: readonly string[] | undefined;
  readonly evidenceConfidence: ConfidenceLevel;
  readonly applicabilityLimitations: readonly string[];
  readonly evidenceSummary: string;
}

export interface TargetCandidateV2 {
  readonly id: string;
  readonly version: string;
  readonly caseId: string;
  readonly caseIndicationId: string;
  readonly assessmentId?: string | undefined;
  readonly mode: MagniomMode;
  readonly indicationModuleReleaseId: string;
  readonly scientificPolicyReleaseId: string;
  readonly generationStatus: CandidateStatus;
  readonly candidateRole: CandidateRoleV2;
  readonly targetFamilyId: string;
  readonly therapeuticCircuitIds: readonly string[];
  readonly clinicalObjectiveIds: readonly string[];
  readonly targetGeometry: TargetGeometry;
  readonly standardSpaceGeometry?: TargetGeometry | undefined;
  readonly atlasAnnotations: readonly AtlasRef[];
  readonly clinicalEvidence: TargetEvidenceProfileV2;
  readonly diseaseStageContextId?: string | undefined;
  readonly lesionContextIds?: readonly string[] | undefined;
  readonly measurementBundleId: string;
  readonly reliabilityBundleId?: string | undefined;
  readonly reliedOnMeasurementIds: readonly string[];
  readonly reliedOnReliabilityIds: readonly string[];
  readonly nominationRationale: string;
  readonly counterarguments: readonly string[];
  readonly supportingEvidenceClaimIds: readonly string[];
  readonly conflictingEvidenceClaimIds: readonly string[];
  readonly targetEngineVersionId: string;
  readonly evidenceLibraryReleaseId: string;
  readonly provenance: CommonProvenance;
  readonly lesionTargetRelationship?: LesionTargetRelationship | undefined;
  readonly motorMappingFit?: MotorMappingFitProfile | undefined;
  readonly structuralConnectivityFit?: StructuralConnectivityFitProfile | undefined;
  readonly treatmentContextEvaluation?: TargetTreatmentContextEvaluation | undefined;
  readonly researchExtension?: ResearchTargetExtension | undefined;
  readonly dataOrigin?: import('./enums.js').DataOrigin | undefined;
  readonly scientificMaturity?: import('./enums.js').ScientificMaturity | undefined;
  readonly clinicalPromotionStatus?: import('./enums.js').ClinicalPromotionStatus | undefined;
  readonly targetDefinitionOrigin?: import('./enums.js').TargetDefinitionOrigin | undefined;
  readonly inputDataOrigin?: import('./enums.js').InputDataOrigin | undefined;
  readonly patientPersonalizationStatus?:
    import('./enums.js').PatientPersonalizationStatus | undefined;
  readonly clinicalApprovalStatus?: import('./enums.js').ClinicalPromotionStatus | undefined;
  readonly targetingMethodId?: string | undefined;
  readonly approvalReference?: string | undefined;
}

// ---------------------------------------------------------------------------
// Candidate Domain Fit Profiles & Relationships (§74-77, §106)
// ---------------------------------------------------------------------------

export type LesionTargetRelationshipType =
  | 'outside_lesion'
  | 'adjacent'
  | 'partially_involved'
  | 'substantially_involved'
  | 'destroyed_or_absent'
  | 'not_assessable';

export type TissueIntegrityType =
  'apparently_intact' | 'altered' | 'severely_altered' | 'not_assessable';

export interface LesionTargetRelationship {
  readonly lesionContextId: string;
  readonly targetRelationship: LesionTargetRelationshipType;
  readonly minimumDistanceToLesionMm?: number | undefined;
  readonly tissueIntegrity: TissueIntegrityType;
  readonly interpretation: string;
}

export interface MotorMappingFitProfile {
  readonly motorMappingRunId: string;
  readonly relevantBodyRegion: BodyRegionRef;
  readonly hotspotCoordinate?: Coordinate3D | undefined;
  readonly candidateToHotspotDistanceMm?: number | undefined;
  readonly mapOverlap?: number | undefined;
  readonly mapReliabilityId?: string | undefined;
  readonly interpretation: string;
}

export interface StructuralConnectivityFitProfile {
  readonly sourceMeasurementId: string;
  readonly tractIds: readonly string[];
  readonly connectivityMetrics: Readonly<Record<string, number>>;
  readonly method: string;
  readonly modelVersion: string;
  readonly reliabilityId?: string | undefined;
  readonly interpretation: string;
}

export type TreatmentContextApplicability = 'full' | 'partial' | 'limited' | 'not_applicable';

export interface TargetTreatmentContextEvaluation {
  readonly treatmentContextSnapshotId: string;
  readonly requiredContextIds: readonly string[];
  readonly matchedContextIds: readonly string[];
  readonly applicability: TreatmentContextApplicability;
  readonly limitations: readonly string[];
  readonly interpretation: string;
}

export interface ResearchTargetExtension {
  readonly experimentalHypothesisCode: string;
  readonly explorativeConfidence?: number | undefined;
  readonly nonStandardParameters?: Readonly<Record<string, unknown>> | undefined;
  readonly notes?: string | undefined;
}

export type SlatePositionV2 =
  'primary_1' | 'primary_2' | 'primary_3' | 'additional_a' | 'additional_b';

export interface SlateCandidateRefV2 {
  readonly targetCandidateId: string;
  readonly position: SlatePositionV2;
  readonly role: CandidateRoleV2;
  readonly rankWithinRole?: number | undefined;
  readonly inclusionReason: string;
  readonly redundancyWith?: readonly string[] | undefined;
}

export interface SlateConvergenceProfileV2 {
  readonly comparedSources: readonly string[];
  readonly pairwiseRelationships: readonly {
    readonly sourceA: string;
    readonly sourceB: string;
    readonly spatialAgreementMm?: number | undefined;
    readonly agreement: 'high' | 'moderate' | 'low' | 'not_assessable';
    readonly interpretation?: string | undefined;
  }[];
  readonly overall: 'high' | 'moderate' | 'low' | 'not_assessable';
  readonly interpretation: string;
}

export interface SlateContradictionProfileV2 {
  readonly evaluatedPairs: readonly string[];
  readonly hasContradiction: boolean;
  readonly contradictoryFindings: readonly {
    readonly candidateId: string;
    readonly conflictingDomain: string;
    readonly severity: 'low' | 'moderate' | 'severe';
    readonly clinicalNote: string;
  }[];
  readonly interpretation: string;
}

export interface ClinicalCoverageProfileV2 {
  readonly objectives: readonly {
    readonly clinicalObjectiveId: string;
    readonly priorityRank: number;
    readonly coveredByCandidateIds: readonly string[];
    readonly coverage: 'strong' | 'partial' | 'none' | 'not_evidence_mappable';
    readonly interpretation?: string | undefined;
  }[];
  readonly redundancySummary: string;
}

export interface AbstentionProfileV2 {
  readonly abstentionType: AbstentionType;
  readonly reasonCodes: readonly string[];
  readonly explanation: string;
  readonly affectedCapabilities?: readonly string[] | undefined;
  readonly fallbackOptions: readonly string[];
}

export interface TargetSlateV2 {
  readonly id: string;
  readonly version: string;
  readonly caseId: string;
  readonly caseIndicationId: string;
  readonly assessmentId?: string | undefined;
  readonly mode: MagniomMode;
  readonly indicationModuleReleaseId: string;
  readonly scientificPolicyReleaseId: string;
  readonly status: SlateStatus;
  readonly generatedAt: string;
  readonly phenotypeSnapshotId: string;
  readonly clinicalObjectiveIds: readonly string[];
  readonly diseaseStageContextId?: string | undefined;
  readonly lesionContextIds?: readonly string[] | undefined;
  readonly measurementBundleId: string;
  readonly reliabilityBundleId?: string | undefined;
  readonly evidenceLibraryReleaseId: string;
  readonly targetEngineVersionId: string;
  readonly pipelineVersionIds: readonly string[];
  readonly primaryCandidates: readonly SlateCandidateRefV2[];
  readonly additionalCandidates: readonly SlateCandidateRefV2[];
  readonly slateConvergence: SlateConvergenceProfileV2;
  readonly slateContradiction?: SlateContradictionProfileV2 | undefined;
  readonly clinicalCoverage: ClinicalCoverageProfileV2;
  readonly abstention?: AbstentionProfileV2 | undefined;
  readonly globalUncertainty?: UncertaintyObject | undefined;
  readonly generationSummary: string;
  readonly scientificLimitations: readonly string[];
  readonly payloadSha256: string;
  readonly provenance: CommonProvenance;
  readonly dataOrigin?: import('./enums.js').DataOrigin | undefined;
  readonly scientificMaturity?: import('./enums.js').ScientificMaturity | undefined;
}

// ---------------------------------------------------------------------------
// Cross-Indication Target Review (§89) & Clinician Modifications (§96)
// ---------------------------------------------------------------------------

export interface CrossSlateSpatialRelationship {
  readonly candidateIdA: string;
  readonly candidateIdB: string;
  readonly distanceMm?: number | undefined;
  readonly relationship: 'identical' | 'overlapping' | 'adjacent' | 'remote';
  readonly interpretation?: string | undefined;
}

export interface ClinicalObjectiveConflict {
  readonly objectiveIdA: string;
  readonly objectiveIdB: string;
  readonly conflictType: 'antagonistic' | 'competing_priority' | 'physiological_tradeoff';
  readonly explanation: string;
}

export interface CrossIndicationTargetReview {
  readonly id: string;
  readonly caseId: string;
  readonly targetSlateIds: readonly string[];
  readonly spatialRelationships: readonly CrossSlateSpatialRelationship[];
  readonly overlappingTargetFamilyIds: readonly string[];
  readonly conflictingObjectives: readonly ClinicalObjectiveConflict[];
  readonly summary: string;
  readonly mode: MagniomMode;
  readonly provenance: CommonProvenance;
}

export interface ClinicianModifiedTarget {
  readonly sourceTargetCandidateId: string;
  readonly modifiedGeometry: TargetGeometry;
  readonly modificationDistanceMm?: number | undefined;
  readonly modificationReason: string;
  readonly createdBy: string;
  readonly createdAt: string;
}

// ---------------------------------------------------------------------------
// Canonical Target Engine Input & Output Manifest (§111-112)
// ---------------------------------------------------------------------------

export interface TargetEngineInputV2 {
  readonly caseId: string;
  readonly caseIndicationId: string;
  readonly mode: MagniomMode;
  readonly indicationModuleReleaseId: string;
  readonly phenotypeSnapshotId: string;
  readonly clinicalObjectiveIds: readonly string[];
  readonly diseaseStageContextId?: string | undefined;
  readonly lesionContextIds?: readonly string[] | undefined;
  readonly treatmentContextSnapshotId?: string | undefined;
  readonly measurementBundleId: string;
  readonly reliabilityBundleId?: string | undefined;
  readonly evidenceLibraryReleaseId: string;
  readonly scientificPolicyReleaseId: string;
  readonly targetEngineVersionId: string;
  readonly deviceContextIds?: readonly string[] | undefined;
}

export interface CanonicalTargetEngineOutputManifestV2 {
  readonly generated_candidate_ids: readonly string[];
  readonly eligible_candidate_ids: readonly string[];
  readonly suppressed_candidate_ids: readonly string[];
  readonly target_slate_id?: string | undefined;
  readonly abstention?: AbstentionProfileV2 | undefined;
  readonly warnings: readonly string[];
  readonly reproducibility_manifest_sha256: string;
}

// ---------------------------------------------------------------------------
// Phase 2: Target Engine Core, Plugin SDK & Generator Contracts (§15-41)
// ---------------------------------------------------------------------------

export interface GateEvaluation {
  readonly gateCode: import('./enums.js').GateCode;
  readonly applicability: import('./enums.js').GateApplicability;
  readonly result: import('./enums.js').GateResultStatus;
  readonly reasonCodes: readonly string[];
  readonly policyRuleIds: readonly string[];
  readonly evidencePathIds?: readonly string[] | undefined;
  readonly interpretation: string;
}

export interface CandidateLineage {
  readonly lineageType: import('./enums.js').LineageType;
  readonly parentCandidateDraftId?: string | undefined;
  readonly baselineCandidateDraftId?: string | undefined;
  readonly refinementKind?: import('./enums.js').RefinementKind | undefined;
}

export interface ScientificFeatureValue {
  readonly code: string;
  readonly value: number;
  readonly unit?: string | undefined;
  readonly confidence?: number | undefined;
  readonly isApplicable: boolean;
  readonly provenanceDescription?: string | undefined;
}

export interface GeneratorTrace {
  readonly executionTimeMs?: number | undefined;
  readonly algorithmCode: string;
  readonly algorithmVersion: string;
  readonly internalCalculations?: Readonly<Record<string, unknown>> | undefined;
}

export interface CandidateDraft {
  readonly draftId: string;
  readonly generatorId: string;
  readonly targetFamilyId: string;
  readonly proposedRole: CandidateRoleV2;
  readonly targetGeometry: TargetGeometry;
  readonly standardSpaceGeometry?: TargetGeometry | undefined;
  readonly evidencePathIds: readonly string[];
  readonly clinicalObjectiveIds: readonly string[];
  readonly reliedOnMeasurementIds: readonly string[];
  readonly reliedOnReliabilityIds: readonly string[];
  readonly lineage?: CandidateLineage | undefined;
  readonly rawScientificFeatures: readonly ScientificFeatureValue[];
  readonly generatorLimitations: readonly string[];
  readonly nominationRationale: string;
  readonly generatorTrace: GeneratorTrace;
  readonly dataOrigin?: import('./enums.js').DataOrigin | undefined;
  readonly scientificMaturity?: import('./enums.js').ScientificMaturity | undefined;
  readonly clinicalPromotionStatus?: import('./enums.js').ClinicalPromotionStatus | undefined;
  readonly targetDefinitionOrigin?: import('./enums.js').TargetDefinitionOrigin | undefined;
  readonly inputDataOrigin?: import('./enums.js').InputDataOrigin | undefined;
  readonly clinicalApprovalStatus?: import('./enums.js').ClinicalPromotionStatus | undefined;
  readonly patientPersonalizationStatus?:
    import('./enums.js').PatientPersonalizationStatus | undefined;
  readonly targetingMethodId?: string | undefined;
  readonly approvalReference?: string | undefined;
}

export interface CandidateGeneratorDescriptor {
  readonly id: string;
  readonly code: string;
  readonly semanticVersion: string;
  readonly indicationModuleReleaseIds: readonly string[];
  readonly candidateRoles: readonly CandidateRoleV2[];
  readonly targetFamilyScopeIds: readonly string[];
  readonly evidencePathStatusScope: readonly (
    'clinical_permitted' | 'validation_permitted' | 'research_permitted'
  )[];
  readonly permittedModes: readonly MagniomMode[];
  readonly requiredCapabilities: readonly string[];
  readonly optionalCapabilities: readonly string[];
  readonly permittedGeometryTypes: readonly import('./enums.js').TargetGeometryType[];
  readonly baselineRelationship: import('./enums.js').BaselineRelationship;
  readonly deterministic: true;
  readonly generatorFailurePolicy: import('./enums.js').GeneratorFailurePolicy;
  readonly configurationSha256: string;
}

export interface GeneratorAbstention {
  readonly reasonCode: string;
  readonly explanation: string;
}

export interface GeneratorDiagnostic {
  readonly level: 'info' | 'warning' | 'error';
  readonly code: string;
  readonly message: string;
}

export interface CandidateGeneratorResult {
  readonly generatorId: string;
  readonly generatorVersion: string;
  readonly status: import('./enums.js').GeneratorStatus;
  readonly candidates: readonly CandidateDraft[];
  readonly abstention?: GeneratorAbstention | undefined;
  readonly diagnostics: readonly GeneratorDiagnostic[];
}

export interface IndicationTargetingPluginManifest {
  readonly id: string;
  readonly code: string;
  readonly semanticVersion: string;
  readonly indicationModuleReleaseIds: readonly string[];
  readonly permittedModes: readonly MagniomMode[];
  readonly generatorDescriptors: readonly CandidateGeneratorDescriptor[];
  readonly featureProviderVersions: readonly string[];
  readonly comparisonProfileIds: readonly string[];
  readonly refinementProfileIds: readonly string[];
  readonly slateProfileId: string;
  readonly requiredDomainSchemaVersion: string;
  readonly requiredPolicySchemaVersion: string;
  readonly codeCommit: string;
  readonly packageDigestSha256: string;
  readonly scientificConfigurationSha256: string;
}

export interface ModuleContextValidation {
  readonly valid: boolean;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
}

// ---------------------------------------------------------------------------
// Phase 2: Comparison Domains & Ranking Profiles (§82-89)
// ---------------------------------------------------------------------------

export interface ComparisonDomainDefinition {
  readonly id: string;
  readonly code: string;
  readonly indicationModuleReleaseId: string;
  readonly comparisonBasis: import('./enums.js').ComparisonDomainBasis;
  readonly rankingProfileId: string;
  readonly targetFamilyIds?: readonly string[] | undefined;
  readonly candidateRoles?: readonly CandidateRoleV2[] | undefined;
}

export interface ComparisonDomain {
  readonly id: string;
  readonly code: string;
  readonly indicationModuleReleaseId: string;
  readonly candidateIds: readonly string[];
  readonly comparisonBasis: import('./enums.js').ComparisonDomainBasis;
  readonly rankingProfileId: string;
  readonly comparable: boolean;
  readonly reasonIfNotComparable?: string | undefined;
}

export interface ComparisonDomainPermission {
  readonly domainCode: string;
  readonly permittedModes: readonly MagniomMode[];
  readonly allowedBasis: import('./enums.js').ComparisonDomainBasis;
}

export interface RankingFeatureDefinition {
  readonly code: string;
  readonly weight: number;
  readonly direction: 'maximize' | 'minimize';
  readonly missingValuePolicy: 'zero' | 'neutral' | 'reject_candidate';
}

export interface TiePolicy {
  readonly toleranceEpsilon: number;
  readonly breakSequences: readonly (
    'role_priority' | 'evidence_stratum' | 'feature_value' | 'target_family_code' | 'geometry_hash'
  )[];
}

export interface RankingProfileDefinition {
  readonly id: string;
  readonly code: string;
  readonly version: string;
  readonly indicationModuleReleaseId: string;
  readonly applicableComparisonDomainCodes: readonly string[];
  readonly rankingModel: import('./enums.js').RankingModelType;
  readonly evidenceStratificationRuleId?: string | undefined;
  readonly featureDefinitions: readonly RankingFeatureDefinition[];
  readonly tiePolicy: TiePolicy;
  readonly scientificPolicyReleaseId: string;
}

// ---------------------------------------------------------------------------
// Phase 2: Refinement Framework (§90-97)
// ---------------------------------------------------------------------------

export interface GeometryDifference {
  readonly metric: import('./enums.js').GeometryDistanceMetricType;
  readonly value: number;
  readonly unit: string;
  readonly withinAcceptableBound: boolean;
}

export interface RefinementAdoptionRule {
  readonly ruleCode: string;
  readonly description: string;
  readonly maxDisplacementMm?: number | undefined;
  readonly minIncrementalValue?: number | undefined;
  readonly requiredReliabilityStatus?: string | undefined;
}

export interface RefinementProfileDefinition {
  readonly id: string;
  readonly code: string;
  readonly refinementKind: import('./enums.js').RefinementKind;
  readonly baselineRole: CandidateRoleV2;
  readonly refinedRole: CandidateRoleV2;
  readonly requiredCapabilities: readonly string[];
  readonly adoptionRules: readonly RefinementAdoptionRule[];
  readonly displacementMetric: import('./enums.js').GeometryDistanceMetricType;
  readonly scientificPolicyReleaseId: string;
}

export interface RefinementDecision {
  readonly baselineCandidateId: string;
  readonly refinedCandidateId: string;
  readonly refinementKind: import('./enums.js').RefinementKind;
  readonly geometryDifference: GeometryDifference;
  readonly featureDifferences: readonly {
    readonly featureCode: string;
    readonly baselineValue: number;
    readonly refinedValue: number;
    readonly delta: number;
  }[];
  readonly adoptionConditions: readonly GateEvaluation[];
  readonly status: import('./enums.js').RefinementDecisionStatus;
  readonly interpretation: string;
}

// ---------------------------------------------------------------------------
// Phase 2: Redundancy Framework (§98-105)
// ---------------------------------------------------------------------------

export interface RedundancyAssessment {
  readonly candidateAId: string;
  readonly candidateBId: string;
  readonly comparability: 'comparable' | 'not_comparable';
  readonly metric: import('./enums.js').GeometryDistanceMetricType;
  readonly distanceOrOverlap: number;
  readonly isRedundant: boolean;
  readonly dominantCandidateId?: string | undefined;
  readonly suppressedCandidateId?: string | undefined;
  readonly networkOverlap?: import('./networks.js').NetworkOverlapRedundancy | undefined;
  readonly interpretation: string;
}

// ---------------------------------------------------------------------------
// Phase 2: Slate Assembly & Explanations (§110-121)
// ---------------------------------------------------------------------------

export interface SlateRolePriority {
  readonly position: SlatePositionV2;
  readonly preferredRoles: readonly CandidateRoleV2[];
}

export interface ClinicalCoverageRule {
  readonly objectiveId: string;
  readonly minimumRequiredCandidates: number;
}

export interface DiversityRule {
  readonly minimumTargetFamilyCount?: number | undefined;
  readonly enforceHemisphericDiversity?: boolean | undefined;
}

export interface SlateAssemblyProfileDefinition {
  readonly id: string;
  readonly indicationModuleReleaseId: string;
  readonly maxPrimary: number;
  readonly maxAdditional: number;
  readonly rolePriorities: readonly SlateRolePriority[];
  readonly objectiveCoverageRules: readonly ClinicalCoverageRule[];
  readonly diversityRules: readonly DiversityRule[];
  readonly mandatoryBaselineVisibility?: boolean | undefined;
  readonly allowZeroCandidateAbstention: boolean;
  readonly scientificPolicyReleaseId: string;
}

export interface ExplanationFact {
  readonly code: string;
  readonly title: string;
  readonly detail: string;
  readonly evidencePathId?: string | undefined;
}

export interface CandidateExplanationV2 {
  readonly shortSummary: string;
  readonly clinicalObjective: readonly ExplanationFact[];
  readonly evidenceBasis: readonly ExplanationFact[];
  readonly whyNominated: readonly ExplanationFact[];
  readonly patientSpecificContribution: readonly ExplanationFact[];
  readonly networkContext?: readonly ExplanationFact[] | undefined;
  readonly limitationsAndConflicts: readonly string[];
}

// ---------------------------------------------------------------------------
// Phase 2: Target Engine Request, Resolved Context, Output & Reproducibility (§9-12, 128)
// ---------------------------------------------------------------------------

export interface MagniomTargetEngineRequestV2 {
  readonly caseId: string;
  readonly caseIndicationId: string;
  readonly mode: MagniomMode;
  readonly indicationModuleReleaseId: string;
  readonly phenotypeSnapshotId: string;
  readonly clinicalObjectiveIds: readonly string[];
  readonly diseaseStageContextId?: string | undefined;
  readonly lesionContextIds?: readonly string[] | undefined;
  readonly treatmentContextSnapshotId?: string | undefined;
  readonly measurementBundleId: string;
  readonly reliabilityBundleId?: string | undefined;
  readonly evidenceLibraryReleaseId: string;
  readonly scientificPolicyReleaseId: string;
  readonly targetEngineReleaseId: string;
  readonly deviceContextIds?: readonly string[] | undefined;
  readonly requestedAt?: string | undefined;
  readonly tripleNetworkProfileId?: string | undefined;
}

export interface ScientificPolicyReleaseContext {
  readonly id: string;
  readonly code: string;
  readonly semanticVersion: string;
  readonly parameters?: Readonly<Record<string, unknown>> | undefined;
  readonly compatibilityManifestSha256?: string | undefined;
  readonly releaseManifestSha256?: string | undefined;
  readonly policyPayloadSha256?: string | undefined;
}

export interface ResolvedTargetEngineContextV2 {
  readonly request: MagniomTargetEngineRequestV2;
  readonly phenotypeSnapshot: import('./types.js').PhenotypeSnapshot;
  readonly clinicalObjectives: readonly import('./clinical-context.js').ClinicalObjective[];
  readonly indicationModule: import('./indication-module.js').IndicationModuleRelease;
  readonly diseaseStageContext?: import('./clinical-context.js').DiseaseStageContext | undefined;
  readonly lesionContexts: readonly import('./clinical-context.js').LesionContext[];
  readonly treatmentContextSnapshot?:
    import('./clinical-context.js').TreatmentContextSnapshot | undefined;
  readonly measurementBundle: import('./measurement-bundle.js').MeasurementBundle;
  readonly reliabilityBundle?: import('./measurement-bundle.js').ReliabilityBundle | undefined;
  readonly permittedEvidencePaths: readonly import('./evidence-governance.js').EvidencePath[];
  readonly permittedTargetFamilies: readonly import('./types.js').TargetFamily[];
  readonly scientificPolicy: ScientificPolicyReleaseContext;
  readonly tripleNetworkContext?: import('./networks.js').TripleNetworkTargetContext | undefined;
}

export interface ReproducibilityManifestV2 {
  readonly inputManifestSha256: string;
  readonly engineReleaseId: string;
  readonly pluginId: string;
  readonly pluginVersion: string;
  readonly executedGeneratorManifestHashes: readonly string[];
  readonly outputPayloadSha256: string;
  readonly generatedAt: string;
  readonly mode: MagniomMode;
}

export interface CandidateTraceV2 {
  readonly candidateId: string;
  readonly generatorId: string;
  readonly draftId: string;
  readonly gateEvaluations: readonly GateEvaluation[];
  readonly comparisonDomainCodes: readonly string[];
  readonly withinDomainRank?: number | undefined;
  readonly refinementDecision?: RefinementDecision | undefined;
  readonly redundancyWith?: readonly string[] | undefined;
  readonly suppressionReason?: import('./enums.js').SuppressionReasonV2 | undefined;
  readonly explanation: CandidateExplanationV2;
}

export interface TargetEngineOutputV2 {
  readonly slate: TargetSlateV2;
  readonly allCandidates: readonly TargetCandidateV2[];
  readonly suppressedCandidates: readonly TargetCandidateV2[];
  readonly gateEvaluations: Readonly<Record<string, readonly GateEvaluation[]>>;
  readonly comparisonDomains: readonly ComparisonDomain[];
  readonly refinementDecisions: readonly RefinementDecision[];
  readonly redundancyAssessments: readonly RedundancyAssessment[];
  readonly candidateTraces: readonly CandidateTraceV2[];
  readonly reproducibilityManifest: ReproducibilityManifestV2;
  readonly diagnostics: readonly string[];
}
