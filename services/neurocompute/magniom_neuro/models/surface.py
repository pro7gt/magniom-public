"""
Cortical Surface Mesh and Shape Models
"""

from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any


@dataclass
class SurfaceMesh:
    """Cortical surface representation (white, pial, midthickness, inflated)."""
    surface_type: str  # white, pial, midthickness, inflated, sphere_reg
    hemisphere: str  # L, R
    coordinate_space: str  # NATIVE_T1W, fsLR_32k
    vertex_count: int
    triangle_count: int
    vertices: List[float]  # Flattened [x0, y0, z0, x1, y1, z1, ...]
    triangles: List[int]  # Flattened [i0, j0, k0, i1, j1, k1, ...]
    normals: Optional[List[float]] = None
    artifact_sha256: Optional[str] = None
    gifti_path: Optional[str] = None


@dataclass
class CorticalThicknessMap:
    """Vertex-wise cortical thickness metric values."""
    hemisphere: str  # L, R
    vertex_count: int
    thickness_values_mm: List[float]
    mean_thickness_mm: float
    std_thickness_mm: float
    min_thickness_mm: float
    max_thickness_mm: float
    outlier_fraction: float
    artifact_sha256: Optional[str] = None
    gifti_path: Optional[str] = None


@dataclass
class SurfaceResamplingResult:
    """Result of resampling subject surfaces to standard fsLR-32k space."""
    subject_id: str
    white_lh_32k: SurfaceMesh
    white_rh_32k: SurfaceMesh
    pial_lh_32k: SurfaceMesh
    pial_rh_32k: SurfaceMesh
    midthickness_lh_32k: SurfaceMesh
    midthickness_rh_32k: SurfaceMesh
    inflated_lh_32k: SurfaceMesh
    inflated_rh_32k: SurfaceMesh
    thickness_lh_32k: CorticalThicknessMap
    thickness_rh_32k: CorticalThicknessMap


@dataclass
class SurfaceFunctionalTimeSeries:
    """Surface-projected functional BOLD time series on standard fsLR-32k mesh."""
    subject_id: str
    run_index: int
    hemisphere: str  # L, R
    coordinate_space: str  # fsLR_32k
    vertex_count: int  # 32492
    valid_vertex_count: int  # e.g. 29696 (excluding medial wall)
    num_timepoints: int
    data_matrix: List[List[float]]  # Shape: [vertex_count, num_timepoints]
    medial_wall_mask: List[bool]  # True if medial wall (excluded)
    sampling_method: str  # RibbonConstrained_Trilinear
    artifact_gifti_path: Optional[str] = None
    artifact_gifti_sha256: Optional[str] = None


@dataclass
class SurfaceProjectionResult:
    """Full Stage 06 Surface Projection output across both hemispheres."""
    subject_id: str
    run_index: int
    denoising_configuration: str  # CD-1 or SD-1
    ts_lh_32k: SurfaceFunctionalTimeSeries
    ts_rh_32k: SurfaceFunctionalTimeSeries
    medial_wall_vertices_count: int
    valid_cortical_vertices_count: int
    mean_tsnr_surface: float
    output_files: List[str] = field(default_factory=list)

