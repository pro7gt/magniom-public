/**
 * @magniom/target-engine - Comprehensive Hard Gates G0 through G14 Test Suite
 * Conforms to MAGNIOM Target Engine & Ranking Algorithm Specification v2.1 (§16-40)
 */

import { describe, it, expect } from 'vitest';
import {
  evaluateAllHardGates,
  evaluateGateG0,
  evaluateGateG1,
  evaluateGateG2,
  evaluateGateG3,
  evaluateGateG4,
  evaluateGateG5,
  evaluateGateG6,
  evaluateGateG7,
  evaluateGateG8,
  evaluateGateG9,
  evaluateGateG10,
  evaluateGateG11,
  evaluateGateG12,
  evaluateGateG13,
  evaluateGateG14,
} from '../../src/gates/v2/evaluator.js';
import { createCanonicalResolvedContextV2 } from '../../src/core/context.js';
import type { CandidateDraft } from '@magniom/domain';

function createMockCandidate(overrides: Partial<CandidateDraft> = {}): CandidateDraft {
  return {
    draftId: 'cand-mock-001',
    generatorId: 'gen-evidence-prior-mdd',
    targetFamilyId: 'TF-MDD-LDLPFC-EST-001',
    proposedRole: 'P1',
    targetGeometry: {
      geometryType: 'point',
      centre: { x: -38.0, y: 44.0, z: 26.0 },
      coordinateSpace: {
        id: 'MNI152NLin2009cAsym',
        name: 'MNI152NLin2009cAsym',
        subjectSpecific: false,
      },
      laterality: 'left',
      sourceMethod: 'stereotaxic_prior',
      sourceMethodVersion: '1.0.0',
      provenance: {
        createdBy: 'test-harness',
        createdAt: '2026-09-12T00:00:00Z',
        softwareVersion: '2.1.0',
      },
    },
    evidencePathIds: ['PATH-MDD-BA46'],
    clinicalObjectiveIds: ['00000000-0000-0000-0000-000000000040'],
    reliedOnMeasurementIds: ['MEAS-01'],
    reliedOnReliabilityIds: ['MEAS-REL-01'],
    rawScientificFeatures: [],
    generatorLimitations: [],
    nominationRationale: 'Canonical left DLPFC evidence anchor hypothesis.',
    dataOrigin: 'patient_measured',
    targetDefinitionOrigin: 'functional_connectivity',
    inputDataOrigin: 'patient_measured',
    patientPersonalizationStatus: 'individually_computed',
    scientificMaturity: 'clinical_approved',
    clinicalPromotionStatus: 'approved',
    generatorTrace: {
      algorithmCode: 'EVD_PRIOR',
      algorithmVersion: '2.1.0',
    },
    ...overrides,
  };
}

describe('Target Engine v2.1 Hard Gates Architecture (G0 through G14)', () => {
  const context = createCanonicalResolvedContextV2();

  it('evaluates G0 (Input Integrity) and passes valid context', () => {
    const res = evaluateGateG0(context);
    expect(res.gateCode).toBe('G0_INPUT_INTEGRITY');
    expect(res.result).toBe('pass');
  });

  it('evaluates G1 (Mode / Release Compatibility) and confirms Clinical compatibility', () => {
    const res = evaluateGateG1(context);
    expect(res.gateCode).toBe('G1_MODE_MODULE');
    expect(res.result).toBe('pass');
  });

  it('evaluates G2 (Indication / Population Compatibility)', () => {
    const cand = createMockCandidate();
    const res = evaluateGateG2(cand, context);
    expect(res.gateCode).toBe('G2_EVIDENCE_PATH');
    expect(res.result).toBe('pass');
  });

  it('evaluates G3 (Clinical Objective Compatibility)', () => {
    const cand = createMockCandidate();
    const res = evaluateGateG3(cand, context);
    expect(res.gateCode).toBe('G3_CLINICAL_CONTEXT');
    expect(res.result).toBe('pass');
  });

  it('evaluates G4 (Measurement Capability)', () => {
    const cand = createMockCandidate();
    const res = evaluateGateG4(cand, context, ['individual_fc_refinement']);
    expect(res.gateCode).toBe('G4_MEASUREMENT_CAPABILITY');
    expect(res.result).toBe('pass');
  });

  it('evaluates G5 (Reliability)', () => {
    const cand = createMockCandidate();
    const res = evaluateGateG5(cand, context);
    expect(res.gateCode).toBe('G5_RELIABILITY');
    expect(res.result).toBe('pass');
  });

  it('evaluates G6 (Anatomical Validity & Lesion)', () => {
    const cand = createMockCandidate();
    const res = evaluateGateG6(cand, context);
    expect(res.gateCode).toBe('G6_ANATOMY_LESION');
    expect(res.result).toBe('pass');
  });

  it('evaluates G7 (Geometry Validity)', () => {
    const cand = createMockCandidate();
    const res = evaluateGateG7(cand, context);
    expect(res.gateCode).toBe('G7_GEOMETRY_DEVICE');
    expect(res.result).toBe('pass');
  });

  it('evaluates G8 (Treatment Context)', () => {
    const cand = createMockCandidate();
    const res = evaluateGateG8(cand, context);
    expect(res.gateCode).toBe('G8_TREATMENT_CONTEXT');
    expect(res.result).toBe('pass');
  });

  it('evaluates G9 (Generator Constraints)', () => {
    const cand = createMockCandidate();
    const res = evaluateGateG9(cand, context);
    expect(res.gateCode).toBe('G9_GENERATOR_CONSTRAINTS');
    expect(res.result).toBe('pass');
  });

  it('evaluates G10 (Device / Accessibility) and suppresses inaccessible depths', () => {
    const accessibleCand = createMockCandidate();
    const res1 = evaluateGateG10(accessibleCand, context);
    expect(res1.gateCode).toBe('G10_DEVICE_ACCESSIBILITY');
    expect(res1.result).toBe('pass');

    // Depth > 40mm without deep TMS context fails
    const deepContext = {
      ...context,
      request: {
        ...context.request,
        deviceContextIds: ['DEV-FIG8-COIL-STANDARD'],
      },
    };
    const deepCand = createMockCandidate({
      targetGeometry: {
        ...accessibleCand.targetGeometry,
        depthMm: 55.0,
      } as any,
    });
    const res2 = evaluateGateG10(deepCand, deepContext);
    expect(res2.result).toBe('fail');
    expect(res2.reasonCodes[0]).toContain('TARGET_DEPTH_EXCEEDS_DEVICE_LIMIT');
  });

  it('evaluates G11 (Treatment Context Advanced)', () => {
    const cand = createMockCandidate();
    const res = evaluateGateG11(cand, context);
    expect(res.gateCode).toBe('G11_TREATMENT_CONTEXT');
    expect(res.result).toBe('pass');
  });

  it('evaluates G12 (Personalisation Authority) and requires baseline candidate', () => {
    // Unrefined evidence anchor passes without baseline
    const anchorCand = createMockCandidate({ proposedRole: 'P1' });
    const res1 = evaluateGateG12(anchorCand, context);
    expect(res1.gateCode).toBe('G12_PERSONALISATION_AUTHORITY');
    expect(res1.result).toBe('pass');

    // Refined P3 candidate without declared baseline fails G12
    const refinedCandWithoutBaseline = createMockCandidate({
      proposedRole: 'P3',
      lineage: undefined,
    });
    const res2 = evaluateGateG12(refinedCandWithoutBaseline, context);
    expect(res2.result).toBe('fail');
    expect(res2.reasonCodes[0]).toContain('MISSING_DECLARED_BASELINE');

    // Refined P3 candidate with declared baseline passes G12
    const refinedCandWithBaseline = createMockCandidate({
      proposedRole: 'P3',
      lineage: {
        lineageType: 'refinement',
        baselineCandidateDraftId: 'cand-evidence-baseline-001',
      } as any,
    });
    const res3 = evaluateGateG12(refinedCandWithBaseline, context);
    expect(res3.result).toBe('pass');
  });

  it('evaluates G13 (Systems Context Authority) and prevents autonomous network generation', () => {
    const validCand = createMockCandidate();
    const res1 = evaluateGateG13(validCand, context);
    expect(res1.gateCode).toBe('G13_SYSTEMS_CONTEXT_AUTHORITY');
    expect(res1.result).toBe('pass');

    // Autonomous network generator in Clinical Mode fails G13
    const autonomousNetCand = createMockCandidate({
      generatorId: 'gen-autonomous_network-explorer',
    });
    const res2 = evaluateGateG13(autonomousNetCand, context);
    expect(res2.result).toBe('fail');
    expect(res2.reasonCodes[0]).toContain('AUTONOMOUS_NETWORK_TARGET_GENERATION_PROHIBITED');
  });

  it('evaluates G14 (Research Leakage Prevention) and fails closed on dynamic FC in Clinical Mode', () => {
    const validCand = createMockCandidate();
    const res1 = evaluateGateG14(validCand, context);
    expect(res1.gateCode).toBe('G14_RESEARCH_LEAKAGE_PREVENTION');
    expect(res1.result).toBe('pass');

    // Dynamic FC attempt in Clinical Mode fails G14 with canonical TN-012 code
    const dynamicCand = createMockCandidate({
      generatorLimitations: ['DYNAMIC_FC_RESEARCH_ONLY'],
    });
    const res2 = evaluateGateG14(dynamicCand, context);
    expect(res2.result).toBe('fail');
    expect(res2.reasonCodes[0]).toContain('TN-012:DYNAMIC_FC_PROHIBITED_IN_CLINICAL_MODE');
  });

  it('orchestrates all 15 hard gates through evaluateAllHardGates', () => {
    const cand = createMockCandidate();
    const res = evaluateAllHardGates([cand], context);
    expect(res.globalGatesPassed).toBe(true);
    expect(res.candidateEvaluations).toHaveLength(1);
    expect(res.candidateEvaluations[0].passed).toBe(true);
    // Verifies all 15 gates were evaluated
    expect(res.candidateEvaluations[0].evaluations).toHaveLength(15);
  });
});
