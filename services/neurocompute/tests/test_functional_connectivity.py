"""
Unit Tests for Functional Connectivity Engine (Run-Level and Combined FC)
Conforms to MAGNIOM-Neuroimaging & Functional Connectomics Pipeline Specification v1.0 Sections 81-84
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
from magniom_neuro.connectome.fc_engine import FunctionalConnectivityEngine


class TestFunctionalConnectivityEngine(unittest.TestCase):

    def setUp(self):
        self.test_dir = tempfile.mkdtemp()
        self.subject_id = "sub-MGN7F3A92"

        self.surface_resampling = SurfaceResamplingEngine.resample_subject(
            subject_id=self.subject_id,
            output_directory=self.test_dir,
        )

        retained_time_1 = RetainedTimeSummary(
            acquired_seconds=150.0,
            acquired_minutes=2.5,
            non_steady_state_removed_seconds=6.0,
            non_steady_state_removed_minutes=0.1,
            motion_censored_seconds=9.0,
            motion_censored_minutes=0.15,
            final_retained_seconds=135.0,
            final_retained_minutes=2.25,
            percentage_retained=90.0,
            total_volumes=100,
            non_steady_state_volumes=4,
            censored_volumes=6,
            retained_volumes=90,
            short_segments_pruned_volumes=0,
            is_above_absolute_minimum=True,
            is_above_recommended_clinical=True,
        )

        retained_time_2 = RetainedTimeSummary(
            acquired_seconds=150.0,
            acquired_minutes=2.5,
            non_steady_state_removed_seconds=6.0,
            non_steady_state_removed_minutes=0.1,
            motion_censored_seconds=12.0,
            motion_censored_minutes=0.2,
            final_retained_seconds=132.0,
            final_retained_minutes=2.2,
            percentage_retained=88.0,
            total_volumes=100,
            non_steady_state_volumes=4,
            censored_volumes=8,
            retained_volumes=88,
            short_segments_pruned_volumes=0,
            is_above_absolute_minimum=True,
            is_above_recommended_clinical=True,
        )

        self.run1_meta = MultiEchoRunMetadata(
            run_index=1,
            subject_id=self.subject_id,
            session_id=None,
            task_name="rest",
            tr_seconds=1.5,
            flip_angle_deg=70.0,
            echoes=[],
            num_volumes=100,
            spatial_resolution_mm=(2.4, 2.4, 2.4),
            matrix_size=(88, 88, 64),
        )
        self.run2_meta = MultiEchoRunMetadata(
            run_index=2,
            subject_id=self.subject_id,
            session_id=None,
            task_name="rest",
            tr_seconds=1.5,
            flip_angle_deg=70.0,
            echoes=[],
            num_volumes=100,
            spatial_resolution_mm=(2.4, 2.4, 2.4),
            matrix_size=(88, 88, 64),
        )

        censor_mask_1 = [False] * 100
        for i in [0, 1, 2, 3, 25, 26, 27, 28, 60, 61]:
            censor_mask_1[i] = True

        censor_mask_2 = [False] * 100
        for i in [0, 1, 2, 3, 10, 11, 12, 13, 14, 15, 70, 71]:
            censor_mask_2[i] = True

        self.denoised_1 = DenoisedTimeSeriesOutput(
            denoising_configuration="CD-1",
            run_index=1,
            subject_id=self.subject_id,
            denoised_bold_path=os.path.join(self.test_dir, "denoised_1.nii.gz"),
            denoised_bold_sha256="0" * 64,
            nuisance_matrix_path=os.path.join(self.test_dir, "nuisance_1.tsv"),
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
            retained_time=retained_time_1,
            censor_mask=censor_mask_1,
        )

        self.denoised_2 = DenoisedTimeSeriesOutput(
            denoising_configuration="CD-1",
            run_index=2,
            subject_id=self.subject_id,
            denoised_bold_path=os.path.join(self.test_dir, "denoised_2.nii.gz"),
            denoised_bold_sha256="0" * 64,
            nuisance_matrix_path=os.path.join(self.test_dir, "nuisance_2.tsv"),
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
            retained_time=retained_time_2,
            censor_mask=censor_mask_2,
        )

        # Generate surface projection and parcel series for both runs
        surf_proj_1 = SurfaceProjectionEngine.project_bold_to_surface(
            run_meta=self.run1_meta,
            denoised_output=self.denoised_1,
            surface_resampling=self.surface_resampling,
            output_directory=self.test_dir,
            simulation_seed=101,
        )
        surf_proj_2 = SurfaceProjectionEngine.project_bold_to_surface(
            run_meta=self.run2_meta,
            denoised_output=self.denoised_2,
            surface_resampling=self.surface_resampling,
            output_directory=self.test_dir,
            simulation_seed=102,
        )

        self.p_series_1 = ParcelSeriesExtractor.extract_parcel_series(
            subject_id=self.subject_id,
            run_index=1,
            surface_projection=surf_proj_1,
            denoised_output=self.denoised_1,
            output_directory=self.test_dir,
        )
        self.p_series_2 = ParcelSeriesExtractor.extract_parcel_series(
            subject_id=self.subject_id,
            run_index=2,
            surface_projection=surf_proj_2,
            denoised_output=self.denoised_2,
            output_directory=self.test_dir,
        )

    def tearDown(self):
        shutil.rmtree(self.test_dir, ignore_errors=True)

    def test_run_level_fc(self):
        run1_fc = FunctionalConnectivityEngine.compute_run_fc(
            parcel_series=self.p_series_1,
            denoised_output=self.denoised_1,
            output_directory=self.test_dir,
        )

        self.assertEqual(run1_fc.subject_id, self.subject_id)
        self.assertEqual(run1_fc.run_index, 1)
        self.assertEqual(run1_fc.num_parcels, 374)
        self.assertEqual(len(run1_fc.correlation_matrix), 374)
        self.assertEqual(len(run1_fc.correlation_matrix[0]), 374)

        # Check diagonal of correlation is 1.0 and Fisher-z is 0.0
        for i in range(10):
            self.assertAlmostEqual(run1_fc.correlation_matrix[i][i], 1.0, places=4)
            self.assertAlmostEqual(run1_fc.fisher_z_matrix[i][i], 0.0, places=4)

        # Symmetry check
        for i in range(20):
            for j in range(20):
                self.assertAlmostEqual(run1_fc.correlation_matrix[i][j], run1_fc.correlation_matrix[j][i], places=4)

        # Check TSV export
        self.assertTrue(os.path.exists(run1_fc.artifact_tsv_path))
        self.assertEqual(len(run1_fc.artifact_tsv_sha256), 64)

    def test_combined_fc(self):
        run1_fc = FunctionalConnectivityEngine.compute_run_fc(
            parcel_series=self.p_series_1,
            denoised_output=self.denoised_1,
            output_directory=self.test_dir,
        )
        run2_fc = FunctionalConnectivityEngine.compute_run_fc(
            parcel_series=self.p_series_2,
            denoised_output=self.denoised_2,
            output_directory=self.test_dir,
        )

        combined_fc = FunctionalConnectivityEngine.combine_runs_fc(
            run_fc_list=[run1_fc, run2_fc],
            output_directory=self.test_dir,
        )

        self.assertEqual(combined_fc.subject_id, self.subject_id)
        self.assertEqual(len(combined_fc.run_indices), 2)
        self.assertEqual(combined_fc.total_retained_timepoints, 90 + 88)
        self.assertAlmostEqual(sum(combined_fc.run_weights), 1.0, places=5)
        self.assertEqual(combined_fc.num_parcels, 374)

        # Verify cross-run similarity is evaluated
        self.assertIsNotNone(combined_fc.cross_run_similarity_matrix)
        self.assertEqual(len(combined_fc.cross_run_similarity_matrix), 2)
        self.assertGreater(combined_fc.cross_run_similarity_matrix[0][1], 0.4)

        # Check TSV export
        self.assertTrue(os.path.exists(combined_fc.artifact_tsv_path))
        self.assertEqual(len(combined_fc.artifact_tsv_sha256), 64)


if __name__ == "__main__":
    unittest.main()
