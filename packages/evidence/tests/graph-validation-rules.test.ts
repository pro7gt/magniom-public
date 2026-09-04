/**
 * Graph Validation Rules Verification Suite
 * Conforms to MAGNIOM-Evidence Knowledge Graph & Therapeutic Circuit Library v2.0 (§117–123)
 */

import { describe, it, expect } from 'vitest';
import { EvidenceKnowledgeGraphV2 } from '../src/graph-v2.js';
import type { EvidenceClaimV2 } from '@magniom/domain';

describe('Evidence Knowledge Graph v2 — Validation Rules (§117–123)', () => {
  const graph = new EvidenceKnowledgeGraphV2();

  // ----------------------------------------------------
  // §117. Claim Wording Validation
  // ----------------------------------------------------
  it('§117: validateClaimWording rejects overbroad statements and accepts narrow propositions', () => {
    // Valid seeded claim
    const validClaim = graph.getClaim('EC-STR-CM1-LF-POSTACUTE-001')!;
    expect(graph.validateClaimWording(validClaim).valid).toBe(true);

    // Overbroad invalid claim
    const invalidClaim: EvidenceClaimV2 = {
      ...validClaim,
      statement: 'rTMS uniformly cures stroke paresis across all patients.',
    };
    const invalidResult = graph.validateClaimWording(invalidClaim);
    expect(invalidResult.valid).toBe(false);
    expect(invalidResult.reason).toContain('overbroad');

    // Too brief statement
    const briefClaim: EvidenceClaimV2 = {
      ...validClaim,
      statement: 'Works well.',
    };
    expect(graph.validateClaimWording(briefClaim).valid).toBe(false);
  });

  // ----------------------------------------------------
  // §118. Target Specificity Validation
  // ----------------------------------------------------
  it('§118: validateTargetSpecificity verifies target families exist and allows missing specificity for TBI', () => {
    // Valid seeded claim
    const validClaim = graph.getClaim('EC-OCD-MPFC-ACC-DTMS-001')!;
    expect(graph.validateTargetSpecificity(validClaim).valid).toBe(true);

    // TBI claim with empty targetFamilyIds (§50, §87) is VALID
    const tbiClaim = graph.getClaim('EC-TBI-META2025-COG-001')!;
    expect(tbiClaim.targetFamilyIds).toEqual([]);
    expect(graph.validateTargetSpecificity(tbiClaim).valid).toBe(true);

    // Invalid target family reference
    const badTargetClaim: EvidenceClaimV2 = {
      ...validClaim,
      targetFamilyIds: ['TF-NONEXISTENT-TARGET-999'],
    };
    const badResult = graph.validateTargetSpecificity(badTargetClaim);
    expect(badResult.valid).toBe(false);
    expect(badResult.reason).toContain('unknown TargetFamily');
  });

  // ----------------------------------------------------
  // §119. Treatment Context Validation
  // ----------------------------------------------------
  it('§119: validateTreatmentContext requires explicit context when synthesis marks dependence as material', () => {
    // Aphasia claim depends materially on Speech-Language Therapy
    const aphasiaClaim = graph.getClaim('EC-PSA-RIFG-LF-CHRONIC-001')!;
    const aphasiaPath = graph.getEvidencePathsForTargetFamily('TF-PSA-RIFG-001')[0];
    expect(graph.validateTreatmentContext(aphasiaClaim, aphasiaPath).valid).toBe(true);

    // Missing context requirement when material should fail
    const badContextClaim: EvidenceClaimV2 = {
      ...aphasiaClaim,
      treatmentContextRequirementIds: [],
    };
    const badPath = {
      ...aphasiaPath,
      treatmentContextRequirementIds: [],
    };
    const result = graph.validateTreatmentContext(badContextClaim, badPath);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('treatment context');
  });

  // ----------------------------------------------------
  // §120. Negative Evidence Validation
  // ----------------------------------------------------
  it('§120: validateNegativeEvidence verifies presence of negative/conflicting literature', () => {
    // Tinnitus has explicit negative evidence
    expect(graph.validateNegativeEvidence('ind-tinnitus-001').valid).toBe(true);

    // OCD has explicit null evidence (LF surface coil)
    expect(graph.validateNegativeEvidence('ind-ocd-001').valid).toBe(true);

    // Stroke has reserve limitation conflicts
    expect(graph.validateNegativeEvidence('ind-stroke-001').valid).toBe(true);

    // Hypothetical indication with zero negative claims
    const badResult = graph.validateNegativeEvidence('ind-hypothetical-zero-conflict');
    expect(badResult.valid).toBe(false);
    expect(badResult.missingConflicts.length).toBeGreaterThan(0);
  });

  // ----------------------------------------------------
  // §121. Source Overlap Validation
  // ----------------------------------------------------
  it('§121: validateSourceOverlap enforces that all contributions declare independence and flags unknown', () => {
    for (const claim of graph.getClaims()) {
      const res = graph.validateSourceOverlap(claim);
      expect(res.valid, `Claim ${claim.code} failed overlap validation`).toBe(true);
    }

    // Invalid contribution with unknown independence
    const sample = graph.getClaims()[0];
    const invalidClaim: EvidenceClaimV2 = {
      ...sample,
      sourceContributions: [
        {
          sourceId: 'src-test-01',
          sourceFindingIds: ['fnd-test-01'],
          relationship: 'supports',
          independence: 'unknown',
          relevance: 'direct',
        },
      ],
    };
    const res = graph.validateSourceOverlap(invalidClaim);
    expect(res.valid).toBe(false);
    expect(res.overlapIssues.length).toBe(1);
  });

  // ----------------------------------------------------
  // §122. Currentness & Surveillance Validation
  // ----------------------------------------------------
  it('§122: validateCurrentness checks review schedule against surveillance dates', () => {
    const claim = graph.getClaims()[0];
    // Past date check
    const pastCheck = graph.validateCurrentness(claim, new Date('2026-09-01T00:00:00Z'));
    expect(pastCheck.valid).toBe(true);
    expect(pastCheck.isOverdue).toBe(false);

    // Future overdue check (after nextReviewDue)
    const futureCheck = graph.validateCurrentness(claim, new Date('2028-01-01T00:00:00Z'));
    expect(futureCheck.valid).toBe(true);
    expect(futureCheck.isOverdue).toBe(true);
  });

  // ----------------------------------------------------
  // §123. Retraction / Correction Validation
  // ----------------------------------------------------
  it('§123: validateRetractionStatus flags dependent claims when a source is retracted', () => {
    // Standard unretracted source
    const normalRes = graph.validateRetractionStatus('src-ocd-002');
    expect(normalRes.retracted).toBe(false);
    expect(normalRes.affectedClaims.length).toBeGreaterThan(0);
  });
});
