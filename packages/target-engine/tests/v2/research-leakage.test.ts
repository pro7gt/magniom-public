/**
 * @magniom/target-engine - Section 21 Exit Criterion 4 Test Suite
 * "Research generator cannot leak into Clinical"
 * Conforms to MAGNIOM-Implementation & Multi-Indication Validation Roadmap v2.0 (§21, §115)
 */

import { describe, it, expect } from 'vitest';
import {
  runTargetEngineV2,
  createCanonicalResolvedContextV2,
  createCanonicalPointGeometry,
  type CandidateGenerator,
  type CandidateDraft,
  type ResolvedTargetEngineContextV2,
  type CandidateGeneratorResult,
  type IndicationTargetingPlugin,
  MDDPlugin,
} from '../../src/index.js';

describe('Target Engine Core Exit Criterion 4: Research Candidate Isolation', () => {
  const researchGenerator: CandidateGenerator = {
    descriptor: {
      id: 'GEN-RESEARCH-ONLY-001',
      code: 'EXPERIMENTAL_CONNECTOME_GENERATOR',
      semanticVersion: '0.1.0',
      indicationModuleReleaseIds: ['00000000-0000-0000-0000-000000000001'],
      candidateRoles: ['research_hypothesis'],
      targetFamilyScopeIds: ['TF-MDD-LDLPFC-EST-001'],
      evidencePathStatusScope: ['research_permitted'],
      permittedModes: ['research'], // Research only!
      requiredCapabilities: [],
      optionalCapabilities: [],
      permittedGeometryTypes: ['point'],
      baselineRelationship: 'independent_hypothesis',
      deterministic: true,
      generatorFailurePolicy: 'research_optional',
    },
    generate(_ctx: ResolvedTargetEngineContextV2): CandidateGeneratorResult {
      const draft: CandidateDraft = {
        draftId: 'draft-research-experimental',
        generatorId: 'GEN-RESEARCH-ONLY-001',
        targetFamilyId: 'TF-MDD-LDLPFC-EST-001',
        proposedRole: 'research_hypothesis',
        targetGeometry: createCanonicalPointGeometry(-40, 42, 32, 'left', 'research-pipeline'),
        evidencePathIds: ['PATH-MDD-BA46'],
        clinicalObjectiveIds: ['00000000-0000-0000-0000-000000000040'],
        reliedOnMeasurementIds: [],
        reliedOnReliabilityIds: [],
        lineage: { lineageType: 'experimental_protocol' },
        rawScientificFeatures: [
          { code: 'phenotype_concordance', value: 0.99, isApplicable: true },
          { code: 'circuit_concordance', value: 0.99, isApplicable: true },
        ],
        generatorLimitations: ['For investigational and exploratory use only.'],
        nominationRationale: 'Exploratory experimental cortical hypothesis.',
        generatorTrace: { algorithmCode: 'EXP_01', algorithmVersion: '0.1.0' },
      };
      return {
        generatorId: 'GEN-RESEARCH-ONLY-001',
        generatorVersion: '0.1.0',
        status: 'generated',
        candidates: [draft],
      };
    },
  };

  it('prevents research-only generator from leaking into a Clinical Slate', () => {
    // Mode is explicitly CLINICAL
    const context = createCanonicalResolvedContextV2({
      request: {
        mode: 'clinical',
      } as any,
    });

    class TestPlugin extends MDDPlugin {
      override generators(): readonly CandidateGenerator[] {
        return [...super.generators(), researchGenerator];
      }
    }

    const pluginWithResearch = new TestPlugin();
    const result = runTargetEngineV2(context, { plugin: pluginWithResearch });

    // The research generator MUST NOT appear in primary or additional candidates in clinical mode
    const primaryCandidateIds = result.slate.primaryCandidates.map(p => p.targetCandidateId);
    const additionalCandidateIds = result.slate.additionalCandidates.map(a => a.targetCandidateId);

    for (const cand of result.allCandidates) {
      if (
        cand.candidateRole === 'research_hypothesis' ||
        cand.provenance.createdBy === 'GEN-RESEARCH-ONLY-001'
      ) {
        expect(primaryCandidateIds).not.toContain(cand.id);
        expect(additionalCandidateIds).not.toContain(cand.id);
      }
    }

    // Diagnostic should log that the generator was skipped in clinical mode
    expect(result.diagnostics.some(d => d.includes('GENERATOR_MODE_SKIPPED'))).toBe(true);
  });

  it('allows research generator to run and nominate candidates when mode is research', () => {
    // Mode is RESEARCH
    const context = createCanonicalResolvedContextV2({
      request: {
        mode: 'research',
      } as any,
      indicationModule: {
        permittedModes: ['clinical', 'research', 'validation'],
      } as any,
    });

    class TestPlugin extends MDDPlugin {
      override generators(): readonly CandidateGenerator[] {
        return [...super.generators(), researchGenerator];
      }
    }

    const pluginWithResearch = new TestPlugin();
    const result = runTargetEngineV2(context, { plugin: pluginWithResearch });

    // In research mode, the generator executed and was not blocked by mode gate
    const executedHashes = result.reproducibilityManifest.executedGeneratorManifestHashes;
    expect(executedHashes.length).toBeGreaterThanOrEqual(2);
  });
});
