/**
 * MAGNIOM LOCAL CONTINUOUS INTEGRATION & VERIFICATION RUNNER v2.0
 * Conforms to MAGNIOM-Enterprise Verification, Testing & CI/CD Specification v2.0 (Stages 0–10)
 *
 * Runs the full end-to-end 10-Stage verification pipeline locally:
 * Stage 0: C0–C4 Scientific Change Classifier & PR Policy Check
 * Stage 1: Static Verification, Package Boundaries & Target Engine Rules
 * Stage 2: Monorepo Unit Tests & 332 SRS Requirements Traceability
 * Stage 3: Property-Based Invariant Verification (fast-check)
 * Stage 4: Database Zero-State Rebuild & 11-Domain RLS Security Matrix
 * Stage 5: Multi-Indication 72 Golden Cases & Spatial Differential Engine
 * Stage 6: Release-Blocking Laterality, Adversarial Boundaries & Kill Switch
 * Stage 7: Presentation, UX View Models & Synthetic Workflow Workers
 * Stage 8: Security Analysis, CycloneDX 1.5 SBOM, Secret Hygiene & Pentest Probe
 * Stage 9: Controlled Reproducible Monorepo Build & MagniomReleaseManifestV2 Sealing
 * Stage 10: Multi-Indication Post-Deployment Smoke Test & Case Recall Indexing
 */

import { execSync } from 'node:child_process';
import path from 'node:path';

interface StageDefinition {
  stageNumber: number;
  name: string;
  command: string;
  description: string;
}

const STAGES: StageDefinition[] = [
  {
    stageNumber: 0,
    name: 'Stage 0 — C0–C4 Scientific Change Classifier & PR Policy',
    command: 'npx tsx scripts/ci/classify-change.ts',
    description: 'Validates change classes (C0–C4) and enforces PR metadata rules (§112–118).',
  },
  {
    stageNumber: 1,
    name: 'Stage 1 — Static Verification & Target Engine Rules',
    command:
      'npm run verify:boundaries && npm run verify:static-rules && npm run verify:srs-spec && npm run verify:target-engine-spec && npm run verify:canonical-data-spec && npm run verify:app-shell-spec && npm run verify:policy-spec && npm run verify:measurement-spec && npm run verify:evidence-spec && npm run verify:arch-spec && npm run verify:cicd-spec && npm run typecheck && npm run format:check',
    description: 'Enforces architectural isolation, Target Engine purity & strict typing (§34–35).',
  },
  {
    stageNumber: 2,
    name: 'Stage 2 — Unit Tests & 332 SRS Requirements Traceability',
    command: 'npm run verify:requirements && npm test',
    description:
      'Executes monorepo unit tests (Vitest) and validates 332 SRS requirements (§126–127).',
  },
  {
    stageNumber: 3,
    name: 'Stage 3 — Property-Based Invariant Verification',
    command: 'npm run verify:properties',
    description: 'Verifies Target Engine mathematical invariants via fast-check (§38).',
  },
  {
    stageNumber: 4,
    name: 'Stage 4 — Database Zero-State Rebuild & 11-Domain RLS',
    command: 'npm run verify:db:from-zero',
    description: 'Audits sequential migrations (001–064) and default-deny RLS policies (§42, §45).',
  },
  {
    stageNumber: 5,
    name: 'Stage 5 — Multi-Indication 72 Golden Cases & Spatial Differentials',
    command: 'npx tsx scripts/scientific/evaluate-scientific-impact.ts',
    description:
      'Executes 72 Golden Cases across all 8 modules and computes spatial differentials (§50–65, §119–121).',
  },
  {
    stageNumber: 6,
    name: 'Stage 6 — Release-Blocking Laterality & Adversarial Boundaries',
    command:
      'npx vitest run packages/target-engine/tests/v2/laterality-release-blocking.test.ts packages/target-engine/tests/v2/adversarial-boundaries.test.ts packages/target-engine/tests/v2/module-kill-switch.test.ts',
    description:
      'Asserts laterality invariance, wrong-module rejection, and kill-switch operation (§46, §65, §76, §183).',
  },
  {
    stageNumber: 7,
    name: 'Stage 7 — Presentation & Workflow Worker Integration',
    command:
      'npx vitest run packages/presentation/src/presentation.test.ts services/workflow-worker/tests/synthetic-e2e.test.ts',
    description:
      'Validates clinician workspace view models, anti-bias UI & synthetic workers (§86–89).',
  },
  {
    stageNumber: 8,
    name: 'Stage 8 — Security, SBOM, Secrets & Pentest Readiness',
    command:
      'npm run sbom:generate && npm run sbom:verify && npm run security:secrets && npm run security:probe',
    description:
      'Generates CycloneDX 1.5 SBOM, scans secret hygiene & runs pentest probes (§99–103).',
  },
  {
    stageNumber: 9,
    name: 'Stage 9 — Reproducible Monorepo Build & MagniomReleaseManifestV2',
    command: 'npm run build && npx tsx scripts/release/generate-release-manifest-v2.ts',
    description:
      'Builds all monorepo workspaces and seals canonical MagniomReleaseManifestV2 (§131).',
  },
  {
    stageNumber: 10,
    name: 'Stage 10 — Multi-Indication Smoke Test & Recall Indexing',
    command:
      'npx tsx scripts/release/post-deploy-golden-smoke.ts && npx tsx scripts/release/affected-case-index.ts ALL',
    description:
      'Runs non-mutating smoke tests across all 8 modules and indexes case recall registry (§148–149, §185–187).',
  },
];

export class LocalContinuousIntegrationRunner {
  private repoRoot: string;

  constructor(repoRoot: string = path.resolve(process.cwd())) {
    this.repoRoot = repoRoot;
  }

  public runPipeline(): boolean {
    console.log('='.repeat(90));
    console.log('🚀 MAGNIOM LOCAL CONTINUOUS INTEGRATION & VERIFICATION PIPELINE v2.0');
    console.log(
      'Governing Specification: public/guides/MAGNIOM-Enterprise Verification, Testing CICD Specification v2.0.md',
    );
    console.log('='.repeat(90) + '\n');

    const totalStart = Date.now();
    let passedCount = 0;

    for (const stage of STAGES) {
      console.log(`\n▶️ [STAGE ${stage.stageNumber}/10]: ${stage.name}`);
      console.log(`   Command:     ${stage.command}`);
      console.log(`   Description: ${stage.description}`);

      const stageStart = Date.now();
      try {
        execSync(stage.command, {
          cwd: this.repoRoot,
          stdio: 'inherit',
          env: { ...process.env, CI: 'true' },
        });
        const durationSec = ((Date.now() - stageStart) / 1000).toFixed(2);
        console.log(`✅ [STAGE ${stage.stageNumber} PASSED] (${durationSec}s)`);
        passedCount++;
      } catch {
        const durationSec = ((Date.now() - stageStart) / 1000).toFixed(2);
        console.error(`\n❌ [STAGE ${stage.stageNumber} FAILED] after ${durationSec}s!`);
        console.error(`Command failed: ${stage.command}`);
        return false;
      }
    }

    const totalDurationSec = ((Date.now() - totalStart) / 1000).toFixed(2);
    console.log('\n' + '='.repeat(90));
    console.log(
      `🎉 ALL ${passedCount}/10 LOCAL CI STAGES PASSED SUCCESSFULLY (${totalDurationSec}s)`,
    );
    console.log(
      '100% CONFORMANCE WITH ENTERPRISE VERIFICATION, TESTING & CI/CD SPECIFICATION v2.0',
    );
    console.log('='.repeat(90) + '\n');

    return true;
  }
}

if (process.argv[1]?.endsWith('run-full-local-ci.ts')) {
  const runner = new LocalContinuousIntegrationRunner();
  const ok = runner.runPipeline();
  if (!ok) process.exit(1);
}
