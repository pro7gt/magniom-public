/**
 * @magniom/web - Test Suite for CaseStore Authority, Invariants & Indication Switching
 * Conforms to MAGNIOM-Application Shell, Navigation & Clinical Context Specification v2.0 (§22, §25, §64–67, §76–80, §139–140).
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { caseStore } from '../src/lib/case-store';

describe('Web CaseStore — Multi-Indication, Staleness & Signing Safety Invariants', () => {
  beforeEach(() => {
    caseStore.resetToGoldenCases();
  });

  describe('Multi-Indication Switching & Slate Isolation (§64–67)', () => {
    it('switches between comorbid indications (MDD ↔ PTSD) with zero slate leakage', () => {
      // UX-11 has available indications: MDD (primary) and PTSD (comorbid)
      const caseId = 'case-ux-v2-11';
      const recordInitial = caseStore.getCaseRecord(caseId);
      expect(recordInitial).toBeDefined();
      expect(recordInitial!.clinicalCase.indicationCode).toBe('MDD');
      expect(recordInitial!.availableIndications).toHaveLength(2);

      const ptsdIndicationId = 'ci-51-ptsd';
      const updatedRecord = caseStore.switchCaseIndication(caseId, ptsdIndicationId);

      expect(updatedRecord.clinicalCase.indicationCode).toBe('PTSD');
      expect(updatedRecord.activeCaseIndicationId).toBe(ptsdIndicationId);

      // Invariant §67: previous MDD Target Slate must NOT be reused for PTSD
      expect(updatedRecord.slate.id).toBe('slate-case-ux-v2-11-ptsd');
      expect(updatedRecord.slate.primaryCandidates).toHaveLength(0);
      expect(updatedRecord.decision).toBeUndefined();

      // Verify audit trail logged indication switch
      const lastAudit = updatedRecord.auditEvents[updatedRecord.auditEvents.length - 1];
      expect(lastAudit!.eventType).toBe('CASE_INDICATION_SWITCHED');
      expect(lastAudit!.details.activeIndication).toBe('PTSD');
    });

    it('rejects switching to an unassigned indication ID', () => {
      expect(() => {
        caseStore.switchCaseIndication('case-ux-v2-11', 'ci-non-existent');
      }).toThrow(/not found on case/);
    });
  });

  describe('Blocking Staleness Signing Invariant (§78, §140)', () => {
    it('strictly prevents digital signature when blocking staleness is present', () => {
      // UX-13 is initialized with blocking staleness due to post-generation lesion change
      const caseId = 'case-ux-v2-13';
      const record = caseStore.getCaseRecord(caseId);
      expect(record!.isStale).toBe(true);
      expect(record!.staleSeverity).toBe('blocking');

      expect(() => {
        caseStore.signDecision({
          caseId,
          overallReasoning: 'Attempting to sign with stale lesion context',
          magniomInfluence: 'moderate',
          clinicianName: 'Dr. Specialist',
          attestationStatement: 'I attest this plan.',
        });
      }).toThrow(/Safety Violation: Cannot sign a stale Target Slate/);
    });

    it('permits signing once slate is regenerated and staleness resolved', () => {
      const caseId = 'case-ux-v2-13';
      caseStore.setStaleness(caseId, false);

      const decision = caseStore.signDecision({
        caseId,
        overallReasoning: 'Regenerated slate reviewed against updated lesion boundary',
        magniomInfluence: 'moderate',
        clinicianName: 'Dr. Specialist',
        attestationStatement: 'I attest this plan.',
      });

      expect(decision.isImmutable).toBe(true);
      expect(decision.digitalSignatureHash).toHaveLength(64);
      expect(decision.decisionType).toBe('DEFERRED'); // Zero candidates were accepted
    });
  });

  describe('Research Mode Signing Prohibition (§22, §139)', () => {
    it('strictly prohibits digital signature in Research Mode', () => {
      // UX-08 is a Research Mode case (TBI)
      const caseId = 'case-ux-v2-08';
      const record = caseStore.getCaseRecord(caseId);
      expect(record!.clinicalCase.mode).toBe('RESEARCH');

      expect(() => {
        caseStore.signDecision({
          caseId,
          overallReasoning: 'Attempting clinical sign-off on research prototype',
          magniomInfluence: 'moderate',
          clinicianName: 'Dr. Investigator',
          attestationStatement: 'I attest this plan.',
        });
      }).toThrow(/Safety Violation: Clinical digital signature is prohibited in Research Mode/);
    });
  });

  describe('Contradictory State Fail-Closed Signing Prohibition (§25)', () => {
    it('strictly prohibits signing when module authority contradiction is present', () => {
      // UX-10 is a contradiction case (Clinical mode with Q2 Research Tinnitus module)
      const caseId = 'case-ux-v2-10';
      const record = caseStore.getCaseRecord(caseId);
      expect(record!.isContradictory).toBe(true);

      expect(() => {
        caseStore.signDecision({
          caseId,
          overallReasoning: 'Attempting sign-off under contradiction',
          magniomInfluence: 'moderate',
          clinicianName: 'Dr. Specialist',
          attestationStatement: 'I attest this plan.',
        });
      }).toThrow(/Safety Violation: Module authority contradiction/);
    });
  });
});
