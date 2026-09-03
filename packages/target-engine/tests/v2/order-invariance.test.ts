/**
 * @magniom/target-engine - Section 21 Exit Criterion 2 Test Suite
 * "plugin execution order cannot alter Slate"
 * Conforms to MAGNIOM-Implementation & Multi-Indication Validation Roadmap v2.0 (§21, §135)
 */

import { describe, it, expect } from 'vitest';
import {
  runTargetEngineV2,
  createCanonicalResolvedContextV2,
  MDDPlugin,
  CandidateGeneratorRegistry,
  type CandidateGenerator,
} from '../../src/index.js';

describe('Target Engine Core Exit Criterion 2: Order Invariance', () => {
  it('guarantees slate and candidate IDs are completely invariant to generator registration and execution order', () => {
    const context = createCanonicalResolvedContextV2();
    const plugin = new MDDPlugin();
    const normalGenerators = plugin.generators();

    // 1. Run with standard generator order [Gen1, Gen2]
    const registryStandard = new CandidateGeneratorRegistry();
    for (const gen of normalGenerators) {
      registryStandard.register(gen);
    }
    const resultStandard = runTargetEngineV2(context, {
      plugin,
      generatorRegistry: registryStandard,
    });

    // 2. Run with reversed generator order [Gen2, Gen1]
    const registryReversed = new CandidateGeneratorRegistry();
    const reversedGenerators = [...normalGenerators].reverse();
    for (const gen of reversedGenerators) {
      registryReversed.register(gen);
    }
    const resultReversed = runTargetEngineV2(context, {
      plugin,
      generatorRegistry: registryReversed,
    });

    // Verify Slate payload hash is identical
    expect(resultReversed.slate.payloadSha256).toBe(resultStandard.slate.payloadSha256);

    // Verify Primary Candidates and order are identical
    expect(resultReversed.slate.primaryCandidates).toEqual(resultStandard.slate.primaryCandidates);

    // Verify Additional Candidates are identical
    expect(resultReversed.slate.additionalCandidates).toEqual(
      resultStandard.slate.additionalCandidates,
    );

    // Verify all candidate IDs match
    expect(resultReversed.allCandidates.map(c => c.id)).toEqual(
      resultStandard.allCandidates.map(c => c.id),
    );
  });

  it('guarantees that wrapping generators in arbitrary permutation wrappers yields identical slate', () => {
    const context = createCanonicalResolvedContextV2();
    const plugin = new MDDPlugin();
    const originalGens = plugin.generators();

    class PermutedPlugin extends MDDPlugin {
      override generators(): readonly CandidateGenerator[] {
        return [...originalGens].reverse();
      }
    }

    const permutedPlugin = new PermutedPlugin();
    const res1 = runTargetEngineV2(context, { plugin });
    const res2 = runTargetEngineV2(context, { plugin: permutedPlugin });

    expect(res2.slate.payloadSha256).toBe(res1.slate.payloadSha256);
    expect(res2.slate.primaryCandidates).toEqual(res1.slate.primaryCandidates);
  });
});
