/**
 * @magniom/target-engine - Section 35: Neuropathic Pain Golden Suite Test Suite (8 Cases P01–P08)
 * Conforms to MAGNIOM-Implementation & Multi-Indication Validation Roadmap v2.0 (§35)
 */

import { describe, it, expect } from 'vitest';
import { executeSyntheticVerticalSlice } from '../../../src/orchestrator/synthetic-vertical-slice.js';
import { PAIN_GOLDEN_SUITE } from '@magniom/test-fixtures';

describe('Roadmap §35: Neuropathic Pain Golden Suite (8 Cases P01–P08)', () => {
  it('contains exactly 8 canonical golden cases', () => {
    expect(PAIN_GOLDEN_SUITE.length).toBe(8);
  });

  for (const caseDef of PAIN_GOLDEN_SUITE) {
    describe(`Case ${caseDef.id}: ${caseDef.name}`, () => {
      it('executes canonical vertical slice flow end-to-end', () => {
        const result = executeSyntheticVerticalSlice(caseDef.input, caseDef.decisionIntent);

        expect(result.caseRecord.indicationCode).toBe('NEUROPATHIC_PAIN');
        expect(result.sharedAcceptance.correctModuleDisplayed).toBe(true);

        if (caseDef.expected.shouldAbstain) {
          expect(result.slate.status).toBe('abstained');
        } else if (caseDef.expected.expectedGeometries?.includes('somatotopic')) {
          // P01/P02: Somatotopic geometry verified
          const candidates = result.engineOutput.allCandidates;
          expect(candidates.some(c => c.targetGeometry.geometryType === 'somatotopic')).toBe(true);
        }

        if (caseDef.decisionIntent) {
          expect(result.clinicianDecision).toBeDefined();
          expect(result.clinicianDecision?.isImmutable).toBe(true);
        }
      });
    });
  }
});
