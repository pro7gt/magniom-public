-- 043_indication_modules.sql
-- Step 1 in Section 18: Indication Modules and Indication Module Releases
-- Conforms to MAGNIOM-Canonical Multi-Indication Data Specification v2.0 (§11-15)

CREATE SCHEMA IF NOT EXISTS clinical;

CREATE TABLE IF NOT EXISTS clinical.indication_modules (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS clinical.indication_module_releases (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  module_id UUID NOT NULL REFERENCES clinical.indication_modules(id) ON DELETE RESTRICT,
  code TEXT NOT NULL,
  semantic_version TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  indication_concept_id TEXT NOT NULL,
  indication_label TEXT NOT NULL,
  lifecycle_status TEXT NOT NULL CHECK (lifecycle_status IN ('draft', 'validation', 'active', 'superseded', 'withdrawn', 'archived')),
  module_status TEXT NOT NULL CHECK (module_status IN ('research_only', 'evidence_staging', 'validation_candidate', 'retrospective_validation', 'silent_prospective', 'clinical_release_candidate', 'clinical_active')),
  qualification_level TEXT NOT NULL CHECK (qualification_level IN ('Q0', 'Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8')),
  permitted_modes TEXT[] NOT NULL,
  intended_population JSONB NOT NULL DEFAULT '{}'::jsonb,
  excluded_populations JSONB NOT NULL DEFAULT '[]'::jsonb,
  phenotype_schema_version_id TEXT NOT NULL,
  clinical_objective_definition_ids TEXT[] NOT NULL DEFAULT '{}',
  disease_stage_definition_ids TEXT[] DEFAULT '{}',
  evidence_scope_id TEXT NOT NULL,
  permitted_target_family_ids TEXT[] NOT NULL,
  permitted_candidate_generation_method_ids TEXT[] NOT NULL,
  measurement_requirements JSONB NOT NULL DEFAULT '[]'::jsonb,
  reliability_policy_refs TEXT[] NOT NULL DEFAULT '{}',
  permitted_target_geometry_types TEXT[] NOT NULL,
  treatment_context_requirement_ids TEXT[] DEFAULT '{}',
  device_requirements JSONB DEFAULT '[]'::jsonb,
  scientific_policy_compatibility_refs TEXT[] NOT NULL DEFAULT '{}',
  known_limitations JSONB NOT NULL DEFAULT '[]'::jsonb,
  validation_evidence_ids TEXT[] NOT NULL DEFAULT '{}',
  payload_sha256 BYTEA NOT NULL,
  manifest_sha256 BYTEA NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  released_at TIMESTAMPTZ,
  supersedes_release_id UUID REFERENCES clinical.indication_module_releases(id) ON DELETE SET NULL,
  provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (code, semantic_version)
);

-- Immutability enforcement trigger for released indication modules
CREATE OR REPLACE FUNCTION clinical.prevent_indication_module_release_mutation()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.lifecycle_status IN ('active', 'superseded', 'archived')) THEN
    RAISE EXCEPTION 'IndicationModuleRelease is immutable once active or superseded. Create a new semantic version.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_indication_module_releases_immutable ON clinical.indication_module_releases;
CREATE TRIGGER trg_indication_module_releases_immutable
  BEFORE UPDATE ON clinical.indication_module_releases
  FOR EACH ROW EXECUTE FUNCTION clinical.prevent_indication_module_release_mutation();

-- Enable Row Level Security
ALTER TABLE clinical.indication_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical.indication_module_releases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "indication_modules_read_policy" ON clinical.indication_modules
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "indication_module_releases_read_policy" ON clinical.indication_module_releases
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "indication_modules_write_policy" ON clinical.indication_modules
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('system_admin', 'evidence_curator', 'evidence_approver')))
  WITH CHECK (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('system_admin', 'evidence_curator', 'evidence_approver')));

CREATE POLICY "indication_module_releases_write_policy" ON clinical.indication_module_releases
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('system_admin', 'evidence_curator', 'evidence_approver')))
  WITH CHECK (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('system_admin', 'evidence_curator', 'evidence_approver')));
