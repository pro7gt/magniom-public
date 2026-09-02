"""
Pipeline Hash Calculator
Computes H_pipeline = SHA256(InputManifest + SoftwareManifest + ScientificConfiguration)
Conforms to MAGNIOM-Neuroimaging & Functional Connectomics Pipeline Specification v1.0 Section 155.
"""

from typing import Dict, List, Any
from .hasher import Hasher


class PipelineHashCalculator:
    """Calculates deterministic aggregate pipeline execution hash."""

    @classmethod
    def calculate_pipeline_hash(
        cls,
        input_manifest: Dict[str, Any],
        software_manifest: List[Dict[str, Any]],
        scientific_config: Dict[str, Any],
    ) -> str:
        """
        Calculates canonical composite pipeline hash:
        H_pipeline = SHA256(InputManifest + SoftwareManifest + ScientificConfiguration)
        """
        input_hash = Hasher.sha256_json(input_manifest)
        software_hash = Hasher.sha256_json(software_manifest)
        config_hash = Hasher.sha256_json(scientific_config)

        composite_payload = {
            "input_manifest_hash": input_hash,
            "software_manifest_hash": software_hash,
            "scientific_config_hash": config_hash,
        }

        return Hasher.sha256_json(composite_payload)
