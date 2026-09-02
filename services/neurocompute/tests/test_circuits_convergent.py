"""
Unit Tests for Convergent Depression Circuit Engine
Conforms to MAGNIOM-Evidence Knowledge Graph & Therapeutic Circuit Library v1.0 Sections 44-51
and MAGNIOM-Neuroimaging & Functional Connectomics Pipeline Specification v1.0 Sections 88-90
"""

import os
import shutil
import tempfile
import unittest
from magniom_neuro.models.bold import MultiEchoRunMetadata
from magniom_neuro.models.denoise import DenoisedTimeSeriesOutput, RetainedTimeSummary
from magniom_neuro.surfaces.resampling import SurfaceResamplingEngine
from magniom_neuro.surfaces.projection import SurfaceProjectionEngine
from magniom_neuro.circuits.convergent import ConvergentCircuitEngine


class TestConvergentCircuitEngine(unittest.TestCase):

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

    def tearDown(self):
        shutil.rmtree(self.test_dir, ignore_errors=True)

    def test_canonical_circuit_weights(self):
        weights = ConvergentCircuitEngine.get_canonical_circuit_weights()
        self.assertEqual(len(weights), 32492)
        # DLPFC area has positive weights
        self.assertGreater(weights[15000], 0.0)
        # DMN / subgenual area has negative weights
        self.assertLess(weights[25000], 0.0)

    def test_compute_convergent_circuit(self):
        result = ConvergentCircuitEngine.compute_convergent_circuit(
            subject_id=self.subject_id,
            surface_projection=self.surface_projection,
            output_directory=self.test_dir,
        )

        self.assertEqual(result.circuit_id, "TC-MDD-CONVERGENT-001")
        self.assertEqual(result.target_family_id, "TF-MDD-CONVERGENT-LDLPFC-001")
        self.assertEqual(result.circuit_map_id, "CIRCUITMAP-MDD-CONVERGENT-001")
        self.assertEqual(result.subject_id, self.subject_id)
        self.assertEqual(len(result.circuit_time_series), 100)
        self.assertEqual(len(result.concordance_surface_map), 32492)

        # Check candidate vertex & MNI coordinate
        self.assertEqual(result.medoid_vertex.hemisphere, "L")
        self.assertEqual(result.medoid_vertex.space, "fsLR_32k")
        self.assertEqual(result.medoid_mni.space, "MNI152NLin2009cAsym")
        self.assertLess(result.medoid_mni.x, 0.0)

        # Check cluster area and qualification
        self.assertGreaterEqual(result.cluster_area_mm2, 50.0)
        self.assertTrue(result.is_qualified)

        # Check percentile concordance and incremental gain
        self.assertGreater(result.percentile_concordance, 0.70)
        self.assertGreater(result.incremental_gain, 0.0)

        # Check artifact export
        self.assertIsNotNone(result.artifact_path)
        self.assertTrue(os.path.exists(result.artifact_path))
        self.assertEqual(len(result.artifact_sha256), 64)


if __name__ == "__main__":
    unittest.main()
