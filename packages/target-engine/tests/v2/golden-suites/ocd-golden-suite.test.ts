/**
 * @magniom/target-engine - Section 34: OCD Golden Suite Test Suite (8 Cases O01–O08)
 * Conforms to MAGNIOM-Implementation & Multi-Indication Validation Roadmap v2.0 (§34)
 */

import { describe, it, expect } from 'vitest';
import { executeSyntheticVerticalSlice } from '../../../src/orchestrator/synthetic-vertical-slice.js';
import { OCD_GOLDEN_SUITE } from '@magniom/test-fixtures';

describe('Roadmap §34: OCD Golden Suite (8 Cases O01–O08)', () => {
  it('contains exactly 8 canonical golden cases', () => {
    expect(OCD_GOLDEN_SUITE.length).toBe(8);
  });

  for (const caseDef of OCD_GOLDEN_SUITE) {
    describe(`Case ${caseDef.id}: ${caseDef.name}`, () => {
      it('executes canonical vertical slice flow end-to-end', () => {
        const result = executeSyntheticVerticalSlice(caseDef.input, caseDef.decisionIntent);

        expect(result.caseRecord.indicationCode).toBe('OCD');
        expect(result.sharedAcceptance.correctModuleDisplayed).toBe(true);

        if (caseDef.expected.shouldAbstain) {
          expect(result.slate.status).toBe('abstained');
          expect(result.slate.primaryCandidates).toHaveLength(0);
        } else {
          if (caseDef.expected.primaryCandidateCount !== undefined) {
            expect(result.slate.primaryCandidates.length).toBeGreaterThanOrEqual(1);
            expect(result.slate.primaryCandidates.length).toBeLessThanOrEqual(3);
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
          if (caseDef.expected.expectedGeometries?.includes('coil_field')) {
            // O01/O04: Must generate candidate with coil_field geometry
            const candidates = [
              ...result.engineOutput.allCandidates,
              ...result.engineOutput.suppressedCandidates,
            ];
            const hasCoilField = candidates.some(
              c => c.targetGeometry.geometryType === 'coil_field',
            );
            expect(hasCoilField).toBe(true);
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
