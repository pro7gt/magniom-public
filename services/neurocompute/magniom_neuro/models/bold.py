"""
BOLD Preprocessing Data Models
Conforms to MAGNIOM-Neuroimaging & Functional Connectomics Pipeline Specification v1.0 Sections 44-49
"""

from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any, Tuple


@dataclass
class EchoMetadata:
    """Metadata for a single BOLD echo."""
    echo_index: int
    echo_time_ms: float
    relative_path: str
    sha256: str
    size_bytes: int


@dataclass
class MultiEchoRunMetadata:
    """Metadata describing a multi-echo resting-state fMRI run."""
    run_index: int
    subject_id: str
    session_id: Optional[str]
    task_name: str
    tr_seconds: float
    flip_angle_deg: float
    echoes: List[EchoMetadata]
    num_volumes: int
    spatial_resolution_mm: Tuple[float, float, float]
    matrix_size: Tuple[int, int, int]
    field_strength_tesla: float = 3.0


@dataclass
class MotionParameters:
    """Rigid-body 6-parameter motion time series (in mm and degrees/radians)."""
    trans_x_mm: List[float]
    trans_y_mm: List[float]
    trans_z_mm: List[float]
    rot_x_deg: List[float]
    rot_y_deg: List[float]
    rot_z_deg: List[float]
    framewise_displacement_mm: List[float]
    mean_fd_mm: float
    max_fd_mm: float


@dataclass
class NonSteadyStateSummary:
    """Summary of identified and excised non-steady-state volumes."""
    num_non_steady_state_volumes: int
    non_steady_state_indices: List[int]
    detection_method: str  # "metadata", "intensity_outlier", "fmriprep_heuristic"


@dataclass
class BOLDPreprocessingOutputs:
    """Outputs produced by Stage 03: fMRIPrep minimal preprocessing."""
    run_index: int
    subject_id: str
    bold_reference_path: str
    bold_reference_sha256: str
    realigned_echo_paths: List[str]
    realigned_echo_hashes: List[str]
    motion_parameters: MotionParameters
    non_steady_state: NonSteadyStateSummary
    confounds_tsv_path: str
    confounds_tsv_sha256: str
    t1w_coregistration_dice: float
    t1w_coregistration_mutual_info: float
    output_directory: str
