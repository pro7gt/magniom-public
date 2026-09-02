/**
 * Magniom Coordinate Transformation & 4x4 Affine Math Engine
 * Conforms to MAGNIOM-Neuroimaging & Functional Connectomics Pipeline Specification v1.0 Section 174 & 175
 * and MAGNIOM-Canonical Target Data Specification v1.0 Section 88-92.
 */

import type {
  Vector3D,
  MniCoordinate,
  SubjectCoordinate,
  CoordinateOrientation,
  CoordinateTransformMatrix4x4,
  SurfaceMeshGeometry,
} from '@magniom/domain';

/**
 * Multiplies two 4x4 matrices (A * B).
 */
export function multiplyMatrix4x4(
  a: readonly (readonly number[])[],
  b: readonly (readonly number[])[],
): number[][] {
  const result: number[][] = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];

  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      let sum = 0;
      for (let k = 0; k < 4; k++) {
        sum += (a[r]?.[k] ?? 0) * (b[k]?.[c] ?? 0);
      }
      result[r]![c] = sum;
    }
  }

  return result;
}

/**
 * Computes the determinant of a 4x4 matrix.
 */
export function determinant4x4(m: readonly (readonly number[])[]): number {
  // Expansion along first row
  let det = 0;
  for (let c = 0; c < 4; c++) {
    const minor = getMinor3x3(m, 0, c);
    const cofactor = (c % 2 === 0 ? 1 : -1) * (m[0]?.[c] ?? 0) * determinant3x3(minor);
    det += cofactor;
  }
  return det;
}

function getMinor3x3(
  m: readonly (readonly number[])[],
  rowToRemove: number,
  colToRemove: number,
): number[][] {
  const minor: number[][] = [];
  for (let r = 0; r < 4; r++) {
    if (r === rowToRemove) continue;
    const row: number[] = [];
    for (let c = 0; c < 4; c++) {
      if (c === colToRemove) continue;
      row.push(m[r]?.[c] ?? 0);
    }
    minor.push(row);
  }
  return minor;
}

function determinant3x3(m: readonly (readonly number[])[]): number {
  const a = m[0]?.[0] ?? 0;
  const b = m[0]?.[1] ?? 0;
  const c = m[0]?.[2] ?? 0;
  const d = m[1]?.[0] ?? 0;
  const e = m[1]?.[1] ?? 0;
  const f = m[1]?.[2] ?? 0;
  const g = m[2]?.[0] ?? 0;
  const h = m[2]?.[1] ?? 0;
  const i = m[2]?.[2] ?? 0;

  return a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
}

/**
 * Inverts a 4x4 affine matrix. Throws if matrix is singular (det === 0).
 */
export function invertMatrix4x4(m: readonly (readonly number[])[]): number[][] {
  const det = determinant4x4(m);
  if (Math.abs(det) < 1e-12) {
    throw new Error(`Matrix is singular and cannot be inverted (det = ${det}).`);
  }

  const inv: number[][] = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];

  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const minor = getMinor3x3(m, r, c);
      const sign = (r + c) % 2 === 0 ? 1 : -1;
      const cofactor = sign * determinant3x3(minor);
      // Transpose of cofactor matrix divided by determinant
      inv[c]![r] = cofactor / det;
    }
  }

  return inv;
}

/**
 * Applies 4x4 affine transform to a 3D point [x, y, z, 1]^T.
 */
export function transformPointAffine(
  point: Vector3D,
  matrix: readonly (readonly number[])[],
): Vector3D {
  const x = point.x;
  const y = point.y;
  const z = point.z;

  const nx =
    (matrix[0]?.[0] ?? 0) * x +
    (matrix[0]?.[1] ?? 0) * y +
    (matrix[0]?.[2] ?? 0) * z +
    (matrix[0]?.[3] ?? 0);
  const ny =
    (matrix[1]?.[0] ?? 0) * x +
    (matrix[1]?.[1] ?? 0) * y +
    (matrix[1]?.[2] ?? 0) * z +
    (matrix[1]?.[3] ?? 0);
  const nz =
    (matrix[2]?.[0] ?? 0) * x +
    (matrix[2]?.[1] ?? 0) * y +
    (matrix[2]?.[2] ?? 0) * z +
    (matrix[2]?.[3] ?? 0);
  const nw =
    (matrix[3]?.[0] ?? 0) * x +
    (matrix[3]?.[1] ?? 0) * y +
    (matrix[3]?.[2] ?? 0) * z +
    (matrix[3]?.[3] ?? 1);

  const w = Math.abs(nw) > 1e-12 ? nw : 1.0;

  return {
    x: Number((nx / w).toFixed(4)),
    y: Number((ny / w).toFixed(4)),
    z: Number((nz / w).toFixed(4)),
  };
}

/**
 * Applies 4x4 linear transform to a directional normal vector (ignoring translation).
 * Normalizes output to unit length.
 */
export function transformVectorAffine(
  vec: Vector3D,
  matrix: readonly (readonly number[])[],
): Vector3D {
  const x = vec.x;
  const y = vec.y;
  const z = vec.z;

  const nx = (matrix[0]?.[0] ?? 0) * x + (matrix[0]?.[1] ?? 0) * y + (matrix[0]?.[2] ?? 0) * z;
  const ny = (matrix[1]?.[0] ?? 0) * x + (matrix[1]?.[1] ?? 0) * y + (matrix[1]?.[2] ?? 0) * z;
  const nz = (matrix[2]?.[0] ?? 0) * x + (matrix[2]?.[1] ?? 0) * y + (matrix[2]?.[2] ?? 0) * z;

  const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
  if (len < 1e-8) {
    return { x: 0, y: 0, z: 1 };
  }

  return {
    x: Number((nx / len).toFixed(4)),
    y: Number((ny / len).toFixed(4)),
    z: Number((nz / len).toFixed(4)),
  };
}

/**
 * Transforms Native T1w subject coordinate to MNI152 standard space.
 */
export function nativeToMniAffine(
  nativeCoord: SubjectCoordinate,
  transform: CoordinateTransformMatrix4x4,
): MniCoordinate {
  const res = transformPointAffine(
    { x: nativeCoord.x, y: nativeCoord.y, z: nativeCoord.z },
    transform.matrix4x4,
  );

  return {
    space: 'MNI152NLin2009cAsym',
    x: res.x,
    y: res.y,
    z: res.z,
    unit: 'mm',
  };
}

/**
 * Transforms MNI152 standard space coordinate to Native T1w subject coordinate.
 */
export function mniToNativeAffine(
  mniCoord: MniCoordinate,
  transform: CoordinateTransformMatrix4x4,
): SubjectCoordinate {
  const invMatrix = transform.inverseMatrix4x4 || invertMatrix4x4(transform.matrix4x4);
  const res = transformPointAffine({ x: mniCoord.x, y: mniCoord.y, z: mniCoord.z }, invMatrix);

  return {
    space: 'NATIVE_T1W',
    x: res.x,
    y: res.y,
    z: res.z,
    unit: 'mm',
  };
}

/**
 * Converts 3D Cartesian coordinates between RAS and LPS orientation conventions.
 * RAS: +X=Right, +Y=Anterior, +Z=Superior
 * LPS: +X=Left, +Y=Posterior, +Z=Superior
 */
export function convertCoordinateOrientation(
  coord: Vector3D,
  from: CoordinateOrientation,
  to: CoordinateOrientation,
): Vector3D {
  if (from === to) return { ...coord };

  // RAS <-> LPS: flip X and Y axes, Z remains Superior
  return {
    x: -coord.x,
    y: -coord.y,
    z: coord.z,
  };
}

/**
 * Strict Left/Right Safety Test & Laterality Invariant Verification (Section 175).
 * In standard RAS convention:
 * - Left Hemisphere targets must have x < 0.
 * - Right Hemisphere targets must have x > 0.
 */
export function verifyLaterality(
  coord: Vector3D,
  hemisphere: 'L' | 'R',
  convention: CoordinateOrientation = 'RAS',
): { valid: boolean; reason?: string } {
  const effectiveX = convention === 'RAS' ? coord.x : -coord.x;

  if (hemisphere === 'L' && effectiveX > 0.5) {
    return {
      valid: false,
      reason: `Laterality invariant violation: Left-hemisphere target has positive X (${coord.x} in ${convention}).`,
    };
  }

  if (hemisphere === 'R' && effectiveX < -0.5) {
    return {
      valid: false,
      reason: `Laterality invariant violation: Right-hemisphere target has negative X (${coord.x} in ${convention}).`,
    };
  }

  return { valid: true };
}

/**
 * Calculates 3D Euclidean distance between two points in mm.
 */
export function computeEuclideanDistance3D(p1: Vector3D, p2: Vector3D): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  const dz = p1.z - p2.z;
  return Number(Math.sqrt(dx * dx + dy * dy + dz * dz).toFixed(4));
}

/**
 * Retrieves 3D coordinate for a vertex index from a flattened surface mesh.
 */
export function surfaceVertexToCoordinate(
  mesh: SurfaceMeshGeometry,
  vertexIndex: number,
): Vector3D {
  const base = vertexIndex * 3;
  if (base + 2 >= mesh.vertices.length) {
    throw new Error(
      `Vertex index ${vertexIndex} out of bounds for mesh with ${mesh.vertexCount} vertices.`,
    );
  }

  return {
    x: mesh.vertices[base] ?? 0,
    y: mesh.vertices[base + 1] ?? 0,
    z: mesh.vertices[base + 2] ?? 0,
  };
}

/**
 * Finds the closest vertex index on a surface mesh to a given 3D coordinate.
 */
export function findClosestSurfaceVertex(
  mesh: SurfaceMeshGeometry,
  targetCoord: Vector3D,
): { vertexIndex: number; distanceMm: number; coordinate: Vector3D } {
  let closestIndex = 0;
  let minDistance = Number.POSITIVE_INFINITY;
  let closestCoord: Vector3D = { x: 0, y: 0, z: 0 };

  for (let i = 0; i < mesh.vertexCount; i++) {
    const coord = surfaceVertexToCoordinate(mesh, i);
    const dist = computeEuclideanDistance3D(targetCoord, coord);
    if (dist < minDistance) {
      minDistance = dist;
      closestIndex = i;
      closestCoord = coord;
    }
  }

  return {
    vertexIndex: closestIndex,
    distanceMm: minDistance,
    coordinate: closestCoord,
  };
}

/**
 * Estimates surface normal vector at vertex index.
 */
export function estimateSurfaceNormalAtVertex(
  mesh: SurfaceMeshGeometry,
  vertexIndex: number,
): Vector3D {
  if (mesh.normals && mesh.normals.length >= (vertexIndex + 1) * 3) {
    const base = vertexIndex * 3;
    return {
      x: mesh.normals[base] ?? 0,
      y: mesh.normals[base + 1] ?? 0,
      z: mesh.normals[base + 2] ?? 1,
    };
  }

  // Fallback: radial outward vector from anatomical centroid
  const pt = surfaceVertexToCoordinate(mesh, vertexIndex);
  const cx = mesh.hemisphere === 'L' ? -25.0 : 25.0;
  const cy = 20.0;
  const cz = 20.0;

  const dx = pt.x - cx;
  const dy = pt.y - cy;
  const dz = pt.z - cz;
  const len = Math.sqrt(dx * dx + dy * dy + dz * dz);

  return {
    x: Number((dx / len).toFixed(4)),
    y: Number((dy / len).toFixed(4)),
    z: Number((dz / len).toFixed(4)),
  };
}
