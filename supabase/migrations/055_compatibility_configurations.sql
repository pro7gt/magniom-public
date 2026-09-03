-- 055_compatibility_configurations.sql
-- Step 13 in Section 18: Scientific Compatibility Configurations
-- Conforms to MAGNIOM-Scientific Policy & Algorithm Configuration Specification v2.0 (§19-21)

CREATE TABLE IF NOT EXISTS system.scientific_compatibility_configurations (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  code TEXT NOT NULL,
  version TEXT NOT NULL,
  scientific_policy_release_id UUID NOT NULL,
  indication_module_release_id UUID NOT NULL
    REFERENCES clinical.indication_module_releases(id) ON DELETE RESTRICT,
  mode TEXT NOT NULL CHECK (mode IN ('clinical', 'research', 'CLINICAL', 'RESEARCH', 'VALIDATION')),
  evidence_library_release_id UUID NOT NULL,
  target_engine_release_id UUID NOT NULL,
  targeting_plugin JSONB NOT NULL,
  candidate_generators JSONB NOT NULL DEFAULT '[]'::jsonb,
  measurement_providers JSONB NOT NULL DEFAULT '[]'::jsonb,
  reliability_methods JSONB NOT NULL DEFAULT '[]'::jsonb,
  phenotype_ontology_release_id UUID NOT NULL,
  atlas_releases JSONB NOT NULL DEFAULT '[]'::jsonb,
  normative_models JSONB NOT NULL DEFAULT '[]'::jsonb,
  efield_engine JSONB,
  device_capability_profiles JSONB NOT NULL DEFAULT '[]'::jsonb,
  acquisition_profiles JSONB NOT NULL DEFAULT '[]'::jsonb,
  compatibility_status TEXT NOT NULL CHECK (compatibility_status IN ('draft', 'validated', 'approved', 'suspended', 'withdrawn')),
  validation_evidence_ids TEXT[] NOT NULL DEFAULT '{}',
  configuration_sha256 BYTEA NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE (code, version)
);

-- Immutability enforcement trigger for approved configurations
CREATE OR REPLACE FUNCTION system.prevent_compatibility_mutation()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.compatibility_status IN ('approved', 'validated')) THEN
    RAISE EXCEPTION 'Approved ScientificCompatibilityConfiguration is immutable. Create a new configuration version.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_compatibility_configurations_immutable ON system.scientific_compatibility_configurations;
CREATE TRIGGER trg_compatibility_configurations_immutable
  BEFORE UPDATE ON system.scientific_compatibility_configurations
  FOR EACH ROW EXECUTE FUNCTION system.prevent_compatibility_mutation();

-- Enable Row Level Security
ALTER TABLE system.scientific_compatibility_configurations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "compatibility_configurations_read_policy" ON system.scientific_compatibility_configurations
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "compatibility_configurations_write_policy" ON system.scientific_compatibility_configurations
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('system_admin', 'evidence_approver')))
  WITH CHECK (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('system_admin', 'evidence_approver')));
