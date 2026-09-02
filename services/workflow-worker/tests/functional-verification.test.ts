/**
 * Verification tests for BOLD preprocessing, Tedana, CD-1 Denoising, and Functional QC contracts
 * Conforms to MAGNIOM-Implementation & Validation Roadmap v1.0 Section 113
 */

import { describe, it, expect } from 'vitest';
import {
  MultiEchoRunMetadataSchema,
  ICAComponentMetricsSchema,
  RetainedTimeSummarySchema,
  FunctionalQCMetricsSchema,
  FunctionalQCEvaluationResultSchema,
  DenoisedTimeSeriesOutputSchema,
} from '@magniom/schemas';

describe('Sprint 9: BOLD + Denoising Contracts & Verification', () => {
  it('validates multi-echo run metadata schema with 4 echoes', () => {
    const validMultiEcho = {
      runIndex: 1,
      subjectId: 'sub-MGN7F3A92',
      taskName: 'rest',
      trSeconds: 1.5,
      flipAngleDeg: 70.0,
      echoes: [
        {
          echoIndex: 1,
          echoTimeMs: 12.0,
          relativePath: 'sub-MGN7F3A92/func/echo-1.nii.gz',
          sha256: 'a'.repeat(64),
          sizeBytes: 25000000,
        },
        {
          echoIndex: 2,
          echoTimeMs: 28.0,
          relativePath: 'sub-MGN7F3A92/func/echo-2.nii.gz',
          sha256: 'b'.repeat(64),
          sizeBytes: 25000000,
        },
        {
          echoIndex: 3,
          echoTimeMs: 44.0,
          relativePath: 'sub-MGN7F3A92/func/echo-3.nii.gz',
          sha256: 'c'.repeat(64),
          sizeBytes: 25000000,
        },
        {
          echoIndex: 4,
          echoTimeMs: 60.0,
          relativePath: 'sub-MGN7F3A92/func/echo-4.nii.gz',
          sha256: 'd'.repeat(64),
          sizeBytes: 25000000,
        },
      ],
      numVolumes: 600,
      spatialResolutionMm: [2.4, 2.4, 2.4] as [number, number, number],
      matrixSize: [88, 88, 64] as [number, number, number],
      fieldStrengthTesla: 3.0,
    };

    const parsed = MultiEchoRunMetadataSchema.parse(validMultiEcho);
    expect(parsed.echoes.length).toBe(4);
    expect(parsed.echoes[0].echoTimeMs).toBe(12.0);
    expect(parsed.numVolumes).toBe(600);
  });

  it('validates tedana ME-ICA component classification schema', () => {
    const validComponent = {
      componentId: 1,
      kappa: 45.2,
      rho: 8.4,
      varianceExplainedFraction: 0.052,
      classification: 'accepted',
      classificationReason: 'High Kappa (TE-dependent BOLD), Low Rho',
    };

    const parsed = ICAComponentMetricsSchema.parse(validComponent);
    expect(parsed.classification).toBe('accepted');
    expect(parsed.kappa).toBe(45.2);
  });

  it('validates retained time accounting schema', () => {
    const validRetainedTime = {
      acquiredSeconds: 900.0,
      acquiredMinutes: 15.0,
      nonSteadyStateRemovedSeconds: 6.0,
      nonSteadyStateRemovedMinutes: 0.1,
      motionCensoredSeconds: 36.0,
      motionCensoredMinutes: 0.6,
      finalRetainedSeconds: 858.0,
      finalRetainedMinutes: 14.3,
      percentageRetained: 95.33,
      totalVolumes: 600,
      nonSteadyStateVolumes: 4,
      censoredVolumes: 24,
      retainedVolumes: 572,
      shortSegmentsPrunedVolumes: 6,
      isAboveAbsoluteMinimum: true,
      isAboveRecommendedClinical: true,
    };

    const parsed = RetainedTimeSummarySchema.parse(validRetainedTime);
    expect(parsed.finalRetainedMinutes).toBe(14.3);
    expect(parsed.isAboveAbsoluteMinimum).toBe(true);
  });

  it('validates Q2 Functional QC evaluation result for pass and fail', () => {
    const passResult = {
      overallStatus: 'pass',
      runIndex: 1,
      metrics: {
        runIndex: 1,
        meanFdMm: 0.11,
        maxFdMm: 0.25,
        censoredVolumesFraction: 0.04,
        retainedMinutes: 14.3,
        tsnrPreDenoise: 55.0,
        tsnrPostDenoise: 82.0,
        tsnrGainRatio: 1.49,
        meanDvars: 21.5,
        tedanaComponentsTotal: 30,
        tedanaComponentsAccepted: 12,
        tedanaComponentsRejected: 18,
        tedanaAcceptedVarianceFraction: 0.65,
        t1wBoldCoregistrationDice: 0.942,
        ghostingRatio: 0.012,
        signalDropoutFractionDlpfc: 0.01,
        signalDropoutFractionSgacc: 0.03,
      },
      warnings: [],
      isPersonalisationQualified: true,
      limitationSummary: null,
    };

    const parsedPass = FunctionalQCEvaluationResultSchema.parse(passResult);
    expect(parsedPass.overallStatus).toBe('pass');
    expect(parsedPass.isPersonalisationQualified).toBe(true);

    const failResult = {
      overallStatus: 'fail',
      runIndex: 1,
      metrics: {
        ...passResult.metrics,
        meanFdMm: 0.38,
        censoredVolumesFraction: 0.65,
        retainedMinutes: 5.2,
      },
      warnings: [
        {
          code: 'Q2_EXCESSIVE_MOTION_CENSORING',
          message: 'Censoring 65% exceeds 30%',
          severity: 'critical',
          clinicalImpact: 'personalisation_invalid',
        },
      ],
      isPersonalisationQualified: false,
      limitationSummary: 'Severe head motion and insufficient retained time',
    };

    const parsedFail = FunctionalQCEvaluationResultSchema.parse(failResult);
    expect(parsedFail.overallStatus).toBe('fail');
    expect(parsedFail.isPersonalisationQualified).toBe(false);
  });

  it('validates CD-1 and SD-1 Denoised Time Series output contracts', () => {
    const validCd1 = {
      denoisingConfiguration: 'CD-1',
      runIndex: 1,
      subjectId: 'sub-MGN7F3A92',
      denoisedBoldPath: '/tmp/cd1_bold.nii.gz',
      denoisedBoldSha256: 'e'.repeat(64),
      nuisanceMatrixPath: '/tmp/nuisance.tsv',
      nuisanceMatrixSha256: 'f'.repeat(64),
      bandpassLowHz: 0.009,
      bandpassHighHz: 0.08,
      includesGsr: true,
      numRegressors: 33,
      motionRegressorExpansion: '24-parameter Volterra',
      tissueRegressors: ['WM_mean', 'WM_dt', 'CSF_mean', 'CSF_dt'],
      varianceExplainedByNuisance: 0.38,
      tsnrPreDenoise: 55.0,
      tsnrPostDenoise: 82.0,
      retainedTime: {
        acquiredSeconds: 900.0,
        acquiredMinutes: 15.0,
        nonSteadyStateRemovedSeconds: 6.0,
        nonSteadyStateRemovedMinutes: 0.1,
        motionCensoredSeconds: 36.0,
        motionCensoredMinutes: 0.6,
        finalRetainedSeconds: 858.0,
        finalRetainedMinutes: 14.3,
        percentageRetained: 95.33,
        totalVolumes: 600,
        nonSteadyStateVolumes: 4,
        censoredVolumes: 24,
        retainedVolumes: 572,
        shortSegmentsPrunedVolumes: 6,
        isAboveAbsoluteMinimum: true,
        isAboveRecommendedClinical: true,
      },
      censorMask: new Array(600).fill(true),
    };

    const parsedCd1 = DenoisedTimeSeriesOutputSchema.parse(validCd1);
    expect(parsedCd1.denoisingConfiguration).toBe('CD-1');
    expect(parsedCd1.includesGsr).toBe(true);
    expect(parsedCd1.numRegressors).toBe(33);
  });
});
