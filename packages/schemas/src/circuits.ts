/**
 * Therapeutic Circuits, Connectome Target Input, and Target Reliability Zod Schemas
 * Conforms to MAGNIOM-Evidence Knowledge Graph & Therapeutic Circuit Library v1.0
 * and MAGNIOM-Canonical Target Data Specification v1.0 Sections 35-38, 88-92
 * and MAGNIOM-Neuroimaging & Functional Connectomics Pipeline Specification v1.0 Sections 106-117, 148, 150
 */

import { z } from "zod";

export const SpatialCoordinateSchema = z.object({
  space: z.enum(["MNI152NLin2009cAsym", "NATIVE_T1W"]),
  x: z.number(),
  y: z.number(),
  z: z.number(),
  unit: z.string().default("mm"),
});
export type SpatialCoordinate = z.infer<typeof SpatialCoordinateSchema>;

export const SurfaceVertexRefSchema = z.object({
  space: z.enum(["fsLR_32k"]),
  hemisphere: z.enum(["L", "R"]),
  vertexIndex: z.number().int().nonnegative(),
  parcelName: z.string(),
});
export type SurfaceVertexRef = z.infer<typeof SurfaceVertexRefSchema>;

export const ReliabilityMeasureSchema = z.object({
  metric_name: z.string(),
  value: z.number().optional(),
  unit: z.string().optional(),
  interpretation: z.enum(["high", "moderate", "low", "not_assessable"]),
  method: z.string(),
});
export type ReliabilityMeasure = z.infer<typeof ReliabilityMeasureSchema>;

export const CorticalConfidenceRegionSchema = z.object({
  space: z.string(),
  hemisphere: z.enum(["L", "R"]),
  surface_vertex_indices: z.array(z.number().int().nonnegative()),
  surface_area_mm2: z.number().nonnegative(),
  centroid_mni: z.tuple([z.number(), z.number(), z.number()]),
  bounding_box_mni: z.tuple([
    z.tuple([z.number(), z.number(), z.number()]),
    z.tuple([z.number(), z.number(), z.number()]),
  ]),
  max_radius_mm: z.number().nonnegative(),
});
export type CorticalConfidenceRegion = z.infer<typeof CorticalConfidenceRegionSchema>;

export const SplitHalfResultSchema = z.object({
  distance_mm: z.number().nonnegative(),
  geodesic_distance_mm: z.number().nonnegative().optional(),
  map_similarity: z.number(),
  spearman_similarity: z.number().optional(),
  cluster_dice: z.number().min(0).max(1),
  cluster_jaccard: z.number().min(0).max(1).optional(),
  cluster_area_delta_mm2: z.number().nonnegative().optional(),
  half_a_peak_mni: SpatialCoordinateSchema,
  half_a_medoid_mni: SpatialCoordinateSchema,
  half_b_peak_mni: SpatialCoordinateSchema,
  half_b_medoid_mni: SpatialCoordinateSchema,
  partition_strategy: z.string(),
  half_a_retained_minutes: z.number().nonnegative(),
  half_b_retained_minutes: z.number().nonnegative(),
});
export type SplitHalfResult = z.infer<typeof SplitHalfResultSchema>;

export const CrossRunResultSchema = z.object({
  assessed: z.boolean(),
  distance_mm: z.number().nonnegative().optional(),
  geodesic_distance_mm: z.number().nonnegative().optional(),
  map_similarity: z.number().optional(),
  spearman_similarity: z.number().optional(),
  cluster_dice: z.number().min(0).max(1).optional(),
  cluster_jaccard: z.number().min(0).max(1).optional(),
  runs_evaluated: z.array(z.number().int()),
  run_1_peak_mni: SpatialCoordinateSchema.optional(),
  run_1_medoid_mni: SpatialCoordinateSchema.optional(),
  run_2_peak_mni: SpatialCoordinateSchema.optional(),
  run_2_medoid_mni: SpatialCoordinateSchema.optional(),
  limiting_factor: z.string().optional(),
});
export type CrossRunResult = z.infer<typeof CrossRunResultSchema>;

export const PipelineSensitivityResultSchema = z.object({
  assessed: z.boolean(),
  sensitivity_distance_mm: z.number().nonnegative().optional(),
  map_similarity: z.number().optional(),
  cluster_dice: z.number().min(0).max(1).optional(),
  cd1_medoid_mni: SpatialCoordinateSchema.optional(),
  sd1_medoid_mni: SpatialCoordinateSchema.optional(),
  dispersion_interpretation: z.string(),
});
export type PipelineSensitivityResult = z.infer<typeof PipelineSensitivityResultSchema>;

export const CanonicalTargetReliabilityProfileSchema = z.object({
  id: z.string(),
  version: z.string().default("1.0.0"),
  case_id: z.string(),
  imaging_study_id: z.string(),
  connectome_run_id: z.string(),
  target_candidate_id: z.string(),
  target_family_version_id: z.string(),
  qc_status: z.enum(["pass", "conditional", "fail"]),
  usable_resting_state_minutes: z.number().nonnegative(),
  mean_framewise_displacement_mm: z.number().nonnegative(),
  censored_volume_fraction: z.number().min(0).max(1),
  registration_quality: z.enum(["high", "moderate", "low", "fail"]),
  segmentation_quality: z.enum(["high", "moderate", "low", "fail"]),
  parcel_coverage_quality: z.enum(["high", "moderate", "low", "fail"]),
  cross_run_spatial_distance_mm: z.number().nonnegative().optional(),
  split_half_spatial_distance_mm: z.number().nonnegative().optional(),
  composite_spatial_distance_mm: z.number().nonnegative(),
  connectivity_reliability_metric: z.number(),
  connectivity_reliability_method: z.string(),
  spatial_reliability_score: z.number().min(0).max(1),
  connectivity_reliability_score: z.number().min(0).max(1),
  qc_reliability_score: z.number().min(0).max(1),
  overall_reliability_score: z.number().min(0).max(1),
  reliability_class: z.enum(["high", "moderate", "low", "unreliable"]),
  is_reliable_for_personalisation: z.boolean(),
  atlas_concordance: ReliabilityMeasureSchema.optional(),
  pipeline_sensitivity: ReliabilityMeasureSchema.optional(),
  target_confidence_region: CorticalConfidenceRegionSchema.optional(),
  split_half_result: SplitHalfResultSchema.optional(),
  cross_run_result: CrossRunResultSchema.optional(),
  sensitivity_result: PipelineSensitivityResultSchema.optional(),
  limiting_factors: z.array(z.string()),
  interpretation: z.string(),
  pipeline_version: z.string(),
  atlas_versions: z.array(z.string()),
  normative_model_version: z.string().optional(),
  created_at: z.string().optional(),
});

export type CanonicalTargetReliabilityProfile = z.infer<typeof CanonicalTargetReliabilityProfileSchema>;


export const ImagingCandidateRegionSchema = z.object({
  targetFamilyVersionId: z.string(),
  candidateCode: z.string(),
  generationMethod: z.enum(["CONNECTOME_REFINED", "EVIDENCE_ONLY_PRIOR", "SYMPTOM_CIRCUIT"]),
  hemisphere: z.enum(["L", "R"]),
  surfaceVertexIndex: z.number().int().nonnegative(),
  parcelName: z.string(),
  subjectT1Coordinate: SpatialCoordinateSchema,
  mniCoordinate: SpatialCoordinateSchema,
  rawPeakCoordinate: SpatialCoordinateSchema.optional(),
  clusterAreaMm2: z.number().nonnegative(),
  circuitConcordanceRaw: z.number(),
  circuitConcordancePercentile: z.number().min(0).max(1),
  baselineCircuitConcordance: z.number().min(0).max(1),
  accessibility: z.enum(["good", "acceptable", "difficult", "inaccessible"]),
  reliabilityScore: z.number().min(0).max(1),
  fitInterpretation: z.string(),
});
export type ImagingCandidateRegion = z.infer<typeof ImagingCandidateRegionSchema>;

export const CircuitMetricSchema = z.object({
  circuitVersionId: z.string(),
  metricCode: z.string(),
  metricValue: z.number(),
  interpretation: z.string(),
  candidateRegionCode: z.string().optional(),
});
export type CircuitMetric = z.infer<typeof CircuitMetricSchema>;

export const CandidateMapRefSchema = z.object({
  circuitId: z.string(),
  artifactPath: z.string(),
  artifactSha256: z.string().length(64),
  mapType: z.enum(["anticorrelation", "concordance", "symptom_template"]),
});
export type CandidateMapRef = z.infer<typeof CandidateMapRefSchema>;

export const NormativeFindingSchema = z.object({
  featureCode: z.string(),
  rawValue: z.number().optional(),
  observedValue: z.number(),
  expectedValue: z.number().optional(),
  zScore: z.number().optional(),
  percentile: z.number().min(0).max(100).optional(),
  direction: z.enum(["higher", "lower"]).optional(),
  modelVersion: z.string(),
  relevance: z.enum(["supportive", "neutral", "contradictory", "uncertain"]).optional(),
});
export type NormativeFinding = z.infer<typeof NormativeFindingSchema>;

export const ConnectomeTargetInputSchema = z.object({
  connectomeRunId: z.string(),
  pipelineVersion: z.string(),
  qcStatus: z.enum(["pass", "conditional", "fail"]),
  retainedMinutes: z.number().nonnegative(),
  atlasName: z.string().default("HCP-MMP1.0"),
  circuitMetrics: z.array(CircuitMetricSchema),
  candidateRegions: z.array(ImagingCandidateRegionSchema),
  candidateMaps: z.array(CandidateMapRefSchema).optional(),
  normativeFindings: z.array(NormativeFindingSchema).optional(),
  reliabilityProfiles: z.array(CanonicalTargetReliabilityProfileSchema).optional(),
  surfaceManifestId: z.string().optional(),
  connectomeManifestId: z.string().optional(),
  circuitsManifestId: z.string().optional(),
  reliabilityManifestId: z.string().optional(),
});
export type ConnectomeTargetInput = z.infer<typeof ConnectomeTargetInputSchema>;

