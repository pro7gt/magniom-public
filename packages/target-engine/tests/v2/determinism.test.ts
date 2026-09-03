/**
 * @magniom/target-engine - Section 21 Exit Criterion 1 Test Suite
 * "same inputs produce same outputs"
 * Conforms to MAGNIOM-Implementation & Multi-Indication Validation Roadmap v2.0 (§21)
 */

import { describe, it, expect } from 'vitest';
import { runTargetEngineV2, createCanonicalResolvedContextV2 } from '../../src/index.js';

describe('Target Engine Core Exit Criterion 1: Determinism', () => {
  it('produces bit-for-bit identical outputs across multiple independent executions', () => {
    const context = createCanonicalResolvedContextV2();

    const initialResult = runTargetEngineV2(context);

    expect(initialResult.slate.status).toBe('ready_for_review');
    expect(initialResult.slate.primaryCandidates.length).toBeGreaterThan(0);
    expect(initialResult.slate.payloadSha256).toBeDefined();

    // Run 25 independent iterations to guarantee zero stochasticity
    for (let i = 0; i < 25; i++) {
      const iterResult = runTargetEngineV2(context);

      // Slate payload hash must be strictly identical
      expect(iterResult.slate.payloadSha256).toBe(initialResult.slate.payloadSha256);

      // Candidate IDs and order must be strictly identical
      expect(iterResult.slate.primaryCandidates).toEqual(initialResult.slate.primaryCandidates);
      expect(iterResult.slate.additionalCandidates).toEqual(
        initialResult.slate.additionalCandidates,
      );

      // Reproducibility manifest must match bit-for-bit
      expect(iterResult.reproducibilityManifest.inputManifestSha256).toBe(
        initialResult.reproducibilityManifest.inputManifestSha256,
      );
      expect(iterResult.reproducibilityManifest.outputPayloadSha256).toBe(
        initialResult.reproducibilityManifest.outputPayloadSha256,
      );

      // Total candidates and candidate IDs must match
      expect(iterResult.allCandidates.map(c => c.id)).toEqual(
        initialResult.allCandidates.map(c => c.id),
      );
    }
  });
});
