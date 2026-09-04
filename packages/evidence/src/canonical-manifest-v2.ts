/**
 * MAGNIOM Canonical Evidence Knowledge Graph Release 2.0.0-staging Manifest
 * Conforms to MAGNIOM-Evidence Knowledge Graph & Therapeutic Circuit Library v2.0 (§104, 105)
 * Manifest assembly and cryptographic digest calculation
 */

import type { EvidenceLibraryReleaseV2 } from '@magniom/domain';
import { computeSha256 } from '@magniom/scientific-policy';
import {
  CANONICAL_SOURCES,
  CANONICAL_FINDINGS,
  CANONICAL_CLAIMS_V2,
  CANONICAL_SYNTHESES,
  CANONICAL_GOVERNANCE_CLASSIFICATIONS,
  CANONICAL_CONFLICT_SETS,
  CANONICAL_EVIDENCE_PATHS,
  CANONICAL_TARGET_FAMILIES_V2,
} from './seeds/index.js';

export function computeEvidenceManifestV2Hash(manifest: Omit<EvidenceLibraryReleaseV2, 'manifestSha256'>): string {
  const hashablePayload = {
    code: manifest.code,
    semanticVersion: manifest.semanticVersion,
    lifecycleStatus: manifest.lifecycleStatus,
    sourceIds: [...manifest.sourceIds].sort(),
    sourceFindingIds: [...manifest.sourceFindingIds].sort(),
    evidenceClaimIds: [...manifest.evidenceClaimIds].sort(),
    synthesisIds: [...manifest.synthesisIds].sort(),
    governanceClassificationIds: [...manifest.governanceClassificationIds].sort(),
    targetFamilyIds: [...manifest.targetFamilyIds].sort(),
    evidencePathIds: [...manifest.evidencePathIds].sort(),
    conflictSetIds: [...manifest.conflictSetIds].sort(),
  };

  return computeSha256(hashablePayload);
}

const targetFamilySet = new Set<string>();
for (const tf of CANONICAL_TARGET_FAMILIES_V2) {
  targetFamilySet.add(tf.id);
}
for (const c of CANONICAL_CLAIMS_V2) {
  c.targetFamilyIds?.forEach((tf) => targetFamilySet.add(tf));
}
for (const p of CANONICAL_EVIDENCE_PATHS) {
  if (p.targetFamilyId) targetFamilySet.add(p.targetFamilyId);
}

const unhashedManifest: Omit<EvidenceLibraryReleaseV2, 'manifestSha256'> = {
  id: 'a0000000-0000-0000-0000-000000000001',
  code: 'EV-LIB-REL-2-0-0-STAGING',
  semanticVersion: '2.0.0-staging',
  lifecycleStatus: 'validation',
  sourceIds: CANONICAL_SOURCES.map((s) => s.id),
  sourceFindingIds: CANONICAL_FINDINGS.map((f) => f.id),
  evidenceClaimIds: CANONICAL_CLAIMS_V2.map((c) => c.id),
  synthesisIds: CANONICAL_SYNTHESES.map((s) => s.id),
  governanceClassificationIds: CANONICAL_GOVERNANCE_CLASSIFICATIONS.map((g) => g.id),
  targetFamilyIds: Array.from(targetFamilySet),
  evidencePathIds: CANONICAL_EVIDENCE_PATHS.map((p) => p.id),
  conflictSetIds: CANONICAL_CONFLICT_SETS.map((c) => c.id),
  releasedAt: '2026-09-03T00:00:00Z',
  provenance: {
    createdBy: 'scientific_curation_pipeline',
    createdAt: '2026-09-03T00:00:00Z',
    softwareVersion: '2.0.0',
  },
};

export const CANONICAL_EVIDENCE_RELEASE_2_0_0_STAGING: EvidenceLibraryReleaseV2 = {
  ...unhashedManifest,
  manifestSha256: computeEvidenceManifestV2Hash(unhashedManifest),
};
