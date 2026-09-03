/**
 * @magniom/target-engine - Section 32: Shared Synthetic Acceptance Test Suite
 * Conforms to MAGNIOM-Implementation & Multi-Indication Validation Roadmap v2.0 (§31-32)
 *
 * Validates the 8 non-negotiable architectural acceptance criteria across all 8 modules:
 * 1. correct module displayed
 * 2. correct mode displayed
 * 3. candidate evidence inspectable
 * 4. uncertainty visible
 * 5. candidate may be rejected
 * 6. no target may be selected
 * 7. Research output cannot be signed clinically
 * 8. signed decision immutable
 */

import { describe, it, expect } from 'vitest';
import {
  executeSyntheticVerticalSlice,
  SyntheticAuditLedger,
  ResearchModeSigningProhibitedError,
} from '../../../src/orchestrator/synthetic-vertical-slice.js';
import {
  MDD_GOLDEN_SUITE,
  OCD_GOLDEN_SUITE,
  PAIN_GOLDEN_SUITE,
  STROKE_MOTOR_GOLDEN_SUITE,
  STROKE_APHASIA_GOLDEN_SUITE,
  TBI_GOLDEN_SUITE,
  PTSD_GOLDEN_SUITE,
  TINNITUS_GOLDEN_SUITE,
} from '@magniom/test-fixtures';

describe('Roadmap §32: Shared Synthetic Acceptance (All 8 Modules)', () => {
  const representativeSuites = [
    { indication: 'MDD', suite: MDD_GOLDEN_SUITE, caseDef: MDD_GOLDEN_SUITE[0]! },
    { indication: 'OCD', suite: OCD_GOLDEN_SUITE, caseDef: OCD_GOLDEN_SUITE[0]! },
    { indication: 'Pain', suite: PAIN_GOLDEN_SUITE, caseDef: PAIN_GOLDEN_SUITE[0]! },
    {
      indication: 'Stroke Motor',
      suite: STROKE_MOTOR_GOLDEN_SUITE,
      caseDef: STROKE_MOTOR_GOLDEN_SUITE[0]!,
    },
    {
      indication: 'Stroke Aphasia',
      suite: STROKE_APHASIA_GOLDEN_SUITE,
      caseDef: STROKE_APHASIA_GOLDEN_SUITE[0]!,
    },
    { indication: 'TBI', suite: TBI_GOLDEN_SUITE, caseDef: TBI_GOLDEN_SUITE[1]! }, // TBI02 has explicit candidate
    { indication: 'PTSD', suite: PTSD_GOLDEN_SUITE, caseDef: PTSD_GOLDEN_SUITE[0]! },
    { indication: 'Tinnitus', suite: TINNITUS_GOLDEN_SUITE, caseDef: TINNITUS_GOLDEN_SUITE[0]! },
  ];

  for (const { indication, caseDef } of representativeSuites) {
    describe(`Module Acceptance: ${indication} (${caseDef.id})`, () => {
      it('Criterion 1 & 2: Correct module and mode displayed', () => {
        const result = executeSyntheticVerticalSlice(caseDef.input);
        expect(result.sharedAcceptance.correctModuleDisplayed).toBe(true);
        expect(result.sharedAcceptance.correctModeDisplayed).toBe(true);
        expect(result.slate.mode).toBe(caseDef.input.mode);
      });

      it('Criterion 3 & 4: Candidate evidence inspectable and uncertainty visible', () => {
        const result = executeSyntheticVerticalSlice(caseDef.input);
        expect(result.evidenceReview.inspectableCandidates).toBeDefined();
        for (const candidate of result.evidenceReview.inspectableCandidates) {
          expect(candidate.evidenceSummary).toBeDefined();
          expect(candidate.reliability).toBeDefined();
          expect(candidate.uncertainty).toBeDefined();
          expect(candidate.uncertainty.confidenceLevel).toBeDefined();
        }
      });

      it('Criterion 5: Candidate may be rejected with documented reason', () => {
        const result = executeSyntheticVerticalSlice(caseDef.input, {
          clinicianId: 'clinician-test-01',
          decisionType: 'REJECTED',
          selectedCandidateIds: [],
          candidateDispositions: [
            {
              candidateId: 'cand-001',
              action: 'reject',
              reasonCodes: ['Independent specialist clinical judgement'],
              freeTextReason: 'Clinical presentation prioritizes alternative therapy.',
            },
          ],
          overallReasoning: 'Rejecting candidates based on clinical review.',
          magniomInfluence: 'none',
          signingMode: caseDef.input.mode === 'research' ? 'research' : 'clinical',
        });

        expect(result.sharedAcceptance.candidateMayBeRejected).toBe(true);
        expect(result.clinicianDecision?.candidateDecisions[0]?.action).toBe('reject');
      });

      it('Criterion 6: No target may be selected (Withhold stimulation)', () => {
        const result = executeSyntheticVerticalSlice(caseDef.input, {
          clinicianId: 'clinician-test-01',
          decisionType: 'REJECTED',
          selectedCandidateIds: [],
          overallReasoning: 'Treating clinician elects to withhold stimulation.',
          magniomInfluence: 'none',
          signingMode: caseDef.input.mode === 'research' ? 'research' : 'clinical',
        });

        expect(result.sharedAcceptance.noTargetMayBeSelected).toBe(true);
        expect(result.clinicianDecision?.finalTargets.length).toBe(0);
        expect(result.clinicianDecision?.decisionType).toBe('REJECTED');
      });

      it('Criterion 7: Research output cannot be signed clinically', () => {
        const researchInput = { ...caseDef.input, mode: 'research' as const };
        expect(() => {
          executeSyntheticVerticalSlice(researchInput, {
            clinicianId: 'clinician-test-01',
            decisionType: 'ACCEPTED_PRIMARY',
            selectedCandidateIds: ['cand-001'],
            overallReasoning: 'Attempting to clinically sign research output.',
            magniomInfluence: 'major',
            signingMode: 'clinical',
          });
        }).toThrow(ResearchModeSigningProhibitedError);
      });

      it('Criterion 8: Signed decision is immutable and cryptographically audited', () => {
        const audit = new SyntheticAuditLedger();
        const result = executeSyntheticVerticalSlice(
          caseDef.input,
          {
            clinicianId: 'clinician-test-01',
            decisionType: 'ACCEPTED_PRIMARY',
            selectedCandidateIds: ['cand-001'],
            overallReasoning: 'Independent confirmation of targeting candidate.',
            magniomInfluence: 'moderate',
            signingMode: caseDef.input.mode === 'research' ? 'research' : 'clinical',
          },
          { auditLedger: audit },
        );

        expect(result.clinicianDecision?.isImmutable).toBe(true);
        expect(result.digitalSignatureHash).toBeDefined();
        expect(result.digitalSignatureHash?.length).toBe(64);
        expect(audit.verifyIntegrity()).toBe(true);
      });
    });
  }
});
