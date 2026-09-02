"""
Structural Preprocessing Package
Implements N4 Bias Correction, Brain Extraction, Tissue Segmentation, and MNI Normalization.
Conforms to MAGNIOM-Neuroimaging & Functional Connectomics Pipeline Specification v1.0 Section 36 & 40.
"""

from .preprocessor import StructuralPreprocessor
from .segmentation import TissueSegmentationEngine
from .registration import SpatialRegistrationEngine

__all__ = ["StructuralPreprocessor", "TissueSegmentationEngine", "SpatialRegistrationEngine"]
