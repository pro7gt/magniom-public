/**
 * @magniom/target-engine - Section 33: MDD Golden Suite Test Suite (10 Cases)
 * Conforms to MAGNIOM-Implementation & Multi-Indication Validation Roadmap v2.0 (§33)
 */

import { describe, it, expect } from 'vitest';
import { executeSyntheticVerticalSlice } from '../../../src/orchestrator/synthetic-vertical-slice.js';
import { MDD_GOLDEN_SUITE } from '@magniom/test-fixtures';

describe('Roadmap §33: MDD Golden Suite (10 Cases)', () => {
  it('contains exactly 10 canonical golden cases', () => {
    expect(MDD_GOLDEN_SUITE.length).toBe(10);
  });

  for (const caseDef of MDD_GOLDEN_SUITE) {
    describe(`Case ${caseDef.id}: ${caseDef.name}`, () => {
      it('executes canonical vertical slice flow end-to-end', () => {
        const result = executeSyntheticVerticalSlice(caseDef.input, caseDef.decisionIntent);

        expect(result.caseRecord.indicationCode).toBe('MDD');
        expect(result.sharedAcceptance.correctModuleDisplayed).toBe(true);
        expect(result.sharedAcceptance.correctModeDisplayed).toBe(true);
        expect(result.engineOutput).toBeDefined();
        expect(result.slate).toBeDefined();

        if (caseDef.expected.primaryCandidateCount !== undefined) {
          expect(result.slate.primaryCandidates.length).toBeGreaterThanOrEqual(
            caseDef.expected.primaryCandidateCount,
          );
        }

        if (caseDef.expected.expectedPrimaryFamilies) {
          const primaryRefs = result.slate.primaryCandidates;
          expect(primaryRefs.length).toBeGreaterThanOrEqual(1);
        }

        if (caseDef.decisionIntent) {
          expect(result.clinicianDecision).toBeDefined();
          expect(result.clinicianDecision?.isImmutable).toBe(true);
          expect(result.digitalSignatureHash).toBeDefined();
        }
      });
    });
  }
});
