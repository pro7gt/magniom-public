-- 054_plugin_generator_manifests.sql
-- Step 12 in Section 18: Plugin and Generator Manifests
-- Conforms to MAGNIOM-Implementation & Multi-Indication Validation Roadmap v2.0 (§22-23)
-- and MAGNIOM-Target Engine & Ranking Algorithm Specification v2.0

CREATE TABLE IF NOT EXISTS system.plugin_manifests (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  plugin_id TEXT NOT NULL,
  name TEXT NOT NULL,
  version TEXT NOT NULL,
  indication_module_code TEXT NOT NULL,
  allowed_modes TEXT[] NOT NULL,
  supported_geometries TEXT[] NOT NULL,
  manifest_sha256 BYTEA NOT NULL,
  provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE (plugin_id, version)
);

CREATE TABLE IF NOT EXISTS system.candidate_generator_manifests (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  generator_id TEXT NOT NULL,
  version TEXT NOT NULL,
  plugin_manifest_id UUID NOT NULL REFERENCES system.plugin_manifests(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  deterministic BOOLEAN NOT NULL DEFAULT true,
  requires_measurements TEXT[] DEFAULT '{}',
  manifest_sha256 BYTEA NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE (generator_id, version)
);

-- Immutability enforcement trigger
CREATE OR REPLACE FUNCTION system.prevent_manifest_mutation()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Software plugin and generator manifests are immutable once registered.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_plugin_manifests_immutable ON system.plugin_manifests;
CREATE TRIGGER trg_plugin_manifests_immutable
  BEFORE UPDATE ON system.plugin_manifests
  FOR EACH ROW EXECUTE FUNCTION system.prevent_manifest_mutation();

DROP TRIGGER IF EXISTS trg_generator_manifests_immutable ON system.candidate_generator_manifests;
CREATE TRIGGER trg_generator_manifests_immutable
  BEFORE UPDATE ON system.candidate_generator_manifests
  FOR EACH ROW EXECUTE FUNCTION system.prevent_manifest_mutation();

-- Enable Row Level Security
ALTER TABLE system.plugin_manifests ENABLE ROW LEVEL SECURITY;
ALTER TABLE system.candidate_generator_manifests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "plugin_manifests_read_policy" ON system.plugin_manifests FOR SELECT TO authenticated USING (true);
CREATE POLICY "generator_manifests_read_policy" ON system.candidate_generator_manifests FOR SELECT TO authenticated USING (true);

CREATE POLICY "plugin_manifests_write_policy" ON system.plugin_manifests
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('system_admin', 'service_worker')))
  WITH CHECK (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('system_admin', 'service_worker')));

CREATE POLICY "generator_manifests_write_policy" ON system.candidate_generator_manifests
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('system_admin', 'service_worker')))
  WITH CHECK (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.active = true AND m.role IN ('system_admin', 'service_worker')));
