"""
Quality Control (QC) Package
Computes quantitative anatomical metrics and evaluates the QC Gate.
Conforms to MAGNIOM-Neuroimaging & Functional Connectomics Pipeline Specification v1.0 Section 34, 38 & 151.
"""

from .structural_metrics import StructuralQCMetricsCalculator
from .evaluator import StructuralQCGateEvaluator
from .functional_metrics import FunctionalQCMetricsCalculator
from .functional_evaluator import FunctionalQCGateEvaluator

__all__ = [
    "StructuralQCMetricsCalculator",
    "StructuralQCGateEvaluator",
    "FunctionalQCMetricsCalculator",
    "FunctionalQCGateEvaluator",
]
