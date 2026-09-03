/**
 * Canonical Claim Conflict Sets Manifest v2.0
 * Conforms to MAGNIOM-Evidence Knowledge Graph & Therapeutic Circuit Library v2.0 (§90, 91, 120)
 * Formalizes contestable scientific conflicts across all 8 clinical indications
 */

import type { ClaimConflictSet } from '@magniom/domain';

export const CANONICAL_CONFLICT_SETS: readonly ClaimConflictSet[] = [
  // ----------------------------------------------------
  // OCD Conflict Set (§29, 90)
  // ----------------------------------------------------
  {
    id: 'cnf-ocd-001',
    subjectClaimId: 'clm-ocd-002',
    supportingClaimIds: ['clm-ocd-001', 'clm-ocd-003'],
    conflictingClaimIds: ['clm-ocd-004'],
    conflictType: 'protocol',
    reconciliationStatus: 'partially_explained',
    explanation: 'Unnavigated surface-coil low-frequency protocols failed to show pooled superiority over sham, whereas navigated or deep-TMS coil-field protocols engaging mPFC/ACC demonstrate efficacy.',
    reviewedBy: ['rev-gov-ocd-lead'],
    provenance: { createdBy: 'curator_ocd_panel', createdAt: '2026-09-02T00:00:00Z', softwareVersion: '2.0.0' },
  },

  // ----------------------------------------------------
  // Neuropathic Pain Conflict Set (§34, 35)
  // ----------------------------------------------------
  {
    id: 'cnf-pain-001',
    subjectClaimId: 'clm-pain-001',
    supportingClaimIds: ['clm-pain-002'],
    conflictingClaimIds: ['clm-pain-003', 'clm-pain-004'],
    conflictType: 'methodology',
    reconciliationStatus: 'partially_explained',
    explanation: 'High-frequency M1 stimulation demonstrates replicated analgesic efficacy, but clinical practice guidelines designate it as third-line due to transient benefit duration and heterogeneity in non-navigated peripheral cohorts.',
    reviewedBy: ['rev-gov-pain-lead'],
    provenance: { createdBy: 'curator_pain_panel', createdAt: '2026-09-02T00:00:00Z', softwareVersion: '2.0.0' },
  },

  // ----------------------------------------------------
  // Stroke Motor Conflict Set (§41, 42)
  // ----------------------------------------------------
  {
    id: 'cnf-stroke-001',
    subjectClaimId: 'clm-stroke-001',
    supportingClaimIds: ['clm-stroke-003'],
    conflictingClaimIds: ['clm-stroke-004'],
    conflictType: 'population',
    reconciliationStatus: 'resolved',
    explanation: 'Contralesional M1 low-frequency inhibition improves motor recovery in mild-to-moderate paresis, but impairs function in severe paralysis where undamaged contralesional motor cortex acts as necessary compensatory reserve.',
    reviewedBy: ['rev-gov-stroke-lead'],
    provenance: { createdBy: 'curator_stroke_panel', createdAt: '2026-09-02T00:00:00Z', softwareVersion: '2.0.0' },
  },

  // ----------------------------------------------------
  // Post-Stroke Aphasia Conflict Set (§48)
  // ----------------------------------------------------
  {
    id: 'cnf-psa-001',
    subjectClaimId: 'clm-psa-001',
    supportingClaimIds: ['clm-psa-002', 'clm-psa-003'],
    conflictingClaimIds: ['clm-psa-004'],
    conflictType: 'protocol',
    reconciliationStatus: 'partially_explained',
    explanation: 'Right IFG low-frequency protocols combined with SLT show consistent naming gains in chronic non-fluent aphasia, while comparative network meta-analyses reveal divergent ranking across other language outcome domains.',
    reviewedBy: ['rev-gov-aphasia-lead'],
    provenance: { createdBy: 'curator_aphasia_panel', createdAt: '2026-09-02T00:00:00Z', softwareVersion: '2.0.0' },
  },

  // ----------------------------------------------------
  // TBI Conflict Set (§53-55)
  // ----------------------------------------------------
  {
    id: 'cnf-tbi-001',
    subjectClaimId: 'clm-tbi-001',
    supportingClaimIds: ['clm-tbi-002', 'clm-tbi-004'],
    conflictingClaimIds: ['clm-tbi-003', 'clm-tbi-005'],
    conflictType: 'effect_magnitude',
    reconciliationStatus: 'unresolved',
    explanation: 'A 2025 meta-analysis reported significant pooled cognitive benefit, while a 2026 trial sequential analysis concluded that the evidence is underpowered and statistically inconclusive. In post-TBI depression, meta-analyses directly conflict.',
    reviewedBy: ['rev-gov-tbi-lead'],
    provenance: { createdBy: 'curator_tbi_panel', createdAt: '2026-09-02T00:00:00Z', softwareVersion: '2.0.0' },
  },

  // ----------------------------------------------------
  // PTSD Conflict Set (§62, 63)
  // ----------------------------------------------------
  {
    id: 'cnf-ptsd-001',
    subjectClaimId: 'clm-ptsd-001',
    supportingClaimIds: ['clm-ptsd-002', 'clm-ptsd-003'],
    conflictingClaimIds: ['clm-ptsd-004'],
    conflictType: 'population',
    reconciliationStatus: 'partially_explained',
    explanation: 'High-frequency right DLPFC rTMS demonstrates robust superiority over sham in civilian trauma populations, but fails to reach statistical significance in combat-exposed veteran cohorts due to elevated sham response rates.',
    reviewedBy: ['rev-gov-ptsd-lead'],
    provenance: { createdBy: 'curator_ptsd_panel', createdAt: '2026-09-02T00:00:00Z', softwareVersion: '2.0.0' },
  },

  // ----------------------------------------------------
  // Tinnitus Conflict Set (§66-71)
  // ----------------------------------------------------
  {
    id: 'cnf-tin-001',
    subjectClaimId: 'clm-tin-003',
    supportingClaimIds: ['clm-tin-005'],
    conflictingClaimIds: ['clm-tin-001', 'clm-tin-002', 'clm-tin-004'],
    conflictType: 'effect_direction',
    reconciliationStatus: 'unresolved',
    explanation: 'Modest immediate short-term improvements on questionnaire distress scores directly conflict with AAO-HNS guideline recommendations against routine clinical use and multiple double-blind meta-analyses demonstrating null pooled superiority.',
    reviewedBy: ['rev-gov-tinnitus-lead'],
    provenance: { createdBy: 'curator_tinnitus_panel', createdAt: '2026-09-02T00:00:00Z', softwareVersion: '2.0.0' },
  },
];
