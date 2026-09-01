-- 002_schemas.sql
-- Dedicated schema segregation for Magniom
-- Conforms to Section 4 of MAGNIOM-Supabase Database & Security Specification v1.0

CREATE SCHEMA IF NOT EXISTS identity;
CREATE SCHEMA IF NOT EXISTS clinical;
CREATE SCHEMA IF NOT EXISTS phenotype;
CREATE SCHEMA IF NOT EXISTS imaging;
CREATE SCHEMA IF NOT EXISTS connectomics;
CREATE SCHEMA IF NOT EXISTS evidence;
CREATE SCHEMA IF NOT EXISTS targeting;
CREATE SCHEMA IF NOT EXISTS treatment_outcomes;
CREATE SCHEMA IF NOT EXISTS workflow;
CREATE SCHEMA IF NOT EXISTS audit;
CREATE SCHEMA IF NOT EXISTS jobs;
