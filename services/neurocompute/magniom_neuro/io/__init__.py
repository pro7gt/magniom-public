"""
Magniom NeuroCompute IO & Artifact Validation Substrate
Conforms to MAGNIOM-Neuroimaging & Multimodal Measurement Specification v2.0
"""

from .artifact_validator import ArtifactValidator, ValidationResult
from .manifests import MeasurementArtifactManifest, ArtifactManifestBuilder

__all__ = [
    "ArtifactValidator",
    "ValidationResult",
    "MeasurementArtifactManifest",
    "ArtifactManifestBuilder",
]
