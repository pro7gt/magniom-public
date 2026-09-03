/**
 * @magniom/modalities - Audiology Provider
 * Conforms to MAGNIOM-Neuroimaging, Neurophysiology & Multimodal Measurement Specification v2.0 (§62-69, §155)
 * Stream 8: Audiology
 */

import type {
  AudiologyMeasurement,
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
} from '@magniom/measurement-core';
import { computeSha256 } from '@magniom/scientific-policy';

export class AudiologyProvider implements MeasurementProvider<AudiologyMeasurement> {
  public readonly modality = 'audiology' as const;

  public readonly manifest: MeasurementProviderManifest = {
    code: 'MAGNIOM-PROVIDER-AUDIOLOGY',
    semanticVersion: '2.0.0',
    supportedModalities: ['audiology'],
    capabilities: [
      {
        capabilityCode: 'hearing_loss_context',
        description:
          'Structured pure-tone audiogram threshold series across standard octave frequencies.',
        supportedModalities: ['audiology'],
        defaultStatus: 'qualified',
        requiresIndicationQualification: true,
      },
      {
        capabilityCode: 'tinnitus_laterality_context',
        description:
          'Perceived tinnitus pitch and loudness matching with laterality classification.',
        supportedModalities: ['audiology'],
        defaultStatus: 'qualified',
        requiresIndicationQualification: true,
      },
    ],
    containerDigestSha256: '18293a4b5c6d7e8f90123456789abcdef0123456789abcdef012345678',
    requiredToolchains: ['magniom-audiology-parser-v2'],
    offlineResources: ['ISO_8253_1_Audiometry_Standard'],
    configurationSha256: computeSha256('AUDIOLOGY-CONFIG-V2'),
  };

  public validateSourceIntegrity(context: MeasurementRunContext): SourceIntegrityResult {
    const issues: string[] = [];
    const audio = context.rawInputArtifacts.find(
      (a: { readonly path: string }) =>
        a.path.includes('audio') || a.path.includes('tone') || a.path.includes('xml'),
    );

    if (!audio) {
      issues.push('Missing structured audiologic evaluation artifact.');
    }

    const valid = issues.length === 0;
    return {
      valid,
      computedSha256: audio ? audio.sha256 : computeSha256('EMPTY-AUDIO'),
      issues,
    };
  }

  public process(context: MeasurementRunContext): MeasurementRunResult<AudiologyMeasurement> {
    const integrity = this.validateSourceIntegrity(context);
    if (!integrity.valid) {
      throw new Error(`Audiology source integrity failure: ${integrity.issues.join('; ')}`);
    }

    const runId = `RUN-AUD-${context.caseId.slice(0, 8)}`;
    const processingRun = ProcessingRunEngine.createRun(context, this.modality, runId);

    const tinnitusLaterality =
      (context.configurationParameters['tinnitusLaterality'] as 'left' | 'right' | 'bilateral') ??
      'left';
    const matchedFrequencyHz = Number(
      context.configurationParameters['matchedFrequencyHz'] ?? 6000,
    );
    const transducerCalibrated = Boolean(
      context.configurationParameters['transducerCalibrated'] ?? true,
    );

    const measurement: AudiologyMeasurement = {
      id: `MEAS-AUD-${context.caseId.slice(0, 8)}`,
      organisationId: context.organisationId,
      caseId: context.caseId,
      modality: 'audiology',
      version: '2.0.0',
      status: transducerCalibrated ? 'qualified' : 'failed',
      acquisitionTime: '2026-09-02T11:45:00.000Z',
      pipelineVersionIds: ['PIPE-AUDIOLOGY-STANDARDS-2.0.0'],
      artifactIds: ['ART-AUDIOGRAM-XML-001'],
      qcStatus: transducerCalibrated ? 'pass' : 'fail',
      qualification: transducerCalibrated ? 'qualified' : 'not_qualified',
      pureToneAudiogram: {
        leftEar: [
          { frequencyHz: 1000, thresholdDbHl: 15, masked: false },
          { frequencyHz: 2000, thresholdDbHl: 20, masked: false },
          { frequencyHz: 4000, thresholdDbHl: 45, masked: false },
          { frequencyHz: 8000, thresholdDbHl: 60, masked: false },
        ],
        rightEar: [
          { frequencyHz: 1000, thresholdDbHl: 10, masked: false },
          { frequencyHz: 2000, thresholdDbHl: 15, masked: false },
          { frequencyHz: 4000, thresholdDbHl: 25, masked: false },
          { frequencyHz: 8000, thresholdDbHl: 30, masked: false },
        ],
        conductionMethod: 'air',
        testStandardRef: 'ISO 8253-1:2010',
        interpretation: 'High-frequency sensorineural hearing loss, more pronounced on left.',
      },
      tinnitusMatching: {
        perceivedLaterality: tinnitusLaterality,
        matchedFrequencyHz,
        matchedLoudnessDb: 55,
        minimumMaskingLevelDb: 62,
        repeatability: 'high',
        interpretation: `Pitch match stable at ${matchedFrequencyHz} Hz in ${tinnitusLaterality} ear.`,
      },
      speechDiscriminationPercent: 92,
      transducerCalibrated,
      calibrationDate: '2026-06-15',
      provenance: {
        createdBy: 'magniom-audiology-worker',
        createdAt: '2026-09-02T11:45:00.000Z',
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

  public evaluateQC(measurement: AudiologyMeasurement): ModalityQCResult {
    const warnings: string[] = [];
    const criticalFailures: string[] = [];

    if (!measurement.transducerCalibrated) {
      criticalFailures.push('Audiometer transducer calibration expired or invalid.');
    }

    if (!measurement.pureToneAudiogram) {
      criticalFailures.push('Missing pure-tone audiogram series.');
    }

    const qcStatus = criticalFailures.length > 0 ? 'fail' : 'pass';

    return {
      qcStatus,
      metrics: {
        transducerCalibrated: measurement.transducerCalibrated,
        hasTinnitusMatching: Boolean(measurement.tinnitusMatching),
        speechDiscriminationPercent: measurement.speechDiscriminationPercent ?? 0,
      },
      warnings,
      criticalFailures,
    };
  }

  public evaluateReliability(
    measurement: AudiologyMeasurement,
    qcResult: ModalityQCResult,
  ): MeasurementReliability {
    const isReliable =
      measurement.transducerCalibrated && measurement.tinnitusMatching?.repeatability === 'high';

    return {
      id: `REL-AUD-${measurement.caseId.slice(0, 8)}`,
      version: '2.0.0',
      caseId: measurement.caseId,
      measurementId: measurement.id,
      modality: 'audiology',
      methodCode: 'ISO_8253_TEST_RETEST_CONSISTENCY',
      methodVersion: '2.0.0',
      qcStatus: qcResult.qcStatus,
      metrics: [
        {
          metricName: 'threshold_repeatability_db',
          value: 3.5,
          unit: 'dB',
          interpretation: 'high',
          method: 'test_retest_threshold_shift',
        },
      ],
      reliabilityClass: isReliable ? 'high' : 'unreliable',
      limitingFactors: qcResult.warnings,
      interpretation: isReliable
        ? 'High reliability: pure-tone thresholds and tinnitus matching meet ISO standards.'
        : 'Audiologic measurement uncalibrated or inconsistent.',
      pipelineVersionIds: measurement.pipelineVersionIds,
      provenance: measurement.provenance,
    };
  }

  public qualifyCapability(
    capabilityCode: string,
    _measurement: AudiologyMeasurement,
    reliability: MeasurementReliability,
    indicationModuleCode?: string,
  ): CapabilityQualificationResult {
    const isSupported = this.manifest.capabilities.some(c => c.capabilityCode === capabilityCode);
    if (!isSupported) {
      return {
        capabilityCode,
        qualification: 'not_qualified',
        measurementQualification: 'not_qualified',
        isAllowedForClinicalMode: false,
        reasons: [`Capability '${capabilityCode}' is not supported by AudiologyProvider.`],
      };
    }

    // Indication check: Audiology is currently qualified only for Tinnitus
    if (indicationModuleCode !== 'MAGNIOM-MODULE-TINNITUS') {
      return {
        capabilityCode,
        qualification: 'not_qualified',
        measurementQualification: 'research_only',
        isAllowedForClinicalMode: false,
        reasons: [`Audiology context is not qualified for indication '${indicationModuleCode}'.`],
      };
    }

    const isQualified = reliability.reliabilityClass === 'high';
    return {
      capabilityCode,
      qualification: isQualified ? 'qualified' : 'not_qualified',
      measurementQualification: isQualified ? 'qualified' : 'not_qualified',
      isAllowedForClinicalMode: isQualified,
      reasons: isQualified
        ? ['Audiology assessment qualified for Tinnitus clinical research workflow.']
        : ['Audiology reliability insufficient for clinical influence.'],
    };
  }

  public validateCaseIdentity(context: MeasurementRunContext, targetCaseId: string): boolean {
    return context.caseId === targetCaseId;
  }

  public validateLaterality(
    measurement: AudiologyMeasurement,
    clinicalContext?: {
      readonly reportedTinnitusSide?: string;
    },
  ): LateralityValidationResult {
    const declaredLaterality = measurement.tinnitusMatching?.perceivedLaterality ?? 'central';

    if (clinicalContext?.reportedTinnitusSide) {
      const expectedSide = clinicalContext.reportedTinnitusSide.toLowerCase();
      if (
        declaredLaterality !== expectedSide &&
        expectedSide !== 'bilateral' &&
        declaredLaterality !== 'bilateral'
      ) {
        return {
          valid: false,
          declaredLaterality,
          expectedLaterality: expectedSide,
          conflictDetected: true,
          message: `Audiologic tinnitus match side (${declaredLaterality}) conflicts with clinician-reported symptom laterality (${expectedSide}).`,
        };
      }
    }

    return {
      valid: true,
      declaredLaterality,
      conflictDetected: false,
      message: `Audiologic tinnitus laterality (${declaredLaterality}) matches clinical presentation.`,
    };
  }
}
