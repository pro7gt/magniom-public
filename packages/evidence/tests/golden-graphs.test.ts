/**
 * Golden Evidence Graphs Verification Suite
 * Conforms to MAGNIOM-Evidence Knowledge Graph & Therapeutic Circuit Library v2.0 (§110–116)
 * Validates the 7 multi-indication golden graph cases + MDD migration baseline
 */

import { describe, it, expect } from 'vitest';
import { EvidenceKnowledgeGraphV2 } from '../src/graph-v2.js';

describe('Golden Evidence Knowledge Graphs (§110–116)', () => {
  const graph = new EvidenceKnowledgeGraphV2();

  // ----------------------------------------------------
  // Golden Graph 1: OCD (§110)
  // ----------------------------------------------------
  it('Golden Graph 1 (OCD): verifies mPFC/ACC field target, provocation context, unassigned tier, and conflict set', () => {
    const claim = graph.getClaim('EC-OCD-MPFC-ACC-DTMS-001');
    expect(claim).toBeDefined();
    expect(claim?.targetFamilyIds).toContain('TF-OCD-MPFC-ACC-FIELD-001');

    // Evidence Path check
    const path = graph.getEvidencePathsForTargetFamily('TF-OCD-MPFC-ACC-FIELD-001')[0];
    expect(path).toBeDefined();
    expect(path.targetGeometryType).toBe('coil_field');
    expect(path.treatmentContextRequirementIds).toContain('ctx-ocd-provocation-001');
    expect(path.pathStatus).toBe('staging');

    // Governance: strictly unassigned
    const gov = graph.getGovernanceClassificationForClaim(claim!.id);
    expect(gov).toBeDefined();
    expect(gov?.classificationStatus).toBe('unassigned');
    expect(gov?.magniomEvidenceTier).toBeUndefined();

    // Conflict Set
    const conflicts = graph.getConflictSetsForClaim(claim!.id);
    expect(conflicts.length).toBeGreaterThanOrEqual(1);
    const cnf = conflicts[0];
    expect(cnf.conflictingClaimIds.length).toBeGreaterThanOrEqual(1);
    const nullClaim = graph.getClaim(cnf.conflictingClaimIds[0]);
    expect(nullClaim?.code).toBe('EC-OCD-LF-SURFACE-NULL-001');
  });

  // ----------------------------------------------------
  // Golden Graph 2: Neuropathic Pain (§111)
  // ----------------------------------------------------
  it('Golden Graph 2 (Neuropathic Pain): verifies contralateral somatotopic M1 target, guideline context, and unassigned tier', () => {
    const claim = graph.getClaim('EC-PAIN-HF-M1-001');
    expect(claim).toBeDefined();
    expect(claim?.targetFamilyIds).toContain('TF-PAIN-M1-SOMATO-001');

    // Evidence Path check
    const path = graph.getEvidencePathsForTargetFamily('TF-PAIN-M1-SOMATO-001')[0];
    expect(path).toBeDefined();
    expect(path.targetGeometryType).toBe('somatotopic');
    expect(path.pathStatus).toBe('staging');

    // Governance: strictly unassigned (despite external Level A)
    const gov = graph.getGovernanceClassificationForClaim(claim!.id);
    expect(gov).toBeDefined();
    expect(gov?.classificationStatus).toBe('unassigned');

    // Care context and heterogeneity claims present
    const careClaim = graph.getClaim('EC-PAIN-RMTS-CARE-POSITION-001');
    expect(careClaim).toBeDefined();
    const heteroClaim = graph.getClaim('EC-PAIN-M1-HETEROGENEITY-001');
    expect(heteroClaim).toBeDefined();
  });

  // ----------------------------------------------------
  // Golden Graph 3: Stroke Motor Recovery (§112)
  // ----------------------------------------------------
  it('Golden Graph 3 (Stroke Motor): verifies contralesional M1 low-frequency, subacute restriction, reserve conflict, and unassigned tier', () => {
    const claim = graph.getClaim('EC-STR-CM1-LF-POSTACUTE-001');
    expect(claim).toBeDefined();
    expect(claim?.diseaseStageDefinitionIds).toContain('stg-stroke-subacute-001');
    expect(claim?.targetFamilyIds).toContain('TF-STROKE-MOTOR-CM1-001');

    // Path check
    const path = graph.getEvidencePathsForTargetFamily('TF-STROKE-MOTOR-CM1-001')[0];
    expect(path).toBeDefined();
    expect(path.targetGeometryType).toBe('somatotopic');
    expect(path.diseaseStageId).toBe('stg-stroke-subacute-001');
    expect(path.pathStatus).toBe('staging');

    // Governance: strictly unassigned
    const gov = graph.getGovernanceClassificationForClaim(claim!.id);
    expect(gov?.classificationStatus).toBe('unassigned');

    // Mechanistic reserve conflict set
    const conflicts = graph.getConflictSetsForClaim(claim!.id);
    expect(conflicts.length).toBeGreaterThanOrEqual(1);
    const cnf = conflicts.find((c) => c.conflictType === 'population');
    expect(cnf).toBeDefined();
    const reserveClaim = graph.getClaim(cnf!.conflictingClaimIds[0]);
    expect(reserveClaim?.code).toBe('EC-STR-IHI-NOT-UNIVERSAL-001');
  });

  // ----------------------------------------------------
  // Golden Graph 4: Post-Stroke Aphasia (§113)
  // ----------------------------------------------------
  it('Golden Graph 4 (Post-Stroke Aphasia): verifies right IFG 1Hz, chronic non-fluent restriction, mandatory SLT context, and unassigned tier', () => {
    const claim = graph.getClaim('EC-PSA-RIFG-LF-CHRONIC-001');
    expect(claim).toBeDefined();
    expect(claim?.diseaseStageDefinitionIds).toContain('stg-stroke-chronic-001');
    expect(claim?.populationIds).toContain('pop-aphasia-chronic-nonfluent-001');

    // Path check
    const path = graph.getEvidencePathsForTargetFamily('TF-PSA-RIFG-001')[0];
    expect(path).toBeDefined();
    expect(path.treatmentContextRequirementIds).toContain('tc-slt-001');
    expect(path.pathStatus).toBe('staging');

    // Governance: strictly unassigned
    const gov = graph.getGovernanceClassificationForClaim(claim!.id);
    expect(gov?.classificationStatus).toBe('unassigned');

    // Synthesis evaluates treatment context dependence as material
    const syn = graph.getSynthesisForClaim(claim!.id);
    expect(syn?.treatmentContextDependence).toBe('material');
  });

  // ----------------------------------------------------
  // Golden Graph 5: Traumatic Brain Injury (§114)
  // ----------------------------------------------------
  it('Golden Graph 5 (TBI): verifies cognitive signal without target family, primary study requirement, TSA conflict, and unassigned tier', () => {
    const cogClaim = graph.getClaim('EC-TBI-META2025-COG-001');
    expect(cogClaim).toBeDefined();
    // In accordance with §50 & §87: target family is empty pending primary-study extraction!
    expect(cogClaim?.targetFamilyIds).toEqual([]);

    // Conflict Set links 2026 Trial Sequential Analysis null finding
    const conflicts = graph.getConflictSetsForClaim(cogClaim!.id);
    expect(conflicts.length).toBeGreaterThanOrEqual(1);
    const cnf = conflicts[0];
    expect(cnf.conflictingClaimIds.length).toBeGreaterThanOrEqual(1);
    const tsaClaim = graph.getClaim(cnf.conflictingClaimIds[1]);
    expect(tsaClaim?.code).toBe('EC-TBI-TSA2026-CONFLICT-001');

    // Governance: strictly unassigned
    const gov = graph.getGovernanceClassificationForClaim(cogClaim!.id);
    expect(gov?.classificationStatus).toBe('unassigned');
  });

  // ----------------------------------------------------
  // Golden Graph 6: PTSD (§115)
  // ----------------------------------------------------
  it('Golden Graph 6 (PTSD): verifies high-frequency right DLPFC, civilian population boundary, combat veteran conflict, and unassigned tier', () => {
    const claim = graph.getClaim('EC-PTSD-RDLPFC-HF-001');
    expect(claim).toBeDefined();
    expect(claim?.populationIds).toContain('pop-ptsd-civilian-001');
    expect(claim?.targetFamilyIds).toContain('TF-PTSD-RDLPFC-001');

    // Governance: strictly unassigned
    const gov = graph.getGovernanceClassificationForClaim(claim!.id);
    expect(gov?.classificationStatus).toBe('unassigned');

    // Conflict set connects veteran combat-related trial non-significance
    const conflicts = graph.getConflictSetsForClaim(claim!.id);
    expect(conflicts.length).toBeGreaterThanOrEqual(1);
    const cnf = conflicts[0];
    const combatClaim = graph.getClaim(cnf.conflictingClaimIds[0]);
    expect(combatClaim?.code).toBe('EC-PTSD-COMBAT-CONFLICT-001');
    expect(combatClaim?.populationIds).toContain('pop-ptsd-combat-001');
  });

  // ----------------------------------------------------
  // Golden Graph 7: Tinnitus (§116)
  // ----------------------------------------------------
  it('Golden Graph 7 (Tinnitus): verifies guideline negative evidence, research-only paths, and zero clinical authority', () => {
    const guidelineClaim = graph.getClaim('EC-TIN-ROUTINE-TMS-GUIDELINE-NEG-001');
    expect(guidelineClaim).toBeDefined();
    expect(guidelineClaim?.claimType).toBe('negative_evidence');
    expect(guidelineClaim?.direction).toBe('does_not_support');

    // Paths: strictly research_permitted
    const paths = graph.getEvidencePathsForIndication('mod-tinnitus-rel-research');
    expect(paths.length).toBeGreaterThanOrEqual(2);
    for (const path of paths) {
      expect(path.pathStatus).toBe('research_permitted');
      expect(path.pathStatus).not.toBe('clinical_permitted');
    }

    // Governance: strictly unassigned
    const gov = graph.getGovernanceClassificationForClaim(guidelineClaim!.id);
    expect(gov?.classificationStatus).toBe('unassigned');
  });

  // ----------------------------------------------------
  // Golden Graph 8: MDD Migration Baseline (§106, 107)
  // ----------------------------------------------------
  it('Golden Graph 8 (MDD Migration): verifies preserved historical claims, assigned tier A/B, and clinical_permitted paths', () => {
    const claim1 = graph.getClaim('EC-MDD-LDLPFC-EFFICACY-001');
    expect(claim1).toBeDefined();

    const gov1 = graph.getGovernanceClassificationForClaim(claim1!.id);
    expect(gov1).toBeDefined();
    expect(gov1?.classificationStatus).toBe('assigned');
    expect(gov1?.magniomEvidenceTier).toBe('A');
    expect(gov1?.classificationBasis).toBe('migrated_v1_governance');

    // MDD Paths are clinical_permitted
    const mddPaths = graph.getEvidencePathsForIndication('mod-mdd-rel-200');
    expect(mddPaths.length).toBeGreaterThanOrEqual(3);
    for (const path of mddPaths) {
      expect(path.pathStatus).toBe('clinical_permitted');
    }
  });
});
