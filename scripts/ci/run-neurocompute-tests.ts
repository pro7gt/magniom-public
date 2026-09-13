#!/usr/bin/env npx tsx
/**
 * MAGNIOM NEUROCOMPUTE TEST RUNNER
 * Checks for Python/Pytest environment and executes NeuroCompute test suites.
 */

import { execSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

const repoRoot = path.resolve(process.cwd());
const neuroDir = path.join(repoRoot, 'services/neurocompute');

console.log('🧠 MAGNIOM NEUROCOMPUTE SCIENTIFIC SERVICE TEST SUITE RUNNER');
console.log(`Directory: ${neuroDir}\n`);

// Check if python or pytest is available
let pythonCmd: string | null = null;
const candidates = [
  path.join(neuroDir, '.venv/bin/pytest'),
  'pytest',
  'python3 -m pytest',
  'python -m pytest',
];

for (const cand of candidates) {
  try {
    const isDirect = !cand.includes(' ');
    if (isDirect && cand.startsWith('/') && !fs.existsSync(cand)) {
      continue;
    }
    execSync(`${cand} --version`, { stdio: 'ignore' });
    pythonCmd = cand;
    break;
  } catch {
    // try next
  }
}

if (!pythonCmd) {
  console.log('ℹ️  Python/Pytest environment not detected on local system.');
  console.log(
    '   In GitHub Actions CI, tests run automatically via actions/setup-python@v5 (Python 3.11).',
  );
  console.log('   To run locally:');
  console.log('     cd services/neurocompute');
  console.log('     python3 -m venv .venv && source .venv/bin/activate');
  console.log('     pip install -r requirements.txt pytest pytest-cov');
  console.log('     pytest tests/ -v\n');
  process.exit(0);
}

try {
  console.log(`Running: ${pythonCmd} tests/ -v in ${neuroDir}`);
  execSync(`${pythonCmd} tests/ -v`, {
    cwd: neuroDir,
    stdio: 'inherit',
    env: { ...process.env },
  });
  console.log('\n✅ NeuroCompute test suites passed successfully.');
} catch {
  console.error('\n❌ NeuroCompute test suites failed.');
  process.exit(1);
}
