"""
Structural Quality Control (QC) Models
"""

from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any


@dataclass
class QCWarning:
    """Warning produced by an automated pipeline check."""
    code: str
    message: str
    severity: str  # info, warning, critical
    clinical_impact: str  # none, possible, target_family_specific, personalisation_invalid
    affected_components: List[str] = field(default_factory=list)


@dataclass
class StructuralQCMetrics:
    """Quantitative anatomical metrics."""
    snr_t1w: float
    cnr_t1w: float
    euler_holes_lh: int
    euler_holes_rh: int
    total_euler_number: int
    surface_self_intersections_lh: int
    surface_self_intersections_rh: int
    cortical_thickness_mean_mm: float
    cortical_thickness_std_mm: float
    cortical_thickness_min_mm: float
    cortical_thickness_max_mm: float
    cortical_thickness_outlier_fraction: float
    brain_mask_volume_mm3: float
    csf_fraction: float
    gm_fraction: float
    wm_fraction: float
    mni_registration_overlap_dice: float
    mni_mutual_information: float


@dataclass
class QCEvaluationResult:
    """Automated evaluation of structural QC Gate."""
    overall_status: str  # pass, conditional, fail
    metrics: StructuralQCMetrics
    warnings: List[QCWarning] = field(default_factory=list)
    is_personalisation_qualified: bool = False
    limitation_summary: Optional[str] = None
