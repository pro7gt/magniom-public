import type {
  TargetSlate,
  TargetCandidate,
  PhenotypeSnapshot,
  TherapeuticCircuit,
  TargetFamily,
  ClinicianDecision,
  TargetReliabilityProfile,
  Patient,
  ClinicalCase,
  ClinicalAssessment,
  ClinicalObservation,
  ArtifactRecord,
  ArtifactLineage,
  WorkflowJob,
  JobProgress,
  EnqueueJobInput,
  QueueEnvelope,
  TargetGenerationMessage,
  OutboxEvent,
  StoragePathInfo,
} from '@magniom/domain';
import {
  TargetSlateSchema,
  TargetCandidateSchema,
  PhenotypeSnapshotSchema,
  TherapeuticCircuitSchema,
  TargetFamilySchema,
  ClinicianDecisionSchema,
  TargetReliabilityProfileSchema,
  ScientificPolicyReleaseSchema,
  PatientSchema,
  ClinicalCaseSchema,
  ClinicalAssessmentSchema,
  ClinicalObservationSchema,
  ApprovePhenotypeInputSchema,
  PublishTargetSlateInputSchema,
  BeginClinicianReviewInputSchema,
  SaveCandidateDecisionInputSchema,
  SignClinicianDecisionInputSchema,
  SupersedeDecisionInputSchema,
  AuditEventSchema,
  CandidateDecisionSchema,
  FinalTargetSchema,
  ArtifactRecordSchema,
  ArtifactLineageSchema,
  WorkflowJobSchema,
  JobProgressSchema,
  EnqueueJobInputSchema,
  QueueEnvelopeSchema,
  TargetGenerationMessageSchema,
  OutboxEventSchema,
  StoragePathInfoSchema,
  ImagingStudySchema,
  ImagingSeriesSchema,
  QCWarningSchema,
  StructuralQCMetricsSchema,
  ImagingQCRunSchema,
  PipelineVersionSchema,
  SystemAtlasSchema,
  ConnectomicsProcessingRunSchema,
  SoftwareManifestSchema,
  TransformManifestEntrySchema,
  StageManifestSchema,
  BidsDatasetManifestSchema,
  StructuralProcessingManifestSchema,
  SurfaceReconstructionManifestSchema,
  PipelineManifestSchema,
  SurfaceMeshGeometrySchema,
  DicomIngestJobPayloadSchema,
  StructuralProcessingJobPayloadSchema,
  Vector3DSchema,
  SubjectCoordinateSchema,
  TargetRoiDefinitionSchema,
  ConfidenceRegion3DSchema,
  CircuitOverlayMapSchema,
  CoordinateTransformMatrix4x4Schema,
  NeuronavigationExportSimulationSchema,
} from './schemas.js';

export function validateTargetSlate(data: unknown): TargetSlate {
  return TargetSlateSchema.parse(data) as unknown as TargetSlate;
}

export function safeValidateTargetSlate(data: unknown) {
  return TargetSlateSchema.safeParse(data);
}

export function validateTargetCandidate(data: unknown): TargetCandidate {
  return TargetCandidateSchema.parse(data) as unknown as TargetCandidate;
}

export function validatePhenotypeSnapshot(data: unknown): PhenotypeSnapshot {
  return PhenotypeSnapshotSchema.parse(data) as unknown as PhenotypeSnapshot;
}

export function validateTherapeuticCircuit(data: unknown): TherapeuticCircuit {
  return TherapeuticCircuitSchema.parse(data) as unknown as TherapeuticCircuit;
}

export function validateTargetFamily(data: unknown): TargetFamily {
  return TargetFamilySchema.parse(data) as unknown as TargetFamily;
}

export function validateClinicianDecision(data: unknown): ClinicianDecision {
  return ClinicianDecisionSchema.parse(data) as unknown as ClinicianDecision;
}

export function validateCandidateDecision(data: unknown) {
  return CandidateDecisionSchema.parse(data);
}

export function validateFinalTarget(data: unknown) {
  return FinalTargetSchema.parse(data);
}

export function validateTargetReliabilityProfile(data: unknown): TargetReliabilityProfile {
  return TargetReliabilityProfileSchema.parse(data) as unknown as TargetReliabilityProfile;
}

export function validateScientificPolicyRelease(data: unknown) {
  return ScientificPolicyReleaseSchema.parse(data);
}

export function validatePatient(data: unknown): Patient {
  return PatientSchema.parse(data) as unknown as Patient;
}

export function validateClinicalCase(data: unknown): ClinicalCase {
  return ClinicalCaseSchema.parse(data) as unknown as ClinicalCase;
}

export function validateClinicalAssessment(data: unknown): ClinicalAssessment {
  return ClinicalAssessmentSchema.parse(data) as unknown as ClinicalAssessment;
}

export function validateClinicalObservation(data: unknown): ClinicalObservation {
  return ClinicalObservationSchema.parse(data) as unknown as ClinicalObservation;
}

export function validateApprovePhenotypeInput(data: unknown) {
  return ApprovePhenotypeInputSchema.parse(data);
}

export function validatePublishTargetSlateInput(data: unknown) {
  return PublishTargetSlateInputSchema.parse(data);
}

export function validateBeginClinicianReviewInput(data: unknown) {
  return BeginClinicianReviewInputSchema.parse(data);
}

export function validateSaveCandidateDecisionInput(data: unknown) {
  return SaveCandidateDecisionInputSchema.parse(data);
}

export function validateSignClinicianDecisionInput(data: unknown) {
  return SignClinicianDecisionInputSchema.parse(data);
}

export function validateSupersedeDecisionInput(data: unknown) {
  return SupersedeDecisionInputSchema.parse(data);
}

export function validateAuditEvent(data: unknown) {
  return AuditEventSchema.parse(data);
}

export function validateArtifactRecord(data: unknown): ArtifactRecord {
  return ArtifactRecordSchema.parse(data) as unknown as ArtifactRecord;
}

export function validateArtifactLineage(data: unknown): ArtifactLineage {
  return ArtifactLineageSchema.parse(data) as unknown as ArtifactLineage;
}

export function validateStoragePathInfo(data: unknown): StoragePathInfo {
  return StoragePathInfoSchema.parse(data) as unknown as StoragePathInfo;
}

export function validateWorkflowJob(data: unknown): WorkflowJob {
  return WorkflowJobSchema.parse(data) as unknown as WorkflowJob;
}

export function validateJobProgress(data: unknown): JobProgress {
  return JobProgressSchema.parse(data) as unknown as JobProgress;
}

export function validateEnqueueJobInput(data: unknown): EnqueueJobInput {
  return EnqueueJobInputSchema.parse(data) as unknown as EnqueueJobInput;
}

export function validateQueueEnvelope<T = Record<string, unknown>>(data: unknown): QueueEnvelope<T> {
  return QueueEnvelopeSchema.parse(data) as unknown as QueueEnvelope<T>;
}

export function validateTargetGenerationMessage(data: unknown): TargetGenerationMessage {
  return TargetGenerationMessageSchema.parse(data) as unknown as TargetGenerationMessage;
}

export function validateOutboxEvent(data: unknown): OutboxEvent {
  return OutboxEventSchema.parse(data) as unknown as OutboxEvent;
}

// ==========================================
// Sprint 8 Imaging, Structural, QC & Manifest Validators
// ==========================================

export function validateImagingStudy(data: unknown) {
  return ImagingStudySchema.parse(data);
}

export function validateImagingSeries(data: unknown) {
  return ImagingSeriesSchema.parse(data);
}

export function validateQCWarning(data: unknown) {
  return QCWarningSchema.parse(data);
}

export function validateStructuralQCMetrics(data: unknown) {
  return StructuralQCMetricsSchema.parse(data);
}

export function validateImagingQCRun(data: unknown) {
  return ImagingQCRunSchema.parse(data);
}

export function validatePipelineVersion(data: unknown) {
  return PipelineVersionSchema.parse(data);
}

export function validateSystemAtlas(data: unknown) {
  return SystemAtlasSchema.parse(data);
}

export function validateConnectomicsProcessingRun(data: unknown) {
  return ConnectomicsProcessingRunSchema.parse(data);
}

export function validateSoftwareManifest(data: unknown) {
  return SoftwareManifestSchema.parse(data);
}

export function validateTransformManifestEntry(data: unknown) {
  return TransformManifestEntrySchema.parse(data);
}

export function validateStageManifest(data: unknown) {
  return StageManifestSchema.parse(data);
}

export function validateBidsDatasetManifest(data: unknown) {
  return BidsDatasetManifestSchema.parse(data);
}

export function validateStructuralProcessingManifest(data: unknown) {
  return StructuralProcessingManifestSchema.parse(data);
}

export function validateSurfaceReconstructionManifest(data: unknown) {
  return SurfaceReconstructionManifestSchema.parse(data);
}

export function validatePipelineManifest(data: unknown) {
  return PipelineManifestSchema.parse(data);
}

export function validateSurfaceMeshGeometry(data: unknown) {
  return SurfaceMeshGeometrySchema.parse(data);
}

export function validateDicomIngestJobPayload(data: unknown) {
  return DicomIngestJobPayloadSchema.parse(data);
}

export function validateStructuralProcessingJobPayload(data: unknown) {
  return StructuralProcessingJobPayloadSchema.parse(data);
}

// ==========================================
// Sprint 13 3D Viewer & Coordinate Transform Validators
// ==========================================

export function validateVector3D(data: unknown) {
  return Vector3DSchema.parse(data);
}

export function validateSubjectCoordinate(data: unknown) {
  return SubjectCoordinateSchema.parse(data);
}

export function validateTargetRoiDefinition(data: unknown) {
  return TargetRoiDefinitionSchema.parse(data);
}

export function validateConfidenceRegion3D(data: unknown) {
  return ConfidenceRegion3DSchema.parse(data);
}

export function validateCircuitOverlayMap(data: unknown) {
  return CircuitOverlayMapSchema.parse(data);
}

export function validateCoordinateTransformMatrix4x4(data: unknown) {
  return CoordinateTransformMatrix4x4Schema.parse(data);
}

export function validateNeuronavigationExportSimulation(data: unknown) {
  return NeuronavigationExportSimulationSchema.parse(data);
}



