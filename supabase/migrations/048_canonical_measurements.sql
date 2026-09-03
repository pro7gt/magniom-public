-- 048_canonical_measurements.sql
-- Step 6 in Section 18: Canonical Measurements
-- Conforms to MAGNIOM-Canonical Multi-Indication Data Specification v2.0 (§28-30)
-- and MAGNIOM-Neuroimaging, Neurophysiology & Multimodal Measurement Specification v2.0

CREATE SCHEMA IF NOT EXISTS measurement;

CREATE TABLE IF NOT EXISTS measurement.canonical_measurements (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  organisation_id UUID NOT NULL REFERENCES identity.organisations(id) ON DELETE CASCADE,
  case_id UUID NOT NULL REFERENCES clinical.cases(id) ON DELETE CASCADE,
  modality TEXT NOT NULL CHECK (modality IN ('structural_mri', 'resting_state_fmri', 'task_fmri', 'diffusion_mri', 'motor_mapping', 'motor_evoked_potential', 'eeg', 'tms_eeg', 'audiology', 'clinical_neurophysiology', 'efield', 'other')),
  version TEXT NOT NULL DEFAULT '1.0.0',
  status TEXT NOT NULL CHECK (status IN ('available', 'qualified', 'qualified_with_limits', 'failed', 'not_applicable')),
  acquisition_time TIMESTAMPTZ,
  pipeline_version_ids UUID[] DEFAULT '{}',
  artifact_ids UUID[] DEFAULT '{}',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_canonical_measurements_case ON measurement.canonical_measurements(case_id);
CREATE INDEX IF NOT EXISTS idx_canonical_measurements_org ON measurement.canonical_measurements(organisation_id);

-- Enable Row Level Security
ALTER TABLE measurement.canonical_measurements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "canonical_measurements_read_policy" ON measurement.canonical_measurements
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.organisation_id = canonical_measurements.organisation_id AND m.active = true));

CREATE POLICY "canonical_measurements_write_policy" ON measurement.canonical_measurements
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.organisation_id = canonical_measurements.organisation_id AND m.active = true AND m.role IN ('tms_specialist', 'imaging_specialist', 'service_worker', 'system_admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM identity.memberships m WHERE m.user_id = auth.uid() AND m.organisation_id = canonical_measurements.organisation_id AND m.active = true AND m.role IN ('tms_specialist', 'imaging_specialist', 'service_worker', 'system_admin')));
