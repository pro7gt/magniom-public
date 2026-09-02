"""
Therapeutic Circuit Models and Target Concordance Data Structures
Conforms to MAGNIOM-Evidence Knowledge Graph & Therapeutic Circuit Library v1.0 Sections 28-64
and MAGNIOM-Canonical Target Data Specification v1.0 Sections 18-23, 88-92
"""

from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any, Tuple


@dataclass
class SgaccSeedDefinition:
    """Canonical representation of an sgACC seed region."""
    seed_id: str  # e.g. SEED-SGACC-001
    name: str  # Fox 2012 / Weigand 2018 sgACC Seed
    source_citation: str
    coordinate_space: str  # MNI152NLin2009cAsym
    center_coordinates: List[Tuple[float, float, float]]  # e.g. [(-6, 16, -10), (6, 16, -10)]
    radius_mm: float  # e.g. 5.0
    definition_type: str  # SPHERICAL_ROI, BA25_MASK
    artifact_sha256: str


@dataclass
class SpatialCoordinate:
    """3D Cartesian coordinate in defined space."""
    space: str  # MNI152NLin2009cAsym, NATIVE_T1W
    x: float
    y: float
    z: float
    unit: str = "mm"


@dataclass
class SurfaceVertexRef:
    """Reference to a cortical surface vertex."""
    space: str  # fsLR_32k
    hemisphere: str  # L, R
    vertex_index: int
    parcel_name: str


@dataclass
class CorticalCandidateCluster:
    """Spatially contiguous cortical cluster meeting size criteria."""
    cluster_id: str
    hemisphere: str
    vertex_indices: List[int]
    surface_area_mm2: float
    peak_vertex_index: int
    medoid_vertex_index: int
    peak_concordance: float
    mean_concordance: float
    peak_mni_coordinate: Tuple[float, float, float]
    medoid_mni_coordinate: Tuple[float, float, float]


@dataclass
class SgaccConnectivityResult:
    """Patient-specific sgACC connectivity map and candidate cluster."""
    seed_id: str  # SEED-SGACC-001
    target_family_id: str  # TF-MDD-SGACC-LDLPFC-001
    subject_id: str
    search_space_name: str  # Left-DLPFC approved search space
    search_space_vertices: List[int]
    anticorrelation_map: List[float]  # Negative Pearson r / inverted z values
    peak_vertex: SurfaceVertexRef
    peak_mni: SpatialCoordinate
    medoid_vertex: SurfaceVertexRef
    medoid_mni: SpatialCoordinate
    cluster_area_mm2: float
    concordance_score: float  # [0.0, 1.0] percentile within search space
    baseline_concordance: float
    is_qualified: bool
    clusters: List[CorticalCandidateCluster]
    artifact_path: Optional[str] = None
    artifact_sha256: Optional[str] = None


@dataclass
class ConvergentCircuitResult:
    """Patient-specific convergent depression circuit concordance and candidate."""
    circuit_id: str  # TC-MDD-CONVERGENT-001
    target_family_id: str  # TF-MDD-CONVERGENT-LDLPFC-001
    circuit_map_id: str  # CIRCUITMAP-MDD-CONVERGENT-001
    subject_id: str
    circuit_time_series: List[float]  # Weighted patient circuit time course
    concordance_surface_map: List[float]  # Vertex-wise correlation with circuit time series
    search_space_name: str
    search_space_vertices: List[int]
    peak_vertex: SurfaceVertexRef
    peak_mni: SpatialCoordinate
    medoid_vertex: SurfaceVertexRef
    medoid_mni: SpatialCoordinate
    cluster_area_mm2: float
    raw_concordance: float
    percentile_concordance: float  # [0.0, 1.0] within search space
    baseline_concordance: float
    incremental_gain: float
    is_qualified: bool
    clusters: List[CorticalCandidateCluster]
    artifact_path: Optional[str] = None
    artifact_sha256: Optional[str] = None


@dataclass
class SymptomCircuitResult:
    """Patient-specific symptom-to-circuit match and candidate."""
    circuit_id: str  # TC-MDD-DYSPHORIC-001 or TC-MDD-ANXIOSOMATIC-001
    target_family_id: str  # TF-MDD-DYSPHORIC-001 or TF-MDD-ANXIOSOMATIC-DMPFC-001
    symptom_domain_code: str  # DOMAIN-MDD-DYSPHORIC-001 or DOMAIN-MDD-ANXIOSOMATIC-001
    canonical_group_mni: SpatialCoordinate
    concordance_score: float
    circuit_engagement_score: float
    is_qualified: bool
    rationale: str
    candidate_vertex: Optional[SurfaceVertexRef] = None
    candidate_mni: Optional[SpatialCoordinate] = None


@dataclass
class ImagingCandidateRegion:
    """Connectome-derived candidate measurement for Target Engine ingestion."""
    target_family_version_id: str
    candidate_code: str
    generation_method: str  # CONNECTOME_REFINED, EVIDENCE_ONLY_PRIOR, SYMPTOM_CIRCUIT
    hemisphere: str
    surface_vertex_index: int
    parcel_name: str
    subject_t1_coordinate: SpatialCoordinate
    mni_coordinate: SpatialCoordinate
    raw_peak_coordinate: Optional[SpatialCoordinate]
    cluster_area_mm2: float
    circuit_concordance_raw: float
    circuit_concordance_percentile: float
    baseline_circuit_concordance: float
    accessibility: str  # good, acceptable, difficult, inaccessible
    reliability_score: float
    fit_interpretation: str


@dataclass
class CircuitMetric:
    """Relational measurement record for connectomics.circuit_metrics."""
    circuit_version_id: str
    metric_code: str  # e.g. CONCORDANCE_PERCENTILE, PEAK_CORRELATION, CLUSTER_AREA
    metric_value: float
    interpretation: str
    candidate_region_code: Optional[str] = None


@dataclass
class ConnectomePipelineOutput:
    """Full Stage 06-11 output package consumable by Target Engine & database."""
    connectome_run_id: str
    pipeline_version: str
    atlas_name: str
    qc_status: str  # pass, conditional, fail
    retained_minutes: float
    surface_manifest_path: str
    surface_manifest_sha256: str
    connectome_manifest_path: str
    connectome_manifest_sha256: str
    circuits_manifest_path: str
    circuits_manifest_sha256: str
    candidates: List[ImagingCandidateRegion]
    circuit_metrics: List[CircuitMetric]
    sgacc_result: SgaccConnectivityResult
    convergent_result: ConvergentCircuitResult
    symptom_results: List[SymptomCircuitResult]
    combined_fc_cd1: Any  # CombinedFunctionalConnectivity
    combined_fc_sd1: Optional[Any] = None
    reliability_profiles: List[Any] = field(default_factory=list)  # TargetReliabilityProfile
    reliability_manifest_path: Optional[str] = None
    reliability_manifest_sha256: Optional[str] = None

