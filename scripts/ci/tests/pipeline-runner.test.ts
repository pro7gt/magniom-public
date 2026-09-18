/**
 * @magniom/ci - Formal Continuous Integration Local Runner Qualification Unit Tests
 * Conforms to MAGNIOM-Enterprise Verification, Testing & CI/CD Specification v2.0 (Stages 0–10)
 * and MAGNIOM Revision 06 Regulatory Integrity Requirements.
 *
 * Verifies:
 * 1. Regulatory qualification discrimination:
 *    - All 11 stages passed without skipBuild => QUALIFIED_RELEASE
 *    - Partial stages passed => PARTIAL_EVALUATION (Diagnostic only)
 *    - skipBuild flag applied => PARTIAL_EVALUATION (Diagnostic only)
 *    - Any stage failure => DISQUALIFIED_FAILURE
 * 2. Attributable toolchain provenance & SHA-256 seal integrity.
 * 3. Strict CLI input validation on --stage and --from-stage flags.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  LocalContinuousIntegrationRunner,
  STAGES,
  parseCliArgs,
  type StageDefinition,
} from '../run-full-local-ci';

const TEST_REPO_ROOT = path.join(process.cwd(), '.temp', 'test-pipeline-runner');

describe('Formal CI/CD Local Pipeline Runner & Qualification Engine', () => {
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

  it('CI-TEST-01: generates QUALIFIED_RELEASE status when all 11 core stages pass without skipBuild', () => {
    const runner = new LocalContinuousIntegrationRunner(TEST_REPO_ROOT);
    const mockStages = STAGES.map(s => ({
      stage: s.stageNumber,
      name: s.name,
      command: s.command,
      durationSec: '1.20',
      passed: true,
    }));

    const result = runner.writeExecutionReports(mockStages, '13.20', true, {});

    expect(result.summaryData.allPassed).toBe(true);
    expect(result.summaryData.releaseQualificationStatus).toBe('QUALIFIED_RELEASE');
    expect(result.summaryData.failedStagesCount).toBe(0);

    const jsonPath = path.join(
      TEST_REPO_ROOT,
      'docs/verification/v2/pipeline-execution-summary.json',
    );
    const reportJson = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    expect(reportJson.releaseQualificationStatus).toBe('QUALIFIED_RELEASE');
    expect(reportJson.stagesRequested).toBe(11);
    expect(reportJson.stagesPassed).toBe(11);

    const mdPath = path.join(
      TEST_REPO_ROOT,
      'docs/verification/v2/reports/pipeline-execution-report.md',
    );
    const mdContent = fs.readFileSync(mdPath, 'utf-8');
    expect(mdContent).toContain('QUALIFIED & CONFORMANT FOR MEDICAL DEVICE RELEASE');
    expect(mdContent).toContain('✅ **100% PASS — ALL 11 STAGES QUALIFIED**');
  });

  it('CI-TEST-02: generates PARTIAL_EVALUATION status when a subset of stages is evaluated', () => {
    const runner = new LocalContinuousIntegrationRunner(TEST_REPO_ROOT);
    const mockSubset = [
      {
        stage: 0,
        name: 'Stage 0 — Change Classifier',
        command: 'npm run verify:stage0',
        durationSec: '0.50',
        passed: true,
      },
      {
        stage: 1,
        name: 'Stage 1 — Static Verification',
        command: 'npm run verify:stage1',
        durationSec: '2.10',
        passed: true,
      },
    ];

    const result = runner.writeExecutionReports(mockSubset, '2.60', true, { stage: 1 });

    expect(result.summaryData.allPassed).toBe(true);
    expect(result.summaryData.releaseQualificationStatus).toBe('PARTIAL_EVALUATION');

    const mdPath = path.join(
      TEST_REPO_ROOT,
      'docs/verification/v2/reports/pipeline-execution-report.md',
    );
    const mdContent = fs.readFileSync(mdPath, 'utf-8');
    expect(mdContent).toContain('PARTIAL EVALUATION — DIAGNOSTIC EVIDENCE ONLY');
    expect(mdContent).not.toContain('QUALIFIED & CONFORMANT FOR MEDICAL DEVICE RELEASE');
  });

  it('CI-TEST-03: generates PARTIAL_EVALUATION status when --skip-build flag is applied', () => {
    const runner = new LocalContinuousIntegrationRunner(TEST_REPO_ROOT);
    const mockAllStages = STAGES.map(s => ({
      stage: s.stageNumber,
      name: s.name,
      command: s.command,
      durationSec: '1.00',
      passed: true,
    }));

    const result = runner.writeExecutionReports(mockAllStages, '11.00', true, { skipBuild: true });

    expect(result.summaryData.allPassed).toBe(true);
    expect(result.summaryData.releaseQualificationStatus).toBe('PARTIAL_EVALUATION');

    const mdPath = path.join(
      TEST_REPO_ROOT,
      'docs/verification/v2/reports/pipeline-execution-report.md',
    );
    const mdContent = fs.readFileSync(mdPath, 'utf-8');
    expect(mdContent).toContain('PARTIAL EVALUATION (DIAGNOSTIC ONLY)');
    expect(mdContent).not.toContain('QUALIFIED & CONFORMANT FOR MEDICAL DEVICE RELEASE');
  });

  it('CI-TEST-04: generates DISQUALIFIED_FAILURE status when any stage fails and records open defect count', () => {
    const runner = new LocalContinuousIntegrationRunner(TEST_REPO_ROOT);
    const mockFailedStages = [
      {
        stage: 0,
        name: 'Stage 0',
        command: 'npm run verify:stage0',
        durationSec: '0.40',
        passed: true,
      },
      {
        stage: 1,
        name: 'Stage 1',
        command: 'npm run verify:stage1',
        durationSec: '1.50',
        passed: false,
      },
    ];

    const result = runner.writeExecutionReports(mockFailedStages, '1.90', false, {});

    expect(result.summaryData.allPassed).toBe(false);
    expect(result.summaryData.releaseQualificationStatus).toBe('DISQUALIFIED_FAILURE');
    expect(result.summaryData.failedStagesCount).toBe(1);

    const mdPath = path.join(
      TEST_REPO_ROOT,
      'docs/verification/v2/reports/pipeline-execution-report.md',
    );
    const mdContent = fs.readFileSync(mdPath, 'utf-8');
    expect(mdContent).toContain('NOT QUALIFIED FOR MEDICAL DEVICE RELEASE — VERIFICATION BLOCKED');
    expect(mdContent).toContain('❌ **FAIL — VERIFICATION BLOCKED**');
    expect(mdContent).toContain('**Open Defects Observed** | `1`');
  });

  it('CI-TEST-05: parseCliArgs parses valid options correctly', () => {
    const parsed1 = parseCliArgs(['--stage', '3', '--skip-build']);
    expect(parsed1.options.stage).toBe(3);
    expect(parsed1.options.skipBuild).toBe(true);

    const parsed2 = parseCliArgs(['--from-stage=5', '--include-pyramid']);
    expect(parsed2.options.fromStage).toBe(5);
    expect(parsed2.options.includePyramid).toBe(true);

    const parsed3 = parseCliArgs(['--stage=0,1,2,3', '--include-neurocompute']);
    expect(parsed3.options.stages).toEqual([0, 1, 2, 3]);
    expect(parsed3.options.includeNeurocompute).toBe(true);
  });

  it('CI-TEST-06: CLI exits with code 1 on malformed --stage and --from-stage values', () => {
    const invalidFlags = [
      '--stage -1',
      '--stage 15',
      '--stage invalid',
      '--from-stage -2',
      '--from-stage 12',
      '--from-stage nope',
      '--stage=99',
      '--stage=abc',
    ];

    const scriptPath = path.resolve(__dirname, '../run-full-local-ci.ts');
    for (const flag of invalidFlags) {
      let threw = false;
      try {
        execSync(`npx tsx "${scriptPath}" ${flag}`, {
          cwd: process.cwd(),
          stdio: ['pipe', 'pipe', 'pipe'],
        });
      } catch (err: unknown) {
        threw = true;
        const e = err as { status?: number };
        expect(e.status).toBe(1);
      }
      expect(threw, `Expected '${flag}' to exit with error code 1`).toBe(true);
    }
  });

  it('CI-TEST-07: generates immutable SHA-256 digest and records dynamic drift & defect metrics', () => {
    const runner = new LocalContinuousIntegrationRunner(TEST_REPO_ROOT);
    const mockStages = STAGES.map(s => ({
      stage: s.stageNumber,
      name: s.name,
      command: s.command,
      durationSec: '0.80',
      passed: true,
    }));

    runner.writeExecutionReports(mockStages, '8.80', true, {});

    const jsonPath = path.join(
      TEST_REPO_ROOT,
      'docs/verification/v2/pipeline-execution-summary.json',
    );
    const report = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

    expect(report.sha256Digest).toBeDefined();
    expect(typeof report.sha256Digest).toBe('string');
    expect(report.sha256Digest.length).toBe(64);
    expect(report.provenance.npmVersion).toBeDefined();
    expect(report.provenance.typescriptVersion).toBeDefined();
    expect(report.provenance.systemArchitecture).toBeDefined();
    expect(report.provenance.coordinateDriftMm).toBe(0);
    expect(report.provenance.totalGoldenCasesEvaluated).toBe(72);
    expect(report.provenance.openDefectsCount).toBe(0);
  });
});
