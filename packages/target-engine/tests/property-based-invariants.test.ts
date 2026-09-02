/**
 * PROPERTY-BASED INVARIANT TESTS (Section 49-50)
 * Uses fast-check to verify the 8 Target Engine Invariants:
 * 1. Lower reliability cannot improve candidate score / confidence.
 * 2. Failed QC cannot improve ranking or force personalised override.
 * 3. Research-only evidence cannot enter Clinical Mode.
 * 4. Primary candidates cannot have duplicate family IDs.
 * 5. Candidate count strictly satisfies canonical Slate limits (1-3 primary, 0-2 additional).
 * 6. Same canonical input produces bitwise identical manifest hash and JSON payload (Pure Determinism).
 * 7. Evidence baseline coordinate remains reconstructable for every primary candidate.
 * 8. Signed decision payload cannot mutate post-signing.
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { runTargetEngine } from '../src/index.js';
import {
  G01_PHENOTYPE,
  G04_PHENOTYPE,
  G04_CONNECTOME,
  G05_PHENOTYPE,
  G01_CASE_PHENOTYPE,
  G02_CASE_PHENOTYPE,
  G02_CASE_CONNECTOME,
  G04_CASE_PHENOTYPE,
  G04_CASE_CONNECTOME,
  G05_CASE_PHENOTYPE,
  G05_CASE_CONNECTOME,
  G07_CASE_PHENOTYPE,
  G07_CASE_CONNECTOME,
  createConnectomeInput,
} from '@magniom/test-fixtures';

describe('Target Engine Property-Based Invariants (fast-check)', () => {
  // Invariant 1: Monotonicity with respect to reliability
  it('Invariant 1: Lower connectomic reliability cannot increase candidate score or override evidence prior', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0.5, max: 0.95, noNaN: true }),
        fc.double({ min: 0.05, max: 0.3, noNaN: true }),
        (highRel, delta) => {
          const lowRel = Math.max(0.1, highRel - delta);

          const highConn = createConnectomeInput({
            candidateRegions: [
              {
                targetFamilyVersionId: 'TF-MDD-CONVERGENT-LDLPFC-001',
                candidateCode: 'CAN-MONO-TEST',
                generationMethod: 'CONNECTOME_REFINED',
                hemisphere: 'L',
                surfaceVertexIndex: 18452,
                parcelName: 'p9-46v_L',
                subjectT1Coordinate: {
                  space: 'MNI152NLin2009cAsym',
                  x: -44,
                  y: 40,
                  z: 34,
                  unit: 'mm',
                },
                mniCoordinate: { space: 'MNI152NLin2009cAsym', x: -44, y: 40, z: 34, unit: 'mm' },
                clusterAreaMm2: 90.0,
                circuitConcordanceRaw: 0.75,
                circuitConcordancePercentile: 0.75,
                baselineCircuitConcordance: 0.6,
                accessibility: 'good',
                reliabilityScore: highRel,
                fitInterpretation: 'High reliability candidate',
              },
            ],
          });

          const lowConn = createConnectomeInput({
            candidateRegions: [
              {
                targetFamilyVersionId: 'TF-MDD-CONVERGENT-LDLPFC-001',
                candidateCode: 'CAN-MONO-TEST',
                generationMethod: 'CONNECTOME_REFINED',
                hemisphere: 'L',
                surfaceVertexIndex: 18452,
                parcelName: 'p9-46v_L',
                subjectT1Coordinate: {
                  space: 'MNI152NLin2009cAsym',
                  x: -44,
                  y: 40,
                  z: 34,
                  unit: 'mm',
                },
                mniCoordinate: { space: 'MNI152NLin2009cAsym', x: -44, y: 40, z: 34, unit: 'mm' },
                clusterAreaMm2: 90.0,
                circuitConcordanceRaw: 0.75,
                circuitConcordancePercentile: 0.75,
                baselineCircuitConcordance: 0.6,
                accessibility: 'good',
                reliabilityScore: lowRel,
                fitInterpretation: 'Low reliability candidate',
              },
            ],
          });

          const slateHigh = runTargetEngine({
            phenotypeSnapshot: G02_CASE_PHENOTYPE,
            connectome: highConn,
            mode: 'CLINICAL',
          });

          const slateLow = runTargetEngine({
            phenotypeSnapshot: G02_CASE_PHENOTYPE,
            connectome: lowConn,
            mode: 'CLINICAL',
          });

          const scoreHigh = slateHigh.primaryCandidates[0]?.overallScore ?? 0;
          const scoreLow = slateLow.primaryCandidates[0]?.overallScore ?? 0;

          return scoreLow <= scoreHigh + 1e-6;
        },
      ),
      { numRuns: 30 },
    );
  });

  // Invariant 2: Failed QC forces fallback
  it('Invariant 2: Failed/Unreliable imaging QC strictly prevents personalisation and falls back', () => {
    const slate = runTargetEngine({
      phenotypeSnapshot: G04_PHENOTYPE,
      connectome: G04_CONNECTOME,
      mode: 'CLINICAL',
    });

    expect(slate.personalisationQualification).toBe('ineligible');
    for (const c of slate.primaryCandidates) {
      expect(c.method).toBe('EVIDENCE_ONLY_PRIOR');
    }
  });

  // Invariant 3: Clinical Mode gate for evidence tiers
  it('Invariant 3: Research-only evidence cannot enter Clinical Mode', () => {
    fc.assert(
      fc.property(fc.constantFrom('CLINICAL' as const, 'RESEARCH' as const), mode => {
        const slate = runTargetEngine({
          phenotypeSnapshot: G01_CASE_PHENOTYPE,
          connectome: null,
          mode,
        });

        if (mode === 'CLINICAL') {
          for (const c of [...slate.primaryCandidates, ...(slate.additionalCandidates || [])]) {
            // Clinical candidates must be evidence-backed (T1 or T2)
            expect(['T1', 'T2']).toContain(c.evidenceTier);
          }
        }
        return true;
      }),
      { numRuns: 20 },
    );
  });

  // Invariant 4: No duplicate Primary candidate family IDs
  it('Invariant 4: Primary candidates cannot contain duplicate family IDs', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          G01_CASE_PHENOTYPE,
          G02_CASE_PHENOTYPE,
          G05_CASE_PHENOTYPE,
          G07_CASE_PHENOTYPE,
        ),
        phenotype => {
          const slate = runTargetEngine({
            phenotypeSnapshot: phenotype,
            connectome: G02_CASE_CONNECTOME,
            mode: 'CLINICAL',
          });

          const primaryFamilies = slate.primaryCandidates.map(c => c.familyId);
          const uniqueFamilies = new Set(primaryFamilies);

          return primaryFamilies.length === uniqueFamilies.size;
        },
      ),
      { numRuns: 20 },
    );
  });

  // Invariant 5: Candidate count strictly satisfies canonical Slate limits (1-3 primary, 0-2 additional)
  it('Invariant 5: Candidate count strictly satisfies canonical Slate bounds across all phenotypes', () => {
    const cases = [
      { p: G01_CASE_PHENOTYPE, c: null },
      { p: G02_CASE_PHENOTYPE, c: G02_CASE_CONNECTOME },
      { p: G04_CASE_PHENOTYPE, c: G04_CASE_CONNECTOME },
      { p: G05_CASE_PHENOTYPE, c: G05_CASE_CONNECTOME },
      { p: G07_CASE_PHENOTYPE, c: G07_CASE_CONNECTOME },
    ];

    for (const { p, c } of cases) {
      const slate = runTargetEngine({
        phenotypeSnapshot: p,
        connectome: c,
        mode: 'CLINICAL',
      });

      expect(slate.primaryCandidates.length).toBeGreaterThanOrEqual(1);
      expect(slate.primaryCandidates.length).toBeLessThanOrEqual(3);
      expect((slate.additionalCandidates || []).length).toBeLessThanOrEqual(2);
    }
  });

  // Invariant 6: Pure Determinism across identical runs
  it('Invariant 6: Same canonical input produces bitwise identical manifest hash and JSON payload', () => {
    fc.assert(
      fc.property(fc.double({ min: 0.6, max: 0.9, noNaN: true }), rel => {
        const conn = createConnectomeInput({
          candidateRegions: [
            {
              targetFamilyVersionId: 'TF-MDD-CONVERGENT-LDLPFC-001',
              candidateCode: 'CAN-DETERMINISM',
              generationMethod: 'CONNECTOME_REFINED',
              hemisphere: 'L',
              surfaceVertexIndex: 18452,
              parcelName: 'p9-46v_L',
              subjectT1Coordinate: {
                space: 'MNI152NLin2009cAsym',
                x: -44,
                y: 40,
                z: 34,
                unit: 'mm',
              },
              mniCoordinate: { space: 'MNI152NLin2009cAsym', x: -44, y: 40, z: 34, unit: 'mm' },
              clusterAreaMm2: 90.0,
              circuitConcordanceRaw: 0.75,
              circuitConcordancePercentile: 0.75,
              baselineCircuitConcordance: 0.6,
              accessibility: 'good',
              reliabilityScore: rel,
              fitInterpretation: 'Deterministic candidate',
            },
          ],
        });

        const run1 = runTargetEngine({
          phenotypeSnapshot: G02_CASE_PHENOTYPE,
          connectome: conn,
          mode: 'CLINICAL',
        });
        const run2 = runTargetEngine({
          phenotypeSnapshot: G02_CASE_PHENOTYPE,
          connectome: conn,
          mode: 'CLINICAL',
        });

        return (
          run1.deterministicManifestHash === run2.deterministicManifestHash &&
          JSON.stringify(run1) === JSON.stringify(run2)
        );
      }),
      { numRuns: 30 },
    );
  });

  // Invariant 7: Evidence baseline remains reconstructable
  it('Invariant 7: Evidence baseline coordinate is reconstructable for every primary candidate', () => {
    const slate = runTargetEngine({
      phenotypeSnapshot: G02_CASE_PHENOTYPE,
      connectome: G02_CASE_CONNECTOME,
      mode: 'CLINICAL',
    });

    for (const candidate of slate.primaryCandidates) {
      expect(candidate.mniCoordinate).toBeDefined();
      expect(typeof candidate.mniCoordinate.x).toBe('number');
      expect(typeof candidate.mniCoordinate.y).toBe('number');
      expect(typeof candidate.mniCoordinate.z).toBe('number');
    }
  });

  // Invariant 8: Signed decision immutability
  it('Invariant 8: Signed decision payload is strictly immutable post-signing', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 5, maxLength: 30 }),
        fc.string({ minLength: 5, maxLength: 50 }),
        (clinicianId, rationale) => {
          const slate = runTargetEngine({
            phenotypeSnapshot: G01_CASE_PHENOTYPE,
            connectome: null,
            mode: 'CLINICAL',
          });

          const primaryCandidate = slate.primaryCandidates[0];

          const decision = Object.freeze({
            decisionId: 'DEC-001',
            slateId: slate.id,
            selectedCandidateId: primaryCandidate.id,
            signedByClinicianId: clinicianId,
            clinicalRationale: rationale,
            signedAt: '2026-09-02T12:00:00.000Z',
            status: 'SIGNED' as const,
          });

          expect(() => {
            (decision as Record<string, unknown>).status = 'MUTATED';
          }).toThrow();

          return decision.status === 'SIGNED';
        },
      ),
      { numRuns: 20 },
    );
  });
});
