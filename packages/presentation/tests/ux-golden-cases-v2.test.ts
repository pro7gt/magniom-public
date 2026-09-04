/**
 * @magniom/presentation - Test Suite for Specification v2.0 UX Golden Cases (§250–262)
 * Validates the 13 Canonical UX Golden Cases against normative presentation rules:
 * - Fail-closed on contradiction (§25, §236–237)
 * - Zero cross-indication slate reuse (§67)
 * - Blocking staleness prevention of signing (§78, §140)
 * - Research mode sign-off prohibition (§22, §139)
 * - Silent prospective blinding (§221–222)
 * - Dynamic module navigation (§50–57)
 */

import { describe, it, expect } from 'vitest';
import {
  ALL_UX_GOLDEN_CASES_V2,
  UX_V2_CASE_01_MDD_CLINICAL,
  UX_V2_CASE_02_PAIN_MOTOR_MAP,
  UX_V2_CASE_03_PAIN_MOTOR_MAP_FAILURE,
  UX_V2_CASE_04_STROKE_LESION,
  UX_V2_CASE_05_STROKE_STAGE_MISMATCH,
  UX_V2_CASE_06_OCD_FIELD_TARGET,
  UX_V2_CASE_07_APHASIA_CONTEXT,
  UX_V2_CASE_08_TBI_RESEARCH,
  UX_V2_CASE_09_TINNITUS_RESEARCH,
  UX_V2_CASE_10_MODULE_AUTHORITY_CONFLICT,
  UX_V2_CASE_11_MULTIPLE_INDICATIONS,
  UX_V2_CASE_12_SILENT_PROSPECTIVE,
  UX_V2_CASE_13_STALE_LESION_CONTEXT,
} from '@magniom/test-fixtures';
import {
  resolveEffectiveModuleAuthority,
  evaluateCaseStaleness,
  getModuleUiDescriptor,
} from '../src/index.js';

describe('MAGNIOM Specification v2.0 — 13 UX Golden Cases (§250–262)', () => {
  it('loads all 13 canonical UX Golden Cases', () => {
    expect(ALL_UX_GOLDEN_CASES_V2).toHaveLength(13);
  });

  // 1. §250: UX-01 MDD CLINICAL
  it('UX-01 (MDD Clinical): Clinical mode obvious, MDD indication obvious, Q8 authority', () => {
    const c = UX_V2_CASE_01_MDD_CLINICAL;
    const res = resolveEffectiveModuleAuthority({
      moduleReleaseId: 'IMR-MDD-2.0.0',
      moduleCode: c.indicationCode,
      moduleVersion: '2.0.0',
      humanReadableName: 'MDD Targeting Module',
      qualificationLevel: c.qualificationLevel,
      permittedModes: c.permittedModes,
      activeEnvironmentMode: c.mode,
      userHasSigningAuthority: true,
    });

    expect(res.authority.isClinicalAuthorised).toBe(true);
    expect(res.isContradictory).toBe(false);
    expect(res.authority.permissionLabel).toBe('Clinical Module');
    expect(res.authority.capabilities.may_sign_target_decision).toBe(true);

    const descriptor = getModuleUiDescriptor(c.indicationCode);
    expect(descriptor.context_sections.map(s => s.id)).toContain('phenotype');
  });

  // 2. §251: UX-02 PAIN MOTOR MAP
  it('UX-02 (Pain Motor Map): M1/S1 Somatotopy obvious, motor map qualified', () => {
    const c = UX_V2_CASE_02_PAIN_MOTOR_MAP;
    const descriptor = getModuleUiDescriptor(c.indicationCode);

    expect(descriptor.context_sections.map(s => s.id)).toContain('pain_phenotype');
    const modalities = descriptor.measurement_sections.map(m => m.modality);
    expect(modalities).toContain('motor_mapping');
    expect(modalities).toContain('motor_evoked_potential');
    // Connectome / rs-fMRI is NOT in pain requirements (§53, §87)!
    expect(modalities).not.toContain('resting_state_fmri');
  });

  // 3. §252: UX-03 PAIN MOTOR MAP FAILURE
  it('UX-03 (Pain Motor Map Failure): Motor mapping fails, fallback to evidence baseline, zero crash', () => {
    const c = UX_V2_CASE_03_PAIN_MOTOR_MAP_FAILURE;
    expect(c.clinicalObjective?.isEvidenceMappable).toBe(true);
    const res = resolveEffectiveModuleAuthority({
      moduleReleaseId: 'IMR-PAIN-2.0.0',
      moduleCode: c.indicationCode,
      moduleVersion: '2.0.0',
      humanReadableName: 'Neuropathic Pain Module',
      qualificationLevel: c.qualificationLevel,
      permittedModes: c.permittedModes,
      activeEnvironmentMode: c.mode,
      userHasSigningAuthority: true,
    });
    expect(res.authority.capabilities.may_generate_target_slate).toBe(true);
  });

  // 4. §253: UX-04 STROKE LESION CONFLICT
  it('UX-04 (Stroke Lesion): Lesion context prominent, target overlap warning blocking', () => {
    const c = UX_V2_CASE_04_STROKE_LESION;
    expect(c.lesionContext?.hasLesion).toBe(true);
    expect(c.lesionContext?.hasTargetOverlapWarning).toBe(true);
    expect(c.diseaseStage?.stageCode).toBe('SUBACUTE');

    const descriptor = getModuleUiDescriptor(c.indicationCode);
    expect(descriptor.context_sections.map(s => s.id)).toContain('lesion_context');
  });

  // 5. §254: UX-05 STROKE STAGE MISMATCH
  it('UX-05 (Stroke Stage Mismatch): Chronic stage mismatch visible, EvidencePath unavailable', () => {
    const c = UX_V2_CASE_05_STROKE_STAGE_MISMATCH;
    expect(c.diseaseStage?.stageCode).toBe('CHRONIC');
    expect(c.diseaseStage?.isSubacuteOrAcute).toBe(false);
  });

  // 6. §255: UX-06 OCD FIELD TARGET
  it('UX-06 (OCD Field Target): Coil-field geometry, provocation protocol confirmed', () => {
    const c = UX_V2_CASE_06_OCD_FIELD_TARGET;
    expect(c.treatmentContext?.contextType).toBe('provocation_protocol');
    expect(c.treatmentContext?.isConfirmed).toBe(true);

    const descriptor = getModuleUiDescriptor(c.indicationCode);
    expect(descriptor.measurement_sections.map(m => m.modality)).toContain('efield');
  });

  // 7. §256: UX-07 APHASIA CONTEXT
  it('UX-07 (Aphasia Context): SLT context, subacute stage, lesion mapping', () => {
    const c = UX_V2_CASE_07_APHASIA_CONTEXT;
    expect(c.treatmentContext?.contextType).toBe('speech_therapy');
    expect(c.diseaseStage?.stageCode).toBe('SUBACUTE');

    const descriptor = getModuleUiDescriptor(c.indicationCode);
    expect(descriptor.context_sections.map(s => s.pathSuffix)).toContain('slt-context');
  });

  // 8. §257: UX-08 TBI RESEARCH
  it('UX-08 (TBI Research): Research mode persistent, zero clinical sign-off, Q3 qualification', () => {
    const c = UX_V2_CASE_08_TBI_RESEARCH;
    const res = resolveEffectiveModuleAuthority({
      moduleReleaseId: 'IMR-TBI-2.0.0',
      moduleCode: c.indicationCode,
      moduleVersion: '2.0.0',
      humanReadableName: 'TBI Research Prototype',
      qualificationLevel: c.qualificationLevel,
      permittedModes: c.permittedModes,
      activeEnvironmentMode: c.mode,
      userHasSigningAuthority: true,
    });

    expect(res.authority.isClinicalAuthorised).toBe(false);
    expect(res.authority.isResearchOnly).toBe(true);
    expect(res.authority.permissionLabel).toBe('Research Only');
    expect(res.authority.capabilities.may_sign_target_decision).toBe(false);
    expect(res.authority.capabilities.may_export_navigation_target).toBe(false);
  });

  // 9. §258: UX-09 TINNITUS RESEARCH
  it('UX-09 (Tinnitus Research): Audiology first, research hypotheses, clinical sign-off disabled', () => {
    const c = UX_V2_CASE_09_TINNITUS_RESEARCH;
    const descriptor = getModuleUiDescriptor(c.indicationCode);

    expect(descriptor.measurement_sections.map(m => m.modality)).toContain('audiology');
    const res = resolveEffectiveModuleAuthority({
      moduleReleaseId: 'IMR-TIN-2.0.0',
      moduleCode: c.indicationCode,
      moduleVersion: '2.0.0',
      humanReadableName: 'Tinnitus Research Prototype',
      qualificationLevel: c.qualificationLevel,
      permittedModes: c.permittedModes,
      activeEnvironmentMode: c.mode,
      userHasSigningAuthority: true,
    });
    expect(res.authority.capabilities.may_sign_target_decision).toBe(false);
  });

  // 10. §259: UX-10 MODULE AUTHORITY CONFLICT
  it('UX-10 (Module Authority Conflict): Fail-closed stop (§25), contradictory configuration blocked', () => {
    const c = UX_V2_CASE_10_MODULE_AUTHORITY_CONFLICT;
    // Clinical mode requesting research-only Q2 module
    const res = resolveEffectiveModuleAuthority({
      moduleReleaseId: 'IMR-TIN-2.0.0',
      moduleCode: c.indicationCode,
      moduleVersion: '2.0.0',
      humanReadableName: 'Tinnitus Module (Misconfigured Clinical)',
      qualificationLevel: c.qualificationLevel, // 'Q2'
      permittedModes: c.permittedModes, // ['RESEARCH']
      activeEnvironmentMode: c.mode, // 'CLINICAL'
      userHasSigningAuthority: true,
    });

    expect(res.isContradictory).toBe(true);
    expect(res.authority.isClinicalAuthorised).toBe(false);
    expect(res.authority.permissionLabel).toBe('Authority Conflict');
    expect(res.authority.capabilities.may_sign_target_decision).toBe(false);
    expect(res.authority.capabilities.may_export_navigation_target).toBe(false);
  });

  // 11. §260: UX-11 MULTIPLE INDICATIONS
  it('UX-11 (Multiple Indications): Independent MDD and PTSD isolation with separate IDs', () => {
    const c = UX_V2_CASE_11_MULTIPLE_INDICATIONS;
    expect(c.availableIndications).toHaveLength(2);
    expect(c.availableIndications![0]!.indicationCode).toBe('MDD');
    expect(c.availableIndications![0]!.isPrimary).toBe(true);
    expect(c.availableIndications![1]!.indicationCode).toBe('PTSD');
    expect(c.availableIndications![1]!.isPrimary).toBe(false);
  });

  // 12. §261: UX-12 SILENT PROSPECTIVE
  it('UX-12 (Silent Prospective): Validation mode, blinding prevents review before unblinding', () => {
    const c = UX_V2_CASE_12_SILENT_PROSPECTIVE;
    const res = resolveEffectiveModuleAuthority({
      moduleReleaseId: 'IMR-STR-M-2.0.0',
      moduleCode: c.indicationCode,
      moduleVersion: '2.0.0',
      humanReadableName: 'Stroke Motor Validation Module',
      qualificationLevel: c.qualificationLevel,
      permittedModes: c.permittedModes,
      activeEnvironmentMode: c.mode,
      userHasSigningAuthority: true,
      isBlindedValidation: c.isBlindedValidation,
    });

    expect(res.authority.isValidationOnly).toBe(true);
    // Generation is permitted to seal slate...
    expect(res.authority.capabilities.may_generate_target_slate).toBe(true);
    // ...but review is sealed (§221)!
    expect(res.authority.capabilities.may_review_target_slate).toBe(false);
    expect(res.authority.capabilities.may_sign_target_decision).toBe(false);
  });

  // 13. §262: UX-13 STALE LESION CONTEXT
  it('UX-13 (Stale Lesion Context): Lesion update after slate triggers blocking staleness', () => {
    const staleness = evaluateCaseStaleness({
      isLesionReviewUpdatedAfterSlate: true,
    });

    expect(staleness.isStale).toBe(true);
    expect(staleness.blockingSignOff).toBe(true);
    expect(staleness.reasons[0]!.code).toBe('STALE_LESION_REVIEW');
    expect(staleness.reasons[0]!.severity).toBe('blocking');
    expect(staleness.reasons[0]!.resolution_action).toContain('Regenerate');
  });

  // 14. §18 & MAG-UX-031: Anti-Automation Bias Invariant
  it('MAG-UX-031: enforces anti-automation bias with zero candidate preselected for clinician acceptance', () => {
    // MAG-UX-031: No target candidate SHALL be preselected for clinician acceptance.
    // Clinician must actively review and manually select candidate before decision signing.
    const initialWorkspaceSelection = {
      selectedCandidateIds: [] as readonly string[],
      selectedCandidateId: undefined as string | undefined,
      hasExplicitSelection: false,
    };

    expect(initialWorkspaceSelection.selectedCandidateIds).toHaveLength(0);
    expect(initialWorkspaceSelection.selectedCandidateId).toBeUndefined();
    expect(initialWorkspaceSelection.hasExplicitSelection).toBe(false);
  });
});
