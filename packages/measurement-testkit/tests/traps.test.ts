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

  it('Transform Golden Case §172: Catches inverted RAS/LPS orientation matrix before Target Engine use', () => {
    // LPS matrix in a RAS pipeline: diagonal elements for X and Y are inverted (-1)
    const invertedLpsMatrix = [-1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

    const result = MeasurementTraps.executeTransformConventionTrap(invertedLpsMatrix, 'RAS');
    expect(result.trapped).toBe(true);
    expect(result.message).toContain('CRITICAL SPATIAL VALIDATION FAILURE');
  });

  it('Reproducibility Golden Case §173: Confirms bitwise identical output hashes under identical runs', () => {
    const mockProvider = {
      process: (ctx: { readonly caseId: string }) => ({
        measurement: {
          id: `MEAS-${ctx.caseId.slice(0, 8)}`,
          organisationId: 'ORG-01',
          caseId: ctx.caseId,
          modality: 'resting_state_fmri' as const,
          version: '2.0.0',
          status: 'qualified' as const,
          pipelineVersionIds: ['PIPE-RSFMRI-2.0.0'],
          artifactIds: ['ART-01'],
          qcStatus: 'pass' as const,
          qualification: 'qualified' as const,
          provenance: {
            createdBy: 'test-pipeline',
            createdAt: '2026-09-02T12:00:00.000Z',
            softwareVersion: '2.0.0',
          },
        },
        processingRun: {
          runManifestSha256: 'a'.repeat(64),
        },
      }),
    };

    const result = MeasurementTraps.executeReproducibilityTrap(mockProvider, {
      caseId: '11111111-1111-1111-1111-111111111111',
    });

    expect(result.reproducible).toBe(true);
    expect(result.hashA).toBe(result.hashB);
    expect(result.message).toContain('Reproducibility confirmed');
  });

  it('Pipeline-Upgrade Golden Case §174: Performs differential analysis and flags clinically material shift', () => {
    const caseId = '33333333-3333-3333-3333-333333333333';
    const baselineMeasurement = {
      id: 'MEAS-BASE-01',
      organisationId: 'ORG-01',
      caseId,
      modality: 'resting_state_fmri' as const,
      version: '2.0.0',
      status: 'qualified' as const,
      pipelineVersionIds: ['PIPE-RS-2.0.0'],
      artifactIds: ['ART-01'],
      qcStatus: 'pass' as const,
      qualification: 'qualified' as const,
      provenance: {
        createdBy: 'p2.0',
        createdAt: '2026-09-02T00:00:00Z',
        softwareVersion: '2.0.0',
      },
      coordinate: { x: -38, y: 44, z: 26 },
    };

    // Upgraded run introduces a 4.5mm coordinate shift (> 2.0mm material threshold)
    const upgradedMeasurement = {
      ...baselineMeasurement,
      id: 'MEAS-UP-01',
      version: '2.1.0',
      pipelineVersionIds: ['PIPE-RS-2.1.0'],
      provenance: {
        createdBy: 'p2.1',
        createdAt: '2026-09-02T00:00:00Z',
        softwareVersion: '2.1.0',
      },
      coordinate: { x: -42, y: 42, z: 28 }, // Shift = sqrt(16 + 4 + 4) = 4.89mm
    };

    const baselineReliability = {
      id: 'REL-BASE-01',
      version: '2.0.0',
      caseId,
      measurementId: baselineMeasurement.id,
      modality: 'resting_state_fmri' as const,
      methodCode: 'SPLIT_HALF',
      methodVersion: '2.0.0',
      qcStatus: 'pass' as const,
      metrics: [],
      reliabilityClass: 'high' as const,
      limitingFactors: [],
      interpretation: 'High reliability',
      pipelineVersionIds: ['PIPE-RS-2.0.0'],
      provenance: baselineMeasurement.provenance,
    };

    const upgradedReliability = {
      ...baselineReliability,
      id: 'REL-UP-01',
      version: '2.1.0',
      reliabilityClass: 'moderate' as const, // Reliability dropped
    };

    const baselineCapabilities = [
      {
        capabilityCode: 'individual_fc_refinement',
        qualification: 'qualified' as const,
        measurementQualification: 'qualified' as const,
        isAllowedForClinicalMode: true,
        reasons: ['Passed all criteria'],
      },
    ];

    const upgradedCapabilities = [
      {
        capabilityCode: 'individual_fc_refinement',
        qualification: 'qualified_with_limits' as const,
        measurementQualification: 'qualified_with_limits' as const,
        isAllowedForClinicalMode: true,
        reasons: ['Moderate reliability limitations apply'],
      },
    ];

    const result = MeasurementTraps.executePipelineUpgradeTrap({
      caseId,
      modality: 'resting_state_fmri',
      baselinePipelineVersionId: 'PIPE-RS-2.0.0',
      upgradedPipelineVersionId: 'PIPE-RS-2.1.0',
      baselineMeasurement,
      upgradedMeasurement,
      baselineReliability,
      upgradedReliability,
      baselineCapabilities,
      upgradedCapabilities,
    });

    expect(result.passed).toBe(true);
    expect(result.impactReport.spatialDisplacement.displacementMm).toBeGreaterThan(2.0);
    expect(result.impactReport.spatialDisplacement.isMaterialShift).toBe(true);
    expect(result.impactReport.isClinicallyMaterial).toBe(true);
    expect(result.impactReport.requiresFormalReview).toBe(true);
  });
});
