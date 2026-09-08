import fs from 'node:fs';
import path from 'node:path';

function checkForbiddenImports(packageDir: string, forbiddenPatterns: RegExp[]): number {
  let violations = 0;
  const srcDir = path.join(packageDir, 'src');

  if (!fs.existsSync(srcDir)) {
    return 0;
  }

  const files = fs.readdirSync(srcDir, { recursive: true }) as string[];

  for (const file of files) {
    if (typeof file === 'string' && (file.endsWith('.ts') || file.endsWith('.tsx'))) {
      const filePath = path.join(srcDir, file);
      const content = fs.readFileSync(filePath, 'utf8');

      for (const pattern of forbiddenPatterns) {
        if (pattern.test(content)) {
          console.error(
            `❌ Boundary violation in ${filePath}: matched forbidden pattern ${pattern}`,
          );
          violations++;
        }
      }
    }
  }

  return violations;
}

function verifyBoundaries() {
  console.log('🔍 Validating Architectural Package Boundaries...');

  const rootDir = process.cwd();
  const domainDir = path.join(rootDir, 'packages/domain');
  const engineDir = path.join(rootDir, 'packages/target-engine');
  const measurementCoreDir = path.join(rootDir, 'packages/measurement-core');
  const modalitiesDir = path.join(rootDir, 'packages/modalities');
  const scientificPolicyDir = path.join(rootDir, 'packages/scientific-policy');
  const schemasDir = path.join(rootDir, 'packages/schemas');
  const evidenceDir = path.join(rootDir, 'packages/evidence');

  const forbiddenForPurePackages = [
    /@supabase\//,
    /from\s+['"]next(\/.*)?['"]/,
    /from\s+['"]react['"]/,
    /from\s+['"]node:fs['"]/,
    /from\s+['"]fs['"]/,
    /from\s+['"]node:net['"]/,
    /window\./,
    /document\./,
  ];

  let totalViolations = 0;

  totalViolations += checkForbiddenImports(domainDir, forbiddenForPurePackages);
  totalViolations += checkForbiddenImports(engineDir, forbiddenForPurePackages);
  totalViolations += checkForbiddenImports(measurementCoreDir, forbiddenForPurePackages);
  totalViolations += checkForbiddenImports(modalitiesDir, forbiddenForPurePackages);
  totalViolations += checkForbiddenImports(scientificPolicyDir, forbiddenForPurePackages);
  totalViolations += checkForbiddenImports(schemasDir, forbiddenForPurePackages);
  totalViolations += checkForbiddenImports(evidenceDir, forbiddenForPurePackages);

  if (totalViolations > 0) {
    console.error(`\n❌ Boundary verification failed with ${totalViolations} violation(s).`);
    process.exit(1);
  }

  console.log(
    '✅ All package boundary constraints satisfied (pure domain, target engine, measurement core, modalities, scientific policy, schemas & evidence are fully isolated).',
  );
}

verifyBoundaries();
