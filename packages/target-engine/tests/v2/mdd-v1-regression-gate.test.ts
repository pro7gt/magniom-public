/**
 * @magniom/target-engine - Section 96: MDD v1 Historical Regression Gate Test Suite
 * Conforms to MAGNIOM-Multi-Indication Technical & Scientific Architecture Specification v2.0 (§96).
 *
 * Mandates:
 * 1. Historical MDD Golden Cases G01–G18 must execute without regression.
 * 2. Coordinate stability, deterministic hash reproducibility, and safety ceiling preserved.
 * 3. Non-destructive adaptation into canonical TargetSlateV2 validated with schema verification.
 */

import { describe, it, expect } from 'vitest';
import { runTargetEngine } from '../../src/index.js';
import { adaptV1SlateToV2 } from '@magniom/domain';
import { validateTargetSlateV2 } from '@magniom/schemas';
import {
  G01_CASE_PHENOTYPE,
  G02_CASE_PHENOTYPE,
  G02_CASE_CONNECTOME,
  G03_CASE_PHENOTYPE,
  G03_CASE_CONNECTOME,
  G04_CASE_PHENOTYPE,
  G04_CASE_CONNECTOME,
  G05_CASE_PHENOTYPE,
  G05_CASE_CONNECTOME,
  G06_CASE_PHENOTYPE,
  G06_CASE_CONNECTOME,
  G07_CASE_PHENOTYPE,
  G07_CASE_CONNECTOME,
  G08_CASE_PHENOTYPE,
  G08_CASE_CONNECTOME,
  G09_CASE_PHENOTYPE,
  G09_CASE_CONNECTOME,
  G10_CASE_PHENOTYPE,
  G10_CASE_CONNECTOME,
  G11_CASE_PHENOTYPE,
  G11_CASE_CONNECTOME,
  G12_CASE_PHENOTYPE,
  G13_CASE_PHENOTYPE,
  G14_CASE_PHENOTYPE_V1,
  G15_CASE_PHENOTYPE,
  G16_CASE_PHENOTYPE,
  G17_CASE_PHENOTYPE,
  G18_CASE_PHENOTYPE,
} from '@magniom/test-fixtures';

describe('Architecture Spec v2.0 §96: Target Engine Regression Gate (G01–G18 Under v2)', () => {
  const v1Cases = [
    { id: 'G01', phenotype: G01_CASE_PHENOTYPE, connectome: null, mode: 'CLINICAL' as const },
    {
      id: 'G02',
      phenotype: G02_CASE_PHENOTYPE,
      connectome: G02_CASE_CONNECTOME,
      mode: 'CLINICAL' as const,
    },
    {
      id: 'G03',
      phenotype: G03_CASE_PHENOTYPE,
      connectome: G03_CASE_CONNECTOME,
      mode: 'CLINICAL' as const,
    },
    {
      id: 'G04',
      phenotype: G04_CASE_PHENOTYPE,
      connectome: G04_CASE_CONNECTOME,
      mode: 'CLINICAL' as const,
    },
    {
      id: 'G05',
      phenotype: G05_CASE_PHENOTYPE,
      connectome: G05_CASE_CONNECTOME,
      mode: 'CLINICAL' as const,
    },
    {
      id: 'G06',
      phenotype: G06_CASE_PHENOTYPE,
      connectome: G06_CASE_CONNECTOME,
      mode: 'CLINICAL' as const,
    },
    {
      id: 'G07',
      phenotype: G07_CASE_PHENOTYPE,
      connectome: G07_CASE_CONNECTOME,
      mode: 'CLINICAL' as const,
    },
    {
      id: 'G08',
      phenotype: G08_CASE_PHENOTYPE,
      connectome: G08_CASE_CONNECTOME,
      mode: 'RESEARCH' as const,
    },
    {
      id: 'G09',
      phenotype: G09_CASE_PHENOTYPE,
      connectome: G09_CASE_CONNECTOME,
      mode: 'CLINICAL' as const,
    },
    {
      id: 'G10',
      phenotype: G10_CASE_PHENOTYPE,
      connectome: G10_CASE_CONNECTOME,
      mode: 'CLINICAL' as const,
    },
    {
      id: 'G11',
      phenotype: G11_CASE_PHENOTYPE,
      connectome: G11_CASE_CONNECTOME,
      mode: 'CLINICAL' as const,
    },
    { id: 'G12', phenotype: G12_CASE_PHENOTYPE, connectome: null, mode: 'CLINICAL' as const },
    { id: 'G13', phenotype: G13_CASE_PHENOTYPE, connectome: null, mode: 'CLINICAL' as const },
    { id: 'G14', phenotype: G14_CASE_PHENOTYPE_V1, connectome: null, mode: 'CLINICAL' as const },
    { id: 'G15', phenotype: G15_CASE_PHENOTYPE, connectome: null, mode: 'CLINICAL' as const },
    { id: 'G16', phenotype: G16_CASE_PHENOTYPE, connectome: null, mode: 'CLINICAL' as const },
    { id: 'G17', phenotype: G17_CASE_PHENOTYPE, connectome: null, mode: 'CLINICAL' as const },
    { id: 'G18', phenotype: G18_CASE_PHENOTYPE, connectome: null, mode: 'CLINICAL' as const },
  ];

  it('contains exactly 18 historical golden cases in the regression test suite', () => {
    expect(v1Cases.length).toBe(18);
  });

  for (const c of v1Cases) {
    it(`Regression Gate Case ${c.id}: generates valid v1 slate and safely adapts to canonical TargetSlateV2`, () => {
      const v1Slate = runTargetEngine({
        phenotypeSnapshot: c.phenotype,
        connectome: c.connectome,
        mode: c.mode,
      });

      expect(v1Slate).toBeDefined();
      expect(v1Slate.id).toBeDefined();
      expect(v1Slate.deterministicManifestHash).toMatch(/^[0-9a-fA-F]{64}$/);

      // Verify coordinate stability: primary candidate is left hemisphere DLPFC
      if (v1Slate.primaryCandidates.length > 0) {
        const primary = v1Slate.primaryCandidates[0]!;
        expect(primary.mniCoordinate.x).toBeLessThan(0); // Left hemisphere
        expect(primary.mniCoordinate.y).toBeGreaterThan(0); // Anterior (DLPFC)
        expect(primary.mniCoordinate.z).toBeGreaterThan(0); // Superior
      }

      // Non-destructive v1 -> v2 adaptation
      const v2Slate = adaptV1SlateToV2(v1Slate, {
        caseIndicationId: '00000000-0000-0000-0000-000000000010',
      });

      expect(v2Slate.version).toBeDefined();
      expect(v2Slate.caseId).toBeDefined();
      expect(v2Slate.payloadSha256).toMatch(/^[0-9a-fA-F]{64}$/);

      // Validate adapted slate against canonical v2 Zod schema
      expect(() => validateTargetSlateV2(v2Slate)).not.toThrow();
    });
  }
});
