import { describe, it, expect } from 'vitest';
import {
  assertNoProhibitedCanonicalFields,
  DomainValidationError,
  PROHIBITED_CANONICAL_FIELDS,
} from '../src/index.js';

describe('Canonical Data Spec §138 — Prohibited Canonical Fields Guard', () => {
  it('should allow valid canonical objects with no prohibited fields', () => {
    const validCandidate = {
      id: 'cand-001',
      candidateRole: 'primary_evidence_supported',
      nominationRationale: 'Evidence-based nomination',
      targetGeometry: {
        geometryType: 'point',
        centre: { x: -44, y: 40, z: 28 },
      },
    };

    expect(() => assertNoProhibitedCanonicalFields(validCandidate)).not.toThrow();
  });

  it('should reject every single prohibited field listed in §138', () => {
    for (const prohibitedKey of PROHIBITED_CANONICAL_FIELDS) {
      const payload = {
        id: 'test-obj-01',
        [prohibitedKey]: 42,
      };

      expect(
        () => assertNoProhibitedCanonicalFields(payload),
        `Failed to reject prohibited field: ${prohibitedKey}`,
      ).toThrow(DomainValidationError);
    }
  });

  it('should reject prohibited fields nested deeply within child arrays or sub-objects', () => {
    const deeplyNestedObject = {
      id: 'slate-001',
      candidates: [
        {
          id: 'c1',
          evidence: {
            details: {
              brain_abnormality_score: 93,
            },
          },
        },
      ],
    };

    expect(() => assertNoProhibitedCanonicalFields(deeplyNestedObject)).toThrow(
      DomainValidationError,
    );

    const deeplyNestedCamelCase = {
      id: 'slate-002',
      metadata: {
        scoring: {
          expectedResponseProbability: 0.87,
        },
      },
    };

    expect(() => assertNoProhibitedCanonicalFields(deeplyNestedCamelCase)).toThrow(
      DomainValidationError,
    );
  });
});
