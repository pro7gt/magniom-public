/**
 * Golden Multimodal Cases and Capability Validation Separation Test Suite
 * Conforms to MAGNIOM-Implementation & Multi-Indication Validation Roadmap v2.0 (Phase 3)
 * and MAGNIOM-Neuroimaging, Neurophysiology & Multimodal Measurement Specification v2.0 (§169)
 */

import { describe, it, expect } from 'vitest';
import { GOLDEN_MULTIMODAL_CASES } from '../src/golden-cases/index.js';
import { MotorMappingProvider } from '@magniom/modalities';
import { computeSha256 } from '@magniom/scientific-policy';

describe('Phase 3 Golden Multimodal Cases & Capability Validation Separation', () => {
  it('MM-01: MDD with qualified rs-fMRI enables sgACC anti-correlated target candidate', () => {
    const mm01 = GOLDEN_MULTIMODAL_CASES['MM-01']!;
    const bundles = mm01.buildBundles();

    expect(bundles.measurementBundle.qualificationStatus).toBe('qualified');
    expect(bundles.reliabilityBundle.overallQualification).toBe('qualified');
    expect(mm01.expectedOutcome.targetRefinementPermitted).toBe(true);
  });

  it('MM-02: MDD with failed rs-fMRI motion QC falls back to evidence baseline target', () => {
    const mm02 = GOLDEN_MULTIMODAL_CASES['MM-02']!;
    const bundles = mm02.buildBundles();

    expect(bundles.measurementBundle.qualificationStatus).toBe('insufficient');
    expect(bundles.reliabilityBundle.overallQualification).toBe('not_qualified');
    expect(mm02.expectedOutcome.targetRefinementPermitted).toBe(false);
  });

  it('MM-03: Stroke with large ischemic lesion generates LesionContext and identifies intact cortex', () => {
    const mm03 = GOLDEN_MULTIMODAL_CASES['MM-03']!;
    const bundles = mm03.buildBundles();

    expect(bundles.measurementBundle.qualificationStatus).toBe('qualified');
    expect(bundles.reliabilityBundle.overallQualification).toBe('qualified');
    expect(mm03.expectedOutcome.targetRefinementPermitted).toBe(true);
  });

  it('MM-04: Stroke Motor with destroyed M1 hand knob blocks ipsilesional target candidate', () => {
    const mm04 = GOLDEN_MULTIMODAL_CASES['MM-04']!;
    const bundles = mm04.buildBundles();

    const lesionMeas = bundles.measurementBundle.measurements[0];
    expect(lesionMeas).toBeDefined();
    expect(bundles.measurementBundle.qualificationStatus).toBe('qualified');
    expect(mm04.expectedOutcome.targetRefinementPermitted).toBe(false);
  });

  it('MM-05: Neuropathic Pain with reproducible motor hotspot qualifies somatotopic M1 target', () => {
    const mm05 = GOLDEN_MULTIMODAL_CASES['MM-05']!;
    const bundles = mm05.buildBundles();

    expect(bundles.measurementBundle.qualificationStatus).toBe('qualified');
    expect(bundles.reliabilityBundle.overallQualification).toBe('qualified');
    expect(mm05.expectedOutcome.targetRefinementPermitted).toBe(true);
  });

  it('MM-06: Neuropathic Pain with unstable motor hotspot falls back to anatomical baseline', () => {
    const mm06 = GOLDEN_MULTIMODAL_CASES['MM-06']!;
    const bundles = mm06.buildBundles();

    expect(bundles.measurementBundle.qualificationStatus).toBe('insufficient');
    expect(bundles.reliabilityBundle.overallQualification).toBe('not_qualified');
    expect(mm06.expectedOutcome.targetRefinementPermitted).toBe(false);
  });

  it('MM-07: Stroke Aphasia with successful task compliance qualifies task fMRI activation', () => {
    const mm07 = GOLDEN_MULTIMODAL_CASES['MM-07']!;
    const bundles = mm07.buildBundles();

    expect(bundles.measurementBundle.qualificationStatus).toBe('qualified');
    expect(bundles.reliabilityBundle.overallQualification).toBe('qualified');
    expect(mm07.expectedOutcome.targetRefinementPermitted).toBe(true);
  });

  it('MM-08: Stroke Aphasia task fMRI behavioral failure does NOT infer absent cortex', () => {
    const mm08 = GOLDEN_MULTIMODAL_CASES['MM-08']!;
    const bundles = mm08.buildBundles();

    expect(bundles.measurementBundle.qualificationStatus).toBe('insufficient');
    expect(bundles.reliabilityBundle.overallQualification).toBe('not_qualified');
    expect(mm08.expectedOutcome.targetRefinementPermitted).toBe(false);
  });

  it('MM-09: TBI with skull defect models boundary conditions for E-field workflow', () => {
    const mm09 = GOLDEN_MULTIMODAL_CASES['MM-09']!;
    const bundles = mm09.buildBundles();

    expect(bundles.measurementBundle.qualificationStatus).toBe('qualified');
    expect(bundles.reliabilityBundle.overallQualification).toBe('qualified');
    expect(bundles.measurementBundle.measurements.length).toBe(2);
    expect(mm09.expectedOutcome.targetRefinementPermitted).toBe(true);
  });

  it('MM-10: DWI tractography instability blocks structural connectivity target refinement', () => {
    const mm10 = GOLDEN_MULTIMODAL_CASES['MM-10']!;
    const bundles = mm10.buildBundles();

    expect(bundles.measurementBundle.qualificationStatus).toBe('insufficient');
    expect(bundles.reliabilityBundle.overallQualification).toBe('not_qualified');
    expect(mm10.expectedOutcome.targetRefinementPermitted).toBe(false);
  });

  it('MM-11: Tinnitus with complete audiometry qualifies research measurement bundle', () => {
    const mm11 = GOLDEN_MULTIMODAL_CASES['MM-11']!;
    const bundles = mm11.buildBundles();

    expect(bundles.measurementBundle.qualificationStatus).toBe('qualified');
    expect(bundles.reliabilityBundle.overallQualification).toBe('qualified');
    expect(mm11.expectedOutcome.targetRefinementPermitted).toBe(true);
  });

  it('MM-12: Tinnitus pitch matching does NOT autonomously generate tonotopic cortical target without EvidencePath', () => {
    const mm012 = GOLDEN_MULTIMODAL_CASES['MM-12']!;
    const bundles = mm012.buildBundles();

    expect(bundles.measurementBundle.qualificationStatus).toBe('qualified');
    expect(bundles.reliabilityBundle.overallQualification).toBe('qualified');
    expect(mm012.expectedOutcome.targetRefinementPermitted).toBe(false);
  });

  it('MANDATORY TENET: Capability Validation is strictly separated from Pipeline Validation', () => {
    // Example from Roadmap Phase 3 & Spec:
    // A motor-mapping implementation may be technically validated for coordinate recording,
    // without yet being scientifically qualified for stroke target refinement.
    const motorProvider = new MotorMappingProvider();
    const caseId = '00000000-0000-0000-0000-000000000099';
    const context = {
      caseId,
      organisationId: '00000000-0000-0000-0000-000000000000',
      rawInputArtifacts: [
        { path: 'motor_log.xml', content: 'NAV', sha256: computeSha256('NAV-99') },
      ],
      pipelineVersionId: 'PIPE-MOTOR-MAP-2.0.0',
      configurationParameters: {
        muscleCode: 'FDI',
        muscleLaterality: 'right',
        repeatabilityMm: 2.5,
      },
    };

    // 1. Pipeline execution succeeds technically
    const runResult = motorProvider.process(context);
    expect(runResult.processingRun.status).toBe('succeeded');
    expect(runResult.measurement.qcStatus).toBe('pass');

    // 2. Capability qualification for general coordinate recording / somatotopic mapping:
    const generalCoordQual = motorProvider.qualifyCapability(
      'somatotopic_mapping',
      runResult.measurement,
      runResult.reliability,
    );
    expect(generalCoordQual.qualification).toBe('qualified');
    expect(generalCoordQual.isAllowedForClinicalMode).toBe(true);

    // 3. BUT capability qualification for an unapproved indication module:
    // e.g. Tinnitus or unvalidated indication attempting to use motor hotspot refinement
    const unapprovedQual = motorProvider.qualifyCapability(
      'motor_hotspot_refinement',
      runResult.measurement,
      runResult.reliability,
      'MAGNIOM-MODULE-TINNITUS', // Invalid module for motor hotspot refinement
    );
    expect(unapprovedQual.qualification).toBe('not_qualified');
    expect(unapprovedQual.isAllowedForClinicalMode).toBe(false);
    expect(unapprovedQual.reasons[0]).toContain('not scientifically qualified for indication');
  });
});
