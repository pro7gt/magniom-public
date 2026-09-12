/**
 * MAGNIOM Canonical Zod Schemas v2.0
 * Conforms to MAGNIOM-Canonical Multi-Indication Data Specification v2.0
 * Covers runtime validation for all 11 canonical v2 domain objects
 */

import { z } from 'zod';
import {
  MagniomModeSchema,
  LegacyEvidenceTierSchema,
  ConfidenceLevelSchema,
  DataQualityStateSchema,
  CandidateStatusSchema,
  SlateStatusSchema,
  AtlasRefSchema,
  SpatialRegionSchema,
  CommonProvenanceSchema,
  TargetFamilySchema,
  ClinicalConceptRefSchema,
} from './schemas.js';
import { TripleNetworkPolicySchema } from './networks.js';

// ==========================================
// 1. Enumeration Schemas
// ==========================================

export const ModuleQualificationLevelSchema = z.enum([
  'Q0',
  'Q1',
  'Q2',
  'Q3',
  'Q4',
  'Q5',
  'Q6',
  'Q7',
  'Q8',
]);

export const ModuleLifecycleStatusSchema = z.enum([
  'draft',
  'validation',
  'active',
  'superseded',
  'withdrawn',
  'archived',
]);

export const ModuleGovernanceStatusSchema = z.enum([
  'research_only',
  'evidence_staging',
  'validation_candidate',
  'retrospective_validation',
  'silent_prospective',
  'clinical_release_candidate',
  'clinical_active',
  'suspended',
  'withdrawn',
]);

export const IndicationModuleStatusSchema = ModuleGovernanceStatusSchema;

export const MeasurementModalitySchema = z.enum([
  'structural_mri',
  'lesion_mapping',
  'resting_state_fmri',
  'task_fmri',
  'diffusion_mri',
  'motor_mapping',
  'motor_evoked_potential',
  'eeg',
  'tms_eeg',
  'audiology',
  'clinical_neurophysiology',
  'efield',
  'other',
]);

export const TargetGeometryTypeSchema = z.enum([
  'point',
  'surface_roi',
  'volumetric_roi',
  'somatotopic',
  'coil_field',
  'network',
]);

export const LesionTypeSchema = z.enum([
  'ischemic',
  'hemorrhagic',
  'traumatic',
  'post_surgical',
  'encephalomalacic',
  'multifocal',
  'other',
]);

export const LesionLateralitySchema = z.enum([
  'left',
  'right',
  'bilateral',
  'midline',
  'multifocal',
  'not_assessable',
]);

export const DiseaseStageDeterminationMethodSchema = z.enum([
  'date_based',
  'clinician_assessed',
  'combined',
]);

export const GovernanceClassificationStatusSchema = z.enum([
  'unassigned',
  'under_review',
  'assigned',
  'deferred',
  'withdrawn',
]);

export const EvidencePathStatusSchema = z.enum([
  'staging',
  'research_permitted',
  'validation_permitted',
  'clinical_permitted',
  'suspended',
]);

export const CompatibilityStatusSchema = z.enum([
  'draft',
  'validated',
  'approved',
  'suspended',
  'withdrawn',
]);

export const CandidateRoleV2Schema = z.enum([
  'evidence_anchor',
  'phenotype_specific',
  'connectome_refinement',
  'somatotopic_target',
  'ipsilesional_strategy',
  'contralesional_strategy',
  'lesion_network_target',
  'field_target',
  'network_alternative',
  'clinical_alternative',
  'research_hypothesis',
]);

export const AnyCandidateRoleSchema = z.enum([
  'PRIMARY_1',
  'PRIMARY_2',
  'PRIMARY_3',
  'ADDITIONAL_A',
  'ADDITIONAL_B',
  'RESERVE',
  'evidence_anchor',
  'phenotype_specific',
  'connectome_refinement',
  'somatotopic_target',
  'ipsilesional_strategy',
  'contralesional_strategy',
  'lesion_network_target',
  'field_target',
  'network_alternative',
  'clinical_alternative',
  'research_hypothesis',
]);

export const AbstentionTypeSchema = z.enum([
  'unsupported_indication',
  'unsupported_disease_stage',
  'module_not_clinically_qualified',
  'insufficient_evidence',
  'measurement_failure',
  'reliability_failure',
  'lesion_registration_failure',
  'target_anatomy_invalid',
  'target_region_destroyed_by_lesion',
  'disease_stage_mismatch',
  'treatment_context_mismatch',
  'protocol_context_missing',
  'motor_map_unreliable',
  'body_region_mapping_uncertain',
  'audiology_incomplete',
  'coil_not_compatible',
  'field_model_unreliable',
  'device_incompatibility',
  'scientific_configuration_invalid',
  'no_nonredundant_candidate',
  'other',
]);

// Common Provenance Schema
export const CommonProvenanceV2Schema = z.object({
  createdBy: z.string().min(1),
  createdAt: z.string().datetime({ offset: true }).or(z.string().min(1)),
  sourceOrganizationId: z.string().uuid().optional(),
  softwareVersion: z.string().min(1),
});

// Spatial Primitives
export const Coordinate3DSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
});

export const CoordinateSpaceRefSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  version: z.string().optional(),
  orientation: z.string().optional(),
  subjectSpecific: z.boolean(),
});

// ==========================================
// 2. Canonical Object 1: IndicationModuleRelease (§11-15)
// ==========================================

export const IndicationRefSchema = z.object({
  conceptId: z.string().min(1),
  label: z.string().min(1),
  codingSystem: z.string().optional(),
  code: z.string().optional(),
});

export const PopulationDefinitionSchema = z.object({
  code: z.string().min(1),
  label: z.string().min(1),
  description: z.string(),
  minAgeYears: z.number().nonnegative().optional(),
  maxAgeYears: z.number().positive().optional(),
  diagnosticCriteria: z.array(z.string()).optional(),
  exclusionCriteria: z.array(z.string()).optional(),
});

export const MeasurementRequirementSchema = z.object({
  code: z.string().min(1),
  modality: MeasurementModalitySchema,
  requirement: z.enum([
    'required',
    'required_for_personalisation',
    'optional',
    'research_only',
    'not_applicable',
  ]),
  purpose: z.enum([
    'anatomical_localisation',
    'candidate_generation',
    'candidate_refinement',
    'qualification',
    'reliability',
    'context',
    'efield',
  ]),
  minimumQualityPolicyRef: z.string().optional(),
  missingDataBehaviour: z.enum([
    'block_target_generation',
    'disable_personalisation',
    'fallback',
    'allow_with_limitation',
  ]),
  fallbackRuleRef: z.string().optional(),
  rationale: z.string(),
});

export const DeviceCapabilityRequirementSchema = z.object({
  deviceClass: z.string().optional(),
  coilClass: z.string().optional(),
  capabilityCode: z.string().min(1),
  requirement: z.enum(['required', 'optional']),
  rationale: z.string(),
});

export const IndicationModuleReleaseSchema = z.object({
  id: z.string().uuid(),
  code: z.string().min(1),
  semanticVersion: z.string().regex(/^\d+\.\d+\.\d+/),
  title: z.string().min(1),
  description: z.string(),
  indication: IndicationRefSchema,
  lifecycleStatus: ModuleLifecycleStatusSchema,
  moduleStatus: ModuleGovernanceStatusSchema,
  qualificationLevel: ModuleQualificationLevelSchema,
  permittedModes: z.array(MagniomModeSchema).min(1),
  intendedPopulation: PopulationDefinitionSchema,
  excludedPopulations: z.array(PopulationDefinitionSchema).optional(),
  phenotypeSchemaVersionId: z.string().min(1),
  clinicalObjectiveDefinitionIds: z.array(z.string()),
  diseaseStageDefinitionIds: z.array(z.string()).optional(),
  evidenceScopeId: z.string().min(1),
  permittedTargetFamilyIds: z.array(z.string()).min(1),
  permittedCandidateGenerationMethodIds: z.array(z.string()).min(1),
  measurementRequirements: z.array(MeasurementRequirementSchema),
  reliabilityPolicyRefs: z.array(z.string()),
  permittedTargetGeometryTypes: z.array(TargetGeometryTypeSchema).min(1),
  treatmentContextRequirementIds: z.array(z.string()).optional(),
  deviceRequirements: z.array(DeviceCapabilityRequirementSchema).optional(),
  scientificPolicyCompatibilityRefs: z.array(z.string()),
  knownLimitations: z.array(z.string()),
  validationEvidenceIds: z.array(z.string()),
  payloadSha256: z.string().regex(/^[0-9a-fA-F]{64}$/),
  manifestSha256: z.string().regex(/^[0-9a-fA-F]{64}$/),
  createdAt: z.string().min(1),
  releasedAt: z.string().optional(),
  supersedesReleaseId: z.string().uuid().optional(),
  provenance: CommonProvenanceV2Schema,
});

export const TargetingStrategyRefSchema = z.object({
  strategyId: z.string().min(1),
  code: z.string().min(1),
  label: z.string().min(1),
  description: z.string().optional(),
});

export const DeviceContextSchema = z.object({
  deviceModelId: z.string().optional(),
  coilModelId: z.string().optional(),
  stimulatorClass: z.string().optional(),
  coolingType: z.string().optional(),
  notes: z.string().optional(),
});

export const ClinicalObjectiveDefinitionSchema = z.object({
  id: z.string().min(1),
  indicationModuleReleaseId: z.string().min(1),
  code: z.string().min(1),
  label: z.string().min(1),
  description: z.string(),
  targetMappability: z.enum([
    'clinically_supported',
    'supporting_only',
    'research_only',
    'not_evidence_mappable',
  ]),
  candidateRoleSuggestions: z.array(z.string()).optional(),
  standardAssessmentTools: z.array(z.string()).optional(),
  provenance: CommonProvenanceV2Schema.optional(),
});

// ==========================================
// 3. Canonical Object 2: CaseIndication (§9)
// ==========================================

export const CaseIndicationSchema = z.object({
  id: z.string().uuid(),
  version: z.string().min(1),
  caseId: z.string().uuid(),
  indication: IndicationRefSchema,
  indicationModuleReleaseId: z.string().uuid(),
  status: z.enum(['proposed', 'confirmed', 'inactive', 'superseded']),
  clinicalRole: z.enum([
    'primary_targeting_indication',
    'secondary_condition',
    'contextual_comorbidity',
  ]),
  confirmationSourceIds: z.array(z.string()),
  confirmedBy: z.string().uuid().optional(),
  confirmedAt: z.string().optional(),
  dataQuality: DataQualityStateSchema,
  provenance: CommonProvenanceV2Schema,
});

// ==========================================
// 4. Canonical Object 3: DiseaseStageContext (§19-22)
// ==========================================

export const DiseaseStageDefinitionSchema = z.object({
  id: z.string().uuid(),
  version: z.string().min(1),
  indicationModuleReleaseId: z.string().uuid(),
  code: z.string().min(1),
  label: z.string().min(1),
  temporalBounds: z
    .object({
      minimumDays: z.number().nonnegative().optional(),
      maximumDays: z.number().positive().optional(),
    })
    .optional(),
  description: z.string(),
  evidenceClaimIds: z.array(z.string().uuid()).optional(),
  provenance: CommonProvenanceV2Schema,
});

export const DiseaseStageContextSchema = z.object({
  id: z.string().uuid(),
  version: z.string().min(1),
  caseIndicationId: z.string().uuid(),
  stageDefinitionId: z.string().uuid(),
  onsetDate: z.string().optional(),
  calculatedDurationDays: z.number().nonnegative().optional(),
  currentStageCode: z.string().min(1),
  currentStageLabel: z.string().min(1),
  determinationMethod: DiseaseStageDeterminationMethodSchema,
  confidence: ConfidenceLevelSchema,
  dataQuality: DataQualityStateSchema,
  approvedBy: z.string().uuid().optional(),
  approvedAt: z.string().optional(),
  provenance: CommonProvenanceV2Schema,
});

// ==========================================
// 5. Canonical Object 4: LesionContext (§23-27)
// ==========================================

export const AtlasTractRefSchema = z.object({
  tractCode: z.string().min(1),
  tractName: z.string().min(1),
  atlasCode: z.string().min(1),
});

export const LesionTractFindingSchema = z.object({
  tract: AtlasTractRefSchema,
  involvement: z.enum(['none', 'partial', 'substantial', 'complete', 'uncertain']),
  measurementMethod: z.string().optional(),
  sourceMeasurementId: z.string().uuid().optional(),
  confidence: ConfidenceLevelSchema,
});

export const SkullContextSchema = z.object({
  skullDefectPresent: z.boolean(),
  cranioplastyPresent: z.boolean(),
  intracranialHardwarePresent: z.boolean(),
  details: z.string().optional(),
  efieldModellingRequired: z.boolean().optional(),
});

export const LesionContextSchema = z.object({
  id: z.string().uuid(),
  version: z.string().min(1),
  caseIndicationId: z.string().uuid(),
  lesionType: LesionTypeSchema,
  lesionLaterality: LesionLateralitySchema,
  lesionMaskArtifactId: z.string().uuid().optional(),
  sourceImagingStudyIds: z.array(z.string().uuid()),
  lesionVolumeCm3: z.number().nonnegative().optional(),
  corticalRegionsAffected: z.array(AtlasRefSchema),
  subcorticalRegionsAffected: z.array(AtlasRefSchema),
  tractFindings: z.array(LesionTractFindingSchema).optional(),
  skullAbnormality: SkullContextSchema.optional(),
  structuralDistortion: ConfidenceLevelSchema,
  registrationQuality: z.enum(['high', 'moderate', 'low', 'fail']),
  segmentationQuality: z.enum(['high', 'moderate', 'low', 'fail']),
  efieldRelevance: z.enum(['none_known', 'potential', 'material', 'not_assessable']),
  targetRegionExclusions: z.array(SpatialRegionSchema).optional(),
  dataQuality: DataQualityStateSchema,
  interpretation: z.string(),
  provenance: CommonProvenanceV2Schema,
});

// ==========================================
// 6. Canonical Object 5: MeasurementBundle (§31-34)
// ==========================================

export const MeasurementRefSchema = z.object({
  measurementId: z.string().uuid().or(z.string().min(1)),
  modality: MeasurementModalitySchema,
  version: z.string().min(1),
  status: z.enum(['available', 'qualified', 'qualified_with_limits', 'failed', 'not_applicable']),
  acquisitionTime: z.string().optional(),
  pipelineVersionIds: z.array(z.string()).optional(),
  artifactIds: z.array(z.string()).optional(),
});

export const MeasurementRequirementEvaluationSchema = z.object({
  requirementCode: z.string().min(1),
  satisfied: z.boolean(),
  satisfyingMeasurementIds: z.array(z.string()),
  resultingCapability: z.enum(['enabled', 'disabled', 'fallback_only', 'research_only']),
  explanation: z.string(),
});

export const MeasurementBundleSchema = z.object({
  id: z.string().min(1),
  version: z.string().min(1),
  caseId: z.string().uuid(),
  caseIndicationId: z.string().uuid(),
  indicationModuleReleaseId: z.string().uuid(),
  phenotypeSnapshotId: z.string().uuid(),
  diseaseStageContextId: z.string().uuid().optional(),
  lesionContextIds: z.array(z.string().uuid()).optional(),
  measurements: z.array(MeasurementRefSchema),
  qualificationStatus: z.enum(['qualified', 'qualified_with_limits', 'insufficient', 'invalid']),
  requirementEvaluations: z.array(MeasurementRequirementEvaluationSchema),
  limitingFactors: z.array(z.string()),
  createdAt: z.string().min(1),
  payloadSha256: z.string().regex(/^[0-9a-fA-F]{64}$/),
  provenance: CommonProvenanceV2Schema,
});

// ==========================================
// 7. Canonical Object 6: ReliabilityBundle (§38-44)
// ==========================================

export const ReliabilityMeasureV2Schema = z.object({
  metricName: z.string().min(1).optional(),
  metric_name: z.string().min(1).optional(),
  value: z.number().optional(),
  unit: z.string().optional(),
  interpretation: z.enum(['high', 'moderate', 'low', 'not_assessable']),
  method: z.string().min(1),
  referenceRangeId: z.string().optional(),
});

export const MeasurementReliabilitySchema = z.object({
  id: z.string().min(1),
  version: z.string().min(1),
  caseId: z.string().uuid(),
  measurementId: z.string().min(1),
  modality: MeasurementModalitySchema,
  methodCode: z.string().min(1),
  methodVersion: z.string().min(1),
  qcStatus: z.enum(['pass', 'conditional', 'fail']),
  metrics: z.array(ReliabilityMeasureV2Schema),
  reproducibility: z
    .object({
      withinRun: z.array(ReliabilityMeasureV2Schema).optional(),
      crossRun: z.array(ReliabilityMeasureV2Schema).optional(),
      crossMethod: z.array(ReliabilityMeasureV2Schema).optional(),
    })
    .optional(),
  spatialReliability: z
    .object({
      splitHalfDistanceMm: z.number().optional(),
      crossRunDistanceMm: z.number().optional(),
      confidenceRegion: SpatialRegionSchema.optional(),
    })
    .optional(),
  pipelineSensitivity: z.array(ReliabilityMeasureV2Schema).optional(),
  reliabilityClass: z.enum(['high', 'moderate', 'low', 'unreliable', 'not_assessable']),
  limitingFactors: z.array(z.string()),
  interpretation: z.string(),
  pipelineVersionIds: z.array(z.string()),
  provenance: CommonProvenanceV2Schema,
});

export const ReliabilityCapabilityQualificationSchema = z.object({
  capabilityCode: z.string().min(1),
  status: z.enum(['qualified', 'qualified_with_limits', 'not_qualified']),
  reliedOnMeasurementIds: z.array(z.string()),
  reliedOnReliabilityIds: z.array(z.string()),
  policyRuleId: z.string().min(1),
  explanation: z.string(),
});

export const ReliabilityBundleSchema = z.object({
  id: z.string().min(1),
  version: z.string().min(1),
  caseId: z.string().uuid(),
  caseIndicationId: z.string().uuid(),
  indicationModuleReleaseId: z.string().uuid(),
  measurementBundleId: z.string().min(1),
  componentReliabilityIds: z.array(z.string()),
  capabilityQualification: z.array(ReliabilityCapabilityQualificationSchema),
  overallQualification: z.enum(['qualified', 'qualified_with_limits', 'not_qualified']),
  limitingFactors: z.array(z.string()),
  interpretation: z.string(),
  payloadSha256: z.string().regex(/^[0-9a-fA-F]{64}$/),
  provenance: CommonProvenanceV2Schema,
});

// ==========================================
// 8. Canonical Object 7: TreatmentContextSnapshot (§46-50)
// ==========================================

export const TreatmentContextRequirementSchema = z.object({
  id: z.string().uuid(),
  version: z.string().min(1),
  indicationModuleReleaseId: z.string().uuid(),
  code: z.string().min(1),
  label: z.string().min(1),
  contextType: z.enum([
    'concurrent_rehabilitation',
    'behavioural_activation',
    'symptom_provocation',
    'task_state',
    'device_class',
    'coil_class',
    'protocol_precedent',
    'other',
  ]),
  role: z.enum(['required_by_evidence', 'recommended_by_evidence', 'context_only']),
  description: z.string(),
  evidenceClaimIds: z.array(z.string().uuid()),
  absenceBehaviour: z.enum([
    'ineligible',
    'downgrade_evidence_applicability',
    'show_limitation',
    'research_only',
  ]),
  provenance: CommonProvenanceV2Schema,
});

export const TreatmentContextEvaluationSchema = z.object({
  treatmentContextRequirementId: z.string().uuid(),
  status: z.enum(['present', 'planned', 'absent', 'unknown', 'not_applicable']),
  evidence: z.string().optional(),
  dataQuality: DataQualityStateSchema,
  interpretation: z.string().optional(),
});

export const TreatmentContextSnapshotSchema = z.object({
  id: z.string().uuid(),
  version: z.string().min(1),
  caseIndicationId: z.string().uuid(),
  requirementEvaluations: z.array(TreatmentContextEvaluationSchema),
  approvedBy: z.string().uuid().optional(),
  approvedAt: z.string().optional(),
  payloadSha256: z.string().regex(/^[0-9a-fA-F]{64}$/),
  provenance: CommonProvenanceV2Schema,
});

/**
 * §12. CANONICAL OBJECT — IndicationModuleSchema
 */
export const IndicationModuleSchema = z.object({
  id: z.string().uuid(),
  code: z.string().min(1),
  version: z.string().min(1),
  indication: ClinicalConceptRefSchema,
  title: z.string().min(1),
  status: ModuleGovernanceStatusSchema,
  intended_population: PopulationDefinitionSchema,
  allowed_modes: z.array(MagniomModeSchema).min(1),
  phenotype_schema_version_id: z.string().min(1),
  evidence_scope_id: z.string().min(1),
  clinical_objectives: z.array(ClinicalObjectiveDefinitionSchema),
  candidate_generation_methods: z.array(TargetingStrategyRefSchema),
  measurement_requirements: z.array(MeasurementRequirementSchema),
  target_geometry_types: z.array(TargetGeometryTypeSchema).min(1),
  reliability_policy_refs: z.array(z.string()),
  scientific_policy_compatibility: z.array(z.string()),
  adjunctive_context_requirements: z.array(TreatmentContextRequirementSchema),
  limitations: z.array(z.string()),
  validation_evidence_ids: z.array(z.string()),
  manifest_sha256: z.string().regex(/^[0-9a-fA-F]{64}$/),
});

/**
 * §34. INDICATION ENGINE CONTRACT — IndicationTargetingContextSchema
 */
export const IndicationTargetingContextSchema = z.object({
  case_id: z.string().uuid(),
  indication_module_release_id: z.string().uuid(),
  clinical_objective_snapshot_id: z.string().uuid(),
  phenotype_snapshot_id: z.string().uuid(),
  evidence_library_release_id: z.string().uuid(),
  scientific_policy_release_id: z.string().uuid(),
  measurement_bundle_id: z.string().uuid(),
  reliability_bundle_id: z.string().uuid().optional(),
  target_engine_version_id: z.string().min(1),
  device_context: z.array(DeviceContextSchema).optional(),
});

/**
 * §62. PHENOTYPE EXTENSION CONTRACT — IndicationPhenotypeExtensionSchema
 */
export const IndicationPhenotypeExtensionSchema = z.object({
  indication_module_release_id: z.string().uuid(),
  schema_version: z.string().min(1),
  payload: z.unknown(),
  validation_status: z.enum(['valid', 'suspect', 'provisional', 'invalid']),
  approved_by: z.string().min(1),
  approved_at: z.string().min(1),
  payload_sha256: z.string().regex(/^[0-9a-fA-F]{64}$/),
});

// ==========================================
// 9. Canonical Object 8: TargetGeometry (§52-66)
// ==========================================

const TargetGeometryBaseSchema = z.object({
  coordinateSpace: CoordinateSpaceRefSchema,
  laterality: z.enum(['left', 'right', 'bilateral', 'midline', 'not_applicable']),
  sourceMethod: z.string().min(1),
  sourceMethodVersion: z.string().min(1),
  provenance: CommonProvenanceV2Schema,
});

export const PointTargetGeometrySchema = TargetGeometryBaseSchema.extend({
  geometryType: z.literal('point'),
  centre: Coordinate3DSchema,
  optionalRoi: SpatialRegionSchema.optional(),
  surfaceVertexId: z.string().optional(),
  normalVector: Coordinate3DSchema.optional(),
});

export const SurfaceROITargetGeometrySchema = TargetGeometryBaseSchema.extend({
  geometryType: z.literal('surface_roi'),
  surfaceId: z.string().min(1),
  vertexIds: z.array(z.string()).optional(),
  meshArtifactId: z.string().uuid().optional(),
  centre: Coordinate3DSchema.optional(),
  areaMm2: z.number().positive().optional(),
  confidenceRegion: SpatialRegionSchema.optional(),
});

export const VolumetricROITargetGeometrySchema = TargetGeometryBaseSchema.extend({
  geometryType: z.literal('volumetric_roi'),
  maskArtifactId: z.string().uuid(),
  centre: Coordinate3DSchema.optional(),
  volumeMm3: z.number().positive().optional(),
  atlasAnnotations: z.array(AtlasRefSchema).optional(),
});

export const BodyRegionRefSchema = z.object({
  code: z.string().min(1),
  label: z.string().min(1),
  parentCode: z.string().optional(),
});

export const SomatotopicTargetGeometrySchema = TargetGeometryBaseSchema.extend({
  geometryType: z.literal('somatotopic'),
  corticalRegion: AtlasRefSchema,
  bodyRegion: BodyRegionRefSchema,
  affectedBodySide: z.enum(['left', 'right', 'bilateral', 'midline', 'not_applicable']).optional(),
  stimulationHemisphere: z.enum(['left', 'right', 'bilateral']),
  motorMappingRunId: z.string().uuid().optional(),
  mappedHotspot: Coordinate3DSchema.optional(),
  mappedSurfaceRegion: SpatialRegionSchema.optional(),
  mappingReliabilityId: z.string().uuid().optional(),
});

export const CoilPlacementSchema = z.object({
  scalpCoordinate: Coordinate3DSchema.optional(),
  orientationDegrees: z.number().optional(),
  coilToScalpDistanceMm: z.number().optional(),
  placementCoordinateSystem: CoordinateSpaceRefSchema,
  placementDescription: z.string().optional(),
});

export const EFieldMetricSchema = z.object({
  metricName: z.string().min(1),
  value: z.number(),
  unit: z.string().min(1),
});

export const PoseToleranceSchema = z.object({
  positionMm: z.number().nonnegative(),
  orientationDegrees: z.number().nonnegative(),
});

export const CoilFieldTargetGeometrySchema = TargetGeometryBaseSchema.extend({
  geometryType: z.literal('coil_field'),
  coilModelId: z.string().uuid(),
  deviceModelId: z.string().uuid().optional(),
  placement: CoilPlacementSchema,
  intendedFieldRegion: SpatialRegionSchema,
  therapeuticRegionIds: z.array(z.string().uuid()),
  efieldRunId: z.string().uuid().optional(),
  fieldCoverageMetrics: z.array(EFieldMetricSchema).optional(),
  poseTolerance: PoseToleranceSchema.optional(),
  pointCoordinateIsRepresentativeOnly: z.boolean(),
});

export const NetworkTargetGeometrySchema = TargetGeometryBaseSchema.extend({
  geometryType: z.literal('network'),
  therapeuticCircuitIds: z.array(z.string().uuid()),
  accessibleNodeRegions: z.array(SpatialRegionSchema),
  preferredStimulationRegion: SpatialRegionSchema.optional(),
  networkDefinitionVersionId: z.string().uuid(),
  networkMeasurementSourceIds: z.array(z.string().uuid()).optional(),
});

// Canonical Discriminated Union
export const TargetGeometrySchema = z.discriminatedUnion('geometryType', [
  PointTargetGeometrySchema,
  SurfaceROITargetGeometrySchema,
  VolumetricROITargetGeometrySchema,
  SomatotopicTargetGeometrySchema,
  CoilFieldTargetGeometrySchema,
  NetworkTargetGeometrySchema,
]);

// ==========================================
// 10. Canonical Object 9 & 10: EvidencePath & Governance Classification
// ==========================================

export const EvidenceGovernanceClassificationSchema = z.object({
  id: z.string().min(1),
  evidenceClaimId: z.string().uuid(),
  claimVersion: z.string().min(1),
  classificationStatus: GovernanceClassificationStatusSchema,
  magniomEvidenceTier: LegacyEvidenceTierSchema.optional(),
  permittedRoles: z
    .object({
      standalonePrimary: z.boolean(),
      standaloneAdditional: z.boolean(),
      supportingContext: z.boolean(),
      refinementOfParentClaims: z.boolean(),
      researchCandidateGeneration: z.boolean(),
    })
    .optional(),
  reviewerIds: z.array(z.string()),
  rationale: z.string().optional(),
  supportingSynthesisId: z.string().uuid().optional(),
  assignedAt: z.string().optional(),
  supersedesClassificationId: z.string().uuid().optional(),
  provenance: CommonProvenanceV2Schema,
});

export const EvidencePathV2Schema = z.object({
  id: z.string().min(1),
  indicationModuleReleaseId: z.string().uuid(),
  evidenceClaimIds: z.array(z.string().uuid()),
  populationId: z.string().uuid(),
  clinicalObjectiveId: z.string().uuid(),
  diseaseStageId: z.string().uuid().optional(),
  therapeuticCircuitId: z.string().uuid().optional(),
  targetFamilyId: z.string().min(1),
  targetingStrategyId: z.string().min(1),
  targetGeometryType: TargetGeometryTypeSchema,
  treatmentContextRequirementIds: z.array(z.string().uuid()).optional(),
  governanceClassificationIds: z.array(z.string().min(1)),
  pathStatus: EvidencePathStatusSchema,
  scientificPolicyReleaseId: z.string().uuid().optional(),
  provenance: CommonProvenanceV2Schema,
});

export const EvidencePathPermissionSchema = z.object({
  evidencePathId: z.string().min(1),
  permittedModes: z.array(MagniomModeSchema),
  candidateRoles: z.array(AnyCandidateRoleSchema),
  candidateGenerationMethodIds: z.array(z.string()),
  standalonePrimary: z.boolean(),
  standaloneAdditional: z.boolean(),
  supportingContext: z.boolean(),
  refinementParentPathIds: z.array(z.string()).optional(),
  populationConstraints: z.array(z.string()).optional(),
  diseaseStageConstraints: z.array(z.string()).optional(),
  treatmentContextConstraints: z.array(z.string()).optional(),
  targetGeometryTypes: z.array(TargetGeometryTypeSchema),
  limitations: z.array(z.string()),
});

// ==========================================
// 11. Canonical Object 11: ScientificCompatibilityConfiguration
// ==========================================

export const ComponentReleaseRefSchema = z.object({
  componentType: z.string().min(1),
  componentId: z.string().min(1),
  componentVersion: z.string().min(1),
  manifestSha256: z
    .string()
    .regex(/^[0-9a-fA-F]{64}$/)
    .optional(),
});

export const ComponentRequirementRefSchema = z.object({
  componentType: z.string().min(1),
  componentId: z.string().min(1).optional(),
  componentVersion: z.string().min(1).optional(),
  requirement: z.enum(['required', 'optional', 'disabled', 'not_applicable']),
  purpose: z.string().optional(),
});

export const ScientificCompatibilityConfigurationSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1),
  version: z.string().min(1),
  scientificPolicyReleaseId: z.string().uuid(),
  indicationModuleReleaseId: z.string().uuid(),
  mode: MagniomModeSchema,
  evidenceLibraryReleaseId: z.string().uuid(),
  targetEngineReleaseId: z.string().uuid(),
  targetingPlugin: ComponentReleaseRefSchema,
  candidateGenerators: z.array(ComponentReleaseRefSchema),
  measurementProviders: z.array(ComponentRequirementRefSchema),
  reliabilityMethods: z.array(ComponentRequirementRefSchema),
  phenotypeOntologyReleaseId: z.string().uuid(),
  atlasReleases: z.array(ComponentRequirementRefSchema),
  normativeModels: z.array(ComponentRequirementRefSchema),
  efieldEngine: ComponentRequirementRefSchema.optional(),
  deviceCapabilityProfiles: z.array(ComponentRequirementRefSchema),
  acquisitionProfiles: z.array(ComponentRequirementRefSchema),
  compatibilityStatus: CompatibilityStatusSchema,
  validationEvidenceIds: z.array(z.string()),
  configurationSha256: z.string().regex(/^[0-9a-fA-F]{64}$/),
});

// ==========================================
// 12. Candidate and Slate v2 Schemas
// ==========================================

export const TargetEvidenceProfileV2Schema = z.object({
  highestEvidenceTier: LegacyEvidenceTierSchema,
  indicationMatch: z.boolean(),
  indicationModuleMatch: z.boolean(),
  populationMatch: z.boolean(),
  diseaseStageMatch: z.enum(['match', 'mismatch', 'not_applicable', 'uncertain']),
  targetFamilyMatch: z.boolean(),
  targetingMethodMatch: z.boolean(),
  targetGeometryMatch: z.boolean(),
  treatmentContextMatch: z.enum(['match', 'partial', 'mismatch', 'unknown']).optional(),
  evidenceClaimIds: z.array(z.string()),
  conflictingEvidenceClaimIds: z.array(z.string()).optional(),
  evidenceConfidence: ConfidenceLevelSchema,
  applicabilityLimitations: z.array(z.string()),
  evidenceSummary: z.string(),
});

// ---------------------------------------------------------------------------
// Candidate Domain Fit Profiles & Relationships (§74-77, §106)
// ---------------------------------------------------------------------------

export const LesionTargetRelationshipSchema = z.object({
  lesionContextId: z.string().uuid(),
  targetRelationship: z.enum([
    'outside_lesion',
    'adjacent',
    'partially_involved',
    'substantially_involved',
    'destroyed_or_absent',
    'not_assessable',
  ]),
  minimumDistanceToLesionMm: z.number().nonnegative().optional(),
  tissueIntegrity: z.enum(['apparently_intact', 'altered', 'severely_altered', 'not_assessable']),
  interpretation: z.string(),
});

export const MotorMappingFitProfileSchema = z.object({
  motorMappingRunId: z.string().uuid(),
  relevantBodyRegion: BodyRegionRefSchema,
  hotspotCoordinate: Coordinate3DSchema.optional(),
  candidateToHotspotDistanceMm: z.number().nonnegative().optional(),
  mapOverlap: z.number().min(0).max(1).optional(),
  mapReliabilityId: z.string().uuid().optional(),
  interpretation: z.string(),
});

export const StructuralConnectivityFitProfileSchema = z.object({
  sourceMeasurementId: z.string().uuid(),
  tractIds: z.array(z.string()),
  connectivityMetrics: z.record(z.number()),
  method: z.string().min(1),
  modelVersion: z.string().min(1),
  reliabilityId: z.string().uuid().optional(),
  interpretation: z.string(),
});

export const TargetTreatmentContextEvaluationSchema = z.object({
  treatmentContextSnapshotId: z.string().uuid(),
  requiredContextIds: z.array(z.string()),
  matchedContextIds: z.array(z.string()),
  applicability: z.enum(['full', 'partial', 'limited', 'not_applicable']),
  limitations: z.array(z.string()),
  interpretation: z.string(),
});

export const ResearchTargetExtensionSchema = z.object({
  experimentalHypothesisCode: z.string().min(1),
  explorativeConfidence: z.number().min(0).max(1).optional(),
  nonStandardParameters: z.record(z.unknown()).optional(),
  notes: z.string().optional(),
});

export const TargetCandidateV2Schema = z.object({
  id: z.string().min(1),
  version: z.string().min(1),
  caseId: z.string().uuid(),
  caseIndicationId: z.string().uuid(),
  assessmentId: z.string().uuid().optional(),
  mode: MagniomModeSchema,
  indicationModuleReleaseId: z.string().uuid(),
  scientificPolicyReleaseId: z.string().uuid(),
  generationStatus: CandidateStatusSchema,
  candidateRole: AnyCandidateRoleSchema,
  targetFamilyId: z.string().min(1),
  therapeuticCircuitIds: z.array(z.string()),
  clinicalObjectiveIds: z.array(z.string()),
  targetGeometry: TargetGeometrySchema,
  standardSpaceGeometry: TargetGeometrySchema.optional(),
  atlasAnnotations: z.array(AtlasRefSchema),
  clinicalEvidence: TargetEvidenceProfileV2Schema,
  diseaseStageContextId: z.string().uuid().optional(),
  lesionContextIds: z.array(z.string().uuid()).optional(),
  measurementBundleId: z.string().min(1),
  reliabilityBundleId: z.string().min(1).optional(),
  reliedOnMeasurementIds: z.array(z.string()),
  reliedOnReliabilityIds: z.array(z.string()),
  nominationRationale: z.string(),
  counterarguments: z.array(z.string()),
  supportingEvidenceClaimIds: z.array(z.string()),
  conflictingEvidenceClaimIds: z.array(z.string()),
  targetEngineVersionId: z.string().min(1),
  evidenceLibraryReleaseId: z.string().min(1),
  provenance: CommonProvenanceV2Schema,
  lesionTargetRelationship: LesionTargetRelationshipSchema.optional(),
  motorMappingFit: MotorMappingFitProfileSchema.optional(),
  structuralConnectivityFit: StructuralConnectivityFitProfileSchema.optional(),
  treatmentContextEvaluation: TargetTreatmentContextEvaluationSchema.optional(),
  researchExtension: ResearchTargetExtensionSchema.optional(),
});

export const SlateCandidateRefV2Schema = z.object({
  targetCandidateId: z.string().min(1),
  position: z.enum(['primary_1', 'primary_2', 'primary_3', 'additional_a', 'additional_b']),
  role: AnyCandidateRoleSchema,
  rankWithinRole: z.number().int().positive().optional(),
  inclusionReason: z.string(),
  redundancyWith: z.array(z.string()).optional(),
});

export const AbstentionProfileV2Schema = z.object({
  abstentionType: AbstentionTypeSchema,
  reasonCodes: z.array(z.string()),
  explanation: z.string(),
  affectedCapabilities: z.array(z.string()).optional(),
  fallbackOptions: z.array(z.string()),
});

export const TargetSlateV2Schema = z.object({
  id: z.string().min(1),
  version: z.string().min(1),
  caseId: z.string().uuid(),
  caseIndicationId: z.string().uuid(),
  assessmentId: z.string().uuid().optional(),
  mode: MagniomModeSchema,
  indicationModuleReleaseId: z.string().uuid(),
  scientificPolicyReleaseId: z.string().uuid(),
  status: SlateStatusSchema,
  generatedAt: z.string().min(1),
  phenotypeSnapshotId: z.string().uuid(),
  clinicalObjectiveIds: z.array(z.string()),
  diseaseStageContextId: z.string().uuid().optional(),
  lesionContextIds: z.array(z.string().uuid()).optional(),
  measurementBundleId: z.string().min(1),
  reliabilityBundleId: z.string().min(1).optional(),
  evidenceLibraryReleaseId: z.string().min(1),
  targetEngineVersionId: z.string().min(1),
  pipelineVersionIds: z.array(z.string()),
  primaryCandidates: z.array(SlateCandidateRefV2Schema),
  additionalCandidates: z.array(SlateCandidateRefV2Schema),
  slateConvergence: z.object({
    comparedSources: z.array(z.string()),
    pairwiseRelationships: z.array(
      z.object({
        sourceA: z.string(),
        sourceB: z.string(),
        spatialAgreementMm: z.number().optional(),
        agreement: z.enum(['high', 'moderate', 'low', 'not_assessable']),
        interpretation: z.string().optional(),
      }),
    ),
    overall: z.enum(['high', 'moderate', 'low', 'not_assessable']),
    interpretation: z.string(),
  }),
  clinicalCoverage: z.object({
    objectives: z.array(
      z.object({
        clinicalObjectiveId: z.string(),
        priorityRank: z.number(),
        coveredByCandidateIds: z.array(z.string()),
        coverage: z.enum(['strong', 'partial', 'none', 'not_evidence_mappable']),
        interpretation: z.string().optional(),
      }),
    ),
    redundancySummary: z.string(),
  }),
  abstention: AbstentionProfileV2Schema.optional(),
  generationSummary: z.string(),
  scientificLimitations: z.array(z.string()),
  payloadSha256: z.string().regex(/^[0-9a-fA-F]{64}$/),
  provenance: CommonProvenanceV2Schema,
});

// ---------------------------------------------------------------------------
// Cross-Indication Target Review (§89) & Clinician Modifications (§96)
// ---------------------------------------------------------------------------

export const CrossSlateSpatialRelationshipSchema = z.object({
  candidateIdA: z.string().min(1),
  candidateIdB: z.string().min(1),
  distanceMm: z.number().nonnegative().optional(),
  relationship: z.enum(['identical', 'overlapping', 'adjacent', 'remote']),
  interpretation: z.string().optional(),
});

export const ClinicalObjectiveConflictSchema = z.object({
  objectiveIdA: z.string().min(1),
  objectiveIdB: z.string().min(1),
  conflictType: z.enum(['antagonistic', 'competing_priority', 'physiological_tradeoff']),
  explanation: z.string(),
});

export const CrossIndicationTargetReviewSchema = z.object({
  id: z.string().min(1),
  caseId: z.string().uuid(),
  targetSlateIds: z.array(z.string().min(1)),
  spatialRelationships: z.array(CrossSlateSpatialRelationshipSchema),
  overlappingTargetFamilyIds: z.array(z.string()),
  conflictingObjectives: z.array(ClinicalObjectiveConflictSchema),
  summary: z.string(),
  mode: MagniomModeSchema,
  provenance: CommonProvenanceV2Schema,
});

export const ClinicianModifiedTargetSchema = z.object({
  sourceTargetCandidateId: z.string().min(1),
  modifiedGeometry: TargetGeometrySchema,
  modificationDistanceMm: z.number().nonnegative().optional(),
  modificationReason: z.string().min(1),
  createdBy: z.string().min(1),
  createdAt: z.string().min(1),
});

// ---------------------------------------------------------------------------
// Target Engine Input & Output Manifest Schemas (§111-112)
// ---------------------------------------------------------------------------

export const TargetEngineInputV2Schema = z.object({
  caseId: z.string().uuid(),
  caseIndicationId: z.string().uuid(),
  mode: MagniomModeSchema,
  indicationModuleReleaseId: z.string().uuid(),
  phenotypeSnapshotId: z.string().uuid(),
  clinicalObjectiveIds: z.array(z.string()),
  diseaseStageContextId: z.string().uuid().optional(),
  lesionContextIds: z.array(z.string().uuid()).optional(),
  treatmentContextSnapshotId: z.string().uuid().optional(),
  measurementBundleId: z.string().min(1),
  reliabilityBundleId: z.string().min(1).optional(),
  evidenceLibraryReleaseId: z.string().min(1),
  scientificPolicyReleaseId: z.string().min(1),
  targetEngineVersionId: z.string().min(1),
  deviceContextIds: z.array(z.string()).optional(),
});

export const CanonicalTargetEngineOutputManifestV2Schema = z.object({
  generated_candidate_ids: z.array(z.string()),
  eligible_candidate_ids: z.array(z.string()),
  suppressed_candidate_ids: z.array(z.string()),
  target_slate_id: z.string().optional(),
  abstention: AbstentionProfileV2Schema.optional(),
  warnings: z.array(z.string()),
  reproducibility_manifest_sha256: z.string().regex(/^[0-9a-fA-F]{64}$/),
});

export const TargetFamilyV2Schema = TargetFamilySchema.extend({
  permittedGeometryTypes: z.array(TargetGeometryTypeSchema).optional(),
  permittedTargetGeometryTypes: z.array(TargetGeometryTypeSchema).optional(),
  indicationModuleReleaseId: z.string().optional(),
  indicationScopeIds: z.array(z.string()).optional(),
  clinicalObjectiveDefinitionIds: z.array(z.string()).optional(),
  therapeuticCircuitIds: z.array(z.string()).optional(),
  evidenceClaimIds: z.array(z.string()).optional(),
  candidateGenerationMethodIds: z.array(z.string()).optional(),
  treatmentContextRequirementIds: z.array(z.string()).optional(),
  diseaseStageConstraints: z.array(z.string()).optional(),
  governanceStatus: z
    .enum(['staging', 'research', 'validation', 'clinical_permitted', 'suspended'])
    .optional(),
  anatomy: z.record(z.unknown()).optional(),
});

// ---------------------------------------------------------------------------
// Prohibited Canonical Fields (§138)
// ---------------------------------------------------------------------------

export const PROHIBITED_CANONICAL_FIELDS = [
  'optimal_target',
  'optimalTarget',
  'brain_abnormality_score',
  'brainAbnormalityScore',
  'expected_response_probability',
  'expectedResponseProbability',
  'recommended_protocol',
  'recommendedProtocol',
  'global_tms_suitability_score',
  'globalTmsSuitabilityScore',
  'multi_indication_target_score',
  'multiIndicationTargetScore',
  'stroke_recovery_probability',
  'strokeRecoveryProbability',
] as const;

// ==========================================
// 19. Canonical Multimodal Measurement Schemas (Specification v2.0)
// ==========================================

export const MeasurementQualificationSchema = z.enum([
  'qualified',
  'qualified_with_limits',
  'not_qualified',
  'research_only',
  'not_assessable',
]);

export const ProcessingRunStatusSchema = z.enum([
  'queued',
  'running',
  'succeeded',
  'failed',
  'superseded',
]);

export const ArtifactManifestEntrySchema = z.object({
  path: z.string().min(1),
  sha256: z.string().regex(/^[0-9a-fA-F]{64}$/),
  sizeBytes: z.number().nonnegative(),
  mimeType: z.string().optional(),
});

export const MeasurementArtifactManifestSchema = z.object({
  measurementId: z.string().min(1),
  inputArtifacts: z.array(ArtifactManifestEntrySchema),
  outputArtifacts: z.array(ArtifactManifestEntrySchema),
  pipelineVersionId: z.string().min(1),
  configurationSha256: z.string().regex(/^[0-9a-fA-F]{64}$/),
  manifestSha256: z.string().regex(/^[0-9a-fA-F]{64}$/),
});

export const MeasurementDeviceSchema = z.object({
  id: z.string().min(1),
  manufacturer: z.string().min(1),
  model: z.string().min(1),
  deviceType: z.string().min(1),
  serialOrPseudonymousIdentifier: z.string().optional(),
  softwareVersion: z.string().optional(),
  calibrationRecordId: z.string().optional(),
  siteId: z.string().min(1),
  calibrationValid: z.boolean(),
});

export const MuscleTargetSchema = z.object({
  code: z.string().min(1),
  label: z.string().min(1),
  bodyRegion: z.string().min(1),
  laterality: z.enum(['left', 'right']),
});

export const ProcessingRunSchema = z.object({
  id: z.string().min(1),
  caseId: z.string().uuid(),
  organisationId: z.string().uuid(),
  modality: MeasurementModalitySchema,
  pipelineVersionId: z.string().min(1),
  inputArtifactIds: z.array(z.string()),
  configurationSha256: z.string().regex(/^[0-9a-fA-F]{64}$/),
  containerDigestSha256: z
    .string()
    .regex(/^[0-9a-fA-F]{64}$/)
    .optional(),
  status: ProcessingRunStatusSchema,
  startedAt: z.string().min(1),
  completedAt: z.string().optional(),
  outputArtifactIds: z.array(z.string()),
  runManifestSha256: z
    .string()
    .regex(/^[0-9a-fA-F]{64}$/)
    .optional(),
  executionLogs: z.array(z.string()).optional(),
});

export const CanonicalMeasurementBaseSchema = z.object({
  id: z.string().min(1),
  organisationId: z.string().min(1),
  caseId: z.string().uuid(),
  modality: MeasurementModalitySchema,
  version: z.string().min(1),
  status: z.enum(['available', 'qualified', 'qualified_with_limits', 'failed', 'not_applicable']),
  acquisitionTime: z.string().optional(),
  pipelineVersionIds: z.array(z.string()),
  artifactIds: z.array(z.string()),
  deviceId: z.string().optional(),
  rawDataHash: z
    .string()
    .regex(/^[0-9a-fA-F]{64}$/)
    .optional(),
  qcStatus: z.enum(['pass', 'conditional', 'fail']),
  qualification: MeasurementQualificationSchema,
  provenance: CommonProvenanceV2Schema,
  acquisition_profile_id: z.string().optional(),
  acquisition_id: z.string().optional(),
  processing_run_id: z.string().optional(),
  capability_codes: z.array(z.string()).optional(),
  source_artifact_ids: z.array(z.string()).optional(),
  derivative_artifact_ids: z.array(z.string()).optional(),
  coordinate_space_refs: z.array(CoordinateSpaceRefSchema).optional(),
  qc_assessment_id: z.string().optional(),
  measurement_manifest_sha256: z.string().optional(),
  mode: z.enum(['clinical', 'research']).optional(),
});

export const AcquisitionParameterDefinitionSchema = z.object({
  name: z.string().min(1),
  value: z.union([z.string(), z.number(), z.boolean()]),
  unit: z.string().optional(),
  required: z.boolean(),
});

export const AcquisitionProfileSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1),
  version: z.string().min(1),
  modality: MeasurementModalitySchema,
  parameters: z.array(AcquisitionParameterDefinitionSchema),
  intended_capabilities: z.array(z.string()),
  validated_site_ids: z.array(z.string()).optional(),
  validation_status: z.enum(['design_only', 'research_validated', 'clinical_qualified']),
  limitations: z.array(z.string()),
  provenance: CommonProvenanceV2Schema,
});

export const CalibrationRecordSchema = z.object({
  id: z.string().min(1),
  deviceId: z.string().min(1),
  calibratedAt: z.string(),
  validUntil: z.string(),
  calibratedBy: z.string(),
  standardRef: z.string(),
  isValid: z.boolean(),
});

export const EquipmentObjectSchema = z.object({
  id: z.string().min(1),
  manufacturer: z.string(),
  model: z.string(),
  equipmentType: z.enum([
    'mri_scanner',
    'tms_stimulator',
    'tms_coil',
    'navigation_system',
    'emg_amplifier',
    'audiometer',
  ]),
  serialNumber: z.string().optional(),
  softwareVersion: z.string().optional(),
  siteId: z.string(),
  calibration: CalibrationRecordSchema,
});

export const StructuralQualityMetricsSchema = z.object({
  coverageScore: z.number().min(0).max(1),
  motionArtefactScore: z.number().min(0).max(1),
  tissueContrastSnr: z.number().nonnegative(),
  segmentationQualityPassed: z.boolean(),
  surfaceReconstructionQualityPassed: z.boolean(),
  registrationQualityPassed: z.boolean(),
  scalpReconstructionPassed: z.boolean(),
  grossDistortionDetected: z.boolean(),
});

export const StructuralMeasurementSchema = CanonicalMeasurementBaseSchema.extend({
  modality: z.literal('structural_mri'),
  nativeT1ArtifactId: z.string().min(1),
  t2w_artifact_id: z.string().optional(),
  brain_mask_artifact_id: z.string().optional(),
  segmentation_artifact_ids: z.array(z.string()).optional(),
  cortical_surface_artifact_ids: z.array(z.string()).optional(),
  surfaceNativeMeshArtifactId: z.string().optional(),
  skullMeshArtifactId: z.string().optional(),
  hasAnatomicalAbnormality: z.boolean(),
  anatomicalNotes: z.string().optional(),
  nativeVoxelDimensions: z.tuple([z.number(), z.number(), z.number()]),
  orientation: z.enum(['RAS', 'LPS', 'other']),
  coordinateSpace: CoordinateSpaceRefSchema,
  structural_qc: StructuralQualityMetricsSchema.optional(),
});

export const TargetFamilyLesionRelationshipSchema = z.object({
  targetFamilyId: z.string().min(1),
  status: z.enum([
    'outside',
    'adjacent',
    'partially_involved',
    'substantially_involved',
    'tissue_absent',
    'not_assessable',
  ]),
  minDistanceMm: z.number().nonnegative(),
  volumeOverlapPercent: z.number().min(0).max(100),
  interpretation: z.string(),
});

export const LesionMeasurementSchema = CanonicalMeasurementBaseSchema.extend({
  modality: z.literal('lesion_mapping'),
  lesionType: z.string().min(1),
  laterality: z.enum(['left', 'right', 'bilateral', 'midline']),
  nativeMaskArtifactId: z.string().min(1),
  volumeMm3: z.number().nonnegative(),
  isTargetDestroyed: z.boolean(),
  intersectedTargetFamilyIds: z.array(z.string()),
  nearestIntactCortexDistanceMm: z.number().optional(),
  registrationConfidence: z.enum(['high', 'moderate', 'low']),
  segmentationMethod: z.enum(['manual', 'validated_automated', 'semi_automated']),
  target_family_relationships: z.array(TargetFamilyLesionRelationshipSchema).optional(),
});

export const RestingStateMeasurementSchema = CanonicalMeasurementBaseSchema.extend({
  modality: z.literal('resting_state_fmri'),
  acquiredDurationSeconds: z.number().nonnegative(),
  retainedDurationSeconds: z.number().nonnegative(),
  meanFramewiseDisplacementMm: z.number().nonnegative(),
  scrubbedVolumesFraction: z.number().min(0).max(1),
  targetAntiCorrelationPeakMni: Coordinate3DSchema.optional(),
  sgAccDlpfcConcordance: z.number(),
  splitHalfStabilityR: z.number(),
});

export const TaskPerformanceSummarySchema = z.object({
  accuracyRate: z.number().min(0).max(1),
  meanReactionTimeMs: z.number().nonnegative().optional(),
  validTrialCount: z.number().nonnegative(),
  totalTrialCount: z.number().positive(),
  isBehavioralValid: z.boolean(),
  notes: z.string().optional(),
});

export const TaskFMRIMeasurementSchema = CanonicalMeasurementBaseSchema.extend({
  modality: z.literal('task_fmri'),
  paradigmId: z.string().min(1),
  paradigmName: z.string().min(1),
  behavioralPerformanceValid: z.boolean(),
  taskAccuracyRate: z.number().min(0).max(1).optional(),
  activationClusterPeakCoordinate: Coordinate3DSchema.optional(),
  lateralityIndex: z.number().min(-1).max(1),
  activationHemisphere: z.enum(['left', 'right', 'bilateral']),
  thresholdSensitivityClass: z.enum(['robust', 'moderate', 'sensitive']),
  task_performance: TaskPerformanceSummarySchema.optional(),
});

export const DiffusionMeasurementSchema = CanonicalMeasurementBaseSchema.extend({
  modality: z.literal('diffusion_mri'),
  bValueCount: z.number().nonnegative(),
  gradientDirectionsCount: z.number().nonnegative(),
  reconstructedTracts: z.array(
    z.object({
      tractName: z.string().min(1),
      meanFractionalAnisotropy: z.number().min(0).max(1),
      meanDiffusivity: z.number().nonnegative(),
      reconstructionStability: z.enum(['high', 'moderate', 'unstable']),
    }),
  ),
  corticospinalTractIntact: z.boolean(),
  isAxonCountEquivalent: z.literal(false),
});

export const MotorMappingPointSchema = z.object({
  pointId: z.string().min(1),
  stimulusIndex: z.number().nonnegative(),
  stimulationCoordinate: Coordinate3DSchema,
  coilOrientationDegrees: z.number(),
  intensityPercentMso: z.number().min(0).max(100),
  muscle: MuscleTargetSchema,
  mepAmplitudeUv: z.number().nonnegative(),
  responsePresent: z.boolean(),
});

export const MotorHotspotSchema = z.object({
  hotspotId: z.string().min(1),
  muscle: MuscleTargetSchema,
  coordinate: Coordinate3DSchema,
  hemisphere: z.enum(['left', 'right']),
  repeatabilityMm: z.number().nonnegative(),
  stimulationThresholdPercentMso: z.number().min(0).max(100),
  reliabilityClass: z.enum(['high', 'moderate', 'low', 'unreliable', 'not_assessable']),
});

export const MotorMappingMeasurementSchema = CanonicalMeasurementBaseSchema.extend({
  modality: z.literal('motor_mapping'),
  mappingPoints: z.array(MotorMappingPointSchema),
  hotspots: z.array(MotorHotspotSchema),
  targetMuscle: MuscleTargetSchema,
  spatialSpreadMm: z.number().nonnegative(),
});

export const MEPTrialSchema = z.object({
  trialIndex: z.number().nonnegative(),
  intensityPercentMso: z.number().min(0).max(100),
  peakToPeakAmplitudeUv: z.number().nonnegative(),
  latencyMs: z.number().nonnegative(),
  backgroundEmgValid: z.boolean(),
  isArtefact: z.boolean(),
});

export const MotorThresholdMeasurementSchema = z.object({
  id: z.string().min(1),
  muscle: MuscleTargetSchema,
  thresholdType: z.enum(['resting', 'active']),
  thresholdValue: z.number().nonnegative(),
  thresholdUnit: z.enum(['%MSO', 'V/m']),
  stimulationSite: Coordinate3DSchema,
  measurementQuality: z.enum(['pass', 'conditional', 'fail']),
});

export const MEPMeasurementSchema = CanonicalMeasurementBaseSchema.extend({
  modality: z.literal('motor_evoked_potential'),
  targetMuscle: MuscleTargetSchema,
  trials: z.array(MEPTrialSchema),
  meanAmplitudeUv: z.number().nonnegative(),
  meanLatencyMs: z.number().nonnegative(),
  responsePresent: z.boolean(),
  absenceReason: z.enum(['corticospinal_lesion', 'high_threshold', 'technical_failure']).optional(),
  motorThreshold: MotorThresholdMeasurementSchema.optional(),
});

export const HearingThresholdPointSchema = z.object({
  frequencyHz: z.number().positive(),
  thresholdDbHl: z.number(),
  masked: z.boolean(),
});

export const PureToneAudiogramSchema = z.object({
  leftEar: z.array(HearingThresholdPointSchema),
  rightEar: z.array(HearingThresholdPointSchema),
  conductionMethod: z.enum(['air', 'bone']),
  testStandardRef: z.string().optional(),
  interpretation: z.string(),
});

export const TinnitusMatchingAssessmentSchema = z.object({
  perceivedLaterality: z.enum(['left', 'right', 'bilateral', 'central', 'variable']),
  matchedFrequencyHz: z.number().positive().optional(),
  matchedLoudnessDb: z.number().optional(),
  minimumMaskingLevelDb: z.number().optional(),
  residualInhibition: z.string().optional(),
  repeatability: z.enum(['high', 'moderate', 'low']),
  interpretation: z.string(),
});

export const AudiologyMeasurementSchema = CanonicalMeasurementBaseSchema.extend({
  modality: z.literal('audiology'),
  pureToneAudiogram: PureToneAudiogramSchema.optional(),
  tinnitusMatching: TinnitusMatchingAssessmentSchema.optional(),
  speechDiscriminationPercent: z.number().min(0).max(100).optional(),
  transducerCalibrated: z.boolean(),
  calibrationDate: z.string().optional(),
});

export const EFieldMeasurementSchema = CanonicalMeasurementBaseSchema.extend({
  modality: z.literal('efield'),
  headModelArtifactId: z.string().min(1),
  coilModelRef: z.string().min(1),
  coilPosition: Coordinate3DSchema,
  coilOrientation: z.tuple([z.number(), z.number(), z.number()]),
  peakCorticalEFieldVm: z.number().nonnegative(),
  stimulatedVolumeMm3: z.number().nonnegative(),
  scalpToCortexDistanceMm: z.number().nonnegative(),
  accessibilityAttenuationFactor: z.number().min(0).max(1),
});

export const SpatialTransformSchema = z.object({
  id: z.string().min(1),
  fromSpace: CoordinateSpaceRefSchema,
  toSpace: CoordinateSpaceRefSchema,
  transformType: z.enum(['affine_matrix_4x4', 'nonlinear_warp', 'surface_registration']),
  matrix4x4: z.array(z.number()).length(16).optional(),
  warpArtifactId: z.string().optional(),
  verificationStatus: z.enum(['verified', 'unverified', 'failed']),
  roundTripMaxErrorMm: z.number().nonnegative(),
  sha256: z.string().regex(/^[0-9a-fA-F]{64}$/),
});

export const TransformGraphSchema = z.object({
  rootSpace: CoordinateSpaceRefSchema,
  registeredSpaces: z.array(CoordinateSpaceRefSchema),
  transforms: z.array(SpatialTransformSchema),
  validationPassed: z.boolean(),
});

// ==========================================
// 12. Evidence Knowledge Graph v2 Schemas
// ==========================================

export const ClaimLifecycleStatusSchema = z.enum([
  'draft',
  'under_review',
  'approved_scientific_claim',
  'rejected',
  'deprecated',
  'superseded',
]);

export const ClaimTypeV2Schema = z.enum([
  'clinical_efficacy',
  'comparative_efficacy',
  'target_outcome_association',
  'targeting_method_efficacy',
  'target_specificity',
  'symptom_specificity',
  'circuit_validity',
  'mechanistic',
  'safety',
  'durability',
  'treatment_context',
  'external_validity',
  'negative_evidence',
  'methodological_limitation',
]);

export const ClaimDirectionSchema = z.enum([
  'supports',
  'does_not_support',
  'mixed',
  'context_dependent',
  'uncertain',
]);

export const FindingTypeSchema = z.enum([
  'primary_outcome',
  'secondary_outcome',
  'subgroup',
  'target_comparison',
  'safety',
  'durability',
  'guideline_recommendation',
  'meta_analytic_estimate',
  'null_result',
  'limitation',
]);

export const ExtractionStatusSchema = z.enum(['single_curator', 'double_checked', 'adjudicated']);

export const SourceRelationshipV2Schema = z.enum([
  'supports',
  'partially_supports',
  'conflicts',
  'does_not_support',
  'limits_generalisation',
]);

export const SourceIndependenceSchema = z.enum([
  'independent',
  'partially_overlapping',
  'overlapping_dataset',
  'unknown',
]);

export const SourceRelevanceSchema = z.enum(['direct', 'indirect', 'contextual']);

export const SynthesisDirectnessSchema = z.enum(['strong', 'moderate', 'limited', 'uncertain']);
export const SynthesisReplicationSchema = z.enum([
  'multiple_independent',
  'replicated',
  'single_source',
  'mixed',
  'not_assessable',
]);
export const SynthesisDesignStrengthSchema = z.enum(['strong', 'moderate', 'limited', 'uncertain']);
export const SynthesisSampleSupportSchema = z.enum(['strong', 'moderate', 'limited', 'uncertain']);
export const SynthesisConsistencySchema = z.enum([
  'consistent',
  'mostly_consistent',
  'mixed',
  'mostly_negative',
  'uncertain',
]);
export const SynthesisClinicalApplicabilitySchema = z.enum([
  'direct',
  'partial',
  'limited',
  'uncertain',
]);
export const SynthesisTargetSpecificitySchema = z.enum([
  'specific',
  'moderate',
  'broad',
  'uncertain',
]);
export const SynthesisContextDependenceSchema = z.enum([
  'material',
  'possible',
  'minimal',
  'unknown',
]);

export const ConflictTypeSchema = z.enum([
  'effect_direction',
  'effect_magnitude',
  'population',
  'target',
  'protocol',
  'durability',
  'outcome_definition',
  'methodology',
]);

export const ConflictReconciliationStatusSchema = z.enum([
  'unresolved',
  'partially_explained',
  'resolved',
]);

export const EvidenceQuestionStatusSchema = z.enum([
  'open',
  'under_review',
  'answered_provisionally',
  'closed',
]);

export const EffectEstimateSchema = z.object({
  metric: z.string().min(1),
  value: z.number(),
  ciLower: z.number().optional(),
  ciUpper: z.number().optional(),
  pValue: z.number().optional(),
  sampleSize: z.number().optional(),
});

export const DurationDescriptorSchema = z.object({
  value: z.number().nonnegative(),
  unit: z.enum(['days', 'weeks', 'months', 'years']),
});

export const SourceFindingSchema = z.object({
  id: z.string().uuid(),
  sourceId: z.string().min(1),
  findingType: FindingTypeSchema,
  findingStatement: z.string().min(1),
  effectEstimate: EffectEstimateSchema.optional(),
  populationId: z.string().uuid().optional(),
  targetFamilyIds: z.array(z.string()).optional(),
  treatmentContextIds: z.array(z.string().uuid()).optional(),
  followupInterval: DurationDescriptorSchema.optional(),
  extractionStatus: ExtractionStatusSchema,
  provenance: CommonProvenanceSchema,
});

export const SourceContributionSchema = z.object({
  sourceId: z.string().min(1),
  sourceFindingIds: z.array(z.string().uuid()),
  relationship: SourceRelationshipV2Schema,
  independence: SourceIndependenceSchema,
  relevance: SourceRelevanceSchema,
  curatorNote: z.string().optional(),
});

export const ClaimEvidenceSynthesisSchema = z.object({
  id: z.string().uuid(),
  evidenceClaimId: z.string().uuid(),
  directness: SynthesisDirectnessSchema,
  replication: SynthesisReplicationSchema,
  studyDesignStrength: SynthesisDesignStrengthSchema,
  sampleSupport: SynthesisSampleSupportSchema,
  consistency: SynthesisConsistencySchema,
  clinicalApplicability: SynthesisClinicalApplicabilitySchema,
  targetSpecificity: SynthesisTargetSpecificitySchema,
  treatmentContextDependence: SynthesisContextDependenceSchema,
  synthesisStatement: z.string().min(1),
  governanceTierRecommendation: LegacyEvidenceTierSchema.optional(),
  provenance: CommonProvenanceSchema.optional(),
});

export const EvidenceClaimV2Schema = z.object({
  id: z.string().uuid(),
  code: z.string().min(1),
  version: z.string().min(1),
  lifecycleStatus: ClaimLifecycleStatusSchema,
  claimType: ClaimTypeV2Schema,
  statement: z.string().min(1),
  direction: ClaimDirectionSchema,
  indicationIds: z.array(z.string().uuid()),
  clinicalObjectiveDefinitionIds: z.array(z.string().uuid()).optional(),
  outcomeDomainIds: z.array(z.string().uuid()),
  populationIds: z.array(z.string().uuid()),
  diseaseStageDefinitionIds: z.array(z.string().uuid()).optional(),
  therapeuticCircuitIds: z.array(z.string().uuid()).optional(),
  targetFamilyIds: z.array(z.string()).optional(),
  targetingStrategyIds: z.array(z.string()).optional(),
  targetGeometryClassIds: z.array(z.string()).optional(),
  treatmentContextRequirementIds: z.array(z.string().uuid()).optional(),
  sourceContributions: z.array(SourceContributionSchema),
  synthesisId: z.string().uuid().optional(),
  applicabilityConstraints: z.array(z.string()),
  limitations: z.array(z.string()),
  reviewedAt: z.string().optional(),
  nextReviewDue: z.string().optional(),
  provenance: CommonProvenanceSchema,
});

export const ClaimConflictSetSchema = z.object({
  id: z.string().uuid(),
  subjectClaimId: z.string().uuid(),
  supportingClaimIds: z.array(z.string().uuid()),
  conflictingClaimIds: z.array(z.string().uuid()),
  conflictType: ConflictTypeSchema,
  reconciliationStatus: ConflictReconciliationStatusSchema,
  explanation: z.string().optional(),
  reviewedBy: z.array(z.string().uuid()).optional(),
  provenance: CommonProvenanceSchema,
});

export const EvidenceQuestionSchema = z.object({
  id: z.string().uuid(),
  indicationId: z.string().uuid(),
  population: z.record(z.unknown()),
  clinicalObjectiveId: z.string().uuid(),
  intervention: z.record(z.unknown()).optional(),
  targetFamilyId: z.string().optional(),
  targetingStrategyId: z.string().optional(),
  treatmentContextId: z.string().uuid().optional(),
  comparator: z.record(z.unknown()).optional(),
  outcomeDomains: z.array(z.string().uuid()),
  question: z.string().min(1),
  status: EvidenceQuestionStatusSchema,
});

export const EvidenceLibraryReleaseV2Schema = z.object({
  id: z.string().uuid(),
  code: z.string().min(1),
  semanticVersion: z.string().min(1),
  lifecycleStatus: z.enum(['draft', 'validation', 'active', 'superseded', 'withdrawn']),
  sourceIds: z.array(z.string()),
  sourceFindingIds: z.array(z.string().uuid()),
  evidenceClaimIds: z.array(z.string().uuid()),
  synthesisIds: z.array(z.string().uuid()),
  governanceClassificationIds: z.array(z.string().uuid()),
  targetFamilyIds: z.array(z.string()),
  evidencePathIds: z.array(z.string().uuid()),
  conflictSetIds: z.array(z.string().uuid()),
  manifestSha256: z.string().regex(/^[0-9a-fA-F]{64}$/),
  releasedAt: z.string().optional(),
  provenance: CommonProvenanceSchema,
});

// ---------------------------------------------------------------------------
// 21. Therapeutic Circuit & Target System Schemas (§16, §17, §81)
// ---------------------------------------------------------------------------

export const CircuitKindSchema = z.enum([
  'therapeutic_network',
  'target_system',
  'interhemispheric_model',
  'functional_network',
  'lesion_network',
  'mechanistic_hypothesis',
]);

export const CircuitScientificStatusSchema = z.enum([
  'treatment_effect_linked',
  'prospectively_tested',
  'replicated_association',
  'mechanistic',
  'hypothesis',
]);

export const TherapeuticCircuitV2Schema = z.object({
  id: z.string().min(1),
  code: z.string().min(1),
  version: z.string().min(1),
  name: z.string().min(1),
  indicationScopeIds: z.array(z.string()),
  clinicalObjectiveDefinitionIds: z.array(z.string()),
  circuitKind: CircuitKindSchema,
  scientificStatus: CircuitScientificStatusSchema,
  circuitDefinition: z.record(z.unknown()),
  circuitArtifactIds: z.array(z.string()).optional(),
  supportingEvidenceClaimIds: z.array(z.string()),
  conflictingEvidenceClaimIds: z.array(z.string()),
  limitations: z.array(z.string()),
  provenance: CommonProvenanceSchema,
});

export const CircuitArtifactSchema = z.object({
  id: z.string().min(1),
  circuitId: z.string().min(1),
  artifactType: z.enum([
    'mask',
    'parcellation',
    'connectivity_matrix',
    'lesion_network_map',
    'e_field_model',
  ]),
  name: z.string().min(1),
  format: z.string().min(1),
  uri: z.string().min(1),
  sha256: z.string().regex(/^[0-9a-fA-F]{64}$/),
  provenance: CommonProvenanceSchema,
});

// ---------------------------------------------------------------------------
// 22. Claim ↔ Target Binding Schemas (§19)
// ---------------------------------------------------------------------------

export const ClaimTargetRelationshipSchema = z.enum([
  'directly_tested',
  'consistent_with',
  'indirectly_supports',
  'not_tested',
]);

export const ClaimTargetBindingSchema = z.object({
  id: z.string().optional(),
  evidenceClaimId: z.string().min(1),
  targetFamilyId: z.string().min(1),
  targetingStrategyId: z.string().optional(),
  geometryClass: TargetGeometryTypeSchema.optional(),
  relationship: ClaimTargetRelationshipSchema,
  limitations: z.array(z.string()),
});

// ---------------------------------------------------------------------------
// 23. Evidence Edge Ontology Schemas (§14, §15)
// ---------------------------------------------------------------------------

export const EvidenceEdgeTypeSchema = z.enum([
  'SUPPORTS',
  'CONFLICTS_WITH',
  'DERIVED_FROM',
  'VALIDATES',
  'REPLICATES',
  'PARTIALLY_REPLICATES',
  'APPLIES_TO',
  'ADDRESSES',
  'MEASURES',
  'ENGAGES',
  'TARGETS',
  'REFINES',
  'BELONGS_TO',
  'ALTERNATIVE_TO',
  'SUPERSEDES',
  'USES_MAP',
  'USES_SEED',
  'USES_SEARCH_SPACE',
  'USES_PROTOCOL',
  'HAS_PRECEDENT',
  'HAS_LIMITATION',
  'APPLIES_AT_STAGE',
  'SUPPORTS_OBJECTIVE',
  'REQUIRES_CONTEXT',
  'WAS_TESTED_WITH',
  'USES_TARGET_GEOMETRY',
  'USES_DEVICE_CLASS',
  'USES_COIL_CLASS',
  'MAPS_TO_BODY_REGION',
  'REQUIRES_LESION_CONTEXT',
  'LIMITS_GENERALISATION',
  'DOES_NOT_SUPPORT',
  'HAS_NULL_EVIDENCE',
]);

export const EvidenceEdgeSchema = z.object({
  id: z.string().min(1),
  sourceNodeId: z.string().min(1),
  sourceNodeType: z.string().min(1),
  edgeType: EvidenceEdgeTypeSchema,
  targetNodeId: z.string().min(1),
  targetNodeType: z.string().min(1),
  weight: z.number().optional(),
  metadata: z.record(z.unknown()).optional(),
});

// ==========================================
// 24. Scientific Policy Specification v2.0 Schemas
// ==========================================

export const PolicyLifecycleStatusSchema = z.enum([
  'draft',
  'under_review',
  'validation',
  'release_candidate',
  'active',
  'superseded',
  'withdrawn',
  'archived',
]);

export const PolicyValidationStatusSchema = z.enum([
  'design_only',
  'engineering_verified',
  'retrospective_validated',
  'silent_prospective_validated',
  'clinician_assisted_validated',
  'clinical_release_qualified',
]);

export const ModulePermissionLevelSchema = z.enum([
  'research_only',
  'validation_only',
  'clinical_permitted',
  'disabled',
]);

export const ScientificChangeClassificationSchema = z.enum([
  'INDICATION_MODULE',
  'EVIDENCE_PATH',
  'MEASUREMENT_CAPABILITY',
  'TARGET_GEOMETRY',
  'PARAMETER',
]);

export const ScientificPolicySignatureSchema = z.object({
  signerRole: z.enum([
    'scientific_lead',
    'indication_clinical_lead',
    'technical_lead',
    'quality_regulatory_lead',
    'specialty_reviewer',
  ]),
  signerName: z.string().min(1),
  signerEmail: z.string().min(1),
  keyId: z.string().min(1),
  algorithm: z.string().min(1),
  signature: z.string().min(1),
  signedAt: z.string().min(1),
});

export const ScientificPolicyApprovalSchema = z.object({
  id: z.string().min(1),
  policyReleaseId: z.string().min(1),
  indicationModuleReleaseId: z.string().optional(),
  approvalRole: z.enum([
    'scientific',
    'clinical',
    'technical',
    'quality_regulatory',
    'specialty_reviewer',
  ]),
  approverId: z.string().min(1),
  approverName: z.string().min(1),
  decision: z.enum(['approved', 'approved_with_conditions', 'rejected']),
  rationale: z.string().optional(),
  approvedAt: z.string().min(1),
});

export const TargetFamilyGeometryPermissionSchema = z.object({
  targetFamilyId: z.string().min(1),
  permittedGeometryTypes: z.array(TargetGeometryTypeSchema),
  permittedGeneratorIds: z.array(z.string()),
  transformationRules: z.array(z.string()).optional(),
});

export const TargetGeometryPolicySchema = z.object({
  indicationModuleReleaseId: z.string().min(1),
  targetFamilyPermissions: z.array(TargetFamilyGeometryPermissionSchema),
});

export const MeasurementCapabilityPolicySchema = z.object({
  capabilityCode: z.string().min(1),
  modality: MeasurementModalitySchema,
  requirement: z.enum([
    'required',
    'required_for_refinement',
    'optional',
    'research_only',
    'disabled',
  ]),
  permittedCandidateRoles: z.array(AnyCandidateRoleSchema),
  permittedGeneratorIds: z.array(z.string()),
  minimumQcRuleId: z.string().optional(),
  minimumReliabilityRuleId: z.string().optional(),
  missingMeasurementBehaviour: z.enum([
    'block',
    'disable_capability',
    'fallback',
    'allow_with_limitation',
  ]),
  limitations: z.array(z.string()),
});

export const MeasurementFallbackRuleSchema = z.object({
  triggeringConditionCode: z.string().min(1),
  fromCapability: z.string().min(1),
  fallbackConfigurationId: z.string().optional(),
  resultingCapabilityState: z.enum(['fallback_only', 'disabled', 'abstain']),
  explanationTemplateId: z.string().min(1),
});

export const MeasurementPolicySchema = z.object({
  indicationModuleReleaseId: z.string().min(1),
  requirements: z.array(MeasurementCapabilityPolicySchema),
  multimodalFusionPolicy: z.enum(['prohibited', 'descriptive_only', 'validated_model_only']),
  fallbackRules: z.array(MeasurementFallbackRuleSchema),
});

export const ReliabilityCapabilityRuleSchema = z.object({
  capabilityCode: z.string().min(1),
  reliabilityMethodIds: z.array(z.string()),
  minimumParameterRefs: z.array(z.string()),
  requiredMeasurementCount: z.number().optional(),
  crossRunRequired: z.boolean().optional(),
  splitHalfRequired: z.boolean().optional(),
  sensitivityAnalysisRequired: z.boolean().optional(),
  failureBehaviour: z.enum(['disable_capability', 'fallback', 'block_module']),
  limitations: z.array(z.string()),
});

export const ReliabilityPolicySchema = z.object({
  indicationModuleReleaseId: z.string().min(1),
  capabilityRules: z.array(ReliabilityCapabilityRuleSchema),
  crossMeasurementRules: z.array(z.string()).optional(),
  overallBundleBehaviour: z.enum(['capability_specific', 'module_defined']),
});

export const CandidateGeneratorPermissionSchema = z.object({
  generatorId: z.string().min(1),
  generatorVersion: z.string().min(1),
  status: z.enum(['required', 'permitted', 'research_only', 'disabled']),
  candidateRoles: z.array(AnyCandidateRoleSchema),
  evidencePathIds: z.array(z.string()),
  targetFamilyIds: z.array(z.string()),
  geometryTypes: z.array(TargetGeometryTypeSchema),
  requiredCapabilityCodes: z.array(z.string()),
  fallbackGeneratorIds: z.array(z.string()).optional(),
});

export const CandidateGenerationPolicySchema = z.object({
  indicationModuleReleaseId: z.string().min(1),
  pluginReleaseId: z.string().min(1),
  generators: z.array(CandidateGeneratorPermissionSchema),
});

export const ComparisonDomainBasisSchema = z.enum([
  'same_target_family_variants',
  'same_candidate_role',
  'same_target_strategy',
  'scientifically_validated_cross_family',
]);

export const ComparisonDomainPermissionSchema = z.object({
  domainCode: z.string().min(1),
  permittedModes: z.array(MagniomModeSchema),
  allowedBasis: ComparisonDomainBasisSchema,
});

export const RankingProfileRefSchema = z.object({
  profileId: z.string().min(1),
  modelType: z.enum(['lexicographic', 'weighted_geometric_mean', 'ordered_deterministic_rules']),
  weights: z.record(z.number()).optional(),
  tieBreakingRuleId: z.string().min(1),
});

export const RankingPolicySchema = z.object({
  indicationModuleReleaseId: z.string().min(1),
  comparisonDomainPermissions: z.array(ComparisonDomainPermissionSchema),
  rankingProfiles: z.array(RankingProfileRefSchema),
  crossDomainScalarRanking: z.enum(['prohibited', 'explicitly_validated_only']),
});

export const RefinementPolicyProfileSchema = z.object({
  id: z.string().min(1),
  refinementKind: z.string().min(1),
  baselineRole: AnyCandidateRoleSchema,
  refinedRole: AnyCandidateRoleSchema,
  requiredCapabilityCodes: z.array(z.string()),
  permittedTargetFamilyIds: z.array(z.string()),
  minimumIncrementalValueParameterRefs: z.array(z.string()),
  maximumTransferDistanceParameterRefs: z.array(z.string()).optional(),
  accessibilityLossRuleId: z.string().optional(),
  geometryChangeRuleId: z.string().optional(),
  adoptionBehaviour: z.enum(['prefer_if_all_pass', 'show_as_alternative', 'research_only']),
  fallbackBehaviour: z.enum(['retain_baseline', 'abstain', 'module_defined']),
});

export const RefinementPolicySchema = z.object({
  indicationModuleReleaseId: z.string().min(1),
  profiles: z.array(RefinementPolicyProfileSchema),
});

export const RedundancyPolicySchema = z.object({
  indicationModuleReleaseId: z.string().min(1),
  spatialDistanceThresholdMmParameterRef: z.string().min(1),
  networkCorrelationThresholdParameterRef: z.string().optional(),
  clinicalDiversityRule: z.enum(['enforce_distinct_anatomical_families', 'allow_family_variants']),
});

export const SlateAssemblyPolicySchema = z.object({
  indicationModuleReleaseId: z.string().min(1),
  minCandidates: z.number().int().nonnegative(),
  maxCandidates: z.number().int().positive(),
  primarySlotsCount: z.number().int().positive(),
  allowPartialPrimarySlots: z.boolean(),
  allowEmptySlateWithAbstention: z.boolean(),
});

export const AbstentionPolicySchema = z.object({
  indicationModuleReleaseId: z.string().min(1),
  allowedAbstentionClasses: z.array(z.string()),
  supportPartialAbstention: z.boolean(),
  mandatoryClinicianAdvisory: z.boolean(),
});

export const ExplanationPolicySchema = z.object({
  indicationModuleReleaseId: z.string().min(1),
  requiredSections: z.array(z.string()),
  disclaimers: z.array(z.string()),
});

export const ParameterBoundsDefinitionSchema = z.object({
  minValue: z.number().optional(),
  maxValue: z.number().optional(),
  allowedValues: z.array(z.union([z.string(), z.number()])).optional(),
  unit: z.string().optional(),
});

export const ScientificPolicyParameterSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1),
  namespace: z.string().min(1),
  valueType: z.enum(['number', 'string', 'boolean', 'string_array']),
  defaultValue: z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]),
  bounds: ParameterBoundsDefinitionSchema.optional(),
  clinicalJustification: z.string().min(1),
  frozen: z.boolean(),
});

export const ProhibitedScientificConfigurationSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1),
  description: z.string().min(1),
  conditionPredicate: z.string().min(1),
  severity: z.enum(['FATAL_REJECT', 'MODE_DOWNGRADE']),
});

export const IndicationPolicyBindingSchema = z.object({
  id: z.string().min(1),
  indicationModuleReleaseId: z.string().min(1),
  modulePermission: ModulePermissionLevelSchema,
  permittedModes: z.array(MagniomModeSchema),
  evidencePathPermissions: z.array(EvidencePathPermissionSchema),
  targetGeometryPolicy: TargetGeometryPolicySchema,
  measurementPolicy: MeasurementPolicySchema,
  reliabilityPolicy: ReliabilityPolicySchema,
  candidateGenerationPolicy: CandidateGenerationPolicySchema,
  rankingPolicy: RankingPolicySchema,
  refinementPolicy: RefinementPolicySchema,
  redundancyPolicy: RedundancyPolicySchema,
  slateAssemblyPolicy: SlateAssemblyPolicySchema,
  abstentionPolicy: AbstentionPolicySchema,
  explanationPolicy: ExplanationPolicySchema,
  tripleNetworkPolicy: TripleNetworkPolicySchema.optional(),
  permittedCompatibilityConfigurationIds: z.array(z.string()),
  limitations: z.array(z.string()),
});

export const ScientificPolicyReleaseV2Schema = z.object({
  id: z.string().min(1),
  code: z.string().min(1),
  semanticVersion: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  lifecycleStatus: PolicyLifecycleStatusSchema,
  validationStatus: PolicyValidationStatusSchema,
  scope: z.enum(['single_indication', 'multi_indication']),
  indicationPolicyBindings: z.array(IndicationPolicyBindingSchema),
  compatibilityConfigurations: z.array(ScientificCompatibilityConfigurationSchema),
  globalProhibitions: z.array(ProhibitedScientificConfigurationSchema),
  parameterDefinitions: z.array(ScientificPolicyParameterSchema),
  parameterValues: z.record(z.union([z.string(), z.number(), z.boolean(), z.array(z.string())])),
  validationEvidenceIds: z.array(z.string()),
  changeClassification: ScientificChangeClassificationSchema,
  supersedesReleaseId: z.string().optional(),
  payloadSha256: z.string().regex(/^[0-9a-fA-F]{64}$/),
  compatibilityManifestSha256: z.string().regex(/^[0-9a-fA-F]{64}$/),
  releaseManifestSha256: z.string().regex(/^[0-9a-fA-F]{64}$/),
  approvals: z.array(ScientificPolicyApprovalSchema),
  signatures: z.array(ScientificPolicySignatureSchema),
  createdAt: z.string().min(1),
  releasedAt: z.string().optional(),
});

export const ScientificPolicyReleaseManifestV2Schema = z.object({
  scientificPolicyReleaseId: z.string().min(1),
  indicationModuleReleaseIds: z.array(z.string()),
  compatibilityConfigurationIds: z.array(z.string()),
  evidenceLibraryReleaseIds: z.array(z.string()),
  targetEngineReleaseIds: z.array(z.string()),
  pluginReleaseRefs: z.array(ComponentReleaseRefSchema),
  generatorReleaseRefs: z.array(ComponentReleaseRefSchema),
  measurementProviderReleaseRefs: z.array(ComponentReleaseRefSchema),
  manifestSha256: z.string().regex(/^[0-9a-fA-F]{64}$/),
  generatedAt: z.string().min(1),
});

export const ScientificImpactReportSchema = z.object({
  fromReleaseId: z.string().min(1),
  toReleaseId: z.string().min(1),
  classification: ScientificChangeClassificationSchema,
  affectedIndicationModuleIds: z.array(z.string()),
  affectedEvidencePathIds: z.array(z.string()),
  capabilityQualificationChanges: z.array(
    z.object({
      moduleCode: z.string(),
      capabilityCode: z.string(),
      previousState: z.string(),
      newState: z.string(),
    }),
  ),
  parameterDeltas: z.array(
    z.object({
      parameterCode: z.string(),
      oldValue: z.unknown(),
      newValue: z.unknown(),
      unit: z.string().optional(),
    }),
  ),
  clinicalReviewRequired: z.boolean(),
  generatedAt: z.string().min(1),
});
