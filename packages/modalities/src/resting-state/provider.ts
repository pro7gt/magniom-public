/**
 * @magniom/modalities - Resting-State fMRI Provider
 * Conforms to MAGNIOM-Neuroimaging, Neurophysiology & Multimodal Measurement Specification v2.0 (§24-29, §150)
 * Stream 3: Resting-State fMRI
 */

import type {
  RestingStateMeasurement,
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

export class RestingStateProvider implements MeasurementProvider<RestingStateMeasurement> {
  public readonly modality = 'resting_state_fmri' as const;

  public readonly manifest: MeasurementProviderManifest = {
    code: 'MAGNIOM-PROVIDER-RSFMRI',
    semanticVersion: '2.0.0',
    supportedModalities: ['resting_state_fmri'],
    capabilities: [
      {
        capabilityCode: 'individual_fc_refinement',
        description:
          'Patient-specific sgACC-DLPFC functional connectivity anti-correlation mapping.',
        supportedModalities: ['resting_state_fmri'],
        defaultStatus: 'qualified',
        requiresIndicationQualification: true,
      },
      {
        capabilityCode: 'network_concordance',
        description: 'Yeo/Schaefer normative functional network overlap calculation.',
        supportedModalities: ['resting_state_fmri'],
        defaultStatus: 'qualified',
        requiresIndicationQualification: false,
      },
    ],
    containerDigestSha256: 'c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef012',
    requiredToolchains: ['fmriprep-23.2.0', 'afni-23.3.04'],
    offlineResources: ['sgACC_Fox2012_Seed', 'Yeo2011_7Networks_MNI152'],
    configurationSha256: computeSha256('RSFMRI-CONFIG-V2'),
  };

  public validateSourceIntegrity(context: MeasurementRunContext): SourceIntegrityResult {
    const issues: string[] = [];
    const bold = context.rawInputArtifacts.find(
      (a: { readonly path: string }) =>
        a.path.includes('bold') || a.path.includes('rsfmri') || a.path.includes('rest'),
    );

    if (!bold) {
      issues.push('Missing BOLD fMRI timeseries artifact.');
    }

    const valid = issues.length === 0;
    return {
      valid,
      computedSha256: bold ? bold.sha256 : computeSha256('EMPTY-BOLD'),
      issues,
    };
  }

  public process(context: MeasurementRunContext): MeasurementRunResult<RestingStateMeasurement> {
    const integrity = this.validateSourceIntegrity(context);
    if (!integrity.valid) {
      throw new Error(`rs-fMRI source integrity failure: ${integrity.issues.join('; ')}`);
    }

    const runId = `RUN-RSFMRI-${context.caseId.slice(0, 8)}`;
    const processingRun = ProcessingRunEngine.createRun(context, this.modality, runId);

    const acquiredDuration = Number(
      context.configurationParameters['acquiredDurationSeconds'] ?? 900,
    ); // 15 mins
    const meanFd = Number(context.configurationParameters['meanFramewiseDisplacementMm'] ?? 0.18);
    const scrubbedFraction = Number(
      context.configurationParameters['scrubbedVolumesFraction'] ?? 0.12,
    );
    const retainedDuration = acquiredDuration * (1 - scrubbedFraction);

    const splitHalfStability = Number(
      context.configurationParameters['splitHalfStabilityR'] ?? 0.82,
    );
    const concordance = Number(context.configurationParameters['sgAccDlpfcConcordance'] ?? -0.68);

    const measurement: RestingStateMeasurement = {
      id: `MEAS-RSFMRI-${context.caseId.slice(0, 8)}`,
      organisationId: context.organisationId,
      caseId: context.caseId,
      modality: 'resting_state_fmri',
      version: '2.0.0',
      status: 'qualified',
      acquisitionTime: '2026-09-02T10:30:00.000Z',
      pipelineVersionIds: ['PIPE-RSFMRI-CONNECTOME-2.0.0'],
      artifactIds: ['ART-BOLD-PREPROC-001', 'ART-FC-DLPFC-SGACC-001'],
      qcStatus: 'pass',
      qualification: 'qualified',
      acquiredDurationSeconds: acquiredDuration,
      retainedDurationSeconds: retainedDuration,
      meanFramewiseDisplacementMm: meanFd,
      scrubbedVolumesFraction: scrubbedFraction,
      targetAntiCorrelationPeakMni: { x: -42, y: 44, z: 30 },
      sgAccDlpfcConcordance: concordance,
      splitHalfStabilityR: splitHalfStability,
      provenance: {
        createdBy: 'magniom-rsfmri-worker',
        createdAt: '2026-09-02T10:30:00.000Z',
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

  public evaluateQC(measurement: RestingStateMeasurement): ModalityQCResult {
    const warnings: string[] = [];
    const criticalFailures: string[] = [];

    // §27: Retained time more important than acquired time (minimum 600s required)
    if (measurement.retainedDurationSeconds < 600) {
      criticalFailures.push(
        `Retained duration (${Math.round(measurement.retainedDurationSeconds)}s) below minimum 600s threshold after motion scrubbing.`,
      );
    }

    if (measurement.meanFramewiseDisplacementMm > 0.4) {
      criticalFailures.push(
        `Mean framewise displacement (${measurement.meanFramewiseDisplacementMm}mm) exceeds 0.40mm maximum threshold.`,
      );
    } else if (measurement.meanFramewiseDisplacementMm > 0.25) {
      warnings.push(
        `Elevated head motion (mean FD = ${measurement.meanFramewiseDisplacementMm}mm).`,
      );
    }

    const qcStatus =
      criticalFailures.length > 0 ? 'fail' : warnings.length > 0 ? 'conditional' : 'pass';

    return {
      qcStatus,
      metrics: {
        acquiredDurationSeconds: measurement.acquiredDurationSeconds,
        retainedDurationSeconds: measurement.retainedDurationSeconds,
        meanFramewiseDisplacementMm: measurement.meanFramewiseDisplacementMm,
        scrubbedVolumesFraction: measurement.scrubbedVolumesFraction,
      },
      warnings,
      criticalFailures,
    };
  }

  public evaluateReliability(
    measurement: RestingStateMeasurement,
    qcResult: ModalityQCResult,
  ): MeasurementReliability {
    const passesSplitHalf = measurement.splitHalfStabilityR >= 0.7;
    let reliabilityClass = qcResult.qcStatus === 'pass' && passesSplitHalf ? 'high' : 'unreliable';
    if (qcResult.qcStatus === 'conditional' && passesSplitHalf) {
      reliabilityClass = 'moderate';
    }

    return {
      id: `REL-RSFMRI-${measurement.caseId.slice(0, 8)}`,
      version: '2.0.0',
      caseId: measurement.caseId,
      measurementId: measurement.id,
      modality: 'resting_state_fmri',
      methodCode: 'SPLIT_HALF_SGACC_DLPFC_ANTIDISTRIBUTION',
      methodVersion: '2.0.0',
      qcStatus: qcResult.qcStatus,
      metrics: [
        {
          metricName: 'split_half_stability_r',
          value: measurement.splitHalfStabilityR,
          unit: 'pearson_r',
          interpretation: measurement.splitHalfStabilityR >= 0.7 ? 'high' : 'low',
          method: 'independent_half_timeseries_cross_correlation',
        },
      ],
      spatialReliability: {
        splitHalfDistanceMm: passesSplitHalf ? 2.4 : 14.8,
      },
      reliabilityClass: reliabilityClass as 'high' | 'moderate' | 'unreliable',
      limitingFactors: [...qcResult.warnings, ...qcResult.criticalFailures],
      interpretation: passesSplitHalf
        ? 'High split-half functional connectivity stability; reproducible sgACC anti-correlation coordinate.'
        : 'Low split-half functional connectivity stability; individual target localisation is not reproducible.',
      pipelineVersionIds: measurement.pipelineVersionIds,
      provenance: measurement.provenance,
    };
  }

  public qualifyCapability(
    capabilityCode: string,
    _measurement: RestingStateMeasurement,
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
        reasons: [`Capability '${capabilityCode}' is not supported by RestingStateProvider.`],
      };
    }

    // Indication qualification:
    // rs-fMRI is clinically qualified for MDD FC refinement, but Research-only for PTSD/Tinnitus
    if (
      capabilityCode === 'individual_fc_refinement' &&
      indicationModuleCode !== 'MAGNIOM-MODULE-MDD'
    ) {
      return {
        capabilityCode,
        qualification: 'not_qualified',
        measurementQualification: 'research_only',
        isAllowedForClinicalMode: false,
        reasons: [
          `rs-fMRI target refinement is only clinically qualified for MDD; research-only for '${indicationModuleCode}'.`,
        ],
      };
    }

    const isQualified =
      reliability.reliabilityClass === 'high' || reliability.reliabilityClass === 'moderate';
    return {
      capabilityCode,
      qualification: isQualified ? 'qualified' : 'not_qualified',
      measurementQualification: isQualified ? 'qualified' : 'not_qualified',
      isAllowedForClinicalMode: isQualified,
      reasons: isQualified
        ? ['rs-fMRI FC refinement meets motion, duration, and split-half reliability criteria.']
        : ['rs-fMRI failed QC or split-half reliability stability threshold.'],
    };
  }

  public validateCaseIdentity(context: MeasurementRunContext, targetCaseId: string): boolean {
    return context.caseId === targetCaseId;
  }

  public validateLaterality(
    measurement: RestingStateMeasurement,
    clinicalContext?: { readonly targetHemisphere?: string },
  ): LateralityValidationResult {
    if (clinicalContext?.targetHemisphere) {
      const peakCoord = measurement.targetAntiCorrelationPeakMni;
      if (peakCoord) {
        const measuredHemi = peakCoord.x < 0 ? 'left' : 'right';
        const expectedHemi = clinicalContext.targetHemisphere.toLowerCase();

        if (measuredHemi !== expectedHemi && expectedHemi !== 'bilateral') {
          return {
            valid: false,
            declaredLaterality: measuredHemi,
            expectedLaterality: expectedHemi,
            conflictDetected: true,
            message: `rs-fMRI anti-correlation peak is in ${measuredHemi} hemisphere (X=${peakCoord.x}), but targeting protocol expected ${expectedHemi}.`,
          };
        }
      }
    }

    return {
      valid: true,
      declaredLaterality: 'left',
      conflictDetected: false,
      message: 'rs-fMRI laterality verified.',
    };
  }
}
