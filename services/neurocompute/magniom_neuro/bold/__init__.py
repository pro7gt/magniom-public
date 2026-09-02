"""
BOLD Functional Preprocessing Package
Conforms to MAGNIOM-Neuroimaging & Functional Connectomics Pipeline Specification v1.0
"""

from .multi_echo import MultiEchoManager
from .fmriprep_runner import FMRIPrepRunner

__all__ = [
    "MultiEchoManager",
    "FMRIPrepRunner",
]
