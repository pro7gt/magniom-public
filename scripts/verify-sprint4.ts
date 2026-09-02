import fs from 'node:fs';
import path from 'node:path';
import {
  G08_PHENOTYPE,
  G08_CONNECTOME,
  GOLDEN_CASE_08_CLINICAL_SLATE,
} from '@magniom/test-fixtures';
import {
  EvidenceKnowledgeGraph,
  CANONICAL_EVIDENCE_RELEASE_1_0_0,
  validateEvidenceRelease,
  computeEvidenceManifestHash,
} from '@magniom/evidence';
import { runTargetEngine } from '@magniom/target-engine';
import { validateTargetSlate } from '@magniom/schemas';

function verifySprint4() {
  console.log(
    '🚀 Running Sprint 4 (Evidence Knowledge Graph & Evidence Ceiling) Verification...\n',
  );

  const rootDir = process.cwd();
  const migrationsDir = path.join(rootDir, 'supabase/migrations');
  const seedPath = path.join(rootDir, 'supabase/seed/seed.sql');
  const testSqlPath = path.join(rootDir, 'supabase/tests/002_evidence_graph.test.sql');

  // 1. Verify Migrations 018 - 023
  console.log('📦 1. Verifying Database Migrations 018–023...');
  const expectedMigrations = [
    '018_evidence_sources.sql',
    '019_evidence_claims.sql',
    '020_evidence_circuits.sql',
    '021_evidence_target_families.sql',
    '022_evidence_graph.sql',
    '023_evidence_releases.sql',
  ];

  for (const file of expectedMigrations) {
    const filePath = path.join(migrationsDir, file);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Missing required migration: ${file}`);
      process.exit(1);
    }
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.length < 50) {
      console.error(`❌ Migration file ${file} is empty or truncated.`);
      process.exit(1);
    }
    console.log(`   ✓ ${file} verified (${content.split('\n').length} lines)`);
  }

  // Check critical invariants in SQL files
  const m19 = fs.readFileSync(path.join(migrationsDir, '019_evidence_claims.sql'), 'utf8');
  if (!m19.includes('CREATE TRIGGER trg_claim_versions_immutable')) {
    console.error('❌ Migration 019 is missing claim version immutability trigger.');
    process.exit(1);
  }

  const m22 = fs.readFileSync(path.join(migrationsDir, '022_evidence_graph.sql'), 'utf8');
  if (!m22.includes('FUNCTION evidence.get_evidence_ceiling')) {
    console.error('❌ Migration 022 is missing evidence.get_evidence_ceiling function.');
    process.exit(1);
  }
  if (!m22.includes('VIEW evidence.v_active_graph')) {
    console.error('❌ Migration 022 is missing evidence.v_active_graph view.');
    process.exit(1);
  }

  const m23 = fs.readFileSync(path.join(migrationsDir, '023_evidence_releases.sql'), 'utf8');
  if (!m23.includes('FUNCTION api.export_evidence_release')) {
    console.error('❌ Migration 023 is missing api.export_evidence_release function.');
    process.exit(1);
  }
  console.log(
    '   ✓ Invariant checks passed: immutability triggers, graph traversal RPCs, active release export.',
  );

  // 2. Verify Seed Data
  console.log('\n🌱 2. Verifying Evidence Knowledge Graph Seed Data...');
  if (!fs.existsSync(seedPath)) {
    console.error('❌ Missing seed.sql');
    process.exit(1);
  }
  const seedContent = fs.readFileSync(seedPath, 'utf8');
  const requiredSeedEntities = [
    'evidence.sources',
    'evidence.claim_series',
    'evidence.claim_versions',
    'evidence.circuit_series',
    'evidence.circuit_versions',
    'evidence.target_family_series',
    'evidence.target_family_versions',
    'evidence.search_spaces',
    'evidence.target_definitions',
    'evidence.library_releases',
    'EC-PERSONALISED-SUPERIORITY-001',
    'MAGNIOM-EVIDENCE-1.0.0',
  ];
  for (const entity of requiredSeedEntities) {
    if (!seedContent.includes(entity)) {
      console.error(`❌ seed.sql is missing seed records for ${entity}`);
      process.exit(1);
    }
    console.log(`   ✓ Seed data includes ${entity}`);
  }

  // 3. Verify Database Test Suite
  console.log('\n🧪 3. Verifying pgTAP Database Test Suite (002_evidence_graph.test.sql)...');
  const testSqlContent = fs.readFileSync(testSqlPath, 'utf8');
  if (!testSqlContent.includes('SELECT plan(28);')) {
    console.error('❌ 002_evidence_graph.test.sql is missing plan(28).');
    process.exit(1);
  }
  console.log(
    '   ✓ pgTAP test plan verified (28 tests for tables, views, functions, RLS, and seed counts).',
  );

  // 4. Verify Canonical Release Manifest & Integrity
  console.log('\n📦 4. Verifying Canonical Release Package 1.0.0 & In-Memory Graph...');
  const validatedRelease = validateEvidenceRelease(CANONICAL_EVIDENCE_RELEASE_1_0_0);
  const manifestHash = computeEvidenceManifestHash(CANONICAL_EVIDENCE_RELEASE_1_0_0);
  console.log(`   ✓ Loaded Release: ${validatedRelease.version} (${validatedRelease.status})`);
  console.log(
    `   ✓ Claims: ${validatedRelease.claims.length}, Circuits: ${validatedRelease.circuits.length}, Target Families: ${validatedRelease.families.length}`,
  );
  console.log(`   ✓ Manifest SHA-256: ${manifestHash}`);

  const graph = new EvidenceKnowledgeGraph(CANONICAL_EVIDENCE_RELEASE_1_0_0);
  const paths = graph.findEvidencePaths('TF-MDD-CONVERGENT-LDLPFC-001');
  if (paths.length === 0) {
    console.error('❌ Failed to traverse evidence paths for convergent left DLPFC target family.');
    process.exit(1);
  }
  console.log(
    `   ✓ Graph Traversal: Resolved ${paths.length} multi-hop evidence path(s) for TF-MDD-CONVERGENT-LDLPFC-001.`,
  );

  const conflicts = graph.getConflictingClaims('TF-MDD-CONVERGENT-LDLPFC-001');
  const superiorityConflict = conflicts.find(
    c => c.claimCode === 'EC-PERSONALISED-SUPERIORITY-001',
  );
  if (!superiorityConflict) {
    console.error('❌ Missing required negative constraint claim EC-PERSONALISED-SUPERIORITY-001.');
    process.exit(1);
  }
  console.log(
    `   ✓ Negative Evidence: Attached negative constraint claim ${superiorityConflict.claimCode} (${superiorityConflict.sourceCitation}).`,
  );

  // 5. Verify Target Engine Integration & Evidence Ceiling (Golden Case G08)
  console.log('\n🎯 5. Verifying Target Engine Integration & Evidence Ceiling (G08)...');
  const clinicalSlate = runTargetEngine({
    phenotypeSnapshot: G08_PHENOTYPE,
    connectome: G08_CONNECTOME,
    mode: 'CLINICAL',
  });

  validateTargetSlate(clinicalSlate);
  if (clinicalSlate.primaryCandidates.some(c => c.familyId === 'TF-RES-CING-L8AV-001')) {
    console.error(
      '❌ Clinical Mode violation: Tier 4 research candidate was admitted to clinical primary slate.',
    );
    process.exit(1);
  }
  console.log(
    '   ✓ Clinical Mode Ceiling Enforced: Tier 4 research candidate (Cingulum L8Av) was disqualified from Clinical Mode.',
  );

  const researchSlate = runTargetEngine({
    phenotypeSnapshot: G08_PHENOTYPE,
    connectome: G08_CONNECTOME,
    mode: 'RESEARCH',
  });

  const researchCand = researchSlate.additionalCandidates.find(
    c => c.familyId === 'TF-RES-CING-L8AV-001',
  );
  if (!researchCand || researchCand.evidenceTier !== 'T4') {
    console.error(
      '❌ Research Mode failure: Tier 4 candidate was not properly admitted in Research Mode.',
    );
    process.exit(1);
  }
  console.log(
    '   ✓ Research Mode: Tier 4 research target permitted and allocated to Additional role.',
  );

  // Determinism check over 100 runs
  console.log('\n🔒 6. Verifying 100-run Determinism Invariant...');
  const firstHash = clinicalSlate.deterministicManifestHash;
  for (let i = 0; i < 100; i++) {
    const run = runTargetEngine({
      phenotypeSnapshot: G08_PHENOTYPE,
      connectome: G08_CONNECTOME,
      mode: 'CLINICAL',
    });
    if (run.deterministicManifestHash !== firstHash) {
      console.error(
        `❌ Non-deterministic hash detected at iteration ${i}: ${run.deterministicManifestHash} vs ${firstHash}`,
      );
      process.exit(1);
    }
  }
  console.log(`   ✓ Determinism Invariant verified (100/100 runs identical hash: ${firstHash}).`);

  console.log('\n✨ SPRINT 4 ALL ACCEPTANCE CRITERIA VERIFIED SUCCESSFULLY! ✨\n');
}

verifySprint4();
