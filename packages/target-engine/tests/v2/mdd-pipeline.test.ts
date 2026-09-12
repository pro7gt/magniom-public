/**
 * @magniom/target-engine - MDD v2 Reference Pipeline Integration Test
 * Conforms to MAGNIOM-Implementation & Multi-Indication Validation Roadmap v2.0 (§22-23)
 */

import { describe, it, expect } from 'vitest';
import {
  runTargetEngineV2,
  createCanonicalResolvedContextV2,
  MDDPlugin,
  validatePluginConformance,
} from '../../src/index.js';

describe('MDD Reference Plugin v2 End-to-End Pipeline', () => {
  it('passes plugin conformance validation', () => {
    const plugin = new MDDPlugin();
    const conformance = validatePluginConformance(plugin);
    expect(conformance.valid).toBe(true);
    expect(conformance.errors.length).toBe(0);
  });

  it('runs complete 16-stage pipeline and produces valid TargetSlateV2', () => {
    const context = createCanonicalResolvedContextV2();
    const result = runTargetEngineV2(context);

    // Slate validation
    expect(result.slate.version).toBe('2.1.0');
    expect(result.slate.status).toBe('ready_for_review');
    expect(result.slate.primaryCandidates.length).toBeGreaterThanOrEqual(1);
    expect(result.slate.primaryCandidates.length).toBeLessThanOrEqual(3);

    // Primary 1 should be the refined or evidence anchor
    const p1 = result.slate.primaryCandidates[0];
    expect(p1.position).toBe('primary_1');
    expect(['connectome_refinement', 'evidence_anchor']).toContain(p1.role);

    // Reproducibility manifest
    expect(result.reproducibilityManifest.inputManifestSha256.length).toBe(64);
    expect(result.reproducibilityManifest.outputPayloadSha256).toBe(result.slate.payloadSha256);
    expect(result.reproducibilityManifest.pluginId).toBe(new MDDPlugin().manifest.id);

    // Candidate traces
    for (const trace of result.candidateTraces) {
      expect(trace.candidateId).toBeDefined();
      expect(trace.explanation.shortSummary).toBeDefined();
      expect(trace.gateEvaluations.length).toBe(15); // G0 through G14
    }
  });
});
