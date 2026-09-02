"""
Unit Tests for Structural Preprocessing, Segmentation, and MNI Normalization
"""

import unittest
import tempfile
import shutil
import os
from magniom_neuro.bids.converter import BidsConverter
from magniom_neuro.structural.preprocessor import StructuralPreprocessor
from magniom_neuro.dicom.reader import DicomArchiveReader


class TestStructural(unittest.TestCase):
    """Tests for T1w bias correction, skull-stripping, tissue segmentation, and MNI registration."""

    def setUp(self):
        self.test_dir = tempfile.mkdtemp()
        self.study = DicomArchiveReader.read_archive_or_directory(
            input_path="/tmp/dicom.zip",
            case_id="e0000000-0000-0000-0000-000000000001",
        )
        self.bids_dataset = BidsConverter.convert(self.study, os.path.join(self.test_dir, "bids"))

    def tearDown(self):
        shutil.rmtree(self.test_dir, ignore_errors=True)

    def test_structural_preprocessor_execution(self):
        struct_out = os.path.join(self.test_dir, "structural")
        outputs = StructuralPreprocessor.process_t1w(self.bids_dataset, struct_out)

        # 1. Bias-corrected T1w exists
        self.assertTrue(os.path.exists(outputs.bias_corrected_t1w_path))
        self.assertEqual(len(outputs.bias_corrected_t1w_sha256), 64)

        # 2. Brain mask exists
        self.assertTrue(os.path.exists(outputs.brain_mask_path))
        self.assertEqual(len(outputs.brain_mask_sha256), 64)

        # 3. Tissue segmentation fractions sum to 1.0
        seg = outputs.segmentation
        self.assertAlmostEqual(seg.csf_fraction + seg.gm_fraction + seg.wm_fraction, 1.0, places=4)
        self.assertGreater(seg.total_brain_volume_mm3, 1000000.0)

        # 4. MNI spatial registration
        reg = outputs.registration
        self.assertEqual(reg.template_name, "MNI152NLin2009cAsym")
        self.assertGreaterEqual(reg.dice_overlap, 0.88)
        self.assertEqual(len(reg.forward_affine), 4)
        self.assertEqual(len(reg.forward_affine[0]), 4)


if __name__ == "__main__":
    unittest.main()
