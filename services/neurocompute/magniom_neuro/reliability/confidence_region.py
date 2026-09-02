"""
Cortical Spatial Confidence Region Engine
Conforms to MAGNIOM-Neuroimaging & Functional Connectomics Pipeline Specification v1.0 Section 115
and MAGNIOM-Canonical Target Data Specification v1.0 Section 36
"""

import math
from typing import List, Tuple, Optional, Sequence
from ..models.circuits import SpatialCoordinate
from ..connectome.atlas import HcpMmpAtlasManager
from .models import SpatialRegion, SplitHalfResult, CrossRunResult, PipelineSensitivityResult
from .metrics import calculate_euclidean_distance


class ConfidenceRegionEngine:
    """
    Constructs a 3D and cortical surface confidence region incorporating
    split-half, cross-run, and sensitivity coordinates/clusters.
    """

    @classmethod
    def build_confidence_region(
        cls,
        primary_medoid_mni: SpatialCoordinate,
        primary_vertex_index: int,
        split_half_result: Optional[SplitHalfResult] = None,
        cross_run_result: Optional[CrossRunResult] = None,
        sensitivity_result: Optional[PipelineSensitivityResult] = None,
        hemisphere: str = "L",
    ) -> SpatialRegion:
        """
        Builds a SpatialRegion object encompassing all candidate observations and spatial uncertainty.
        """
        coords: List[Tuple[float, float, float]] = [(primary_medoid_mni.x, primary_medoid_mni.y, primary_medoid_mni.z)]
        vertices: set = {primary_vertex_index}

        if split_half_result:
            coords.append((split_half_result.half_a_medoid_mni.x, split_half_result.half_a_medoid_mni.y, split_half_result.half_a_medoid_mni.z))
            coords.append((split_half_result.half_b_medoid_mni.x, split_half_result.half_b_medoid_mni.y, split_half_result.half_b_medoid_mni.z))

        if cross_run_result and cross_run_result.assessed:
            if cross_run_result.run_1_medoid_mni:
                coords.append((cross_run_result.run_1_medoid_mni.x, cross_run_result.run_1_medoid_mni.y, cross_run_result.run_1_medoid_mni.z))
            if cross_run_result.run_2_medoid_mni:
                coords.append((cross_run_result.run_2_medoid_mni.x, cross_run_result.run_2_medoid_mni.y, cross_run_result.run_2_medoid_mni.z))

        if sensitivity_result and sensitivity_result.assessed:
            if sensitivity_result.sd1_medoid_mni:
                coords.append((sensitivity_result.sd1_medoid_mni.x, sensitivity_result.sd1_medoid_mni.y, sensitivity_result.sd1_medoid_mni.z))

        # Add neighbouring vertices within the local atlas parcel or radius
        parcels = HcpMmpAtlasManager.get_cortical_parcels()
        matching_parcel = next((p for p in parcels if p.hemisphere == hemisphere and primary_vertex_index in p.vertex_indices), None)
        if matching_parcel:
            for v in matching_parcel.vertex_indices[:60]:
                vertices.add(v)

        # Centroid
        n = len(coords)
        c_x = sum(c[0] for c in coords) / float(n)
        c_y = sum(c[1] for c in coords) / float(n)
        c_z = sum(c[2] for c in coords) / float(n)
        centroid = (round(c_x, 2), round(c_y, 2), round(c_z, 2))

        # Bounding box
        min_x = min(c[0] for c in coords) - 2.0
        max_x = max(c[0] for c in coords) + 2.0
        min_y = min(c[1] for c in coords) - 2.0
        max_y = max(c[1] for c in coords) + 2.0
        min_z = min(c[2] for c in coords) - 2.0
        max_z = max(c[2] for c in coords) + 2.0

        bounding_box = (
            (round(min_x, 2), round(min_y, 2), round(min_z, 2)),
            (round(max_x, 2), round(max_y, 2), round(max_z, 2)),
        )

        # Max radius
        max_radius = max(calculate_euclidean_distance(centroid, c) for c in coords)
        # Pad slightly to create smooth confidence envelope
        max_radius = max(4.0, max_radius + 2.5)

        sorted_vertices = sorted(list(vertices))
        area_mm2 = round(len(sorted_vertices) * 0.95, 1)

        return SpatialRegion(
            space="fsLR_32k",
            hemisphere=hemisphere,
            surface_vertex_indices=sorted_vertices,
            surface_area_mm2=area_mm2,
            centroid_mni=centroid,
            bounding_box_mni=bounding_box,
            max_radius_mm=round(max_radius, 2),
        )
