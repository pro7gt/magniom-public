"""
Unit Tests for Surface Projection Engine (Stage 06)
Conforms to MAGNIOM-Neuroimaging & Functional Connectomics Pipeline Specification v1.0 Sections 72-73
"""

import os
import shutil
import tempfile
import unittest
from magniom_neuro.models.bold import MultiEchoRunMetadata
from magniom_neuro.models.denoise import DenoisedTimeSeriesOutput, RetainedTimeSummary
from magniom_neuro.models.surface import SurfaceResamplingResult
from magniom_neuro.surfaces.resampling import SurfaceResamplingEngine
from magniom_neuro.surfaces.projection import SurfaceProjectionEngine


class TestSurfaceProjectionEngine(unittest.TestCase):

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
            num_volumes=100,
            spatial_resolution_mm=(2.4, 2.4, 2.4),
            matrix_size=(88, 88, 64),
        )

        retained_time = RetainedTimeSummary(
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

        censor_mask = [False] * 100
        for i in [0, 1, 2, 3, 20, 21, 22, 50, 51, 52]:
            censor_mask[i] = True

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
            censor_mask=censor_mask,
        )

    def tearDown(self):
        shutil.rmtree(self.test_dir, ignore_errors=True)

    def test_canonical_medial_wall_mask(self):
        mask_l = SurfaceProjectionEngine.get_canonical_medial_wall_mask("L")
        mask_r = SurfaceProjectionEngine.get_canonical_medial_wall_mask("R")

        self.assertEqual(len(mask_l), SurfaceProjectionEngine.FSLR_32K_VERTEX_COUNT)
        self.assertEqual(len(mask_r), SurfaceProjectionEngine.FSLR_32K_VERTEX_COUNT)
        self.assertEqual(sum(mask_l), SurfaceProjectionEngine.MEDIAL_WALL_VERTICES_COUNT)
        self.assertEqual(sum(mask_r), SurfaceProjectionEngine.MEDIAL_WALL_VERTICES_COUNT)

    def test_project_bold_to_surface(self):
        result = SurfaceProjectionEngine.project_bold_to_surface(
            run_meta=self.run_meta,
            denoised_output=self.denoised_output,
            surface_resampling=self.surface_resampling,
            output_directory=self.test_dir,
            simulation_seed=42,
        )

        self.assertEqual(result.subject_id, self.subject_id)
        self.assertEqual(result.run_index, 1)
        self.assertEqual(result.denoising_configuration, "CD-1")
        self.assertGreater(result.mean_tsnr_surface, 50.0)

        # Check Left Hemisphere
        self.assertEqual(result.ts_lh_32k.vertex_count, 32492)
        self.assertEqual(result.ts_lh_32k.valid_vertex_count, 29696)
        self.assertEqual(result.ts_lh_32k.num_timepoints, 100)
        self.assertIsNotNone(result.ts_lh_32k.artifact_gifti_path)
        self.assertTrue(os.path.exists(result.ts_lh_32k.artifact_gifti_path))
        self.assertEqual(len(result.ts_lh_32k.artifact_gifti_sha256), 64)

        # Check Right Hemisphere
        self.assertEqual(result.ts_rh_32k.vertex_count, 32492)
        self.assertEqual(result.ts_rh_32k.valid_vertex_count, 29696)
        self.assertTrue(os.path.exists(result.ts_rh_32k.artifact_gifti_path))

        # Check Medial Wall exclusion
        for v in range(SurfaceProjectionEngine.MEDIAL_WALL_VERTICES_COUNT):
            self.assertEqual(result.ts_lh_32k.data_matrix[v], [0.0] * 100)


if __name__ == "__main__":
    unittest.main()
