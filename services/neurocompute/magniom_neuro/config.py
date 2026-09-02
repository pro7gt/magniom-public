"""
Magniom NeuroCompute Configuration
Defines pipeline constants, pinned software versions, parameter bounds, and storage configurations.
"""

import os
from dataclasses import dataclass, field
from typing import Dict, List, Optional


@dataclass(frozen=True)
class PipelineConfig:
    """Canonical frozen configuration for Sprint 8 NeuroCompute service."""
    
    # Software versions
    pipeline_version: str = "1.0.0"
    pipeline_type: str = "neurocompute"
    bids_version: str = "1.11.1"
    dcm2niix_version: str = "v1.0.20240202"
    bids_validator_version: str = "1.11.1"
    
    # Reference Space & Atlas Defaults
    standard_volumetric_space: str = "MNI152NLin2009cAsym"
    standard_surface_space: str = "fsLR_32k"
    default_atlas_code: str = "HCP-MMP1.0"
    default_atlas_version: str = "1.0"
    
    # Structural QC Thresholds (Scientific Policy MDD 1.0)
    snr_t1w_min_pass: float = 15.0
    snr_t1w_min_conditional: float = 10.0
    cnr_t1w_min_pass: float = 3.5
    cnr_t1w_min_conditional: float = 2.5
    euler_holes_max_pass: int = 20
    euler_holes_max_conditional: int = 40
    cortical_thickness_min_bound_mm: float = 1.0
    cortical_thickness_max_bound_mm: float = 5.0
    cortical_thickness_mean_lower_mm: float = 2.0
    cortical_thickness_mean_upper_mm: float = 3.0
    mni_dice_min_pass: float = 0.88
    mni_dice_min_conditional: float = 0.80
    
    # Storage & Queue Configs
    default_ingest_bucket: str = "clinical-ingest"
    default_derived_bucket: str = "clinical-derived"
    default_research_bucket: str = "research-derived"
    ingest_queue: str = "imaging_ingest"
    neurocompute_queue: str = "neurocompute"


# Singleton instance
DEFAULT_CONFIG = PipelineConfig()
