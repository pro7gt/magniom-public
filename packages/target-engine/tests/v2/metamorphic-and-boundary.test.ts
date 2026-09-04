/**
 * @magniom/target-engine - Specification Verification Test Suite
 * MAGNIOM-Target Engine & Ranking Algorithm Specification v2.0
 * Section 151: BOUNDARY TESTING & Section 152: METAMORPHIC TESTS
 *
 * Standard Reference: IEC 62304 Class C / ISO 14971 Risk Controls
 */

import { describe, it, expect } from 'vitest';
import {
  runTargetEngineV2,
  createCanonicalResolvedContextV2,
  createCanonicalPointGeometry,
  evaluateRefinements,
  suppressRedundantCandidatesV2,
  type CandidateDraft,
  type CandidateGenerator,
  type RefinementProfileDefinition,
  MDDPlugin,
} from '../../src/index.js';
import { evaluateGateG5 } from '../../src/gates/v2/g5-reliability.js';
import { evaluateGateG6 } from '../../src/gates/v2/g6-anatomy-lesion.js';

describe('Target Engine Spec v2.0 §151: Numerical Boundary Testing (T - ε, T, T + ε)', () => {
  // 1. Reliability Boundary Testing (Threshold T = 0.70)
  describe('Reliability Qualification Boundary (§26-27, §151)', () => {
    function buildRefinedDraft(): CandidateDraft {
      return {
        draftId: 'draft-refined-test',
        generatorId: 'GEN-TEST-001',
        targetFamilyId: 'TF-MDD-LDLPFC-EST-001',
        proposedRole: 'connectome_refinement',
        targetGeometry: createCanonicalPointGeometry(-40, 46, 32, 'left', 'refined-pt'),
        evidencePathIds: ['PATH-MDD-BA46'],
        clinicalObjectiveIds: ['OBJ-01'],
        reliedOnMeasurementIds: ['MEAS-01'],
        reliedOnReliabilityIds: ['REL-01'],
        lineage: {
          lineageType: 'measurement_refinement',
          refinementKind: 'functional_connectivity',
          baselineCandidateDraftId: 'draft-base-001',
        },
        rawScientificFeatures: [{ code: 'circuit_concordance', value: 0.85, isApplicable: true }],
        generatorLimitations: [],
        nominationRationale: 'Refined candidate for boundary testing',
        generatorTrace: { algorithmCode: 'FC_REF', algorithmVersion: '1.0.0' },
      };
    }

    it('fails gate G5 when reliability bundle overall qualification is unreliable', () => {
      const draft = buildRefinedDraft();
      const subThresholdContext = createCanonicalResolvedContextV2({
        reliabilityBundle: {
          id: 'REL-BUNDLE-BOUND-01',
          version: '2.0.0',
          caseId: 'CASE-01',
          caseIndicationId: 'IND-01',
          measurementBundleId: 'MEAS-BUNDLE-01',
          overallQualification: 'unreliable',
          capabilityQualification: [
            {
              capabilityCode: 'individual_fc_refinement',
              status: 'unreliable',
              limitations: ['Motion artifact SNR below 0.70 threshold'],
            },
          ],
        },
      });

      const gateResult = evaluateGateG5(draft, subThresholdContext);
      expect(gateResult.result).toBe('fail');
      expect(gateResult.reasonCodes).toContain('RELIABILITY_QUALIFICATION_FAILED');
    });

    it('passes gate G5 when reliability bundle meets qualified status', () => {
      const draft = buildRefinedDraft();
      const atThresholdContext = createCanonicalResolvedContextV2({
        reliabilityBundle: {
          id: 'REL-BUNDLE-BOUND-02',
          version: '2.0.0',
          caseId: 'CASE-01',
          caseIndicationId: 'IND-01',
          measurementBundleId: 'MEAS-BUNDLE-01',
          overallQualification: 'qualified',
          capabilityQualification: [
            {
              capabilityCode: 'individual_fc_refinement',
              status: 'qualified',
              limitations: [],
            },
          ],
        },
      });

      const gateResult = evaluateGateG5(draft, atThresholdContext);
      expect(gateResult.result).toBe('pass');
    });
  });

  // 2. Incremental Value Boundary Testing (Threshold T = 0.10)
  describe('Refinement Incremental Value Boundary (§92-93, §151)', () => {
    const EPSILON = 0.001;
    const INCREMENTAL_THRESHOLD = 0.1;

    function buildDraftPair(deltaGain: number): [CandidateDraft, CandidateDraft] {
      const baseDraft: CandidateDraft = {
        draftId: 'draft-base-001',
        generatorId: 'GEN-BASE-001',
        targetFamilyId: 'TF-MDD-LDLPFC-EST-001',
        proposedRole: 'evidence_anchor',
        targetGeometry: createCanonicalPointGeometry(-42, 44, 30, 'left', 'baseline-anchor'),
        evidencePathIds: ['PATH-MDD-BA46'],
        clinicalObjectiveIds: ['OBJ-01'],
        reliedOnMeasurementIds: [],
        reliedOnReliabilityIds: [],
        rawScientificFeatures: [{ code: 'circuit_concordance', value: 0.7, isApplicable: true }],
        generatorLimitations: [],
        nominationRationale: 'Evidence anchor',
        generatorTrace: { algorithmCode: 'BASE', algorithmVersion: '1.0.0' },
      };

      const refDraft: CandidateDraft = {
        draftId: 'draft-ref-001',
        generatorId: 'GEN-REF-001',
        targetFamilyId: 'TF-MDD-LDLPFC-EST-001',
        proposedRole: 'connectome_refinement',
        targetGeometry: createCanonicalPointGeometry(-40, 46, 32, 'left', 'refined-pt'),
        evidencePathIds: ['PATH-MDD-BA46'],
        clinicalObjectiveIds: ['OBJ-01'],
        reliedOnMeasurementIds: ['MEAS-01'],
        reliedOnReliabilityIds: ['REL-01'],
        lineage: {
          lineageType: 'measurement_refinement',
          refinementKind: 'functional_connectivity',
          baselineCandidateDraftId: 'draft-base-001',
        },
        rawScientificFeatures: [
          { code: 'circuit_concordance', value: 0.7 + deltaGain, isApplicable: true },
        ],
        generatorLimitations: [],
        nominationRationale: 'FC refined',
        generatorTrace: { algorithmCode: 'FC_REF', algorithmVersion: '1.0.0' },
      };

      return [baseDraft, refDraft];
    }

    const testProfiles: readonly RefinementProfileDefinition[] = [
      {
        id: 'PROF-FC-REF-001',
        code: 'MDD_FC_REFINEMENT',
        refinementKind: 'functional_connectivity',
        baselineRole: 'evidence_anchor',
        refinedRole: 'connectome_refinement',
        requiredCapabilities: ['individual_fc_refinement'],
        adoptionRules: [
          {
            ruleCode: 'MIN_INCREMENTAL_VALUE',
            description: 'Incremental value threshold test',
            minIncrementalValue: INCREMENTAL_THRESHOLD,
          },
          {
            ruleCode: 'MAX_DISPLACEMENT',
            description: 'Max displacement limit',
            maxDisplacementMm: 20.0,
          },
        ],
        displacementMetric: 'euclidean',
        scientificPolicyReleaseId: 'POL-001',
      },
    ];

    it('retains baseline when incremental gain is threshold - ε (0.099)', () => {
      const [baseDraft, refDraft] = buildDraftPair(INCREMENTAL_THRESHOLD - EPSILON);
      const context = createCanonicalResolvedContextV2();

      const result = evaluateRefinements([baseDraft, refDraft], testProfiles, context);

      expect(result.decisions.length).toBe(1);
      expect(result.decisions[0]!.status).toBe('baseline_retained');
      expect(result.preferredCandidateIds).toContain(baseDraft.draftId);
    });

    it('adopts refined candidate when incremental gain is threshold + ε (0.101)', () => {
      const [baseDraft, refDraft] = buildDraftPair(INCREMENTAL_THRESHOLD + EPSILON);
      const context = createCanonicalResolvedContextV2();

      const result = evaluateRefinements([baseDraft, refDraft], testProfiles, context);

      expect(result.decisions.length).toBe(1);
      expect(result.decisions[0]!.status).toBe('adopted');
      expect(result.preferredCandidateIds).toContain(refDraft.draftId);
    });
  });

  // 3. Somatotopic Redundancy Boundary Testing (Threshold T = 15.0 mm)
  describe('Somatotopic Redundancy Boundary (§98-100, §151)', () => {
    const EPSILON = 0.5;
    const REDUNDANCY_DISTANCE_MM = 15.0;

    function buildDrafts(distanceMm: number): [CandidateDraft, CandidateDraft] {
      const draftA: CandidateDraft = {
        draftId: 'draft-m1-a',
        generatorId: 'GEN-M1',
        targetFamilyId: 'TF-PAIN-M1-HAND',
        proposedRole: 'evidence_anchor',
        targetGeometry: createCanonicalPointGeometry(-35, -25, 60, 'left', 'hand-a'),
        evidencePathIds: ['PATH-PAIN-M1'],
        clinicalObjectiveIds: ['OBJ-01'],
        reliedOnMeasurementIds: [],
        reliedOnReliabilityIds: [],
        rawScientificFeatures: [],
        generatorLimitations: [],
        nominationRationale: 'Somatotopic A',
        generatorTrace: { algorithmCode: 'M1', algorithmVersion: '1.0' },
      };

      const draftB: CandidateDraft = {
        ...draftA,
        draftId: 'draft-m1-b',
        targetGeometry: createCanonicalPointGeometry(-35 + distanceMm, -25, 60, 'left', 'hand-b'),
        nominationRationale: 'Somatotopic B',
      };

      return [draftA, draftB];
    }

    it('suppresses proximal candidate at threshold - ε (14.5 mm)', () => {
      const [draftA, draftB] = buildDrafts(REDUNDANCY_DISTANCE_MM - EPSILON); // 14.5mm
      const result = suppressRedundantCandidatesV2([draftA, draftB], REDUNDANCY_DISTANCE_MM);

      expect(result.suppressedCandidates.map(c => c.draftId)).toContain(draftB.draftId);
      expect(result.survivingCandidates.map(c => c.draftId)).toContain(draftA.draftId);
      expect(result.redundancyAssessments[0]!.isRedundant).toBe(true);
    });

    it('retains both candidates as non-redundant at threshold + ε (15.5 mm)', () => {
      const [draftA, draftB] = buildDrafts(REDUNDANCY_DISTANCE_MM + EPSILON); // 15.5mm
      const result = suppressRedundantCandidatesV2([draftA, draftB], REDUNDANCY_DISTANCE_MM);

      expect(result.suppressedCandidates).toHaveLength(0);
      expect(result.survivingCandidates.map(c => c.draftId)).toContain(draftA.draftId);
      expect(result.survivingCandidates.map(c => c.draftId)).toContain(draftB.draftId);
      expect(result.redundancyAssessments[0]!.isRedundant).toBe(false);
    });
  });

  // 4. Lesion Proximity Boundary Testing (Threshold T = 35.0 mm cortical depth)
  describe('Lesion & Accessibility Clearance Boundary (§28-29, §151)', () => {
    it('fails gate G6 when cortical depth exceeds 35mm accessibility bound', () => {
      const deepDraft: CandidateDraft = {
        draftId: 'draft-deep',
        generatorId: 'GEN-01',
        targetFamilyId: 'TF-01',
        proposedRole: 'evidence_anchor',
        targetGeometry: createCanonicalPointGeometry(-30, -20, 50, 'left', 'deep-pt'),
        evidencePathIds: ['PATH-01'],
        clinicalObjectiveIds: ['OBJ-01'],
        reliedOnMeasurementIds: [],
        reliedOnReliabilityIds: [],
        rawScientificFeatures: [
          { code: 'cortical_depth_mm', value: 36.5, isApplicable: true }, // Exceeds 35mm
        ],
        generatorLimitations: [],
        nominationRationale: 'Deep candidate',
        generatorTrace: { algorithmCode: 'TEST', algorithmVersion: '1.0' },
      };

      const context = createCanonicalResolvedContextV2();
      const evaluation = evaluateGateG6(deepDraft, context);
      expect(evaluation.result).toBe('fail');
      expect(evaluation.reasonCodes.some(r => r.includes('CORTICAL_DEPTH_EXCEEDED'))).toBe(true);
    });

    it('fails gate G6 when target region is marked destroyed or absent in lesion context', () => {
      const draft: CandidateDraft = {
        draftId: 'draft-lesion',
        generatorId: 'GEN-01',
        targetFamilyId: 'TF-01',
        proposedRole: 'evidence_anchor',
        targetGeometry: createCanonicalPointGeometry(-30, -20, 50, 'left', 'motor-rim'),
        evidencePathIds: ['PATH-01'],
        clinicalObjectiveIds: ['OBJ-01'],
        reliedOnMeasurementIds: [],
        reliedOnReliabilityIds: [],
        rawScientificFeatures: [{ code: 'cortical_depth_mm', value: 15.0, isApplicable: true }],
        generatorLimitations: [],
        nominationRationale: 'Lesion rim candidate',
        generatorTrace: { algorithmCode: 'TEST', algorithmVersion: '1.0' },
      };

      const contextWithDestruction = createCanonicalResolvedContextV2({
        lesionContexts: [
          {
            id: 'LESION-01',
            version: '2.0.0',
            caseId: 'CASE-01',
            caseIndicationId: 'IND-01',
            lesionType: 'ischemic_stroke',
            laterality: 'left',
            vascularTerritory: 'mca_superior',
            volumeMm3: 45000,
            registrationQuality: 'qualified',
            targetRegionExclusions: ['M1_HAND_DESTROYED'],
            tissueIntegrityAssessment: 'severely_altered',
            distanceToEligibleTissueMm: 0,
            provenance: {
              createdBy: 'magniom',
              createdAt: '2026-09-02T12:00:00.000Z',
              softwareVersion: '2.0.0',
            },
          },
        ],
      });

      const evaluation = evaluateGateG6(draft, contextWithDestruction);
      expect(evaluation.result).toBe('fail');
      expect(evaluation.reasonCodes).toContain('TARGET_REGION_DESTROYED_OR_ABSENT');
    });
  });
});

describe('Target Engine Spec v2.0 §152: Metamorphic Invariant Relations', () => {
  // Relation 1: Increase Irrelevant Metadata -> Zero Scientific Change
  it('Metamorphic Relation 1: Increasing irrelevant metadata produces identical slate candidate geometries and roles', () => {
    const baseContext = createCanonicalResolvedContextV2();
    const baseResult = runTargetEngineV2(baseContext);

    // Add noisy operational metadata to request
    const noisyContext = createCanonicalResolvedContextV2({
      request: {
        ...baseContext.request,
        requestedAt: '2026-09-04T23:59:59.999Z', // Different timestamp
      },
      phenotypeSnapshot: {
        ...baseContext.phenotypeSnapshot,
        confirmedAt: '2026-09-04T12:00:00.000Z', // Irrelevant audit metadata
      },
    });

    const noisyResult = runTargetEngineV2(noisyContext);

    // Primary candidate count, candidate roles, and targetCandidateIds must be exactly identical
    expect(noisyResult.slate.primaryCandidates.length).toBe(
      baseResult.slate.primaryCandidates.length,
    );
    expect(noisyResult.slate.primaryCandidates.map(c => c.targetCandidateId)).toEqual(
      baseResult.slate.primaryCandidates.map(c => c.targetCandidateId),
    );
    expect(noisyResult.slate.primaryCandidates.map(c => c.role)).toEqual(
      baseResult.slate.primaryCandidates.map(c => c.role),
    );
  });

  // Relation 2: Add Research-Only Generator in Clinical Run -> Zero Clinical Leakage
  it('Metamorphic Relation 2: Adding an unpermitted Research-only generator in Clinical run leaves clinical slate unaltered', () => {
    const baseContext = createCanonicalResolvedContextV2();
    const baseResult = runTargetEngineV2(baseContext);

    const researchGen: CandidateGenerator = {
      descriptor: {
        id: 'GEN-METAMORPHIC-RES-01',
        code: 'RESEARCH_HYPOTHESIS_GEN',
        semanticVersion: '1.0.0',
        indicationModuleReleaseIds: [baseContext.indicationModule.id],
        candidateRoles: ['research_hypothesis'],
        targetFamilyScopeIds: ['TF-MDD-LDLPFC-EST-001'],
        evidencePathStatusScope: ['research_permitted'],
        permittedModes: ['research'], // Research mode only
        requiredCapabilities: [],
        optionalCapabilities: [],
        permittedGeometryTypes: ['point'],
        baselineRelationship: 'independent_hypothesis',
        deterministic: true,
        generatorFailurePolicy: 'research_optional',
      },
      generate(_ctx) {
        return {
          generatorId: 'GEN-METAMORPHIC-RES-01',
          generatorVersion: '1.0.0',
          status: 'generated',
          candidates: [
            {
              draftId: 'draft-metamorphic-res',
              generatorId: 'GEN-METAMORPHIC-RES-01',
              targetFamilyId: 'TF-MDD-LDLPFC-EST-001',
              proposedRole: 'research_hypothesis',
              targetGeometry: createCanonicalPointGeometry(-38, 44, 30, 'left', 'research-pt'),
              evidencePathIds: ['PATH-MDD-BA46'],
              clinicalObjectiveIds: baseContext.request.clinicalObjectiveIds,
              reliedOnMeasurementIds: [],
              reliedOnReliabilityIds: [],
              lineage: { lineageType: 'experimental_protocol' },
              rawScientificFeatures: [],
              generatorLimitations: ['Research only'],
              nominationRationale: 'Research exploratory',
              generatorTrace: { algorithmCode: 'RES_01', algorithmVersion: '1.0.0' },
            },
          ],
        };
      },
    };

    class PluginWithResearchGen extends MDDPlugin {
      override generators(): readonly CandidateGenerator[] {
        return [...super.generators(), researchGen];
      }
    }

    const resultWithResearchGen = runTargetEngineV2(baseContext, {
      plugin: new PluginWithResearchGen(),
    });

    // The research generator MUST NOT alter or appear in the clinical slate
    expect(resultWithResearchGen.slate.primaryCandidates.map(c => c.targetCandidateId)).toEqual(
      baseResult.slate.primaryCandidates.map(c => c.targetCandidateId),
    );
    expect(resultWithResearchGen.slate.payloadSha256).toBe(baseResult.slate.payloadSha256);
  });

  // Relation 3: Permuting UI presentation ordering -> Invariant Target Engine Output
  it('Metamorphic Relation 3: Permuting candidate generator declaration order produces identical slate candidates', () => {
    const context = createCanonicalResolvedContextV2();
    const resultNormal = runTargetEngineV2(context);

    // Create a plugin that returns generators in reversed order
    class PermutedPlugin extends MDDPlugin {
      override generators(): readonly CandidateGenerator[] {
        return [...super.generators()].reverse();
      }
    }

    const resultPermuted = runTargetEngineV2(context, { plugin: new PermutedPlugin() });

    // Despite inverse generator execution, internal sorting and slating rules produce identical slates
    expect(resultPermuted.slate.primaryCandidates.map(c => c.targetCandidateId)).toEqual(
      resultNormal.slate.primaryCandidates.map(c => c.targetCandidateId),
    );
    expect(resultPermuted.slate.status).toBe(resultNormal.slate.status);
  });

  // Relation 4: Add Optional Unused Measurement -> Zero Change to Clinical Candidate Scoring
  it('Metamorphic Relation 4: Adding optional unused measurement modality leaves candidate geometries and slate unchanged', () => {
    const baseContext = createCanonicalResolvedContextV2();
    const baseResult = runTargetEngineV2(baseContext);

    // Add an unused audiology measurement to the measurement bundle
    const contextWithUnusedMeasurement = createCanonicalResolvedContextV2({
      measurementBundle: {
        ...baseContext.measurementBundle,
        measurements: [
          ...baseContext.measurementBundle.measurements,
          {
            measurementId: 'MEAS-AUDIOLOGY-UNUSED-01',
            modality: 'audiology', // Not used by MDD generators
            version: '2.0.0',
            status: 'qualified',
          },
        ],
      },
    });

    const resultWithUnused = runTargetEngineV2(contextWithUnusedMeasurement);

    expect(resultWithUnused.slate.primaryCandidates.map(c => c.targetCandidateId)).toEqual(
      baseResult.slate.primaryCandidates.map(c => c.targetCandidateId),
    );
    expect(resultWithUnused.slate.payloadSha256).toBe(baseResult.slate.payloadSha256);
  });

  // Relation 5: Permuting Input Context Arrays -> Identical Output Slate Determination
  it('Metamorphic Relation 5: Permuting permitted target families preserves slate structure and candidate set', () => {
    const baseContext = createCanonicalResolvedContextV2();
    const baseResult = runTargetEngineV2(baseContext);

    const permutedContext = createCanonicalResolvedContextV2({
      permittedTargetFamilies: [...baseContext.permittedTargetFamilies].reverse(),
    });

    const permutedResult = runTargetEngineV2(permutedContext);

    expect(permutedResult.slate.primaryCandidates.map(c => c.targetCandidateId)).toEqual(
      baseResult.slate.primaryCandidates.map(c => c.targetCandidateId),
    );
    expect(permutedResult.slate.status).toBe(baseResult.slate.status);
  });
});
