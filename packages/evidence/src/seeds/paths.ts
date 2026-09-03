/**
 * Canonical Evidence Paths Manifest v2.0
 * Conforms to MAGNIOM-Evidence Knowledge Graph & Therapeutic Circuit Library v2.0 (§95, 96, 105)
 * Encodes target-generating pathways with status isolation:
 * - MDD: clinical_permitted
 * - OCD, Pain, Stroke Motor, Aphasia, TBI, PTSD: staging
 * - Tinnitus: research_permitted (zero clinical authority)
 */

import type { EvidencePath } from '@magniom/domain';

export const CANONICAL_EVIDENCE_PATHS: readonly EvidencePath[] = [
  // ----------------------------------------------------
  // MDD Clinical Evidence Paths
  // ----------------------------------------------------
  {
    id: 'pth-mdd-001',
    indicationModuleReleaseId: 'mod-mdd-rel-200',
    evidenceClaimIds: ['clm-mdd-001', 'clm-mdd-003'],
    populationId: 'pop-mdd-trd-001',
    clinicalObjectiveId: 'obj-mdd-remission-001',
    targetFamilyId: 'TF-MDD-LDLPFC-001',
    targetingStrategyId: 'STRAT-MDD-SGACC-ANTIDL-001',
    targetGeometryType: 'surface_roi',
    governanceClassificationIds: ['gov-mdd-001', 'gov-mdd-003'],
    pathStatus: 'clinical_permitted',
    scientificPolicyReleaseId: 'pol-mdd-rel-200',
    provenance: { createdBy: 'system_migration_adapter', createdAt: '2026-09-01T00:00:00Z', softwareVersion: '2.0.0' },
  },
  {
    id: 'pth-mdd-002',
    indicationModuleReleaseId: 'mod-mdd-rel-200',
    evidenceClaimIds: ['clm-mdd-002'],
    populationId: 'pop-mdd-trd-001',
    clinicalObjectiveId: 'obj-mdd-response-001',
    targetFamilyId: 'TF-MDD-LDLPFC-001',
    targetingStrategyId: 'STRAT-MDD-ITBS-001',
    targetGeometryType: 'point',
    governanceClassificationIds: ['gov-mdd-002'],
    pathStatus: 'clinical_permitted',
    scientificPolicyReleaseId: 'pol-mdd-rel-200',
    provenance: { createdBy: 'system_migration_adapter', createdAt: '2026-09-01T00:00:00Z', softwareVersion: '2.0.0' },
  },
  {
    id: 'pth-mdd-003',
    indicationModuleReleaseId: 'mod-mdd-rel-200',
    evidenceClaimIds: ['clm-mdd-004'],
    populationId: 'pop-mdd-trd-001',
    clinicalObjectiveId: 'obj-mdd-response-001',
    targetFamilyId: 'TF-MDD-RDLPFC-001',
    targetingStrategyId: 'STRAT-MDD-1HZ-RIGHT-001',
    targetGeometryType: 'point',
    governanceClassificationIds: ['gov-mdd-004'],
    pathStatus: 'clinical_permitted',
    scientificPolicyReleaseId: 'pol-mdd-rel-200',
    provenance: { createdBy: 'system_migration_adapter', createdAt: '2026-09-01T00:00:00Z', softwareVersion: '2.0.0' },
  },

  // ----------------------------------------------------
  // OCD Staging Evidence Paths (§24, 26, 30)
  // ----------------------------------------------------
  {
    id: 'pth-ocd-001',
    indicationModuleReleaseId: 'mod-ocd-rel-staging',
    evidenceClaimIds: ['clm-ocd-001'],
    populationId: 'pop-ocd-adult-001',
    clinicalObjectiveId: 'obj-ocd-core-001',
    targetFamilyId: 'TF-OCD-MPFC-ACC-FIELD-001',
    targetingStrategyId: 'STRAT-OCD-DTMS-MPFC-001',
    targetGeometryType: 'coil_field',
    treatmentContextRequirementIds: ['ctx-ocd-provocation-001'],
    governanceClassificationIds: ['gov-ocd-001'],
    pathStatus: 'staging',
    provenance: { createdBy: 'curator_ocd_panel', createdAt: '2026-09-02T00:00:00Z', softwareVersion: '2.0.0' },
  },
  {
    id: 'pth-ocd-002',
    indicationModuleReleaseId: 'mod-ocd-rel-staging',
    evidenceClaimIds: ['clm-ocd-002'],
    populationId: 'pop-ocd-adult-001',
    clinicalObjectiveId: 'obj-ocd-core-001',
    targetFamilyId: 'TF-OCD-PRESMA-SMA-001',
    targetingStrategyId: 'STRAT-OCD-SMA-1HZ-001',
    targetGeometryType: 'surface_roi',
    governanceClassificationIds: ['gov-ocd-002'],
    pathStatus: 'staging',
    provenance: { createdBy: 'curator_ocd_panel', createdAt: '2026-09-02T00:00:00Z', softwareVersion: '2.0.0' },
  },
  {
    id: 'pth-ocd-003',
    indicationModuleReleaseId: 'mod-ocd-rel-staging',
    evidenceClaimIds: ['clm-ocd-002', 'clm-ocd-003'],
    populationId: 'pop-ocd-adult-001',
    clinicalObjectiveId: 'obj-ocd-core-001',
    targetFamilyId: 'TF-OCD-DLPFC-001',
    targetingStrategyId: 'STRAT-OCD-DLPFC-001',
    targetGeometryType: 'point',
    governanceClassificationIds: ['gov-ocd-002', 'gov-ocd-003'],
    pathStatus: 'staging',
    provenance: { createdBy: 'curator_ocd_panel', createdAt: '2026-09-02T00:00:00Z', softwareVersion: '2.0.0' },
  },

  // ----------------------------------------------------
  // Neuropathic Pain Staging Evidence Paths (§31, 32, 84)
  // ----------------------------------------------------
  {
    id: 'pth-pain-001',
    indicationModuleReleaseId: 'mod-pain-rel-staging',
    evidenceClaimIds: ['clm-pain-001', 'clm-pain-002'],
    populationId: 'pop-pain-chronic-001',
    clinicalObjectiveId: 'obj-pain-reduction-001',
    targetFamilyId: 'TF-PAIN-M1-SOMATO-001',
    targetingStrategyId: 'STRAT-PAIN-M1-SOMATO-001',
    targetGeometryType: 'somatotopic',
    governanceClassificationIds: ['gov-pain-001', 'gov-pain-002'],
    pathStatus: 'staging',
    provenance: { createdBy: 'curator_pain_panel', createdAt: '2026-09-02T00:00:00Z', softwareVersion: '2.0.0' },
  },

  // ----------------------------------------------------
  // Stroke Motor Recovery Staging Evidence Paths (§36-39, 85)
  // ----------------------------------------------------
  {
    id: 'pth-stroke-001',
    indicationModuleReleaseId: 'mod-stroke-rel-staging',
    evidenceClaimIds: ['clm-stroke-001', 'clm-stroke-003'],
    populationId: 'pop-stroke-postacute-001',
    clinicalObjectiveId: 'obj-stroke-ue-001',
    diseaseStageId: 'stg-stroke-subacute-001',
    targetFamilyId: 'TF-STROKE-MOTOR-CM1-001',
    targetingStrategyId: 'STRAT-STROKE-CM1-1HZ-001',
    targetGeometryType: 'somatotopic',
    treatmentContextRequirementIds: ['ctx-stroke-rehab-001'],
    governanceClassificationIds: ['gov-stroke-001', 'gov-stroke-003'],
    pathStatus: 'staging',
    provenance: { createdBy: 'curator_stroke_panel', createdAt: '2026-09-02T00:00:00Z', softwareVersion: '2.0.0' },
  },
  {
    id: 'pth-stroke-002',
    indicationModuleReleaseId: 'mod-stroke-rel-staging',
    evidenceClaimIds: ['clm-stroke-002', 'clm-stroke-003'],
    populationId: 'pop-stroke-postacute-001',
    clinicalObjectiveId: 'obj-stroke-ue-001',
    diseaseStageId: 'stg-stroke-subacute-001',
    targetFamilyId: 'TF-STROKE-MOTOR-IM1-001',
    targetingStrategyId: 'STRAT-STROKE-IM1-HF-001',
    targetGeometryType: 'somatotopic',
    treatmentContextRequirementIds: ['ctx-stroke-rehab-001'],
    governanceClassificationIds: ['gov-stroke-002', 'gov-stroke-003'],
    pathStatus: 'staging',
    provenance: { createdBy: 'curator_stroke_panel', createdAt: '2026-09-02T00:00:00Z', softwareVersion: '2.0.0' },
  },

  // ----------------------------------------------------
  // Post-Stroke Aphasia Staging Evidence Paths (§43-46, 86)
  // ----------------------------------------------------
  {
    id: 'pth-psa-001',
    indicationModuleReleaseId: 'mod-aphasia-rel-staging',
    evidenceClaimIds: ['clm-psa-001', 'clm-psa-002', 'clm-psa-003'],
    populationId: 'pop-aphasia-chronic-nonfluent-001',
    clinicalObjectiveId: 'obj-psa-naming-001',
    diseaseStageId: 'stg-stroke-chronic-001',
    targetFamilyId: 'TF-PSA-RIFG-001',
    targetingStrategyId: 'STRAT-PSA-RIFG-1HZ-001',
    targetGeometryType: 'surface_roi',
    treatmentContextRequirementIds: ['tc-slt-001'],
    governanceClassificationIds: ['gov-psa-001', 'gov-psa-002', 'gov-psa-003'],
    pathStatus: 'staging',
    provenance: { createdBy: 'curator_aphasia_panel', createdAt: '2026-09-02T00:00:00Z', softwareVersion: '2.0.0' },
  },

  // ----------------------------------------------------
  // TBI Staging Evidence Paths (§49, 50, 87)
  // Intentionally pending primary study target binding
  // ----------------------------------------------------
  {
    id: 'pth-tbi-001',
    indicationModuleReleaseId: 'mod-tbi-rel-staging',
    evidenceClaimIds: ['clm-tbi-001'],
    populationId: 'pop-tbi-adult-001',
    clinicalObjectiveId: 'obj-tbi-cog-001',
    targetFamilyId: 'TF-TBI-UNRESOLVED-001',
    targetingStrategyId: 'STRAT-TBI-EXPLORATORY-001',
    targetGeometryType: 'surface_roi',
    governanceClassificationIds: ['gov-tbi-001'],
    pathStatus: 'staging',
    provenance: { createdBy: 'curator_tbi_panel', createdAt: '2026-09-02T00:00:00Z', softwareVersion: '2.0.0' },
  },

  // ----------------------------------------------------
  // PTSD Staging Evidence Paths (§58, 59, 88)
  // ----------------------------------------------------
  {
    id: 'pth-ptsd-001',
    indicationModuleReleaseId: 'mod-ptsd-rel-staging',
    evidenceClaimIds: ['clm-ptsd-001', 'clm-ptsd-002', 'clm-ptsd-003'],
    populationId: 'pop-ptsd-civilian-001',
    clinicalObjectiveId: 'obj-ptsd-core-001',
    targetFamilyId: 'TF-PTSD-RDLPFC-001',
    targetingStrategyId: 'STRAT-PTSD-RDLPFC-20HZ-001',
    targetGeometryType: 'point',
    governanceClassificationIds: ['gov-ptsd-001', 'gov-ptsd-002', 'gov-ptsd-003'],
    pathStatus: 'staging',
    provenance: { createdBy: 'curator_ptsd_panel', createdAt: '2026-09-02T00:00:00Z', softwareVersion: '2.0.0' },
  },

  // ----------------------------------------------------
  // Tinnitus Research Evidence Paths (§64, 65, 89)
  // Strictly research_permitted (zero clinical authority)
  // ----------------------------------------------------
  {
    id: 'pth-tin-001',
    indicationModuleReleaseId: 'mod-tinnitus-rel-research',
    evidenceClaimIds: ['clm-tin-003', 'clm-tin-005'],
    populationId: 'pop-tinnitus-chronic-001',
    clinicalObjectiveId: 'obj-tin-distress-001',
    targetFamilyId: 'TF-TIN-TEMPORAL-001',
    targetingStrategyId: 'STRAT-TIN-1HZ-AUDITORY-001',
    targetGeometryType: 'surface_roi',
    governanceClassificationIds: ['gov-tin-003', 'gov-tin-005'],
    pathStatus: 'research_permitted',
    provenance: { createdBy: 'curator_tinnitus_panel', createdAt: '2026-09-02T00:00:00Z', softwareVersion: '2.0.0' },
  },
  {
    id: 'pth-tin-002',
    indicationModuleReleaseId: 'mod-tinnitus-rel-research',
    evidenceClaimIds: ['clm-tin-003'],
    populationId: 'pop-tinnitus-chronic-001',
    clinicalObjectiveId: 'obj-tin-distress-001',
    targetFamilyId: 'TF-TIN-TPJ-001',
    targetingStrategyId: 'STRAT-TIN-TPJ-1HZ-001',
    targetGeometryType: 'surface_roi',
    governanceClassificationIds: ['gov-tin-003'],
    pathStatus: 'research_permitted',
    provenance: { createdBy: 'curator_tinnitus_panel', createdAt: '2026-09-02T00:00:00Z', softwareVersion: '2.0.0' },
  },
];
