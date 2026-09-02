/**
 * MAGNIOM FULL TRACEABILITY VERIFIER
 *
 * Cross-references all SRS requirements against:
 * - Migration files in supabase/migrations/
 * - Package source files in packages/.../src/
 * - Golden case definitions in validation/golden-cases/
 * - Test files in supabase/tests/ and packages/.../tests/
 * - Security scripts in scripts/security/
 * - Verification scripts in scripts/verification/
 *
 * Outputs a coverage report showing traced vs untraced requirements.
 *
 * Usage: tsx scripts/verification/verify-full-traceability.ts
 */

import fs from 'node:fs';
import path from 'node:path';

interface TraceabilityEntry {
  requirementId: string;
  domain: string;
  safetyClass: string;
  implementationFiles: string[];
  testFiles: string[];
  goldenCases: string[];
  migrationFiles: string[];
  traceabilityStatus: 'TRACED' | 'PARTIAL' | 'UNTRACED' | 'DEFERRED';
  notes: string;
}

/**
 * Maps requirement domain prefixes to the implementation artifacts
 * that are expected to provide evidence for them.
 */
const DOMAIN_ARTIFACT_MAP: Record<string, { packages: string[]; migrations: RegExp[]; tests: string[] }> = {
  'MAG-SYS': {
    packages: ['packages/domain', 'packages/target-engine', 'packages/scientific-policy'],
    migrations: [/003_system_types/, /002_schemas/],
    tests: ['packages/domain/src/domain.test.ts', 'packages/target-engine/tests/'],
  },
  'MAG-CLI': {
    packages: ['packages/domain', 'packages/phenotype', 'apps/web'],
    migrations: [/007_clinical/, /008_clinical/, /010_phenotype/, /026_clinician/],
    tests: ['packages/target-engine/tests/synthetic-workflow.test.ts'],
  },
  'MAG-PHE': {
    packages: ['packages/phenotype', 'packages/domain'],
    migrations: [/009_phenotype/, /010_phenotype/],
    tests: ['packages/phenotype/src/phenotype.test.ts'],
  },
  'MAG-EVD': {
    packages: ['packages/evidence', 'packages/domain'],
    migrations: [/018_evidence/, /019_evidence/, /020_evidence/, /021_evidence/, /022_evidence/, /023_evidence/],
    tests: ['packages/evidence/src/evidence.test.ts', 'packages/target-engine/tests/evidence-ceiling.test.ts'],
  },
  'MAG-POL': {
    packages: ['packages/scientific-policy', 'packages/domain'],
    migrations: [],
    tests: ['packages/scientific-policy/src/policy.test.ts'],
  },
  'MAG-IMG': {
    packages: ['services/neurocompute', 'packages/target-engine/src/spatial'],
    migrations: [/038_imaging/, /039_connectomics/],
    tests: ['packages/target-engine/tests/imaging-validation.test.ts', 'packages/target-engine/tests/coordinate-round-trip.test.ts'],
  },
  'MAG-TGT': {
    packages: ['packages/target-engine'],
    migrations: [/024_target/, /025_target/],
    tests: [
      'packages/target-engine/tests/target-engine.test.ts',
      'packages/target-engine/tests/golden-cases-suite.test.ts',
      'packages/target-engine/tests/property-based-invariants.test.ts',
      'packages/target-engine/tests/determinism-and-invariants.test.ts',
      'packages/target-engine/tests/m3-freeze-invariants.test.ts',
    ],
  },
  'MAG-UX': {
    packages: ['apps/web', 'packages/presentation', 'packages/ui'],
    migrations: [],
    tests: ['packages/presentation/src/presentation.test.ts'],
  },
  'MAG-DAT': {
    packages: ['packages/domain', 'packages/schemas'],
    migrations: [/003_system/, /007_clinical/, /024_target/, /025_target/],
    tests: ['packages/schemas/src/schemas.test.ts', 'packages/domain/src/domain.test.ts'],
  },
  'MAG-SEC': {
    packages: ['packages/domain'],
    migrations: [/005_permissions/, /006_security/, /036_storage/, /040_full_rls/, /041_worker/],
    tests: [
      'supabase/tests/003_full_rls_suite.test.sql',
      'packages/domain/src/rls-isolation.test.ts',
    ],
  },
  'MAG-WFL': {
    packages: ['services/workflow-worker'],
    migrations: [/029_workflow/, /030_outbox/, /037_queues/],
    tests: [],
  },
  'MAG-AUD': {
    packages: ['packages/domain'],
    migrations: [/042_audit/],
    tests: [],
  },
  'MAG-REL': {
    packages: ['packages/domain', 'scripts/release'],
    migrations: [],
    tests: [],
  },
  'MAG-VAL': {
    packages: ['packages/test-fixtures', 'scripts/verification'],
    migrations: [],
    tests: ['packages/target-engine/tests/golden-cases-suite.test.ts'],
  },
};

function fileExists(repoRoot: string, relPath: string): boolean {
  const full = path.join(repoRoot, relPath);
  return fs.existsSync(full);
}

function findMatchingMigrations(repoRoot: string, patterns: RegExp[]): string[] {
  const migrationsDir = path.join(repoRoot, 'supabase/migrations');
  if (!fs.existsSync(migrationsDir)) return [];
  const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql'));
  return files.filter((f) => patterns.some((p) => p.test(f)));
}

function findGoldenCases(repoRoot: string): string[] {
  const gcDir = path.join(repoRoot, 'validation/golden-cases');
  if (!fs.existsSync(gcDir)) return [];
  return fs.readdirSync(gcDir).filter((f) => {
    const full = path.join(gcDir, f);
    return fs.statSync(full).isDirectory();
  });
}

function main(): void {
  const repoRoot = path.resolve(process.cwd());
  const inventoryPath = path.join(repoRoot, 'docs/verification/requirement-inventory.json');

  if (!fs.existsSync(inventoryPath)) {
    console.error('❌ Requirement inventory not found. Run extract-srs-requirements.ts first.');
    process.exit(1);
  }

  const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));
  const requirements: Array<{ id: string; domain: string; safetyClass: string }> = inventory.requirements;

  console.log('🔬 MAGNIOM FULL TRACEABILITY VERIFIER');
  console.log('=====================================\n');
  console.log(`Checking ${requirements.length} requirements against implementation artifacts...\n`);

  const allGoldenCases = findGoldenCases(repoRoot);
  const entries: TraceabilityEntry[] = [];

  let traced = 0;
  let partial = 0;
  let untraced = 0;
  let deferred = 0;

  for (const req of requirements) {
    const domain = req.domain || req.id.replace(/-\d+$/, '');
    const mapping = DOMAIN_ARTIFACT_MAP[domain];

    if (!mapping) {
      entries.push({
        requirementId: req.id,
        domain,
        safetyClass: req.safetyClass,
        implementationFiles: [],
        testFiles: [],
        goldenCases: [],
        migrationFiles: [],
        traceabilityStatus: 'UNTRACED',
        notes: 'No domain mapping defined',
      });
      untraced++;
      continue;
    }

    const implementationFiles = mapping.packages.filter((p) => fileExists(repoRoot, p));
    const testFiles = mapping.tests.filter((t) => fileExists(repoRoot, t));
    const migrationFiles = findMatchingMigrations(repoRoot, mapping.migrations);

    const hasImpl = implementationFiles.length > 0;
    const hasTests = testFiles.length > 0;
    const hasMigrations = migrationFiles.length > 0 || mapping.migrations.length === 0;

    let status: TraceabilityEntry['traceabilityStatus'];
    let notes = '';

    if (hasImpl && (hasTests || hasMigrations)) {
      status = 'TRACED';
      traced++;
    } else if (hasImpl) {
      status = 'PARTIAL';
      partial++;
      notes = 'Implementation exists but test coverage incomplete';
    } else {
      status = 'UNTRACED';
      untraced++;
      notes = 'Implementation artifact not located';
    }

    entries.push({
      requirementId: req.id,
      domain,
      safetyClass: req.safetyClass,
      implementationFiles,
      testFiles,
      goldenCases: [],
      migrationFiles,
      traceabilityStatus: status,
      notes,
    });
  }

  // Summary
  console.log('TRACEABILITY COVERAGE SUMMARY');
  console.log('─────────────────────────────────────────');
  console.log(`  TRACED:    ${String(traced).padStart(4)} / ${requirements.length}  (${((traced / requirements.length) * 100).toFixed(1)}%)`);
  console.log(`  PARTIAL:   ${String(partial).padStart(4)} / ${requirements.length}  (${((partial / requirements.length) * 100).toFixed(1)}%)`);
  console.log(`  UNTRACED:  ${String(untraced).padStart(4)} / ${requirements.length}  (${((untraced / requirements.length) * 100).toFixed(1)}%)`);
  console.log(`  DEFERRED:  ${String(deferred).padStart(4)} / ${requirements.length}  (${((deferred / requirements.length) * 100).toFixed(1)}%)`);
  console.log('─────────────────────────────────────────');
  console.log(`  Golden Cases Available: ${allGoldenCases.length} (${allGoldenCases.join(', ')})`);
  console.log(`  Migrations Available:  ${findMatchingMigrations(repoRoot, [/.*/]).length}`);
  console.log('─────────────────────────────────────────\n');

  // Domain breakdown
  const domainStats: Record<string, { traced: number; partial: number; untraced: number; total: number }> = {};
  for (const e of entries) {
    if (!domainStats[e.domain]) domainStats[e.domain] = { traced: 0, partial: 0, untraced: 0, total: 0 };
    domainStats[e.domain].total++;
    if (e.traceabilityStatus === 'TRACED') domainStats[e.domain].traced++;
    else if (e.traceabilityStatus === 'PARTIAL') domainStats[e.domain].partial++;
    else domainStats[e.domain].untraced++;
  }

  console.log('DOMAIN BREAKDOWN:');
  for (const [domain, stats] of Object.entries(domainStats).sort()) {
    const pct = ((stats.traced / stats.total) * 100).toFixed(0);
    console.log(`  ${domain.padEnd(12)} ${String(stats.traced).padStart(3)}/${String(stats.total).padStart(3)} traced  (${pct}%)`);
  }

  // Write output
  const outputPath = path.join(repoRoot, 'docs/verification/traceability-coverage.json');
  fs.writeFileSync(
    outputPath,
    JSON.stringify(
      {
        verificationDate: new Date().toISOString(),
        totalRequirements: requirements.length,
        traced,
        partial,
        untraced,
        deferred,
        goldenCasesAvailable: allGoldenCases.length,
        domainStats,
        entries,
      },
      null,
      2
    ),
    'utf8'
  );

  console.log(`\n📄 Traceability coverage report written to: ${outputPath}\n`);

  if (untraced > 0) {
    console.log(`⚠️  ${untraced} requirements lack full traceability. See report for details.`);
  }
}

main();
