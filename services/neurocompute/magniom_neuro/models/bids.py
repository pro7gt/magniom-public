"""
BIDS Dataset and File Models
Conforms to BIDS 1.11.1 Specification
"""

from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any


@dataclass
class BidsFile:
    """Represents a single BIDS NIfTI, JSON sidecar, or metadata file."""
    relative_path: str  # e.g. sub-MGN7F3A92/anat/sub-MGN7F3A92_T1w.nii.gz
    modality: str  # anat, func, fmap
    suffix: str  # T1w, bold, epi
    extension: str  # .nii.gz, .json, .tsv
    sha256: str
    size_bytes: int
    sidecar_json: Optional[Dict[str, Any]] = None


@dataclass
class BidsDatasetDescription:
    """BIDS dataset_description.json representation."""
    name: str = "Magniom clinical connectomics input"
    bids_version: str = "1.11.1"
    dataset_type: str = "raw"
    authors: List[str] = field(default_factory=lambda: ["Magniom Scientific Compute Plane"])
    acknowledgements: Optional[str] = None
    how_to_acknowledge: Optional[str] = None


@dataclass
class BidsDataset:
    """Complete BIDS dataset structure for a case."""
    dataset_root: str
    subject_id: str  # sub-MGN7F3A92
    description: BidsDatasetDescription
    files: List[BidsFile] = field(default_factory=list)
    is_valid: bool = False
    validation_errors: List[str] = field(default_factory=list)
    validation_warnings: List[str] = field(default_factory=list)
