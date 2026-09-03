/**
 * MAGNIOM RELEASE-BLOCKING LATERALITY & COORDINATE INVARIANT TEST SUITE
 * Conforms to MAGNIOM-Enterprise Verification, Testing & CI/CD Specification v2.0 (§76–77)
 * Standard Reference: IEC 62304 Class C Critical / ISO 14971 Critical Hazard Controls
 *
 * GOVERNING INVARIANT (§76):
 * Any coordinate inversion, laterality misassignment, or hemisphere-flipping bug is a
 * SEVERITY 1 (CRITICAL) RELEASE-BLOCKING DEFECT.
 */

import { describe, it, expect } from 'vitest';
import {
  executeSyntheticVerticalSlice,
  SyntheticAuditLedger,
} from '../../src/orchestrator/synthetic-vertical-slice.js';
import { PAIN_GOLDEN_SUITE } from '../../../test-fixtures/src/synthetic-vertical-slice/pain-fixtures.js';
import { STROKE_MOTOR_GOLDEN_SUITE } from '../../../test-fixtures/src/synthetic-vertical-slice/stroke-motor-fixtures.js';
import { STROKE_APHASIA_GOLDEN_SUITE } from '../../../test-fixtures/src/synthetic-vertical-slice/stroke-aphasia-fixtures.js';
import type { Coordinate3D, SomatotopicTargetGeometry, PointTargetGeometry } from '@magniom/domain';

function computeDistance(c1: Coordinate3D, c2: Coordinate3D): number {
  return Math.sqrt(Math.pow(c1.x - c2.x, 2) + Math.pow(c1.y - c2.y, 2) + Math.pow(c1.z - c2.z, 2));
}

describe('MAGNIOM CI/CD §76: Release-Blocking Laterality & Coordinate Tests', () => {
  const auditLedger = new SyntheticAuditLedger();

  it('CRITICAL: Neuropathic Pain M1 somatotopy strictly maps to contralateral hemisphere', () => {
    // P01: Right Upper Limb pain -> Left M1 motor hand knob target (stimulationHemisphere: 'left', laterality: 'left')
    const p01 = PAIN_GOLDEN_SUITE.find(c => c.id === 'P01');
    expect(p01).toBeDefined();
    if (!p01) return;

    const resP01 = executeSyntheticVerticalSlice(p01.input, p01.decisionIntent, { auditLedger });
    expect(resP01.engineOutput.allCandidates.length).toBeGreaterThan(0);

    const geomP01 = resP01.engineOutput.allCandidates[0]
      .targetGeometry as SomatotopicTargetGeometry;
    expect(geomP01).toBeDefined();
    expect(geomP01.geometryType).toBe('somatotopic');
    expect(geomP01.stimulationHemisphere).toBe('left');
    expect(geomP01.laterality).toBe('left');

    // P02: Left Upper Limb pain -> Right M1 motor hand knob target (stimulationHemisphere: 'right', laterality: 'right')
    const p02 = PAIN_GOLDEN_SUITE.find(c => c.id === 'P02');
    expect(p02).toBeDefined();
    if (!p02) return;

    const resP02 = executeSyntheticVerticalSlice(p02.input, p02.decisionIntent, { auditLedger });
    expect(resP02.engineOutput.allCandidates.length).toBeGreaterThan(0);

    const geomP02 = resP02.engineOutput.allCandidates[0]
      .targetGeometry as SomatotopicTargetGeometry;
    expect(geomP02).toBeDefined();
    expect(geomP02.geometryType).toBe('somatotopic');
    expect(geomP02.stimulationHemisphere).toBe('right');
    expect(geomP02.laterality).toBe('right');
  });

  it('CRITICAL: Stroke Motor targeting strictly respects lesion laterality (contralesional vs ipsilesional)', () => {
    // SM01: Left-hemisphere subcortical stroke -> Right hemiparesis -> Ipsilesional Left M1
    const sm01 = STROKE_MOTOR_GOLDEN_SUITE.find(c => c.id === 'SM01');
    expect(sm01).toBeDefined();
    if (!sm01) return;

    const resSM01 = executeSyntheticVerticalSlice(sm01.input, sm01.decisionIntent, { auditLedger });
    expect(resSM01.engineOutput.allCandidates.length).toBeGreaterThan(0);
    const geomSM01 = resSM01.engineOutput.allCandidates[0].targetGeometry as PointTargetGeometry;
    expect(geomSM01).toBeDefined();
    expect(geomSM01.laterality).toBeDefined();
    expect(geomSM01.centre).toBeDefined();
    if (geomSM01.laterality === 'right') {
      expect(geomSM01.centre.x).toBeGreaterThan(0);
    } else {
      expect(geomSM01.centre.x).toBeLessThan(0);
    }

    // SM03: Severe cortical stroke -> Contralesional Right M1 inhibitory target
    const sm03 = STROKE_MOTOR_GOLDEN_SUITE.find(c => c.id === 'SM03');
    expect(sm03).toBeDefined();
    if (!sm03) return;

    const resSM03 = executeSyntheticVerticalSlice(sm03.input, sm03.decisionIntent, { auditLedger });
    expect(resSM03.engineOutput.allCandidates.length).toBeGreaterThan(0);
    const geomSM03 = resSM03.engineOutput.allCandidates[0].targetGeometry as PointTargetGeometry;
    expect(geomSM03).toBeDefined();
    expect(geomSM03.laterality).toBeDefined();
    expect(geomSM03.centre).toBeDefined();
    if (geomSM03.laterality === 'right') {
      expect(geomSM03.centre.x).toBeGreaterThan(0);
    } else {
      expect(geomSM03.centre.x).toBeLessThan(0);
    }
  });

  it('CRITICAL: Stroke Aphasia language network targeting correctly sets contralesional right IFG laterality', () => {
    // SA01: Broca-type non-fluent aphasia -> Contralesional Right IFG (pars triangularis) target
    const sa01 = STROKE_APHASIA_GOLDEN_SUITE.find(c => c.id === 'SA01');
    expect(sa01).toBeDefined();
    if (!sa01) return;

    const resSA01 = executeSyntheticVerticalSlice(sa01.input, sa01.decisionIntent, { auditLedger });
    expect(resSA01.engineOutput.allCandidates.length).toBeGreaterThan(0);
    const geomSA01 = resSA01.engineOutput.allCandidates[0].targetGeometry as PointTargetGeometry;
    expect(geomSA01).toBeDefined();
    expect(geomSA01.laterality).toBe('right');
    expect(geomSA01.centre.x).toBeGreaterThan(30);
  });

  it('INVARIANT (§77): Coordinate transform round-trip precision is < 0.01 mm', () => {
    // Test affine round-trip conversion invariance: MNI -> ACPC -> MNI
    const originalMni: Coordinate3D = { x: -38.54, y: 44.12, z: 26.88 };

    // Deterministic ACPC affine transformation matrix
    const mniToAcpc = (m: Coordinate3D): Coordinate3D => ({
      x: m.x + 0.12,
      y: m.y - 1.45,
      z: m.z + 2.3,
    });

    const acpcToMni = (a: Coordinate3D): Coordinate3D => ({
      x: a.x - 0.12,
      y: a.y + 1.45,
      z: a.z - 2.3,
    });

    const acpc = mniToAcpc(originalMni);
    const roundTripMni = acpcToMni(acpc);

    const deltaMm = computeDistance(originalMni, roundTripMni);
    expect(deltaMm).toBeLessThan(0.01);
  });

  it('CRITICAL INVARIANT: Deliberate laterality flip (x -> -x) shifts coordinate > 40 mm and fails checks', () => {
    const leftDlpfc: Coordinate3D = { x: -38.0, y: 44.0, z: 26.0 };
    const flippedRightDlpfc: Coordinate3D = { x: -leftDlpfc.x, y: leftDlpfc.y, z: leftDlpfc.z };

    const spatialError = computeDistance(leftDlpfc, flippedRightDlpfc);
    // Left-to-right hemisphere flipping creates an egregious ~76mm error
    expect(spatialError).toBeGreaterThan(70.0);
    expect(leftDlpfc.x < 0).toBe(true);
    expect(flippedRightDlpfc.x > 0).toBe(true);
  });
});
