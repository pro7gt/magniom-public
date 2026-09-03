/**
 * @magniom/presentation - Test Suite for Shell Navigation & Clinical Context Specification v2.0
 * Conforms to MAGNIOM-Application Shell, Navigation & Clinical Context Specification v2.0 (§12–16, 50–57, 58–87, 217–220).
 */

import { describe, it, expect } from 'vitest';
import {
  createModeViewModel,
  resolveEffectiveModuleAuthority,
  evaluateCaseStaleness,
  deriveModuleWorkflow,
  createCaseShellViewModel,
} from '../src/index.js';

describe('MAGNIOM Specification v2.0 — Shell Navigation & Authority Engine', () => {
  describe('Fail-Closed Invariant (§25, §236–237)', () => {
    it('forces fail-closed when clinical mode runs an unpermitted research module', () => {
      const auth = resolveEffectiveModuleAuthority({
        moduleReleaseId: 'IMR-TIN-2.0.0',
        moduleCode: 'TINNITUS',
        moduleVersion: '2.0.0',
        humanReadableName: 'Tinnitus Research Prototype',
        qualificationLevel: 'Q2',
        permittedModes: ['RESEARCH'],
        activeEnvironmentMode: 'CLINICAL',
        userHasSigningAuthority: true,
      });

      expect(auth.isContradictory).toBe(true);
      expect(auth.authority.isClinicalAuthorised).toBe(false);
      expect(auth.authority.permissionLabel).toBe('Authority Conflict');
      expect(auth.authority.capabilities.may_sign_target_decision).toBe(false);
      expect(auth.authority.capabilities.may_export_navigation_target).toBe(false);

      const modeVm = createModeViewModel(
        'CLINICAL',
        auth.isContradictory,
        auth.contradictionReason,
      );
      expect(modeVm.failClosed).toBe(true);
      expect(modeVm.label).toContain('FAIL CLOSED');
    });

    it('forces fail-closed when qualification level is below Q7 in Clinical mode', () => {
      const auth = resolveEffectiveModuleAuthority({
        moduleReleaseId: 'IMR-EXP-2.0.0',
        moduleCode: 'EXPERIMENTAL',
        moduleVersion: '2.0.0',
        humanReadableName: 'Experimental Module',
        qualificationLevel: 'Q5', // Q5 is for validation, not clinical!
        permittedModes: ['CLINICAL'],
        activeEnvironmentMode: 'CLINICAL',
        userHasSigningAuthority: true,
      });

      expect(auth.isContradictory).toBe(true);
      expect(auth.authority.isClinicalAuthorised).toBe(false);
    });
  });

  describe('3-Tier Staleness Invariant (§76–80)', () => {
    it('evaluates blocking staleness for lesion changes and locks sign-off', () => {
      const st = evaluateCaseStaleness({
        isLesionReviewUpdatedAfterSlate: true,
      });

      expect(st.isStale).toBe(true);
      expect(st.blockingSignOff).toBe(true);
      expect(st.highestSeverity).toBe('blocking');
      expect(st.reasons[0]!.code).toBe('STALE_LESION_REVIEW');
    });

    it('evaluates important staleness when measurement is replaced', () => {
      const st = evaluateCaseStaleness({
        isMeasurementReplaced: true,
      });

      expect(st.isStale).toBe(true);
      expect(st.blockingSignOff).toBe(false); // Non-blocking
      expect(st.highestSeverity).toBe('important');
      expect(st.reasons[0]!.code).toBe('MEASUREMENT_REPLACED');
    });

    it('returns clean currentness when no changes occurred post-slate', () => {
      const st = evaluateCaseStaleness({});
      expect(st.isStale).toBe(false);
      expect(st.blockingSignOff).toBe(false);
      expect(st.reasons).toHaveLength(0);
    });
  });

  describe('Dynamic Module-Aware Workflow Rail (§50–57, §83–87)', () => {
    it('MDD workflow contains Overview, Context, Measurements, Targets, Compare, Decision', () => {
      const wf = deriveModuleWorkflow({
        indicationCode: 'MDD',
        caseId: 'case-01',
        activePath: '/cases/case-01/targets',
        isPhenotypeApproved: true,
        isMeasurementsComplete: true,
        isSlateReady: true,
        isDecisionSigned: false,
        isResearchOnly: false,
      });

      expect(wf.activeStepId).toBe('targets');
      expect(wf.currentWorkflowIndex).toBe(3);
      const stepIds = wf.steps.map(s => s.id);
      expect(stepIds).toEqual([
        'overview',
        'context',
        'measurements',
        'targets',
        'compare',
        'decision',
      ]);
    });

    it('Neuropathic Pain workflow customizes labels for Somatotopy and Motor Mapping', () => {
      const wf = deriveModuleWorkflow({
        indicationCode: 'PAIN',
        caseId: 'case-02',
        activePath: '/cases/case-02/pain-context',
        isPhenotypeApproved: true,
        isMeasurementsComplete: true,
        isSlateReady: false,
        isDecisionSigned: false,
        isResearchOnly: false,
      });

      const stepLabels = wf.steps.map(s => s.label);
      expect(stepLabels).toContain('Pain Somatotopy');
      expect(stepLabels).toContain('Motor Mapping & MEP');
    });

    it('Tinnitus Research workflow strictly omits Decision step (§57)', () => {
      const wf = deriveModuleWorkflow({
        indicationCode: 'TINNITUS',
        caseId: 'case-09',
        activePath: '/cases/case-09/targets',
        isPhenotypeApproved: true,
        isMeasurementsComplete: true,
        isSlateReady: true,
        isDecisionSigned: false,
        isResearchOnly: true, // Research-only suppresses decision!
      });

      const stepIds = wf.steps.map(s => s.id);
      expect(stepIds).not.toContain('decision');
    });
  });

  describe('Comprehensive CaseShellViewModel Aggregate (§187)', () => {
    it('assembles a coherent CaseShellViewModel with identity, context, workflow, and capabilities', () => {
      const vm = createCaseShellViewModel({
        caseId: 'case-test-01',
        caseCode: 'MGN-26-0001',
        patientDisplayLabel: 'PT-0001',
        subjectDeIdentifiedToken: 'SUBJ-0001',
        activeCaseIndicationId: 'ci-01-mdd',
        indicationCode: 'MDD',
        indicationFormatted: 'Major Depressive Disorder',
        isPrimaryIndication: true,
        availableIndications: [
          {
            caseIndicationId: 'ci-01-mdd',
            indicationCode: 'MDD',
            label: 'Major Depressive Disorder',
            isPrimary: true,
            status: 'confirmed',
          },
        ],
        mode: 'CLINICAL',
        moduleReleaseId: 'IMR-MDD-2.0.0',
        moduleCode: 'MDD',
        moduleVersion: '2.0.0',
        humanReadableModuleName: 'MDD Module',
        qualificationLevel: 'Q8',
        permittedModes: ['CLINICAL', 'VALIDATION', 'RESEARCH'],
        userHasSigningAuthority: true,
        stalenessInput: {},
        activePath: '/cases/case-test-01/targets',
        isPhenotypeApproved: true,
        isMeasurementsComplete: true,
        isSlateReady: true,
        isDecisionSigned: false,
        createdAt: '2026-09-01T10:00:00Z',
        updatedAt: '2026-09-01T10:30:00Z',
      });

      expect(vm.caseIdentity.caseCode).toBe('MGN-26-0001');
      expect(vm.indication.indicationCode).toBe('MDD');
      expect(vm.mode.isClinical).toBe(true);
      expect(vm.moduleAuthority.isClinicalAuthorised).toBe(true);
      expect(vm.moduleAuthority.capabilities.may_sign_target_decision).toBe(true);
      expect(vm.currentness.isStale).toBe(false);
      expect(vm.workflow.steps.length).toBeGreaterThanOrEqual(3);
    });
  });
});
