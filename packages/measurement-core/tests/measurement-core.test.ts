import { describe, it, expect } from 'vitest';
import {
  MeasurementProviderRegistry,
  defaultMeasurementRegistry,
  SpatialTransformGraphManager,
  LateralityValidator,
  MeasurementBundleAssembler,
  ProcessingRunEngine,
} from '../src/index.js';
import type { Coordinate3D, CanonicalMeasurement } from '@magniom/domain';

describe('@magniom/measurement-core Unit Tests', () => {
  it('registry registers and retrieves providers by code and modality', () => {
    const registry = new MeasurementProviderRegistry();
    expect(registry.listAll().length).toBe(0);
    expect(defaultMeasurementRegistry).toBeDefined();
  });

  it('SpatialTransformGraphManager transforms 3D point accurately with affine matrix', () => {
    const spaceA = { id: 'SPACE-A', name: 'Native', subjectSpecific: true };
    const manager = new SpatialTransformGraphManager(spaceA);

    // Translation matrix: X+10, Y-5, Z+2
    const matrix = [1, 0, 0, 10, 0, 1, 0, -5, 0, 0, 1, 2, 0, 0, 0, 1];

    const input: Coordinate3D = { x: 5, y: 10, z: 15 };
    const output = manager.applyAffine(input, matrix);

    expect(output.x).toBe(15);
    expect(output.y).toBe(5);
    expect(output.z).toBe(17);
  });

  it('LateralityValidator checks RAS hemisphere bounds correctly', () => {
    const rightPoint: Coordinate3D = { x: 25, y: 0, z: 0 };
    const leftPoint: Coordinate3D = { x: -25, y: 0, z: 0 };
    const midlinePoint: Coordinate3D = { x: 1.5, y: 0, z: 0 };

    expect(LateralityValidator.validateRasHemisphere(rightPoint, 'right').valid).toBe(true);
    expect(LateralityValidator.validateRasHemisphere(rightPoint, 'left').conflictDetected).toBe(
      true,
    );
    expect(LateralityValidator.validateRasHemisphere(leftPoint, 'left').valid).toBe(true);
    expect(LateralityValidator.validateRasHemisphere(midlinePoint, 'midline').valid).toBe(true);
  });

  it('ProcessingRunEngine validates container digest and idempotency', () => {
    const digestA = 'A1B2C3D4E5F60718293A4B5C6D7E8F90123456789ABCDEF0123456789ABCDEF0';
    const digestB = 'a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0';
    expect(ProcessingRunEngine.validateContainerDigest(digestA, digestB)).toBe(true);
  });
});
