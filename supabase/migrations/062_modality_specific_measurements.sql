-- 062_modality_specific_measurements.sql
-- Conforms to MAGNIOM-Neuroimaging, Neurophysiology & Multimodal Measurement Specification v2.0 (§12-69, §195)
-- Establishes specialized measurement schemas: imaging, neurophysiology, audiology, efield

CREATE SCHEMA IF NOT EXISTS imaging;
CREATE SCHEMA IF NOT EXISTS neurophysiology;
CREATE SCHEMA IF NOT EXISTS audiology;
CREATE SCHEMA IF NOT EXISTS efield;

-- Structural MRI
CREATE TABLE IF NOT EXISTS imaging.structural_measurements (
  id UUID PRIMARY KEY REFERENCES measurement.canonical_measurements(id) ON DELETE CASCADE,
  native_t1_artifact_id UUID NOT NULL,
  surface_native_mesh_artifact_id UUID,
  skull_mesh_artifact_id UUID,
  has_anatomical_abnormality BOOLEAN NOT NULL DEFAULT false,
  anatomical_notes TEXT,
  native_voxel_dimensions NUMERIC(6,3)[] NOT NULL,
  orientation TEXT NOT NULL CHECK (orientation IN ('RAS', 'LPS', 'other')),
  coordinate_space_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Lesion Mapping
CREATE TABLE IF NOT EXISTS imaging.lesion_measurements (
  id UUID PRIMARY KEY REFERENCES measurement.canonical_measurements(id) ON DELETE CASCADE,
  lesion_type TEXT NOT NULL,
  laterality TEXT NOT NULL CHECK (laterality IN ('left', 'right', 'bilateral', 'midline')),
  native_mask_artifact_id UUID NOT NULL,
  volume_mm3 NUMERIC(12,2) NOT NULL,
  is_target_destroyed BOOLEAN NOT NULL DEFAULT false,
  intersected_target_family_ids TEXT[] DEFAULT '{}',
  nearest_intact_cortex_distance_mm NUMERIC(8,2),
  registration_confidence TEXT NOT NULL CHECK (registration_confidence IN ('high', 'moderate', 'low')),
  segmentation_method TEXT NOT NULL CHECK (segmentation_method IN ('manual', 'validated_automated', 'semi_automated')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Resting-State fMRI
CREATE TABLE IF NOT EXISTS imaging.rsfmri_measurements (
  id UUID PRIMARY KEY REFERENCES measurement.canonical_measurements(id) ON DELETE CASCADE,
  acquired_duration_seconds NUMERIC(8,2) NOT NULL,
  retained_duration_seconds NUMERIC(8,2) NOT NULL,
  mean_framewise_displacement_mm NUMERIC(6,3) NOT NULL,
  scrubbed_volumes_fraction NUMERIC(5,4) NOT NULL,
  target_anticorrelation_peak_mni JSONB,
  sgacc_dlpfc_concordance NUMERIC(6,4) NOT NULL,
  split_half_stability_r NUMERIC(6,4) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Task fMRI
CREATE TABLE IF NOT EXISTS imaging.taskfmri_measurements (
  id UUID PRIMARY KEY REFERENCES measurement.canonical_measurements(id) ON DELETE CASCADE,
  paradigm_id TEXT NOT NULL,
  paradigm_name TEXT NOT NULL,
  behavioral_performance_valid BOOLEAN NOT NULL,
  task_accuracy_rate NUMERIC(5,4),
  activation_cluster_peak_coordinate JSONB,
  laterality_index NUMERIC(5,4) NOT NULL,
  activation_hemisphere TEXT NOT NULL CHECK (activation_hemisphere IN ('left', 'right', 'bilateral')),
  threshold_sensitivity_class TEXT NOT NULL CHECK (threshold_sensitivity_class IN ('robust', 'moderate', 'sensitive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Diffusion MRI / Tractography
CREATE TABLE IF NOT EXISTS imaging.diffusion_measurements (
  id UUID PRIMARY KEY REFERENCES measurement.canonical_measurements(id) ON DELETE CASCADE,
  b_value_count INTEGER NOT NULL,
  gradient_directions_count INTEGER NOT NULL,
  reconstructed_tracts JSONB NOT NULL DEFAULT '[]'::jsonb,
  corticospinal_tract_intact BOOLEAN NOT NULL DEFAULT true,
  is_axon_count_equivalent BOOLEAN NOT NULL DEFAULT false CHECK (is_axon_count_equivalent = false),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Motor Mapping
CREATE TABLE IF NOT EXISTS neurophysiology.motor_mapping_sessions (
  id UUID PRIMARY KEY REFERENCES measurement.canonical_measurements(id) ON DELETE CASCADE,
  target_muscle JSONB NOT NULL,
  spatial_spread_mm NUMERIC(8,2) NOT NULL,
  mapping_points JSONB NOT NULL DEFAULT '[]'::jsonb,
  hotspots JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Motor-Evoked Potentials (MEP)
CREATE TABLE IF NOT EXISTS neurophysiology.mep_measurements (
  id UUID PRIMARY KEY REFERENCES measurement.canonical_measurements(id) ON DELETE CASCADE,
  target_muscle JSONB NOT NULL,
  trials JSONB NOT NULL DEFAULT '[]'::jsonb,
  mean_amplitude_uv NUMERIC(10,2) NOT NULL,
  mean_latency_ms NUMERIC(8,2) NOT NULL,
  response_present BOOLEAN NOT NULL,
  absence_reason TEXT CHECK (absence_reason IN ('corticospinal_lesion', 'high_threshold', 'technical_failure')),
  motor_threshold JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Audiology
CREATE TABLE IF NOT EXISTS audiology.assessments (
  id UUID PRIMARY KEY REFERENCES measurement.canonical_measurements(id) ON DELETE CASCADE,
  pure_tone_audiogram JSONB,
  tinnitus_matching JSONB,
  speech_discrimination_percent NUMERIC(5,2),
  transducer_calibrated BOOLEAN NOT NULL,
  calibration_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- E-Field Modeling
CREATE TABLE IF NOT EXISTS efield.measurements (
  id UUID PRIMARY KEY REFERENCES measurement.canonical_measurements(id) ON DELETE CASCADE,
  head_model_artifact_id UUID NOT NULL,
  coil_model_ref TEXT NOT NULL,
  coil_position JSONB NOT NULL,
  coil_orientation NUMERIC(8,4)[] NOT NULL,
  peak_cortical_efield_vm NUMERIC(8,2) NOT NULL,
  stimulated_volume_mm3 NUMERIC(12,2) NOT NULL,
  scalp_to_cortex_distance_mm NUMERIC(6,2) NOT NULL,
  accessibility_attenuation_factor NUMERIC(5,4) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS across all tables
ALTER TABLE imaging.structural_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE imaging.lesion_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE imaging.rsfmri_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE imaging.taskfmri_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE imaging.diffusion_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE neurophysiology.motor_mapping_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE neurophysiology.mep_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE audiology.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE efield.measurements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "structural_measurements_read_policy" ON imaging.structural_measurements FOR SELECT TO authenticated USING (true);
CREATE POLICY "lesion_measurements_read_policy" ON imaging.lesion_measurements FOR SELECT TO authenticated USING (true);
CREATE POLICY "rsfmri_measurements_read_policy" ON imaging.rsfmri_measurements FOR SELECT TO authenticated USING (true);
CREATE POLICY "taskfmri_measurements_read_policy" ON imaging.taskfmri_measurements FOR SELECT TO authenticated USING (true);
CREATE POLICY "diffusion_measurements_read_policy" ON imaging.diffusion_measurements FOR SELECT TO authenticated USING (true);
CREATE POLICY "motor_mapping_sessions_read_policy" ON neurophysiology.motor_mapping_sessions FOR SELECT TO authenticated USING (true);
CREATE POLICY "mep_measurements_read_policy" ON neurophysiology.mep_measurements FOR SELECT TO authenticated USING (true);
CREATE POLICY "audiology_assessments_read_policy" ON audiology.assessments FOR SELECT TO authenticated USING (true);
CREATE POLICY "efield_measurements_read_policy" ON efield.measurements FOR SELECT TO authenticated USING (true);
