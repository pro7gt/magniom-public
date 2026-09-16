#!/usr/bin/env npx tsx
/**
 * MAGNIOM NEUROCOMPUTE TEST RUNNER
 * Conforms to MAGNIOM-Enterprise Verification, Testing & CI/CD Specification v2.0 (§34, §66–§79)
 * Standard Reference: IEC 62304:2006 Class C
 *
 * Checks for Python (pytest or unittest) environment and executes NeuroCompute test suites.
 * Supports:
 *   --fast / --unit-only : runs the 27 pure unit test suites (instant execution ~40s)
 *   --full               : runs all 30 unit & integration test suites (~290s)
 */

import { execSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

const repoRoot = path.resolve(process.cwd());
const neuroDir = path.join(repoRoot, 'services/neurocompute');

const isFastMode = process.argv.includes('--fast') || process.argv.includes('--unit-only');

console.log('🧠 MAGNIOM NEUROCOMPUTE SCIENTIFIC SERVICE TEST SUITE RUNNER');
console.log(`Directory: ${neuroDir}`);
console.log(`Mode:      ${isFastMode ? 'FAST / UNIT-ONLY SUITE' : 'COMPREHENSIVE FULL SUITE'}\n`);

// 1. Check for Pytest candidates
let pytestCmd: string | null = null;
const pytestCandidates = [
  path.join(neuroDir, '.venv/bin/pytest'),
  'pytest',
  'python3 -m pytest',
  'python -m pytest',
];

for (const cand of pytestCandidates) {
  try {
    const isDirect = !cand.includes(' ');
    if (isDirect && cand.startsWith('/') && !fs.existsSync(cand)) {
      continue;
    }
    execSync(`${cand} --version`, { stdio: 'ignore' });
    pytestCmd = cand;
    break;
  } catch {
    // try next
  }
}

// 2. Check for standard Python (unittest runner fallback)
let pythonBinary: string | null = null;
for (const py of ['python3', 'python']) {
  try {
    execSync(`${py} --version`, { stdio: 'ignore' });
    pythonBinary = py;
    break;
  } catch {
    // try next
  }
}

if (pytestCmd) {
  try {
    const args = isFastMode ? 'tests/ -k "not integration" -v' : 'tests/ -v';
    console.log(`Running Pytest: ${pytestCmd} ${args} in ${neuroDir}`);
    execSync(`${pytestCmd} ${args}`, {
      cwd: neuroDir,
      stdio: 'inherit',
      env: { ...process.env },
    });
    console.log('\n✅ NeuroCompute test suites passed successfully via pytest.');
    process.exit(0);
  } catch {
    console.error('\n❌ NeuroCompute test suites failed via pytest.');
    process.exit(1);
  }
} else if (pythonBinary) {
  console.log(
    `ℹ️  pytest not found. Running with Python native unittest runner (${pythonBinary})...`,
  );
  try {
    if (isFastMode) {
      execSync(`${pythonBinary} scripts/run_unit_tests.py`, {
        cwd: neuroDir,
        stdio: 'inherit',
        env: { ...process.env },
      });
    } else {
      execSync(`${pythonBinary} -m unittest discover tests -v`, {
        cwd: neuroDir,
        stdio: 'inherit',
        env: { ...process.env },
      });
    }
    console.log('\n✅ NeuroCompute test suites passed successfully via standard unittest.');
    process.exit(0);
  } catch {
    console.error('\n❌ NeuroCompute test suites failed via standard unittest.');
    process.exit(1);
  }
} else {
  console.error('❌ FAIL_CLOSED: Python environment not detected on local system.');
  console.error('   NeuroCompute scientific test execution is required and cannot be bypassed.');
  console.error('   To configure locally:');
  console.error('     cd services/neurocompute');
  console.error('     python3 -m venv .venv && source .venv/bin/activate');
  console.error('     pip install -r requirements.txt pytest pytest-cov');
  console.error('     pytest tests/ -v\n');
  process.exit(1);
}
