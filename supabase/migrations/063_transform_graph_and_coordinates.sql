-- 063_transform_graph_and_coordinates.sql
-- Conforms to MAGNIOM-Neuroimaging, Neurophysiology & Multimodal Measurement Specification v2.0 (§92-98, §156-159)
-- Spatial coordinate systems, transforms, and verification records

CREATE TABLE IF NOT EXISTS measurement.coordinate_spaces (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  space_type TEXT NOT NULL CHECK (space_type IN ('subject_native', 'standard_template', 'device_navigation', 'surface_mesh')),
  orientation TEXT CHECK (orientation IN ('RAS', 'LPS', 'LPI', 'other')),
  subject_specific BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS measurement.spatial_transforms (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  from_space_id UUID NOT NULL REFERENCES measurement.coordinate_spaces(id) ON DELETE RESTRICT,
  to_space_id UUID NOT NULL REFERENCES measurement.coordinate_spaces(id) ON DELETE RESTRICT,
  transform_type TEXT NOT NULL CHECK (transform_type IN ('affine_matrix_4x4', 'nonlinear_warp', 'surface_registration')),
  matrix_4x4 NUMERIC(12,6)[] DEFAULT NULL,
  warp_artifact_id UUID DEFAULT NULL,
  round_trip_max_error_mm NUMERIC(6,3) NOT NULL,
  verification_status TEXT NOT NULL CHECK (verification_status IN ('verified', 'unverified', 'failed')),
  artifact_sha256 BYTEA NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- RLS
ALTER TABLE measurement.coordinate_spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurement.spatial_transforms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "coordinate_spaces_read_policy" ON measurement.coordinate_spaces FOR SELECT TO authenticated USING (true);
CREATE POLICY "spatial_transforms_read_policy" ON measurement.spatial_transforms FOR SELECT TO authenticated USING (true);
