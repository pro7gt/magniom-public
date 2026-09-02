/**
 * Magniom Canonical Domain Enumerations
 * Derived directly from MAGNIOM Canonical Specifications
 */

export type MagniomMode = 'RESEARCH' | 'CLINICAL' | 'VALIDATION';

export type CandidateRole =
  | 'PRIMARY_1'
  | 'PRIMARY_2'
  | 'PRIMARY_3'
  | 'ADDITIONAL_A'
  | 'ADDITIONAL_B'
  | 'RESERVE';

export type EvidenceTier = 'T1' | 'T2' | 'T3' | 'T4' | 'T_EXP';

export type LegacyEvidenceTier = 'A' | 'B' | 'C' | 'D' | 'R';

export type TargetMethod =
  | 'EVIDENCE_ONLY_PRIOR'
  | 'STRUCTURAL_ANATOMICAL'
  | 'CONNECTOME_REFINED'
  | 'ELECTRIC_FIELD_OPTIMIZED';

export type CoordinateSpace = 'MNI152NLin2009cAsym' | 'fsLR_32k' | 'NATIVE_T1W';

export type Hemisphere = 'L' | 'R' | 'BILATERAL';

export type DecisionType =
  | 'ACCEPTED_PRIMARY'
  | 'ACCEPTED_ADDITIONAL'
  | 'SUBSTITUTED_ALTERNATIVE'
  | 'MANUAL_OVERRIDE'
  | 'DEFERRED'
  | 'REJECTED';

export type SuppressionReason =
  | 'LOW_RELIABILITY'
  | 'LOW_INCREMENTAL_VALUE'
  | 'REDUNDANT_ANATOMICAL'
  | 'CONTRAINDICATED'
  | 'MODE_RESTRICTED'
  | 'EVIDENCE_CEILING_EXCEEDED';

export type ConfidenceLevel = 'HIGH' | 'MODERATE' | 'LOW' | 'VERY_LOW';

export type ObjectLifecycleStatus =
  | 'DRAFT'
  | 'UNDER_REVIEW'
  | 'VALIDATION'
  | 'RELEASE_CANDIDATE'
  | 'ACTIVE'
  | 'SUPERSEDED'
  | 'WITHDRAWN'
  | 'ARCHIVED';

export type ScientificChangeClass =
  | 'PATCH'
  | 'MINOR_METHODOLOGICAL'
  | 'MAJOR_METHODOLOGICAL'
  | 'INDICATION_EXPANSION';

export type ValidationType =
  | 'unit'
  | 'integration'
  | 'golden_case'
  | 'scientific_verification'
  | 'sensitivity_analysis'
  | 'retrospective'
  | 'silent_prospective'
  | 'clinician_assisted'
  | 'human_factors'
  | 'security'
  | 'regulatory';

export type ImagingQualityStatus = 'pass' | 'conditional' | 'fail';

export type PersonalisationQualification =
  | 'qualified'
  | 'limited'
  | 'not_available'
  | 'ineligible';

export type AppRole =
  | 'tms_specialist'
  | 'clinical_reviewer'
  | 'imaging_specialist'
  | 'researcher'
  | 'evidence_curator'
  | 'evidence_approver'
  | 'organisation_admin'
  | 'service_worker'
  | 'system_admin';

export type CaseState =
  | 'draft'
  | 'phenotype_ready'
  | 'phenotype_approved'
  | 'imaging_pending'
  | 'imaging_processing'
  | 'connectome_ready'
  | 'target_generation_pending'
  | 'target_generating'
  | 'target_slate_ready'
  | 'clinician_review'
  | 'decision_signed'
  | 'personalisation_abstained'
  | 'targeting_abstained'
  | 'decision_deferred'
  | 'superseded'
  | 'closed';

export type SnapshotState = 'draft' | 'ready_for_review' | 'approved' | 'superseded';

export type DataQualityState = 'verified' | 'reviewed' | 'unverified' | 'incomplete' | 'invalid';

export type EpisodeSeverity =
  | 'MILD'
  | 'MODERATE'
  | 'SEVERE_WITHOUT_PSYCHOSIS'
  | 'SEVERE_WITH_PSYCHOSIS';

export type ClinicalSafetyClearance = 'cleared' | 'escalated_review' | 'contraindicated';

export type CandidateDecisionAction = 'accept' | 'reject' | 'modify' | 'replace' | 'defer';

export type MagniomInfluence = 'none' | 'minor' | 'moderate' | 'major';

export type SlateStatus =
  | 'draft'
  | 'generated'
  | 'ready_for_review'
  | 'reviewed'
  | 'superseded'
  | 'abstained';

export type DecisionStatus = 'in_review' | 'completed' | 'deferred' | 'superseded';

export type CandidateStatus = 'generated' | 'eligible' | 'ineligible' | 'suppressed' | 'research_only';

export type FinalTargetSource = 'magniom_candidate' | 'clinician_defined' | 'standard_target';

export type JobStatus =
  | 'queued'
  | 'claimed'
  | 'running'
  | 'succeeded'
  | 'failed_retryable'
  | 'failed_terminal'
  | 'cancelled'
  | 'superseded';

export type QueueName =
  | 'imaging_ingest'
  | 'neurocompute'
  | 'target_reliability'
  | 'efield'
  | 'target_generation'
  | 'report_generation'
  | 'outbox_dispatch';

export type StorageBucket =
  | 'clinical-ingest'
  | 'clinical-derived'
  | 'clinical-reports'
  | 'evidence-assets'
  | 'research-derived';

export type ImagingStudyStatus =
  | 'uploaded'
  | 'validated'
  | 'processing'
  | 'qc_pass'
  | 'qc_conditional'
  | 'qc_fail'
  | 'superseded';

export type ImagingSeriesType =
  | 'T1w'
  | 'rest_bold'
  | 'fieldmap'
  | 'dwi'
  | 'other';

export type ConnectomicsRunStatus =
  | 'queued'
  | 'running'
  | 'succeeded'
  | 'failed'
  | 'superseded';

export type SurfaceMeshType =
  | 'white'
  | 'pial'
  | 'midthickness'
  | 'inflated'
  | 'sphere_reg';

export type MeshFormat =
  | 'gifti_surf'
  | 'gifti_metric'
  | 'cifti'
  | 'freesurfer_surf';

export type QCWarningSeverity =
  | 'info'
  | 'warning'
  | 'critical';

export type ClinicalImpact =
  | 'none'
  | 'possible'
  | 'target_family_specific'
  | 'personalisation_invalid';

export type StructuralPipelineStage =
  | 'INGEST'
  | 'BIDS_CONVERT'
  | 'BIDS_VALIDATE'
  | 'BIAS_CORRECTION'
  | 'BRAIN_EXTRACTION'
  | 'SEGMENTATION'
  | 'SPATIAL_NORMALIZATION'
  | 'SURFACE_RECONSTRUCTION'
  | 'SURFACE_RESAMPLING'
  | 'QC_EVALUATION'
  | 'MANIFEST_GENERATION';

export type ArtifactType =
  | 'RAW_DICOM'
  | 'BIDS_NIFTI'
  | 'PREPROCESSED_BOLD'
  | 'T1_RECONSTRUCTION'
  | 'CORTICAL_SURFACE'
  | 'CIFTI_TIMESERIES'
  | 'CONNECTOME_MATRIX'
  | 'QC_REPORT_IMAGE'
  | 'CIRCUIT_MAP'
  | 'TARGET_ROI'
  | 'EFIELD_MESH'
  | 'TARGET_SLATE_PAYLOAD'
  | 'CLINICAL_REPORT_PDF';

export type CameraOrientationPreset =
  | 'LEFT_LATERAL'
  | 'RIGHT_LATERAL'
  | 'SUPERIOR'
  | 'MEDIAL'
  | 'ANTERIOR'
  | 'POSTERIOR'
  | 'RESET';

export type CoordinateOrientation = 'RAS' | 'LPS';

export type TransformType =
  | 'AFFINE'
  | 'NONLINEAR_WARP'
  | 'SPHERICAL_REGISTRATION'
  | 'IDENTITY';

export type NeuronavigationFormat = 'BRAINSIGHT' | 'LOCALITE' | 'GENERIC_JSON';

export type OutboxEventType =
  | 'CASE_CREATED'
  | 'PHENOTYPE_APPROVED'
  | 'TARGET_GENERATION_REQUESTED'
  | 'TARGET_SLATE_GENERATED'
  | 'CLINICIAN_REVIEW_STARTED'
  | 'TARGET_DECISION_SIGNED'
  | 'JOB_DISPATCH_REQUESTED';

export type MaturityStage =
  | 'M0'
  | 'M1'
  | 'M2'
  | 'M3'
  | 'M4'
  | 'M5'
  | 'M6'
  | 'M7'
  | 'M8';

export type DefectSeverity = 'CRITICAL' | 'MAJOR' | 'MINOR';

export type VerificationGateStatus = 'PASSED' | 'FAILED' | 'CONDITIONAL';
