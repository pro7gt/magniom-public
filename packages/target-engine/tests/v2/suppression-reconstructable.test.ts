/**
 * @magniom/target-engine - Section 21 Exit Criterion 7 Test Suite
 * "suppressed candidates remain reconstructable"
 * Conforms to MAGNIOM-Implementation & Multi-Indication Validation Roadmap v2.0 (§21, §114)
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

describe('Target Engine Core Exit Criterion 7: Suppressed Candidate Reconstructability', () => {
  it('guarantees that suppressed candidates remain reconstructable with complete trace and rationale', () => {
    const context = createCanonicalResolvedContextV2();

    // Add a redundant generator producing a point 5mm away from BA46 (-44, 40, 28)
    const redundantGenerator: CandidateGenerator = {
      descriptor: {
        id: 'GEN-REDUNDANT-001',
        code: 'REDUNDANT_BA46_VARIANT',
        semanticVersion: '1.0.0',
        indicationModuleReleaseIds: [context.indicationModule.id],
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
        const draft: CandidateDraft = {
          draftId: 'draft-redundant-ba46-variant',
          generatorId: 'GEN-REDUNDANT-001',
          targetFamilyId: 'TF-MDD-LDLPFC-EST-001',
          proposedRole: 'evidence_anchor',
          targetGeometry: createCanonicalPointGeometry(-45, 41, 29, 'left', 'redundant-variant'), // ~2mm away
          evidencePathIds: ['PATH-MDD-BA46'],
          clinicalObjectiveIds: context.request.clinicalObjectiveIds,
          reliedOnMeasurementIds: [],
          reliedOnReliabilityIds: [],
          lineage: { lineageType: 'evidence_baseline' },
          rawScientificFeatures: [
            { code: 'phenotype_concordance', value: 0.82, isApplicable: true },
            { code: 'circuit_concordance', value: 0.85, isApplicable: true },
          ],
          generatorLimitations: [],
          nominationRationale: 'Slightly offset variant of Left DLPFC BA46.',
          generatorTrace: { algorithmCode: 'RED_VAR', algorithmVersion: '1.0.0' },
        };
        return {
          generatorId: 'GEN-REDUNDANT-001',
          generatorVersion: '1.0.0',
          status: 'generated',
          candidates: [draft],
        };
      },
    };

    class TestPlugin extends MDDPlugin {
      override generators(): readonly CandidateGenerator[] {
        return [...super.generators(), redundantGenerator];
      }
    }

    const testPlugin = new TestPlugin();
    const result = runTargetEngineV2(context, { plugin: testPlugin });

    // Verify suppressed candidates list is non-empty
    expect(result.suppressedCandidates.length).toBeGreaterThan(0);

    // Find the redundant candidate in suppressed list
    const redundantCand = result.suppressedCandidates.find(
      c => c.provenance.createdBy === 'GEN-REDUNDANT-001',
    );
    expect(redundantCand).toBeDefined();
    expect(redundantCand?.generationStatus).toBe('suppressed');

    // Find its candidate trace
    const trace = result.candidateTraces.find(t => t.candidateId === redundantCand?.id);
    expect(trace).toBeDefined();
    expect(trace?.suppressionReason).toBe('REDUNDANT');

    // Must declare which dominant candidate it was redundant with
    expect(trace?.redundancyWith).toBeDefined();
    expect(trace?.redundancyWith?.length).toBeGreaterThan(0);

    // Explanation must remain fully reconstructed and readable
    expect(trace?.explanation.shortSummary).toBeDefined();
    expect(trace?.explanation.evidenceBasis.length).toBeGreaterThan(0);
    expect(trace?.explanation.clinicalObjective.length).toBeGreaterThan(0);
  });
});
