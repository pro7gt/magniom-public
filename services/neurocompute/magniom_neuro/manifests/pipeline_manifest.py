"""
Pipeline Manifest Builder
Generates canonical immutable pipeline-manifest.json
Conforms to MAGNIOM-Neuroimaging & Functional Connectomics Pipeline Specification v1.0 Section 149
"""

import json
import os
from typing import Dict, List, Any
from ..models.manifest import (
    PipelineManifest,
    SoftwareManifest,
    ManifestFileEntry,
    TransformManifestEntry,
    StageManifest,
)
from ..models.qc import QCWarning
from .hasher import Hasher
from .pipeline_hash import PipelineHashCalculator


class PipelineManifestBuilder:
    """Builds and writes canonical pipeline-manifest.json for a complete processing run."""

    @classmethod
    def build_and_save(
        cls,
        run_id: str,
        case_id: str,
        organisation_id: str,
        mode: str,
        software_manifest: List[SoftwareManifest],
        input_files: List[ManifestFileEntry],
        output_files: List[ManifestFileEntry],
        transform_graph: List[TransformManifestEntry],
        stages: List[StageManifest],
        overall_qc_status: str,
        warnings: List[QCWarning],
        started_at: str,
        completed_at: str,
        output_directory: str,
    ) -> PipelineManifest:
        """Constructs and writes pipeline-manifest.json."""
        manifest_dict: Dict[str, Any] = {
            "schema_version": "1.0",
            "run_id": run_id,
            "case_id": case_id,
            "organisation_id": organisation_id,
            "mode": mode,
            "software": [s.__dict__ for s in software_manifest],
            "input_files": [f.__dict__ for f in input_files],
            "output_files": [f.__dict__ for f in output_files],
            "transform_graph": [t.__dict__ for t in transform_graph],
            "stages": [
                {
                    **s.__dict__,
                    "warnings": [w.__dict__ if hasattr(w, "__dict__") else w for w in s.warnings],
                }
                for s in stages
            ],
            "overall_qc_status": overall_qc_status,
            "warnings": [w.__dict__ if hasattr(w, "__dict__") else w for w in warnings],
            "started_at": started_at,
            "completed_at": completed_at,
        }

        # Calculate canonical pipeline hash
        pipeline_hash = PipelineHashCalculator.calculate_pipeline_hash(
            input_manifest={"input_files": [f.__dict__ for f in input_files]},
            software_manifest=[s.__dict__ for s in software_manifest],
            scientific_config={"mode": mode, "stages_count": len(stages)},
        )
        manifest_dict["pipeline_hash"] = pipeline_hash

        manifest_path = os.path.join(output_directory, "pipeline-manifest.json")
        os.makedirs(os.path.dirname(manifest_path), exist_ok=True)
        with open(manifest_path, "w", encoding="utf-8") as f:
            json.dump(manifest_dict, f, indent=2)

        return PipelineManifest(
            schema_version="1.0",
            run_id=run_id,
            case_id=case_id,
            organisation_id=organisation_id,
            mode=mode,
            pipeline_hash=pipeline_hash,
            software=software_manifest,
            input_files=input_files,
            output_files=output_files,
            transform_graph=transform_graph,
            stages=stages,
            overall_qc_status=overall_qc_status,
            warnings=warnings,
            started_at=started_at,
            completed_at=completed_at,
        )
