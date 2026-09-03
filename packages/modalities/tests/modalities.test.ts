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
});
