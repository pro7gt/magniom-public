"""
Split-Half Reliability Partition and Stability Engine
Conforms to MAGNIOM-Neuroimaging & Functional Connectomics Pipeline Specification v1.0 Sections 108-109
and MAGNIOM-Canonical Target Data Specification v1.0 Section 36
"""

import math
from typing import Dict, List, Tuple, Optional, Any
from ..models.circuits import (
    SpatialCoordinate,
    SurfaceVertexRef,
    CorticalCandidateCluster,
    ConvergentCircuitResult,
    SgaccConnectivityResult,
)
from ..models.surface import SurfaceProjectionResult, SurfaceFunctionalTimeSeries

from ..connectome.atlas import HcpMmpAtlasManager
from ..circuits.convergent import ConvergentCircuitEngine
from ..circuits.sgacc import SgaccCircuitEngine
from .models import SplitHalfResult
from .metrics import (
    calculate_euclidean_distance,
    calculate_surface_geodesic_distance,
    calculate_pearson_correlation,
    calculate_spearman_correlation,
    calculate_cluster_dice,
    calculate_cluster_jaccard,
    calculate_cluster_area_delta,
)


class SplitHalfPartitionEngine:
    """
    Partitions retained BOLD surface time series into independent halves
    using a frozen interleaved-block temporal strategy and computes target stability.
    """

    PARTITION_STRATEGY = "TEMPORAL_INTERLEAVED_BLOCKS_V1"
    BLOCK_SIZE_VOLUMES = 20  # ~30 seconds per block at TR=1.5s

    @classmethod
    def partition_time_series(
        cls,
        time_series_matrix: List[List[float]],
        block_size: int = BLOCK_SIZE_VOLUMES,
    ) -> Tuple[List[List[float]], List[List[float]], List[int], List[int]]:
        """
        Partitions time series [vertices x timepoints] into Half A and Half B.
        Returns (ts_half_a, ts_half_b, indices_a, indices_b).
        """
        num_vertices = len(time_series_matrix)
        if num_vertices == 0:
            return [], [], [], []
        num_timepoints = len(time_series_matrix[0])

        indices_a: List[int] = []
        indices_b: List[int] = []

        # Interleave blocks
        for t in range(num_timepoints):
            block_idx = t // block_size
            if block_idx % 2 == 0:
                indices_a.append(t)
            else:
                indices_b.append(t)

        # Ensure both halves have sufficient minimum timepoints
        if len(indices_a) < 5 or len(indices_b) < 5:
            # Fallback to simple even/odd frame split
            indices_a = [t for t in range(num_timepoints) if t % 2 == 0]
            indices_b = [t for t in range(num_timepoints) if t % 2 != 0]

        ts_a: List[List[float]] = []
        ts_b: List[List[float]] = []

        for v in range(num_vertices):
            row = time_series_matrix[v]
            ts_a.append([row[t] for t in indices_a])
            ts_b.append([row[t] for t in indices_b])

        return ts_a, ts_b, indices_a, indices_b

    @classmethod
    def evaluate_split_half_convergent(
        cls,
        subject_id: str,
        surface_projection: SurfaceProjectionResult,
        tr_seconds: float = 1.5,
    ) -> SplitHalfResult:
        """
        Evaluates split-half reproducibility for the Convergent Depression Circuit.
        """
        ts_lh = surface_projection.ts_lh_32k.data_matrix
        medial_mask_lh = surface_projection.ts_lh_32k.medial_wall_mask
        num_vertices = len(ts_lh)

        ts_a, ts_b, idx_a, idx_b = cls.partition_time_series(ts_lh)
        min_tp_a = len(idx_a)
        min_tp_b = len(idx_b)

        retained_min_a = round((min_tp_a * tr_seconds) / 60.0, 2)
        retained_min_b = round((min_tp_b * tr_seconds) / 60.0, 2)

        # 1. Compute concordance for Half A
        map_a, peak_v_a, medoid_v_a, clust_a, coord_peak_a, coord_med_a = cls._compute_convergent_half(
            ts_a, medial_mask_lh, num_vertices, min_tp_a
        )

        # 2. Compute concordance for Half B
        map_b, peak_v_b, medoid_v_b, clust_b, coord_peak_b, coord_med_b = cls._compute_convergent_half(
            ts_b, medial_mask_lh, num_vertices, min_tp_b
        )

        # 3. Calculate reliability metrics
        dist_mm = calculate_euclidean_distance(coord_med_a, coord_med_b)
        geodesic_mm = calculate_surface_geodesic_distance(medoid_v_a, medoid_v_b, hemisphere="L")

        search_vertices = HcpMmpAtlasManager.get_left_prefrontal_search_vertices()
        map_sim = calculate_pearson_correlation(map_a, map_b, mask_indices=search_vertices)
        spearman_sim = calculate_spearman_correlation(map_a, map_b, mask_indices=search_vertices)
        dice = calculate_cluster_dice(clust_a, clust_b)
        jaccard = calculate_cluster_jaccard(clust_a, clust_b)

        area_a = len(clust_a) * 0.95
        area_b = len(clust_b) * 0.95
        delta_area, _ = calculate_cluster_area_delta(area_a, area_b)

        return SplitHalfResult(
            distance_mm=dist_mm,
            geodesic_distance_mm=geodesic_mm,
            map_similarity=map_sim,
            spearman_similarity=spearman_sim,
            cluster_dice=dice,
            cluster_jaccard=jaccard,
            cluster_area_delta_mm2=delta_area,
            half_a_peak_mni=coord_peak_a,
            half_a_medoid_mni=coord_med_a,
            half_b_peak_mni=coord_peak_b,
            half_b_medoid_mni=coord_med_b,
            partition_strategy=cls.PARTITION_STRATEGY,
            half_a_retained_minutes=retained_min_a,
            half_b_retained_minutes=retained_min_b,
        )

    @classmethod
    def evaluate_split_half_sgacc(
        cls,
        subject_id: str,
        surface_projection: SurfaceProjectionResult,
        tr_seconds: float = 1.5,
    ) -> SplitHalfResult:
        """
        Evaluates split-half reproducibility for the sgACC Anticorrelation Circuit.
        """
        ts_lh = surface_projection.ts_lh_32k.data_matrix
        medial_mask_lh = surface_projection.ts_lh_32k.medial_wall_mask
        num_vertices = len(ts_lh)

        ts_a, ts_b, idx_a, idx_b = cls.partition_time_series(ts_lh)
        min_tp_a = len(idx_a)
        min_tp_b = len(idx_b)

        retained_min_a = round((min_tp_a * tr_seconds) / 60.0, 2)
        retained_min_b = round((min_tp_b * tr_seconds) / 60.0, 2)

        # 1. Compute anticorrelation for Half A
        map_a, peak_v_a, medoid_v_a, clust_a, coord_peak_a, coord_med_a = cls._compute_sgacc_half(
            ts_a, medial_mask_lh, num_vertices, min_tp_a
        )

        # 2. Compute anticorrelation for Half B
        map_b, peak_v_b, medoid_v_b, clust_b, coord_peak_b, coord_med_b = cls._compute_sgacc_half(
            ts_b, medial_mask_lh, num_vertices, min_tp_b
        )

        dist_mm = calculate_euclidean_distance(coord_med_a, coord_med_b)
        geodesic_mm = calculate_surface_geodesic_distance(medoid_v_a, medoid_v_b, hemisphere="L")

        search_vertices = HcpMmpAtlasManager.get_left_prefrontal_search_vertices()
        map_sim = calculate_pearson_correlation(map_a, map_b, mask_indices=search_vertices)
        spearman_sim = calculate_spearman_correlation(map_a, map_b, mask_indices=search_vertices)
        dice = calculate_cluster_dice(clust_a, clust_b)
        jaccard = calculate_cluster_jaccard(clust_a, clust_b)

        area_a = len(clust_a) * 0.95
        area_b = len(clust_b) * 0.95
        delta_area, _ = calculate_cluster_area_delta(area_a, area_b)

        return SplitHalfResult(
            distance_mm=dist_mm,
            geodesic_distance_mm=geodesic_mm,
            map_similarity=map_sim,
            spearman_similarity=spearman_sim,
            cluster_dice=dice,
            cluster_jaccard=jaccard,
            cluster_area_delta_mm2=delta_area,
            half_a_peak_mni=coord_peak_a,
            half_a_medoid_mni=coord_med_a,
            half_b_peak_mni=coord_peak_b,
            half_b_medoid_mni=coord_med_b,
            partition_strategy=cls.PARTITION_STRATEGY,
            half_a_retained_minutes=retained_min_a,
            half_b_retained_minutes=retained_min_b,
        )

    # ------------------------------------------------------------------
    # Internal Half Extractors
    # ------------------------------------------------------------------

    @classmethod
    def _compute_convergent_half(
        cls,
        ts_half: List[List[float]],
        medial_mask: List[bool],
        num_vertices: int,
        num_timepoints: int,
    ) -> Tuple[List[float], int, int, List[int], SpatialCoordinate, SpatialCoordinate]:
        weights = ConvergentCircuitEngine.get_canonical_circuit_weights(num_vertices)
        for v in range(num_vertices):
            if medial_mask[v]:
                weights[v] = 0.0

        abs_weights_sum = sum(abs(w) for w in weights) or 1.0

        circuit_ts = [0.0] * num_timepoints
        for t in range(num_timepoints):
            circuit_ts[t] = sum(weights[v] * ts_half[v][t] for v in range(num_vertices)) / abs_weights_sum

        mean_c = sum(circuit_ts) / num_timepoints if num_timepoints > 0 else 0.0
        var_c = sum((x - mean_c) ** 2 for x in circuit_ts) / (num_timepoints - 1 if num_timepoints > 1 else 1)
        std_c = math.sqrt(var_c) if var_c > 0 else 1.0
        norm_c = [(x - mean_c) / std_c for x in circuit_ts]

        concordance_map = [0.0] * num_vertices
        n_denom = float(num_timepoints - 1) if num_timepoints > 1 else 1.0

        for v in range(num_vertices):
            if medial_mask[v]:
                continue
            row = ts_half[v]
            mean_v = sum(row) / num_timepoints if num_timepoints > 0 else 0.0
            var_v = sum((x - mean_v) ** 2 for x in row) / n_denom
            if var_v <= 0:
                continue
            std_v = math.sqrt(var_v)
            dot = sum(((row[t] - mean_v) / std_v) * norm_c[t] for t in range(num_timepoints))
            concordance_map[v] = round(max(-0.9999, min(0.9999, dot / n_denom)), 4)

        search_vertices = HcpMmpAtlasManager.get_left_prefrontal_search_vertices()
        search_concordance = [concordance_map[v] for v in search_vertices]
        sorted_scores = sorted(search_concordance)
        p85_idx = int(len(sorted_scores) * 0.85)
        thresh = sorted_scores[p85_idx] if sorted_scores else 0.0

        cluster_v = [v for v in search_vertices if concordance_map[v] >= thresh and not medial_mask[v]]
        if not cluster_v:
            cluster_v = [search_vertices[0]]

        peak_v = max(search_vertices, key=lambda v: concordance_map[v])
        medoid_v = cluster_v[len(cluster_v) // 2]

        parcels = HcpMmpAtlasManager.get_cortical_parcels()
        peak_p = next((p for p in parcels if p.hemisphere == "L" and peak_v in p.vertex_indices), parcels[0])
        med_p = next((p for p in parcels if p.hemisphere == "L" and medoid_v in p.vertex_indices), parcels[0])

        peak_coord = SpatialCoordinate("MNI152NLin2009cAsym", peak_p.centroid_mni[0], peak_p.centroid_mni[1], peak_p.centroid_mni[2])
        med_coord = SpatialCoordinate("MNI152NLin2009cAsym", med_p.centroid_mni[0], med_p.centroid_mni[1], med_p.centroid_mni[2])

        return concordance_map, peak_v, medoid_v, cluster_v, peak_coord, med_coord

    @classmethod
    def _compute_sgacc_half(
        cls,
        ts_half: List[List[float]],
        medial_mask: List[bool],
        num_vertices: int,
        num_timepoints: int,
    ) -> Tuple[List[float], int, int, List[int], SpatialCoordinate, SpatialCoordinate]:
        # sgACC proxy seed from medial subgenual vertices
        seed_vertices = [v for v in range(25000, 26000) if v < num_vertices and not medial_mask[v]]
        if not seed_vertices:
            seed_vertices = [0]

        seed_ts = [0.0] * num_timepoints
        for t in range(num_timepoints):
            seed_ts[t] = sum(ts_half[v][t] for v in seed_vertices) / float(len(seed_vertices))

        mean_s = sum(seed_ts) / num_timepoints if num_timepoints > 0 else 0.0
        var_s = sum((x - mean_s) ** 2 for x in seed_ts) / (num_timepoints - 1 if num_timepoints > 1 else 1)
        std_s = math.sqrt(var_s) if var_s > 0 else 1.0
        norm_s = [(x - mean_s) / std_s for x in seed_ts]

        anticorr_map = [0.0] * num_vertices
        n_denom = float(num_timepoints - 1) if num_timepoints > 1 else 1.0

        for v in range(num_vertices):
            if medial_mask[v]:
                continue
            row = ts_half[v]
            mean_v = sum(row) / num_timepoints if num_timepoints > 0 else 0.0
            var_v = sum((x - mean_v) ** 2 for x in row) / n_denom
            if var_v <= 0:
                continue
            std_v = math.sqrt(var_v)
            dot = sum(((row[t] - mean_v) / std_v) * norm_s[t] for t in range(num_timepoints))
            r = dot / n_denom
            # Negative correlation is positive anticorrelation
            anticorr_map[v] = round(max(-0.9999, min(0.9999, -r)), 4)

        search_vertices = HcpMmpAtlasManager.get_left_prefrontal_search_vertices()
        search_scores = [anticorr_map[v] for v in search_vertices]
        sorted_scores = sorted(search_scores)
        p85_idx = int(len(sorted_scores) * 0.85)
        thresh = sorted_scores[p85_idx] if sorted_scores else 0.0

        cluster_v = [v for v in search_vertices if anticorr_map[v] >= thresh and not medial_mask[v]]
        if not cluster_v:
            cluster_v = [search_vertices[0]]

        peak_v = max(search_vertices, key=lambda v: anticorr_map[v])
        medoid_v = cluster_v[len(cluster_v) // 2]

        parcels = HcpMmpAtlasManager.get_cortical_parcels()
        peak_p = next((p for p in parcels if p.hemisphere == "L" and peak_v in p.vertex_indices), parcels[0])
        med_p = next((p for p in parcels if p.hemisphere == "L" and medoid_v in p.vertex_indices), parcels[0])

        peak_coord = SpatialCoordinate("MNI152NLin2009cAsym", peak_p.centroid_mni[0], peak_p.centroid_mni[1], peak_p.centroid_mni[2])
        med_coord = SpatialCoordinate("MNI152NLin2009cAsym", med_p.centroid_mni[0], med_p.centroid_mni[1], med_p.centroid_mni[2])

        return anticorr_map, peak_v, medoid_v, cluster_v, peak_coord, med_coord
