"""
Unit Tests for Split-Half Target Reliability Engine
Conforms to MAGNIOM-Neuroimaging & Functional Connectomics Pipeline Specification v1.0 Sections 108-109
"""

import unittest
import math
from magniom_neuro.reliability.split_half import SplitHalfPartitionEngine
from magniom_neuro.models.surface import SurfaceProjectionResult, SurfaceFunctionalTimeSeries
from magniom_neuro.models.circuits import SpatialCoordinate


class TestSplitHalfReliability(unittest.TestCase):
    """Tests split-half partitioning, candidate extraction, and stability metrics."""

    def setUp(self):
        self.num_vertices = 32492
        self.num_timepoints = 120  # 120 volumes * 1.5s = 3 minutes of test BOLD
        # Construct synthetic surface time series
        ts_lh = [[0.0] * self.num_timepoints for _ in range(self.num_vertices)]

        # Signal in DLPFC search vertices
        for v in range(10000, 20000):
            base_amp = math.sin((v - 10000) * 0.001)
            for t in range(self.num_timepoints):
                ts_lh[v][t] = base_amp * math.cos(t * 0.1) + 0.05 * math.sin(t * 0.5)

        medial_mask = [False] * self.num_vertices
        for v in range(0, 1000):
            medial_mask[v] = True

        surf_ts = SurfaceFunctionalTimeSeries(
            subject_id="sub-001",
            run_index=1,
            hemisphere="L",
            coordinate_space="fsLR_32k",
            vertex_count=self.num_vertices,
            valid_vertex_count=self.num_vertices - 1000,
            num_timepoints=self.num_timepoints,
            data_matrix=ts_lh,
            medial_wall_mask=medial_mask,
            sampling_method="RibbonConstrained_Trilinear",
        )


        self.mock_projection = SurfaceProjectionResult(
            subject_id="sub-001",
            run_index=1,
            denoising_configuration="CD-1",
            ts_lh_32k=surf_ts,
            ts_rh_32k=surf_ts,
            mean_tsnr_surface=85.0,
            valid_cortical_vertices_count=31492,
            medial_wall_vertices_count=1000,
        )


    def test_partition_time_series_interleaved_balance(self):
        mat = [[float(t) for t in range(100)] for _ in range(10)]
        ts_a, ts_b, idx_a, idx_b = SplitHalfPartitionEngine.partition_time_series(mat, block_size=20)

        self.assertEqual(len(idx_a) + len(idx_b), 100)
        self.assertEqual(len(idx_a), 60)  # Blocks 0-19, 40-59, 80-99
        self.assertEqual(len(idx_b), 40)  # Blocks 20-39, 60-79
        self.assertEqual(len(ts_a), 10)
        self.assertEqual(len(ts_b), 10)

    def test_evaluate_split_half_convergent(self):
        res = SplitHalfPartitionEngine.evaluate_split_half_convergent(
            subject_id="sub-001",
            surface_projection=self.mock_projection,
            tr_seconds=1.5,
        )

        self.assertIsNotNone(res)
        self.assertGreaterEqual(res.distance_mm, 0.0)
        self.assertLess(res.distance_mm, 30.0)
        self.assertGreaterEqual(res.map_similarity, -1.0)
        self.assertLessEqual(res.map_similarity, 1.0)
        self.assertGreaterEqual(res.cluster_dice, 0.0)
        self.assertLessEqual(res.cluster_dice, 1.0)
        self.assertEqual(res.partition_strategy, "TEMPORAL_INTERLEAVED_BLOCKS_V1")
        self.assertGreater(res.half_a_retained_minutes, 0.0)
        self.assertGreater(res.half_b_retained_minutes, 0.0)

    def test_evaluate_split_half_sgacc(self):
        res = SplitHalfPartitionEngine.evaluate_split_half_sgacc(
            subject_id="sub-001",
            surface_projection=self.mock_projection,
            tr_seconds=1.5,
        )

        self.assertIsNotNone(res)
        self.assertGreaterEqual(res.distance_mm, 0.0)
        self.assertGreaterEqual(res.map_similarity, -1.0)
        self.assertLessEqual(res.map_similarity, 1.0)
        self.assertGreaterEqual(res.cluster_dice, 0.0)


if __name__ == "__main__":
    unittest.main()
