"""
Cross-Run Target Reliability Engine
Conforms to MAGNIOM-Neuroimaging & Functional Connectomics Pipeline Specification v1.0 Section 107
and MAGNIOM-Canonical Target Data Specification v1.0 Section 36
"""

from typing import Dict, List, Tuple, Optional, Any
from ..models.circuits import SpatialCoordinate
from ..models.surface import SurfaceProjectionResult
from ..connectome.atlas import HcpMmpAtlasManager
from .models import CrossRunResult
from .split_half import SplitHalfPartitionEngine
from .metrics import (
    calculate_euclidean_distance,
    calculate_surface_geodesic_distance,
    calculate_pearson_correlation,
    calculate_spearman_correlation,
    calculate_cluster_dice,
    calculate_cluster_jaccard,
)


class CrossRunReliabilityEngine:
    """
    Evaluates reproducibility across independent BOLD scanning runs.
    Calculates cross-run target displacement D_cross, surface geodesic distance,
    search-space map correlation R_map, and cluster overlap.
    """

    @classmethod
    def evaluate_cross_run_convergent(
        cls,
        subject_id: str,
        surface_projections: List[SurfaceProjectionResult],
    ) -> CrossRunResult:
        """
        Evaluates cross-run reliability for Convergent Depression Circuit.
        """
        if len(surface_projections) < 2:
            return CrossRunResult(
                assessed=False,
                distance_mm=None,
                geodesic_distance_mm=None,
                map_similarity=None,
                spearman_similarity=None,
                cluster_dice=None,
                cluster_jaccard=None,
                runs_evaluated=[p.run_index for p in surface_projections],
                limiting_factor="SINGLE_RUN_ACQUISITION",
            )

        proj1 = surface_projections[0]
        proj2 = surface_projections[1]

        ts1 = proj1.ts_lh_32k.data_matrix
        ts2 = proj2.ts_lh_32k.data_matrix
        medial_mask = proj1.ts_lh_32k.medial_wall_mask
        num_v = len(ts1)
        tp1 = len(ts1[0]) if num_v > 0 else 0
        tp2 = len(ts2[0]) if num_v > 0 else 0

        # Run 1 evaluation
        map1, peak_v1, med_v1, clust1, peak_c1, med_c1 = SplitHalfPartitionEngine._compute_convergent_half(
            ts1, medial_mask, num_v, tp1
        )
        # Run 2 evaluation
        map2, peak_v2, med_v2, clust2, peak_c2, med_c2 = SplitHalfPartitionEngine._compute_convergent_half(
            ts2, medial_mask, num_v, tp2
        )

        dist_mm = calculate_euclidean_distance(med_c1, med_c2)
        geodesic_mm = calculate_surface_geodesic_distance(med_v1, med_v2, hemisphere="L")

        search_vertices = HcpMmpAtlasManager.get_left_prefrontal_search_vertices()
        map_sim = calculate_pearson_correlation(map1, map2, mask_indices=search_vertices)
        spearman_sim = calculate_spearman_correlation(map1, map2, mask_indices=search_vertices)
        dice = calculate_cluster_dice(clust1, clust2)
        jaccard = calculate_cluster_jaccard(clust1, clust2)

        return CrossRunResult(
            assessed=True,
            distance_mm=dist_mm,
            geodesic_distance_mm=geodesic_mm,
            map_similarity=map_sim,
            spearman_similarity=spearman_sim,
            cluster_dice=dice,
            cluster_jaccard=jaccard,
            runs_evaluated=[proj1.run_index, proj2.run_index],
            run_1_peak_mni=peak_c1,
            run_1_medoid_mni=med_c1,
            run_2_peak_mni=peak_c2,
            run_2_medoid_mni=med_c2,
            limiting_factor=None,
        )

    @classmethod
    def evaluate_cross_run_sgacc(
        cls,
        subject_id: str,
        surface_projections: List[SurfaceProjectionResult],
    ) -> CrossRunResult:
        """
        Evaluates cross-run reliability for sgACC Anticorrelation Circuit.
        """
        if len(surface_projections) < 2:
            return CrossRunResult(
                assessed=False,
                distance_mm=None,
                geodesic_distance_mm=None,
                map_similarity=None,
                spearman_similarity=None,
                cluster_dice=None,
                cluster_jaccard=None,
                runs_evaluated=[p.run_index for p in surface_projections],
                limiting_factor="SINGLE_RUN_ACQUISITION",
            )

        proj1 = surface_projections[0]
        proj2 = surface_projections[1]

        ts1 = proj1.ts_lh_32k.data_matrix
        ts2 = proj2.ts_lh_32k.data_matrix
        medial_mask = proj1.ts_lh_32k.medial_wall_mask
        num_v = len(ts1)
        tp1 = len(ts1[0]) if num_v > 0 else 0
        tp2 = len(ts2[0]) if num_v > 0 else 0

        map1, peak_v1, med_v1, clust1, peak_c1, med_c1 = SplitHalfPartitionEngine._compute_sgacc_half(
            ts1, medial_mask, num_v, tp1
        )
        map2, peak_v2, med_v2, clust2, peak_c2, med_c2 = SplitHalfPartitionEngine._compute_sgacc_half(
            ts2, medial_mask, num_v, tp2
        )

        dist_mm = calculate_euclidean_distance(med_c1, med_c2)
        geodesic_mm = calculate_surface_geodesic_distance(med_v1, med_v2, hemisphere="L")

        search_vertices = HcpMmpAtlasManager.get_left_prefrontal_search_vertices()
        map_sim = calculate_pearson_correlation(map1, map2, mask_indices=search_vertices)
        spearman_sim = calculate_spearman_correlation(map1, map2, mask_indices=search_vertices)
        dice = calculate_cluster_dice(clust1, clust2)
        jaccard = calculate_cluster_jaccard(clust1, clust2)

        return CrossRunResult(
            assessed=True,
            distance_mm=dist_mm,
            geodesic_distance_mm=geodesic_mm,
            map_similarity=map_sim,
            spearman_similarity=spearman_sim,
            cluster_dice=dice,
            cluster_jaccard=jaccard,
            runs_evaluated=[proj1.run_index, proj2.run_index],
            run_1_peak_mni=peak_c1,
            run_1_medoid_mni=med_c1,
            run_2_peak_mni=peak_c2,
            run_2_medoid_mni=med_c2,
            limiting_factor=None,
        )
