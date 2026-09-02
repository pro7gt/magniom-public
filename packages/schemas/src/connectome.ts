/**
 * Connectome and Functional Connectivity Zod Schemas
 * Conforms to MAGNIOM-Neuroimaging & Functional Connectomics Pipeline Specification v1.0 Sections 72-84
 */

import { z } from "zod";

export const HcpMmpParcelSchema = z.object({
  parcelIndex: z.number().int().min(1).max(360),
  parcelName: z.string(),
  hemisphere: z.enum(["L", "R"]),
  cortexArea: z.string(),
  vertexCount: z.number().int().positive(),
  vertexIndices: z.array(z.number().int().nonnegative()),
  centroidMni: z.tuple([z.number(), z.number(), z.number()]),
  centroidFsLr32kIndex: z.number().int().nonnegative(),
});
export type HcpMmpParcel = z.infer<typeof HcpMmpParcelSchema>;

export const SubcorticalROISchema = z.object({
  roiIndex: z.number().int().min(1).max(14),
  roiName: z.string(),
  hemisphere: z.enum(["L", "R"]),
  voxelCount: z.number().int().positive(),
  centroidMni: z.tuple([z.number(), z.number(), z.number()]),
});
export type SubcorticalROI = z.infer<typeof SubcorticalROISchema>;

export const ParcelCoverageQCSchema = z.object({
  parcelIndex: z.number().int(),
  parcelName: z.string(),
  totalVerticesOrVoxels: z.number().int().nonnegative(),
  validVerticesOrVoxels: z.number().int().nonnegative(),
  coverageFraction: z.number().min(0).max(1),
  meanTsnr: z.number().nonnegative(),
  temporalVariance: z.number().nonnegative(),
  coverageStatus: z.enum(["VALID", "CONDITIONAL", "INVALID"]),
  isUsableForTargeting: z.boolean(),
});
export type ParcelCoverageQC = z.infer<typeof ParcelCoverageQCSchema>;

export const ParcelTimeSeriesResultSchema = z.object({
  subjectId: z.string(),
  runIndex: z.number().int().min(1),
  atlasName: z.string().default("HCP-MMP1.0"),
  projectionMethod: z.string().default("MagniomAtlasProjection v1"),
  numTimepoints: z.number().int().positive(),
  retainedTimepoints: z.number().int().nonnegative(),
  parcelNames: z.array(z.string()),
  timeSeriesMatrix: z.array(z.array(z.number())),
  parcelCoverage: z.array(ParcelCoverageQCSchema),
  artifactPath: z.string().optional(),
  artifactSha256: z.string().length(64).optional(),
});
export type ParcelTimeSeriesResult = z.infer<typeof ParcelTimeSeriesResultSchema>;

export const RunFunctionalConnectivitySchema = z.object({
  subjectId: z.string(),
  runIndex: z.number().int().min(1),
  denoisingConfiguration: z.enum(["CD-1", "SD-1"]),
  atlasName: z.string().default("HCP-MMP1.0"),
  metric: z.string().default("Pearson correlation"),
  transform: z.string().default("Fisher z"),
  retainedTimepoints: z.number().int().nonnegative(),
  retainedMinutes: z.number().nonnegative(),
  numParcels: z.number().int().positive(),
  parcelNames: z.array(z.string()),
  correlationMatrix: z.array(z.array(z.number())),
  fisherZMatrix: z.array(z.array(z.number())),
  artifactTsvPath: z.string().optional(),
  artifactTsvSha256: z.string().length(64).optional(),
  sidecarJsonPath: z.string().optional(),
});
export type RunFunctionalConnectivity = z.infer<typeof RunFunctionalConnectivitySchema>;

export const CombinedFunctionalConnectivitySchema = z.object({
  subjectId: z.string(),
  denoisingConfiguration: z.enum(["CD-1", "SD-1"]),
  atlasName: z.string().default("HCP-MMP1.0"),
  totalRetainedTimepoints: z.number().int().nonnegative(),
  totalRetainedMinutes: z.number().nonnegative(),
  runIndices: z.array(z.number().int()),
  runWeights: z.array(z.number().min(0).max(1)),
  numParcels: z.number().int().positive(),
  parcelNames: z.array(z.string()),
  combinedFisherZMatrix: z.array(z.array(z.number())),
  combinedCorrelationMatrix: z.array(z.array(z.number())),
  crossRunSimilarityMatrix: z.array(z.array(z.number())).optional(),
  artifactTsvPath: z.string().optional(),
  artifactTsvSha256: z.string().length(64).optional(),
});
export type CombinedFunctionalConnectivity = z.infer<typeof CombinedFunctionalConnectivitySchema>;
