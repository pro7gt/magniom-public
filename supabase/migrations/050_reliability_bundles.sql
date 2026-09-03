-- 050_reliability_bundles.sql
-- Step 8 in Section 18: Measurement Reliability and Reliability Bundles
-- Conforms to MAGNIOM-Canonical Multi-Indication Data Specification v2.0 (§38-44)

CREATE TABLE IF NOT EXISTS measurement.measurement_reliability (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  version TEXT NOT NULL DEFAULT '1.0.0',
  case_id UUID NOT NULL REFERENCES clinical.cases(id) ON DELETE CASCADE,
  measurement_id UUID NOT NULL REFERENCES measurement.canonical_measurements(id) ON DELETE CASCADE,
  modality TEXT NOT NULL CHECK (modality IN ('structural_mri', 'resting_state_fmri', 'task_fmri', 'diffusion_mri', 'motor_mapping', 'motor_evoked_potential', 'eeg', 'tms_eeg', 'audiology', 'clinical_neurophysiology', 'efield', 'other')),
  method_code TEXT NOT NULL,
  method_version TEXT NOT NULL,
  qc_status TEXT NOT NULL CHECK (qc_status IN ('pass', 'conditional', 'fail')),
  metrics JSONB NOT NULL DEFAULT '[]'::jsonb,
  reproducibility JSONB,
  spatial_reliability JSONB,
  pipeline_sensitivity JSONB,
  reliability_class TEXT NOT NULL CHECK (reliability_class IN ('high', 'moderate', 'low', 'unreliable', 'not_assessable')),
  limiting_factors JSONB NOT NULL DEFAULT '[]'::jsonb,
  interpretation TEXT NOT NULL,
  pipeline_version_ids UUID[] DEFAULT '{}',
  provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS measurement.reliability_bundles (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  version TEXT NOT NULL DEFAULT '1.0.0',
  case_id UUID NOT NULL REFERENCES clinical.cases(id) ON DELETE CASCADE,
  case_indication_id UUID NOT NULL REFERENCES clinical.case_indications(id) ON DELETE CASCADE,
  indication_module_release_id UUID NOT NULL REFERENCES clinical.indication_module_releases(id) ON DELETE RESTRICT,
  measurement_bundle_id UUID NOT NULL REFERENCES measurement.measurement_bundles(id) ON DELETE RESTRICT,
  component_reliability_ids UUID[] DEFAULT '{}',
  capability_qualification JSONB NOT NULL DEFAULT '[]'::jsonb,
  overall_qualification TEXT NOT NULL CHECK (overall_qualification IN ('qualified', 'qualified_with_limits', 'not_qualified')),
  limiting_factors JSONB NOT NULL DEFAULT '[]'::jsonb,
  interpretation TEXT NOT NULL,
  payload_sha256 BYTEA NOT NULL,
  provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Immutability enforcement trigger
CREATE OR REPLACE FUNCTION measurement.prevent_reliability_bundle_mutation()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'ReliabilityBundle is an immutable verification record. Create a new bundle instead of mutating.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_reliability_bundles_immutable ON measurement.reliability_bundles;
CREATE TRIGGER trg_reliability_bundles_immutable
  BEFORE UPDATE ON measurement.reliability_bundles
  FOR EACH ROW EXECUTE FUNCTION measurement.prevent_reliability_bundle_mutation();

CREATE INDEX IF NOT EXISTS idx_measurement_reliability_case ON measurement.measurement_reliability(case_id);
CREATE INDEX IF NOT EXISTS idx_reliability_bundles_case ON measurement.reliability_bundles(case_id);
CREATE INDEX IF NOT EXISTS idx_reliability_bundles_indication ON measurement.reliability_bundles(case_indication_id);

-- Enable Row Level Security
ALTER TABLE measurement.measurement_reliability ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurement.reliability_bundles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "measurement_reliability_read_policy" ON measurement.measurement_reliability
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM clinical.cases c
    JOIN identity.memberships m ON m.organisation_id = c.organisation_id
    WHERE c.id = measurement_reliability.case_id AND m.user_id = auth.uid() AND m.active = true
  ));

CREATE POLICY "measurement_reliability_write_policy" ON measurement.measurement_reliability
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM clinical.cases c
    JOIN identity.memberships m ON m.organisation_id = c.organisation_id
    WHERE c.id = measurement_reliability.case_id AND m.user_id = auth.uid() AND m.active = true AND m.role IN ('tms_specialist', 'imaging_specialist', 'service_worker', 'system_admin')
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM clinical.cases c
    JOIN identity.memberships m ON m.organisation_id = c.organisation_id
    WHERE c.id = measurement_reliability.case_id AND m.user_id = auth.uid() AND m.active = true AND m.role IN ('tms_specialist', 'imaging_specialist', 'service_worker', 'system_admin')
  ));

CREATE POLICY "reliability_bundles_read_policy" ON measurement.reliability_bundles
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM clinical.cases c
    JOIN identity.memberships m ON m.organisation_id = c.organisation_id
    WHERE c.id = reliability_bundles.case_id AND m.user_id = auth.uid() AND m.active = true
  ));

CREATE POLICY "reliability_bundles_write_policy" ON measurement.reliability_bundles
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM clinical.cases c
    JOIN identity.memberships m ON m.organisation_id = c.organisation_id
    WHERE c.id = reliability_bundles.case_id AND m.user_id = auth.uid() AND m.active = true AND m.role IN ('tms_specialist', 'imaging_specialist', 'service_worker', 'system_admin')
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM clinical.cases c
    JOIN identity.memberships m ON m.organisation_id = c.organisation_id
    WHERE c.id = reliability_bundles.case_id AND m.user_id = auth.uid() AND m.active = true AND m.role IN ('tms_specialist', 'imaging_specialist', 'service_worker', 'system_admin')
  ));
