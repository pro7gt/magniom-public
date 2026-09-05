import { describe, it, expect } from 'vitest';
import {
  createModeViewModel,
  resolveEffectiveModuleAuthority,
  evaluateCaseStaleness,
  deriveModuleWorkflow,
  createCaseShellViewModel,
  getModuleUiDescriptor,
  ALL_MODULE_UI_DESCRIPTORS,
} from '../src/index.js';

describe('v2 Application Shell & Clinical Context Adapters', () => {
  describe('Mode View Model (§20–23, §25)', () => {
    it('creates Clinical Mode with calm styling and explicit text', () => {
      const vm = createModeViewModel('CLINICAL');
      expect(vm.mode).toBe('CLINICAL');
      expect(vm.label).toBe('CLINICAL MODE');
      expect(vm.isClinical).toBe(true);
      expect(vm.isResearch).toBe(false);
      expect(vm.failClosed).toBe(false);
      expect(vm.safetyNotice).toBeUndefined();
    });

    it('creates Validation Mode with study protocol notice', () => {
      const vm = createModeViewModel('VALIDATION');
      expect(vm.mode).toBe('VALIDATION');
      expect(vm.label).toBe('VALIDATION MODE');
      expect(vm.isValidation).toBe(true);
      expect(vm.safetyNotice).toContain('VALIDATION BUILD');
    });

    it('creates Research Mode with prominent warning', () => {
      const vm = createModeViewModel('RESEARCH');
      expect(vm.mode).toBe('RESEARCH');
      expect(vm.label).toBe('RESEARCH MODE');
      expect(vm.isResearch).toBe(true);
      expect(vm.safetyNotice).toContain('NOT FOR CLINICAL TARGET DECISIONS');
    });

    it('creates Fail-Closed Mode when contradiction occurs (§25)', () => {
      const vm = createModeViewModel('CLINICAL', true, 'Module Q2 not authorized in Clinical');
      expect(vm.failClosed).toBe(true);
      expect(vm.label).toContain('FAIL CLOSED');
      expect(vm.safetyNotice).toContain('disabled');
      expect(vm.isClinical).toBe(false);
    });
  });

  describe('Effective Module Authority Resolver (§217–220)', () => {
    it('grants full clinical actions for validated Q8 clinical module', () => {
      const res = resolveEffectiveModuleAuthority({
        moduleReleaseId: 'IMR-MDD-2.0.0',
        moduleCode: 'MDD',
        moduleVersion: '2.0.0',
        humanReadableName: 'MDD Targeting Module',
        qualificationLevel: 'Q8',
        permittedModes: ['CLINICAL', 'VALIDATION', 'RESEARCH'],
        activeEnvironmentMode: 'CLINICAL',
        userHasSigningAuthority: true,
      });

      expect(res.isContradictory).toBe(false);
      expect(res.authority.isClinicalAuthorised).toBe(true);
      expect(res.authority.capabilities.may_generate_target_slate).toBe(true);
      expect(res.authority.capabilities.may_review_target_slate).toBe(true);
      expect(res.authority.capabilities.may_create_clinician_decision).toBe(true);
      expect(res.authority.capabilities.may_sign_target_decision).toBe(true);
      expect(res.authority.capabilities.may_export_navigation_target).toBe(true);
    });

    it('detects contradictory state and fails closed for Research-only module in Clinical mode (§25)', () => {
      const res = resolveEffectiveModuleAuthority({
        moduleReleaseId: 'IMR-TIN-0.4.0',
        moduleCode: 'TINNITUS',
        moduleVersion: '0.4.0',
        humanReadableName: 'Tinnitus Research Module',
        qualificationLevel: 'Q2',
        permittedModes: ['RESEARCH'],
        activeEnvironmentMode: 'CLINICAL', // Contradiction!
        userHasSigningAuthority: true,
      });

      expect(res.isContradictory).toBe(true);
      expect(res.contradictionReason).toContain('not authorized for Clinical mode');
      expect(res.authority.isClinicalAuthorised).toBe(false);
      expect(res.authority.capabilities.may_create_clinician_decision).toBe(false);
      expect(res.authority.capabilities.may_sign_target_decision).toBe(false);
    });

    it('enforces silent prospective blinding by hiding target slate review (§221)', () => {
      const res = resolveEffectiveModuleAuthority({
        moduleReleaseId: 'IMR-STR-M-2.0.0',
        moduleCode: 'STROKE_MOTOR',
        moduleVersion: '2.0.0',
        humanReadableName: 'Stroke Motor Module',
        qualificationLevel: 'Q5',
        permittedModes: ['VALIDATION'],
        activeEnvironmentMode: 'VALIDATION',
        userHasSigningAuthority: false,
        isBlindedValidation: true,
      });

      expect(res.authority.capabilities.may_generate_target_slate).toBe(true);
      expect(res.authority.capabilities.may_review_target_slate).toBe(false); // Concealed from treating clinician!
      expect(res.authority.silentProspectiveBlinded).toBe(true);
    });
  });

  describe('3-Tier Staleness Evaluator (§76–80)', () => {
    it('flags blocking staleness when lesion review is modified after slate (§78)', () => {
      const currentness = evaluateCaseStaleness({
        isLesionReviewUpdatedAfterSlate: true,
      });

      expect(currentness.isStale).toBe(true);
      expect(currentness.highestSeverity).toBe('blocking');
      expect(currentness.blockingSignOff).toBe(true);
      expect(currentness.reasons[0]?.code).toBe('STALE_LESION_REVIEW');
    });

    it('flags important staleness for replaced measurement without blocking sign-off (§79)', () => {
      const currentness = evaluateCaseStaleness({
        isMeasurementReplaced: true,
      });

      expect(currentness.isStale).toBe(true);
      expect(currentness.highestSeverity).toBe('important');
      expect(currentness.blockingSignOff).toBe(false);
      expect(currentness.reasons[0]?.severity).toBe('important');
    });

    it('flags informational staleness for newer evidence library release (§80)', () => {
      const currentness = evaluateCaseStaleness({
        isNewerEvidenceLibraryAvailable: true,
      });

      expect(currentness.isStale).toBe(true);
      expect(currentness.highestSeverity).toBe('informational');
      expect(currentness.blockingSignOff).toBe(false);
      expect(currentness.reasons[0]?.message).toContain('remains bound to its generation release');
    });
  });

  describe('Declarative Module UI Descriptors & Dynamic Workflow (§50–57, §87)', () => {
    it('registers descriptors for all canonical and expanded indications (including PTSD)', () => {
      expect(ALL_MODULE_UI_DESCRIPTORS.length).toBe(9);
      const mdd = getModuleUiDescriptor('MDD');
      const pain = getModuleUiDescriptor('PAIN');
      const strokeM = getModuleUiDescriptor('STROKE_MOTOR');
      const ocd = getModuleUiDescriptor('OCD');
      const tin = getModuleUiDescriptor('TINNITUS');
      const ptsd = getModuleUiDescriptor('PTSD');

      expect(mdd.indication_code).toBe('MDD');
      expect(pain.indication_code).toBe('PAIN');
      expect(strokeM.indication_code).toBe('STROKE_MOTOR');
      expect(ocd.indication_code).toBe('OCD');
      expect(tin.indication_code).toBe('TINNITUS');
      expect(ptsd.indication_code).toBe('PTSD');
    });

    it('adapts workflow for Neuropathic Pain without creating false connectome requirement (§53, §87)', () => {
      const workflow = deriveModuleWorkflow({
        indicationCode: 'PAIN',
        caseId: 'case-pain-01',
        activePath: '/cases/case-pain-01',
        isPhenotypeApproved: true,
        isMeasurementsComplete: true,
        isSlateReady: true,
      });

      const measurementStep = workflow.steps.find(s => s.id === 'measurements');
      expect(measurementStep).toBeDefined();
      const subLabels = measurementStep?.subSteps?.map(s => s.label);
      expect(subLabels).toContain('TMS Motor Mapping');
      expect(subLabels).toContain('Motor Evoked Potentials (MEP)');
      expect(subLabels).not.toContain('Resting-State fMRI (BOLD)');
    });

    it('omits clinical decision sign-off step for Tinnitus Research workflow (§57)', () => {
      const workflow = deriveModuleWorkflow({
        indicationCode: 'TINNITUS',
        caseId: 'case-tin-01',
        activePath: '/cases/case-tin-01',
        isResearchOnly: true,
      });

      const stepIds = workflow.steps.map(s => s.id);
      expect(stepIds).toContain('overview');
      expect(stepIds).toContain('targets');
      expect(stepIds).not.toContain('decision');
    });
  });

  describe('Aggregate CaseShellViewModel Integration (§187)', () => {
    it('constructs a complete multi-indication CaseShellViewModel with blocking staleness', () => {
      const shellVm = createCaseShellViewModel({
        caseId: 'case-stroke-01',
        caseCode: 'MGN-STR-001',
        patientDisplayLabel: 'PT-8842 (Synthetic)',
        subjectDeIdentifiedToken: 'SUBJ-9921',
        activeCaseIndicationId: 'ci-str-01',
        indicationCode: 'STROKE_MOTOR',
        indicationFormatted: 'Post-Stroke Motor Recovery',
        mode: 'CLINICAL',
        moduleCode: 'STROKE_MOTOR',
        moduleVersion: '2.0.0',
        qualificationLevel: 'Q8',
        permittedModes: ['CLINICAL', 'VALIDATION', 'RESEARCH'],
        userHasSigningAuthority: true,
        isPhenotypeApproved: true,
        isMeasurementsComplete: true,
        isSlateReady: true,
        stalenessInput: {
          isLesionReviewUpdatedAfterSlate: true, // Blocking!
        },
        clinicalObjective: {
          id: 'obj-1',
          title: 'Right upper limb motor score improvement',
          priorityRank: 1,
          isEvidenceMappable: true,
        },
        diseaseStage: {
          stageCode: 'SUBACUTE',
          stageLabel: 'Subacute Stage (14–180 days)',
          determinationMethod: 'combined',
          isSubacuteOrAcute: true,
        },
        lesionContext: {
          hasLesion: true,
          lesionType: 'ischemic',
          laterality: 'left',
          affectedRegionsCount: 3,
          hasTargetOverlapWarning: true,
          skullAbnormalityPresent: false,
        },
      });

      expect(shellVm.caseIdentity.caseCode).toBe('MGN-STR-001');
      expect(shellVm.indication.diseaseStage?.stageCode).toBe('SUBACUTE');
      expect(shellVm.indication.lesionContext?.hasTargetOverlapWarning).toBe(true);
      expect(shellVm.currentness.blockingSignOff).toBe(true);
      expect(shellVm.permittedActions.may_sign_target_decision).toBe(false); // Blocked due to staleness!
      expect(shellVm.safetyState).toBe('NORMAL');
    });

    it('triggers fail-closed safety state if contradictory authority is given', () => {
      const shellVm = createCaseShellViewModel({
        caseId: 'case-conflict-01',
        caseCode: 'MGN-ERR-001',
        patientDisplayLabel: 'Synthetic',
        subjectDeIdentifiedToken: 'SUBJ-ERR',
        activeCaseIndicationId: 'ci-err-01',
        indicationCode: 'TINNITUS',
        indicationFormatted: 'Tinnitus',
        mode: 'CLINICAL', // Clinical environment requested
        qualificationLevel: 'Q2', // But module is Q2 Research
        permittedModes: ['RESEARCH'], // Research only!
      });

      expect(shellVm.safetyState).toBe('FAIL_CLOSED');
      expect(shellVm.mode.failClosed).toBe(true);
      expect(shellVm.mode.label).toContain('FAIL CLOSED');
      expect(shellVm.permittedActions.may_sign_target_decision).toBe(false);
    });
  });
});
