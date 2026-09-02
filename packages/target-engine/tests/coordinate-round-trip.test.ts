import { describe, it, expect } from 'vitest';
import type { TargetCandidate, SubjectCoordinate, SurfaceMeshGeometry } from '@magniom/domain';
import {
  multiplyMatrix4x4,
  invertMatrix4x4,
  determinant4x4,
  transformPointAffine,
  transformVectorAffine,
  nativeToMniAffine,
  mniToNativeAffine,
  convertCoordinateOrientation,
  verifyLaterality,
  computeEuclideanDistance3D,
  findClosestSurfaceVertex,
  estimateSurfaceNormalAtVertex,
} from '../src/spatial/coordinate-transform.js';
import {
  CANONICAL_MNI_AFFINE,
  exportNeuronavigationTarget,
  importNeuronavigationTarget,
  executeCoordinateRoundTripTest,
} from '../src/spatial/coordinate-round-trip.js';

describe('Spatial Coordinate Transformations & 4x4 Affine Math', () => {
  it('correctly calculates 4x4 determinant and inverts non-singular affine matrix', () => {
    const matrix = [
      [1.0, 0.0, 0.0, 10.0],
      [0.0, 2.0, 0.0, -5.0],
      [0.0, 0.0, 3.0, 15.0],
      [0.0, 0.0, 0.0, 1.0],
    ];

    const det = determinant4x4(matrix);
    expect(det).toBeCloseTo(6.0, 4);

    const inv = invertMatrix4x4(matrix);
    const identity = multiplyMatrix4x4(matrix, inv);

    // Identity check
    expect(identity[0]![0]).toBeCloseTo(1.0, 5);
    expect(identity[1]![1]).toBeCloseTo(1.0, 5);
    expect(identity[2]![2]).toBeCloseTo(1.0, 5);
    expect(identity[3]![3]).toBeCloseTo(1.0, 5);
    expect(identity[0]![3]).toBeCloseTo(0.0, 5);
  });

  it('performs forward and inverse affine coordinate transformations with sub-micron precision', () => {
    const nativePt: SubjectCoordinate = {
      space: 'NATIVE_T1W',
      x: -38.5,
      y: 28.2,
      z: 35.4,
      unit: 'mm',
    };

    const mniPt = nativeToMniAffine(nativePt, CANONICAL_MNI_AFFINE);
    expect(mniPt.space).toBe('MNI152NLin2009cAsym');

    const reconstructedNative = mniToNativeAffine(mniPt, CANONICAL_MNI_AFFINE);
    const error = computeEuclideanDistance3D(nativePt, reconstructedNative);

    expect(error).toBeLessThan(0.001); // Less than 1 micron error
    expect(reconstructedNative.x).toBeCloseTo(nativePt.x, 3);
    expect(reconstructedNative.y).toBeCloseTo(nativePt.y, 3);
    expect(reconstructedNative.z).toBeCloseTo(nativePt.z, 3);
  });

  it('correctly converts between RAS and LPS orientation conventions', () => {
    const rasPoint = { x: -44.0, y: 38.0, z: 32.0 };
    const lpsPoint = convertCoordinateOrientation(rasPoint, 'RAS', 'LPS');

    expect(lpsPoint.x).toBe(44.0); // -X becomes +X
    expect(lpsPoint.y).toBe(-38.0); // +Y becomes -Y
    expect(lpsPoint.z).toBe(32.0); // +Z remains unchanged

    const roundTripRas = convertCoordinateOrientation(lpsPoint, 'LPS', 'RAS');
    expect(roundTripRas.x).toBe(-44.0);
    expect(roundTripRas.y).toBe(38.0);
    expect(roundTripRas.z).toBe(32.0);
  });
});

describe('Section 175 Strict Left/Right Safety Test & Laterality Invariants', () => {
  it('validates that left hemisphere prefrontal targets must have negative X coordinate in RAS', () => {
    const leftTargetCoord = { x: -42.0, y: 38.0, z: 30.0 };
    const result = verifyLaterality(leftTargetCoord, 'L', 'RAS');
    expect(result.valid).toBe(true);
    expect(result.reason).toBeUndefined();
  });

  it('detects and fails on laterality invariant violations (Left hemisphere target with positive X)', () => {
    const corruptedCoord = { x: 42.0, y: 38.0, z: 30.0 }; // Right side coordinate
    const result = verifyLaterality(corruptedCoord, 'L', 'RAS');
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('Laterality invariant violation');
  });

  it('correctly tests right hemisphere targets in RAS', () => {
    const rightCoord = { x: 40.0, y: 35.0, z: 28.0 };
    const result = verifyLaterality(rightCoord, 'R', 'RAS');
    expect(result.valid).toBe(true);

    const invertedRight = { x: -40.0, y: 35.0, z: 28.0 };
    const invalidResult = verifyLaterality(invertedRight, 'R', 'RAS');
    expect(invalidResult.valid).toBe(false);
  });
});

describe('Section 174 Target Coordinate Round-Trip Validation Pipeline', () => {
  const mockTarget: TargetCandidate = {
    id: 'TGT-P1-MDD-001',
    familyId: 'TF-MDD-SGACC-LDLPFC-001',
    circuitId: 'TC-MDD-CONVERGENT-001',
    role: 'PRIMARY_1',
    method: 'CONNECTOME_REFINED',
    evidenceTier: 'T1',
    mniCoordinate: {
      space: 'MNI152NLin2009cAsym',
      x: -44.2,
      y: 38.6,
      z: 32.1,
      unit: 'mm',
    },
    evidenceScore: 0.95,
    phenotypeConcordanceScore: 0.91,
    connectomeRefinementScore: 0.88,
    overallScore: 0.92,
    rationale: 'Primary connectome-refined left DLPFC target.',
    contraindicationsOrConflicts: [],
    isSuppressedOrRedundant: false,
  };

  const mockNative: SubjectCoordinate = {
    space: 'NATIVE_T1W',
    x: -42.1,
    y: 26.5,
    z: 39.8,
    unit: 'mm',
  };

  it('exports and re-imports Brainsight neuronavigation format with exact coordinate fidelity', () => {
    const exportSim = exportNeuronavigationTarget(mockTarget, 'BRAINSIGHT', {
      nativeCoord: mockNative,
    });

    expect(exportSim.format).toBe('BRAINSIGHT');
    expect(exportSim.payloadText).toContain('Brainsight Target Export');
    expect(exportSim.payloadText).toContain(mockTarget.familyId);

    const imported = importNeuronavigationTarget(exportSim.payloadText, 'BRAINSIGHT');
    expect(imported.worldCoordinate.x).toBeCloseTo(mockNative.x, 3);
    expect(imported.worldCoordinate.y).toBeCloseTo(mockNative.y, 3);
    expect(imported.worldCoordinate.z).toBeCloseTo(mockNative.z, 3);
  });

  it('exports and re-imports Localite XML format with exact coordinate fidelity', () => {
    const exportSim = exportNeuronavigationTarget(mockTarget, 'LOCALITE', {
      nativeCoord: mockNative,
    });

    expect(exportSim.format).toBe('LOCALITE');
    expect(exportSim.payloadText).toContain('<LocaliteTargetPlan');

    const imported = importNeuronavigationTarget(exportSim.payloadText, 'LOCALITE');
    expect(imported.worldCoordinate.x).toBeCloseTo(mockNative.x, 3);
    expect(imported.worldCoordinate.y).toBeCloseTo(mockNative.y, 3);
    expect(imported.worldCoordinate.z).toBeCloseTo(mockNative.z, 3);
  });

  it('executes end-to-end Section 174 coordinate round-trip test and verifies all validation gates', () => {
    const validationResult = executeCoordinateRoundTripTest({
      target: mockTarget,
      nativeCoord: mockNative,
      format: 'BRAINSIGHT',
      toleranceMm: 0.001,
    });

    expect(validationResult.passRoundTrip).toBe(true);
    expect(validationResult.passLaterality).toBe(true);
    expect(validationResult.passOrientation).toBe(true);
    expect(validationResult.roundTripErrorMm).toBeLessThan(0.001);
    expect(validationResult.executionTrace.length).toBeGreaterThan(4);
    expect(validationResult.lateralityAudit.valid).toBe(true);
  });
});

describe('Surface Mesh Spatial Projections & Normals', () => {
  const sampleMesh: SurfaceMeshGeometry = {
    surfaceType: 'midthickness',
    hemisphere: 'L',
    coordinateSpace: 'fsLR_32k',
    vertexCount: 4,
    triangleCount: 2,
    vertices: [
      -40.0, 30.0, 30.0, // v0
      -42.0, 35.0, 32.0, // v1
      -45.0, 38.0, 35.0, // v2
      -48.0, 40.0, 38.0, // v3
    ],
    triangles: [0, 1, 2, 1, 2, 3],
  };

  it('finds the closest surface vertex for a target coordinate', () => {
    const searchCoord = { x: -44.5, y: 37.8, z: 34.9 };
    const closest = findClosestSurfaceVertex(sampleMesh, searchCoord);

    expect(closest.vertexIndex).toBe(2);
    expect(closest.distanceMm).toBeLessThan(1.0);
    expect(closest.coordinate.x).toBe(-45.0);
  });

  it('estimates surface normal vector with correct unit length', () => {
    const normal = estimateSurfaceNormalAtVertex(sampleMesh, 2);
    const len = Math.sqrt(normal.x * normal.x + normal.y * normal.y + normal.z * normal.z);
    expect(len).toBeCloseTo(1.0, 3);
  });
});
