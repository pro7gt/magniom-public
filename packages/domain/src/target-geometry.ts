/**
 * MAGNIOM Canonical Target Geometry Domain Types v2.0
 * Conforms to MAGNIOM-Canonical Multi-Indication Data Specification v2.0 (§52-66)
 * Implements discriminated union over 6 target geometry modalities
 */

import type { TargetGeometryType } from './enums.js';
import type { CommonProvenance, Vector3D, SpatialRegion, AtlasRef } from './types.js';

export type TargetLaterality = 'left' | 'right' | 'bilateral' | 'midline' | 'not_applicable';

export interface Coordinate3D {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export interface CoordinateSpaceRef {
  readonly id: string;
  readonly name: string;
  readonly version?: string | undefined;
  readonly orientation?: string | undefined;
  readonly subjectSpecific: boolean;
}

export interface SpatialTransformRef {
  readonly transformId: string;
  readonly fromSpace: CoordinateSpaceRef;
  readonly toSpace: CoordinateSpaceRef;
  readonly method: string;
  readonly methodVersion: string;
  readonly artifactSha256: string;
}

export interface TargetGeometryBase {
  readonly geometryType: TargetGeometryType;
  readonly coordinateSpace: CoordinateSpaceRef;
  readonly laterality: TargetLaterality;
  readonly sourceMethod: string;
  readonly sourceMethodVersion: string;
  readonly provenance: CommonProvenance;
}

// 1. Point Target (§55)
export interface PointTargetGeometry extends TargetGeometryBase {
  readonly geometryType: 'point';
  readonly centre: Coordinate3D;
  readonly optionalRoi?: SpatialRegion | undefined;
  readonly surfaceVertexId?: string | undefined;
  readonly normalVector?: Vector3D | undefined;
}

// 2. Surface ROI Target (§56)
export interface SurfaceROITargetGeometry extends TargetGeometryBase {
  readonly geometryType: 'surface_roi';
  readonly surfaceId: string;
  readonly vertexIds?: readonly string[] | undefined;
  readonly meshArtifactId?: string | undefined;
  readonly centre?: Coordinate3D | undefined;
  readonly areaMm2?: number | undefined;
  readonly confidenceRegion?: SpatialRegion | undefined;
}

// 3. Volumetric ROI Target (§57)
export interface VolumetricROITargetGeometry extends TargetGeometryBase {
  readonly geometryType: 'volumetric_roi';
  readonly maskArtifactId: string;
  readonly centre?: Coordinate3D | undefined;
  readonly volumeMm3?: number | undefined;
  readonly atlasAnnotations?: readonly AtlasRef[] | undefined;
}

// 4. Somatotopic Target (§58-59)
export interface BodyRegionRef {
  readonly code: string;
  readonly label: string;
  readonly parentCode?: string | undefined;
}

export interface SomatotopicTargetGeometry extends TargetGeometryBase {
  readonly geometryType: 'somatotopic';
  readonly corticalRegion: AtlasRef;
  readonly bodyRegion: BodyRegionRef;
  readonly affectedBodySide?:
    'left' | 'right' | 'bilateral' | 'midline' | 'not_applicable' | undefined;
  readonly stimulationHemisphere: 'left' | 'right' | 'bilateral';
  readonly motorMappingRunId?: string | undefined;
  readonly mappedHotspot?: Coordinate3D | undefined;
  readonly mappedSurfaceRegion?: SpatialRegion | undefined;
  readonly mappingReliabilityId?: string | undefined;
}

// 5. Coil Field Target (§60-62)
export interface CoilPlacement {
  readonly scalpCoordinate?: Coordinate3D | undefined;
  readonly orientationDegrees?: number | undefined;
  readonly coilToScalpDistanceMm?: number | undefined;
  readonly placementCoordinateSystem: CoordinateSpaceRef;
  readonly placementDescription?: string | undefined;
}

export interface EFieldMetric {
  readonly metricName: string;
  readonly value: number;
  readonly unit: string;
}

export interface PoseTolerance {
  readonly positionMm: number;
  readonly orientationDegrees: number;
}

export interface CoilFieldTargetGeometry extends TargetGeometryBase {
  readonly geometryType: 'coil_field';
  readonly coilModelId: string;
  readonly deviceModelId?: string | undefined;
  readonly placement: CoilPlacement;
  readonly intendedFieldRegion: SpatialRegion;
  readonly therapeuticRegionIds: readonly string[];
  readonly efieldRunId?: string | undefined;
  readonly fieldCoverageMetrics?: readonly EFieldMetric[] | undefined;
  readonly poseTolerance?: PoseTolerance | undefined;
  readonly pointCoordinateIsRepresentativeOnly: boolean;
}

// 6. Network Target (§63)
export interface NetworkTargetGeometry extends TargetGeometryBase {
  readonly geometryType: 'network';
  readonly therapeuticCircuitIds: readonly string[];
  readonly accessibleNodeRegions: readonly SpatialRegion[];
  readonly preferredStimulationRegion?: SpatialRegion | undefined;
  readonly networkDefinitionVersionId: string;
  readonly networkMeasurementSourceIds?: readonly string[] | undefined;
}

// Canonical Discriminated Union (§52)
export type TargetGeometry =
  | PointTargetGeometry
  | SurfaceROITargetGeometry
  | VolumetricROITargetGeometry
  | SomatotopicTargetGeometry
  | CoilFieldTargetGeometry
  | NetworkTargetGeometry;
