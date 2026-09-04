/**
 * Presentation Layer Evidence v2 Adapters Test Suite
 * Conforms to MAGNIOM-Evidence Knowledge Graph & Therapeutic Circuit Library v2.0 (§126, §127)
 */

import { describe, it, expect } from 'vitest';
import { EvidenceKnowledgeGraphV2 } from '@magniom/evidence';
import {
  toClaimReviewViewModel,
  toClinicianEvidenceViewModel,
} from '../src/evidence-v2-adapters.js';

describe('Presentation Layer — Evidence v2 Adapters (§126, §127)', () => {
  const graph = new EvidenceKnowledgeGraphV2();

  // ----------------------------------------------------
  // §126. Claim Review View Model
  // ----------------------------------------------------
  it('§126: toClaimReviewViewModel formats claim for reviewer scrutiny with explicit dimensions and conflicts', () => {
    // Review OCD pivotal claim
    const vm = toClaimReviewViewModel('EC-OCD-MPFC-ACC-DTMS-001', graph);

    expect(vm.claimId).toBe('clm-ocd-001');
    expect(vm.claimCode).toBe('EC-OCD-MPFC-ACC-DTMS-001');
    expect(vm.direction).toBe('supports');
    expect(vm.populations).toContain('pop-ocd-adult-001');
    expect(vm.targetFamilies).toContain('TF-OCD-MPFC-ACC-FIELD-001');
    expect(vm.treatmentContexts).toContain('ctx-ocd-provocation-001');

    // Supporting evidence
    expect(vm.supportingEvidence.length).toBeGreaterThanOrEqual(1);
    expect(vm.supportingEvidence[0].citation).toBeDefined();

    // Conflicting evidence
    expect(vm.conflictingEvidence.length).toBeGreaterThanOrEqual(1);

    // Dimensional profile (without requiring an assigned tier)
    expect(vm.evidenceDimensions.directness).toBe('strong');
    expect(vm.evidenceDimensions.replication).toBe('single_source');
    expect(vm.evidenceDimensions.treatmentContextDependence).toBe('material');

    // Review actions
    expect(vm.reviewActions.canRecordAgreement).toBe(true);
    expect(vm.reviewActions.canRecordDisagreement).toBe(true);
    expect(vm.reviewActions.canFlagOverlap).toBe(true);
  });

  // ----------------------------------------------------
  // §127. Clinician Evidence View Model
  // ----------------------------------------------------
  it('§127: toClinicianEvidenceViewModel answers clinician questions directly without isolated Tier badge', () => {
    // 1. Clinician view for Neuropathic Pain M1 Somatotopic target
    const painVm = toClinicianEvidenceViewModel('TF-PAIN-M1-SOMATO-001', 'ind-pain-001', graph);

    expect(painVm.targetFamilyId).toBe('TF-PAIN-M1-SOMATO-001');
    expect(painVm.whatIsSupported).toContain('pain');
    expect(painVm.byWhichTargetAndProtocol.permittedGeometries).toContain('somatotopic');
    expect(painVm.isClinicallyPermitted).toBe(false); // Staging
    expect(painVm.hasAssignedTier).toBe(false);
    expect(painVm.assignedTierBadge).toBe('Tier Unassigned');
    expect(painVm.permittedClinicalRole).toContain('Staging / Validation Only');

    // 2. Clinician view for Tinnitus Research Target
    const tinVm = toClinicianEvidenceViewModel(
      'TF-TIN-TEMPORAL-AUDITORY-001',
      'ind-tinnitus-001',
      graph,
    );
    expect(tinVm.isClinicallyPermitted).toBe(false);
    expect(tinVm.researchOnlyWarning).toBeDefined();
    expect(tinVm.researchOnlyWarning).toContain('Research Staging');

    // 3. Clinician view for MDD Convergent DLPFC Target (migrated v1)
    const mddVm = toClinicianEvidenceViewModel('tf-mdd-001', 'ind-mdd-001', graph);
    expect(mddVm.isClinicallyPermitted).toBe(true);
    expect(mddVm.hasAssignedTier).toBe(true);
    expect(mddVm.assignedTierBadge).toBe('Tier A');
    expect(mddVm.permittedClinicalRole).toContain('Clinical Candidate Generation Permitted');
  });
});
