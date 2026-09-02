import { describe, it, expect } from 'vitest';
import { runTargetEngine } from '../src/index.js';
import {
  IMAGING_VALIDATION_PHENOTYPE,
  I01_LOW_MOTION_CONNECTOME,
  I02_MODERATE_MOTION_CONNECTOME,
  I03_MOTION_FAILURE_CONNECTOME,
  I04_STRUCTURAL_CHALLENGE_CONNECTOME,
  I05_ATLAS_BOUNDARY_CONNECTOME,
  I06_GSR_SENSITIVE_CONNECTOME,
  I07_HIGHLY_STABLE_CONNECTOME,
  I08_SIGNAL_DROPOUT_CONNECTOME,
  I09_MULTI_SCANNER_CONNECTOME,
  I10_REPEAT_SESSION_CONNECTOME,
} from '@magniom/test-fixtures';

describe('Sprint 12 — Neuroimaging Validation Suite (I01–I10)', () => {
  it('I01: Low Motion — verifies baseline reproducibility and high reliability', () => {
    const slate = runTargetEngine({
      phenotypeSnapshot: IMAGING_VALIDATION_PHENOTYPE,
      connectome: I01_LOW_MOTION_CONNECTOME,
      mode: 'CLINICAL',
    });

    expect(slate.personalisationQualification).toBe('qualified');
    expect(slate.primaryCandidates[0].method).toBe('CONNECTOME_REFINED');
    expect(slate.primaryCandidates[0].role).toBe('PRIMARY_1');
  });

  it('I02: Moderate Motion — verifies graceful degradation with motion warning', () => {
    const slate = runTargetEngine({
      phenotypeSnapshot: IMAGING_VALIDATION_PHENOTYPE,
      connectome: I02_MODERATE_MOTION_CONNECTOME,
      mode: 'CLINICAL',
    });

    expect(slate.personalisationQualification).toBe('qualified');
    expect(slate.primaryCandidates[0].method).toBe('CONNECTOME_REFINED');
  });

  it('I03: Motion Failure — verifies Gate 3 failure and fallback to evidence baseline', () => {
    const slate = runTargetEngine({
      phenotypeSnapshot: IMAGING_VALIDATION_PHENOTYPE,
      connectome: I03_MOTION_FAILURE_CONNECTOME,
      mode: 'CLINICAL',
    });

    expect(slate.personalisationQualification).toBe('ineligible');
    expect(slate.primaryCandidates[0].method).toBe('EVIDENCE_ONLY_PRIOR');
    expect(slate.primaryCandidates[0].familyId).toBe('TF-MDD-LDLPFC-EST-001');
    expect(slate.suppressedCandidates[0].suppressionReason).toBe('LOW_RELIABILITY');
  });

  it('I04: Structural Reconstruction Challenge — verifies fallback search mask verification', () => {
    const slate = runTargetEngine({
      phenotypeSnapshot: IMAGING_VALIDATION_PHENOTYPE,
      connectome: I04_STRUCTURAL_CHALLENGE_CONNECTOME,
      mode: 'CLINICAL',
    });

    expect(slate.personalisationQualification).toBe('qualified');
    expect(slate.primaryCandidates[0].method).toBe('CONNECTOME_REFINED');
  });

  it('I05: Atlas Boundary — handles HCP-MMP parcel boundary annotation', () => {
    const slate = runTargetEngine({
      phenotypeSnapshot: IMAGING_VALIDATION_PHENOTYPE,
      connectome: I05_ATLAS_BOUNDARY_CONNECTOME,
      mode: 'CLINICAL',
    });

    expect(slate.personalisationQualification).toBe('qualified');
    expect(slate.primaryCandidates[0].surfaceVertex?.parcelName).toContain('boundary');
  });

  it('I06: GSR-Sensitive Target — incorporates pipeline sensitivity dispersion', () => {
    const slate = runTargetEngine({
      phenotypeSnapshot: IMAGING_VALIDATION_PHENOTYPE,
      connectome: I06_GSR_SENSITIVE_CONNECTOME,
      mode: 'CLINICAL',
    });

    expect(slate.personalisationQualification).toBe('qualified');
    expect(slate.primaryCandidates[0].method).toBe('CONNECTOME_REFINED');
  });

  it('I07: Highly Stable Target — positive control with high reliability and tight convergence', () => {
    const slate = runTargetEngine({
      phenotypeSnapshot: IMAGING_VALIDATION_PHENOTYPE,
      connectome: I07_HIGHLY_STABLE_CONNECTOME,
      mode: 'CLINICAL',
    });

    expect(slate.personalisationQualification).toBe('qualified');
    expect(slate.primaryCandidates[0].method).toBe('CONNECTOME_REFINED');
    expect(slate.primaryCandidates[0].overallScore).toBeGreaterThanOrEqual(0.85);
  });

  it('I08: Signal Dropout — maintains valid DLPFC target despite regional dropout', () => {
    const slate = runTargetEngine({
      phenotypeSnapshot: IMAGING_VALIDATION_PHENOTYPE,
      connectome: I08_SIGNAL_DROPOUT_CONNECTOME,
      mode: 'CLINICAL',
    });

    expect(slate.personalisationQualification).toBe('qualified');
    expect(slate.primaryCandidates[0].familyId).toBe('TF-MDD-CONVERGENT-LDLPFC-001');
  });

  it('I09: Multi-Scanner — verifies target stability across scanner acquisitions', () => {
    const slate = runTargetEngine({
      phenotypeSnapshot: IMAGING_VALIDATION_PHENOTYPE,
      connectome: I09_MULTI_SCANNER_CONNECTOME,
      mode: 'CLINICAL',
    });

    expect(slate.personalisationQualification).toBe('qualified');
    expect(slate.primaryCandidates[0].method).toBe('CONNECTOME_REFINED');
  });

  it('I10: Repeat Session — verifies person-specific spatial target across sessions', () => {
    const slate = runTargetEngine({
      phenotypeSnapshot: IMAGING_VALIDATION_PHENOTYPE,
      connectome: I10_REPEAT_SESSION_CONNECTOME,
      mode: 'CLINICAL',
    });

    expect(slate.personalisationQualification).toBe('qualified');
    expect(slate.primaryCandidates[0].method).toBe('CONNECTOME_REFINED');
  });
});
