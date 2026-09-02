"""
Unit Tests for Search-Space Map Similarity and Statistical Metrics
Conforms to MAGNIOM-Neuroimaging & Functional Connectomics Pipeline Specification v1.0 Section 111
"""

import unittest
import math
from magniom_neuro.reliability.metrics import (
    calculate_pearson_correlation,
    calculate_spearman_correlation,
    calculate_intraclass_correlation,
    spatial_decay_function,
)


class TestMapSimilarityMetrics(unittest.TestCase):
    """Tests Pearson, Spearman, and ICC map similarity calculations."""

    def test_perfect_pearson_correlation(self):
        map1 = [0.1, 0.2, 0.5, 0.8, 0.9, -0.3]
        map2 = [0.1, 0.2, 0.5, 0.8, 0.9, -0.3]
        r = calculate_pearson_correlation(map1, map2)
        self.assertAlmostEqual(r, 1.0, places=3)

    def test_inverse_pearson_correlation(self):
        map1 = [0.1, 0.2, 0.5, 0.8, 0.9]
        map2 = [-0.1, -0.2, -0.5, -0.8, -0.9]
        r = calculate_pearson_correlation(map1, map2)
        self.assertAlmostEqual(r, -1.0, places=3)

    def test_masked_search_space_correlation(self):
        # Full 10-vertex maps with different values outside mask
        map1 = [99.0, 99.0, 0.1, 0.4, 0.8, 0.2, 99.0, 99.0]
        map2 = [-99.0, -99.0, 0.12, 0.38, 0.82, 0.18, -99.0, -99.0]
        search_mask = [2, 3, 4, 5]
        r = calculate_pearson_correlation(map1, map2, mask_indices=search_mask)
        self.assertGreater(r, 0.95)

    def test_spearman_monotonic_relationship(self):
        map1 = [1.0, 2.0, 3.0, 4.0, 5.0]
        # Non-linear monotonic exponential relationship
        map2 = [10.0, 100.0, 1000.0, 10000.0, 100000.0]
        rho = calculate_spearman_correlation(map1, map2)
        self.assertAlmostEqual(rho, 1.0, places=3)

    def test_intraclass_correlation(self):
        vec_a = [0.8, 0.5, 0.2, -0.1, 0.9]
        vec_b = [0.82, 0.48, 0.19, -0.08, 0.88]
        icc = calculate_intraclass_correlation(vec_a, vec_b)
        self.assertGreater(icc, 0.90)

    def test_spatial_decay_function(self):
        # 0 mm -> 1.0
        self.assertAlmostEqual(spatial_decay_function(0.0), 1.0, places=2)
        # 4.47 mm (literature benchmark) -> >0.80 (high reliability)
        r_lit = spatial_decay_function(4.47)
        self.assertGreaterEqual(r_lit, 0.80)
        # 8.0 mm (midpoint) -> ~0.50
        r_mid = spatial_decay_function(8.0)
        self.assertAlmostEqual(r_mid, 0.50, places=2)
        # 16.0 mm -> <0.10 (unreliable)
        r_high_dist = spatial_decay_function(16.0)
        self.assertLess(r_high_dist, 0.10)


if __name__ == "__main__":
    unittest.main()
