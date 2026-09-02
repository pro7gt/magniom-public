"""
End-to-End Integration Tests for BOLD & Denoising Pipeline
Conforms to MAGNIOM-Implementation & Validation Roadmap v1.0 Section 113
"""

import unittest
import tempfile
import shutil
import os
import json
from magniom_neuro.models.bids import BidsDataset, BidsDatasetDescription
from magniom_neuro.models.structural import StructuralOutputs, TissueSegmentationResult, SpatialRegistrationResult
from magniom_neuro.worker.bold_job_handler import BOLDProcessingJobHandler


class TestBOLDPipelineIntegration(unittest.TestCase):
    """End-to-end integration tests for Stages 03, 04, 05 and validated BOLD time series generation."""

    def setUp(self):
        self.test_dir = tempfile.mkdtemp()
        self.handler = BOLDProcessingJobHandler(work_dir=self.test_dir)
        self.bids_dataset = BidsDataset(
            dataset_root=self.test_dir,
            subject_id="sub-MGN7F3A92",
            description=BidsDatasetDescription(),
            files=[],
            is_valid=True,
        )
        self.mock_structural = StructuralOutputs(
            bias_corrected_t1w_path="/tmp/t1w.nii.gz",
            bias_corrected_t1w_sha256="a" * 64,
            brain_mask_path="/tmp/mask.nii.gz",
            brain_mask_sha256="b" * 64,
            segmentation=TissueSegmentationResult(
                csf_volume_mm3=280000.0,
                gm_volume_mm3=680000.0,
                wm_volume_mm3=490000.0,
                total_brain_volume_mm3=1450000.0,
                csf_fraction=0.193,
                gm_fraction=0.469,
                wm_fraction=0.338,
                segmentation_artifact_sha256="f" * 64,
            ),
            registration=SpatialRegistrationResult(
                template_name="MNI152NLin2009cAsym",
                forward_affine=[[1.0, 0.0, 0.0, 0.0], [0.0, 1.0, 0.0, 0.0], [0.0, 0.0, 1.0, 0.0], [0.0, 0.0, 0.0, 1.0]],
                forward_warp_sha256="g" * 64,
                inverse_warp_sha256="h" * 64,
                dice_overlap=0.965,
                mutual_information=0.912,
            ),
        )

    def tearDown(self):
        shutil.rmtree(self.test_dir, ignore_errors=True)

    def test_nominal_bold_pipeline_execution(self):
        results = self.handler.execute_bold_pipeline(
            bids_dataset=self.bids_dataset,
            structural_outputs=self.mock_structural,
            output_directory=self.test_dir,
            motion_profile="nominal",
            run_sensitivity_sd1=True,
        )

        self.assertEqual(results["overall_status"], "pass")
        self.assertEqual(len(results["runs"]), 2)  # 2 x 15-min runs

        # Verify Stage Manifests exist
        manifests_dir = os.path.join(self.test_dir, "manifests")
        self.assertTrue(os.path.exists(os.path.join(manifests_dir, "03-fmriprep.json")))
        self.assertTrue(os.path.exists(os.path.join(manifests_dir, "04-tedana.json")))
        self.assertTrue(os.path.exists(os.path.join(manifests_dir, "05-denoise.json")))

        # Check content of 05-denoise.json
        with open(os.path.join(manifests_dir, "05-denoise.json"), "r") as f:
            denoise_manifest = json.load(f)
            self.assertEqual(denoise_manifest["stage_name"], "MAGNIOM_DENOISE_CD1")
            self.assertEqual(denoise_manifest["status"], "passed")
            self.assertEqual(denoise_manifest["denoising_configuration"], "CD-1")
            self.assertTrue(denoise_manifest["nuisance_parameters"]["includes_gsr"])

        # Check run 1 outputs
        r1 = results["runs"][0]
        self.assertTrue(os.path.exists(r1["cd1"].denoised_bold_path))
        self.assertTrue(os.path.exists(r1["sd1"].denoised_bold_path))
        self.assertEqual(r1["qc_evaluation"].overall_status, "pass")

    def test_severe_motion_bold_pipeline_execution(self):
        results = self.handler.execute_bold_pipeline(
            bids_dataset=self.bids_dataset,
            structural_outputs=self.mock_structural,
            output_directory=self.test_dir,
            motion_profile="severe",
            run_sensitivity_sd1=False,
        )

        self.assertEqual(results["overall_status"], "fail")
        self.assertGreater(len(results["warnings"]), 0)


if __name__ == "__main__":
    unittest.main()
