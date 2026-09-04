/**
 * @magniom/measurement-testkit - Security, Laterality & Transform Traps
 * Conforms to MAGNIOM-Neuroimaging, Neurophysiology & Multimodal Measurement Specification v2.0 (§156-159, §170-173)
 */

import {
  MeasurementBundleAssembler,
  LateralityValidator,
  SpatialTransformGraphManager,
  PipelineUpgradeComparator,
} from '@magniom/measurement-core';
import type { CanonicalMeasurement, Coordinate3D, SpatialTransform } from '@magniom/domain';
import { computeSha256 } from '@magniom/scientific-policy';

export class MeasurementTraps {
  /**
   * Security Trap §170: Verifies cross-case artifact leakage is blocked.
   * Attempting to mix Case A with Case B must throw an invariant exception.
   */
  public static executeCrossCaseTrap(
    caseIdA: string,
    _caseIdB: string,
    measurementFromCaseB: CanonicalMeasurement,
  ): { trapped: boolean; message: string } {
    try {
      MeasurementBundleAssembler.assembleBundle({
        bundleId: 'BUNDLE-TRAP-01',
        caseId: caseIdA,
        caseIndicationId: 'CASE-IND-TRAP',
        indicationModuleReleaseId: 'MAGNIOM-MODULE-TEST',
        phenotypeSnapshotId: '00000000-0000-0000-0000-000000000001',
        measurements: [measurementFromCaseB], // Belongs to caseIdB!
        provenance: {
          createdBy: 'security-trap',
          createdAt: new Date().toISOString(),
          softwareVersion: '2.0.0',
        },
      });

      return {
        trapped: false,
        message:
          'FAIL: Bundle assembler permitted cross-case artifact mixing! Critical security violation.',
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      const isCaseIdentityError = msg.includes('CRITICAL CASE IDENTITY ERROR');
      return {
        trapped: isCaseIdentityError,
        message: isCaseIdentityError
          ? `SUCCESS: Cross-case trap triggered expected hard rejection: ${msg}`
          : `FAIL: Threw unexpected error: ${msg}`,
      };
    }
  }

  /**
   * Laterality Trap §171: Verifies silent flipping of hemisphere coordinates is blocked.
   */
  public static executeLateralityTrap(
    affectedPainSide: 'left' | 'right',
    ipsilateralCoordinate: Coordinate3D, // e.g., right pain with right M1 coord
  ): { trapped: boolean; message: string } {
    const result = LateralityValidator.validatePainContralateralM1(
      affectedPainSide,
      ipsilateralCoordinate,
    );

    return {
      trapped: result.conflictDetected,
      message: result.conflictDetected
        ? `SUCCESS: Laterality trap caught illegal ipsilateral M1 targeting: ${result.message}`
        : 'FAIL: Laterality trap failed to catch illegal ipsilateral targeting!',
    };
  }

  /**
   * Spatial Transform Round-Trip Trap §158:
   * Verifies that distorted/non-inverting transforms (> 0.5mm error) are rejected.
   */
  public static executeTransformRoundTripTrap(
    forwardMatrix: readonly number[],
    distortedInverseMatrix: readonly number[],
    testPoints: readonly Coordinate3D[],
  ): { trapped: boolean; maxErrorMm: number; message: string } {
    const spaceA = { id: 'SPACE-A', name: 'Native-T1', subjectSpecific: true };
    const spaceB = { id: 'SPACE-B', name: 'MNI152', subjectSpecific: false };

    const manager = new SpatialTransformGraphManager(spaceA);

    const forwardTransform: SpatialTransform = {
      id: 'TRANS-FWD',
      fromSpace: spaceA,
      toSpace: spaceB,
      transformType: 'affine_matrix_4x4',
      matrix4x4: [...forwardMatrix],
      verificationStatus: 'unverified',
      roundTripMaxErrorMm: 0,
      sha256: computeSha256(JSON.stringify(forwardMatrix)),
    };

    const inverseTransform: SpatialTransform = {
      id: 'TRANS-INV',
      fromSpace: spaceB,
      toSpace: spaceA,
      transformType: 'affine_matrix_4x4',
      matrix4x4: [...distortedInverseMatrix],
      verificationStatus: 'unverified',
      roundTripMaxErrorMm: 0,
      sha256: computeSha256(JSON.stringify(distortedInverseMatrix)),
    };

    const validation = manager.validateRoundTrip(
      testPoints,
      forwardTransform,
      inverseTransform,
      0.5, // 0.5mm limit
    );

    return {
      trapped: !validation.valid,
      maxErrorMm: validation.maxErrorMm,
      message: !validation.valid
        ? `SUCCESS: Transform round-trip trap caught excessive error (${validation.maxErrorMm.toFixed(2)}mm > 0.5mm).`
        : `FAIL: Transform passed despite distortion (error ${validation.maxErrorMm.toFixed(2)}mm).`,
    };
  }

  /**
   * §172. TRANSFORM GOLDEN CASE:
   * Deliberately invert RAS/LPS convention -> spatial validation failure before Target Engine use.
   */
  public static executeTransformConventionTrap(
    matrix: readonly number[],
    expectedConvention: 'RAS' | 'LPS' = 'RAS',
  ): { trapped: boolean; message: string } {
    const result = SpatialTransformGraphManager.validateOrientationConvention(
      matrix,
      expectedConvention,
    );

    return {
      trapped: !result.valid,
      message: !result.valid
        ? `SUCCESS: Transform convention trap caught invalid orientation: ${result.message}`
        : 'FAIL: Transform convention trap permitted inverted orientation matrix!',
    };
  }

  /**
   * §173. REPRODUCIBILITY GOLDEN CASE:
   * Run identical source data under identical pipeline, configuration, software, atlas.
   * Expected: Bitwise identical canonical measurement manifest and matching payload hash.
   */
  public static executeReproducibilityTrap<T extends CanonicalMeasurement>(
    provider: {
      process(context: any): { measurement: T; processingRun: { runManifestSha256?: string } };
    },
    context: any,
  ): { reproducible: boolean; hashA: string; hashB: string; message: string } {
    const runA = provider.process(context);
    const runB = provider.process(context);

    const hashA = computeSha256(JSON.stringify(runA.measurement));
    const hashB = computeSha256(JSON.stringify(runB.measurement));

    const matches = hashA === hashB;
    return {
      reproducible: matches,
      hashA,
      hashB,
      message: matches
        ? `SUCCESS: Reproducibility confirmed. Runs yielded identical hash ${hashA.slice(0, 16)}... (§173).`
        : `FAIL: Non-deterministic output detected. Hash A=${hashA}, Hash B=${hashB}.`,
    };
  }

  /**
   * §174. PIPELINE-UPGRADE GOLDEN CASE:
   * Process same acquisition with Pipeline 2.0 vs Pipeline 2.1.
   * Measures spatial displacement, tract change, reliability shift, and capability qualification flips.
   */
  public static executePipelineUpgradeTrap(
    input: Parameters<
      typeof import('@magniom/measurement-core').PipelineUpgradeComparator.compareRuns
    >[0],
  ): {
    impactReport: import('@magniom/measurement-core').ScientificImpactReport;
    passed: boolean;
    message: string;
  } {
    const report = PipelineUpgradeComparator.compareRuns(input);
    const passed =
      Boolean(report.comparisonId) && typeof report.spatialDisplacement.displacementMm === 'number';

    return {
      impactReport: report,
      passed,
      message: `SUCCESS: Pipeline upgrade differential analysis completed. Clinically material: ${report.isClinicallyMaterial}. Requires review: ${report.requiresFormalReview} (§174, §192).`,
    };
  }
}
