-- 039_connectomics_and_circuits.sql
-- Connectome FC Metrics, Circuit Measurements, Candidate Regions, and Normative Findings
-- Conforms to MAGNIOM-Supabase Database & Security Specification v1.0 Sections 37-39, 97-109
-- and MAGNIOM-Neuroimaging & Functional Connectomics Pipeline Specification v1.0 Sections 81-94

-- ==========================================
-- 1. Ensure Required Schemas Exist
-- ==========================================
CREATE SCHEMA IF NOT EXISTS connectomics;

-- ==========================================
-- 2. Connectivity Metrics (Section 37)
-- ==========================================
CREATE TABLE IF NOT EXISTS connectomics.connectivity_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL,
  processing_run_id UUID NOT NULL REFERENCES connectomics.processing_runs(id) ON DELETE CASCADE,
  feature_code TEXT NOT NULL,
  source_region_code TEXT,
  target_region_code TEXT,
  metric_type TEXT NOT NULL,
  metric_value DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (processing_run_id, feature_code)
);

-- ==========================================
-- 3. Circuit Metrics (Section 39)
-- ==========================================
CREATE TABLE IF NOT EXISTS connectomics.circuit_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL,
  processing_run_id UUID NOT NULL REFERENCES connectomics.processing_runs(id) ON DELETE CASCADE,
  therapeutic_circuit_version_id UUID,
  candidate_region_code TEXT,
  metric_code TEXT NOT NULL,
  metric_value DOUBLE PRECISION,
  interpretation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==========================================
-- 4. Imaging Candidate Regions (Section 146)
-- ==========================================
CREATE TABLE IF NOT EXISTS connectomics.candidate_regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL,
  processing_run_id UUID NOT NULL REFERENCES connectomics.processing_runs(id) ON DELETE CASCADE,
  candidate_code TEXT NOT NULL,
  target_family_version_id TEXT NOT NULL,
  generation_method TEXT NOT NULL,
  hemisphere TEXT NOT NULL,
  surface_vertex_index INTEGER NOT NULL,
  parcel_name TEXT NOT NULL,
  mni_x DOUBLE PRECISION NOT NULL,
  mni_y DOUBLE PRECISION NOT NULL,
  mni_z DOUBLE PRECISION NOT NULL,
  cluster_area_mm2 DOUBLE PRECISION,
  circuit_concordance_percentile DOUBLE PRECISION,
  accessibility TEXT NOT NULL DEFAULT 'good',
  reliability_score DOUBLE PRECISION,
  fit_interpretation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (processing_run_id, candidate_code)
);

-- ==========================================
-- 5. Normative Findings (Section 38)
-- ==========================================
CREATE TABLE IF NOT EXISTS connectomics.normative_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL,
  processing_run_id UUID NOT NULL REFERENCES connectomics.processing_runs(id) ON DELETE CASCADE,
  feature_code TEXT NOT NULL,
  raw_value DOUBLE PRECISION,
  z_score DOUBLE PRECISION,
  percentile DOUBLE PRECISION,
  direction TEXT CHECK (direction IN ('higher', 'lower')),
  relevance TEXT CHECK (relevance IN ('supportive', 'neutral', 'contradictory', 'uncertain')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (processing_run_id, feature_code)
);

-- ==========================================
-- 6. Enable Row Level Security (RLS)
-- ==========================================
ALTER TABLE connectomics.connectivity_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE connectomics.circuit_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE connectomics.candidate_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE connectomics.normative_findings ENABLE ROW LEVEL SECURITY;

-- Tenant Isolation Policies for Connectomics Tables
DO $$
BEGIN
  -- connectivity_metrics
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'connectivity_metrics' AND schemaname = 'connectomics' AND policyname = 'tenant_isolation_connectivity_metrics') THEN
    CREATE POLICY tenant_isolation_connectivity_metrics ON connectomics.connectivity_metrics
      FOR ALL
      USING (organisation_id = security.current_org_id())
      WITH CHECK (organisation_id = security.current_org_id());
  END IF;

  -- circuit_metrics
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'circuit_metrics' AND schemaname = 'connectomics' AND policyname = 'tenant_isolation_circuit_metrics') THEN
    CREATE POLICY tenant_isolation_circuit_metrics ON connectomics.circuit_metrics
      FOR ALL
      USING (organisation_id = security.current_org_id())
      WITH CHECK (organisation_id = security.current_org_id());
  END IF;

  -- candidate_regions
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'candidate_regions' AND schemaname = 'connectomics' AND policyname = 'tenant_isolation_candidate_regions') THEN
    CREATE POLICY tenant_isolation_candidate_regions ON connectomics.candidate_regions
      FOR ALL
      USING (organisation_id = security.current_org_id())
      WITH CHECK (organisation_id = security.current_org_id());
  END IF;

  -- normative_findings
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'normative_findings' AND schemaname = 'connectomics' AND policyname = 'tenant_isolation_normative_findings') THEN
    CREATE POLICY tenant_isolation_normative_findings ON connectomics.normative_findings
      FOR ALL
      USING (organisation_id = security.current_org_id())
      WITH CHECK (organisation_id = security.current_org_id());
  END IF;
END $$;
