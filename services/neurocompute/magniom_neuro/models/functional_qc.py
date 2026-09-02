"""
Functional Quality Control (Q2) Data Models
Conforms to MAGNIOM-Neuroimaging & Functional Connectomics Pipeline Specification v1.0 Sections 67, 118, 121
"""

from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any
from .qc import QCWarning


@dataclass
class FunctionalQCMetrics:
    """Quantitative Q2 metrics for BOLD and denoising quality."""
    run_index: int
    mean_fd_mm: float
    max_fd_mm: float
    censored_volumes_fraction: float
    retained_minutes: float
    tsnr_pre_denoise: float
    tsnr_post_denoise: float
    tsnr_gain_ratio: float
    mean_dvars: float
    tedana_components_total: int
    tedana_components_accepted: int
    tedana_components_rejected: int
    tedana_accepted_variance_fraction: float
    t1w_bold_coregistration_dice: float
    ghosting_ratio: float
    signal_dropout_fraction_dlpfc: float
    signal_dropout_fraction_sgacc: float


@dataclass
class FunctionalQCEvaluationResult:
    """Automated evaluation of the Q2 Functional QC Gate."""
    overall_status: str  # "pass", "conditional", "fail"
    run_index: int
    metrics: FunctionalQCMetrics
    warnings: List[QCWarning] = field(default_factory=list)
    is_personalisation_qualified: bool = False
    limitation_summary: Optional[str] = None
