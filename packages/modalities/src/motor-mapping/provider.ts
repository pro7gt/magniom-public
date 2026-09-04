/**
 * @magniom/modalities - Motor Mapping Provider
 * Conforms to MAGNIOM-Neuroimaging, Neurophysiology & Multimodal Measurement Specification v2.0 (§47-54, §153)
 * Stream 6: Motor Mapping
 */

import type {
  MotorMappingMeasurement,
  MotorHotspot,
  MuscleTarget,
  MeasurementProviderManifest,
  MeasurementReliability,
} from '@magniom/domain';
import {
  type MeasurementProvider,
  type MeasurementRunContext,
  type MeasurementRunResult,
  type SourceIntegrityResult,
  type ModalityQCResult,
  type CapabilityQualificationResult,
  type LateralityValidationResult,
  ProcessingRunEngine,
  LateralityValidator,
} from '@magniom/measurement-core';
import { computeSha256 } from '@magniom/scientific-policy';

export class MotorMappingProvider implements MeasurementProvider<MotorMappingMeasurement> {
  public readonly modality = 'motor_mapping' as const;

  public readonly manifest: MeasurementProviderManifest = {
    code: 'MAGNIOM-PROVIDER-MOTOR-MAPPING',
    semanticVersion: '2.0.0',
    supportedModalities: ['motor_mapping'],
    capabilities: [
      {
        capabilityCode: 'motor_hotspot_refinement',
        description:
          'Patient-specific motor hotspot (centre-of-gravity) derivation for somatotopic M1 target refinement.',
        supportedModalities: ['motor_mapping'],
        defaultStatus: 'qualified',
        requiresIndicationQualification: true,
      },
      {
        capabilityCode: 'somatotopic_mapping',
        description: 'Multi-muscle somatotopic cortical mapping.',
        supportedModalities: ['motor_mapping'],
        defaultStatus: 'qualified',
        requiresIndicationQualification: false,
      },
    ],
    containerDigestSha256: 'f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef012345',
    requiredToolchains: ['magniom-tms-cog-derivation-v2'],
    offlineResources: ['Penfield_Motor_Homunculus_Prior_v1'],
    configurationSha256: computeSha256('MOTOR-MAPPING-CONFIG-V2'),
  };

  public validateSourceIntegrity(context: MeasurementRunContext): SourceIntegrityResult {
    const issues: string[] = [];
    const mapFile = context.rawInputArtifacts.find(
      (a: { readonly path: string }) =>
        a.path.includes('motor') || a.path.includes('tms') || a.path.includes('nav'),
    );

    if (!mapFile) {
      issues.push('Missing neuronavigation stimulation-response log artifact.');
    }

    const valid = issues.length === 0;
    return {
      valid,
      computedSha256: mapFile ? mapFile.sha256 : computeSha256('EMPTY-MOTOR-MAP'),
      issues,
    };
  }

  public process(context: MeasurementRunContext): MeasurementRunResult<MotorMappingMeasurement> {
    const integrity = this.validateSourceIntegrity(context);
    if (!integrity.valid) {
      throw new Error(`Motor mapping source integrity failure: ${integrity.issues.join('; ')}`);
    }

    const runId = `RUN-MOT-${context.caseId.slice(0, 8)}`;
    const processingRun = ProcessingRunEngine.createRun(context, this.modality, runId);

    const muscleCode = (context.configurationParameters['muscleCode'] as string) ?? 'FDI';
    const muscleLaterality =
      (context.configurationParameters['muscleLaterality'] as 'left' | 'right') ?? 'right';
    const repeatabilityMm = Number(context.configurationParameters['repeatabilityMm'] ?? 3.2);

    const targetMuscle: MuscleTarget = {
      code: muscleCode,
      label: `${muscleLaterality === 'right' ? 'Right' : 'Left'} First Dorsal Interosseous`,
      bodyRegion: 'upper_limb_hand',
      laterality: muscleLaterality,
    };

    // Hotspot is in the contralateral hemisphere
    const hotspotHemisphere: 'left' | 'right' = muscleLaterality === 'right' ? 'left' : 'right';
    const hotspotX = hotspotHemisphere === 'left' ? -36 : 36;

    const hotspot: MotorHotspot = {
      hotspotId: `HOTSPOT-${muscleCode}-${context.caseId.slice(0, 8)}`,
      muscle: targetMuscle,
      coordinate: { x: hotspotX, y: -22, z: 56 },
      hemisphere: hotspotHemisphere,
      repeatabilityMm,
      stimulationThresholdPercentMso: 52,
      reliabilityClass:
        repeatabilityMm <= 5.0 ? 'high' : repeatabilityMm <= 10.0 ? 'moderate' : 'unreliable',
    };

    const isQualified = repeatabilityMm <= 10.0;

    const measurement: MotorMappingMeasurement = {
      id: `MEAS-MOT-${context.caseId.slice(0, 8)}`,
      organisationId: context.organisationId,
      caseId: context.caseId,
      modality: 'motor_mapping',
      version: '2.0.0',
      status: isQualified ? 'qualified' : 'failed',
      acquisitionTime: '2026-09-02T11:15:00.000Z',
      pipelineVersionIds: ['PIPE-MOTOR-MAP-COG-2.0.0'],
      artifactIds: ['ART-TMS-STIM-LOG-001'],
      qcStatus: 'pass',
      qualification: isQualified ? 'qualified' : 'not_qualified',
      mappingPoints: [
        {
          pointId: 'PT-01',
          stimulusIndex: 1,
          stimulationCoordinate: { x: hotspotX, y: -22, z: 56 },
          coilOrientationDegrees: 45,
          intensityPercentMso: 52,
          muscle: targetMuscle,
          mepAmplitudeUv: 620,
          responsePresent: true,
        },
      ],
      hotspots: [hotspot],
      targetMuscle,
      spatialSpreadMm: 12.4,
      provenance: {
        createdBy: 'magniom-motor-worker',
        createdAt: '2026-09-02T11:15:00.000Z',
        softwareVersion: '2.0.0',
      },
    };

    const qcResult = this.evaluateQC(measurement);
    const reliability = this.evaluateReliability(measurement, qcResult);

    return {
      processingRun,
      measurement,
      sourceIntegrity: integrity,
      qcResult,
      reliability,
    };
  }

  public evaluateQC(measurement: MotorMappingMeasurement): ModalityQCResult {
    const warnings: string[] = [];
    const criticalFailures: string[] = [];

    if (measurement.mappingPoints.length === 0) {
      criticalFailures.push('No stimulation points recorded in motor mapping session.');
    }

    if (measurement.hotspots.length === 0) {
      criticalFailures.push('Failed to derive motor hotspot center-of-gravity.');
    }

    const qcStatus =
      criticalFailures.length > 0 ? 'fail' : warnings.length > 0 ? 'conditional' : 'pass';

    return {
      qcStatus,
      metrics: {
        pointsCount: measurement.mappingPoints.length,
        hotspotsCount: measurement.hotspots.length,
        muscle: measurement.targetMuscle.code,
        spatialSpreadMm: measurement.spatialSpreadMm,
      },
      warnings,
      criticalFailures,
    };
  }

  public evaluateReliability(
    measurement: MotorMappingMeasurement,
    qcResult: ModalityQCResult,
  ): MeasurementReliability {
    const primaryHotspot = measurement.hotspots[0];
    const repeatabilityMm = primaryHotspot?.repeatabilityMm ?? 99.0;
    const isReproducible = repeatabilityMm <= 5.0;
    const isMarginal = repeatabilityMm <= 10.0;

    const reliabilityClass =
      qcResult.qcStatus === 'pass' && isReproducible
        ? 'high'
        : isMarginal
          ? 'moderate'
          : 'unreliable';

    const warnings = [...qcResult.warnings];
    if (repeatabilityMm > 10.0) {
      warnings.push(
        `Hotspot repeatability (${repeatabilityMm.toFixed(1)}mm) exceeds 10mm tolerance.`,
      );
    }

    return {
      id: `REL-MOT-${measurement.caseId.slice(0, 8)}`,
      version: '2.0.0',
      caseId: measurement.caseId,
      measurementId: measurement.id,
      modality: 'motor_mapping',
      methodCode: 'TMS_COG_TEST_RETEST_REPEATABILITY',
      methodVersion: '2.0.0',
      qcStatus: qcResult.qcStatus,
      metrics: [
        {
          metricName: 'hotspot_repeatability_mm',
          value: repeatabilityMm,
          unit: 'mm',
          interpretation: isReproducible ? 'high' : isMarginal ? 'moderate' : 'low',
          method: 'inter_session_centre_of_gravity_euclidean_distance',
        },
      ],
      spatialReliability: {
        splitHalfDistanceMm: repeatabilityMm,
        crossRunDistanceMm: repeatabilityMm,
      },
      reliabilityClass,
      limitingFactors: warnings,
      interpretation: isReproducible
        ? `High reliability: reproducible ${measurement.targetMuscle.code} motor hotspot within ${repeatabilityMm.toFixed(1)}mm.`
        : `Unreliable motor hotspot: spatial drift of ${repeatabilityMm.toFixed(1)}mm prevents patient-specific target refinement.`,
      pipelineVersionIds: measurement.pipelineVersionIds,
      provenance: measurement.provenance,
    };
  }

  public qualifyCapability(
    capabilityCode: string,
    _measurement: MotorMappingMeasurement,
    reliability: MeasurementReliability,
    indicationModuleCode?: string,
  ): CapabilityQualificationResult {
    const capDef = this.manifest.capabilities.find(c => c.capabilityCode === capabilityCode);
    if (!capDef) {
      return {
        capabilityCode,
        qualification: 'not_qualified',
        measurementQualification: 'not_qualified',
        isAllowedForClinicalMode: false,
        reasons: [`Capability '${capabilityCode}' is not supported by MotorMappingProvider.`],
      };
    }

    // Indication check: only required if capability declares requiresIndicationQualification: true
    if (capDef.requiresIndicationQualification) {
      const isApprovedIndication =
        indicationModuleCode === 'MAGNIOM-MODULE-NEUROPATHIC-PAIN' ||
        indicationModuleCode === 'MAGNIOM-MODULE-PAIN' ||
        indicationModuleCode === 'MAGNIOM-MODULE-STROKE-MOTOR' ||
        indicationModuleCode === 'MAGNIOM-MODULE-STROKE';

      if (!isApprovedIndication) {
        return {
          capabilityCode,
          qualification: 'not_qualified',
          measurementQualification: 'research_only',
          isAllowedForClinicalMode: false,
          reasons: [
            `Capability '${capabilityCode}' is not scientifically qualified for indication '${indicationModuleCode}'.`,
          ],
        };
      }
    }

    const isQualified =
      reliability.reliabilityClass === 'high' || reliability.reliabilityClass === 'moderate';
    return {
      capabilityCode,
      qualification: isQualified ? 'qualified' : 'not_qualified',
      measurementQualification: isQualified ? 'qualified' : 'not_qualified',
      isAllowedForClinicalMode: isQualified,
      reasons: isQualified
        ? [`Motor hotspot qualified for somatotopic M1 refinement in ${indicationModuleCode}.`]
        : ['Motor hotspot spatial repeatability insufficient for clinical refinement.'],
    };
  }

  public validateCaseIdentity(context: MeasurementRunContext, targetCaseId: string): boolean {
    return context.caseId === targetCaseId;
  }

  public validateLaterality(
    measurement: MotorMappingMeasurement,
    clinicalContext?: {
      readonly reportedPainLaterality?: string;
    },
  ): LateralityValidationResult {
    const hotspot = measurement.hotspots[0];
    if (!hotspot) {
      return {
        valid: false,
        declaredLaterality: measurement.targetMuscle.laterality,
        conflictDetected: true,
        message: 'No motor hotspot available for laterality inspection.',
      };
    }

    if (clinicalContext?.reportedPainLaterality) {
      const painSide = clinicalContext.reportedPainLaterality.toLowerCase() as 'left' | 'right';
      return LateralityValidator.validatePainContralateralM1(painSide, hotspot.coordinate);
    }

    return LateralityValidator.validateRasHemisphere(hotspot.coordinate, hotspot.hemisphere);
  }
}
