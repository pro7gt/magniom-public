"""
Exact-Algorithm Target Reliability and Confidence Scoring Engine
Conforms to MAGNIOM-Neuroimaging & Functional Connectomics Pipeline Specification v2.0
and Cash et al. 2021 (Hum Brain Mapp) Table 1 & Figure 5.
"""

import math
from dataclasses import dataclass, field
from typing import List, Tuple, Optional, Dict, Any

from ..circuits.mdd.fc_cluster_personalised import (
    CashZaleskyFcPipeline,
    FcClusterTargetResult,
    VoxelCoordinate,
)


@dataclass
class TargetReliabilityMetrics:
    spatial_displacement_mm: float
    cluster_dice_overlap: float
    connectivity_sign_consistent: bool
    confidence_status: str  # 'reliable', 'conditionally_reliable', 'unstable', 'not_estimable'
    variance_ratio_between_within: float = 1.0
    within_subject_variance_mm2: float = 0.0
    half_a_centroid: Tuple[float, float, float] = (0.0, 0.0, 0.0)
    half_b_centroid: Tuple[float, float, float] = (0.0, 0.0, 0.0)
    recommendation: str = ""


class ExactTargetReliabilityEngine:
    """
    Evaluates split-half and test-retest reliability using the EXACT production
    Cash-Zalesky targeting pipeline on independent partitions.
    """

    MAX_RELIABLE_DISPLACEMENT_MM = 3.0  # Cash 2021 Table 1: ~2.2mm
    MAX_CONDITIONAL_DISPLACEMENT_MM = 6.0
    MIN_RELIABLE_DICE = 0.50

    @classmethod
    def calculate_euclidean_distance(
        cls,
        p1: Tuple[float, float, float],
        p2: Tuple[float, float, float],
    ) -> float:
        return math.sqrt((p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2 + (p1[2] - p2[2]) ** 2)

    @classmethod
    def calculate_cluster_dice(
        cls,
        voxels_a: List[VoxelCoordinate],
        voxels_b: List[VoxelCoordinate],
    ) -> float:
        set_a = {v.voxel_id for v in voxels_a}
        set_b = {v.voxel_id for v in voxels_b}
        if not set_a and not set_b:
            return 1.0
        intersection = len(set_a.intersection(set_b))
        return (2.0 * intersection) / float(len(set_a) + len(set_b))

    @classmethod
    def evaluate_split_half_fc(
        cls,
        search_voxels_half_a: List[VoxelCoordinate],
        search_voxels_half_b: List[VoxelCoordinate],
        threshold_percentile: float = 0.10,
        min_cluster_size: int = 2,
    ) -> TargetReliabilityMetrics:
        """
        Executes the exact Cash-Zalesky algorithm on both temporal halves
        and computes repeatability and confidence metrics.
        """
        if not search_voxels_half_a or not search_voxels_half_b:
            return TargetReliabilityMetrics(
                spatial_displacement_mm=999.0,
                cluster_dice_overlap=0.0,
                connectivity_sign_consistent=False,
                confidence_status="not_estimable",
                recommendation="Insufficient data in split-half partitions.",
            )

        # Run exact production algorithm on Half A and Half B
        result_a = CashZaleskyFcPipeline.compute_fc_clustering(
            search_voxels=search_voxels_half_a,
            threshold_percentile=threshold_percentile,
            min_cluster_size=min_cluster_size,
        )

        result_b = CashZaleskyFcPipeline.compute_fc_clustering(
            search_voxels=search_voxels_half_b,
            threshold_percentile=threshold_percentile,
            min_cluster_size=min_cluster_size,
        )

        dist = cls.calculate_euclidean_distance(
            result_a.target_centroid_mni, result_b.target_centroid_mni
        )

        vox_a = result_a.largest_cluster.voxels if result_a.largest_cluster else []
        vox_b = result_b.largest_cluster.voxels if result_b.largest_cluster else []
        dice = cls.calculate_cluster_dice(vox_a, vox_b)

        sign_consistent = (
            result_a.threshold_value < 0 and result_b.threshold_value < 0
        )

        # Confidence status classification
        if dist <= cls.MAX_RELIABLE_DISPLACEMENT_MM and dice >= cls.MIN_RELIABLE_DICE and sign_consistent:
            status = "reliable"
            rec = "High intra-individual stability. Suitable for clinical candidate review."
        elif dist <= cls.MAX_CONDITIONAL_DISPLACEMENT_MM and sign_consistent:
            status = "conditionally_reliable"
            rec = "Moderate stability. Clinician review of anatomical fit required."
        else:
            status = "unstable"
            rec = f"Low stability (displacement {dist:.1f}mm > 6.0mm or low cluster overlap). Blocked from automated promotion."

        return TargetReliabilityMetrics(
            spatial_displacement_mm=round(dist, 2),
            cluster_dice_overlap=round(dice, 4),
            connectivity_sign_consistent=sign_consistent,
            confidence_status=status,
            half_a_centroid=result_a.target_centroid_mni,
            half_b_centroid=result_b.target_centroid_mni,
            recommendation=rec,
        )
