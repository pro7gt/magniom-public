import { z } from 'zod';

// ==========================================
// 1. Enumeration Schemas
// ==========================================

export const MagniomModeSchema = z.enum(['RESEARCH', 'CLINICAL', 'VALIDATION']);

export const CandidateRoleSchema = z.enum([
  'PRIMARY_1',
  'PRIMARY_2',
  'PRIMARY_3',
  'ADDITIONAL_A',
  'ADDITIONAL_B',
  'RESERVE',
]);

export const EvidenceTierSchema = z.enum(['T1', 'T2', 'T3', 'T4', 'T_EXP']);

export const LegacyEvidenceTierSchema = z.enum(['A', 'B', 'C', 'D', 'R']);

export const TargetMethodSchema = z.enum([
  'EVIDENCE_ONLY_PRIOR',
  'STRUCTURAL_ANATOMICAL',
  'CONNECTOME_REFINED',
  'ELECTRIC_FIELD_OPTIMIZED',
]);

export const CoordinateSpaceSchema = z.enum(['MNI152NLin2009cAsym', 'fsLR_32k', 'NATIVE_T1W']);

export const HemisphereSchema = z.enum(['L', 'R', 'BILATERAL']);

export const DecisionTypeSchema = z.enum([
  'ACCEPTED_PRIMARY',
  'ACCEPTED_ADDITIONAL',
  'SUBSTITUTED_ALTERNATIVE',
  'MANUAL_OVERRIDE',
  'DEFERRED',
  'REJECTED',
]);

export const SuppressionReasonSchema = z.enum([
  'LOW_RELIABILITY',
  'LOW_INCREMENTAL_VALUE',
  'REDUNDANT_ANATOMICAL',
  'CONTRAINDICATED',
  'MODE_RESTRICTED',
  'EVIDENCE_CEILING_EXCEEDED',
]);

export const ConfidenceLevelSchema = z.enum(['HIGH', 'MODERATE', 'LOW', 'VERY_LOW']);

export const ObjectLifecycleStatusSchema = z.enum([
  'DRAFT',
  'UNDER_REVIEW',
  'VALIDATION',
  'RELEASE_CANDIDATE',
  'ACTIVE',
  'SUPERSEDED',
  'WITHDRAWN',
  'ARCHIVED',
]);

export const AppRoleSchema = z.enum([
  'tms_specialist',
  'clinical_reviewer',
  'imaging_specialist',
  'researcher',
  'evidence_curator',
  'evidence_approver',
  'organisation_admin',
  'service_worker',
  'system_admin',
]);

export const CaseStateSchema = z.enum([
  'draft',
  'phenotype_ready',
  'phenotype_approved',
  'imaging_pending',
  'imaging_processing',
  'connectome_ready',
  'target_generation_pending',
  'target_generating',
  'target_slate_ready',
  'clinician_review',
  'decision_signed',
  'personalisation_abstained',
  'targeting_abstained',
  'decision_deferred',
  'superseded',
  'closed',
]);

export const SnapshotStateSchema = z.enum(['draft', 'ready_for_review', 'approved', 'superseded']);

export const DataQualityStateSchema = z.enum([
  'verified',
  'reviewed',
  'unverified',
  'incomplete',
  'invalid',
]);


export const ScientificChangeClassSchema = z.enum([
  'PATCH',
  'MINOR_METHODOLOGICAL',
  'MAJOR_METHODOLOGICAL',
  'INDICATION_EXPANSION',
]);

export const ValidationTypeSchema = z.enum([
  'unit',
  'integration',
  'golden_case',
  'scientific_verification',
  'sensitivity_analysis',
  'retrospective',
  'silent_prospective',
  'clinician_assisted',
  'human_factors',
  'security',
  'regulatory',
]);

export const ImagingQualityStatusSchema = z.enum(['pass', 'conditional', 'fail']);

export const PersonalisationQualificationSchema = z.enum([
  'qualified',
  'limited',
  'not_available',
  'ineligible',
]);

export const EpisodeSeveritySchema = z.enum([
  'MILD',
  'MODERATE',
  'SEVERE_WITHOUT_PSYCHOSIS',
  'SEVERE_WITH_PSYCHOSIS',
]);

export const ClinicalSafetyClearanceSchema = z.enum([
  'cleared',
  'escalated_review',
  'contraindicated',
]);

export const CandidateDecisionActionSchema = z.enum([
  'accept',
  'reject',
  'modify',
  'replace',
  'defer',
]);

export const MagniomInfluenceSchema = z.enum(['none', 'minor', 'moderate', 'major']);

export const SlateStatusSchema = z.enum([
  'draft',
  'generated',
  'ready_for_review',
  'reviewed',
  'superseded',
  'abstained',
]);

export const DecisionStatusSchema = z.enum(['in_review', 'completed', 'deferred', 'superseded']);

export const CandidateStatusSchema = z.enum([
  'generated',
  'eligible',
  'ineligible',
  'suppressed',
  'research_only',
]);

export const FinalTargetSourceSchema = z.enum([
  'magniom_candidate',
  'clinician_defined',
  'standard_target',
]);

export const JobStatusSchema = z.enum([
  'queued',
  'claimed',
  'running',
  'succeeded',
  'failed_retryable',
  'failed_terminal',
  'cancelled',
  'superseded',
]);

export const QueueNameSchema = z.enum([
  'imaging_ingest',
  'neurocompute',
  'target_reliability',
  'efield',
  'target_generation',
  'report_generation',
  'outbox_dispatch',
]);

export const StorageBucketSchema = z.enum([
  'clinical-ingest',
  'clinical-derived',
  'clinical-reports',
  'evidence-assets',
  'research-derived',
]);

export const ArtifactTypeSchema = z.enum([
  'RAW_DICOM',
  'BIDS_NIFTI',
  'PREPROCESSED_BOLD',
  'T1_RECONSTRUCTION',
  'CORTICAL_SURFACE',
  'CIFTI_TIMESERIES',
  'CONNECTOME_MATRIX',
  'QC_REPORT_IMAGE',
  'CIRCUIT_MAP',
  'TARGET_ROI',
  'EFIELD_MESH',
  'TARGET_SLATE_PAYLOAD',
  'CLINICAL_REPORT_PDF',
]);

export const OutboxEventTypeSchema = z.enum([
  'CASE_CREATED',
  'PHENOTYPE_APPROVED',
  'TARGET_GENERATION_REQUESTED',
  'TARGET_SLATE_GENERATED',
  'CLINICIAN_REVIEW_STARTED',
  'TARGET_DECISION_SIGNED',
  'JOB_DISPATCH_REQUESTED',
]);

export const CameraOrientationPresetSchema = z.enum([
  'LEFT_LATERAL',
  'RIGHT_LATERAL',
  'SUPERIOR',
  'MEDIAL',
  'ANTERIOR',
  'POSTERIOR',
  'RESET',
]);

export const CoordinateOrientationSchema = z.enum(['RAS', 'LPS']);

export const TransformTypeSchema = z.enum([
  'AFFINE',
  'NONLINEAR_WARP',
  'SPHERICAL_REGISTRATION',
  'IDENTITY',
]);

export const NeuronavigationFormatSchema = z.enum(['BRAINSIGHT', 'LOCALITE', 'GENERIC_JSON']);

export const ImagingStudyStatusSchema = z.enum([
  'uploaded',
  'validated',
  'processing',
  'qc_pass',
  'qc_conditional',
  'qc_fail',
  'superseded',
]);

export const ImagingSeriesTypeSchema = z.enum([
  'T1w',
  'rest_bold',
  'fieldmap',
  'dwi',
  'other',
]);

export const ConnectomicsRunStatusSchema = z.enum([
  'queued',
  'running',
  'succeeded',
  'failed',
  'superseded',
]);

export const SurfaceMeshTypeSchema = z.enum([
  'white',
  'pial',
  'midthickness',
  'inflated',
  'sphere_reg',
]);

export const MeshFormatSchema = z.enum([
  'gifti_surf',
  'gifti_metric',
  'cifti',
  'freesurfer_surf',
]);

export const QCWarningSeveritySchema = z.enum([
  'info',
  'warning',
  'critical',
]);

export const ClinicalImpactSchema = z.enum([
  'none',
  'possible',
  'target_family_specific',
  'personalisation_invalid',
]);

export const StructuralPipelineStageSchema = z.enum([
  'INGEST',
  'BIDS_CONVERT',
  'BIDS_VALIDATE',
  'BIAS_CORRECTION',
  'BRAIN_EXTRACTION',
  'SEGMENTATION',
  'SPATIAL_NORMALIZATION',
  'SURFACE_RECONSTRUCTION',
  'SURFACE_RESAMPLING',
  'QC_EVALUATION',
  'MANIFEST_GENERATION',
]);


// ==========================================
// 2. Primitive Schemas
// ==========================================

export const CommonProvenanceSchema = z.object({
  createdBy: z.string().min(1),
  createdAt: z.string().min(1),
  sourceOrganizationId: z.string().optional(),
  softwareVersion: z.string().min(1),
});

export const AtlasRefSchema = z.object({
  atlasName: z.string().min(1),
  atlasVersion: z.string().min(1),
  space: CoordinateSpaceSchema,
});

export const ClinicalConceptRefSchema = z.object({
  system: z.string().min(1),
  code: z.string().min(1),
  display: z.string().min(1),
});

export const UncertaintyObjectSchema = z.object({
  spatialUncertaintyMm: z.number().nonnegative().optional(),
  confidence: ConfidenceLevelSchema,
  limitations: z.array(z.string()),
});

export const Vector3DSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
});

export const MniCoordinateSchema = z.object({
  space: z.literal('MNI152NLin2009cAsym'),
  x: z.number().min(-150).max(150),
  y: z.number().min(-150).max(150),
  z: z.number().min(-150).max(150),
  unit: z.literal('mm').optional(),
});

export const SubjectCoordinateSchema = z.object({
  space: z.literal('NATIVE_T1W'),
  x: z.number().min(-250).max(250),
  y: z.number().min(-250).max(250),
  z: z.number().min(-250).max(250),
  unit: z.literal('mm').optional(),
});

export const SurfaceVertexSchema = z.object({
  space: z.literal('fsLR_32k'),
  hemisphere: z.enum(['L', 'R']),
  vertexIndex: z.number().int().nonnegative(),
  parcelName: z.string().min(1),
});

export const SpatialRegionSchema = z.object({
  space: CoordinateSpaceSchema,
  centerMni: MniCoordinateSchema,
  radiusMm: z.number().positive(),
  primaryHcpParcel: z.string().optional(),
});

export const CameraViewConfigurationSchema = z.object({
  preset: CameraOrientationPresetSchema,
  fovDegrees: z.number().positive(),
  target: Vector3DSchema,
  position: Vector3DSchema,
  up: Vector3DSchema,
});

export const TargetRoiDefinitionSchema = z.object({
  targetId: z.string().min(1),
  candidateRole: CandidateRoleSchema,
  centerMni: MniCoordinateSchema,
  centerSubjectT1: SubjectCoordinateSchema.optional(),
  surfaceVertex: SurfaceVertexSchema.optional(),
  primaryHcpParcel: z.string().min(1),
  surfaceAreaMm2: z.number().positive(),
  coilNormalVector: Vector3DSchema,
  targetRadiusMm: z.number().positive(),
});

export const ConfidenceRegion3DSchema = z.object({
  space: CoordinateSpaceSchema,
  hemisphere: z.enum(['L', 'R']),
  centroidMni: MniCoordinateSchema,
  centroidSubjectT1: SubjectCoordinateSchema.optional(),
  maxRadiusMm: z.number().positive(),
  surfaceAreaMm2: z.number().positive(),
  surfaceVertexIndices: z.array(z.number().int().nonnegative()),
  boundingBoxMni: z.tuple([
    z.tuple([z.number(), z.number(), z.number()]),
    z.tuple([z.number(), z.number(), z.number()]),
  ]),
  reliabilityLevel: z.enum(['HIGH', 'MODERATE', 'LOW', 'UNUSABLE']),
  coilSpreadFwhmMm: z.number().positive(),
});

export const CircuitOverlayMapSchema = z.object({
  circuitId: z.string().min(1),
  name: z.string().min(1),
  colormap: z.enum(['coolwarm', 'magma', 'viridis', 'inferno', 'sgacc_gradient']),
  hemisphere: z.enum(['L', 'R']),
  vertexScalars: z.array(z.number()),
  thresholdMin: z.number(),
  thresholdMax: z.number(),
  defaultOpacity: z.number().min(0).max(1),
  isVisible: z.boolean(),
});

export const CoordinateTransformMatrix4x4Schema = z.object({
  sourceSpace: CoordinateSpaceSchema,
  targetSpace: CoordinateSpaceSchema,
  transformType: TransformTypeSchema,
  matrix4x4: z.array(z.array(z.number()).length(4)).length(4),
  inverseMatrix4x4: z.array(z.array(z.number()).length(4)).length(4).optional(),
  orientation: CoordinateOrientationSchema,
  determinant: z.number(),
  isRigidOrAffine: z.boolean(),
});

export const NeuronavigationExportSimulationSchema = z.object({
  targetId: z.string().min(1),
  format: NeuronavigationFormatSchema,
  worldCoordinate: Vector3DSchema,
  normalVector: Vector3DSchema,
  targetLabel: z.string().min(1),
  patientId: z.string().min(1),
  coordinateSpace: CoordinateSpaceSchema,
  exportedAt: z.string().datetime({ offset: true }),
  payloadText: z.string().min(1),
  roundTripVerified: z.boolean(),
  roundTripErrorMm: z.number().nonnegative(),
});


// ==========================================
// 3. Evidence Knowledge Graph Schemas
// ==========================================

export const ClaimSourceLinkSchema = z.object({
  sourceId: z.string().min(1),
  citation: z.string().min(1),
  doi: z.string().optional(),
  relationship: z.enum(['supporting', 'conflicting', 'context']),
});

export const EvidenceSourceSchema = z.object({
  id: z.string().min(1),
  citation: z.string().min(1),
  doi: z.string().optional(),
  pubmedId: z.string().optional(),
  year: z.number().int().min(1900).max(2100).optional(),
  studyDesign: z.string().optional(),
  sampleSize: z.number().int().positive().optional(),
  provenance: CommonProvenanceSchema.optional(),
});

export const EvidenceClaimSchema = z.object({
  id: z.string().min(1),
  code: z.string().optional(),
  version: z.string().optional(),
  mode: MagniomModeSchema.optional(),
  sourceId: z.string().optional(),
  claimType: z.string().optional(),
  targetFamilyId: z.string().optional(),
  circuitId: z.string().optional(),
  tier: EvidenceTierSchema,
  statement: z.string().optional(),
  summary: z.string().optional(),
  certainty: z.string().optional(),
  effectSize: z.number().optional(),
  pValue: z.number().optional(),
  replicationStatus: z.string().optional(),
  limitations: z.array(z.string()).optional(),
  sources: z.array(ClaimSourceLinkSchema).optional(),
  provenance: CommonProvenanceSchema.optional(),
});

export const TherapeuticCircuitSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1),
  name: z.string().min(1),
  version: z.string().optional(),
  mode: MagniomModeSchema.optional(),
  tier: EvidenceTierSchema.optional(),
  primaryIndication: z.string().optional(),
  symptomDomains: z.array(z.string()).optional(),
  canonicalSourceParcel: z.string().optional(),
  canonicalTargetParcel: z.string().optional(),
  validationStatus: z.string().optional(),
  circuitDefinition: z.record(z.unknown()).optional(),
  connectedClaimCodes: z.array(z.string()).optional(),
  limitations: z.array(z.string()).optional(),
  provenance: CommonProvenanceSchema.optional(),
});

export const TargetFamilySchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1),
  name: z.string().min(1),
  version: z.string().optional(),
  mode: MagniomModeSchema.optional(),
  hemisphere: HemisphereSchema,
  primaryHcpParcel: z.string().min(1),
  fallbackMniCoordinate: MniCoordinateSchema,
  maxAllowableDisplacementMm: z.number().positive(),
  evidenceCeilingTier: EvidenceTierSchema,
  circuitId: z.string().optional(),
  connectedCircuitCodes: z.array(z.string()).optional(),
  anatomicalDefinition: z.record(z.unknown()).optional(),
  candidateGenerationRules: z.record(z.unknown()).optional(),
  limitations: z.array(z.string()).optional(),
  provenance: CommonProvenanceSchema.optional(),
});

export const SearchSpaceSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1),
  targetFamilyId: z.string().min(1),
  name: z.string().min(1),
  hemisphere: HemisphereSchema,
  coordinateSpace: CoordinateSpaceSchema,
  description: z.string().min(1),
  maskDefinition: z.record(z.unknown()),
});

export const TargetDefinitionSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1),
  targetFamilyId: z.string().min(1),
  name: z.string().min(1),
  targetType: z.enum(['group_reference', 'individualized_rule', 'anatomical_landmark', 'scalp_landmark']),
  mniCoordinate: MniCoordinateSchema,
  hcpParcel: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const EvidencePathNodeSchema = z.object({
  nodeType: z.enum(['condition', 'symptom', 'claim', 'circuit', 'target_family', 'source']),
  code: z.string().min(1),
  label: z.string().min(1),
  tier: EvidenceTierSchema.optional(),
});

export const EvidencePathSchema = z.object({
  pathId: z.string().min(1),
  targetFamilyCode: z.string().min(1),
  circuitCode: z.string().min(1),
  claimCode: z.string().min(1),
  claimStatement: z.string().min(1),
  claimTier: EvidenceTierSchema,
  sourceCitation: z.string().min(1),
  sourceDoi: z.string().optional(),
  nodes: z.array(EvidencePathNodeSchema),
});

export const EvidenceConflictRefSchema = z.object({
  claimCode: z.string().min(1),
  statement: z.string().min(1),
  sourceCitation: z.string().min(1),
  sourceDoi: z.string().optional(),
  clinicalImplication: z.string().min(1),
});

export const EvidenceLibraryReleaseSchema = z.object({
  id: z.string().min(1),
  version: z.string().min(1),
  releaseDate: z.string().optional(),
  releasedAt: z.string().optional(),
  status: z.union([ObjectLifecycleStatusSchema, z.enum(['draft', 'validation', 'active', 'superseded'])]),
  circuits: z.array(TherapeuticCircuitSchema),
  families: z.array(TargetFamilySchema),
  claims: z.array(EvidenceClaimSchema),
  searchSpaces: z.array(SearchSpaceSchema).optional(),
  targetDefinitions: z.array(TargetDefinitionSchema).optional(),
  manifestHash: z.string().optional(),
  manifestSha256: z.string().optional(),
});


// ==========================================
// 4. Target Reliability & QC Schemas
// ==========================================

export const TargetReliabilityProfileSchema = z.object({
  candidateId: z.string().min(1),
  scanDurationMinutes: z.number().positive(),
  meanFramewiseDisplacementMm: z.number().nonnegative(),
  retainedFramesPercentage: z.number().min(0).max(100),
  temporalSnr: z.number().positive(),
  splitHalfLocalisationDistanceMm: z.number().nonnegative().optional(),
  overallReliabilityScore: z.number().min(0).max(1),
  isReliableForPersonalisation: z.boolean(),
  warnings: z.array(z.string()),
});

export const TargetAccessibilityProfileSchema = z.object({
  candidateId: z.string().min(1),
  scalpToCortexDistanceMm: z.number().positive().optional(),
  accessibleByStandardCoil: z.boolean(),
  coilAngleRecommendationDeg: z.number().optional(),
  warning: z.string().optional(),
});

export const EFieldProfileSchema = z.object({
  candidateId: z.string().min(1),
  peakFieldStrengthVm: z.number().positive().optional(),
  focalityScore: z.number().min(0).max(1).optional(),
  simulationEngineVersion: z.string().optional(),
});

// ==========================================
// 5. Clinical Phenotype Schemas
// ==========================================

export const SymptomPrioritySchema = z.object({
  domainCode: z.string().min(1),
  priorityRank: z.number().int().positive(),
  clinicianWeight: z.number().min(0).max(1),
  evidenceMappability: z.enum(['direct', 'indirect', 'exploratory']),
  rationale: z.string().optional(),
});

export const DiagnosisAssertionSchema = z.object({
  code: z.string().min(1),
  display: z.string().min(1),
  status: z.enum(['confirmed', 'suspected', 'ruled_out']),
  diagnosticSystem: z.enum(['DSM-5', 'ICD-11']),
});

export const EpisodeProfileSchema = z.object({
  active: z.boolean(),
  severity: EpisodeSeveritySchema,
  durationMonths: z.number().positive().optional(),
  treatmentResistanceStage: z.number().int().nonnegative().optional(),
});

export const PhenotypeSnapshotSchema = z.object({
  id: z.string().min(1),
  patientId: z.string().min(1),
  primaryDiagnosis: z.string().min(1),
  episodeSeverity: EpisodeSeveritySchema,
  diagnosisAssertion: DiagnosisAssertionSchema.optional(),
  episodeProfile: EpisodeProfileSchema.optional(),
  safetyClearance: ClinicalSafetyClearanceSchema.optional(),
  symptomScores: z.object({
    dysphoriaScore: z.number().min(0).max(1),
    anhedoniaScore: z.number().min(0).max(1),
    anxiousSomaticScore: z.number().min(0).max(1),
    ruminationScore: z.number().min(0).max(1),
  }),
  symptomPriorities: z.array(SymptomPrioritySchema).optional(),
  treatmentHistory: z.object({
    medicationFailuresCount: z.number().int().nonnegative(),
    priorTmsExposure: z.boolean(),
  }),
  phenotypeConfidence: ConfidenceLevelSchema.optional(),
  clinicianSummary: z.string().optional(),
  confirmedByClinicianId: z.string().min(1),
  confirmedAt: z.string().min(1),
  snapshotHash: z.string().length(64).optional(),
});

// ==========================================
// 6. Target Candidate & Slate Schemas
// ==========================================

export const RankingFeatureVectorSchema = z.object({
  evidenceWeight: z.number().min(0).max(1),
  phenotypeWeight: z.number().min(0).max(1),
  connectomeWeight: z.number().min(0).max(1),
  reliabilityWeight: z.number().min(0).max(1),
  accessibilityWeight: z.number().min(0).max(1),
});

export const CandidateConvergenceProfileSchema = z.object({
  distanceToEvidenceBaselineMm: z.number().nonnegative(),
  convergenceClassification: z.enum(['high', 'moderate', 'divergent', 'not_applicable']),
  incrementalGainOverBaseline: z.number(),
});

export const TargetCandidateSchema = z.object({
  id: z.string().min(1),
  familyId: z.string().min(1),
  circuitId: z.string().min(1),
  role: CandidateRoleSchema,
  method: TargetMethodSchema,
  evidenceTier: EvidenceTierSchema,
  mniCoordinate: MniCoordinateSchema,
  surfaceVertex: SurfaceVertexSchema.optional(),
  evidenceScore: z.number().min(0).max(1),
  phenotypeConcordanceScore: z.number().min(0).max(1),
  connectomeRefinementScore: z.number().min(0).max(1).optional(),
  overallScore: z.number().min(0).max(1),
  rationale: z.string().min(1),
  contraindicationsOrConflicts: z.array(z.string()),
  isSuppressedOrRedundant: z.boolean(),
  suppressionReason: SuppressionReasonSchema.optional(),
  convergenceProfile: CandidateConvergenceProfileSchema.optional(),
  rankingFeatures: RankingFeatureVectorSchema.optional(),
  evidencePaths: z.array(EvidencePathSchema).optional(),
  conflictingEvidence: z.array(EvidenceConflictRefSchema).optional(),
  counterarguments: z.array(z.string()).optional(),
});

export const CounterfactualSummarySchema = z.object({
  evidenceBaselineCoordinate: MniCoordinateSchema,
  candidateCoordinate: MniCoordinateSchema,
  displacementDistanceMm: z.number().nonnegative(),
  expectedMechanisticGain: z.number(),
  justificationSummary: z.string().min(1),
});

export const ClinicalCoverageProfileSchema = z.object({
  primaryDomainCovered: z.string().min(1),
  secondaryDomainsCovered: z.array(z.string()),
  overallClinicalCoverageScore: z.number().min(0).max(1),
});

export const AbstentionProfileSchema = z.object({
  hasAbstained: z.boolean(),
  reasonCode: z.string().optional(),
  clinicianExplanation: z.string().optional(),
});

export const TargetSlateSchema = z.object({
  id: z.string().min(1),
  caseId: z.string().min(1),
  phenotypeSnapshotId: z.string().min(1),
  scientificPolicyVersion: z.string().min(1),
  evidenceReleaseVersion: z.string().min(1),
  generatedAt: z.string().min(1),
  mode: MagniomModeSchema,
  primaryCandidates: z.array(TargetCandidateSchema).max(3),
  additionalCandidates: z.array(TargetCandidateSchema).max(2),
  suppressedCandidates: z.array(TargetCandidateSchema),
  personalisationQualification: PersonalisationQualificationSchema.optional(),
  counterfactualSummary: CounterfactualSummarySchema.optional(),
  clinicalCoverageProfile: ClinicalCoverageProfileSchema.optional(),
  abstentionProfile: AbstentionProfileSchema.optional(),
  abstentionReason: z.string().optional(),
  deterministicManifestHash: z.string().length(64),
});

export const TargetSlateItemSchema = z.object({
  targetSlateId: z.string().min(1),
  targetCandidateId: z.string().min(1),
  position: CandidateRoleSchema,
  rankWithinRole: z.number().int().min(1),
  inclusionReason: z.string().min(1),
  redundancyWith: z.array(z.string()).optional(),
});

export const SuppressedCandidateSchema = z.object({
  targetSlateId: z.string().min(1),
  targetCandidateId: z.string().min(1),
  reasonCode: z.string().min(1),
  explanation: z.string().min(1),
});

// ==========================================
// 7. Clinician Decision Schemas
// ==========================================

export const ClinicianAttestationSchema = z.object({
  clinicianId: z.string().min(1),
  clinicianName: z.string().min(1),
  licenseNumber: z.string().optional(),
  statement: z.string().min(1),
  signedAt: z.string().min(1),
  digitalSignatureHash: z.string().min(32),
});

export const CandidateDecisionSchema = z.object({
  id: z.string().uuid().optional(),
  clinicianDecisionId: z.string().uuid().optional(),
  targetCandidateId: z.string().min(1),
  action: CandidateDecisionActionSchema,
  reasonCodes: z.array(z.string()),
  freeTextReason: z.string().optional(),
  modifiedTarget: z.record(z.string(), z.unknown()).optional(),
  replacementCandidateId: z.string().optional(),
  evidenceReviewed: z.boolean(),
  reliabilityReviewed: z.boolean(),
  counterargumentsReviewed: z.boolean(),
});

export const FinalTargetSchema = z.object({
  id: z.string().min(1).optional(),
  clinicianDecisionId: z.string().min(1).optional(),
  sequenceOrder: z.number().int().min(1),
  source: FinalTargetSourceSchema,
  sourceCandidateId: z.string().min(1).optional(),
  targetRegion: z.record(z.string(), z.unknown()),
  therapeuticObjectives: z.array(z.string()),
});

export const ClinicianDecisionSchema = z.object({
  id: z.string().min(1),
  caseId: z.string().min(1).optional(),
  slateId: z.string().min(1),
  clinicianId: z.string().min(1),
  status: DecisionStatusSchema.optional(),
  decisionType: DecisionTypeSchema,
  selectedCandidateIds: z.array(z.string()),
  overallReasoning: z.string().optional(),
  magniomInfluence: MagniomInfluenceSchema.optional(),
  disagreementWithMagniom: z.string().optional(),
  manualOverrideDetails: z
    .object({
      customCoordinate: MniCoordinateSchema.optional(),
      clinicalRationale: z.string().min(10),
      reasonCode: z.string().optional(),
    })
    .optional(),
  candidateDecisions: z.array(CandidateDecisionSchema).optional(),
  finalTargets: z.array(FinalTargetSchema).optional(),
  reviewedCounterfactuals: z.boolean(),
  reviewedConflictingEvidence: z.boolean(),
  decidedAt: z.string().min(1),
  attestation: ClinicianAttestationSchema.optional(),
  digitalSignatureHash: z.string().min(32),
  isImmutable: z.literal(true),
  supersedesId: z.string().min(1).optional(),
});

// ==========================================
// 8. Scientific Policy & Governance Schemas
// ==========================================

export const ValidationEvidenceRefSchema = z.object({
  id: z.string().min(1),
  validationType: ValidationTypeSchema,
  protocolId: z.string().min(1),
  reportId: z.string().min(1),
  datasetReleaseId: z.string().optional(),
  passed: z.boolean(),
  limitations: z.array(z.string()),
  completedAt: z.string().min(1),
});

export const ScientificCompatibilityProfileSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1),
  indication: ClinicalConceptRefSchema,
  mode: MagniomModeSchema,
  capability: z.enum([
    'evidence_only',
    'connectome_refined',
    'connectome_normative',
    'connectome_efield',
    'research_experimental',
  ]),
  evidenceLibraryReleaseId: z.string().min(1),
  targetEngineVersionId: z.string().min(1),
  pipeline: z.object({
    requirement: z.enum(['required', 'optional', 'disabled', 'not_applicable']),
    permittedVersionIds: z.array(z.string()),
  }),
  normativeModel: z.object({
    requirement: z.enum(['required', 'optional', 'disabled', 'not_applicable']),
    permittedVersionIds: z.array(z.string()),
  }),
  efieldEngine: z.object({
    requirement: z.enum(['required', 'optional', 'disabled', 'not_applicable']),
    permittedVersionIds: z.array(z.string()),
  }),
  phenotypeOntologyVersionId: z.string().min(1),
  compatible: z.boolean(),
  validationEvidenceIds: z.array(z.string()),
  limitations: z.array(z.string()),
});

export const EvidenceTierPermissionSchema = z.object({
  tier: EvidenceTierSchema,
  standalonePrimary: z.boolean(),
  standaloneAdditional: z.boolean(),
  mayRefineParentTiers: z.array(EvidenceTierSchema),
  maySupplySupportingContext: z.boolean(),
  permittedCandidateRoles: z.array(CandidateRoleSchema),
  permittedGenerationMethods: z.array(TargetMethodSchema),
});

export const ScientificPolicyReleaseSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1),
  semanticVersion: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  lifecycleStatus: ObjectLifecycleStatusSchema,
  validationStatus: z.enum(['ESTABLISHED', 'VALIDATED', 'RESEARCH_ONLY']),
  modeScope: z.array(MagniomModeSchema),
  indicationScope: z.array(ClinicalConceptRefSchema),
  compatibilityProfiles: z.array(ScientificCompatibilityProfileSchema),
  evidencePolicy: z.object({
    tierPermissions: z.array(EvidenceTierPermissionSchema),
    minReliabilityForPersonalisation: z.number().min(0).max(1),
    minIncrementalGainThreshold: z.number().min(0).max(1),
  }),
  parameters: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.array(z.string())])),
  policyPayloadSha256: z.string().length(64),
  compatibilityManifestSha256: z.string().length(64),
  releaseManifestSha256: z.string().length(64),
  createdAt: z.string().min(1),
  releasedAt: z.string().optional(),
});

// ==========================================
// 8. Identity & Multi-Tenancy Schemas
// ==========================================

export const OrganisationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  slug: z.string().min(1),
  status: z.enum(['active', 'suspended', 'archived']),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});

export const SiteSchema = z.object({
  id: z.string().uuid(),
  organisationId: z.string().uuid(),
  name: z.string().min(1),
  timezone: z.string().min(1),
  status: z.enum(['active', 'inactive']),
  createdAt: z.string().min(1),
});

export const UserProfileSchema = z.object({
  userId: z.string().uuid(),
  displayName: z.string().optional(),
  createdAt: z.string().min(1),
});

export const ClinicianSchema = z.object({
  id: z.string().uuid(),
  organisationId: z.string().uuid(),
  userId: z.string().uuid().optional(),
  fullName: z.string().min(1),
  professionalType: z.string().min(1),
  registrationIdentifier: z.string().optional(),
  tmsSigningAuthority: z.boolean(),
  isVerifiedSpecialist: z.boolean(),
  active: z.boolean(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});

export const MembershipSchema = z.object({
  id: z.string().uuid(),
  organisationId: z.string().uuid(),
  userId: z.string().uuid(),
  siteId: z.string().uuid().optional(),
  role: AppRoleSchema,
  active: z.boolean(),
  createdAt: z.string().min(1),
});

export const PermissionSchema = z.object({
  code: z.string().min(1),
  description: z.string().min(1),
});

export const RolePermissionSchema = z.object({
  role: AppRoleSchema,
  permissionCode: z.string().min(1),
});

// ==========================================
// 9. Clinical Core Schemas
// ==========================================

export const PatientSchema = z.object({
  id: z.string().uuid(),
  organisationId: z.string().uuid(),
  siteId: z.string().uuid().optional(),
  externalRecordNumber: z.string().optional(),
  givenName: z.string().optional(),
  familyName: z.string().optional(),
  displayLabel: z.string().min(1),
  dateOfBirth: z.string().optional(),
  status: z.enum(['active', 'inactive', 'archived']),
  synthetic: z.boolean(),
  createdBy: z.string().uuid().optional(),
  createdAt: z.string().min(1),
});

export const ClinicalCaseSchema = z.object({
  id: z.string().uuid(),
  organisationId: z.string().uuid(),
  siteId: z.string().uuid().optional(),
  patientId: z.string().uuid(),
  caseCode: z.string().min(1),
  state: CaseStateSchema,
  indicationCode: z.string().min(1),
  mode: MagniomModeSchema,
  version: z.number().int().min(1),
  currentPhenotypeSnapshotId: z.string().uuid().optional(),
  currentTargetSlateId: z.string().uuid().optional(),
  createdBy: z.string().uuid().optional(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
  closedAt: z.string().optional(),
});

export const ClinicalAssessmentSchema = z.object({
  id: z.string().uuid(),
  organisationId: z.string().uuid(),
  caseId: z.string().uuid(),
  clinicianId: z.string().uuid().optional(),
  status: z.enum(['draft', 'completed', 'superseded']),
  createdAt: z.string().min(1),
  completedAt: z.string().optional(),
});

export const ClinicalObservationSchema = z.object({
  id: z.string().uuid(),
  organisationId: z.string().uuid(),
  caseId: z.string().uuid(),
  assessmentId: z.string().uuid().optional(),
  conceptCode: z.string().min(1),
  observationType: z.string().min(1),
  numericValue: z.number().optional(),
  textValue: z.string().optional(),
  booleanValue: z.boolean().optional(),
  unit: z.string().optional(),
  instrument: z.string().optional(),
  qualityState: DataQualityStateSchema,
  observedAt: z.string().min(1),
  enteredBy: z.string().uuid().optional(),
  createdAt: z.string().min(1),
});

export const FunctionalGoalSchema = z.object({
  id: z.string().uuid(),
  organisationId: z.string().uuid(),
  caseId: z.string().uuid(),
  description: z.string().min(1),
  patientPriority: z.number().int().min(1).max(5).optional(),
  clinicianPriority: z.number().int().min(1).max(5).optional(),
  active: z.boolean(),
  createdAt: z.string().min(1),
});

export const PhenotypeDomainSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  primaryCircuitCode: z.string().min(1),
  evidenceTier: EvidenceTierSchema,
});

export const SymptomMappingSchema = z.object({
  id: z.string().uuid(),
  symptomConceptCode: z.string().min(1),
  domainCode: z.string().min(1),
  instrument: z.string().min(1),
  itemIdentifier: z.string().min(1),
  mappingStrength: z.number().min(0).max(1),
});

export const ApprovePhenotypeInputSchema = z.object({
  caseId: z.string().uuid(),
  expectedCaseVersion: z.number().int().min(1),
  schemaVersion: z.string().min(1),
  ontologyVersion: z.string().min(1),
  evidenceLibraryVersion: z.string().min(1),
  payload: z.record(z.string(), z.unknown()),
  payloadSha256: z.string().length(64),
});

// ==========================================
// 10. Audit & Sprint 5 Workflow Schemas
// ==========================================

export const AuditEventSchema = z.object({
  id: z.string().min(1),
  organisationId: z.string().min(1),
  caseId: z.string().min(1).optional(),
  actorType: z.string().min(1),
  actorUserId: z.string().min(1).optional(),
  actorClinicianId: z.string().min(1).optional(),
  actorService: z.string().optional(),
  eventType: z.string().min(1),
  aggregateType: z.string().min(1),
  aggregateId: z.string().min(1),
  aggregateSequence: z.number().int().min(1),
  occurredAt: z.string().min(1),
  payload: z.record(z.string(), z.unknown()),
  previousHash: z.string().optional(),
  eventHash: z.string().min(1),
});

export const PublishTargetSlateInputSchema = z.object({
  caseId: z.string().min(1),
  phenotypeSnapshotId: z.string().min(1),
  evidenceReleaseId: z.string().min(1),
  engineVersion: z.string().min(1),
  scientificPolicyVersion: z.string().min(1),
  evidenceReleaseVersion: z.string().min(1),
  inputSha256: z.string().min(1),
  deterministicManifestHash: z.string().length(64),
  payloadSha256: z.string().min(1),
  outputPayload: z.record(z.string(), z.unknown()),
  candidates: z.array(z.record(z.string(), z.unknown())),
  mode: MagniomModeSchema.optional(),
});

export const BeginClinicianReviewInputSchema = z.object({
  caseId: z.string().min(1),
  targetSlateId: z.string().min(1),
});

export const SaveCandidateDecisionInputSchema = z.object({
  decisionId: z.string().min(1),
  targetCandidateId: z.string().min(1),
  action: CandidateDecisionActionSchema,
  reasonCodes: z.array(z.string()),
  freeTextReason: z.string().optional(),
  modifiedTarget: z.record(z.string(), z.unknown()).optional(),
  replacementCandidateId: z.string().min(1).optional(),
  evidenceReviewed: z.boolean().optional(),
  reliabilityReviewed: z.boolean().optional(),
  counterargumentsReviewed: z.boolean().optional(),
});

export const SignClinicianDecisionInputSchema = z.object({
  decisionId: z.string().min(1),
  overallReasoning: z.string().min(20),
  magniomInfluence: MagniomInfluenceSchema,
  disagreementWithMagniom: z.string().optional(),
  reviewedCounterfactuals: z.boolean(),
  reviewedConflictingEvidence: z.boolean(),
  attestationStatement: z.string().min(1),
  finalTargets: z.array(FinalTargetSchema),
  decisionType: DecisionTypeSchema.optional(),
});

export const SupersedeDecisionInputSchema = z.object({
  oldDecisionId: z.string().min(1),
  newDecisionId: z.string().min(1),
  reason: z.string().min(1),
});

export const StalenessEvaluationSchema = z.object({
  isStale: z.boolean(),
  reason: z.string().min(1),
});

// ==========================================
// 11. Artifact Registry & Storage Schemas
// ==========================================

export const ArtifactRecordSchema = z.object({
  id: z.string().min(1),
  organisationId: z.string().min(1),
  caseId: z.string().min(1),
  imagingStudyId: z.string().min(1).optional(),
  artifactType: ArtifactTypeSchema,
  bucket: z.string().min(1),
  objectPath: z.string().min(1),
  mimeType: z.string().optional(),
  sha256: z.string().min(1),
  sizeBytes: z.number().int().nonnegative().optional(),
  immutable: z.boolean().default(true),
  processingRunId: z.string().min(1).optional(),
  createdAt: z.string().min(1),
});

export const ArtifactLineageSchema = z.object({
  parentArtifactId: z.string().min(1),
  childArtifactId: z.string().min(1),
  relationship: z.string().min(1),
});

export const StoragePathInfoSchema = z.object({
  organisationId: z.string().min(1),
  caseId: z.string().min(1).optional(),
  studyId: z.string().min(1).optional(),
  runId: z.string().min(1).optional(),
  slateId: z.string().min(1).optional(),
  candidateId: z.string().min(1).optional(),
  decisionId: z.string().min(1).optional(),
  artifactId: z.string().min(1),
  filename: z.string().min(1),
});

// ==========================================
// 12. Workflow Jobs & Progress Schemas
// ==========================================

export const WorkflowJobSchema = z.object({
  id: z.string().min(1),
  organisationId: z.string().min(1),
  caseId: z.string().min(1).optional(),
  jobType: z.string().min(1),
  status: JobStatusSchema,
  idempotencyKey: z.string().min(1),
  inputReference: z.record(z.string(), z.unknown()),
  workerId: z.string().optional(),
  attemptCount: z.number().int().nonnegative(),
  maxAttempts: z.number().int().positive(),
  createdAt: z.string().min(1),
  claimedAt: z.string().optional(),
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
  lastHeartbeatAt: z.string().optional(),
  errorCode: z.string().optional(),
  errorDetail: z.record(z.string(), z.unknown()).optional(),
});

export const JobProgressSchema = z.object({
  id: z.string().min(1).optional(),
  jobId: z.string().min(1),
  stage: z.string().min(1),
  stageDescription: z.string().min(1),
  progressPercent: z.number().min(0).max(100).optional(),
  detail: z.record(z.string(), z.unknown()).default({}),
  recordedAt: z.string().optional(),
});

export const EnqueueJobInputSchema = z.object({
  organisationId: z.string().min(1),
  caseId: z.string().min(1).optional(),
  jobType: z.string().min(1),
  idempotencyKey: z.string().min(1),
  inputReference: z.record(z.string(), z.unknown()),
  maxAttempts: z.number().int().positive().optional(),
});

// ==========================================
// 13. Queue Envelopes & Zero PHI Contracts
// ==========================================

export const QueueEnvelopeSchema = z.object({
  schemaVersion: z.literal('1.0'),
  jobId: z.string().min(1),
  organisationId: z.string().min(1),
  caseId: z.string().min(1),
  correlationId: z.string().min(1),
  queueName: QueueNameSchema.optional(),
  requestedOperation: z.string().min(1),
  createdAt: z.string().min(1),
  payload: z.record(z.string(), z.unknown()),
});

export const TargetGenerationMessageSchema = z.object({
  schemaVersion: z.literal('1.0'),
  jobId: z.string().min(1),
  organisationId: z.string().min(1),
  caseId: z.string().min(1),
  phenotypeSnapshotId: z.string().min(1),
  connectomeRunId: z.string().min(1).optional(),
  targetEngineVersionId: z.string().min(1),
  evidenceLibraryReleaseId: z.string().min(1),
  correlationId: z.string().min(1),
});

// ==========================================
// 14. Transactional Outbox Schemas
// ==========================================

export const OutboxEventSchema = z.object({
  id: z.string().min(1),
  organisationId: z.string().min(1).optional(),
  aggregateType: z.string().min(1),
  aggregateId: z.string().min(1),
  eventType: z.string().min(1),
  payload: z.record(z.string(), z.unknown()),
  createdAt: z.string().min(1),
  publishedAt: z.string().optional(),
  attempts: z.number().int().nonnegative().default(0),
});

// ==========================================
// 15. Imaging Studies, Series & QC Schemas
// ==========================================

export const ImagingStudySchema = z.object({
  id: z.string().min(1),
  organisationId: z.string().min(1),
  caseId: z.string().min(1),
  studyUid: z.string().optional(),
  scannerFieldStrengthT: z.number().positive().optional(),
  acquiredAt: z.string().optional(),
  status: ImagingStudyStatusSchema,
  metadata: z.record(z.string(), z.unknown()).default({}),
  createdAt: z.string().min(1),
});

export const ImagingSeriesSchema = z.object({
  id: z.string().min(1),
  organisationId: z.string().min(1),
  imagingStudyId: z.string().min(1),
  seriesType: ImagingSeriesTypeSchema,
  seriesUid: z.string().optional(),
  runNumber: z.number().int().positive().optional(),
  metadata: z.record(z.string(), z.unknown()).default({}),
  createdAt: z.string().min(1),
});

export const QCWarningSchema = z.object({
  code: z.string().min(1),
  message: z.string().min(1),
  severity: QCWarningSeveritySchema,
  clinicalImpact: ClinicalImpactSchema,
  affectedComponents: z.array(z.string()).optional(),
});

export const StructuralQCMetricsSchema = z.object({
  snrT1w: z.number(),
  cnrT1w: z.number(),
  eulerHolesLh: z.number().int().nonnegative(),
  eulerHolesRh: z.number().int().nonnegative(),
  totalEulerNumber: z.number().int(),
  surfaceSelfIntersectionsLh: z.number().int().nonnegative(),
  surfaceSelfIntersectionsRh: z.number().int().nonnegative(),
  corticalThicknessMeanMm: z.number().positive(),
  corticalThicknessStdMm: z.number().nonnegative(),
  corticalThicknessMinMm: z.number().positive(),
  corticalThicknessMaxMm: z.number().positive(),
  corticalThicknessOutlierFraction: z.number().min(0).max(1),
  brainMaskVolumeMm3: z.number().positive(),
  csfFraction: z.number().min(0).max(1),
  gmFraction: z.number().min(0).max(1),
  wmFraction: z.number().min(0).max(1),
  mniRegistrationOverlapDice: z.number().min(0).max(1),
  mniMutualInformation: z.number().nonnegative(),
});

export const ImagingQCRunSchema = z.object({
  id: z.string().min(1),
  organisationId: z.string().min(1),
  imagingStudyId: z.string().min(1),
  pipelineVersionId: z.string().min(1),
  status: z.enum(['pass', 'conditional', 'fail']),
  usableRestMinutes: z.number().nonnegative().optional(),
  meanFdMm: z.number().nonnegative().optional(),
  censoredFraction: z.number().min(0).max(1).optional(),
  registrationQuality: ConfidenceLevelSchema.optional(),
  segmentationQuality: ConfidenceLevelSchema.optional(),
  parcelCoverageQuality: ConfidenceLevelSchema.optional(),
  metrics: z.union([StructuralQCMetricsSchema, z.record(z.string(), z.unknown())]),
  warnings: z.array(QCWarningSchema).default([]),
  createdAt: z.string().min(1),
});

// ==========================================
// 16. Connectomics Processing Runs & System Tables
// ==========================================

export const PipelineVersionSchema = z.object({
  id: z.string().min(1),
  pipelineType: z.string().min(1),
  semanticVersion: z.string().min(1),
  containerDigest: z.string().optional(),
  configurationSha256: z.string().optional(),
  status: ObjectLifecycleStatusSchema,
  releasedAt: z.string().optional(),
  createdAt: z.string().min(1),
});

export const SystemAtlasSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1),
  version: z.string().min(1),
  coordinateSpace: z.string().min(1),
  artifactId: z.string().optional(),
  status: ObjectLifecycleStatusSchema,
  createdAt: z.string().min(1),
});

export const ConnectomicsProcessingRunSchema = z.object({
  id: z.string().min(1),
  organisationId: z.string().min(1),
  caseId: z.string().min(1),
  imagingStudyId: z.string().min(1),
  pipelineVersionId: z.string().min(1),
  atlasId: z.string().min(1),
  normativeModelId: z.string().optional(),
  status: ConnectomicsRunStatusSchema,
  inputManifest: z.record(z.string(), z.unknown()),
  inputManifestSha256: z.string().min(1),
  outputManifest: z.record(z.string(), z.unknown()).optional(),
  outputManifestSha256: z.string().optional(),
  mode: MagniomModeSchema,
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
  createdAt: z.string().min(1),
});

// ==========================================
// 17. Manifests & Provenance Schemas
// ==========================================

export const ManifestFileEntrySchema = z.object({
  path: z.string().min(1),
  sha256: z.string().min(1),
  sizeBytes: z.number().int().nonnegative(),
  artifactType: ArtifactTypeSchema.optional(),
  mimeType: z.string().optional(),
});

export const SoftwareManifestSchema = z.object({
  name: z.string().min(1),
  version: z.string().min(1),
  digest: z.string().optional(),
  dependencies: z.record(z.string(), z.string()).optional(),
});

export const TransformManifestEntrySchema = z.object({
  sourceSpace: z.string().min(1),
  targetSpace: z.string().min(1),
  transformType: z.enum(['AFFINE', 'NONLINEAR_WARP', 'SPHERICAL_REGISTRATION', 'IDENTITY']),
  transformFileSha256: z.string().min(1),
  forwardTransformArtifactId: z.string().optional(),
  inverseTransformArtifactId: z.string().optional(),
});

export const StageManifestSchema = z.object({
  stageNumber: z.string().min(1),
  stageName: z.union([StructuralPipelineStageSchema, z.string()]),
  status: z.enum(['passed', 'conditional', 'failed']),
  startedAt: z.string().min(1),
  completedAt: z.string().min(1),
  durationSeconds: z.number().nonnegative(),
  inputHashes: z.array(z.string()),
  outputHashes: z.array(z.string()),
  warnings: z.array(QCWarningSchema),
  executionMetrics: z.record(z.string(), z.unknown()),
});

export const BidsDatasetManifestSchema = z.object({
  bidsVersion: z.string().min(1),
  datasetName: z.string().min(1),
  subjectId: z.string().min(1),
  sessionCount: z.number().int().nonnegative(),
  seriesModalities: z.array(z.string()),
  files: z.array(ManifestFileEntrySchema),
  generatedAt: z.string().min(1),
});

export const StructuralProcessingManifestSchema = z.object({
  t1wBiasCorrectedSha256: z.string().min(1),
  brainMaskSha256: z.string().min(1),
  tissueSegmentationSha256: z.string().min(1),
  nativeToMniWarpSha256: z.string().min(1),
  mniToNativeWarpSha256: z.string().min(1),
  qcMetrics: StructuralQCMetricsSchema,
  files: z.array(ManifestFileEntrySchema),
  generatedAt: z.string().min(1),
});

export const SurfaceReconstructionManifestSchema = z.object({
  subjectId: z.string().min(1),
  whiteSurfaceLhSha256: z.string().min(1),
  whiteSurfaceRhSha256: z.string().min(1),
  pialSurfaceLhSha256: z.string().min(1),
  pialSurfaceRhSha256: z.string().min(1),
  midthicknessSurfaceLhSha256: z.string().min(1),
  midthicknessSurfaceRhSha256: z.string().min(1),
  inflatedSurfaceLhSha256: z.string().min(1),
  inflatedSurfaceRhSha256: z.string().min(1),
  corticalThicknessLhSha256: z.string().min(1),
  corticalThicknessRhSha256: z.string().min(1),
  fsLr32kResampledSurfaces: z.array(ManifestFileEntrySchema),
  generatedAt: z.string().min(1),
});

export const PipelineManifestSchema = z.object({
  schemaVersion: z.literal('1.0'),
  runId: z.string().min(1),
  caseId: z.string().min(1),
  organisationId: z.string().min(1),
  mode: MagniomModeSchema,
  pipelineHash: z.string().min(1),
  software: z.array(SoftwareManifestSchema),
  inputFiles: z.array(ManifestFileEntrySchema),
  outputFiles: z.array(ManifestFileEntrySchema),
  transformGraph: z.array(TransformManifestEntrySchema),
  stages: z.array(StageManifestSchema),
  overallQcStatus: z.enum(['pass', 'conditional', 'fail']),
  warnings: z.array(QCWarningSchema),
  startedAt: z.string().min(1),
  completedAt: z.string().min(1),
});

// ==========================================
// 18. Cortical Surface Mesh Geometry Schemas
// ==========================================

export const SurfaceMeshGeometrySchema = z.object({
  surfaceType: SurfaceMeshTypeSchema,
  hemisphere: HemisphereSchema,
  coordinateSpace: CoordinateSpaceSchema,
  format: MeshFormatSchema.optional(),
  vertexCount: z.number().int().nonnegative(),
  triangleCount: z.number().int().nonnegative(),
  vertices: z.array(z.number()),
  triangles: z.array(z.number().int().nonnegative()),
  normals: z.array(z.number()).optional(),
  metrics: z.array(z.number()).optional(),
  sulcalCurvature: z.array(z.number()).optional(),
  giftiPath: z.string().optional(),
  artifactSha256: z.string().optional(),
});

// ==========================================
// 19. Ingest & Structural Queue Messages
// ==========================================

export const DicomIngestJobPayloadSchema = z.object({
  organisationId: z.string().min(1),
  caseId: z.string().min(1),
  imagingStudyId: z.string().min(1),
  rawDicomBucket: z.string().min(1),
  rawDicomObjectPath: z.string().min(1),
  pseudonymousSubjectId: z.string().min(1),
});

export const StructuralProcessingJobPayloadSchema = z.object({
  organisationId: z.string().min(1),
  caseId: z.string().min(1),
  imagingStudyId: z.string().min(1),
  connectomicsRunId: z.string().min(1),
  bidsDatasetBucket: z.string().min(1),
  bidsDatasetPath: z.string().min(1),
  pipelineVersionId: z.string().min(1),
  atlasId: z.string().min(1),
  mode: MagniomModeSchema,
});


