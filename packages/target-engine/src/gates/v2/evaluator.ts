/**
 * @magniom/target-engine - Unified Hard Gate Evaluator v2.1
 * Conforms to MAGNIOM Target Engine & Ranking Algorithm Specification v2.1 (§16-40)
 *
 * Implements the canonical 15 hard-gate families:
 * G0:  Input Integrity
 * G1:  Mode / Release Compatibility
 * G2:  Indication / Population Compatibility
 * G3:  Evidence Eligibility
 * G4:  Clinical Objective Compatibility
 * G5:  Disease-Stage / Context Compatibility
 * G6:  Measurement Capability
 * G7:  Reliability
 * G8:  Anatomical Validity
 * G9:  Geometry Validity
 * G10: Device / Accessibility
 * G11: Treatment Context
 * G12: Personalisation Authority
 * G13: Systems Context Authority
 * G14: Research Leakage Prevention
 */

import type {
  CandidateDraft,
  GateEvaluation,
  ResolvedTargetEngineContextV2,
  SuppressionReasonV2,
} from '@magniom/domain';

import { evaluateGateG0 } from './g0-input-integrity.js';
import { evaluateGateG1 } from './g1-mode-module.js';
import { evaluateGateG2 } from './g2-evidence-path.js';
import { evaluateGateG3 } from './g3-clinical-context.js';
import { evaluateGateG4 } from './g4-measurement-capability.js';
import { evaluateGateG5 } from './g5-reliability.js';
import { evaluateGateG6 } from './g6-anatomy-lesion.js';
import { evaluateGateG7 } from './g7-geometry-device.js';
import { evaluateGateG8 } from './g8-treatment-context.js';
import { evaluateGateG9 } from './g9-generator-constraints.js';
import { evaluateGateG10 } from './g10-device-accessibility.js';
import { evaluateGateG11 } from './g11-treatment-context.js';
import { evaluateGateG12 } from './g12-personalisation-authority.js';
import { evaluateGateG13 } from './g13-systems-context-authority.js';
import { evaluateGateG14 } from './g14-research-leakage.js';

export {
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
};

export interface EvaluatedCandidateGates {
  readonly candidate: CandidateDraft;
  readonly passed: boolean;
  readonly evaluations: readonly GateEvaluation[];
  readonly suppressionReason?: SuppressionReasonV2 | undefined;
}

export interface HardGateOrchestrationResult {
  readonly globalGatesPassed: boolean;
  readonly globalGateEvaluations: readonly GateEvaluation[];
  readonly candidateEvaluations: readonly EvaluatedCandidateGates[];
}

export function evaluateAllHardGates(
  candidates: readonly CandidateDraft[],
  context: ResolvedTargetEngineContextV2,
  requiredCapabilitiesMap: ReadonlyMap<string, readonly string[]> = new Map(),
): HardGateOrchestrationResult {
  // 1. Global Context Gates (G0 & G1)
  const g0 = evaluateGateG0(context);
  const g1 = evaluateGateG1(context);
  const globalEvaluations = [g0, g1];
  const globalPassed = g0.result === 'pass' && g1.result === 'pass';

  if (!globalPassed) {
    // Global gates failed: all candidates fail
    const candidateEvals = candidates.map(cand => ({
      candidate: cand,
      passed: false,
      evaluations: globalEvaluations,
      suppressionReason: (g1.result !== 'pass'
        ? 'MODULE_INCOMPATIBLE'
        : 'MODE_INCOMPATIBLE') as SuppressionReasonV2,
    }));

    return {
      globalGatesPassed: false,
      globalGateEvaluations: globalEvaluations,
      candidateEvaluations: candidateEvals,
    };
  }

  // 2. Candidate-specific Gates (G2 through G14)
  const candidateResults: EvaluatedCandidateGates[] = [];

  for (const cand of candidates) {
    const requiredCaps = requiredCapabilitiesMap.get(cand.generatorId) ?? [];

    const g2 = evaluateGateG2(cand, context);
    const g3 = evaluateGateG3(cand, context);
    const g4 = evaluateGateG4(cand, context, requiredCaps);
    const g5 = evaluateGateG5(cand, context);
    const g6 = evaluateGateG6(cand, context);
    const g7 = evaluateGateG7(cand, context);
    const g8 = evaluateGateG8(cand, context);
    const g9 = evaluateGateG9(cand, context);
    const g10 = evaluateGateG10(cand, context);
    const g11 = evaluateGateG11(cand, context);
    const g12 = evaluateGateG12(cand, context);
    const g13 = evaluateGateG13(cand, context);
    const g14 = evaluateGateG14(cand, context);

    const evals = [g0, g1, g2, g3, g4, g5, g6, g7, g8, g9, g10, g11, g12, g13, g14];

    let passed = true;
    let suppressionReason: SuppressionReasonV2 | undefined;

    if (g2.result === 'fail') {
      passed = false;
      suppressionReason = 'EVIDENCE_PATH_NOT_PERMITTED';
    } else if (g3.result === 'fail') {
      passed = false;
      suppressionReason = 'POPULATION_MISMATCH';
    } else if (g4.result === 'fail') {
      passed = false;
      suppressionReason = 'MEASUREMENT_UNAVAILABLE';
    } else if (g5.result === 'fail') {
      passed = false;
      suppressionReason = 'LOW_RELIABILITY';
    } else if (g6.result === 'fail') {
      passed = false;
      suppressionReason = g6.reasonCodes.includes('TARGET_REGION_DESTROYED_OR_ABSENT')
        ? 'LESION_CONFLICT'
        : 'TARGET_ANATOMY_INVALID';
    } else if (g7.result === 'fail') {
      passed = false;
      suppressionReason = 'GEOMETRY_INCOMPATIBLE';
    } else if (g8.result === 'fail') {
      passed = false;
      suppressionReason = 'TREATMENT_CONTEXT_MISMATCH';
    } else if (g9.result === 'fail') {
      passed = false;
      suppressionReason = g9.reasonCodes.includes('MISSING_DECLARED_BASELINE')
        ? 'MISSING_DECLARED_BASELINE'
        : 'GENERATOR_CONSTRAINT_FAILED';
    } else if (g10.result === 'fail') {
      passed = false;
      suppressionReason = 'DEVICE_INCOMPATIBLE';
    } else if (g11.result === 'fail') {
      passed = false;
      suppressionReason = 'TREATMENT_CONTEXT_MISMATCH';
    } else if (g12.result === 'fail') {
      passed = false;
      suppressionReason = 'MISSING_DECLARED_BASELINE';
    } else if (g13.result === 'fail') {
      passed = false;
      suppressionReason = 'MODE_INCOMPATIBLE';
    } else if (g14.result === 'fail') {
      passed = false;
      suppressionReason = 'RESEARCH_ONLY';
    }

    candidateResults.push({
      candidate: cand,
      passed,
      evaluations: evals,
      suppressionReason,
    });
  }

  return {
    globalGatesPassed: true,
    globalGateEvaluations: globalEvaluations,
    candidateEvaluations: candidateResults,
  };
}
