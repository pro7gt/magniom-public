"""
Manifest and Provenance Models
"""

from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any
from .qc import QCWarning


@dataclass
class ManifestFileEntry:
    """Entry describing a registered file artifact with checksum."""
    path: str
    sha256: str
    size_bytes: int = 0
    artifact_type: Optional[str] = None
    mime_type: Optional[str] = None


@dataclass
class SoftwareManifest:
    """Execution environment software descriptor."""
    name: str
    version: str
    digest: Optional[str] = None
    dependencies: Dict[str, str] = field(default_factory=dict)


@dataclass
class TransformManifestEntry:
    """Descriptor for coordinate and surface transformations."""
    source_space: str
    target_space: str
    transform_type: str  # AFFINE, NONLINEAR_WARP, SPHERICAL_REGISTRATION, IDENTITY
    transform_file_sha256: str
    forward_transform_artifact_id: Optional[str] = None
    inverse_transform_artifact_id: Optional[str] = None


@dataclass
class StageManifest:
    """Stage-specific execution manifest."""
    stage_number: str  # 01, 02, etc.
    stage_name: str  # BIDS_CONVERT, STRUCTURAL_PREPROCESS, SURFACE_RECONSTRUCT
    status: str  # passed, conditional, failed
    started_at: str
    completed_at: str
    duration_seconds: float
    input_hashes: List[str] = field(default_factory=list)
    output_hashes: List[str] = field(default_factory=list)
    warnings: List[QCWarning] = field(default_factory=list)
    execution_metrics: Dict[str, Any] = field(default_factory=dict)


@dataclass
class PipelineManifest:
    """Canonical pipeline-manifest.json representation."""
    schema_version: str = "1.0"
    run_id: str = ""
    case_id: str = ""
    organisation_id: str = ""
    mode: str = "RESEARCH"
    pipeline_hash: str = ""
    software: List[SoftwareManifest] = field(default_factory=list)
    input_files: List[ManifestFileEntry] = field(default_factory=list)
    output_files: List[ManifestFileEntry] = field(default_factory=list)
    transform_graph: List[TransformManifestEntry] = field(default_factory=list)
    stages: List[StageManifest] = field(default_factory=list)
    overall_qc_status: str = "pass"
    warnings: List[QCWarning] = field(default_factory=list)
    started_at: str = ""
    completed_at: str = ""
