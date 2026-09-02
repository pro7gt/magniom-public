"""
Unit Tests for Tedana ME-ICA Decomposition, T2* Estimation, and Component Classification
Conforms to MAGNIOM-Neuroimaging & Functional Connectomics Pipeline Specification v1.0 Sections 49-53
"""

import unittest
import tempfile
import shutil
import os
from magniom_neuro.models.bids import BidsDataset, BidsDatasetDescription
from magniom_neuro.models.structural import StructuralOutputs, TissueSegmentationResult, SpatialRegistrationResult
from magniom_neuro.bold.multi_echo import MultiEchoManager
from magniom_neuro.bold.fmriprep_runner import FMRIPrepRunner
from magniom_neuro.denoise.tedana_runner import TedanaRunner


class TestTedanaMultiEcho(unittest.TestCase):
    """Tests for Tedana multi-echo optimal combination and ME-ICA classification."""

    def setUp(self):
        self.test_dir = tempfile.mkdtemp()
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

        runs = MultiEchoManager.discover_multi_echo_runs(self.bids_dataset)
        self.run_meta = runs[0]
        self.fmriprep_out = FMRIPrepRunner.preprocess_run(
            bids_dataset=self.bids_dataset,
            run_meta=self.run_meta,
            structural_outputs=self.mock_structural,
            output_dir=os.path.join(self.test_dir, "fmriprep"),
            motion_profile="nominal",
        )

    def tearDown(self):
        shutil.rmtree(self.test_dir, ignore_errors=True)

    def test_tedana_runner_optimal_combination(self):
        tedana_out = TedanaRunner.run_tedana(
            run_meta=self.run_meta,
            fmriprep_outputs=self.fmriprep_out,
            output_dir=os.path.join(self.test_dir, "tedana"),
            target_components=30,
        )

        self.assertEqual(tedana_out.run_index, 1)
        self.assertEqual(tedana_out.total_components, 30)
        self.assertGreater(tedana_out.accepted_components, 5)
        self.assertGreater(tedana_out.rejected_components, 5)
        self.assertEqual(tedana_out.accepted_components + tedana_out.rejected_components, 30)
        self.assertTrue(tedana_out.is_automated_classification)
        self.assertIsNone(tedana_out.manual_override_reviewer)

        # T2* coverage checks
        self.assertGreater(tedana_out.t2star_metrics.coverage_fraction, 0.90)
        self.assertGreater(tedana_out.t2star_metrics.t2star_mean_ms, 25.0)
        self.assertLess(tedana_out.t2star_metrics.t2star_mean_ms, 45.0)

        # File artifacts
        self.assertTrue(os.path.exists(tedana_out.optimally_combined_bold_path))
        self.assertTrue(os.path.exists(tedana_out.meica_denoised_bold_path))
        self.assertTrue(os.path.exists(tedana_out.t2star_map_path))
        self.assertTrue(os.path.exists(tedana_out.adaptive_mask_path))


if __name__ == "__main__":
    unittest.main()
