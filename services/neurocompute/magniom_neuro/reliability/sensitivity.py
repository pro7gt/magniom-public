"""
Pipeline Sensitivity and Robustness Engine (CD-1 vs SD-1)
Conforms to MAGNIOM-Neuroimaging & Functional Connectomics Pipeline Specification v1.0 Section 113
and MAGNIOM-Canonical Target Data Specification v1.0 Section 36
"""

from typing import Dict, List, Tuple, Optional, Any
from ..models.circuits import SpatialCoordinate
from ..models.surface import SurfaceProjectionResult
from ..connectome.atlas import HcpMmpAtlasManager
from .models import PipelineSensitivityResult
from .split_half import SplitHalfPartitionEngine
from .metrics import (
    calculate_euclidean_distance,
    calculate_pearson_correlation,
    calculate_cluster_dice,
)


class PipelineSensitivityEngine:
    """
    Evaluates sensitivity of target coordinates and concordance maps
    to pipeline denoising variations (CD-1 multi-echo vs SD-1 standard stream).
    """

    @classmethod
    def evaluate_sensitivity_convergent(
        cls,
        subject_id: str,
        proj_cd1: SurfaceProjectionResult,
        proj_sd1: Optional[SurfaceProjectionResult],
    ) -> PipelineSensitivityResult:
        """
        Evaluates CD-1 vs SD-1 pipeline sensitivity for Convergent Depression Circuit.
        """
        if proj_sd1 is None:
            return PipelineSensitivityResult(
                assessed=False,
                sensitivity_distance_mm=None,
                map_similarity=None,
                cluster_dice=None,
                dispersion_interpretation="SD-1 sensitivity stream unassessed",
            )

        ts_cd1 = proj_cd1.ts_lh_32k.data_matrix
        ts_sd1 = proj_sd1.ts_lh_32k.data_matrix
        medial_mask = proj_cd1.ts_lh_32k.medial_wall_mask
        num_v = len(ts_cd1)
        tp_cd1 = len(ts_cd1[0]) if num_v > 0 else 0
        tp_sd1 = len(ts_sd1[0]) if num_v > 0 else 0

        map_cd1, _, med_v_cd1, clust_cd1, _, med_c_cd1 = SplitHalfPartitionEngine._compute_convergent_half(
            ts_cd1, medial_mask, num_v, tp_cd1
        )
        map_sd1, _, med_v_sd1, clust_sd1, _, med_c_sd1 = SplitHalfPartitionEngine._compute_convergent_half(
            ts_sd1, medial_mask, num_v, tp_sd1
        )

        dist_mm = calculate_euclidean_distance(med_c_cd1, med_c_sd1)
        search_vertices = HcpMmpAtlasManager.get_left_prefrontal_search_vertices()
        map_sim = calculate_pearson_correlation(map_cd1, map_sd1, mask_indices=search_vertices)
        dice = calculate_cluster_dice(clust_cd1, clust_sd1)

        dispersion = "nominal" if dist_mm <= 6.0 else ("moderate_dispersion" if dist_mm <= 12.0 else "high_dispersion")

        return PipelineSensitivityResult(
            assessed=True,
            sensitivity_distance_mm=dist_mm,
            map_similarity=map_sim,
            cluster_dice=dice,
            cd1_medoid_mni=med_c_cd1,
            sd1_medoid_mni=med_c_sd1,
            dispersion_interpretation=dispersion,
        )

    @classmethod
    def evaluate_sensitivity_sgacc(
        cls,
        subject_id: str,
        proj_cd1: SurfaceProjectionResult,
        proj_sd1: Optional[SurfaceProjectionResult],
    ) -> PipelineSensitivityResult:
        """
        Evaluates CD-1 vs SD-1 pipeline sensitivity for sgACC Anticorrelation Circuit.
        """
        if proj_sd1 is None:
            return PipelineSensitivityResult(
                assessed=False,
                sensitivity_distance_mm=None,
                map_similarity=None,
                cluster_dice=None,
                dispersion_interpretation="SD-1 sensitivity stream unassessed",
            )

        ts_cd1 = proj_cd1.ts_lh_32k.data_matrix
        ts_sd1 = proj_sd1.ts_lh_32k.data_matrix
        medial_mask = proj_cd1.ts_lh_32k.medial_wall_mask
        num_v = len(ts_cd1)
        tp_cd1 = len(ts_cd1[0]) if num_v > 0 else 0
        tp_sd1 = len(ts_sd1[0]) if num_v > 0 else 0

        map_cd1, _, med_v_cd1, clust_cd1, _, med_c_cd1 = SplitHalfPartitionEngine._compute_sgacc_half(
            ts_cd1, medial_mask, num_v, tp_cd1
        )
        map_sd1, _, med_v_sd1, clust_sd1, _, med_c_sd1 = SplitHalfPartitionEngine._compute_sgacc_half(
            ts_sd1, medial_mask, num_v, tp_sd1
        )

        dist_mm = calculate_euclidean_distance(med_c_cd1, med_c_sd1)
        search_vertices = HcpMmpAtlasManager.get_left_prefrontal_search_vertices()
        map_sim = calculate_pearson_correlation(map_cd1, map_sd1, mask_indices=search_vertices)
        dice = calculate_cluster_dice(clust_cd1, clust_sd1)

        dispersion = "nominal" if dist_mm <= 6.0 else ("moderate_dispersion" if dist_mm <= 12.0 else "high_dispersion")

        return PipelineSensitivityResult(
            assessed=True,
            sensitivity_distance_mm=dist_mm,
            map_similarity=map_sim,
            cluster_dice=dice,
            cd1_medoid_mni=med_c_cd1,
            sd1_medoid_mni=med_c_sd1,
            dispersion_interpretation=dispersion,
        )
