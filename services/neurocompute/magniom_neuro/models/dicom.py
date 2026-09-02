"""
DICOM Metadata Models (Zero-PHI)
"""

from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any


@dataclass
class DicomSeriesMetadata:
    """Anonymized DICOM series metadata."""
    series_instance_uid: str
    series_type: str  # T1w, rest_bold, fieldmap, dwi, other
    series_description: str
    series_number: int
    modality: str  # MR
    scanner_field_strength_t: float
    dimensions: List[int]  # [x, y, z] or [x, y, z, t]
    voxel_spacing_mm: List[float]  # [dx, dy, dz]
    repetition_time_ms: Optional[float] = None
    echo_times_ms: List[float] = field(default_factory=list)
    flip_angle_deg: Optional[float] = None
    phase_encoding_direction: Optional[str] = None  # i, j, k, i-, j-, k-
    manufacturer: Optional[str] = None
    manufacturers_model_name: Optional[str] = None
    image_count: int = 0
    raw_files: List[str] = field(default_factory=list)


@dataclass
class DicomStudyMetadata:
    """Anonymized DICOM study metadata."""
    study_instance_uid: str
    pseudonymous_subject_id: str  # e.g. sub-MGN7F3A92
    scanner_field_strength_t: float
    study_date: Optional[str] = None
    manufacturer: Optional[str] = None
    manufacturers_model_name: Optional[str] = None
    series: List[DicomSeriesMetadata] = field(default_factory=list)
    raw_archive_sha256: Optional[str] = None
