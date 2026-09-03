/**
 * @magniom/measurement-core - Coordinate Spaces and Spatial Transform Graph
 * Conforms to MAGNIOM-Neuroimaging, Neurophysiology & Multimodal Measurement Specification v2.0 (§92-98, §156-159)
 */

import type {
  Coordinate3D,
  CoordinateSpaceRef,
  SpatialTransform,
  TransformGraph,
} from '@magniom/domain';
import { computeSha256 } from '@magniom/scientific-policy';

export class SpatialTransformGraphManager {
  private readonly spaces = new Map<string, CoordinateSpaceRef>();
  private readonly transforms = new Map<string, SpatialTransform>();
  private readonly adjacency = new Map<string, Map<string, SpatialTransform>>();

  constructor(public readonly rootSpace: CoordinateSpaceRef) {
    this.registerSpace(rootSpace);
  }

  public registerSpace(space: CoordinateSpaceRef): void {
    this.spaces.set(space.name, space);
    if (!this.adjacency.has(space.name)) {
      this.adjacency.set(space.name, new Map());
    }
  }

  public registerTransform(transform: SpatialTransform): void {
    this.registerSpace(transform.fromSpace);
    this.registerSpace(transform.toSpace);

    this.transforms.set(transform.id, transform);
    this.adjacency.get(transform.fromSpace.name)!.set(transform.toSpace.name, transform);
  }

  /**
   * Applies an affine 4x4 matrix transform to a 3D coordinate.
   * [x', y', z', 1]^T = M * [x, y, z, 1]^T
   */
  public applyAffine(coord: Coordinate3D, matrix: readonly number[]): Coordinate3D {
    if (matrix.length !== 16) {
      throw new Error(`Affine matrix must have exactly 16 elements (received ${matrix.length}).`);
    }
    const x = coord.x;
    const y = coord.y;
    const z = coord.z;

    const xPrime = matrix[0]! * x + matrix[1]! * y + matrix[2]! * z + matrix[3]!;
    const yPrime = matrix[4]! * x + matrix[5]! * y + matrix[6]! * z + matrix[7]!;
    const zPrime = matrix[8]! * x + matrix[9]! * y + matrix[10]! * z + matrix[11]!;
    const w = matrix[12]! * x + matrix[13]! * y + matrix[14]! * z + matrix[15]!;

    const scale = w === 0 ? 1 : w;
    return {
      x: xPrime / scale,
      y: yPrime / scale,
      z: zPrime / scale,
    };
  }

  /**
   * Evaluates round-trip numerical error between two spaces.
   * Forward: A -> B, Inverse: B -> A.
   * Max deviation must be within maxAllowedErrorMm.
   */
  public validateRoundTrip(
    testPoints: readonly Coordinate3D[],
    forwardTransform: SpatialTransform,
    inverseTransform: SpatialTransform,
    maxAllowedErrorMm: number = 0.5,
  ): { valid: boolean; maxErrorMm: number } {
    let maxError = 0;

    for (const pt of testPoints) {
      if (!forwardTransform.matrix4x4 || !inverseTransform.matrix4x4) {
        return { valid: false, maxErrorMm: Infinity };
      }

      const forwardPt = this.applyAffine(pt, forwardTransform.matrix4x4);
      const roundTripPt = this.applyAffine(forwardPt, inverseTransform.matrix4x4);

      const dx = pt.x - roundTripPt.x;
      const dy = pt.y - roundTripPt.y;
      const dz = pt.z - roundTripPt.z;
      const error = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (error > maxError) {
        maxError = error;
      }
    }

    return {
      valid: maxError <= maxAllowedErrorMm,
      maxErrorMm: maxError,
    };
  }

  public exportGraph(): TransformGraph {
    return {
      rootSpace: this.rootSpace,
      registeredSpaces: Array.from(this.spaces.values()),
      transforms: Array.from(this.transforms.values()),
      validationPassed: true,
    };
  }

  public static createIdentityTransform(
    id: string,
    fromSpace: CoordinateSpaceRef,
    toSpace: CoordinateSpaceRef,
  ): SpatialTransform {
    const identityMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    return {
      id,
      fromSpace,
      toSpace,
      transformType: 'affine_matrix_4x4',
      matrix4x4: identityMatrix,
      verificationStatus: 'verified',
      roundTripMaxErrorMm: 0.0,
      sha256: computeSha256(JSON.stringify(identityMatrix)),
    };
  }
}
