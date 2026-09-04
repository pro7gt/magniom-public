/**
 * Therapeutic Circuits v2 & Circuit Nomenclature Safety Verification Suite
 * Conforms to MAGNIOM-Evidence Knowledge Graph & Therapeutic Circuit Library v2.0
 * (§16, §17, §42, §56, §65, §80, §81)
 */

import { describe, it, expect } from 'vitest';
import { EvidenceKnowledgeGraphV2 } from '../src/graph-v2.js';

describe('Therapeutic Circuits v2 & Circuit Nomenclature Safety (§16, §17)', () => {
  const graph = new EvidenceKnowledgeGraphV2();

  it('Circuit Nomenclature Safety Rule (§17): Neuropathic Pain, TBI, Tinnitus use circuit_kind = target_system', () => {
    // 1. Neuropathic Pain
    const painCirc = graph.getCircuit('TC-PAIN-M1-MODULATION-001');
    expect(painCirc).toBeDefined();
    expect(
      painCirc?.circuitKind,
      'Neuropathic pain must use target_system, not an invented distributed network (§17, §31)',
    ).toBe('target_system');

    // 2. TBI
    const tbiCirc = graph.getCircuit('TC-TBI-DLPFC-SYSTEM-001');
    expect(tbiCirc).toBeDefined();
    expect(
      tbiCirc?.circuitKind,
      'TBI must use target_system rather than manufacturing a mechanistic network (§17, §56)',
    ).toBe('target_system');

    // 3. Tinnitus
    const tinCirc = graph.getCircuit('TC-TIN-AUDITORY-SYSTEM-001');
    expect(tinCirc).toBeDefined();
    expect(
      tinCirc?.circuitKind,
      'Tinnitus must use target_system rather than manufacturing a mechanistic network (§17, §65)',
    ).toBe('target_system');
  });

  it('verifies Interhemispheric Model circuit classification for Stroke Motor recovery (§36, §42)', () => {
    const strokeCirc = graph.getCircuit('TC-STR-INTERHEMISPHERIC-001');
    expect(strokeCirc).toBeDefined();
    expect(strokeCirc?.circuitKind).toBe('interhemispheric_model');
    expect(strokeCirc?.scientificStatus).toBe('treatment_effect_linked');
  });

  it('verifies Distributed Functional Network classification for MDD and Post-Stroke Aphasia (§16, §43)', () => {
    // MDD SGC anticorrelation network
    const mddCirc = graph.getCircuit('TC-MDD-DLPFC-SACC-001');
    expect(mddCirc?.circuitKind).toBe('therapeutic_network');
    expect(mddCirc?.circuitArtifactIds).toContain('art-mdd-sgc-mask-001');

    // Aphasia language network
    const aphasiaCirc = graph.getCircuit('TC-PSA-LANGUAGE-NETWORK-001');
    expect(aphasiaCirc?.circuitKind).toBe('functional_network');
  });

  it('verifies that every seeded circuit includes explicit limitations and provenance (§16, §120)', () => {
    const circuits = graph.getCircuits();
    expect(circuits.length).toBeGreaterThanOrEqual(8);

    for (const circ of circuits) {
      expect(circ.limitations.length, `Circuit ${circ.code} missing limitations`).toBeGreaterThanOrEqual(1);
      expect(circ.provenance).toBeDefined();
      expect(circ.provenance.softwareVersion).toBe('2.0.0');
    }
  });
});
