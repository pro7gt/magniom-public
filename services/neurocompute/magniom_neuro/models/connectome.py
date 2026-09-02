"""
Connectome and Functional Parcellation Data Models
Conforms to MAGNIOM-Neuroimaging & Functional Connectomics Pipeline Specification v1.0 Sections 72-84
"""

from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any, Tuple


@dataclass
class HcpMmpParcel:
    """Represents a single cortical area in the HCP-MMP1.0 reference parcellation."""
    parcel_index: int  # 1-360 (1-180 Left, 181-360 Right)
    parcel_name: str  # e.g. p9-46v_L, a24pr_L, 8Av_L, SFL_L
    hemisphere: str  # L, R
    cortex_area: str  # e.g. DLPFC, Cingulate, Frontal, Sensorimotor, Visual
    vertex_count: int
    vertex_indices: List[int]
    centroid_mni: Tuple[float, float, float]
    centroid_fsLR32k_index: int


@dataclass
class SubcorticalROI:
    """Represents a subcortical region of interest (SubcorticalAtlasVersion)."""
    roi_index: int  # 1-14 (bilateral Thalamus, Caudate, Putamen, Pallidum, Accumbens, Hippocampus, Amygdala)
    roi_name: str  # e.g. Thalamus_L, Caudate_R
    hemisphere: str  # L, R
    voxel_count: int
    centroid_mni: Tuple[float, float, float]


@dataclass
class ParcelCoverageQC:
    """Coverage quality evaluation for a cortical parcel or subcortical ROI."""
    parcel_index: int
    parcel_name: str
    total_vertices_or_voxels: int
    valid_vertices_or_voxels: int
    coverage_fraction: float  # [0.0, 1.0]
    mean_tsnr: float
    temporal_variance: float
    coverage_status: str  # "VALID", "CONDITIONAL", "INVALID"
    is_usable_for_targeting: bool


@dataclass
class ParcelTimeSeriesResult:
    """Extracted time series across all cortical and subcortical parcels."""
    subject_id: str
    run_index: int
    atlas_name: str  # HCP-MMP1.0
    projection_method: str  # MagniomAtlasProjection v1
    num_timepoints: int
    retained_timepoints: int
    parcel_names: List[str]
    time_series_matrix: List[List[float]]  # Shape: [num_parcels, num_timepoints]
    parcel_coverage: List[ParcelCoverageQC]
    artifact_path: Optional[str] = None
    artifact_sha256: Optional[str] = None


@dataclass
class RunFunctionalConnectivity:
    """Pairwise functional connectivity matrix for a single resting-state run."""
    subject_id: str
    run_index: int
    denoising_configuration: str  # CD-1 or SD-1
    atlas_name: str  # HCP-MMP1.0
    metric: str  # Pearson correlation
    transform: str  # Fisher z
    retained_timepoints: int
    retained_minutes: float
    num_parcels: int
    parcel_names: List[str]
    correlation_matrix: List[List[float]]  # Shape: [num_parcels, num_parcels], r in [-1, 1]
    fisher_z_matrix: List[List[float]]  # Shape: [num_parcels, num_parcels], z in R
    artifact_tsv_path: Optional[str] = None
    artifact_tsv_sha256: Optional[str] = None
    sidecar_json_path: Optional[str] = None


@dataclass
class CombinedFunctionalConnectivity:
    """Combined functional connectivity matrix weighted across multiple runs."""
    subject_id: str
    denoising_configuration: str  # CD-1 or SD-1
    atlas_name: str  # HCP-MMP1.0
    total_retained_timepoints: int
    total_retained_minutes: float
    run_indices: List[int]
    run_weights: List[float]  # Sum to 1.0, weighted by retained time
    num_parcels: int
    parcel_names: List[str]
    combined_fisher_z_matrix: List[List[float]]
    combined_correlation_matrix: List[List[float]]
    cross_run_similarity_matrix: Optional[List[List[float]]] = None  # Inter-run FC matrix correlation
    artifact_tsv_path: Optional[str] = None
    artifact_tsv_sha256: Optional[str] = None
