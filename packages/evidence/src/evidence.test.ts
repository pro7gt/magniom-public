import { describe, it, expect } from 'vitest';
import {
  EvidenceKnowledgeGraph,
  CANONICAL_EVIDENCE_RELEASE_1_0_0,
  validateEvidenceRelease,
  computeEvidenceManifestHash,
  isTierPermittedInClinicalMode,
} from './index.js';

describe('Evidence Knowledge Graph & Evidence Ceiling (@magniom/evidence)', () => {
  const graph = new EvidenceKnowledgeGraph(CANONICAL_EVIDENCE_RELEASE_1_0_0);

  it('validates and loads canonical release package 1.0.0 without errors', () => {
    const validated = validateEvidenceRelease(CANONICAL_EVIDENCE_RELEASE_1_0_0);
    expect(validated.version).toBe('MAGNIOM-EVIDENCE-1.0.0');
    expect(validated.status).toBe('active');
    expect(validated.claims.length).toBe(10);
    expect(validated.circuits.length).toBe(8);
    expect(validated.families.length).toBe(9);
  });

  it('computes deterministic SHA-256 manifest hash', () => {
    const hash1 = computeEvidenceManifestHash(CANONICAL_EVIDENCE_RELEASE_1_0_0);
    const hash2 = computeEvidenceManifestHash(CANONICAL_EVIDENCE_RELEASE_1_0_0);
    expect(hash1).toBe(hash2);
    expect(hash1.length).toBe(64);
  });

  it('resolves evidence ceiling tier for canonical clinical families (T1 / T2)', () => {
    expect(graph.getEvidenceCeilingTier('TF-MDD-LDLPFC-EST-001')).toBe('T1');
    expect(graph.getEvidenceCeilingTier('TF-MDD-CONVERGENT-LDLPFC-001')).toBe('T1');
    expect(graph.getEvidenceCeilingTier('TF-MDD-DYSPHORIC-001')).toBe('T2');
    expect(graph.getEvidenceCeilingTier('TF-MDD-ANXIOSOMATIC-DMPFC-001')).toBe('T2');
  });

  it('resolves evidence ceiling tier for research families (T3 / T4 / T_EXP)', () => {
    expect(graph.getEvidenceCeilingTier('TF-MDD-SGACC-NORMDEV-001')).toBe('T3');
    expect(graph.getEvidenceCeilingTier('TF-RES-CING-L8AV-001')).toBe('T4');
    expect(graph.getEvidenceCeilingTier('TF-RES-CING-LPGS-001')).toBe('T4');
    expect(graph.getEvidenceCeilingTier('TF-RES-CING-L46-001')).toBe('T_EXP');
  });

  it('enforces mode gating: clinical mode permits only clinical targets (T1/T2)', () => {
    expect(graph.isTargetFamilyPermittedInMode('TF-MDD-LDLPFC-EST-001', 'CLINICAL')).toBe(true);
    expect(graph.isTargetFamilyPermittedInMode('TF-MDD-CONVERGENT-LDLPFC-001', 'CLINICAL')).toBe(true);
    expect(graph.isTargetFamilyPermittedInMode('TF-MDD-ANXIOSOMATIC-DMPFC-001', 'CLINICAL')).toBe(true);

    // Research targets must be blocked in Clinical Mode
    expect(graph.isTargetFamilyPermittedInMode('TF-RES-CING-L8AV-001', 'CLINICAL')).toBe(false);
    expect(graph.isTargetFamilyPermittedInMode('TF-RES-CING-LPGS-001', 'CLINICAL')).toBe(false);
    expect(graph.isTargetFamilyPermittedInMode('TF-RES-CING-L46-001', 'CLINICAL')).toBe(false);

    // Research targets are allowed in Research Mode
    expect(graph.isTargetFamilyPermittedInMode('TF-RES-CING-L8AV-001', 'RESEARCH')).toBe(true);
  });

  it('traverses evidence path from TargetFamily to Circuits, Claims, and Sources', () => {
    const paths = graph.findEvidencePaths('TF-MDD-CONVERGENT-LDLPFC-001');
    expect(paths.length).toBeGreaterThanOrEqual(1);

    const firstPath = paths[0];
    expect(firstPath.targetFamilyCode).toBe('TF-MDD-CONVERGENT-LDLPFC-001');
    expect(firstPath.circuitCode).toBe('TC-MDD-CONVERGENT-001');
    expect(firstPath.claimTier).toBe('T2');
    expect(firstPath.sourceCitation).toContain('Siddiqi');
    expect(firstPath.nodes.length).toBe(4);
  });

  it('retrieves global negative/conflicting evidence (EC-PERSONALISED-SUPERIORITY-001)', () => {
    const conflicts = graph.getConflictingClaims('TF-MDD-CONVERGENT-LDLPFC-001');
    expect(conflicts.length).toBeGreaterThanOrEqual(1);

    const metaAnalysisConflict = conflicts.find((c) => c.claimCode === 'EC-PERSONALISED-SUPERIORITY-001');
    expect(metaAnalysisConflict).toBeDefined();
    expect(metaAnalysisConflict?.sourceCitation).toContain('Lancet Psychiatry');
    expect(metaAnalysisConflict?.clinicalImplication).toContain('Counterargument');
  });

  it('correctly maps search spaces and target definitions', () => {
    const searchSpace = graph.getSearchSpace('TF-MDD-CONVERGENT-LDLPFC-001');
    expect(searchSpace).toBeDefined();
    expect(searchSpace?.code).toBe('SS-MDD-LDLPFC-CONVERGENT-001');

    const targetDef = graph.getTargetDefinition('TF-MDD-LDLPFC-EST-001');
    expect(targetDef).toBeDefined();
    expect(targetDef?.code).toBe('TD-MDD-LDLPFC-BA46-MNI-001');
    expect(targetDef?.mniCoordinate.x).toBe(-38);
    expect(targetDef?.mniCoordinate.y).toBe(44);
    expect(targetDef?.mniCoordinate.z).toBe(30);
  });
});
