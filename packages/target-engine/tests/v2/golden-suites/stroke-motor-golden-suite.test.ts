/**
 * @magniom/target-engine - Section 36: Stroke Motor Recovery Golden Suite Test Suite (10 Cases SM01–SM10)
 * Conforms to MAGNIOM-Implementation & Multi-Indication Validation Roadmap v2.0 (§36)
 */

import { describe, it, expect } from 'vitest';
import { executeSyntheticVerticalSlice } from '../../../src/orchestrator/synthetic-vertical-slice.js';
import { STROKE_MOTOR_GOLDEN_SUITE } from '@magniom/test-fixtures';

describe('Roadmap §36: Stroke Motor Golden Suite (10 Cases SM01–SM10)', () => {
  it('contains exactly 10 canonical golden cases', () => {
    expect(STROKE_MOTOR_GOLDEN_SUITE.length).toBe(10);
  });

  for (const caseDef of STROKE_MOTOR_GOLDEN_SUITE) {
    describe(`Case ${caseDef.id}: ${caseDef.name}`, () => {
      it('executes canonical vertical slice flow end-to-end', () => {
        const result = executeSyntheticVerticalSlice(caseDef.input, caseDef.decisionIntent);

        expect(result.caseRecord.indicationCode).toBe('STROKE_MOTOR');
        expect(result.sharedAcceptance.correctModuleDisplayed).toBe(true);

        if (caseDef.expected.shouldAbstain) {
          expect(result.slate.status).toBe('abstained');
        }

        if (caseDef.decisionIntent) {
          expect(result.clinicianDecision).toBeDefined();
          expect(result.clinicianDecision?.isImmutable).toBe(true);
        }
      });
    });
  }
});
