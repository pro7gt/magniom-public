"""
Cash-Zalesky Functional Connectivity Personalised DLPFC Targeting Pipeline
Conforms to:
Cash RFH, Cocchi L, Lv J, Fitzgerald PB, Zalesky A.
"Personalized connectivity-guided DLPFC-TMS for depression: Advancing computational
feasibility, precision and reproducibility." Human Brain Mapping. 2021;42(13):4155-4172.
DOI: 10.1002/hbm.25330
"""

import math
from collections import deque
from dataclasses import dataclass, field
from typing import List, Dict, Tuple, Optional, Set, Any


@dataclass(frozen=True)
class VoxelCoordinate:
    x: float
    y: float
    z: float
    connectivity: float  # Signed Pearson r (anticorrelation = negative r)
    voxel_id: int = 0


@dataclass
class ClusterDelineation:
    cluster_id: int
    voxels: List[VoxelCoordinate]
    size: int
    mean_connectivity: float
    peak_voxel: VoxelCoordinate
    weighted_centroid: Tuple[float, float, float]
    medoid: VoxelCoordinate


@dataclass
class FcClusterTargetResult:
    method_code: str = "FC_CLUSTER_PERSONALISED"
    method_version: str = "0.1.0"
    target_centroid_mni: Optional[Tuple[float, float, float]] = None
    target_medoid_mni: Optional[Tuple[float, float, float]] = None
    raw_peak_mni: Optional[Tuple[float, float, float]] = None
    largest_cluster_size: int = 0
    threshold_value: float = 0.0
    retained_voxels_count: int = 0
    total_search_voxels: int = 0
    largest_cluster: Optional[ClusterDelineation] = None
    alternate_clusters: List[ClusterDelineation] = field(default_factory=list)
    seed_definition_id: str = "SEED-MDD-SGC-CASH-2021"
    coordinate_space: str = "MNI152NLin2009cAsym"
    data_origin: str = "patient_measured"
    scientific_maturity: str = "validation"
    clinical_promotion_status: str = "blocked"
    benchmark_population_uncertainty_mm: float = 2.2  # Cash 2021 Table 1 population-level spatial variance
    status: str = "success"

    @property
    def uncertainty_radius_mm(self) -> float:
        """Backward-compatibility alias for benchmark_population_uncertainty_mm."""
        return self.benchmark_population_uncertainty_mm


class CashZaleskyFcPipeline:
    """
    Executes the patient-specific Cash-Zalesky cluster-based targeting algorithm.
    Extracts contiguous clusters of suprathreshold anticorrelation within the left DLPFC.
    """

    METHOD_CODE = "FC_CLUSTER_PERSONALISED"
    METHOD_VERSION = "0.1.0"
    DEFAULT_SEED_ID = "SEED-MDD-SGC-CASH-2021"
    COORDINATE_SPACE = "MNI152NLin2009cAsym"

    @classmethod
    def compute_fc_clustering(
        cls,
        search_voxels: List[VoxelCoordinate],
        threshold_percentile: float = 0.10,  # Cash 2021 §2.4.4: 10%
        min_cluster_size: int = 2,
        grid_step_mm: float = 2.0,
        seed_id: str = DEFAULT_SEED_ID,
        data_origin: str = "patient_measured",
        adjacency_list: Optional[Dict[int, List[int]]] = None,
    ) -> FcClusterTargetResult:
        """
        Delineates clusters of negative functional connectivity in the search space.
        Supports both 3D voxel lattice 26-neighborhood and surface mesh vertex adjacency.
        """
        if not search_voxels:
            raise ValueError("CashZaleskyFcPipeline: search_voxels list cannot be empty.")

        total_search = len(search_voxels)

        # 1. Rank voxels by most negative connectivity (strongest anticorrelation)
        sorted_voxels = sorted(search_voxels, key=lambda v: v.connectivity)
        retain_count = max(1, int(round(total_search * threshold_percentile)))
        suprathreshold = sorted_voxels[:retain_count]
        threshold_value = suprathreshold[-1].connectivity

        clusters: List[ClusterDelineation] = []
        cluster_id = 1

        if adjacency_list is not None:
            # 2A. Mesh-based cortical surface adjacency graph
            voxel_by_id = {v.voxel_id: v for v in suprathreshold}
            visited_ids: Set[int] = set()

            for start_v in suprathreshold:
                if start_v.voxel_id in visited_ids:
                    continue

                cluster_voxels: List[VoxelCoordinate] = []
                queue = deque([start_v.voxel_id])
                visited_ids.add(start_v.voxel_id)

                while queue:
                    curr_id = queue.popleft()
                    cluster_voxels.append(voxel_by_id[curr_id])

                    for nbr_id in adjacency_list.get(curr_id, []):
                        if nbr_id in voxel_by_id and nbr_id not in visited_ids:
                            visited_ids.add(nbr_id)
                            queue.append(nbr_id)

                if len(cluster_voxels) >= min_cluster_size:
                    total_w = sum(abs(v.connectivity) for v in cluster_voxels) or 1.0
                    cx = sum(v.x * abs(v.connectivity) for v in cluster_voxels) / total_w
                    cy = sum(v.y * abs(v.connectivity) for v in cluster_voxels) / total_w
                    cz = sum(v.z * abs(v.connectivity) for v in cluster_voxels) / total_w
                    centroid = (round(cx, 2), round(cy, 2), round(cz, 2))
                    peak_vox = min(cluster_voxels, key=lambda v: v.connectivity)

                    def dist_to_centroid(v: VoxelCoordinate) -> float:
                        return (v.x - cx) ** 2 + (v.y - cy) ** 2 + (v.z - cz) ** 2

                    medoid_vox = min(cluster_voxels, key=dist_to_centroid)
                    mean_conn = sum(v.connectivity for v in cluster_voxels) / len(cluster_voxels)

                    clusters.append(
                        ClusterDelineation(
                            cluster_id=cluster_id,
                            voxels=cluster_voxels,
                            size=len(cluster_voxels),
                            mean_connectivity=round(mean_conn, 4),
                            peak_voxel=peak_vox,
                            weighted_centroid=centroid,
                            medoid=medoid_vox,
                        )
                    )
                    cluster_id += 1
        else:
            # 2B. Delineate 26-neighborhood contiguous spatial clusters in 3D lattice
            voxel_map: Dict[Tuple[int, int, int], VoxelCoordinate] = {}
            for v in suprathreshold:
                key = (
                    int(round(v.x / grid_step_mm)),
                    int(round(v.y / grid_step_mm)),
                    int(round(v.z / grid_step_mm)),
                )
                voxel_map[key] = v

            visited: Set[Tuple[int, int, int]] = set()

            offsets = [
                (dx, dy, dz)
                for dx in (-1, 0, 1)
                for dy in (-1, 0, 1)
                for dz in (-1, 0, 1)
                if not (dx == 0 and dy == 0 and dz == 0)
            ]

            for key, start_voxel in voxel_map.items():
                if key in visited:
                    continue

                cluster_voxels: List[VoxelCoordinate] = []
                queue = deque([key])
                visited.add(key)

                while queue:
                    curr_key = queue.popleft()
                    cluster_voxels.append(voxel_map[curr_key])

                    for dx, dy, dz in offsets:
                        nb_key = (curr_key[0] + dx, curr_key[1] + dy, curr_key[2] + dz)
                        if nb_key in voxel_map and nb_key not in visited:
                            visited.add(nb_key)
                            queue.append(nb_key)

                if len(cluster_voxels) >= min_cluster_size:
                    total_w = sum(abs(v.connectivity) for v in cluster_voxels) or 1.0
                    cx = sum(v.x * abs(v.connectivity) for v in cluster_voxels) / total_w
                    cy = sum(v.y * abs(v.connectivity) for v in cluster_voxels) / total_w
                    cz = sum(v.z * abs(v.connectivity) for v in cluster_voxels) / total_w
                    centroid = (round(cx, 2), round(cy, 2), round(cz, 2))
                    peak_vox = min(cluster_voxels, key=lambda v: v.connectivity)

                    def dist_to_centroid(v: VoxelCoordinate) -> float:
                        return (v.x - cx) ** 2 + (v.y - cy) ** 2 + (v.z - cz) ** 2

                    medoid_vox = min(cluster_voxels, key=dist_to_centroid)
                    mean_conn = sum(v.connectivity for v in cluster_voxels) / len(cluster_voxels)

                    clusters.append(
                        ClusterDelineation(
                            cluster_id=cluster_id,
                            voxels=cluster_voxels,
                            size=len(cluster_voxels),
                            mean_connectivity=round(mean_conn, 4),
                            peak_voxel=peak_vox,
                            weighted_centroid=centroid,
                            medoid=medoid_vox,
                        )
                    )
                    cluster_id += 1

        # Sort clusters by size descending; tiebreak by mean anticorrelation
        clusters.sort(key=lambda c: (c.size, -c.mean_connectivity), reverse=True)

        # Fail-closed (§40, Revision 02 Finding 9): if no cluster met min_cluster_size, fail closed
        if not clusters:
            return FcClusterTargetResult(
                method_code=cls.METHOD_CODE,
                method_version=cls.METHOD_VERSION,
                target_centroid_mni=None,
                target_medoid_mni=None,
                raw_peak_mni=None,
                largest_cluster_size=0,
                threshold_value=threshold_value,
                retained_voxels_count=retain_count,
                total_search_voxels=total_search,
                largest_cluster=None,
                alternate_clusters=[],
                seed_definition_id=seed_id,
                coordinate_space=cls.COORDINATE_SPACE,
                data_origin=data_origin,
                scientific_maturity="validation",
                clinical_promotion_status="blocked",
                benchmark_population_uncertainty_mm=2.2,
                status="no_qualifying_cluster",
            )

        largest = clusters[0]
        alternates = clusters[1:]

        return FcClusterTargetResult(
            method_code=cls.METHOD_CODE,
            method_version=cls.METHOD_VERSION,
            target_centroid_mni=largest.weighted_centroid,
            target_medoid_mni=(largest.medoid.x, largest.medoid.y, largest.medoid.z),
            raw_peak_mni=(largest.peak_voxel.x, largest.peak_voxel.y, largest.peak_voxel.z),
            largest_cluster_size=largest.size,
            threshold_value=threshold_value,
            retained_voxels_count=retain_count,
            total_search_voxels=total_search,
            largest_cluster=largest,
            alternate_clusters=alternates,
            seed_definition_id=seed_id,
            coordinate_space=cls.COORDINATE_SPACE,
            data_origin=data_origin,
            scientific_maturity="validation",
            clinical_promotion_status="blocked",
            benchmark_population_uncertainty_mm=2.2,
            status="success",
        )

    @classmethod
    def execute_from_surface_timeseries(
        cls,
        ts_lh: List[List[float]],
        medial_wall_mask: List[bool],
        search_vertex_indices: List[int],
        vertex_coordinates_mni: Dict[int, Tuple[float, float, float]],
        seed_timeseries: List[float],
        threshold_percentile: float = 0.10,
        min_cluster_size: int = 2,
        data_origin: str = "patient_measured",
        adjacency_list: Optional[Dict[int, List[int]]] = None,
    ) -> FcClusterTargetResult:
        """
        Calculates seed-to-cortex functional connectivity from vertex timeseries,
        then executes cluster delineation.
        """
        n_tp = len(seed_timeseries)
        if n_tp < 10:
            raise ValueError("Insufficient timepoints for functional connectivity estimation.")

        # Standardize seed timeseries
        mean_s = sum(seed_timeseries) / n_tp
        var_s = sum((x - mean_s) ** 2 for x in seed_timeseries) / (n_tp - 1)
        std_s = math.sqrt(var_s) if var_s > 0 else 1.0
        norm_s = [(x - mean_s) / std_s for x in seed_timeseries]

        n_denom = float(n_tp - 1)
        voxels: List[VoxelCoordinate] = []

        for v_idx in search_vertex_indices:
            if v_idx >= len(ts_lh) or medial_wall_mask[v_idx]:
                continue

            row = ts_lh[v_idx]
            mean_v = sum(row) / n_tp
            var_v = sum((x - mean_v) ** 2 for x in row) / n_denom
            if var_v <= 0:
                continue

            std_v = math.sqrt(var_v)
            dot = sum(((row[t] - mean_v) / std_v) * norm_s[t] for t in range(n_tp))
            r = dot / n_denom

            # Reject missing vertex coordinates fail-closed (Revision 02 Finding P1-4)
            if v_idx not in vertex_coordinates_mni:
                raise KeyError(f"Missing MNI coordinates for vertex index {v_idx}")
            coord = vertex_coordinates_mni[v_idx]

            voxels.append(
                VoxelCoordinate(
                    x=coord[0],
                    y=coord[1],
                    z=coord[2],
                    connectivity=r,
                    voxel_id=v_idx,
                )
            )

        return cls.compute_fc_clustering(
            search_voxels=voxels,
            threshold_percentile=threshold_percentile,
            min_cluster_size=min_cluster_size,
            data_origin=data_origin,
            adjacency_list=adjacency_list,
        )
