-- 053_module_policy_bindings.sql
-- Step 11 in Section 18: Module-Policy Bindings and Evidence Path Permissions
-- Conforms to MAGNIOM-Scientific Policy & Algorithm Configuration Specification v2.0 (§28-31)

CREATE SCHEMA IF NOT EXISTS policy;

CREATE TABLE IF NOT EXISTS policy.module_policy_bindings (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  scientific_policy_release_id UUID NOT NULL,
  indication_module_release_id UUID NOT NULL
    REFERENCES clinical.indication_module_releases(id) ON DELETE RESTRICT,
  permitted_modes TEXT[] NOT NULL,
  evidence_ceiling_tier TEXT NOT NULL CHECK (evidence_ceiling_tier IN ('A', 'B', 'C', 'D', 'R')),
  refinement_permitted BOOLEAN NOT NULL DEFAULT false,
  efield_permitted BOOLEAN NOT NULL DEFAULT false,
  geometry_types_permitted TEXT[] NOT NULL,
  binding_sha256 BYTEA NOT NULL,
  provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE (scientific_policy_release_id, indication_module_release_id)
);

CREATE TABLE IF NOT EXISTS policy.evidence_path_permissions (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  binding_id UUID NOT NULL REFERENCES policy.module_policy_bindings(id) ON DELETE CASCADE,
  evidence_path_id UUID NOT NULL REFERENCES evidence.evidence_paths(id) ON DELETE CASCADE,
  permitted_modes TEXT[] NOT NULL,
  candidate_roles TEXT[] NOT NULL,
  candidate_generation_method_ids TEXT[] NOT NULL DEFAULT '{}',
  standalone_primary BOOLEAN NOT NULL DEFAULT true,
  standalone_additional BOOLEAN NOT NULL DEFAULT true,
  supporting_context BOOLEAN NOT NULL DEFAULT true,
  limitations JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Immutability enforcement trigger
CREATE OR REPLACE FUNCTION policy.prevent_binding_mutation()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Module-policy bindings are immutable once created. Issue a new policy release.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_module_policy_bindings_immutable ON policy.module_policy_bindings;
CREATE TRIGGER trg_module_policy_bindings_immutable
  BEFORE UPDATE ON policy.module_policy_bindings
  FOR EACH ROW EXECUTE FUNCTION policy.prevent_binding_mutation();

-- Enable Row Level Security
ALTER TABLE policy.module_policy_bindings ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy.evidence_path_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "module_policy_bindings_read_policy" ON policy.module_policy_bindings
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "evidence_path_permissions_read_policy" ON policy.evidence_path_permissions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "module_policy_bindings_write_policy" ON policy.module_policy_bindings
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('system_admin', 'evidence_curator', 'evidence_approver')))
  WITH CHECK (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('system_admin', 'evidence_curator', 'evidence_approver')));

CREATE POLICY "evidence_path_permissions_write_policy" ON policy.evidence_path_permissions
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('system_admin', 'evidence_curator', 'evidence_approver')))
  WITH CHECK (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('system_admin', 'evidence_curator', 'evidence_approver')));
