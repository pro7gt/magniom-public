"""
Unit Tests for Multi-Echo rs-fMRI Series Management and fMRIPrep Minimal Preprocessing
Conforms to MAGNIOM-Neuroimaging & Functional Connectomics Pipeline Specification v1.0 Sections 44-48
"""

import unittest
import tempfile
import shutil
import os
from magniom_neuro.models.bids import BidsDataset, BidsFile, BidsDatasetDescription
from magniom_neuro.models.structural import StructuralOutputs, TissueSegmentationResult, SpatialRegistrationResult
from magniom_neuro.bold.multi_echo import MultiEchoManager
from magniom_neuro.bold.fmriprep_runner import FMRIPrepRunner


class TestBOLDPreprocessing(unittest.TestCase):
    """Tests for multi-echo rs-fMRI discovery, validation, and fMRIPrep minimal preprocessing."""

    def setUp(self):
        self.test_dir = tempfile.mkdtemp()
        self.bids_dataset = BidsDataset(
            dataset_root=self.test_dir,
            subject_id="sub-MGN7F3A92",
            description=BidsDatasetDescription(),
            files=[
                BidsFile(
                    relative_path="sub-MGN7F3A92/func/sub-MGN7F3A92_task-rest_run-01_echo-1_bold.nii.gz",
                    modality="func",
                    suffix="bold",
                    extension=".nii.gz",
                    sha256="1" * 64,
                    size_bytes=25000000,
                ),
                BidsFile(
                    relative_path="sub-MGN7F3A92/func/sub-MGN7F3A92_task-rest_run-01_echo-2_bold.nii.gz",
                    modality="func",
                    suffix="bold",
                    extension=".nii.gz",
                    sha256="2" * 64,
                    size_bytes=25000000,
                ),
                BidsFile(
                    relative_path="sub-MGN7F3A92/func/sub-MGN7F3A92_task-rest_run-01_echo-3_bold.nii.gz",
                    modality="func",
                    suffix="bold",
                    extension=".nii.gz",
                    sha256="3" * 64,
                    size_bytes=25000000,
                ),
                BidsFile(
                    relative_path="sub-MGN7F3A92/func/sub-MGN7F3A92_task-rest_run-01_echo-4_bold.nii.gz",
                    modality="func",
                    suffix="bold",
                    extension=".nii.gz",
                    sha256="4" * 64,
                    size_bytes=25000000,
                ),
            ],
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

    def test_discover_multi_echo_runs(self):
        runs = MultiEchoManager.discover_multi_echo_runs(self.bids_dataset)
        self.assertEqual(len(runs), 1)
        run1 = runs[0]
        self.assertEqual(run1.run_index, 1)
        self.assertEqual(len(run1.echoes), 4)
        self.assertEqual(run1.echoes[0].echo_time_ms, 12.0)
        self.assertEqual(run1.echoes[1].echo_time_ms, 28.0)
        self.assertEqual(run1.echoes[2].echo_time_ms, 44.0)
        self.assertEqual(run1.echoes[3].echo_time_ms, 60.0)

    def test_validate_multi_echo_consistency(self):
        runs = MultiEchoManager.discover_multi_echo_runs(self.bids_dataset)
        is_valid, errors = MultiEchoManager.validate_multi_echo_consistency(runs[0])
        self.assertTrue(is_valid)
        self.assertEqual(len(errors), 0)

    def test_fmriprep_runner_nominal_preprocessing(self):
        runs = MultiEchoManager.discover_multi_echo_runs(self.bids_dataset)
        out_dir = os.path.join(self.test_dir, "fmriprep_out")
        outputs = FMRIPrepRunner.preprocess_run(
            bids_dataset=self.bids_dataset,
            run_meta=runs[0],
            structural_outputs=self.mock_structural,
            output_dir=out_dir,
            motion_profile="nominal",
        )

        self.assertEqual(outputs.run_index, 1)
        self.assertEqual(outputs.subject_id, "sub-MGN7F3A92")
        self.assertEqual(outputs.non_steady_state.num_non_steady_state_volumes, 4)
        self.assertEqual(outputs.non_steady_state.non_steady_state_indices, [0, 1, 2, 3])
        self.assertLess(outputs.motion_parameters.mean_fd_mm, 0.20)
        self.assertGreater(outputs.t1w_coregistration_dice, 0.90)
        self.assertEqual(len(outputs.realigned_echo_paths), 4)
        self.assertTrue(os.path.exists(outputs.bold_reference_path))
        self.assertTrue(os.path.exists(outputs.confounds_tsv_path))


if __name__ == "__main__":
    unittest.main()
