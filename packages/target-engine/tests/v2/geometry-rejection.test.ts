/**
 * @magniom/target-engine - Section 21 Exit Criterion 5 Test Suite
 * "invalid geometry is rejected"
 * Conforms to MAGNIOM-Implementation & Multi-Indication Validation Roadmap v2.0 (§21, §28-30)
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

describe('Target Engine Core Exit Criterion 5: Geometry Validation & Rejection', () => {
  it('rejects candidate drafts with NaN or non-finite point coordinates (Gate G9)', () => {
    const context = createCanonicalResolvedContextV2();

    const invalidCoordGenerator: CandidateGenerator = {
      descriptor: {
        id: 'GEN-INVALID-COORD-001',
        code: 'INVALID_COORD_GEN',
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
          draftId: 'draft-nan-coord',
          generatorId: 'GEN-INVALID-COORD-001',
          targetFamilyId: 'TF-MDD-LDLPFC-EST-001',
          proposedRole: 'evidence_anchor',
          targetGeometry: createCanonicalPointGeometry(NaN, 40, 28, 'left', 'nan-gen'),
          evidencePathIds: ['PATH-MDD-BA46'],
          clinicalObjectiveIds: context.request.clinicalObjectiveIds,
          reliedOnMeasurementIds: [],
          reliedOnReliabilityIds: [],
          lineage: { lineageType: 'evidence_baseline' },
          rawScientificFeatures: [],
          generatorLimitations: [],
          nominationRationale: 'Target with invalid NaN coordinate.',
          generatorTrace: { algorithmCode: 'NAN', algorithmVersion: '1.0.0' },
        };
        return {
          generatorId: 'GEN-INVALID-COORD-001',
          generatorVersion: '1.0.0',
          status: 'generated',
          candidates: [draft],
        };
      },
    };

    class TestPlugin extends MDDPlugin {
      override generators(): readonly CandidateGenerator[] {
        return [...super.generators(), invalidCoordGenerator];
      }
    }

    const testPlugin = new TestPlugin();
    const result = runTargetEngineV2(context, { plugin: testPlugin });

    const trace = result.candidateTraces.find(t => t.generatorId === 'GEN-INVALID-COORD-001');
    expect(trace).toBeDefined();
    expect(trace?.suppressionReason).toBe('GENERATOR_CONSTRAINT_FAILED');

    const g9 = trace?.gateEvaluations.find(g => g.gateCode === 'G9_GENERATOR_CONSTRAINTS');
    expect(g9?.result).toBe('fail');
    expect(g9?.reasonCodes).toContain('INVALID_POINT_COORDINATE');
  });

  it('rejects candidate drafts with excessive cortical depth / inaccessibility (Gate G6)', () => {
    const context = createCanonicalResolvedContextV2();

    const deepTargetGenerator: CandidateGenerator = {
      descriptor: {
        id: 'GEN-DEEP-TARGET-001',
        code: 'DEEP_TARGET_GEN',
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
          draftId: 'draft-too-deep',
          generatorId: 'GEN-DEEP-TARGET-001',
          targetFamilyId: 'TF-MDD-LDLPFC-EST-001',
          proposedRole: 'evidence_anchor',
          targetGeometry: createCanonicalPointGeometry(-44, 40, 28, 'left', 'deep-gen'),
          evidencePathIds: ['PATH-MDD-BA46'],
          clinicalObjectiveIds: context.request.clinicalObjectiveIds,
          reliedOnMeasurementIds: [],
          reliedOnReliabilityIds: [],
          lineage: { lineageType: 'evidence_baseline' },
          rawScientificFeatures: [
            { code: 'cortical_depth_mm', value: 48.0, isApplicable: true }, // Exceeds 35mm TMS accessibility limit!
          ],
          generatorLimitations: [],
          nominationRationale: 'Target located 48mm deep, beyond TMS coil depth capability.',
          generatorTrace: { algorithmCode: 'DEEP', algorithmVersion: '1.0.0' },
        };
        return {
          generatorId: 'GEN-DEEP-TARGET-001',
          generatorVersion: '1.0.0',
          status: 'generated',
          candidates: [draft],
        };
      },
    };

    class TestPlugin extends MDDPlugin {
      override generators(): readonly CandidateGenerator[] {
        return [...super.generators(), deepTargetGenerator];
      }
    }

    const testPlugin = new TestPlugin();
    const result = runTargetEngineV2(context, { plugin: testPlugin });

    const trace = result.candidateTraces.find(t => t.generatorId === 'GEN-DEEP-TARGET-001');
    expect(trace?.suppressionReason).toBe('TARGET_ANATOMY_INVALID');

    const g6 = trace?.gateEvaluations.find(g => g.gateCode === 'G6_ANATOMY_LESION');
    expect(g6?.result).toBe('fail');
    expect(g6?.reasonCodes.some(r => r.includes('CORTICAL_DEPTH_EXCEEDED'))).toBe(true);
  });

  it('rejects candidates in destroyed or lesion-conflict regions without blind coordinate shifting (Gate G6)', () => {
    // Case has a destructive stroke lesion in the target area
    const context = createCanonicalResolvedContextV2({
      lesionContexts: [
        {
          id: 'LESION-01',
          version: '1.0.0',
          caseIndicationId: '00000000-0000-0000-0000-000000000020',
          lesionType: 'infarct',
          lesionLaterality: 'left',
          sourceImagingStudyIds: ['STUDY-01'],
          structuralDistortion: 'HIGH',
          registrationQuality: 'fail', // Destruction of landmarks
          segmentationQuality: 'fail',
          efieldRelevance: 'material',
          targetRegionExclusions: [{ regionId: 'EXCL-BA46', regionName: 'BA46_Cavity' }],
          dataQuality: 'verified',
          interpretation: 'Cavitation and parenchymal loss in left prefrontal cortex.',
          corticalRegionsAffected: [],
          subcorticalRegionsAffected: [],
          provenance: {
            createdBy: 'neuro-radiologist',
            createdAt: '2026-09-02T12:00:00.000Z',
            softwareVersion: '2.0.0',
          },
        },
      ],
    });

    const result = runTargetEngineV2(context);

    // Candidates in affected area must fail G6 and be marked LESION_CONFLICT
    for (const supp of result.suppressedCandidates) {
      const trace = result.candidateTraces.find(t => t.candidateId === supp.id);
      if (trace?.suppressionReason === 'LESION_CONFLICT') {
        const g6 = trace.gateEvaluations.find(g => g.gateCode === 'G6_ANATOMY_LESION');
        expect(g6?.result).toBe('fail');
        expect(g6?.reasonCodes).toContain('TARGET_REGION_DESTROYED_OR_ABSENT');
      }
    }
  });

  it('rejects geometry downcasting such as representing a field target as a point (Gate G7)', () => {
    const context = createCanonicalResolvedContextV2();

    const downcastedGenerator: CandidateGenerator = {
      descriptor: {
        id: 'GEN-DOWNCAST-001',
        code: 'DOWNCAST_FIELD_GEN',
        semanticVersion: '1.0.0',
        indicationModuleReleaseIds: [context.indicationModule.id],
        candidateRoles: ['field_target'],
        targetFamilyScopeIds: ['TF-MDD-LDLPFC-EST-001'],
        evidencePathStatusScope: ['clinical_permitted'],
        permittedModes: ['clinical'],
        requiredCapabilities: [],
        optionalCapabilities: [],
        permittedGeometryTypes: ['point'], // Invalid: claiming point for field_target
        baselineRelationship: 'creates_baseline',
        deterministic: true,
        generatorFailurePolicy: 'omit_generator_with_warning',
      },
      generate(_ctx: ResolvedTargetEngineContextV2): CandidateGeneratorResult {
        const draft: CandidateDraft = {
          draftId: 'draft-downcast-field',
          generatorId: 'GEN-DOWNCAST-001',
          targetFamilyId: 'TF-MDD-LDLPFC-EST-001',
          proposedRole: 'field_target', // field_target cannot be downcast to a point!
          targetGeometry: createCanonicalPointGeometry(-44, 40, 28, 'left', 'downcast'),
          evidencePathIds: ['PATH-MDD-BA46'],
          clinicalObjectiveIds: context.request.clinicalObjectiveIds,
          reliedOnMeasurementIds: [],
          reliedOnReliabilityIds: [],
          lineage: { lineageType: 'evidence_baseline' },
          rawScientificFeatures: [],
          generatorLimitations: [],
          nominationRationale: 'Field target downcast to point geometry.',
          generatorTrace: { algorithmCode: 'DOWNCAST', algorithmVersion: '1.0.0' },
        };
        return {
          generatorId: 'GEN-DOWNCAST-001',
          generatorVersion: '1.0.0',
          status: 'generated',
          candidates: [draft],
        };
      },
    };

    class TestPlugin extends MDDPlugin {
      override generators(): readonly CandidateGenerator[] {
        return [...super.generators(), downcastedGenerator];
      }
    }

    const testPlugin = new TestPlugin();
    const result = runTargetEngineV2(context, { plugin: testPlugin });

    const trace = result.candidateTraces.find(t => t.generatorId === 'GEN-DOWNCAST-001');
    expect(trace?.suppressionReason).toBe('GEOMETRY_INCOMPATIBLE');

    const g7 = trace?.gateEvaluations.find(g => g.gateCode === 'G7_GEOMETRY_DEVICE');
    expect(g7?.result).toBe('fail');
    expect(g7?.reasonCodes.some(r => r.includes('INVALID_GEOMETRY_DOWNCASTING'))).toBe(true);
  });
});
