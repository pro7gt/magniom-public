-- 038_imaging_and_structural.sql
-- Imaging, Structural Preprocessing, Surfaces, QC Runs, and Artifact Lineage Tables
-- Conforms to MAGNIOM-Supabase Database & Security Specification v1.0 Sections 28-36, 97-109
-- and MAGNIOM-Neuroimaging & Functional Connectomics Pipeline Specification v1.0

-- ==========================================
-- 1. Ensure Required Schemas Exist
-- ==========================================
CREATE SCHEMA IF NOT EXISTS imaging;
CREATE SCHEMA IF NOT EXISTS connectomics;
CREATE SCHEMA IF NOT EXISTS system;

-- ==========================================
-- 2. System Reference Tables
-- ==========================================

-- Pipeline Versions (Section 33)
CREATE TABLE IF NOT EXISTS system.pipeline_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_type TEXT NOT NULL,
  semantic_version TEXT NOT NULL,
  container_digest TEXT,
  configuration_sha256 BYTEA,
  status system.lifecycle_status NOT NULL DEFAULT 'ACTIVE',
  released_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (pipeline_type, semantic_version)
);

-- Atlases (Section 34)
CREATE TABLE IF NOT EXISTS system.atlases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,
  version TEXT NOT NULL,
  coordinate_space TEXT NOT NULL,
  artifact_id UUID,
  status system.lifecycle_status NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (code, version)
);

-- ==========================================
-- 3. Imaging Types & Tables
-- ==========================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON t.typnamespace = n.oid WHERE t.typname = 'study_status' AND n.nspname = 'imaging') THEN
    CREATE TYPE imaging.study_status AS ENUM (
      'uploaded',
      'validated',
      'processing',
      'qc_pass',
      'qc_conditional',
      'qc_fail',
      'superseded'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON t.typnamespace = n.oid WHERE t.typname = 'series_type' AND n.nspname = 'imaging') THEN
    CREATE TYPE imaging.series_type AS ENUM (
      'T1w',
      'rest_bold',
      'fieldmap',
      'dwi',
      'other'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON t.typnamespace = n.oid WHERE t.typname = 'run_status' AND n.nspname = 'connectomics') THEN
    CREATE TYPE connectomics.run_status AS ENUM (
      'queued',
      'running',
      'succeeded',
      'failed',
      'superseded'
    );
  END IF;
END $$;

-- Imaging Studies (Section 28)
CREATE TABLE IF NOT EXISTS imaging.studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL,
  case_id UUID NOT NULL REFERENCES clinical.cases(id) ON DELETE CASCADE,
  study_uid TEXT,
  scanner_field_strength_t NUMERIC,
  acquired_at TIMESTAMPTZ,
  status imaging.study_status NOT NULL DEFAULT 'uploaded',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- MRI Series (Section 29)
CREATE TABLE IF NOT EXISTS imaging.series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL,
  imaging_study_id UUID NOT NULL REFERENCES imaging.studies(id) ON DELETE CASCADE,
  series_type imaging.series_type NOT NULL,
  series_uid TEXT,
  run_number INTEGER,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Artifact Registry (Section 30)
CREATE TABLE IF NOT EXISTS imaging.artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL,
  case_id UUID NOT NULL REFERENCES clinical.cases(id) ON DELETE CASCADE,
  imaging_study_id UUID REFERENCES imaging.studies(id) ON DELETE SET NULL,
  artifact_type TEXT NOT NULL,
  bucket TEXT NOT NULL,
  object_path TEXT NOT NULL,
  mime_type TEXT,
  sha256 BYTEA NOT NULL,
  size_bytes BIGINT,
  immutable BOOLEAN NOT NULL DEFAULT true,
  processing_run_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_artifacts_bucket_path UNIQUE (bucket, object_path),
  CONSTRAINT uq_artifacts_sha256_type_case UNIQUE (sha256, artifact_type, case_id)
);

-- Artifact Lineage (Section 31)
CREATE TABLE IF NOT EXISTS imaging.artifact_lineage (
  parent_artifact_id UUID NOT NULL REFERENCES imaging.artifacts(id) ON DELETE RESTRICT,
  child_artifact_id UUID NOT NULL REFERENCES imaging.artifacts(id) ON DELETE RESTRICT,
  relationship TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (parent_artifact_id, child_artifact_id)
);

-- Imaging QC Runs (Section 32)
CREATE TABLE IF NOT EXISTS imaging.qc_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL,
  imaging_study_id UUID NOT NULL REFERENCES imaging.studies(id) ON DELETE CASCADE,
  pipeline_version_id UUID NOT NULL REFERENCES system.pipeline_versions(id),
  status TEXT NOT NULL CHECK (status IN ('pass', 'conditional', 'fail')),
  usable_rest_minutes NUMERIC,
  mean_fd_mm NUMERIC,
  censored_fraction NUMERIC,
  registration_quality system.qualitative_confidence,
  segmentation_quality system.qualitative_confidence,
  parcel_coverage_quality system.qualitative_confidence,
  metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  warnings JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Connectomics Processing Runs (Section 36)
CREATE TABLE IF NOT EXISTS connectomics.processing_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL,
  case_id UUID NOT NULL REFERENCES clinical.cases(id) ON DELETE CASCADE,
  imaging_study_id UUID NOT NULL REFERENCES imaging.studies(id) ON DELETE CASCADE,
  pipeline_version_id UUID NOT NULL REFERENCES system.pipeline_versions(id),
  atlas_id UUID NOT NULL REFERENCES system.atlases(id),
  normative_model_id UUID,
  status connectomics.run_status NOT NULL DEFAULT 'queued',
  input_manifest JSONB NOT NULL DEFAULT '{}'::jsonb,
  input_manifest_sha256 BYTEA NOT NULL,
  output_manifest JSONB,
  output_manifest_sha256 BYTEA,
  mode TEXT NOT NULL DEFAULT 'RESEARCH' CHECK (mode IN ('CLINICAL', 'RESEARCH', 'VALIDATION')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Foreign Key Back-reference from imaging.artifacts.processing_run_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_artifacts_processing_run'
  ) THEN
    ALTER TABLE imaging.artifacts
      ADD CONSTRAINT fk_artifacts_processing_run
      FOREIGN KEY (processing_run_id)
      REFERENCES connectomics.processing_runs(id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- ==========================================
-- 4. Enable Row Level Security (RLS)
-- ==========================================

ALTER TABLE imaging.studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE imaging.series ENABLE ROW LEVEL SECURITY;
ALTER TABLE imaging.artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE imaging.artifact_lineage ENABLE ROW LEVEL SECURITY;
ALTER TABLE imaging.qc_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE connectomics.processing_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system.pipeline_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE system.atlases ENABLE ROW LEVEL SECURITY;

-- Tenant Isolation Policies for Imaging & Connectomics
DO $$
BEGIN
  -- imaging.studies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'studies' AND schemaname = 'imaging' AND policyname = 'tenant_isolation_studies') THEN
    CREATE POLICY tenant_isolation_studies ON imaging.studies
      FOR ALL
      USING (organisation_id = security.current_org_id())
      WITH CHECK (organisation_id = security.current_org_id());
  END IF;

  -- imaging.series
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'series' AND schemaname = 'imaging' AND policyname = 'tenant_isolation_series') THEN
    CREATE POLICY tenant_isolation_series ON imaging.series
      FOR ALL
      USING (organisation_id = security.current_org_id())
      WITH CHECK (organisation_id = security.current_org_id());
  END IF;

  -- imaging.artifacts
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'artifacts' AND schemaname = 'imaging' AND policyname = 'tenant_isolation_artifacts') THEN
    CREATE POLICY tenant_isolation_artifacts ON imaging.artifacts
      FOR ALL
      USING (organisation_id = security.current_org_id())
      WITH CHECK (organisation_id = security.current_org_id());
  END IF;

  -- imaging.artifact_lineage (via parent artifact tenant check)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'artifact_lineage' AND schemaname = 'imaging' AND policyname = 'tenant_isolation_artifact_lineage') THEN
    CREATE POLICY tenant_isolation_artifact_lineage ON imaging.artifact_lineage
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM imaging.artifacts a
          WHERE a.id = imaging.artifact_lineage.parent_artifact_id
            AND a.organisation_id = security.current_org_id()
        )
      );
  END IF;

  -- imaging.qc_runs
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'qc_runs' AND schemaname = 'imaging' AND policyname = 'tenant_isolation_qc_runs') THEN
    CREATE POLICY tenant_isolation_qc_runs ON imaging.qc_runs
      FOR ALL
      USING (organisation_id = security.current_org_id())
      WITH CHECK (organisation_id = security.current_org_id());
  END IF;

  -- connectomics.processing_runs
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'processing_runs' AND schemaname = 'connectomics' AND policyname = 'tenant_isolation_processing_runs') THEN
    CREATE POLICY tenant_isolation_processing_runs ON connectomics.processing_runs
      FOR ALL
      USING (organisation_id = security.current_org_id())
      WITH CHECK (organisation_id = security.current_org_id());
  END IF;

  -- system tables (Read-only for all authenticated users)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pipeline_versions' AND schemaname = 'system' AND policyname = 'read_pipeline_versions') THEN
    CREATE POLICY read_pipeline_versions ON system.pipeline_versions
      FOR SELECT
      USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'atlases' AND schemaname = 'system' AND policyname = 'read_atlases') THEN
    CREATE POLICY read_atlases ON system.atlases
      FOR SELECT
      USING (true);
  END IF;
END $$;

-- ==========================================
-- 5. Immutability Triggers
-- ==========================================

CREATE OR REPLACE FUNCTION imaging.prevent_artifact_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.immutable = true THEN
    RAISE EXCEPTION 'CANNOT_MUTATE_IMMUTABLE_ARTIFACT: Artifact % is immutable.', OLD.id;
  END IF;
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_prevent_artifact_mutation'
  ) THEN
    CREATE TRIGGER trg_prevent_artifact_mutation
      BEFORE UPDATE OR DELETE ON imaging.artifacts
      FOR EACH ROW
      EXECUTE FUNCTION imaging.prevent_artifact_mutation();
  END IF;
END $$;

-- Seed Default Pipeline Version & Atlas
INSERT INTO system.pipeline_versions (id, pipeline_type, semantic_version, status, released_at)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'neurocompute', '1.0.0', 'ACTIVE', now())
ON CONFLICT (pipeline_type, semantic_version) DO NOTHING;

INSERT INTO system.atlases (id, code, version, coordinate_space, status)
VALUES
  ('b0000000-0000-0000-0000-000000000001', 'HCP-MMP1.0', '1.0', 'fsLR_32k', 'ACTIVE')
ON CONFLICT (code, version) DO NOTHING;
