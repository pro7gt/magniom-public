-- 001_database_foundation.test.sql
-- Verification test for foundation schemas and identity tables

BEGIN;
SELECT plan(6);

SELECT has_schema('identity');
SELECT has_schema('clinical');
SELECT has_schema('targeting');
SELECT has_schema('evidence');

SELECT has_table('identity', 'organizations');
SELECT has_table('identity', 'clinicians');

SELECT * FROM finish();
ROLLBACK;
