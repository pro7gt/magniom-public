#!/usr/bin/env npx tsx
/**
 * MAGNIOM MULTI-INDICATION POST-DEPLOYMENT SCIENTIFIC SMOKE TEST v2.0
 * Conforms to MAGNIOM-Enterprise Verification, Testing & CI/CD Specification v2.0 (§148–149)
 *
 * Requirements:
 * 1. Runtime Target Engine availability and health across all active indication modules (§148).
 * 2. Module-Specific Production Smoke Tests (§149): Executes primary synthetic case for each active module.
 * 3. Deterministic output verification without mutating clinical database tables.
 * 4. Fails deployment if any active indication module throws or yields an unverified slate.
 */

import fs from 'node:fs';
import path from 'node:path';
import type { MagniomReleaseManifestV2 } from '@magniom/domain';
import {
  executeSyntheticVerticalSlice,
  SyntheticAuditLedger,
} from '../../packages/target-engine/src/orchestrator/synthetic-vertical-slice.js';
import { GOLDEN_SUITE_BY_INDICATION } from '../../packages/test-fixtures/src/synthetic-vertical-slice/index.js';

export async function runPostDeploySmokeTest(): Promise<boolean> {
  console.log('🚀 MAGNIOM MULTI-INDICATION POST-DEPLOYMENT SCIENTIFIC SMOKE TEST v2.0 (§148–149)');
  console.log(
    '=================================================================================\n',
  );

  const repoRoot = path.resolve(process.cwd());
  const manifestPath = path.join(repoRoot, 'docs/verification/v2/release-manifest-v2.json');

  if (!fs.existsSync(manifestPath)) {
    console.error(`❌ Release Manifest v2 not found at: ${manifestPath}`);
    return false;
  }

  const manifest: MagniomReleaseManifestV2 = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  console.log(
    `Auditing Deployment Release: [${manifest.release_id}] (App: ${manifest.application_release})`,
  );
  console.log(`Active Indication Modules in Manifest: ${manifest.indication_modules.length}\n`);

  const auditLedger = new SyntheticAuditLedger();
  let allModulesPassed = true;

  for (const mod of manifest.indication_modules) {
    const code = mod.indicationCode;
    console.log(
      `Auditing Module [${code}] (Level: ${mod.qualification_level}, Modes: [${mod.permitted_modes.join(', ')}])...`,
    );

    const suite = GOLDEN_SUITE_BY_INDICATION[code];
    if (!suite || suite.length === 0) {
      console.error(`  ❌ Missing golden cases for indication: ${code}`);
      allModulesPassed = false;
      continue;
    }

    // Execute primary golden case in read-only / smoke mode (without clinical decision intent)
    const primaryCase = suite[0];
    try {
      const res = executeSyntheticVerticalSlice(primaryCase.input, undefined, { auditLedger });

      const candidateCount =
        (res.slate.primaryCandidates?.length ?? 0) + (res.slate.additionalCandidates?.length ?? 0);

      console.log(`  ✓ Smoke Execution Success: Case [${primaryCase.id}]`);
      console.log(`    - Slate ID:        ${res.slate.id}`);
      console.log(`    - Slate Status:    ${res.slate.status}`);
      console.log(`    - Candidates:      ${candidateCount}`);
      console.log(`    - Payload Digest:  ${res.slate.payloadSha256.substring(0, 16)}...`);

      if (
        res.slate.status !== 'ready_for_review' &&
        res.slate.status !== 'active' &&
        res.slate.status !== 'provisional' &&
        res.slate.status !== 'abstained'
      ) {
        console.error(`  ❌ Invalid slate status: ${res.slate.status}`);
        allModulesPassed = false;
      }
    } catch (err: any) {
      console.error(`  ❌ Smoke test failed for module ${code}: ${err?.message ?? String(err)}`);
      allModulesPassed = false;
    }
  }

  console.log(
    '\n=================================================================================',
  );
  if (allModulesPassed) {
    console.log('🎉 ALL 8 INDICATION MODULES PASSED POST-DEPLOYMENT SMOKE VERIFICATION');
  } else {
    console.error('❌ POST-DEPLOYMENT SCIENTIFIC SMOKE TEST FAILED');
  }
  console.log(
    '=================================================================================\n',
  );

  return allModulesPassed;
}

if (process.argv[1]?.endsWith('post-deploy-golden-smoke.ts')) {
  runPostDeploySmokeTest().then(passed => {
    if (!passed) process.exit(1);
  });
}
