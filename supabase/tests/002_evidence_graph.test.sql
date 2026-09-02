-- 002_evidence_graph.test.sql
-- Comprehensive pgTAP test suite for Sprint 4 (Evidence Knowledge Graph)
-- Verifies migrations 018-023, versioned scientific tables, release memberships, immutability, and graph functions

BEGIN;
SELECT plan(28);

-- 1. Schema & Table Existence Tests
SELECT has_schema('evidence', 'evidence schema exists');

SELECT has_table('evidence', 'sources', 'evidence.sources exists');
SELECT has_table('evidence', 'claim_series', 'evidence.claim_series exists');
SELECT has_table('evidence', 'claim_versions', 'evidence.claim_versions exists');
SELECT has_table('evidence', 'claim_sources', 'evidence.claim_sources exists');

SELECT has_table('evidence', 'circuit_series', 'evidence.circuit_series exists');
SELECT has_table('evidence', 'circuit_versions', 'evidence.circuit_versions exists');
SELECT has_table('evidence', 'circuit_claims', 'evidence.circuit_claims exists');

SELECT has_table('evidence', 'target_family_series', 'evidence.target_family_series exists');
SELECT has_table('evidence', 'target_family_versions', 'evidence.target_family_versions exists');
SELECT has_table('evidence', 'target_family_circuits', 'evidence.target_family_circuits exists');

SELECT has_table('evidence', 'search_spaces', 'evidence.search_spaces exists');
SELECT has_table('evidence', 'target_definitions', 'evidence.target_definitions exists');

SELECT has_table('evidence', 'library_releases', 'evidence.library_releases exists');
SELECT has_table('evidence', 'library_claims', 'evidence.library_claims exists');
SELECT has_table('evidence', 'library_circuits', 'evidence.library_circuits exists');
SELECT has_table('evidence', 'library_target_families', 'evidence.library_target_families exists');

-- 2. View and Function Existence
SELECT has_view('evidence', 'v_active_graph', 'evidence.v_active_graph view exists');
SELECT has_function('evidence', 'get_evidence_ceiling', ARRAY['text'], 'evidence.get_evidence_ceiling function exists');
SELECT has_function('evidence', 'get_evidence_path', ARRAY['text'], 'evidence.get_evidence_path function exists');
SELECT has_function('api', 'export_evidence_release', ARRAY['text'], 'api.export_evidence_release function exists');

-- 3. Invariant & Trigger Tests
SELECT is(
  (SELECT count(*)::int FROM evidence.sources WHERE publication_year >= 2000),
  20,
  'All 20 canonical sources (S001-S020) are seeded'
);

SELECT is(
  (SELECT count(*)::int FROM evidence.claim_series),
  10,
  'All 10 canonical claim series are seeded'
);

SELECT is(
  (SELECT count(*)::int FROM evidence.circuit_series),
  8,
  'All 8 canonical circuit series are seeded'
);

SELECT is(
  (SELECT count(*)::int FROM evidence.target_family_series),
  9,
  'All 9 canonical target family series are seeded'
);

SELECT is(
  (SELECT status FROM evidence.library_releases WHERE version = 'MAGNIOM-EVIDENCE-1.0.0'),
  'active',
  'Evidence release MAGNIOM-EVIDENCE-1.0.0 is active'
);

SELECT is(
  (evidence.get_evidence_ceiling('TF-MDD-LDLPFC-EST-001'))::text,
  'T1',
  'Evidence ceiling for TF-MDD-LDLPFC-EST-001 resolves to T1'
);

SELECT is(
  (evidence.get_evidence_ceiling('TF-RES-CING-L8AV-001'))::text,
  'T4',
  'Evidence ceiling for research family TF-RES-CING-L8AV-001 resolves to T4'
);

SELECT * FROM finish();
ROLLBACK;
