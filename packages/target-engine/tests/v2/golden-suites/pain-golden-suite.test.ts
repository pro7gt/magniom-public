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
          expect(result.slate.primaryCandidates).toHaveLength(0);
        } else {
          if (caseDef.expected.primaryCandidateCount !== undefined) {
            expect(result.slate.primaryCandidates.length).toBe(
              caseDef.expected.primaryCandidateCount,
            );
          }
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
          if (caseDef.expected.expectedGeometries?.includes('somatotopic')) {
            // P01/P02: Somatotopic geometry verified
            const candidates = result.engineOutput.allCandidates;
            expect(candidates.some(c => c.targetGeometry.geometryType === 'somatotopic')).toBe(
              true,
            );
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
