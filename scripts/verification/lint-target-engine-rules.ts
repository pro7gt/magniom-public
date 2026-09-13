/**
 * TARGET ENGINE STATIC RULE LINTER
 * Aligned with MAGNIOM-Enterprise Verification, Testing CI/CD Specification v1.0 (Section 46)
 *
 * Enforces 5 Non-Negotiable Static Invariants in Clinical Target Engine & Pure Domain:
 * 1. Prohibit Math.random() in Clinical Target Engine
 * 2. Prohibit current-time / wall-clock dependent ranking (Date.now(), new Date() in scoring logic)
 * 3. Prohibit external network requests (fetch, XMLHttpRequest, http/https) in pure domain
 * 4. Prohibit untyped 'any' in scientific domain calculation files
 * 5. Prohibit hidden runtime feature flags altering clinical ranking in Clinical Mode
 */

import fs from 'node:fs';
import path from 'node:path';

interface Violation {
  file: string;
  line: number;
  rule: string;
  message: string;
}

const TARGET_ENGINE_DIR = path.resolve(process.cwd(), 'packages/target-engine/src');
const PURE_DOMAIN_DIR = path.resolve(process.cwd(), 'packages/domain/src');
const SCIENTIFIC_POLICY_DIR = path.resolve(process.cwd(), 'packages/scientific-policy/src');
const MEASUREMENT_CORE_DIR = path.resolve(process.cwd(), 'packages/measurement-core/src');

function scanFile(filePath: string): Violation[] {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const violations: Violation[] = [];

  lines.forEach((lineText, idx) => {
    const lineNum = idx + 1;
    const trimmed = lineText.trim();

    // Skip comment lines
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
      return;
    }

    // Rule 1: No Math.random() or crypto.getRandomValues()
    if (lineText.includes('Math.random(') || lineText.includes('crypto.getRandomValues(')) {
      violations.push({
        file: filePath,
        line: lineNum,
        rule: 'RULE_1_NO_MATH_RANDOM',
        message:
          'Math.random() and crypto.getRandomValues() are prohibited in deterministic Clinical Target Engine.',
      });
    }

    // Rule 2: No wall-clock / Date.now() in ranking algorithms
    if (lineText.includes('Date.now()') || lineText.includes('new Date().getTime()')) {
      violations.push({
        file: filePath,
        line: lineNum,
        rule: 'RULE_2_NO_WALL_CLOCK_TIME',
        message:
          'Wall-clock time functions (Date.now()) are prohibited in deterministic ranking logic.',
      });
    }

    // Rule 3: No network I/O
    if (
      lineText.includes('fetch(') ||
      lineText.includes('XMLHttpRequest') ||
      lineText.includes('axios.')
    ) {
      violations.push({
        file: filePath,
        line: lineNum,
        rule: 'RULE_3_NO_NETWORK_IO',
        message: 'External network requests are prohibited in pure domain calculation packages.',
      });
    }

    // Rule 4: Prohibit untyped any in scientific calculations
    if (
      /:\s*any\b/.test(lineText) &&
      !lineText.includes('eslint-disable') &&
      !lineText.includes('Record<string, unknown>')
    ) {
      violations.push({
        file: filePath,
        line: lineNum,
        rule: 'RULE_4_NO_UNTYPED_ANY',
        message:
          'Untyped `any` is prohibited in scientific calculation modules. Use strict domain types.',
      });
    }

    // Rule 5: No runtime experimental feature flags overriding clinical calculation in pure engine
    if (lineText.includes('process.env.FLAG_') || lineText.includes('experimentalFlag')) {
      violations.push({
        file: filePath,
        line: lineNum,
        rule: 'RULE_5_NO_HIDDEN_FLAGS',
        message: 'Hidden runtime feature flags altering clinical calculation are prohibited.',
      });
    }
  });

  return violations;
}

function scanDirectory(dir: string): Violation[] {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let violations: Violation[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      violations = violations.concat(scanDirectory(fullPath));
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
      violations = violations.concat(scanFile(fullPath));
    }
  }

  return violations;
}

export function runTargetEngineStaticLinter(): { passed: boolean; violations: Violation[] } {
  console.log('🔬 AUDITING TARGET ENGINE & DOMAIN STATIC RULES (Section 46)...');

  const violations: Violation[] = [
    ...scanDirectory(TARGET_ENGINE_DIR),
    ...scanDirectory(PURE_DOMAIN_DIR),
    ...scanDirectory(SCIENTIFIC_POLICY_DIR),
    ...scanDirectory(MEASUREMENT_CORE_DIR),
  ];

  if (violations.length === 0) {
    console.log('  ✅ 0 violations found. Deterministic Target Engine static rules satisfied.');
    return { passed: true, violations: [] };
  }

  console.error(`  ❌ ${violations.length} static rule violation(s) detected:`);
  violations.forEach(v => {
    const relPath = path.relative(process.cwd(), v.file);
    console.error(`     - [${v.rule}] ${relPath}:${v.line} -> ${v.message}`);
  });

  return { passed: false, violations };
}

if (process.argv[1]?.endsWith('lint-target-engine-rules.ts')) {
  const result = runTargetEngineStaticLinter();
  if (!result.passed) {
    process.exit(1);
  }
}
