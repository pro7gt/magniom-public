"""
Tedana Multi-Echo ICA Data Models
Conforms to MAGNIOM-Neuroimaging & Functional Connectomics Pipeline Specification v1.0 Sections 49-53
"""

from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any


@dataclass
class ICAComponentMetrics:
    """Quantitative metrics and classification for a single ME-ICA component."""
    component_id: int
    kappa: float
    rho: float
    variance_explained_fraction: float
    classification: str  # "accepted", "rejected", "ignorable"
    classification_reason: str


@dataclass
class T2StarMapMetrics:
    """Summary of fitted T2* / S0 voxel maps."""
    t2star_mean_ms: float
    t2star_median_ms: float
    t2star_std_ms: float
    s0_mean: float
    adaptive_mask_voxels: int
    total_brain_voxels: int
    coverage_fraction: float


@dataclass
class TedanaOutputs:
    """Outputs produced by Stage 04: Tedana ME-ICA optimal combination and decomposition."""
    run_index: int
    subject_id: str
    optimally_combined_bold_path: str
    optimally_combined_bold_sha256: str
    meica_denoised_bold_path: str
    meica_denoised_bold_sha256: str
    t2star_map_path: str
    t2star_map_sha256: str
    adaptive_mask_path: str
    adaptive_mask_sha256: str
    components: List[ICAComponentMetrics]
    t2star_metrics: T2StarMapMetrics
    total_components: int
    accepted_components: int
    rejected_components: int
    accepted_variance_fraction: float
    is_automated_classification: bool = True
    manual_override_reviewer: Optional[str] = None
