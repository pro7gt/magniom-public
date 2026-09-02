"""
Connectomics and Functional Parcellation Package
Conforms to MAGNIOM-Neuroimaging & Functional Connectomics Pipeline Specification v1.0
"""

from .atlas import HcpMmpAtlasManager
from .parcel_series import ParcelSeriesExtractor
from .fc_engine import FunctionalConnectivityEngine

__all__ = [
    "HcpMmpAtlasManager",
    "ParcelSeriesExtractor",
    "FunctionalConnectivityEngine",
]
