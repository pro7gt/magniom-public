/**
 * Release Golden Questionnaire Verification Suite
 * Conforms to MAGNIOM-Evidence Knowledge Graph & Therapeutic Circuit Library v2.0 (§143)
 * Validates deterministic answers to the 10 release questions across candidate targets
 */

import { describe, it, expect } from 'vitest';
import { EvidenceKnowledgeGraphV2 } from '../src/graph-v2.js';

describe('Release Golden Questionnaire Evaluator (§143)', () => {
  const graph = new EvidenceKnowledgeGraphV2();

  it('evaluates Golden Questionnaire for OCD dTMS field target (§143)', () => {
    const res = graph.evaluateReleaseGoldenQuestionnaire({
      targetFamilyId: 'TF-OCD-MPFC-ACC-FIELD-001',
      indicationId: 'ind-ocd-001',
    });

    // 1. Does the claim exist?
    expect(res.doesClaimExist).toBe(true);

    // 2. Which population does it apply to?
    expect(res.population).toContain('pop-ocd-adult-001');

    // 3. Which outcome does it measure?
    expect(res.outcomes).toContain('dom-ocd-ybocs-001');

    // 4. Which target was actually tested?
    expect(res.targetTested).toBe('TF-OCD-MPFC-ACC-FIELD-001');

    // 5. Was the target geometry point/ROI/field/somatotopic?
    expect(res.targetGeometry).toBe('coil_field');

    // 6. Which treatment context was used?
    expect(res.treatmentContext).toContain('ctx-ocd-provocation-001');

    // 7. What supports it?
    expect(res.supportingSources).toContain('src-ocd-001'); // FDA regulatory precedent
    expect(res.supportingSources).toContain('src-ocd-002'); // Carmi 2019 pivotal RCT

    // 8. What conflicts?
    expect(res.conflictingSources.length).toBeGreaterThanOrEqual(1);

    // 9. Has the Tier been assigned?
    expect(res.tierAssigned).toBe(false); // Staging: strictly unassigned (§8)
    expect(res.tier).toBeUndefined();

    // 10. Is the path Clinical, Validation or Research?
    expect(res.pathStatus).toBe('staging');
  });

  it('evaluates Golden Questionnaire for Neuropathic Pain M1 somatotopic target (§143)', () => {
    const res = graph.evaluateReleaseGoldenQuestionnaire({
      targetFamilyId: 'TF-PAIN-M1-SOMATO-001',
      indicationId: 'ind-pain-001',
    });

    expect(res.doesClaimExist).toBe(true);
    expect(res.targetGeometry).toBe('somatotopic');
    expect(res.supportingSources).toContain('src-cross-001'); // Lefaucheur 2020 guideline
    expect(res.supportingSources).toContain('src-pain-004'); // André-Obadia pivotal
    expect(res.tierAssigned).toBe(false);
    expect(res.pathStatus).toBe('staging');
  });

  it('evaluates Golden Questionnaire for Tinnitus Auditory Cortex Research target (§143)', () => {
    const res = graph.evaluateReleaseGoldenQuestionnaire({
      targetFamilyId: 'TF-TIN-TEMPORAL-AUDITORY-001',
      indicationId: 'ind-tinnitus-001',
    });

    expect(res.doesClaimExist).toBe(true);
    expect(res.conflictingSources.length).toBeGreaterThanOrEqual(1);
    expect(res.tierAssigned).toBe(false);
    expect(res.pathStatus).toBe('research_permitted'); // Research staging only
    expect(res.pathStatus).not.toBe('clinical_permitted');
  });

  it('evaluates Golden Questionnaire for MDD Convergent DLPFC target (§106, §143)', () => {
    const res = graph.evaluateReleaseGoldenQuestionnaire({
      targetFamilyId: 'tf-mdd-001',
      indicationId: 'ind-mdd-001',
    });

    expect(res.doesClaimExist).toBe(true);
    expect(['point', 'surface_roi']).toContain(res.targetGeometry);
    expect(res.tierAssigned).toBe(true); // Migrated v1 Tier A
    expect(res.tier).toBe('A');
    expect(res.pathStatus).toBe('clinical_permitted');
  });
});
