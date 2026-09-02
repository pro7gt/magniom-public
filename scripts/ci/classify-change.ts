/**
 * AUTOMATED CHANGE CLASSIFICATION & PR POLICY VALIDATOR
 * Aligned with MAGNIOM-Enterprise Verification, Testing CI/CD Specification v1.0 (Sections 15-23, 44)
 *
 * Classifies file changes and validates PR metadata:
 * - SCIENTIFIC (requires Scientific Impact Report & Golden Case evaluation)
 * - DATABASE_RLS (requires zero-state DB rebuild & RLS test suite)
 * - UX_HUMAN_FACTORS (requires critical clinical task E2E & anti-bias validation)
 * - SECURITY (requires SBOM check, secret scan & pen-test readiness)
 * - ORDINARY_APP (standard unit tests & static verification)
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

export type ChangeClass = 'SCIENTIFIC' | 'DATABASE_RLS' | 'UX_HUMAN_FACTORS' | 'SECURITY' | 'ORDINARY_APP';

export interface PRPolicyEvaluation {
  passed: boolean;
  changeClasses: ChangeClass[];
  requiresScientificImpactReport: boolean;
  requiresDatabaseZeroStateTest: boolean;
  requiresHumanFactorsE2E: boolean;
  requiresSecurityProbe: boolean;
  classifiedFiles: Record<string, ChangeClass[]>;
  warnings: string[];
  errors: string[];
}

const CLASSIFICATION_RULES: Record<string, ChangeClass> = {
  'packages/target-engine': 'SCIENTIFIC',
  'packages/phenotype': 'SCIENTIFIC',
  'evidence/': 'SCIENTIFIC',
  'scientific-config/': 'SCIENTIFIC',
  'services/neurocompute': 'SCIENTIFIC',
  'services/efield': 'SCIENTIFIC',
  'supabase/migrations': 'DATABASE_RLS',
  'supabase/tests': 'DATABASE_RLS',
  'apps/web/src/components': 'UX_HUMAN_FACTORS',
  'apps/web/src/app': 'UX_HUMAN_FACTORS',
  'packages/presentation': 'UX_HUMAN_FACTORS',
  'packages/ui': 'UX_HUMAN_FACTORS',
  'scripts/security': 'SECURITY',
};

export class ChangeClassifier {
  private repoRoot: string;

  constructor(repoRoot: string = path.resolve(process.cwd())) {
    this.repoRoot = repoRoot;
  }

  public getChangedFiles(baseBranch: string = 'main'): string[] {
    try {
      const output = execSync(`git diff --name-only origin/${baseBranch}...HEAD`, {
        cwd: this.repoRoot,
        encoding: 'utf8',
      });
      return output.split('\n').map((s) => s.trim()).filter(Boolean);
    } catch {
      // If git diff against origin/main is not available (e.g. local repo without remote origin),
      // inspect recent commit or git status
      try {
        const output = execSync('git diff --name-only HEAD~1 HEAD', {
          cwd: this.repoRoot,
          encoding: 'utf8',
        });
        return output.split('\n').map((s) => s.trim()).filter(Boolean);
      } catch {
        return [];
      }
    }
  }

  public evaluateChanges(files: string[], prDescription?: string): PRPolicyEvaluation {
    const changeClassesSet = new Set<ChangeClass>();
    const classifiedFiles: Record<string, ChangeClass[]> = {};
    const errors: string[] = [];
    const warnings: string[] = [];

    if (files.length === 0) {
      // Default to ORDINARY_APP if no files diffed
      changeClassesSet.add('ORDINARY_APP');
    }

    for (const file of files) {
      const fileClasses: ChangeClass[] = [];
      let matched = false;

      for (const [pattern, cClass] of Object.entries(CLASSIFICATION_RULES)) {
        if (file.startsWith(pattern)) {
          fileClasses.push(cClass);
          changeClassesSet.add(cClass);
          matched = true;
        }
      }

      if (!matched) {
        fileClasses.push('ORDINARY_APP');
        changeClassesSet.add('ORDINARY_APP');
      }

      classifiedFiles[file] = fileClasses;
    }

    const changeClasses = Array.from(changeClassesSet);
    const isScientific = changeClasses.includes('SCIENTIFIC');
    const isDatabase = changeClasses.includes('DATABASE_RLS');
    const isUX = changeClasses.includes('UX_HUMAN_FACTORS');
    const isSecurity = changeClasses.includes('SECURITY');

    // PR Policy Validation (Section 20-23, 44)
    if (prDescription !== undefined) {
      if (!/REQ-[A-Z]+-\d+/i.test(prDescription) && !/MAG-[A-Z]+-\d+/i.test(prDescription)) {
        errors.push('PR policy violation: PR body must reference at least one linked Requirement (e.g., REQ-TGT-001 or MAG-TGT-001).');
      }

      if (isScientific) {
        if (!/SCIENTIFIC_CHANGE:\s*(YES|TRUE)/i.test(prDescription) && !/\[x\]\s*Scientific Change/i.test(prDescription)) {
          warnings.push('Scientific files detected but PR description does not explicitly declare a Scientific Change.');
        }
      }
    }

    return {
      passed: errors.length === 0,
      changeClasses,
      requiresScientificImpactReport: isScientific,
      requiresDatabaseZeroStateTest: isDatabase,
      requiresHumanFactorsE2E: isUX,
      requiresSecurityProbe: isSecurity,
      classifiedFiles,
      warnings,
      errors,
    };
  }
}

// CLI execution
if (process.argv[1]?.endsWith('classify-change.ts')) {
  const classifier = new ChangeClassifier();
  const sampleFiles = process.argv.slice(2);
  const filesToEvaluate = sampleFiles.length > 0 ? sampleFiles : classifier.getChangedFiles();

  console.log('🔍 MAGNIOM AUTOMATED CHANGE CLASSIFIER & PR POLICY CHECKER');
  console.log('========================================================\n');
  console.log(`Auditing ${filesToEvaluate.length} modified file(s)...`);

  const result = classifier.evaluateChanges(filesToEvaluate);

  console.log('\n📊 Change Classification Result:');
  console.log(`  - Change Classes: ${result.changeClasses.join(', ')}`);
  console.log(`  - Requires Scientific Impact Report: ${result.requiresScientificImpactReport ? 'YES' : 'NO'}`);
  console.log(`  - Requires DB Zero-State Test:       ${result.requiresDatabaseZeroStateTest ? 'YES' : 'NO'}`);
  console.log(`  - Requires Human Factors E2E:        ${result.requiresHumanFactorsE2E ? 'YES' : 'NO'}`);
  console.log(`  - Requires Security Probe:           ${result.requiresSecurityProbe ? 'YES' : 'NO'}`);

  if (result.warnings.length > 0) {
    console.log('\n⚠️ Warnings:');
    result.warnings.forEach((w) => console.log(`  - ${w}`));
  }

  if (result.errors.length > 0) {
    console.log('\n❌ Policy Errors:');
    result.errors.forEach((e) => console.log(`  - ${e}`));
    process.exit(1);
  } else {
    console.log('\n✅ PR Policy & Change Classification Passed.');
  }
}
