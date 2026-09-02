"""
Unit Tests for Q2 Functional Quality Control Gate Evaluator
Conforms to MAGNIOM-Neuroimaging & Functional Connectomics Pipeline Specification v1.0 Sections 67, 118, 121
"""

import unittest
from magniom_neuro.models.functional_qc import FunctionalQCMetrics
from magniom_neuro.qc.functional_evaluator import FunctionalQCGateEvaluator


class TestFunctionalQC(unittest.TestCase):
    """Tests for Q2 gate PASS, CONDITIONAL, and FAIL classifications."""

    def test_nominal_pass_gate(self):
        metrics = FunctionalQCMetrics(
            run_index=1,
            mean_fd_mm=0.11,
            max_fd_mm=0.28,
            censored_volumes_fraction=0.04,
            retained_minutes=14.4,
            tsnr_pre_denoise=58.0,
            tsnr_post_denoise=82.0,
            tsnr_gain_ratio=1.414,
            mean_dvars=22.4,
            tedana_components_total=30,
            tedana_components_accepted=12,
            tedana_components_rejected=18,
            tedana_accepted_variance_fraction=0.62,
            t1w_bold_coregistration_dice=0.945,
            ghosting_ratio=0.015,
            signal_dropout_fraction_dlpfc=0.01,
            signal_dropout_fraction_sgacc=0.03,
        )

        result = FunctionalQCGateEvaluator.evaluate(metrics, is_session_aggregate=False)
        self.assertEqual(result.overall_status, "pass")
        self.assertTrue(result.is_personalisation_qualified)
        self.assertIsNone(result.limitation_summary)
        self.assertEqual(len(result.warnings), 0)

    def test_conditional_motion_gate(self):
        metrics = FunctionalQCMetrics(
            run_index=1,
            mean_fd_mm=0.22,  # 0.20 - 0.25 mm
            max_fd_mm=0.55,
            censored_volumes_fraction=0.24,  # 20 - 30%
            retained_minutes=11.4,
            tsnr_pre_denoise=45.0,
            tsnr_post_denoise=62.0,
            tsnr_gain_ratio=1.378,
            mean_dvars=28.5,
            tedana_components_total=30,
            tedana_components_accepted=10,
            tedana_components_rejected=20,
            tedana_accepted_variance_fraction=0.51,
            t1w_bold_coregistration_dice=0.912,
            ghosting_ratio=0.022,
            signal_dropout_fraction_dlpfc=0.02,
            signal_dropout_fraction_sgacc=0.04,
        )

        result = FunctionalQCGateEvaluator.evaluate(metrics, is_session_aggregate=False)
        self.assertEqual(result.overall_status, "conditional")
        self.assertTrue(result.is_personalisation_qualified)
        self.assertIsNotNone(result.limitation_summary)
        self.assertGreater(len(result.warnings), 0)
        warning_codes = [w.code for w in result.warnings]
        self.assertIn("Q2_MODERATE_MOTION_CENSORING", warning_codes)

    def test_severe_motion_fail_gate(self):
        # G04 style unreliable / failed connectome due to severe motion & insufficient retained time
        metrics = FunctionalQCMetrics(
            run_index=1,
            mean_fd_mm=0.42,  # > 0.25 mm
            max_fd_mm=1.20,
            censored_volumes_fraction=0.68,  # > 30%
            retained_minutes=4.8,  # < 6.0 min per run
            tsnr_pre_denoise=28.0,
            tsnr_post_denoise=36.0,
            tsnr_gain_ratio=1.285,
            mean_dvars=44.2,
            tedana_components_total=30,
            tedana_components_accepted=5,
            tedana_components_rejected=25,
            tedana_accepted_variance_fraction=0.31,
            t1w_bold_coregistration_dice=0.810,  # < 0.85
            ghosting_ratio=0.052,
            signal_dropout_fraction_dlpfc=0.08,
            signal_dropout_fraction_sgacc=0.12,
        )

        result = FunctionalQCGateEvaluator.evaluate(metrics, is_session_aggregate=False)
        self.assertEqual(result.overall_status, "fail")
        self.assertFalse(result.is_personalisation_qualified)
        self.assertIsNotNone(result.limitation_summary)
        warning_codes = [w.code for w in result.warnings]
        self.assertIn("Q2_SEVERE_HEAD_MOTION", warning_codes)
        self.assertIn("Q2_EXCESSIVE_MOTION_CENSORING", warning_codes)
        self.assertIn("Q2_INSUFFICIENT_RUN_RETAINED_TIME", warning_codes)


if __name__ == "__main__":
    unittest.main()
