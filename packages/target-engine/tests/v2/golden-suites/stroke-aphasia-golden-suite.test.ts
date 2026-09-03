/**
 * @magniom/target-engine - Section 37: Post-Stroke Aphasia Golden Suite Test Suite (10 Cases SA01–SA10)
 * Conforms to MAGNIOM-Implementation & Multi-Indication Validation Roadmap v2.0 (§37)
 */

import { describe, it, expect } from 'vitest';
import { executeSyntheticVerticalSlice } from '../../../src/orchestrator/synthetic-vertical-slice.js';
import { STROKE_APHASIA_GOLDEN_SUITE } from '@magniom/test-fixtures';

describe('Roadmap §37: Post-Stroke Aphasia Golden Suite (10 Cases SA01–SA10)', () => {
  it('contains exactly 10 canonical golden cases', () => {
    expect(STROKE_APHASIA_GOLDEN_SUITE.length).toBe(10);
  });

  for (const caseDef of STROKE_APHASIA_GOLDEN_SUITE) {
    describe(`Case ${caseDef.id}: ${caseDef.name}`, () => {
      it('executes canonical vertical slice flow end-to-end', () => {
        const result = executeSyntheticVerticalSlice(caseDef.input, caseDef.decisionIntent);

        expect(result.caseRecord.indicationCode).toBe('STROKE_APHASIA');
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
