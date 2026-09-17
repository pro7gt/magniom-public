"""
Unit Tests for Artifact Validation and Manifest Provenance Integrity.
Conforms to MAGNIOM Revision 02 Findings P1-3 & P1-4 (§4 & §5).
"""

import os
import struct
import tempfile
import unittest
from dataclasses import FrozenInstanceError

from magniom_neuro.io.artifact_validator import ArtifactValidator
from magniom_neuro.io.manifests import (
    SourceArtifactRecord,
    PreprocessingProvenance,
    MeasurementArtifactManifest,
    ArtifactManifestBuilder,
)


class TestArtifactValidationAndManifests(unittest.TestCase):

    def setUp(self):
        self.test_dir = tempfile.mkdtemp()

    def tearDown(self):
        import shutil
        if os.path.exists(self.test_dir):
            shutil.rmtree(self.test_dir)

    def _create_minimal_nifti(self, filename: str, shape=(10, 10, 10), bitpix=16) -> str:
        """Helper to create a binary NIfTI-1 file with header and empty payload."""
        filepath = os.path.join(self.test_dir, filename)
        header = bytearray(352)
        # sizeof_hdr = 348
        struct.pack_into("<i", header, 0, 348)
        # dim: [3, shape[0], shape[1], shape[2], 1, 1, 1, 1]
        struct.pack_into("<8h", header, 40, 3, shape[0], shape[1], shape[2], 1, 1, 1, 1)
        # datatype = 4 (INT16), bitpix = 16
        struct.pack_into("<h", header, 70, 4)
        struct.pack_into("<h", header, 72, bitpix)
        # pixdim: [0, 2.0, 2.0, 2.0, 0, 0, 0, 0]
        struct.pack_into("<8f", header, 76, 0.0, 2.0, 2.0, 2.0, 0.0, 0.0, 0.0, 0.0)
        # magic: "n+1\0"
        header[344:348] = b"n+1\x00"

        # Payload
        n_voxels = shape[0] * shape[1] * shape[2]
        payload = bytes(n_voxels * (bitpix // 8))
        with open(filepath, "wb") as f:
            f.write(header)
            f.write(payload)
        return filepath

    def test_nifti_valid_requires_explicit_origin_authority(self):
        """Format-valid NIfTI does NOT default to patient_measured without ingestion authority."""
        nii_path = self._create_minimal_nifti("valid.nii")

        # Without declared authority -> 'unknown'
        res_no_auth = ArtifactValidator.validate_nifti(nii_path)
        self.assertTrue(res_no_auth.valid)
        self.assertEqual(res_no_auth.file_type, "nifti_3d")
        self.assertEqual(res_no_auth.data_origin, "unknown")

        # With declared authority -> 'patient_measured'
        res_auth = ArtifactValidator.validate_nifti(nii_path, declared_origin="patient_measured")
        self.assertTrue(res_auth.valid)
        self.assertEqual(res_auth.data_origin, "patient_measured")

    def test_nifti_truncated_payload_fails_validation(self):
        """Uncompressed NIfTI with truncated payload fails validation."""
        filepath = os.path.join(self.test_dir, "truncated.nii")
        header = bytearray(352)
        struct.pack_into("<i", header, 0, 348)
        struct.pack_into("<8h", header, 40, 3, 100, 100, 100, 1, 1, 1, 1)  # 1,000,000 voxels
        struct.pack_into("<h", header, 70, 4)
        struct.pack_into("<h", header, 72, 16)
        struct.pack_into("<8f", header, 76, 0.0, 1.0, 1.0, 1.0, 0.0, 0.0, 0.0, 0.0)
        header[344:348] = b"n+1\x00"

        # Write only 100 bytes of payload instead of 2,000,000 bytes
        with open(filepath, "wb") as f:
            f.write(header)
            f.write(bytes(100))

        res = ArtifactValidator.validate_nifti(filepath)
        self.assertFalse(res.valid)
        self.assertTrue(any("truncated" in err.lower() for err in res.errors))

    def test_gifti_elementtree_validation(self):
        """Validates XML structure of GIFTI files and rejects superficial markers."""
        # Malformed XML containing <GIFTI marker
        bad_gii = os.path.join(self.test_dir, "fake.gii")
        with open(bad_gii, "w") as f:
            f.write("<?xml version='1.0'?><GIFTI><broken unclosed tag")

        res_bad = ArtifactValidator.validate_gifti(bad_gii)
        self.assertFalse(res_bad.valid)
        self.assertEqual(res_bad.file_type, "invalid")

        # Well-formed GIFTI without DataArray
        empty_gii = os.path.join(self.test_dir, "empty.gii")
        with open(empty_gii, "w") as f:
            f.write("<?xml version='1.0'?><GIFTI><MetaData></MetaData></GIFTI>")

        res_empty = ArtifactValidator.validate_gifti(empty_gii)
        self.assertFalse(res_empty.valid)
        self.assertTrue(any("DataArray" in err for err in res_empty.errors))

        # Well-formed GIFTI with DataArray
        good_gii = os.path.join(self.test_dir, "good.gii")
        with open(good_gii, "w") as f:
            f.write("<?xml version='1.0'?><GIFTI><DataArray Intent='NIFTI_INTENT_POINTSET'></DataArray></GIFTI>")

        res_good = ArtifactValidator.validate_gifti(good_gii, declared_origin="patient_measured")
        self.assertTrue(res_good.valid)
        self.assertEqual(res_good.file_type, "gifti_surface")
        self.assertEqual(res_good.data_origin, "patient_measured")

    def test_manifest_provenance_immutability(self):
        """Ensures manifests and provenance records are frozen dataclasses."""
        prov = PreprocessingProvenance(mean_framewise_displacement_mm=0.15)
        with self.assertRaises(FrozenInstanceError):
            prov.mean_framewise_displacement_mm = 0.20  # type: ignore

        source = SourceArtifactRecord(
            path="/tmp/test.nii",
            sha256="abc",
            file_type="nifti_3d",
            size_bytes=1000,
            data_origin="patient_measured",
        )
        with self.assertRaises(FrozenInstanceError):
            source.data_origin = "synthetic"  # type: ignore

        manifest = ArtifactManifestBuilder.create_manifest(
            manifest_id="MAN-001",
            case_id="CASE-001",
            modality="bold_fmri",
            data_origin="patient_measured",
            source_artifacts=[source],
            preprocessing=prov,
        )
        self.assertIsInstance(manifest.source_artifacts, tuple)
        with self.assertRaises(FrozenInstanceError):
            manifest.manifest_id = "MAN-002"  # type: ignore

    def test_manifest_builder_no_fabricated_defaults(self):
        """Ensures PreprocessingProvenance without arguments defaults fields to None."""
        empty_prep = PreprocessingProvenance()
        self.assertIsNone(empty_prep.toolchain)
        self.assertIsNone(empty_prep.pipeline_version)
        self.assertIsNone(empty_prep.mean_framewise_displacement_mm)
        self.assertIsNone(empty_prep.total_volumes_count)
        self.assertIsNone(empty_prep.spatial_smoothing_fwhm_mm)


if __name__ == "__main__":
    unittest.main()
