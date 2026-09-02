/**
 * MAGNIOM LOCAL CONTINUOUS INTEGRATION & VERIFICATION RUNNER
 * Aligned with MAGNIOM-Enterprise Verification, Testing & CI/CD Specification v1.0 (Stages 0–10)
 *
 * Runs the full end-to-end 10-Stage verification pipeline locally:
 * Stage 0: PR Policy & Automated Change Classification
 * Stage 1: Static Verification & Deterministic Target Engine Rules
 * Stage 2: Monorepo Unit Tests & Requirements Traceability
 * Stage 3: Property-Based Invariant Verification (fast-check)
 * Stage 4: Database Zero-State Rebuild & 11-Domain RLS Security Matrix
 * Stage 5: Golden Target Engine Suite & Scientific Impact Evaluator
 * Stage 6: Application Integration, Synthetic Workflow Worker & Queue Contracts
 * Stage 7: Presentation, UX View Models & Visual Safety Assertions
 * Stage 8: Security Analysis, CycloneDX 1.5 SBOM, Secret Hygiene & Pentest Readiness
 * Stage 9: Controlled Reproducible Monorepo Build & Sealed Verification Manifest
 * Stage 10: Clinical Release Gate, Recall Indexing & Post-Deploy Smoke Verification
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
    name: 'Stage 0 — PR Policy & Automated Change Classification',
    command: 'tsx scripts/ci/classify-change.ts',
    description: 'Validates change classes (C1–C10) and enforces PR metadata rules.',
  },
  {
    stageNumber: 1,
    name: 'Stage 1 — Static Verification & Target Engine Rules',
    command:
      'npm run verify:boundaries && npm run verify:static-rules && npm run typecheck && npm run format:check',
    description: 'Enforces architectural isolation, Target Engine purity & strict typing.',
  },
  {
    stageNumber: 2,
    name: 'Stage 2 — Unit Tests & Requirements Traceability',
    command: 'npm run verify:requirements && npm test',
    description: 'Executes monorepo unit tests (Vitest) and validates 35 SRS requirements.',
  },
  {
    stageNumber: 3,
    name: 'Stage 3 — Property-Based Invariant Verification',
    command: 'npm run verify:properties',
    description: 'Verifies 8 Target Engine mathematical invariants via fast-check.',
  },
  {
    stageNumber: 4,
    name: 'Stage 4 — Database Zero-State Rebuild & 11-Domain RLS',
    command: 'npm run verify:db:from-zero',
    description: 'Audits 28 sequential migrations and default-deny RLS policies.',
  },
  {
    stageNumber: 5,
    name: 'Stage 5 — Golden Target Engine Suite & Scientific Impact',
    command: 'npm run verify:scientific-impact',
    description: 'Executes Golden Cases (G01–G20) and gates on S0–S4 scientific materiality.',
  },
  {
    stageNumber: 6,
    name: 'Stage 6 — Application Integration & Worker Ingestion',
    command:
      'vitest run services/workflow-worker/tests/synthetic-e2e.test.ts services/workflow-worker/tests/structural-verification.test.ts services/workflow-worker/tests/functional-verification.test.ts',
    description: 'Validates synthetic background workers, DICOM/BIDS ingest & queue contracts.',
  },
  {
    stageNumber: 7,
    name: 'Stage 7 — Presentation & UX Visual Safety Assertions',
    command: 'vitest run packages/presentation/src/presentation.test.ts',
    description:
      'Validates clinician workspace view models, stale warnings & anti-bias safety views.',
  },
  {
    stageNumber: 8,
    name: 'Stage 8 — Security, SBOM, Secrets & Pentest Readiness',
    command:
      'npm run sbom:generate && npm run sbom:verify && npm run security:secrets && npm run security:probe',
    description: 'Generates CycloneDX 1.5 SBOM, scans secret hygiene & runs pentest probes.',
  },
  {
    stageNumber: 9,
    name: 'Stage 9 — Reproducible Build & Sealed Manifest',
    command: 'npm run build && npm run release:manifest',
    description: 'Builds all monorepo workspaces and seals cryptographic release manifest.',
  },
  {
    stageNumber: 10,
    name: 'Stage 10 — Clinical Release Gate & Post-Deploy Smoke',
    command: 'npm run release:affected-cases && npm run postdeploy:smoke',
    description: 'Indexes case recall audit log and executes post-deployment golden smoke test.',
  },
];

async function main() {
  console.log('================================================================================');
  console.log('🚀 MAGNIOM 10-STAGE CONTINUOUS INTEGRATION & VERIFICATION SUITE');
  console.log(
    '   Aligned with MAGNIOM-Enterprise Verification, Testing & CI/CD Specification v1.0',
  );
  console.log('================================================================================\n');

  const startTime = Date.now();
  const stageResults: {
    stage: StageDefinition;
    passed: boolean;
    durationMs: number;
    error?: string;
  }[] = [];

  for (const stage of STAGES) {
    console.log(`--------------------------------------------------------------------------------`);
    console.log(`▶ Running ${stage.name}...`);
    console.log(`  Description: ${stage.description}`);
    console.log(`  Command:     ${stage.command}`);
    console.log(`--------------------------------------------------------------------------------`);

    const stageStart = Date.now();
    try {
      execSync(stage.command, {
        cwd: path.resolve(process.cwd()),
        stdio: 'inherit',
      });
      const durationMs = Date.now() - stageStart;
      stageResults.push({ stage, passed: true, durationMs });
      console.log(`\n✅ ${stage.name} PASSED (${(durationMs / 1000).toFixed(2)}s)\n`);
    } catch (err: any) {
      const durationMs = Date.now() - stageStart;
      stageResults.push({ stage, passed: false, durationMs, error: err.message });
      console.error(`\n❌ ${stage.name} FAILED (${(durationMs / 1000).toFixed(2)}s)\n`);
      console.error(err.message);
      break;
    }
  }

  const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('================================================================================');
  console.log('📊 MAGNIOM 10-STAGE CI/CD EXECUTION SUMMARY');
  console.log('================================================================================');

  let allPassed = true;
  for (const res of stageResults) {
    const status = res.passed ? '✅ PASSED' : '❌ FAILED';
    const timing = `(${(res.durationMs / 1000).toFixed(2)}s)`.padStart(9);
    console.log(
      `[Stage ${res.stage.stageNumber.toString().padStart(2, '0')}] ${res.stage.name.padEnd(55)} ${timing} -> ${status}`,
    );
    if (!res.passed) allPassed = false;
  }

  console.log('================================================================================');
  console.log(`Total Stages Executed: ${stageResults.length}/${STAGES.length}`);
  console.log(`Total Execution Time:  ${totalDuration}s`);
  console.log(
    `Overall CI Pipeline Status: ${allPassed ? '✅ ALL STAGES PASSED (100% COMPLIANT)' : '❌ PIPELINE FAILED'}`,
  );
  console.log('================================================================================\n');

  if (!allPassed) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal CI Execution Error:', err);
  process.exit(1);
});
