"""
Unit Tests for Pipeline Sensitivity Engine (CD-1 vs SD-1)
Conforms to MAGNIOM-Neuroimaging & Functional Connectomics Pipeline Specification v1.0 Section 113
"""

import unittest
import math
from magniom_neuro.reliability.sensitivity import PipelineSensitivityEngine
from magniom_neuro.models.surface import SurfaceProjectionResult, SurfaceFunctionalTimeSeries


class TestSensitivityReliability(unittest.TestCase):
    """Tests pipeline sensitivity and dispersion evaluation between CD-1 and SD-1 streams."""

    def setUp(self):
        self.num_vertices = 32492
        self.num_timepoints = 80

        # CD-1 Time series
        ts_cd1 = [[0.0] * self.num_timepoints for _ in range(self.num_vertices)]
        for v in range(10000, 20000):
            amp = math.sin((v - 10000) * 0.001)
            for t in range(self.num_timepoints):
                ts_cd1[v][t] = amp * math.cos(t * 0.1)

        # SD-1 Time series with minor residual noise
        ts_sd1 = [[0.0] * self.num_timepoints for _ in range(self.num_vertices)]
        for v in range(10000, 20000):
            amp = math.sin((v - 10000) * 0.001)
            for t in range(self.num_timepoints):
                ts_sd1[v][t] = amp * math.cos(t * 0.1) + 0.05 * math.sin(t * 0.4)

        medial_mask = [False] * self.num_vertices

        surf_cd1 = SurfaceFunctionalTimeSeries(
            subject_id="sub-001",
            run_index=1,
            hemisphere="L",
            coordinate_space="fsLR_32k",
            vertex_count=self.num_vertices,
            valid_vertex_count=self.num_vertices,
            num_timepoints=self.num_timepoints,
            data_matrix=ts_cd1,
            medial_wall_mask=medial_mask,
            sampling_method="RibbonConstrained_Trilinear",
        )
        surf_sd1 = SurfaceFunctionalTimeSeries(
            subject_id="sub-001",
            run_index=1,
            hemisphere="L",
            coordinate_space="fsLR_32k",
            vertex_count=self.num_vertices,
            valid_vertex_count=self.num_vertices,
            num_timepoints=self.num_timepoints,
            data_matrix=ts_sd1,
            medial_wall_mask=medial_mask,
            sampling_method="RibbonConstrained_Trilinear",
        )


        self.proj_cd1 = SurfaceProjectionResult(
            subject_id="sub-001",
            run_index=1,
            denoising_configuration="CD-1",
            ts_lh_32k=surf_cd1,
            ts_rh_32k=surf_cd1,
            mean_tsnr_surface=88.0,
            valid_cortical_vertices_count=32492,
            medial_wall_vertices_count=0,
        )
        self.proj_sd1 = SurfaceProjectionResult(
            subject_id="sub-001",
            run_index=1,
            denoising_configuration="SD-1",
            ts_lh_32k=surf_sd1,
            ts_rh_32k=surf_sd1,
            mean_tsnr_surface=65.0,
            valid_cortical_vertices_count=32492,
            medial_wall_vertices_count=0,
        )


    def test_unassessed_sd1_stream(self):
        res = PipelineSensitivityEngine.evaluate_sensitivity_convergent(
            subject_id="sub-001",
            proj_cd1=self.proj_cd1,
            proj_sd1=None,
        )
        self.assertFalse(res.assessed)
        self.assertIsNone(res.sensitivity_distance_mm)

    def test_evaluated_sensitivity_convergent(self):
        res = PipelineSensitivityEngine.evaluate_sensitivity_convergent(
            subject_id="sub-001",
            proj_cd1=self.proj_cd1,
            proj_sd1=self.proj_sd1,
        )
        self.assertTrue(res.assessed)
        self.assertIsNotNone(res.sensitivity_distance_mm)
        self.assertGreaterEqual(res.sensitivity_distance_mm, 0.0)
        self.assertGreater(res.map_similarity, 0.85)
        self.assertIn(res.dispersion_interpretation, ["nominal", "moderate_dispersion", "high_dispersion"])


if __name__ == "__main__":
    unittest.main()
