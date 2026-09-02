"""
Target Reliability Models and Data Structures
Conforms to MAGNIOM-Canonical Target Data Specification v1.0 Sections 35-38, 83
and MAGNIOM-Neuroimaging & Functional Connectomics Pipeline Specification v1.0 Sections 106-117, 148
and MAGNIOM-Supabase Database & Security Specification v1.0 Section 48
"""

from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any, Tuple
from ..models.circuits import SpatialCoordinate, SurfaceVertexRef, CorticalCandidateCluster


@dataclass
class ReliabilityMeasure:
    """Quantitative measurement of a specific reliability dimension."""
    metric_name: str
    value: Optional[float]
    unit: str
    interpretation: str  # high, moderate, low, not_assessable
    method: str


@dataclass
class SpatialRegion:
    """Cortical spatial confidence region."""
    space: str  # fsLR_32k, MNI152NLin2009cAsym
    hemisphere: str  # L, R
    surface_vertex_indices: List[int]
    surface_area_mm2: float
    centroid_mni: Tuple[float, float, float]
    bounding_box_mni: Tuple[Tuple[float, float, float], Tuple[float, float, float]]  # ((min_x, min_y, min_z), (max_x, max_y, max_z))
    max_radius_mm: float


@dataclass
class SplitHalfResult:
    """Result of split-half stability analysis."""
    distance_mm: float
    geodesic_distance_mm: Optional[float]
    map_similarity: float  # Pearson r of concordance map across search space
    spearman_similarity: float
    cluster_dice: float
    cluster_jaccard: float
    cluster_area_delta_mm2: float
    half_a_peak_mni: SpatialCoordinate
    half_a_medoid_mni: SpatialCoordinate
    half_b_peak_mni: SpatialCoordinate
    half_b_medoid_mni: SpatialCoordinate
    partition_strategy: str
    half_a_retained_minutes: float
    half_b_retained_minutes: float


@dataclass
class CrossRunResult:
    """Result of cross-run reproducibility analysis."""
    assessed: bool
    distance_mm: Optional[float]
    geodesic_distance_mm: Optional[float]
    map_similarity: Optional[float]
    spearman_similarity: Optional[float]
    cluster_dice: Optional[float]
    cluster_jaccard: Optional[float]
    runs_evaluated: List[int]
    run_1_peak_mni: Optional[SpatialCoordinate] = None
    run_1_medoid_mni: Optional[SpatialCoordinate] = None
    run_2_peak_mni: Optional[SpatialCoordinate] = None
    run_2_medoid_mni: Optional[SpatialCoordinate] = None
    limiting_factor: Optional[str] = None


@dataclass
class PipelineSensitivityResult:
    """Result of CD-1 vs SD-1 denoising sensitivity analysis."""
    assessed: bool
    sensitivity_distance_mm: Optional[float]
    map_similarity: Optional[float]
    cluster_dice: Optional[float]
    cd1_medoid_mni: Optional[SpatialCoordinate] = None
    sd1_medoid_mni: Optional[SpatialCoordinate] = None
    dispersion_interpretation: str = "nominal"


@dataclass
class TargetReliabilityProfile:
    """Canonical patient-specific target reliability profile."""
    id: str  # e.g. REL-TF-MDD-CONVERGENT-001-SUB001
    version: str  # 1.0.0
    case_id: str
    imaging_study_id: str
    connectome_run_id: str
    target_candidate_id: str
    target_family_version_id: str

    qc_status: str  # pass, conditional, fail
    usable_resting_state_minutes: float
    mean_framewise_displacement_mm: float
    censored_volume_fraction: float

    registration_quality: str  # high, moderate, low, fail
    segmentation_quality: str  # high, moderate, low, fail
    parcel_coverage_quality: str  # high, moderate, low, fail

    cross_run_spatial_distance_mm: Optional[float]
    split_half_spatial_distance_mm: Optional[float]
    composite_spatial_distance_mm: float

    connectivity_reliability_metric: float  # Map similarity (Pearson r)
    connectivity_reliability_method: str  # Pearson correlation across search space vertices

    spatial_reliability_score: float  # [0.0, 1.0] from f_spatial(D)
    connectivity_reliability_score: float  # [0.0, 1.0] from R_map & cluster Dice
    qc_reliability_score: float  # [0.0, 1.0]
    overall_reliability_score: float  # min(R_Q, R_S, R_C)

    reliability_class: str  # high, moderate, low, unreliable
    is_reliable_for_personalisation: bool  # overall_reliability_score >= threshold

    atlas_concordance: Optional[ReliabilityMeasure] = None
    pipeline_sensitivity: Optional[ReliabilityMeasure] = None
    target_confidence_region: Optional[SpatialRegion] = None

    split_half_result: Optional[SplitHalfResult] = None
    cross_run_result: Optional[CrossRunResult] = None
    sensitivity_result: Optional[PipelineSensitivityResult] = None

    limiting_factors: List[str] = field(default_factory=list)
    interpretation: str = ""

    pipeline_version: str = "MAGNIOM-CONNECTOME-1.0.0"
    atlas_versions: List[str] = field(default_factory=lambda: ["HCP-MMP1.0"])
    normative_model_version: Optional[str] = None
    created_at: Optional[str] = None
