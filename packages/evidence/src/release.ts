/**
 * Evidence Library Release Package Loader & Integrity Validator
 * Conforms to MAGNIOM-Evidence Knowledge Graph & Therapeutic Circuit Library v1.0.
 */

import type { EvidenceLibraryRelease } from '@magniom/domain';
import { EvidenceLibraryReleaseSchema } from '@magniom/schemas';
import { computeSha256, canonicalJsonStringify } from '@magniom/scientific-policy';

export { canonicalJsonStringify };

/**
 * Computes the SHA-256 cryptographic digest of an Evidence Library Release package.
 */
export function computeEvidenceManifestHash(release: EvidenceLibraryRelease): string {
  const hashablePayload = {
    version: release.version,
    status: release.status,
    claims: release.claims.map((c) => ({
      code: c.code ?? c.id,
      tier: c.tier,
      mode: c.mode ?? 'CLINICAL',
      claimType: c.claimType,
      statement: c.statement,
    })),
    circuits: release.circuits.map((c) => ({
      code: c.code,
      tier: c.tier ?? 'T1',
      mode: c.mode ?? 'CLINICAL',
      name: c.name,
      connectedClaims: c.connectedClaimCodes ?? [],
    })),
    families: release.families.map((f) => ({
      code: f.code,
      tier: f.evidenceCeilingTier,
      mode: f.mode ?? 'CLINICAL',
      name: f.name,
      primaryHcpParcel: f.primaryHcpParcel,
      fallbackMniCoordinate: f.fallbackMniCoordinate,
      connectedCircuits: f.connectedCircuitCodes ?? [],
    })),
  };

  return computeSha256(hashablePayload);
}

/**
 * Validates and loads a release package, verifying its internal structural validity.
 */
export function loadAndValidateEvidenceRelease(rawPayload: unknown): EvidenceLibraryRelease {
  const parsed = EvidenceLibraryReleaseSchema.parse(rawPayload);
  return parsed as EvidenceLibraryRelease;
}

export const validateEvidenceRelease = loadAndValidateEvidenceRelease;
