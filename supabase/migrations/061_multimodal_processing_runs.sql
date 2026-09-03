-- 061_multimodal_processing_runs.sql
-- Conforms to MAGNIOM-Neuroimaging, Neurophysiology & Multimodal Measurement Specification v2.0 (§99-100, §139)
-- ProcessingRun immutability and ArtifactManifest hashing

CREATE TABLE IF NOT EXISTS measurement.processing_runs (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  organisation_id UUID NOT NULL REFERENCES identity.organisations(id) ON DELETE CASCADE,
  case_id UUID NOT NULL REFERENCES clinical.cases(id) ON DELETE CASCADE,
  modality TEXT NOT NULL,
  pipeline_version_id UUID NOT NULL,
  input_artifact_ids UUID[] NOT NULL DEFAULT '{}',
  configuration_sha256 BYTEA NOT NULL,
  container_digest_sha256 BYTEA,
  status TEXT NOT NULL CHECK (status IN ('queued', 'running', 'succeeded', 'failed', 'superseded')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  completed_at TIMESTAMPTZ,
  output_artifact_ids UUID[] DEFAULT '{}',
  run_manifest_sha256 BYTEA,
  execution_logs TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS measurement.artifact_manifests (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  measurement_id UUID NOT NULL REFERENCES measurement.canonical_measurements(id) ON DELETE CASCADE,
  input_artifacts JSONB NOT NULL DEFAULT '[]'::jsonb,
  output_artifacts JSONB NOT NULL DEFAULT '[]'::jsonb,
  pipeline_version_id UUID NOT NULL,
  configuration_sha256 BYTEA NOT NULL,
  manifest_sha256 BYTEA NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Immutability enforcement trigger for completed processing runs (§100)
CREATE OR REPLACE FUNCTION measurement.prevent_completed_processing_run_mutation()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IN ('succeeded', 'failed', 'superseded') THEN
    RAISE EXCEPTION 'ProcessingRun % has completed with status % and is immutable. Create a new ProcessingRun instead.', OLD.id, OLD.status;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_processing_runs_immutable ON measurement.processing_runs;
CREATE TRIGGER trg_processing_runs_immutable
  BEFORE UPDATE ON measurement.processing_runs
  FOR EACH ROW EXECUTE FUNCTION measurement.prevent_completed_processing_run_mutation();

-- RLS
ALTER TABLE measurement.processing_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurement.artifact_manifests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "processing_runs_read_policy" ON measurement.processing_runs
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.organisation_id = processing_runs.organisation_id AND m.active = true));

CREATE POLICY "processing_runs_write_policy" ON measurement.processing_runs
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.organisation_id = processing_runs.organisation_id AND m.active = true AND m.role IN ('imaging_specialist', 'tms_specialist', 'service_worker', 'system_admin')));

CREATE POLICY "artifact_manifests_read_policy" ON measurement.artifact_manifests
  FOR SELECT TO authenticated USING (true);
