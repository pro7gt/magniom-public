"""
Unit Tests for Target Reliability Aggregator and Classifier
Conforms to MAGNIOM-Target Engine & Ranking Algorithm Specification v1.0 Sections 45-51
and MAGNIOM-Canonical Target Data Specification v1.0 Section 36
"""

import unittest
from magniom_neuro.reliability.aggregator import TargetReliabilityAggregator
from magniom_neuro.reliability.models import SplitHalfResult, CrossRunResult, SpatialRegion
from magniom_neuro.models.circuits import SpatialCoordinate


class TestTargetReliabilityAggregator(unittest.TestCase):
    """Tests conservative weakest-link aggregation, class thresholds, and limiting factors."""

    def setUp(self):
        self.coord_a = SpatialCoordinate("MNI152NLin2009cAsym", -38.0, 44.0, 26.0)
        self.coord_b = SpatialCoordinate("MNI152NLin2009cAsym", -38.0, 44.0, 28.0)

    def test_high_reliability_profile(self):
        split_res = SplitHalfResult(
            distance_mm=3.2,
            geodesic_distance_mm=3.5,
            map_similarity=0.92,
            spearman_similarity=0.90,
            cluster_dice=0.88,
            cluster_jaccard=0.78,
            cluster_area_delta_mm2=4.0,
            half_a_peak_mni=self.coord_a,
            half_a_medoid_mni=self.coord_a,
            half_b_peak_mni=self.coord_b,
            half_b_medoid_mni=self.coord_b,
            partition_strategy="TEMPORAL_INTERLEAVED_BLOCKS_V1",
            half_a_retained_minutes=18.0,
            half_b_retained_minutes=18.0,
        )
        cross_res = CrossRunResult(
            assessed=True,
            distance_mm=2.8,
            geodesic_distance_mm=3.0,
            map_similarity=0.90,
            spearman_similarity=0.88,
            cluster_dice=0.85,
            cluster_jaccard=0.74,
            runs_evaluated=[1, 2],
        )

        profile = TargetReliabilityAggregator.aggregate_profile(
            candidate_id="CAN-CONV-001",
            case_id="CASE-001",
            imaging_study_id="STUDY-001",
            connectome_run_id="run-001",
            target_family_version_id="TF-MDD-CONVERGENT-LDLPFC-001",
            qc_status="pass",
            usable_rest_minutes=36.0,
            mean_fd_mm=0.12,
            censored_fraction=0.04,
            registration_quality="high",
            segmentation_quality="high",
            parcel_coverage_quality="high",
            split_half_result=split_res,
            cross_run_result=cross_res,
            sensitivity_result=None,
            confidence_region=None,
        )

        self.assertEqual(profile.reliability_class, "high")
        self.assertTrue(profile.is_reliable_for_personalisation)
        self.assertGreaterEqual(profile.overall_reliability_score, 0.80)
        self.assertEqual(profile.composite_spatial_distance_mm, 3.2)
        self.assertEqual(len(profile.limiting_factors), 0)

    def test_weakest_link_high_connectivity_low_spatial_reproducibility(self):
        # Extreme test: Map similarity is high (0.95), but spatial distance is 18 mm (R_S < 0.05)
        coord_far = SpatialCoordinate("MNI152NLin2009cAsym", -20.0, 44.0, 26.0)
        split_res = SplitHalfResult(
            distance_mm=18.0,
            geodesic_distance_mm=22.0,
            map_similarity=0.95,
            spearman_similarity=0.92,
            cluster_dice=0.20,
            cluster_jaccard=0.10,
            cluster_area_delta_mm2=35.0,
            half_a_peak_mni=self.coord_a,
            half_a_medoid_mni=self.coord_a,
            half_b_peak_mni=coord_far,
            half_b_medoid_mni=coord_far,
            partition_strategy="TEMPORAL_INTERLEAVED_BLOCKS_V1",
            half_a_retained_minutes=15.0,
            half_b_retained_minutes=15.0,
        )

        profile = TargetReliabilityAggregator.aggregate_profile(
            candidate_id="CAN-CONV-002",
            case_id="CASE-002",
            imaging_study_id="STUDY-002",
            connectome_run_id="run-002",
            target_family_version_id="TF-MDD-CONVERGENT-LDLPFC-001",
            qc_status="pass",
            usable_rest_minutes=30.0,
            mean_fd_mm=0.15,
            censored_fraction=0.08,
            registration_quality="high",
            segmentation_quality="high",
            parcel_coverage_quality="high",
            split_half_result=split_res,
            cross_run_result=None,
            sensitivity_result=None,
            confidence_region=None,
        )

        # High connectivity must not overpower catastrophic spatial instability
        self.assertEqual(profile.reliability_class, "unreliable")
        self.assertFalse(profile.is_reliable_for_personalisation)
        self.assertLess(profile.overall_reliability_score, 0.40)
        self.assertIn("HIGH_SPLIT_HALF_DISPERSION", profile.limiting_factors)

    def test_qc_failure_zeros_reliability(self):
        split_res = SplitHalfResult(
            distance_mm=2.5,
            geodesic_distance_mm=2.5,
            map_similarity=0.95,
            spearman_similarity=0.95,
            cluster_dice=0.90,
            cluster_jaccard=0.82,
            cluster_area_delta_mm2=2.0,
            half_a_peak_mni=self.coord_a,
            half_a_medoid_mni=self.coord_a,
            half_b_peak_mni=self.coord_b,
            half_b_medoid_mni=self.coord_b,
            partition_strategy="TEMPORAL_INTERLEAVED_BLOCKS_V1",
            half_a_retained_minutes=15.0,
            half_b_retained_minutes=15.0,
        )

        profile = TargetReliabilityAggregator.aggregate_profile(
            candidate_id="CAN-CONV-003",
            case_id="CASE-003",
            imaging_study_id="STUDY-003",
            connectome_run_id="run-003",
            target_family_version_id="TF-MDD-CONVERGENT-LDLPFC-001",
            qc_status="fail",  # Catastrophic QC failure
            usable_rest_minutes=5.0,
            mean_fd_mm=0.65,
            censored_fraction=0.45,
            registration_quality="fail",
            segmentation_quality="fail",
            parcel_coverage_quality="fail",
            split_half_result=split_res,
            cross_run_result=None,
            sensitivity_result=None,
            confidence_region=None,
        )

        self.assertEqual(profile.overall_reliability_score, 0.0)
        self.assertEqual(profile.reliability_class, "unreliable")
        self.assertFalse(profile.is_reliable_for_personalisation)
        self.assertIn("FAILED_MANDATORY_QC", profile.limiting_factors)


if __name__ == "__main__":
    unittest.main()
