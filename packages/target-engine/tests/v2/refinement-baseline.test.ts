/**
 * @magniom/target-engine - Section 21 Exit Criterion 6 Test Suite
 * "refinement requires declared baseline where applicable"
 * Conforms to MAGNIOM-Implementation & Multi-Indication Validation Roadmap v2.0 (§21, §90-97)
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

describe('Target Engine Core Exit Criterion 6: Refinement Baseline Declaration', () => {
  it('strictly rejects a refined candidate that fails to declare its baseline candidate draft ID', () => {
    const context = createCanonicalResolvedContextV2();

    // Refinement generator omitting baselineCandidateDraftId
    const unanchoredRefinementGenerator: CandidateGenerator = {
      descriptor: {
        id: 'GEN-UNANCHORED-REFINED-001',
        code: 'UNANCHORED_FC_REFINEMENT',
        semanticVersion: '1.0.0',
        indicationModuleReleaseIds: [context.indicationModule.id],
        candidateRoles: ['connectome_refinement'],
        targetFamilyScopeIds: ['TF-MDD-LDLPFC-EST-001'],
        evidencePathStatusScope: ['clinical_permitted'],
        permittedModes: ['clinical'],
        requiredCapabilities: ['individual_fc_refinement'],
        optionalCapabilities: [],
        permittedGeometryTypes: ['point'],
        baselineRelationship: 'refines_baseline',
        deterministic: true,
        generatorFailurePolicy: 'omit_generator_with_warning',
      },
      generate(_ctx: ResolvedTargetEngineContextV2): CandidateGeneratorResult {
        const unanchoredDraft: CandidateDraft = {
          draftId: 'draft-unanchored-refined',
          generatorId: 'GEN-UNANCHORED-REFINED-001',
          targetFamilyId: 'TF-MDD-LDLPFC-EST-001',
          proposedRole: 'connectome_refinement',
          targetGeometry: createCanonicalPointGeometry(-42, 44, 30, 'left', 'fc-refinement'),
          evidencePathIds: ['PATH-MDD-BA46'],
          clinicalObjectiveIds: context.request.clinicalObjectiveIds,
          reliedOnMeasurementIds: ['MEAS-01'],
          reliedOnReliabilityIds: ['MEAS-REL-01'],
          lineage: {
            lineageType: 'measurement_refinement',
            refinementKind: 'functional_connectivity',
            // CRITICAL ERROR: baselineCandidateDraftId is missing/undefined!
            baselineCandidateDraftId: undefined,
          },
          rawScientificFeatures: [
            { code: 'phenotype_concordance', value: 0.95, isApplicable: true },
            { code: 'circuit_concordance', value: 0.98, isApplicable: true },
          ],
          generatorLimitations: [],
          nominationRationale: 'Refined target without declared baseline.',
          generatorTrace: { algorithmCode: 'FC_UNANCHORED', algorithmVersion: '1.0.0' },
        };
        return {
          generatorId: 'GEN-UNANCHORED-REFINED-001',
          generatorVersion: '1.0.0',
          status: 'generated',
          candidates: [unanchoredDraft],
        };
      },
    };

    class TestPlugin extends MDDPlugin {
      override generators(): readonly CandidateGenerator[] {
        return [...super.generators(), unanchoredRefinementGenerator];
      }
    }

    const testPlugin = new TestPlugin();
    const result = runTargetEngineV2(context, { plugin: testPlugin });

    // The unanchored candidate MUST be rejected and suppressed
    const unanchoredTrace = result.candidateTraces.find(
      t => t.generatorId === 'GEN-UNANCHORED-REFINED-001',
    );
    expect(unanchoredTrace).toBeDefined();
    expect(unanchoredTrace?.suppressionReason).toBe('MISSING_DECLARED_BASELINE');

    // Gate G9 must have caught the missing baseline
    const g9 = unanchoredTrace?.gateEvaluations.find(
      g => g.gateCode === 'G9_GENERATOR_CONSTRAINTS',
    );
    expect(g9?.result).toBe('fail');
    expect(g9?.reasonCodes).toContain('MISSING_DECLARED_BASELINE');

    // It must NOT appear in primary candidates
    const inPrimary = result.slate.primaryCandidates.some(
      r => r.targetCandidateId === unanchoredTrace?.candidateId,
    );
    expect(inPrimary).toBe(false);
  });

  it('correctly processes anchored refinement when baseline candidate draft ID is declared and valid', () => {
    const context = createCanonicalResolvedContextV2();
    const result = runTargetEngineV2(context);

    // MDD reference plugin provides a valid refinement anchored to BA46
    const refinementDecisions = result.refinementDecisions;
    expect(refinementDecisions.length).toBeGreaterThan(0);

    const fcDecision = refinementDecisions.find(
      d => d.refinementKind === 'functional_connectivity',
    );
    expect(fcDecision).toBeDefined();
    expect(fcDecision?.baselineCandidateId).toBeDefined();
    expect(fcDecision?.refinedCandidateId).toBeDefined();
    expect(fcDecision?.geometryDifference.value).toBeGreaterThan(0);
    expect(fcDecision?.status).toBe('adopted');
  });
});
