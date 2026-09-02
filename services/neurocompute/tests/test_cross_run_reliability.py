"""
Unit Tests for Cross-Run Target Reliability Engine
Conforms to MAGNIOM-Neuroimaging & Functional Connectomics Pipeline Specification v1.0 Section 107
"""

import unittest
import math
from magniom_neuro.reliability.cross_run import CrossRunReliabilityEngine
from magniom_neuro.models.surface import SurfaceProjectionResult, SurfaceFunctionalTimeSeries


class TestCrossRunReliability(unittest.TestCase):
    """Tests cross-run comparison and single-run graceful fallback."""

    def setUp(self):
        self.num_vertices = 32492
        self.num_timepoints = 80

        # Run 1 Time series
        ts1 = [[0.0] * self.num_timepoints for _ in range(self.num_vertices)]
        for v in range(10000, 20000):
            amp = math.sin((v - 10000) * 0.001)
            for t in range(self.num_timepoints):
                ts1[v][t] = amp * math.cos(t * 0.1)

        # Run 2 Time series (similar but with minor noise)
        ts2 = [[0.0] * self.num_timepoints for _ in range(self.num_vertices)]
        for v in range(10000, 20000):
            amp = math.sin((v - 10000) * 0.001)
            for t in range(self.num_timepoints):
                ts2[v][t] = amp * math.cos(t * 0.1) + 0.02 * math.sin(t * 0.8)

        medial_mask = [False] * self.num_vertices
        for v in range(0, 500):
            medial_mask[v] = True

        surf_ts1 = SurfaceFunctionalTimeSeries(
            subject_id="sub-001",
            run_index=1,
            hemisphere="L",
            coordinate_space="fsLR_32k",
            vertex_count=self.num_vertices,
            valid_vertex_count=self.num_vertices - 500,
            num_timepoints=self.num_timepoints,
            data_matrix=ts1,
            medial_wall_mask=medial_mask,
            sampling_method="RibbonConstrained_Trilinear",
        )
        surf_ts2 = SurfaceFunctionalTimeSeries(
            subject_id="sub-001",
            run_index=2,
            hemisphere="L",
            coordinate_space="fsLR_32k",
            vertex_count=self.num_vertices,
            valid_vertex_count=self.num_vertices - 500,
            num_timepoints=self.num_timepoints,
            data_matrix=ts2,
            medial_wall_mask=medial_mask,
            sampling_method="RibbonConstrained_Trilinear",
        )


        self.mock_projection = SurfaceProjectionResult(
            subject_id="sub-001",
            run_index=1,
            denoising_configuration="CD-1",
            ts_lh_32k=surf_ts1,
            ts_rh_32k=surf_ts1,
            mean_tsnr_surface=85.0,
            valid_cortical_vertices_count=31992,
            medial_wall_vertices_count=500,
        )
        self.proj_run1 = SurfaceProjectionResult(
            subject_id="sub-001",
            run_index=1,
            denoising_configuration="CD-1",
            ts_lh_32k=surf_ts1,
            ts_rh_32k=surf_ts1,
            mean_tsnr_surface=85.0,
            valid_cortical_vertices_count=31992,
            medial_wall_vertices_count=500,
        )
        self.proj_run2 = SurfaceProjectionResult(
            subject_id="sub-001",
            run_index=2,
            denoising_configuration="CD-1",
            ts_lh_32k=surf_ts2,
            ts_rh_32k=surf_ts2,
            mean_tsnr_surface=82.0,
            valid_cortical_vertices_count=31992,
            medial_wall_vertices_count=500,
        )


    def test_single_run_fallback(self):
        res = CrossRunReliabilityEngine.evaluate_cross_run_convergent(
            subject_id="sub-001",
            surface_projections=[self.proj_run1],
        )
        self.assertFalse(res.assessed)
        self.assertIsNone(res.distance_mm)
        self.assertEqual(res.limiting_factor, "SINGLE_RUN_ACQUISITION")
        self.assertEqual(res.runs_evaluated, [1])

    def test_multi_run_evaluation_convergent(self):
        res = CrossRunReliabilityEngine.evaluate_cross_run_convergent(
            subject_id="sub-001",
            surface_projections=[self.proj_run1, self.proj_run2],
        )
        self.assertTrue(res.assessed)
        self.assertIsNotNone(res.distance_mm)
        self.assertGreaterEqual(res.distance_mm, 0.0)
        self.assertGreater(res.map_similarity, 0.80)
        self.assertGreater(res.cluster_dice, 0.70)
        self.assertEqual(res.runs_evaluated, [1, 2])
        self.assertIsNotNone(res.run_1_medoid_mni)
        self.assertIsNotNone(res.run_2_medoid_mni)

    def test_multi_run_evaluation_sgacc(self):
        res = CrossRunReliabilityEngine.evaluate_cross_run_sgacc(
            subject_id="sub-001",
            surface_projections=[self.proj_run1, self.proj_run2],
        )
        self.assertTrue(res.assessed)
        self.assertIsNotNone(res.distance_mm)
        self.assertGreaterEqual(res.map_similarity, -1.0)
        self.assertLessEqual(res.map_similarity, 1.0)


if __name__ == "__main__":
    unittest.main()
