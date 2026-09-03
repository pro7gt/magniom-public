/**
 * MAGNIOM Canonical Measurement & Reliability Domain Types v2.0
 * Conforms to MAGNIOM-Canonical Multi-Indication Data Specification v2.0 (§28-45)
 * and MAGNIOM-Neuroimaging, Neurophysiology & Multimodal Measurement Specification v2.0
 * Covers: MeasurementBundle, MeasurementReliability, ReliabilityBundle,
 * the 9 Modality Measurement Objects, Provider Manifests, ProcessingRuns, and TransformGraph.
 */

import type {
  MeasurementModality,
  ReliabilityClass,
  CapabilityQualificationStatus,
  OverallQualificationStatus,
  MeasurementQualification,
  ProcessingRunStatus,
  TinnitusPerceivedLaterality,
  ConductionMethod,
  ThresholdType,
} from './enums.js';
import type { CommonProvenance, SpatialRegion } from './types.js';
import type { Coordinate3D, CoordinateSpaceRef } from './target-geometry.js';

export type MeasurementStatus =
  'available' | 'qualified' | 'qualified_with_limits' | 'failed' | 'not_applicable';

export type ResultingCapability = 'enabled' | 'disabled' | 'fallback_only' | 'research_only';

export type MeasurementBundleQualificationStatus =
  'qualified' | 'qualified_with_limits' | 'insufficient' | 'invalid';

export interface MeasurementRef {
  readonly measurementId: string;
  readonly modality: MeasurementModality;
  readonly version: string;
  readonly status: MeasurementStatus;
  readonly acquisitionTime?: string;
  readonly pipelineVersionIds?: readonly string[];
  readonly artifactIds?: readonly string[];
}

export interface MeasurementRequirementEvaluation {
  readonly requirementCode: string;
  readonly satisfied: boolean;
  readonly satisfyingMeasurementIds: readonly string[];
  readonly resultingCapability: ResultingCapability;
  readonly explanation: string;
}

export interface MeasurementBundle {
  readonly id: string;
  readonly version: string;
  readonly caseId: string;
  readonly caseIndicationId: string;
  readonly indicationModuleReleaseId: string;
  readonly phenotypeSnapshotId: string;
  readonly diseaseStageContextId?: string;
  readonly lesionContextIds?: readonly string[];
  readonly measurements: readonly MeasurementRef[];
  readonly qualificationStatus: MeasurementBundleQualificationStatus;
  readonly requirementEvaluations: readonly MeasurementRequirementEvaluation[];
  readonly limitingFactors: readonly string[];
  readonly createdAt: string;
  readonly payloadSha256: string;
  readonly provenance: CommonProvenance;
}

export interface ReliabilityMeasure {
  readonly metricName: string;
  readonly value?: number;
  readonly unit?: string;
  readonly interpretation: 'high' | 'moderate' | 'low' | 'not_assessable';
  readonly method: string;
  readonly referenceRangeId?: string;
}

export interface MeasurementReliability {
  readonly id: string;
  readonly version: string;
  readonly caseId: string;
  readonly measurementId: string;
  readonly modality: MeasurementModality;
  readonly methodCode: string;
  readonly methodVersion: string;
  readonly qcStatus: 'pass' | 'conditional' | 'fail';
  readonly metrics: readonly ReliabilityMeasure[];
  readonly reproducibility?: {
    readonly withinRun?: readonly ReliabilityMeasure[];
    readonly crossRun?: readonly ReliabilityMeasure[];
    readonly crossMethod?: readonly ReliabilityMeasure[];
  };
  readonly spatialReliability?: {
    readonly splitHalfDistanceMm?: number;
    readonly crossRunDistanceMm?: number;
    readonly confidenceRegion?: SpatialRegion;
  };
  readonly pipelineSensitivity?: readonly ReliabilityMeasure[];
  readonly reliabilityClass: ReliabilityClass;
  readonly limitingFactors: readonly string[];
  readonly interpretation: string;
  readonly pipelineVersionIds: readonly string[];
  readonly provenance: CommonProvenance;
}

export interface ReliabilityCapabilityQualification {
  readonly capabilityCode: string;
  readonly status: CapabilityQualificationStatus;
  readonly reliedOnMeasurementIds: readonly string[];
  readonly reliedOnReliabilityIds: readonly string[];
  readonly policyRuleId: string;
  readonly explanation: string;
}

export interface ReliabilityBundle {
  readonly id: string;
  readonly version: string;
  readonly caseId: string;
  readonly caseIndicationId: string;
  readonly indicationModuleReleaseId: string;
  readonly measurementBundleId: string;
  readonly componentReliabilityIds: readonly string[];
  readonly capabilityQualification: readonly ReliabilityCapabilityQualification[];
  readonly overallQualification: OverallQualificationStatus;
  readonly limitingFactors: readonly string[];
  readonly interpretation: string;
  readonly payloadSha256: string;
  readonly provenance: CommonProvenance;
}

// =========================================================================
// 8 EXIT CRITERIA & MULTIMODAL PROVIDER DOMAIN TYPES (§5-23, §47-69, §90-100)
// =========================================================================

export interface ArtifactManifestEntry {
  readonly path: string;
  readonly sha256: string;
  readonly sizeBytes: number;
  readonly mimeType?: string;
}

export interface MeasurementArtifactManifest {
  readonly measurementId: string;
  readonly inputArtifacts: readonly ArtifactManifestEntry[];
  readonly outputArtifacts: readonly ArtifactManifestEntry[];
  readonly pipelineVersionId: string;
  readonly configurationSha256: string;
  readonly manifestSha256: string;
}

export interface MeasurementDevice {
  readonly id: string;
  readonly manufacturer: string;
  readonly model: string;
  readonly deviceType: string;
  readonly serialOrPseudonymousIdentifier?: string;
  readonly softwareVersion?: string;
  readonly calibrationRecordId?: string;
  readonly siteId: string;
  readonly calibrationValid: boolean;
}

export interface MuscleTarget {
  readonly code: string;
  readonly label: string;
  readonly bodyRegion: string;
  readonly laterality: 'left' | 'right';
}

export interface ProcessingRun {
  readonly id: string;
  readonly caseId: string;
  readonly organisationId: string;
  readonly modality: MeasurementModality;
  readonly pipelineVersionId: string;
  readonly inputArtifactIds: readonly string[];
  readonly configurationSha256: string;
  readonly containerDigestSha256?: string;
  readonly status: ProcessingRunStatus;
  readonly startedAt: string;
  readonly completedAt?: string;
  readonly outputArtifactIds: readonly string[];
  readonly runManifestSha256?: string;
  readonly executionLogs?: readonly string[];
}

export interface CanonicalMeasurement {
  readonly id: string;
  readonly organisationId: string;
  readonly caseId: string;
  readonly modality: MeasurementModality;
  readonly version: string;
  readonly status: MeasurementStatus;
  readonly acquisitionTime?: string;
  readonly pipelineVersionIds: readonly string[];
  readonly artifactIds: readonly string[];
  readonly deviceId?: string;
  readonly rawDataHash?: string;
  readonly qcStatus: 'pass' | 'conditional' | 'fail';
  readonly qualification: MeasurementQualification;
  readonly provenance: CommonProvenance;
}

// 1. Structural MRI
export interface StructuralMeasurement extends CanonicalMeasurement {
  readonly modality: 'structural_mri';
  readonly nativeT1ArtifactId: string;
  readonly surfaceNativeMeshArtifactId?: string;
  readonly skullMeshArtifactId?: string;
  readonly hasAnatomicalAbnormality: boolean;
  readonly anatomicalNotes?: string;
  readonly nativeVoxelDimensions: readonly [number, number, number];
  readonly orientation: 'RAS' | 'LPS' | 'other';
  readonly coordinateSpace: CoordinateSpaceRef;
}

// 2. Lesion Mapping
export interface LesionMeasurement extends CanonicalMeasurement {
  readonly modality: 'lesion_mapping';
  readonly lesionType: string;
  readonly laterality: 'left' | 'right' | 'bilateral' | 'midline';
  readonly nativeMaskArtifactId: string;
  readonly volumeMm3: number;
  readonly isTargetDestroyed: boolean;
  readonly intersectedTargetFamilyIds: readonly string[];
  readonly nearestIntactCortexDistanceMm?: number;
  readonly registrationConfidence: 'high' | 'moderate' | 'low';
  readonly segmentationMethod: 'manual' | 'validated_automated' | 'semi_automated';
}

// 3. Resting-State fMRI
export interface RestingStateMeasurement extends CanonicalMeasurement {
  readonly modality: 'resting_state_fmri';
  readonly acquiredDurationSeconds: number;
  readonly retainedDurationSeconds: number;
  readonly meanFramewiseDisplacementMm: number;
  readonly scrubbedVolumesFraction: number;
  readonly targetAntiCorrelationPeakMni?: Coordinate3D;
  readonly sgAccDlpfcConcordance: number;
  readonly splitHalfStabilityR: number;
}

// 4. Task fMRI
export interface TaskFMRIMeasurement extends CanonicalMeasurement {
  readonly modality: 'task_fmri';
  readonly paradigmId: string;
  readonly paradigmName: string;
  readonly behavioralPerformanceValid: boolean;
  readonly taskAccuracyRate?: number;
  readonly activationClusterPeakCoordinate?: Coordinate3D;
  readonly lateralityIndex: number; // -1.0 (right) to 1.0 (left)
  readonly activationHemisphere: 'left' | 'right' | 'bilateral';
  readonly thresholdSensitivityClass: 'robust' | 'moderate' | 'sensitive';
}

// 5. Diffusion MRI / Tractography
export interface ReconstructedTract {
  readonly tractName: string;
  readonly meanFractionalAnisotropy: number;
  readonly meanDiffusivity: number;
  readonly reconstructionStability: 'high' | 'moderate' | 'unstable';
}

export interface DiffusionMeasurement extends CanonicalMeasurement {
  readonly modality: 'diffusion_mri';
  readonly bValueCount: number;
  readonly gradientDirectionsCount: number;
  readonly reconstructedTracts: readonly ReconstructedTract[];
  readonly corticospinalTractIntact: boolean;
  readonly isAxonCountEquivalent: false; // explicitly false per §43
}

// 6. Motor Mapping
export interface MotorMappingPoint {
  readonly pointId: string;
  readonly stimulusIndex: number;
  readonly stimulationCoordinate: Coordinate3D;
  readonly coilOrientationDegrees: number;
  readonly intensityPercentMso: number;
  readonly muscle: MuscleTarget;
  readonly mepAmplitudeUv: number;
  readonly responsePresent: boolean;
}

export interface MotorHotspot {
  readonly hotspotId: string;
  readonly muscle: MuscleTarget;
  readonly coordinate: Coordinate3D;
  readonly hemisphere: 'left' | 'right';
  readonly repeatabilityMm: number;
  readonly stimulationThresholdPercentMso: number;
  readonly reliabilityClass: ReliabilityClass;
}

export interface MotorMappingMeasurement extends CanonicalMeasurement {
  readonly modality: 'motor_mapping';
  readonly mappingPoints: readonly MotorMappingPoint[];
  readonly hotspots: readonly MotorHotspot[];
  readonly targetMuscle: MuscleTarget;
  readonly spatialSpreadMm: number;
}

// 7. Motor-Evoked Potentials (MEP)
export interface MEPTrial {
  readonly trialIndex: number;
  readonly intensityPercentMso: number;
  readonly peakToPeakAmplitudeUv: number;
  readonly latencyMs: number;
  readonly backgroundEmgValid: boolean;
  readonly isArtefact: boolean;
}

export interface MotorThresholdMeasurement {
  readonly id: string;
  readonly muscle: MuscleTarget;
  readonly thresholdType: ThresholdType;
  readonly thresholdValue: number;
  readonly thresholdUnit: '%MSO' | 'V/m';
  readonly stimulationSite: Coordinate3D;
  readonly measurementQuality: 'pass' | 'conditional' | 'fail';
}

export interface MEPMeasurement extends CanonicalMeasurement {
  readonly modality: 'motor_evoked_potential';
  readonly targetMuscle: MuscleTarget;
  readonly trials: readonly MEPTrial[];
  readonly meanAmplitudeUv: number;
  readonly meanLatencyMs: number;
  readonly responsePresent: boolean;
  readonly absenceReason?: 'corticospinal_lesion' | 'high_threshold' | 'technical_failure';
  readonly motorThreshold?: MotorThresholdMeasurement;
}

// 8. Audiology
export interface HearingThresholdPoint {
  readonly frequencyHz: number;
  readonly thresholdDbHl: number;
  readonly masked: boolean;
}

export interface PureToneAudiogram {
  readonly leftEar: readonly HearingThresholdPoint[];
  readonly rightEar: readonly HearingThresholdPoint[];
  readonly conductionMethod: ConductionMethod;
  readonly testStandardRef?: string;
  readonly interpretation: string;
}

export interface TinnitusMatchingAssessment {
  readonly perceivedLaterality: TinnitusPerceivedLaterality;
  readonly matchedFrequencyHz?: number;
  readonly matchedLoudnessDb?: number;
  readonly minimumMaskingLevelDb?: number;
  readonly residualInhibition?: string;
  readonly repeatability: 'high' | 'moderate' | 'low';
  readonly interpretation: string;
}

export interface AudiologyMeasurement extends CanonicalMeasurement {
  readonly modality: 'audiology';
  readonly pureToneAudiogram?: PureToneAudiogram;
  readonly tinnitusMatching?: TinnitusMatchingAssessment;
  readonly speechDiscriminationPercent?: number;
  readonly transducerCalibrated: boolean;
  readonly calibrationDate?: string;
}

// 9. E-field Modeling
export interface EFieldMeasurement extends CanonicalMeasurement {
  readonly modality: 'efield';
  readonly headModelArtifactId: string;
  readonly coilModelRef: string;
  readonly coilPosition: Coordinate3D;
  readonly coilOrientation: readonly [number, number, number];
  readonly peakCorticalEFieldVm: number;
  readonly stimulatedVolumeMm3: number;
  readonly scalpToCortexDistanceMm: number;
  readonly accessibilityAttenuationFactor: number;
}

export type AnyModalityMeasurement =
  | StructuralMeasurement
  | LesionMeasurement
  | RestingStateMeasurement
  | TaskFMRIMeasurement
  | DiffusionMeasurement
  | MotorMappingMeasurement
  | MEPMeasurement
  | AudiologyMeasurement
  | EFieldMeasurement;

// =========================================================================
// TRANSFORM GRAPH & SPATIAL INTEGRITY TYPES (§92-98, §156-159)
// =========================================================================

export interface SpatialTransform {
  readonly id: string;
  readonly fromSpace: CoordinateSpaceRef;
  readonly toSpace: CoordinateSpaceRef;
  readonly transformType: 'affine_matrix_4x4' | 'nonlinear_warp' | 'surface_registration';
  readonly matrix4x4?: readonly number[]; // 16 elements row-major
  readonly warpArtifactId?: string;
  readonly verificationStatus: 'verified' | 'unverified' | 'failed';
  readonly roundTripMaxErrorMm: number;
  readonly sha256: string;
}

export interface TransformGraph {
  readonly rootSpace: CoordinateSpaceRef;
  readonly registeredSpaces: readonly CoordinateSpaceRef[];
  readonly transforms: readonly SpatialTransform[];
  readonly validationPassed: boolean;
}

// =========================================================================
// MEASUREMENT PROVIDER MANIFEST & TARGET ENGINE PAYLOAD (§5-6, §140-142)
// =========================================================================

export interface MeasurementCapabilityDeclaration {
  readonly capabilityCode: string;
  readonly description: string;
  readonly supportedModalities: readonly MeasurementModality[];
  readonly defaultStatus: MeasurementQualification;
  readonly requiresIndicationQualification: boolean;
}

export interface MeasurementProviderManifest {
  readonly code: string;
  readonly semanticVersion: string;
  readonly supportedModalities: readonly MeasurementModality[];
  readonly capabilities: readonly MeasurementCapabilityDeclaration[];
  readonly containerDigestSha256?: string;
  readonly requiredToolchains: readonly string[];
  readonly offlineResources: readonly string[];
  readonly configurationSha256: string;
}

export interface ModalityFeatureRef {
  readonly featureCode: string;
  readonly measurementId: string;
  readonly value?: number;
  readonly unit?: string;
  readonly categoricalValue?: string;
  readonly methodCode: string;
  readonly methodVersion: string;
  readonly interpretation: string;
}

export interface MeasurementTargetEnginePayload {
  readonly measurementBundleId: string;
  readonly capabilityStatuses: readonly {
    readonly capabilityCode: string;
    readonly status: CapabilityQualificationStatus;
  }[];
  readonly relevantMeasurementIds: readonly string[];
  readonly reliabilityBundleId?: string;
  readonly lesionContextIds?: readonly string[];
  readonly modalityFeatureRefs: readonly ModalityFeatureRef[];
  readonly transformManifestIds: readonly string[];
  readonly artifactManifestIds: readonly string[];
}
