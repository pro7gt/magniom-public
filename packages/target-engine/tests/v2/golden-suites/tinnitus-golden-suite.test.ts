/**
 * @magniom/target-engine - Section 40: Chronic Subjective Tinnitus Golden Suite Test Suite (10 Cases TIN01–TIN10)
 * Conforms to MAGNIOM-Implementation & Multi-Indication Validation Roadmap v2.0 (§40)
 */

import { describe, it, expect } from 'vitest';
import {
  executeSyntheticVerticalSlice,
  ResearchModeSigningProhibitedError,
} from '../../../src/orchestrator/synthetic-vertical-slice.js';
import { TINNITUS_GOLDEN_SUITE } from '@magniom/test-fixtures';

describe('Roadmap §40: Tinnitus Golden Suite (10 Cases TIN01–TIN10)', () => {
  it('contains exactly 10 canonical golden cases', () => {
    expect(TINNITUS_GOLDEN_SUITE.length).toBe(10);
  });

  for (const caseDef of TINNITUS_GOLDEN_SUITE) {
    describe(`Case ${caseDef.id}: ${caseDef.name}`, () => {
      it('executes canonical vertical slice flow end-to-end', () => {
        if (caseDef.expected.signingMustFail) {
          // TIN09: Clinical signing prohibited for research module
          expect(() => {
            executeSyntheticVerticalSlice(caseDef.input, caseDef.decisionIntent);
          }).toThrow(ResearchModeSigningProhibitedError);
        } else {
          const result = executeSyntheticVerticalSlice(caseDef.input, caseDef.decisionIntent);

          expect(result.caseRecord.indicationCode).toBe('TINNITUS');
          expect(result.sharedAcceptance.correctModuleDisplayed).toBe(true);
          expect(result.slate.mode).toBe(caseDef.input.mode);

          if (caseDef.expected.shouldAbstain) {
            expect(result.slate.status).toBe('abstained');
          }

          if (caseDef.decisionIntent) {
            expect(result.clinicianDecision).toBeDefined();
            expect(result.clinicianDecision?.isImmutable).toBe(true);
          }
        }
      });
    });
  }
});
