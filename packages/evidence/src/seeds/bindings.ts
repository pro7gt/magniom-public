/**
 * Canonical Claim ↔ Target Binding Seeds v2.0
 * Conforms to MAGNIOM-Evidence Knowledge Graph & Therapeutic Circuit Library v2.0 (§19)
 */

import type { ClaimTargetBinding } from '@magniom/domain';

export const CANONICAL_CLAIM_TARGET_BINDINGS: readonly ClaimTargetBinding[] = [
  // ----------------------------------------------------
  // MDD Bindings
  // ----------------------------------------------------
  {
    id: 'bnd-mdd-001',
    evidenceClaimId: 'c0000000-0000-0000-0000-000000000001',
    targetFamilyId: 'tf-mdd-001',
    targetingStrategyId: 'strat-sgc-fconn',
    geometryClass: 'point',
    relationship: 'directly_tested',
    limitations: ['Requires individualized functional connectivity mapping.'],
  },
  {
    id: 'bnd-mdd-002',
    evidenceClaimId: 'c0000000-0000-0000-0000-000000000002',
    targetFamilyId: 'tf-mdd-002',
    targetingStrategyId: 'strat-anatomical-heuristic',
    geometryClass: 'point',
    relationship: 'consistent_with',
    limitations: ['Anatomical surrogate without functional connectivity targeting.'],
  },
  {
    id: 'bnd-mdd-003',
    evidenceClaimId: 'c0000000-0000-0000-0000-000000000003',
    targetFamilyId: 'tf-mdd-001',
    targetingStrategyId: 'strat-individualized-fmri',
    geometryClass: 'point',
    relationship: 'directly_tested',
    limitations: ['Superiority over 5-cm rule demonstrated in prospective randomized trials.'],
  },

  // ----------------------------------------------------
  // OCD Bindings (§26, §27, §28, §83)
  // ----------------------------------------------------
  {
    id: 'bnd-ocd-001',
    evidenceClaimId: 'c0000000-0000-0000-0000-000000000005',
    targetFamilyId: 'TF-OCD-MPFC-ACC-FIELD-001',
    targetingStrategyId: 'strat-ocd-dtms-h7',
    geometryClass: 'coil_field',
    relationship: 'directly_tested',
    limitations: ['Cleared specifically with H7 coil geometry; not valid for focal point coils (§83).'],
  },
  {
    id: 'bnd-ocd-002',
    evidenceClaimId: 'c0000000-0000-0000-0000-000000000006',
    targetFamilyId: 'TF-OCD-PRESMA-SMA-001',
    targetingStrategyId: 'strat-ocd-sma-surface',
    geometryClass: 'surface_roi',
    relationship: 'consistent_with',
    limitations: ['Included in network meta-analysis; modest sample sizes.'],
  },
  {
    id: 'bnd-ocd-003',
    evidenceClaimId: 'c0000000-0000-0000-0000-000000000006',
    targetFamilyId: 'TF-OCD-DLPFC-001',
    targetingStrategyId: 'strat-ocd-dlpfc-bilat',
    geometryClass: 'point',
    relationship: 'consistent_with',
    limitations: ['Network meta-analysis finding across multiple DLPFC protocols.'],
  },

  // ----------------------------------------------------
  // Neuropathic Pain Bindings (§32, §84)
  // ----------------------------------------------------
  {
    id: 'bnd-pain-001',
    evidenceClaimId: 'c0000000-0000-0000-0000-000000000009',
    targetFamilyId: 'TF-PAIN-M1-SOMATO-001',
    targetingStrategyId: 'strat-pain-m1-somato',
    geometryClass: 'somatotopic',
    relationship: 'directly_tested',
    limitations: ['Requires exact somatotopic mapping contralateral to the pain distribution (§84).'],
  },
  {
    id: 'bnd-pain-002',
    evidenceClaimId: 'c0000000-0000-0000-0000-000000000010',
    targetFamilyId: 'TF-PAIN-M1-SOMATO-001',
    targetingStrategyId: 'strat-pain-m1-somato',
    geometryClass: 'somatotopic',
    relationship: 'consistent_with',
    limitations: ['Heterogeneity across etiologies (facial vs peripheral neuropathy).'],
  },

  // ----------------------------------------------------
  // Stroke Motor Bindings (§38, §39, §85)
  // ----------------------------------------------------
  {
    id: 'bnd-stroke-001',
    evidenceClaimId: 'c0000000-0000-0000-0000-000000000013',
    targetFamilyId: 'TF-STROKE-MOTOR-CM1-001',
    targetingStrategyId: 'strat-stroke-cm1-lf',
    geometryClass: 'somatotopic',
    relationship: 'directly_tested',
    limitations: ['Subacute stage restriction; valid only in mild-to-moderate motor impairment (§85).'],
  },
  {
    id: 'bnd-stroke-002',
    evidenceClaimId: 'c0000000-0000-0000-0000-000000000014',
    targetFamilyId: 'TF-STROKE-MOTOR-IM1-001',
    targetingStrategyId: 'strat-stroke-im1-hf',
    geometryClass: 'somatotopic',
    relationship: 'directly_tested',
    limitations: ['Requires preservation of minimum viable corticospinal projections.'],
  },
  {
    id: 'bnd-stroke-003',
    evidenceClaimId: 'c0000000-0000-0000-0000-000000000015',
    targetFamilyId: 'TF-STROKE-MOTOR-SMA-001',
    targetingStrategyId: 'strat-stroke-sma-secondary',
    geometryClass: 'surface_roi',
    relationship: 'indirectly_supports',
    limitations: ['Exploratory secondary motor hypothesis for capsular stroke.'],
  },

  // ----------------------------------------------------
  // Post-Stroke Aphasia Bindings (§45, §46, §86)
  // ----------------------------------------------------
  {
    id: 'bnd-aphasia-001',
    evidenceClaimId: 'c0000000-0000-0000-0000-000000000017',
    targetFamilyId: 'TF-PSA-RIFG-001',
    targetingStrategyId: 'strat-aphasia-rifg-1hz',
    geometryClass: 'point',
    relationship: 'directly_tested',
    limitations: ['Mandatory speech-language therapy context; chronic non-fluent aphasia only (§86).'],
  },
  {
    id: 'bnd-aphasia-002',
    evidenceClaimId: 'c0000000-0000-0000-0000-000000000018',
    targetFamilyId: 'TF-PSA-LIFG-001',
    targetingStrategyId: 'strat-aphasia-lifg-hf',
    geometryClass: 'point',
    relationship: 'consistent_with',
    limitations: ['Applicable only when residual tissue in left frontal operculum is viable.'],
  },

  // ----------------------------------------------------
  // TBI Bindings (§50, §87)
  // ----------------------------------------------------
  {
    id: 'bnd-tbi-001',
    evidenceClaimId: 'c0000000-0000-0000-0000-000000000021',
    targetFamilyId: 'TF-TBI-DLPFC-001',
    targetingStrategyId: 'strat-tbi-exploratory-f3',
    geometryClass: 'surface_roi',
    relationship: 'indirectly_supports',
    limitations: [
      'Missing target specificity: primary studies used crude 5-cm rule without MNI coordinates (§50, §87).',
      'Research staging only; not clinically permitted.',
    ],
  },

  // ----------------------------------------------------
  // PTSD Bindings (§59, §61, §88)
  // ----------------------------------------------------
  {
    id: 'bnd-ptsd-001',
    evidenceClaimId: 'c0000000-0000-0000-0000-000000000026',
    targetFamilyId: 'TF-PTSD-RDLPFC-001',
    targetingStrategyId: 'strat-ptsd-rdlpfc-hf',
    geometryClass: 'point',
    relationship: 'directly_tested',
    limitations: ['Tested predominantly in civilian trauma cohorts; combat efficacy neutral (§88).'],
  },
  {
    id: 'bnd-ptsd-002',
    evidenceClaimId: 'c0000000-0000-0000-0000-000000000028',
    targetFamilyId: 'TF-PTSD-LDLPFC-001',
    targetingStrategyId: 'strat-ptsd-ldlpfc-comorbid',
    geometryClass: 'point',
    relationship: 'consistent_with',
    limitations: ['Secondary hypothesis addressing comorbid major depressive episodes.'],
  },

  // ----------------------------------------------------
  // Tinnitus Bindings (§65, §89, §100)
  // ----------------------------------------------------
  {
    id: 'bnd-tinnitus-001',
    evidenceClaimId: 'c0000000-0000-0000-0000-000000000032',
    targetFamilyId: 'TF-TIN-TEMPORAL-AUDITORY-001',
    targetingStrategyId: 'strat-tin-a1-1hz',
    geometryClass: 'surface_roi',
    relationship: 'directly_tested',
    limitations: [
      'Contradicted by clinical guidelines against routine TMS (§66, §89).',
      'Research-only staging status; clinical target generation strictly forbidden (§71, §100).',
    ],
  },
  {
    id: 'bnd-tinnitus-002',
    evidenceClaimId: 'c0000000-0000-0000-0000-000000000033',
    targetFamilyId: 'TF-TIN-TEMPOROPARIETAL-001',
    targetingStrategyId: 'strat-tin-tpj-1hz',
    geometryClass: 'point',
    relationship: 'consistent_with',
    limitations: ['Research mode only; meta-analytic outcomes conflicting.'],
  },
  {
    id: 'bnd-tinnitus-003',
    evidenceClaimId: 'c0000000-0000-0000-0000-000000000034',
    targetFamilyId: 'TF-TIN-COMBINED-001',
    targetingStrategyId: 'strat-tin-dual-site',
    geometryClass: 'surface_roi',
    relationship: 'not_tested',
    limitations: ['Experimental research protocol; non-significant pooled outcome.'],
  },
];
