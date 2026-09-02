"""
Magniom Target Reliability Module
Conforms to MAGNIOM-Neuroimaging & Functional Connectomics Pipeline Specification v1.0 Section 106-117
and MAGNIOM-Implementation & Validation Roadmap v1.0 Section 115
"""

from .models import (
    ReliabilityMeasure,
    SpatialRegion,
    SplitHalfResult,
    CrossRunResult,
    PipelineSensitivityResult,
    TargetReliabilityProfile,
)
from .metrics import (
    calculate_euclidean_distance,
    calculate_surface_geodesic_distance,
    calculate_pearson_correlation,
    calculate_spearman_correlation,
    calculate_cluster_dice,
    calculate_cluster_jaccard,
    calculate_cluster_area_delta,
    calculate_intraclass_correlation,
    spatial_decay_function,
)
from .split_half import SplitHalfPartitionEngine
from .cross_run import CrossRunReliabilityEngine
from .sensitivity import PipelineSensitivityEngine
from .confidence_region import ConfidenceRegionEngine
from .aggregator import TargetReliabilityAggregator
from .engine import TargetReliabilityEngine

__all__ = [
    "ReliabilityMeasure",
    "SpatialRegion",
    "SplitHalfResult",
    "CrossRunResult",
    "PipelineSensitivityResult",
    "TargetReliabilityProfile",
    "calculate_euclidean_distance",
    "calculate_surface_geodesic_distance",
    "calculate_pearson_correlation",
    "calculate_spearman_correlation",
    "calculate_cluster_dice",
    "calculate_cluster_jaccard",
    "calculate_cluster_area_delta",
    "calculate_intraclass_correlation",
    "spatial_decay_function",
    "SplitHalfPartitionEngine",
    "CrossRunReliabilityEngine",
    "PipelineSensitivityEngine",
    "ConfidenceRegionEngine",
    "TargetReliabilityAggregator",
    "TargetReliabilityEngine",
]
