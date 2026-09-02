"""
Unit Tests for Parcel Series Extractor and Coverage QC
Conforms to MAGNIOM-Neuroimaging & Functional Connectomics Pipeline Specification v1.0 Sections 77-78
"""

import os
import shutil
import tempfile
import unittest
from magniom_neuro.models.bold import MultiEchoRunMetadata
from magniom_neuro.models.denoise import DenoisedTimeSeriesOutput, RetainedTimeSummary
from magniom_neuro.surfaces.resampling import SurfaceResamplingEngine
from magniom_neuro.surfaces.projection import SurfaceProjectionEngine
from magniom_neuro.connectome.parcel_series import ParcelSeriesExtractor


class TestParcelSeriesExtractor(unittest.TestCase):

    def setUp(self):
        self.test_dir = tempfile.mkdtemp()
        self.subject_id = "sub-MGN7F3A92"

        self.surface_resampling = SurfaceResamplingEngine.resample_subject(
            subject_id=self.subject_id,
            output_directory=self.test_dir,
        )

        self.run_meta = MultiEchoRunMetadata(
            run_index=1,
            subject_id=self.subject_id,
            session_id=None,
            task_name="rest",
            tr_seconds=1.5,
            flip_angle_deg=70.0,
            echoes=[],
            num_volumes=80,
            spatial_resolution_mm=(2.4, 2.4, 2.4),
            matrix_size=(88, 88, 64),
        )

        retained_time = RetainedTimeSummary(
            acquired_seconds=120.0,
            acquired_minutes=2.0,
            non_steady_state_removed_seconds=6.0,
            non_steady_state_removed_minutes=0.1,
            motion_censored_seconds=6.0,
            motion_censored_minutes=0.1,
            final_retained_seconds=108.0,
            final_retained_minutes=1.8,
            percentage_retained=90.0,
            total_volumes=80,
            non_steady_state_volumes=4,
            censored_volumes=4,
            retained_volumes=72,
            short_segments_pruned_volumes=0,
            is_above_absolute_minimum=True,
            is_above_recommended_clinical=True,
        )

        self.denoised_output = DenoisedTimeSeriesOutput(
            denoising_configuration="CD-1",
            run_index=1,
            subject_id=self.subject_id,
            denoised_bold_path=os.path.join(self.test_dir, "denoised.nii.gz"),
            denoised_bold_sha256="0" * 64,
            nuisance_matrix_path=os.path.join(self.test_dir, "nuisance.tsv"),
            nuisance_matrix_sha256="1" * 64,
            bandpass_low_hz=0.009,
            bandpass_high_hz=0.080,
            includes_gsr=True,
            num_regressors=36,
            motion_regressor_expansion="24-parameter Volterra",
            tissue_regressors=["WM_mean", "CSF_mean"],
            variance_explained_by_nuisance=0.28,
            tsnr_pre_denoise=65.0,
            tsnr_post_denoise=118.0,
            retained_time=retained_time,
            censor_mask=[False] * 80,
        )

        self.surface_projection = SurfaceProjectionEngine.project_bold_to_surface(
            run_meta=self.run_meta,
            denoised_output=self.denoised_output,
            surface_resampling=self.surface_resampling,
            output_directory=self.test_dir,
            simulation_seed=42,
        )

    def tearDown(self):
        shutil.rmtree(self.test_dir, ignore_errors=True)

    def test_extract_parcel_series(self):
        result = ParcelSeriesExtractor.extract_parcel_series(
            subject_id=self.subject_id,
            run_index=1,
            surface_projection=self.surface_projection,
            denoised_output=self.denoised_output,
            output_directory=self.test_dir,
        )

        self.assertEqual(result.subject_id, self.subject_id)
        self.assertEqual(result.run_index, 1)
        self.assertEqual(result.num_timepoints, 80)
        self.assertEqual(len(result.parcel_names), 374)  # 360 cortical + 14 subcortical
        self.assertEqual(len(result.time_series_matrix), 374)
        self.assertEqual(len(result.time_series_matrix[0]), 80)

        # Check coverage QC
        self.assertEqual(len(result.parcel_coverage), 374)
        valid_parcels = [q for q in result.parcel_coverage if q.coverage_status == "VALID"]
        self.assertGreaterEqual(len(valid_parcels), 350)

        # Check artifact file creation
        self.assertIsNotNone(result.artifact_path)
        self.assertTrue(os.path.exists(result.artifact_path))
        self.assertEqual(len(result.artifact_sha256), 64)


if __name__ == "__main__":
    unittest.main()
