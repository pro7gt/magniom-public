"""
Immutable Measurement and Processing Artifact Manifest Engine
Conforms to MAGNIOM-Neuroimaging & Multimodal Measurement Specification v2.0
and ISO 13485 / IEC 62304 Provenance Integrity.
"""

import json
import hashlib
from datetime import datetime, timezone
from dataclasses import dataclass, field, asdict
from typing import List, Dict, Any, Optional


@dataclass(frozen=True)
class SourceArtifactRecord:
    path: str
    sha256: str
    file_type: str
    size_bytes: int
    data_origin: str


@dataclass(frozen=True)
class PreprocessingProvenance:
    toolchain: Optional[str] = None
    pipeline_version: Optional[str] = None
    motion_scrubbing_fd_threshold_mm: Optional[float] = None
    mean_framewise_displacement_mm: Optional[float] = None
    censored_volumes_count: Optional[int] = None
    total_volumes_count: Optional[int] = None
    bandpass_low_hz: Optional[float] = None
    bandpass_high_hz: Optional[float] = None
    spatial_smoothing_fwhm_mm: Optional[float] = None
    global_signal_regression: Optional[bool] = None
    surface_registration_atlas: Optional[str] = None


@dataclass(frozen=True)
class MeasurementArtifactManifest:
    manifest_id: str
    case_id: str
    modality: str
    created_at: str
    data_origin: str  # 'patient_measured', 'synthetic', 'normative', 'derived_from_patient_measured'
    source_artifacts: List[SourceArtifactRecord]
    preprocessing: PreprocessingProvenance
    coordinate_space: str
    atlas: str
    manifest_sha256: str = ""

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class ArtifactManifestBuilder:
    """Builds and seals immutable measurement provenance manifests."""

    @classmethod
    def create_manifest(
        cls,
        manifest_id: str,
        case_id: str,
        modality: str,
        data_origin: str,
        source_artifacts: List[SourceArtifactRecord],
        preprocessing: Optional[PreprocessingProvenance] = None,
        coordinate_space: str = "MNI152NLin2009cAsym",
        atlas: str = "HCP-MMP1.0",
    ) -> MeasurementArtifactManifest:
        prep = preprocessing or PreprocessingProvenance()
        now_utc = datetime.now(timezone.utc).isoformat()

        # Build partial dict for canonical serialization
        partial = {
            "manifest_id": manifest_id,
            "case_id": case_id,
            "modality": modality,
            "created_at": now_utc,
            "data_origin": data_origin,
            "source_artifacts": [asdict(a) for a in source_artifacts],
            "preprocessing": asdict(prep),
            "coordinate_space": coordinate_space,
            "atlas": atlas,
        }

        canonical_json = json.dumps(partial, sort_keys=True, separators=(",", ":"))
        manifest_hash = hashlib.sha256(canonical_json.encode("utf-8")).hexdigest()

        return MeasurementArtifactManifest(
            manifest_id=manifest_id,
            case_id=case_id,
            modality=modality,
            created_at=now_utc,
            data_origin=data_origin,
            source_artifacts=source_artifacts,
            preprocessing=prep,
            coordinate_space=coordinate_space,
            atlas=atlas,
            manifest_sha256=manifest_hash,
        )
