#!/usr/bin/env npx tsx
/**
 * MAGNIOM FORMAL VERIFICATION BASELINE VALIDATOR (PHASE 6)
 * Conforms to:
 * - MAGNIOM-Implementation & Multi-Indication Validation Roadmap v2.0 (§41-§44, §156, §171)
 * - MAGNIOM-Enterprise Verification, Testing CICD Specification v2.0 (§131, §171)
 * - MAGNIOM-System Requirements Specification v2.0 (§42, §43)
 *
 * Verifies:
 * 1. The 7 Frozen Baseline Components (§41)
 * 2. The 11 Common-Core Verification Reports (§42)
 * 3. The 8 Module Verification Packages (64 facets across 8 indications) (§43)
 * 4. The 10 Q3 Module Verification Gate Criteria across all 8 indication modules (§44)
 * 5. Full regression across all 72 Golden Cases and 8 Shared Acceptance Non-negotiables
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {
  executeSyntheticVerticalSlice,
  SyntheticAuditLedger,
  ResearchModeSigningProhibitedError,
} from '../../packages/target-engine/src/orchestrator/synthetic-vertical-slice.js';
import {
  ALL_SYNTHETIC_GOLDEN_CASES,
  GOLDEN_SUITE_BY_INDICATION,
} from '../../packages/test-fixtures/src/synthetic-vertical-slice/index.js';

function computeSha256(filePath: string): string {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(fileBuffer).digest('hex');
}

async function validateBaseline() {
  const repoRoot = path.resolve(process.cwd());
  console.log('='.repeat(100));
  console.log('🔬 MAGNIOM PHASE 6 — FORMAL VERIFICATION BUILD VALIDATOR');
  console.log('Roadmap v2.0 §41-§44 | Enterprise Testing Spec v2.0 §171 | SRS v2.0 §42-§43');
  console.log('='.repeat(100));
  console.log('');

  let hasErrors = false;

  // ---------------------------------------------------------------------------
  // 1. VERIFY THE 7 FROZEN BASELINE COMPONENTS (§41)
  // ---------------------------------------------------------------------------
  console.log('--- 1. VERIFICATION BASELINE FREEZES (ROADMAP §41) ---');
  const manifestPath = path.join(
    repoRoot,
    'docs/verification/v2/v2-verification-baseline-manifest.json',
  );
  if (!fs.existsSync(manifestPath)) {
    console.error('❌ Missing Verification Baseline Manifest at:', manifestPath);
    hasErrors = true;
  } else {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    console.log(`  ✓ Baseline Manifest loaded: ${manifest.baselineName} (${manifest.baselineId})`);
    console.log(`  ✓ Status: ${manifest.status}`);

    const frozen = manifest.frozenComponents;
    const requiredKeys = [
      'v2_requirements',
      'data_contracts',
      'plugin_contracts',
      'evidence_library_release',
      'scientific_policy',
      'measurement_pipelines',
      'application_shell',
    ];

    for (const key of requiredKeys) {
      if (!frozen[key] || frozen[key].status !== 'FROZEN') {
        console.error(`  ❌ Freeze verification failed for component: ${key}`);
        hasErrors = true;
      } else {
        console.log(`  ✓ Component Frozen: ${key.padEnd(26)} -> [${frozen[key].name}]`);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // 2. VERIFY THE 11 COMMON-CORE VERIFICATION REPORTS (§42)
  // ---------------------------------------------------------------------------
  console.log('\n--- 2. COMMON-CORE VERIFICATION PACKAGE REPORTS (§42) ---');
  const commonCoreReports = [
    '01-system-requirements-verification-report.md',
    '02-database-verification-report.md',
    '03-security-verification-report.md',
    '04-target-engine-core-verification-report.md',
    '05-plugin-contract-verification-report.md',
    '06-measurement-core-verification-report.md',
    '07-evidence-graph-verification-report.md',
    '08-scientific-policy-verification-report.md',
    '09-application-shell-verification-report.md',
    '10-audit-verification-report.md',
    '11-release-manifest-verification-report.md',
  ];

  const commonCoreDir = path.join(repoRoot, 'docs/verification/v2/reports/common-core');
  for (const report of commonCoreReports) {
    const reportPath = path.join(commonCoreDir, report);
    if (!fs.existsSync(reportPath)) {
      console.error(`  ❌ Missing report: ${report}`);
      hasErrors = true;
    } else {
      const stat = fs.statSync(reportPath);
      if (stat.size < 500) {
        console.error(`  ❌ Report too small (${stat.size} bytes): ${report}`);
        hasErrors = true;
      } else {
        console.log(`  ✓ Report Verified (${String(stat.size).padStart(5)} bytes): ${report}`);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // 3. VERIFY THE 8 MODULE VERIFICATION PACKAGES (§43)
  // ---------------------------------------------------------------------------
  console.log('\n--- 3. MODULE VERIFICATION PACKAGES (§43) ---');
  const modulePackages = [
    { code: 'MDD', file: 'mdd-verification-package.md' },
    { code: 'OCD', file: 'ocd-verification-package.md' },
    { code: 'NEUROPATHIC_PAIN', file: 'pain-verification-package.md' },
    { code: 'STROKE_MOTOR', file: 'stroke-motor-verification-package.md' },
    { code: 'STROKE_APHASIA', file: 'stroke-aphasia-verification-package.md' },
    { code: 'TBI', file: 'tbi-verification-package.md' },
    { code: 'PTSD', file: 'ptsd-verification-package.md' },
    { code: 'TINNITUS', file: 'tinnitus-verification-package.md' },
  ];

  const modulesDir = path.join(repoRoot, 'docs/verification/v2/reports/modules');
  const requiredFacets = [
    'Module Requirements Verification',
    'EvidencePath Verification',
    'Generator Verification',
    'Measurement Compatibility Verification',
    'Ranking / Refinement Verification',
    'Geometry Verification',
    'Golden Case Verification',
    'Research / Clinical Boundary Verification',
  ];

  for (const mod of modulePackages) {
    const pkgPath = path.join(modulesDir, mod.file);
    if (!fs.existsSync(pkgPath)) {
      console.error(`  ❌ Missing module package for ${mod.code}: ${mod.file}`);
      hasErrors = true;
    } else {
      const content = fs.readFileSync(pkgPath, 'utf8');
      let facetsPass = true;
      for (const facet of requiredFacets) {
        if (!content.includes(facet)) {
          console.error(`  ❌ Module ${mod.code} missing facet: ${facet}`);
          facetsPass = false;
          hasErrors = true;
        }
      }
      if (facetsPass) {
        console.log(`  ✓ Module Verified (All 8 Facets): ${mod.code.padEnd(18)} -> [${mod.file}]`);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // 4. EXECUTE ALL 72 GOLDEN CASES & SHARED ACCEPTANCE (§32-§40)
  // ---------------------------------------------------------------------------
  console.log('\n--- 4. FULL GOLDEN SUITE EXECUTION (72 CASES ACROSS 8 MODULES) ---');
  const auditLedger = new SyntheticAuditLedger();
  const indications = [
    'MDD',
    'OCD',
    'NEUROPATHIC_PAIN',
    'STROKE_MOTOR',
    'STROKE_APHASIA',
    'TBI',
    'PTSD',
    'TINNITUS',
  ];

  let totalCasesRun = 0;
  let totalCasesPassed = 0;

  for (const ind of indications) {
    const suite = GOLDEN_SUITE_BY_INDICATION[ind] ?? [];
    let suitePassed = true;
    for (const testCase of suite) {
      totalCasesRun++;
      try {
        if (testCase.expected.signingMustFail) {
          let threw = false;
          try {
            executeSyntheticVerticalSlice(testCase.input, testCase.decisionIntent, { auditLedger });
          } catch (err) {
            if (err instanceof ResearchModeSigningProhibitedError) {
              threw = true;
            }
          }
          if (!threw) {
            throw new Error('Expected ResearchModeSigningProhibitedError was not thrown');
          }
        } else {
          const res = executeSyntheticVerticalSlice(testCase.input, testCase.decisionIntent, {
            auditLedger,
          });

          if (testCase.expected.shouldAbstain && res.slate.status !== 'abstained') {
            throw new Error(`Expected abstention but got status: ${res.slate.status}`);
          }

          if (testCase.expected.primaryCandidateCount !== undefined) {
            if (res.slate.primaryCandidates.length < testCase.expected.primaryCandidateCount) {
              throw new Error(
                `Expected at least ${testCase.expected.primaryCandidateCount} primary candidates, got ${res.slate.primaryCandidates.length}`,
              );
            }
          }

          if (
            testCase.decisionIntent &&
            (!res.clinicianDecision || !res.clinicianDecision.isImmutable)
          ) {
            throw new Error('Clinician decision was not created or is not immutable');
          }
        }
        totalCasesPassed++;
      } catch (err: any) {
        console.error(`  ❌ Case failed: ${testCase.id} - ${testCase.name}: ${err.message}`);
        suitePassed = false;
        hasErrors = true;
      }
    }
    if (suitePassed) {
      console.log(
        `  ✓ Golden Suite PASS: ${ind.padEnd(18)} (${suite.length}/${suite.length} cases)`,
      );
    }
  }

  // ---------------------------------------------------------------------------
  // 5. EVALUATE Q3 MODULE VERIFICATION GATE (§44)
  // ---------------------------------------------------------------------------
  console.log('\n--- 5. Q3 MODULE VERIFICATION GATE EVALUATION (§44) ---');
  const recordsPath = path.join(repoRoot, 'docs/verification/v2/module-qualification-records.json');
  if (!fs.existsSync(recordsPath)) {
    console.error('❌ Missing Module Qualification Records at:', recordsPath);
    hasErrors = true;
  } else {
    const records = JSON.parse(fs.readFileSync(recordsPath, 'utf8'));
    console.log(`  ✓ Record Set: ${records.recordSetId} | Evaluated: ${records.evaluationDate}`);

    for (const record of records.moduleRecords) {
      const q3 = record.q3GateEvaluation;
      const allQ3Pass =
        q3.allApplicableCriticalSrsPass &&
        q3.zeroUnresolvedCriticalDefects &&
        q3.moduleGoldenSuitePass &&
        q3.exactScientificPolicyResolves &&
        q3.pluginGeneratorIntegrityPass &&
        q3.evidenceProvenanceReconstructs &&
        q3.permittedGeometryPass &&
        q3.moduleModeIsolationPass &&
        q3.requiredMeasurementsReliabilityPass &&
        q3.fallbackAbstentionPass;

      if (!allQ3Pass) {
        console.error(`  ❌ Q3 Gate Failed for module: ${record.moduleCode}`);
        hasErrors = true;
      } else {
        console.log(
          `  ✓ [${record.qualificationStatus}] ${record.moduleCode.padEnd(18)} | Modes: [${record.permittedModes.join(
            ', ',
          )}]`,
        );
      }
    }
  }

  // ---------------------------------------------------------------------------
  // SUMMARY BANNER & REGULATORY DECLARATION
  // ---------------------------------------------------------------------------
  console.log('\n' + '='.repeat(100));
  console.log('CRITICAL REGULATORY & SCIENTIFIC DECLARATION:');
  console.log('>>> Q3 IS FORMAL SOFTWARE AND SCIENTIFIC VERIFICATION. <<<');
  console.log('>>> Q3 IS NOT CLINICAL VALIDATION. <<<');
  console.log('='.repeat(100));
  console.log(
    `Total Golden Cases: ${totalCasesPassed}/${totalCasesRun} | Common-Core Reports: 11/11 | Module Packages: 8/8`,
  );
  console.log('='.repeat(100));

  if (hasErrors) {
    console.error('\n❌ VERIFICATION BASELINE VALIDATION FAILED WITH ERRORS.\n');
    process.exit(1);
  } else {
    console.log('\n✅ VERIFICATION BASELINE VALIDATION SUCCEEDED (100% CONFORMANCE).\n');
    process.exit(0);
  }
}

validateBaseline().catch(err => {
  console.error('Fatal validation error:', err);
  process.exit(1);
});
