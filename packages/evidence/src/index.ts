/**
 * @magniom/evidence
 * Relational knowledge graph traversal, evidence ceiling determination, and claim verification.
 * Conforms to MAGNIOM-Evidence Knowledge Graph & Therapeutic Circuit Library v1.0.
 */

import type { EvidenceTier } from '@magniom/domain';

export const EVIDENCE_TIER_RANK: Record<EvidenceTier, number> = {
  T1: 1, // Highest: Multi-center RCT / replicated circuit targeting
  T2: 2, // Moderate: Single prospective trial with clinical outcome
  T3: 3, // Retrospective or observational clinical cohort
  T4: 4, // Normative connectome / mechanistic imaging finding without direct clinical outcome
  T_EXP: 5, // Purely exploratory research finding (prohibited in Clinical Mode)
};

export function isTierPermittedInClinicalMode(tier: EvidenceTier): boolean {
  return tier === 'T1' || tier === 'T2' || tier === 'T3';
}

export * from './canonical-manifest.js';
export * from './release.js';
export * from './graph.js';
export * from './seeds/index.js';
export * from './graph-v2.js';
export * from './canonical-manifest-v2.js';
export * from './networks/claims.js';
export * from './networks/circuit-bindings.js';

