/**
 * Measurement Platform Exit Criteria Test Suite
 * Conforms to MAGNIOM-Neuroimaging, Neurophysiology & Multimodal Measurement Specification v2.0 (§140, §193)
 * Verifies that all 9 providers satisfy the 8 exit criteria:
 * 1. source integrity
 * 2. processing provenance
 * 3. QC
 * 4. reliability
 * 5. capability qualification
 * 6. case identity
 * 7. laterality
 * 8. immutable output
 */

import { describe, it, expect } from 'vitest';
import {
  StructuralMRIProvider,
  LesionMappingProvider,
  RestingStateProvider,
  TaskFMRIProvider,
  DiffusionProvider,
  MotorMappingProvider,
  MEPProvider,
  AudiologyProvider,
  EFieldProvider,
} from '@magniom/modalities';
import { ExitCriteriaHarness } from '../src/harness/exit-criteria-harness.js';
import { computeSha256 } from '@magniom/scientific-policy';

describe('Phase 3 Multimodal Measurement Platform - 8 Exit Criteria Verification', () => {
  const caseId = '00000000-0000-0000-0000-000000000001';
  const organisationId = '00000000-0000-0000-0000-000000000000';

  it('Provider 1: Structural MRI satisfies all 8 exit criteria', () => {
    const provider = new StructuralMRIProvider();
    const context = {
      caseId,
      organisationId,
      rawInputArtifacts: [
        { path: 'sub-01_T1w.nii.gz', content: 'T1', sha256: computeSha256('T1') },
      ],
      pipelineVersionId: 'PIPE-STRUCTURAL-2.0.0',
      configurationParameters: { voxelX: 1.0, voxelY: 1.0, voxelZ: 1.0, orientation: 'RAS' },
    };

    const report = ExitCriteriaHarness.verifyProvider(
      provider,
      context,
      'anatomical_localisation',
      'MAGNIOM-MODULE-MDD',
    );

    expect(report.sourceIntegrityPassed).toBe(true);
    expect(report.processingProvenancePassed).toBe(true);
    expect(report.qcPassed).toBe(true);
    expect(report.reliabilityPassed).toBe(true);
    expect(report.capabilityQualificationPassed).toBe(true);
    expect(report.caseIdentityPassed).toBe(true);
    expect(report.lateralityPassed).toBe(true);
    expect(report.immutableOutputPassed).toBe(true);
    expect(report.allPassed).toBe(true);
  });

  it('Provider 2: Lesion Mapping satisfies all 8 exit criteria', () => {
    const provider = new LesionMappingProvider();
    const context = {
      caseId,
      organisationId,
      rawInputArtifacts: [
        { path: 'sub-01_lesion_mask.nii.gz', content: 'MASK', sha256: computeSha256('MASK') },
      ],
      pipelineVersionId: 'PIPE-LESION-MAP-2.0.0',
      configurationParameters: {
        lesionType: 'ischemic',
        laterality: 'left',
        volumeMm3: 45000,
        isTargetDestroyed: false,
      },
    };

    const report = ExitCriteriaHarness.verifyProvider(
      provider,
      context,
      'lesion_context',
      'MAGNIOM-MODULE-STROKE-MOTOR',
    );

    expect(report.allPassed).toBe(true);
  });

  it('Provider 3: Resting-State fMRI satisfies all 8 exit criteria', () => {
    const provider = new RestingStateProvider();
    const context = {
      caseId,
      organisationId,
      rawInputArtifacts: [
        { path: 'sub-01_task-rest_bold.nii.gz', content: 'BOLD', sha256: computeSha256('BOLD') },
      ],
      pipelineVersionId: 'PIPE-RSFMRI-2.0.0',
      configurationParameters: {
        acquiredDurationSeconds: 900,
        meanFramewiseDisplacementMm: 0.18,
        scrubbedVolumesFraction: 0.1,
        splitHalfStabilityR: 0.82,
      },
    };

    const report = ExitCriteriaHarness.verifyProvider(
      provider,
      context,
      'individual_fc_refinement',
      'MAGNIOM-MODULE-MDD',
    );

    expect(report.allPassed).toBe(true);
  });

  it('Provider 4: Task fMRI satisfies all 8 exit criteria', () => {
    const provider = new TaskFMRIProvider();
    const context = {
      caseId,
      organisationId,
      rawInputArtifacts: [
        { path: 'sub-01_task_bold.nii.gz', content: 'TBOLD', sha256: computeSha256('TBOLD') },
        { path: 'sub-01_events.log', content: 'LOG', sha256: computeSha256('LOG') },
      ],
      pipelineVersionId: 'PIPE-TASKFMRI-2.0.0',
      configurationParameters: { taskAccuracyRate: 0.85, lateralityIndex: 0.65 },
    };

    const report = ExitCriteriaHarness.verifyProvider(
      provider,
      context,
      'language_lateralisation',
      'MAGNIOM-MODULE-STROKE-APHASIA',
    );

    expect(report.allPassed).toBe(true);
  });

  it('Provider 5: Diffusion MRI satisfies all 8 exit criteria', () => {
    const provider = new DiffusionProvider();
    const context = {
      caseId,
      organisationId,
      rawInputArtifacts: [
        { path: 'sub-01_dwi.nii.gz', content: 'DWI', sha256: computeSha256('DWI') },
        { path: 'sub-01_dwi.bvec', content: 'BVEC', sha256: computeSha256('BVEC') },
        { path: 'sub-01_dwi.bval', content: 'BVAL', sha256: computeSha256('BVAL') },
      ],
      pipelineVersionId: 'PIPE-DIFFUSION-2.0.0',
      configurationParameters: { gradientDirectionsCount: 64, corticospinalTractIntact: true },
    };

    const report = ExitCriteriaHarness.verifyProvider(
      provider,
      context,
      'tract_integrity',
      'MAGNIOM-MODULE-STROKE-MOTOR',
    );

    expect(report.allPassed).toBe(true);
  });

  it('Provider 6: Motor Mapping satisfies all 8 exit criteria', () => {
    const provider = new MotorMappingProvider();
    const context = {
      caseId,
      organisationId,
      rawInputArtifacts: [
        { path: 'sub-01_motor_map.xml', content: 'NAV', sha256: computeSha256('NAV') },
      ],
      pipelineVersionId: 'PIPE-MOTOR-MAP-2.0.0',
      configurationParameters: {
        muscleCode: 'FDI',
        muscleLaterality: 'right',
        repeatabilityMm: 3.1,
      },
    };

    const report = ExitCriteriaHarness.verifyProvider(
      provider,
      context,
      'motor_hotspot_refinement',
      'MAGNIOM-MODULE-NEUROPATHIC-PAIN',
    );

    expect(report.allPassed).toBe(true);
  });

  it('Provider 7: MEP satisfies all 8 exit criteria', () => {
    const provider = new MEPProvider();
    const context = {
      caseId,
      organisationId,
      rawInputArtifacts: [
        { path: 'sub-01_mep_emg.edf', content: 'EMG', sha256: computeSha256('EMG') },
      ],
      pipelineVersionId: 'PIPE-MEP-2.0.0',
      configurationParameters: { muscleCode: 'FDI', responsePresent: true, meanAmplitudeUv: 720 },
    };

    const report = ExitCriteriaHarness.verifyProvider(
      provider,
      context,
      'corticospinal_excitability_context',
      'MAGNIOM-MODULE-STROKE-MOTOR',
    );

    expect(report.allPassed).toBe(true);
  });

  it('Provider 8: Audiology satisfies all 8 exit criteria', () => {
    const provider = new AudiologyProvider();
    const context = {
      caseId,
      organisationId,
      rawInputArtifacts: [
        { path: 'sub-01_audiogram.xml', content: 'AUD', sha256: computeSha256('AUD') },
      ],
      pipelineVersionId: 'PIPE-AUDIOLOGY-2.0.0',
      configurationParameters: { tinnitusLaterality: 'left', transducerCalibrated: true },
    };

    const report = ExitCriteriaHarness.verifyProvider(
      provider,
      context,
      'tinnitus_laterality_context',
      'MAGNIOM-MODULE-TINNITUS',
    );

    expect(report.allPassed).toBe(true);
  });

  it('Provider 9: E-field Modeling satisfies all 8 exit criteria', () => {
    const provider = new EFieldProvider();
    const context = {
      caseId,
      organisationId,
      rawInputArtifacts: [
        { path: 'sub-01_head_mesh.msh', content: 'MESH', sha256: computeSha256('MESH') },
      ],
      pipelineVersionId: 'PIPE-EFIELD-2.0.0',
      configurationParameters: { scalpToCortexDistanceMm: 13.5, peakCorticalEFieldVm: 110 },
    };

    const report = ExitCriteriaHarness.verifyProvider(
      provider,
      context,
      'cortical_accessibility_context',
      'MAGNIOM-MODULE-OCD',
    );

    expect(report.allPassed).toBe(true);
  });
});
