"""
Unit Tests for Cluster Overlap and Morphometric Metrics
Conforms to MAGNIOM-Neuroimaging & Functional Connectomics Pipeline Specification v1.0 Section 112
"""

import unittest
from magniom_neuro.reliability.metrics import (
    calculate_cluster_dice,
    calculate_cluster_jaccard,
    calculate_cluster_area_delta,
    calculate_euclidean_distance,
    calculate_surface_geodesic_distance,
)
from magniom_neuro.models.circuits import SpatialCoordinate


class TestClusterOverlapMetrics(unittest.TestCase):
    """Tests Dice, Jaccard, centroid distance, and area delta metrics."""

    def test_identical_clusters_dice_and_jaccard(self):
        c1 = [101, 102, 103, 104, 105]
        c2 = [101, 102, 103, 104, 105]
        dice = calculate_cluster_dice(c1, c2)
        jaccard = calculate_cluster_jaccard(c1, c2)
        self.assertEqual(dice, 1.0)
        self.assertEqual(jaccard, 1.0)

    def test_disjoint_clusters_dice_and_jaccard(self):
        c1 = [101, 102, 103]
        c2 = [201, 202, 203]
        dice = calculate_cluster_dice(c1, c2)
        jaccard = calculate_cluster_jaccard(c1, c2)
        self.assertEqual(dice, 0.0)
        self.assertEqual(jaccard, 0.0)

    def test_partial_overlap_dice_and_jaccard(self):
        # 3 in common, 5 in each
        c1 = [1, 2, 3, 4, 5]
        c2 = [3, 4, 5, 6, 7]
        dice = calculate_cluster_dice(c1, c2)  # 2*3 / 10 = 0.60
        jaccard = calculate_cluster_jaccard(c1, c2)  # 3 / 7 = ~0.4286
        self.assertAlmostEqual(dice, 0.60, places=3)
        self.assertAlmostEqual(jaccard, 3.0 / 7.0, places=3)

    def test_cluster_area_delta(self):
        area1 = 120.0
        area2 = 90.0
        abs_delta, ratio = calculate_cluster_area_delta(area1, area2)
        self.assertEqual(abs_delta, 30.0)
        self.assertAlmostEqual(ratio, 0.75, places=3)

    def test_euclidean_and_geodesic_distance(self):
        p1 = SpatialCoordinate("MNI152NLin2009cAsym", -38.0, 44.0, 30.0)
        p2 = SpatialCoordinate("MNI152NLin2009cAsym", -38.0, 44.0, 26.0)
        dist = calculate_euclidean_distance(p1, p2)
        self.assertEqual(dist, 4.0)

        geo_dist = calculate_surface_geodesic_distance(10000, 10000, hemisphere="L")
        self.assertEqual(geo_dist, 0.0)
        geo_dist_diff = calculate_surface_geodesic_distance(10000, 10025, hemisphere="L")
        self.assertGreater(geo_dist_diff, 0.0)


if __name__ == "__main__":
    unittest.main()
