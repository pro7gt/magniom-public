/**
 * Manifest & Canonical Hash Utilities
 * Conforms to MAGNIOM-Target Engine & Ranking Algorithm Specification v1.0, Section 148–149.
 * Deterministic JSON serialization and SHA-256 manifest hash calculation.
 */

import { computeSha256 } from '@magniom/scientific-policy';

export function canonicalSerialize(obj: unknown): string {
  return JSON.stringify(obj, Object.keys(obj as object).sort());
}

export function computeSlateManifestHash(slatePayload: unknown): string {
  return computeSha256(slatePayload);
}
