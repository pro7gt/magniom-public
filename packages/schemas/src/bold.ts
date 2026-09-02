/**
 * BOLD Preprocessing, Multi-Echo Tedana, CD-1 Denoising, and Q2 Functional QC Schemas
 * Conforms to MAGNIOM-Neuroimaging & Functional Connectomics Pipeline Specification v1.0 Sections 44-68, 143-150
 */

import { z } from "zod";

export const EchoMetadataSchema = z.object({
  echoIndex: z.number().int().min(1),
  echoTimeMs: z.number().positive(),
  relativePath: z.string(),
  sha256: z.string().length(64),
  sizeBytes: z.number().int().nonnegative(),
});
export type EchoMetadata = z.infer<typeof EchoMetadataSchema>;

export const MultiEchoRunMetadataSchema = z.object({
  runIndex: z.number().int().min(1),
  subjectId: z.string(),
  sessionId: z.string().nullable().optional(),
  taskName: z.string().default("rest"),
  trSeconds: z.number().positive(),
  flipAngleDeg: z.number().positive(),
  echoes: z.array(EchoMetadataSchema).min(2),
  numVolumes: z.number().int().positive(),
  spatialResolutionMm: z.tuple([z.number(), z.number(), z.number()]),
  matrixSize: z.tuple([z.number().int(), z.number().int(), z.number().int()]),
  fieldStrengthTesla: z.number().default(3.0),
});
export type MultiEchoRunMetadata = z.infer<typeof MultiEchoRunMetadataSchema>;

export const MotionParametersSchema = z.object({
  transXMm: z.array(z.number()),
  transYMm: z.array(z.number()),
  transZMm: z.array(z.number()),
  rotXDeg: z.array(z.number()),
  rotYDeg: z.array(z.number()),
  rotZDeg: z.array(z.number()),
  framewiseDisplacementMm: z.array(z.number()),
  meanFdMm: z.number().nonnegative(),
  maxFdMm: z.number().nonnegative(),
});
export type MotionParameters = z.infer<typeof MotionParametersSchema>;

export const NonSteadyStateSummarySchema = z.object({
  numNonSteadyStateVolumes: z.number().int().nonnegative(),
  nonSteadyStateIndices: z.array(z.number().int()),
  detectionMethod: z.string(),
});
export type NonSteadyStateSummary = z.infer<typeof NonSteadyStateSummarySchema>;

export const ICAComponentMetricsSchema = z.object({
  componentId: z.number().int(),
  kappa: z.number().nonnegative(),
  rho: z.number().nonnegative(),
  varianceExplainedFraction: z.number().min(0).max(1),
  classification: z.enum(["accepted", "rejected", "ignorable"]),
  classificationReason: z.string(),
});
export type ICAComponentMetrics = z.infer<typeof ICAComponentMetricsSchema>;

export const T2StarMapMetricsSchema = z.object({
  t2starMeanMs: z.number().positive(),
  t2starMedianMs: z.number().positive(),
  t2starStdMs: z.number().nonnegative(),
  s0Mean: z.number().positive(),
  adaptiveMaskVoxels: z.number().int().nonnegative(),
  totalBrainVoxels: z.number().int().nonnegative(),
  coverageFraction: z.number().min(0).max(1),
});
export type T2StarMapMetrics = z.infer<typeof T2StarMapMetricsSchema>;

export const RetainedTimeSummarySchema = z.object({
  acquiredSeconds: z.number().nonnegative(),
  acquiredMinutes: z.number().nonnegative(),
  nonSteadyStateRemovedSeconds: z.number().nonnegative(),
  nonSteadyStateRemovedMinutes: z.number().nonnegative(),
  motionCensoredSeconds: z.number().nonnegative(),
  motionCensoredMinutes: z.number().nonnegative(),
  finalRetainedSeconds: z.number().nonnegative(),
  finalRetainedMinutes: z.number().nonnegative(),
  percentageRetained: z.number().min(0).max(100),
  totalVolumes: z.number().int().positive(),
  nonSteadyStateVolumes: z.number().int().nonnegative(),
  censoredVolumes: z.number().int().nonnegative(),
  retainedVolumes: z.number().int().nonnegative(),
  shortSegmentsPrunedVolumes: z.number().int().nonnegative(),
  isAboveAbsoluteMinimum: z.boolean(),
  isAboveRecommendedClinical: z.boolean(),
});
export type RetainedTimeSummary = z.infer<typeof RetainedTimeSummarySchema>;

export const FunctionalQCMetricsSchema = z.object({
  runIndex: z.number().int().min(1),
  meanFdMm: z.number().nonnegative(),
  maxFdMm: z.number().nonnegative(),
  censoredVolumesFraction: z.number().min(0).max(1),
  retainedMinutes: z.number().nonnegative(),
  tsnrPreDenoise: z.number().nonnegative(),
  tsnrPostDenoise: z.number().nonnegative(),
  tsnrGainRatio: z.number().nonnegative(),
  meanDvars: z.number().nonnegative(),
  tedanaComponentsTotal: z.number().int().nonnegative(),
  tedanaComponentsAccepted: z.number().int().nonnegative(),
  tedanaComponentsRejected: z.number().int().nonnegative(),
  tedanaAcceptedVarianceFraction: z.number().min(0).max(1),
  t1wBoldCoregistrationDice: z.number().min(0).max(1),
  ghostingRatio: z.number().nonnegative(),
  signalDropoutFractionDlpfc: z.number().min(0).max(1),
  signalDropoutFractionSgacc: z.number().min(0).max(1),
});
export type FunctionalQCMetrics = z.infer<typeof FunctionalQCMetricsSchema>;

export const FunctionalQCEvaluationResultSchema = z.object({
  overallStatus: z.enum(["pass", "conditional", "fail"]),
  runIndex: z.number().int().min(1),
  metrics: FunctionalQCMetricsSchema,
  warnings: z.array(
    z.object({
      code: z.string(),
      message: z.string(),
      severity: z.enum(["info", "warning", "critical"]),
      clinicalImpact: z.enum(["none", "possible", "target_family_specific", "personalisation_invalid"]),
      affectedComponents: z.array(z.string()).optional(),
    })
  ),
  isPersonalisationQualified: z.boolean(),
  limitationSummary: z.string().nullable().optional(),
});
export type FunctionalQCEvaluationResult = z.infer<typeof FunctionalQCEvaluationResultSchema>;

export const DenoisedTimeSeriesOutputSchema = z.object({
  denoisingConfiguration: z.enum(["CD-1", "SD-1"]),
  runIndex: z.number().int().min(1),
  subjectId: z.string(),
  denoisedBoldPath: z.string(),
  denoisedBoldSha256: z.string().length(64),
  nuisanceMatrixPath: z.string(),
  nuisanceMatrixSha256: z.string().length(64),
  bandpassLowHz: z.number().default(0.009),
  bandpassHighHz: z.number().default(0.08),
  includesGsr: z.boolean(),
  numRegressors: z.number().int().positive(),
  motionRegressorExpansion: z.string(),
  tissueRegressors: z.array(z.string()),
  varianceExplainedByNuisance: z.number().min(0).max(1),
  tsnrPreDenoise: z.number().nonnegative(),
  tsnrPostDenoise: z.number().nonnegative(),
  retainedTime: RetainedTimeSummarySchema,
  censorMask: z.array(z.boolean()),
});
export type DenoisedTimeSeriesOutput = z.infer<typeof DenoisedTimeSeriesOutputSchema>;
