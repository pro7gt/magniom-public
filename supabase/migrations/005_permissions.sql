-- 005_permissions.sql
-- Grants and default permissions
-- Conforms to Section 10 of MAGNIOM-Supabase Database & Security Specification v1.0

GRANT USAGE ON SCHEMA identity, clinical, phenotype, targeting, evidence, audit TO authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA identity, clinical, phenotype, targeting, evidence, audit TO service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA identity, clinical, phenotype, targeting, evidence, audit TO authenticated;
