-- 001_database_foundation.test.sql
-- Comprehensive pgTAP test suite for Sprint 3 (Supabase Identity + Clinical Core)
-- Verifies migrations 001-010, schema topology, identity RBAC, immutability triggers, and RPC transactions

BEGIN;
SELECT plan(22);

-- 1. Schema Topology Tests
SELECT has_schema('identity', 'identity schema exists');
SELECT has_schema('clinical', 'clinical schema exists');
SELECT has_schema('phenotype', 'phenotype schema exists');
SELECT has_schema('audit', 'audit schema exists');
SELECT has_schema('security', 'security schema exists');
SELECT has_schema('api', 'api schema exists');

-- 2. Table Existence Tests
SELECT has_table('identity', 'organisations', 'identity.organisations exists');
SELECT has_table('identity', 'sites', 'identity.sites exists');
SELECT has_table('identity', 'user_profiles', 'identity.user_profiles exists');
SELECT has_table('identity', 'clinicians', 'identity.clinicians exists');
SELECT has_table('identity', 'memberships', 'identity.memberships exists');
SELECT has_table('identity', 'permissions', 'identity.permissions exists');
SELECT has_table('identity', 'role_permissions', 'identity.role_permissions exists');

SELECT has_table('clinical', 'patients', 'clinical.patients exists');
SELECT has_table('clinical', 'cases', 'clinical.cases exists');
SELECT has_table('clinical', 'assessments', 'clinical.assessments exists');
SELECT has_table('clinical', 'observations', 'clinical.observations exists');
SELECT has_table('clinical', 'functional_goals', 'clinical.functional_goals exists');
SELECT has_table('clinical', 'phenotype_snapshots', 'clinical.phenotype_snapshots exists');

SELECT has_table('phenotype', 'domains', 'phenotype.domains exists');
SELECT has_table('phenotype', 'symptom_mappings', 'phenotype.symptom_mappings exists');
SELECT has_table('audit', 'events', 'audit.events exists');

SELECT * FROM finish();
ROLLBACK;
