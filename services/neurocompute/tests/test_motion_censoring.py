"""
Unit Tests for Motion Censoring, DVARS Calculation, and Retained Time Accounting
Conforms to MAGNIOM-Neuroimaging & Functional Connectomics Pipeline Specification v1.0 Sections 61-66
"""

import unittest
from magniom_neuro.models.bold import MotionParameters, NonSteadyStateSummary
from magniom_neuro.denoise.censoring import MotionCensoringEngine


class TestMotionCensoring(unittest.TestCase):
    """Tests for FD censoring, DVARS, contiguous segment pruning, and retained duration."""

    def test_nominal_motion_retained_time(self):
        # 600 volumes, 1.5s TR = 15 min, low FD
        n_vols = 600
        fd_series = [0.08] * n_vols
        # Inject 10 motion spikes
        for spk in [50, 51, 120, 250, 300, 301, 400, 500, 501, 550]:
            fd_series[spk] = 0.35

        motion_params = MotionParameters(
            trans_x_mm=[0.0] * n_vols,
            trans_y_mm=[0.0] * n_vols,
            trans_z_mm=[0.0] * n_vols,
            rot_x_deg=[0.0] * n_vols,
            rot_y_deg=[0.0] * n_vols,
            rot_z_deg=[0.0] * n_vols,
            framewise_displacement_mm=fd_series,
            mean_fd_mm=0.09,
            max_fd_mm=0.35,
        )
        nss = NonSteadyStateSummary(
            num_non_steady_state_volumes=4,
            non_steady_state_indices=[0, 1, 2, 3],
            detection_method="heuristic",
        )

        result = MotionCensoringEngine.compute_censoring(
            motion_params=motion_params,
            non_steady_state=nss,
            tr_seconds=1.5,
            fd_threshold_mm=0.20,
        )

        retained = result.retained_time
        self.assertEqual(retained.total_volumes, 600)
        self.assertEqual(retained.non_steady_state_volumes, 4)
        self.assertGreater(retained.percentage_retained, 95.0)
        self.assertGreater(retained.final_retained_minutes, 14.0)
        self.assertTrue(retained.is_above_absolute_minimum)

    def test_short_clean_segment_pruning(self):
        # Create a pattern where 3 clean frames are trapped between spikes
        n_vols = 100
        fd_series = [0.05] * n_vols
        # Spike at 20, 24 -> frames 21, 22, 23 are clean (length 3 < 5)
        fd_series[20] = 0.45
        fd_series[24] = 0.45

        motion_params = MotionParameters(
            trans_x_mm=[0.0] * n_vols,
            trans_y_mm=[0.0] * n_vols,
            trans_z_mm=[0.0] * n_vols,
            rot_x_deg=[0.0] * n_vols,
            rot_y_deg=[0.0] * n_vols,
            rot_z_deg=[0.0] * n_vols,
            framewise_displacement_mm=fd_series,
            mean_fd_mm=0.06,
            max_fd_mm=0.45,
        )
        nss = NonSteadyStateSummary(
            num_non_steady_state_volumes=0,
            non_steady_state_indices=[],
            detection_method="heuristic",
        )

        result = MotionCensoringEngine.compute_censoring(
            motion_params=motion_params,
            non_steady_state=nss,
            tr_seconds=1.5,
            fd_threshold_mm=0.20,
            min_contiguous_segment_length=5,
        )

        # Frames 21, 22, 23 should be pruned
        self.assertFalse(result.censor_mask[21])
        self.assertFalse(result.censor_mask[22])
        self.assertFalse(result.censor_mask[23])
        self.assertGreaterEqual(result.retained_time.short_segments_pruned_volumes, 3)


if __name__ == "__main__":
    unittest.main()
