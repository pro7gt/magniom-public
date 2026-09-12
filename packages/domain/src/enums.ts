/**
 * Magniom Canonical Domain Enumerations
 * Derived directly from MAGNIOM Canonical Specifications
 */

export type MagniomMode =
  'RESEARCH' | 'CLINICAL' | 'VALIDATION' | 'clinical' | 'research' | 'validation';

export type CandidateRole =
  'PRIMARY_1' | 'PRIMARY_2' | 'PRIMARY_3' | 'ADDITIONAL_A' | 'ADDITIONAL_B' | 'RESERVE';

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
  'PATCH' | 'MINOR_METHODOLOGICAL' | 'MAJOR_METHODOLOGICAL' | 'INDICATION_EXPANSION';

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

export type PersonalisationQualification = 'qualified' | 'limited' | 'not_available' | 'ineligible';

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
  'MILD' | 'MODERATE' | 'SEVERE_WITHOUT_PSYCHOSIS' | 'SEVERE_WITH_PSYCHOSIS';

export type ClinicalSafetyClearance = 'cleared' | 'escalated_review' | 'contraindicated';

export type CandidateDecisionAction = 'accept' | 'reject' | 'modify' | 'replace' | 'defer';

export type MagniomInfluence = 'none' | 'minor' | 'moderate' | 'major';

export type SlateStatus =
  'draft' | 'generated' | 'ready_for_review' | 'reviewed' | 'superseded' | 'abstained';

export type DecisionStatus = 'in_review' | 'completed' | 'deferred' | 'superseded';

export type CandidateStatus =
  'generated' | 'eligible' | 'ineligible' | 'suppressed' | 'research_only';

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
  'uploaded' | 'validated' | 'processing' | 'qc_pass' | 'qc_conditional' | 'qc_fail' | 'superseded';

export type ImagingSeriesType = 'T1w' | 'rest_bold' | 'fieldmap' | 'dwi' | 'other';

export type ConnectomicsRunStatus = 'queued' | 'running' | 'succeeded' | 'failed' | 'superseded';

export type SurfaceMeshType = 'white' | 'pial' | 'midthickness' | 'inflated' | 'sphere_reg';

export type MeshFormat = 'gifti_surf' | 'gifti_metric' | 'cifti' | 'freesurfer_surf';

export type QCWarningSeverity = 'info' | 'warning' | 'critical';

export type ClinicalImpact =
  'none' | 'possible' | 'target_family_specific' | 'personalisation_invalid';

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
  'LEFT_LATERAL' | 'RIGHT_LATERAL' | 'SUPERIOR' | 'MEDIAL' | 'ANTERIOR' | 'POSTERIOR' | 'RESET';

export type CoordinateOrientation = 'RAS' | 'LPS';

export type TransformType = 'AFFINE' | 'NONLINEAR_WARP' | 'SPHERICAL_REGISTRATION' | 'IDENTITY';

export type NeuronavigationFormat = 'BRAINSIGHT' | 'LOCALITE' | 'GENERIC_JSON';

export type OutboxEventType =
  | 'CASE_CREATED'
  | 'PHENOTYPE_APPROVED'
  | 'TARGET_GENERATION_REQUESTED'
  | 'TARGET_SLATE_GENERATED'
  | 'CLINICIAN_REVIEW_STARTED'
  | 'TARGET_DECISION_SIGNED'
  | 'JOB_DISPATCH_REQUESTED';

export type MaturityStage = 'M0' | 'M1' | 'M2' | 'M3' | 'M4' | 'M5' | 'M6' | 'M7' | 'M8';

export type DefectSeverity = 'CRITICAL' | 'MAJOR' | 'MINOR';

export type VerificationGateStatus = 'PASSED' | 'FAILED' | 'CONDITIONAL';

// ==========================================
// v2 Canonical Multi-Indication Enums
// ==========================================

export type ModuleQualificationLevel = 'Q0' | 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Q5' | 'Q6' | 'Q7' | 'Q8';

export type ModuleLifecycleStatus =
  'draft' | 'validation' | 'active' | 'superseded' | 'withdrawn' | 'archived';

export type ModuleGovernanceStatus =
  | 'research_only'
  | 'evidence_staging'
  | 'validation_candidate'
  | 'retrospective_validation'
  | 'silent_prospective'
  | 'clinical_release_candidate'
  | 'clinical_active'
  | 'suspended'
  | 'withdrawn';

export type IndicationModuleStatus = ModuleGovernanceStatus;

export type MeasurementModality =
  | 'structural_mri'
  | 'lesion_mapping'
  | 'resting_state_fmri'
  | 'task_fmri'
  | 'diffusion_mri'
  | 'motor_mapping'
  | 'motor_evoked_potential'
  | 'eeg'
  | 'tms_eeg'
  | 'audiology'
  | 'clinical_neurophysiology'
  | 'efield'
  | 'other';

export type TargetGeometryType =
  'point' | 'surface_roi' | 'volumetric_roi' | 'somatotopic' | 'coil_field' | 'network';

export type LesionType =
  | 'ischemic'
  | 'hemorrhagic'
  | 'traumatic'
  | 'post_surgical'
  | 'encephalomalacic'
  | 'multifocal'
  | 'other';

export type LesionLaterality =
  'left' | 'right' | 'bilateral' | 'midline' | 'multifocal' | 'not_assessable';

export type DiseaseStageDeterminationMethod = 'date_based' | 'clinician_assessed' | 'combined';

export type GovernanceClassificationStatus =
  'unassigned' | 'under_review' | 'assigned' | 'deferred' | 'withdrawn';

export type EvidencePathStatus =
  'staging' | 'research_permitted' | 'validation_permitted' | 'clinical_permitted' | 'suspended';

export type CompatibilityStatus = 'draft' | 'validated' | 'approved' | 'suspended' | 'withdrawn';

export type MeasurementRequirementStatus =
  'required' | 'required_for_personalisation' | 'optional' | 'research_only' | 'not_applicable';

export type MeasurementRequirementPurpose =
  | 'anatomical_localisation'
  | 'candidate_generation'
  | 'candidate_refinement'
  | 'qualification'
  | 'reliability'
  | 'context'
  | 'efield';

export type MissingDataBehaviour =
  'block_target_generation' | 'disable_personalisation' | 'fallback' | 'allow_with_limitation';

export type ReliabilityClass = 'high' | 'moderate' | 'low' | 'unreliable' | 'not_assessable';

export type CapabilityQualificationStatus = 'qualified' | 'qualified_with_limits' | 'not_qualified';

export type OverallQualificationStatus = 'qualified' | 'qualified_with_limits' | 'not_qualified';

export type MeasurementQualification =
  'qualified' | 'qualified_with_limits' | 'not_qualified' | 'research_only' | 'not_assessable';

export type ProcessingRunStatus = 'queued' | 'running' | 'succeeded' | 'failed' | 'superseded';

export type TransformSpace =
  | 'dicom_patient'
  | 't1_native'
  | 'surface_native'
  | 'fsLR_32k'
  | 'mni152'
  | 'neuronavigation'
  | 'scalp_navigation';

export type TinnitusPerceivedLaterality = 'left' | 'right' | 'bilateral' | 'central' | 'variable';

export type ConductionMethod = 'air' | 'bone';

export type ThresholdType = 'resting' | 'active';

export type TreatmentContextType =
  | 'concurrent_rehabilitation'
  | 'behavioural_activation'
  | 'symptom_provocation'
  | 'task_state'
  | 'device_class'
  | 'coil_class'
  | 'protocol_precedent'
  | 'other';

export type TreatmentContextRole =
  'required_by_evidence' | 'recommended_by_evidence' | 'context_only';

export type TreatmentContextEvaluationStatus =
  'present' | 'planned' | 'absent' | 'unknown' | 'not_applicable';

export type AbstentionType =
  | 'unsupported_indication'
  | 'unsupported_disease_stage'
  | 'module_not_clinically_qualified'
  | 'insufficient_evidence'
  | 'measurement_failure'
  | 'reliability_failure'
  | 'lesion_registration_failure'
  | 'target_anatomy_invalid'
  | 'target_region_destroyed_by_lesion'
  | 'disease_stage_mismatch'
  | 'treatment_context_mismatch'
  | 'protocol_context_missing'
  | 'motor_map_unreliable'
  | 'body_region_mapping_uncertain'
  | 'audiology_incomplete'
  | 'coil_not_compatible'
  | 'field_model_unreliable'
  | 'device_incompatibility'
  | 'scientific_configuration_invalid'
  | 'no_nonredundant_candidate'
  | 'other';

export type CandidateRoleV2 =
  | 'P1'
  | 'P2'
  | 'P3'
  | 'A1'
  | 'A2'
  | 'P1_evidence_anchor'
  | 'P2_clinical_alternative'
  | 'P3_personalised_refinement'
  | 'A1_network_alternative'
  | 'A2_technical_alternative'
  | 'evidence_anchor'
  | 'phenotype_specific'
  | 'connectome_refinement'
  | 'somatotopic_target'
  | 'ipsilesional_strategy'
  | 'contralesional_strategy'
  | 'lesion_network_target'
  | 'field_target'
  | 'network_alternative'
  | 'clinical_alternative'
  | 'research_hypothesis';

export type ComparisonDomainBasis =
  | 'same_target_family_variants'
  | 'same_candidate_role'
  | 'same_target_strategy'
  | 'scientifically_validated_cross_family';

export type RankingModelType = 'lexicographic' | 'weighted_geometric_mean' | 'ordered_rules';

export type RefinementDecisionStatus =
  | 'adopted'
  | 'baseline_retained'
  | 'equivalent'
  | 'not_qualified'
  | 'not_available'
  | 'not_applicable';

export type GateCode =
  | 'G0_INPUT_INTEGRITY'
  | 'G1_MODE_MODULE'
  | 'G2_EVIDENCE_PATH'
  | 'G3_CLINICAL_CONTEXT'
  | 'G4_MEASUREMENT_CAPABILITY'
  | 'G5_RELIABILITY'
  | 'G6_ANATOMY_LESION'
  | 'G7_GEOMETRY_DEVICE'
  | 'G8_TREATMENT_CONTEXT'
  | 'G9_GENERATOR_CONSTRAINTS'
  | 'G10_DEVICE_ACCESSIBILITY'
  | 'G11_TREATMENT_CONTEXT'
  | 'G12_PERSONALISATION_AUTHORITY'
  | 'G13_SYSTEMS_CONTEXT_AUTHORITY'
  | 'G14_RESEARCH_LEAKAGE_PREVENTION';

export type GateResultStatus = 'pass' | 'fail' | 'conditional';

export type GateApplicability = 'applicable' | 'not_applicable';

export type GeometryDistanceMetricType =
  | 'euclidean'
  | 'surface_geodesic'
  | 'roi_overlap'
  | 'surface_overlap'
  | 'hausdorff'
  | 'body_region_concordance'
  | 'coil_field_overlap'
  | 'roi_field_coverage'
  | 'network_region_overlap';

export type GeneratorStatus = 'generated' | 'no_candidate' | 'abstained' | 'failed';

export type GeneratorFailurePolicy =
  'required_fail_run' | 'omit_generator_with_warning' | 'research_optional';

export type BaselineRelationship =
  'none' | 'creates_baseline' | 'refines_baseline' | 'alternative_to_baseline';

export type LineageType =
  | 'evidence_baseline'
  | 'measurement_refinement'
  | 'anatomy_constrained_variant'
  | 'efield_pose_variant'
  | 'clinical_alternative'
  | 'research_hypothesis';

export type RefinementKind =
  | 'functional_connectivity'
  | 'motor_mapping'
  | 'structural_connectivity'
  | 'lesion_aware'
  | 'efield_pose'
  | 'other';

export type SuppressionReasonV2 =
  | 'EVIDENCE_PATH_NOT_PERMITTED'
  | 'MODE_INCOMPATIBLE'
  | 'MODULE_INCOMPATIBLE'
  | 'POPULATION_MISMATCH'
  | 'DISEASE_STAGE_MISMATCH'
  | 'TREATMENT_CONTEXT_MISMATCH'
  | 'MEASUREMENT_UNAVAILABLE'
  | 'LOW_RELIABILITY'
  | 'TARGET_ANATOMY_INVALID'
  | 'LESION_CONFLICT'
  | 'DEVICE_INCOMPATIBLE'
  | 'GEOMETRY_INCOMPATIBLE'
  | 'FAILED_REFINEMENT_TEST'
  | 'LOW_INCREMENTAL_VALUE'
  | 'REDUNDANT'
  | 'ROLE_ALREADY_COVERED'
  | 'NO_ADDITIONAL_CLINICAL_COVERAGE'
  | 'RESEARCH_ONLY'
  | 'GENERATOR_CONSTRAINT_FAILED'
  | 'MISSING_DECLARED_BASELINE';

// ==========================================
// Evidence Knowledge Graph v2 Enumerations
// ==========================================

export type ClaimLifecycleStatus =
  'draft' | 'under_review' | 'approved_scientific_claim' | 'rejected' | 'deprecated' | 'superseded';

export type ClaimTypeV2 =
  | 'clinical_efficacy'
  | 'comparative_efficacy'
  | 'target_outcome_association'
  | 'targeting_method_efficacy'
  | 'target_specificity'
  | 'symptom_specificity'
  | 'circuit_validity'
  | 'mechanistic'
  | 'safety'
  | 'durability'
  | 'treatment_context'
  | 'external_validity'
  | 'negative_evidence'
  | 'methodological_limitation';

export type ClaimDirection =
  'supports' | 'does_not_support' | 'mixed' | 'context_dependent' | 'uncertain';

export type FindingType =
  | 'primary_outcome'
  | 'secondary_outcome'
  | 'subgroup'
  | 'target_comparison'
  | 'safety'
  | 'durability'
  | 'guideline_recommendation'
  | 'meta_analytic_estimate'
  | 'null_result'
  | 'limitation';

export type ExtractionStatus = 'single_curator' | 'double_checked' | 'adjudicated';

export type SourceRelationshipV2 =
  'supports' | 'partially_supports' | 'conflicts' | 'does_not_support' | 'limits_generalisation';

export type SourceIndependence =
  'independent' | 'partially_overlapping' | 'overlapping_dataset' | 'unknown';

export type SourceRelevance = 'direct' | 'indirect' | 'contextual';

export type SynthesisDirectness = 'strong' | 'moderate' | 'limited' | 'uncertain';
export type SynthesisReplication =
  'multiple_independent' | 'replicated' | 'single_source' | 'mixed' | 'not_assessable';
export type SynthesisDesignStrength = 'strong' | 'moderate' | 'limited' | 'uncertain';
export type SynthesisSampleSupport = 'strong' | 'moderate' | 'limited' | 'uncertain';
export type SynthesisConsistency =
  'consistent' | 'mostly_consistent' | 'mixed' | 'mostly_negative' | 'uncertain';
export type SynthesisClinicalApplicability = 'direct' | 'partial' | 'limited' | 'uncertain';
export type SynthesisTargetSpecificity = 'specific' | 'moderate' | 'broad' | 'uncertain';
export type SynthesisContextDependence = 'material' | 'possible' | 'minimal' | 'unknown';

export type ConflictType =
  | 'effect_direction'
  | 'effect_magnitude'
  | 'population'
  | 'target'
  | 'protocol'
  | 'durability'
  | 'outcome_definition'
  | 'methodology';

export type ConflictReconciliationStatus = 'unresolved' | 'partially_explained' | 'resolved';

export type EvidenceQuestionStatus = 'open' | 'under_review' | 'answered_provisionally' | 'closed';
