"""
Integration Tests for End-to-End Connectome and Therapeutic Circuits Pipeline (Stages 06, 07, 08)
Conforms to MAGNIOM-Implementation & Validation Roadmap v1.0 Section 114
"""

import os
import shutil
import tempfile
import unittest
from magniom_neuro.models.bids import BidsDataset, BidsDatasetDescription, BidsFile
from magniom_neuro.models.bold import MultiEchoRunMetadata
from magniom_neuro.models.denoise import DenoisedTimeSeriesOutput, RetainedTimeSummary
from magniom_neuro.models.circuits import ConnectomePipelineOutput
from magniom_neuro.surfaces.resampling import SurfaceResamplingEngine
from magniom_neuro.worker.connectome_job_handler import ConnectomeProcessingJobHandler


class TestConnectomePipelineIntegration(unittest.TestCase):

    def setUp(self):
        self.test_dir = tempfile.mkdtemp()
        self.subject_id = "sub-MGN7F3A92"

        # 1. Mock Bids Dataset
        desc = BidsDatasetDescription(name="TestBids", bids_version="1.11.1")
        self.bids_dataset = BidsDataset(
            dataset_root=os.path.join(self.test_dir, "bids"),
            subject_id=self.subject_id,
            description=desc,
            files=[],
            is_valid=True,
        )

        # 2. Resample Surfaces to fsLR-32k
        self.surface_resampling = SurfaceResamplingEngine.resample_subject(
            subject_id=self.subject_id,
            output_directory=self.test_dir,
        )

        # 3. Simulate two multi-echo BOLD runs with CD-1 & SD-1 denoising
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

        censor_1 = [False] * 100
        for i in [0, 1, 2, 3, 20, 21, 50, 51]:
            censor_1[i] = True

        censor_2 = [False] * 100
        for i in [0, 1, 2, 3, 10, 11, 60, 61]:
            censor_2[i] = True

        cd1_run1 = DenoisedTimeSeriesOutput(
            denoising_configuration="CD-1",
            run_index=1,
            subject_id=self.subject_id,
            denoised_bold_path=os.path.join(self.test_dir, "denoised_run1_cd1.nii.gz"),
            denoised_bold_sha256="0" * 64,
            nuisance_matrix_path=os.path.join(self.test_dir, "nuisance_run1_cd1.tsv"),
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
            censor_mask=censor_1,
        )

        sd1_run1 = DenoisedTimeSeriesOutput(
            denoising_configuration="SD-1",
            run_index=1,
            subject_id=self.subject_id,
            denoised_bold_path=os.path.join(self.test_dir, "denoised_run1_sd1.nii.gz"),
            nuisance_matrix_path=os.path.join(self.test_dir, "nuisance_run1_sd1.tsv"),
            denoised_bold_sha256="2" * 64,
            nuisance_matrix_sha256="3" * 64,
            bandpass_low_hz=0.009,
            bandpass_high_hz=0.080,
            includes_gsr=False,
            num_regressors=35,
            motion_regressor_expansion="24-parameter Volterra",
            tissue_regressors=["WM_mean", "CSF_mean"],
            variance_explained_by_nuisance=0.24,
            tsnr_pre_denoise=65.0,
            tsnr_post_denoise=112.0,
            retained_time=retained_time_1,
            censor_mask=censor_1,
        )

        cd1_run2 = DenoisedTimeSeriesOutput(
            denoising_configuration="CD-1",
            run_index=2,
            subject_id=self.subject_id,
            denoised_bold_path=os.path.join(self.test_dir, "denoised_run2_cd1.nii.gz"),
            nuisance_matrix_path=os.path.join(self.test_dir, "nuisance_run2_cd1.tsv"),
            denoised_bold_sha256="4" * 64,
            nuisance_matrix_sha256="5" * 64,
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
            censor_mask=censor_2,
        )

        self.bold_results = [
            {"run_index": 1, "cd1": cd1_run1, "sd1": sd1_run1},
            {"run_index": 2, "cd1": cd1_run2, "sd1": None},
        ]

    def tearDown(self):
        shutil.rmtree(self.test_dir, ignore_errors=True)

    def test_execute_connectome_pipeline_end_to_end(self):
        handler = ConnectomeProcessingJobHandler(work_dir=self.test_dir)
        output: ConnectomePipelineOutput = handler.execute_connectome_pipeline(
            bids_dataset=self.bids_dataset,
            surface_resampling=self.surface_resampling,
            bold_results=self.bold_results,
            output_directory=self.test_dir,
            mode="CLINICAL",
            allow_synthetic=True,
        )

        # 1. Output Metadata
        self.assertEqual(output.pipeline_version, "MAGNIOM-CONNECTOME-1.0.0")
        self.assertEqual(output.atlas_name, "HCP-MMP1.0")
        self.assertEqual(output.qc_status, "pass")
        self.assertAlmostEqual(output.retained_minutes, 4.45, places=2)

        # 2. Stage Manifests
        self.assertTrue(os.path.exists(output.surface_manifest_path))
        self.assertTrue(os.path.exists(output.connectome_manifest_path))
        self.assertTrue(os.path.exists(output.circuits_manifest_path))
        self.assertEqual(len(output.surface_manifest_sha256), 64)
        self.assertEqual(len(output.connectome_manifest_sha256), 64)
        self.assertEqual(len(output.circuits_manifest_sha256), 64)

        # 3. Candidate Generation Verification
        self.assertGreaterEqual(len(output.candidates), 2)
        cand_families = [c.target_family_version_id for c in output.candidates]
        self.assertIn("TF-MDD-CONVERGENT-LDLPFC-001", cand_families)
        self.assertIn("TF-MDD-SGACC-LDLPFC-001", cand_families)

        # Verify all candidates are strictly in the left hemisphere or midline (x <= 0)
        for cand in output.candidates:
            self.assertEqual(cand.hemisphere, "L")
            self.assertLessEqual(cand.mni_coordinate.x, 0.0)
            self.assertGreaterEqual(cand.cluster_area_mm2, 50.0)
            self.assertGreaterEqual(cand.circuit_concordance_percentile, 0.5)

        # 4. Circuit Metrics Verification
        self.assertGreaterEqual(len(output.circuit_metrics), 2)
        conv_metric = next(m for m in output.circuit_metrics if m.circuit_version_id == "TC-MDD-CONVERGENT-001")
        self.assertEqual(conv_metric.metric_code, "CONCORDANCE_PERCENTILE")
        self.assertGreater(conv_metric.metric_value, 0.70)

        # 5. Combined FC Verification
        self.assertEqual(output.combined_fc_cd1.num_parcels, 374)
        self.assertEqual(len(output.combined_fc_cd1.run_indices), 2)
        self.assertTrue(os.path.exists(output.combined_fc_cd1.artifact_tsv_path))

    def test_fail_closed_synthetic_in_clinical_mode(self):
        handler = ConnectomeProcessingJobHandler(work_dir=self.test_dir)
        with self.assertRaises(ValueError) as cm:
            handler.execute_connectome_pipeline(
                bids_dataset=self.bids_dataset,
                surface_resampling=self.surface_resampling,
                bold_results=self.bold_results,
                output_directory=self.test_dir,
                mode="CLINICAL",
                allow_synthetic=False,
            )
        self.assertIn("FAIL_CLOSED", str(cm.exception))


if __name__ == "__main__":
    unittest.main()
