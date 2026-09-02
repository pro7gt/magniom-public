"""
Unit Tests for Cortical Spatial Confidence Region Engine
Conforms to MAGNIOM-Neuroimaging & Functional Connectomics Pipeline Specification v1.0 Section 115
"""

import unittest
from magniom_neuro.reliability.confidence_region import ConfidenceRegionEngine
from magniom_neuro.reliability.models import SplitHalfResult, CrossRunResult
from magniom_neuro.models.circuits import SpatialCoordinate


class TestConfidenceRegion(unittest.TestCase):
    """Tests spatial confidence region building and bounding geometry."""

    def test_build_confidence_region(self):
        primary_medoid = SpatialCoordinate("MNI152NLin2009cAsym", -38.0, 44.0, 26.0)
        split_res = SplitHalfResult(
            distance_mm=3.5,
            geodesic_distance_mm=4.0,
            map_similarity=0.88,
            spearman_similarity=0.86,
            cluster_dice=0.82,
            cluster_jaccard=0.70,
            cluster_area_delta_mm2=5.0,
            half_a_peak_mni=SpatialCoordinate("MNI152NLin2009cAsym", -38.0, 44.0, 28.0),
            half_a_medoid_mni=SpatialCoordinate("MNI152NLin2009cAsym", -37.0, 43.0, 27.0),
            half_b_peak_mni=SpatialCoordinate("MNI152NLin2009cAsym", -39.0, 45.0, 25.0),
            half_b_medoid_mni=SpatialCoordinate("MNI152NLin2009cAsym", -39.0, 45.0, 25.0),
            partition_strategy="TEMPORAL_INTERLEAVED_BLOCKS_V1",
            half_a_retained_minutes=15.0,
            half_b_retained_minutes=15.0,
        )

        region = ConfidenceRegionEngine.build_confidence_region(
            primary_medoid_mni=primary_medoid,
            primary_vertex_index=15000,
            split_half_result=split_res,
            hemisphere="L",
        )

        self.assertIsNotNone(region)
        self.assertEqual(region.space, "fsLR_32k")
        self.assertEqual(region.hemisphere, "L")
        self.assertGreater(len(region.surface_vertex_indices), 0)
        self.assertGreater(region.surface_area_mm2, 0.0)
        self.assertAlmostEqual(region.centroid_mni[0], -38.0, delta=2.0)
        self.assertGreater(region.max_radius_mm, 0.0)
        self.assertEqual(len(region.bounding_box_mni), 2)


if __name__ == "__main__":
    unittest.main()
