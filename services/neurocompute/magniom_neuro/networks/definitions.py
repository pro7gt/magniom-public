"""
Canonical Triple-Network Parcel Definitions on HCP-MMP1.0
Conforms to MAGNIOM-Triple-Network Systems Layer v1.0 (§7-10)
"""

from typing import List, Dict

CANONICAL_CEN_PARCELS: List[str] = [
    "L_46", "L_9-46d", "L_8C", "L_a9-46v", "L_p9-46v", "L_8Av", "L_8Ad",
    "L_IP1", "L_IP2", "L_7Am", "L_AIP", "L_LIPd", "L_FEF", "L_TE1p",
    "R_46", "R_9-46d", "R_8C", "R_a9-46v", "R_p9-46v", "R_8Av", "R_8Ad",
    "R_IP1", "R_IP2", "R_7Am", "R_AIP", "R_LIPd", "R_FEF", "R_TE1p",
]

CANONICAL_DMN_PARCELS: List[str] = [
    "L_10v", "L_10r", "L_9m", "L_10d", "L_32d", "L_7m", "L_31pd", "L_31pv",
    "L_31a", "L_23d", "L_PGp", "L_PGs", "L_PFm", "L_TGd", "L_TE1a",
    "R_10v", "R_10r", "R_9m", "R_10d", "R_32d", "R_7m", "R_31pd", "R_31pv",
    "R_31a", "R_23d", "R_PGp", "R_PGs", "R_PFm", "R_TGd", "R_TE1a",
]

CANONICAL_SN_PARCELS: List[str] = [
    "L_AVI", "L_MI", "L_AAIC", "L_FOP4", "L_FOP5", "L_a24pr", "L_p32pr", "L_a32pr", "L_24dd", "L_PF",
    "R_AVI", "R_MI", "R_AAIC", "R_FOP4", "R_FOP5", "R_a24pr", "R_p32pr", "R_a32pr", "R_24dd", "R_PF",
]

CANONICAL_NETWORK_PARCEL_MAP: Dict[str, List[str]] = {
    "CEN": CANONICAL_CEN_PARCELS,
    "DMN": CANONICAL_DMN_PARCELS,
    "SN": CANONICAL_SN_PARCELS,
}
