/**
 * @magniom/ci - Formal Testing Pyramid Runner Qualification Unit Tests
 * Conforms to MAGNIOM-Enterprise Verification, Testing & CI/CD Specification v2.0 (§33–§49)
 * and MAGNIOM Revision 05 Audit Requirements.
 *
 * Verifies:
 * 1. Strict integer validation on --layer and --from-layer flags.
 * 2. Regulatory qualification separation:
 *    - 12/12 layers passed => QUALIFIED
 *    - Partial run passed => PARTIAL_NON_QUALIFYING (Diagnostic only)
 *    - Any failure => DISQUALIFIED_FAILURE
 * 3. Execution provenance capture (commit SHA, node version, lockfile hash, architecture).
 * 4. CLI process exit codes on malformed inputs.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  PyramidTestingRunner,
  collectProvenance,
  PYRAMID_LAYERS,
  type LayerExecutionRecord,
} from '../run-pyramid-testing';

const TEST_REPO_ROOT = path.join(process.cwd(), '.temp', 'test-pyramid-runner');

describe('Formal Testing Pyramid Runner & Qualification Engine', () => {
  beforeEach(() => {
    if (!fs.existsSync(TEST_REPO_ROOT)) {
      fs.mkdirSync(TEST_REPO_ROOT, { recursive: true });
    }
  });

  afterEach(() => {
    if (fs.existsSync(TEST_REPO_ROOT)) {
      try {
        fs.rmSync(TEST_REPO_ROOT, { recursive: true, force: true });
      } catch {}
    }
  });

  it('PYR-TEST-01: collectProvenance captures comprehensive environment metadata', () => {
    const provenance = collectProvenance(process.cwd());

    expect(provenance.nodeVersion).toBe(process.version);
    expect(provenance.systemArchitecture).toContain(process.arch);
    expect(provenance.ciWorkflow).toBeDefined();
    expect(provenance.cacheProvenance).toBeDefined();
    expect(provenance.defectAndDriftDerivation).toContain('Δ = 0.000mm');
    expect(provenance.commitSha).toBeDefined();
    expect(provenance.commitSha.length).toBeGreaterThanOrEqual(7);
  });

  it('PYR-TEST-02: generates QUALIFIED status when all 12 formal layers pass', () => {
    const runner = new PyramidTestingRunner(TEST_REPO_ROOT);
    const mock12Layers: LayerExecutionRecord[] = PYRAMID_LAYERS.map(layer => ({
      level: layer.level,
      name: layer.name,
      specSection: layer.specSection,
      command: layer.command,
      durationSec: '1.20',
      passed: true,
    }));

    runner.writeExecutionReports(mock12Layers, '14.40', true);

    const jsonPath = path.join(
      TEST_REPO_ROOT,
      'docs/verification/v2/pyramid-testing-execution-report.json',
    );
    expect(fs.existsSync(jsonPath)).toBe(true);

    const report = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    expect(report.overallPassed).toBe(true);
    expect(report.fullPyramidQualified).toBe(true);
    expect(report.releaseQualificationStatus).toBe('QUALIFIED');
    expect(report.totalLayersEvaluated).toBe(12);
    expect(report.passedLayersCount).toBe(12);
    expect(report.provenance).toBeDefined();

    const mdPath = path.join(
      TEST_REPO_ROOT,
      'docs/verification/v2/reports/pyramid-testing-execution-report.md',
    );
    const mdContent = fs.readFileSync(mdPath, 'utf-8');
    expect(mdContent).toContain('QUALIFIED & CONFORMANT FOR MEDICAL DEVICE RELEASE');
    expect(mdContent).toContain('Execution Provenance & Environment Traceability');
  });

  it('PYR-TEST-03: generates PARTIAL_NON_QUALIFYING status when fewer than 12 layers are evaluated', () => {
    const runner = new PyramidTestingRunner(TEST_REPO_ROOT);
    const mockPartialLayers: LayerExecutionRecord[] = [
      {
        level: 1,
        name: 'Level 1: Static Architecture',
        specSection: '§34–§35',
        command: 'npm run verify:boundaries',
        durationSec: '2.50',
        passed: true,
      },
    ];

    runner.writeExecutionReports(mockPartialLayers, '2.50', true);

    const jsonPath = path.join(
      TEST_REPO_ROOT,
      'docs/verification/v2/pyramid-testing-execution-report.json',
    );
    const report = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

    expect(report.overallPassed).toBe(true);
    expect(report.fullPyramidQualified).toBe(false);
    expect(report.releaseQualificationStatus).toBe('PARTIAL_NON_QUALIFYING');
    expect(report.determinationNote).toContain(
      'DIAGNOSTIC EVIDENCE ONLY — NOT QUALIFIED FOR MEDICAL DEVICE RELEASE',
    );

    const mdPath = path.join(
      TEST_REPO_ROOT,
      'docs/verification/v2/reports/pyramid-testing-execution-report.md',
    );
    const mdContent = fs.readFileSync(mdPath, 'utf-8');
    expect(mdContent).toContain(
      'DIAGNOSTIC EVIDENCE ONLY — NOT QUALIFIED FOR MEDICAL DEVICE RELEASE (PARTIAL EVALUATION: 1/12 LAYERS)',
    );
    expect(mdContent).not.toContain(
      '**Final Determination:** **QUALIFIED & CONFORMANT FOR MEDICAL DEVICE RELEASE**',
    );
  });

  it('PYR-TEST-04: generates DISQUALIFIED_FAILURE status when any layer fails', () => {
    const runner = new PyramidTestingRunner(TEST_REPO_ROOT);
    const mockFailedLayers: LayerExecutionRecord[] = [
      {
        level: 1,
        name: 'Level 1: Static Architecture',
        specSection: '§34–§35',
        command: 'npm run verify:boundaries',
        durationSec: '2.50',
        passed: true,
      },
      {
        level: 2,
        name: 'Level 2: Unit Tests',
        specSection: '§36',
        command: 'npm test',
        durationSec: '1.10',
        passed: false,
        error: 'Test suite failed',
      },
    ];

    runner.writeExecutionReports(mockFailedLayers, '3.60', false);

    const jsonPath = path.join(
      TEST_REPO_ROOT,
      'docs/verification/v2/pyramid-testing-execution-report.json',
    );
    const report = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

    expect(report.overallPassed).toBe(false);
    expect(report.fullPyramidQualified).toBe(false);
    expect(report.releaseQualificationStatus).toBe('DISQUALIFIED_FAILURE');
    expect(report.determinationNote).toContain(
      'NOT QUALIFIED FOR MEDICAL DEVICE RELEASE (VERIFICATION FAILURE DETECTED)',
    );

    const mdPath = path.join(
      TEST_REPO_ROOT,
      'docs/verification/v2/reports/pyramid-testing-execution-report.md',
    );
    const mdContent = fs.readFileSync(mdPath, 'utf-8');
    expect(mdContent).toContain(
      'NOT QUALIFIED FOR MEDICAL DEVICE RELEASE (VERIFICATION FAILURE DETECTED)',
    );
  });

  it('PYR-TEST-05: rejects invalid layer option programmatically', () => {
    const runner = new PyramidTestingRunner(TEST_REPO_ROOT);
    expect(runner.run({ layer: 0, noReport: true })).toBe(false);
    expect(runner.run({ layer: 13, noReport: true })).toBe(false);
    expect(runner.run({ layer: 3.5, noReport: true })).toBe(false);
    expect(runner.run({ fromLayer: 0, noReport: true })).toBe(false);
    expect(runner.run({ fromLayer: 14, noReport: true })).toBe(false);
  });

  it('PYR-TEST-06: CLI exits with code 1 on malformed --layer and --from-layer values', () => {
    const testCases = [
      '--layer 0',
      '--layer 13',
      '--layer nope',
      '--layer 3.14',
      '--from-layer 0',
      '--from-layer 15',
      '--from-layer invalid',
    ];

    for (const flag of testCases) {
      let threw = false;
      try {
        execSync(`npx tsx scripts/ci/run-pyramid-testing.ts ${flag}`, {
          cwd: process.cwd(),
          stdio: 'pipe',
        });
      } catch (err: unknown) {
        threw = true;
        const status = (err as { status?: number }).status;
        expect(status).toBe(1);
      }
      expect(threw, `Expected '${flag}' to exit with error code 1`).toBe(true);
    }
  });
});
