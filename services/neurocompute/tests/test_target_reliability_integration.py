"""
Integration Tests for Target Reliability Stage 11 and End-to-End Connectome Pipeline
Conforms to MAGNIOM-Implementation & Validation Roadmap v1.0 Section 115
and MAGNIOM-Neuroimaging & Functional Connectomics Pipeline Specification v1.0 Section 150
"""

import unittest
import os
import shutil
import tempfile
import json
from magniom_neuro.worker.connectome_job_handler import ConnectomeProcessingJobHandler
from magniom_neuro.models.bids import BidsDataset, BidsDatasetDescription, BidsFile
from magniom_neuro.models.denoise import DenoisedTimeSeriesOutput, RetainedTimeSummary
from magniom_neuro.surfaces.resampling import SurfaceResamplingEngine


class TestTargetReliabilityIntegration(unittest.TestCase):
    """Verifies complete execution of Stage 11 (Target Reliability) within the connectome pipeline."""

    def setUp(self):
        self.test_dir = tempfile.mkdtemp(prefix="magniom_reliability_test_")
        self.subject_id = "sub-001"

        # Setup mock BIDS dataset
        desc = BidsDatasetDescription(name="Synthetic BIDS", bids_version="1.9.0")
        self.bids_dataset = BidsDataset(
            dataset_root=self.test_dir,
            subject_id=self.subject_id,
            description=desc,
            files=[
                BidsFile(
                    relative_path="sub-001/anat/sub-001_T1w.nii.gz",
                    modality="anat",
                    suffix="T1w",
                    extension=".nii.gz",
                    sha256="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                    size_bytes=1000,
                ),
            ],
            is_valid=True,
        )

        # Setup mock surface resampling
        self.surface_resampling = SurfaceResamplingEngine.resample_subject(
            subject_id=self.subject_id,
            output_directory=self.test_dir,
        )

        # Setup 2 BOLD runs with CD-1 and SD-1
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
            denoised_bold_sha256="4" * 64,
            nuisance_matrix_path=os.path.join(self.test_dir, "nuisance_run2_cd1.tsv"),
            nuisance_matrix_sha256="5" * 64,
            bandpass_low_hz=0.009,
            bandpass_high_hz=0.080,
            includes_gsr=True,
            num_regressors=36,
            motion_regressor_expansion="24-parameter Volterra",
            tissue_regressors=["WM_mean", "CSF_mean"],
            variance_explained_by_nuisance=0.29,
            tsnr_pre_denoise=63.0,
            tsnr_post_denoise=115.0,
            retained_time=retained_time_2,
            censor_mask=censor_2,
        )

        sd1_run2 = DenoisedTimeSeriesOutput(
            denoising_configuration="SD-1",
            run_index=2,
            subject_id=self.subject_id,
            denoised_bold_path=os.path.join(self.test_dir, "denoised_run2_sd1.nii.gz"),
            nuisance_matrix_path=os.path.join(self.test_dir, "nuisance_run2_sd1.tsv"),
            denoised_bold_sha256="6" * 64,
            nuisance_matrix_sha256="7" * 64,
            bandpass_low_hz=0.009,
            bandpass_high_hz=0.080,
            includes_gsr=False,
            num_regressors=35,
            motion_regressor_expansion="24-parameter Volterra",
            tissue_regressors=["WM_mean", "CSF_mean"],
            variance_explained_by_nuisance=0.25,
            tsnr_pre_denoise=63.0,
            tsnr_post_denoise=109.0,
            retained_time=retained_time_2,
            censor_mask=censor_2,
        )

        self.bold_results = [
            {"run_index": 1, "cd1": cd1_run1, "sd1": sd1_run1},
            {"run_index": 2, "cd1": cd1_run2, "sd1": sd1_run2},
        ]

    def tearDown(self):
        if os.path.exists(self.test_dir):
            shutil.rmtree(self.test_dir)

    def test_complete_connectome_reliability_pipeline(self):
        handler = ConnectomeProcessingJobHandler(work_dir=self.test_dir)
        output = handler.execute_connectome_pipeline(
            bids_dataset=self.bids_dataset,
            surface_resampling=self.surface_resampling,
            bold_results=self.bold_results,
            output_directory=self.test_dir,
            mode="CLINICAL",
        )

        self.assertIsNotNone(output)
        self.assertEqual(output.qc_status, "pass")
        self.assertGreater(len(output.candidates), 0)

        # 1. Verify Stage 11 output manifest
        self.assertIsNotNone(output.reliability_manifest_path)
        self.assertTrue(os.path.exists(output.reliability_manifest_path))
        self.assertIsNotNone(output.reliability_manifest_sha256)

        with open(output.reliability_manifest_path, "r", encoding="utf-8") as f:
            rel_manifest = json.load(f)

        self.assertEqual(rel_manifest["stage_number"], "11")
        self.assertEqual(rel_manifest["stage_name"], "TARGET_RELIABILITY")
        self.assertEqual(rel_manifest["status"], "passed")
        self.assertEqual(rel_manifest["profiles_count"], len(output.candidates))
        self.assertIn("reliability_class_distribution", rel_manifest)
        self.assertIn("high", rel_manifest["reliability_class_distribution"])

        # 2. Verify Reliability Profiles
        self.assertEqual(len(output.reliability_profiles), len(output.candidates))
        for prof in output.reliability_profiles:
            self.assertIsNotNone(prof.id)
            self.assertIn(prof.reliability_class, ["high", "moderate", "low", "unreliable"])
            self.assertGreaterEqual(prof.overall_reliability_score, 0.0)
            self.assertLessEqual(prof.overall_reliability_score, 1.0)
            self.assertIsNotNone(prof.split_half_result)
            self.assertIsNotNone(prof.cross_run_result)
            self.assertTrue(prof.cross_run_result.assessed)
            self.assertIsNotNone(prof.sensitivity_result)
            self.assertTrue(prof.sensitivity_result.assessed)
            self.assertIsNotNone(prof.target_confidence_region)

        # 3. Verify Candidate Reliability Scores are updated
        for cand in output.candidates:
            self.assertGreater(cand.reliability_score, 0.0)


if __name__ == "__main__":
    unittest.main()
