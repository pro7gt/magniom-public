"""
Unit Tests for Structural Coordinate Transformations & Round-Trip Validation
Conforms to MAGNIOM-Neuroimaging & Functional Connectomics Pipeline Specification v1.0 Section 174 & 175
"""

import unittest
from magniom_neuro.structural.coordinate_transform import (
    AffineMatrix4x4,
    CANONICAL_MNI_AFFINE,
    CoordinateTransformEngine,
)


class TestCoordinateRoundTrip(unittest.TestCase):
    """Tests 4x4 affine math, Section 174 round-trips, and Section 175 laterality invariants."""

    def test_affine_matrix_determinant_and_inversion(self):
        matrix = [
            [1.0, 0.0, 0.0, 10.0],
            [0.0, 2.0, 0.0, -5.0],
            [0.0, 0.0, 3.0, 15.0],
            [0.0, 0.0, 0.0, 1.0],
        ]
        affine = AffineMatrix4x4(matrix=matrix)
        det = affine.determinant()
        self.assertAlmostEqual(det, 6.0, places=4)

        inv = affine.invert()
        self.assertIsNotNone(inv)

        test_pt = (5.0, -3.0, 2.0)
        forward_pt = affine.transform_point(test_pt)
        recon_pt = inv.transform_point(forward_pt)

        self.assertAlmostEqual(recon_pt[0], test_pt[0], places=3)
        self.assertAlmostEqual(recon_pt[1], test_pt[1], places=3)
        self.assertAlmostEqual(recon_pt[2], test_pt[2], places=3)

    def test_canonical_mni_affine_forward_and_inverse_round_trip(self):
        native_pt = (-38.5, 28.2, 35.4)
        forward_mni = CANONICAL_MNI_AFFINE.transform_point(native_pt)
        inv_affine = CANONICAL_MNI_AFFINE.invert()
        recon_native = inv_affine.transform_point(forward_mni)

        error = CoordinateTransformEngine.euclidean_distance_3d(native_pt, recon_native)
        self.assertLess(error, 0.001)  # Sub-micron error

    def test_section_175_laterality_safety_invariant(self):
        # Left hemisphere target in RAS must have negative X
        left_valid_coord = (-44.0, 38.0, 32.0)
        valid, reason = CoordinateTransformEngine.verify_laterality(left_valid_coord, "L", "RAS")
        self.assertTrue(valid)
        self.assertIsNone(reason)

        # Corrupted right-side coordinate for Left target fails immediately
        left_invalid_coord = (44.0, 38.0, 32.0)
        invalid, reason = CoordinateTransformEngine.verify_laterality(left_invalid_coord, "L", "RAS")
        self.assertFalse(invalid)
        self.assertIn("Laterality invariant violation", reason)

        # Right hemisphere target in RAS must have positive X
        right_valid_coord = (40.0, 35.0, 28.0)
        r_valid, _ = CoordinateTransformEngine.verify_laterality(right_valid_coord, "R", "RAS")
        self.assertTrue(r_valid)

    def test_ras_lps_orientation_conversion(self):
        ras_coord = (-42.0, 38.0, 30.0)
        lps_coord = CoordinateTransformEngine.convert_orientation(ras_coord, "RAS", "LPS")

        self.assertEqual(lps_coord[0], 42.0)
        self.assertEqual(lps_coord[1], -38.0)
        self.assertEqual(lps_coord[2], 30.0)

        recon_ras = CoordinateTransformEngine.convert_orientation(lps_coord, "LPS", "RAS")
        self.assertEqual(recon_ras, ras_coord)

    def test_section_174_neuronavigation_export_import_brainsight(self):
        report = CoordinateTransformEngine.execute_round_trip_validation(
            target_id="TGT-MDD-001",
            target_label="PRIMARY_1_TF-MDD-SGACC-LDLPFC-001",
            native_coord=(-41.2, 27.4, 38.6),
            format_type="BRAINSIGHT",
            tolerance_mm=0.001,
            hemisphere="L",
        )

        self.assertTrue(report.pass_round_trip)
        self.assertTrue(report.pass_laterality)
        self.assertTrue(report.pass_orientation)
        self.assertLess(report.round_trip_error_mm, 0.001)
        self.assertGreater(len(report.execution_trace), 4)

    def test_section_174_neuronavigation_export_import_localite(self):
        report = CoordinateTransformEngine.execute_round_trip_validation(
            target_id="TGT-MDD-002",
            target_label="PRIMARY_2_TF-MDD-DYSPHORIC-001",
            native_coord=(-39.8, 30.1, 35.2),
            format_type="LOCALITE",
            tolerance_mm=0.001,
            hemisphere="L",
        )

        self.assertTrue(report.pass_round_trip)
        self.assertTrue(report.pass_laterality)
        self.assertLess(report.round_trip_error_mm, 0.001)


if __name__ == "__main__":
    unittest.main()
