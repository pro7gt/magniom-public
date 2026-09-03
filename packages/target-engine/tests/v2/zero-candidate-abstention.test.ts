/**
 * @magniom/target-engine - Section 21 Exit Criterion 8 Test Suite
 * "zero-candidate result is supported"
 * Conforms to MAGNIOM-Implementation & Multi-Indication Validation Roadmap v2.0 (§21, §116-118)
 */

import { describe, it, expect } from 'vitest';
import {
  runTargetEngineV2,
  createCanonicalResolvedContextV2,
  type CandidateGenerator,
  type ResolvedTargetEngineContextV2,
  type CandidateGeneratorResult,
  type IndicationTargetingPlugin,
  MDDPlugin,
} from '../../src/index.js';

describe('Target Engine Core Exit Criterion 8: Zero-Candidate Abstention Support', () => {
  it('supports zero-candidate result cleanly when all candidates fail hard gates', () => {
    // Context with non-permitted evidence paths so that ALL candidates fail Gate G2
    const context = createCanonicalResolvedContextV2({
      permittedEvidencePaths: [], // No permitted evidence paths!
    });

    const result = runTargetEngineV2(context);

    // Engine must not throw and must return valid abstained slate
    expect(result.slate).toBeDefined();
    expect(result.slate.status).toBe('abstained');
    expect(result.slate.primaryCandidates.length).toBe(0);
    expect(result.slate.additionalCandidates.length).toBe(0);

    // Abstention profile must be populated with structured explanation
    expect(result.slate.abstention).toBeDefined();
    expect(result.slate.abstention?.abstentionType).toBeDefined();
    expect(result.slate.abstention?.reasonCodes.length).toBeGreaterThan(0);
    expect(result.slate.abstention?.fallbackOptions.length).toBeGreaterThan(0);

    // Reproducibility manifest must still be computed and valid
    expect(result.reproducibilityManifest.outputPayloadSha256).toBe(result.slate.payloadSha256);
    expect(result.reproducibilityManifest.inputManifestSha256).toBeDefined();

    // Diagnostics should report zero candidates surviving
    expect(
      result.diagnostics.some(
        d => d.includes('Zero candidate hypotheses survived') || d.includes('abstained'),
      ),
    ).toBe(true);
  });

  it('supports zero-candidate result when generators return zero candidates', () => {
    const emptyGenerator: CandidateGenerator = {
      descriptor: {
        id: 'GEN-EMPTY-001',
        code: 'EMPTY_GEN',
        semanticVersion: '1.0.0',
        indicationModuleReleaseIds: ['00000000-0000-0000-0000-000000000001'],
        candidateRoles: ['evidence_anchor'],
        targetFamilyScopeIds: ['TF-MDD-LDLPFC-EST-001'],
        evidencePathStatusScope: ['clinical_permitted'],
        permittedModes: ['clinical'],
        requiredCapabilities: [],
        optionalCapabilities: [],
        permittedGeometryTypes: ['point'],
        baselineRelationship: 'creates_baseline',
        deterministic: true,
        generatorFailurePolicy: 'omit_generator_with_warning',
      },
      generate(_ctx: ResolvedTargetEngineContextV2): CandidateGeneratorResult {
        return {
          generatorId: 'GEN-EMPTY-001',
          generatorVersion: '1.0.0',
          status: 'no_candidate',
          candidates: [],
        };
      },
    };

    class EmptyPlugin extends MDDPlugin {
      override generators(): readonly CandidateGenerator[] {
        return [emptyGenerator];
      }
    }

    const emptyPlugin = new EmptyPlugin();
    const context = createCanonicalResolvedContextV2();
    const result = runTargetEngineV2(context, { plugin: emptyPlugin });

    expect(result.slate.status).toBe('abstained');
    expect(result.slate.primaryCandidates.length).toBe(0);
    expect(result.slate.additionalCandidates.length).toBe(0);
    expect(result.slate.abstention).toBeDefined();
  });
});
