import { describe, it, expect } from 'vitest';
import { runTargetEngine } from '../src/index.js';
import {
  G08_PHENOTYPE,
  G08_CONNECTOME,
  GOLDEN_CASE_08_CLINICAL_SLATE,
} from '@magniom/test-fixtures';
import {
  EvidenceKnowledgeGraph,
  CANONICAL_EVIDENCE_RELEASE_1_0_0,
  validateEvidenceRelease,
  computeEvidenceManifestHash,
} from '@magniom/evidence';

describe('Sprint 4 — Evidence Graph & Evidence Ceiling Verification', () => {
  describe('Canonical Release Package Verification', () => {
    it('successfully validates and loads the canonical database-derived release package', () => {
      const release = validateEvidenceRelease(CANONICAL_EVIDENCE_RELEASE_1_0_0);
      expect(release.version).toBe('MAGNIOM-EVIDENCE-1.0.0');
      expect(release.status).toBe('active');
      expect(release.claims.length).toBe(10);
      expect(release.circuits.length).toBe(8);
      expect(release.families.length).toBe(9);
    });

    it('computes deterministic manifest hash for canonical release package', () => {
      const hash1 = computeEvidenceManifestHash(CANONICAL_EVIDENCE_RELEASE_1_0_0);
      const hash2 = computeEvidenceManifestHash(CANONICAL_EVIDENCE_RELEASE_1_0_0);
      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64);
    });
  });

  describe('Evidence Graph Traversal & Negative Claims', () => {
    const graph = new EvidenceKnowledgeGraph(CANONICAL_EVIDENCE_RELEASE_1_0_0);

    it('resolves explicit multi-hop evidence paths for clinical target families', () => {
      const paths = graph.findEvidencePaths('TF-MDD-CONVERGENT-LDLPFC-001');
      expect(paths.length).toBeGreaterThanOrEqual(1);

      const path = paths[0];
      expect(path.targetFamilyCode).toBe('TF-MDD-CONVERGENT-LDLPFC-001');
      expect(path.circuitCode).toBe('TC-MDD-CONVERGENT-001');
      expect(path.claimTier).toBe('T2');
      expect(path.sourceCitation).toContain('Siddiqi');
    });

    it('retrieves global negative/conflicting evidence (EC-PERSONALISED-SUPERIORITY-001)', () => {
      const conflicts = graph.getConflictingClaims('TF-MDD-CONVERGENT-LDLPFC-001');
      expect(conflicts.length).toBeGreaterThanOrEqual(1);

      const superiorityConflict = conflicts.find((c) => c.claimCode === 'EC-PERSONALISED-SUPERIORITY-001');
      expect(superiorityConflict).toBeDefined();
      expect(superiorityConflict?.sourceCitation).toContain('Lancet Psychiatry');
      expect(superiorityConflict?.clinicalImplication).toContain('Counterargument');
    });
  });

  describe('Golden Case 08: Research Ceiling Enforcement (Sprint 4 Exit Criterion)', () => {
    it('enforces Evidence Ceiling in CLINICAL mode: Tier 4 research candidate is suppressed/disqualified', () => {
      const slate = runTargetEngine({
        phenotypeSnapshot: G08_PHENOTYPE,
        connectome: G08_CONNECTOME,
        mode: 'CLINICAL',
      });

      expect(slate.mode).toBe('CLINICAL');
      expect(slate.evidenceReleaseVersion).toBe('MAGNIOM-EVIDENCE-1.0.0');

      // In clinical mode, the Primary 1 candidate must be the evidence baseline and Primary 2 is the anxiosomatic target
      expect(slate.primaryCandidates).toHaveLength(2);
      const primary1 = slate.primaryCandidates[0];
      expect(primary1.role).toBe('PRIMARY_1');
      expect(primary1.familyId).toBe('TF-MDD-LDLPFC-EST-001');
      expect(primary1.evidenceTier).toBe('T1');

      const primary2 = slate.primaryCandidates[1];
      expect(primary2.role).toBe('PRIMARY_2');
      expect(primary2.familyId).toBe('TF-MDD-ANXIOSOMATIC-DMPFC-001');
      expect(primary2.evidenceTier).toBe('T2');

      // The Tier 4 research candidate (Cingulum L8Av) was prohibited from occupying a clinical slot
      const researchCandidateInPrimary = slate.primaryCandidates.find(
        (c) => c.familyId === 'TF-RES-CING-L8AV-001'
      );
      expect(researchCandidateInPrimary).toBeUndefined();

      // Clinical coverage profile is strictly calculated on approved clinical indications
      expect(slate.clinicalCoverageProfile.primaryDomainCovered).toBe('DOMAIN-MDD-DYSPHORIC-001');
      expect(slate.clinicalCoverageProfile.secondaryDomainsCovered).toContain('DOMAIN-MDD-ANXIOSOMATIC-001');

      // Verify matching with G08 fixture
      expect(slate).toEqual(GOLDEN_CASE_08_CLINICAL_SLATE);
    });

    it('evaluates research target in RESEARCH mode without clinical suppression', () => {
      const slate = runTargetEngine({
        phenotypeSnapshot: G08_PHENOTYPE,
        connectome: G08_CONNECTOME,
        mode: 'RESEARCH',
      });

      expect(slate.mode).toBe('RESEARCH');
      expect(slate.primaryCandidates.length).toBeGreaterThanOrEqual(1);

      // In Research Mode, the Tier 4 connectome candidate is permitted in the candidate slate
      expect(slate.additionalCandidates.length).toBeGreaterThanOrEqual(1);
      const candidate = slate.additionalCandidates.find((c) => c.familyId === 'TF-RES-CING-L8AV-001');
      expect(candidate).toBeDefined();
      expect(candidate?.evidenceTier).toBe('T4');
      expect(candidate?.method).toBe('CONNECTOME_REFINED');
    });

    it('proves 100% determinism of Evidence Ceiling resolution over 100 iterations', () => {
      const hashes = Array.from({ length: 100 }, () => {
        const slate = runTargetEngine({
          phenotypeSnapshot: G08_PHENOTYPE,
          connectome: G08_CONNECTOME,
          mode: 'CLINICAL',
        });
        return slate.deterministicManifestHash;
      });

      const uniqueHashes = new Set(hashes);
      expect(uniqueHashes.size).toBe(1);
      expect(hashes[0]).toBe(GOLDEN_CASE_08_CLINICAL_SLATE.deterministicManifestHash);
    });
  });
});
