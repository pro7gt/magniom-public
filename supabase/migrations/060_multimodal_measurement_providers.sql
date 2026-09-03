-- 060_multimodal_measurement_providers.sql
-- Conforms to MAGNIOM-Neuroimaging, Neurophysiology & Multimodal Measurement Specification v2.0 (§5-6)
-- Establishes provider registry, capability declarations, and acquisition profiles

CREATE SCHEMA IF NOT EXISTS measurement;

CREATE TABLE IF NOT EXISTS measurement.providers (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  version TEXT NOT NULL,
  supported_modalities TEXT[] NOT NULL,
  container_digest_sha256 BYTEA,
  configuration_sha256 BYTEA NOT NULL,
  offline_resources TEXT[] DEFAULT '{}',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS measurement.provider_capabilities (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  provider_id UUID NOT NULL REFERENCES measurement.providers(id) ON DELETE CASCADE,
  capability_code TEXT NOT NULL,
  description TEXT NOT NULL,
  supported_modalities TEXT[] NOT NULL,
  default_qualification TEXT NOT NULL CHECK (default_qualification IN ('qualified', 'qualified_with_limits', 'not_qualified', 'research_only', 'not_assessable')),
  requires_indication_qualification BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(provider_id, capability_code)
);

CREATE TABLE IF NOT EXISTS measurement.acquisition_profiles (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  modality TEXT NOT NULL,
  device_type TEXT NOT NULL,
  min_specifications JSONB NOT NULL DEFAULT '{}'::jsonb,
  qualification_status TEXT NOT NULL CHECK (qualification_status IN ('clinical_qualified', 'research_compatible', 'unqualified')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- RLS
ALTER TABLE measurement.providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurement.provider_capabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurement.acquisition_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "providers_read_policy" ON measurement.providers
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "provider_capabilities_read_policy" ON measurement.provider_capabilities
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "acquisition_profiles_read_policy" ON measurement.acquisition_profiles
  FOR SELECT TO authenticated USING (true);
