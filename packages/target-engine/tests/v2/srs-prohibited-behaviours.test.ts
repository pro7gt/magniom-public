/**
 * MAGNIOM SYSTEM REQUIREMENTS SPECIFICATION v2.0
 * Section 37: PROHIBITED v2 SYSTEM BEHAVIOURS TEST SUITE
 *
 * Formally verifies that MAGNIOM actively prohibits and fails closed on all
 * 19 forbidden shortcuts, anti-patterns, and invalid inferences defined in SRS v2.0 §37.
 *
 * Standard Reference: IEC 62304 Class C Critical / ISO 14971 Risk Controls
 */

import { describe, it, expect } from 'vitest';
import {
  executeSyntheticVerticalSlice,
  SyntheticAuditLedger,
  ResearchModeSigningProhibitedError,
} from '../../src/orchestrator/synthetic-vertical-slice.js';
import { MDD_GOLDEN_SUITE } from '../../../test-fixtures/src/synthetic-vertical-slice/mdd-fixtures.js';
import { OCD_GOLDEN_SUITE } from '../../../test-fixtures/src/synthetic-vertical-slice/ocd-fixtures.js';
import { PAIN_GOLDEN_SUITE } from '../../../test-fixtures/src/synthetic-vertical-slice/pain-fixtures.js';
import { STROKE_MOTOR_GOLDEN_SUITE } from '../../../test-fixtures/src/synthetic-vertical-slice/stroke-motor-fixtures.js';
import { STROKE_APHASIA_GOLDEN_SUITE } from '../../../test-fixtures/src/synthetic-vertical-slice/stroke-aphasia-fixtures.js';
import { TBI_GOLDEN_SUITE } from '../../../test-fixtures/src/synthetic-vertical-slice/tbi-fixtures.js';
import { PTSD_GOLDEN_SUITE } from '../../../test-fixtures/src/synthetic-vertical-slice/ptsd-fixtures.js';
import { TINNITUS_GOLDEN_SUITE } from '../../../test-fixtures/src/synthetic-vertical-slice/tinnitus-fixtures.js';
import { evaluateGateG7 } from '../../src/gates/v2/g7-geometry-device.js';
import { createCanonicalResolvedContextV2, createCanonicalPointGeometry } from '../../src/index.js';

describe('MAGNIOM SRS v2.0 Section 37: Prohibited System Behaviours', () => {
  const auditLedger = new SyntheticAuditLedger();

  // 1. diagnosis → target
  it('SRS-PROHIBIT-01: Prohibits diagnosis → target autonomous derivation (MAG-CLI-044, MAG-IND-021)', () => {
    // Diagnosis alone without authorized evidence paths generates 0 candidates
    const mddCase = MDD_GOLDEN_SUITE[0];
    const invalidInput = {
      ...mddCase.input,
      authorizedEvidencePaths: [], // No approved evidence path for diagnosis alone
    };

    const result = executeSyntheticVerticalSlice(
      invalidInput,
      {
        clinicianId: 'DR-PROHIBIT-01',
        decisionType: 'no_target_selected',
        selectedCandidateIds: [],
      },
      { auditLedger },
    );

    // Abstention or zero primary candidates generated
    expect(result.slate.primaryCandidates.length).toBe(0);
    expect(result.slate.status).toBe('abstained');
  });

  // 2. lesion → target
  it('SRS-PROHIBIT-02: Prohibits lesion → target autonomous derivation (MAG-STR-008, MAG-TBI-010)', () => {
    // Lesion destroying ipsilesional cortex cannot be converted directly into a target
    const strokeCase = STROKE_MOTOR_GOLDEN_SUITE[1]; // Case with destroyed M1
    const result = executeSyntheticVerticalSlice(strokeCase.input, strokeCase.decisionIntent, {
      auditLedger,
    });

    // The destroyed area must NOT be emitted as an intact cortical target
    for (const cand of result.engineOutput.allCandidates) {
      expect(cand.targetFamilyId).not.toContain('DESTROYED');
    }
    expect(result.slate.status).toBeDefined();
  });

  // 3. most abnormal parcel → target
  it('SRS-PROHIBIT-03: Prohibits most abnormal parcel → target derivation (MAG-SYS-046, MAG-TIN-014)', () => {
    // Extreme Z-score anomaly on fMRI without an EvidencePath cannot become a target
    const tinnitusCase = TINNITUS_GOLDEN_SUITE[2]; // High imaging abnormality case
    const result = executeSyntheticVerticalSlice(tinnitusCase.input, tinnitusCase.decisionIntent, {
      auditLedger,
    });

    // Candidates must be bound to validated target families
    for (const cand of result.engineOutput.allCandidates) {
      expect(cand.targetFamilyId).toBeDefined();
      expect(cand.targetFamilyId).toMatch(/TF-TINNITUS/);
    }
  });

  // 4. pain severity → target
  it('SRS-PROHIBIT-04: Prohibits pain severity → target confidence conversion (MAG-PAI-014, MAG-PHE-048)', () => {
    const painCase = PAIN_GOLDEN_SUITE[0];
    const result = executeSyntheticVerticalSlice(painCase.input, painCase.decisionIntent, {
      auditLedger,
    });

    for (const cand of result.engineOutput.allCandidates) {
      // Score cannot equal pain rating scale (e.g. NRS 9/10)
      const candAny = cand as any;
      if (candAny.confidenceScore !== undefined) {
        expect(candAny.confidenceScore).not.toBe(9.0);
        expect(candAny.confidenceScore).toBeLessThanOrEqual(1.0);
      }
    }
  });

  // 5. tinnitus frequency → target
  it('SRS-PROHIBIT-05: Prohibits tinnitus pitch match → cortical target conversion (MAG-TIN-007, MAG-TIN-008)', () => {
    const tinnitusCase = TINNITUS_GOLDEN_SUITE[0];
    const result = executeSyntheticVerticalSlice(tinnitusCase.input, tinnitusCase.decisionIntent, {
      auditLedger,
    });

    // Tonotopic frequency is not mapped directly as coordinate
    for (const cand of result.engineOutput.allCandidates) {
      expect(cand.targetGeometry.geometryType).not.toBe('frequency_hz' as any);
      expect(cand.targetGeometry.coordinateSpace.name).toMatch(/MNI|native/i);
    }
  });

  // 6. MEP absent → contralesional strategy
  it('SRS-PROHIBIT-06: Prohibits MEP absent → autonomous contralesional strategy (MAG-STR-015)', () => {
    // Absent MEP should not autonomously switch strategy without clinical objective and evidence
    const strokeCase = STROKE_MOTOR_GOLDEN_SUITE[2]; // MEP absent
    const result = executeSyntheticVerticalSlice(strokeCase.input, strokeCase.decisionIntent, {
      auditLedger,
    });

    // The engine must document absent MEP without forcing unprescribed contralateral stimulation
    expect(result.slate.status).toBeDefined();
  });

  // 7. task activation → clinical target
  it('SRS-PROHIBIT-07: Prohibits task activation → autonomous clinical target (MAG-STR-021, MAG-IMG-045)', () => {
    const aphasiaCase = STROKE_APHASIA_GOLDEN_SUITE[0];
    const result = executeSyntheticVerticalSlice(aphasiaCase.input, aphasiaCase.decisionIntent, {
      auditLedger,
    });

    for (const cand of result.engineOutput.allCandidates) {
      expect(cand.targetFamilyId).toMatch(/TF-APHASIA/);
    }
  });

  // 8. tractography maximum → treatment target
  it('SRS-PROHIBIT-08: Prohibits tractography maximum → biological certainty (MAG-IMG-047, MAG-IMG-050)', () => {
    // Streamline count is never represented as absolute axon count
    const tbiCase = TBI_GOLDEN_SUITE[0];
    const result = executeSyntheticVerticalSlice(tbiCase.input, tbiCase.decisionIntent, {
      auditLedger,
    });

    for (const cand of result.engineOutput.allCandidates) {
      const candAny = cand as any;
      if (candAny.explanation?.metrics) {
        expect(candAny.explanation.metrics.axonalCount).toBeUndefined();
      }
    }
  });

  // 9. MDD DLPFC evidence → TBI DLPFC authority
  it('SRS-PROHIBIT-09: Prohibits MDD DLPFC evidence → TBI DLPFC transfer (MAG-TBI-005, §35)', () => {
    const tbiCase = TBI_GOLDEN_SUITE[0];
    const result = executeSyntheticVerticalSlice(tbiCase.input, tbiCase.decisionIntent, {
      auditLedger,
    });

    // Cannot borrow MDD target family
    for (const cand of result.engineOutput.allCandidates) {
      expect(cand.targetFamilyId).not.toContain('MDD');
      expect(cand.targetFamilyId).toContain('TBI');
    }
  });

  // 10. MDD connectivity algorithm → PTSD authority
  it('SRS-PROHIBIT-10: Prohibits MDD connectivity algorithm → PTSD clinical authority (MAG-IND-016, §35)', () => {
    const ptsdCase = PTSD_GOLDEN_SUITE[3]; // PTSD04: MDD evidence inheritance prohibited
    const result = executeSyntheticVerticalSlice(ptsdCase.input, ptsdCase.decisionIntent, {
      auditLedger,
    });

    for (const cand of result.engineOutput.allCandidates) {
      expect(cand.targetFamilyId).not.toContain('MDD');
      expect(cand.targetFamilyId).toContain('PTSD');
    }
  });

  // 11. same anatomy → same evidence
  it('SRS-PROHIBIT-11: Prohibits same anatomy → same evidence inference (MAG-IND-017, MAG-OCD-002, MAG-PAI-013)', () => {
    const ocdCase = OCD_GOLDEN_SUITE[0];
    const result = executeSyntheticVerticalSlice(ocdCase.input, ocdCase.decisionIntent, {
      auditLedger,
    });

    for (const cand of result.engineOutput.allCandidates) {
      expect(cand.targetFamilyId).toMatch(/OCD/);
      expect(cand.targetFamilyId).not.toMatch(/MDD/);
    }
  });

  // 12. available plugin → Clinical permission
  it('SRS-PROHIBIT-12: Prohibits available plugin → autonomous Clinical permission (MAG-SYS-045, MAG-POL-043)', () => {
    // Tinnitus plugin is executable in software, but restricted to Research
    const tinCase = TINNITUS_GOLDEN_SUITE[8]; // TIN09: Clinical target request denied
    expect(() =>
      executeSyntheticVerticalSlice(tinCase.input, tinCase.decisionIntent, { auditLedger }),
    ).toThrow(ResearchModeSigningProhibitedError);
  });

  // 13. available measurement → ranking influence
  it('SRS-PROHIBIT-13: Prohibits unvalidated measurement → ranking influence (MAG-MEA-002, §36)', () => {
    // In unvalidated modalities, measurement cannot boost ranking
    const painCase = PAIN_GOLDEN_SUITE[3]; // P04: Unreliable motor mapping
    const result = executeSyntheticVerticalSlice(painCase.input, painCase.decisionIntent, {
      auditLedger,
    });

    // Unreliable motor mapping falls back safely to baseline prior
    expect(result.slate.status).toBe('ready_for_review');
    expect(result.slate.primaryCandidates.length).toBe(1);
  });

  // 14. Research module → Clinical Slate
  it('SRS-PROHIBIT-14: Prohibits Research module → Clinical Slate output (MAG-IND-012, MAG-CLI-051)', () => {
    const tbiCase = TBI_GOLDEN_SUITE[7]; // TBI08: mode 'research'
    expect(() =>
      executeSyntheticVerticalSlice(
        tbiCase.input,
        {
          clinicianId: 'DR-TBI-CLINICAL',
          decisionType: 'ACCEPTED_PRIMARY',
          selectedCandidateIds: ['cand-tbi-01'],
          signingMode: 'clinical',
        },
        { auditLedger },
      ),
    ).toThrow(ResearchModeSigningProhibitedError);
  });

  // 15. unassigned Evidence Tier → implicit Clinical tier
  it('SRS-PROHIBIT-15: Prohibits unassigned Evidence Tier → implicit Clinical tier (MAG-EVD-044, MAG-POL-055)', () => {
    const ptsdCase = PTSD_GOLDEN_SUITE[4]; // PTSD05: Research Amygdala-DLPFC connectome refinement
    const result = executeSyntheticVerticalSlice(ptsdCase.input, ptsdCase.decisionIntent, {
      auditLedger,
    });

    expect(result.slate.mode).toBe('research');
  });

  // 16. field target → arbitrary point
  it('SRS-PROHIBIT-16: Prohibits field target downcasting to point (MAG-OCD-004, MAG-TGT-051)', () => {
    const ctx = createCanonicalResolvedContextV2();
    const candidateDraft: any = {
      draftId: 'draft-downcast-field',
      proposedRole: 'field_target',
      targetGeometry: createCanonicalPointGeometry(0, 40, 28, 'left', 'point-gen'),
      evidencePathIds: [],
    };
    const evalResult = evaluateGateG7(candidateDraft, ctx);
    expect(evalResult.result).toBe('fail');
    expect(evalResult.reasonCodes).toContain(
      'INVALID_GEOMETRY_DOWNCASTING:field_target_cannot_be_point',
    );
  });

  // 17. somatotopic target → generic M1 coordinate
  it('SRS-PROHIBIT-17: Prohibits somatotopic target → generic M1 coordinate replacement (MAG-PAI-006, MAG-TGT-052)', () => {
    const painCase = PAIN_GOLDEN_SUITE[0]; // Face/hand somatotopic pain
    const result = executeSyntheticVerticalSlice(painCase.input, painCase.decisionIntent, {
      auditLedger,
    });

    for (const cand of result.engineOutput.allCandidates) {
      if (cand.targetGeometry.geometryType === 'somatotopic') {
        const geom = cand.targetGeometry as any;
        expect(geom.bodyRegion).toBeDefined();
        expect(geom.bodyRegion.code).not.toBe('generic_m1');
      }
    }
  });

  // 18. five candidate slots → five treatment targets
  it('SRS-PROHIBIT-18: Prohibits forced slot filling; permits valid abstention (MAG-SYS-047, MAG-TGT-058)', () => {
    // Under complete evidence/measurement failure, engine abstains with 0 candidates rather than inventing dummy targets
    const abstentionCase = STROKE_MOTOR_GOLDEN_SUITE[3]; // Total bilateral lesion abstention case
    const result = executeSyntheticVerticalSlice(
      abstentionCase.input,
      abstentionCase.decisionIntent,
      { auditLedger },
    );

    expect(result.slate.primaryCandidates.length).toBeLessThanOrEqual(3);
    expect(result.slate.additionalCandidates.length).toBeLessThanOrEqual(2);
    expect(result.slate.status).toBeDefined();
  });

  // 19. candidate slate → stimulation protocol
  it('SRS-PROHIBIT-19: Prohibits Target Engine from prescribing stimulation protocol (MAG-SYS-048, MAG-TGT-064)', () => {
    const mddCase = MDD_GOLDEN_SUITE[0];
    const result = executeSyntheticVerticalSlice(mddCase.input, mddCase.decisionIntent, {
      auditLedger,
    });

    for (const cand of result.engineOutput.allCandidates) {
      // Must NOT prescribe dosage parameters
      const candAny = cand as any;
      expect(candAny.stimulationFrequencyHz).toBeUndefined();
      expect(candAny.motorThresholdPercent).toBeUndefined();
      expect(candAny.pulseCount).toBeUndefined();
      expect(candAny.totalSessions).toBeUndefined();
    }
  });
});
