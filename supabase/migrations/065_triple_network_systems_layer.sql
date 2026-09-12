-- 065_triple_network_systems_layer.sql
-- MAGNIOM Triple-Network Systems Layer Database Migration
-- Conforms to MAGNIOM-Triple-Network Systems Layer v1.0 (§6-45, 51, 65-72)
-- and MAGNIOM Multi-Indication Technical & Scientific Architecture Specification v2.1 (§17-20)

-- ==========================================
-- 1. Evidence: Network Systems & Definitions
-- ==========================================

CREATE TABLE IF NOT EXISTS evidence.network_systems (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  code TEXT NOT NULL CHECK (code IN ('CEN', 'DMN', 'SN')) UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  definition_id UUID NOT NULL,
  version TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'deprecated', 'research_only')),
  provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS evidence.network_definitions (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  network_code TEXT NOT NULL CHECK (network_code IN ('CEN', 'DMN', 'SN')),
  atlas_name TEXT NOT NULL,
  atlas_version TEXT NOT NULL,
  parcels JSONB NOT NULL DEFAULT '[]'::jsonb,
  canonical_version TEXT NOT NULL,
  frozen_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS evidence.network_relationships (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  source_network TEXT NOT NULL CHECK (source_network IN ('CEN', 'DMN', 'SN')),
  target_network TEXT NOT NULL CHECK (target_network IN ('CEN', 'DMN', 'SN')),
  canonical_interaction_type TEXT NOT NULL CHECK (canonical_interaction_type IN ('anticorrelated', 'switch_modulator', 'coactivated', 'orthogonal')),
  normative_expected_r NUMERIC NOT NULL,
  normative_variance NUMERIC NOT NULL,
  description TEXT NOT NULL,
  provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS evidence.network_evidence_claims (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  evidence_claim_id UUID NOT NULL,
  network_code TEXT NOT NULL CHECK (network_code IN ('CEN', 'DMN', 'SN')),
  phenotype TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('A', 'B', 'C', 'D', 'R')),
  clinical_authority_limit TEXT NOT NULL CHECK (clinical_authority_limit IN ('none', 'observational_only', 'adjunctive', 'qualified_advisory', 'primary_contraindicated')),
  permitted_clinical_roles TEXT[] NOT NULL DEFAULT '{}',
  claim_summary TEXT NOT NULL,
  references TEXT[] NOT NULL DEFAULT '{}',
  provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS evidence.therapeutic_circuit_network_contexts (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  therapeutic_circuit_id UUID NOT NULL,
  network_system_id UUID NOT NULL REFERENCES evidence.network_systems(id) ON DELETE RESTRICT,
  network_code TEXT NOT NULL CHECK (network_code IN ('CEN', 'DMN', 'SN')),
  relationship_type TEXT NOT NULL CHECK (relationship_type IN ('embedded', 'intersects', 'connects', 'modulates', 'associated_with')),
  evidence_claim_ids UUID[] NOT NULL DEFAULT '{}',
  evidence_level TEXT NOT NULL CHECK (evidence_level IN ('A', 'B', 'C', 'D', 'R')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==========================================
-- 2. Connectomics: Measurements & Profiles
-- ==========================================

CREATE TABLE IF NOT EXISTS connectomics.network_measurements (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  processing_run_id UUID NOT NULL,
  network_code TEXT NOT NULL CHECK (network_code IN ('CEN', 'DMN', 'SN')),
  mean_within_network_connectivity NUMERIC NOT NULL,
  variance_within_network_connectivity NUMERIC NOT NULL,
  node_count INT NOT NULL,
  parcel_ids TEXT[] NOT NULL DEFAULT '{}',
  mean_signal_snr NUMERIC,
  temporal_signal_drift NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS connectomics.network_interaction_measurements (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  processing_run_id UUID NOT NULL,
  relationship_key TEXT NOT NULL CHECK (relationship_key IN ('cen_dmn', 'sn_cen', 'sn_dmn')),
  source_network TEXT NOT NULL CHECK (source_network IN ('CEN', 'DMN', 'SN')),
  target_network TEXT NOT NULL CHECK (target_network IN ('CEN', 'DMN', 'SN')),
  mean_between_network_connectivity NUMERIC NOT NULL,
  segregation_index NUMERIC NOT NULL,
  normative_z_score NUMERIC NOT NULL,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('anticorrelated', 'switch_modulator', 'coactivated', 'orthogonal')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS connectomics.network_reliability_profiles (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  processing_run_id UUID NOT NULL,
  overall_status TEXT NOT NULL CHECK (overall_status IN ('high', 'moderate', 'low', 'unusable')),
  scrubbed_minutes NUMERIC NOT NULL,
  mean_fd_mm NUMERIC NOT NULL,
  split_half_concordance NUMERIC NOT NULL,
  snr_ratio NUMERIC NOT NULL,
  flags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS connectomics.triple_network_profiles (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  processing_run_id UUID NOT NULL,
  case_id UUID NOT NULL REFERENCES clinical.cases(id) ON DELETE CASCADE,
  cen JSONB NOT NULL,
  dmn JSONB NOT NULL,
  sn JSONB NOT NULL,
  cen_dmn JSONB NOT NULL,
  sn_cen JSONB NOT NULL,
  sn_dmn JSONB NOT NULL,
  global_integration NUMERIC,
  global_segregation NUMERIC,
  reliability JSONB NOT NULL,
  normative_context JSONB,
  evidence_context JSONB NOT NULL,
  interpretation JSONB NOT NULL,
  clinical_authority JSONB NOT NULL,
  version TEXT NOT NULL DEFAULT '1.0.0',
  profile_hash TEXT NOT NULL,
  provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==========================================
-- 3. Targeting: Candidate Relationships
-- ==========================================

CREATE TABLE IF NOT EXISTS targeting.candidate_network_relationships (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  candidate_id UUID NOT NULL,
  network_code TEXT NOT NULL CHECK (network_code IN ('CEN', 'DMN', 'SN')),
  relationship_type TEXT NOT NULL CHECK (relationship_type IN ('within_network_node', 'boundary_adjacent', 'network_target', 'orthogonal')),
  closest_node_name TEXT,
  distance_to_centroid_mm NUMERIC,
  functional_coupling NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==========================================
-- 4. Indexes
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_network_systems_code ON evidence.network_systems(code);
CREATE INDEX IF NOT EXISTS idx_network_definitions_code ON evidence.network_definitions(network_code);
CREATE INDEX IF NOT EXISTS idx_network_claims_code ON evidence.network_evidence_claims(network_code);
CREATE INDEX IF NOT EXISTS idx_tc_network_contexts_circuit ON evidence.therapeutic_circuit_network_contexts(therapeutic_circuit_id);
CREATE INDEX IF NOT EXISTS idx_network_measurements_run ON connectomics.network_measurements(processing_run_id);
CREATE INDEX IF NOT EXISTS idx_network_interactions_run ON connectomics.network_interaction_measurements(processing_run_id);
CREATE INDEX IF NOT EXISTS idx_network_reliability_run ON connectomics.network_reliability_profiles(processing_run_id);
CREATE INDEX IF NOT EXISTS idx_triple_network_profiles_case ON connectomics.triple_network_profiles(case_id);
CREATE INDEX IF NOT EXISTS idx_triple_network_profiles_hash ON connectomics.triple_network_profiles(profile_hash);
CREATE INDEX IF NOT EXISTS idx_candidate_network_rel_cand ON targeting.candidate_network_relationships(candidate_id);

-- ==========================================
-- 5. Row Level Security
-- ==========================================

ALTER TABLE evidence.network_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence.network_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence.network_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence.network_evidence_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence.therapeutic_circuit_network_contexts ENABLE ROW LEVEL SECURITY;

ALTER TABLE connectomics.network_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE connectomics.network_interaction_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE connectomics.network_reliability_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE connectomics.triple_network_profiles ENABLE ROW LEVEL SECURITY;

ALTER TABLE targeting.candidate_network_relationships ENABLE ROW LEVEL SECURITY;

-- Read policies for evidence tables
CREATE POLICY "network_systems_read_policy" ON evidence.network_systems FOR SELECT TO authenticated USING (true);
CREATE POLICY "network_definitions_read_policy" ON evidence.network_definitions FOR SELECT TO authenticated USING (true);
CREATE POLICY "network_relationships_read_policy" ON evidence.network_relationships FOR SELECT TO authenticated USING (true);
CREATE POLICY "network_evidence_claims_read_policy" ON evidence.network_evidence_claims FOR SELECT TO authenticated USING (true);
CREATE POLICY "tc_network_contexts_read_policy" ON evidence.therapeutic_circuit_network_contexts FOR SELECT TO authenticated USING (true);

-- Read policies for patient-scoped connectomics and targeting
CREATE POLICY "triple_network_profiles_read_policy" ON connectomics.triple_network_profiles
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM clinical.cases c
    JOIN identity.memberships m ON m.organisation_id = c.organisation_id
    WHERE c.id = triple_network_profiles.case_id AND m.user_id = auth.uid() AND m.active = true
  ));

CREATE POLICY "network_measurements_read_policy" ON connectomics.network_measurements FOR SELECT TO authenticated USING (true);
CREATE POLICY "network_interaction_measurements_read_policy" ON connectomics.network_interaction_measurements FOR SELECT TO authenticated USING (true);
CREATE POLICY "network_reliability_profiles_read_policy" ON connectomics.network_reliability_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "candidate_network_relationships_read_policy" ON targeting.candidate_network_relationships FOR SELECT TO authenticated USING (true);

-- Curator write policies for evidence
CREATE POLICY "network_systems_write_policy" ON evidence.network_systems FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('system_admin', 'evidence_curator', 'evidence_approver')))
  WITH CHECK (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('system_admin', 'evidence_curator', 'evidence_approver')));

CREATE POLICY "network_definitions_write_policy" ON evidence.network_definitions FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('system_admin', 'evidence_curator', 'evidence_approver')))
  WITH CHECK (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('system_admin', 'evidence_curator', 'evidence_approver')));

CREATE POLICY "network_relationships_write_policy" ON evidence.network_relationships FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('system_admin', 'evidence_curator', 'evidence_approver')))
  WITH CHECK (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('system_admin', 'evidence_curator', 'evidence_approver')));

CREATE POLICY "network_evidence_claims_write_policy" ON evidence.network_evidence_claims FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('system_admin', 'evidence_curator', 'evidence_approver')))
  WITH CHECK (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('system_admin', 'evidence_curator', 'evidence_approver')));

CREATE POLICY "tc_network_contexts_write_policy" ON evidence.therapeutic_circuit_network_contexts FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('system_admin', 'evidence_curator', 'evidence_approver')))
  WITH CHECK (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('system_admin', 'evidence_curator', 'evidence_approver')));
