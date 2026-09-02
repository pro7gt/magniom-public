"""
Denoising, Motion Censoring, and Retained Time Data Models
Conforms to MAGNIOM-Neuroimaging & Functional Connectomics Pipeline Specification v1.0 Sections 54-68
"""

from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any


@dataclass
class RetainedTimeSummary:
    """Full accounting of acquired, censored, and retained resting-state time."""
    acquired_seconds: float
    acquired_minutes: float
    non_steady_state_removed_seconds: float
    non_steady_state_removed_minutes: float
    motion_censored_seconds: float
    motion_censored_minutes: float
    final_retained_seconds: float
    final_retained_minutes: float
    percentage_retained: float
    total_volumes: int
    non_steady_state_volumes: int
    censored_volumes: int
    retained_volumes: int
    short_segments_pruned_volumes: int
    is_above_absolute_minimum: bool  # >= 12.0 min
    is_above_recommended_clinical: bool  # >= 20.0 min


@dataclass
class MotionCensoringResult:
    """Detailed volume-by-volume motion censoring breakdown."""
    fd_threshold_mm: float
    framewise_displacement_mm: List[float]
    dvars_values: List[float]
    censor_mask: List[bool]  # True = retained/clean, False = censored/scrubbed
    contiguous_segment_lengths: List[int]
    retained_time: RetainedTimeSummary


@dataclass
class DenoisedTimeSeriesOutput:
    """Result of clinical (CD-1) or sensitivity (SD-1) nuisance regression and bandpass filtering."""
    denoising_configuration: str  # "CD-1" or "SD-1"
    run_index: int
    subject_id: str
    denoised_bold_path: str
    denoised_bold_sha256: str
    nuisance_matrix_path: str
    nuisance_matrix_sha256: str
    bandpass_low_hz: float  # 0.009
    bandpass_high_hz: float  # 0.080
    includes_gsr: bool
    num_regressors: int
    motion_regressor_expansion: str  # "24-parameter Volterra"
    tissue_regressors: List[str]  # ["WM_mean", "WM_deriv", "CSF_mean", "CSF_deriv"]
    variance_explained_by_nuisance: float
    tsnr_pre_denoise: float
    tsnr_post_denoise: float
    retained_time: RetainedTimeSummary
    censor_mask: List[bool]
