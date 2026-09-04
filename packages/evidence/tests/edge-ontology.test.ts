/**
 * Edge Ontology & Prohibition of PROVES Verification Suite
 * Conforms to MAGNIOM-Evidence Knowledge Graph & Therapeutic Circuit Library v2.0 (§14, §15)
 */

import { describe, it, expect } from 'vitest';
import { EvidenceKnowledgeGraphV2 } from '../src/graph-v2.js';
import type { EvidenceEdge } from '@magniom/domain';

describe('Evidence Knowledge Graph v2 — Edge Ontology & Prohibition of PROVES (§14, §15)', () => {
  const graph = new EvidenceKnowledgeGraphV2();

  it('verifies presence of canonical v1 and v2 edges in the graph index (§14)', () => {
    const edges = graph.getEdges();
    expect(edges.length).toBeGreaterThanOrEqual(50);

    const edgeTypes = new Set(edges.map((e) => e.edgeType));

    // Retained v1 edges
    expect(edgeTypes).toContain('DERIVED_FROM');
    expect(edgeTypes).toContain('SUPPORTS');
    expect(edgeTypes).toContain('CONFLICTS_WITH');
    expect(edgeTypes).toContain('APPLIES_TO');
    expect(edgeTypes).toContain('ADDRESSES');
    expect(edgeTypes).toContain('MEASURES');
    expect(edgeTypes).toContain('ENGAGES');
    expect(edgeTypes).toContain('TARGETS');

    // Added v2 edges
    expect(edgeTypes).toContain('APPLIES_AT_STAGE');
    expect(edgeTypes).toContain('SUPPORTS_OBJECTIVE');
    expect(edgeTypes).toContain('REQUIRES_CONTEXT');
    expect(edgeTypes).toContain('USES_TARGET_GEOMETRY');
    expect(edgeTypes).toContain('LIMITS_GENERALISATION');
    expect(edgeTypes).toContain('DOES_NOT_SUPPORT');
  });

  it('allows traversal via outgoing and incoming edge lookups (§14)', () => {
    const claim = graph.getClaim('EC-OCD-MPFC-ACC-DTMS-001')!;
    const outgoing = graph.getOutgoingEdges(claim.id);
    expect(outgoing.length).toBeGreaterThan(0);

    const targetEdge = outgoing.find((e) => e.edgeType === 'TARGETS');
    expect(targetEdge).toBeDefined();
    expect(targetEdge?.targetNodeId).toBe('TF-OCD-MPFC-ACC-FIELD-001');

    const incomingToTarget = graph.getIncomingEdges('TF-OCD-MPFC-ACC-FIELD-001');
    expect(incomingToTarget.length).toBeGreaterThan(0);
    expect(incomingToTarget.some((e) => e.sourceNodeId === claim.id)).toBe(true);
  });

  it('Rule §15: adding a PROVES edge is strictly forbidden and throws an explicit error', () => {
    const illegalEdge: EvidenceEdge = {
      id: 'illegal-edge-01',
      sourceNodeId: 'c0000000-0000-0000-0000-000000000005',
      sourceNodeType: 'EvidenceClaim',
      edgeType: 'PROVES' as any,
      targetNodeId: 'TF-OCD-MPFC-ACC-FIELD-001',
      targetNodeType: 'TargetFamily',
    };

    expect(() => graph.addEdge(illegalEdge)).toThrowError(/Prohibited edge type \(§15\)/);
  });
});
