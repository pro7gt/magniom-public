/**
 * @magniom/target-engine - Geometry Construction Helpers
 * Conforms to MAGNIOM-Canonical Multi-Indication Data Specification v2.0 (§52-66)
 */

import type {
  PointTargetGeometry,
  SomatotopicTargetGeometry,
  CoilFieldTargetGeometry,
  SurfaceROITargetGeometry,
  NetworkTargetGeometry,
  TargetLaterality,
  AtlasRef,
  BodyRegionRef,
  CoilPlacement,
  SpatialRegion,
  Coordinate3D,
} from '@magniom/domain';

export function createCanonicalPointGeometry(
  x: number,
  y: number,
  z: number,
  laterality: TargetLaterality = 'left',
  sourceMethod = 'canonical_generator',
): PointTargetGeometry {
  return {
    geometryType: 'point',
    centre: { x, y, z },
    coordinateSpace: {
      id: 'MNI152NLin2009cAsym',
      name: 'MNI152NLin2009cAsym',
      subjectSpecific: false,
    },
    laterality,
    sourceMethod,
    sourceMethodVersion: '2.0.0',
    provenance: {
      createdBy: 'magniom-target-engine-v2',
      createdAt: '2026-09-02T12:00:00.000Z',
      softwareVersion: '2.0.0',
    },
  };
}

export function createCanonicalSomatotopicGeometry(
  corticalRegion: AtlasRef,
  bodyRegion: BodyRegionRef,
  stimulationHemisphere: 'left' | 'right' | 'bilateral',
  affectedBodySide:
    'left' | 'right' | 'bilateral' | 'midline' | 'not_applicable' = 'not_applicable',
  sourceMethod = 'somatotopic_generator',
  mappedHotspot?: Coordinate3D,
): SomatotopicTargetGeometry {
  return {
    geometryType: 'somatotopic',
    corticalRegion,
    bodyRegion,
    stimulationHemisphere,
    affectedBodySide,
    mappedHotspot,
    coordinateSpace: {
      id: 'MNI152NLin2009cAsym',
      name: 'MNI152NLin2009cAsym',
      subjectSpecific: false,
    },
    laterality: stimulationHemisphere,
    sourceMethod,
    sourceMethodVersion: '2.0.0',
    provenance: {
      createdBy: 'magniom-target-engine-v2',
      createdAt: '2026-09-02T12:00:00.000Z',
      softwareVersion: '2.0.0',
    },
  };
}

export function createCanonicalCoilFieldGeometry(
  coilModelId: string,
  placement: CoilPlacement,
  intendedFieldRegion: SpatialRegion,
  therapeuticRegionIds: readonly string[],
  sourceMethod = 'coil_field_generator',
  pointCoordinateIsRepresentativeOnly = true,
): CoilFieldTargetGeometry {
  return {
    geometryType: 'coil_field',
    coilModelId,
    placement,
    intendedFieldRegion,
    therapeuticRegionIds,
    pointCoordinateIsRepresentativeOnly,
    coordinateSpace: placement.placementCoordinateSystem,
    laterality: 'bilateral',
    sourceMethod,
    sourceMethodVersion: '2.0.0',
    provenance: {
      createdBy: 'magniom-target-engine-v2',
      createdAt: '2026-09-02T12:00:00.000Z',
      softwareVersion: '2.0.0',
    },
  };
}

export function createCanonicalSurfaceRoiGeometry(
  surfaceId: string,
  centre?: Coordinate3D,
  areaMm2?: number,
  laterality: TargetLaterality = 'left',
  sourceMethod = 'surface_roi_generator',
): SurfaceROITargetGeometry {
  return {
    geometryType: 'surface_roi',
    surfaceId,
    centre,
    areaMm2,
    coordinateSpace: {
      id: 'fsaverage',
      name: 'fsaverage',
      subjectSpecific: false,
    },
    laterality,
    sourceMethod,
    sourceMethodVersion: '2.0.0',
    provenance: {
      createdBy: 'magniom-target-engine-v2',
      createdAt: '2026-09-02T12:00:00.000Z',
      softwareVersion: '2.0.0',
    },
  };
}

export function createCanonicalNetworkGeometry(
  therapeuticCircuitIds: readonly string[],
  accessibleNodeRegions: readonly SpatialRegion[],
  networkDefinitionVersionId: string,
  laterality: TargetLaterality = 'bilateral',
  sourceMethod = 'network_generator',
): NetworkTargetGeometry {
  return {
    geometryType: 'network',
    therapeuticCircuitIds,
    accessibleNodeRegions,
    networkDefinitionVersionId,
    coordinateSpace: {
      id: 'MNI152NLin2009cAsym',
      name: 'MNI152NLin2009cAsym',
      subjectSpecific: false,
    },
    laterality,
    sourceMethod,
    sourceMethodVersion: '2.0.0',
    provenance: {
      createdBy: 'magniom-target-engine-v2',
      createdAt: '2026-09-02T12:00:00.000Z',
      softwareVersion: '2.0.0',
    },
  };
}
