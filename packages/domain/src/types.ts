/**
 * Magniom Canonical Target Domain Types
 * Derived directly from MAGNIOM-Canonical Target Data Specification v1.0 & related specifications
 */

import type {
  MagniomMode,
  CandidateRole,
  EvidenceTier,
  TargetMethod,
  CoordinateSpace,
  Hemisphere,
  DecisionType,
  SuppressionReason,
  ConfidenceLevel,
  ObjectLifecycleStatus,
  PersonalisationQualification,
  EpisodeSeverity,
  ClinicalSafetyClearance,
  AppRole,
  CaseState,
  SnapshotState,
  DataQualityState,
  CandidateDecisionAction,
  MagniomInfluence,
  SlateStatus,
  DecisionStatus,
  CandidateStatus,
  FinalTargetSource,
  JobStatus,
  QueueName,
  StorageBucket,
  ArtifactType,
  OutboxEventType,
  ImagingStudyStatus,
  ImagingSeriesType,
  ConnectomicsRunStatus,
  SurfaceMeshType,
  MeshFormat,
  QCWarningSeverity,
  ClinicalImpact,
  StructuralPipelineStage,
  CameraOrientationPreset,
  CoordinateOrientation,
  TransformType,
  NeuronavigationFormat,
  MaturityStage,
  DefectSeverity,
  VerificationGateStatus,
} from './enums.js';

export * from './enums.js';

// ==========================================
// 0. Identity & Multi-Tenancy Domain Types
// ==========================================

export interface Organisation {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly status: 'active' | 'suspended' | 'archived';
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface Site {
  readonly id: string;
  readonly organisationId: string;
  readonly name: string;
  readonly timezone: string;
  readonly status: 'active' | 'inactive';
  readonly createdAt: string;
}

export interface UserProfile {
  readonly userId: string;
  readonly displayName?: string;
  readonly createdAt: string;
}

export interface Clinician {
  readonly id: string;
  readonly organisationId: string;
  readonly userId?: string;
  readonly fullName: string;
  readonly professionalType: string;
  readonly registrationIdentifier?: string;
  readonly tmsSigningAuthority: boolean;
  readonly isVerifiedSpecialist: boolean;
  readonly active: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface Membership {
  readonly id: string;
  readonly organisationId: string;
  readonly userId: string;
  readonly siteId?: string;
  readonly role: AppRole;
  readonly active: boolean;
  readonly createdAt: string;
}

export interface Permission {
  readonly code: string;
  readonly description: string;
}

export interface RolePermission {
  readonly role: AppRole;
  readonly permissionCode: string;
}

// ==========================================
// 0.1 Clinical Core Domain Types
// ==========================================

export interface Patient {
  readonly id: string;
  readonly organisationId: string;
  readonly siteId?: string;
  readonly externalRecordNumber?: string;
  readonly givenName?: string;
  readonly familyName?: string;
  readonly displayLabel: string;
  readonly dateOfBirth?: string;
  readonly status: 'active' | 'inactive' | 'archived';
  readonly synthetic: boolean;
  readonly createdBy?: string;
  readonly createdAt: string;
}

export interface ClinicalCase {
  readonly id: string;
  readonly organisationId: string;
  readonly siteId?: string;
  readonly patientId: string;
  readonly caseCode: string;
  readonly state: CaseState;
  readonly indicationCode: string;
  readonly mode: MagniomMode;
  readonly version: number;
  readonly currentPhenotypeSnapshotId?: string;
  readonly currentTargetSlateId?: string;
  readonly createdBy?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly closedAt?: string;
}

export interface ClinicalAssessment {
  readonly id: string;
  readonly organisationId: string;
  readonly caseId: string;
  readonly clinicianId?: string;
  readonly status: 'draft' | 'completed' | 'superseded';
  readonly createdAt: string;
  readonly completedAt?: string;
}

export interface ClinicalObservation {
  readonly id: string;
  readonly organisationId: string;
  readonly caseId: string;
  readonly assessmentId?: string;
  readonly conceptCode: string;
  readonly observationType: string;
  readonly numericValue?: number;
  readonly textValue?: string;
  readonly booleanValue?: boolean;
  readonly unit?: string;
  readonly instrument?: string;
  readonly qualityState: DataQualityState;
  readonly observedAt: string;
  readonly enteredBy?: string;
  readonly createdAt: string;
}

export interface FunctionalGoal {
  readonly id: string;
  readonly organisationId: string;
  readonly caseId: string;
  readonly description: string;
  readonly patientPriority?: number;
  readonly clinicianPriority?: number;
  readonly active: boolean;
  readonly createdAt: string;
}

export interface PhenotypeDomain {
  readonly code: string;
  readonly name: string;
  readonly description: string;
  readonly primaryCircuitCode: string;
  readonly evidenceTier: EvidenceTier;
}

export interface SymptomMapping {
  readonly id: string;
  readonly symptomConceptCode: string;
  readonly domainCode: string;
  readonly instrument: string;
  readonly itemIdentifier: string;
  readonly mappingStrength: number;
}

// ==========================================
// 1. Common Supporting Primitives
// ==========================================

export interface CommonProvenance {
  readonly createdBy: string;
  readonly createdAt: string; // ISO 8601 UTC
  readonly sourceOrganizationId?: string;
  readonly softwareVersion: string;
}

export interface AtlasRef {
  readonly atlasName: 'HCP_MMP1.0' | 'Glasser360' | 'Schaefer400' | 'AAL' | 'DKT' | string;
  readonly atlasVersion: string;
  readonly space: CoordinateSpace;
}

export interface ClinicalConceptRef {
  readonly system: 'ICD-10' | 'ICD-11' | 'DSM-5' | 'SNOMED-CT' | 'MAGNIOM-ONTOLOGY';
  readonly code: string;
  readonly display: string;
}

export interface UncertaintyObject {
  readonly spatialUncertaintyMm?: number;
  readonly confidence: ConfidenceLevel;
  readonly limitations: readonly string[];
}

// ==========================================
// 2. Spatial Coordinate Primitives & 3D Models
// ==========================================

export interface Vector3D {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export interface MniCoordinate {
  readonly space: 'MNI152NLin2009cAsym';
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly unit?: 'mm';
}

export interface SubjectCoordinate {
  readonly space: 'NATIVE_T1W';
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly unit?: 'mm';
}

export interface SurfaceVertex {
  readonly space: 'fsLR_32k';
  readonly hemisphere: 'L' | 'R';
  readonly vertexIndex: number;
  readonly parcelName: string; // e.g. "8Av_L", "p9-46v_L"
}

export interface SpatialRegion {
  readonly space: CoordinateSpace;
  readonly centerMni: MniCoordinate;
  readonly radiusMm: number;
  readonly primaryHcpParcel?: string;
}

export interface CameraViewConfiguration {
  readonly preset: CameraOrientationPreset;
  readonly fovDegrees: number;
  readonly target: Vector3D;
  readonly position: Vector3D;
  readonly up: Vector3D;
}

export interface TargetRoiDefinition {
  readonly targetId: string;
  readonly candidateRole: CandidateRole;
  readonly centerMni: MniCoordinate;
  readonly centerSubjectT1?: SubjectCoordinate;
  readonly surfaceVertex?: SurfaceVertex;
  readonly primaryHcpParcel: string;
  readonly surfaceAreaMm2: number;
  readonly coilNormalVector: Vector3D;
  readonly targetRadiusMm: number;
}

export interface ConfidenceRegion3D {
  readonly space: CoordinateSpace;
  readonly hemisphere: 'L' | 'R';
  readonly centroidMni: MniCoordinate;
  readonly centroidSubjectT1?: SubjectCoordinate;
  readonly maxRadiusMm: number;
  readonly surfaceAreaMm2: number;
  readonly surfaceVertexIndices: readonly number[];
  readonly boundingBoxMni: readonly [
    readonly [number, number, number],
    readonly [number, number, number],
  ];
  readonly reliabilityLevel: 'HIGH' | 'MODERATE' | 'LOW' | 'UNUSABLE';
  readonly coilSpreadFwhmMm: number; // e.g. 20.0 mm
}

export interface CircuitOverlayMap {
  readonly circuitId: string;
  readonly name: string;
  readonly colormap: 'coolwarm' | 'magma' | 'viridis' | 'inferno' | 'sgacc_gradient';
  readonly hemisphere: 'L' | 'R';
  readonly vertexScalars: readonly number[]; // Intensity per vertex on fsLR_32k
  readonly thresholdMin: number;
  readonly thresholdMax: number;
  readonly defaultOpacity: number; // [0.0, 1.0]
  readonly isVisible: boolean;
}

export interface CoordinateTransformMatrix4x4 {
  readonly sourceSpace: CoordinateSpace;
  readonly targetSpace: CoordinateSpace;
  readonly transformType: TransformType;
  readonly matrix4x4: readonly (readonly number[])[]; // 4x4 row-major matrix
  readonly inverseMatrix4x4?: readonly (readonly number[])[];
  readonly orientation: CoordinateOrientation; // 'RAS' | 'LPS'
  readonly determinant: number;
  readonly isRigidOrAffine: boolean;
}

export interface NeuronavigationExportSimulation {
  readonly targetId: string;
  readonly format: NeuronavigationFormat;
  readonly worldCoordinate: Vector3D;
  readonly normalVector: Vector3D;
  readonly targetLabel: string;
  readonly patientId: string;
  readonly coordinateSpace: CoordinateSpace;
  readonly exportedAt: string;
  readonly payloadText: string;
  readonly roundTripVerified: boolean;
  readonly roundTripErrorMm: number;
}

// ==========================================
// 3. Evidence Knowledge Graph & Circuit Library
// ==========================================

export interface EvidenceSource {
  readonly id: string;
  readonly citation: string;
  readonly doi?: string;
  readonly pubmedId?: string;
  readonly year?: number;
  readonly studyDesign?:
    | 'RCT'
    | 'OPEN_LABEL'
    | 'OBSERVATIONAL'
    | 'META_ANALYSIS'
    | 'COMPUTATIONAL'
    | 'PRECLINICAL'
    | string;
  readonly sampleSize?: number;
  readonly provenance?: CommonProvenance;
}

export interface ClaimSourceLink {
  readonly sourceId: string;
  readonly citation: string;
  readonly doi?: string;
  readonly relationship: 'supporting' | 'conflicting' | 'context';
}

export interface EvidenceClaim {
  readonly id: string;
  readonly code?: string;
  readonly version?: string;
  readonly mode?: MagniomMode;
  readonly sourceId?: string;
  readonly claimType?:
    'EFFICACY' | 'CIRCUIT_ENGAGEMENT' | 'SAFETY' | 'LOCALISATION_PRECISION' | string;
  readonly targetFamilyId?: string;
  readonly circuitId?: string;
  readonly tier: EvidenceTier;
  readonly statement?: string;
  readonly summary?: string;
  readonly certainty?: ConfidenceLevel | 'high' | 'moderate' | 'low' | 'not_assessable';
  readonly effectSize?: number;
  readonly pValue?: number;
  readonly replicationStatus?: string;
  readonly limitations?: readonly string[];
  readonly sources?: readonly ClaimSourceLink[];
  readonly provenance?: CommonProvenance;
}

export interface TherapeuticCircuit {
  readonly id: string;
  readonly code: string; // e.g. "DLPFC_SGACC_ANTISYNC", "TC-MDD-CONVERGENT-001"
  readonly name: string;
  readonly version?: string;
  readonly mode?: MagniomMode;
  readonly tier?: EvidenceTier;
  readonly primaryIndication?: string;
  readonly symptomDomains?: readonly string[];
  readonly canonicalSourceParcel?: string;
  readonly canonicalTargetParcel?: string;
  readonly validationStatus?: 'ESTABLISHED' | 'PROSPECTIVELY_VALIDATED' | 'RESEARCH_ONLY' | string;
  readonly circuitDefinition?: Record<string, unknown>;
  readonly connectedClaimCodes?: readonly string[];
  readonly limitations?: readonly string[];
  readonly provenance?: CommonProvenance;
}

export interface TargetFamily {
  readonly id: string;
  readonly code: string; // e.g. "LEFT_DLPFC_BA46", "TF-MDD-CONVERGENT-LDLPFC-001"
  readonly name: string;
  readonly version?: string;
  readonly mode?: MagniomMode;
  readonly hemisphere: Hemisphere;
  readonly primaryHcpParcel: string;
  readonly fallbackMniCoordinate: MniCoordinate;
  readonly maxAllowableDisplacementMm: number;
  readonly evidenceCeilingTier: EvidenceTier;
  readonly circuitId?: string;
  readonly connectedCircuitCodes?: readonly string[];
  readonly anatomicalDefinition?: Record<string, unknown>;
  readonly candidateGenerationRules?: Record<string, unknown>;
  readonly limitations?: readonly string[];
  readonly provenance?: CommonProvenance;
}

export interface SearchSpace {
  readonly id: string;
  readonly code: string; // e.g. "SS-MDD-LDLPFC-CONVERGENT-001"
  readonly targetFamilyId: string;
  readonly name: string;
  readonly hemisphere: Hemisphere;
  readonly coordinateSpace: CoordinateSpace;
  readonly description: string;
  readonly maskDefinition: Record<string, unknown>;
}

export interface TargetDefinition {
  readonly id: string;
  readonly code: string; // e.g. "TD-MDD-LDLPFC-BA46-MNI-001"
  readonly targetFamilyId: string;
  readonly name: string;
  readonly targetType:
    'group_reference' | 'individualized_rule' | 'anatomical_landmark' | 'scalp_landmark';
  readonly mniCoordinate: MniCoordinate;
  readonly hcpParcel?: string;
  readonly metadata?: Record<string, unknown>;
}

export interface EvidencePathNode {
  readonly nodeType: 'condition' | 'symptom' | 'claim' | 'circuit' | 'target_family' | 'source';
  readonly code: string;
  readonly label: string;
  readonly tier?: EvidenceTier;
}

export interface EvidencePath {
  readonly pathId: string;
  readonly targetFamilyCode: string;
  readonly circuitCode: string;
  readonly claimCode: string;
  readonly claimStatement: string;
  readonly claimTier: EvidenceTier;
  readonly sourceCitation: string;
  readonly sourceDoi?: string;
  readonly nodes: readonly EvidencePathNode[];
}

export interface EvidenceConflictRef {
  readonly claimCode: string;
  readonly statement: string;
  readonly sourceCitation: string;
  readonly sourceDoi?: string;
  readonly clinicalImplication: string;
}

export interface EvidenceLibraryRelease {
  readonly id: string;
  readonly version: string; // SemVer e.g. "MAGNIOM-EVIDENCE-1.0.0"
  readonly releaseDate?: string;
  readonly releasedAt?: string;
  readonly status: ObjectLifecycleStatus | 'draft' | 'validation' | 'active' | 'superseded';
  readonly manifestHash?: string; // SHA-256
  readonly manifestSha256?: string;
  readonly circuits: readonly TherapeuticCircuit[];
  readonly families: readonly TargetFamily[];
  readonly claims: readonly EvidenceClaim[];
  readonly searchSpaces?: readonly SearchSpace[];
  readonly targetDefinitions?: readonly TargetDefinition[];
}

// ==========================================
// 4. Target Reliability & QC
// ==========================================

export interface TargetReliabilityProfile {
  readonly candidateId: string;
  readonly scanDurationMinutes: number;
  readonly meanFramewiseDisplacementMm: number;
  readonly retainedFramesPercentage: number;
  readonly temporalSnr: number;
  readonly splitHalfLocalisationDistanceMm?: number;
  readonly overallReliabilityScore: number; // [0.0, 1.0]
  readonly isReliableForPersonalisation: boolean;
  readonly warnings: readonly string[];
}

export interface TargetAccessibilityProfile {
  readonly candidateId: string;
  readonly scalpToCortexDistanceMm?: number;
  readonly accessibleByStandardCoil: boolean;
  readonly coilAngleRecommendationDeg?: number;
  readonly warning?: string;
}

export interface EFieldProfile {
  readonly candidateId: string;
  readonly peakFieldStrengthVm?: number;
  readonly focalityScore?: number; // [0.0, 1.0]
  readonly simulationEngineVersion?: string;
}

// ==========================================
// 5. Clinical Phenotype & Assessment
// ==========================================

export interface SymptomPriority {
  readonly domainCode: string; // e.g. "DOMAIN-MDD-DYSPHORIC-001", "DOMAIN-MDD-ANXIOSOMATIC-001"
  readonly priorityRank: number;
  readonly clinicianWeight: number; // [0.0, 1.0]
  readonly evidenceMappability: 'direct' | 'indirect' | 'exploratory';
  readonly rationale?: string;
}

export interface DiagnosisAssertion {
  readonly code: string; // e.g. "MDD"
  readonly display: string;
  readonly status: 'confirmed' | 'suspected' | 'ruled_out';
  readonly diagnosticSystem: 'DSM-5' | 'ICD-11';
}

export interface EpisodeProfile {
  readonly active: boolean;
  readonly severity: EpisodeSeverity;
  readonly durationMonths?: number;
  readonly treatmentResistanceStage?: number;
}

export interface PhenotypeSnapshot {
  readonly id: string;
  readonly patientId: string;
  readonly state?: SnapshotState;
  readonly primaryDiagnosis: string;
  readonly episodeSeverity: EpisodeSeverity;
  readonly diagnosisAssertion?: DiagnosisAssertion;
  readonly episodeProfile?: EpisodeProfile;
  readonly safetyClearance?: ClinicalSafetyClearance;
  readonly symptomScores: {
    readonly dysphoriaScore: number;
    readonly anhedoniaScore: number;
    readonly anxiousSomaticScore: number;
    readonly ruminationScore: number;
  };
  readonly symptomPriorities?: readonly SymptomPriority[];
  readonly treatmentHistory: {
    readonly medicationFailuresCount: number;
    readonly priorTmsExposure: boolean;
  };
  readonly phenotypeConfidence?: ConfidenceLevel;
  readonly clinicianSummary?: string;
  readonly confirmedByClinicianId: string;
  readonly confirmedAt: string; // ISO 8601 UTC
  readonly snapshotHash?: string; // SHA-256 seal
}

// ==========================================
// 6. Target Candidate Profiles & Candidate
// ==========================================

export interface RankingFeatureVector {
  readonly evidenceWeight: number; // [0.0, 1.0]
  readonly phenotypeWeight: number; // [0.0, 1.0]
  readonly connectomeWeight: number; // [0.0, 1.0]
  readonly reliabilityWeight: number; // [0.0, 1.0]
  readonly accessibilityWeight: number; // [0.0, 1.0]
}

export interface CandidateConvergenceProfile {
  readonly distanceToEvidenceBaselineMm: number;
  readonly convergenceClassification: 'high' | 'moderate' | 'divergent' | 'not_applicable';
  readonly incrementalGainOverBaseline: number;
}

export interface TargetCandidate {
  readonly id: string;
  readonly familyId: string;
  readonly circuitId: string;
  readonly role: CandidateRole;
  readonly method: TargetMethod;
  readonly evidenceTier: EvidenceTier;
  readonly status?: CandidateStatus | undefined;
  readonly mniCoordinate: MniCoordinate;
  readonly surfaceVertex?: SurfaceVertex | undefined;
  readonly evidenceScore: number; // [0.0, 1.0]
  readonly phenotypeConcordanceScore: number; // [0.0, 1.0]
  readonly connectomeRefinementScore?: number | undefined; // [0.0, 1.0]
  readonly overallScore: number; // [0.0, 1.0]
  readonly rationale: string;
  readonly contraindicationsOrConflicts: readonly string[];
  readonly isSuppressedOrRedundant: boolean;
  readonly suppressionReason?: SuppressionReason | undefined;
  readonly convergenceProfile?: CandidateConvergenceProfile | undefined;
  readonly rankingFeatures?: RankingFeatureVector | undefined;
  readonly evidencePaths?: readonly EvidencePath[] | undefined;
  readonly conflictingEvidence?: readonly EvidenceConflictRef[] | undefined;
  readonly counterarguments?: readonly string[] | undefined;
}

// ==========================================
// 7. Target Slate
// ==========================================

export interface CounterfactualSummary {
  readonly evidenceBaselineCoordinate: MniCoordinate;
  readonly candidateCoordinate: MniCoordinate;
  readonly displacementDistanceMm: number;
  readonly expectedMechanisticGain: number;
  readonly justificationSummary: string;
}

export interface ClinicalCoverageProfile {
  readonly primaryDomainCovered: string;
  readonly secondaryDomainsCovered: readonly string[];
  readonly overallClinicalCoverageScore: number; // [0.0, 1.0]
}

export interface AbstentionProfile {
  readonly hasAbstained: boolean;
  readonly reasonCode?: string;
  readonly clinicianExplanation?: string;
}

export interface TargetSlate {
  readonly id: string;
  readonly caseId: string;
  readonly phenotypeSnapshotId: string;
  readonly scientificPolicyVersion: string;
  readonly evidenceReleaseVersion: string;
  readonly status?: SlateStatus;
  readonly generatedAt: string; // ISO 8601 UTC
  readonly mode: MagniomMode;
  readonly primaryCandidates: readonly TargetCandidate[]; // max 3
  readonly additionalCandidates: readonly TargetCandidate[]; // max 2
  readonly suppressedCandidates: readonly TargetCandidate[];
  readonly personalisationQualification?: PersonalisationQualification;
  readonly counterfactualSummary?: CounterfactualSummary;
  readonly clinicalCoverageProfile?: ClinicalCoverageProfile;
  readonly abstentionProfile?: AbstentionProfile;
  readonly abstentionReason?: string;
  readonly deterministicManifestHash: string; // SHA-256 (64 hex characters)
}

export interface TargetSlateItem {
  readonly targetSlateId: string;
  readonly targetCandidateId: string;
  readonly position: CandidateRole;
  readonly rankWithinRole: number;
  readonly inclusionReason: string;
  readonly redundancyWith?: readonly string[];
}

export interface SuppressedCandidate {
  readonly targetSlateId: string;
  readonly targetCandidateId: string;
  readonly reasonCode: string;
  readonly explanation: string;
}

// ==========================================
// 8. Clinician Decision & Sign-off
// ==========================================

export interface ClinicianAttestation {
  readonly clinicianId: string;
  readonly clinicianName: string;
  readonly licenseNumber?: string;
  readonly statement: string;
  readonly signedAt: string;
  readonly digitalSignatureHash: string;
}

export interface CandidateDecision {
  readonly id?: string;
  readonly clinicianDecisionId?: string;
  readonly targetCandidateId: string;
  readonly action: CandidateDecisionAction;
  readonly reasonCodes: readonly string[];
  readonly freeTextReason?: string;
  readonly modifiedTarget?: Record<string, unknown>;
  readonly replacementCandidateId?: string;
  readonly evidenceReviewed: boolean;
  readonly reliabilityReviewed: boolean;
  readonly counterargumentsReviewed: boolean;
}

export interface FinalTarget {
  readonly id?: string;
  readonly clinicianDecisionId?: string;
  readonly sequenceOrder: number;
  readonly source: FinalTargetSource;
  readonly sourceCandidateId?: string;
  readonly targetRegion: Record<string, unknown>;
  readonly therapeuticObjectives: readonly string[];
}

export interface ClinicianDecision {
  readonly id: string;
  readonly caseId?: string;
  readonly slateId: string;
  readonly clinicianId: string;
  readonly status?: DecisionStatus;
  readonly decisionType: DecisionType;
  readonly selectedCandidateIds: readonly string[];
  readonly overallReasoning?: string;
  readonly magniomInfluence?: MagniomInfluence;
  readonly disagreementWithMagniom?: string;
  readonly manualOverrideDetails?: {
    readonly customCoordinate?: MniCoordinate;
    readonly clinicalRationale: string;
    readonly reasonCode?: string;
  };
  readonly candidateDecisions?: readonly CandidateDecision[];
  readonly finalTargets?: readonly FinalTarget[];
  readonly reviewedCounterfactuals: boolean;
  readonly reviewedConflictingEvidence: boolean;
  readonly decidedAt: string; // ISO 8601 UTC
  readonly attestation?: ClinicianAttestation;
  readonly digitalSignatureHash: string;
  readonly isImmutable: boolean;
  readonly supersedesId?: string;
}

// ==========================================
// 9. Semantic Audit & Workflow
// ==========================================

export interface AuditEvent {
  readonly id: string;
  readonly organisationId: string;
  readonly caseId?: string;
  readonly actorType: string;
  readonly actorUserId?: string;
  readonly actorClinicianId?: string;
  readonly actorService?: string;
  readonly eventType: string;
  readonly aggregateType: string;
  readonly aggregateId: string;
  readonly aggregateSequence: number;
  readonly occurredAt: string;
  readonly payload: Record<string, unknown>;
  readonly previousHash?: string;
  readonly eventHash: string;
}

export interface PublishTargetSlateInput {
  readonly caseId: string;
  readonly phenotypeSnapshotId: string;
  readonly evidenceReleaseId: string;
  readonly engineVersion: string;
  readonly scientificPolicyVersion: string;
  readonly evidenceReleaseVersion: string;
  readonly inputSha256: string;
  readonly deterministicManifestHash: string;
  readonly payloadSha256: string;
  readonly outputPayload: Record<string, unknown>;
  readonly candidates: readonly Record<string, unknown>[];
  readonly mode?: MagniomMode;
}

export interface BeginClinicianReviewInput {
  readonly caseId: string;
  readonly targetSlateId: string;
}

export interface SaveCandidateDecisionInput {
  readonly decisionId: string;
  readonly targetCandidateId: string;
  readonly action: CandidateDecisionAction;
  readonly reasonCodes: readonly string[];
  readonly freeTextReason?: string;
  readonly modifiedTarget?: Record<string, unknown>;
  readonly replacementCandidateId?: string;
  readonly evidenceReviewed?: boolean;
  readonly reliabilityReviewed?: boolean;
  readonly counterargumentsReviewed?: boolean;
}

export interface SignClinicianDecisionInput {
  readonly decisionId: string;
  readonly overallReasoning: string;
  readonly magniomInfluence: MagniomInfluence;
  readonly disagreementWithMagniom?: string;
  readonly reviewedCounterfactuals: boolean;
  readonly reviewedConflictingEvidence: boolean;
  readonly attestationStatement: string;
  readonly finalTargets: readonly FinalTarget[];
  readonly decisionType?: DecisionType;
}

export interface StalenessEvaluation {
  readonly isStale: boolean;
  readonly reason:
    | 'CURRENT'
    | 'STALE_PHENOTYPE_SNAPSHOT'
    | 'TARGET_SLATE_SUPERSEDED'
    | 'CASE_NOT_FOUND'
    | 'SLATE_NOT_FOUND'
    | string;
}

// ==========================================
// 6. Artifact Registry & Storage Domain Types
// ==========================================

export interface ArtifactRecord {
  readonly id: string;
  readonly organisationId: string;
  readonly caseId: string;
  readonly imagingStudyId?: string;
  readonly artifactType: ArtifactType;
  readonly bucket: StorageBucket | string;
  readonly objectPath: string;
  readonly mimeType?: string;
  readonly sha256: string;
  readonly sizeBytes?: number;
  readonly immutable: boolean;
  readonly processingRunId?: string;
  readonly createdAt: string;
}

export interface ArtifactLineage {
  readonly parentArtifactId: string;
  readonly childArtifactId: string;
  readonly relationship: 'DERIVED_FROM' | 'TRANSFORMED_FROM' | 'REFINED_BY' | string;
}

export interface StoragePathInfo {
  readonly organisationId: string;
  readonly caseId?: string;
  readonly studyId?: string;
  readonly runId?: string;
  readonly slateId?: string;
  readonly candidateId?: string;
  readonly decisionId?: string;
  readonly artifactId: string;
  readonly filename: string;
}

// ==========================================
// 7. Workflow Jobs & Progress Domain Types
// ==========================================

export interface WorkflowJob {
  readonly id: string;
  readonly organisationId: string;
  readonly caseId?: string;
  readonly jobType: string;
  readonly status: JobStatus;
  readonly idempotencyKey: string;
  readonly inputReference: Record<string, unknown>;
  readonly workerId?: string;
  readonly attemptCount: number;
  readonly maxAttempts: number;
  readonly createdAt: string;
  readonly claimedAt?: string;
  readonly startedAt?: string;
  readonly completedAt?: string;
  readonly lastHeartbeatAt?: string;
  readonly errorCode?: string;
  readonly errorDetail?: Record<string, unknown>;
}

export interface JobProgress {
  readonly id: string;
  readonly jobId: string;
  readonly stage: string;
  readonly stageDescription: string;
  readonly progressPercent?: number;
  readonly detail: Record<string, unknown>;
  readonly recordedAt: string;
}

export interface EnqueueJobInput {
  readonly organisationId: string;
  readonly caseId?: string;
  readonly jobType: string;
  readonly idempotencyKey: string;
  readonly inputReference: Record<string, unknown>;
  readonly maxAttempts?: number;
}

// ==========================================
// 8. Queue Envelope & Contracts (Zero PHI)
// ==========================================

export interface QueueEnvelope<T = Record<string, unknown>> {
  readonly schemaVersion: '1.0';
  readonly jobId: string;
  readonly organisationId: string;
  readonly caseId: string;
  readonly correlationId: string;
  readonly queueName?: QueueName;
  readonly requestedOperation: string;
  readonly createdAt: string;
  readonly payload: T;
}

export interface TargetGenerationMessage {
  readonly schemaVersion: '1.0';
  readonly jobId: string;
  readonly organisationId: string;
  readonly caseId: string;
  readonly phenotypeSnapshotId: string;
  readonly connectomeRunId?: string;
  readonly targetEngineVersionId: string;
  readonly evidenceLibraryReleaseId: string;
  readonly correlationId: string;
}

// ==========================================
// 9. Transactional Outbox Domain Types
// ==========================================

export interface OutboxEvent {
  readonly id: string;
  readonly organisationId?: string;
  readonly aggregateType: string;
  readonly aggregateId: string;
  readonly eventType: OutboxEventType | string;
  readonly payload: Record<string, unknown>;
  readonly createdAt: string;
  readonly publishedAt?: string;
  readonly attempts: number;
}

// ==========================================
// 10. Imaging Studies, Series & QC Domain Types
// ==========================================

export interface ImagingStudy {
  readonly id: string;
  readonly organisationId: string;
  readonly caseId: string;
  readonly studyUid?: string;
  readonly scannerFieldStrengthT?: number;
  readonly acquiredAt?: string;
  readonly status: ImagingStudyStatus;
  readonly metadata: Record<string, unknown>;
  readonly createdAt: string;
}

export interface ImagingSeries {
  readonly id: string;
  readonly organisationId: string;
  readonly imagingStudyId: string;
  readonly seriesType: ImagingSeriesType;
  readonly seriesUid?: string;
  readonly runNumber?: number;
  readonly metadata: Record<string, unknown>;
  readonly createdAt: string;
}

export interface QCWarning {
  readonly code: string;
  readonly message: string;
  readonly severity: QCWarningSeverity;
  readonly clinicalImpact: ClinicalImpact;
  readonly affectedComponents?: readonly string[];
}

export interface StructuralQCMetrics {
  readonly snrT1w: number;
  readonly cnrT1w: number;
  readonly eulerHolesLh: number;
  readonly eulerHolesRh: number;
  readonly totalEulerNumber: number;
  readonly surfaceSelfIntersectionsLh: number;
  readonly surfaceSelfIntersectionsRh: number;
  readonly corticalThicknessMeanMm: number;
  readonly corticalThicknessStdMm: number;
  readonly corticalThicknessMinMm: number;
  readonly corticalThicknessMaxMm: number;
  readonly corticalThicknessOutlierFraction: number;
  readonly brainMaskVolumeMm3: number;
  readonly csfFraction: number;
  readonly gmFraction: number;
  readonly wmFraction: number;
  readonly mniRegistrationOverlapDice: number;
  readonly mniMutualInformation: number;
}

export interface ImagingQCRun {
  readonly id: string;
  readonly organisationId: string;
  readonly imagingStudyId: string;
  readonly pipelineVersionId: string;
  readonly status: 'pass' | 'conditional' | 'fail';
  readonly usableRestMinutes?: number;
  readonly meanFdMm?: number;
  readonly censoredFraction?: number;
  readonly registrationQuality?: ConfidenceLevel;
  readonly segmentationQuality?: ConfidenceLevel;
  readonly parcelCoverageQuality?: ConfidenceLevel;
  readonly metrics: StructuralQCMetrics | Record<string, unknown>;
  readonly warnings: readonly QCWarning[];
  readonly createdAt: string;
}

// ==========================================
// 11. Connectomics Processing Runs & System Tables
// ==========================================

export interface PipelineVersion {
  readonly id: string;
  readonly pipelineType: string;
  readonly semanticVersion: string;
  readonly containerDigest?: string;
  readonly configurationSha256?: string;
  readonly status: ObjectLifecycleStatus;
  readonly releasedAt?: string;
  readonly createdAt: string;
}

export interface SystemAtlas {
  readonly id: string;
  readonly code: string;
  readonly version: string;
  readonly coordinateSpace: string;
  readonly artifactId?: string;
  readonly status: ObjectLifecycleStatus;
  readonly createdAt: string;
}

export interface ConnectomicsProcessingRun {
  readonly id: string;
  readonly organisationId: string;
  readonly caseId: string;
  readonly imagingStudyId: string;
  readonly pipelineVersionId: string;
  readonly atlasId: string;
  readonly normativeModelId?: string;
  readonly status: ConnectomicsRunStatus;
  readonly inputManifest: Record<string, unknown>;
  readonly inputManifestSha256: string;
  readonly outputManifest?: Record<string, unknown>;
  readonly outputManifestSha256?: string;
  readonly mode: MagniomMode;
  readonly startedAt?: string;
  readonly completedAt?: string;
  readonly createdAt: string;
}

export interface ImagingCandidateRegion {
  readonly targetFamilyVersionId: string;
  readonly candidateCode: string;
  readonly generationMethod: 'CONNECTOME_REFINED' | 'EVIDENCE_ONLY_PRIOR' | 'SYMPTOM_CIRCUIT';
  readonly hemisphere: Hemisphere;
  readonly surfaceVertexIndex: number;
  readonly parcelName: string;
  readonly subjectT1Coordinate: MniCoordinate;
  readonly mniCoordinate: MniCoordinate;
  readonly rawPeakCoordinate?: MniCoordinate;
  readonly clusterAreaMm2: number;
  readonly circuitConcordanceRaw: number;
  readonly circuitConcordancePercentile: number;
  readonly baselineCircuitConcordance: number;
  readonly accessibility: 'good' | 'acceptable' | 'difficult' | 'inaccessible';
  readonly reliabilityScore: number;
  readonly fitInterpretation: string;
}

export interface CircuitMetric {
  readonly circuitVersionId: string;
  readonly metricCode: string;
  readonly metricValue: number;
  readonly interpretation: string;
  readonly candidateRegionCode?: string;
}

export interface CandidateMapRef {
  readonly circuitId: string;
  readonly artifactPath: string;
  readonly artifactSha256: string;
  readonly mapType: 'anticorrelation' | 'concordance' | 'symptom_template';
}

export interface NormativeFinding {
  readonly featureCode: string;
  readonly rawValue?: number;
  readonly observedValue: number;
  readonly expectedValue?: number;
  readonly zScore?: number;
  readonly percentile?: number;
  readonly direction?: 'higher' | 'lower';
  readonly modelVersion: string;
  readonly relevance?: 'supportive' | 'neutral' | 'contradictory' | 'uncertain';
}

export interface CorticalConfidenceRegion {
  readonly space: string;
  readonly hemisphere: Hemisphere;
  readonly surfaceVertexIndices: readonly number[];
  readonly surfaceAreaMm2: number;
  readonly centroidMni: readonly [number, number, number];
  readonly boundingBoxMni: readonly [
    readonly [number, number, number],
    readonly [number, number, number],
  ];
  readonly maxRadiusMm: number;
}

export interface SplitHalfResult {
  readonly distanceMm: number;
  readonly geodesicDistanceMm?: number;
  readonly mapSimilarity: number;
  readonly spearmanSimilarity?: number;
  readonly clusterDice: number;
  readonly clusterJaccard?: number;
  readonly clusterAreaDeltaMm2?: number;
  readonly halfAPeakMni: MniCoordinate;
  readonly halfAMedoidMni: MniCoordinate;
  readonly halfBPeakMni: MniCoordinate;
  readonly halfBMedoidMni: MniCoordinate;
  readonly partitionStrategy: string;
  readonly halfARetainedMinutes: number;
  readonly halfBRetainedMinutes: number;
}

export interface CrossRunResult {
  readonly assessed: boolean;
  readonly distanceMm?: number;
  readonly geodesicDistanceMm?: number;
  readonly mapSimilarity?: number;
  readonly spearmanSimilarity?: number;
  readonly clusterDice?: number;
  readonly clusterJaccard?: number;
  readonly runsEvaluated: readonly number[];
  readonly run1PeakMni?: MniCoordinate;
  readonly run1MedoidMni?: MniCoordinate;
  readonly run2PeakMni?: MniCoordinate;
  readonly run2MedoidMni?: MniCoordinate;
  readonly limitingFactor?: string;
}

export interface PipelineSensitivityResult {
  readonly assessed: boolean;
  readonly sensitivityDistanceMm?: number;
  readonly mapSimilarity?: number;
  readonly clusterDice?: number;
  readonly cd1MedoidMni?: MniCoordinate;
  readonly sd1MedoidMni?: MniCoordinate;
  readonly dispersionInterpretation: string;
}

export interface CanonicalTargetReliabilityProfile {
  readonly id: string;
  readonly version?: string;
  readonly caseId: string;
  readonly imagingStudyId: string;
  readonly connectomeRunId: string;
  readonly targetCandidateId: string;
  readonly targetFamilyVersionId: string;
  readonly qcStatus: 'pass' | 'conditional' | 'fail';
  readonly usableRestingStateMinutes: number;
  readonly meanFramewiseDisplacementMm: number;
  readonly censoredVolumeFraction: number;
  readonly registrationQuality: 'high' | 'moderate' | 'low' | 'fail';
  readonly segmentationQuality: 'high' | 'moderate' | 'low' | 'fail';
  readonly parcelCoverageQuality: 'high' | 'moderate' | 'low' | 'fail';
  readonly crossRunSpatialDistanceMm?: number;
  readonly splitHalfSpatialDistanceMm?: number;
  readonly compositeSpatialDistanceMm: number;
  readonly connectivityReliabilityMetric: number;
  readonly connectivityReliabilityMethod: string;
  readonly spatialReliabilityScore: number;
  readonly connectivityReliabilityScore: number;
  readonly qcReliabilityScore: number;
  readonly overallReliabilityScore: number;
  readonly reliabilityClass: 'high' | 'moderate' | 'low' | 'unreliable';
  readonly isReliableForPersonalisation: boolean;
  readonly targetConfidenceRegion?: CorticalConfidenceRegion;
  readonly splitHalfResult?: SplitHalfResult;
  readonly crossRunResult?: CrossRunResult;
  readonly sensitivityResult?: PipelineSensitivityResult;
  readonly limitingFactors: readonly string[];
  readonly interpretation: string;
  readonly pipelineVersion: string;
  readonly atlasVersions: readonly string[];
  readonly normativeModelVersion?: string;
  readonly createdAt?: string;
  readonly warnings?: readonly string[];
}

export interface ConnectomeTargetInput {
  readonly connectomeRunId: string;
  readonly pipelineVersion: string;
  readonly qcStatus: 'pass' | 'conditional' | 'fail';
  readonly retainedMinutes: number;
  readonly atlasName: string;
  readonly circuitMetrics: readonly CircuitMetric[];
  readonly candidateRegions: readonly ImagingCandidateRegion[];
  readonly candidateMaps?: readonly CandidateMapRef[];
  readonly normativeFindings?: readonly NormativeFinding[];
  readonly reliabilityProfiles?: readonly (
    TargetReliabilityProfile | CanonicalTargetReliabilityProfile
  )[];
  readonly reliabilityProfile?: TargetReliabilityProfile | CanonicalTargetReliabilityProfile;
  readonly surfaceManifestId?: string;
  readonly connectomeManifestId?: string;
  readonly circuitsManifestId?: string;
  readonly reliabilityManifestId?: string;
  readonly quality?: 'pass' | 'conditional' | 'fail';
  readonly candidates?: readonly any[];
}

// ==========================================
// 12. Pipeline Manifests & Provenance
// ==========================================

export interface ManifestFileEntry {
  readonly path: string;
  readonly sha256: string;
  readonly sizeBytes: number;
  readonly artifactType?: ArtifactType;
  readonly mimeType?: string;
}

export interface SoftwareManifest {
  readonly name: string;
  readonly version: string;
  readonly digest?: string;
  readonly dependencies?: Record<string, string>;
}

export interface TransformManifestEntry {
  readonly sourceSpace: CoordinateSpace | string;
  readonly targetSpace: CoordinateSpace | string;
  readonly transformType: 'AFFINE' | 'NONLINEAR_WARP' | 'SPHERICAL_REGISTRATION' | 'IDENTITY';
  readonly transformFileSha256: string;
  readonly forwardTransformArtifactId?: string;
  readonly inverseTransformArtifactId?: string;
}

export interface StageManifest {
  readonly stageNumber: string;
  readonly stageName: StructuralPipelineStage | string;
  readonly status: 'passed' | 'conditional' | 'failed';
  readonly startedAt: string;
  readonly completedAt: string;
  readonly durationSeconds: number;
  readonly inputHashes: readonly string[];
  readonly outputHashes: readonly string[];
  readonly warnings: readonly QCWarning[];
  readonly executionMetrics: Record<string, unknown>;
}

export interface BidsDatasetManifest {
  readonly bidsVersion: '1.11.1' | string;
  readonly datasetName: string;
  readonly subjectId: string;
  readonly sessionCount: number;
  readonly seriesModalities: readonly string[];
  readonly files: readonly ManifestFileEntry[];
  readonly generatedAt: string;
}

export interface StructuralProcessingManifest {
  readonly t1wBiasCorrectedSha256: string;
  readonly brainMaskSha256: string;
  readonly tissueSegmentationSha256: string;
  readonly nativeToMniWarpSha256: string;
  readonly mniToNativeWarpSha256: string;
  readonly qcMetrics: StructuralQCMetrics;
  readonly files: readonly ManifestFileEntry[];
  readonly generatedAt: string;
}

export interface SurfaceReconstructionManifest {
  readonly subjectId: string;
  readonly whiteSurfaceLhSha256: string;
  readonly whiteSurfaceRhSha256: string;
  readonly pialSurfaceLhSha256: string;
  readonly pialSurfaceRhSha256: string;
  readonly midthicknessSurfaceLhSha256: string;
  readonly midthicknessSurfaceRhSha256: string;
  readonly inflatedSurfaceLhSha256: string;
  readonly inflatedSurfaceRhSha256: string;
  readonly corticalThicknessLhSha256: string;
  readonly corticalThicknessRhSha256: string;
  readonly fsLr32kResampledSurfaces: readonly ManifestFileEntry[];
  readonly generatedAt: string;
}

export interface PipelineManifest {
  readonly schemaVersion: '1.0';
  readonly runId: string;
  readonly caseId: string;
  readonly organisationId: string;
  readonly mode: MagniomMode;
  readonly pipelineHash: string;
  readonly software: readonly SoftwareManifest[];
  readonly inputFiles: readonly ManifestFileEntry[];
  readonly outputFiles: readonly ManifestFileEntry[];
  readonly transformGraph: readonly TransformManifestEntry[];
  readonly stages: readonly StageManifest[];
  readonly overallQcStatus: 'pass' | 'conditional' | 'fail';
  readonly warnings: readonly QCWarning[];
  readonly startedAt: string;
  readonly completedAt: string;
}

// ==========================================
// 13. Cortical Surfaces & Mesh Geometry
// ==========================================

export interface SurfaceMeshGeometry {
  readonly surfaceType: SurfaceMeshType;
  readonly hemisphere: Hemisphere;
  readonly coordinateSpace: CoordinateSpace;
  readonly format?: MeshFormat;
  readonly vertexCount: number;
  readonly triangleCount: number;
  readonly vertices: readonly number[]; // Flattened [x0, y0, z0, x1, y1, z1, ...]
  readonly triangles: readonly number[]; // Flattened [i0, j0, k0, i1, j1, k1, ...]
  readonly normals?: readonly number[];
  readonly metrics?: readonly number[]; // e.g. cortical thickness per vertex
  readonly sulcalCurvature?: readonly number[]; // Scalar curvature values per vertex [-1.0, 1.0]
  readonly giftiPath?: string;
  readonly artifactSha256?: string;
}

// ==========================================
// 14. Ingest & Structural Queue Messages (Zero PHI)
// ==========================================

export interface DicomIngestJobPayload {
  readonly organisationId: string;
  readonly caseId: string;
  readonly imagingStudyId: string;
  readonly rawDicomBucket: string;
  readonly rawDicomObjectPath: string;
  readonly pseudonymousSubjectId: string; // e.g. sub-MGN7F3A92
}

export interface StructuralProcessingJobPayload {
  readonly organisationId: string;
  readonly caseId: string;
  readonly imagingStudyId: string;
  readonly connectomicsRunId: string;
  readonly bidsDatasetBucket: string;
  readonly bidsDatasetPath: string;
  readonly pipelineVersionId: string;
  readonly atlasId: string;
  readonly mode: MagniomMode;
}

// ==========================================
// 15. Verification Build M3 & Subsystem Freeze
// ==========================================

export const FROZEN_SUBSYSTEM_VERSIONS = {
  TARGET_ENGINE: '1.0.0',
  EVIDENCE_LIBRARY: '1.0.0',
  PHENOTYPE_ONTOLOGY: 'MAGNIOM-PHENOTYPE-1.0.0',
  NEURO_PIPELINE: 'MAGNIOM-NEURO-1.0.0',
  SCIENTIFIC_POLICY: 'MAGNIOM-POLICY-1.0.0',
  UX_WORKSPACE: 'MAGNIOM-UX-1.0.0',
  MATURITY_STAGE: 'M3' as MaturityStage,
} as const;

export interface SubsystemFreezeRecord {
  readonly subsystem:
    | 'TARGET_ENGINE'
    | 'EVIDENCE_LIBRARY'
    | 'PHENOTYPE_ONTOLOGY'
    | 'NEURO_PIPELINE'
    | 'SCIENTIFIC_POLICY'
    | 'UX_WORKSPACE';
  readonly version: string;
  readonly frozenArtifactPath: string;
  readonly sha256: string;
  readonly status: 'FROZEN';
  readonly changeControlLocked: boolean;
  readonly freezeTimestamp: string;
}

export interface FormalSoftwareVerificationReportMeta {
  readonly reportId: string;
  readonly title: string;
  readonly roadmapSection: string;
  readonly filePath: string;
  readonly verificationMethod: string;
  readonly status: 'VERIFIED_PASSED' | 'FAILED';
  readonly requirementsCovered: readonly string[];
}

export interface VerificationExitCriteriaItem {
  readonly criterionId: string;
  readonly statement: string;
  readonly status: VerificationGateStatus;
  readonly evidenceSummary: string;
}

export interface DefectRecord {
  readonly defectId: string;
  readonly severity: DefectSeverity;
  readonly summary: string;
  readonly status: 'OPEN' | 'RESOLVED' | 'CLOSED';
}

export interface VerificationBuildM3Manifest {
  readonly buildId: string;
  readonly buildName: string;
  readonly maturityStage: MaturityStage;
  readonly engineeringCompletionGatePassed: boolean;
  readonly freezeTimestamp: string;
  readonly gitCommitSha: string;
  readonly changeControlRequired: boolean;
  readonly databaseMigrationRange: {
    readonly start: string;
    readonly end: string;
  };
  readonly frozenSubsystems: readonly SubsystemFreezeRecord[];
  readonly verificationReports: readonly FormalSoftwareVerificationReportMeta[];
  readonly exitCriteria: readonly VerificationExitCriteriaItem[];
  readonly openDefects: {
    readonly critical: number;
    readonly major: number;
    readonly minor: number;
  };
  readonly complianceAttestation: {
    readonly iec62304Class: string;
    readonly regulatoryPathway: string;
    readonly releaseReadiness: 'FROZEN_FOR_FORMAL_VERIFICATION';
  };
}
