/**
 * MAGNIOM AUTOMATED SCIENTIFIC CHANGE CLASSIFIER & PR POLICY VALIDATOR v2.0
 * Conforms to MAGNIOM-Enterprise Verification, Testing & CI/CD Specification v2.0 (§112–118)
 *
 * Classifies repository changes into Change Impact Levels (C0–C4):
 * - C0 (§114): Pure cosmetic, non-functional documentation or comment changes.
 * - C1 (§115): Refactoring or performance optimization with zero numerical deviation.
 * - C2 (§116): Parameter / threshold / config adjustment within validated bounds.
 * - C3 (§117): Algorithmic / structural engine change (requires PR Scientific Pipeline & dual review).
 * - C4 (§118): New indication, safety policy modification, or database schema migration (requires Clinical Board sign-off).
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

export type ChangeImpactLevel = 'C0' | 'C1' | 'C2' | 'C3' | 'C4';

export type ChangeDomainCategory =
  | 'SCIENTIFIC_ENGINE'
  | 'SCIENTIFIC_EVIDENCE'
  | 'SCIENTIFIC_POLICY'
  | 'SCIENTIFIC_MEASUREMENT'
  | 'DATABASE_MIGRATION'
  | 'DOMAIN_CONTRACTS'
  | 'UX_CLINICAL_SHELL'
  | 'SECURITY_INFRA'
  | 'VERIFICATION_SCRIPTS'
  | 'DOCUMENTATION'
  | 'ORDINARY_APP';

export interface FileClassification {
  readonly file: string;
  readonly impactLevel: ChangeImpactLevel;
  readonly category: ChangeDomainCategory;
  readonly rationale: string;
}

export interface PRPolicyEvaluationV2 {
  readonly passed: boolean;
  readonly maxImpactLevel: ChangeImpactLevel;
  readonly detectedCategories: readonly ChangeDomainCategory[];
  readonly requiresFastPRPipeline: boolean;
  readonly requiresScientificPipeline: boolean;
  readonly requiresFullGoldenSuite: boolean;
  readonly requiresSpatialDifferentialReport: boolean;
  readonly requiresDatabaseZeroStateTest: boolean;
  readonly requiresDualScientificReview: boolean;
  readonly requiresClinicalBoardApproval: boolean;
  readonly classifiedFiles: readonly FileClassification[];
  readonly warnings: readonly string[];
  readonly errors: readonly string[];
}

const PATH_RULES: Array<{
  pattern: RegExp;
  impactLevel: ChangeImpactLevel;
  category: ChangeDomainCategory;
  rationale: string;
}> = [
  // C4: Breaking Schemas, Migrations & Core Governance
  {
    pattern: /^supabase\/migrations\//,
    impactLevel: 'C4',
    category: 'DATABASE_MIGRATION',
    rationale: 'Database migration alters relational data model or RLS policies (§118).',
  },
  {
    pattern: /^packages\/domain\/src\/(types|indication-module|clinical-context|release-v2)\.ts/,
    impactLevel: 'C4',
    category: 'DOMAIN_CONTRACTS',
    rationale: 'Core domain entities alter system-wide data contract (§118).',
  },
  {
    pattern: /^packages\/target-engine\/src\/plugins\//,
    impactLevel: 'C3',
    category: 'SCIENTIFIC_ENGINE',
    rationale: 'Indication targeting plugin logic modified (§117).',
  },
  {
    pattern: /^packages\/target-engine\/src\/(core|generators|math|scoring|ranking)\//,
    impactLevel: 'C3',
    category: 'SCIENTIFIC_ENGINE',
    rationale: 'Core Target Engine algorithm or scoring logic modified (§117).',
  },
  {
    pattern: /^packages\/evidence\//,
    impactLevel: 'C3',
    category: 'SCIENTIFIC_EVIDENCE',
    rationale: 'Evidence knowledge graph or claim synthesis updated (§117).',
  },
  {
    pattern: /^packages\/networks\//,
    impactLevel: 'C3',
    category: 'SCIENTIFIC_ENGINE',
    rationale: 'Triple-network systems layer or normative connectome solver modified (§117).',
  },
  {
    pattern: /^services\/neurocompute\//,
    impactLevel: 'C3',
    category: 'SCIENTIFIC_MEASUREMENT',
    rationale: 'Neuroimaging pipeline or connectome solver modified (§117).',
  },
  {
    pattern: /^packages\/scientific-policy\//,
    impactLevel: 'C2',
    category: 'SCIENTIFIC_POLICY',
    rationale: 'Scientific policy rules or mode permissions modified (§116).',
  },
  {
    pattern: /^scientific-config\//,
    impactLevel: 'C2',
    category: 'SCIENTIFIC_POLICY',
    rationale: 'Scientific configuration thresholds updated (§116).',
  },
  {
    pattern: /^packages\/(modalities|measurement-core|measurement-testkit)\//,
    impactLevel: 'C2',
    category: 'SCIENTIFIC_MEASUREMENT',
    rationale: 'Multimodal measurement provider or QC gate modified (§116).',
  },
  {
    pattern: /^apps\/web\//,
    impactLevel: 'C1',
    category: 'UX_CLINICAL_SHELL',
    rationale: 'Application shell, UI component or clinician workspace updated (§115).',
  },
  {
    pattern: /^packages\/presentation\//,
    impactLevel: 'C1',
    category: 'UX_CLINICAL_SHELL',
    rationale: 'Presentation layer view models modified (§115).',
  },
  {
    pattern: /^scripts\/security\//,
    impactLevel: 'C1',
    category: 'SECURITY_INFRA',
    rationale: 'Security analysis or SBOM tooling updated (§115).',
  },
  {
    pattern: /^scripts\/verification\//,
    impactLevel: 'C1',
    category: 'VERIFICATION_SCRIPTS',
    rationale: 'Verification harness or exit criteria validator updated (§115).',
  },
  {
    pattern: /^scripts\/release\//,
    impactLevel: 'C2',
    category: 'VERIFICATION_SCRIPTS',
    rationale: 'Release packaging or manifest generation tooling updated (§116).',
  },
  {
    pattern: /^docs\/software-requirements\//,
    impactLevel: 'C3',
    category: 'DOMAIN_CONTRACTS',
    rationale: 'System requirements catalog or traceability modified (§117).',
  },
  {
    pattern: /\.(md|txt)$/,
    impactLevel: 'C0',
    category: 'DOCUMENTATION',
    rationale: 'Documentation or report change outside code paths (§114).',
  },
];

const IMPACT_ORDER: Record<ChangeImpactLevel, number> = {
  C0: 0,
  C1: 1,
  C2: 2,
  C3: 3,
  C4: 4,
};

export class ScientificChangeClassifier {
  private repoRoot: string;

  constructor(repoRoot: string = path.resolve(process.cwd())) {
    this.repoRoot = repoRoot;
  }

  public getChangedFiles(baseBranch = 'main'): string[] {
    const files = new Set<string>();

    try {
      const output = execSync(`git diff --name-only origin/${baseBranch}...HEAD`, {
        cwd: this.repoRoot,
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'ignore'],
      });
      output
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean)
        .forEach(f => files.add(f));
    } catch {
      try {
        const output = execSync('git diff --name-only HEAD~1 HEAD', {
          cwd: this.repoRoot,
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'ignore'],
        });
        output
          .split('\n')
          .map(s => s.trim())
          .filter(Boolean)
          .forEach(f => files.add(f));
      } catch {
        // ignore
      }
    }

    // If no commits differ from baseBranch, also inspect staged & unstaged working-tree changes
    // to provide immediate feedback during local development and pre-commit checks.
    if (files.size === 0) {
      try {
        const status = execSync('git status --porcelain', {
          cwd: this.repoRoot,
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'ignore'],
        });
        status
          .split('\n')
          .map(s => s.trim())
          .filter(Boolean)
          .forEach(line => {
            const clean = line
              .replace(/^[?MADRCU!\s]{1,3}\s+/, '')
              .split(' -> ')
              .pop()
              ?.trim();
            if (clean) files.add(clean);
          });
      } catch {
        // ignore
      }
    }

    return Array.from(files);
  }

  public classifyFile(filePath: string): FileClassification {
    const normalized = filePath.replace(/\\/g, '/');

    for (const rule of PATH_RULES) {
      if (rule.pattern.test(normalized)) {
        return {
          file: filePath,
          impactLevel: rule.impactLevel,
          category: rule.category,
          rationale: rule.rationale,
        };
      }
    }

    return {
      file: filePath,
      impactLevel: 'C1',
      category: 'ORDINARY_APP',
      rationale: 'Standard repository file modification (§115).',
    };
  }

  public evaluateChanges(files: string[], prDescription?: string): PRPolicyEvaluationV2 {
    const classifiedFiles: FileClassification[] = [];
    const categoriesSet = new Set<ChangeDomainCategory>();
    const errors: string[] = [];
    const warnings: string[] = [];

    let maxImpact: ChangeImpactLevel = 'C0';

    if (files.length === 0) {
      classifiedFiles.push({
        file: '(clean working tree)',
        impactLevel: 'C0',
        category: 'DOCUMENTATION',
        rationale: 'No file modifications detected.',
      });
    } else {
      for (const file of files) {
        const c = this.classifyFile(file);
        classifiedFiles.push(c);
        categoriesSet.add(c.category);

        if (IMPACT_ORDER[c.impactLevel] > IMPACT_ORDER[maxImpact]) {
          maxImpact = c.impactLevel;
        }
      }
    }

    const detectedCategories = Array.from(categoriesSet);
    const isScientific =
      detectedCategories.includes('SCIENTIFIC_ENGINE') ||
      detectedCategories.includes('SCIENTIFIC_EVIDENCE') ||
      detectedCategories.includes('SCIENTIFIC_POLICY') ||
      detectedCategories.includes('SCIENTIFIC_MEASUREMENT');

    const requiresScientificPipeline =
      IMPACT_ORDER[maxImpact] >= IMPACT_ORDER['C2'] && isScientific;
    const requiresFullGoldenSuite = IMPACT_ORDER[maxImpact] >= IMPACT_ORDER['C3'];
    const requiresSpatialDifferentialReport = requiresScientificPipeline;
    const requiresDatabaseZeroStateTest = detectedCategories.includes('DATABASE_MIGRATION');
    const requiresDualScientificReview = IMPACT_ORDER[maxImpact] >= IMPACT_ORDER['C3'];
    const requiresClinicalBoardApproval = maxImpact === 'C4';

    // PR Policy Validation (§20, §44)
    if (prDescription !== undefined) {
      if (!/MAG-[A-Z]{2,4}-\d{3}/i.test(prDescription) && !/REQ-[A-Z]+-\d+/i.test(prDescription)) {
        errors.push(
          'PR Policy Violation (§126): PR description must reference at least one verified SRS Requirement (e.g., MAG-TGT-001 or MAG-SYS-041).',
        );
      }

      if (requiresDualScientificReview) {
        if (
          !/SCIENTIFIC_CHANGE:\s*(YES|TRUE)/i.test(prDescription) &&
          !/\[x\]\s*Scientific Change/i.test(prDescription)
        ) {
          warnings.push(
            `Impact Level ${maxImpact} detected: PR description should explicitly acknowledge Scientific Impact.`,
          );
        }
      }
    }

    return {
      passed: errors.length === 0,
      maxImpactLevel: maxImpact,
      detectedCategories,
      requiresFastPRPipeline: true,
      requiresScientificPipeline,
      requiresFullGoldenSuite,
      requiresSpatialDifferentialReport,
      requiresDatabaseZeroStateTest,
      requiresDualScientificReview,
      requiresClinicalBoardApproval,
      classifiedFiles,
      warnings,
      errors,
    };
  }
}

// Backward-compatible export
export { ScientificChangeClassifier as ChangeClassifier };

if (process.argv[1]?.endsWith('classify-change.ts')) {
  const classifier = new ScientificChangeClassifier();
  const sampleFiles = process.argv.slice(2);
  const filesToEvaluate = sampleFiles.length > 0 ? sampleFiles : classifier.getChangedFiles();

  console.log('🔬 MAGNIOM SCIENTIFIC CHANGE CLASSIFIER v2.0 (§112–118)');
  console.log('========================================================\n');
  console.log(`Auditing ${filesToEvaluate.length} modified file(s)...`);

  const result = classifier.evaluateChanges(filesToEvaluate);

  console.log('\n📊 Change Classification Result:');
  console.log(`  - Maximum Impact Level:               [${result.maxImpactLevel}]`);
  console.log(`  - Detected Domain Categories:         ${result.detectedCategories.join(', ')}`);
  console.log(
    `  - Requires PR Fast Pipeline:          ${result.requiresFastPRPipeline ? 'YES' : 'NO'}`,
  );
  console.log(
    `  - Requires PR Scientific Pipeline:    ${result.requiresScientificPipeline ? 'YES' : 'NO'}`,
  );
  console.log(
    `  - Requires Full 72 Golden Cases:      ${result.requiresFullGoldenSuite ? 'YES' : 'NO'}`,
  );
  console.log(
    `  - Requires Spatial Differential Diff: ${result.requiresSpatialDifferentialReport ? 'YES' : 'NO'}`,
  );
  console.log(
    `  - Requires DB Zero-State Rebuild:     ${result.requiresDatabaseZeroStateTest ? 'YES' : 'NO'}`,
  );
  console.log(
    `  - Requires Dual Scientific Review:    ${result.requiresDualScientificReview ? 'YES' : 'NO'}`,
  );
  console.log(
    `  - Requires Clinical Board Approval:   ${result.requiresClinicalBoardApproval ? 'YES' : 'NO'}`,
  );

  if (result.warnings.length > 0) {
    console.log('\n⚠️ Warnings:');
    result.warnings.forEach(w => console.log(`  - ${w}`));
  }

  if (result.errors.length > 0) {
    console.log('\n❌ Policy Errors:');
    result.errors.forEach(e => console.log(`  - ${e}`));
    process.exit(1);
  } else {
    console.log('\n✅ PR Policy & Change Classification Passed.');
  }
}
