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
} from '../src/index.js';

describe('@magniom/modalities Unit Tests', () => {
  it('instantiates all 9 modality providers with declared manifests', () => {
    const providers = [
      new StructuralMRIProvider(),
      new LesionMappingProvider(),
      new RestingStateProvider(),
      new TaskFMRIProvider(),
      new DiffusionProvider(),
      new MotorMappingProvider(),
      new MEPProvider(),
      new AudiologyProvider(),
      new EFieldProvider(),
    ];

    expect(providers.length).toBe(9);
    for (const p of providers) {
      expect(p.manifest.code).toBeDefined();
      expect(p.manifest.semanticVersion).toBe('2.0.0');
      expect(p.manifest.capabilities.length).toBeGreaterThan(0);
      expect(p.modality).toBeDefined();
    }
  });

  it('enforces that Diffusion MRI has isAxonCountEquivalent set to false (§43 Invariant)', () => {
    const diff = new DiffusionProvider();
    const context = {
      caseId: '00000000-0000-0000-0000-000000000001',
      organisationId: '00000000-0000-0000-0000-000000000000',
      rawInputArtifacts: [
        { path: 'dwi.nii', content: 'DWI', sha256: 'a'.repeat(64) },
        { path: 'dwi.bvec', content: 'BVEC', sha256: 'b'.repeat(64) },
        { path: 'dwi.bval', content: 'BVAL', sha256: 'c'.repeat(64) },
      ],
      pipelineVersionId: 'PIPE-DWI-1',
      configurationParameters: {},
    };

    const result = diff.process(context);
    expect(result.measurement.isAxonCountEquivalent).toBe(false);
  });

  it('enforces that EFieldProvider tags mock configuration as synthetic/prototype and verifies coil pose tolerance (§116, §120)', () => {
    const efield = new EFieldProvider();
    const context = {
      caseId: '00000000-0000-0000-0000-000000000001',
      organisationId: '00000000-0000-0000-0000-000000000000',
      rawInputArtifacts: [{ path: 'head_mesh.msh', content: 'MSH', sha256: 'a'.repeat(64) }],
      pipelineVersionId: 'PIPE-EFIELD-SIMNIBS-2.0.0',
      configurationParameters: {
        mockOnly: true,
        angularDeviationDegrees: 3.5,
        positionDisplacementMm: 1.5,
      },
    };

    const res = efield.process(context);
    expect(res.measurement.dataOrigin).toBe('synthetic');
    expect(res.measurement.scientificMaturity).toBe('prototype');
    expect(res.measurement.clinicalPromotionStatus).toBe('blocked');
    expect(res.measurement.poseToleranceVerified).toBe(true);
    expect(res.qcResult.warnings.some(w => w.includes('synthetic/mock'))).toBe(true);
  });

  it('enforces that EFieldProvider fails QC when coil angular deviation > 5 deg or displacement > 2mm (§116, §120)', () => {
    const efield = new EFieldProvider();
    const context = {
      caseId: '00000000-0000-0000-0000-000000000001',
      organisationId: '00000000-0000-0000-0000-000000000000',
      rawInputArtifacts: [{ path: 'head_mesh.msh', content: 'MSH', sha256: 'a'.repeat(64) }],
      pipelineVersionId: 'PIPE-EFIELD-SIMNIBS-2.0.0',
      configurationParameters: {
        angularDeviationDegrees: 6.2,
        positionDisplacementMm: 2.8,
      },
    };

    const res = efield.process(context);
    expect(res.measurement.poseToleranceVerified).toBe(false);
    expect(res.qcResult.qcStatus).toBe('fail');
    expect(res.qcResult.criticalFailures.some(f => f.includes('angular deviation'))).toBe(true);
    expect(res.qcResult.criticalFailures.some(f => f.includes('displacement'))).toBe(true);
  });
});
