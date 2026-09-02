"""
Unit Tests for Structural QC Evaluator and Gate Decision Logic
"""

import unittest
from magniom_neuro.models.qc import StructuralQCMetrics
from magniom_neuro.qc.evaluator import StructuralQCGateEvaluator


class TestQCEvaluator(unittest.TestCase):
    """Tests for automated QC Gate Pass/Conditional/Fail rules and warning generation."""

    def setUp(self):
        self.evaluator = StructuralQCGateEvaluator()
        self.base_valid_metrics = StructuralQCMetrics(
            snr_t1w=19.2,
            cnr_t1w=4.5,
            euler_holes_lh=8,
            euler_holes_rh=10,
            total_euler_number=4,
            surface_self_intersections_lh=0,
            surface_self_intersections_rh=0,
            cortical_thickness_mean_mm=2.54,
            cortical_thickness_std_mm=0.38,
            cortical_thickness_min_mm=1.20,
            cortical_thickness_max_mm=4.80,
            cortical_thickness_outlier_fraction=0.001,
            brain_mask_volume_mm3=1480000.0,
            csf_fraction=0.14,
            gm_fraction=0.46,
            wm_fraction=0.40,
            mni_registration_overlap_dice=0.94,
            mni_mutual_information=0.82,
        )

    def test_passing_qc_gate(self):
        result = self.evaluator.evaluate(self.base_valid_metrics)
        self.assertEqual(result.overall_status, "pass")
        self.assertTrue(result.is_personalisation_qualified)
        self.assertEqual(len(result.warnings), 0)

    def test_conditional_qc_gate_with_warnings(self):
        # Marginal SNR (13.5 < 15.0) and moderate Euler holes (25 > 20)
        marginal_metrics = StructuralQCMetrics(
            snr_t1w=13.5,
            cnr_t1w=4.5,
            euler_holes_lh=25,
            euler_holes_rh=12,
            total_euler_number=-20,
            surface_self_intersections_lh=0,
            surface_self_intersections_rh=0,
            cortical_thickness_mean_mm=2.54,
            cortical_thickness_std_mm=0.38,
            cortical_thickness_min_mm=1.20,
            cortical_thickness_max_mm=4.80,
            cortical_thickness_outlier_fraction=0.001,
            brain_mask_volume_mm3=1480000.0,
            csf_fraction=0.14,
            gm_fraction=0.46,
            wm_fraction=0.40,
            mni_registration_overlap_dice=0.94,
            mni_mutual_information=0.82,
        )
        result = self.evaluator.evaluate(marginal_metrics)
        self.assertEqual(result.overall_status, "conditional")
        self.assertTrue(result.is_personalisation_qualified)
        self.assertEqual(len(result.warnings), 2)
        warning_codes = [w.code for w in result.warnings]
        self.assertIn("MARGINAL_SNR_WARNING", warning_codes)
        self.assertIn("EULER_DEFECT_WARNING", warning_codes)

    def test_failing_qc_gate_critical_snr(self):
        # Severe low SNR (8.5 < 10.0)
        failing_metrics = StructuralQCMetrics(
            snr_t1w=8.5,
            cnr_t1w=4.5,
            euler_holes_lh=8,
            euler_holes_rh=10,
            total_euler_number=4,
            surface_self_intersections_lh=0,
            surface_self_intersections_rh=0,
            cortical_thickness_mean_mm=2.54,
            cortical_thickness_std_mm=0.38,
            cortical_thickness_min_mm=1.20,
            cortical_thickness_max_mm=4.80,
            cortical_thickness_outlier_fraction=0.001,
            brain_mask_volume_mm3=1480000.0,
            csf_fraction=0.14,
            gm_fraction=0.46,
            wm_fraction=0.40,
            mni_registration_overlap_dice=0.94,
            mni_mutual_information=0.82,
        )
        result = self.evaluator.evaluate(failing_metrics)
        self.assertEqual(result.overall_status, "fail")
        self.assertFalse(result.is_personalisation_qualified)
        self.assertEqual(len(result.warnings), 1)
        self.assertEqual(result.warnings[0].code, "CRITICAL_SNR_FAILURE")
        self.assertEqual(result.warnings[0].clinical_impact, "personalisation_invalid")

    def test_failing_qc_gate_severe_euler_defects(self):
        # Severe Euler holes (52 > 40)
        failing_metrics = StructuralQCMetrics(
            snr_t1w=19.2,
            cnr_t1w=4.5,
            euler_holes_lh=52,
            euler_holes_rh=10,
            total_euler_number=-90,
            surface_self_intersections_lh=0,
            surface_self_intersections_rh=0,
            cortical_thickness_mean_mm=2.54,
            cortical_thickness_std_mm=0.38,
            cortical_thickness_min_mm=1.20,
            cortical_thickness_max_mm=4.80,
            cortical_thickness_outlier_fraction=0.001,
            brain_mask_volume_mm3=1480000.0,
            csf_fraction=0.14,
            gm_fraction=0.46,
            wm_fraction=0.40,
            mni_registration_overlap_dice=0.94,
            mni_mutual_information=0.82,
        )
        result = self.evaluator.evaluate(failing_metrics)
        self.assertEqual(result.overall_status, "fail")
        self.assertFalse(result.is_personalisation_qualified)
        self.assertEqual(result.warnings[0].code, "SEVERE_TOPOLOGICAL_DEFECTS")


if __name__ == "__main__":
    unittest.main()
