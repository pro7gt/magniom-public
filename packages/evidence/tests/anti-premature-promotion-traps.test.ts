/**
 * Anti-Premature Tier Promotion Guardrails & Traps Test Suite
 * Conforms to MAGNIOM-Implementation & Multi-Indication Validation Roadmap v2.0 (Phase 4 Directives)
 * and MAGNIOM-Evidence Knowledge Graph & Therapeutic Circuit Library v2.0 (§4, 8, 92, 93)
 */

import { describe, it, expect } from 'vitest';
import { EvidenceKnowledgeGraphV2 } from '../src/graph-v2.js';

describe('Anti-Premature Tier Promotion Guardrails & Safety Traps', () => {
  const graph = new EvidenceKnowledgeGraphV2();

  it('Trap 1: Scientific claim approval does NOT silently assign a clinical evidence tier', () => {
    // Check all emerging indication claims (OCD, Pain, Stroke, Aphasia, TBI, PTSD, Tinnitus)
    const emergingClaims = graph.getClaims().filter((c) => !c.indicationIds.includes('ind-mdd-001'));

    for (const claim of emergingClaims) {
      expect(claim.lifecycleStatus).toBe('approved_scientific_claim');

      // The claim object itself must not contain an embedded clinical tier!
      expect((claim as unknown as Record<string, unknown>).tier).toBeUndefined();
      expect((claim as unknown as Record<string, unknown>).magniomEvidenceTier).toBeUndefined();

      // The governance classification MUST remain unassigned
      const gov = graph.getGovernanceClassificationForClaim(claim.id);
      expect(gov, `Claim ${claim.code} missing governance classification`).toBeDefined();
      expect(
        gov?.classificationStatus,
        `Claim ${claim.code} was prematurely assigned a clinical tier!`,
      ).toBe('unassigned');
      expect(gov?.magniomEvidenceTier).toBeUndefined();
    }
  });

  it('Trap 2: Emerging indication EvidencePaths MUST NOT have clinical_permitted status', () => {
    const emergingPaths = graph
      .getEvidencePaths()
      .filter((p) => p.indicationModuleReleaseId !== 'mod-mdd-rel-200');

    for (const path of emergingPaths) {
      expect(path.pathStatus).not.toBe('clinical_permitted');
      expect(['staging', 'research_permitted']).toContain(path.pathStatus);
    }
  });

  it('Trap 3: Research-permitted paths (Tinnitus) have zero clinical authority', () => {
    const tinPaths = graph.getEvidencePathsForIndication('mod-tinnitus-rel-research');
    expect(tinPaths.length).toBeGreaterThanOrEqual(2);

    for (const path of tinPaths) {
      expect(path.pathStatus).toBe('research_permitted');
      // Verify all linked governance classifications are strictly unassigned
      for (const govId of path.governanceClassificationIds) {
        const gov = graph.getGovernanceClassification(govId);
        expect(gov?.classificationStatus).toBe('unassigned');
        expect(gov?.magniomEvidenceTier).toBeUndefined();
      }
    }
  });

  it('Trap 4: Overlapping meta-analyses MUST be documented as non-independent', () => {
    // Check Chen 2025 in OCD (overlaps with prior meta-analyses)
    const ocdClaim = graph.getClaim('EC-OCD-RCT-META-2025-001');
    expect(ocdClaim).toBeDefined();
    const contrib = ocdClaim?.sourceContributions.find((c) => c.sourceId === 'src-ocd-004');
    expect(contrib).toBeDefined();
    expect(contrib?.independence).toBe('overlapping_dataset');

    // Check Stroke Motor 2025 meta-analysis
    const strokeClaim = graph.getClaim('EC-STR-MOTOR-RCTMETA-2025-001');
    expect(strokeClaim).toBeDefined();
    const strokeContrib = strokeClaim?.sourceContributions.find((c) => c.sourceId === 'src-stroke-001');
    expect(strokeContrib).toBeDefined();
    expect(strokeContrib?.independence).toBe('partially_overlapping');
  });

  it('Trap 5: Target-generating claims must have underlying primary pivotal/replication studies, not meta-analyses alone', () => {
    // Verify OCD pivotal dTMS RCT (Carmi 2019)
    const ocdDtmsClaim = graph.getClaim('EC-OCD-MPFC-ACC-DTMS-001');
    expect(ocdDtmsClaim).toBeDefined();
    const carmiContrib = ocdDtmsClaim?.sourceContributions.find((c) => c.sourceId === 'src-ocd-002');
    expect(carmiContrib).toBeDefined();
    const carmiSource = graph.getSource(carmiContrib!.sourceId);
    expect(carmiSource?.sourceType).toBe('rct_pivotal');

    // Verify Neuropathic Pain pivotal RCT (André-Obadia 2008)
    const painClaim = graph.getClaim('EC-PAIN-HF-M1-001');
    const painContrib = painClaim?.sourceContributions.find((c) => c.sourceId === 'src-pain-004');
    expect(painContrib).toBeDefined();
    const painSource = graph.getSource(painContrib!.sourceId);
    expect(painSource?.sourceType).toBe('rct_pivotal');

    // Verify Stroke Motor pivotal RCT (Mansur 2005)
    const strokeClaim = graph.getClaim('EC-STR-CM1-LF-POSTACUTE-001');
    const strokeContrib = strokeClaim?.sourceContributions.find((c) => c.sourceId === 'src-stroke-003');
    expect(strokeContrib).toBeDefined();
    const strokeSource = graph.getSource(strokeContrib!.sourceId);
    expect(strokeSource?.sourceType).toBe('rct_pivotal');

    // Verify Post-Stroke Aphasia pivotal RCT (Thiel 2013 NORTHSTAR)
    const aphasiaClaim = graph.getClaim('EC-PSA-RIFG-LF-CHRONIC-001');
    const aphasiaContrib = aphasiaClaim?.sourceContributions.find((c) => c.sourceId === 'src-psa-004');
    expect(aphasiaContrib).toBeDefined();
    const aphasiaSource = graph.getSource(aphasiaContrib!.sourceId);
    expect(aphasiaSource?.sourceType).toBe('rct_pivotal');
  });

  it('Trap 6: No fake target coordinates — unresolved targets must remain unassigned or empty', () => {
    // In TBI, cognitive signal claim has NO fake coordinates or target families
    const tbiCogClaim = graph.getClaim('EC-TBI-META2025-COG-001');
    expect(tbiCogClaim?.targetFamilyIds).toEqual([]);

    const tbiPainClaim = graph.getClaim('EC-TBI-META2025-PAIN-001');
    expect(tbiPainClaim?.targetFamilyIds).toEqual([]);
  });
});
