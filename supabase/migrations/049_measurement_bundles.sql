-- 049_measurement_bundles.sql
-- Step 7 in Section 18: Measurement Bundles and Bundle Items
-- Conforms to MAGNIOM-Canonical Multi-Indication Data Specification v2.0 (§31-36)

CREATE TABLE IF NOT EXISTS measurement.measurement_bundles (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  version TEXT NOT NULL DEFAULT '1.0.0',
  case_id UUID NOT NULL REFERENCES clinical.cases(id) ON DELETE CASCADE,
  case_indication_id UUID NOT NULL REFERENCES clinical.case_indications(id) ON DELETE CASCADE,
  indication_module_release_id UUID NOT NULL REFERENCES clinical.indication_module_releases(id) ON DELETE RESTRICT,
  phenotype_snapshot_id UUID NOT NULL REFERENCES clinical.phenotype_snapshots(id) ON DELETE RESTRICT,
  disease_stage_context_id UUID REFERENCES clinical.disease_stage_contexts(id) ON DELETE SET NULL,
  lesion_context_ids UUID[] DEFAULT '{}',
  qualification_status TEXT NOT NULL CHECK (qualification_status IN ('qualified', 'qualified_with_limits', 'insufficient', 'invalid')),
  requirement_evaluations JSONB NOT NULL DEFAULT '[]'::jsonb,
  limiting_factors JSONB NOT NULL DEFAULT '[]'::jsonb,
  payload_sha256 BYTEA NOT NULL,
  provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS measurement.bundle_items (
  bundle_id UUID NOT NULL REFERENCES measurement.measurement_bundles(id) ON DELETE CASCADE,
  measurement_id UUID NOT NULL REFERENCES measurement.canonical_measurements(id) ON DELETE RESTRICT,
  PRIMARY KEY (bundle_id, measurement_id)
);

-- Immutability enforcement trigger for MeasurementBundles (§34)
CREATE OR REPLACE FUNCTION measurement.prevent_measurement_bundle_mutation()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'MeasurementBundle is an immutable snapshot. Create a new bundle instead of modifying historical ones.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_measurement_bundles_immutable ON measurement.measurement_bundles;
CREATE TRIGGER trg_measurement_bundles_immutable
  BEFORE UPDATE ON measurement.measurement_bundles
  FOR EACH ROW EXECUTE FUNCTION measurement.prevent_measurement_bundle_mutation();

CREATE INDEX IF NOT EXISTS idx_measurement_bundles_case ON measurement.measurement_bundles(case_id);
CREATE INDEX IF NOT EXISTS idx_measurement_bundles_indication ON measurement.measurement_bundles(case_indication_id);

-- Enable Row Level Security
ALTER TABLE measurement.measurement_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurement.bundle_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "measurement_bundles_read_policy" ON measurement.measurement_bundles
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM clinical.cases c
    JOIN identity.memberships m ON m.organisation_id = c.organisation_id
    WHERE c.id = measurement_bundles.case_id AND m.user_id = auth.uid() AND m.active = true
  ));

CREATE POLICY "measurement_bundles_write_policy" ON measurement.measurement_bundles
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM clinical.cases c
    JOIN identity.memberships m ON m.organisation_id = c.organisation_id
    WHERE c.id = measurement_bundles.case_id AND m.user_id = auth.uid() AND m.active = true AND m.role IN ('tms_specialist', 'imaging_specialist', 'service_worker', 'system_admin')
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM clinical.cases c
    JOIN identity.memberships m ON m.organisation_id = c.organisation_id
    WHERE c.id = measurement_bundles.case_id AND m.user_id = auth.uid() AND m.active = true AND m.role IN ('tms_specialist', 'imaging_specialist', 'service_worker', 'system_admin')
  ));

CREATE POLICY "bundle_items_read_policy" ON measurement.bundle_items
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM measurement.measurement_bundles mb
    JOIN clinical.cases c ON c.id = mb.case_id
    JOIN identity.memberships m ON m.organisation_id = c.organisation_id
    WHERE mb.id = bundle_items.bundle_id AND m.user_id = auth.uid() AND m.active = true
  ));

CREATE POLICY "bundle_items_write_policy" ON measurement.bundle_items
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM measurement.measurement_bundles mb
    JOIN clinical.cases c ON c.id = mb.case_id
    JOIN identity.memberships m ON m.organisation_id = c.organisation_id
    WHERE mb.id = bundle_items.bundle_id AND m.user_id = auth.uid() AND m.active = true AND m.role IN ('tms_specialist', 'imaging_specialist', 'service_worker', 'system_admin')
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM measurement.measurement_bundles mb
    JOIN clinical.cases c ON c.id = mb.case_id
    JOIN identity.memberships m ON m.organisation_id = c.organisation_id
    WHERE mb.id = bundle_items.bundle_id AND m.user_id = auth.uid() AND m.active = true AND m.role IN ('tms_specialist', 'imaging_specialist', 'service_worker', 'system_admin')
  ));
