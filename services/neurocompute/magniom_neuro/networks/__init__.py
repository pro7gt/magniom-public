"""
MAGNIOM Triple-Network Analysis Subsystem
"""

from .definitions import (
    CANONICAL_CEN_PARCELS,
    CANONICAL_DMN_PARCELS,
    CANONICAL_SN_PARCELS,
    CANONICAL_NETWORK_PARCEL_MAP,
)
from .metrics import (
    fisher_z,
    inv_fisher_z,
    compute_within_network_fc,
    compute_between_network_fc,
    compute_network_segregation,
)
from .triple_network_engine import TripleNetworkEngine

__all__ = [
    "CANONICAL_CEN_PARCELS",
    "CANONICAL_DMN_PARCELS",
    "CANONICAL_SN_PARCELS",
    "CANONICAL_NETWORK_PARCEL_MAP",
    "fisher_z",
    "inv_fisher_z",
    "compute_within_network_fc",
    "compute_between_network_fc",
    "compute_network_segregation",
    "TripleNetworkEngine",
]
