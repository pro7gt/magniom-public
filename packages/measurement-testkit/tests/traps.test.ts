/**
 * Security, Laterality & Transform Traps Test Suite
 * Conforms to MAGNIOM-Neuroimaging, Neurophysiology & Multimodal Measurement Specification v2.0 (§156-159, §170-173)
 */

import { describe, it, expect } from 'vitest';
import { MeasurementTraps } from '../src/traps/index.js';
import type { CanonicalMeasurement, Coordinate3D } from '@magniom/domain';

describe('Phase 3 Security, Laterality & Transform Traps', () => {
  it('Security Trap §170: Blocks cross-case measurement injection with hard exception', () => {
    const caseIdA = '11111111-1111-1111-1111-111111111111';
    const caseIdB = '22222222-2222-2222-2222-222222222222';

    const measurementFromCaseB: CanonicalMeasurement = {
      id: 'MEAS-B-01',
      organisationId: 'ORG-01',
      caseId: caseIdB, // Belongs to Case B
      modality: 'structural_mri',
      version: '2.0.0',
      status: 'qualified',
      pipelineVersionIds: ['PIPE-01'],
      artifactIds: ['ART-01'],
      qcStatus: 'pass',
      qualification: 'qualified',
      provenance: {
        createdBy: 'test',
        createdAt: new Date().toISOString(),
        softwareVersion: '2.0.0',
      },
    };

    const result = MeasurementTraps.executeCrossCaseTrap(caseIdA, caseIdB, measurementFromCaseB);
    expect(result.trapped).toBe(true);
    expect(result.message).toContain('CRITICAL CASE IDENTITY ERROR');
  });

  it('Laterality Trap §171: Blocks silent hemisphere flipping on contralateral pain targeting', () => {
    // Neuropathic pain in right upper limb requires contralateral (LEFT) M1 target (X < 0)
    // Providing an ipsilateral coordinate (X > 0, e.g. X = +38mm) must be caught as a critical conflict.
    const ipsilateralCoord: Coordinate3D = { x: 38, y: -22, z: 58 };

    const result = MeasurementTraps.executeLateralityTrap('right', ipsilateralCoord);
    expect(result.trapped).toBe(true);
    expect(result.message).toContain('CRITICAL LATERALITY CONFLICT');
  });

  it('Transform Round-Trip Trap §158: Rejects transforms with >0.5mm numerical inversion error', () => {
    // Forward: identity
    const forwardMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

    // Distorted inverse: introduces 1.5mm offset on X axis
    const distortedInverse = [
      1,
      0,
      0,
      1.5, // 1.5mm shift
      0,
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1,
    ];

    const testPoints: Coordinate3D[] = [
      { x: 10, y: 20, z: 30 },
      { x: -25, y: 15, z: 45 },
    ];

    const result = MeasurementTraps.executeTransformRoundTripTrap(
      forwardMatrix,
      distortedInverse,
      testPoints,
    );

    expect(result.trapped).toBe(true);
    expect(result.maxErrorMm).toBeGreaterThan(0.5);
    expect(result.message).toContain('Transform round-trip trap caught excessive error');
  });
});
