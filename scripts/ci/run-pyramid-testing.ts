#!/usr/bin/env npx tsx
/**
 * MAGNIOM TESTING PYRAMID v2.0 RUNNER & ORCHESTRATOR
 * Conforms to MAGNIOM-Enterprise Verification, Testing & CI/CD Specification v2.0 (Sections 33–49)
 *
 * Executes the formal 12-layer verification pyramid:
 *   Level 1:  Static Architecture, Boundary Linting & Pure AST Rules (§34–35)
 *   Level 2:  Monorepo Package Unit Tests (All 11 Packages) (§36)
 *   Level 3:  Numerical Boundaries & Property Invariant Fuzzing (fast-check) (§37–38)
 *   Level 4:  Metamorphic Relations & Domain/API Contracts (§39–41)
 *   Level 5:  Database Zero-State Rebuild & 11-Domain RLS Security (§42, §45–46)
 *   Level 6:  Service Integration, Worker Queue & Failure Resilience (§47–48)
 *   Level 7:  Scientific Golden Test Matrix (72 Cases / 8 Modules / 0.000mm Drift) (§50–65, §119–121)
 *   Level 8:  Measurement Providers, BIDS Validation & Imaging QA Fallbacks (§66–79)
 *   Level 9:  Security Analysis, CycloneDX 1.5 SBOM & Pentest Probes (§99–106)
 *   Level 10: Synthetic End-to-End Workflow Slice (§82, §86)
 *   Level 11: Human Factors, Clinician Anti-Bias Shell & Accessibility (§86–91)
 *   Level 12: Post-Deploy Scientific Smoke & Multi-Indication Recall Indexing (§148–155, §185–187)
 */

import { execSync } from 'node:child_process';
import path from 'node:path';

export interface PyramidLayer {
  readonly level: number;
  readonly name: string;
  readonly command: string;
  readonly specSection: string;
  readonly description: string;
}

export const PYRAMID_LAYERS: readonly PyramidLayer[] = [
  {
    level: 1,
    name: 'Level 1: Static Architecture & Boundary Linting',
    command:
      'npm run verify:boundaries && npm run verify:static-rules && npm run typecheck && npm run format:check',
    specSection: '§34–§35',
    description:
      'Enforces pure domain isolation, zero external API deps in target-engine, AST determinism, strict types & formatting.',
  },
  {
    level: 2,
    name: 'Level 2: Monorepo Package Unit Test Suites',
    command: 'npm test',
    specSection: '§36',
    description:
      'Executes comprehensive unit test suites across all 11 packages (domain, schemas, phenotype, evidence, target-engine, etc.).',
  },
  {
    level: 3,
    name: 'Level 3: Numerical Boundaries & Property Invariants (fast-check)',
    command: 'npm run verify:properties',
    specSection: '§37–§38',
    description:
      'Verifies mathematical invariants via fast-check randomized fuzzing (10,000+ runs), monotonic reliability, and cardinality.',
  },
  {
    level: 4,
    name: 'Level 4: Metamorphic Relations & Domain/API Contracts',
    command:
      'npx vitest run packages/target-engine/tests/v2/metamorphic-and-boundary.test.ts packages/domain/tests/ packages/target-engine/tests/v2/plugin-contracts.test.ts packages/domain/src/rls-isolation.test.ts packages/schemas/tests/',
    specSection: '§39–§41',
    description:
      'Validates 5 metamorphic scientific relations, candidate permutation invariance, canonical data schemas & prohibited fields, schema contract boundaries, and tenant isolation.',
  },
  {
    level: 5,
    name: 'Level 5: Database Zero-State & 11-Domain RLS Security Matrix',
    command: 'npm run verify:db:from-zero',
    specSection: '§42, §45–§46',
    description:
      'Audits 51 sequential migrations (001–065), 11 schemas default-deny RLS, immutability triggers, and adversarial tenancy spoofing.',
  },
  {
    level: 6,
    name: 'Level 6: Worker Queue Resilience & Service Contracts',
    command:
      'npx vitest run services/workflow-worker/tests/worker.test.ts services/workflow-worker/tests/worker-permissions.test.ts services/workflow-worker/tests/functional-verification.test.ts services/workflow-worker/tests/structural-verification.test.ts',
    specSection: '§47–§48',
    description:
      'Simulates worker crashes, duplicate delivery idempotency, poison messages, attempt limits, structural validation, and storage containment.',
  },
  {
    level: 7,
    name: 'Level 7: Scientific Golden Test Matrix (72 Cases across 8 Modules)',
    command: 'npm run verify:scientific-impact',
    specSection: '§50–§65, §119–§121',
    description:
      'Executes 72 clinical scenarios across MDD, OCD, Pain, Stroke Motor, Stroke Aphasia, TBI, PTSD, Tinnitus with Δ = 0.000mm drift.',
  },
  {
    level: 8,
    name: 'Level 8: Measurement Validation & Imaging QA Fallback Suite',
    command:
      'npx vitest run packages/target-engine/tests/imaging-validation.test.ts packages/target-engine/tests/v2/laterality-release-blocking.test.ts packages/modalities/ packages/measurement-core/ packages/measurement-testkit/ && npm run test:neurocompute -- --fast',
    specSection: '§66–§79',
    description:
      'Validates BIDS conformance, connectome matrices, motion artifacts (I01–I10), release-blocking laterality invariants, and executes multi-language neurocompute unit tests.',
  },
  {
    level: 9,
    name: 'Level 9: Security Analysis, CycloneDX 1.5 SBOM & Pentest Probes',
    command:
      'npm run sbom:generate && npm run sbom:verify && npm run security:secrets && npm run security:probe',
    specSection: '§99–§106',
    description:
      'Generates CycloneDX 1.5 SBOM, verifies pinned dependencies, scans secret entropy, and runs penetration probes.',
  },
  {
    level: 10,
    name: 'Level 10: Synthetic Workflow End-to-End Vertical Slice',
    command: 'npx vitest run services/workflow-worker/tests/synthetic-e2e.test.ts',
    specSection: '§82, §86',
    description:
      'Exercises complete vertical slice: Intake -> Phenotype -> Imaging QC -> Target Slate -> Clinician Signing -> Audit Trail Chain.',
  },
  {
    level: 11,
    name: 'Level 11: Human Factors, Clinician Anti-Bias Shell & Accessibility',
    command:
      'npx vitest run packages/presentation/src/presentation.test.ts packages/presentation/tests/ux-golden-cases-v2.test.ts packages/presentation/tests/shell-navigation-v2.test.ts apps/web/tests/shell-v2-authority.test.ts apps/web/tests/route-security-auth-guard.test.ts apps/web/tests/auth-universal-login.test.ts apps/web/tests/auth-api-endpoints.test.ts apps/web/tests/case-store-authority.test.ts apps/web/tests/route-integrity-audit.test.ts apps/web/tests/design-system-integrity.test.ts',
    specSection: '§86–§91',
    description:
      'Verifies clinician workspace view models, anti-bias UI non-preselection of Candidate 1 (§89), WCAG 2.2 AA shell navigation, route security auth guards, server auth endpoints, case store authority, and design system token integrity.',
  },
  {
    level: 12,
    name: 'Level 12: Post-Deploy Scientific Smoke & Multi-Indication Recall Indexing',
    command: 'npm run postdeploy:smoke && npm run release:affected-cases',
    specSection: '§148–§155, §181–§190',
    description:
      'Verifies non-mutating smoke tests across all 8 indication modules and indexes case recall registry for field safety.',
  },
];

export interface PyramidRunOptions {
  layer?: number;
  full?: boolean;
}

export class PyramidTestingRunner {
  private repoRoot: string;

  constructor(repoRoot: string = path.resolve(process.cwd())) {
    this.repoRoot = repoRoot;
  }

  public runAllLayers(): boolean {
    return this.run();
  }

  public run(options: PyramidRunOptions = {}): boolean {
    console.log('='.repeat(96));
    console.log('🏛️  MAGNIOM FORMAL TESTING PYRAMID v2.0 RUNNER');
    console.log(
      'Normative Reference: public/guides/MAGNIOM-Enterprise Verification, Testing CICD Specification v2.0.md',
    );
    console.log('Standard Reference:  IEC 62304:2006/Amd 1:2015 Class C | ISO 13485:2016 §7.3.6');
    console.log('='.repeat(96) + '\n');

    let layersToRun = [...PYRAMID_LAYERS];
    if (options.layer !== undefined) {
      const target = PYRAMID_LAYERS.find(l => l.level === options.layer);
      if (!target) {
        console.error(`❌ Invalid pyramid layer: ${options.layer}. Valid layers are 1 through 12.`);
        return false;
      }
      layersToRun = [target];
      console.log(`🎯 Target: Executing single pyramid layer [Layer ${options.layer}/12]`);
    }

    const suiteStartTime = Date.now();
    let passedLayers = 0;
    const layerResults: { level: number; name: string; durationSec: string; passed: boolean }[] =
      [];

    for (const layer of layersToRun) {
      let cmd = layer.command;
      if (layer.level === 8 && options.full) {
        cmd = cmd.replace('-- --fast', '-- --full');
      }

      console.log(`\n▶️ [PYRAMID LAYER ${layer.level}/12] (${layer.specSection}): ${layer.name}`);
      console.log(`   Scope:       ${layer.description}`);
      console.log(`   Command:     ${cmd}`);

      const layerStart = Date.now();
      try {
        execSync(cmd, {
          cwd: this.repoRoot,
          stdio: 'inherit',
          env: { ...process.env, CI: 'true' },
        });
        const durationSec = ((Date.now() - layerStart) / 1000).toFixed(2);
        console.log(`✅ [LAYER ${layer.level} PASSED] (${durationSec}s)`);
        passedLayers++;
        layerResults.push({ level: layer.level, name: layer.name, durationSec, passed: true });
      } catch {
        const durationSec = ((Date.now() - layerStart) / 1000).toFixed(2);
        console.error(`\n❌ [LAYER ${layer.level} FAILED] after ${durationSec}s!`);
        console.error(`Command failed: ${cmd}`);
        layerResults.push({ level: layer.level, name: layer.name, durationSec, passed: false });
        return false;
      }
    }

    const totalDurationSec = ((Date.now() - suiteStartTime) / 1000).toFixed(2);
    console.log('\n' + '='.repeat(96));
    console.log(
      `🎉 ALL ${passedLayers} REQUESTED TESTING PYRAMID LAYERS VERIFIED (100% PASS RATE) in ${totalDurationSec}s`,
    );
    console.log('='.repeat(96));
    console.log('\nSummary:');
    for (const res of layerResults) {
      console.log(
        `  [Level ${res.level.toString().padStart(2, ' ')}/12]  ✅ PASS (${res.durationSec}s) - ${res.name}`,
      );
    }
    console.log('='.repeat(96) + '\n');

    return true;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const options: PyramidRunOptions = {};

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
MAGNIOM Testing Pyramid Runner v2.0
Usage:
  npx tsx scripts/ci/run-pyramid-testing.ts [options]

Options:
  --layer <N>    Execute only pyramid layer N (1–12)
  --full         Execute full NeuroCompute suite (Level 8) instead of fast unit suite
  --help, -h     Show this help message
`);
    process.exit(0);
  }

  const layerIdx = args.indexOf('--layer');
  if (layerIdx !== -1 && args[layerIdx + 1]) {
    options.layer = parseInt(args[layerIdx + 1], 10);
  }

  if (args.includes('--full')) {
    options.full = true;
  }

  const runner = new PyramidTestingRunner();
  const success = runner.run(options);
  process.exit(success ? 0 : 1);
}
