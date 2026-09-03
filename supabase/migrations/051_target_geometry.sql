-- 051_target_geometry.sql
-- Step 9 in Section 18: Expanded TargetGeometry Relational Hierarchy
-- Conforms to MAGNIOM-Canonical Multi-Indication Data Specification v2.0 (§52-66, 108)

CREATE TABLE IF NOT EXISTS targeting.target_geometries (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  geometry_type TEXT NOT NULL CHECK (geometry_type IN ('point', 'surface_roi', 'volumetric_roi', 'somatotopic', 'coil_field', 'network')),
  coordinate_space JSONB NOT NULL,
  laterality TEXT NOT NULL CHECK (laterality IN ('left', 'right', 'bilateral', 'midline', 'not_applicable')),
  source_method TEXT NOT NULL,
  source_method_version TEXT NOT NULL,
  provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS targeting.point_target_geometries (
  geometry_id UUID PRIMARY KEY REFERENCES targeting.target_geometries(id) ON DELETE CASCADE,
  centre_x NUMERIC(10, 4) NOT NULL,
  centre_y NUMERIC(10, 4) NOT NULL,
  centre_z NUMERIC(10, 4) NOT NULL,
  surface_vertex_id TEXT,
  normal_vector JSONB,
  optional_roi JSONB
);

CREATE TABLE IF NOT EXISTS targeting.surface_roi_geometries (
  geometry_id UUID PRIMARY KEY REFERENCES targeting.target_geometries(id) ON DELETE CASCADE,
  surface_id TEXT NOT NULL,
  vertex_ids TEXT[] DEFAULT '{}',
  mesh_artifact_id UUID,
  centre_x NUMERIC(10, 4),
  centre_y NUMERIC(10, 4),
  centre_z NUMERIC(10, 4),
  area_mm2 NUMERIC(10, 2),
  confidence_region JSONB
);

CREATE TABLE IF NOT EXISTS targeting.volumetric_roi_geometries (
  geometry_id UUID PRIMARY KEY REFERENCES targeting.target_geometries(id) ON DELETE CASCADE,
  mask_artifact_id UUID NOT NULL,
  centre_x NUMERIC(10, 4),
  centre_y NUMERIC(10, 4),
  centre_z NUMERIC(10, 4),
  volume_mm3 NUMERIC(12, 2),
  atlas_annotations JSONB DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS targeting.somatotopic_geometries (
  geometry_id UUID PRIMARY KEY REFERENCES targeting.target_geometries(id) ON DELETE CASCADE,
  cortical_region JSONB NOT NULL,
  body_region_code TEXT NOT NULL,
  body_region_label TEXT NOT NULL,
  body_region_parent_code TEXT,
  affected_body_side TEXT CHECK (affected_body_side IN ('left', 'right', 'bilateral', 'midline', 'not_applicable')),
  stimulation_hemisphere TEXT NOT NULL CHECK (stimulation_hemisphere IN ('left', 'right', 'bilateral')),
  motor_mapping_run_id UUID,
  mapped_hotspot JSONB,
  mapped_surface_region JSONB,
  mapping_reliability_id UUID
);

CREATE TABLE IF NOT EXISTS targeting.coil_field_geometries (
  geometry_id UUID PRIMARY KEY REFERENCES targeting.target_geometries(id) ON DELETE CASCADE,
  coil_model_id UUID NOT NULL,
  device_model_id UUID,
  placement JSONB NOT NULL,
  intended_field_region JSONB NOT NULL,
  therapeutic_region_ids UUID[] NOT NULL DEFAULT '{}',
  efield_run_id UUID,
  field_coverage_metrics JSONB DEFAULT '[]'::jsonb,
  pose_tolerance JSONB,
  point_coordinate_is_representative_only BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS targeting.network_target_geometries (
  geometry_id UUID PRIMARY KEY REFERENCES targeting.target_geometries(id) ON DELETE CASCADE,
  therapeutic_circuit_ids UUID[] NOT NULL DEFAULT '{}',
  accessible_node_regions JSONB NOT NULL DEFAULT '[]'::jsonb,
  preferred_stimulation_region JSONB,
  network_definition_version_id UUID NOT NULL,
  network_measurement_source_ids UUID[] DEFAULT '{}'
);

-- Enable Row Level Security across all geometry tables
ALTER TABLE targeting.target_geometries ENABLE ROW LEVEL SECURITY;
ALTER TABLE targeting.point_target_geometries ENABLE ROW LEVEL SECURITY;
ALTER TABLE targeting.surface_roi_geometries ENABLE ROW LEVEL SECURITY;
ALTER TABLE targeting.volumetric_roi_geometries ENABLE ROW LEVEL SECURITY;
ALTER TABLE targeting.somatotopic_geometries ENABLE ROW LEVEL SECURITY;
ALTER TABLE targeting.coil_field_geometries ENABLE ROW LEVEL SECURITY;
ALTER TABLE targeting.network_target_geometries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "target_geometries_read_policy" ON targeting.target_geometries FOR SELECT TO authenticated USING (true);
CREATE POLICY "point_target_geometries_read_policy" ON targeting.point_target_geometries FOR SELECT TO authenticated USING (true);
CREATE POLICY "surface_roi_geometries_read_policy" ON targeting.surface_roi_geometries FOR SELECT TO authenticated USING (true);
CREATE POLICY "volumetric_roi_geometries_read_policy" ON targeting.volumetric_roi_geometries FOR SELECT TO authenticated USING (true);
CREATE POLICY "somatotopic_geometries_read_policy" ON targeting.somatotopic_geometries FOR SELECT TO authenticated USING (true);
CREATE POLICY "coil_field_geometries_read_policy" ON targeting.coil_field_geometries FOR SELECT TO authenticated USING (true);
CREATE POLICY "network_target_geometries_read_policy" ON targeting.network_target_geometries FOR SELECT TO authenticated USING (true);

CREATE POLICY "target_geometries_write_policy" ON targeting.target_geometries FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "point_target_geometries_write_policy" ON targeting.point_target_geometries FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "surface_roi_geometries_write_policy" ON targeting.surface_roi_geometries FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "volumetric_roi_geometries_write_policy" ON targeting.volumetric_roi_geometries FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "somatotopic_geometries_write_policy" ON targeting.somatotopic_geometries FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "coil_field_geometries_write_policy" ON targeting.coil_field_geometries FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "network_target_geometries_write_policy" ON targeting.network_target_geometries FOR ALL TO authenticated USING (true) WITH CHECK (true);
