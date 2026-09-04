/**
 * First-Class Graph Queries Verification Suite
 * Conforms to MAGNIOM-Evidence Knowledge Graph & Therapeutic Circuit Library v2.0 (§97–102)
 */

import { describe, it, expect } from 'vitest';
import { EvidenceKnowledgeGraphV2 } from '../src/graph-v2.js';

describe('Evidence Knowledge Graph v2 — Six First-Class Queries (§97–102)', () => {
  const graph = new EvidenceKnowledgeGraphV2();

  // ----------------------------------------------------
  // §97. Query 1: Why this target?
  // ----------------------------------------------------
  it('§97: queryWhyThisTarget returns direct support, material conflicts, geometries, and contexts', () => {
    // 1. OCD mPFC/ACC field target
    const ocdResult = graph.queryWhyThisTarget('TF-OCD-MPFC-ACC-FIELD-001', 'ind-ocd-001');
    expect(ocdResult.targetFamilyId).toBe('TF-OCD-MPFC-ACC-FIELD-001');
    expect(ocdResult.evidencePaths.length).toBeGreaterThanOrEqual(1);
    expect(ocdResult.strongestDirectSupport.length).toBeGreaterThanOrEqual(1);
    expect(ocdResult.strongestDirectSupport[0].code).toBe('EC-OCD-MPFC-ACC-DTMS-001');
    expect(ocdResult.targetGeometries).toContain('coil_field');
    expect(ocdResult.treatmentContexts).toContain('ctx-ocd-provocation-001');
    expect(ocdResult.materialConflicts.length).toBeGreaterThanOrEqual(1);
    expect(ocdResult.assignedTier).toBeUndefined(); // Staging unassigned

    // 2. Neuropathic Pain M1 somatotopic target
    const painResult = graph.queryWhyThisTarget('TF-PAIN-M1-SOMATO-001', 'ind-pain-001');
    expect(painResult.targetFamilyId).toBe('TF-PAIN-M1-SOMATO-001');
    expect(painResult.targetGeometries).toContain('somatotopic');
    expect(painResult.strongestDirectSupport[0].code).toBe('EC-PAIN-HF-M1-001');

    // 3. Stroke Motor contralesional M1 target
    const strokeResult = graph.queryWhyThisTarget('TF-STROKE-MOTOR-CM1-001', 'ind-stroke-001');
    expect(strokeResult.stageApplicability).toContain('stg-stroke-subacute-001');
    expect(strokeResult.materialConflicts.some((c) => c.conflictType === 'population')).toBe(true);

    // 4. PTSD Right DLPFC target
    const ptsdResult = graph.queryWhyThisTarget('TF-PTSD-RDLPFC-001', 'ind-ptsd-001');
    expect(ptsdResult.populationApplicability).toContain('pop-ptsd-civilian-001');
    expect(ptsdResult.materialConflicts.some((c) => c.explanation?.toLowerCase().includes('veteran'))).toBe(true);
  });

  // ----------------------------------------------------
  // §98. Query 2: What exactly is clinically permitted?
  // ----------------------------------------------------
  it('§98: queryWhatIsClinicallyPermitted enforces that ONLY authorized paths return clinical permission', () => {
    // MDD has clinical permission via v1 migration (§106)
    const mddResult = graph.queryWhatIsClinicallyPermitted('mod-mdd-rel-200');
    expect(mddResult.permittedPaths.length).toBeGreaterThanOrEqual(3);
    expect(mddResult.permittedTargetFamilies.length).toBeGreaterThanOrEqual(2);
    expect(mddResult.permittedTargetGeometries).toContain('point');

    // Emerging indications (OCD, Pain, Stroke, TBI, PTSD, Tinnitus) MUST return ZERO clinically permitted paths!
    const emergingReleases = [
      'mod-ocd-rel-staging',
      'mod-pain-rel-staging',
      'mod-stroke-rel-staging',
      'mod-aphasia-rel-staging',
      'mod-tbi-rel-staging',
      'mod-ptsd-rel-staging',
      'mod-tinnitus-rel-research',
    ];

    for (const relId of emergingReleases) {
      const res = graph.queryWhatIsClinicallyPermitted(relId);
      expect(res.permittedPaths.length).toBe(0);
      expect(res.permittedTargetFamilies.length).toBe(0);
    }
  });

  // ----------------------------------------------------
  // §99. Query 3: What does the evidence say, without a Tier?
  // ----------------------------------------------------
  it('§99: queryEvidenceWithoutTier returns dimensional synthesis with unassigned governance status', () => {
    const ocdSyntheses = graph.queryEvidenceWithoutTier('ind-ocd-001');
    expect(ocdSyntheses.length).toBeGreaterThanOrEqual(3);

    for (const syn of ocdSyntheses) {
      expect(syn.governanceStatus).toBe('unassigned');
      expect(syn.statement.length).toBeGreaterThan(10);
      expect(syn.directness).toBeDefined();
      expect(syn.replication).toBeDefined();
      expect(syn.consistency).toBeDefined();
    }

    // Specific claim query
    const singleClaimRes = graph.queryEvidenceWithoutTier('EC-PSA-RIFG-LF-CHRONIC-001');
    expect(singleClaimRes.length).toBe(1);
    expect(singleClaimRes[0].claimCode).toBe('EC-PSA-RIFG-LF-CHRONIC-001');
    expect(singleClaimRes[0].treatmentContextDependence).toBe('material');
  });

  // ----------------------------------------------------
  // §100. Query 4: What targets are only staging?
  // ----------------------------------------------------
  it('§100: queryStagingTargets verifies staging/research targets with zero clinical permission', () => {
    // Tinnitus query
    const tinRes = graph.queryStagingTargets('ind-tinnitus-001');
    expect(tinRes.clinicalPermission).toBe(false);
    expect(tinRes.researchTargetFamilies.length).toBeGreaterThanOrEqual(2);
    expect(tinRes.researchPaths.length).toBeGreaterThanOrEqual(2);

    for (const tf of tinRes.researchTargetFamilies) {
      expect(tf.governanceStatus).toBe('research');
    }

    // OCD query
    const ocdRes = graph.queryStagingTargets('ind-ocd-001');
    expect(ocdRes.clinicalPermission).toBe(false);
    expect(ocdRes.stagingTargetFamilies.length).toBeGreaterThanOrEqual(3);
  });

  // ----------------------------------------------------
  // §101. Query 5: Which claims have important null evidence?
  // ----------------------------------------------------
  it('§101: queryClaimsWithNullEvidence retrieves null findings and conflicting claims', () => {
    const nullClaims = graph.queryClaimsWithNullEvidence();
    expect(nullClaims.length).toBeGreaterThanOrEqual(5);

    // Tinnitus negative guideline finding
    const tinNull = nullClaims.find((c) => c.claimCode === 'EC-TIN-ROUTINE-TMS-GUIDELINE-NEG-001');
    expect(tinNull).toBeDefined();
    expect(
      tinNull?.nullFindings.some(
        (f) =>
          f.findingType === 'null_result' ||
          f.findingType === 'limitation' ||
          f.findingType === 'guideline_recommendation',
      ),
    ).toBe(true);

    // OCD low-frequency non-navigated null finding
    const ocdNull = nullClaims.find((c) => c.claimCode === 'EC-OCD-LF-SURFACE-NULL-001');
    expect(ocdNull).toBeDefined();
    expect(ocdNull?.conflictingClaims.length).toBeGreaterThanOrEqual(1);
  });

  // ----------------------------------------------------
  // §102. Query 6: What changed?
  // ----------------------------------------------------
  it('§102: diffEvidenceReleases detects added, removed, and modified claims and conflicts', () => {
    // Create a mock prior release
    const priorRelease = {
      version: '1.9.0-prior',
      sources: graph.getSources().slice(0, 5),
      findings: graph.getFindings().slice(0, 5),
      claims: graph.getClaims().slice(0, 5),
      syntheses: graph.getClaims().slice(0, 5).map((c) => graph.getSynthesisForClaim(c.id)!),
      governanceClassifications: graph.getClaims().slice(0, 5).map((c) => graph.getGovernanceClassificationForClaim(c.id)!),
      conflictSets: [],
      evidencePaths: graph.getEvidencePaths().slice(0, 2),
    };

    const diff = graph.diffEvidenceReleases(priorRelease);
    expect(diff.oldReleaseCode).toBe('1.9.0-prior');
    expect(diff.newReleaseCode).toBe(graph.getReleaseVersion());
    expect(diff.addedSources.length).toBeGreaterThan(0);
    expect(diff.addedClaims.length).toBeGreaterThan(0);
    expect(diff.newConflicts.length).toBe(graph.getConflictSets().length);
    expect(diff.changedEvidencePaths.length).toBeGreaterThan(0);
  });
});
