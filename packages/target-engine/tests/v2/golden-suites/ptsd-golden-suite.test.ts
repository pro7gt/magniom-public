/**
 * @magniom/target-engine - Section 39: PTSD Golden Suite Test Suite (7 Cases PTSD01–PTSD07)
 * Conforms to MAGNIOM-Implementation & Multi-Indication Validation Roadmap v2.0 (§39)
 */

import { describe, it, expect } from 'vitest';
import { executeSyntheticVerticalSlice } from '../../../src/orchestrator/synthetic-vertical-slice.js';
import { PTSD_GOLDEN_SUITE } from '@magniom/test-fixtures';

describe('Roadmap §39: PTSD Golden Suite (7 Cases PTSD01–PTSD07)', () => {
  it('contains exactly 7 canonical golden cases', () => {
    expect(PTSD_GOLDEN_SUITE.length).toBe(7);
  });

  for (const caseDef of PTSD_GOLDEN_SUITE) {
    describe(`Case ${caseDef.id}: ${caseDef.name}`, () => {
      it('executes canonical vertical slice flow end-to-end', () => {
        const result = executeSyntheticVerticalSlice(caseDef.input, caseDef.decisionIntent);

        expect(result.caseRecord.indicationCode).toBe('PTSD');
        expect(result.sharedAcceptance.correctModuleDisplayed).toBe(true);

        if (caseDef.expected.shouldAbstain) {
          expect(result.slate.status).toBe('abstained');
          expect(result.slate.primaryCandidates).toHaveLength(0);
        } else {
          if (caseDef.expected.expectedPrimaryFamilies) {
            const primaryEntities = result.slate.primaryCandidates
              .map(ref =>
                result.engineOutput.allCandidates.find(c => c.id === ref.targetCandidateId),
              )
              .filter(Boolean);
            for (const fam of caseDef.expected.expectedPrimaryFamilies) {
              expect(primaryEntities.some(c => c?.targetFamilyId === fam)).toBe(true);
            }
          }
        }

        // Prohibited cross-indication contamination check (§139, §159)
        const mddLeakage = result.engineOutput.allCandidates.filter(c =>
          c.targetFamilyId.startsWith('TF-MDD'),
        );
        expect(mddLeakage).toHaveLength(0);

        if (caseDef.decisionIntent) {
          expect(result.clinicianDecision).toBeDefined();
          expect(result.clinicianDecision?.isImmutable).toBe(true);
        }
      });
    });
  }
});
