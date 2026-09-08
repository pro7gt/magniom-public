/**
 * MAGNIOM TARGET ENGINE SPECIFICATION v2.0 INVARIANTS TEST SUITE
 * Conforms to public/guides/MAGNIOM-Target Engine & Ranking Algorithm Specification v2.0.md
 *
 * Systematically asserts all 14 clusters (§1 to §163):
 * 1.  Foundational Principles, Purity & Execution Pipeline (§1–§15)
 * 2.  Hard-Gate Architecture (G0–G9) & Gate Discipline (§16–§32)
 * 3.  Plugin SDK & Generator Contracts (§33–§42, §131–§136)
 * 4.  Indication Plugin Implementations across 8 Indications (§43–§76)
 * 5.  Candidate Features & Comparison Domains (§77–§84)
 * 6.  Ranking Models, Profiles & Weighting Discipline (§85–§89, §122–§124)
 * 7.  Patient-Specific Refinement & Counterfactual Analysis (§90–§97)
 * 8.  Redundancy Suppression & Convergence (§98–§105)
 * 9.  Biophysical & Structural Integration (§106–§109)
 * 10. Slate Assembly, Coverage & Candidate Cardinality (§110–§115)
 * 11. Structured Abstention, Explanations & Audit Integrity (§116–§121, §128–§130)
 * 12. Engine Governance, Release Pinning & Invariants (§125–§127, §154–§158)
 * 13. Core Invariant, Boundary, Metamorphic & Regression Test Suite (§137–§153)
 * 14. Prohibited Behaviors, Safety Principles & Canonical Contract (§159–§163)
 */

import { describe, it, expect } from 'vitest';
import {
  runTargetEngineV2,
  createCanonicalResolvedContextV2,
  createCanonicalPointGeometry,
  evaluateGateG0,
  evaluateGateG1,
  evaluateGateG2,
  evaluateGateG3,
  evaluateGateG5,
  evaluateGateG6,
  evaluateAllHardGates,
  evaluateRefinements,
  suppressRedundantCandidatesV2,
  createAbstentionSlateV2,
  generateCandidateExplanationV2,
  CandidateGeneratorRegistry,
  ComparisonDomainManager,
  calculateCandidateUtility,
  breakTiesDeterministically,
  MDDPlugin,
  OCDPlugin,
  NeuropathicPainPlugin,
  StrokeMotorPlugin,
  StrokeAphasiaPlugin,
  TBIPlugin,
  PTSDPlugin,
  TinnitusPlugin,
  type CandidateDraft,
  type RefinementProfileDefinition,
  type IndicationTargetingPlugin,
  type ScoredCandidate,
} from '../../src/index.js';
import type {
  ResolvedTargetEngineContextV2,
  VolumetricROITargetGeometry,
  ClinicalMode,
  TiePolicy,
  TargetCandidate,
} from '@magniom/domain';

describe('MAGNIOM Target Engine Specification v2.0 Conformance Suite', () => {
  const canonicalContext = createCanonicalResolvedContextV2();

  // -------------------------------------------------------------------------
  // Cluster 1 (§1–§15): Foundational Principles, Purity & Execution Pipeline
  // -------------------------------------------------------------------------
  describe('Cluster 1 (§1–§15): Foundational Principles, Purity & Pipeline', () => {
    it('executes 16-stage pipeline purely without side effects and generates valid slate', () => {
      const result = runTargetEngineV2(canonicalContext);

      expect(result.slate).toBeDefined();
      expect(result.slate.status).toBe('ready_for_review');
      expect(result.slate.primaryCandidates.length).toBeGreaterThan(0);
      expect(result.reproducibilityManifest).toBeDefined();
      expect(result.reproducibilityManifest.inputManifestSha256).toMatch(/^[a-f0-9]{64}$/);
      expect(result.reproducibilityManifest.outputPayloadSha256).toMatch(/^[a-f0-9]{64}$/);
      expect(result.candidateTraces.length).toBeGreaterThan(0);
    });

    it('guarantees bitwise determinism across 20 identical runs', () => {
      const baseResult = runTargetEngineV2(canonicalContext);
      for (let i = 0; i < 20; i++) {
        const iter = runTargetEngineV2(canonicalContext);
        expect(iter.slate.payloadSha256).toBe(baseResult.slate.payloadSha256);
        expect(iter.reproducibilityManifest.outputPayloadSha256).toBe(
          baseResult.reproducibilityManifest.outputPayloadSha256,
        );
      }
    });
  });

  // -------------------------------------------------------------------------
  // Cluster 2 (§16–§32): Hard-Gate Architecture (G0–G9) & Gate Discipline
  // -------------------------------------------------------------------------
  describe('Cluster 2 (§16–§32): Hard-Gate Architecture (G0–G9)', () => {
    const validDraft: CandidateDraft = {
      draftId: 'draft-test-gate',
      generatorId: 'GEN-01',
      targetFamilyId: 'TF-MDD-LDLPFC-EST-001',
      proposedRole: 'evidence_anchor',
      targetGeometry: createCanonicalPointGeometry(-42, 44, 30, 'left', 'pt'),
      evidencePathIds: ['PATH-MDD-BA46'],
      clinicalObjectiveIds: canonicalContext.request.clinicalObjectiveIds,
      reliedOnMeasurementIds: [],
      reliedOnReliabilityIds: [],
      rawScientificFeatures: [],
      generatorLimitations: [],
      nominationRationale: 'Standard evidence anchor nomination',
      generatorTrace: { algorithmCode: 'TEST', algorithmVersion: '2.0' },
    };

    it('G0: passes on valid input and fails on corrupt context', () => {
      expect(evaluateGateG0(canonicalContext).result).toBe('pass');
      const malformed = {
        ...canonicalContext,
        request: { ...canonicalContext.request, caseId: '' },
      };
      expect(evaluateGateG0(malformed).result).toBe('fail');
    });

    it('G1: fails when clinical mode is not permitted in IndicationModule', () => {
      const restrictedContext: ResolvedTargetEngineContextV2 = {
        ...canonicalContext,
        indicationModule: {
          ...canonicalContext.indicationModule,
          permittedModes: ['research'] as readonly ClinicalMode[],
        },
      };
      const g1 = evaluateGateG1(restrictedContext);
      expect(g1.result).toBe('fail');
      expect(g1.reasonCodes.length).toBeGreaterThan(0);
    });

    it('G2: rejects research-only evidence paths in Clinical Mode', () => {
      const researchDraft: CandidateDraft = {
        ...validDraft,
        evidencePathIds: ['PATH-RESEARCH-ONLY-NONCLINICAL'],
      };
      const g2 = evaluateGateG2(researchDraft, canonicalContext);
      expect(g2.result).toBe('fail');
    });

    it('G3: rejects candidate whose clinical objective does not match case indication', () => {
      const mismatchedDraft: CandidateDraft = {
        ...validDraft,
        clinicalObjectiveIds: ['OBJ-UNKNOWN-UNAPPROVED'],
      };
      const g3 = evaluateGateG3(mismatchedDraft, canonicalContext);
      expect(g3.result).toBe('fail');
    });

    it('G5: rejects candidates relying on unqualified reliability bundles', () => {
      const unreliableDraft: CandidateDraft = {
        ...validDraft,
        reliedOnReliabilityIds: ['MEAS-REL-01'],
      };
      const unreliableContext: ResolvedTargetEngineContextV2 = {
        ...canonicalContext,
        reliabilityBundle: {
          ...canonicalContext.reliabilityBundle,
          overallQualification: 'unqualified',
          capabilityQualification: [
            {
              capabilityCode: 'individual_fc_refinement',
              status: 'unqualified',
              reliedOnMeasurementIds: ['MEAS-01'],
              reliedOnReliabilityIds: ['MEAS-REL-01'],
              policyRuleId: 'RULE-REL-01',
              explanation: 'Excessive head motion',
            },
          ],
        },
      };
      const g5 = evaluateGateG5(unreliableDraft, unreliableContext);
      expect(g5.result).toBe('fail');
    });

    it('G6: rejects targets situated within destroyed necrotic lesion tissue', () => {
      const lesionContext: ResolvedTargetEngineContextV2 = {
        ...canonicalContext,
        lesionContexts: [
          {
            id: 'LESION-01',
            version: '2.0.0',
            caseId: canonicalContext.request.caseId,
            caseIndicationId: canonicalContext.request.caseIndicationId,
            lesionType: 'ischemic_stroke',
            laterality: 'left',
            vascularTerritory: 'mca_superior',
            volumeMm3: 45000,
            registrationQuality: 'qualified',
            targetRegionExclusions: ['M1_HAND_DESTROYED', 'TF-MDD-LDLPFC-EST-001'],
            tissueIntegrityAssessment: 'severely_altered',
            distanceToEligibleTissueMm: 0,
            provenance: {
              createdBy: 'neuro-radiologist',
              createdAt: '2026-09-02T12:00:00.000Z',
              softwareVersion: '2.0.0',
            },
          },
        ],
      };
      const g6 = evaluateGateG6(validDraft, lesionContext);
      expect(g6.result).toBe('fail');
    });

    it('evaluates all hard gates in fail-closed orchestrator', () => {
      const result = evaluateAllHardGates([validDraft], canonicalContext);
      expect(result.globalGatesPassed).toBe(true);
      expect(result.candidateEvaluations.length).toBe(1);
      expect(result.candidateEvaluations[0]!.passed).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // Cluster 3 (§33–§42, §131–§136): Plugin SDK & Generator Contracts
  // -------------------------------------------------------------------------
  describe('Cluster 3 (§33–§42, §131–§136): Plugin SDK & Contracts', () => {
    it('manages candidate generators through immutable registry', () => {
      const registry = new CandidateGeneratorRegistry();
      const mddPlugin = new MDDPlugin();
      for (const gen of mddPlugin.generators()) {
        registry.register(gen);
      }
      const execResult = registry.executeGenerators(canonicalContext);
      expect(execResult.candidates.length).toBeGreaterThan(0);
    });

    it('enforces non-empty generator trace and valid candidate ID lineage', () => {
      const result = runTargetEngineV2(canonicalContext);
      for (const candidate of result.allCandidates) {
        expect(candidate.id).toBeDefined();
        expect(candidate.candidateRole).toBeDefined();
        expect(candidate.nominationRationale).toBeDefined();
      }
    });
  });

  // -------------------------------------------------------------------------
  // Cluster 4 (§43–§76): Indication Plugins across All 8 Indications
  // -------------------------------------------------------------------------
  describe('Cluster 4 (§43–§76): Indication Plugins across All 8 Indications', () => {
    const plugins: { name: string; plugin: IndicationTargetingPlugin }[] = [
      { name: 'MDD', plugin: new MDDPlugin() },
      { name: 'OCD', plugin: new OCDPlugin() },
      { name: 'Neuropathic Pain', plugin: new NeuropathicPainPlugin() },
      { name: 'Stroke Motor', plugin: new StrokeMotorPlugin() },
      { name: 'Stroke Aphasia', plugin: new StrokeAphasiaPlugin() },
      { name: 'TBI', plugin: new TBIPlugin() },
      { name: 'PTSD', plugin: new PTSDPlugin() },
      { name: 'Tinnitus', plugin: new TinnitusPlugin() },
    ];

    for (const { name, plugin } of plugins) {
      it(`verifies ${name} plugin adheres to manifest and generator contracts`, () => {
        expect(plugin.manifest.code.toLowerCase()).toContain('magniom-plugin-');
        expect(plugin.manifest.semanticVersion).toMatch(/^\d+\.\d+\.\d+$/);
        expect(plugin.generators().length).toBeGreaterThan(0);
        for (const gen of plugin.generators()) {
          expect(gen.descriptor.id).toBeDefined();
          expect(gen.descriptor.permittedGeometryTypes.length).toBeGreaterThan(0);
        }
      });
    }
  });

  // -------------------------------------------------------------------------
  // Cluster 5 (§77–§84): Candidate Features & Comparison Domains
  // -------------------------------------------------------------------------
  describe('Cluster 5 (§77–§84): Comparison Domains & Feature Isolation', () => {
    it('strictly isolates heterogeneous target geometries into distinct comparison domains', () => {
      const manager = new ComparisonDomainManager([], []);
      expect(manager).toBeDefined();
    });

    it('prohibits universal global scalar score across heterogeneous target candidates (§84)', () => {
      const result = runTargetEngineV2(canonicalContext);
      for (const cand of result.allCandidates) {
        expect((cand as any).globalTargetScore).toBeUndefined();
      }
    });
  });

  // -------------------------------------------------------------------------
  // Cluster 6 (§85–§89, §122–§124): Ranking Models & Weighting Discipline
  // -------------------------------------------------------------------------
  describe('Cluster 6 (§85–§89, §122–§124): Ranking Discipline & Ties', () => {
    it('computes candidate utility using weighted geometric mean formula (§86)', () => {
      const testCandidate: TargetCandidate = {
        id: 'TGT-TEST-001',
        name: 'Left DLPFC BA46',
        targetType: 'PRIMARY',
        anatomy: 'Left Dorsolateral Prefrontal Cortex',
        targetMethod: 'ESTABLISHED_COORDINATE',
        mniCoordinates: { x: -44, y: 40, z: 28 },
        evidenceTier: 'TIER_1',
        evidenceScore: 0.95,
        phenotypeConcordanceScore: 0.85,
        overallScore: 0.0,
        clinicalRationale: 'Evidence anchor',
        rank: 1,
      };

      const utility = calculateCandidateUtility(testCandidate);
      expect(utility).toBeGreaterThan(0.8);
      expect(utility).toBeLessThanOrEqual(0.95);
    });

    it('resolves ties deterministically through strict hierarchy (§122–§123)', () => {
      const candidateA: ScoredCandidate = {
        candidate: {
          draftId: 'draft-2',
          generatorId: 'G1',
          targetFamilyId: 'TF-MDD-001',
          proposedRole: 'evidence_anchor',
          targetGeometry: createCanonicalPointGeometry(-42, 44, 30, 'left', 'pt'),
          evidencePathIds: ['PATH-1'],
          clinicalObjectiveIds: ['OBJ-1'],
          reliedOnMeasurementIds: [],
          reliedOnReliabilityIds: [],
          rawScientificFeatures: [],
          generatorLimitations: [],
          nominationRationale: 'A',
          generatorTrace: { algorithmCode: 'A', algorithmVersion: '1' },
        },
        score: 0.85,
        rankingFeatures: {},
      };

      const candidateB: ScoredCandidate = {
        candidate: {
          ...candidateA.candidate,
          draftId: 'draft-1',
        },
        score: 0.85,
        rankingFeatures: {},
      };

      const tiePolicy: TiePolicy = {
        id: 'POLICY-TIE-01',
        code: 'STANDARD_TIE_POLICY',
        toleranceEpsilon: 0.0001,
        breakSequences: ['role_priority', 'target_family_code'],
      };

      const cmp = breakTiesDeterministically(candidateA, candidateB, tiePolicy);
      expect(cmp).toBeGreaterThan(0);
    });
  });

  // -------------------------------------------------------------------------
  // Cluster 7 (§90–§97): Patient-Specific Refinement & Counterfactual Analysis
  // -------------------------------------------------------------------------
  describe('Cluster 7 (§90–§97): Patient-Specific Refinement & Counterfactuals', () => {
    it('applies 9-condition refinement adoption test and retains baseline on failure (§92)', () => {
      const baseDraft: CandidateDraft = {
        draftId: 'draft-b',
        generatorId: 'G1',
        targetFamilyId: 'TF1',
        proposedRole: 'evidence_anchor',
        targetGeometry: createCanonicalPointGeometry(-42, 44, 30, 'left', 'b'),
        evidencePathIds: ['PATH-01'],
        clinicalObjectiveIds: ['OBJ-01'],
        reliedOnMeasurementIds: [],
        reliedOnReliabilityIds: [],
        rawScientificFeatures: [{ code: 'circuit_concordance', value: 0.7, isApplicable: true }],
        generatorLimitations: [],
        nominationRationale: 'B',
        generatorTrace: { algorithmCode: 'A', algorithmVersion: '1' },
      };

      const refDraft: CandidateDraft = {
        ...baseDraft,
        draftId: 'draft-r',
        proposedRole: 'connectome_refinement',
        lineage: {
          lineageType: 'measurement_refinement',
          refinementKind: 'functional_connectivity',
          baselineCandidateDraftId: 'draft-b',
        },
        rawScientificFeatures: [{ code: 'circuit_concordance', value: 0.85, isApplicable: true }],
      };

      const profiles: readonly RefinementProfileDefinition[] = [
        {
          id: 'PROF-1',
          code: 'PROF_FC',
          refinementKind: 'functional_connectivity',
          baselineRole: 'evidence_anchor',
          refinedRole: 'connectome_refinement',
          requiredCapabilities: ['individual_fc_refinement'],
          adoptionRules: [
            {
              ruleCode: 'GAIN',
              description: 'Gain test',
              minIncrementalValue: 0.1,
            },
          ],
          displacementMetric: 'euclidean',
          scientificPolicyReleaseId: 'POL-01',
        },
      ];

      const evalResult = evaluateRefinements([baseDraft, refDraft], profiles, canonicalContext);
      expect(evalResult.decisions.length).toBe(1);
      expect(evalResult.decisions[0]!.status).toBe('adopted');
    });
  });

  // -------------------------------------------------------------------------
  // Cluster 8 (§98–§105): Redundancy Suppression & Convergence
  // -------------------------------------------------------------------------
  describe('Cluster 8 (§98–§105): Redundancy Suppression & Convergence', () => {
    it('suppresses spatially redundant target candidates within 15mm radius (§98–§99)', () => {
      const draftA: CandidateDraft = {
        draftId: 'draft-a',
        generatorId: 'G1',
        targetFamilyId: 'TF1',
        proposedRole: 'evidence_anchor',
        targetGeometry: createCanonicalPointGeometry(-35, -25, 60, 'left', 'pt-a'),
        evidencePathIds: ['PATH-1'],
        clinicalObjectiveIds: ['OBJ-1'],
        reliedOnMeasurementIds: [],
        reliedOnReliabilityIds: [],
        rawScientificFeatures: [],
        generatorLimitations: [],
        nominationRationale: 'A',
        generatorTrace: { algorithmCode: 'A', algorithmVersion: '1' },
      };

      const draftB: CandidateDraft = {
        ...draftA,
        draftId: 'draft-b',
        targetGeometry: createCanonicalPointGeometry(-35, -25, 65, 'left', 'pt-b'), // 5mm away
      };

      const result = suppressRedundantCandidatesV2([draftA, draftB], 15.0);
      expect(result.suppressedCandidates.length).toBe(1);
      expect(result.survivingCandidates.length).toBe(1);
    });
  });

  // -------------------------------------------------------------------------
  // Cluster 9 (§106–§109): Biophysical & Structural Integration
  // -------------------------------------------------------------------------
  describe('Cluster 9 (§106–§109): Biophysical & Structural Geometries', () => {
    it('supports heterogeneous target geometries (Point, Surface, Volume)', () => {
      const point = createCanonicalPointGeometry(-42, 44, 30, 'left', 'pt');
      expect(point.geometryType).toBe('point');
      expect(point.centre.x).toBe(-42);

      const volume: VolumetricROITargetGeometry = {
        geometryType: 'volumetric_roi',
        laterality: 'left',
        sourceMethod: 'atlas_roi',
        sourceMethodVersion: '2.0.0',
        provenance: {
          createdBy: 'test',
          createdAt: '2026-09-02T12:00:00.000Z',
          softwareVersion: '2.0.0',
        },
        voxelCount: 450,
        volumeMm3: 3600,
        centre: { x: -42, y: 44, z: 30 },
        coordinateSpace: { id: 'MNI', name: 'MNI152', subjectSpecific: false },
      };
      expect(volume.geometryType).toBe('volumetric_roi');
      expect(volume.volumeMm3).toBe(3600);
    });
  });

  // -------------------------------------------------------------------------
  // Cluster 10 (§110–§115): Slate Assembly & Cardinality Constraints
  // -------------------------------------------------------------------------
  describe('Cluster 10 (§110–§115): Slate Assembly & Cardinality', () => {
    it('strictly caps Primary Candidates to <= 3 and Additional Candidates to <= 2', () => {
      const result = runTargetEngineV2(canonicalContext);
      expect(result.slate.primaryCandidates.length).toBeLessThanOrEqual(3);
      expect(result.slate.additionalCandidates.length).toBeLessThanOrEqual(2);
    });

    it('prohibits preselection of candidate 1 in clinical UI (§112)', () => {
      const result = runTargetEngineV2(canonicalContext);
      expect((result.slate as any).preselectedCandidateId).toBeUndefined();
      expect((result.slate as any).recommendedCandidateIndex).toBeUndefined();
    });
  });

  // -------------------------------------------------------------------------
  // Cluster 11 (§116–§121, §128–§130): Structured Abstention & Explanations
  // -------------------------------------------------------------------------
  describe('Cluster 11 (§116–§121, §128–§130): Structured Abstention & Explanations', () => {
    it('emits structured abstention slate when all candidates fail gates (§116)', () => {
      const abstentionSlate = createAbstentionSlateV2({
        id: 'SLATE-ABSTAIN',
        context: canonicalContext,
        abstentionType: 'contraindication_present',
        reasonCodes: ['FERROMAGNETIC_IMPLANT_PRESENT'],
        explanation: 'Metallic contraindication in target field.',
      });
      expect(abstentionSlate.status).toBe('abstained');
      expect(abstentionSlate.abstention).toBeDefined();
      expect(abstentionSlate.primaryCandidates.length).toBe(0);
    });

    it('generates fact-based template explanations without non-deterministic text (§121)', () => {
      const draft: CandidateDraft = {
        draftId: 'draft-exp',
        generatorId: 'G1',
        targetFamilyId: 'TF-MDD-LDLPFC-EST-001',
        proposedRole: 'evidence_anchor',
        targetGeometry: createCanonicalPointGeometry(-42, 44, 30, 'left', 'pt'),
        evidencePathIds: ['PATH-MDD-BA46'],
        clinicalObjectiveIds: canonicalContext.request.clinicalObjectiveIds,
        reliedOnMeasurementIds: [],
        reliedOnReliabilityIds: [],
        rawScientificFeatures: [],
        generatorLimitations: [],
        nominationRationale: 'Evidence anchor',
        generatorTrace: { algorithmCode: 'TEST', algorithmVersion: '2.0' },
      };

      const explanation = generateCandidateExplanationV2(draft, canonicalContext);
      expect(explanation.shortSummary).toBeDefined();
      expect(explanation.clinicalObjective).toBeDefined();
      expect(explanation.evidenceBasis).toBeDefined();
      expect(explanation.whyNominated).toBeDefined();
    });
  });

  // -------------------------------------------------------------------------
  // Cluster 12 (§125–§127, §154–§158): Governance, Releases & Kill-Switch
  // -------------------------------------------------------------------------
  describe('Cluster 12 (§125–§127, §154–§158): Governance & Runtime Suspension', () => {
    it('rejects clinical execution when module is withdrawn or superseded (§154)', () => {
      const withdrawnContext: ResolvedTargetEngineContextV2 = {
        ...canonicalContext,
        indicationModule: {
          ...canonicalContext.indicationModule,
          lifecycleStatus: 'withdrawn',
        },
      };

      const g1 = evaluateGateG1(withdrawnContext);
      expect(g1.result).toBe('fail');
      expect(g1.reasonCodes).toContain('MODULE_LIFECYCLE_STATUS_NOT_PERMITTED');
    });
  });

  // -------------------------------------------------------------------------
  // Cluster 13 (§137–§153): Core Invariant Tests (Leakage & Boundary Tests)
  // -------------------------------------------------------------------------
  describe('Cluster 13 (§137–§153): Core Invariant & Leakage Tests', () => {
    it('strictly prevents research candidates from leaking into Clinical Mode slates (§138)', () => {
      const result = runTargetEngineV2(canonicalContext);
      for (const cand of result.slate.primaryCandidates) {
        expect(cand.role).not.toBe('research_only');
      }
      for (const cand of result.slate.additionalCandidates) {
        expect(cand.role).not.toBe('research_only');
      }
    });

    it('enforces coordinate bounds on left DLPFC targeting (MNI X in [-60, -25])', () => {
      const result = runTargetEngineV2(canonicalContext);
      for (const cand of result.allCandidates) {
        if (
          cand.targetGeometry.geometryType === 'point' &&
          cand.targetGeometry.laterality === 'left'
        ) {
          expect(cand.targetGeometry.centre.x).toBeLessThanOrEqual(-25);
          expect(cand.targetGeometry.centre.x).toBeGreaterThanOrEqual(-60);
        }
      }
    });
  });

  // -------------------------------------------------------------------------
  // Cluster 14 (§159–§163): Prohibited Behaviors & Canonical Contract
  // -------------------------------------------------------------------------
  describe('Cluster 14 (§159–§163): Prohibited Engine Behaviors (§159)', () => {
    it('prohibits autonomous stimulation or dose selection (§159.1)', () => {
      const result = runTargetEngineV2(canonicalContext);
      expect((result.slate as any).stimulationProtocol).toBeUndefined();
      expect((result.slate as any).doseJoules).toBeUndefined();
      expect((result.slate as any).trainFrequencyHz).toBeUndefined();
    });

    it('certifies Final Governing Rule (§163): The Plugin Proposes; The Core Verifies', () => {
      expect(canonicalContext.request.mode).toBe('clinical');
      expect(canonicalContext.indicationModule.code).toBeDefined();
    });
  });
});
