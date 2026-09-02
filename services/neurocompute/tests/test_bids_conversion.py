"""
Unit Tests for BIDS 1.11.1 Conversion and Validation
"""

import unittest
import tempfile
import shutil
import os
import json
from magniom_neuro.bids.converter import BidsConverter
from magniom_neuro.bids.validator import BidsValidator
from magniom_neuro.dicom.reader import DicomArchiveReader


class TestBidsConversion(unittest.TestCase):
    """Tests for BIDS 1.11.1 converter and validator."""

    def setUp(self):
        self.test_dir = tempfile.mkdtemp()
        self.study = DicomArchiveReader.read_archive_or_directory(
            input_path="/tmp/dicom.zip",
            case_id="e0000000-0000-0000-0000-000000000001",
        )

    def tearDown(self):
        shutil.rmtree(self.test_dir, ignore_errors=True)

    def test_bids_conversion_structure(self):
        bids_dataset = BidsConverter.convert(self.study, self.test_dir)
        self.assertTrue(bids_dataset.is_valid)
        self.assertTrue(bids_dataset.subject_id.startswith("sub-MGN"))

        # Verify dataset_description.json
        desc_path = os.path.join(self.test_dir, "dataset_description.json")
        self.assertTrue(os.path.exists(desc_path))
        with open(desc_path, "r", encoding="utf-8") as f:
            desc_data = json.load(f)
        self.assertEqual(desc_data["BIDSVersion"], "1.11.1")
        self.assertEqual(desc_data["Name"], "Magniom clinical connectomics input")

        # Verify T1w Anat file exists
        sub_id = bids_dataset.subject_id
        anat_nii = os.path.join(self.test_dir, sub_id, "anat", f"{sub_id}_T1w.nii.gz")
        anat_json = os.path.join(self.test_dir, sub_id, "anat", f"{sub_id}_T1w.json")
        self.assertTrue(os.path.exists(anat_nii))
        self.assertTrue(os.path.exists(anat_json))

        # Verify sidecar contains RepetitionTime and Modality
        with open(anat_json, "r", encoding="utf-8") as f:
            sidecar = json.load(f)
        self.assertEqual(sidecar["Modality"], "MR")
        self.assertEqual(sidecar["MagneticFieldStrength"], 3.0)

    def test_bids_validator_passes_valid_dataset(self):
        bids_dataset = BidsConverter.convert(self.study, self.test_dir)
        is_valid, errors, warnings = BidsValidator.validate_dataset(bids_dataset)
        self.assertTrue(is_valid)
        self.assertEqual(len(errors), 0)


if __name__ == "__main__":
    unittest.main()
