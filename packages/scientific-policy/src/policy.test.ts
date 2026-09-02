import { describe, it, expect } from 'vitest';
import { DEFAULT_MDD_SCIENTIFIC_POLICY, computeSha256, canonicalJsonStringify } from './index.js';
import { validateScientificPolicyRelease } from '@magniom/schemas';

describe('Scientific Policy & Release Governance', () => {
  it('should validate DEFAULT_MDD_SCIENTIFIC_POLICY against Zod schema', () => {
    const validated = validateScientificPolicyRelease(DEFAULT_MDD_SCIENTIFIC_POLICY);
    expect(validated.code).toBe('MAGNIOM-POLICY-MDD-1.0.0');
    expect(validated.lifecycleStatus).toBe('ACTIVE');
    expect(validated.compatibilityProfiles.length).toBe(2);
    expect(validated.policyPayloadSha256.length).toBe(64);
  });

  it('should produce identical deterministic hash across multiple runs (determinism invariant)', () => {
    const obj = { b: 2, a: 1, nested: { z: 10, y: 20 } };
    const stringified1 = canonicalJsonStringify(obj);
    const stringified2 = canonicalJsonStringify({ nested: { y: 20, z: 10 }, a: 1, b: 2 });
    expect(stringified1).toBe(stringified2);

    const hashes = Array.from({ length: 100 }, () => computeSha256(obj));
    const uniqueHashes = new Set(hashes);
    expect(uniqueHashes.size).toBe(1);
  });

  it('should verify positive compatibility whitelist structure', () => {
    const profiles = DEFAULT_MDD_SCIENTIFIC_POLICY.compatibilityProfiles;
    const evidenceOnly = profiles.find(p => p.capability === 'evidence_only');
    const connectomeRefined = profiles.find(p => p.capability === 'connectome_refined');

    expect(evidenceOnly).toBeDefined();
    expect(evidenceOnly?.pipeline.requirement).toBe('disabled');

    expect(connectomeRefined).toBeDefined();
    expect(connectomeRefined?.pipeline.requirement).toBe('required');
  });
});
