/**
 * @magniom/target-engine - Section 21 Exit Criterion 3 Test Suite
 * "generator cannot bypass evidence policy"
 * Conforms to MAGNIOM-Implementation & Multi-Indication Validation Roadmap v2.0 (§21)
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
  MDD_MODULE_RELEASE_ID,
} from '../../src/index.js';

describe('Target Engine Core Exit Criterion 3: Evidence Policy Enforcement', () => {
  it('strictly rejects candidate drafts that reference non-permitted or fabricated evidence paths', () => {
    const context = createCanonicalResolvedContextV2();

    // Rogue generator attempting to invent an unauthorised evidence path
    const rogueGenerator: CandidateGenerator = {
      descriptor: {
        id: 'GEN-ROGUE-EVIDENCE-001',
        code: 'ROGUE_EVIDENCE_BYPASS',
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
        const fakeDraft: CandidateDraft = {
          draftId: 'draft-fake-evidence-claim',
          generatorId: 'GEN-ROGUE-EVIDENCE-001',
          targetFamilyId: 'TF-MDD-LDLPFC-EST-001',
          proposedRole: 'evidence_anchor',
          targetGeometry: createCanonicalPointGeometry(-44, 40, 28, 'left', 'rogue'),
          evidencePathIds: ['UNAUTHORIZED_FABRICATED_PATH_999'],
          clinicalObjectiveIds: context.request.clinicalObjectiveIds,
          reliedOnMeasurementIds: [],
          reliedOnReliabilityIds: [],
          lineage: { lineageType: 'evidence_baseline' },
          rawScientificFeatures: [
            { code: 'phenotype_concordance', value: 0.99, isApplicable: true },
            { code: 'circuit_concordance', value: 0.99, isApplicable: true },
          ],
          generatorLimitations: [],
          nominationRationale: 'Fabricated target bypassing evidence policy.',
          generatorTrace: { algorithmCode: 'ROGUE', algorithmVersion: '1.0.0' },
        };
        return {
          generatorId: 'GEN-ROGUE-EVIDENCE-001',
          generatorVersion: '1.0.0',
          status: 'generated',
          candidates: [fakeDraft],
        };
      },
    };

    class TestPlugin extends MDDPlugin {
      override generators(): readonly CandidateGenerator[] {
        return [...super.generators(), rogueGenerator];
      }
    }

    const testPlugin = new TestPlugin();
    const result = runTargetEngineV2(context, { plugin: testPlugin });

    // The rogue candidate MUST be suppressed
    const rogueSuppressed = result.suppressedCandidates.find(
      c => c.provenance.createdBy === 'GEN-ROGUE-EVIDENCE-001',
    );
    expect(rogueSuppressed).toBeDefined();

    // Verify it was rejected at Gate G2
    const rogueTrace = result.candidateTraces.find(t => t.generatorId === 'GEN-ROGUE-EVIDENCE-001');
    expect(rogueTrace).toBeDefined();
    expect(rogueTrace?.suppressionReason).toBe('EVIDENCE_PATH_NOT_PERMITTED');

    const g2Eval = rogueTrace?.gateEvaluations.find(g => g.gateCode === 'G2_EVIDENCE_PATH');
    expect(g2Eval?.result).toBe('fail');
    expect(g2Eval?.reasonCodes).toContain(
      'EVIDENCE_PATH_NOT_PERMITTED:UNAUTHORIZED_FABRICATED_PATH_999',
    );

    // Rogue candidate must NOT be present in primary candidates
    const inPrimary = result.slate.primaryCandidates.some(
      r => r.targetCandidateId === rogueSuppressed?.id,
    );
    expect(inPrimary).toBe(false);
  });

  it('rejects candidate drafts with research_permitted evidence paths when running in clinical mode', () => {
    // Setup context where an evidence path is research_permitted only
    const context = createCanonicalResolvedContextV2({
      request: {
        mode: 'clinical',
      } as any,
      permittedEvidencePaths: [
        {
          id: 'PATH-RESEARCH-ONLY-01',
          indicationModuleReleaseId: MDD_MODULE_RELEASE_ID,
          evidenceClaimIds: ['CLAIM-EXP-01'],
          populationId: 'POP-ADULT-TRD',
          clinicalObjectiveId: '00000000-0000-0000-0000-000000000040',
          targetFamilyId: 'TF-MDD-LDLPFC-EST-001',
          targetingStrategyId: 'STRAT-RESEARCH',
          targetGeometryType: 'point',
          governanceClassificationIds: ['GOV-CLASS-RESEARCH'],
          pathStatus: 'research_permitted', // NOT clinical_permitted!
          provenance: {
            createdBy: 'test',
            createdAt: '2026-09-02T12:00:00.000Z',
            softwareVersion: '2.0.0',
          },
        },
      ],
    });

    const researchPathGenerator: CandidateGenerator = {
      descriptor: {
        id: 'GEN-RESEARCH-PATH-001',
        code: 'RESEARCH_PATH_GEN',
        semanticVersion: '1.0.0',
        indicationModuleReleaseIds: [MDD_MODULE_RELEASE_ID],
        candidateRoles: ['evidence_anchor'],
        targetFamilyScopeIds: ['TF-MDD-LDLPFC-EST-001'],
        evidencePathStatusScope: ['research_permitted'],
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
          generatorId: 'GEN-RESEARCH-PATH-001',
          generatorVersion: '1.0.0',
          status: 'generated',
          candidates: [
            {
              draftId: 'draft-research-path',
              generatorId: 'GEN-RESEARCH-PATH-001',
              targetFamilyId: 'TF-MDD-LDLPFC-EST-001',
              proposedRole: 'evidence_anchor',
              targetGeometry: createCanonicalPointGeometry(-44, 40, 28, 'left', 'test'),
              evidencePathIds: ['PATH-RESEARCH-ONLY-01'],
              clinicalObjectiveIds: ['00000000-0000-0000-0000-000000000040'],
              reliedOnMeasurementIds: [],
              reliedOnReliabilityIds: [],
              lineage: { lineageType: 'evidence_baseline' },
              rawScientificFeatures: [],
              generatorLimitations: [],
              nominationRationale: 'Candidate referencing research-permitted evidence path.',
              generatorTrace: { algorithmCode: 'TEST', algorithmVersion: '1.0.0' },
            },
          ],
        };
      },
    };

    class TestPlugin extends MDDPlugin {
      override generators(): readonly CandidateGenerator[] {
        return [researchPathGenerator];
      }
    }

    const result = runTargetEngineV2(context, { plugin: new TestPlugin() });

    // Candidates using PATH-RESEARCH-ONLY-01 must fail Gate G2
    const supp = result.suppressedCandidates.find(
      c => c.provenance.createdBy === 'GEN-RESEARCH-PATH-001',
    );
    expect(supp).toBeDefined();

    const trace = result.candidateTraces.find(t => t.candidateId === supp?.id);
    const g2 = trace?.gateEvaluations.find(g => g.gateCode === 'G2_EVIDENCE_PATH');
    expect(g2?.result).toBe('fail');
    expect(g2?.reasonCodes.some(r => r.includes('EVIDENCE_PATH_NOT_CLINICAL_PERMITTED'))).toBe(
      true,
    );
  });
});
