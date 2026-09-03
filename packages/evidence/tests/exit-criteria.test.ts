/**
 * Evidence Library v2 Module Exit Criteria Verification
 * Conforms to MAGNIOM-Implementation & Multi-Indication Validation Roadmap v2.0 (§Phase 4, Q3 Gate)
 * and MAGNIOM-Evidence Knowledge Graph & Therapeutic Circuit Library v2.0 (§75)
 */

import { describe, it, expect } from 'vitest';
import { EvidenceKnowledgeGraphV2 } from '../src/graph-v2.js';

describe('Evidence Library v2 Module Exit Criteria (§75, Q3 Gate)', () => {
  const graph = new EvidenceKnowledgeGraphV2();

  const INDICATION_IDS = [
    'ind-mdd-001',
    'ind-ocd-001',
    'ind-pain-001',
    'ind-stroke-001',
    'ind-aphasia-001',
    'ind-tbi-001',
    'ind-ptsd-001',
    'ind-tinnitus-001',
  ];

  it('verifies that all 8 indications pass module exit criteria checks', () => {
    for (const indId of INDICATION_IDS) {
      const result = graph.verifyModuleExitCriteria(indId);
      expect(
        result.passed,
        `Exit criteria failure for indication ${indId}: ${result.violations.join(', ')}`,
      ).toBe(true);
    }
  });

  it('criterion 1: target-generating claims are independently reviewed (lifecycleStatus: approved_scientific_claim)', () => {
    const claims = graph.getClaims();
    const targetGeneratingClaims = claims.filter((c) => (c.targetFamilyIds?.length ?? 0) > 0);
    expect(targetGeneratingClaims.length).toBeGreaterThanOrEqual(20);

    for (const claim of targetGeneratingClaims) {
      expect(claim.lifecycleStatus).toBe('approved_scientific_claim');
    }
  });

  it('criterion 2: material negative/conflicting evidence is represented across modules', () => {
    const emergingIndications = INDICATION_IDS.filter((id) => id !== 'ind-mdd-001');

    for (const indId of emergingIndications) {
      const negClaims = graph.getNegativeClaims(indId);
      expect(
        negClaims.length,
        `Indication ${indId} must have at least one negative or conflicting claim`,
      ).toBeGreaterThanOrEqual(1);
    }
  });

  it('criterion 3: population boundaries are explicit for every claim', () => {
    const claims = graph.getClaims();
    for (const claim of claims) {
      expect(claim.populationIds.length, `Claim ${claim.code} missing population boundaries`).toBeGreaterThanOrEqual(1);
      for (const popId of claim.populationIds) {
        expect(popId).toMatch(/^pop-/);
      }
    }
  });

  it('criterion 4: disease stage restrictions are explicit where clinically required', () => {
    // Stroke Motor subacute stage restriction
    const strokeMotorClaims = graph.getClaimsByIndication('ind-stroke-001');
    const subacuteClaim = strokeMotorClaims.find((c) => c.code === 'EC-STR-CM1-LF-POSTACUTE-001');
    expect(subacuteClaim).toBeDefined();
    expect(subacuteClaim?.diseaseStageDefinitionIds).toContain('stg-stroke-subacute-001');

    // Stroke Aphasia chronic stage restriction
    const aphasiaClaims = graph.getClaimsByIndication('ind-aphasia-001');
    const chronicAphasiaClaim = aphasiaClaims.find((c) => c.code === 'EC-PSA-RIFG-LF-CHRONIC-001');
    expect(chronicAphasiaClaim).toBeDefined();
    expect(chronicAphasiaClaim?.diseaseStageDefinitionIds).toContain('stg-stroke-chronic-001');
  });

  it('criterion 5: target geometry is accurately typed (coil_field, somatotopic, surface_roi, point)', () => {
    const paths = graph.getEvidencePaths();

    // OCD dTMS must use coil_field geometry (§83)
    const ocdDtmsPath = paths.find((p) => p.targetFamilyId === 'TF-OCD-MPFC-ACC-FIELD-001');
    expect(ocdDtmsPath).toBeDefined();
    expect(ocdDtmsPath?.targetGeometryType).toBe('coil_field');

    // Neuropathic Pain M1 must use somatotopic geometry (§84)
    const painPath = paths.find((p) => p.targetFamilyId === 'TF-PAIN-M1-SOMATO-001');
    expect(painPath).toBeDefined();
    expect(painPath?.targetGeometryType).toBe('somatotopic');

    // Stroke Motor M1 must use somatotopic geometry (§85)
    const strokePath = paths.find((p) => p.targetFamilyId === 'TF-STROKE-MOTOR-CM1-001');
    expect(strokePath).toBeDefined();
    expect(strokePath?.targetGeometryType).toBe('somatotopic');
  });

  it('criterion 6: treatment context requirements are explicit', () => {
    const paths = graph.getEvidencePaths();

    // Post-stroke aphasia must require speech-language therapy context (§86)
    const aphasiaPath = paths.find((p) => p.targetFamilyId === 'TF-PSA-RIFG-001');
    expect(aphasiaPath?.treatmentContextRequirementIds).toContain('tc-slt-001');

    // OCD dTMS must specify provocation protocol requirement
    const ocdPath = paths.find((p) => p.targetFamilyId === 'TF-OCD-MPFC-ACC-FIELD-001');
    expect(ocdPath?.treatmentContextRequirementIds).toContain('ctx-ocd-provocation-001');
  });

  it('criterion 7: source overlap is explicitly documented across contributions', () => {
    const claims = graph.getClaims();
    for (const claim of claims) {
      for (const contrib of claim.sourceContributions) {
        expect(['independent', 'partially_overlapping', 'overlapping_dataset']).toContain(
          contrib.independence,
        );
        expect(contrib.independence).not.toBe('unknown');
      }
    }
  });

  it('criterion 8: EvidencePaths are fully reconstructable to underlying claims and sources', () => {
    const paths = graph.getEvidencePaths();
    expect(paths.length).toBeGreaterThanOrEqual(10);

    for (const path of paths) {
      expect(path.evidenceClaimIds.length).toBeGreaterThanOrEqual(1);
      for (const claimId of path.evidenceClaimIds) {
        const claim = graph.getClaim(claimId);
        expect(claim, `Path ${path.id} references missing claim ${claimId}`).toBeDefined();
        expect(claim?.sourceContributions.length).toBeGreaterThanOrEqual(1);
        for (const contrib of claim!.sourceContributions) {
          const source = graph.getSource(contrib.sourceId);
          expect(source, `Claim ${claimId} references missing source ${contrib.sourceId}`).toBeDefined();
        }
      }
    }
  });
});
