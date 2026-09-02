"""
Unit Tests for Magniom CD-1 Clinical Denoising and SD-1 Sensitivity Engine
Conforms to MAGNIOM-Neuroimaging & Functional Connectomics Pipeline Specification v1.0 Sections 54-60
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
from magniom_neuro.denoise.nuisance import NuisanceModelBuilder
from magniom_neuro.denoise.filter import TemporalFilterEngine
from magniom_neuro.denoise.cd1_engine import CD1DenoisingEngine


class TestCD1Denoising(unittest.TestCase):
    """Tests for CD-1 and SD-1 nuisance regression, bandpass filtering, and output generation."""

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
        self.tedana_out = TedanaRunner.run_tedana(
            run_meta=self.run_meta,
            fmriprep_outputs=self.fmriprep_out,
            output_dir=os.path.join(self.test_dir, "tedana"),
        )

    def tearDown(self):
        shutil.rmtree(self.test_dir, ignore_errors=True)

    def test_nuisance_model_cd1_vs_sd1(self):
        # CD-1 includes GSR
        dmat_cd1, names_cd1 = NuisanceModelBuilder.build_design_matrix(
            motion_params=self.fmriprep_out.motion_parameters,
            non_steady_state=self.fmriprep_out.non_steady_state,
            tr_seconds=self.run_meta.tr_seconds,
            include_gsr=True,
        )
        # SD-1 excludes GSR
        dmat_sd1, names_sd1 = NuisanceModelBuilder.build_design_matrix(
            motion_params=self.fmriprep_out.motion_parameters,
            non_steady_state=self.fmriprep_out.non_steady_state,
            tr_seconds=self.run_meta.tr_seconds,
            include_gsr=False,
        )

        self.assertIn("global_signal_mean", names_cd1)
        self.assertIn("global_signal_dt", names_cd1)
        self.assertNotIn("global_signal_mean", names_sd1)
        self.assertNotIn("global_signal_dt", names_sd1)

        # CD-1 should have exactly 2 more regressors than SD-1
        self.assertEqual(len(names_cd1), len(names_sd1) + 2)
        # 3 polynomial + 24 motion + 4 tissue = 31 (SD-1), + 2 GSR = 33 (CD-1)
        self.assertEqual(len(names_cd1), 33)
        self.assertEqual(len(names_sd1), 31)

    def test_cd1_denoising_engine_execution(self):
        out_dir = os.path.join(self.test_dir, "denoise")
        cd1_out = CD1DenoisingEngine.denoise_run(
            run_meta=self.run_meta,
            fmriprep_outputs=self.fmriprep_out,
            tedana_outputs=self.tedana_out,
            output_dir=out_dir,
            configuration="CD-1",
        )

        self.assertEqual(cd1_out.denoising_configuration, "CD-1")
        self.assertTrue(cd1_out.includes_gsr)
        self.assertEqual(cd1_out.num_regressors, 33)
        self.assertGreater(cd1_out.tsnr_post_denoise, cd1_out.tsnr_pre_denoise)
        self.assertTrue(cd1_out.retained_time.is_above_absolute_minimum)
        self.assertTrue(os.path.exists(cd1_out.denoised_bold_path))
        self.assertTrue(os.path.exists(cd1_out.nuisance_matrix_path))

    def test_sd1_sensitivity_execution(self):
        out_dir = os.path.join(self.test_dir, "denoise")
        sd1_out = CD1DenoisingEngine.denoise_run(
            run_meta=self.run_meta,
            fmriprep_outputs=self.fmriprep_out,
            tedana_outputs=self.tedana_out,
            output_dir=out_dir,
            configuration="SD-1",
        )

        self.assertEqual(sd1_out.denoising_configuration, "SD-1")
        self.assertFalse(sd1_out.includes_gsr)
        self.assertEqual(sd1_out.num_regressors, 31)
        self.assertTrue(os.path.exists(sd1_out.denoised_bold_path))


if __name__ == "__main__":
    unittest.main()
