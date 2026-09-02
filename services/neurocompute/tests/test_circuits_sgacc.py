"""
Unit Tests for sgACC Anticorrelation Circuit Engine
Conforms to MAGNIOM-Evidence Knowledge Graph & Therapeutic Circuit Library v1.0 Sections 35-42
and MAGNIOM-Target Engine & Ranking Algorithm Specification v1.0 Sections 34-40
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
from magniom_neuro.circuits.sgacc import SgaccCircuitEngine


class TestSgaccCircuitEngine(unittest.TestCase):

    def setUp(self):
        self.test_dir = tempfile.mkdtemp()
        self.subject_id = "sub-MGN7F3A92"

        self.surface_resampling = SurfaceResamplingEngine.resample_subject(
            subject_id=self.subject_id,
            output_directory=self.test_dir,
        )

        run_meta = MultiEchoRunMetadata(
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

        denoised_output = DenoisedTimeSeriesOutput(
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
            censor_mask=[False] * 100,
        )

        self.surface_projection = SurfaceProjectionEngine.project_bold_to_surface(
            run_meta=run_meta,
            denoised_output=denoised_output,
            surface_resampling=self.surface_resampling,
            output_directory=self.test_dir,
            simulation_seed=42,
        )

        p_series = ParcelSeriesExtractor.extract_parcel_series(
            subject_id=self.subject_id,
            run_index=1,
            surface_projection=self.surface_projection,
            denoised_output=denoised_output,
            output_directory=self.test_dir,
        )

        self.run_fc = FunctionalConnectivityEngine.compute_run_fc(
            parcel_series=p_series,
            denoised_output=denoised_output,
            output_directory=self.test_dir,
        )

        self.combined_fc = FunctionalConnectivityEngine.combine_runs_fc(
            run_fc_list=[self.run_fc],
            output_directory=self.test_dir,
        )

    def tearDown(self):
        shutil.rmtree(self.test_dir, ignore_errors=True)

    def test_compute_sgacc_circuit(self):
        result = SgaccCircuitEngine.compute_sgacc_circuit(
            subject_id=self.subject_id,
            surface_projection=self.surface_projection,
            combined_fc=self.combined_fc,
            output_directory=self.test_dir,
        )

        self.assertEqual(result.seed_id, "SEED-SGACC-001")
        self.assertEqual(result.target_family_id, "TF-MDD-SGACC-LDLPFC-001")
        self.assertEqual(result.subject_id, self.subject_id)
        self.assertEqual(len(result.anticorrelation_map), 32492)
        self.assertGreater(len(result.search_space_vertices), 500)

        # Check candidate vertex & coordinate
        self.assertEqual(result.medoid_vertex.hemisphere, "L")
        self.assertEqual(result.medoid_vertex.space, "fsLR_32k")
        self.assertEqual(result.medoid_mni.space, "MNI152NLin2009cAsym")
        self.assertLess(result.medoid_mni.x, 0.0)

        # Check cluster area and qualification
        self.assertGreaterEqual(result.cluster_area_mm2, 50.0)
        self.assertTrue(result.is_qualified)

        # Concordance percentile
        self.assertGreater(result.concordance_score, 0.70)
        self.assertLessEqual(result.concordance_score, 1.0)

        # Artifact map check
        self.assertIsNotNone(result.artifact_path)
        self.assertTrue(os.path.exists(result.artifact_path))
        self.assertEqual(len(result.artifact_sha256), 64)


if __name__ == "__main__":
    unittest.main()
