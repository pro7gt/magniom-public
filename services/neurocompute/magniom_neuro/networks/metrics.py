"""
Triple-Network Metrics and Interactions Engine
Conforms to MAGNIOM-Triple-Network Systems Layer v1.0 (§13-15) and Neuroimaging Pipeline Specification v1.1 (§49-50)
"""

import math
from typing import Dict, List, Tuple, Optional
from .definitions import CANONICAL_NETWORK_PARCEL_MAP


def fisher_z(r: float) -> float:
    clamped = max(-0.999999, min(0.999999, r))
    return 0.5 * math.log((1.0 + clamped) / (1.0 - clamped))


def inv_fisher_z(z: float) -> float:
    return math.tanh(z)


def compute_within_network_fc(
    parcel_names: List[str],
    fc_matrix: List[List[float]],
    network_code: str,
) -> Tuple[float, float]:
    """
    Computes mean Fisher-z and variance within the specified network.
    """
    target_parcels = set(CANONICAL_NETWORK_PARCEL_MAP.get(network_code, []))
    indices = [i for i, name in enumerate(parcel_names) if name in target_parcels]

    if len(indices) < 2:
        return 0.0, 0.0

    z_values: List[float] = []
    for i_idx, i in enumerate(indices):
        for j in indices[i_idx + 1:]:
            r_val = fc_matrix[i][j]
            z_values.append(fisher_z(r_val))

    if not z_values:
        return 0.0, 0.0

    mean_z = sum(z_values) / len(z_values)
    var_z = sum((z - mean_z) ** 2 for z in z_values) / len(z_values)
    return round(mean_z, 6), round(var_z, 6)


def compute_between_network_fc(
    parcel_names: List[str],
    fc_matrix: List[List[float]],
    net_a: str,
    net_b: str,
) -> float:
    """
    Computes mean Fisher-z cross-correlation between two distinct networks.
    """
    parcels_a = set(CANONICAL_NETWORK_PARCEL_MAP.get(net_a, []))
    parcels_b = set(CANONICAL_NETWORK_PARCEL_MAP.get(net_b, []))

    indices_a = [i for i, name in enumerate(parcel_names) if name in parcels_a]
    indices_b = [i for i, name in enumerate(parcel_names) if name in parcels_b]

    if not indices_a or not indices_b:
        return 0.0

    z_values: List[float] = []
    for i in indices_a:
        for j in indices_b:
            r_val = fc_matrix[i][j]
            z_values.append(fisher_z(r_val))

    if not z_values:
        return 0.0

    mean_z = sum(z_values) / len(z_values)
    return round(mean_z, 6)


def compute_network_segregation(mean_within_z: float, mean_between_z: float) -> float:
    """
    Calculates network segregation index:
    S = (Z_within - Z_between) / Z_within
    """
    if mean_within_z == 0.0:
        return 0.0
    seg = (mean_within_z - mean_between_z) / mean_within_z
    return round(max(-1.0, min(1.0, seg)), 6)
