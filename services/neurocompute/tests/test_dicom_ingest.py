"""
Unit Tests for DICOM Ingestion, Validation, and Zero-PHI Extraction
"""

import unittest
from magniom_neuro.dicom.extractor import DicomExtractor
from magniom_neuro.dicom.validator import DicomValidator
from magniom_neuro.dicom.reader import DicomArchiveReader
from magniom_neuro.models.dicom import DicomStudyMetadata, DicomSeriesMetadata


class TestDicomIngest(unittest.TestCase):
    """Tests for DICOM pseudonymization, metadata extraction, and validation."""

    def test_pseudonymous_subject_id_format(self):
        case_id = "e0000000-0000-0000-0000-000000000001"
        sub_id = DicomExtractor.generate_pseudonymous_subject_id(case_id)
        self.assertTrue(sub_id.startswith("sub-MGN"))
        self.assertEqual(len(sub_id), 13)  # sub-MGN + 6 chars = 13 chars
        # Determinism check
        sub_id2 = DicomExtractor.generate_pseudonymous_subject_id(case_id)
        self.assertEqual(sub_id, sub_id2)

    def test_series_classification(self):
        self.assertEqual(DicomExtractor.classify_series_type("t1_mprage_sag_p2_iso"), "T1w")
        self.assertEqual(DicomExtractor.classify_series_type("rsfMRI_rest_multiecho"), "rest_bold")
        self.assertEqual(DicomExtractor.classify_series_type("gre_field_mapping"), "fieldmap")
        self.assertEqual(DicomExtractor.classify_series_type("dti_64dir"), "dwi")
        self.assertEqual(DicomExtractor.classify_series_type("localizer"), "other")

    def test_zero_phi_sanitization(self):
        raw_metadata = {
            "PatientName": "John Doe",
            "PatientID": "MRN12345",
            "PatientBirthDate": "19800101",
            "ScannerFieldStrength": 3.0,
            "FlipAngle": 8.0,
            "InstitutionName": "Central Hospital",
        }
        clean = DicomExtractor.sanitize_metadata_dict(raw_metadata)
        self.assertNotIn("PatientName", clean)
        self.assertNotIn("PatientID", clean)
        self.assertNotIn("PatientBirthDate", clean)
        self.assertNotIn("InstitutionName", clean)
        self.assertEqual(clean["ScannerFieldStrength"], 3.0)
        self.assertEqual(clean["FlipAngle"], 8.0)

    def test_dicom_validator_valid_study(self):
        study = DicomArchiveReader.read_archive_or_directory(
            input_path="/tmp/dicom.zip",
            case_id="e0000000-0000-0000-0000-000000000001",
        )
        validator = DicomValidator()
        result = validator.validate_study(study)
        self.assertTrue(result.is_valid)
        self.assertTrue(result.has_t1w)
        self.assertTrue(result.has_rest_bold)
        self.assertEqual(len(result.errors), 0)

    def test_dicom_validator_missing_t1w_error(self):
        study = DicomStudyMetadata(
            study_instance_uid="1.2.3.4",
            pseudonymous_subject_id="sub-MGN7F3A92",
            scanner_field_strength_t=3.0,
            series=[],  # No T1w series
        )
        validator = DicomValidator()
        result = validator.validate_study(study)
        self.assertFalse(result.is_valid)
        self.assertIn("MISSING_T1W_SERIES", result.errors[0])


if __name__ == "__main__":
    unittest.main()
