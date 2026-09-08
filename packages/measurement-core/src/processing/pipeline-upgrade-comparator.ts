/**
 * @magniom/measurement-core - Pipeline Upgrade Differential Comparator
 * Conforms to MAGNIOM-Neuroimaging, Neurophysiology & Multimodal Measurement Specification v2.0
 * (§174 Pipeline-Upgrade Golden Case, §191 Measurement Change Classes, §192 Scientific Change Impact)
 */

import type { CanonicalMeasurement, MeasurementReliability, Coordinate3D } from '@magniom/domain';
import type { CapabilityQualificationResult } from '../types.js';

export interface SpatialDisplacementAnalysis {
  readonly baselineCoordinate?: Coordinate3D | undefined;
  readonly upgradedCoordinate?: Coordinate3D | undefined;
  readonly displacementMm: number;
  readonly isMaterialShift: boolean; // > 2.0mm is clinically material
}

export interface ReliabilityShiftAnalysis {
  readonly baselineClass: string;
  readonly upgradedClass: string;
  readonly isDegraded: boolean;
  readonly isImproved: boolean;
}

export interface CapabilityShiftAnalysis {
  readonly capabilityCode: string;
  readonly baselineStatus: string;
  readonly upgradedStatus: string;
  readonly statusChanged: boolean;
  readonly isQualificationRevoked: boolean;
}

export interface ScientificImpactReport {
  readonly comparisonId: string;
  readonly caseId: string;
  readonly baselinePipelineVersionId: string;
  readonly upgradedPipelineVersionId: string;
  readonly modality: string;
  readonly spatialDisplacement: SpatialDisplacementAnalysis;
  readonly reliabilityShift: ReliabilityShiftAnalysis;
  readonly capabilityShifts: readonly CapabilityShiftAnalysis[];
  readonly isClinicallyMaterial: boolean;
  readonly changeClass:
    | 'non_scientific_implementation'
    | 'measurement_implementation'
    | 'measurement_parameter'
    | 'measurement_model'
    | 'acquisition_profile';
  readonly requiresFormalReview: boolean;
  readonly summaryNotes: string;
}

export class PipelineUpgradeComparator {
  /**
   * Evaluates the differential impact of updating a measurement pipeline version.
   * (§174, §191-192)
   */
  public static compareRuns(input: {
    caseId: string;
    modality: string;
    baselinePipelineVersionId: string;
    upgradedPipelineVersionId: string;
    baselineMeasurement: CanonicalMeasurement & {
      coordinate?: Coordinate3D;
      [key: string]: unknown;
    };
    upgradedMeasurement: CanonicalMeasurement & {
      coordinate?: Coordinate3D;
      [key: string]: unknown;
    };
    baselineReliability: MeasurementReliability;
    upgradedReliability: MeasurementReliability;
    baselineCapabilities: readonly CapabilityQualificationResult[];
    upgradedCapabilities: readonly CapabilityQualificationResult[];
    changeClass?:
      | 'non_scientific_implementation'
      | 'measurement_implementation'
      | 'measurement_parameter'
      | 'measurement_model'
      | 'acquisition_profile';
  }): ScientificImpactReport {
    // 1. Spatial displacement
    let displacementMm = 0;
    const baseCoord =
      input.baselineMeasurement.coordinate ??
      (input.baselineMeasurement['targetAntiCorrelationPeakMni'] as Coordinate3D | undefined);
    const upCoord =
      input.upgradedMeasurement.coordinate ??
      (input.upgradedMeasurement['targetAntiCorrelationPeakMni'] as Coordinate3D | undefined);

    if (baseCoord && upCoord) {
      const dx = baseCoord.x - upCoord.x;
      const dy = baseCoord.y - upCoord.y;
      const dz = baseCoord.z - upCoord.z;
      displacementMm = Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    const isMaterialShift = displacementMm > 2.0;

    // 2. Reliability shift
    const baseClass = input.baselineReliability.reliabilityClass;
    const upClass = input.upgradedReliability.reliabilityClass;
    const order = ['unreliable', 'low', 'moderate', 'high'];
    const baseIdx = order.indexOf(baseClass);
    const upIdx = order.indexOf(upClass);
    const isDegraded = upIdx < baseIdx;
    const isImproved = upIdx > baseIdx;

    // 3. Capability shifts
    const capabilityShifts: CapabilityShiftAnalysis[] = [];
    let qualificationRevoked = false;

    for (const baseCap of input.baselineCapabilities) {
      const upCap = input.upgradedCapabilities.find(
        c => c.capabilityCode === baseCap.capabilityCode,
      );
      const baseStatus = baseCap.qualification;
      const upStatus = upCap ? upCap.qualification : 'missing';
      const statusChanged = baseStatus !== upStatus;
      const revoked =
        (baseStatus === 'qualified' || baseStatus === 'qualified_with_limits') &&
        upStatus === 'not_qualified';

      if (revoked) {
        qualificationRevoked = true;
      }

      capabilityShifts.push({
        capabilityCode: baseCap.capabilityCode,
        baselineStatus: baseStatus,
        upgradedStatus: upStatus,
        statusChanged,
        isQualificationRevoked: revoked,
      });
    }

    const isClinicallyMaterial = isMaterialShift || isDegraded || qualificationRevoked;
    const changeClass =
      input.changeClass ??
      (isClinicallyMaterial ? 'measurement_model' : 'measurement_implementation');
    const requiresFormalReview = isClinicallyMaterial;

    const summaryNotes = isClinicallyMaterial
      ? `Material change detected: displacement ${displacementMm.toFixed(2)}mm, reliability shift ${baseClass}->${upClass}, revoked qualifications: ${qualificationRevoked}. Formal scientific impact review mandatory (§174, §192).`
      : `Non-material change: displacement ${displacementMm.toFixed(2)}mm within 2.0mm tolerance, reliability maintained (${baseClass}->${upClass}).`;

    return {
      comparisonId: `CMP-${input.caseId.slice(0, 8)}-${input.baselinePipelineVersionId}-${input.upgradedPipelineVersionId}`,
      caseId: input.caseId,
      baselinePipelineVersionId: input.baselinePipelineVersionId,
      upgradedPipelineVersionId: input.upgradedPipelineVersionId,
      modality: input.modality,
      spatialDisplacement: {
        baselineCoordinate: baseCoord,
        upgradedCoordinate: upCoord,
        displacementMm,
        isMaterialShift,
      },
      reliabilityShift: {
        baselineClass: baseClass,
        upgradedClass: upClass,
        isDegraded,
        isImproved,
      },
      capabilityShifts,
      isClinicallyMaterial,
      changeClass,
      requiresFormalReview,
      summaryNotes,
    };
  }
}
